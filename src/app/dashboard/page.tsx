'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
    Users,
    Briefcase,
    Calendar,
    TrendingUp,
    Plus,
    Bell,
    Shield,
    LogOut,
    ClipboardList,
    MoreVertical,
    Hammer,
    Zap,
    Key,
    UserPlus,
    Navigation
} from 'lucide-react'
import { withAuth } from '@/hoc/withAuth'

// Dashboard Components
import ResumenView from '@/components/dashboard/ResumenView'
import ClientesView from '@/components/dashboard/ClientesView'
import EquipoView from '@/components/dashboard/EquipoView'
import OrdenesView from '@/components/dashboard/OrdenesView'
import AccesosView from '@/components/dashboard/AccesosView'
import CalendarView from '@/components/dashboard/CalendarView'
import TasksView from '@/components/dashboard/TasksView'
import CRMView from '@/components/dashboard/CRMView'
import SquadMapView from '@/components/dashboard/SquadMapView'
import MonitoringSystem from '@/components/dashboard/MonitoringSystem'
import OrderModal from '@/components/dashboard/OrderModal'
import { SidebarItem } from '@/components/dashboard/SharedComponents'

// ─── Tipos y Mocks Extendidos ──────────────────────────────────

type Branch = { id: string; name: string; address: string; phone: string; cameras: number }
type Client = { id: string; name: string; email: string; phone: string; systems: number; lastService: string; branches: Branch[] }
type Technician = { id: string; name: string; phone: string; status: 'Disponible' | 'En Sitio' | 'Fuera de Servicio'; team: string }
type WorkOrder = {
    id: string;
    client: string;
    branch: string;
    technician: string;
    status: 'Programada' | 'En Proceso' | 'Completada' | 'Cancelada';
    address: string;
    date: string;
    priority: string;
    type: 'Levantamiento' | 'Instalación';
    instructions?: string[];
}

const MOCK_CLIENTS: Client[] = [
    {
        id: 'CL-001', name: 'Roberto Sánchez', email: 'roberto@email.com', phone: '55 1234 5678', systems: 2, lastService: '12 Feb 2024',
        branches: [
            { id: 'BR-01', name: 'Matriz Polanco', address: 'Calle 123, Polanco', phone: '55 1111 2222', cameras: 4 },
            { id: 'BR-02', name: 'Sucursal Satélite', address: 'Circuito Historiadores 45', phone: '55 3333 4444', cameras: 6 }
        ]
    },
    {
        id: 'CL-002', name: 'Elena Martínez', email: 'elena@corpo.mx', phone: '55 8765 4321', systems: 5, lastService: '01 Mar 2024',
        branches: [
            { id: 'BR-03', name: 'Oficinas Reforma', address: 'Av. Reforma 450', phone: '55 5555 6666', cameras: 8 }
        ]
    },
    {
        id: 'CL-003', name: 'Oficina Central XP', email: 'it@xp.com', phone: '55 9988 7766', systems: 12, lastService: '25 Feb 2024',
        branches: [
            { id: 'BR-04', name: 'Warehouse Norte', address: 'Industrial Vallejo 80', phone: '55 7777 8888', cameras: 16 },
            { id: 'BR-05', name: 'Data Center Sur', address: 'Insurgentes Sur 800', phone: '55 9999 0000', cameras: 12 }
        ]
    },
]

const MOCK_TECHNICIANS: Technician[] = [
    { id: 'TECH-01', name: 'Juan Pérez', phone: '5511223344', status: 'En Sitio', team: 'Blue Alpha' },
    { id: 'TECH-02', name: 'María López', phone: '5599887766', status: 'Disponible', team: 'Blue Alpha' },
    { id: 'TECH-03', name: 'Carlos Ruiz', phone: '5566778899', status: 'Disponible', team: 'Gold Bravo' },
    { id: 'TECH-04', name: 'Lucía Torres', phone: '5522334455', status: 'Fuera de Servicio', team: 'Gold Bravo' },
]

