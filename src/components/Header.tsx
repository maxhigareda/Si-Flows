import React, { useRef } from 'react';
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid,
  Magnet,
  Download,
  FolderOpen,
  Plus,
  Sparkles,
  Sun,
  Moon,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitToView: () => void;
  snapGrid: boolean;
  onToggleSnapGrid: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenTemplates: () => void;
  onNewDiagram: () => void;
  onExportPng: () => void;
  onExportSvg: () => void;
  onSaveSiFlow: () => void;
  onOpenFile: (file: File) => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onTitleChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitToView,
  snapGrid,
  onToggleSnapGrid,
  theme,
  onToggleTheme,
  onOpenTemplates,
  onNewDiagram,
  onExportPng,
  onExportSvg,
  onSaveSiFlow,
  onOpenFile
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showExportMenu, setShowExportMenu] = React.useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onOpenFile(file);
    }
  };

  return (
    <header
      style={{
        height: 52,
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        zIndex: 50
      }}
    >
      {/* Brand & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #2563eb, #0284c7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: 16
            }}
          >
            SI
          </div>
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em' }}>
            Flows
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent-primary)',
              padding: '2px 6px',
              borderRadius: 4
            }}
          >
            PRO
          </span>
        </div>

        <div style={{ width: 1, height: 20, backgroundColor: 'var(--border-subtle)' }} />

        {/* Title Input */}
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-primary)',
            outline: 'none',
            padding: '4px 8px',
            borderRadius: 4,
            width: 220
          }}
          onFocus={(e) => (e.target.style.backgroundColor = 'var(--bg-app)')}
          onBlur={(e) => (e.target.style.backgroundColor = 'transparent')}
        />
      </div>

      {/* Middle Tools (History, Zoom, Grid) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* Undo / Redo */}
        <button
          type="button"
          disabled={!canUndo}
          onClick={onUndo}
          style={{
            background: 'none',
            border: 'none',
            padding: '6px 8px',
            borderRadius: 6,
            cursor: canUndo ? 'pointer' : 'not-allowed',
            color: canUndo ? 'var(--text-primary)' : 'var(--text-muted)'
          }}
          title="Deshacer (Ctrl+Z)"
        >
          <Undo2 size={16} />
        </button>

        <button
          type="button"
          disabled={!canRedo}
          onClick={onRedo}
          style={{
            background: 'none',
            border: 'none',
            padding: '6px 8px',
            borderRadius: 6,
            cursor: canRedo ? 'pointer' : 'not-allowed',
            color: canRedo ? 'var(--text-primary)' : 'var(--text-muted)'
          }}
          title="Rehacer (Ctrl+Y)"
        >
          <Redo2 size={16} />
        </button>

        <div style={{ width: 1, height: 20, backgroundColor: 'var(--border-subtle)', margin: '0 4px' }} />

        {/* Zoom controls */}
        <button
          type="button"
          onClick={onZoomOut}
          style={{
            background: 'none',
            border: 'none',
            padding: '6px 8px',
            borderRadius: 6,
            cursor: 'pointer',
            color: 'var(--text-primary)'
          }}
          title="Alejar (-)"
        >
          <ZoomOut size={16} />
        </button>

        <span
          onClick={onResetZoom}
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text-secondary)',
            minWidth: 42,
            textAlign: 'center',
            cursor: 'pointer',
            padding: '4px 6px',
            borderRadius: 4
          }}
          title="Restablecer zoom a 100%"
        >
          {Math.round(zoom * 100)}%
        </span>

        <button
          type="button"
          onClick={onZoomIn}
          style={{
            background: 'none',
            border: 'none',
            padding: '6px 8px',
            borderRadius: 6,
            cursor: 'pointer',
            color: 'var(--text-primary)'
          }}
          title="Acercar (+)"
        >
          <ZoomIn size={16} />
        </button>

        <button
          type="button"
          onClick={onFitToView}
          style={{
            background: 'none',
            border: 'none',
            padding: '6px 8px',
            borderRadius: 6,
            cursor: 'pointer',
            color: 'var(--text-primary)'
          }}
          title="Ajustar a la vista"
        >
          <Maximize2 size={16} />
        </button>

        <div style={{ width: 1, height: 20, backgroundColor: 'var(--border-subtle)', margin: '0 4px' }} />

        {/* Snap to Grid */}
        <button
          type="button"
          onClick={onToggleSnapGrid}
          style={{
            background: snapGrid ? 'var(--accent-light)' : 'none',
            border: 'none',
            padding: '6px 8px',
            borderRadius: 6,
            cursor: 'pointer',
            color: snapGrid ? 'var(--accent-primary)' : 'var(--text-secondary)'
          }}
          title={snapGrid ? 'Ajuste a la cuadrícula activado' : 'Ajuste a cuadrícula desactivado'}
        >
          <Magnet size={16} />
        </button>
      </div>

      {/* Right Controls (Templates, Open, Export, Theme) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          type="button"
          onClick={onOpenTemplates}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-app)',
            color: 'var(--text-primary)',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Sparkles size={14} className="text-amber-500" /> Plantillas
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-app)',
            color: 'var(--text-primary)',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer'
          }}
          title="Abrir archivo .siflow"
        >
          <FolderOpen size={14} /> Abrir
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".siflow,application/json"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {/* Export Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowExportMenu(!showExportMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 6,
              border: 'none',
              backgroundColor: 'var(--accent-primary)',
              color: '#ffffff',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Download size={14} /> Exportar <ChevronDown size={14} />
          </button>

          {showExportMenu && (
            <div
              className="animate-fade-in"
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 6px)',
                width: 200,
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 8,
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-lg)',
                padding: 6,
                zIndex: 100
              }}
              onMouseLeave={() => setShowExportMenu(false)}
            >
              <button
                type="button"
                onClick={() => {
                  onExportPng();
                  setShowExportMenu(false);
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 10px',
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--text-primary)',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                Imagen PNG (Alta Definición)
              </button>

              <button
                type="button"
                onClick={() => {
                  onExportSvg();
                  setShowExportMenu(false);
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 10px',
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--text-primary)',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                Gráfico Vectorial SVG
              </button>

              <div style={{ height: 1, backgroundColor: 'var(--border-subtle)', margin: '4px 0' }} />

              <button
                type="button"
                onClick={() => {
                  onSaveSiFlow();
                  setShowExportMenu(false);
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 10px',
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--accent-primary)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                Guardar Proyecto (.siflow)
              </button>
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          style={{
            background: 'none',
            border: 'none',
            padding: '6px 8px',
            borderRadius: 6,
            cursor: 'pointer',
            color: 'var(--text-secondary)'
          }}
          title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
};
