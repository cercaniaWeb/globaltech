'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, ShoppingCart, Info, CheckCircle, Package, ShieldCheck, ArrowLeft } from 'lucide-react'

const CATEGORIES = ["Todos", "CCTV", "Control de Acceso", "Redes", "Detección de Fuego", "Energía"];

const MOCK_PRODUCTS = [
    {
        id: "1",
        title: "Kit CCTV Hikvision 4 Canales 1080P",
        category: "CCTV",
        price: 3850,
        syscom_id: "KIT-HIK-4CH",
        specs: ["4 Cámaras 2MP", "DVR 4CH", "Disco 1TB", "Fuentes Incluidas"]
    },
    {
        id: "2",
        title: "Lector Biométrico Facial iDS-K1T341AMF",
        category: "Control de Acceso",
        price: 8420,
        syscom_id: "HIK-BIOMETRIC-01",
        specs: ["3000 Rostros", "Pantalla 4.3\" Touch", "Deep Learning", "Control de Puerta"]
    },
    {
        id: "3",
        title: "Antena Ubiquiti LiteBeam 5AC Gen2",
        category: "Redes",
        price: 1950,
        syscom_id: "UBNT-LB-G2",
        specs: ["23 dBi", "5 GHz", "450+ Mbps", "Radio de Gestión Integrado"]
    }
];

export default function StorePage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("Todos");
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetch('/api/syscom/products')
            .then(res => res.json())
            .then(data => {
                setProducts(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const filteredProducts = products.filter(p => {
        const searchMatch = p.titulo.toLowerCase().includes(search.toLowerCase()) ||
            p.modelo.toLowerCase().includes(search.toLowerCase());

        if (filter === "Todos") return searchMatch;

        // Mapeo manual de categorías del frontend a las de Syscom
        const categoryMap: any = {
            "CCTV": ["Videovigilancia", "Cámaras IP", "DVR", "NVR", "CCTV"],
            "Control de Acceso": ["Control de Acceso", "Videoporteros IP", "Cerraduras"],
            "Redes": ["Redes", "Networking", "Wi-Fi", "Switches"],
            "Energía": ["Energía", "UPS", "Baterías", "Fuentes de Poder"],
            "Detección de Fuego": ["Detección de Fuego", "Incendio", "Alarmas de Fuego"]
        };

        const targetCategories = categoryMap[filter] || [filter];

        // Verificamos si alguna categoría del producto coincide
        const productCategories = p.categorias?.map((c: any) => c.nombre.trim().toLowerCase()) || [];

        const categoryMatch = targetCategories.some((tc: string) =>
            productCategories.some((pc: string) => pc.includes(tc.toLowerCase()))
        );

        return categoryMatch && searchMatch;
    });

    return (
        <div className="min-h-screen bg-slate-50 bg-grid pb-20">
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Volver Inicio
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 relative overflow-hidden rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                            <Image src="/logo.png" alt="Global Telecom" fill className="object-contain p-1" priority />
                        </div>
                        <span className="hidden sm:inline-block text-xl font-bold uppercase tracking-tighter text-slate-900 leading-none">
                            Global <span className="text-primary border-b-2 border-primary">Telecom</span> Store
                        </span>
                    </div>
                    <button className="px-6 py-2 bg-slate-100 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-all text-slate-900 border border-slate-200">
                        Mi Cuenta
                    </button>
                </div>
            </nav>

            <header className="pt-32 pb-12 px-6">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-widest">
                                <ShieldCheck className="w-4 h-4" /> Distribuidor Autorizado Syscom
                            </div>
                            <h1 className="text-5xl font-extrabold uppercase tracking-tight text-slate-900 leading-none">Catálogo <span className="text-primary">Profesional</span></h1>
                            <p className="text-slate-500 font-medium max-w-xl">Accede al catálogo de mayorista más potente de México con el respaldo de Global Telecom.</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Buscar equipo o modelo..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-12 pr-6 py-3 bg-white rounded-2xl border border-slate-200 w-full sm:w-80 font-medium focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-slate-900"
                                />
                            </div>
                            <button className="px-6 py-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-center gap-3 font-bold hover:bg-slate-50 transition-all text-slate-900 shadow-sm">
                                <ShoppingCart className="w-5 h-5 text-primary" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Carrito (0)</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-4">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${filter === cat
                                    ? 'bg-primary text-white border-primary shadow-lg shadow-blue-900/10'
                                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="px-6 max-w-7xl mx-auto">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <p className="text-slate-500 font-medium animate-pulse">Sincronizando con Syscom...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900">No se encontraron equipos</h3>
                        <p className="text-slate-500">Intenta con otros filtros o términos de búsqueda.</p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProducts.map(product => (
                            <ProductCard key={product.producto_id} product={product} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

function ProductCard({ product }: { product: any }) {
    return (
        <div className="group bg-white rounded-[32px] border border-slate-100 hover:border-primary/20 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-900/5 relative overflow-hidden flex flex-col h-full">
            <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
                <span className="text-[8px] font-bold uppercase tracking-widest bg-slate-900 px-3 py-1 rounded-full text-white">
                    {product.modelo}
                </span>
            </div>

            <div className="p-8 relative aspect-square flex items-center justify-center bg-white border-b border-slate-50">
                <div className="relative w-full h-full p-4 group-hover:scale-105 transition-transform duration-700">
                    <div className="w-full h-full relative">
                        {product.img_portada ? (
                            <Image
                                src={product.img_portada}
                                alt={product.modelo}
                                fill
                                className="object-contain"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-2xl">
                                <Package className="w-12 h-12 text-slate-200" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-8 flex-1 flex flex-col">
                <div className="text-[9px] font-bold uppercase tracking-[3px] text-slate-400 mb-3">{product.marca}</div>
                <h3 className="text-lg font-bold leading-snug mb-4 text-slate-900 group-hover:text-primary transition-all line-clamp-2 min-h-[3.5rem]">
                    {product.titulo}
                </h3>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-auto">
                    <div className="space-y-0.5">
                        <div className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Precio Inversión</div>
                        <div className="text-2xl font-bold text-slate-900">
                            ${product.precio_cliente} <span className="text-[10px] font-medium text-slate-500">{product.moneda}</span>
                        </div>
                    </div>

                    <button className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/10 hover:bg-blue-800 transition-all">
                        <ShoppingCart className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    )
}