function OperationsDashboard() {
    const [activeTab, setActiveTab] = useState('resumen')
    const [showOrderModal, setShowOrderModal] = useState(false)
    const [monitoringBranch, setMonitoringBranch] = useState<{ client: string, branch: Branch } | null>(null)
    const [recentOrders, setRecentOrders] = useState<WorkOrder[]>([
        {
            id: 'WO-101', client: 'Roberto Sánchez', branch: 'Matriz Polanco', technician: 'Juan Pérez', status: 'En Proceso', address: 'Calle 123, Polanco', date: '10 Mar', priority: 'High', type: 'Instalación',
            instructions: ['Cámara IP Bullet 4MP exterior', 'Configurar NVR Hikvision']
        },
        {
            id: 'WO-102', client: 'Elena Martínez', branch: 'Oficinas Reforma', technician: 'María López', status: 'Programada', address: 'Av. Reforma 450', date: '11 Mar', priority: 'Medium', type: 'Levantamiento',
            instructions: ['Puntos ciegos lobby', 'Cotizar biométrico']
        },
    ])
    const [notifications, setNotifications] = useState<{ id: string; msg: string; type: string, read: boolean, date: Date }[]>([])
    const [toasts, setToasts] = useState<{ id: string; msg: string; type: string }[]>([])
    const [showNotifPanel, setShowNotifPanel] = useState(false)

    const addNotification = (msg: string, type = 'info') => {
        const id = Math.random().toString(36).substr(2, 9)
        const newNotif = { id, msg, type, read: false, date: new Date() }
        setNotifications(prev => [newNotif, ...prev])
        setToasts(prev => [{ id, msg, type }, ...prev])
        setTimeout(() => setToasts(prev => prev.filter(n => n.id !== id)), 5000)
    }

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then(() => {
                console.log('Service Worker Registered')
            })
        }

        if (Notification.permission === 'default') {
            Notification.requestPermission()
        }

        const checkReminders = async () => {
            const today = new Date().toISOString()
            const { data: dueTasks } = await supabase
                .from('tasks')
                .select('*')
                .eq('status', 'pendiente')
                .eq('reminder_sent', false)
                .lte('due_date', today)

            if (dueTasks && dueTasks.length > 0) {
                dueTasks.forEach(async (task) => {
                    new Notification('Recordatorio de Tarea', {
                        body: `La tarea "${task.title}" vence hoy.`,
                        icon: '/logo.png'
                    })
                    await supabase.from('tasks').update({ reminder_sent: true }).eq('id', task.id)
                })
            }
        }

        const interval = setInterval(checkReminders, 60000)
        return () => clearInterval(interval)
    }, [])

    const handleCreateOrder = (orderData: any) => {
        const nextFolio = recentOrders.length > 0
            ? parseInt(recentOrders[0].id.split('-')[1]) + 1
            : 101

        const newOrder: WorkOrder = {
            id: `WO-${nextFolio}`,
            client: orderData.clientName,
            branch: orderData.branchName,
            technician: orderData.technicianName,
            status: 'Programada',
            address: orderData.address,
            date: 'Hoy',
            priority: orderData.priority,
            type: orderData.type,
            instructions: orderData.instructions
        }
        setRecentOrders(prev => [newOrder, ...prev])
        addNotification(`MISIÓN ${newOrder.type.toUpperCase()} ASIGNADA A ${newOrder.technician.toUpperCase()}`, 'success')
        setShowOrderModal(false)
    }

    return (
        <div className="min-h-screen bg-background bg-grid text-white flex overflow-hidden font-sans">
            {/* Sidebar Corporativo */}
            <aside className="w-72 glass border-r border-white/5 hidden lg:flex flex-col p-8 sticky top-0 h-screen z-30">
                <div className="flex items-center gap-3 mb-10 transition-transform hover:scale-105 cursor-default">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/30">
                        <Shield className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-lg font-black uppercase tracking-tighter italic block leading-none">Global</span>
                        <span className="text-[10px] font-black text-primary uppercase tracking-[4px]">Operations</span>
                    </div>
                </div>

                <nav className="flex-1 space-y-1.5">
                    <SidebarItem icon={<TrendingUp size={18} />} label="Resumen" active={activeTab === 'resumen'} onClick={() => setActiveTab('resumen')} />
                    <SidebarItem icon={<Users size={18} />} label="CRM Pipeline" active={activeTab === 'crm'} onClick={() => setActiveTab('crm')} />
                    <SidebarItem icon={<Users size={18} />} label="Clientes & Sedes" active={activeTab === 'clientes'} onClick={() => setActiveTab('clientes')} />
                    <SidebarItem icon={<Briefcase size={18} />} label="Órdenes" active={activeTab === 'ordenes'} onClick={() => setActiveTab('ordenes')} />
                    <SidebarItem icon={<Hammer size={18} />} label="Equipo Técnico" active={activeTab === 'equipo'} onClick={() => setActiveTab('equipo')} />
                    <SidebarItem icon={<Key size={18} />} label="Accesos" active={activeTab === 'accesos'} onClick={() => setActiveTab('accesos')} />
                    <SidebarItem icon={<Calendar size={18} />} label="Calendario" active={activeTab === 'calendario'} onClick={() => setActiveTab('calendario')} />
                    <SidebarItem icon={<ClipboardList size={18} />} label="Tareas" active={activeTab === 'tareas'} onClick={() => setActiveTab('tareas')} />
                    <SidebarItem icon={<Navigation size={18} />} label="Despliegue" active={activeTab === 'mapa'} onClick={() => setActiveTab('mapa')} />
                </nav>

                <div className="pt-8 border-t border-white/5 space-y-4 text-slate-500">
                    <button className="w-full flex items-center gap-3 px-6 py-3 hover:text-red-500 hover:bg-red-500/5 rounded-2xl transition-all font-black uppercase tracking-widest text-[9px]">
                        <LogOut className="w-4 h-4" /> Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative h-screen custom-scrollbar">
                {/* Header */}
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-4 md:px-12 glass sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <h2 className="text-[10px] font-black uppercase tracking-[5px] text-primary">{activeTab}</h2>
                        <div className="h-4 w-px bg-white/10 hidden md:block"></div>
                        <p className="text-[10px] font-bold text-slate-500 hidden md:block uppercase tracking-widest">Network ID: GT-X290</p>
                    </div>

                    <div className="flex items-center gap-6">
                        {activeTab === 'equipo' ? (
                            <button
                                onClick={() => addNotification('MÓDULO DE RECLUTAMIENTO EN SINCRONIZACIÓN...', 'info')}
                                className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[2px] hover:bg-primary/10 transition-all group"
                            >
                                <UserPlus size={14} className="text-primary group-hover:scale-110 transition-transform" /> Registrar Trabajador
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowOrderModal(true)}
                                className="hidden md:flex items-center gap-2 bg-primary px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[2px] hover:bg-blue-600 transition-all shadow-lg shadow-blue-900/40 group"
                            >
                                <Plus size={14} className="group-hover:rotate-90 transition-transform" /> Nueva Orden
                            </button>
                        )}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowNotifPanel(!showNotifPanel)
                                    if (!showNotifPanel) {
                                        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
                                    }
                                }}
                                className="p-3 glass rounded-xl border-white/5 relative hover:bg-white/10 transition-all group"
                            >
                                <Bell className={`w-5 h-5 ${notifications.some(n => !n.read) ? 'text-primary animate-ring' : 'text-slate-400'} group-hover:scale-110 transition-transform`} />
                                {notifications.some(n => !n.read) && <div className="absolute top-3.5 right-3.5 w-1.5 h-1.5 bg-primary rounded-full shadow-glow animate-pulse"></div>}
                            </button>

                            {showNotifPanel && (
                                <div className="absolute top-16 right-0 w-80 glass border border-white/10 rounded-[32px] shadow-2xl p-6 z-[60] animate-in slide-in-from-top-2 duration-300">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-[10px] font-black uppercase tracking-[3px] text-white">Notificaciones</h3>
                                        <button
                                            onClick={() => setNotifications([])}
                                            className="text-[8px] font-black uppercase text-slate-500 hover:text-primary transition-colors"
                                        >Limpiar Todo</button>
                                    </div>
                                    <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                        {notifications.length === 0 ? (
                                            <div className="py-10 text-center space-y-4">
                                                <Zap size={24} className="mx-auto text-slate-800" />
                                                <p className="text-[9px] font-black uppercase text-slate-700 tracking-widest leading-relaxed">Sin actividad reciente en el perímetro</p>
                                            </div>
                                        ) : (
                                            notifications.map(n => (
                                                <div key={n.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2 group hover:border-primary/20 transition-all">
                                                    <div className="flex justify-between items-start">
                                                        <p className="text-[10px] font-black uppercase tracking-tight text-slate-200">{n.msg}</p>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${n.type === 'success' ? 'bg-green-500' : 'bg-primary'}`}></div>
                                                    </div>
                                                    <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">{n.date.toLocaleTimeString()}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-white/5">
                                        <button
                                            onClick={() => Notification.requestPermission()}
                                            className="w-full py-3 bg-white/5 rounded-xl text-[8px] font-black uppercase tracking-[2px] text-slate-400 hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center gap-2"
                                        >
                                            <Shield size={10} /> Forzar Permisos Push
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Notifications Toast Overlay */}
                <div className="fixed top-24 right-12 z-50 space-y-4">
                    {toasts.map(n => (
                        <div key={n.id} className="glass border-primary/20 bg-primary/10 p-5 rounded-2xl shadow-2xl animate-in slide-in-from-right duration-300 flex items-center gap-4 border-l-4">
                            <Zap size={18} className="text-primary" />
                            <p className="text-[11px] font-black uppercase tracking-widest text-white">{n.msg}</p>
                        </div>
                    ))}
                </div>

                <div className="p-4 md:p-12 pb-28 md:pb-12">
                    {activeTab === 'resumen' && <ResumenView setActiveTab={setActiveTab} orders={recentOrders} onMonitor={setMonitoringBranch} MOCK_CLIENTS={MOCK_CLIENTS} />}
                    {activeTab === 'crm' && <CRMView addNotification={addNotification} />}
                    {activeTab === 'clientes' && <ClientesView onMonitor={setMonitoringBranch} MOCK_CLIENTS={MOCK_CLIENTS} />}
                    {activeTab === 'ordenes' && <OrdenesView orders={recentOrders} addNotification={addNotification} onFinishOrder={(id: string) => {
                        setRecentOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'Completada' } : o))
                        const order = recentOrders.find(o => o.id === id)
                        addNotification(`MISIÓN ${id} COMPLETADA. INGENIERO ${order?.technician.toUpperCase()} DISPONIBLE.`, 'success')
                    }} />}
                    {activeTab === 'equipo' && <EquipoView orders={recentOrders} MOCK_TECHNICIANS={MOCK_TECHNICIANS} />}
                    {activeTab === 'mapa' && <SquadMapView />}
                    {activeTab === 'accesos' && <AccesosView />}
                    {activeTab === 'calendario' && <CalendarView addNotification={addNotification} />}
                    {activeTab === 'tareas' && <TasksView addNotification={addNotification} />}
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 glass border-t border-white/10 pb-safe z-50 flex items-center justify-between px-2 py-2">
                <button onClick={() => setActiveTab('resumen')} className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl transition-all ${activeTab === 'resumen' ? 'text-primary bg-primary/10' : 'text-slate-500 hover:text-slate-300'}`}>
                    <TrendingUp size={20} className={activeTab === 'resumen' ? 'animate-pulse' : ''} />
                    <span className="text-[8px] font-black uppercase mt-1">Resumen</span>
                </button>
                <button onClick={() => setActiveTab('crm')} className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl transition-all ${activeTab === 'crm' ? 'text-primary bg-primary/10' : 'text-slate-500 hover:text-slate-300'}`}>
                    <Users size={20} />
                    <span className="text-[8px] font-black uppercase mt-1">CRM</span>
                </button>
                <button onClick={() => setActiveTab('mapa')} className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl transition-all ${activeTab === 'mapa' ? 'text-primary bg-primary/10' : 'text-slate-500 hover:text-slate-300'}`}>
                    <Navigation size={20} />
                    <span className="text-[8px] font-black uppercase mt-1">Mapa</span>
                </button>

                {/* Floating Action Button for Mobile */}
                <div className="relative -top-6">
                    <button
                        onClick={() => setShowOrderModal(true)}
                        className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-900/50 border-4 border-slate-950 active:scale-95 transition-all"
                    >
                        <Plus size={24} />
                    </button>
                </div>

                <button onClick={() => setActiveTab('ordenes')} className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl transition-all ${activeTab === 'ordenes' ? 'text-primary bg-primary/10' : 'text-slate-500 hover:text-slate-300'}`}>
                    <Briefcase size={20} />
                    <span className="text-[8px] font-black uppercase mt-1">Órdenes</span>
                </button>
                <button onClick={() => setActiveTab('tareas')} className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl transition-all ${activeTab === 'tareas' ? 'text-primary bg-primary/10' : 'text-slate-500 hover:text-slate-300'}`}>
                    <ClipboardList size={20} />
                    <span className="text-[8px] font-black uppercase mt-1">Tareas</span>
                </button>
            </nav>

            {/* Modal de Nueva Orden */}
            {showOrderModal && (
                <OrderModal
                    onClose={() => setShowOrderModal(false)}
                    onSubmit={handleCreateOrder}
                    MOCK_CLIENTS={MOCK_CLIENTS}
                    MOCK_TECHNICIANS={MOCK_TECHNICIANS}
                />
            )}

            {/* Vigilance Mode / Camera Monitoring */}
            {monitoringBranch && (
                <MonitoringSystem
                    branch={monitoringBranch.branch}
                    client={monitoringBranch.client}
                    onClose={() => setMonitoringBranch(null)}
                />
            )}
        </div>
    )
}

export default withAuth(OperationsDashboard)
