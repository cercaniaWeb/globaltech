'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
    LayoutDashboard,
    MoreVertical,
    Plus,
    Search,
    DollarSign,
    Clock,
    Ruler,
    ChevronRight,
    Loader2
} from 'lucide-react'
import ARMeasurement from './ARMeasurement'

import CotizadorModal from './CotizadorModal'

type CRMLead = {
    id: string
    created_at: string
    client_name: string
    contact_email: string | null
    contact_phone: string | null
    status: 'Prospecto' | 'Levantamiento' | 'Cotizado' | 'Cerrado' | 'Perdido'
    estimated_value: number
    notes: string | null
}

export default function CRMView({ addNotification }: any) {
    const [leads, setLeads] = useState<CRMLead[]>([])
    const [loading, setLoading] = useState(true)
    const [activeLeadForAR, setActiveLeadForAR] = useState<CRMLead | null>(null)
    const [activeLeadForQuote, setActiveLeadForQuote] = useState<CRMLead | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    const fetchLeads = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('crm_leads')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching leads:', error)
        } else {
            setLeads((data || []) as CRMLead[])
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchLeads()
    }, [])

    const handleAddLead = async () => {
        const clientName = prompt('Nombre del Prospecto:')
        if (!clientName) return

        const { data, error } = await supabase
            .from('crm_leads')
            .insert([{ client_name: clientName, status: 'Prospecto', estimated_value: 0 }])
            .select()

        if (error) {
            addNotification('Error al crear lead', 'error')
        } else {
            setLeads([(data[0] as CRMLead), ...leads])
            addNotification(`NUEVO LEAD CREADO: ${clientName.toUpperCase()}`, 'success')
        }
    }

    const filteredLeads = leads.filter(l =>
        l.client_name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (activeLeadForAR) {
        return <ARMeasurement lead={activeLeadForAR} onClose={() => setActiveLeadForAR(null)} addNotification={addNotification} />
    }

    return (
        <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500 pb-20">
            {activeLeadForQuote && (
                <CotizadorModal
                    lead={activeLeadForQuote}
                    onClose={() => {
                        setActiveLeadForQuote(null)
                        // Auto-update status to Cotizado? Optional, but nice
                        supabase.from('crm_leads').update({ status: 'Cotizado' }).eq('id', activeLeadForQuote.id).then(() => fetchLeads())
                    }}
                    addNotification={addNotification}
                />
            )}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter">Pipeline <span className="text-primary italic underline underline-offset-8">CRM</span></h2>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest text-glow">Gestión comercial y levantamientos técnicos 3D.</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="BUSCAR CLIENTE..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleAddLead}
                        className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[3px] transition-all shadow-lg shadow-blue-900/40 flex items-center gap-2 shrink-0"
                    >
                        <Plus size={14} /> Nuevo Prospecto
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 h-[700px] overflow-x-auto pb-4 custom-scrollbar lg:h-auto lg:overflow-visible">
                {['Prospecto', 'Levantamiento', 'Cotizado', 'Cerrado'].map((status) => (
                    <div key={status} className="flex flex-col gap-6 min-w-[300px]">
                        <div className="flex justify-between items-center px-2">
                            <h3 className="text-[10px] font-black uppercase tracking-[4px] text-slate-400 flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${status === 'Cerrado' ? 'bg-green-500' : 'bg-primary'}`}></span>
                                {status}
                            </h3>
                            <span className="text-[10px] font-mono text-slate-600 font-black">{leads.filter(l => l.status === status).length}</span>
                        </div>
                        <div className="space-y-4 flex-1">
                            {loading ? (
                                <div className="h-32 glass rounded-3xl flex items-center justify-center opacity-50 border-dashed border-white/10">
                                    <Loader2 className="w-5 h-5 animate-spin text-slate-600" />
                                </div>
                            ) : leads.filter(l => l.status === status).length === 0 ? (
                                <div className="h-32 glass rounded-3xl border-dashed border-white/5 flex items-center justify-center">
                                    <p className="text-[8px] font-black text-slate-800 uppercase tracking-widest">Sin Entradas</p>
                                </div>
                            ) : leads.filter(l => l.status === status).map(lead => (
                                <div key={lead.id} className="glass rounded-[32px] border-white/10 p-6 space-y-4 hover:border-primary/40 transition-all group cursor-default">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-xs font-black uppercase tracking-tight italic text-white">{lead.client_name}</h4>
                                            <p className="text-[8px] text-slate-500 font-bold mt-1 tracking-widest uppercase">{new Date(lead.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <button className="p-1.5 hover:bg-white/5 rounded-lg text-slate-600 transition-colors"><MoreVertical size={14} /></button>
                                    </div>

                                    <div className="flex items-center justify-between border-t border-white/5 py-4 mt-2">
                                        <button
                                            onClick={() => setActiveLeadForQuote(lead)}
                                            className="flex-1 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-emerald-400 hover:text-white transition-colors group/tool"
                                        >
                                            <DollarSign size={12} className="group-hover/tool:animate-pulse" /> Cotizar
                                        </button>
                                        <div className="h-8 w-px bg-white/5"></div>
                                        <button
                                            onClick={() => setActiveLeadForAR(lead)}
                                            className="flex-1 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors group/tool"
                                        >
                                            <Ruler size={12} className="group-hover/tool:animate-pulse" /> Leviton 3D
                                        </button>
                                    </div>

                                    <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                                        <div className="flex -space-x-2">
                                            <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-900 flex items-center justify-center text-[8px] font-black">JS</div>
                                        </div>
                                        <button className="text-slate-600 hover:text-primary transition-colors">
                                            <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
