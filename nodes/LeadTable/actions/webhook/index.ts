import type { INodeProperties } from 'n8n-workflow';

export const webhookProperties: INodeProperties[] = [
  // Operation
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['webhook'] } },
    options: [
      { name: 'Attach', value: 'attach', description: 'Attach a webhook', action: 'Attach webhook' },
      { name: 'Remove', value: 'remove', description: 'Remove a webhook', action: 'Remove webhook' },
      { name: 'Poll', value: 'poll', description: 'Poll for webhook events', action: 'Poll webhook events' },
    ],
    default: 'attach',
  },
  // Layer selection (attach/remove)
  {
    displayName: 'Layer',
    name: 'layer',
    type: 'options',
    required: true,
    displayOptions: { show: { resource: ['webhook'], operation: ['attach', 'remove'] } },
    options: [
      { name: 'Agency', value: 'agency', description: 'Attach webhook to agency level (all campaigns)' },
      { name: 'Table', value: 'table', description: 'Attach webhook to specific table/campaign' },
    ],
    default: 'table',
    description: 'The layer to attach the webhook to',
  },
  // Poll (reuse 2-step selection)
  {
    displayName: 'Customer Name or ID',
    name: 'customerForLeads',
    type: 'options',
    typeOptions: { loadOptionsMethod: 'getCustomers' },
    required: true,
    displayOptions: { show: { resource: ['webhook'], operation: ['poll'] } },
    default: '',
    description:
      'First select a customer. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
  },
  {
    displayName: 'Campaign Name or ID',
    name: 'campaignId',
    type: 'options',
    typeOptions: {
      loadOptionsMethod: 'getCampaignsForCustomer',
      loadOptionsDependsOn: ['customerForLeads'],
    },
    required: true,
    displayOptions: { show: { resource: ['webhook'], operation: ['poll'] } },
    default: '',
    description:
      'Then select a campaign for the customer above. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
  },

  // Attach / Remove shared fields
  {
    displayName: 'Webhook URL',
    name: 'webhookUrl',
    type: 'string',
    required: true,
    displayOptions: { show: { resource: ['webhook'], operation: ['attach', 'remove'] } },
    default: '',
    description: 'The URL for the webhook',
  },
  {
    displayName: 'Topic Name or ID',
    name: 'topic',
    type: 'options',
    required: true,
    displayOptions: { show: { resource: ['webhook'], operation: ['attach', 'remove', 'poll'] } },
    typeOptions: {
      loadOptionsMethod: 'getWebhookTopics',
      loadOptionsDependsOn: ['layer', 'operation'],
    },
    default: '',
    description:
      'The webhook topic. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
  },

  // UX notice for newTable topic when layer is table
  {
    displayName: '⚠️ newTable events are only available on Agency level. Please change Layer to Agency.',
    name: 'newTableNotice',
    type: 'notice',
    displayOptions: { show: { resource: ['webhook'], operation: ['attach'], topic: ['newTable'], layer: ['table'] } },
    default: '',
  },

  // Attach (table-layer requires customer & campaign)
  {
    displayName: 'Customer Name or ID',
    name: 'customerForLeads',
    type: 'options',
    typeOptions: { loadOptionsMethod: 'getCustomers' },
    displayOptions: { show: { resource: ['webhook'], operation: ['attach'], layer: ['table'] } },
    default: '',
    description:
      'First select a customer. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
  },
  {
    displayName: 'Campaign Name or ID',
    name: 'campaignId',
    type: 'options',
    typeOptions: {
      loadOptionsMethod: 'getCampaignsForCustomer',
      loadOptionsDependsOn: ['customerForLeads'],
    },
    required: true,
    displayOptions: { show: { resource: ['webhook'], operation: ['attach'], layer: ['table'] } },
    default: '',
    description:
      'The ID of the campaign (required for table layer). Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
  },

  // Remove (agency-layer)
  {
    displayName: 'Agency ID',
    name: 'id',
    type: 'string',
    required: true,
    displayOptions: { show: { resource: ['webhook'], operation: ['remove'], layer: ['agency'] } },
    default: '',
    description: 'The ID of the agency',
  },

  // Remove (table-layer)
  {
    displayName: 'Customer ID - Related Name or ID',
    name: 'relatedId',
    type: 'options',
    typeOptions: { loadOptionsMethod: 'getCustomers' },
    required: true,
    displayOptions: { show: { resource: ['webhook'], operation: ['remove'], layer: ['table'] } },
    default: '',
    description:
      'The customer ID or related ID (required if layer is table). Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
  },
  {
    displayName: 'Campaign ID - Table Name or ID',
    name: 'id',
    type: 'options',
    typeOptions: {
      loadOptionsMethod: 'getCampaignsForCustomer',
      loadOptionsDependsOn: ['relatedId'],
    },
    required: true,
    displayOptions: { show: { resource: ['webhook'], operation: ['remove'], layer: ['table'] } },
    default: '',
    description:
      'The ID of the related entity. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
  },
];
