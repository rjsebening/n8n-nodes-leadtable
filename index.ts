import { LeadTable } from './nodes/LeadTable/LeadTable.node';
import { LeadTableTrigger } from './nodes/LeadTable/LeadTableTrigger.node';
import { LeadTableApi } from './credentials/LeadTableApi.credentials';

export const nodes = [LeadTable, LeadTableTrigger];

export const credentials = [LeadTableApi];
