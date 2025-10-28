import type { INodeProperties } from 'n8n-workflow';

export const tableProperties: INodeProperties[] = [
  // Operation
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['table'] } },
    options: [
      {
        name: 'Create Table',
        value: 'createTable',
        description: 'Create a new table (campaign) for a customer',
        action: 'Create table',
      },
    ],
    default: 'createTable',
  },

  // Create Table fields
  {
    displayName: 'Customer Name or ID',
    name: 'customerID',
    type: 'options',
    typeOptions: { loadOptionsMethod: 'getCustomers' },
    required: true,
    default: '',
    displayOptions: { show: { resource: ['table'], operation: ['createTable'] } },
    description:
      'The ID of the customer for whom to create the table. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
  },
  {
    displayName: 'Occupation',
    name: 'occupation',
    type: 'string',
    required: true,
    default: '',
    description: 'Name of the table/campaign (e.g. "Website Leads 2024")',
    displayOptions: { show: { resource: ['table'], operation: ['createTable'] } },
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    default: {},
    displayOptions: { show: { resource: ['table'], operation: ['createTable'] } },
    placeholder: 'Add Field',
    options: [
      {
        displayName: 'Delete Leads',
        name: 'deleteLeads',
        type: 'boolean',
        description: 'Whether delete lead functionality should be visible',
        default: false,
      },
      {
        displayName: 'Funnel Link',
        name: 'funnelLink',
        type: 'string',
        placeholder: 'e.g. https://example.com/funnel',
        default: '',
        description: 'Optional funnel link for the campaign',
      },
      {
        displayName: 'Override Values',
        name: 'overrideValues',
        type: 'json',
        default: '{}',
        description: 'Override values for manual lead creation',
      },
      {
        displayName: 'Pre-Qualify',
        name: 'preQualify',
        type: 'boolean',
        description: 'Whether leads should be pre-qualified',
        default: false,
      },
      {
        displayName: 'Show Duplicate Leads Indicator',
        name: 'showDuplicateLeadsIndicator',
        type: 'boolean',
        default: true,
        description: 'Whether duplicate leads should be marked',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'json',
        default: '[]',
        description: 'Array of status definitions',
      },
      {
        displayName: 'Table And Profile Config',
        name: 'tableAndProfileConfig',
        type: 'json',
        default: '[]',
        description: 'Configuration for table and profile fields',
      },
    ],
  },
];
