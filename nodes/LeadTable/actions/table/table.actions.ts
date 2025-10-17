// nodes/LeadTable/actions/table/table.actions.ts
import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { getClient } from '../../methods/transport/http-client';

export async function runTable(self: IExecuteFunctions, i: number, operation: string) {
  const api = getClient(self);

  if (operation === 'createTable') {
    const customerID = self.getNodeParameter('customerID', i) as string;
    const occupation = self.getNodeParameter('occupation', i) as string;
    const additionalFields = self.getNodeParameter('additionalFields', i, {}) as IDataObject;

    const body = { customerID, occupation, ...additionalFields };
    return api.request('POST', '/table/create', { body });
  }

  throw new Error(`Unsupported table operation: ${operation}`);
}
