import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FlowNode, FlowConnection, Point, TemplateDefinition, DiagramProject } from './types';
import { TEMPLATES } from './utils/templates';
import { Header } from './components/Header';
import { ShapePalette, ShapeItem } from './components/ShapePalette';
import { Canvas } from './components/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { Minimap } from './components/Minimap';
import { TemplatesModal } from './components/TemplatesModal';
import { exportToPng, exportToSvg, saveToSiFlowFile, parseSiFlowFile, getDiagramBoundingBox } from './utils/export';

interface HistoryState {
  nodes: FlowNode[];
  connections: FlowConnection[];
}

export const App: React.FC = () => {
  // Theme
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Title
  const [title, setTitle] = useState('Diagrama de Procesos Store Intelligence');

  // Diagram Elements (start with the first template for an awesome initial experience)
  const [nodes, setNodes] = useState<FlowNode[]>(TEMPLATES[0].nodes);
  const [connections, setConnections] = useState<FlowConnection[]>(TEMPLATES[0].connections);

  // Selection
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);

  // Viewport
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Point>({ x: 80, y: 60 });
  const [snapGrid, setSnapGrid] = useState(true);

  // Modals
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);

  // History (Undo / Redo)
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [future, setFuture] = useState<HistoryState[]>([]);

  // Viewport measurement for minimap
  const [viewportDim, setViewportDim] = useState({ w: 1000, h: 700 });
  const mainAreaRef = useRef<HTMLDivElement>(null);

  // Sync theme attribute to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Window resize observer
  useEffect(() => {
    const updateDims = () => {
      if (mainAreaRef.current) {
        setViewportDim({
          w: mainAreaRef.current.clientWidth,
          h: mainAreaRef.current.clientHeight
        });
      }
    };
    updateDims();
    window.addEventListener('resize', updateDims);
    return () => window.removeEventListener('resize', updateDims);
  }, []);

  // Save snapshot to history
  const pushHistory = useCallback(
    (newNodes: FlowNode[], newConnections: FlowConnection[]) => {
      setHistory((prev) => [...prev.slice(-30), { nodes, connections }]);
      setFuture([]);
      setNodes(newNodes);
      setConnections(newConnections);
    },
    [nodes, connections]
  );

  // Undo / Redo
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setFuture((prev) => [{ nodes, connections }, ...prev]);
    setNodes(previous.nodes);
    setConnections(previous.connections);
    setSelectedNodeIds([]);
    setSelectedConnectionId(null);
  }, [history, nodes, connections]);

  const handleRedo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((prev) => prev.slice(1));
    setHistory((prev) => [...prev, { nodes, connections }]);
    setNodes(next.nodes);
    setConnections(next.connections);
    setSelectedNodeIds([]);
    setSelectedConnectionId(null);
  }, [future, nodes, connections]);

  // Selection handlers
  const handleSelectNode = (id: string, multi = false) => {
    setSelectedConnectionId(null);
    if (multi) {
      setSelectedNodeIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    } else {
      setSelectedNodeIds([id]);
    }
  };

  const handleSelectConnection = (id: string | null) => {
    setSelectedNodeIds([]);
    setSelectedConnectionId(id);
  };

  const handleClearSelection = () => {
    setSelectedNodeIds([]);
    setSelectedConnectionId(null);
  };

  // Node operations
  const handleUpdateNodes = (updated: FlowNode[]) => {
    pushHistory(updated, connections);
  };

  const handleUpdateConnections = (updated: FlowConnection[]) => {
    pushHistory(nodes, updated);
  };

  const handleUpdateSelectedNode = (partial: Partial<FlowNode>) => {
    if (selectedNodeIds.length === 0) return;
    const targetId = selectedNodeIds[0];
    const updated = nodes.map((n) => (n.id === targetId ? { ...n, ...partial } : n));
    pushHistory(updated, connections);
  };

  const handleUpdateSelectedConnection = (partial: Partial<FlowConnection>) => {
    if (!selectedConnectionId) return;
    const updated = connections.map((c) =>
      c.id === selectedConnectionId ? { ...c, ...partial } : c
    );
    pushHistory(nodes, updated);
  };

  const handleDeleteNode = (id: string) => {
    const updatedNodes = nodes.filter((n) => n.id !== id);
    const updatedConns = connections.filter(
      (c) => c.fromNodeId !== id && c.toNodeId !== id
    );
    pushHistory(updatedNodes, updatedConns);
    setSelectedNodeIds((prev) => prev.filter((i) => i !== id));
  };

  const handleDeleteConnection = (id: string) => {
    const updatedConns = connections.filter((c) => c.id !== id);
    pushHistory(nodes, updatedConns);
    if (selectedConnectionId === id) setSelectedConnectionId(null);
  };

  const handleDuplicateNode = (node: FlowNode) => {
    const newNode: FlowNode = {
      ...node,
      id: `node-${Date.now()}`,
      x: node.x + 30,
      y: node.y + 30
    };
    pushHistory([...nodes, newNode], connections);
    setSelectedNodeIds([newNode.id]);
  };

  // Add Shape directly from button
  const handleAddShapeFromPalette = (item: ShapeItem) => {
    const canvasCenterX = (-pan.x + viewportDim.w / 2) / zoom - item.defaultWidth / 2;
    const canvasCenterY = (-pan.y + viewportDim.h / 2) / zoom - item.defaultHeight / 2;

    const newNode: FlowNode = {
      id: `node-${Date.now()}`,
      type: item.type,
      x: Math.round(canvasCenterX),
      y: Math.round(canvasCenterY),
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
    pushHistory([...nodes, newNode], connections);
    setSelectedNodeIds([newNode.id]);
  };

  // Fit to Viewport
  const handleFitToView = () => {
    if (nodes.length === 0) {
      setPan({ x: 0, y: 0 });
      setZoom(1);
      return;
    }
    const bbox = getDiagramBoundingBox(nodes);
    const padding = 80;
    const scaleX = (viewportDim.w - padding * 2) / bbox.width;
    const scaleY = (viewportDim.h - padding * 2) / bbox.height;
    const newZoom = Math.min(1.5, Math.max(0.3, Math.min(scaleX, scaleY)));

    const newPanX = (viewportDim.w - bbox.width * newZoom) / 2 - bbox.minX * newZoom;
    const newPanY = (viewportDim.h - bbox.height * newZoom) / 2 - bbox.minY * newZoom;

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  // Templates
  const handleSelectTemplate = (template: TemplateDefinition) => {
    pushHistory(template.nodes, template.connections);
    setTitle(template.title);
    handleClearSelection();
    setTimeout(() => handleFitToView(), 50);
  };

  // New / Clear
  const handleNewDiagram = () => {
    if (nodes.length > 0 && !window.confirm('¿Deseas iniciar un nuevo diagrama en blanco?')) {
      return;
    }
    pushHistory([], []);
    setTitle('Nuevo Diagrama de Flujo');
    handleClearSelection();
    setPan({ x: 100, y: 100 });
    setZoom(1);
  };

  // Export handlers
  const handleExportPng = () => {
    const svgEl = document.querySelector('#canvas-grid-bg') as SVGSVGElement;
    if (svgEl) {
      exportToPng(svgEl, title, nodes);
    }
  };

  const handleExportSvg = () => {
    const svgEl = document.querySelector('#canvas-grid-bg') as SVGSVGElement;
    if (svgEl) {
      exportToSvg(svgEl, title, nodes);
    }
  };

  const handleSaveSiFlow = () => {
    const project: DiagramProject = {
      id: `proj-${Date.now()}`,
      title,
      version: '1.0.0',
      updatedAt: new Date().toISOString(),
      nodes,
      connections,
      view: { pan, zoom }
    };
    saveToSiFlowFile(project);
  };

  const handleOpenFile = async (file: File) => {
    try {
      const project = await parseSiFlowFile(file);
      pushHistory(project.nodes, project.connections);
      setTitle(project.title || file.name.replace('.siflow', ''));
      if (project.view) {
        setPan(project.view.pan);
        setZoom(project.view.zoom);
      }
      handleClearSelection();
    } catch (err) {
      alert('Error al abrir el archivo .siflow');
    }
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      // Undo: Ctrl/Cmd + Z
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      }
      // Redo: Ctrl/Cmd + Shift + Z or Ctrl + Y
      if (
        ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'z') ||
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y')
      ) {
        e.preventDefault();
        handleRedo();
      }
      // Duplicate: Ctrl/Cmd + D
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (selectedNodeIds.length > 0) {
          const node = nodes.find((n) => n.id === selectedNodeIds[0]);
          if (node) handleDuplicateNode(node);
        }
      }
      // Select All: Ctrl/Cmd + A
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setSelectedNodeIds(nodes.map((n) => n.id));
      }
      // Delete: Backspace or Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (selectedNodeIds.length > 0) {
          selectedNodeIds.forEach((id) => handleDeleteNode(id));
        } else if (selectedConnectionId) {
          handleDeleteConnection(selectedConnectionId);
        }
      }
      // Escape: deselect
      if (e.key === 'Escape') {
        handleClearSelection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeIds, selectedConnectionId, nodes, connections, handleUndo, handleRedo]);

  const selectedNode =
    selectedNodeIds.length > 0 ? nodes.find((n) => n.id === selectedNodeIds[0]) || null : null;
  const selectedConnection =
    selectedConnectionId ? connections.find((c) => c.id === selectedConnectionId) || null : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      {/* Top Header */}
      <Header
        title={title}
        onTitleChange={setTitle}
        canUndo={history.length > 0}
        canRedo={future.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        zoom={zoom}
        onZoomIn={() => setZoom((z) => Math.min(3.0, z * 1.15))}
        onZoomOut={() => setZoom((z) => Math.max(0.2, z / 1.15))}
        onResetZoom={() => setZoom(1)}
        onFitToView={handleFitToView}
        snapGrid={snapGrid}
        onToggleSnapGrid={() => setSnapGrid((s) => !s)}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onNewDiagram={handleNewDiagram}
        onExportPng={handleExportPng}
        onExportSvg={handleExportSvg}
        onSaveSiFlow={handleSaveSiFlow}
        onOpenFile={handleOpenFile}
      />

      {/* Main Studio Area */}
      <div ref={mainAreaRef} style={{ display: 'flex', flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Left: Shape Library */}
        <ShapePalette onAddShape={handleAddShapeFromPalette} />

        {/* Center: Infinite Canvas */}
        <Canvas
          nodes={nodes}
          connections={connections}
          selectedNodeIds={selectedNodeIds}
          selectedConnectionId={selectedConnectionId}
          zoom={zoom}
          pan={pan}
          snapGrid={snapGrid}
          onUpdateNodes={handleUpdateNodes}
          onUpdateConnections={handleUpdateConnections}
          onSelectNode={handleSelectNode}
          onSelectConnection={handleSelectConnection}
          onClearSelection={handleClearSelection}
          onPanChange={setPan}
          onZoomChange={setZoom}
        />

        {/* Floating Minimap */}
        <Minimap
          nodes={nodes}
          pan={pan}
          zoom={zoom}
          viewportWidth={viewportDim.w - 530}
          viewportHeight={viewportDim.h}
          onNavigate={setPan}
        />

        {/* Right: Properties Inspector */}
        <PropertiesPanel
          selectedNode={selectedNode}
          selectedConnection={selectedConnection}
          onUpdateNode={handleUpdateSelectedNode}
          onUpdateConnection={handleUpdateSelectedConnection}
          onDeleteNode={handleDeleteNode}
          onDeleteConnection={handleDeleteConnection}
          onDuplicateNode={handleDuplicateNode}
          totalNodes={nodes.length}
          totalConnections={connections.length}
        />
      </div>

      {/* Templates Modal */}
      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  );
};

export default App;
