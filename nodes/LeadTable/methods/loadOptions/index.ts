// nodes/LeadTable/methods/loadOptions/index.ts
import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

import { getWebhookTopics } from './getWebhookTopics';
import { getCustomers } from './getCustomers';
import { getCampaignsForCustomer } from './getCampaignsForCustomer';
import { getEvents } from './getEvents'; // Trigger-spezifisch

export const loadOptions = {
  async getWebhookTopics(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
    return getWebhookTopics.call(this);
  },
  async getCustomers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
    return getCustomers.call(this);
  },
  async getCampaignsForCustomer(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
    return getCampaignsForCustomer.call(this);
  },
  // Trigger: Event-Liste abhängig vom Level
  async getEvents(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
    return getEvents.call(this);
  },
};

export type LoadOptions = typeof loadOptions;
