import React, { useMemo, useState, useEffect, useRef } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import SynapseGraph from './SynapseGraph';

const GraphShowcase = () => {
    const [mode, setMode] = useState('Synapse');
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const fgRef = useRef();

    // Resize Observer
    useEffect(() => {
        if (!containerRef.current) return;
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                setDimensions({ width, height });
            }
        });
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, [mode]); // Re-bind on mode change if needed, though ref should be stable

    // 1. Base Data
    const baseData = useMemo(() => {
        const nodes = [
            { id: 'Algorithm', group: 1, val: 30 },
            { id: 'Graph', group: 2, val: 15 },
            { id: 'BFS', group: 2, val: 10 },
            { id: 'DFS', group: 2, val: 10 },
            { id: 'Dijsktra', group: 2, val: 10 },
            { id: 'DP', group: 3, val: 15 },
            { id: 'Knapsack', group: 3, val: 10 },
            { id: 'LCS', group: 3, val: 10 },
            { id: 'Greedy', group: 4, val: 15 },
            { id: 'Sorting', group: 5, val: 15 },
            { id: 'Quick Sort', group: 5, val: 10 },
            { id: 'Merge Sort', group: 5, val: 10 },
            { id: 'Implementation', group: 6, val: 20 },
            { id: 'Stack', group: 7, val: 10 },
            { id: 'Queue', group: 7, val: 10 },
            { id: 'Heap', group: 7, val: 12 },
            { id: 'Tree', group: 2, val: 12 },
            { id: 'Binary Search', group: 6, val: 10 },
        ];

        const links = [
            { source: 'Algorithm', target: 'Graph' },
            { source: 'Graph', target: 'BFS' },
            { source: 'Graph', target: 'DFS' },
            { source: 'Graph', target: 'Dijsktra' },
            { source: 'Graph', target: 'Tree' },
            { source: 'Tree', target: 'Heap' },
            { source: 'Algorithm', target: 'DP' },
            { source: 'DP', target: 'Knapsack' },
            { source: 'DP', target: 'LCS' },
            { source: 'Algorithm', target: 'Greedy' },
            { source: 'Algorithm', target: 'Sorting' },
            { source: 'Sorting', target: 'Quick Sort' },
            { source: 'Sorting', target: 'Merge Sort' },
            { source: 'Algorithm', target: 'Implementation' },
            { source: 'Implementation', target: 'Stack' },
            { source: 'Implementation', target: 'Queue' },
            { source: 'Implementation', target: 'Binary Search' },
        ];
        return { nodes: JSON.parse(JSON.stringify(nodes)), links: JSON.parse(JSON.stringify(links)) };
    }, []); 

    // 2. Transformed Data based on Mode
    const graphData = useMemo(() => {
        const data = JSON.parse(JSON.stringify(baseData)); 
        const { nodes } = data;

        if (mode === 'Tunnel') {
            nodes.forEach((node, i) => {
                const angle = 0.5 * i;
                const radius = 100;
                node.fx = radius * Math.cos(angle);
                node.fy = radius * Math.sin(angle);
                node.fz = i * 20 - (nodes.length * 10);
            });
        } else if (mode === 'Sphere') {
            nodes.forEach((node, i) => {
                const phi = Math.acos(-1 + (2 * i) / nodes.length);
                const theta = Math.sqrt(nodes.length * Math.PI) * phi;
                const r = 150;
                node.fx = r * Math.cos(theta) * Math.sin(phi);
                node.fy = r * Math.sin(theta) * Math.sin(phi);
                node.fz = r * Math.cos(phi);
            });
        } else if (mode === 'Grid') {
            const size = Math.ceil(Math.pow(nodes.length, 1/3));
            const gap = 80;
            nodes.forEach((node, i) => {
                node.fx = (i % size) * gap - (size * gap) / 2;
                node.fy = (Math.floor(i / size) % size) * gap - (size * gap) / 2;
                node.fz = Math.floor(i / (size * size)) * gap - (size * gap) / 2;
            });
        }
        return data;
    }, [baseData, mode]);

    const renderControls = () => (
        <div style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            zIndex: 10,
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap'
        }}>
            {['Galaxy', 'Tree', 'Tunnel', 'Sphere', 'Grid', 'Synapse'].map(m => (
                <button
                    key={m}
                    onClick={() => setMode(m)}
                    style={{
                        background: mode === m ? '#60a5fa' : 'rgba(255,255,255,0.1)',
                        color: mode === m ? '#fff' : '#94a3b8',
                        border: '1px solid rgba(255,255,255,0.2)',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        backdropFilter: 'blur(4px)',
                        transition: 'all 0.2s',
                        boxShadow: mode === m ? '0 0 15px rgba(96, 165, 250, 0.5)' : 'none'
                    }}
                >
                    {m}
                </button>
            ))}
        </div>
    );

    if (mode === 'Synapse') {
        return (
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                {renderControls()}
                <SynapseGraph />
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {renderControls()}
            
            <div ref={containerRef} style={{ height: '600px', width: '100%', borderRadius: '12px', overflow: 'hidden', outline: 'none' }}>
                {dimensions.width > 0 && (
                    <ForceGraph3D
                        ref={fgRef}
                        graphData={graphData}
                        width={dimensions.width}
                        height={dimensions.height}
                        
                        // Node Styling
                        nodeLabel="id"
                        nodeResolution={24}
                        nodeColor={node => {
                            const colors = ['#f472b6', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#6366f1'];
                            return colors[(node.group || 0) % colors.length];
                        }}
                        nodeVal={node => node.val}
                        nodeOpacity={0.9}
                        
                        // Link Styling
                        linkColor={() => '#60a5fa'}
                        linkOpacity={0.2}
                        linkWidth={1}
                        linkDirectionalParticles={mode === 'Tunnel' ? 4 : 2}
                        linkDirectionalParticleWidth={2}
                        linkDirectionalParticleSpeed={0.005}

                        // Background & Environment
                        backgroundColor="rgba(0,0,0,0)"
                        showNavInfo={false}
                        
                        // DAG Mode for Tree
                        dagMode={mode === 'Tree' ? 'td' : null}
                        dagLevelDistance={80}
                        
                        // Force Engine Config
                        cooldownTicks={100}
                        onEngineStop={() => {
                            if (mode === 'Galaxy') {
                                fgRef.current?.zoomToFit(400); 
                            }
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default GraphShowcase;
