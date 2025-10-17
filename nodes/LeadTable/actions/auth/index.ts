import type { INodeProperties } from 'n8n-workflow';

export const authProperties: INodeProperties[] = [
  // Operation
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['auth'] } },
    options: [{ name: 'Check', value: 'check', description: 'Check authentication', action: 'Check authentication' }],
    default: 'check',
  },
];
