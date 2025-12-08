import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Float, Cloud, Sparkles, Html, Tube } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

// Mock Data
const journeyData = [
  { date: '2024-01-10', title: 'Start', desc: 'Hello World!', type: 'start' },
  { date: '2024-01-12', title: 'Variables', desc: '기초 다지기', type: 'learning' },
  { date: '2024-01-15', title: 'Conditionals', desc: 'if/else', type: 'learning' },
  { date: '2024-01-20', title: 'Loops', desc: '반복문', type: 'learning' },
  { date: '2024-02-01', title: 'Arrays', desc: '데이터 구조', type: 'learning' },
  { date: '2024-02-14', title: 'Functions', desc: '함수화', type: 'milestone' },
  { date: '2024-02-20', title: 'Silver Rank', desc: '알고리즘 해결', type: 'achievement', highlight: true },
  { date: '2024-03-01', title: 'DP', desc: '동적계획법', type: 'challenge' },
  { date: '2024-03-10', title: 'Current', desc: '성장 중 🚀', type: 'current' },
];



const NebulaNode = ({ position, data }) => {
    const [hovered, setHover] = useState(false);
    const group = useRef();
    
    // Premium Color Palette
    const color = useMemo(() => {
        switch(data.type) {
            case 'start': return '#10b981'; // Emerald Glow
            case 'achievement': return '#fbbf24'; // Gold Glow
            case 'milestone': return '#ec4899'; // Hot Pink Glow
            case 'current': return '#3b82f6'; // Azure Glow
            default: return '#8b5cf6'; // Violet Glow
        }
    }, [data.type]);

    useFrame((state) => {
        if (group.current) {
            // Pulse animation
            const t = state.clock.elapsedTime;
            group.current.scale.setScalar(1 + Math.sin(t * 2) * 0.05);
            group.current.rotation.z = t * 0.2;
        }
    });

    return (
        <group position={position}>
            <group ref={group}>
                {/* 1. Core Star (Bright Center) */}
                <mesh onPointerOver={(e) => { e.stopPropagation(); setHover(true); }} onPointerOut={() => setHover(false)}>
                    <sphereGeometry args={[0.3, 32, 32]} />
                    <meshStandardMaterial 
                        color="white"
                        emissive={color}
                        emissiveIntensity={2}
                        toneMapped={false}
                        transparent
                        opacity={0.9}
                    />
                </mesh>

                {/* 2. Inner Glow Halo */}
                <mesh scale={[1.8, 1.8, 1.8]}>
                    <sphereGeometry args={[0.3, 32, 32]} />
                    <meshBasicMaterial 
                        color={color} 
                        transparent 
                        opacity={0.3} 
                        depthWrite={false} 
                    />
                </mesh>

                {/* 3. Outer Nebula Haze */}
                <mesh scale={[3, 3, 3]}>
                    <sphereGeometry args={[0.3, 32, 32]} />
                    <meshBasicMaterial 
                        color={color} 
                        transparent 
                        opacity={0.1} 
                        depthWrite={false} 
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>

                {/* 4. Selection Ring - Removed based on user feedback */}
                {/* {hovered && (
                    <mesh scale={[3.5, 3.5, 3.5]}>
                        <ringGeometry args={[0.28, 0.3, 64]} />
                        <meshBasicMaterial color="white" transparent opacity={0.5} side={THREE.DoubleSide} />
                    </mesh>
                )} */}
            </group>

            {/* Premium HTML Tooltip (Fixed Text Issue) */}
            <Html position={[0, 0.8, 0]} center distanceFactor={8} style={{ pointerEvents: 'none', zIndex: 100 }}>
                <div style={{ 
                    background: hovered ? 'rgba(15, 23, 42, 0.9)' : 'transparent',
                    backdropFilter: hovered ? 'blur(8px)' : 'none',
                    padding: hovered ? '12px 16px' : '0',
                    borderRadius: '12px',
                    border: hovered ? `1px solid ${color}` : 'none',
                    transition: 'all 0.3s ease',
                    opacity: 1, // Always show title, expand details on hover
                    transform: hovered ? 'scale(1.1)' : 'scale(1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    minWidth: '150px' // Prevent wrapping
                }}>
                    <div style={{ 
                        fontSize: '10px', 
                        color: hovered ? '#94a3b8' : 'rgba(255,255,255,0.6)', 
                        fontFamily: 'monospace',
                        marginBottom: hovered ? '0' : '4px',
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                    }}>
                        {data.date}
                    </div>
                    
                    <div style={{ 
                        fontSize: hovered ? '16px' : '14px', 
                        fontWeight: '700', 
                        color: '#fff',
                        whiteSpace: 'nowrap', // CRITICAL FIX: Prevent vertical text
                        textShadow: `0 0 15px ${color}`,
                        letterSpacing: '-0.5px'
                    }}>
                        {data.title}
                    </div>

                    {/* Animated Detail Reveal */}
                    <div style={{ 
                        height: hovered ? 'auto' : '0', 
                        overflow: 'hidden', 
                        opacity: hovered ? 1 : 0, 
                        transition: 'opacity 0.2s',
                        fontSize: '12px',
                        color: '#cbd5e1',
                        whiteSpace: 'nowrap'
                    }}>
                        {data.desc}
                    </div>
                </div>
            </Html>
        </group>
    );
};

