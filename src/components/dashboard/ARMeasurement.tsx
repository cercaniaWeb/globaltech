'use client'

import React, { useState, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { XR, createXRStore, useXRHitTest } from '@react-three/xr'
import { OrbitControls, Text, Line, Float } from '@react-three/drei'
import * as THREE from 'three'
import { X, Ruler, Save, Trash2, Box, Info } from 'lucide-react'
import { supabase } from '@/lib/supabase'

// ─── Inicializar el Store de XR ──────────────────────────────
const store = createXRStore()

// ─── Componentes 3D ──────────────────────────────────────────

function MeasurementPoints({ points, setPoints }: any) {
    return (
        <>
            {points.map((p: any, i: number) => (
                <mesh key={i} position={p}>
                    <sphereGeometry args={[0.02, 16, 16]} />
                    <meshStandardMaterial color="#2563eb" emissive="#2563eb" emissiveIntensity={2} />
                </mesh>
            ))}

            {points.length === 2 && (
                <MeasurementLine start={points[0]} end={points[1]} />
            )}
        </>
    )
}

function MeasurementLine({ start, end }: { start: THREE.Vector3, end: THREE.Vector3 }) {
    const distance = useMemo(() => {
        // FÓRMULA DE DISTANCIA EUCLIDIANA 3D SOLICITADA
        return start.distanceTo(end)
    }, [start, end])

    const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)

    return (
        <>
            <Line points={[start, end]} color="#2563eb" lineWidth={2} dashed={false} />
            <group position={center.add(new THREE.Vector3(0, 0.05, 0))}>
                <Float speed={5} rotationIntensity={0.5} floatIntensity={0.5}>
                    <Text
                        fontSize={0.04}
                        color="white"
                        font="/fonts/inter-bold.woff"
                        anchorX="center"
                        anchorY="middle"
                    >
                        {`${distance.toFixed(2)}m`}
                    </Text>
                </Float>
            </group>
        </>
    )
}

const matrixHelper = new THREE.Matrix4()

function Reticle({ onHit }: { onHit: (pos: THREE.Vector3) => void }) {
    const [hitPoint, setHitPoint] = useState<THREE.Vector3 | null>(null)

    useXRHitTest(
        (results, getWorldMatrix) => {
            if (results.length === 0) {
                setHitPoint(null)
                return
            }
            getWorldMatrix(matrixHelper, results[0])
            const position = new THREE.Vector3().setFromMatrixPosition(matrixHelper)
            setHitPoint(position)
        },
        'viewer'
    )

    if (!hitPoint) return null

    return (
        <group position={hitPoint}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} onPointerDown={() => onHit(hitPoint.clone())}>
                <ringGeometry args={[0.08, 0.1, 32]} />
                <meshStandardMaterial color="#2563eb" emissive="#2563eb" emissiveIntensity={2} />
            </mesh>
            <mesh>
                <sphereGeometry args={[0.015]} />
                <meshStandardMaterial color="white" />
            </mesh>
        </group>
    )
}

function ARSceneProxy({ setPoints, points }: any) {
    const handleHit = (position: THREE.Vector3) => {
        if (points.length >= 2) {
            setPoints([position])
        } else {
            setPoints([...points, position])
        }
    }

    return (
        <group>
            <MeasurementPoints points={points} setPoints={setPoints} />
            <Reticle onHit={handleHit} />

            {/* Desktop Fallback */}
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -0.5, 0]}
                onPointerDown={(e) => handleHit(e.point)}
                visible={false}
            >
                <planeGeometry args={[20, 20]} />
                <meshStandardMaterial transparent opacity={0} />
            </mesh>
        </group>
    )
}

// ─── Componente Principal ─────────────────────────────────────

