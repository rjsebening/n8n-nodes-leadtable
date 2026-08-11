// nodes/LeadTable/LeadTable.node.ts
// ─────────────────────────────────────────────────────────────
// LeadTable Node – centralized imports & thin orchestration
// ─────────────────────────────────────────────────────────────

import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeConnectionTypes,
} from 'n8n-workflow';

// Actions dispatcher (execute)
import { dispatchAndCollect } from './actions';

// LoadOptions (methods)
import { loadOptions } from './methods/loadOptions';

// Resource selector (top-level "Resource" dropdown)
import { resourceSelector } from './descriptions/resources';

// Per-resource properties (Operation + fields)
// IMPORTANT: Ensure each file exports the corresponding *Properties array.
import { authProperties } from './actions/auth';
import { leadProperties } from './actions/lead';
import { campaignProperties } from './actions/campaign';
import { customerProperties } from './actions/customer';
import { tableProperties } from './actions/table';
import { webhookProperties } from './actions/webhook';

export class LeadTable implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'LeadTable',
    name: 'leadTable',
    icon: {
      light: 'file:icon.light.svg',
      dark: 'file:icon.dark.svg',
    },
    group: ['transform'],
    version: 1,
    usableAsTool: true,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Integration with LeadTable API (powered by agentur-systeme.de)',
    defaults: {
      name: 'LeadTable',
      // @ts-expect-error required by n8n linter
      description: 'Integration with LeadTable API (powered by agentur-systeme.de)',
    },
    inputs: [NodeConnectionTypes.Main],
    outputs: [NodeConnectionTypes.Main],
    credentials: [
      {
        name: 'leadTableApi',
        required: true,
      },
    ],
    // Merge the resource selector with all per-resource property blocks
    properties: [
      resourceSelector,
      ...authProperties,
      ...leadProperties,
      ...campaignProperties,
      ...customerProperties,
      ...tableProperties,
      ...webhookProperties,
    ],
  };

  // Attach loadOptions (getCustomers, getCampaignsForCustomer, getWebhookTopics, ...)
  methods = {
    loadOptions,
  };

  // Thin execute: delegate to the router that dispatches per resource/operation
  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    return dispatchAndCollect(this);
  }
}
