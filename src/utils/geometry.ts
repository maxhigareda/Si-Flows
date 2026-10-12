import { Point, PortPosition, ConnectorType, FlowNode } from '../types';

export function getNodePortPosition(node: FlowNode, port: PortPosition): Point {
  const { x, y, width, height } = node;
  switch (port) {
    case 'top':
      return { x: x + width / 2, y };
    case 'right':
      return { x: x + width, y: y + height / 2 };
    case 'bottom':
      return { x: x + width / 2, y: y + height };
    case 'left':
      return { x, y: y + height / 2 };
  }
}

export function getPortNormal(port: PortPosition): Point {
  switch (port) {
    case 'top':
      return { x: 0, y: -1 };
    case 'right':
      return { x: 1, y: 0 };
    case 'bottom':
      return { x: 0, y: 1 };
    case 'left':
      return { x: -1, y: 0 };
  }
}

export function snapToGrid(value: number, gridSize = 15): number {
  return Math.round(value / gridSize) * gridSize;
}

export function getConnectorPath(
  start: Point,
  end: Point,
  type: ConnectorType = 'orthogonal',
  startPort?: PortPosition,
  endPort?: PortPosition
): { path: string; midPoint: Point } {
  if (type === 'straight') {
    const midPoint = {
      x: (start.x + end.x) / 2,
      y: (start.y + end.y) / 2
    };
    return {
      path: `M ${start.x} ${start.y} L ${end.x} ${end.y}`,
      midPoint
    };
  }

  if (type === 'bezier') {
    const dx = Math.abs(end.x - start.x) * 0.5;
    const dy = Math.abs(end.y - start.y) * 0.5;
    const offset = Math.max(40, Math.min(dx, dy));

    let cp1: Point = { ...start };
    let cp2: Point = { ...end };

    if (startPort) {
      const n1 = getPortNormal(startPort);
      cp1 = { x: start.x + n1.x * offset, y: start.y + n1.y * offset };
    } else {
      cp1 = { x: start.x + (end.x > start.x ? offset : -offset), y: start.y };
    }

    if (endPort) {
      const n2 = getPortNormal(endPort);
      cp2 = { x: end.x + n2.x * offset, y: end.y + n2.y * offset };
    } else {
      cp2 = { x: end.x - (end.x > start.x ? offset : -offset), y: end.y };
    }

    const midPoint = {
      x: (start.x + 3 * cp1.x + 3 * cp2.x + end.x) / 8,
      y: (start.y + 3 * cp1.y + 3 * cp2.y + end.y) / 8
    };

    return {
      path: `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`,
      midPoint
    };
  }

  // Orthogonal routing with smart elbow
  const startNormal = startPort ? getPortNormal(startPort) : { x: 0, y: 1 };
  const endNormal = endPort ? getPortNormal(endPort) : { x: 0, y: -1 };

  const pad = 24;
  const p1 = { x: start.x + startNormal.x * pad, y: start.y + startNormal.y * pad };
  const p4 = { x: end.x + endNormal.x * pad, y: end.y + endNormal.y * pad };

  let midX: number;
  let midY: number;

  if (startPort === 'left' || startPort === 'right') {
    if (endPort === 'left' || endPort === 'right') {
      midX = (p1.x + p4.x) / 2;
      return {
        path: `M ${start.x} ${start.y} L ${p1.x} ${p1.y} L ${midX} ${p1.y} L ${midX} ${p4.y} L ${p4.x} ${p4.y} L ${end.x} ${end.y}`,
        midPoint: { x: midX, y: (p1.y + p4.y) / 2 }
      };
    } else {
      return {
        path: `M ${start.x} ${start.y} L ${p4.x} ${start.y} L ${p4.x} ${p4.y} L ${end.x} ${end.y}`,
        midPoint: { x: p4.x, y: (start.y + end.y) / 2 }
      };
    }
  } else {
    // Top or bottom
    if (endPort === 'top' || endPort === 'bottom') {
      midY = (p1.y + p4.y) / 2;
      return {
        path: `M ${start.x} ${start.y} L ${p1.x} ${p1.y} L ${p1.x} ${midY} L ${p4.x} ${midY} L ${p4.x} ${p4.y} L ${end.x} ${end.y}`,
        midPoint: { x: (p1.x + p4.x) / 2, y: midY }
      };
    } else {
      return {
        path: `M ${start.x} ${start.y} L ${start.x} ${p4.y} L ${p4.x} ${p4.y} L ${end.x} ${end.y}`,
        midPoint: { x: (start.x + end.x) / 2, y: p4.y }
      };
    }
  }
}

export function isPointInsideRect(
  px: number,
  py: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): boolean {
  return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}
