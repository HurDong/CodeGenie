import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, CameraShake } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as random from 'maath/random';

const ParticleNetwork = ({ count = 300, radius = 20 }) => {
    const points = useMemo(() => {
        return random.inSphere(new Float32Array(count * 3), { radius });
    }, [count, radius]);

    const lines = useMemo(() => {
        const lineData = [];
        // Create random connections mimicking neural pathways
        // This is a simplified "nearest neighbor" or random connectivity
        for (let i = 0; i < count; i++) {
            const startIdx = i * 3;
            // Connect to 2-3 random other points
            const connections = Math.floor(Math.random() * 3) + 1;
            for (let j = 0; j < connections; j++) {
                const target = Math.floor(Math.random() * count);
                if (target !== i) {
                    const endIdx = target * 3;
                    // Check distance to keep lines reasonable
                    const dx = points[startIdx] - points[endIdx];
                    const dy = points[startIdx + 1] - points[endIdx + 1];
                    const dz = points[startIdx + 2] - points[endIdx + 2];
                    const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
                    
                    if (dist < radius * 0.4) { // Only connect relatively close nodes
                        lineData.push(
                            points[startIdx], points[startIdx+1], points[startIdx+2],
                            points[endIdx], points[endIdx+1], points[endIdx+2]
                        );
                    }
                }
            }
        }
        return new Float32Array(lineData);
    }, [points, count, radius]);

    const group = useRef();
    
    useFrame((state) => {
        if (group.current) {
            // Slower, more organic rotation
            group.current.rotation.y = state.clock.getElapsedTime() * 0.03;
            group.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.03) * 0.05;
        }
    });

    return (
        <group ref={group}>
            {/* Neurons (Points) */}
            <points>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={points.length / 3}
                        array={points}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.6} // Larger glowing orbs
                    color="#60a5fa"
                    sizeAttenuation={true}
                    depthWrite={false}
                    transparent
                    opacity={0.8}
                />
            </points>

            {/* Axons (Lines) */}
            <lineSegments>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={lines.length / 3}
                        array={lines}
                        itemSize={3}
                    />
                </bufferGeometry>
                <lineBasicMaterial
                    color="#4f46e5"
                    transparent
                    opacity={0.15} // Very faint connections
                    depthWrite={false}
                />
            </lineSegments>
        </group>
    );
};

// Main Component
const SynapseGraph = () => {
    return (
        <div style={{ width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden' }}>
            <Canvas camera={{ position: [0, 0, 35], fov: 60 }} gl={{ alpha: true, antialias: false }}>
                <color attach="background" args={['#000000']} /> {/* Pure dark for bloom */}
                
                <ParticleNetwork count={400} radius={25} />
                
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                
                <EffectComposer multisampling={0}>
                    <Bloom 
                        luminanceThreshold={0.1} 
                        luminanceSmoothing={0.9} 
                        height={300} 
                        intensity={1.5} // Strong bloom for "synapse firing" look
                    />
                    <Vignette eskil={false} offset={0.1} darkness={1.1} />
                </EffectComposer>
                
                <OrbitControls 
                    enableZoom={true} 
                    enablePan={false} 
                    enableRotate={true} 
                    autoRotate={false} 
                    autoRotateSpeed={0.5} 
                    maxDistance={60} 
                    minDistance={10} 
                />
            </Canvas>
        </div>
    );
};

export default SynapseGraph;
