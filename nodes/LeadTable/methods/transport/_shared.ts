import type {
  ICredentialDataDecryptedObject,
  IDataObject,
  IExecuteFunctions,
  IHttpRequestMethods,
  ILoadOptionsFunctions,
  JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

declare const URLSearchParams: new (init?: Record<string, string>) => { toString(): string };

export type FormDataField =
  | string
  | number
  | boolean
  | { value: Buffer; options: { filename: string; contentType: string } };

export type RequestOpts = {
  qs?: IDataObject;
  body?: IDataObject | string;
  formData?: Record<string, FormDataField>;
};

type Self = IExecuteFunctions | ILoadOptionsFunctions;

export function makeClient(
  self: Self,
  resolveUrl: (endpoint: string, creds: ICredentialDataDecryptedObject) => string,
) {
  return {
    async request(
      method: IHttpRequestMethods,
      endpoint: string,
      { qs = {}, body = {}, formData }: RequestOpts = {},
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
        json: !formData,
      };

      if (formData) {
        options.formData = formData as unknown as IDataObject;
      } else if (body && Object.keys(body as IDataObject).length > 0) {
        options.body = body as IDataObject;
        (options.headers as IDataObject)['content-type'] = 'application/json';
      }

      try {
        return await self.helpers.request(options);
      } catch (error) {
        throw new NodeApiError(self.getNode(), error as JsonObject);
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
        throw new NodeApiError(self.getNode(), error as JsonObject);
      }
    },
  };
}
