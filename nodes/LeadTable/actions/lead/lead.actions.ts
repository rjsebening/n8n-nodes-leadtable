// nodes/LeadTable/actions/lead/lead.actions.ts
import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getClient } from '../../methods/transport/http-client';

export async function runLead(self: IExecuteFunctions, i: number, operation: string) {
  const api = getClient(self);

  if (operation === 'create') {
    const campaignId = self.getNodeParameter('campaignId', i) as string;
    const leadData = self.getNodeParameter('leadData', i) as any;
    const body = { campaignID: campaignId, data: leadData?.data || [] };
    return api.request('POST', '/lead/create', { body });
  }

  if (operation === 'get') {
    const leadId = self.getNodeParameter('leadId', i) as string;
    const plainDescription = self.getNodeParameter('plainDescription', i) as boolean;
    const qs: IDataObject = {};
    if (plainDescription) qs.plainDescription = 'true';
    return api.request('GET', `/lead/${leadId}`, { qs });
  }

  if (operation === 'update') {
    const leadId = self.getNodeParameter('leadId', i) as string;
    const question = self.getNodeParameter('question', i) as string;
    const answer = self.getNodeParameter('answer', i) as string;
    const setVisibleInProfile = self.getNodeParameter('setVisibleInProfile', i) as boolean;
    const body = { question, answer, setVisibleInProfile };
    return api.request('PUT', `/lead/${leadId}`, { body });
  }

  if (operation === 'updateDescription') {
    const leadId = self.getNodeParameter('leadId', i) as string;
    const description = self.getNodeParameter('description', i) as string;
    return api.request('PUT', `/lead/${leadId}/description`, { body: { description } });
  }

  if (operation === 'searchByEmail') {
    const emailToSearch = self.getNodeParameter('email', i) as string;
    const page = self.getNodeParameter('page', i) as number;
    const limit = self.getNodeParameter('limit', i) as number;
    return api.request('GET', `/searchLeadByMail/${emailToSearch}`, { qs: { page, limit } });
  }

  if (operation === 'getByCampaign') {
    const campaignId = self.getNodeParameter('campaignId', i) as string;

    if (['no-customer-selected', 'no-campaigns-found', 'error-loading'].includes(campaignId)) {
      throw new NodeOperationError(self.getNode(), 'Please select a valid campaign (select customer first).', {
        itemIndex: i,
      });
    }

    const page = self.getNodeParameter('page', i) as number;
    const limit = self.getNodeParameter('limit', i) as number;
    return api.request('GET', `/lead/campaign/${campaignId}`, { qs: { page, limit } });
  }

  if (operation === 'addFile') {
    const leadId = self.getNodeParameter('leadId', i) as string;
    const binaryPropertyName = self.getNodeParameter('binaryPropertyName', i) as string;

    const buffer = await self.helpers.getBinaryDataBuffer(i, binaryPropertyName);
    const binaryData = self.helpers.assertBinaryData(i, binaryPropertyName);

    const form = api.formData();
    form.append('file', buffer, {
      filename: binaryData.fileName || 'upload.bin',
      contentType: binaryData.mimeType || 'application/octet-stream',
    });
    form.append('id', leadId);

    return api.request('POST', '/addFile', { body: form, isFormData: true });
  }

  throw new Error(`Unsupported lead operation: ${operation}`);
}
