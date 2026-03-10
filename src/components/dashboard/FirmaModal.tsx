'use client'

import { useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { X, CheckCircle, ShieldCheck, PenTool } from 'lucide-react'
import jsPDF from 'jspdf'

export default function FirmaModal({ order, onClose, onConfirm, addNotification }: any) {
    const sigCanvas = useRef<any>(null)
    const [isSaving, setIsSaving] = useState(false)

    const clearSignature = () => {
        if (sigCanvas.current) sigCanvas.current.clear()
    }

    const handleSave = async () => {
        if (sigCanvas.current?.isEmpty()) {
            addNotification('La firma es requerida para cerrar la orden', 'error')
            return
        }

        setIsSaving(true)
        const signatureImage = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png')

        // Aquí generaríamos el PDF de Cierre de Servicio
        const doc = new jsPDF()
        doc.setFontSize(22)
        doc.setTextColor(37, 99, 235)
        doc.text('Global Telecom', 14, 20)

        doc.setFontSize(14)
        doc.setTextColor(0)
        doc.text('CERTIFICADO DE CONFORMIDAD DE SERVICIO', 14, 30)

        doc.setFontSize(10)
        doc.setTextColor(50)
        doc.text(`Cliente: ${order.client}`, 14, 45)
        doc.text(`Sede: ${order.branch}`, 14, 52)
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 59)
        doc.text(`Ingeniero: ${order.technician}`, 14, 66)
        doc.text(`Servicio: ${order.type}`, 14, 73)
        doc.text(`ID de Orden: ${order.id}`, 14, 80)

        doc.text('El cliente firma de conformidad aceptando que los trabajos', 14, 100)
        doc.text('fueron realizados según los estándares acordados.', 14, 105)

        // Inject Signature
        doc.addImage(signatureImage, 'PNG', 14, 120, 80, 40)
        doc.line(14, 160, 94, 160) // Linea de firma
        doc.text('Firma del Cliente', 35, 165)

        doc.save(`Cierre_${order.id}_${order.client.replace(' ', '')}.pdf`)

        addNotification('Firma biométrica capturada y certificada.', 'success')
        onConfirm(order.id)
        onClose()
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative bg-slate-900 border border-white/10 rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
                    <div>
                        <h2 className="text-lg font-black uppercase tracking-tighter italic text-white flex items-center gap-2">
                            <ShieldCheck size={20} className="text-primary" /> Protocolo de Cierre
                        </h2>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Orden: <span className="text-primary">{order.id}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-500 rounded-xl transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <p className="text-xs text-slate-400 leading-relaxed text-center">
                        Por favor, solicite al cliente que firme en el recuadro inferior para certificar la conformidad del servicio.
                    </p>

                    <div className="bg-slate-50 rounded-2xl overflow-hidden border-2 border-white/10 relative">
                        <div className="absolute top-4 left-4 flex gap-2 items-center text-slate-300 opacity-50 select-none pointer-events-none">
                            <PenTool size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Área de Firma</span>
                        </div>
                        <SignatureCanvas
                            ref={sigCanvas}
                            canvasProps={{
                                className: 'w-full h-48 cursor-crosshair'
                            }}
                            backgroundColor="rgb(248 250 252)" // slate-50
                            penColor="rgb(2 6 23)" // slate-950
                        />
                    </div>

                    <div className="flex gap-4 pt-2">
                        <button
                            onClick={clearSignature}
                            className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black uppercase text-[10px] tracking-[2px] transition-all"
                        >
                            Limpiar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-[2] py-4 bg-primary hover:bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-[3px] transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
                        >
                            <CheckCircle size={16} /> {isSaving ? 'Certificando...' : 'Sellar Orden'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
