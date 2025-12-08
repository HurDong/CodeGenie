import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Text, Float, Cloud, Sparkles, Html, Tube, Environment, CameraControls } from '@react-three/drei';
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

const NebulaNode = ({ position, data, isCurrent }) => {
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
            // Pulse animation - Faster and more pronounced if current
            const t = state.clock.elapsedTime;
            const scaleBase = isCurrent ? 1.2 : 1;
            const pulseSpeed = isCurrent ? 4 : 2;
            const pulseAmp = isCurrent ? 0.1 : 0.05;
            
            group.current.scale.setScalar(scaleBase + Math.sin(t * pulseSpeed) * pulseAmp);
            group.current.rotation.z = t * 0.2;
        }
    });

    return (
        <group position={position}>
            <group ref={group}>
                {/* 1. Core Star (Bright Center) */}
                <mesh onPointerOver={(e) => { e.stopPropagation(); setHover(true); }} onPointerOut={() => setHover(false)}>
                    <sphereGeometry args={[isCurrent ? 0.5 : 0.4, 32, 32]} /> {/* Increased Size */}
                    <meshStandardMaterial 
                        color="white"
                        emissive={color}
                        emissiveIntensity={isCurrent ? 4 : 2} // Brightened
                        toneMapped={false}
                        transparent
                        opacity={1}
                    />
                </mesh>

                {/* 2. Inner Glow Halo */}
                <mesh scale={[1.8, 1.8, 1.8]}>
                    <sphereGeometry args={[0.4, 32, 32]} />
                    <meshBasicMaterial 
                        color={color} 
                        transparent 
                        opacity={0.4} 
                        depthWrite={false} 
                    />
                </mesh>

                {/* 3. Outer Nebula Haze */}
                <mesh scale={[3, 3, 3]}>
                    <sphereGeometry args={[0.4, 32, 32]} />
                    <meshBasicMaterial 
                        color={color} 
                        transparent 
                        opacity={0.15} 
                        depthWrite={false} 
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>
            </group>

            {/* Premium HTML Tooltip - Always visible if current or hovered */}
            <Html 
                position={[0, isCurrent || hovered ? 2.5 : 2.0, 0]} 
                center 
                distanceFactor={20} 
                zIndexRange={[100, 0]} // Ensure proper depth sorting range
                style={{ 
                    pointerEvents: 'none', 
                    // CRITICAL FIX: drastic z-index difference to force overlap
                    zIndex: isCurrent || hovered ? 1000 : 10, 
                    width: 'max-content' 
                }}
            >
                <div style={{ 
                    background: isCurrent ? 'rgba(7, 10, 20, 0.95)' : 'rgba(15, 23, 42, 0.9)', 
                    backdropFilter: 'blur(8px)',
                    padding: isCurrent ? '16px 24px' : '12px 20px', 
                    borderRadius: '16px',
                    border: `2px solid ${color}`,
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    transform: isCurrent || hovered ? 'scale(1.1)' : 'scale(1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    minWidth: '200px', 
                    boxShadow: isCurrent ? `0 0 50px ${color}80, 0 0 20px ${color}40` : `0 0 20px ${color}40`
                }}>
                    <div style={{ 
                        fontSize: '14px', 
                        color: '#cbd5e1', 
                        fontFamily: 'sans-serif', 
                        fontWeight: '700',
                        letterSpacing: '1.5px',
                        textTransform: 'uppercase',
                        marginBottom: '2px'
                    }}>
                        {data.date}
                    </div>
                    
                    <div style={{ 
                        fontSize: '28px', 
                        fontWeight: '900', 
                        color: '#ffffff',
                        whiteSpace: 'nowrap',
                        textShadow: `0 0 20px ${color}`,
                        marginBottom: '4px',
                        letterSpacing: '-0.5px',
                        lineHeight: 1
                    }}>
                        {data.title}
                    </div>

                    <div style={{ 
                        fontSize: '16px', 
                        fontWeight: '600',
                        color: '#e2e8f0',
                        whiteSpace: 'nowrap',
                        opacity: 0.9,
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
    points.push(new THREE.Vector3(-3.5, -3, 0)); 
    
    for (let i = 0; i < count; i++) {
        const t = i / (count - 1);
        // Extend height significantly to separate nodes (was 45 -> 75)
        const y = -3 + (t * 75); 
        // Widen the spiral to prevent overlap (X: 5->8, Z: 4->6)
        const x = -3.5 - Math.sin(t * Math.PI * 3) * 8 + (t * 3); 
        const z = Math.cos(t * Math.PI * 2) * 6 - (t * 4); 
        points.push(new THREE.Vector3(x, y, z));
    }
    return new THREE.CatmullRomCurve3(points);
};


const MagicLamp = () => {
    return (
        // Enlarge (scale 2.5) and Move Down (y=-8) - Anchored at bottom
        <group position={[0, -8, 0]} scale={2.5}>
            <group rotation={[0.2, 0.5 + Math.PI, 0]}> {/* Flipped 180 degrees (approx) */}
                
                {/* 1. Lamp Body (Flattened Sphere) */}
                <mesh position={[0, 0, 0]} scale={[1.8, 0.8, 1.2]}>
                    <sphereGeometry args={[1, 64, 64]} />
                    <meshStandardMaterial 
                        color="#eaa300" // Richer Gold
                        metalness={0.9}
                        roughness={0.2}
                        envMapIntensity={1.5}
                    />
                </mesh>

                {/* 1.1 Decorative Band (Middle) */}
                <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[1.02, 0.05, 16, 100]} />
                    <meshStandardMaterial color="#fcd34d" metalness={1} roughness={0.1} emissive="#fbbf24" emissiveIntensity={0.2} />
                </mesh>

                {/* 2. Base (Stand) */}
                <mesh position={[0, -0.7, 0]}>
                    <cylinderGeometry args={[0.6, 0.8, 0.2, 32]} />
                    <meshStandardMaterial color="#b45309" metalness={0.8} roughness={0.3} />
                </mesh>

                {/* 3. Spout (Curved Cone - approximated) */}
                <group position={[1.5, 0.3, 0]} rotation={[0, 0, -0.5]}>
                    <mesh>
                        <coneGeometry args={[0.3, 2, 32, 1, true]} />
                        <meshStandardMaterial color="#eaa300" metalness={0.9} roughness={0.2} side={THREE.DoubleSide} />
                    </mesh>
                    {/* Spout Tip Ring */}
                    <mesh position={[0, 1, 0]}>
                        <torusGeometry args={[0.3, 0.05, 16, 32]} />
                        <meshStandardMaterial color="#b45309" metalness={1} roughness={0.2} />
                    </mesh>
                    {/* Spout Opening Glow */}
                    <pointLight position={[0, 1.2, 0]} color="#a855f7" intensity={10} distance={5} />
                </group>

                {/* 4. Handle (Torus) */}
                <mesh position={[-1.6, 0.2, 0]} rotation={[0, 0, -0.5]}>
                    <torusGeometry args={[0.6, 0.15, 16, 32, Math.PI * 1.5]} />
                    <meshStandardMaterial color="#b45309" metalness={0.8} roughness={0.3} /> {/* Darker Bronze Handle */}
                </mesh>

                {/* 5. Lid */}
                <mesh position={[0, 0.75, 0]}>
                    <cylinderGeometry args={[0.4, 0.6, 0.35, 32]} />
                    <meshStandardMaterial color="#eaa300" metalness={0.9} roughness={0.2} />
                </mesh>

                {/* 6. Ruby Gemstone on Lid */}
                <mesh position={[0, 1.0, 0]}>
                    <octahedronGeometry args={[0.25, 2]} />
                    <meshPhysicalMaterial 
                        color="#ef4444" 
                        roughness={0} 
                        transmission={0.6} 
                        thickness={1} 
                        emissive="#b91c1c"
                        emissiveIntensity={0.5}
                    />
                </mesh>
            </group>
        </group>
    );
};

const SmokePlume = ({ curve }) => {
    // Generate clouds along the path
    const cloudPositions = useMemo(() => curve.getPoints(12), [curve]);
    
    return (
        <group>
            {/* 1. The Core Stream */}
            <Tube args={[curve, 64, 0.8, 16, false]}> {/* Thicker stream */}
                <meshStandardMaterial 
                    color="#8b5cf6" 
                    transparent 
                    opacity={0.15} // Reduced opacity
                    roughness={1}
                    emissive="#6d28d9"
                    emissiveIntensity={0.2}
                />
            </Tube>

            {/* 2. Billowing Smoke Clouds - Larger and more dispersed */}
            {cloudPositions.map((pos, i) => (
                <group key={i} position={pos}>
                    <Cloud 
                        args={[1, 1]} 
                        opacity={0.1} // Reduced opacity
                        speed={0.1} // Slow movement
                        width={4} 
                        depth={2} 
                        segments={8} 
                        color={i % 2 === 0 ? "#c084fc" : "#e879f9"} 
                    />
                </group>
            ))}
        </group>
    );
};

// Component to handle side-effects for camera movement
const CameraLogic = ({ activeIndex, points, controlsRef }) => {
    useEffect(() => {
        if (!points || points.length === 0 || !controlsRef.current) return;
        
        const targetIndex = Math.min(activeIndex, points.length - 1);
        const targetPoint = points[targetIndex];

        // Cam Position: Offset relative to target
        const camX = targetPoint.x;
        const camY = targetPoint.y + 4;
        const camZ = targetPoint.z + 40;

        // Look At: The target node
        const lookX = targetPoint.x;
        const lookY = targetPoint.y;
        const lookZ = targetPoint.z;

        // Smoothly animate to new position
        // setLookAt(positionX, positionY, positionZ, targetX, targetY, targetZ, enableTransition)
        controlsRef.current.setLookAt(camX, camY, camZ, lookX, lookY, lookZ, true);

    }, [activeIndex, points]);   

    return null;
};

const AlgorithmSkillTree = () => {
    const [activeIndex, setActiveIndex] = useState(0); 
    const isAutoMoving = useRef(false); // Ref to track auto-movement state
    const cameraControlsRef = useRef();

    const curve = useMemo(() => generateSmokePath(journeyData.length), []);
    const points = useMemo(() => {
        return journeyData.map((_, i) => curve.getPointAt(i / (journeyData.length - 1)));
    }, [curve]);

    const handleNext = () => {
        setActiveIndex(prev => Math.min(prev + 1, journeyData.length - 1));
        isAutoMoving.current = true;
    };
    const handlePrev = () => {
        setActiveIndex(prev => Math.max(prev - 1, 0));
        isAutoMoving.current = true;
    };
    const handleStart = () => {
        setActiveIndex(0);
        isAutoMoving.current = true;
    };
    const handleEnd = () => {
        setActiveIndex(journeyData.length - 1);
        isAutoMoving.current = true;
    };

    // Keyboard Navigation Listener
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                handleNext();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                handlePrev();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeIndex]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '600px', borderRadius: '16px', overflow: 'hidden', boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5)', background: '#0f172a' }}>
            
            {/* UI Navigation Controls */}
            <div style={{
                position: 'absolute',
                bottom: '30px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 200,
                display: 'flex',
                gap: '12px',
                background: 'rgba(15, 23, 42, 0.8)',
                padding: '10px 20px',
                borderRadius: '30px',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <NavButton onClick={handleStart} disabled={activeIndex === 0} label="<<" />
                <NavButton onClick={handlePrev} disabled={activeIndex === 0} label="<" />
                
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    color: '#e2e8f0', 
                    fontFamily: 'monospace', 
                    fontSize: '14px',
                    margin: '0 10px'
                }}>
                    {activeIndex + 1} / {journeyData.length}
                </div>
                
                <NavButton onClick={handleNext} disabled={activeIndex === journeyData.length - 1} label=">" />
                <NavButton onClick={handleEnd} disabled={activeIndex === journeyData.length - 1} label=">>" />
            </div>

            <Canvas camera={{ position: [0, 0, 35], fov: 45 }} gl={{ toneMappingExposure: 1.2 }}>
                {/* 1. Deep Magical Atmosphere */}
                <color attach="background" args={['#0f172a']} /> 
                <fog attach="fog" args={['#0f172a', 15, 60]} />
                
                {/* 2. Cinematic Lighting - Brightened */}
                <ambientLight intensity={1.2} /> 
                <spotLight position={[10, 10, 20]} angle={0.5} penumbra={0.5} intensity={4} color="#fff" />
                <pointLight position={[-10, -5, 10]} intensity={3} color="#a855f7" /> 
                <Environment preset="city" /> 

                {/* 5. Controls - Robust CameraControls */}
                <CameraControls 
                    ref={cameraControlsRef}
                    minDistance={5}
                    maxDistance={100}
                    smoothTime={0.8} // Smooth transition
                />

                {/* Logic to drive camera */}
                <CameraLogic 
                    activeIndex={activeIndex} 
                    points={points} 
                    controlsRef={cameraControlsRef} 
                />

                {/* 3. Main Scene */}
                <group position={[0, 0, 0]}>
                    <MagicLamp />
                    <SmokePlume curve={curve} />
                    
                    {journeyData.map((item, i) => (
                        <NebulaNode 
                            key={i} 
                            position={points[i]} 
                            data={item} 
                            isCurrent={i === activeIndex}
                        />
                    ))}
                </group>

                {/* 4. Effects */}
                <Sparkles count={300} scale={[20, 25, 20]} size={6} speed={0.4} opacity={0.6} color="#fbbf24" number={100} />
                
                <EffectComposer disableNormalPass>
                    <Bloom luminanceThreshold={0.6} mipmapBlur intensity={1.5} radius={0.4} />
                </EffectComposer>
            </Canvas>
        </div>
    );
};

// Simple styled button component
const NavButton = ({ onClick, disabled, label }) => (
    <button 
        onClick={onClick} 
        disabled={disabled}
        style={{
            background: disabled ? 'transparent' : 'linear-gradient(135deg, #a855f7, #6366f1)',
            border: disabled ? '1px solid rgba(255,255,255,0.1)' : 'none',
            color: disabled ? '#64748b' : 'white',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.2s ease',
            boxShadow: disabled ? 'none' : '0 0 10px rgba(168, 85, 247, 0.4)'
        }}
    >
        {label}
    </button>
);

export default AlgorithmSkillTree;
