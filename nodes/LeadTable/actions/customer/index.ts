import type { INodeProperties } from 'n8n-workflow';

export const customerProperties: INodeProperties[] = [
  // Operation
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['customer'] } },
    options: [
      { name: 'Get Many', value: 'getAll', description: 'Get many customers', action: 'Get many customers' },
      { name: 'Create', value: 'create', description: 'Create a new customer', action: 'Create a customer' },
    ],
    default: 'getAll',
  },

  // Create fields
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    displayOptions: { show: { resource: ['customer'], operation: ['create'] } },
    default: '',
    description: 'The name of the customer (e.g. "Acme Corporation")',
  },
  {
    displayName: 'Description',
    name: 'description',
    type: 'string',
    displayOptions: { show: { resource: ['customer'], operation: ['create'] } },
    default: '',
    description: 'Optional description of the customer',
  },

  // Pagination (customers)
  {
    displayName: 'Page',
    name: 'page',
    type: 'number',
    displayOptions: { show: { resource: ['customer'], operation: ['getAll'] } },
    default: 1,
    description: 'Page number for pagination',
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    typeOptions: { minValue: 1 },
    displayOptions: { show: { resource: ['customer'], operation: ['getAll'] } },
    default: 50,
    description: 'Max number of results to return',
  },
];
