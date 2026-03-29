import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

// Initialize once
mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    primaryColor: '#6366f1', // Indigo
    primaryTextColor: '#fff',
    primaryBorderColor: '#4f46e5',
    lineColor: '#94a3b8',
    secondaryColor: '#f472b6', // Pink
    tertiaryColor: '#38bdf8', // Sky
    fontFamily: 'Inter, sans-serif',
    fontSize: '12px',
  },
  securityLevel: 'loose',
});

interface MermaidDiagramProps {
  chart: string;
}

export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderDiagram = async () => {
      if (containerRef.current) {
        try {
          // Generate a unique ID for this instance
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          const { svg } = await mermaid.render(id, chart);
          containerRef.current.innerHTML = svg;
        } catch (error) {
          console.error("Mermaid render error:", error);
          containerRef.current.innerHTML = `<p class="text-red-500">Error rendering diagram</p>`;
        }
      }
    };
    renderDiagram();
  }, [chart]);

  return <div ref={containerRef} className="flex justify-center items-center p-4" />;
}
