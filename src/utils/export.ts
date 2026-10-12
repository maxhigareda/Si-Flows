import { DiagramProject, FlowNode } from '../types';

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

export function exportToSvg(svgElement: SVGSVGElement, title: string, nodes: FlowNode[]) {
  const bbox = getDiagramBoundingBox(nodes);
  const clone = svgElement.cloneNode(true) as SVGSVGElement;

  clone.setAttribute('viewBox', `${bbox.minX} ${bbox.minY} ${bbox.width} ${bbox.height}`);
  clone.setAttribute('width', `${bbox.width}px`);
  clone.setAttribute('height', `${bbox.height}px`);

  // Remove interactive helper elements from export
  const selectionBoxes = clone.querySelectorAll('.helper-element');
  selectionBoxes.forEach((el) => el.remove());

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(clone);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToPng(
  svgElement: SVGSVGElement,
  title: string,
  nodes: FlowNode[],
  scale = 2
) {
  const bbox = getDiagramBoundingBox(nodes);
  const clone = svgElement.cloneNode(true) as SVGSVGElement;

  clone.setAttribute('viewBox', `${bbox.minX} ${bbox.minY} ${bbox.width} ${bbox.height}`);
  clone.setAttribute('width', `${bbox.width}px`);
  clone.setAttribute('height', `${bbox.height}px`);

  const helpers = clone.querySelectorAll('.helper-element');
  helpers.forEach((el) => el.remove());

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(clone);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = bbox.width * scale;
    canvas.height = bbox.height * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);

    URL.revokeObjectURL(url);
    const pngUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = pngUrl;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  img.src = url;
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
  URL.revokeObjectURL(url);
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
