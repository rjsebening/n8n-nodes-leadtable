import {
  IHookFunctions,
  ILoadOptionsFunctions,
  INodeType,
  INodeTypeDescription,
  IWebhookFunctions,
  IWebhookResponseData,
  NodeConnectionType,
  NodeOperationError,
} from 'n8n-workflow';

export class LeadTableTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'LeadTable Trigger',
    name: 'leadTableTrigger',
    icon: 'fa:table',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["webhookLevel"] + ": " + $parameter["event"]}}',
    description:
      'Trigger workflows on LeadTable events - Integration with LeadTable API (powered by agentur-systeme.de)',
    defaults: {
      name: 'LeadTable Trigger',
      // @ts-expect-error -- required by n8n linter
      description: 'LeadTable Trigger integration node',
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
        isFullPath: true,
        path: '', // n8n generiert automatisch UUID
      },
    ],
    properties: [
      {
        displayName: 'Webhook Level',
        name: 'webhookLevel',
        type: 'options',
        options: [
          {
            name: 'Agency (Global)',
            value: 'agency',
            description: 'Receive events from all campaigns in your agency',
          },
          {
            name: 'Table (Specific Campaign)',
            value: 'table',
            description: 'Receive events from a specific table/campaign only',
          },
        ],
        default: 'agency',
        required: true,
      },
      {
        displayName: 'Event Name or ID',
        name: 'event',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getEvents',
          loadOptionsDependsOn: ['webhookLevel'],
        },
        default: '',
        required: true,
        description:
          'The event that will trigger the webhook. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
      },
      {
        displayName:
          '⚠️ Note: Due to API limitations, this webhook will be deleted using a fallback method when deactivated.',
        name: 'notice',
        type: 'notice',
        default: '',
        displayOptions: {
          show: { event: ['newTable'] },
        },
      },
      {
        displayName: 'Customer Name or ID',
        name: 'customerId',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getCustomers',
        },
        displayOptions: {
          show: {
            webhookLevel: ['table'],
          },
        },
        default: '',
        required: true,
        description:
          'The ID of the customer. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
        placeholder: 'e.g., 60d0fe4f5311236168a109ca',
      },
      {
        displayName: 'Campaign Name or ID',
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
        description:
          'The ID of the campaign to monitor. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
        placeholder: 'e.g., 60d0fe4f5311236168a109ca',
      },
      {
        displayName: 'Include Lead Details',
        name: 'includeLead',
        type: 'boolean',
        default: true,
        description: 'Whether to automatically fetch full lead details when triggered',
      },
      {
        displayName: 'Enable Debug Logging',
        name: 'debug',
        type: 'boolean',
        default: false,
        description: 'Whether log detailed request/response data (API key redacted). Useful for troubleshooting.',
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
          return [{ name: 'Select a Customer First', value: '' }];
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

      async getEvents(this: ILoadOptionsFunctions) {
        const webhookLevel = this.getNodeParameter('webhookLevel', 'table') as string;

        const baseEvents = [
          { name: 'New Lead Created', value: 'newLead', description: 'Triggered when a new lead is created' },
          { name: 'Lead Status Changed', value: 'changeStatus', description: 'Triggered when a lead status changes' },
          { name: 'Lead Updated', value: 'updateLead', description: 'Triggered when a lead is updated' },
          { name: 'Lead Deleted', value: 'deleteLead', description: 'Triggered when a lead is deleted' },
        ];

        // newTable nur auf agency level verfügbar
        if (webhookLevel === 'agency') {
          baseEvents.push({
            name: 'New Table Created',
            value: 'newTable',
            description: 'Triggered when a new table/campaign is created (Agency level only)',
          });
        }

        return baseEvents;
      },
    },
  };

  // Die webhook-Methoden für create/delete
  webhookMethods = {
    default: {
      async checkExists(this: IHookFunctions): Promise<boolean> {
        try {
          const webhookData = this.getWorkflowStaticData('node');
          const debug = this.getNodeParameter('debug', false) as boolean;

          if (debug) {
            console.log('LeadTable Trigger: Checking if webhook exists...', {
              webhookId: webhookData.webhookId,
            });
          }

          // Wenn keine webhookId gespeichert ist, existiert der Webhook nicht
          return Boolean(webhookData.webhookId);
        } catch (error) {
          const debug = this.getNodeParameter('debug', false) as boolean;
          if (debug) {
            console.error('LeadTable Trigger: Error checking webhook existence:', error);
          }
          return false;
        }
      },

      async create(this: IHookFunctions): Promise<boolean> {
        try {
          const credentials = await this.getCredentials('leadTableApi');
          const webhookUrl = this.getNodeWebhookUrl('default');
          const baseUrl = credentials.baseUrl || 'https://api.lead-table.com/api/v3/external';
          const debug = this.getNodeParameter('debug', false) as boolean;

          const event = this.getNodeParameter('event') as string;
          const webhookLevel = this.getNodeParameter('webhookLevel') as string;

          // Validierung: newTable nur auf agency level
          if (event === 'newTable' && webhookLevel !== 'agency') {
            throw new NodeOperationError(
              this.getNode(),
              'newTable events are only supported on Agency level. Please change Webhook Level to Agency.',
            );
          }

          const customerId = this.getNodeParameter('customerId', '') as string;
          const campaignId = this.getNodeParameter('campaignId', '') as string;

          // Request Body je nach Layer erstellen
          let requestBody: any = {
            layer: webhookLevel,
            topic: event,
            url: webhookUrl,
          };

          // Layer-spezifische Parameter hinzufügen
          if (webhookLevel === 'table') {
            requestBody.customerID = customerId;
            requestBody.campaignID = campaignId;
          }

          if (debug) {
            console.log('LeadTable Trigger: Creating webhook with data:', {
              layer: requestBody.layer,
              topic: requestBody.topic,
              customerID: requestBody.customerID || 'N/A',
              campaignID: requestBody.campaignID || 'N/A',
              url: '***WEBHOOK_URL***', // URL aus Sicherheitsgründen verstecken
            });
          }

          const response = await this.helpers.request({
            method: 'POST',
            url: `${baseUrl}/attachWebhook`,
            headers: {
              'x-api-key': String(credentials.apiKey).trim(),
              email: String(credentials.email).trim(),
              'Content-Type': 'application/json',
            },
            body: requestBody,
            json: true,
          });

          if (debug) {
            console.log('LeadTable Trigger: Webhook created successfully:', {
              externalHookId: response.externalHookId,
              message: response.message,
            });
          }

          // webhookId für späteres Löschen speichern
          const webhookData = this.getWorkflowStaticData('node');
          webhookData.webhookId = response.externalHookId;
          webhookData.webhookUrl = webhookUrl;
          webhookData.webhookParams = requestBody;

          return true;
        } catch (error) {
          const debug = this.getNodeParameter('debug', false) as boolean;
          if (debug) {
            console.error('LeadTable Trigger: Error creating webhook:', error);
          }
          throw new NodeOperationError(
            this.getNode(),
            `Failed to create LeadTable webhook: ${(error as Error).message}`,
          );
        }
      },

      async delete(this: IHookFunctions): Promise<boolean> {
        try {
          const credentials = await this.getCredentials('leadTableApi');
          const webhookData = this.getWorkflowStaticData('node');
          const baseUrl = credentials.baseUrl || 'https://api.lead-table.com/api/v3/external';
          const debug = this.getNodeParameter('debug', false) as boolean;

          if (!webhookData.webhookId || !webhookData.webhookUrl) {
            if (debug) {
              console.log('LeadTable Trigger: No webhook to delete (no stored webhook data)');
            }
            return true; // Kein Webhook zu löschen
          }

          const originalEvent = this.getNodeParameter('event') as string;
          const webhookLevel = this.getNodeParameter('webhookLevel') as string;
          const customerId = this.getNodeParameter('customerId', '') as string;
          const campaignId = this.getNodeParameter('campaignId', '') as string;

          // Fallback für newTable topic (nicht unterstützt beim DELETE)
          const topicToUse = originalEvent === 'newTable' ? 'updateLead' : originalEvent;

          if (originalEvent === 'newTable' && debug) {
            console.log(
              'LeadTable Trigger: Using fallback topic "updateLead" for delete (newTable not supported in removeWebhook API)',
            );
          }

          // externalHookId parsen um Entity-ID zu extrahieren
          const externalHookId = webhookData.webhookId as string;
          const entityId = externalHookId.split('_')[0]; // Erster Teil vor dem "_"

          // Request Body für DELETE Request erstellen (URL-encoded)
          const deleteParams: Record<string, string> = {
            topic: topicToUse,
            layer: webhookLevel,
            id: entityId,
            url: String(webhookData.webhookUrl),
          };

          // campaignID NICHT hinzufügen bei DELETE - API erlaubt es nicht
          // if (webhookLevel === 'table') {
          //   deleteParams.campaignID = campaignId;
          // }

          // URL-encoded Body erstellen
          const urlEncodedBody = new URLSearchParams(deleteParams).toString();

          if (debug) {
            console.log('LeadTable Trigger: Deleting webhook with params:', {
              originalTopic: originalEvent,
              topicUsed: topicToUse,
              layer: webhookLevel,
              entityId: entityId,
              campaignID: 'NOT_SENT (API does not allow campaignID in DELETE)',
              url: '***WEBHOOK_URL***',
              bodyParams: deleteParams,
            });
          }

          const response = await this.helpers.request({
            method: 'DELETE',
            url: `${baseUrl}/removeWebhook`,
            headers: {
              'x-api-key': String(credentials.apiKey).trim(),
              email: String(credentials.email).trim(),
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: urlEncodedBody,
            json: false, // Wichtig: json: false für URL-encoded Body
          });

          if (debug) {
            console.log('LeadTable Trigger: Webhook deleted successfully:', response);
          }

          // Webhook-Daten aus dem Static Data löschen
          delete webhookData.webhookId;
          delete webhookData.webhookUrl;
          delete webhookData.webhookParams;

          return true;
        } catch (error) {
          const debug = this.getNodeParameter('debug', false) as boolean;
          if (debug) {
            console.error('LeadTable Trigger: Error deleting webhook:', error);
          }
          // Bei DELETE-Fehlern nicht werfen, da der Webhook möglicherweise bereits gelöscht wurde
          return true;
        }
      },
    },
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const req = this.getRequestObject();
    const debug = this.getNodeParameter('debug', false) as boolean;
    const includeLead = this.getNodeParameter('includeLead', true) as boolean;

    let webhookData = req.body;

    if (debug) {
      console.log('LeadTable Trigger: Received webhook data:', {
        event: webhookData.event,
        campaignID: webhookData.campaignID,
        customerID: webhookData.customerID,
        leadID: webhookData.leadID,
        timestamp: webhookData.timestamp,
        leadName: webhookData.leadName,
        leadEmail: webhookData.leadEmail,
      });
    }

    // Vollständige Lead-Details abrufen, wenn gewünscht und leadID vorhanden
    if (includeLead && webhookData.leadID) {
      try {
        const credentials = await this.getCredentials('leadTableApi');
        const baseUrl = credentials.baseUrl || 'https://api.lead-table.com/api/v3/external';

        const leadResponse = await this.helpers.request({
          method: 'GET',
          url: `${baseUrl}/lead/${webhookData.leadID}`,
          headers: {
            'x-api-key': String(credentials.apiKey).trim(),
            email: String(credentials.email).trim(),
            'Content-Type': 'application/json',
          },
          json: true,
        });

        if (debug) {
          console.log('LeadTable Trigger: Fetched lead details for leadID:', webhookData.leadID);
        }

        // Lead-Details zu den Webhook-Daten hinzufügen
        webhookData.leadDetails = leadResponse;
      } catch (error) {
        if (debug) {
          console.error('LeadTable Trigger: Error fetching lead details:', error);
        }
        // Fehler beim Abrufen der Lead-Details wird nicht als kritisch betrachtet
        webhookData.leadDetailsError = (error as Error).message;
      }
    }

    // Timestamp in lesbares Datum konvertieren
    if (webhookData.timestamp) {
      webhookData.timestampFormatted = new Date(webhookData.timestamp).toISOString();
    }

    return {
      workflowData: [this.helpers.returnJsonArray([webhookData])],
    };
  }
}
