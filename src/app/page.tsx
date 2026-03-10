'use client'

import Image from "next/image";
import Link from "next/link";
import { Shield, ShieldCheck, Cpu, Headphones, ArrowRight, Menu, CheckCircle2 } from "lucide-react";
import SmartConfigurator from "@/components/SmartConfigurator";

export default function Home() {
  return (
    <div className="min-h-screen bg-background bg-grid selection:bg-primary/30 text-slate-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/30">
              <Shield className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-black uppercase tracking-tighter italic">
              Global <span className="text-primary">Telecom</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-10 text-slate-400">
            <Link href="#servicios" className="text-[10px] font-black uppercase tracking-[3px] hover:text-white transition-colors">Servicios</Link>
            <Link href="#soluciones" className="text-[10px] font-black uppercase tracking-[3px] hover:text-white transition-colors">Soluciones</Link>
            <Link href="/tienda" className="text-[10px] font-black uppercase tracking-[3px] hover:text-white transition-colors">Catálogo Pro</Link>
            <Link href="/login" className="px-6 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-[3px] hover:bg-blue-600 transition-all shadow-lg shadow-blue-900/40">Acceso Sistema</Link>
          </div>

          <button className="md:hidden p-2 text-white">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.12)_0%,transparent_75%)] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-[3px]">
                <ShieldCheck className="w-4 h-4" /> Partner Certificado Hikvision & Syscom
              </div>

              <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] italic">
                Seguridad <br /> <span className="text-primary">Estratégica</span> <br /> Digital
              </h1>

              <p className="text-lg text-slate-400 max-w-xl font-medium leading-relaxed uppercase tracking-wide">
                Ingeniería avanzada en Videovigilancia, Control de Acceso y Redes. Desplegamos infraestructura de alto rendimiento con respaldo corporativo.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 pt-4">
                <Link href="#configurador" className="btn-primary group border-none py-6 px-10 text-xs">
                  Cotizar Proyecto Smart <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </Link>
                <Link href="/tienda" className="px-10 py-6 glass rounded-[22px] border border-white/10 text-xs font-black uppercase tracking-[4px] hover:bg-white/5 transition-all text-center">Ver Catálogo</Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 pt-16 border-t border-white/5">
                <div>
                  <p className="text-4xl font-black italic border-b-4 border-primary inline-block">10+</p>
                  <p className="text-[9px] uppercase font-black tracking-[3px] text-slate-500 mt-4">Años de Expertis</p>
                </div>
                <div>
                  <p className="text-4xl font-black italic border-b-4 border-primary inline-block">500+</p>
                  <p className="text-[9px] uppercase font-black tracking-[3px] text-slate-500 mt-4">Nodos Listos</p>
                </div>
                <div className="hidden sm:block">
                  <p className="text-4xl font-black italic border-b-4 border-primary inline-block">24/7</p>
                  <p className="text-[9px] uppercase font-black tracking-[3px] text-slate-500 mt-4">SOC Operativo</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-10 bg-primary/10 blur-[120px] rounded-full opacity-50 animate-pulse"></div>
              <div className="relative glass rounded-[56px] overflow-hidden border border-white/5 aspect-square lg:aspect-video flex items-center justify-center shadow-3xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent"></div>
                <Shield className="w-56 h-56 text-primary/5 animate-in zoom-in duration-1000" />
                <div className="absolute bottom-10 left-10 right-10 p-8 glass backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl flex items-center gap-8 group hover:scale-[1.02] transition-transform">
                  <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center border border-green-500/20">
                    <CheckCircle2 className="text-green-500 w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-black uppercase tracking-widest text-slate-200">Terminal Verificada</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Conexión Segura vía Global Cloud</p>
                  </div>
                  <div className="ml-auto w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div id="configurador" className="relative z-10 scroll-mt-24">
        <SmartConfigurator />
      </div>

      {/* Services Section */}
      <section id="servicios" className="py-32 px-6 bg-black/20">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-center space-y-6">
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[4px] text-slate-400">Verticales de Negocio</div>
            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter italic">Servicios <span className="text-primary italic underline underline-offset-8">Especializados</span></h2>
            <p className="text-slate-500 max-w-2xl mx-auto font-bold uppercase tracking-widest text-[11px]">Suministro, Ingeniería y Soporte Post-Venta.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <ServiceCard
              icon={<Shield className="w-10 h-10" />}
              title="CCTV & SOC"
              description="Instalación de cámaras IP de alta resolución con análisis perimetral avanzado y reconocimiento de placas."
            />
            <ServiceCard
              icon={<ShieldCheck className="w-10 h-10" />}
              title="Identity Control"
              description="Control de acceso biométrico, facial y vehicular integrado a sistemas administrativos corporativos."
            />
            <ServiceCard
              icon={<Cpu className="w-10 h-10" />}
              title="Infraestructura"
              description="Diseño y tendido de redes de fibra óptica, radioenlaces de larga distancia y centros de datos."
            />
          </div>
        </div>
      </section>

      {/* Footer Simple */}
      <footer className="py-20 border-t border-white/5 text-center space-y-6 bg-slate-950">
        <div className="flex justify-center gap-3 opacity-50 grayscale hover:grayscale-0 transition-all">
          <div className="w-10 h-10 bg-slate-800 rounded-lg"></div>
          <div className="w-10 h-10 bg-slate-800 rounded-lg"></div>
          <div className="w-10 h-10 bg-slate-800 rounded-lg"></div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[5px] text-slate-600">© 2026 Global Telecomunicaciones Digitales S.A. de C.V.</p>
      </footer>
    </div>
  );
}

function ServiceCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="group glass p-12 rounded-[48px] border border-white/5 hover:border-primary/30 transition-all duration-700 hover:shadow-3xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:scale-125 transition-transform duration-1000 text-white">
        {icon}
      </div>
      <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-10 group-hover:bg-primary transition-all duration-500 text-slate-400 group-hover:text-white shadow-inner">
        {icon}
      </div>
      <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-6 text-white group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed uppercase text-[11px] tracking-widest">{description}</p>

      <div className="mt-10 pt-8 border-t border-white/5 flex items-center text-[9px] font-black uppercase tracking-[3px] text-primary opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all">
        Saber Más <ArrowRight size={12} className="ml-2" />
      </div>
    </div>
  );
}
