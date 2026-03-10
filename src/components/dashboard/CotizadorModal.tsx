'use client'

import { useState, useEffect } from 'react'
import { X, Search, Plus, Trash2, FileText, Download, DollarSign, Package, ShoppingCart } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function CotizadorModal({ lead, onClose, addNotification }: any) {
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    // Line items en la cotización
    const [quoteItems, setQuoteItems] = useState<any[]>([])
    const [handLabor, setHandLabor] = useState(0)

    useEffect(() => {
        fetch('/api/syscom/products')
            .then(res => res.json())
            .then(data => {
                setProducts(Array.isArray(data) ? data : [])
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    const filteredProducts = products.filter(p =>
        p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.modelo.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const addItem = (product: any) => {
        const existing = quoteItems.find(item => item.producto_id === product.producto_id)
        if (existing) {
            setQuoteItems(quoteItems.map(item =>
                item.producto_id === product.producto_id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ))
        } else {
            setQuoteItems([...quoteItems, { ...product, quantity: 1 }])
        }
    }

    const removeItem = (id: string) => {
        setQuoteItems(quoteItems.filter(item => item.producto_id !== id))
    }

    const updateQuantity = (id: string, qty: number) => {
        if (qty < 1) return
        setQuoteItems(quoteItems.map(item =>
            item.producto_id === id ? { ...item, quantity: qty } : item
        ))
    }

    const subtotal = quoteItems.reduce((acc, item) => acc + (parseFloat(item.precio_cliente) * item.quantity), 0)
    const total = subtotal + handLabor

    const generatePDF = () => {
        if (quoteItems.length === 0) {
            addNotification('Agrega productos a la cotización primero', 'error')
            return
        }

        const doc = new jsPDF()

        // Header
        doc.setFontSize(22)
        doc.setTextColor(37, 99, 235) // Primary Blue
        doc.text('Global Telecom', 14, 20)

        doc.setFontSize(10)
        doc.setTextColor(100)
        doc.text('PROPUESTA COMERCIAL DE SEGURIDAD', 14, 28)

        // Client Info
        doc.setFontSize(12)
        doc.setTextColor(20)
        doc.text(`Cliente: ${lead?.client_name || 'Cliente Mostrador'}`, 14, 45)
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 52)
        doc.text(`Cotización #: GT-${Math.floor(Math.random() * 10000)}`, 14, 59)

        // Table
        const tableData = quoteItems.map(item => [
            item.modelo,
            item.titulo.substring(0, 50) + '...',
            item.quantity.toString(),
            `$${parseFloat(item.precio_cliente).toFixed(2)}`,
            `$${(parseFloat(item.precio_cliente) * item.quantity).toFixed(2)}`
        ])

        // Add hand labor entry if exists
        if (handLabor > 0) {
            tableData.push([
                'SRV-INST',
                'Mano de Obra y Materiales de Instalación',
                '1',
                `$${handLabor.toFixed(2)}`,
                `$${handLabor.toFixed(2)}`
            ])
        }

        autoTable(doc, {
            startY: 70,
            head: [['Modelo', 'Descripción', 'Cant.', 'Precio Unit.', 'Importe (MXN)']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [15, 23, 42] },
            styles: { fontSize: 9 }
        })

        // Totals
        const finalY = (doc as any).lastAutoTable.finalY || 70
        doc.setFontSize(14)
        doc.setTextColor(0)
        doc.text(`Total Inversión: $${total.toFixed(2)} MXN`, 120, finalY + 20)

        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.text('* Precios sujetos a cambio sin previo aviso. Precios más IVA.', 14, finalY + 40)

        doc.save(`Cotizacion_${lead?.client_name?.replace(' ', '_') || 'Global_Telecom'}.pdf`)

        addNotification('Cotización PDF Generada con Éxito', 'success')
        onClose()
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative bg-slate-900 border border-white/10 rounded-[32px] w-full max-w-5xl h-[85vh] flex overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">

                {/* Panel Izquierdo: Catálogo */}
                <div className="w-1/2 flex flex-col border-r border-white/5 bg-slate-900/50">
                    <div className="p-6 border-b border-white/5">
                        <h3 className="text-sm font-black uppercase tracking-widest text-white mb-4">Catálogo Syscom</h3>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar modelo o descripción..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-[10px] uppercase font-bold text-white focus:outline-none focus:border-primary transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {loading ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-50">
                                <Search className="w-8 h-8 animate-spin mb-4 text-primary" />
                                <span className="text-[10px] uppercase tracking-widest">Sincronizando Precios...</span>
                            </div>
                        ) : filteredProducts.map(p => (
                            <div key={p.producto_id} className="flex gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group">
                                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shrink-0">
                                    {p.img_portada ? (
                                        <img src={p.img_portada} alt={p.modelo} className="max-w-full max-h-full object-contain p-1 mix-blend-multiply" />
                                    ) : <Package className="text-slate-300" />}
                                </div>
                                <div className="flex-1 flex flex-col justify-center">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-primary">{p.marca} | {p.modelo}</span>
                                    <span className="text-xs font-bold text-white line-clamp-1">{p.titulo}</span>
                                    <span className="text-[10px] font-mono text-emerald-400 mt-1">${p.precio_cliente} {p.moneda}</span>
                                </div>
                                <button
                                    onClick={() => addItem(p)}
                                    className="p-3 my-auto bg-primary/20 text-primary hover:bg-primary hover:text-white rounded-lg transition-colors"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Panel Derecho: Cotización Actual */}
                <div className="w-1/2 flex flex-col bg-slate-900 relative">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-black uppercase tracking-tighter italic text-white flex items-center gap-2">
                                <FileText size={20} className="text-primary" /> Constructor de Cotización
                            </h2>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Lead: <span className="text-primary">{lead?.client_name || 'Desconocido'}</span></p>
                        </div>
                        <button onClick={onClose} className="p-2 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-500 rounded-xl transition-all">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                        {quoteItems.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-30">
                                <ShoppingCart className="w-12 h-12 mb-4" />
                                <p className="text-xs font-black uppercase tracking-widest">Sin productos</p>
                            </div>
                        ) : quoteItems.map(item => (
                            <div key={item.producto_id} className="flex items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-white/5">
                                <div className="flex-1">
                                    <p className="text-[9px] font-black tracking-widest text-slate-400">{item.modelo}</p>
                                    <p className="text-xs font-bold text-slate-200 line-clamp-1">{item.titulo}</p>
                                </div>
                                <div className="flex items-center gap-2 bg-white/5 rounded-lg px-2 py-1">
                                    <button
                                        onClick={() => updateQuantity(item.producto_id, item.quantity - 1)}
                                        className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white"
                                    >-</button>
                                    <span className="w-6 text-center text-[10px] font-bold">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.producto_id, item.quantity + 1)}
                                        className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white"
                                    >+</button>
                                </div>
                                <div className="w-20 text-right font-mono text-[10px] text-emerald-400">
                                    ${(parseFloat(item.precio_cliente) * item.quantity).toFixed(2)}
                                </div>
                                <button
                                    onClick={() => removeItem(item.producto_id)}
                                    className="text-slate-600 hover:text-red-500 p-2"
                                ><Trash2 size={14} /></button>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 bg-slate-950 border-t border-white/5">
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400 font-bold">Subtotal Equipos:</span>
                                <span className="font-mono text-white">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400 font-bold">Mano de Obra (MXN):</span>
                                <div className="flex items-center gap-2">
                                    <DollarSign size={14} className="text-primary" />
                                    <input
                                        type="number"
                                        value={handLabor}
                                        onChange={(e) => setHandLabor(parseFloat(e.target.value) || 0)}
                                        className="w-24 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-right text-white focus:outline-none focus:border-primary font-mono"
                                    />
                                </div>
                            </div>
                            <div className="h-px bg-white/10 w-full"></div>
                            <div className="flex justify-between items-center text-xl font-black">
                                <span className="text-white">TOTAL INVERSIÓN:</span>
                                <span className="font-mono text-emerald-400">${total.toFixed(2)} MXN</span>
                            </div>
                        </div>

                        <button
                            onClick={generatePDF}
                            className="w-full bg-primary hover:bg-blue-600 text-white py-4 rounded-xl font-black uppercase tracking-[3px] transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/30"
                        >
                            <Download size={18} /> Generar PDF Oficial
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