export default function ARMeasurement({ lead, onClose, addNotification }: any) {
    const [points, setPoints] = useState<THREE.Vector3[]>([])
    const [isSaving, setIsSaving] = useState(false)

    const distance = useMemo(() => {
        if (points.length === 2) {
            return points[0].distanceTo(points[1])
        }
        return 0
    }, [points])

    const saveToSupabase = async () => {
        if (points.length < 2) return
        setIsSaving(true)

        const { error } = await supabase
            .from('crm_measurements')
            .insert([{
                lead_id: lead.id,
                from_point: { x: points[0].x, y: points[0].y, z: points[0].z },
                to_point: { x: points[1].x, y: points[1].y, z: points[1].z },
                distance: distance,
                label: `Cableado CCTV - ${new Date().toLocaleTimeString()}`
            }])

        if (error) {
            addNotification('Error al guardar medición', 'error')
        } else {
            addNotification('MEDICIÓN 3D GUARDADA EN CLOUD', 'success')
            await supabase.from('crm_leads').update({ status: 'Levantamiento' }).eq('id', lead.id)
            setPoints([])
        }
        setIsSaving(false)
    }

    return (
        <div className="fixed inset-0 z-[150] bg-slate-950 flex flex-col animate-in fade-in duration-500 overflow-hidden">
            {/* Header Táctico */}
            <header className="h-20 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-8 shrink-0 z-[160]">
                <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/40">
                        <Ruler className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-white leading-none">Leviton 3D <span className="text-primary tracking-tighter italic">V.1.2</span></h2>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Lead: {lead?.client_name}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end mr-4">
                        <span className="text-[8px] font-black uppercase text-slate-500 tracking-[3px]">Precisión Láser</span>
                        <span className="text-[10px] font-mono text-primary font-black">99.2% OPTIMIZED</span>
                    </div>
                    <button onClick={onClose} className="p-3 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-xl transition-all"><X size={20} /></button>
                </div>
            </header>

            {/* Canvas Area */}
            <div className="flex-1 relative bg-black">
                <button
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[200] bg-primary border-none text-white font-black uppercase tracking-widest text-[10px] px-8 py-4 rounded-2xl shadow-2xl"
                    onClick={() => store.enterAR()}
                >
                    Entrar en AR
                </button>

                <Canvas shadows camera={{ position: [0, 2, 5], fov: 45 }}>
                    <XR store={store}>
                        <color attach="background" args={['#020617']} />
                        <ambientLight intensity={0.5} />
                        <pointLight position={[10, 10, 10]} intensity={1} castShadow />

                        <ARSceneProxy points={points} setPoints={setPoints} />

                        <OrbitControls makeDefault />
                    </XR>
                </Canvas>

                {/* HUD de Medición Overlay */}
                <div className="absolute top-10 left-10 p-6 glass-dark backdrop-blur-2xl rounded-[32px] border border-white/10 space-y-4 max-w-[240px] z-[160]">
                    <div className="flex items-center gap-2">
                        <Box size={14} className="text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[3px] text-white">Spatial Data</span>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                            <span className="text-[9px] font-black text-slate-500 uppercase">Distancia:</span>
                            <span className="text-xl font-mono font-black text-primary italic">{distance.toFixed(3)}m</span>
                        </div>
                        <div className="flex gap-2 text-[8px] font-bold text-slate-600 uppercase">
                            <Info size={10} />
                            <span>Toca en el espacio 3D para marcar puntos A y B</span>
                        </div>
                    </div>
                    <div className="pt-4 flex gap-2">
                        <button
                            onClick={() => setPoints([])}
                            className="flex-1 py-3 bg-white/5 hover:bg-red-600/20 text-slate-500 hover:text-red-500 rounded-xl transition-all flex items-center justify-center"
                        >
                            <Trash2 size={16} />
                        </button>
                        <button
                            disabled={points.length < 2 || isSaving}
                            onClick={saveToSupabase}
                            className="flex-[2] py-3 bg-primary hover:bg-blue-600 text-white rounded-xl font-black uppercase text-[9px] tracking-widest transition-all disabled:opacity-30 flex items-center justify-center gap-2"
                        >
                            <Save size={14} /> {isSaving ? 'Guardando...' : 'Fijar'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer de Estado */}
            <footer className="h-12 bg-slate-900 border-t border-white/10 flex items-center justify-center gap-10 shrink-0 z-[160]">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-glow"></div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">WebXR System Operational</span>
                </div>
                <div className="h-4 w-px bg-white/5"></div>
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-600 italic">Global Telecom Engineering Labs</span>
            </footer>
        </div>
    )
}
