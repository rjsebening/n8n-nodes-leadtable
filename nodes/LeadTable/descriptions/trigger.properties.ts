// nodes/LeadTable/descriptions/trigger.properties.ts
import type { INodeProperties } from 'n8n-workflow';

export const triggerProperties: INodeProperties[] = [
  {
    displayName: 'Webhook Level',
    name: 'webhookLevel',
    type: 'options',
    options: [
      { name: 'Agency (Global)', value: 'agency', description: 'Receive events from all campaigns in your agency' },
      {
        name: 'Table (Specific Campaign)',
        value: 'table',
        description: 'Receive events from a specific table/campaign only',
      },
    ],
    default: 'agency',
    required: true,
  },
  {
    displayName: 'Event Name or ID',
    name: 'event',
    type: 'options',
    typeOptions: {
      loadOptionsMethod: 'getEvents',
      loadOptionsDependsOn: ['webhookLevel'],
    },
    default: '',
    required: true,
    description:
      'The event that will trigger the webhook. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
  },
  {
    displayName:
      '⚠️ Note: Due to API limitations, this webhook will be deleted using a fallback method when deactivated.',
    name: 'notice',
    type: 'notice',
    default: '',
    displayOptions: { show: { event: ['newTable'] } },
  },
  {
    displayName: 'Customer Name or ID',
    name: 'customerId',
    type: 'options',
    typeOptions: { loadOptionsMethod: 'getCustomers' },
    displayOptions: { show: { webhookLevel: ['table'] } },
    default: '',
    required: true,
    description:
      'The ID of the customer. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
  },
  {
    displayName: 'Campaign Name or ID',
    name: 'campaignId',
    type: 'options',
    typeOptions: {
      loadOptionsMethod: 'getCampaignsForCustomer',
      loadOptionsDependsOn: ['customerId'],
    },
    displayOptions: { show: { webhookLevel: ['table'] } },
    default: '',
    required: true,
    description:
      'The ID of the campaign to monitor. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
  },
  {
    displayName: 'Include Lead Details',
    name: 'includeLead',
    type: 'boolean',
    default: true,
    description: 'Whether to automatically fetch full lead details when triggered',
  },
];
