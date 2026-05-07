// nodes/LeadTable/methods/loadOptions/getCampaignsForCustomer.ts
import type { IDataObject, ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
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
    const response = (await api.request('GET', `/campaign/all/${customerId}`)) as IDataObject | IDataObject[];

    let campaigns: IDataObject[] = [];

    if (!Array.isArray(response) && Array.isArray(response?.campaigns)) {
      campaigns = response.campaigns as IDataObject[];
    } else if (Array.isArray(response) && Array.isArray((response[0] as IDataObject)?.campaigns)) {
      campaigns = (response[0] as IDataObject).campaigns as IDataObject[];
    }

    if (!campaigns.length) return [];

    return campaigns.map((c) => ({
      name: (c.name as string) ?? (c.occupation as string) ?? `Campaign ${c._id as string}`,
      value: c._id as string,
      description: c.leadsCount ? `Leads: ${c.leadsCount as number}` : undefined,
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    this.logger.warn('getCampaignsForCustomer loadOptions failed', { message });
    return [];
  }
}
