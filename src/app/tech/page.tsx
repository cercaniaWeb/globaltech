'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    Shield,
    ClipboardList,
    MapPin,
    Zap,
    LogOut,
    User,
    CheckCircle,
    Clock,
    Camera,
    ArrowRight,
    MessageSquare,
    X,
    Layout,
    Activity,
    Eye
} from 'lucide-react'
import { withAuth } from '@/hoc/withAuth'

// ─── Tipos y Mocks ───────────────────────────────────────────

type Branch = { id: string; name: string; address: string; phone: string; cameras: number }
type WorkOrder = {
    id: string;
    client: string;
    branch: string;
    status: 'Programada' | 'En Proceso' | 'Completada';
    address: string;
    date: string;
    priority: string;
    type: 'Levantamiento' | 'Instalación';
    instructions?: string[];
}

const MOCK_TECH_ORDERS: WorkOrder[] = [
    {
        id: 'WO-101',
        client: 'Roberto Sánchez',
        branch: 'Matriz Polanco',
        status: 'En Proceso',
        address: 'Calle 123, Polanco',
        date: 'Hoy',
        priority: 'High',
        type: 'Instalación',
        instructions: [
            'Instalar 4 Cámaras IP Bullet 4MP exterior',
            'Configurar NVR Hikvision de 8 canales',
            'Cableado estructurado Cat6 con tubería conduit',
            'Pruebas de visualización remota en app móvil'
        ]
    },
    {
        id: 'WO-105',
        client: 'Elena Martínez',
        branch: 'Oficinas Reforma',
        status: 'Programada',
        address: 'Av. Reforma 450',
        date: 'Mañana',
        priority: 'Medium',
        type: 'Levantamiento',
        instructions: [
            'Revisión de puntos ciegos en lobby principal',
            'Presupuestar sistema de control de acceso biométrico',
            'Medición de distancias para repetidores Wi-Fi 6'
        ]
    },
]

