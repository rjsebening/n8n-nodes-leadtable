import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getWebLoadOptionsClient } from '../transport/http-client.web';

export async function getCurrentUserId(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  try {
    const api = getWebLoadOptionsClient(this);
    const response = await api.request('GET', '/login/me');

    this.logger.debug('Raw /login/me response', response);

    const id = response?.data?._id;

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
  } catch (error: any) {
    const errorMessage = error?.response?.body?.message || error.message || 'Unknown error';
    throw new NodeOperationError(this.getNode(), `Failed to load current user ID: ${errorMessage}`);
  }
}
