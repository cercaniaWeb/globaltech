'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Lock, Mail, ArrowRight, Loader2, UserPlus, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

// ─── Credenciales de Prueba ──────────────────────────────────
// Admin:   admin@globaltelecom.mx  / admin123
// Cliente: cliente@demo.mx         / demo123
// ─────────────────────────────────────────────────────────────

const MOCK_USERS = [
    { email: 'admin@globaltelecom.mx', password: 'admin123', name: 'Luis Romero', role: 'admin' },
    { email: 'cliente@demo.mx', password: 'demo123', name: 'Carlos Méndez', role: 'client' },
    { email: 'juan@globaltelecom.mx', password: 'tech123', name: 'Juan Pérez', role: 'tech' },
]

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        // Simular delay de autenticación
        await new Promise(resolve => setTimeout(resolve, 1200))

        const user = MOCK_USERS.find(u => u.email === email && u.password === password)

        if (!user) {
            setError('Credenciales inválidas. Use las cuentas demo.')
            setLoading(false)
            return
        }

        // Guardamos el usuario en localStorage para simular sesión
        localStorage.setItem('gt_user', JSON.stringify(user))

        if (user.role === 'admin') {
            router.push('/dashboard') // Redirigir al dashboard de operaciones
        } else if (user.role === 'tech') {
            router.push('/tech') // Redirigir al panel del técnico
        } else {
            router.push('/portal')
        }
    }

    return (
        <div className="min-h-screen bg-background bg-grid flex items-center justify-center px-6 py-12 relative overflow-hidden">
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="max-w-[460px] w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
                <div className="text-center space-y-4">
                    <Link href="/" className="inline-flex items-center gap-3 group">
                        <div className="w-16 h-16 bg-slate-900 border border-white/10 rounded-[22px] flex items-center justify-center p-3 shadow-2xl group-hover:scale-105 group-hover:border-primary/50 transition-all">
                            <Shield className="w-full h-full text-primary fill-primary/10" />
                        </div>
                    </Link>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black uppercase tracking-tight text-white">
                            Acceso <span className="text-primary italic">Seguro</span>
                        </h1>
                        <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[4px]">
                            Control de Usuarios Global Telecom
                        </p>
                    </div>
                </div>

                {/* Credenciales Demo */}
                <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                        <AlertTriangle size={14} /> Cuentas de Demostración
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[9px]">
                        <div className="space-y-1">
                            <p className="font-black text-slate-300 uppercase tracking-widest border-b border-white/5 pb-1">Admin Ops</p>
                            <p className="text-slate-500">admin@globaltelecom.mx</p>
                            <p className="text-slate-500">admin123</p>
                        </div>
                        <div className="space-y-1">
                            <p className="font-black text-slate-300 uppercase tracking-widest border-b border-white/5 pb-1">Técnico Campo</p>
                            <p className="text-slate-500">juan@globaltelecom.mx</p>
                            <p className="text-slate-500">tech123</p>
                        </div>
                        <div className="space-y-1">
                            <p className="font-black text-slate-300 uppercase tracking-widest border-b border-white/5 pb-1">Socio Cliente</p>
                            <p className="text-slate-500">cliente@demo.mx</p>
                            <p className="text-slate-500">demo123</p>
                        </div>
                    </div>
                </div>

                <div className="glass p-10 rounded-[40px] border border-white/5 space-y-8 shadow-2xl">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black text-center uppercase tracking-widest">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Mail className="w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    placeholder="Correo Corporativo"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-6 py-4 bg-slate-950/50 rounded-2xl border border-white/5 text-white font-medium focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-sm"
                                />
                            </div>

                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Lock className="w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    placeholder="Clave de Acceso"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-6 py-4 bg-slate-950/50 rounded-2xl border border-white/5 text-white font-medium focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-sm"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-[3px] text-[10px] transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Autenticar Sistema <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="flex flex-col gap-6 pt-8 border-t border-white/5">
                        <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
                            <Link href="/recuperar" className="hover:text-primary transition-colors hover:underline">Recuperar Acceso</Link>
                            <Link href="/registro" className="text-primary hover:text-blue-400 transition-colors flex items-center gap-1.5 group">
                                <UserPlus className="w-3 h-3 group-hover:scale-110 transition-transform" />
                                <span className="group-hover:underline">Crear Cuenta Socios</span>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="text-center space-y-6 pt-4">
                    <div className="flex justify-center gap-8 text-[8px] font-black uppercase text-slate-600 tracking-[2px]">
                        <span className="flex items-center gap-1.5"><Shield className="w-3 h-3 text-primary" /> Multi-Layer Encryption</span>
                        <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> Servidor Operativo</span>
                    </div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[4px]">
                        © 2026 GLOBAL TELECOMUNICACIONES DIGITALES
                    </p>
                </div>
            </div>
        </div>
    )
}
