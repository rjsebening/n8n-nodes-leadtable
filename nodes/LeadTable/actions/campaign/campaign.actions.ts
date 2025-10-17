// nodes/LeadTable/actions/campaign/campaign.actions.ts
import type { IExecuteFunctions } from 'n8n-workflow';
import { getClient } from '../../methods/transport/http-client';

export async function runCampaign(self: IExecuteFunctions, i: number, operation: string) {
  const api = getClient(self);

  if (operation === 'getAll') {
    const customerId = self.getNodeParameter('customerId', i) as string;
    return api.request('GET', `/campaign/all/${customerId}`);
  }

  throw new Error(`Unsupported campaign operation: ${operation}`);
}
