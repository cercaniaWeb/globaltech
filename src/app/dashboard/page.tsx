'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
    Users,
    Briefcase,
    Calendar,
    TrendingUp,
    CheckCircle2,
    Plus,
    Search,
    Filter,
    Bell,
    User,
    Shield,
    LogOut,
    Clock,
    MapPin,
    ClipboardList,
    ArrowRight,
    Loader2,
    Settings,
    MoreVertical,
    CheckCircle,
    X,
    UserPlus,
    Hammer,
    Zap,
    MessageCircle,
    Layout,
    Activity,
    Eye,
    Key
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { withAuth } from '@/hoc/withAuth'
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addDays,
    eachDayOfInterval
} from 'date-fns'

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
    const [searchTerm, setSearchTerm] = useState('')
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
    const [notifications, setNotifications] = useState<{ id: string; msg: string; type: string }[]>([])

    const addNotification = (msg: string, type = 'info') => {
        const id = Math.random().toString(36).substr(2, 9)
        setNotifications(prev => [{ id, msg, type }, ...prev])
        setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 5000)
    }

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then(() => {
                console.log('Service Worker Registered')
            })
        }

        // Permitir notificaciones si se solicitan
        if (Notification.permission === 'default') {
            Notification.requestPermission()
        }

        // Lógica de Recordatorios (Simulación de Push/Reminders locales)
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
        <div className="min-h-screen bg-background bg-grid text-white flex overflow-hidden">
            {/* Sidebar Corporativo */}
            <aside className="w-72 glass border-r border-white/5 hidden lg:flex flex-col p-8 sticky top-0 h-screen z-30">
                <div className="flex items-center gap-3 mb-10">
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
                    <SidebarItem icon={<Users size={18} />} label="Clientes & Sedes" active={activeTab === 'clientes'} onClick={() => setActiveTab('clientes')} />
                    <SidebarItem icon={<Briefcase size={18} />} label="Órdenes" active={activeTab === 'ordenes'} onClick={() => setActiveTab('ordenes')} />
                    <SidebarItem icon={<Hammer size={18} />} label="Equipo Técnico" active={activeTab === 'equipo'} onClick={() => setActiveTab('equipo')} />
                    <SidebarItem icon={<Key size={18} />} label="Accesos" active={activeTab === 'accesos'} onClick={() => setActiveTab('accesos')} />
                    <SidebarItem icon={<Calendar size={18} />} label="Calendario" active={activeTab === 'calendario'} onClick={() => setActiveTab('calendario')} />
                    <SidebarItem icon={<ClipboardList size={18} />} label="Tareas" active={activeTab === 'tareas'} onClick={() => setActiveTab('tareas')} />
                </nav>

                <div className="pt-8 border-t border-white/5 space-y-4 text-slate-500">
                    <button className="w-full flex items-center gap-3 px-6 py-3 hover:text-red-500 hover:bg-red-500/5 rounded-2xl transition-all font-black uppercase tracking-widest text-[9px]">
                        <LogOut className="w-4 h-4" /> Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative h-screen">
                {/* Header */}
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-12 glass sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <h2 className="text-[10px] font-black uppercase tracking-[5px] text-primary">{activeTab}</h2>
                        <div className="h-4 w-px bg-white/10 hidden md:block"></div>
                        <p className="text-[10px] font-bold text-slate-500 hidden md:block uppercase tracking-widest">Network ID: GT-X290</p>
                    </div>

                    <div className="flex items-center gap-6">
                        {activeTab === 'equipo' ? (
                            <button
                                onClick={() => addNotification('MÓDULO DE RECLUTAMIENTO EN SINCRONIZACIÓN...', 'info')}
                                className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[2px] hover:bg-primary/10 transition-all"
                            >
                                <UserPlus size={14} className="text-primary" /> Registrar Trabajador
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowOrderModal(true)}
                                className="hidden md:flex items-center gap-2 bg-primary px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[2px] hover:bg-blue-600 transition-all shadow-lg shadow-blue-900/40"
                            >
                                <Plus size={14} /> Nueva Orden
                            </button>
                        )}
                        <button className="p-3 glass rounded-xl border-white/5 relative hover:bg-white/10 transition-all">
                            <Bell className="w-5 h-5 text-slate-400" />
                            {notifications.length > 0 && <div className="absolute top-3.5 right-3.5 w-1.5 h-1.5 bg-primary rounded-full shadow-glow animate-pulse"></div>}
                        </button>
                    </div>
                </header>

                {/* Notifications Toast Overlay */}
                <div className="fixed top-24 right-12 z-50 space-y-4">
                    {notifications.map(n => (
                        <div key={n.id} className="glass border-primary/20 bg-primary/10 p-5 rounded-2xl shadow-2xl animate-in slide-in-from-right duration-300 flex items-center gap-4 border-l-4">
                            <Zap size={18} className="text-primary" />
                            <p className="text-[11px] font-black uppercase tracking-widest text-white">{n.msg}</p>
                        </div>
                    ))}
                </div>

                <div className="p-12">
                    {activeTab === 'resumen' && <ResumenView setActiveTab={setActiveTab} orders={recentOrders} onMonitor={setMonitoringBranch} />}
                    {activeTab === 'clientes' && <ClientesView onMonitor={setMonitoringBranch} />}
                    {activeTab === 'ordenes' && <OrdenesView orders={recentOrders} onFinishOrder={(id) => {
                        setRecentOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'Completada' } : o))
                        const order = recentOrders.find(o => o.id === id)
                        addNotification(`MISIÓN ${id} COMPLETADA. INGENIERO ${order?.technician.toUpperCase()} DISPONIBLE.`, 'success')
                    }} />}
                    {activeTab === 'equipo' && <EquipoView orders={recentOrders} />}
                    {activeTab === 'accesos' && <AccesosView />}
                    {activeTab === 'calendario' && <CalendarView addNotification={addNotification} />}
                    {activeTab === 'tareas' && <TasksView addNotification={addNotification} />}
                </div>
            </main>

            {/* Modal de Nueva Orden */}
            {showOrderModal && <OrderModal onClose={() => setShowOrderModal(false)} onSubmit={handleCreateOrder} />}

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

