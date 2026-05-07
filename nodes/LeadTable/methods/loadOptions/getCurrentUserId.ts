import type { IDataObject, ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getWebLoadOptionsClient } from '../transport/http-client.web';

type ApiError = { response?: { body?: { message?: string } }; message?: string };

export async function getCurrentUserId(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  try {
    const api = getWebLoadOptionsClient(this);
    const response = (await api.request('GET', '/login/me')) as IDataObject;

    this.logger.debug('Raw /login/me response', response);

    const id = (response?.data as IDataObject | undefined)?._id as string | undefined;

    if (!id) {
      this.logger.error('No user ID found in /login/me response', response);
      return [];
    }

    return [
      {
        name: id,
        value: id,
        description: 'Your LeadTable Agency ID',
      },
    ];
  } catch (error) {
    const e = error as ApiError;
    const errorMessage = e?.response?.body?.message || e?.message || 'Unknown error';
    throw new NodeOperationError(this.getNode(), `Failed to load current user ID: ${errorMessage}`);
  }
}
