import type { INodeProperties } from 'n8n-workflow';

export const leadProperties: INodeProperties[] = [
  // Operation
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['lead'] } },
    options: [
      { name: 'Add File', value: 'addFile', description: 'Upload a file to a lead', action: 'Add file to lead' },
      { name: 'Create', value: 'create', description: 'Create a new lead', action: 'Create a lead' },
      { name: 'Get', value: 'get', description: 'Get a lead by ID', action: 'Get a lead' },
      {
        name: 'Get by Campaign',
        value: 'getByCampaign',
        description: 'Get all leads in a campaign',
        action: 'Get leads by campaign',
      },
      {
        name: 'Search by Email',
        value: 'searchByEmail',
        description: 'Search leads by email',
        action: 'Search leads by email',
      },
      { name: 'Update', value: 'update', description: 'Update lead information', action: 'Update a lead' },
      {
        name: 'Update Description',
        value: 'updateDescription',
        description: 'Update lead description',
        action: 'Update lead description',
      },
    ],
    default: 'create',
  },

  // Create: customer & campaign selection
  {
    displayName: 'Customer Name or ID',
    name: 'customerForLeadCreate',
    type: 'options',
    typeOptions: { loadOptionsMethod: 'getCustomers' },
    required: true,
    displayOptions: { show: { resource: ['lead'], operation: ['create'] } },
    default: '',
    description:
      'First select a customer for the new lead. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
  },
  {
    displayName: 'Campaign Name or ID',
    name: 'campaignId',
    type: 'options',
    typeOptions: {
      loadOptionsMethod: 'getCampaignsForCustomer',
      loadOptionsDependsOn: ['customerForLeadCreate'],
    },
    required: true,
    displayOptions: { show: { resource: ['lead'], operation: ['create'] } },
    default: '',
    description:
      'Then select a campaign for this customer. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
  },

  // Create: lead data collection
  {
    displayName: 'Lead Data',
    name: 'leadData',
    placeholder: 'Add Lead Data',
    type: 'fixedCollection',
    typeOptions: { multipleValues: true },
    displayOptions: { show: { resource: ['lead'], operation: ['create'] } },
    default: {},
    options: [
      {
        name: 'data',
        displayName: 'Data',
        values: [
          { displayName: 'Key', name: 'key', type: 'string', default: '', description: 'The field name' },
          { displayName: 'Value', name: 'value', type: 'string', default: '', description: 'The field value' },
        ],
      },
    ],
  },

  // Shared: lead id for various ops
  {
    displayName: 'Lead ID',
    name: 'leadId',
    type: 'string',
    required: true,
    displayOptions: { show: { resource: ['lead'], operation: ['get', 'update', 'updateDescription', 'addFile'] } },
    default: '',
    description: 'The ID of the lead',
  },

  // Update (Q/A)
  {
    displayName: 'Question',
    name: 'question',
    type: 'string',
    required: true,
    displayOptions: { show: { resource: ['lead'], operation: ['update'] } },
    default: '',
    description: 'The question field to update',
  },
  {
    displayName: 'Answer',
    name: 'answer',
    type: 'string',
    required: true,
    displayOptions: { show: { resource: ['lead'], operation: ['update'] } },
    default: '',
    description: 'The answer for the question',
  },
  {
    displayName: 'Set Visible in Profile',
    name: 'setVisibleInProfile',
    type: 'boolean',
    displayOptions: { show: { resource: ['lead'], operation: ['update'] } },
    default: false,
    description: 'Whether to make this question visible in the lead profile',
  },

  // Update Description
  {
    displayName: 'Description',
    name: 'description',
    type: 'string',
    required: true,
    displayOptions: { show: { resource: ['lead'], operation: ['updateDescription'] } },
    default: '',
    description: 'The new description for the lead',
  },

  // Get options
  {
    displayName: 'Plain Description',
    name: 'plainDescription',
    type: 'boolean',
    displayOptions: { show: { resource: ['lead'], operation: ['get'] } },
    default: false,
    description: 'Whether to sanitize the description to plain text',
  },

  // Search by Email
  {
    displayName: 'Email',
    name: 'email',
    type: 'string',
    placeholder: 'name@email.com',
    required: true,
    displayOptions: { show: { resource: ['lead'], operation: ['searchByEmail'] } },
    default: '',
    description: 'Email address to search for',
  },

  // Get by Campaign (2-step)
  {
    displayName: 'Customer Name or ID',
    name: 'customerForLeads',
    type: 'options',
    typeOptions: { loadOptionsMethod: 'getCustomers' },
    required: true,
    displayOptions: { show: { resource: ['lead'], operation: ['getByCampaign'] } },
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
    displayOptions: { show: { resource: ['lead'], operation: ['getByCampaign'] } },
    default: '',
    description:
      'Then select a campaign for the customer above. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
  },

  // Pagination (lead)
  {
    displayName: 'Page',
    name: 'page',
    type: 'number',
    displayOptions: { show: { resource: ['lead'], operation: ['getByCampaign', 'searchByEmail'] } },
    default: 1,
    description: 'Page number for pagination',
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    typeOptions: { minValue: 1 },
    displayOptions: { show: { resource: ['lead'], operation: ['getByCampaign', 'searchByEmail'] } },
    default: 50,
    description: 'Max number of results to return',
  },

  // File upload
  {
    displayName: 'Input Data Field Name',
    name: 'binaryPropertyName',
    type: 'string',
    default: 'data',
    required: true,
    displayOptions: { show: { resource: ['lead'], operation: ['addFile'] } },
    description: 'Name of the binary property which contains the file data to be uploaded',
  },
];
