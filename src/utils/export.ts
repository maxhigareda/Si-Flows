import { DiagramProject, FlowNode, FlowConnection } from '../types';
import { getNodePortPosition, getConnectorPath } from './geometry';

export function getDiagramBoundingBox(nodes: FlowNode[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 800, maxY: 600, width: 800, height: 600 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodes.forEach((n) => {
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + n.width);
    maxY = Math.max(maxY, n.y + n.height);
  });

  const pad = 60;
  minX -= pad;
  minY -= pad;
  maxX += pad;
  maxY += pad;

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.max(200, maxX - minX),
    height: Math.max(200, maxY - minY)
  };
}

/**
 * Draws the entire diagram directly to an HTML5 Canvas 2D context.
 * 100% reliable across all browsers (Safari, Chrome, Firefox),
 * zero SVG foreignObject security/taint bugs, instant high-definition export.
 */
export function exportToPng(
  title: string,
  nodes: FlowNode[],
  connections: FlowConnection[],
  scale = 2
) {
  if (nodes.length === 0) {
    alert('El lienzo está vacío. Añade algunas figuras antes de exportar.');
    return;
  }

  const bbox = getDiagramBoundingBox(nodes);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bbox.width * scale);
  canvas.height = Math.round(bbox.height * scale);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Hi-res scaling
  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, bbox.width, bbox.height);

  // Translate by bounding box offset
  ctx.translate(-bbox.minX, -bbox.minY);

  // 1. Draw Connections
  connections.forEach((conn) => {
    const fromNode = nodes.find((n) => n.id === conn.fromNodeId);
    const toNode = nodes.find((n) => n.id === conn.toNodeId);
    if (!fromNode || !toNode) return;

    const startPoint = getNodePortPosition(fromNode, conn.fromPort);
    const endPoint = getNodePortPosition(toNode, conn.toPort);
    const { midPoint } = getConnectorPath(startPoint, endPoint, conn.type, conn.fromPort, conn.toPort);

    ctx.save();
    ctx.strokeStyle = conn.strokeColor || '#3b82f6';
    ctx.lineWidth = conn.strokeWidth || 2;
    if (conn.strokeStyle === 'dashed') {
      ctx.setLineDash([6, 4]);
    } else {
      ctx.setLineDash([]);
    }

    ctx.beginPath();
    if (conn.type === 'straight') {
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(endPoint.x, endPoint.y);
    } else if (conn.type === 'bezier') {
      const dx = Math.abs(endPoint.x - startPoint.x) * 0.5;
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.bezierCurveTo(
        startPoint.x + (endPoint.x > startPoint.x ? dx : -dx),
        startPoint.y,
        endPoint.x - (endPoint.x > startPoint.x ? dx : -dx),
        endPoint.y,
        endPoint.x,
        endPoint.y
      );
    } else {
      // Orthogonal
      ctx.moveTo(startPoint.x, startPoint.y);
      if (conn.fromPort === 'left' || conn.fromPort === 'right') {
        const midX = (startPoint.x + endPoint.x) / 2;
        ctx.lineTo(midX, startPoint.y);
        ctx.lineTo(midX, endPoint.y);
        ctx.lineTo(endPoint.x, endPoint.y);
      } else {
        const midY = (startPoint.y + endPoint.y) / 2;
        ctx.lineTo(startPoint.x, midY);
        ctx.lineTo(endPoint.x, midY);
        ctx.lineTo(endPoint.x, endPoint.y);
      }
    }
    ctx.stroke();

    // Arrowhead at end
    if (conn.arrowEnd) {
      let angle = 0;
      if (conn.toPort === 'left') angle = 0;
      else if (conn.toPort === 'right') angle = Math.PI;
      else if (conn.toPort === 'top') angle = Math.PI / 2;
      else if (conn.toPort === 'bottom') angle = -Math.PI / 2;

      ctx.save();
      ctx.translate(endPoint.x, endPoint.y);
      ctx.rotate(angle);
      ctx.fillStyle = conn.strokeColor || '#3b82f6';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-10, -5);
      ctx.lineTo(-10, 5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Connection Label Badge
    if (conn.label) {
      ctx.font = '600 11px system-ui, -apple-system, sans-serif';
      const textMetrics = ctx.measureText(conn.label);
      const textW = textMetrics.width + 16;
      const textH = 22;

      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.setLineDash([]);

      const rx = midPoint.x - textW / 2;
      const ry = midPoint.y - textH / 2;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(rx, ry, textW, textH, 4) : ctx.rect(rx, ry, textW, textH);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(conn.label, midPoint.x, midPoint.y);
    }

    ctx.restore();
  });

  // 2. Draw Nodes
  nodes.forEach((node) => {
    const { x, y, width, height, type, style, label } = node;
    const { fillColor, strokeColor, strokeWidth, strokeStyle } = style;

    ctx.save();
    ctx.fillStyle = fillColor || '#ffffff';
    ctx.strokeStyle = strokeColor || '#3b82f6';
    ctx.lineWidth = strokeWidth || 2;
    if (strokeStyle === 'dashed') ctx.setLineDash([6, 4]);
    else if (strokeStyle === 'dotted') ctx.setLineDash([2, 3]);
    else ctx.setLineDash([]);

    ctx.beginPath();
    switch (type) {
      case 'terminal': {
        const r = Math.min(width, height) / 2;
        ctx.roundRect ? ctx.roundRect(x, y, width, height, r) : ctx.rect(x, y, width, height);
        ctx.fill();
        ctx.stroke();
        break;
      }
      case 'decision': {
        ctx.moveTo(x + width / 2, y);
        ctx.lineTo(x + width, y + height / 2);
        ctx.lineTo(x + width / 2, y + height);
        ctx.lineTo(x, y + height / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }
      case 'data': {
        const skew = Math.min(24, width * 0.15);
        ctx.moveTo(x + skew, y);
        ctx.lineTo(x + width, y);
        ctx.lineTo(x + width - skew, y + height);
        ctx.lineTo(x, y + height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }
      case 'document': {
        const wave = Math.min(14, height * 0.15);
        const hBase = height - wave;
        ctx.moveTo(x, y);
        ctx.lineTo(x + width, y);
        ctx.lineTo(x + width, y + hBase);
        ctx.quadraticCurveTo(x + width * 0.75, y + height, x + width * 0.5, y + hBase);
        ctx.quadraticCurveTo(x + width * 0.25, y + hBase - wave, x, y + hBase);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }
      case 'database': {
        const eh = Math.min(18, height * 0.18);
        // Body
        ctx.moveTo(x, y + eh);
        ctx.lineTo(x, y + height - eh);
        ctx.ellipse(x + width / 2, y + height - eh, width / 2, eh, 0, 0, Math.PI);
        ctx.lineTo(x + width, y + eh);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Top ellipse
        ctx.beginPath();
        ctx.ellipse(x + width / 2, y + eh, width / 2, eh, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
      }
      case 'note': {
        const fold = 18;
        ctx.moveTo(x, y);
        ctx.lineTo(x + width - fold, y);
        ctx.lineTo(x + width, y + fold);
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x, y + height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Fold triangle
        ctx.beginPath();
        ctx.moveTo(x + width - fold, y);
        ctx.lineTo(x + width - fold, y + fold);
        ctx.lineTo(x + width, y + fold);
        ctx.closePath();
        ctx.fillStyle = 'rgba(0,0,0,0.08)';
        ctx.fill();
        ctx.stroke();
        break;
      }
      case 'subprocess': {
        ctx.roundRect ? ctx.roundRect(x, y, width, height, 6) : ctx.rect(x, y, width, height);
        ctx.fill();
        ctx.stroke();
        // inner lines
        ctx.beginPath();
        ctx.moveTo(x + 14, y);
        ctx.lineTo(x + 14, y + height);
        ctx.moveTo(x + width - 14, y);
        ctx.lineTo(x + width - 14, y + height);
        ctx.stroke();
        break;
      }
      default: {
        // process
        ctx.roundRect ? ctx.roundRect(x, y, width, height, 8) : ctx.rect(x, y, width, height);
        ctx.fill();
        ctx.stroke();
        break;
      }
    }

    // Node Text
    if (label) {
      ctx.fillStyle = style.textColor || '#0f172a';
      const weight = style.fontWeight === 'bold' ? '700' : '500';
      const fontSize = style.fontSize || 13;
      ctx.font = `${weight} ${fontSize}px system-ui, -apple-system, sans-serif`;
      ctx.textBaseline = 'middle';

      const lines = label.split('\n');
      const lineHeight = fontSize * 1.35;
      const totalTextH = lines.length * lineHeight;
      const startY = y + (height - totalTextH) / 2 + lineHeight / 2;

      let startX = x + width / 2;
      ctx.textAlign = 'center';
      if (style.textAlign === 'left') {
        startX = x + 16;
        ctx.textAlign = 'left';
      } else if (style.textAlign === 'right') {
        startX = x + width - 16;
        ctx.textAlign = 'right';
      }

      lines.forEach((line, idx) => {
        ctx.fillText(line, startX, startY + idx * lineHeight);
      });
    }

    ctx.restore();
  });

  // Direct Browser Download
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, 'image/png');
}

/**
 * Clean SVG export directly from model structure.
 */
export function exportToSvg(title: string, nodes: FlowNode[], connections: FlowConnection[]) {
  if (nodes.length === 0) {
    alert('El lienzo está vacío. Añade algunas figuras antes de exportar.');
    return;
  }

  const bbox = getDiagramBoundingBox(nodes);

  let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bbox.minX} ${bbox.minY} ${bbox.width} ${bbox.height}" width="${bbox.width}" height="${bbox.height}">
  <defs>
    <marker id="arrow-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#3b82f6" />
    </marker>
  </defs>
  <rect x="${bbox.minX}" y="${bbox.minY}" width="${bbox.width}" height="${bbox.height}" fill="#ffffff" />
`;

  // Connections
  connections.forEach((conn) => {
    const fromNode = nodes.find((n) => n.id === conn.fromNodeId);
    const toNode = nodes.find((n) => n.id === conn.toNodeId);
    if (!fromNode || !toNode) return;

    const startPoint = getNodePortPosition(fromNode, conn.fromPort);
    const endPoint = getNodePortPosition(toNode, conn.toPort);
    const { path, midPoint } = getConnectorPath(startPoint, endPoint, conn.type, conn.fromPort, conn.toPort);

    const strokeDash = conn.strokeStyle === 'dashed' ? 'stroke-dasharray="5 5"' : '';
    svgContent += `  <path d="${path}" fill="none" stroke="${conn.strokeColor || '#3b82f6'}" stroke-width="${conn.strokeWidth || 2}" ${strokeDash} ${conn.arrowEnd ? 'marker-end="url(#arrow-head)"' : ''} />\n`;

    if (conn.label) {
      const tw = conn.label.length * 8 + 16;
      svgContent += `  <g transform="translate(${midPoint.x}, ${midPoint.y})">
    <rect x="${-tw / 2}" y="-11" width="${tw}" height="22" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
    <text text-anchor="middle" y="4" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#0f172a">${conn.label}</text>
  </g>\n`;
    }
  });

  // Nodes
  nodes.forEach((node) => {
    const { x, y, width, height, type, style, label } = node;
    const strokeDash = style.strokeStyle === 'dashed' ? 'stroke-dasharray="6 4"' : '';

    svgContent += `  <g transform="translate(${x}, ${y})">\n`;
    switch (type) {
      case 'terminal': {
        const r = Math.min(width, height) / 2;
        svgContent += `    <rect x="0" y="0" width="${width}" height="${height}" rx="${r}" ry="${r}" fill="${style.fillColor}" stroke="${style.strokeColor}" stroke-width="${style.strokeWidth}" ${strokeDash} />\n`;
        break;
      }
      case 'decision': {
        const pts = `${width / 2},0 ${width},${height / 2} ${width / 2},${height} 0,${height / 2}`;
        svgContent += `    <polygon points="${pts}" fill="${style.fillColor}" stroke="${style.strokeColor}" stroke-width="${style.strokeWidth}" ${strokeDash} />\n`;
        break;
      }
      default: {
        svgContent += `    <rect x="0" y="0" width="${width}" height="${height}" rx="8" ry="8" fill="${style.fillColor}" stroke="${style.strokeColor}" stroke-width="${style.strokeWidth}" ${strokeDash} />\n`;
        break;
      }
    }

    if (label) {
      const lines = label.split('\n');
      const fontSize = style.fontSize || 13;
      const lineHeight = fontSize * 1.35;
      const startY = (height - lines.length * lineHeight) / 2 + fontSize;
      svgContent += `    <text x="${width / 2}" y="${startY}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="${fontSize}" font-weight="${style.fontWeight === 'bold' ? 'bold' : 'normal'}" fill="${style.textColor || '#0f172a'}">\n`;
      lines.forEach((l, idx) => {
        svgContent += `      <tspan x="${width / 2}" dy="${idx === 0 ? 0 : lineHeight}">${l}</tspan>\n`;
      });
      svgContent += `    </text>\n`;
    }
    svgContent += `  </g>\n`;
  });

  svgContent += `</svg>`;

  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function saveToSiFlowFile(project: DiagramProject) {
  const jsonStr = JSON.stringify(project, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.title.toLowerCase().replace(/\s+/g, '-')}.siflow`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function parseSiFlowFile(file: File): Promise<DiagramProject> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const project = JSON.parse(content) as DiagramProject;
        if (!project.nodes || !Array.isArray(project.nodes)) {
          throw new Error('Archivo .siflow no válido');
        }
        resolve(project);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Error al leer archivo'));
    reader.readAsText(file);
  });
}
