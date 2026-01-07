// nodes/LeadTable/methods/loadOptions/getCampaignsForCustomer.ts
import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { getLoadOptionsClient } from '../transport/http-client';

export async function getCampaignsForCustomer(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  try {
    const webhookLevel = this.getCurrentNodeParameter('webhookLevel') as string | undefined;

    let customerId: string | undefined;

    if (webhookLevel !== undefined) {
      if (webhookLevel !== 'table') return [];

      customerId = this.getCurrentNodeParameter('customerId') as string | undefined;
      if (!customerId) return [];
    } else {
      customerId =
        (this.getCurrentNodeParameter('customerId') as string | undefined) ??
        (this.getCurrentNodeParameter('customerForLeadCreate') as string | undefined) ??
        (this.getCurrentNodeParameter('customerForLeads') as string | undefined) ??
        (this.getCurrentNodeParameter('relatedId') as string | undefined);

      if (!customerId) return [];
    }

    const api = getLoadOptionsClient(this);
    const response = await api.request('GET', `/campaign/all/${customerId}`);

    let campaigns: any[] = [];

    if (Array.isArray(response?.campaigns)) {
      campaigns = response.campaigns;
    } else if (Array.isArray(response) && Array.isArray(response[0]?.campaigns)) {
      campaigns = response[0].campaigns;
    }

    if (!campaigns.length) return [];

    return campaigns.map((c: any) => ({
      name: c.name ?? c.occupation ?? `Campaign ${c._id}`,
      value: c._id,
      description: c.leadsCount ? `Leads: ${c.leadsCount}` : undefined,
    }));
  } catch (error: any) {
    this.logger.warn('getCampaignsForCustomer loadOptions failed', {
      message: error?.message,
    });

    return [];
  }
}
