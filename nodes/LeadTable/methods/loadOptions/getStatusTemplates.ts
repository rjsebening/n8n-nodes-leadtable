// nodes/LeadTable/methods/loadOptions/getStatusTemplates.ts
import type { IDataObject, ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getWebLoadOptionsClient } from '../transport/http-client.web';

type ApiError = { response?: { body?: { message?: string } }; message?: string };

export async function getStatusTemplates(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  try {
    const api = getWebLoadOptionsClient(this);
    const res = (await api.request('GET', '/agency/templates')) as IDataObject | IDataObject[];

    const templates: IDataObject[] = Array.isArray(res)
      ? res
      : Array.isArray(res?.data)
        ? (res.data as IDataObject[])
        : [];
    if (!templates.length) return [];

    return templates.map((t, idx) => ({
      name: (t?.name as string) ?? `Template ${idx + 1}`,
      value: (t?.name as string) ?? `Template ${idx + 1}`,
      description: Array.isArray(t?.status) ? `${(t.status as unknown[]).length} statuses` : undefined,
    }));
  } catch (error) {
    const e = error as ApiError;
    const msg = e?.response?.body?.message || e?.message || 'Unknown error';
    throw new NodeOperationError(this.getNode(), `Failed to load status templates: ${msg}`);
  }
}
