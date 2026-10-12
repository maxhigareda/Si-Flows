import React from 'react';
import { FlowNode, Point } from '../types';
import { getDiagramBoundingBox } from '../utils/export';

interface MinimapProps {
  nodes: FlowNode[];
  pan: Point;
  zoom: number;
  viewportWidth: number;
  viewportHeight: number;
  onNavigate: (pan: Point) => void;
}

export const Minimap: React.FC<MinimapProps> = ({
  nodes,
  pan,
  zoom,
  viewportWidth,
  viewportHeight,
  onNavigate
}) => {
  const mapW = 180;
  const mapH = 120;

  const bbox = getDiagramBoundingBox(nodes);
  const scaleX = mapW / Math.max(bbox.width, 1000);
  const scaleY = mapH / Math.max(bbox.height, 800);
  const scale = Math.min(scaleX, scaleY);

  // Viewport box in minimap coords
  const vpX = (-pan.x / zoom - bbox.minX) * scale;
  const vpY = (-pan.y / zoom - bbox.minY) * scale;
  const vpW = (viewportWidth / zoom) * scale;
  const vpH = (viewportHeight / zoom) * scale;

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const targetCanvasX = clickX / scale + bbox.minX;
    const targetCanvasY = clickY / scale + bbox.minY;

    onNavigate({
      x: viewportWidth / 2 - targetCanvasX * zoom,
      y: viewportHeight / 2 - targetCanvasY * zoom
    });
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: mapW,
        height: mapH,
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 8,
        boxShadow: 'var(--shadow-md)',
        overflow: 'hidden',
        pointerEvents: 'all'
      }}
    >
      <svg
        width={mapW}
        height={mapH}
        style={{ cursor: 'pointer' }}
        onClick={handleClick}
      >
        <rect width="100%" height="100%" fill="var(--bg-app)" />

        {/* Nodes representations */}
        {nodes.map((n) => {
          const nx = (n.x - bbox.minX) * scale;
          const ny = (n.y - bbox.minY) * scale;
          const nw = Math.max(2, n.width * scale);
          const nh = Math.max(2, n.height * scale);

          return (
            <rect
              key={n.id}
              x={nx}
              y={ny}
              width={nw}
              height={nh}
              rx={2}
              fill={n.style.strokeColor || '#3b82f6'}
              opacity={0.7}
            />
          );
        })}

        {/* Viewport Indicator */}
        <rect
          x={vpX}
          y={vpY}
          width={vpW}
          height={vpH}
          fill="rgba(59, 130, 246, 0.15)"
          stroke="var(--accent-primary)"
          strokeWidth={1.5}
        />
      </svg>
    </div>
  );
};
