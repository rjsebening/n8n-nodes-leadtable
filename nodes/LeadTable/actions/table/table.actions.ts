import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getClient } from '../../methods/transport/http-client'; // External (/v3/external)
import { getWebClient } from '../../methods/transport/http-client.web'; // Web (/api)

function parseJson(v: any) {
  if (v === undefined || v === null || v === '') return undefined;
  if (typeof v === 'string') {
    try {
      return JSON.parse(v);
    } catch {
      return undefined;
    }
  }
  return v;
}
const ensureBoolean = (v: any, fallback: boolean) => (typeof v === 'boolean' ? v : fallback);
const ensureObject = (v: any) => (v && typeof v === 'object' && !Array.isArray(v) ? v : undefined);
const ensureArray = (v: any) => (Array.isArray(v) ? v : undefined);

export async function runTable(self: IExecuteFunctions, i: number, operation: string) {
  if (operation !== 'createTable') {
    throw new Error(`Unsupported table operation: ${operation}`);
  }

  const external = getClient(self); // /api/v3/external
  const web = getWebClient(self); // /api

  const customerID = self.getNodeParameter('customerID', i) as string;
  const occupation = self.getNodeParameter('occupation', i) as string;
  const raw = self.getNodeParameter('additionalFields', i, {}) as IDataObject;

  // JSON
  const overrideValues = ensureObject(parseJson(raw.overrideValues)) ?? {};
  const statusData = parseJson(raw.status);
  const tableAndProfileConfig = ensureArray(parseJson(raw.tableAndProfileConfig)) ?? [];

  // Flags (UI)
  const preQualify = ensureBoolean(raw.preQualify, false); // POST
  const deleteLeads = ensureBoolean(raw.deleteLeads, true); // POST
  const funnelLink = typeof raw.funnelLink === 'string' && raw.funnelLink.trim() ? raw.funnelLink.trim() : undefined;

  // CREATE-Body
  const createBody: IDataObject = {
    customerID,
    occupation,
    preQualify,
    deleteLeads,
    overrideValues,
    tableAndProfileConfig,
    ...(statusData ? { status: statusData } : {}),
    ...(funnelLink ? { funnelLink } : {}),
  };

  // CREATE (External)
  const created = await external.request('POST', '/table/create', { body: createBody });

  const listCreated = Array.isArray(created) ? created : [created];
  const table = listCreated[0] ?? {};
  const tableId = table?.id ?? table?._id ?? table?.tableID;
  if (!tableId) {
    throw new NodeOperationError(self.getNode(), 'Table created but no table ID was returned.');
  }

  // PATCH Settings (Web)
  const patchBody: IDataObject = {
    occupation,
    deleteVisible: deleteLeads,
    showManualOverride: preQualify,
    showDuplicateLeadsIndicator: true,
  };
  const settingsPatched = await web.request('PATCH', `/table/settings/${tableId}`, { body: patchBody });

  return {
    tableId,
    createdTable: table,
    settingsPatched,
  };
}
