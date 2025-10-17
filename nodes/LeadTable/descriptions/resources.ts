import type { INodeProperties } from 'n8n-workflow';

export const resourceSelector: INodeProperties = {
  displayName: 'Resource',
  name: 'resource',
  type: 'options',
  noDataExpression: true,
  options: [
    { name: 'Auth', value: 'auth' },
    { name: 'Campaign', value: 'campaign' },
    { name: 'Customer', value: 'customer' },
    { name: 'Lead', value: 'lead' },
    { name: 'Table', value: 'table' },
    { name: 'Webhook', value: 'webhook' },
  ],
  default: 'lead',
};
