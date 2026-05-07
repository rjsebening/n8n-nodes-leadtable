// nodes/LeadTable/actions/webhook/webhook.actions.ts
import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getClient } from '../../methods/transport/http-client';

export async function runWebhook(self: IExecuteFunctions, i: number, operation: string) {
  const api = getClient(self);

  if (operation === 'attach') {
    const topic = self.getNodeParameter('topic', i) as string;
    const layer = self.getNodeParameter('layer', i) as string;

    if (topic === 'newTable' && layer !== 'agency') {
      throw new NodeOperationError(
        self.getNode(),
        'newTable events are only supported on Agency level. Please change Layer to Agency.',
        { itemIndex: i },
      );
    }

    const webhookUrl = self.getNodeParameter('webhookUrl', i) as string;

    const body: IDataObject = { url: webhookUrl, topic, layer };
    if (layer === 'table') {
      const campaignId = self.getNodeParameter('campaignId', i) as string;
      body.campaignID = campaignId;
    }

    return api.request('POST', '/attachWebhook', { body });
  }

  if (operation === 'remove') {
    const originalTopic = self.getNodeParameter('topic', i) as string;
    const layer = self.getNodeParameter('layer', i) as string;
    const id = self.getNodeParameter('id', i) as string;
    const webhookUrl = self.getNodeParameter('webhookUrl', i) as string;
    const relatedId = self.getNodeParameter('relatedId', i, '') as string;

    const topicToUse = originalTopic === 'newTable' ? 'updateLead' : originalTopic;

    const form: Record<string, string> = { topic: topicToUse, layer, id, url: webhookUrl };
    if (relatedId) form.relatedID = relatedId;

    self.logger.debug('LeadTable removeWebhook request', {
      originalTopic,
      topicUsed: topicToUse,
      layer,
      id,
      relatedId,
      bodyParams: form,
    });

    return api.deleteForm('/removeWebhook', form);
  }

  if (operation === 'poll') {
    const campaignId = self.getNodeParameter('campaignId', i) as string;
    const topic = self.getNodeParameter('topic', i) as string;
    return api.request('GET', `/pollWebhook/${campaignId}/${topic}`);
  }

  throw new Error(`Unsupported webhook operation: ${operation}`);
}
