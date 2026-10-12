export type ShapeType =
  | 'process'
  | 'decision'
  | 'terminal'
  | 'data'
  | 'document'
  | 'database'
  | 'note'
  | 'cloud'
  | 'actor'
  | 'subprocess';

export type PortPosition = 'top' | 'right' | 'bottom' | 'left';

export type ConnectorType = 'orthogonal' | 'bezier' | 'straight';

export interface NodeStyle {
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  strokeStyle: 'solid' | 'dashed' | 'dotted';
  textColor: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  textAlign: 'left' | 'center' | 'right';
  opacity: number;
  shadow?: boolean;
}

export interface FlowNode {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  style: NodeStyle;
}

export interface FlowConnection {
  id: string;
  fromNodeId: string;
  fromPort: PortPosition;
  toNodeId: string;
  toPort: PortPosition;
  type: ConnectorType;
  label?: string;
  strokeColor: string;
  strokeWidth: number;
  strokeStyle: 'solid' | 'dashed';
  arrowEnd: boolean;
  arrowStart: boolean;
}

export interface Point {
  x: number;
  y: number;
}

export interface DiagramProject {
  id: string;
  title: string;
  version: string;
  updatedAt: string;
  nodes: FlowNode[];
  connections: FlowConnection[];
  view: {
    pan: Point;
    zoom: number;
  };
}

export interface TemplateDefinition {
  id: string;
  title: string;
  description: string;
  category: 'Negocio' | 'Ingeniería' | 'Procesos' | 'Básico';
  nodes: FlowNode[];
  connections: FlowConnection[];
}
