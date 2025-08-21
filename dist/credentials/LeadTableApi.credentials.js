"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadTableApi = void 0;
class LeadTableApi {
    constructor() {
        this.name = 'leadTableApi';
        this.displayName = 'LeadTable API';
        this.properties = [
            {
                displayName: 'API Key',
                name: 'apiKey',
                type: 'string',
                typeOptions: { password: true },
                default: '',
                required: true,
                description: 'The API Key can be generated in the settings in LeadTable',
            },
            {
                displayName: 'Email',
                name: 'email',
                type: 'string',
                default: '',
                required: true,
                description: 'Your account email for identifying the agency',
            },
            {
                displayName: 'Base URL',
                name: 'baseUrl',
                type: 'string',
                default: 'https://api.lead-table.com/api/v3/external',
                required: true,
                description: 'The base URL of the LeadTable API',
            },
        ];
        this.authenticate = {
            type: 'generic',
            properties: {
                headers: {
                    'x-api-key': '={{$credentials.apiKey}}',
                    'email': '={{$credentials.email}}',
                },
            },
        };
        this.test = {
            request: {
                baseURL: '={{$credentials.baseUrl}}',
                url: '/auth',
                headers: {
                    'accept': 'application/json',
                },
            },
        };
    }
}
exports.LeadTableApi = LeadTableApi;
