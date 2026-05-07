// nodes/LeadTable/actions/auth/auth.actions.ts
import type { IExecuteFunctions } from 'n8n-workflow';
import { getClient } from '../../methods/transport/http-client';

export async function runAuth(self: IExecuteFunctions, _i: number, operation: string) {
  const api = getClient(self);

  if (operation === 'check') {
    return api.request('GET', '/auth');
  }

  throw new Error(`Unsupported auth operation: ${operation}`);
}
