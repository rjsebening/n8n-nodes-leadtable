// nodes/LeadTable/actions/router.ts
import { NodeOperationError, type IDataObject, type IExecuteFunctions, type INodeExecutionData } from 'n8n-workflow';
import { runAuth } from './auth/auth.actions';
import { runLead } from './lead/lead.actions';
import { runCampaign } from './campaign/campaign.actions';
import { runCustomer } from './customer/customer.actions';
import { runTable } from './table/table.actions';
import { runWebhook } from './webhook/webhook.actions';

const runners = {
  auth: runAuth,
  lead: runLead,
  campaign: runCampaign,
  customer: runCustomer,
  table: runTable,
  webhook: runWebhook,
} as const;

export async function dispatchAndCollect(self: IExecuteFunctions): Promise<INodeExecutionData[][]> {
  const items = self.getInputData();
  const returnData: INodeExecutionData[] = [];

  const resource = self.getNodeParameter('resource', 0) as keyof typeof runners;
  const operation = self.getNodeParameter('operation', 0) as string;

  const run = runners[resource];
  if (!run) {
    throw new NodeOperationError(self.getNode(), `Unsupported resource: ${String(resource)}`);
  }

  for (let i = 0; i < items.length; i++) {
    try {
      const response = (await run(self, i, operation)) as IDataObject | IDataObject[];
      const exec = self.helpers.constructExecutionMetaData(self.helpers.returnJsonArray(response), {
        itemData: { item: i },
      });
      returnData.push(...exec);
    } catch (error) {
      if (self.continueOnFail()) {
        const exec = self.helpers.constructExecutionMetaData(
          self.helpers.returnJsonArray({ error: (error as Error).message }),
          { itemData: { item: i } },
        );
        returnData.push(...exec);
        continue;
      }
      throw error;
    }
  }

  return [returnData];
}
