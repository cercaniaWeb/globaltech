'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'
import { Navigation, MapPin, Shield, Activity, Users } from 'lucide-react'

// Carga dinámica de Leaflet para evitar errores de SSR
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

export default function SquadMapView() {
    const [L, setL] = useState<any>(null)
    const [teams, setTeams] = useState([
        { id: 1, name: 'Alpha Squad', position: [19.4326, -99.1332], status: 'ON_ROUTE', battery: '85%', engineer: 'Ing. Javier S.' },
        { id: 2, name: 'Beta Team', position: [19.4126, -99.1532], status: 'ON_SITE', battery: '92%', engineer: 'Ing. Roberto M.' },
        { id: 3, name: 'Gamma Response', position: [19.4526, -99.1232], status: 'STANDBY', battery: '45%', engineer: 'Ing. Elena G.' },
    ])

    useEffect(() => {
        import('leaflet').then((leaflet) => {
            setL(leaflet)
        })

        // Simular movimiento de una cuadrilla
        const interval = setInterval(() => {
            setTeams(prev => prev.map(t => {
                if (t.id === 1) {
                    return { ...t, position: [t.position[0] + 0.0001, t.position[1] + 0.0001] as [number, number] }
                }
                return t
            }))
        }, 5000)

        return () => clearInterval(interval)
    }, [])

    if (!L) return (
        <div className="h-[600px] glass rounded-[40px] flex items-center justify-center border-dashed border-white/10">
            <div className="text-center space-y-4">
                <Activity className="w-8 h-8 animate-pulse text-primary mx-auto" />
                <p className="text-[10px] font-black uppercase tracking-[5px] text-slate-500">Initializing Tactical Map...</p>
            </div>
        </div>
    )

    // Iconos personalizados de Leaflet
    const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="w-8 h-8 bg-primary rounded-full border-2 border-white flex items-center justify-center shadow-lg shadow-blue-500/50">
                <div class="w-2 h-2 bg-white rounded-full animate-ping"></div>
              </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    })

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex justify-between items-end">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter">Squad <span className="text-primary underline underline-offset-8">Geofence</span></h2>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none">Live Deployment Telemetry • Real-time GPS</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 glass rounded-xl border-white/5">
                        <Users size={14} className="text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">3 active units</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* Tactical Map Container */}
                <div className="xl:col-span-3 h-[600px] rounded-[40px] overflow-hidden border border-white/10 relative shadow-2xl">
                    <MapContainer
                        center={[19.4326, -99.1332] as any}
                        zoom={13}
                        style={{ height: '100%', width: '100%', background: '#020617' }}
                    >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        />
                        {teams.map(team => (
                            <Marker
                                key={team.id}
                                position={team.position as any}
                                icon={customIcon}
                            >
                                <Popup className="tactical-popup">
                                    <div className="p-2 space-y-2">
                                        <h4 className="text-sm font-black uppercase tracking-tight text-slate-900">{team.name}</h4>
                                        <p className="text-[10px] font-bold text-primary">{team.engineer}</p>
                                        <div className="flex justify-between text-[8px] font-black uppercase border-t pt-2 border-slate-100">
                                            <span className="text-slate-500">Status</span>
                                            <span className="text-emerald-600">{team.status}</span>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>

                    {/* HUD Overlay on Map */}
                    <div className="absolute top-6 left-6 z-[1000] p-4 glass-dark rounded-2xl border border-white/10 pointer-events-none">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield size={12} className="text-primary" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-white">Secure Link Operational</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Activity size={12} className="text-emerald-500" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Telemetry: 56ms Latency</span>
                        </div>
                    </div>

                    <div className="absolute bottom-6 right-6 z-[1000] flex gap-2">
                        <button className="px-4 py-2 glass-dark rounded-xl border border-white/10 text-[9px] font-black uppercase tracking-widest text-white hover:bg-primary transition-all pointer-events-auto">
                            Center View
                        </button>
                    </div>
                </div>

                {/* Team Sidebar */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[4px] text-slate-500 px-2">Units List</h3>
                    <div className="space-y-4">
                        {teams.map(team => (
                            <div key={team.id} className="glass p-6 rounded-[32px] border-white/5 space-y-4 hover:border-primary/30 transition-all cursor-default group">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${team.status === 'ON_SITE' ? 'bg-primary' : 'bg-emerald-500'} animate-pulse shadow-glow`}></div>
                                        <h4 className="text-xs font-black uppercase tracking-tight italic text-white">{team.name}</h4>
                                    </div>
                                    <Navigation size={14} className="text-slate-600 group-hover:text-primary transition-colors" />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Engineer</span>
                                        <span className="text-[10px] font-bold text-slate-300">{team.engineer}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Battery</span>
                                        <span className="text-[10px] font-mono text-emerald-500 font-black">{team.battery}</span>
                                    </div>
                                    <div className="pt-3 border-t border-white/5">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={10} className="text-primary" />
                                            <span className="text-[8px] font-mono text-slate-600">{team.position[0].toFixed(4)}, {team.position[1].toFixed(4)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-[3px] text-slate-400 hover:text-white hover:bg-primary/20 transition-all">
                        Broadcast to All Units
                    </button>
                </div>
            </div>
        </div>
    )
}
