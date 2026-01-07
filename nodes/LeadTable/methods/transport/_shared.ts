import type { IDataObject, IExecuteFunctions, ILoadOptionsFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export type RequestOpts = {
  qs?: IDataObject;
  body?: any;
  isFormData?: boolean;
};

type Self = IExecuteFunctions | ILoadOptionsFunctions;

function getGlobal(name: 'FormData' | 'File') {
  const g = (0, eval)('typeof globalThis !== "undefined" ? globalThis : undefined');
  return g?.[name];
}

function createFormData(): FormData {
  const FormDataCtor = getGlobal('FormData');
  if (!FormDataCtor) throw new Error('FormData is not available in this environment.');
  return new FormDataCtor();
}

// @ts-ignore -- Buffer exists at runtime
function toFile(buffer: Buffer, mime: string, filename: string): File {
  const FileCtor = getGlobal('File');
  if (!FileCtor) throw new Error('File is not available in this environment.');
  return new FileCtor([buffer], filename, { type: mime });
}

export function makeClient(self: Self, resolveUrl: (endpoint: string, creds: any) => string) {
  return {
    async request(
      method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
      endpoint: string,
      { qs = {}, body = {}, isFormData = false }: RequestOpts = {},
    ) {
      const credentials = await (self as any).getCredentials('leadTableApi');
      const apiKey = String(credentials.apiKey || '').trim();
      const email = String(credentials.email || '').trim();

      const isAbsolute = /^https?:\/\//i.test(endpoint);
      const url = isAbsolute ? endpoint : resolveUrl(endpoint, credentials);

      const options: any = {
        method,
        url,
        headers: { 'x-api-key': apiKey, email, accept: 'application/json' },
        qs,
        json: !isFormData,
      };

      if (isFormData) options.body = body;
      else if (body && Object.keys(body).length > 0) {
        options.body = body;
        options.headers['content-type'] = 'application/json';
      }

      try {
        return await (self as any).helpers.request(options);
      } catch (error: any) {
        let msg = `LeadTable API request failed: ${error.statusCode || 'UNKNOWN'}`;
        if (error.statusCode === 403) msg += ' - Authentication failed.';
        if (error.response?.body?.error) msg += ` - "${error.response.body.error}"`;
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
        return await (self as any).helpers.request(options);
      } catch (error: any) {
        throw new NodeOperationError((self as any).getNode(), `LeadTable DELETE failed: ${error.message}`);
      }
    },

    formData(): FormData {
      return createFormData();
    },

    // @ts-ignore -- Buffer exists at runtime
    toFile(buffer: Buffer, mime: string, filename: string): File {
      return toFile(buffer, mime, filename);
    },
  };
}