function TechPortal() {
    const [user, setUser] = useState<any>(null)
    const [orders, setOrders] = useState<WorkOrder[]>(MOCK_TECH_ORDERS)
    const [activeTab, setActiveTab] = useState<'misiones' | 'perfil'>('misiones')
    const [showMonitor, setShowMonitor] = useState<WorkOrder | null>(null)
    const router = useRouter()

    useEffect(() => {
        const savedUser = localStorage.getItem('gt_user')
        if (!savedUser) {
            router.push('/login')
            return
        }
        const parsed = JSON.parse(savedUser)
        if (parsed.role !== 'tech') {
            router.push('/login')
            return
        }
        setUser(parsed)
    }, [router])

    const handleLogout = () => {
        localStorage.removeItem('gt_user')
        router.push('/login')
    }

    const completeOrder = (id: string) => {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'Completada' } : o))
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-slate-950 bg-grid text-white flex flex-col lg:flex-row overflow-hidden">
            {/* Mobile Header */}
            <div className="lg:hidden h-16 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 z-40">
                <div className="flex items-center gap-2">
                    <Shield className="text-primary w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-widest italic">Tactical Hud</span>
                </div>
                <button onClick={handleLogout} className="p-2 text-slate-500"><LogOut size={18} /></button>
            </div>

            {/* Sidebar Desktop */}
            <aside className="w-80 glass border-r border-white/5 hidden lg:flex flex-col p-8 relative z-30">
                <div className="flex items-center gap-3 mb-12">
                    <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center">
                        <Shield className="text-primary w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-black uppercase italic leading-none">{user.name}</p>
                        <p className="text-[9px] font-bold text-primary uppercase tracking-[3px] mt-1">Ingeniero de Campo</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    <button
                        onClick={() => setActiveTab('misiones')}
                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeTab === 'misiones' ? 'bg-primary text-white shadow-lg shadow-blue-900/30 font-black italic' : 'text-slate-500 hover:bg-white/5 uppercase font-bold text-[10px] tracking-widest'}`}
                    >
                        <ClipboardList size={18} /> Misiones
                    </button>
                    <button
                        onClick={() => setActiveTab('perfil')}
                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeTab === 'perfil' ? 'bg-primary text-white shadow-lg shadow-blue-900/30 font-black italic' : 'text-slate-500 hover:bg-white/5 uppercase font-bold text-[10px] tracking-widest'}`}
                    >
                        <User size={18} /> Expediente
                    </button>
                </nav>

                <button onClick={handleLogout} className="mt-auto flex items-center gap-3 px-6 py-4 text-slate-600 hover:text-red-500 transition-colors uppercase font-black text-[9px] tracking-widest">
                    <LogOut size={16} /> Abortar Sesión
                </button>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-6 lg:p-12 relative">
                <div className="max-w-4xl mx-auto space-y-10">
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-black italic uppercase tracking-tighter">
                                {activeTab === 'misiones' ? 'Tablero' : 'Expediente'} <span className="text-primary underline underline-offset-8">Táctico</span>
                            </h1>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Unidad Operativa ID: GT-TECH-001</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-xl flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
                                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">En Línea</span>
                            </div>
                        </div>
                    </header>

                    {activeTab === 'misiones' ? (
                        <div className="space-y-6">
                            {orders.map(order => (
                                <div key={order.id} className={`glass rounded-[32px] border-white/5 p-8 transition-all relative overflow-hidden group ${order.status === 'Completada' ? 'opacity-60' : 'hover:border-primary/20'}`}>
                                    <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-5 rounded-full ${order.priority === 'High' ? 'bg-red-500' : 'bg-primary'}`}></div>

                                    <div className="flex flex-col md:flex-row justify-between gap-8 relative z-10">
                                        <div className="space-y-6 flex-1">
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${order.status === 'Completada' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                                                    {order.status}
                                                </span>
                                                <span className="text-slate-600 font-mono text-[10px]">{order.id}</span>
                                            </div>

                                            <div className="space-y-1">
                                                <h3 className="text-2xl font-black uppercase tracking-tighter italic">{order.client}</h3>
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <MapPin size={14} className="text-primary" />
                                                    <span className="text-[11px] font-bold uppercase tracking-widest">{order.branch}</span>
                                                </div>
                                                <p className="text-[10px] text-slate-600 font-medium">{order.address}</p>
                                            </div>

                                            <div className="flex flex-wrap gap-4 pt-4 border-t border-white/5">
                                                <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                    <Zap size={14} className="text-yellow-500" /> {order.type}
                                                </div>
                                                <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                    <Clock size={14} className="text-blue-500" /> {order.date}
                                                </div>
                                            </div>

                                            {/* Protocolo de Acción (Instrucciones) */}
                                            {order.instructions && (
                                                <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/5 space-y-3">
                                                    <p className="text-[10px] font-black text-primary uppercase tracking-[3px] mb-4 flex items-center gap-2">
                                                        <ClipboardList size={14} /> Protocolo de Acción
                                                    </p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {order.instructions.map((inst, idx) => (
                                                            <div key={idx} className="flex items-start gap-3 group/item">
                                                                <div className="mt-1 w-3 h-3 border border-primary/30 rounded-sm flex items-center justify-center group-hover/item:border-primary transition-colors">
                                                                    <div className="w-1.5 h-1.5 bg-primary/20 scale-0 group-hover/item:scale-100 transition-transform"></div>
                                                                </div>
                                                                <span className="text-[11px] text-slate-400 group-hover/item:text-slate-200 transition-colors">{inst}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-3 justify-center md:w-56">
                                            {order.status !== 'Completada' && (
                                                <>
                                                    <button
                                                        onClick={() => setShowMonitor(order)}
                                                        className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 py-4 rounded-2xl text-[9px] font-black uppercase tracking-[2px] transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <Camera size={14} className="text-primary" /> Enlace de Cámara
                                                    </button>
                                                    <button
                                                        onClick={() => completeOrder(order.id)}
                                                        className="w-full bg-primary hover:bg-blue-600 text-white py-4 rounded-2xl text-[9px] font-black uppercase tracking-[2px] shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <CheckCircle size={14} /> Finalizar Misión
                                                    </button>
                                                </>
                                            )}
                                            {order.status === 'Completada' && (
                                                <div className="text-center py-4 border border-white/5 rounded-2xl bg-white/5">
                                                    <CheckCircle size={24} className="text-green-500 mx-auto mb-2 opacity-50" />
                                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Expediente Cerrado</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="glass rounded-[40px] border-white/5 p-12 text-center space-y-8">
                            <div className="w-32 h-32 bg-slate-900 border-2 border-primary/20 rounded-full mx-auto flex items-center justify-center shadow-2xl relative">
                                <User size={60} className="text-slate-700" />
                                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-slate-950"></div>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black italic uppercase tracking-tighter">{user.name}</h2>
                                <p className="text-primary text-[10px] font-black uppercase tracking-[4px]">Cédula Profesional: GT-7722-X</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-white/5">
                                <div className="p-6 bg-white/5 rounded-3xl space-y-1">
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Misiones</p>
                                    <p className="text-xl font-black italic text-primary">124</p>
                                </div>
                                <div className="p-6 bg-white/5 rounded-3xl space-y-1">
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Calificación</p>
                                    <p className="text-xl font-black italic text-primary">9.8</p>
                                </div>
                                <div className="p-6 bg-white/5 rounded-3xl space-y-1">
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Estatus</p>
                                    <p className="text-xl font-black italic text-green-500">Activo</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Tactical Monitor Overlay */}
            {showMonitor && (
                <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col animate-in slide-in-from-bottom duration-500">
                    <header className="h-16 bg-slate-900 border-b border-white/10 flex items-center justify-between px-8">
                        <div className="flex items-center gap-4">
                            <Camera className="text-primary" size={20} />
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-white leading-none">Vigilancia de Sitio</p>
                                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[2px] mt-1">{showMonitor.branch} — ENLACE DIRECTO</p>
                            </div>
                        </div>
                        <button onClick={() => setShowMonitor(null)} className="p-3 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-xl transition-all"><X size={18} /></button>
                    </header>
                    <div className="flex-1 bg-black grid grid-cols-2 grid-rows-2 gap-px p-px">
                        <CameraCell id="CAM-01" label="Lobby / Acceso" bitrate="2240" image="/images/cctv/entry_point.png" />
                        <CameraCell id="CAM-02" label="Perímetro Externo" bitrate="4112" image="/images/cctv/perimeter.png" />
                        <CameraCell id="CAM-03" label="Server Room" bitrate="1056" image="/images/cctv/server_room.png" />
                        <div className="bg-[#050505] flex items-center justify-center">
                            <span className="text-[8px] font-black text-slate-800 uppercase tracking-widest">Aguardando Enlace CAM 04...</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function CameraCell({ id, label, bitrate, image }: { id: string, label: string, bitrate: string, image?: string }) {
    return (
        <div className="relative bg-[#050505] group overflow-hidden border border-white/[0.02]">
            {image && (
                <div className="absolute inset-0 grayscale contrast-125 brightness-75 group-hover:brightness-100 transition-all duration-700">
                    <img src={image} alt={label} className="w-full h-full object-cover opacity-50 group-hover:opacity-70" />
                </div>
            )}

            <div className="absolute inset-0 pointer-events-none opacity-[0.08] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_3px,4px_100%]"></div>

            <div className="absolute top-4 right-6 flex items-center gap-2 bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_5px_rgba(220,38,38,0.8)]"></div>
                <span className="text-[8px] font-black text-white tracking-widest uppercase">Live Link</span>
            </div>

            <div className="absolute top-4 left-6 flex flex-col gap-0.5">
                <span className="text-[10px] font-black text-white bg-primary/20 border border-primary/30 px-2 py-0.5 rounded tracking-tight">{id}</span>
                <span className="text-[8px] font-black text-slate-300 tracking-[2px] mt-1 italic">{label}</span>
            </div>

            <div className="absolute bottom-4 right-6 text-right">
                <p className="text-[8px] font-black text-green-500 uppercase tracking-tighter drop-shadow-md flex items-center justify-end gap-1">
                    <Activity size={8} className="animate-bounce" /> {bitrate} Kbps
                </p>
                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1 italic opacity-50">HEVC/H.265</p>
            </div>

            <div className="absolute inset-0 border border-primary/0 group-hover:border-primary/20 transition-all">
                <div className="absolute top-4 right-4 w-4 h-px bg-primary/40"></div>
                <div className="absolute top-4 right-4 h-4 w-px bg-primary/40"></div>
                <div className="absolute bottom-4 left-4 w-4 h-px bg-primary/40"></div>
                <div className="absolute bottom-4 left-4 h-4 w-px bg-primary/40"></div>
            </div>
        </div>
    )
}

export default withAuth(TechPortal)
