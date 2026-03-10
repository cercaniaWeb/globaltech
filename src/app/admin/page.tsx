'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
    Users,
    BarChart3,
    Settings,
    Search,
    CheckCircle,
    Clock,
    ChevronRight,
    TrendingUp,
    Mail,
    Smartphone,
    Save,
    Loader2,
    Lock,
    Shield,
    ArrowUpRight,
    Briefcase
} from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('leads')
    const [leads, setLeads] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [margin, setMargin] = useState('25')
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        fetchLeads()
    }, [])

    const fetchLeads = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false })

        if (data) setLeads(data)
        setLoading(false)
    }

    const handleSaveSettings = async () => {
        setIsSaving(true)
        setTimeout(() => {
            setIsSaving(false)
            alert("Margen actualizado a " + margin + "% para todos los productos.")
        }, 1000)
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex overflow-hidden">
            {/* Admin Sidebar */}
            <aside className="w-72 bg-slate-900 border-r border-white/5 flex flex-col sticky top-0 h-screen z-30">
                <div className="p-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40">
                            <Lock size={20} className="text-white" />
                        </div>
                        <div>
                            <p className="font-black text-xs uppercase tracking-widest leading-none">Global <span className="text-primary italic">Admin</span></p>
                            <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Gestión Central</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <NavItem
                        icon={<BarChart3 size={18} />}
                        label="Cotizaciones"
                        active={activeTab === 'leads'}
                        onClick={() => setActiveTab('leads')}
                        badge={leads.length.toString()}
                    />
                    <NavItem
                        icon={<Users size={18} />}
                        label="Usuarios App"
                        active={activeTab === 'users'}
                        onClick={() => setActiveTab('users')}
                    />
                    <NavItem
                        icon={<Settings size={18} />}
                        label="Config. Precios"
                        active={activeTab === 'settings'}
                        onClick={() => setActiveTab('settings')}
                    />

                    <div className="pt-4 pb-2 px-4">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Atajos Externos</p>
                    </div>

                    <Link href="/dashboard" className="flex items-center justify-between p-4 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition-all group">
                        <div className="flex items-center gap-4">
                            <Briefcase size={18} />
                            <span className="text-[11px] font-bold uppercase tracking-widest">Módulo Operativo</span>
                        </div>
                        <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                </nav>

                <div className="p-6 border-t border-slate-800">
                    <Link href="/" className="text-[10px] font-black text-slate-500 hover:text-white flex items-center gap-2 uppercase tracking-widest">
                        <ChevronRight size={14} className="rotate-180" /> Home Global Telecom
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative h-screen bg-grid">
                <header className="h-20 border-b border-white/5 flex justify-between items-center px-12 glass sticky top-0 z-20">
                    <div className="space-y-1">
                        <h1 className="text-xl font-black uppercase tracking-tighter text-white">
                            Panel de <span className="text-primary italic">Control</span>
                        </h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Administración de Negocio</p>
                    </div>

                    <div className="flex gap-4">
                        <button onClick={fetchLeads} className="px-6 py-2 glass border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-300 hover:bg-white/5 transition-all">
                            Sincronizar Datos
                        </button>
                    </div>
                </header>

                <div className="p-12">
                    {activeTab === 'leads' && (
                        <div className="space-y-10 animate-in fade-in duration-500">
                            {/* Quick Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatsCard icon={<TrendingUp className="text-green-500" />} label="Conversión total" value="12%" sub="+2.5% este mes" />
                                <StatsCard icon={<Clock className="text-blue-500" />} label="Pendientes" value={leads.length.toString()} sub="Requieren atención" />
                                <StatsCard icon={<CheckCircle className="text-purple-500" />} label="Cerrados" value="48" sub="Global Group" />
                            </div>

                            {/* Table Area */}
                            <div className="glass rounded-[40px] border-white/5 overflow-hidden shadow-2xl">
                                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                                    <h3 className="font-black uppercase tracking-[3px] text-slate-400 text-[11px]">Prospectos del Configurador</h3>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                                        <input type="text" placeholder="BUSCAR LEAD..." className="pl-9 pr-4 py-2 bg-slate-950/50 border border-white/5 rounded-xl text-[10px] focus:outline-none focus:border-primary font-black tracking-widest uppercase w-64" />
                                    </div>
                                </div>

                                <div className="overflow-x-auto min-h-[400px]">
                                    {loading ? (
                                        <div className="p-20 text-center text-slate-400 flex flex-col items-center gap-4">
                                            <Loader2 className="animate-spin text-primary" />
                                            <p className="font-bold uppercase text-[10px] tracking-widest">Cargando leads...</p>
                                        </div>
                                    ) : leads.length === 0 ? (
                                        <div className="p-20 text-center text-slate-500 italic uppercase font-black text-[10px] tracking-widest">No hay registros dinámicos.</div>
                                    ) : (
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="text-[9px] uppercase font-black text-slate-500 bg-black/20 tracking-[2px]">
                                                    <th className="px-8 py-5">Fecha</th>
                                                    <th className="px-8 py-5">Responsable</th>
                                                    <th className="px-8 py-5">Configuración</th>
                                                    <th className="px-8 py-5">Cotización</th>
                                                    <th className="px-8 py-5 text-right">Acción</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {leads.map((lead) => (
                                                    <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors group">
                                                        <td className="px-8 py-6 text-[11px] text-slate-500 font-mono italic">{new Date(lead.created_at).toLocaleDateString()}</td>
                                                        <td className="px-8 py-6">
                                                            <p className="font-black italic text-sm">{lead.name}</p>
                                                            <p className="text-[10px] text-primary flex items-center gap-1 uppercase tracking-widest mt-1 opacity-70"><Mail size={10} /> {lead.email}</p>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="text-[9px] font-black text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full uppercase tracking-tighter inline-block italic">
                                                                {lead.details}
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6 font-black text-white text-sm">{lead.estimate}</td>
                                                        <td className="px-8 py-6 text-right">
                                                            <button className="p-2 bg-white/5 rounded-lg text-slate-500 hover:bg-primary hover:text-white transition-all shadow-lg hover:shadow-primary/20">
                                                                <Smartphone size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="p-20 text-center animate-in fade-in duration-500">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Users className="text-primary w-10 h-10" />
                            </div>
                            <h2 className="text-lg font-black uppercase italic tracking-widest">Base de Datos de Usuarios</h2>
                            <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">Próximamente: Gestión avanzada de roles y permisos para técnicos y clientes.</p>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="max-w-xl animate-in slide-in-from-bottom-4 duration-500">
                            <div className="glass rounded-[40px] border-white/5 p-10 shadow-2xl space-y-10">
                                <header className="space-y-2">
                                    <h3 className="text-xl font-black uppercase italic italic tracking-tighter flex items-center gap-3">
                                        <Settings className="text-primary" /> Algoritmo de Precios
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium">Controla el margen de utilidad dinámica en toda la plataforma.</p>
                                </header>

                                <div className="p-8 bg-slate-900 rounded-3xl border border-white/5 space-y-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 blur-2xl rounded-full"></div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <label className="text-[10px] font-black uppercase text-slate-500 tracking-[3px]">Margen Global</label>
                                            <span className="text-4xl font-black italic text-primary">{margin}%</span>
                                        </div>
                                        <div className="pt-4">
                                            <input
                                                type="range"
                                                min="5"
                                                max="100"
                                                value={margin}
                                                onChange={(e) => setMargin(e.target.value)}
                                                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                                            />
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase italic mt-4">Nota: Este valor afecta Tienda y Cotizador Smart.</p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSaveSettings}
                                    disabled={isSaving}
                                    className="w-full bg-primary hover:bg-blue-600 text-white font-black uppercase tracking-[3px] text-[10px] py-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-900/20"
                                >
                                    {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Aplicar Cambios Globales</>}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

function NavItem({ icon, label, active, onClick, badge }: { icon: any, label: string, active: boolean, onClick: () => void, badge?: string }) {
    return (
        <div
            onClick={onClick}
            className={`
        flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-300 group
        ${active
                    ? 'bg-primary text-white shadow-lg shadow-blue-900/30'
                    : 'text-slate-500 hover:bg-white/5 hover:text-white'}
      `}
        >
            <div className="flex items-center gap-4">
                {icon}
                <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
            </div>
            {badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-black ${active ? 'bg-white text-primary' : 'bg-slate-800 text-slate-500'}`}>
                    {badge}
                </span>
            )}
        </div>
    )
}

function StatsCard({ icon, label, value, sub }: { icon: any, label: string, value: string, sub: string }) {
    return (
        <div className="glass border border-white/5 p-8 rounded-[32px] space-y-4 hover:border-primary/20 transition-all group overflow-hidden relative">
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary/5 blur-xl group-hover:bg-primary/10 transition-colors"></div>
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">{icon}</div>
            <div>
                <p className="text-[9px] uppercase font-black text-slate-500 tracking-widest mb-1">{label}</p>
                <p className="text-3xl font-black italic">{value}</p>
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{sub}</p>
        </div>
    )
}
