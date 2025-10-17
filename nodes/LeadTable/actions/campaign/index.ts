import type { INodeProperties } from 'n8n-workflow';

export const campaignProperties: INodeProperties[] = [
  // Operation
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['campaign'] } },
    options: [
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many campaigns for a customer',
        action: 'Get many campaigns',
      },
    ],
    default: 'getAll',
  },

  // Required customer for getAll
  {
    displayName: 'Customer Name or ID',
    name: 'customerId',
    type: 'options',
    typeOptions: { loadOptionsMethod: 'getCustomers' },
    required: true,
    displayOptions: { show: { resource: ['campaign'], operation: ['getAll'] } },
    default: '',
    description:
      'Select the customer to get campaigns for. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
  },

  // Pagination (campaigns)
  {
    displayName: 'Page',
    name: 'page',
    type: 'number',
    displayOptions: { show: { resource: ['campaign'], operation: ['getAll'] } },
    default: 1,
    description: 'Page number for pagination',
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    typeOptions: { minValue: 1 },
    displayOptions: { show: { resource: ['campaign'], operation: ['getAll'] } },
    default: 50,
    description: 'Max number of results to return',
  },
];
