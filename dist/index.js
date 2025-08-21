"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.credentials = exports.nodes = void 0;
const LeadTable_node_1 = require("./nodes/LeadTable/LeadTable.node");
const LeadTableTrigger_node_1 = require("./nodes/LeadTable/LeadTableTrigger.node");
const LeadTableApi_credentials_1 = require("./credentials/LeadTableApi.credentials");
exports.nodes = [
    LeadTable_node_1.LeadTable,
    LeadTableTrigger_node_1.LeadTableTrigger,
];
exports.credentials = [
    LeadTableApi_credentials_1.LeadTableApi,
];
