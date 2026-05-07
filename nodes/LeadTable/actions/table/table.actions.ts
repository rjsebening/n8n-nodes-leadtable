import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getClient } from '../../methods/transport/http-client'; // External (/v3/external)
import { getWebClient } from '../../methods/transport/http-client.web'; // Web (/api)

function parseJson(v: unknown): unknown {
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
const ensureBoolean = (v: unknown, fallback: boolean) => (typeof v === 'boolean' ? v : fallback);
const ensureObject = (v: unknown): IDataObject | undefined =>
  v && typeof v === 'object' && !Array.isArray(v) ? (v as IDataObject) : undefined;
const ensureArray = <T = unknown>(v: unknown): T[] | undefined => (Array.isArray(v) ? (v as T[]) : undefined);

export async function runTable(self: IExecuteFunctions, i: number, operation: string) {
  if (!['createTable', 'getTables'].includes(operation)) {
    throw new Error(`Unsupported table operation: ${operation}`);
  }

  // ---------- GET TABLE ----------
  if (operation === 'getTables') {
    const web = getWebClient(self);

    const tableId = self.getNodeParameter('tableId', i) as string;
    if (!tableId) {
      throw new NodeOperationError(self.getNode(), 'Table ID is required.');
    }

    const table = await web.request('GET', `/table/all/${tableId}`);

    return {
      tableId,
      table,
    };
  }

  // ---------- CREATE TABLE ----------
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

  const listCreated = (Array.isArray(created) ? created : [created]) as IDataObject[];
  const table = (listCreated[0] ?? {}) as IDataObject;
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
