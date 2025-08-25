import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  ILoadOptionsFunctions,
  INodePropertyOptions,
  NodeOperationError,
  NodeConnectionType,
} from 'n8n-workflow';
import FormData from 'form-data';

export class LeadTable implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'LeadTable',
    name: 'leadTable',
    icon: 'fa:table',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Integration with LeadTable API (powered by agentur-systeme.de)',
    defaults: {
      name: 'LeadTable',
      // @ts-expect-error -- required by n8n linter
      description: 'LeadTable integration node',
    },
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    credentials: [
      {
        name: 'leadTableApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
         { name: 'Auth', value: 'auth' },
  { name: 'Campaign', value: 'campaign' },
  { name: 'Customer', value: 'customer' },
  { name: 'Lead', value: 'lead' },
  { name: 'Webhook', value: 'webhook' },
        ],
        default: 'lead',
      },

      // Lead Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['lead'],
          },
        },
        options: [
          {
            name: 'Add File',
            value: 'addFile',
            description: 'Upload a file to a lead',
            action: 'Add file to lead',
          },
          {
            name: 'Create',
            value: 'create',
            description: 'Create a new lead',
            action: 'Create a lead',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Get a lead by ID',
            action: 'Get a lead',
          },
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
          {
            name: 'Update',
            value: 'update',
            description: 'Update lead information',
            action: 'Update a lead',
          },
          {
            name: 'Update Description',
            value: 'updateDescription',
            description: 'Update lead description',
            action: 'Update lead description',
          },
   
          
          
        ],
        default: 'create',
      },

      // Campaign Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['campaign'],
          },
        },
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

      // Customer Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['customer'],
          },
        },
        options: [
          {
            name: 'Get Many',
            value: 'getAll',
            description: 'Get many customers',
            action: 'Get many customers',
          },
        ],
        default: 'getAll',
      },

      // Webhook Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['webhook'],
          },
        },
        options: [
          {
            name: 'Attach',
            value: 'attach',
            description: 'Attach a webhook',
            action: 'Attach webhook',
          },
          {
            name: 'Remove',
            value: 'remove',
            description: 'Remove a webhook',
            action: 'Remove webhook',
          },
          {
            name: 'Poll',
            value: 'poll',
            description: 'Poll for webhook events',
            action: 'Poll webhook events',
          },
        ],
        default: 'attach',
      },

      // Auth Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['auth'],
          },
        },
        options: [
          {
            name: 'Check',
            value: 'check',
            description: 'Check authentication',
            action: 'Check authentication',
          },
        ],
        default: 'check',
      },

      // Lead Create Fields
      {
        displayName: 'Customer Name or ID',
        name: 'customerForLeadCreate',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getCustomers',
        },
        required: true,
        displayOptions: {
          show: {
            resource: ['lead'],
            operation: ['create'],
          },
        },
        default: '',
        description: 'First select a customer for the new lead. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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
        displayOptions: {
          show: {
            resource: ['lead'],
            operation: ['create'],
          },
        },
        default: '',
        description: 'Then select a campaign for this customer. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
      },

      {
        displayName: 'Lead Data',
        name: 'leadData',
        placeholder: 'Add Lead Data',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
        },
        displayOptions: {
          show: {
            resource: ['lead'],
            operation: ['create'],
          },
        },
        default: {},
        options: [
          {
            name: 'data',
            displayName: 'Data',
            values: [
              {
                displayName: 'Key',
                name: 'key',
                type: 'string',
                default: '',
                description: 'The field name',
              },
              {
                displayName: 'Value',
                name: 'value',
                type: 'string',
                default: '',
                description: 'The field value',
              },
            ],
          },
        ],
      },

      // Lead ID field for various operations
      {
        displayName: 'Lead ID',
        name: 'leadId',
        type: 'string',
        required: true,
        displayOptions: {
          show: {
            resource: ['lead'],
            operation: ['get', 'update', 'updateDescription', 'addFile'],
          },
        },
        default: '',
        description: 'The ID of the lead',
      },

      // Lead Update Fields
      {
        displayName: 'Question',
        name: 'question',
        type: 'string',
        required: true,
        displayOptions: {
          show: {
            resource: ['lead'],
            operation: ['update'],
          },
        },
        default: '',
        description: 'The question field to update',
      },
      {
        displayName: 'Answer',
        name: 'answer',
        type: 'string',
        required: true,
        displayOptions: {
          show: {
            resource: ['lead'],
            operation: ['update'],
          },
        },
        default: '',
        description: 'The answer for the question',
      },
      {
        displayName: 'Set Visible in Profile',
        name: 'setVisibleInProfile',
        type: 'boolean',
        displayOptions: {
          show: {
            resource: ['lead'],
            operation: ['update'],
          },
        },
        default: false,
        description: 'Whether to make this question visible in the lead profile',
      },

      // Lead Description Update
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        required: true,
        displayOptions: {
          show: {
            resource: ['lead'],
            operation: ['updateDescription'],
          },
        },
        default: '',
        description: 'The new description for the lead',
      },

      // Lead Get Options
      {
        displayName: 'Plain Description',
        name: 'plainDescription',
        type: 'boolean',
        displayOptions: {
          show: {
            resource: ['lead'],
            operation: ['get'],
          },
        },
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
        displayOptions: {
          show: {
            resource: ['lead'],
            operation: ['searchByEmail'],
          },
        },
        default: '',
        description: 'Email address to search for',
      },

      // ===== FIXED: CUSTOMER SELECTION FOR CAMPAIGN OPERATIONS =====
      {
        displayName: 'Customer Name or ID',
        name: 'customerId',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getCustomers',
        },
        required: true,
        displayOptions: {
          show: {
            resource: ['campaign'],
            operation: ['getAll'],
          },
        },
        default: '',
        description: 'Select the customer to get campaigns for. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
      },

      // ===== WORKING SOLUTION: 2-STEP APPROACH FOR LEADS =====
      {
        displayName: 'Customer Name or ID',
        name: 'customerForLeads',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getCustomers',
        },
        required: true,
        displayOptions: {
          show: {
            resource: ['lead'],
            operation: ['getByCampaign'],
          },
        },
        default: '',
        description: 'First select a customer. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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
        displayOptions: {
          show: {
            resource: ['lead'],
            operation: ['getByCampaign'],
          },
        },
        default: '',
        description: 'Then select a campaign for the customer above. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
      },

      // Pagination fields
      {
        displayName: 'Page',
        name: 'page',
        type: 'number',
        displayOptions: {
          show: {
            resource: ['lead', 'customer'],
            operation: ['getByCampaign', 'searchByEmail', 'getAll'],
          },
        },
        default: 1,
        description: 'Page number for pagination',
      },
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
								typeOptions: {
									minValue: 1,
								},
        displayOptions: {
          show: {
            resource: ['lead', 'customer'],
            operation: ['getByCampaign', 'searchByEmail', 'getAll'],
          },
        },
        default: 50,
        description: 'Max number of results to return',
      },

      // File upload fields
      {
        displayName: 'Input Data Field Name',
        name: 'binaryPropertyName',
        type: 'string',
        default: 'data',
        required: true,
        displayOptions: {
          show: {
            resource: ['lead'],
            operation: ['addFile'],
          },
        },
        description: 'Name of the binary property which contains the file data to be uploaded',
      },

      // Webhook fields
      {
        displayName: 'Campaign ID',
        name: 'campaignId',
        type: 'string',
        required: true,
        displayOptions: {
          show: {
            resource: ['webhook'],
            operation: ['attach', 'poll'],
          },
        },
        default: '',
        description: 'The ID of the campaign',
      },
      {
        displayName: 'Webhook URL',
        name: 'webhookUrl',
        type: 'string',
        required: true,
        displayOptions: {
          show: {
            resource: ['webhook'],
            operation: ['attach', 'remove'],
          },
        },
        default: '',
        description: 'The URL for the webhook',
      },
      {
        displayName: 'Topic',
        name: 'topic',
        type: 'options',
        required: true,
        displayOptions: {
          show: {
            resource: ['webhook'],
            operation: ['attach', 'remove', 'poll'],
          },
        },
        options: [
          {
            name: 'New Lead',
            value: 'newLead',
          },
          {
            name: 'Change Status',
            value: 'changeStatus',
          },
          {
            name: 'Update Lead',
            value: 'updateLead',
          },
          {
            name: 'Delete Lead',
            value: 'deleteLead',
          },
        ],
        default: 'newLead',
        description: 'The webhook topic',
      },
      {
        displayName: 'Layer',
        name: 'layer',
        type: 'options',
        required: true,
        displayOptions: {
          show: {
            resource: ['webhook'],
            operation: ['attach', 'remove'],
          },
        },
        options: [
          {
            name: 'Agency',
            value: 'agency',
          },
          {
            name: 'Table',
            value: 'table',
          },
          {
            name: 'Campaign',
            value: 'campaign',
          },
        ],
        default: 'campaign',
        description: 'The layer to attach the webhook to',
      },
      {
        displayName: 'ID',
        name: 'id',
        type: 'string',
        required: true,
        displayOptions: {
          show: {
            resource: ['webhook'],
            operation: ['remove'],
          },
        },
        default: '',
        description: 'The ID of the related entity',
      },
      {
        displayName: 'Related ID',
        name: 'relatedId',
        type: 'string',
        displayOptions: {
          show: {
            resource: ['webhook'],
            operation: ['remove'],
            layer: ['table'],
          },
        },
        default: '',
        description: 'The related ID (required if layer is table)',
      },
    ],
  };

  methods = {
    loadOptions: {
      // Customer loading mit Response-Log
      async getCustomers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        try {
          const credentials = await this.getCredentials('leadTableApi');

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl || 'https://api.lead-table.com/api/v3/external'}/customer/all`,
            headers: {
              'x-api-key': String(credentials.apiKey).trim(),
              email: String(credentials.email).trim(),
              'Content-Type': 'application/json',
            },
            json: true,
          };

          const response = await this.helpers.request(options);
          this.logger.debug('Raw /customer/all response', response);

          // Deklariere customers hier
          let customers: any[] = [];

          // Fall 1: Array mit customers
          if (Array.isArray(response) && response[0]?.customers) {
            customers = response[0].customers;
          }

          // Fall 2: Objekt mit customers
          else if (response?.customers && Array.isArray(response.customers)) {
            customers = response.customers;
          }

          if (customers.length === 0) {
            this.logger.error('Keine customers gefunden!', response);
          }

          return customers.map((customer: any) => ({
            name: customer.name ?? `Customer ${customer._id}`,
            value: customer._id,
            description: customer.createdAt
              ? `Created: ${new Date(customer.createdAt).toLocaleDateString()}`
              : undefined,
          }));
        } catch (error: any) {
          const errorMessage = error?.response?.body?.message || error.message || 'Unknown error';
          throw new NodeOperationError(this.getNode(), `Failed to load customers: ${errorMessage}`);
        }
      },

      // FIXED: Campaign loading mit loadOptionsDependsOn
      async getCampaignsForCustomer(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        try {
          const customerForLeadCreate = this.getCurrentNodeParameter('customerForLeadCreate') as string | undefined;
          const customerForLeads = this.getCurrentNodeParameter('customerForLeads') as string | undefined;
          const customerId = customerForLeadCreate || customerForLeads || '';
          if (!customerId) {
            return [
              {
                name: 'Please Select a Customer First',
                value: 'no-customer-selected',
                description: 'You must select a customer before campaigns can be loaded',
              },
            ];
          }

          const credentials = await this.getCredentials('leadTableApi');

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl || 'https://api.lead-table.com/api/v3/external'}/campaign/all/${customerId}`,
            headers: {
              'x-api-key': String(credentials.apiKey).trim(),
              email: String(credentials.email).trim(),
              'Content-Type': 'application/json',
            },
            json: true,
          };

          const response = await this.helpers.request(options);
          this.logger.debug('Raw /campaign/all response', response);

          // Deklariere campaigns hier
          let campaigns: any[] = [];

          // Fall 1: Array mit campaigns
          if (Array.isArray(response) && response[0]?.campaigns) {
            campaigns = response[0].campaigns;
          }

          // Fall 2: Objekt mit campaigns
          else if (response?.campaigns && Array.isArray(response.campaigns)) {
            campaigns = response.campaigns;
          }

          if (campaigns.length === 0) {
            this.logger.error('Keine campaigns gefunden!', response);
            return [
              {
                name: 'No Campaigns Found for This Customer',
                value: 'no-campaigns-found',
                description: 'This customer has no campaigns available',
              },
            ];
          }

          return campaigns.map((campaign: any) => ({
            name: campaign.name ?? campaign.occupation ?? `Campaign ${campaign._id}`,
            value: campaign._id,
            description: campaign.leadsCount ? `Leads: ${campaign.leadsCount}` : undefined,
          }));
        } catch (error: any) {
          const errorMessage = error?.response?.body?.message || error.message || 'Unknown error';
          return [
            {
              name: `Error loading campaigns: ${errorMessage}`,
              value: 'error-loading',
              description: 'Please check your customer selection and credentials',
            },
          ];
        }
      },
    },
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const resource = this.getNodeParameter('resource', 0);
    const operation = this.getNodeParameter('operation', 0);

    // Get credentials
    const credentials = await this.getCredentials('leadTableApi');
    const apiKey = credentials.apiKey as string;
    const email = credentials.email as string;
    const baseUrl = (credentials.baseUrl as string) || 'https://api.lead-table.com/api/v3/external';

    for (let i = 0; i < items.length; i++) {
      try {
        let responseData;

        if (resource === 'auth') {
          if (operation === 'check') {
            responseData = await makeApiRequest.call(this, 'GET', '/auth', {}, {}, apiKey, email, baseUrl);
          }
        } else if (resource === 'lead') {
          if (operation === 'create') {
            const campaignId = this.getNodeParameter('campaignId', i) as string;
            const leadData = this.getNodeParameter('leadData', i) as any;

            const body = {
              campaignID: campaignId,
              data: leadData.data || [],
            };

            responseData = await makeApiRequest.call(this, 'POST', '/lead/create', {}, body, apiKey, email, baseUrl);
          } else if (operation === 'get') {
            const leadId = this.getNodeParameter('leadId', i) as string;
            const plainDescription = this.getNodeParameter('plainDescription', i) as boolean;

            const qs: any = {};
            if (plainDescription) {
              qs.plainDescription = 'true';
            }

            responseData = await makeApiRequest.call(this, 'GET', `/lead/${leadId}`, qs, {}, apiKey, email, baseUrl);
          } else if (operation === 'update') {
            const leadId = this.getNodeParameter('leadId', i) as string;
            const question = this.getNodeParameter('question', i) as string;
            const answer = this.getNodeParameter('answer', i) as string;
            const setVisibleInProfile = this.getNodeParameter('setVisibleInProfile', i) as boolean;

            const body = {
              question,
              answer,
              setVisibleInProfile,
            };

            responseData = await makeApiRequest.call(this, 'PUT', `/lead/${leadId}`, {}, body, apiKey, email, baseUrl);
          } else if (operation === 'updateDescription') {
            const leadId = this.getNodeParameter('leadId', i) as string;
            const description = this.getNodeParameter('description', i) as string;

            const body = {
              description,
            };

            responseData = await makeApiRequest.call(
              this,
              'PUT',
              `/lead/${leadId}/description`,
              {},
              body,
              apiKey,
              email,
              baseUrl,
            );
          } else if (operation === 'searchByEmail') {
            const emailToSearch = this.getNodeParameter('email', i) as string;
            const page = this.getNodeParameter('page', i) as number;
            const limit = this.getNodeParameter('limit', i) as number;

            const qs = { page, limit };

            responseData = await makeApiRequest.call(
              this,
              'GET',
              `/searchLeadByMail/${emailToSearch}`,
              qs,
              {},
              apiKey,
              email,
              baseUrl,
            );
          } else if (operation === 'getByCampaign') {
            const campaignId = this.getNodeParameter('campaignId', i) as string;

            // Skip execution if placeholder values are selected
            if (
              campaignId === 'no-customer-selected' ||
              campaignId === 'no-campaigns-found' ||
              campaignId === 'error-loading'
            ) {
              throw new NodeOperationError(
                this.getNode(),
                'Please select a valid campaign. Make sure to select a customer first, then choose a campaign from the dropdown.',
                { itemIndex: i },
              );
            }

            const page = this.getNodeParameter('page', i) as number;
            const limit = this.getNodeParameter('limit', i) as number;

            const qs = { page, limit };

            responseData = await makeApiRequest.call(
              this,
              'GET',
              `/lead/campaign/${campaignId}`,
              qs,
              {},
              apiKey,
              email,
              baseUrl,
            );
          } else if (operation === 'addFile') {
  const leadId = this.getNodeParameter('leadId', i) as string;
  const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;

  const buffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
  const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);

  const form = new FormData();
  form.append('file', buffer, {
    filename: binaryData.fileName || 'upload.bin',
    contentType: binaryData.mimeType || 'application/octet-stream',
  });
  form.append('id', leadId);

  responseData = await makeApiRequest.call(
    this,
    'POST',
    '/addFile',
    {},          // qs
    form,        // body
    apiKey,
    email,
    baseUrl,
    true,        
  );
}

        } else if (resource === 'campaign') {
          if (operation === 'getAll') {
            const customerId = this.getNodeParameter('customerId', i) as string;
            responseData = await makeApiRequest.call(
              this,
              'GET',
              `/campaign/all/${customerId}`,
              {},
              {},
              apiKey,
              email,
              baseUrl,
            );
          }
        } else if (resource === 'customer') {
          if (operation === 'getAll') {
            const page = this.getNodeParameter('page', i) as number;
            const limit = this.getNodeParameter('limit', i) as number;

            const qs = { page, limit };

            responseData = await makeApiRequest.call(this, 'GET', '/customer/all', qs, {}, apiKey, email, baseUrl);
          }
        } else if (resource === 'webhook') {
          if (operation === 'attach') {
            const campaignId = this.getNodeParameter('campaignId', i) as string;
            const webhookUrl = this.getNodeParameter('webhookUrl', i) as string;
            const topic = this.getNodeParameter('topic', i) as string;
            const layer = this.getNodeParameter('layer', i) as string;

            const body = {
              campaignID: campaignId,
              url: webhookUrl,
              topic,
              layer,
            };

            responseData = await makeApiRequest.call(this, 'POST', '/attachWebhook', {}, body, apiKey, email, baseUrl);
          } else if (operation === 'remove') {
            const topic = this.getNodeParameter('topic', i) as string;
            const layer = this.getNodeParameter('layer', i) as string;
            const id = this.getNodeParameter('id', i) as string;
            const webhookUrl = this.getNodeParameter('webhookUrl', i) as string;
            const relatedId = this.getNodeParameter('relatedId', i, '') as string;

            const qs: any = {
              topic,
              layer,
              id,
              url: webhookUrl,
            };

            if (relatedId) {
              qs.relatedID = relatedId;
            }

            responseData = await makeApiRequest.call(this, 'DELETE', '/removeWebhook', qs, {}, apiKey, email, baseUrl);
          } else if (operation === 'poll') {
            const campaignId = this.getNodeParameter('campaignId', i) as string;
            const topic = this.getNodeParameter('topic', i) as string;

            responseData = await makeApiRequest.call(
              this,
              'GET',
              `/pollWebhook/${campaignId}/${topic}`,
              {},
              {},
              apiKey,
              email,
              baseUrl,
            );
          }
        }

        const executionData = this.helpers.constructExecutionMetaData(
          this.helpers.returnJsonArray(responseData as any),
          { itemData: { item: i } },
        );

        returnData.push(...executionData);
      } catch (error) {
        if (this.continueOnFail()) {
          const executionData = this.helpers.constructExecutionMetaData(
            this.helpers.returnJsonArray({ error: (error as Error).message }),
            { itemData: { item: i } },
          );
          returnData.push(...executionData);
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}

// Verbesserte API Request Funktion mit n8n-Logger
async function makeApiRequest(
  this: IExecuteFunctions,
  method: string,
  endpoint: string,
  qs: any = {},
  body: any = {},
  apiKey: string,
  email: string,
  baseUrl: string,
  isFormData: boolean = false,
) {
  const url = `${baseUrl}${endpoint}`;

  this.logger.debug('=== LeadTable API Request ===', {
    method,
    url,
    apiKeyPreview: apiKey.substring(0, 10) + '...',
    email,
    query: qs,
  });

  const options: any = {
    method,
    url,
    headers: {
      'x-api-key': String(apiKey).trim(),
      email: String(email).trim(),
      accept: 'application/json',
    },
    qs,
    json: true,
  };

  if (isFormData) {
    options.body = body;
    delete options.headers['content-type'];
  } else if (Object.keys(body).length > 0) {
    options.body = body;
    options.headers['content-type'] = 'application/json';
  }

  try {
    const response = await this.helpers.request(options);

    this.logger.debug('LeadTable API Raw Response', {
      url,
      raw: response, // vollständige Response loggen
    });

    return response; // <-- Body direkt zurückgeben
  } catch (error: any) {
    this.logger.error('LeadTable API Error', {
      url,
      statusCode: error.statusCode,
      message: error.message,
      body: error.response?.body,
    });

    let errorMessage = `LeadTable API request failed: ${error.statusCode || 'UNKNOWN'}`;

    if (error.statusCode === 403) {
      errorMessage += ' - Authentication failed. Please check your API Key and Email address.';
    } else if (error.response?.body?.error) {
      errorMessage += ` - "${error.response.body.error}"`;
    } else if (error.message) {
      errorMessage += ` - "${error.message}"`;
    }

    throw new NodeOperationError(this.getNode(), errorMessage);
  }
}
