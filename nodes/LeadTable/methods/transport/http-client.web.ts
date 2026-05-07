import type { ICredentialDataDecryptedObject, IExecuteFunctions, ILoadOptionsFunctions } from 'n8n-workflow';
import { makeClient } from './_shared';

function deriveWebBase(externalBase?: string) {
  const fallback = 'https://api.lead-table.com/api';
  if (!externalBase) return fallback;
  return String(externalBase).replace(/\/v\d+\/external\/?$/, '') || fallback;
}

function resolveWeb(endpoint: string, creds: ICredentialDataDecryptedObject) {
  const webBase = deriveWebBase(creds.baseUrl as string | undefined);
  return `${webBase}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
}

export function getWebClient(self: IExecuteFunctions) {
  return makeClient(self, resolveWeb);
}
export function getWebLoadOptionsClient(self: ILoadOptionsFunctions) {
  return makeClient(self, resolveWeb);
}
