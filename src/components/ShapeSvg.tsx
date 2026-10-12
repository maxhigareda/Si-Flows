import React from 'react';
import { FlowNode } from '../types';

interface ShapeSvgProps {
  node: FlowNode;
}

export const ShapeSvg: React.FC<ShapeSvgProps> = ({ node }) => {
  const { type, width, height, style } = node;
  const {
    fillColor,
    strokeColor,
    strokeWidth,
    strokeStyle,
    opacity
  } = style;

  const strokeDasharray =
    strokeStyle === 'dashed' ? '6 4' : strokeStyle === 'dotted' ? '2 3' : undefined;

  const commonProps = {
    fill: fillColor,
    stroke: strokeColor,
    strokeWidth,
    strokeDasharray,
    opacity
  };

  switch (type) {
    case 'process':
      return (
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          rx={8}
          ry={8}
          {...commonProps}
        />
      );

    case 'decision': {
      const points = `${width / 2},0 ${width},${height / 2} ${width / 2},${height} 0,${height / 2}`;
      return <polygon points={points} {...commonProps} />;
    }

    case 'terminal': {
      const r = Math.min(width, height) / 2;
      return (
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          rx={r}
          ry={r}
          {...commonProps}
        />
      );
    }

    case 'data': {
      const skew = Math.min(24, width * 0.15);
      const points = `${skew},0 ${width},0 ${width - skew},${height} 0,${height}`;
      return <polygon points={points} {...commonProps} />;
    }

    case 'document': {
      const wave = Math.min(14, height * 0.15);
      const hBase = height - wave;
      const d = `
        M 0,0
        L ${width},0
        L ${width},${hBase}
        Q ${width * 0.75},${height} ${width * 0.5},${hBase}
        Q ${width * 0.25},${hBase - wave} 0,${hBase}
        Z
      `;
      return <path d={d} {...commonProps} />;
    }

    case 'database': {
      const ellipseH = Math.min(18, height * 0.18);
      const dBody = `
        M 0,${ellipseH}
        L 0,${height - ellipseH}
        A ${width / 2} ${ellipseH} 0 0 0 ${width} ${height - ellipseH}
        L ${width},${ellipseH}
        Z
      `;
      return (
        <g opacity={opacity}>
          {/* Cylinder Body */}
          <path d={dBody} fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} />
          {/* Top Ellipse */}
          <ellipse
            cx={width / 2}
            cy={ellipseH}
            rx={width / 2}
            ry={ellipseH}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        </g>
      );
    }

    case 'note': {
      const fold = 18;
      const d = `
        M 0,0
        L ${width - fold},0
        L ${width},${fold}
        L ${width},${height}
        L 0,${height}
        Z
      `;
      return (
        <g opacity={opacity}>
          <path d={d} fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} />
          {/* Folded corner triangle */}
          <polygon
            points={`${width - fold},0 ${width - fold},${fold} ${width},${fold}`}
            fill="rgba(0,0,0,0.08)"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        </g>
      );
    }

    case 'subprocess':
      return (
        <g opacity={opacity}>
          <rect
            x={0}
            y={0}
            width={width}
            height={height}
            rx={6}
            ry={6}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
          />
          {/* Subprocess vertical inner bars */}
          <line x1={14} y1={0} x2={14} y2={height} stroke={strokeColor} strokeWidth={Math.max(1, strokeWidth - 0.5)} />
          <line x1={width - 14} y1={0} x2={width - 14} y2={height} stroke={strokeColor} strokeWidth={Math.max(1, strokeWidth - 0.5)} />
        </g>
      );

    case 'cloud': {
      // Approximate clean cloud shape
      const d = `
        M ${width * 0.25},${height * 0.7}
        A ${width * 0.15} ${height * 0.25} 0 0 1 ${width * 0.2},${height * 0.4}
        A ${width * 0.18} ${height * 0.3} 0 0 1 ${width * 0.5},${height * 0.2}
        A ${width * 0.2} ${height * 0.32} 0 0 1 ${width * 0.8},${height * 0.38}
        A ${width * 0.15} ${height * 0.25} 0 0 1 ${width * 0.82},${height * 0.7}
        Z
      `;
      return <path d={d} {...commonProps} />;
    }

    case 'actor': {
      const headR = Math.min(width, height) * 0.16;
      const headCy = headR + strokeWidth + 4;
      const bodyTop = headCy + headR + 2;
      const bodyBottom = height * 0.65;
      const armY = bodyTop + (bodyBottom - bodyTop) * 0.3;
      return (
        <g opacity={opacity}>
          {/* Head */}
          <circle cx={width / 2} cy={headCy} r={headR} fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
          {/* Body spine */}
          <line x1={width / 2} y1={bodyTop} x2={width / 2} y2={bodyBottom} stroke={strokeColor} strokeWidth={strokeWidth} />
          {/* Arms */}
          <line x1={width * 0.2} y1={armY} x2={width * 0.8} y2={armY} stroke={strokeColor} strokeWidth={strokeWidth} />
          {/* Left Leg */}
          <line x1={width / 2} y1={bodyBottom} x2={width * 0.25} y2={height - 4} stroke={strokeColor} strokeWidth={strokeWidth} />
          {/* Right Leg */}
          <line x1={width / 2} y1={bodyBottom} x2={width * 0.75} y2={height - 4} stroke={strokeColor} strokeWidth={strokeWidth} />
        </g>
      );
    }

    default:
      return <rect x={0} y={0} width={width} height={height} rx={4} ry={4} {...commonProps} />;
  }
};
