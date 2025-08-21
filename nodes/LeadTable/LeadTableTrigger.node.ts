import {
	IHookFunctions,
	IWebhookFunctions,
	IDataObject,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	NodeOperationError,
	NodeConnectionType,
} from 'n8n-workflow';

export class LeadTableTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'LeadTable Trigger',
		name: 'leadTableTrigger',
        icon: { 
            light: 'file:leadtable.svg', 
            dark: 'file:leadtable.svg' 
        },
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Trigger workflows on LeadTable events',
		defaults: {
			name: 'LeadTable Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'leadTableApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: '', // n8n generiert automatisch UUID
			},
		],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				options: [
					{
						name: 'New Lead Created',
						value: 'newLead',
						description: 'Triggered when a new lead is created',
					},
					{
						name: 'Lead Status Changed',
						value: 'changeStatus',
						description: 'Triggered when a lead status changes',
					},
					{
						name: 'Lead Updated',
						value: 'updateLead',
						description: 'Triggered when a lead is updated',
					},
				],
				default: 'newLead',
				required: true,
			},
			{
				displayName: 'Webhook Level',
				name: 'webhookLevel',
				type: 'options',
				options: [
					{
						name: 'Agency (Global - All Campaigns)',
						value: 'agency',
						description: 'Receive events from all campaigns in your agency',
					},
					{
						name: 'Customer (All Tables)',
						value: 'customer',
						description: 'Receive events from all tables of a specific customer',
					},
					{
						name: 'Table (Specific Campaign)',
						value: 'table',
						description: 'Receive events from a specific table/campaign only',
					},
				],
				default: 'table',
				required: true,
			},
			{
				displayName: 'Customer ID',
				name: 'customerId',
				type: 'string',
				displayOptions: {
					show: {
						webhookLevel: ['customer', 'table'],
					},
				},
				default: '',
				required: true,
				description: 'The ID of the customer',
				placeholder: 'e.g., 60d0fe4f5311236168a109ca',
			},
			{
				displayName: 'Campaign/Table ID',
				name: 'campaignId',
				type: 'string',
				displayOptions: {
					show: {
						webhookLevel: ['table'],
					},
				},
				default: '',
				required: true,
				description: 'The ID of the campaign/table to monitor',
				placeholder: 'e.g., 687e1a6b24a08290d974f2f2',
			},
			{
				displayName: 'Include Lead Details',
				name: 'includeLead',
				type: 'boolean',
				default: true,
				description: 'Whether to automatically fetch full lead details when triggered',
			},
			{
				displayName: 'Info',
				name: 'info',
				type: 'notice',
				default: '',
				displayOptions: {
					show: {},
				},
				description: 'ℹ️ To find IDs: Use LeadTable node with "Customer > Get All", then "Campaign > Get All".',
			},
		],
	};

	// @ts-ignore
	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				return false;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				const event = this.getNodeParameter('event') as string;
				const webhookLevel = this.getNodeParameter('webhookLevel') as string;
				const customerId = this.getNodeParameter('customerId', '') as string;
				const campaignId = this.getNodeParameter('campaignId', '') as string;

				console.log('Creating webhook:', {
					url: webhookUrl,
					event,
					level: webhookLevel,
					customerId,
					campaignId
				});

				const credentials = await this.getCredentials('leadTableApi');
				const apiKey = credentials.apiKey as string;
				const email = credentials.email as string;
				const baseUrl = credentials.baseUrl as string || 'https://api.lead-table.com/api/v3/external';

				try {
					let body: any = {
						url: webhookUrl, // n8n generiert automatisch UUID
						topic: event,
						layer: webhookLevel,
					};

					// Set the correct ID based on webhook level
					if (webhookLevel === 'agency') {
						// For agency level, try with email as identifier
						body.campaignID = email;
					} else if (webhookLevel === 'customer') {
						if (!customerId) {
							throw new NodeOperationError(this.getNode(), 'Customer ID is required for customer-level webhooks');
						}
						body.campaignID = customerId;
					} else if (webhookLevel === 'table') {
						if (!campaignId) {
							throw new NodeOperationError(this.getNode(), 'Campaign/Table ID is required for table-level webhooks');
						}
						body.campaignID = campaignId;
					}

					console.log('Webhook registration body:', body);

					const response = await this.helpers.request({
						method: 'POST',
						url: `${baseUrl}/attachWebhook`,
						headers: {
							'x-api-key': apiKey,
							'email': email,
							'accept': 'application/json',
							'content-type': 'application/json',
						},
						body,
						json: true,
						resolveWithFullResponse: true,
					});

					console.log('Webhook created successfully:', response.body);
					return true;
				} catch (error: any) {
					console.error('Error creating webhook:', error);
					
					let errorMessage = `Failed to create webhook: ${error.statusCode}`;
					if (error.response?.body?.error) {
						errorMessage += ` - "${error.response.body.error}"`;
					} else {
						errorMessage += ` - "${error.message}"`;
					}
					
					if (error.statusCode === 404) {
						errorMessage += '. The ID might not exist. Please verify using the LeadTable node.';
					} else if (error.statusCode === 403) {
						errorMessage += '. Please check your API credentials and the provided IDs.';
					}
					
					throw new NodeOperationError(this.getNode(), errorMessage);
				}
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				const event = this.getNodeParameter('event') as string;
				const webhookLevel = this.getNodeParameter('webhookLevel') as string;
				const customerId = this.getNodeParameter('customerId', '') as string;
				const campaignId = this.getNodeParameter('campaignId', '') as string;

				console.log('Deleting webhook:', {
					url: webhookUrl,
					event,
					level: webhookLevel
				});

				const credentials = await this.getCredentials('leadTableApi');
				const apiKey = credentials.apiKey as string;
				const email = credentials.email as string;
				const baseUrl = credentials.baseUrl as string || 'https://api.lead-table.com/api/v3/external';

				try {
					let targetId = '';
					if (webhookLevel === 'agency') {
						targetId = email;
					} else if (webhookLevel === 'customer') {
						targetId = customerId;
					} else if (webhookLevel === 'table') {
						targetId = campaignId;
					}

					const qs: any = {
						topic: event,
						layer: webhookLevel,
						id: targetId,
						url: webhookUrl,
					};

					// Add relatedID if it's table level and we have customer ID
					if (webhookLevel === 'table' && customerId) {
						qs.relatedID = customerId;
					}

					await this.helpers.request({
						method: 'DELETE',
						url: `${baseUrl}/removeWebhook`,
						headers: {
							'x-api-key': apiKey,
							'email': email,
							'accept': 'application/json',
						},
						qs,
						json: true,
					});

					console.log('Webhook deleted successfully');
					return true;
				} catch (error: any) {
					console.error('Error deleting webhook:', error);
					return true;
				}
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const includeLead = this.getNodeParameter('includeLead') as boolean;
		const body = this.getBodyData();

		console.log('Webhook received:', body);

		let responseData: IDataObject = body as IDataObject;

		if (includeLead && body.leadID) {
			try {
				const credentials = await this.getCredentials('leadTableApi');
				const apiKey = credentials.apiKey as string;
				const email = credentials.email as string;
				const baseUrl = credentials.baseUrl as string || 'https://api.lead-table.com/api/v3/external';

				const leadDetails = await this.helpers.request({
					method: 'GET',
					url: `${baseUrl}/lead/${body.leadID}`,
					headers: {
						'x-api-key': apiKey,
						'email': email,
						'accept': 'application/json',
					},
					json: true,
				});

				responseData = {
					...body,
					leadDetails,
				};
			} catch (error) {
				console.error('Error fetching lead details:', error);
			}
		}

		return {
			workflowData: [
				this.helpers.returnJsonArray([responseData]),
			],
		};
	}
}
