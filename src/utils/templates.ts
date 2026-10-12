import { TemplateDefinition } from '../types';

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: 'process-flow',
    title: 'Flujo de Proceso y Decisión',
    description: 'Flujograma empresarial clásico con inicio, validación condicional y salidas.',
    category: 'Procesos',
    nodes: [
      {
        id: 'node-start',
        type: 'terminal',
        x: 100,
        y: 180,
        width: 140,
        height: 50,
        label: 'Inicio del Proceso',
        style: {
          fillColor: '#dbeafe',
          strokeColor: '#2563eb',
          strokeWidth: 2,
          strokeStyle: 'solid',
          textColor: '#1e3a8a',
          fontSize: 14,
          fontWeight: 'bold',
          textAlign: 'center',
          opacity: 1
        }
      },
      {
        id: 'node-process-1',
        type: 'process',
        x: 320,
        y: 175,
        width: 160,
        height: 60,
        label: 'Captura de Datos del Cliente',
        style: {
          fillColor: '#ffffff',
          strokeColor: '#3b82f6',
          strokeWidth: 2,
          strokeStyle: 'solid',
          textColor: '#0f172a',
          fontSize: 13,
          fontWeight: 'normal',
          textAlign: 'center',
          opacity: 1
        }
      },
      {
        id: 'node-decision',
        type: 'decision',
        x: 560,
        y: 160,
        width: 130,
        height: 90,
        label: '¿Documentos\nVálidos?',
        style: {
          fillColor: '#fef3c7',
          strokeColor: '#d97706',
          strokeWidth: 2,
          strokeStyle: 'solid',
          textColor: '#78350f',
          fontSize: 12,
          fontWeight: 'bold',
          textAlign: 'center',
          opacity: 1
        }
      },
      {
        id: 'node-approved',
        type: 'process',
        x: 770,
        y: 175,
        width: 150,
        height: 60,
        label: 'Aprobar y Emitir Factura',
        style: {
          fillColor: '#dcfce7',
          strokeColor: '#16a34a',
          strokeWidth: 2,
          strokeStyle: 'solid',
          textColor: '#14532d',
          fontSize: 13,
          fontWeight: 'normal',
          textAlign: 'center',
          opacity: 1
        }
      },
      {
        id: 'node-reject',
        type: 'process',
        x: 550,
        y: 330,
        width: 150,
        height: 60,
        label: 'Solicitar Corrección al Cliente',
        style: {
          fillColor: '#fee2e2',
          strokeColor: '#dc2626',
          strokeWidth: 2,
          strokeStyle: 'solid',
          textColor: '#7f1d1d',
          fontSize: 13,
          fontWeight: 'normal',
          textAlign: 'center',
          opacity: 1
        }
      },
      {
        id: 'node-end',
        type: 'terminal',
        x: 1000,
        y: 180,
        width: 120,
        height: 50,
        label: 'Fin',
        style: {
          fillColor: '#f1f5f9',
          strokeColor: '#64748b',
          strokeWidth: 2,
          strokeStyle: 'solid',
          textColor: '#334155',
          fontSize: 14,
          fontWeight: 'bold',
          textAlign: 'center',
          opacity: 1
        }
      }
    ],
    connections: [
      {
        id: 'conn-1',
        fromNodeId: 'node-start',
        fromPort: 'right',
        toNodeId: 'node-process-1',
        toPort: 'left',
        type: 'orthogonal',
        strokeColor: '#3b82f6',
        strokeWidth: 2,
        strokeStyle: 'solid',
        arrowEnd: true,
        arrowStart: false
      },
      {
        id: 'conn-2',
        fromNodeId: 'node-process-1',
        fromPort: 'right',
        toNodeId: 'node-decision',
        toPort: 'left',
        type: 'orthogonal',
        strokeColor: '#3b82f6',
        strokeWidth: 2,
        strokeStyle: 'solid',
        arrowEnd: true,
        arrowStart: false
      },
      {
        id: 'conn-3',
        fromNodeId: 'node-decision',
        fromPort: 'right',
        toNodeId: 'node-approved',
        toPort: 'left',
        type: 'orthogonal',
        label: 'Sí',
        strokeColor: '#16a34a',
        strokeWidth: 2,
        strokeStyle: 'solid',
        arrowEnd: true,
        arrowStart: false
      },
      {
        id: 'conn-4',
        fromNodeId: 'node-decision',
        fromPort: 'bottom',
        toNodeId: 'node-reject',
        toPort: 'top',
        type: 'orthogonal',
        label: 'No',
        strokeColor: '#dc2626',
        strokeWidth: 2,
        strokeStyle: 'solid',
        arrowEnd: true,
        arrowStart: false
      },
      {
        id: 'conn-5',
        fromNodeId: 'node-approved',
        fromPort: 'right',
        toNodeId: 'node-end',
        toPort: 'left',
        type: 'orthogonal',
        strokeColor: '#16a34a',
        strokeWidth: 2,
        strokeStyle: 'solid',
        arrowEnd: true,
        arrowStart: false
      }
    ]
  },
  {
    id: 'architecture-flow',
    title: 'Arquitectura de Sistema Web',
    description: 'Diagrama de componentes con Cliente Web, API Gateway, Microservicio y Base de Datos.',
    category: 'Ingeniería',
    nodes: [
      {
        id: 'arch-client',
        type: 'actor',
        x: 120,
        y: 190,
        width: 90,
        height: 100,
        label: 'Usuario Web / App',
        style: {
          fillColor: '#e0e7ff',
          strokeColor: '#4338ca',
          strokeWidth: 2,
          strokeStyle: 'solid',
          textColor: '#312e81',
          fontSize: 12,
          fontWeight: 'bold',
          textAlign: 'center',
          opacity: 1
        }
      },
      {
        id: 'arch-gateway',
        type: 'process',
        x: 300,
        y: 200,
        width: 150,
        height: 80,
        label: 'API Gateway\n(Rate Limit & Auth)',
        style: {
          fillColor: '#f3e8ff',
          strokeColor: '#7e22ce',
          strokeWidth: 2,
          strokeStyle: 'solid',
          textColor: '#581c87',
          fontSize: 13,
          fontWeight: 'bold',
          textAlign: 'center',
          opacity: 1
        }
      },
      {
        id: 'arch-service',
        type: 'subprocess',
        x: 540,
        y: 200,
        width: 170,
        height: 80,
        label: 'Servicio de Negocio\n(Node.js / Go)',
        style: {
          fillColor: '#ffffff',
          strokeColor: '#0284c7',
          strokeWidth: 2,
          strokeStyle: 'solid',
          textColor: '#0c4a6e',
          fontSize: 13,
          fontWeight: 'bold',
          textAlign: 'center',
          opacity: 1
        }
      },
      {
        id: 'arch-db',
        type: 'database',
        x: 790,
        y: 190,
        width: 130,
        height: 100,
        label: 'Base de Datos\n(PostgreSQL)',
        style: {
          fillColor: '#ecfdf5',
          strokeColor: '#059669',
          strokeWidth: 2,
          strokeStyle: 'solid',
          textColor: '#064e3b',
          fontSize: 13,
          fontWeight: 'bold',
          textAlign: 'center',
          opacity: 1
        }
      }
    ],
    connections: [
      {
        id: 'arch-c1',
        fromNodeId: 'arch-client',
        fromPort: 'right',
        toNodeId: 'arch-gateway',
        toPort: 'left',
        type: 'orthogonal',
        label: 'HTTPS',
        strokeColor: '#4338ca',
        strokeWidth: 2,
        strokeStyle: 'solid',
        arrowEnd: true,
        arrowStart: false
      },
      {
        id: 'arch-c2',
        fromNodeId: 'arch-gateway',
        fromPort: 'right',
        toNodeId: 'arch-service',
        toPort: 'left',
        type: 'orthogonal',
        label: 'gRPC',
        strokeColor: '#7e22ce',
        strokeWidth: 2,
        strokeStyle: 'solid',
        arrowEnd: true,
        arrowStart: false
      },
      {
        id: 'arch-c3',
        fromNodeId: 'arch-service',
        fromPort: 'right',
        toNodeId: 'arch-db',
        toPort: 'left',
        type: 'orthogonal',
        label: 'SQL Pool',
        strokeColor: '#059669',
        strokeWidth: 2,
        strokeStyle: 'solid',
        arrowEnd: true,
        arrowStart: false
      }
    ]
  }
];
