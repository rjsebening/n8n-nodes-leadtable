import {
  IHookFunctions,
  IWebhookFunctions,
  IDataObject,
  INodeType,
  INodeTypeDescription,
  IWebhookResponseData,
  NodeOperationError,
  NodeConnectionType,
  ILoadOptionsFunctions,
} from 'n8n-workflow';

export class LeadTableTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'LeadTable Trigger',
    name: 'leadTableTrigger',
    icon: 'fa:table',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["event"]}}',
    description:
      'Trigger workflows on LeadTable events - Integration with LeadTable API (powered by agentur-systeme.de)',
    defaults: {
      name: 'LeadTable Trigger',
    },
    inputs: [],
    outputs: [NodeConnectionType.Main],
    credentials: [
      {
        name: 'leadTableApi',
        required: true,
      },
    ],
    webhooks: [
      {
        name: 'default',
        httpMethod: 'POST',
        responseMode: 'onReceived',
        path: '', // n8n generiert automatisch UUID
      },
    ],
    properties: [
      {
        displayName: 'Event',
        name: 'event',
        type: 'options',
        options: [
          {
            name: 'New Lead Created',
            value: 'newLead',
            description: 'Triggered when a new lead is created',
          },
          {
            name: 'Lead Status Changed',
            value: 'changeStatus',
            description: 'Triggered when a lead status changes',
          },
          {
            name: 'Lead Updated',
            value: 'updateLead',
            description: 'Triggered when a lead is updated',
          },
        ],
        default: 'newLead',
        required: true,
      },
      {
        displayName: 'Webhook Level',
        name: 'webhookLevel',
        type: 'options',
        options: [
          {
            name: 'Agency (Global - All Campaigns)',
            value: 'agency',
            description: 'Receive events from all campaigns in your agency',
          },
          {
            name: 'Customer (All Tables)',
            value: 'customer',
            description: 'Receive events from all tables of a specific customer',
          },
          {
            name: 'Table (Specific Campaign)',
            value: 'table',
            description: 'Receive events from a specific table/campaign only',
          },
        ],
        default: 'table',
        required: true,
      },
      {
        displayName: 'Customer',
        name: 'customerId',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getCustomers',
        },
        displayOptions: {
          show: {
            webhookLevel: ['customer', 'table'],
          },
        },
        default: '',
        required: true,
        description: 'The ID of the customer',
        placeholder: 'e.g., 60d0fe4f5311236168a109ca',
      },
      {
        displayName: 'Campaign',
        name: 'campaignId',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getCampaignsForCustomer',
          loadOptionsDependsOn: ['customerId'],
        },
        displayOptions: {
          show: {
            webhookLevel: ['table'],
          },
        },
        default: '',
        required: true,
        description: 'The ID of the campaign to monitor',
        placeholder: 'e.g., 687e1a6b24a08290d974f2f2',
      },
      {
        displayName: 'Include Lead Details',
        name: 'includeLead',
        type: 'boolean',
        default: true,
        description: 'Whether to automatically fetch full lead details when triggered',
      },
      {
        displayName: 'Info',
        name: 'info',
        type: 'notice',
        default: '',
        displayOptions: {
          show: {},
        },
        description: 'ℹ️ To find IDs: Use LeadTable node with "Customer > Get All", then "Campaign > Get All".',
      },
    ],
  };

  methods = {
    loadOptions: {
      async getCustomers(this: ILoadOptionsFunctions) {
        const credentials = await this.getCredentials('leadTableApi');

        const response = await this.helpers.request({
          method: 'GET',
          url: `${credentials.baseUrl || 'https://api.lead-table.com/api/v3/external'}/customer/all`,
          headers: {
            'x-api-key': String(credentials.apiKey).trim(),
            email: String(credentials.email).trim(),
            'Content-Type': 'application/json',
          },
          json: true,
        });

        let customers: any[] = [];
        if (Array.isArray(response) && response[0]?.customers) {
          customers = response[0].customers;
        } else if (response?.customers && Array.isArray(response.customers)) {
          customers = response.customers;
        }

        return customers.map((c: any) => ({
          name: c.name,
          value: c._id,
        }));
      },

      async getCampaignsForCustomer(this: ILoadOptionsFunctions) {
        const customerId = this.getNodeParameter('customerId', '') as string;
        if (!customerId) {
          return [{ name: 'Select a customer first', value: '' }];
        }

        const credentials = await this.getCredentials('leadTableApi');

        const response = await this.helpers.request({
          method: 'GET',
          url: `${credentials.baseUrl || 'https://api.lead-table.com/api/v3/external'}/campaign/all/${customerId}`,
          headers: {
            'x-api-key': String(credentials.apiKey).trim(),
            email: String(credentials.email).trim(),
            'Content-Type': 'application/json',
          },
          json: true,
        });

        let campaigns: any[] = [];
        if (Array.isArray(response) && response[0]?.campaigns) {
          campaigns = response[0].campaigns;
        } else if (response?.campaigns && Array.isArray(response.campaigns)) {
          campaigns = response.campaigns;
        }

        return campaigns.map((c: any) => ({
          name: c.occupation ?? c.name ?? `Campaign ${c._id}`,
          value: c._id,
        }));
      },
    },
  };

  webhookMethods = {
    default: {
      async checkExists(this: IHookFunctions): Promise<boolean> {
        return false;
      },

      async create(this: IHookFunctions): Promise<boolean> {
        const webhookUrl = this.getNodeWebhookUrl('default') as string;
        const event = this.getNodeParameter('event') as string;
        const webhookLevel = this.getNodeParameter('webhookLevel') as string;
        const customerId = this.getNodeParameter('customerId', '') as string;
        const campaignId = this.getNodeParameter('campaignId', '') as string;

        this.logger.debug('Creating webhook', {
          url: webhookUrl,
          event,
          level: webhookLevel,
          customerId,
          campaignId,
        });

        const credentials = await this.getCredentials('leadTableApi');
        const apiKey = credentials.apiKey as string;
        const email = credentials.email as string;
        const baseUrl = (credentials.baseUrl as string) || 'https://api.lead-table.com/api/v3/external';

        try {
          const body: IDataObject = {
            url: webhookUrl, // n8n generiert automatisch UUID
            topic: event,
            layer: webhookLevel,
          };

          // Set the correct ID based on webhook level
          if (webhookLevel === 'agency') {
            body.campaignID = email;
          } else if (webhookLevel === 'customer') {
            if (!customerId) {
              throw new NodeOperationError(this.getNode(), 'Customer ID is required for customer-level webhooks');
            }
            body.campaignID = customerId;
          } else if (webhookLevel === 'table') {
            if (!campaignId) {
              throw new NodeOperationError(this.getNode(), 'Campaign/Table ID is required for table-level webhooks');
            }
            body.campaignID = campaignId;
          }

          this.logger.debug('Webhook registration body', body);

          const response = await this.helpers.request({
            method: 'POST',
            url: `${baseUrl}/attachWebhook`,
            headers: {
              'x-api-key': apiKey,
              email,
              accept: 'application/json',
              'content-type': 'application/json',
            },
            body,
            json: true,
            resolveWithFullResponse: true,
          });

          this.logger.debug('Webhook created successfully', response.body);
          return true;
        } catch (error: any) {
          let errorMessage = `Failed to create webhook: ${error.statusCode}`;
          if (error.response?.body?.error) {
            errorMessage += ` - "${error.response.body.error}"`;
          } else {
            errorMessage += ` - "${error.message}"`;
          }

          if (error.statusCode === 404) {
            errorMessage += '. The ID might not exist. Please verify using the LeadTable node.';
          } else if (error.statusCode === 403) {
            errorMessage += '. Please check your API credentials and the provided IDs.';
          }

          throw new NodeOperationError(this.getNode(), errorMessage);
        }
      },

      async delete(this: IHookFunctions): Promise<boolean> {
        const webhookUrl = this.getNodeWebhookUrl('default') as string;
        const event = this.getNodeParameter('event') as string;
        const webhookLevel = this.getNodeParameter('webhookLevel') as string;
        const customerId = this.getNodeParameter('customerId', '') as string;
        const campaignId = this.getNodeParameter('campaignId', '') as string;

        this.logger.debug('Deleting webhook', {
          url: webhookUrl,
          event,
          level: webhookLevel,
        });

        const credentials = await this.getCredentials('leadTableApi');
        const apiKey = credentials.apiKey as string;
        const email = credentials.email as string;
        const baseUrl = (credentials.baseUrl as string) || 'https://api.lead-table.com/api/v3/external';

        try {
          let targetId = '';
          if (webhookLevel === 'agency') {
            targetId = email;
          } else if (webhookLevel === 'customer') {
            targetId = customerId;
          } else if (webhookLevel === 'table') {
            targetId = campaignId;
          }

          const qs: IDataObject = {
            topic: event,
            layer: webhookLevel,
            id: targetId,
            url: webhookUrl,
          };

          if (webhookLevel === 'table' && customerId) {
            qs.relatedID = customerId;
          }

          await this.helpers.request({
            method: 'DELETE',
            url: `${baseUrl}/removeWebhook`,
            headers: {
              'x-api-key': apiKey,
              email,
              accept: 'application/json',
            },
            qs,
            json: true,
          });

          this.logger.debug('Webhook deleted successfully');
          return true;
        } catch (error: any) {
          throw new NodeOperationError(this.getNode(), `Error deleting webhook: ${error.message}`);
        }
      },
    },
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const includeLead = this.getNodeParameter('includeLead') as boolean;
    const body = this.getBodyData();

    this.logger.debug('Webhook received', body);

    let responseData: IDataObject = body as IDataObject;

    if (includeLead && body.leadID) {
      try {
        const credentials = await this.getCredentials('leadTableApi');
        const apiKey = credentials.apiKey as string;
        const email = credentials.email as string;
        const baseUrl = (credentials.baseUrl as string) || 'https://api.lead-table.com/api/v3/external';

        const leadDetails = await this.helpers.request({
          method: 'GET',
          url: `${baseUrl}/lead/${body.leadID}`,
          headers: {
            'x-api-key': apiKey,
            email,
            accept: 'application/json',
          },
          json: true,
        });

        responseData = {
          ...body,
          leadDetails,
        };
      } catch (error: any) {
        throw new NodeOperationError(this.getNode(), `Error fetching lead details: ${error.message}`);
      }
    }

    return {
      workflowData: [this.helpers.returnJsonArray([responseData])],
    };
  }
}
