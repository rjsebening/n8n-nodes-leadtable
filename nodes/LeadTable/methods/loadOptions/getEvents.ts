// nodes/LeadTable/methods/loadOptions/getEvents.ts
import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

export async function getEvents(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  const level = this.getCurrentNodeParameter('webhookLevel') as string;

  const base: INodePropertyOptions[] = [
    { name: 'New Lead Created', value: 'newLead', description: 'Triggered when a new lead is created' },
    { name: 'Lead Status Changed', value: 'changeStatus', description: 'Triggered when a lead status changes' },
    { name: 'Lead Updated', value: 'updateLead', description: 'Triggered when a lead is updated' },
    { name: 'Lead Deleted', value: 'deleteLead', description: 'Triggered when a lead is deleted' },
  ];

  if (level === 'agency') {
    base.push({
      name: 'New Table Created',
      value: 'newTable',
      description: 'Triggered when a new table/campaign is created (Agency level only)',
    });
  }

  return base;
}
