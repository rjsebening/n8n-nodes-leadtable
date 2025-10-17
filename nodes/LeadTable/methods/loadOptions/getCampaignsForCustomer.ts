// nodes/LeadTable/methods/loadOptions/getCampaignsForCustomer.ts
import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { getLoadOptionsClient } from '../transport/http-client';

export async function getCampaignsForCustomer(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  try {
    const customerForLeadCreate = this.getCurrentNodeParameter('customerForLeadCreate') as string | undefined;
    const customerForLeads = this.getCurrentNodeParameter('customerForLeads') as string | undefined;
    const relatedId = this.getCurrentNodeParameter('relatedId') as string | undefined;

    const customerId = customerForLeadCreate || customerForLeads || relatedId || '';
    if (!customerId) {
      return [
        {
          name: 'Please Select a Customer First',
          value: 'no-customer-selected',
          description: 'You must select a customer before campaigns can be loaded',
        },
      ];
    }

    const api = getLoadOptionsClient(this);
    const response = await api.request('GET', `/campaign/all/${customerId}`);

    this.logger.debug('Raw /campaign/all response', response);

    let campaigns: any[] = [];
    if (Array.isArray(response) && response[0]?.campaigns) campaigns = response[0].campaigns;
    else if (response?.campaigns && Array.isArray(response.campaigns)) campaigns = response.campaigns;

    if (campaigns.length === 0) {
      this.logger.error('No campaigns found!', response);
      return [
        {
          name: 'No Campaigns Found for This Customer',
          value: 'no-campaigns-found',
          description: 'This customer has no campaigns available',
        },
      ];
    }

    return campaigns.map((c: any) => ({
      name: c.name ?? c.occupation ?? `Campaign ${c._id}`,
      value: c._id,
      description: c.leadsCount ? `Leads: ${c.leadsCount}` : undefined,
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
}
