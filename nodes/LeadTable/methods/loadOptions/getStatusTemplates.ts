// nodes/LeadTable/methods/loadOptions/getStatusTemplates.ts
import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getWebLoadOptionsClient } from '../transport/http-client.web';

export async function getStatusTemplates(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  try {
    const api = getWebLoadOptionsClient(this);
    const res = await api.request('GET', '/agency/templates');

    const templates: any[] = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
    if (!templates.length) return [];

    return templates.map((t, idx) => ({
      name: t?.name ?? `Template ${idx + 1}`,
      value: t?.name ?? `Template ${idx + 1}`,
      description: t?.status ? `${t.status.length} statuses` : undefined,
    }));
  } catch (error: any) {
    const msg = error?.response?.body?.message || error.message || 'Unknown error';
    throw new NodeOperationError(this.getNode(), `Failed to load status templates: ${msg}`);
  }
}
