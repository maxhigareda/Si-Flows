import React from 'react';
import { FlowNode, FlowConnection, ConnectorType } from '../types';
import {
  Trash2,
  Copy,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  ArrowRight,
  Zap,
  CornerDownRight,
  Minus
} from 'lucide-react';

interface PropertiesPanelProps {
  selectedNode: FlowNode | null;
  selectedConnection: FlowConnection | null;
  onUpdateNode: (updated: Partial<FlowNode>) => void;
  onUpdateConnection: (updated: Partial<FlowConnection>) => void;
  onDeleteNode: (id: string) => void;
  onDeleteConnection: (id: string) => void;
  onDuplicateNode: (node: FlowNode) => void;
  totalNodes: number;
  totalConnections: number;
}

const COLOR_PRESETS = [
  '#ffffff',
  '#dbeafe',
  '#eff6ff',
  '#fef3c7',
  '#dcfce7',
  '#fee2e2',
  '#f3e8ff',
  '#ecfeff',
  '#f1f5f9',
  '#1e293b'
];

const STROKE_PRESETS = [
  '#2563eb',
  '#3b82f6',
  '#0284c7',
  '#16a34a',
  '#d97706',
  '#dc2626',
  '#7c3aed',
  '#475569',
  '#0f172a'
];

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedNode,
  selectedConnection,
  onUpdateNode,
  onUpdateConnection,
  onDeleteNode,
  onDeleteConnection,
  onDuplicateNode,
  totalNodes,
  totalConnections
}) => {
  return (
    <aside
      style={{
        width: 280,
        backgroundColor: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border-subtle)',
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
          {selectedNode
            ? 'Propiedades de Figura'
            : selectedConnection
            ? 'Propiedades de Conector'
            : 'Información de Diagrama'}
        </h3>
      </div>

      <div style={{ padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Node Properties */}
        {selectedNode && (
          <>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Texto de la Figura
              </label>
              <textarea
                value={selectedNode.label}
                onChange={(e) => onUpdateNode({ label: e.target.value })}
                rows={2}
                style={{
                  width: '100%',
                  marginTop: 6,
                  padding: '8px 10px',
                  borderRadius: 6,
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-app)',
                  color: 'var(--text-primary)',
                  fontSize: 13,
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Colors */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Color de Relleno
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() =>
                      onUpdateNode({
                        style: { ...selectedNode.style, fillColor: c }
                      })
                    }
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 4,
                      backgroundColor: c,
                      border:
                        selectedNode.style.fillColor === c
                          ? '2px solid var(--accent-primary)'
                          : '1px solid var(--border-strong)',
                      cursor: 'pointer'
                    }}
                  />
                ))}
                <input
                  type="color"
                  value={selectedNode.style.fillColor}
                  onChange={(e) =>
                    onUpdateNode({
                      style: { ...selectedNode.style, fillColor: e.target.value }
                    })
                  }
                  style={{
                    width: 22,
                    height: 22,
                    padding: 0,
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer'
                  }}
                  title="Color personalizado"
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Color de Borde
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                {STROKE_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() =>
                      onUpdateNode({
                        style: { ...selectedNode.style, strokeColor: c }
                      })
                    }
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 4,
                      backgroundColor: c,
                      border:
                        selectedNode.style.strokeColor === c
                          ? '2px solid var(--accent-primary)'
                          : '1px solid var(--border-strong)',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Stroke Width & Style */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Grosor de Borde
                </label>
                <select
                  value={selectedNode.style.strokeWidth}
                  onChange={(e) =>
                    onUpdateNode({
                      style: { ...selectedNode.style, strokeWidth: Number(e.target.value) }
                    })
                  }
                  style={{
                    width: '100%',
                    marginTop: 6,
                    padding: '6px 8px',
                    borderRadius: 6,
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-app)',
                    color: 'var(--text-primary)',
                    fontSize: 12
                  }}
                >
                  <option value={1}>1px Fino</option>
                  <option value={2}>2px Normal</option>
                  <option value={3}>3px Grueso</option>
                  <option value={4}>4px Extragrueso</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Estilo de Trazo
                </label>
                <select
                  value={selectedNode.style.strokeStyle}
                  onChange={(e) =>
                    onUpdateNode({
                      style: {
                        ...selectedNode.style,
                        strokeStyle: e.target.value as 'solid' | 'dashed' | 'dotted'
                      }
                    })
                  }
                  style={{
                    width: '100%',
                    marginTop: 6,
                    padding: '6px 8px',
                    borderRadius: 6,
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-app)',
                    color: 'var(--text-primary)',
                    fontSize: 12
                  }}
                >
                  <option value="solid">Sólido</option>
                  <option value="dashed">Segmentado</option>
                  <option value="dotted">Punteado</option>
                </select>
              </div>
            </div>

            {/* Typography */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Tipografía y Alineación
              </label>
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateNode({
                      style: {
                        ...selectedNode.style,
                        fontWeight:
                          selectedNode.style.fontWeight === 'bold' ? 'normal' : 'bold'
                      }
                    })
                  }
                  style={{
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: '1px solid var(--border-subtle)',
                    backgroundColor:
                      selectedNode.style.fontWeight === 'bold'
                        ? 'var(--accent-light)'
                        : 'var(--bg-app)',
                    color:
                      selectedNode.style.fontWeight === 'bold'
                        ? 'var(--accent-primary)'
                        : 'var(--text-primary)',
                    cursor: 'pointer'
                  }}
                  title="Negrita"
                >
                  <Bold size={14} />
                </button>

                {(['left', 'center', 'right'] as const).map((align) => (
                  <button
                    key={align}
                    type="button"
                    onClick={() =>
                      onUpdateNode({
                        style: { ...selectedNode.style, textAlign: align }
                      })
                    }
                    style={{
                      padding: '6px 10px',
                      borderRadius: 6,
                      border: '1px solid var(--border-subtle)',
                      backgroundColor:
                        selectedNode.style.textAlign === align
                          ? 'var(--accent-light)'
                          : 'var(--bg-app)',
                      color:
                        selectedNode.style.textAlign === align
                          ? 'var(--accent-primary)'
                          : 'var(--text-primary)',
                      cursor: 'pointer'
                    }}
                  >
                    {align === 'left' && <AlignLeft size={14} />}
                    {align === 'center' && <AlignCenter size={14} />}
                    {align === 'right' && <AlignRight size={14} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Dimensions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Ancho (px)
                </label>
                <input
                  type="number"
                  value={Math.round(selectedNode.width)}
                  onChange={(e) =>
                    onUpdateNode({ width: Math.max(50, Number(e.target.value)) })
                  }
                  style={{
                    width: '100%',
                    marginTop: 6,
                    padding: '6px 8px',
                    borderRadius: 6,
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-app)',
                    color: 'var(--text-primary)',
                    fontSize: 12
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Alto (px)
                </label>
                <input
                  type="number"
                  value={Math.round(selectedNode.height)}
                  onChange={(e) =>
                    onUpdateNode({ height: Math.max(40, Number(e.target.value)) })
                  }
                  style={{
                    width: '100%',
                    marginTop: 6,
                    padding: '6px 8px',
                    borderRadius: 6,
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-app)',
                    color: 'var(--text-primary)',
                    fontSize: 12
                  }}
                />
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => onDuplicateNode(selectedNode)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-app)',
                  color: 'var(--text-primary)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Copy size={14} /> Duplicar
              </button>
              <button
                type="button"
                onClick={() => onDeleteNode(selectedNode.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid #fecaca',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </>
        )}

        {/* Connection Properties */}
        {selectedConnection && (
          <>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Etiqueta del Conector
              </label>
              <input
                type="text"
                value={selectedConnection.label || ''}
                placeholder="Ej. Sí, No, OK, 200..."
                onChange={(e) => onUpdateConnection({ label: e.target.value })}
                style={{
                  width: '100%',
                  marginTop: 6,
                  padding: '8px 10px',
                  borderRadius: 6,
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-app)',
                  color: 'var(--text-primary)',
                  fontSize: 13
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Tipo de Enrutamiento
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 6 }}>
                {[
                  { id: 'orthogonal', label: 'Ortogonal', icon: <CornerDownRight size={14} /> },
                  { id: 'bezier', label: 'Curvo', icon: <Zap size={14} /> },
                  { id: 'straight', label: 'Directo', icon: <Minus size={14} /> }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      onUpdateConnection({ type: item.id as ConnectorType })
                    }
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      padding: '8px 4px',
                      borderRadius: 6,
                      border: '1px solid var(--border-subtle)',
                      backgroundColor:
                        selectedConnection.type === item.id
                          ? 'var(--accent-light)'
                          : 'var(--bg-app)',
                      color:
                        selectedConnection.type === item.id
                          ? 'var(--accent-primary)'
                          : 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: 11,
                      fontWeight: 600
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Color de Línea
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                {STROKE_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onUpdateConnection({ strokeColor: c })}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 4,
                      backgroundColor: c,
                      border:
                        selectedConnection.strokeColor === c
                          ? '2px solid var(--accent-primary)'
                          : '1px solid var(--border-strong)',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Extremos con Flecha
              </label>
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 12,
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedConnection.arrowEnd}
                    onChange={(e) => onUpdateConnection({ arrowEnd: e.target.checked })}
                  />
                  Flecha al Final
                </label>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onDeleteConnection(selectedConnection.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #fecaca',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: 8
              }}
            >
              <Trash2 size={14} /> Eliminar Conector
            </button>
          </>
        )}

        {/* Empty selection info */}
        {!selectedNode && !selectedConnection && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div
              style={{
                backgroundColor: 'var(--bg-app)',
                borderRadius: 8,
                padding: 12,
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Estadísticas del Lienzo
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 8,
                  fontSize: 12
                }}
              >
                <span style={{ color: 'var(--text-muted)' }}>Figuras:</span>
                <span style={{ fontWeight: 700 }}>{totalNodes}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 4,
                  fontSize: 12
                }}
              >
                <span style={{ color: 'var(--text-muted)' }}>Conexiones:</span>
                <span style={{ fontWeight: 700 }}>{totalConnections}</span>
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--bg-app)',
                borderRadius: 8,
                padding: 12,
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Atajos de Teclado
              </div>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  marginTop: 8,
                  fontSize: 11,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  color: 'var(--text-secondary)'
                }}
              >
                <li>
                  <kbd style={{ background: 'var(--bg-surface)', padding: '2px 5px', borderRadius: 4, border: '1px solid var(--border-strong)' }}>
                    Espacio + Arrastre
                  </kbd>{' '}
                  Mover lienzo
                </li>
                <li>
                  <kbd style={{ background: 'var(--bg-surface)', padding: '2px 5px', borderRadius: 4, border: '1px solid var(--border-strong)' }}>
                    Rueda ratón
                  </kbd>{' '}
                  Zoom in / out
                </li>
                <li>
                  <kbd style={{ background: 'var(--bg-surface)', padding: '2px 5px', borderRadius: 4, border: '1px solid var(--border-strong)' }}>
                    Supr / Backspace
                  </kbd>{' '}
                  Eliminar seleccionado
                </li>
                <li>
                  <kbd style={{ background: 'var(--bg-surface)', padding: '2px 5px', borderRadius: 4, border: '1px solid var(--border-strong)' }}>
                    Ctrl / Cmd + D
                  </kbd>{' '}
                  Duplicar
                </li>
                <li>
                  <kbd style={{ background: 'var(--bg-surface)', padding: '2px 5px', borderRadius: 4, border: '1px solid var(--border-strong)' }}>
                    Ctrl / Cmd + Z
                  </kbd>{' '}
                  Deshacer
                </li>
                <li>
                  <kbd style={{ background: 'var(--bg-surface)', padding: '2px 5px', borderRadius: 4, border: '1px solid var(--border-strong)' }}>
                    Doble Clic
                  </kbd>{' '}
                  Editar texto
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
