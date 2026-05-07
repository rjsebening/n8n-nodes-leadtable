import {
  IDataObject,
  IExecuteFunctions,
  IHookFunctions,
  INodeType,
  INodeTypeDescription,
  IWebhookFunctions,
  IWebhookResponseData,
  NodeConnectionType,
  NodeOperationError,
} from 'n8n-workflow';

import { getClient } from './methods/transport/http-client';
import { triggerProperties } from './descriptions/trigger.properties';
import { loadOptions as triggerLoadOptions } from './methods/loadOptions';

export class LeadTableTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'LeadTable Trigger',
    name: 'leadTableTrigger',
    icon: 'file:icon.svg',
    group: ['trigger'],
    version: 1,
    usableAsTool: true,
    subtitle: '={{$parameter["webhookLevel"] + ": " + $parameter["event"]}}',
    description:
      'Trigger workflows on LeadTable events - Integration with LeadTable API (powered by agentur-systeme.de)',
    defaults: {
      name: 'LeadTable Trigger',
      // @ts-expect-error -- required by n8n linter
      description: 'Integration with LeadTable API (powered by agentur-systeme.de)',
    },
    inputs: [],
    outputs: [NodeConnectionType.Main],
    credentials: [{ name: 'leadTableApi', required: true }],
    webhooks: [
      {
        name: 'default',
        httpMethod: 'POST',
        responseMode: 'onReceived',
        isFullPath: true,
        path: '',
      },
    ],
    properties: triggerProperties,
  };

  methods = {
    loadOptions: triggerLoadOptions,
  };

  webhookMethods = {
    default: {
      async checkExists(this: IHookFunctions): Promise<boolean> {
        const store = this.getWorkflowStaticData('node');
        return Boolean(store.webhookId);
      },

      async create(this: IHookFunctions): Promise<boolean> {
        const api = getClient(this as unknown as IExecuteFunctions);

        const event = this.getNodeParameter('event') as string;
        const level = this.getNodeParameter('webhookLevel') as string;

        // Validate: newTable only at agency level
        if (event === 'newTable' && level !== 'agency') {
          throw new NodeOperationError(
            this.getNode(),
            'newTable events are only supported on Agency level. Please change Webhook Level to Agency.',
          );
        }

        const hookUrl = this.getNodeWebhookUrl('default');
        const body: IDataObject = { layer: level, topic: event, url: hookUrl };

        if (level === 'table') {
          body.customerID = this.getNodeParameter('customerId', '') as string;
          body.campaignID = this.getNodeParameter('campaignId', '') as string;
        }

        const res = (await api.request('POST', '/attachWebhook', { body })) as IDataObject;

        const store = this.getWorkflowStaticData('node');
        store.webhookId = res?.externalHookId as string | undefined;
        store.webhookUrl = hookUrl;
        store.webhookParams = body;

        return true;
      },

      async delete(this: IHookFunctions): Promise<boolean> {
        try {
          const api = getClient(this as unknown as IExecuteFunctions);
          const store = this.getWorkflowStaticData('node');

          if (!store.webhookId || !store.webhookUrl) return true;

          const originalEvent = this.getNodeParameter('event') as string;
          const level = this.getNodeParameter('webhookLevel') as string;

          // Fallback for newTable
          const topicToUse = originalEvent === 'newTable' ? 'updateLead' : originalEvent;

          // externalHookId format: "<entityId>_<...>"
          const externalHookId = String(store.webhookId);
          const entityId = externalHookId.split('_')[0] || externalHookId;

          const form: Record<string, string> = {
            topic: topicToUse,
            layer: level,
            id: entityId,
            url: String(store.webhookUrl),
          };

          await api.deleteForm('/removeWebhook', form);

          delete store.webhookId;
          delete store.webhookUrl;
          delete store.webhookParams;

          return true;
        } catch {
          return true;
        }
      },
    },
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const api = getClient(this as unknown as IExecuteFunctions);
    const req = this.getRequestObject();

    const includeLead = this.getNodeParameter('includeLead', true) as boolean;

    const payload = req.body as IDataObject;

    if (includeLead && payload?.leadID) {
      try {
        const lead = await api.request('GET', `/lead/${payload.leadID as string}`);
        payload.leadDetails = lead as IDataObject;
      } catch (err) {
        payload.leadDetailsError = (err as Error).message;
      }
    }

    if (payload?.timestamp) {
      try {
        payload.timestampFormatted = new Date(payload.timestamp as string | number).toISOString();
      } catch {
        // ignore invalid timestamp
      }
    }

    return { workflowData: [this.helpers.returnJsonArray([payload])] };
  }
}