// ─── Componentes de Vista ────────────────────────────────────

function ResumenView({ orders, onMonitor }: { orders: WorkOrder[], setActiveTab: any, onMonitor: any }) {
    return (
        <div className="space-y-12 animate-in fade-in duration-500">
            <header>
                <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Ops <span className="text-primary underline underline-offset-[12px]">Intelligence</span></h1>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[11px] mt-6 max-w-xl">Gestión táctica de cuadrillas, despliegue de infraestructura y SLA de mantenimiento.</p>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard label="Tickets Activos" value={orders.length} icon={<ClipboardList className="text-blue-500" />} trend="Monitoreado" />
                <StatCard label="Ingenieros Campo" value="4" icon={<Users className="text-yellow-500" />} trend="Full capacity" />
                <StatCard label="Sucursales" value="15" icon={<MapPin className="text-green-500" />} trend="Geolocalizadas" />
                <StatCard label="Meta Semanal" value="85%" icon={<TrendingUp className="text-purple-500" />} trend="En rango" />
            </section>

            <div className="grid lg:grid-cols-2 gap-10">
                <div className="glass rounded-[40px] border-white/5 p-10 space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5"><Briefcase size={80} /></div>
                    <h2 className="text-xl font-black uppercase italic tracking-widest flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                        Despliegue Reciente
                    </h2>
                    <div className="space-y-4">
                        {orders.map(o => (
                            <div key={o.id} className="p-6 glass rounded-3xl border-white/5 flex justify-between items-center group">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-primary border border-white/5 group-hover:bg-primary group-hover:text-white transition-all"><MapPin size={20} /></div>
                                    <div>
                                        <p className="text-[12px] font-black uppercase italic text-white leading-none">{o.client}</p>
                                        <p className="text-[10px] font-medium text-slate-500 mt-1 uppercase tracking-widest">{o.branch}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black uppercase text-primary mb-1 italic">{o.id}</p>
                                    <button
                                        onClick={() => {
                                            const client = MOCK_CLIENTS.find(c => c.name === o.client)
                                            const branch = client?.branches.find(b => b.name === o.branch)
                                            if (branch) onMonitor({ client: o.client, branch })
                                        }}
                                        className="px-2 py-0.5 bg-white/5 text-slate-400 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/5 hover:border-primary/50 hover:text-primary transition-all"
                                    >Monitor Live</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass rounded-[40px] border-primary/10 bg-primary/5 p-10 space-y-8">
                    <h2 className="text-xl font-black uppercase italic tracking-widest items-center flex gap-3 text-primary">
                        <Zap size={20} /> Métricas de Escuadrón
                    </h2>
                    <div className="space-y-6">
                        <TeamStat name="Blue Alpha" score={98} tasks={12} color="bg-blue-500" />
                        <TeamStat name="Gold Bravo" score={85} tasks={8} color="bg-yellow-500" />
                        <TeamStat name="Red Zulu" score={92} tasks={15} color="bg-red-500" />
                    </div>
                </div>
            </div>
        </div>
    )
}

function ClientesView({ onMonitor }: { onMonitor: any }) {
    return (
        <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-end">
                <div className="space-y-2">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter">Socios <span className="text-primary italic underline underline-offset-8">Comerciales</span></h2>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Base de datos de múltiples sucursales y puntos de presencia.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {MOCK_CLIENTS.map(client => (
                    <div key={client.id} className="glass rounded-[40px] border-white/5 p-10 space-y-8 hover:border-primary/20 transition-all">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-primary/10 text-primary border border-primary/20 rounded-3xl flex items-center justify-center font-black text-xl italic">{client.name[0]}</div>
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-tighter">{client.name}</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{client.email} | {client.id}</p>
                                </div>
                            </div>
                            <button className="p-3 bg-white/5 rounded-2xl text-slate-600 hover:text-white transition-all"><MoreVertical size={20} /></button>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[9px] font-black uppercase tracking-[3px] text-primary">Sedes Verificadas ({client.branches.length})</p>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {client.branches.map(branch => (
                                    <div
                                        key={branch.id}
                                        onClick={() => onMonitor({ client: client.name, branch })}
                                        className="p-5 bg-black/20 rounded-2xl border border-white/5 space-y-2 hover:bg-black/40 hover:border-primary/40 transition-all cursor-pointer group/branch"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-white">
                                                <MapPin size={12} className="text-primary" />
                                                <span className="text-[11px] font-black uppercase tracking-tight">{branch.name}</span>
                                            </div>
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse group-hover/branch:shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
                                        </div>
                                        <p className="text-[10px] text-slate-600 font-medium leading-tight">{branch.address}</p>
                                        <p className="text-[8px] font-black text-primary uppercase tracking-widest mt-2">{branch.cameras} CCTV ACTIVE</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function EquipoView({ orders }: { orders: WorkOrder[] }) {
    return (
        <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">Escuadrón <span className="text-primary underline underline-offset-8">Técnico</span></h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {MOCK_TECHNICIANS.map(tech => {
                    const activeOrder = orders.find(o => o.technician === tech.name && o.status !== 'Completada')
                    const isAvailable = !activeOrder

                    return (
                        <div key={tech.id} className="glass rounded-[32px] border-white/5 p-8 relative overflow-hidden group">
                            <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 rounded-full transition-all group-hover:opacity-20 ${isAvailable ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-20 h-20 bg-slate-900 border border-white/10 rounded-full flex items-center justify-center shadow-2xl relative">
                                    <User size={40} className="text-slate-600" />
                                    <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-4 border-slate-950 ${isAvailable ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                </div>
                                <div>
                                    <h4 className="font-black uppercase tracking-tight italic text-sm">{tech.name}</h4>
                                    <a
                                        href={`https://wa.me/${tech.phone.replace(/\s/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 mt-2 text-[10px] font-black text-primary hover:text-green-500 uppercase tracking-widest transition-colors group/wa"
                                    >
                                        <MessageCircle size={12} className="group-hover/wa:fill-green-500/20" /> {tech.phone}
                                    </a>
                                </div>
                                <div className="pt-4 border-t border-white/5 w-full flex flex-col items-center gap-2">
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${isAvailable ? 'text-green-500 bg-green-500/10 px-3 py-1 rounded-full' : 'text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full'}`}>
                                        {isAvailable ? '● Disponible / Libre' : `○ Asignado: ${activeOrder.id}`}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

function OrdenesView({ orders, onFinishOrder }: { orders: WorkOrder[], onFinishOrder: (id: string) => void }) {
    return (
        <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">Work <span className="text-primary underline underline-offset-8">Logistic</span></h2>
                <div className="flex gap-3">
                    <button className="p-3 glass rounded-xl text-slate-500"><Filter size={18} /></button>
                </div>
            </div>

            <div className="glass rounded-[40px] border-white/5 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-white/5 text-[10px] font-black uppercase tracking-[4px] text-slate-500">
                            <th className="px-10 py-6">Status / ID</th>
                            <th className="px-10 py-6">Cliente & Sede</th>
                            <th className="px-10 py-6">Ingeniero Asignado</th>
                            <th className="px-10 py-6">Fecha Requerida</th>
                            <th className="px-10 py-6 text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {orders.map(o => (
                            <tr key={o.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-10 py-8">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${o.status === 'Programada' ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'}`}></div>
                                        <div>
                                            <p className="text-[11px] font-black uppercase text-white">{o.status}</p>
                                            <p className="text-[8px] font-black text-primary/70 uppercase tracking-widest">{o.type}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-10 py-8">
                                    <p className="text-sm font-black italic text-white uppercase tracking-tight">{o.client}</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1"><MapPin size={8} className="inline mr-1" /> {o.branch}</p>
                                </td>
                                <td className="px-10 py-8 text-xs font-black uppercase text-slate-300">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-[8px] border border-primary/20">{o.technician[0]}</div>
                                        {o.technician}
                                    </div>
                                </td>
                                <td className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase italic">{o.date}</td>
                                <td className="px-10 py-8 text-right">
                                    {o.status !== 'Completada' ? (
                                        <button
                                            onClick={() => onFinishOrder(o.id)}
                                            className="bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-glow-hover"
                                        >
                                            Cerrar Orden
                                        </button>
                                    ) : (
                                        <span className="text-slate-600 text-[10px] font-black uppercase tracking-[2px] italic">● Expediente Sellado</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function AccesosView() {
    const [clients, setClients] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchClients = async () => {
            const { data, error } = await supabase
                .from('clientes_cctv')
                .select('*')
                .order('nombre_cliente', { ascending: true })

            if (error) {
                console.error('Error fetching clients:', error)
            } else {
                setClients(data || [])
            }
            setLoading(false)
        }
        fetchClients()
    }, [])

    return (
        <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-end">
                <div className="space-y-2">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter">Control de <span className="text-primary italic underline underline-offset-8">Accesos</span></h2>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Base de datos centralizada de credenciales DVR y IDs de vinculación API.</p>
                </div>
            </header>

            <div className="glass rounded-[40px] border-white/5 overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-white/5 text-[10px] font-black uppercase tracking-[4px] text-slate-500">
                            <th className="px-10 py-6">Status</th>
                            <th className="px-10 py-6">Cliente</th>
                            <th className="px-10 py-6">Usuario DVR</th>
                            <th className="px-10 py-6">Clave Estándar</th>
                            <th className="px-10 py-6">Site HIK ID</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-10 py-20 text-center">
                                    <div className="flex flex-col items-center gap-4 text-slate-600">
                                        <Loader2 className="w-8 h-8 animate-spin" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Sincronizando con Supabase...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : clients.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-10 py-20 text-center text-slate-600 text-[10px] font-black uppercase tracking-widest italic">
                                    No se encontraron registros. Ejecuta el script de migración.
                                </td>
                            </tr>
                        ) : (
                            clients.map(c => (
                                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${c.status_actual === 'Online' ? 'bg-green-500 shadow-glow' : 'bg-yellow-500/50'}`}></div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{c.status_actual}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <p className="text-sm font-black italic text-white uppercase tracking-tight">{c.nombre_cliente}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{c.email_notificaciones || 'SIN EMAIL CONFIGURADO'}</p>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-2 text-xs font-black text-primary uppercase">
                                            <User size={12} /> {c.usuario_dvr}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <code className="bg-slate-900 px-3 py-1.5 rounded-lg border border-white/5 text-[10px] font-mono text-emerald-400 group-hover:border-primary/30 transition-all cursor-pointer">
                                            {c.pass_dvr}
                                        </code>
                                    </td>
                                    <td className="px-10 py-8">
                                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                                            {c.sitio_hik_id || 'PENDIENTE VINCULACIÓN'}
                                        </p>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

// ─── Componentes Atómicos Reutilizables ───────────────────────

function SidebarItem({ icon, label, active = false, onClick }: any) {
    return (
        <div onClick={onClick} className={`flex items-center gap-4 px-6 py-4 rounded-2xl cursor-pointer group transition-all duration-500 ${active ? 'glass border-primary/20 bg-primary/5 text-primary' : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'}`}>
            <div className={`transition-transform duration-500 group-hover:scale-110 ${active ? 'text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]' : ''}`}>
                {icon}
            </div>
            <span className={`text-[11px] font-black uppercase tracking-widest ${active ? 'italic' : ''}`}>{label}</span>
            {active && <div className="ml-auto w-1.5 h-1.5 bg-primary rounded-full shadow-glow"></div>}
        </div>
    )
}

function StatCard({ label, value, icon, trend }: any) {
    return (
        <div className="glass p-8 rounded-[32px] border-white/5 relative overflow-hidden group hover:border-primary/20 transition-all">
            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">{icon}</div>
            <div className="flex justify-between items-start mb-8">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary/20 group-hover:text-primary transition-all">{icon}</div>
                <span className="text-[8px] font-black uppercase tracking-widest text-primary italic">{trend}</span>
            </div>
            <h3 className="text-[9px] font-black uppercase tracking-[3px] text-slate-500 mb-2">{label}</h3>
            <p className="text-3xl font-black italic text-white leading-none">{value}</p>
        </div>
    )
}

function TeamStat({ name, score, tasks, color }: any) {
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{name}</span>
                <span className="text-[10px] font-mono text-primary">{score}% Performance</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full ${color} transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.2)]`} style={{ width: `${score}%` }}></div>
            </div>
            <p className="text-[8px] font-black uppercase text-slate-600 tracking-widest">{tasks} Misiones Completadas</p>
        </div>
    )
}

function OrderModal({ onClose, onSubmit }: any) {
    const [isNewClient, setIsNewClient] = useState(false)
    const [formData, setFormData] = useState({
        client: '0',
        branch: '0',
        tech: '0',
        priority: 'Medium',
        orderType: 'Levantamiento', // Levantamiento o Instalación
        newClientName: '',
        newClientAddress: '',
        instructions: ''
    })

    const selectedClient = MOCK_CLIENTS[parseInt(formData.client)]
    const selectedBranch = !isNewClient ? selectedClient.branches[parseInt(formData.branch)] : null
    const selectedTech = MOCK_TECHNICIANS[parseInt(formData.tech)]

    const handleSubmit = (e: any) => {
        e.preventDefault()
        onSubmit({
            clientName: isNewClient ? formData.newClientName : selectedClient.name,
            branchName: isNewClient ? 'Sede Matriz (Nuevo)' : selectedBranch?.name,
            technicianName: selectedTech.name,
            address: isNewClient ? formData.newClientAddress : selectedBranch?.address,
            priority: formData.priority,
            type: formData.orderType,
            instructions: formData.instructions.split('\n').filter(i => i.trim() !== '')
        })
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 overflow-hidden">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={onClose}></div>
            <div className="relative glass w-full max-w-2xl rounded-[48px] border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
                <header className="p-10 border-b border-white/5 flex justify-between items-center bg-white/5 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20"><Hammer size={24} /></div>
                        <div>
                            <h2 className="text-xl font-black italic uppercase tracking-tighter text-white leading-none">Desplegar <span className="text-primary italic">Operación</span></h2>
                            <p className="text-[9px] font-black uppercase text-slate-500 tracking-[3px] mt-2">Configuración de Misión Táctica</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-slate-500"><X size={20} /></button>
                </header>

                <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                    {/* Switch Cliente Nuevo / Existente */}
                    <div className="space-y-4">
                        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-white/5">
                            <button
                                type="button"
                                onClick={() => setIsNewClient(false)}
                                className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${!isNewClient ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >Socio Existente</button>
                            <button
                                type="button"
                                onClick={() => setIsNewClient(true)}
                                className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${isNewClient ? 'bg-primary text-white shadow-lg shadow-blue-900/40' : 'text-slate-500 hover:text-slate-300'}`}
                            >Alta Nuevo Cliente</button>
                        </div>
                    </div>

                    {/* Misión Tarea */}
                    <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-[3px]">Tipo de Misión</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, orderType: 'Levantamiento' })}
                                className={`flex items-center justify-center gap-3 py-4 rounded-2xl border text-[10px] font-black uppercase tracking-wider transition-all ${formData.orderType === 'Levantamiento' ? 'border-primary bg-primary/10 text-primary' : 'border-white/5 text-slate-500 hover:border-white/10'}`}
                            >
                                <Search size={14} /> Levantamiento Técnico
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, orderType: 'Instalación' })}
                                className={`flex items-center justify-center gap-3 py-4 rounded-2xl border text-[10px] font-black uppercase tracking-wider transition-all ${formData.orderType === 'Instalación' ? 'border-green-500 bg-green-500/10 text-green-500' : 'border-white/5 text-slate-500 hover:border-white/10'}`}
                            >
                                <Plus size={14} /> Nueva Instalación
                            </button>
                        </div>
                    </div>

                    {!isNewClient ? (
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-[3px]">Cliente Seleccionado</label>
                                <select
                                    className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-primary transition-all cursor-pointer"
                                    value={formData.client}
                                    onChange={(e) => setFormData({ ...formData, client: e.target.value, branch: '0' })}
                                >
                                    {MOCK_CLIENTS.map((c, i) => <option key={c.id} value={i}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-[3px]">Sede de Operación</label>
                                <select
                                    className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-primary transition-all cursor-pointer"
                                    value={formData.branch}
                                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                                >
                                    {selectedClient.branches.map((b, i) => <option key={b.id} value={i}>{b.name}</option>)}
                                </select>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="space-y-3">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-[3px]">Nombre o Razón Social</label>
                                <input
                                    type="text"
                                    placeholder="EJ: CORPORATIVO PATRIA S.A."
                                    className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
                                    value={formData.newClientName}
                                    onChange={(e) => setFormData({ ...formData, newClientName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-[3px]">Dirección de Instalación</label>
                                <div className="relative">
                                    <MapPin size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="text"
                                        placeholder="CALLE, NÚMERO, COLONIA, C.P."
                                        className="w-full bg-slate-950 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-[10px] font-medium uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
                                        value={formData.newClientAddress}
                                        onChange={(e) => setFormData({ ...formData, newClientAddress: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[9px] font-black uppercase text-slate-400 tracking-[3px]">Ingeniero Asignado</label>
                            <select
                                className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-primary transition-all cursor-pointer"
                                value={formData.tech}
                                onChange={(e) => setFormData({ ...formData, tech: e.target.value })}
                            >
                                {MOCK_TECHNICIANS.map((t, i) => <option key={t.id} value={i}>{t.name} ({t.status})</option>)}
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[9px] font-black uppercase text-slate-400 tracking-[3px]">Urgencia</label>
                            <div className="flex gap-2">
                                {['Low', 'Medium', 'High'].map(p => (
                                    <button
                                        key={p} type="button"
                                        onClick={() => setFormData({ ...formData, priority: p })}
                                        className={`flex-1 py-3.5 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${formData.priority === p ? 'bg-primary border-primary text-white shadow-lg shadow-blue-900/40' : 'bg-white/5 border-white/5 text-slate-500'}`}
                                    >{p}</button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-[3px]">Protocolo de Misión (Acciones por línea)</label>
                        <textarea
                            placeholder="EJ: Instalar Cámaras en Lobby&#10;Configurar acceso Biométrico&#10;Pruebas de Bitrate y Red"
                            className="w-full bg-slate-950 border border-white/5 rounded-3xl px-6 py-4 text-xs font-medium focus:outline-none focus:border-primary transition-all h-32 resize-none"
                            value={formData.instructions}
                            onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                        ></textarea>
                    </div>

                    <footer className="pt-4 flex gap-4 shrink-0">
                        <button type="button" onClick={onClose} className="flex-1 py-5 rounded-[22px] text-[10px] font-black uppercase tracking-[4px] text-slate-500 border border-white/10 hover:bg-white/5 transition-all">Abortar</button>
                        <button
                            type="submit"
                            className="flex-[2] bg-primary hover:bg-blue-600 text-white py-5 rounded-[22px] text-[10px] font-black uppercase tracking-[4px] shadow-xl shadow-blue-900/30 transition-all flex items-center justify-center gap-3 group shrink-0"
                        >
                            Desplegar Orden de Trabajo <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    )
}

function MonitoringSystem({ branch, client, onClose }: { branch: Branch, client: string, onClose: () => void }) {
    const [currentTime, setCurrentTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    return (
        <div className="fixed inset-0 z-[120] bg-slate-950 flex flex-col animate-in fade-in duration-500 overflow-hidden">
            {/* Control Bar style iVMS */}
            <header className="h-16 bg-slate-900 border-b border-white/10 flex items-center justify-between px-8 shrink-0">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded flex items-center justify-center"><Shield size={14} /></div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest leading-none">Security Center</p>
                            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[2px] mt-1">v4.2.0.1009 Enterprise</p>
                        </div>
                    </div>
                    <div className="h-8 w-px bg-white/5"></div>
                    <div>
                        <p className="text-[11px] font-black italic uppercase text-white tracking-widest">{client}</p>
                        <p className="text-[9px] font-black text-primary uppercase tracking-tighter">{branch.name} — ONLINE</p>
                    </div>
                </div>

                <div className="flex items-center gap-10">
                    <div className="text-right">
                        <p className="text-xs font-mono font-black text-slate-400">{currentTime.toLocaleTimeString()}</p>
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{currentTime.toLocaleDateString()}</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-lg transition-all"><X size={18} /></button>
                </div>
            </header>

            {/* Main Grid View */}
            <div className="flex-1 bg-black grid grid-cols-2 grid-rows-2 gap-px border border-white/5 p-px">
                <CameraCell id="CAM 01" label="ENTRY POINT" bitrate="2240" image="/images/cctv/entry_point.png" />
                <CameraCell id="CAM 02" label="PERIMETER NW" bitrate="4112" image="/images/cctv/perimeter.png" />
                <CameraCell id="CAM 03" label="SERVER ROOM" bitrate="1056" image="/images/cctv/server_room.png" />
                <CameraCell id="CAM 04" label="RECEPTION" bitrate="2048" />
            </div>

            {/* Footer Controls */}
            <footer className="h-14 bg-slate-900 border-t border-white/10 flex items-center justify-center gap-8 shrink-0">
                <button className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all"><Layout size={14} /> Grid 2x2</button>
                <div className="h-4 w-px bg-white/5"></div>
                <button className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all"><Zap size={14} className="text-yellow-500 fill-yellow-500/20" /> PTZ Control</button>
                <div className="h-4 w-px bg-white/5"></div>
                <button className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-red-500 animate-pulse"><div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div> REC LIVE</button>
            </footer>
        </div>
    )
}

function CameraCell({ id, label, bitrate, image }: { id: string, label: string, bitrate: string, image?: string }) {
    return (
        <div className="relative bg-[#050505] group overflow-hidden border border-white/[0.02]">
            {/* Simulated Video Feed background */}
            {image ? (
                <div className="absolute inset-0 grayscale contrast-125 brightness-75 group-hover:brightness-100 transition-all duration-700">
                    <img src={image} alt={label} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                    <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay"></div>
                </div>
            ) : (
                <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-primary/10 via-transparent to-blue-900/10 flex items-center justify-center">
                    <Shield size={60} className="text-white/[0.03] group-hover:text-primary transition-all duration-700" />
                </div>
            )}

            {/* Scanlines & Digital Grain Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.08] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_3px,4px_100%]"></div>

            {/* Live Indicator Dot Overlay */}
            <div className="absolute top-4 right-6 flex items-center gap-2 bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_5px_rgba(220,38,38,0.8)]"></div>
                <span className="text-[8px] font-black text-white tracking-widest uppercase">Live</span>
            </div>

            {/* OSD - Top */}
            <div className="absolute top-4 left-6 flex flex-col gap-0.5">
                <span className="text-[10px] font-black text-white bg-primary/20 border border-primary/30 px-2 py-0.5 rounded tracking-tight">{id}</span>
                <span className="text-[8px] font-black text-slate-300 tracking-[2px] mt-1 drop-shadow-md">{label}</span>
            </div>

            {/* OSD - Bottom Right */}
            <div className="absolute bottom-4 right-6 text-right">
                <p className="text-[8px] font-black text-green-500 uppercase tracking-tighter drop-shadow-md flex items-center justify-end gap-1">
                    <Activity size={8} className="animate-bounce" /> BITRATE: {bitrate} Kbps
                </p>
                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1 italic drop-shadow-md">H.265 AUTO-LEVEL</p>
            </div>

            {/* Focus lines on hover */}
            <div className="absolute inset-0 border border-primary/0 group-hover:border-primary/20 transition-all pointer-events-none">
                <div className="absolute top-4 right-4 w-4 h-px bg-primary/40"></div>
                <div className="absolute top-4 right-4 h-4 w-px bg-primary/40"></div>
                <div className="absolute bottom-4 left-4 w-4 h-px bg-primary/40"></div>
                <div className="absolute bottom-4 left-4 h-4 w-px bg-primary/40"></div>
            </div>
        </div>
    )
}

export default withAuth(OperationsDashboard)


function TasksView({ addNotification }: { addNotification: any }) {
    const [tasks, setTasks] = useState<any[]>([])
    const [newTask, setNewTask] = useState({ title: '', priority: 'media', due_date: '' })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchTasks()
    }, [])

    const fetchTasks = async () => {
        const { data } = await supabase.from('tasks').select('*').order('due_date', { ascending: true })
        if (data) setTasks(data)
        setLoading(false)
    }

    const handleAddTask = async (e: any) => {
        e.preventDefault()
        if (!newTask.title) return
        const { data, error } = await supabase.from('tasks').insert([{
            title: newTask.title,
            priority: newTask.priority,
            due_date: newTask.due_date || new Date().toISOString(),
            status: 'pendiente'
        }]).select()

        if (data) {
            setTasks([data[0], ...tasks])
            setNewTask({ title: '', priority: 'media', due_date: '' })
            // Notification if valid
            if (Notification.permission === 'granted') {
                new Notification('Tarea Creada', { body: `Has añadido: ${newTask.title}` })
            }
        }
    }

    const toggleTask = async (task: any) => {
        const states = ['pendiente', 'en_proceso', 'completada']
        const currentIndex = states.indexOf(task.status)
        const nextStatus = states[(currentIndex + 1) % states.length]

        const { error } = await supabase.from('tasks').update({ status: nextStatus }).eq('id', task.id)
        if (!error) {
            setTasks(tasks.map(t => t.id === task.id ? { ...t, status: nextStatus } : t))
            addNotification(`Tarea "${task.title.toUpperCase()}" movida a ${nextStatus.replace('_', ' ').toUpperCase()}`, 'info')
        }
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <header className="flex justify-between items-end">
                <div className="space-y-2">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter">Gestión de <span className="text-primary italic underline underline-offset-8">Tareas</span></h2>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Lista de pendientes tácticos y recordatorios operativos.</p>
                </div>
                <form onSubmit={handleAddTask} className="flex gap-3">
                    <input
                        type="text"
                        value={newTask.title}
                        onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                        placeholder="NUEVA TAREA..."
                        className="bg-slate-900 border border-white/5 rounded-xl px-6 py-3 text-[10px] font-black uppercase tracking-widest focus:border-primary focus:outline-none w-64"
                    />
                    <input
                        type="datetime-local"
                        value={newTask.due_date}
                        onChange={e => setNewTask({ ...newTask, due_date: e.target.value })}
                        className="bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-[10px] font-black uppercase text-slate-400 focus:border-primary focus:outline-none"
                    />
                    <select
                        value={newTask.priority}
                        onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                        className="bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:border-primary focus:outline-none"
                    >
                        <option value="baja">Baja</option>
                        <option value="media">Media</option>
                        <option value="alta">Alta</option>
                    </select>
                    <button type="submit" className="bg-primary px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-glow">Agregar</button>
                </form>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {['pendiente', 'en_proceso', 'completada'].map(status => (
                    <div key={status} className="glass rounded-[32px] border-white/5 p-8 space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[4px] text-slate-500 flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${status === 'pendiente' ? 'bg-yellow-500' : status === 'en_proceso' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                            {status.replace('_', ' ')}
                        </h3>
                        <div className="space-y-4">
                            {tasks.filter(t => t.status === status).map(task => (
                                <div key={task.id}
                                    onClick={() => toggleTask(task)}
                                    className="p-5 glass border-white/5 rounded-2xl hover:border-primary/30 transition-all cursor-pointer group">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-[11px] font-black uppercase tracking-tight text-white flex items-center justify-between">
                                            <span className={task.status === 'completada' ? 'line-through text-slate-600' : ''}>{task.title}</span>
                                            <ArrowRight size={10} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </p>
                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${task.priority === 'alta' ? 'bg-red-500/10 text-red-500' : 'bg-slate-500/10 text-slate-500'}`}>{task.priority}</span>
                                    </div>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                                        Vence: {task.due_date ? new Date(task.due_date).toLocaleString() : 'Sin fecha'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function CalendarView({ addNotification }: { addNotification: any }) {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [events, setEvents] = useState<any[]>([])
    const [showEventModal, setShowEventModal] = useState(false)
    const [selectedDate, setSelectedDate] = useState(new Date())

    useEffect(() => {
        fetchEvents()
        if (Notification.permission === 'default') {
            Notification.requestPermission()
        }
    }, [])

    const fetchEvents = async () => {
        const { data } = await supabase.from('calendar_events').select('*')
        if (data) setEvents(data)
    }

    const renderHeader = () => {
        const dateFormat = "MMMM yyyy"
        return (
            <div className="flex items-center justify-between mb-10">
                <div className="space-y-2">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter">Calendario <span className="text-primary italic underline underline-offset-8">Operativo</span></h2>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Sincronización de eventos y despliegues en tiempo real.</p>
                </div>
                <div className="flex items-center gap-6">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-3 bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all">Anterior</button>
                    <span className="text-sm font-black uppercase tracking-[3px] italic">{format(currentMonth, dateFormat).toUpperCase()}</span>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-3 bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all">Siguiente</button>
                </div>
            </div>
        )
    }

    const renderDays = () => {
        const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
        return (
            <div className="grid grid-cols-7 mb-4">
                {days.map(day => (
                    <div key={day} className="text-[10px] font-black uppercase tracking-[4px] text-slate-500 text-center">{day}</div>
                ))}
            </div>
        )
    }

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth)
        const monthEnd = endOfMonth(monthStart)
        const startDate = startOfWeek(monthStart)
        const endDate = endOfWeek(monthEnd)

        const rows = []
        let days = []
        let day = startDate
        let formattedDate = ""

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, "d")
                const cloneDay = day
                const dayEvents = events.filter(e => isSameDay(new Date(e.start_time), cloneDay))

                days.push(
                    <div
                        key={day.toString()}
                        className={`h-40 glass border border-white/5 p-4 transition-all hover:bg-white/[0.02] cursor-pointer ${!isSameMonth(day, monthStart) ? "opacity-20" : ""
                            } ${isSameDay(day, new Date()) ? "border-primary shadow-glow" : ""}`}
                        onClick={() => {
                            setSelectedDate(cloneDay)
                            setShowEventModal(true)
                        }}
                    >
                        <span className="text-[10px] font-black text-slate-500 mb-4 block">{formattedDate}</span>
                        <div className="space-y-1 overflow-y-auto max-h-24 custom-scrollbar">
                            {dayEvents.map(event => (
                                <div key={event.id} className={`text-[8px] font-black uppercase p-1.5 rounded bg-${event.color}-500/10 text-${event.color}-500 border border-${event.color}-500/20 truncate`}>
                                    {event.title}
                                </div>
                            ))}
                        </div>
                    </div>
                )
                day = addDays(day, 1)
            }
            rows.push(
                <div className="grid grid-cols-7" key={day.toString()}>
                    {days}
                </div>
            )
            days = []
        }
        return <div className="rounded-[40px] overflow-hidden border border-white/5">{rows}</div>
    }

    return (
        <div className="animate-in fade-in duration-500">
            {renderHeader()}
            {renderDays()}
            {renderCells()}
            {showEventModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl">
                    <div className="glass w-full max-w-md rounded-[32px] border-white/5 p-10 space-y-8 animate-in zoom-in duration-300">
                        <h3 className="text-xl font-black uppercase italic tracking-widest text-primary">Agendar Evento</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fecha: {selectedDate.toLocaleDateString()}</p>
                        <div className="space-y-6">
                            <input id="ev-title" type="text" placeholder="TITULO DEL EVENTO..." className="w-full bg-slate-900 border border-white/5 rounded-xl px-6 py-4 text-xs font-bold uppercase tracking-widest focus:border-primary focus:outline-none" />
                            <div className="flex gap-4">
                                <button onClick={async () => {
                                    const title = (document.getElementById('ev-title') as HTMLInputElement).value
                                    if (!title) return
                                    const { data } = await supabase.from('calendar_events').insert([{
                                        title,
                                        start_time: selectedDate.toISOString(),
                                        end_time: selectedDate.toISOString(),
                                        category: 'reunion',
                                        color: 'blue'
                                    }]).select()
                                    if (data) {
                                        setEvents([...events, data[0]])
                                        setShowEventModal(false)
                                        if (Notification.permission === 'granted') {
                                            new Notification('Evento Agendado', { body: `Evento: ${title}` })
                                        }
                                    }
                                }} className="flex-1 bg-primary py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-glow">Guardar</button>
                                <button onClick={() => setShowEventModal(false)} className="flex-1 bg-white/5 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500">Cancelar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
