// nodes/LeadTable/methods/loadOptions/getCustomers.ts
import type { IDataObject, ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getLoadOptionsClient } from '../transport/http-client';

type ApiError = { response?: { body?: { message?: string } }; message?: string };

export async function getCustomers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  try {
    const api = getLoadOptionsClient(this);
    const response = (await api.request('GET', '/customer/all')) as IDataObject | IDataObject[];

    this.logger.debug('Raw /customer/all response', { response } as unknown as IDataObject);

    let customers: IDataObject[] = [];
    if (Array.isArray(response) && (response[0] as IDataObject)?.customers) {
      customers = (response[0] as IDataObject).customers as IDataObject[];
    } else if (!Array.isArray(response) && Array.isArray(response?.customers)) {
      customers = response.customers as IDataObject[];
    }

    if (customers.length === 0) {
      this.logger.error('No customers found!', { response } as unknown as IDataObject);
      return [];
    }

    return customers.map((c) => ({
      name: (c.name as string) ?? `Customer ${c._id as string}`,
      value: c._id as string,
      description: c.createdAt
        ? `Created: ${new Date(c.createdAt as string | number).toLocaleDateString()}`
        : undefined,
    }));
  } catch (error) {
    const e = error as ApiError;
    const errorMessage = e?.response?.body?.message || e?.message || 'Unknown error';
    throw new NodeOperationError(this.getNode(), `Failed to load customers: ${errorMessage}`);
  }
}
