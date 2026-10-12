import React, { useRef, useState, useEffect, useCallback } from 'react';
import { FlowNode, FlowConnection, Point, PortPosition, ConnectorType } from '../types';
import { ShapeSvg } from './ShapeSvg';
import { getNodePortPosition, getConnectorPath, snapToGrid } from '../utils/geometry';

interface CanvasProps {
  nodes: FlowNode[];
  connections: FlowConnection[];
  selectedNodeIds: string[];
  selectedConnectionId: string | null;
  zoom: number;
  pan: Point;
  snapGrid: boolean;
  onUpdateNodes: (nodes: FlowNode[]) => void;
  onUpdateConnections: (connections: FlowConnection[]) => void;
  onSelectNode: (id: string, multi?: boolean) => void;
  onSelectConnection: (id: string | null) => void;
  onClearSelection: () => void;
  onPanChange: (pan: Point) => void;
  onZoomChange: (zoom: number) => void;
}

const PORTS: PortPosition[] = ['top', 'right', 'bottom', 'left'];

export const Canvas: React.FC<CanvasProps> = ({
  nodes,
  connections,
  selectedNodeIds,
  selectedConnectionId,
  zoom,
  pan,
  snapGrid,
  onUpdateNodes,
  onUpdateConnections,
  onSelectNode,
  onSelectConnection,
  onClearSelection,
  onPanChange,
  onZoomChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Interaction States
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point>({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Dragging Nodes
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });

  // Resizing Node
  const [resizingNodeId, setResizingNodeId] = useState<string | null>(null);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number; w: number; h: number }>({
    x: 0,
    y: 0,
    w: 0,
    h: 0
  });

  // Connecting
  const [connectingFrom, setConnectingFrom] = useState<{
    nodeId: string;
    port: PortPosition;
  } | null>(null);
  const [connectingCurrentPos, setConnectingCurrentPos] = useState<Point | null>(null);
  const [hoveredPort, setHoveredPort] = useState<{ nodeId: string; port: PortPosition } | null>(
    null
  );

  // Inline editing
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

  // Marquee Selection
  const [marqueeStart, setMarqueeStart] = useState<Point | null>(null);
  const [marqueeEnd, setMarqueeEnd] = useState<Point | null>(null);

  // Convert screen coords to canvas coords
  const screenToCanvas = useCallback(
    (screenX: number, screenY: number): Point => {
      if (!containerRef.current) return { x: screenX, y: screenY };
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = screenX - rect.left;
      const clientY = screenY - rect.top;
      return {
        x: (clientX - pan.x) / zoom,
        y: (clientY - pan.y) / zoom
      };
    },
    [pan, zoom]
  );

  // Keyboard Space listener for quick Panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !editingNodeId && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [editingNodeId]);

  // Handle Zoom via Wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const zoomFactor = 1.1;
    const delta = e.deltaY < 0 ? zoomFactor : 1 / zoomFactor;
    const newZoom = Math.min(3.0, Math.max(0.2, zoom * delta));

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newPanX = mouseX - (mouseX - pan.x) * (newZoom / zoom);
    const newPanY = mouseY - (mouseY - pan.y) * (newZoom / zoom);

    onZoomChange(newZoom);
    onPanChange({ x: newPanX, y: newPanY });
  };

  // Canvas Mouse Down
  const handleMouseDown = (e: React.MouseEvent) => {
    // If middle button or space is pressed, initiate pan
    if (e.button === 1 || isSpacePressed) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (e.button === 0 && e.target === containerRef.current || (e.target as HTMLElement).id === 'canvas-grid-bg') {
      onClearSelection();
      setEditingNodeId(null);
      // Start marquee selection
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      setMarqueeStart(canvasPos);
      setMarqueeEnd(canvasPos);
    }
  };

  // Node Mouse Down
  const handleNodeMouseDown = (e: React.MouseEvent, node: FlowNode) => {
    e.stopPropagation();
    if (isSpacePressed) return;

    if (!selectedNodeIds.includes(node.id)) {
      onSelectNode(node.id, e.shiftKey || e.metaKey || e.ctrlKey);
    }

    const canvasPos = screenToCanvas(e.clientX, e.clientY);
    setDraggingNodeId(node.id);
    setDragOffset({
      x: canvasPos.x - node.x,
      y: canvasPos.y - node.y
    });
  };

  // Resize Handle Mouse Down
  const handleResizeMouseDown = (
    e: React.MouseEvent,
    node: FlowNode,
    handle: string
  ) => {
    e.stopPropagation();
    setResizingNodeId(node.id);
    setResizeHandle(handle);
    setResizeStart({ x: node.x, y: node.y, w: node.width, h: node.height });
  };

  // Connection Port Mouse Down
  const handlePortMouseDown = (
    e: React.MouseEvent,
    nodeId: string,
    port: PortPosition
  ) => {
    e.stopPropagation();
    setConnectingFrom({ nodeId, port });
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      setConnectingCurrentPos(getNodePortPosition(node, port));
    }
  };

  // Global Mouse Move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      onPanChange({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
      return;
    }

    const canvasPos = screenToCanvas(e.clientX, e.clientY);

    // Marquee Selection in progress
    if (marqueeStart) {
      setMarqueeEnd(canvasPos);
      return;
    }

    // Creating connection wire
    if (connectingFrom) {
      setConnectingCurrentPos(canvasPos);
      return;
    }

    // Dragging selected node(s)
    if (draggingNodeId) {
      const activeNode = nodes.find((n) => n.id === draggingNodeId);
      if (!activeNode) return;

      let newX = canvasPos.x - dragOffset.x;
      let newY = canvasPos.y - dragOffset.y;

      if (snapGrid) {
        newX = snapToGrid(newX);
        newY = snapToGrid(newY);
      }

      const deltaX = newX - activeNode.x;
      const deltaY = newY - activeNode.y;

      if (deltaX !== 0 || deltaY !== 0) {
        const updated = nodes.map((n) => {
          if (selectedNodeIds.includes(n.id)) {
            return {
              ...n,
              x: n.x + deltaX,
              y: n.y + deltaY
            };
          }
          return n;
        });
        onUpdateNodes(updated);
      }
      return;
    }

    // Resizing Node
    if (resizingNodeId && resizeHandle) {
      const node = nodes.find((n) => n.id === resizingNodeId);
      if (!node) return;

      let newX = node.x;
      let newY = node.y;
      let newW = node.width;
      let newH = node.height;

      const minW = 60;
      const minH = 40;

      if (resizeHandle.includes('e')) {
        newW = Math.max(minW, canvasPos.x - node.x);
      }
      if (resizeHandle.includes('s')) {
        newH = Math.max(minH, canvasPos.y - node.y);
      }
      if (resizeHandle.includes('w')) {
        const potentialW = resizeStart.w + (resizeStart.x - canvasPos.x);
        if (potentialW >= minW) {
          newX = canvasPos.x;
          newW = potentialW;
        }
      }
      if (resizeHandle.includes('n')) {
        const potentialH = resizeStart.h + (resizeStart.y - canvasPos.y);
        if (potentialH >= minH) {
          newY = canvasPos.y;
          newH = potentialH;
        }
      }

      if (snapGrid) {
        newW = snapToGrid(newW);
        newH = snapToGrid(newH);
      }

      onUpdateNodes(
        nodes.map((n) =>
          n.id === resizingNodeId
            ? { ...n, x: newX, y: newY, width: newW, height: newH }
            : n
        )
      );
    }
  };

  // Global Mouse Up
  const handleMouseUp = (e: React.MouseEvent) => {
    setIsPanning(false);
    setDraggingNodeId(null);
    setResizingNodeId(null);
    setResizeHandle(null);

    // Finalize Marquee
    if (marqueeStart && marqueeEnd) {
      const x1 = Math.min(marqueeStart.x, marqueeEnd.x);
      const y1 = Math.min(marqueeStart.y, marqueeEnd.y);
      const x2 = Math.max(marqueeStart.x, marqueeEnd.x);
      const y2 = Math.max(marqueeStart.y, marqueeEnd.y);

      const inside = nodes.filter(
        (n) => n.x >= x1 && n.x + n.width <= x2 && n.y >= y1 && n.y + n.height <= y2
      );
      if (inside.length > 0) {
        inside.forEach((n) => onSelectNode(n.id, true));
      }
      setMarqueeStart(null);
      setMarqueeEnd(null);
    }

    // Finalize Connection
    if (connectingFrom) {
      if (hoveredPort && hoveredPort.nodeId !== connectingFrom.nodeId) {
        // Create new connection!
        const newConn: FlowConnection = {
          id: `conn-${Date.now()}`,
          fromNodeId: connectingFrom.nodeId,
          fromPort: connectingFrom.port,
          toNodeId: hoveredPort.nodeId,
          toPort: hoveredPort.port,
          type: 'orthogonal',
          strokeColor: '#3b82f6',
          strokeWidth: 2,
          strokeStyle: 'solid',
          arrowEnd: true,
          arrowStart: false
        };
        onUpdateConnections([...connections, newConn]);
        onSelectConnection(newConn.id);
      }
      setConnectingFrom(null);
      setConnectingCurrentPos(null);
    }
  };

  // Handle Drag Over & Drop from ShapePalette
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dataStr = e.dataTransfer.getData('application/siflow-shape');
    if (!dataStr) return;

    try {
      const item = JSON.parse(dataStr);
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      let posX = canvasPos.x - item.defaultWidth / 2;
      let posY = canvasPos.y - item.defaultHeight / 2;

      if (snapGrid) {
        posX = snapToGrid(posX);
        posY = snapToGrid(posY);
      }

      const newNode: FlowNode = {
        id: `node-${Date.now()}`,
        type: item.type,
        x: posX,
        y: posY,
        width: item.defaultWidth,
        height: item.defaultHeight,
        label: item.defaultText,
        style: {
          fillColor: item.defaultFill,
          strokeColor: item.defaultStroke,
          strokeWidth: 2,
          strokeStyle: 'solid',
          textColor: '#0f172a',
          fontSize: 13,
          fontWeight: 'normal',
          textAlign: 'center',
          opacity: 1
        }
      };

      onUpdateNodes([...nodes, newNode]);
      onSelectNode(newNode.id);
    } catch (err) {
      console.error('Error on drop:', err);
    }
  };

  // Determine cursor
  const getCursor = () => {
    if (isPanning) return 'grabbing';
    if (isSpacePressed) return 'grab';
    if (connectingFrom) return 'crosshair';
    return 'default';
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        cursor: getCursor(),
        backgroundColor: 'var(--bg-canvas)'
      }}
    >
      {/* Background SVG Grid and Render Layer */}
      <svg
        id="canvas-grid-bg"
        ref={svgRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'all'
        }}
      >
        <defs>
          <pattern
            id="dot-grid"
            width={24 * zoom}
            height={24 * zoom}
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${pan.x}, ${pan.y})`}
          >
            <circle cx={1} cy={1} r={1.2} fill="var(--grid-dot-color)" />
          </pattern>
          {/* Arrowhead Marker */}
          <marker
            id="arrow-head"
            viewBox="0 0 10 10"
            refX={9}
            refY={5}
            markerWidth={6}
            markerHeight={6}
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#3b82f6" />
          </marker>
        </defs>

        {/* Grid Background Rectangle */}
        <rect width="100%" height="100%" fill="url(#dot-grid)" />

        {/* Zoomed & Panned Group */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* 1. Connections Lines */}
          {connections.map((conn) => {
            const fromNode = nodes.find((n) => n.id === conn.fromNodeId);
            const toNode = nodes.find((n) => n.id === conn.toNodeId);
            if (!fromNode || !toNode) return null;

            const startPoint = getNodePortPosition(fromNode, conn.fromPort);
            const endPoint = getNodePortPosition(toNode, conn.toPort);
            const { path, midPoint } = getConnectorPath(
              startPoint,
              endPoint,
              conn.type,
              conn.fromPort,
              conn.toPort
            );

            const isSelected = selectedConnectionId === conn.id;

            return (
              <g
                key={conn.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectConnection(conn.id);
                }}
                style={{ cursor: 'pointer' }}
              >
                {/* Thick invisible click boundary */}
                <path
                  d={path}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={14}
                  strokeLinecap="round"
                />

                {/* Visible Connector */}
                <path
                  d={path}
                  fill="none"
                  stroke={isSelected ? 'var(--accent-primary)' : conn.strokeColor}
                  strokeWidth={isSelected ? conn.strokeWidth + 1.5 : conn.strokeWidth}
                  strokeDasharray={conn.strokeStyle === 'dashed' ? '5 5' : undefined}
                  markerEnd={conn.arrowEnd ? 'url(#arrow-head)' : undefined}
                />

                {/* Connection Label Badge */}
                {conn.label && (
                  <g transform={`translate(${midPoint.x}, ${midPoint.y})`}>
                    <rect
                      x={-(conn.label.length * 4.5 + 10)}
                      y={-12}
                      width={conn.label.length * 9 + 20}
                      height={24}
                      rx={6}
                      fill="var(--bg-surface)"
                      stroke={isSelected ? 'var(--accent-primary)' : 'var(--border-strong)'}
                      strokeWidth={1}
                    />
                    <text
                      textAnchor="middle"
                      y={4}
                      fontSize={11}
                      fontWeight="600"
                      fill="var(--text-primary)"
                    >
                      {conn.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* 2. Dynamic Wire during connection dragging */}
          {connectingFrom && connectingCurrentPos && (
            <g className="helper-element">
              {(() => {
                const sourceNode = nodes.find((n) => n.id === connectingFrom.nodeId);
                if (!sourceNode) return null;
                const startPoint = getNodePortPosition(sourceNode, connectingFrom.port);
                const { path } = getConnectorPath(
                  startPoint,
                  connectingCurrentPos,
                  'orthogonal',
                  connectingFrom.port
                );
                return (
                  <path
                    d={path}
                    fill="none"
                    stroke="var(--accent-primary)"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    markerEnd="url(#arrow-head)"
                  />
                );
              })()}
            </g>
          )}

          {/* 3. Render Nodes */}
          {nodes.map((node) => {
            const isSelected = selectedNodeIds.includes(node.id);

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onMouseDown={(e) => handleNodeMouseDown(e, node)}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditingNodeId(node.id);
                }}
                style={{ cursor: isSpacePressed ? 'grab' : 'move' }}
              >
                {/* SVG Shape Graphic */}
                <ShapeSvg node={node} />

                {/* Node Text Label */}
                {editingNodeId !== node.id ? (
                  <foreignObject
                    x={0}
                    y={0}
                    width={node.width}
                    height={node.height}
                    style={{ pointerEvents: 'none' }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent:
                          node.style.textAlign === 'left'
                            ? 'flex-start'
                            : node.style.textAlign === 'right'
                            ? 'flex-end'
                            : 'center',
                        textAlign: node.style.textAlign,
                        padding: '8px 12px',
                        color: node.style.textColor,
                        fontSize: node.style.fontSize,
                        fontWeight: node.style.fontWeight === 'bold' ? 700 : 500,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        overflow: 'hidden',
                        lineHeight: 1.25
                      }}
                    >
                      {node.label}
                    </div>
                  </foreignObject>
                ) : (
                  <foreignObject
                    x={4}
                    y={4}
                    width={node.width - 8}
                    height={node.height - 8}
                  >
                    <textarea
                      autoFocus
                      defaultValue={node.label}
                      onBlur={(e) => {
                        onUpdateNodes(
                          nodes.map((n) =>
                            n.id === node.id ? { ...n, label: e.target.value } : n
                          )
                        );
                        setEditingNodeId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                          e.currentTarget.blur();
                        }
                      }}
                      style={{
                        width: '100%',
                        height: '100%',
                        border: '2px solid var(--accent-primary)',
                        borderRadius: 6,
                        backgroundColor: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        padding: '6px',
                        fontSize: node.style.fontSize,
                        fontFamily: 'inherit',
                        resize: 'none',
                        outline: 'none',
                        textAlign: node.style.textAlign
                      }}
                    />
                  </foreignObject>
                )}

                {/* Selected Node Bounding Outline & Resize Handles */}
                {isSelected && (
                  <g className="helper-element" style={{ pointerEvents: 'all' }}>
                    <rect
                      x={-4}
                      y={-4}
                      width={node.width + 8}
                      height={node.height + 8}
                      fill="none"
                      stroke="var(--accent-primary)"
                      strokeWidth={1.5}
                      strokeDasharray="4 3"
                    />

                    {/* Resize Handles */}
                    {['nw', 'ne', 'se', 'sw'].map((handle) => {
                      const hx = handle.includes('e') ? node.width + 4 : -4;
                      const hy = handle.includes('s') ? node.height + 4 : -4;
                      return (
                        <circle
                          key={handle}
                          cx={hx}
                          cy={hy}
                          r={4.5}
                          fill="var(--bg-surface)"
                          stroke="var(--accent-primary)"
                          strokeWidth={2}
                          style={{ cursor: `${handle}-resize` }}
                          onMouseDown={(e) => handleResizeMouseDown(e, node, handle)}
                        />
                      );
                    })}
                  </g>
                )}

                {/* Connection Anchor Ports */}
                {PORTS.map((port) => {
                  let px = 0;
                  let py = 0;
                  switch (port) {
                    case 'top':
                      px = node.width / 2;
                      py = 0;
                      break;
                    case 'right':
                      px = node.width;
                      py = node.height / 2;
                      break;
                    case 'bottom':
                      px = node.width / 2;
                      py = node.height;
                      break;
                    case 'left':
                      px = 0;
                      py = node.height / 2;
                      break;
                  }

                  const isHovered =
                    hoveredPort?.nodeId === node.id && hoveredPort.port === port;

                  return (
                    <circle
                      key={port}
                      cx={px}
                      cy={py}
                      r={isHovered ? 6 : 4}
                      fill={isHovered ? 'var(--port-hover)' : 'var(--port-color)'}
                      stroke="#ffffff"
                      strokeWidth={1.5}
                      opacity={isSelected || connectingFrom ? 1 : 0.4}
                      style={{
                        cursor: 'crosshair',
                        transition: 'r 0.15s ease, opacity 0.15s ease'
                      }}
                      onMouseEnter={() => setHoveredPort({ nodeId: node.id, port })}
                      onMouseLeave={() => setHoveredPort(null)}
                      onMouseDown={(e) => handlePortMouseDown(e, node.id, port)}
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Marquee Box */}
          {marqueeStart && marqueeEnd && (
            <rect
              className="helper-element"
              x={Math.min(marqueeStart.x, marqueeEnd.x)}
              y={Math.min(marqueeStart.y, marqueeEnd.y)}
              width={Math.abs(marqueeEnd.x - marqueeStart.x)}
              height={Math.abs(marqueeEnd.y - marqueeStart.y)}
              fill="var(--selection-box-bg)"
              stroke="var(--selection-box-border)"
              strokeWidth={1}
              strokeDasharray="4 3"
            />
          )}
        </g>
      </svg>
    </div>
  );
};
