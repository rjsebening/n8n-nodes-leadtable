import type { ICredentialDataDecryptedObject, IExecuteFunctions, ILoadOptionsFunctions } from 'n8n-workflow';
import { makeClient } from './_shared';

function resolveExternal(endpoint: string, creds: ICredentialDataDecryptedObject) {
  const baseUrl = String(creds.baseUrl || 'https://api.lead-table.com/api/v3/external').trim();
  return `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
}

export function getClient(self: IExecuteFunctions) {
  return makeClient(self, resolveExternal);
}
export function getLoadOptionsClient(self: ILoadOptionsFunctions) {
  return makeClient(self, resolveExternal);
}

export const getExternalClient = getClient;
export const getExternalLoadOptionsClient = getLoadOptionsClient;
