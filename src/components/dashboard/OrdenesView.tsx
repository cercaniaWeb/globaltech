'use client'

import { useState } from 'react'
import { Filter, MapPin } from 'lucide-react'
import FirmaModal from './FirmaModal'

export default function OrdenesView({ orders, onFinishOrder, addNotification }: any) {
    const [orderToSign, setOrderToSign] = useState<any>(null)

    return (
        <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500 pb-20">
            {orderToSign && (
                <FirmaModal
                    order={orderToSign}
                    onClose={() => setOrderToSign(null)}
                    onConfirm={onFinishOrder}
                    addNotification={addNotification}
                />
            )}

            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">Work <span className="text-primary underline underline-offset-8">Logistic</span></h2>
                <div className="flex gap-3">
                    <button className="p-3 glass rounded-xl text-slate-500 hover:text-primary transition-all"><Filter size={18} /></button>
                </div>
            </div>

            <div className="glass rounded-[40px] border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
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
                            {orders.map((o: any) => (
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
                                            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-[8px] border border-primary/20 leading-none">{o.technician[0]}</div>
                                            {o.technician}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase italic">{o.date}</td>
                                    <td className="px-10 py-8 text-right">
                                        {o.status !== 'Completada' ? (
                                            <button
                                                onClick={() => setOrderToSign(o)}
                                                className="bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-glow-hover whitespace-nowrap"
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
        </div>
    )
}
