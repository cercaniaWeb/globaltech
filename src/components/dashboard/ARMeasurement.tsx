'use client'

import React, { useState, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { XR, createXRStore, useXRHitTest, XRDomOverlay, useXR } from '@react-three/xr'
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

function Reticle({ onHit, points }: { onHit: (pos: THREE.Vector3) => void, points: THREE.Vector3[] }) {
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
                <ringGeometry args={[0.05, 0.06, 32]} />
                <meshStandardMaterial
                    color={points.length === 0 ? "#2563eb" : "#10b981"}
                    emissive={points.length === 0 ? "#2563eb" : "#10b981"}
                    emissiveIntensity={4}
                />
            </mesh>
            <mesh>
                <sphereGeometry args={[0.008]} />
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
            <Reticle onHit={handleHit} points={points} />

            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -0.01, 0]}
                onPointerDown={(e) => handleHit(e.point)}
                visible={false}
            >
                <planeGeometry args={[50, 50]} />
                <meshStandardMaterial transparent opacity={0} />
            </mesh>
        </group>
    )
}

// ─── Componente Principal ─────────────────────────────────────

function ARUIOverlay({ points, setPoints, isSaving, saveToSupabase, onClose, distance }: any) {
    const session = useXR((state) => state.session)
    const isPresenting = session !== null

    return (
        <XRDomOverlay>
            <div className={`fixed inset-0 flex flex-col p-6 pointer-events-none transition-all duration-700 ${isPresenting ? 'bg-transparent' : 'bg-slate-950/90 backdrop-blur-xl'}`}>
                {/* Top Header */}
                <div className="flex justify-between items-start pointer-events-auto">
                    <button
                        onClick={onClose}
                        className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center text-white active:scale-90 transition-all shadow-2xl"
                    >
                        <X size={24} />
                    </button>

                    <div className="bg-black/60 backdrop-blur-2xl border border-primary/30 px-6 py-2 rounded-full shadow-2xl text-center flex flex-col items-center">
                        <span className="text-[8px] font-black tracking-[3px] text-primary uppercase leading-none mb-1">Cálculo Espacial</span>
                        <span className="text-2xl font-mono font-black text-white italic leading-none">{distance.toFixed(3)}m</span>
                    </div>

                    <div className="w-12"></div>
                </div>

                {/* Instructions Overlay (Only when not presenting or no points) */}
                {!isPresenting && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 max-w-xs mx-auto pointer-events-none">
                        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
                            <Box size={40} className="text-primary" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-black uppercase tracking-tighter text-white">Preparado para Medir</h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                                Inicia Leviton para activar la cámara AR y medir superficies físicas con precisión milimétrica.
                            </p>
                        </div>
                    </div>
                )}

                {/* Bottom Action Bar */}
                <div className="mt-auto flex flex-col items-center gap-6 pointer-events-auto pb-10">
                    {points.length > 0 && (
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setPoints([])}
                                className="w-14 h-14 bg-red-500/20 backdrop-blur-md border border-red-500/40 rounded-full flex items-center justify-center text-red-500 active:scale-95 transition-all shadow-xl"
                            >
                                <Trash2 size={20} />
                            </button>
                            <span className="text-[10px] font-black text-white uppercase tracking-widest py-2 px-4 bg-white/10 rounded-full backdrop-blur-md">
                                {points.length === 1 ? 'Punto A Fijado' : 'Segmento Listo'}
                            </span>
                        </div>
                    )}

                    <div className="flex w-full max-w-sm gap-4">
                        <button
                            className={`flex-1 h-16 rounded-[24px] font-black uppercase text-[12px] tracking-[4px] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 ${isPresenting ? 'bg-primary/40 border border-primary/60 text-white' : 'bg-primary text-white border-4 border-white/10'}`}
                            onClick={() => store.enterAR()}
                        >
                            <Box size={20} /> {isPresenting ? (points.length === 1 ? 'Marca Punto B' : 'Medir Pared') : 'Iniciar Leviton'}
                        </button>

                        {points.length === 2 && (
                            <button
                                disabled={isSaving}
                                onClick={saveToSupabase}
                                className="w-16 h-16 bg-emerald-500 text-white rounded-[24px] flex items-center justify-center shadow-2xl active:scale-95 transition-all border border-white/20 animate-bounce"
                            >
                                <Save size={24} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </XRDomOverlay>
    )
}

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
        <div className="fixed inset-0 z-[150] overflow-hidden bg-transparent">
            <Canvas
                shadows
                gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
                camera={{ position: [0, 2, 5], fov: 45 }}
                onCreated={({ gl }) => {
                    gl.setClearColor(0x000000, 0)
                }}
            >
                <XR store={store}>
                    <ARUIOverlay
                        points={points}
                        setPoints={setPoints}
                        isSaving={isSaving}
                        saveToSupabase={saveToSupabase}
                        onClose={onClose}
                        distance={distance}
                    />

                    <ambientLight intensity={1} />
                    <pointLight position={[10, 10, 10]} intensity={2} />
                    <ARSceneProxy points={points} setPoints={setPoints} />
                </XR>
            </Canvas>
        </div>
    )
}
