import type {
  ICredentialDataDecryptedObject,
  IDataObject,
  IExecuteFunctions,
  IHttpRequestMethods,
  ILoadOptionsFunctions,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

declare const URLSearchParams: new (init?: Record<string, string>) => { toString(): string };

type FormDataLike = { append(name: string, value: unknown, fileName?: string): void };
type FileLike = unknown;

type ApiError = {
  statusCode?: number;
  message?: string;
  response?: { body?: { error?: string; message?: string } };
};

export type RequestOpts = {
  qs?: IDataObject;
  body?: IDataObject | FormDataLike | string;
  isFormData?: boolean;
};

type Self = IExecuteFunctions | ILoadOptionsFunctions;

function getGlobal(name: 'FormData' | 'File'): unknown {
  const g = (0, eval)('typeof globalThis !== "undefined" ? globalThis : undefined');
  return (g as Record<string, unknown> | undefined)?.[name];
}

function createFormData(): FormDataLike {
  const FormDataCtor = getGlobal('FormData') as (new () => FormDataLike) | undefined;
  if (!FormDataCtor) throw new Error('FormData is not available in this environment.');
  return new FormDataCtor();
}

function toFile(buffer: Buffer, mime: string, filename: string): FileLike {
  const FileCtor = getGlobal('File') as
    | (new (parts: Buffer[], filename: string, options: { type: string }) => FileLike)
    | undefined;
  if (!FileCtor) throw new Error('File is not available in this environment.');
  return new FileCtor([buffer], filename, { type: mime });
}

export function makeClient(
  self: Self,
  resolveUrl: (endpoint: string, creds: ICredentialDataDecryptedObject) => string,
) {
  return {
    async request(
      method: IHttpRequestMethods,
      endpoint: string,
      { qs = {}, body = {}, isFormData = false }: RequestOpts = {},
    ): Promise<unknown> {
      const credentials = await self.getCredentials('leadTableApi');
      const apiKey = String(credentials.apiKey || '').trim();
      const email = String(credentials.email || '').trim();

      const isAbsolute = /^https?:\/\//i.test(endpoint);
      const url = isAbsolute ? endpoint : resolveUrl(endpoint, credentials);

      const options: IDataObject = {
        method,
        url,
        headers: { 'x-api-key': apiKey, email, accept: 'application/json' } as IDataObject,
        qs,
        json: !isFormData,
      };

      if (isFormData) {
        options.body = body as IDataObject;
      } else if (body && Object.keys(body as IDataObject).length > 0) {
        options.body = body as IDataObject;
        (options.headers as IDataObject)['content-type'] = 'application/json';
      }

      try {
        return await self.helpers.request(options);
      } catch (error) {
        const e = error as ApiError;
        let msg = `LeadTable API request failed: ${e.statusCode || 'UNKNOWN'}`;
        if (e.statusCode === 403) msg += ' - Authentication failed.';
        if (e.response?.body?.error) msg += ` - "${e.response.body.error}"`;
        throw new NodeOperationError(self.getNode(), msg);
      }
    },

    async deleteForm(endpoint: string, form: Record<string, string>): Promise<unknown> {
      const credentials = await self.getCredentials('leadTableApi');
      const apiKey = String(credentials.apiKey || '').trim();
      const email = String(credentials.email || '').trim();
      const url = resolveUrl(endpoint, credentials);

      const bodyEncoded = new URLSearchParams(form).toString();

      const options: IDataObject = {
        method: 'DELETE',
        url,
        headers: {
          'x-api-key': apiKey,
          email,
          'Content-Type': 'application/x-www-form-urlencoded',
          accept: 'application/json',
        } as IDataObject,
        body: bodyEncoded,
        json: false,
      };

      try {
        return await self.helpers.request(options);
      } catch (error) {
        const e = error as ApiError;
        throw new NodeOperationError(self.getNode(), `LeadTable DELETE failed: ${e.message ?? 'Unknown error'}`);
      }
    },

    formData(): FormDataLike {
      return createFormData();
    },

    toFile(buffer: Buffer, mime: string, filename: string): FileLike {
      return toFile(buffer, mime, filename);
    },
  };
}
