// nodes/LeadTable/methods/loadOptions/getWebhookTopics.ts
import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

export async function getWebhookTopics(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  const layer = this.getCurrentNodeParameter('layer') as string | undefined;
  const operation = this.getCurrentNodeParameter('operation') as string;

  const topics: INodePropertyOptions[] = [
    { name: 'New Lead', value: 'newLead', description: 'Triggered when a new lead is created' },
    { name: 'Change Status', value: 'changeStatus', description: 'Triggered when a lead status changes' },
    { name: 'Update Lead', value: 'updateLead', description: 'Triggered when a lead is updated' },
    { name: 'Delete Lead', value: 'deleteLead', description: 'Triggered when a lead is deleted' },
  ];

  // newTable only on Agency level + attach/remove
  if (layer === 'agency' && (operation === 'attach' || operation === 'remove')) {
    topics.push({
      name: 'New Table Created',
      value: 'newTable',
      description: 'Triggered when a new table is created (Agency level only)',
    });
  }

  // On poll + agency, also offer newTable
  if (operation === 'poll' && layer === 'agency') {
    topics.push({
      name: 'New Table Created',
      value: 'newTable',
      description: 'Triggered when a new table is created',
    });
  }

  return topics;
}
