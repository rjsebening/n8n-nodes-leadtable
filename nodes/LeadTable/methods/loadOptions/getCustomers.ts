// nodes/LeadTable/methods/loadOptions/getCustomers.ts
import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getLoadOptionsClient } from '../transport/http-client';

export async function getCustomers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  try {
    const api = getLoadOptionsClient(this);
    const response = await api.request('GET', '/customer/all');

    this.logger.debug('Raw /customer/all response', response);

    let customers: any[] = [];
    if (Array.isArray(response) && response[0]?.customers) customers = response[0].customers;
    else if (response?.customers && Array.isArray(response.customers)) customers = response.customers;

    if (customers.length === 0) {
      this.logger.error('No customers found!', response);
      return [];
    }

    return customers.map((c: any) => ({
      name: c.name ?? `Customer ${c._id}`,
      value: c._id,
      description: c.createdAt ? `Created: ${new Date(c.createdAt).toLocaleDateString()}` : undefined,
    }));
  } catch (error: any) {
    const errorMessage = error?.response?.body?.message || error.message || 'Unknown error';
    throw new NodeOperationError(this.getNode(), `Failed to load customers: ${errorMessage}`);
  }
}
