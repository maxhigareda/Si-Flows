import React from 'react';
import { ShapeType } from '../types';
import {
  Square,
  Diamond,
  CircleDot,
  FileText,
  Database,
  StickyNote,
  Cloud,
  User,
  LayoutGrid,
  Columns
} from 'lucide-react';

interface ShapeItem {
  type: ShapeType;
  title: string;
  desc: string;
  icon: React.ReactNode;
  defaultWidth: number;
  defaultHeight: number;
  defaultFill: string;
  defaultStroke: string;
  defaultText: string;
}

const SHAPES: { category: string; items: ShapeItem[] }[] = [
  {
    category: 'Flujos Principales',
    items: [
      {
        type: 'terminal',
        title: 'Inicio / Fin',
        desc: 'Comienzo o conclusión del flujo',
        icon: <CircleDot size={20} className="text-blue-500" />,
        defaultWidth: 140,
        defaultHeight: 50,
        defaultFill: '#dbeafe',
        defaultStroke: '#2563eb',
        defaultText: 'Inicio'
      },
      {
        type: 'process',
        title: 'Proceso',
        desc: 'Operación o tarea estándar',
        icon: <Square size={20} className="text-sky-500" />,
        defaultWidth: 150,
        defaultHeight: 60,
        defaultFill: '#ffffff',
        defaultStroke: '#3b82f6',
        defaultText: 'Nuevo Proceso'
      },
      {
        type: 'decision',
        title: 'Decisión',
        desc: 'Bifurcación o condición booleana',
        icon: <Diamond size={20} className="text-amber-500" />,
        defaultWidth: 120,
        defaultHeight: 80,
        defaultFill: '#fef3c7',
        defaultStroke: '#d97706',
        defaultText: '¿Condición?'
      },
      {
        type: 'subprocess',
        title: 'Subproceso',
        desc: 'Proceso complejo o módulo predefinido',
        icon: <Columns size={20} className="text-indigo-500" />,
        defaultWidth: 160,
        defaultHeight: 65,
        defaultFill: '#ffffff',
        defaultStroke: '#4f46e5',
        defaultText: 'Subproceso'
      }
    ]
  },
  {
    category: 'Datos e Información',
    items: [
      {
        type: 'data',
        title: 'Datos / I-O',
        desc: 'Entrada o salida de información',
        icon: <LayoutGrid size={20} className="text-teal-500" />,
        defaultWidth: 150,
        defaultHeight: 60,
        defaultFill: '#ccfbf1',
        defaultStroke: '#0d9488',
        defaultText: 'Entrada / Salida'
      },
      {
        type: 'document',
        title: 'Documento',
        desc: 'Reporte, archivo o factura impresa',
        icon: <FileText size={20} className="text-emerald-500" />,
        defaultWidth: 140,
        defaultHeight: 70,
        defaultFill: '#f0fdf4',
        defaultStroke: '#16a34a',
        defaultText: 'Documento'
      },
      {
        type: 'database',
        title: 'Base de Datos',
        desc: 'Almacenamiento estructurado',
        icon: <Database size={20} className="text-cyan-500" />,
        defaultWidth: 120,
        defaultHeight: 80,
        defaultFill: '#ecfeff',
        defaultStroke: '#0891b2',
        defaultText: 'Base de Datos'
      }
    ]
  },
  {
    category: 'Anotaciones & Actores',
    items: [
      {
        type: 'note',
        title: 'Nota Adhesiva',
        desc: 'Comentario o aclaración del equipo',
        icon: <StickyNote size={20} className="text-yellow-500" />,
        defaultWidth: 130,
        defaultHeight: 110,
        defaultFill: '#fef08a',
        defaultStroke: '#eab308',
        defaultText: 'Nota o recordatorio...'
      },
      {
        type: 'cloud',
        title: 'Nube / Red',
        desc: 'Servicio en la nube o API externa',
        icon: <Cloud size={20} className="text-blue-400" />,
        defaultWidth: 150,
        defaultHeight: 80,
        defaultFill: '#eff6ff',
        defaultStroke: '#60a5fa',
        defaultText: 'Servicio Cloud'
      },
      {
        type: 'actor',
        title: 'Actor / Usuario',
        desc: 'Persona, rol o cliente que interactúa',
        icon: <User size={20} className="text-violet-500" />,
        defaultWidth: 90,
        defaultHeight: 95,
        defaultFill: '#ede9fe',
        defaultStroke: '#7c3aed',
        defaultText: 'Usuario'
      }
    ]
  }
];

interface ShapePaletteProps {
  onAddShape: (shape: ShapeItem) => void;
}

export const ShapePalette: React.FC<ShapePaletteProps> = ({ onAddShape }) => {
  const handleDragStart = (e: React.DragEvent, item: ShapeItem) => {
    e.dataTransfer.setData('application/siflow-shape', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <aside
      style={{
        width: 250,
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowY: 'auto'
      }}
    >
      <div style={{ padding: '16px 14px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
        <h3
          style={{
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 700,
            color: 'var(--text-muted)'
          }}
        >
          Figuras y Diagramas
        </h3>
        <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
          Arrastra al lienzo o haz clic para añadir
        </p>
      </div>

      <div style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {SHAPES.map((cat) => (
          <div key={cat.category}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: 8,
                paddingLeft: 4
              }}
            >
              {cat.category}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
              {cat.items.map((item) => (
                <div
                  key={item.type}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item)}
                  onClick={() => onAddShape(item)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 8,
                    cursor: 'grab',
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                    e.currentTarget.style.borderColor = 'var(--border-focus)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-app)';
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: 6,
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    {item.icon}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {item.title}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--text-muted)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export type { ShapeItem };
