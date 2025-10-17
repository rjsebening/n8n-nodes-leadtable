// nodes/LeadTable/actions/customer/customer.actions.ts
import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { getClient } from '../../methods/transport/http-client';

export async function runCustomer(self: IExecuteFunctions, i: number, operation: string) {
  const api = getClient(self);

  if (operation === 'getAll') {
    const page = self.getNodeParameter('page', i) as number;
    const limit = self.getNodeParameter('limit', i) as number;
    return api.request('GET', '/customer/all', { qs: { page, limit } });
  }

  if (operation === 'create') {
    const name = self.getNodeParameter('name', i) as string;
    const description = self.getNodeParameter('description', i, '') as string;

    const body: IDataObject = { name };
    if (description) body.description = description;

    return api.request('POST', '/customer/create', { body });
  }

  throw new Error(`Unsupported customer operation: ${operation}`);
}
