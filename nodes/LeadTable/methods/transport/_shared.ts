import type { IDataObject, IExecuteFunctions, ILoadOptionsFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import FormData from 'form-data';

export type RequestOpts = { qs?: IDataObject; body?: any; isFormData?: boolean };
type Self = IExecuteFunctions | ILoadOptionsFunctions;

export function makeClient(self: Self, resolveUrl: (endpoint: string, creds: any) => string) {
  return {
    async request(
      method: 'GET' | 'POST' | 'PUT' | 'DELETE',
      endpoint: string,
      { qs = {}, body = {}, isFormData = false }: RequestOpts = {},
    ): Promise<any> {
      const credentials = await (self as any).getCredentials('leadTableApi');
      const apiKey = String(credentials.apiKey || '').trim();
      const email = String(credentials.email || '').trim();

      const isAbsolute = /^https?:\/\//i.test(endpoint);
      const url = isAbsolute ? endpoint : resolveUrl(endpoint, credentials);

      (self as any).logger?.debug?.('=== LeadTable API Request ===', {
        method,
        url,
        apiKeyPreview: apiKey.slice(0, 10) + '…',
        email,
        query: qs,
      });

      const options: any = {
        method,
        url,
        headers: { 'x-api-key': apiKey, email, accept: 'application/json' },
        qs,
        json: !isFormData,
      };

      if (isFormData) {
        options.body = body;
      } else if (body && Object.keys(body).length > 0) {
        options.body = body;
        options.headers['content-type'] = 'application/json';
      }

      try {
        const response = await (self as any).helpers.request(options);
        (self as any).logger?.debug?.('LeadTable API Raw Response', { url, raw: response });
        return response;
      } catch (error: any) {
        (self as any).logger?.error?.('LeadTable API Error', {
          url,
          statusCode: error.statusCode,
          message: error.message,
          body: error.response?.body,
        });

        let msg = `LeadTable API request failed: ${error.statusCode || 'UNKNOWN'}`;
        if (error.statusCode === 403) msg += ' - Authentication failed. Please check your API Key and Email address.';
        else if (error.response?.body?.error) msg += ` - "${error.response.body.error}"`;
        else if (error.message) msg += ` - "${error.message}"`;
        throw new NodeOperationError((self as any).getNode(), msg);
      }
    },

    async deleteForm(endpoint: string, form: Record<string, string>) {
      const credentials = await (self as any).getCredentials('leadTableApi');
      const apiKey = String(credentials.apiKey || '').trim();
      const email = String(credentials.email || '').trim();
      const url = resolveUrl(endpoint, credentials);
      const bodyEncoded = new URLSearchParams(form).toString();

      const options: any = {
        method: 'DELETE',
        url,
        headers: {
          'x-api-key': apiKey,
          email,
          'Content-Type': 'application/x-www-form-urlencoded',
          accept: 'application/json',
        },
        body: bodyEncoded,
        json: false,
      };

      try {
        const response = await (self as any).helpers.request(options);
        (self as any).logger?.debug?.('LeadTable API Raw Response', { url, raw: response });
        return response;
      } catch (error: any) {
        (self as any).logger?.error?.('LeadTable API Error', {
          url,
          statusCode: error.statusCode,
          message: error.message,
          body: error.response?.body,
        });
        throw new NodeOperationError((self as any).getNode(), `LeadTable DELETE failed: ${error.message}`);
      }
    },

    formData(): FormData {
      return new FormData();
    },
  };
}
