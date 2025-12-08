import React, { useMemo } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import { useAuth } from '../context/AuthContext';

const AlgorithmGraph = ({ data }) => {
    // Mock data for the graph if no real data is processed yet
    // In a real scenario, we would process 'data' (user history) to build this graph
    const graphData = useMemo(() => {
        const nodes = [
            { id: 'Algorithm', group: 1, val: 20 },
            { id: 'Graph', group: 2, val: 10 },
            { id: 'BFS', group: 2, val: 5 },
            { id: 'DFS', group: 2, val: 5 },
            { id: 'Dijsktra', group: 2, val: 5 },
            { id: 'DP', group: 3, val: 10 },
            { id: 'Knapsack', group: 3, val: 5 },
            { id: 'LCS', group: 3, val: 5 },
            { id: 'Greedy', group: 4, val: 10 },
            { id: 'Sorting', group: 5, val: 10 },
            { id: 'Quick Sort', group: 5, val: 5 },
            { id: 'Merge Sort', group: 5, val: 5 },
            { id: 'Implementation', group: 6, val: 15 },
        ];

        const links = [
            { source: 'Algorithm', target: 'Graph' },
            { source: 'Graph', target: 'BFS' },
            { source: 'Graph', target: 'DFS' },
            { source: 'Graph', target: 'Dijsktra' },
            { source: 'Algorithm', target: 'DP' },
            { source: 'DP', target: 'Knapsack' },
            { source: 'DP', target: 'LCS' },
            { source: 'Algorithm', target: 'Greedy' },
            { source: 'Algorithm', target: 'Sorting' },
            { source: 'Sorting', target: 'Quick Sort' },
            { source: 'Sorting', target: 'Merge Sort' },
            { source: 'Algorithm', target: 'Implementation' },
        ];

        return { nodes, links };
    }, []);

    const containerRef = React.useRef(null);
    const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

    React.useEffect(() => {
        if (!containerRef.current) return;

        const observeTarget = containerRef.current;
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                setDimensions({ width, height });
            }
        });

        resizeObserver.observe(observeTarget);

        return () => {
            resizeObserver.unobserve(observeTarget);
        };
    }, []);

    return (
        <div ref={containerRef} style={{ height: '500px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #334155' }}>
            {dimensions.width > 0 && (
                <ForceGraph3D
                    graphData={graphData}
                    nodeLabel="id"
                    nodeColor={node => {
                        const colors = ['#f472b6', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#6366f1'];
                        return colors[node.group % colors.length];
                    }}
                    nodeVal={node => node.val}
                    linkColor={() => '#475569'}
                backgroundColor="rgba(0,0,0,0)"
                    linkWidth={1}
                    linkOpacity={0.5}
                    controlPointerInteraction={true} // Enable mouse interaction
                    width={dimensions.width}
                    height={dimensions.height}
                />
            )}
        </div>
    );
};

export default AlgorithmGraph;