// Smoke Path Generator (Rising Sine Wave)
const generateSmokePath = (count) => {
    const points = [];
    // Start from the lamp spout (Adjusted for larger, lower lamp)
    // Lamp is at y=-6, scale 1.4. Spout is approx at x=2.1, y=-5.5
    points.push(new THREE.Vector3(2.2, -5.2, 0)); 
    
    for (let i = 0; i < count; i++) {
        const t = i / (count - 1);
        const y = -5.2 + (t * 12); 
        const x = 2.2 + Math.sin(t * Math.PI * 4) * 2 - (t * 1); 
        const z = Math.cos(t * Math.PI * 3) * 1.5 - (t * 2); 
        points.push(new THREE.Vector3(x, y, z));
    }
    return new THREE.CatmullRomCurve3(points);
};

const MagicLamp = () => {
    return (
        // Enlarge (scale 1.4) and Move Down (y=-6)
        <group position={[0, -6, 0]} scale={1.4}>
            <group rotation={[0.2, 0.5, 0]}> {/* Slight tilt for better angle */}
                
                {/* 1. Lamp Body (Flattened Sphere) */}
                <mesh position={[0, 0, 0]} scale={[1.8, 0.8, 1.2]}>
                    <sphereGeometry args={[1, 32, 32]} />
                    <meshStandardMaterial 
                        color="#FFD700" // Real Gold
                        metalness={1}
                        roughness={0.15}
                        envMapIntensity={2}
                    />
                </mesh>

                {/* 2. Base (Stand) */}
                <mesh position={[0, -0.7, 0]}>
                    <cylinderGeometry args={[0.6, 0.8, 0.2, 32]} />
                    <meshStandardMaterial color="#E6C200" metalness={1} roughness={0.2} />
                </mesh>

                {/* 3. Spout (Curved Cone - approximated) */}
                <group position={[1.5, 0.3, 0]} rotation={[0, 0, -0.5]}>
                    <mesh>
                        <coneGeometry args={[0.3, 2, 32, 1, true]} />
                        <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.15} side={THREE.DoubleSide} />
                    </mesh>
                    {/* Spout Opening Glow */}
                    <pointLight position={[0, 1.2, 0]} color="#a855f7" intensity={8} distance={3} />
                </group>

                {/* 4. Handle (Torus) */}
                <mesh position={[-1.6, 0.2, 0]} rotation={[0, 0, -0.5]}>
                    <torusGeometry args={[0.6, 0.15, 16, 32, Math.PI * 1.5]} />
                    <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.15} />
                </mesh>

                {/* 5. Lid */}
                <mesh position={[0, 0.8, 0]}>
                    <cylinderGeometry args={[0.4, 0.6, 0.3, 32]} />
                    <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.15} />
                </mesh>
            </group>
        </group>
    );
};

const SmokePlume = ({ curve }) => {
    // Generate clouds along the path
    const cloudPositions = useMemo(() => curve.getPoints(15), [curve]);
    
    return (
        <group>
            {/* 1. The Core Stream */}
            <Tube args={[curve, 64, 0.4, 16, false]}>
                <meshStandardMaterial 
                    color="#8b5cf6" 
                    transparent 
                    opacity={0.3} 
                    roughness={1}
                    emissive="#6d28d9"
                    emissiveIntensity={0.5}
                />
            </Tube>

            {/* 2. Billowing Smoke Clouds */}
            {cloudPositions.map((pos, i) => (
                <group key={i} position={pos}>
                    <Cloud 
                        args={[1, 1]} 
                        opacity={0.2} 
                        speed={0.1} // Slow movement
                        width={2.5} 
                        depth={1} 
                        segments={10} 
                        color={i % 2 === 0 ? "#c084fc" : "#e879f9"} 
                    />
                </group>
            ))}
        </group>
    );
};

const AlgorithmSkillTree = () => {
    const curve = useMemo(() => generateSmokePath(journeyData.length), []);
    // Sample points exactly where the data nodes should be
    const points = useMemo(() => {
        return journeyData.map((_, i) => curve.getPointAt(i / (journeyData.length - 1)));
    }, [curve]);

    return (
        <div style={{ width: '100%', height: '600px', borderRadius: '16px', overflow: 'hidden', boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5)' }}>
            <Canvas camera={{ position: [0, 0, 25], fov: 50 }} gl={{ toneMappingExposure: 1.2 }}>
                {/* 1. Deep Magical Atmosphere */}
                <color attach="background" args={['#1e1b4b']} /> 
                <fog attach="fog" args={['#1e1b4b', 8, 30]} />
                
                {/* 2. Cinematic Lighting - Brightened */}
                <ambientLight intensity={0.8} /> {/* Much brighter base */}
                <spotLight position={[5, 5, 10]} angle={0.6} penumbra={0.5} intensity={3} color="#fff" /> {/* Main key light */}
                <pointLight position={[-5, 0, 5]} intensity={2} color="#a855f7" /> {/* Fill light */}

                {/* 3. Main Scene - Scaled to fit */}
                <group position={[0, 0, 0]} scale={0.5}>
                    <MagicLamp />
                    <SmokePlume curve={curve} />
                    
                    {journeyData.map((item, i) => (
                        <NebulaNode 
                            key={i} 
                            position={points[i]} 
                            data={item} 
                        />
                    ))}
                </group>

                {/* 4. Effects */}
                <Sparkles count={200} scale={[10, 15, 10]} size={4} speed={0.4} opacity={0.6} color="#fbbf24" position={[0, 0, 0]} />
                
                <EffectComposer disableNormalPass>
                    <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.8} radius={0.5} />
                </EffectComposer>

                {/* 5. Controls */}
                <OrbitControls 
                    enableZoom={true} 
                    enablePan={true} // Enabled panning for map navigation
                    autoRotate
                    autoRotateSpeed={0.5}
                    maxDistance={25}
                    minDistance={5}
                    target={[0, 2, 0]} 
                />
            </Canvas>
        </div>
    );
};

export default AlgorithmSkillTree;
