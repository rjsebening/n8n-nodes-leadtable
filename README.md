# n8n-nodes-leadtable

A professional n8n custom node for seamless integration with the LeadTable API. Automate your lead-management workflows with full CRUD operations and real-time webhook support.

![LeadTable Node](https://img.shields.io/badge/n8n-community--node-FF6D5A)  
![Version](https://img.shields.io/badge/version-1.0.0-blue)  
![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 Overview

This n8n custom node enables full integration with LeadTable — a leading lead-management platform. From automatic lead creation to real-time notifications on status changes, you can automate the entire lead lifecycle without writing a single line of code.

## ✨ Key Features

### 📊 **Full Lead Management**

- **Create Lead**: Create new leads with custom data fields
- **Get Lead**: Retrieve detailed lead information with flexible formatting options
- **Update Lead**: Dynamic question–answer system for updating lead data
- **Search Lead**: Powerful email-based search
- **File Upload**: Attach documents and files directly to leads

### ⚡ **Real-Time Automation**

- **Webhook Trigger**: Instantly react to lead events
- **Multi-Level Webhooks**: Agency-, customer-, and campaign-specific triggers
- **Event Types**: New leads, status changes, data updates
- **Auto Lead Details**: Intelligent enrichment of webhook payloads

### 🏢 **Comprehensive Account Management**

- **Customer Management**: List all customers with pagination
- **Campaign Management**: Fetch campaigns per customer
- **Hierarchical Structure**: Agency → Customer → Campaign → Leads

### 🔐 **Secure API Integration**

- **Dual Authentication**: API key + email verification
- **Connection Test**: Automatic authentication check
- **Error Handling**: Robust handling with informative messages

## 📦 Installation

### Requirements

- n8n version 1.0.0 or higher
- Active LeadTable account with a valid API key

## 🔧 Configuration

### Set Up API Credentials

1.  In n8n, go to **Credentials** → **Create New**
2.  Search for **“LeadTable API”**
3.  Enter your credentials:
    - **API Key**: Your LeadTable API key
    - **Email**: Your LeadTable account email
    - **Base URL**: `https://api.lead-table.com/api/v3/external`

### Obtain Your API Key

1.  Log in to LeadTable
2.  Navigate to **Settings** → **API**
3.  Generate a new API key
4.  Copy the key and your account email

### LeadTable Node (Manual Actions)

#### **Lead Management**

Action

Description

**Create Lead**

Create a new lead in a campaign with custom data

**Get Lead**

Load lead details (optional: plain-text description)

**Update Lead**

Modify lead information via a Q&A flow

**Update Description**

Edit only the lead description

**Search by Email**

Find leads by email address (with pagination)

**List by Campaign**

Load all leads for a campaign (with pagination)

**Attach File**

Upload a file and link it to a lead

#### **Account Management**

Action

Description

**List All Customers**

Full customer list (with pagination)

**List All Campaigns**

Load campaigns for a specific customer

#### **Webhook Management**

Action

Description

**Register Webhook**

Register a webhook for events (multi-level)

**Remove Webhook**

Delete a registered webhook

**Fetch Webhook Events**

Retrieve pending events (polling)

#### **Authentication**

Action

Description

**Test Authentication**

Verify API connection and credentials

### LeadTable Trigger (Automatic Events)

#### **Event Types**

- **New Lead Created**: Fired whenever a new lead is created
- **Lead Status Changed**: Fired on status transitions
- **Lead Updated**: Fired on any data change

#### **Webhook Levels**

- **Agency (Global)**: Events from all campaigns in the agency
- **Customer**: Events from all campaigns of a specific customer
- **Table (Campaign)**: Events only from a specific campaign

#### **Advanced Features**

- **Include Lead Details**: Automatically load full lead info
- **Automatic Webhook Management**: Register on activation, remove on deactivation
- **Real-Time Processing**: Immediate event handling without delay

## 📖 Examples

coming soon...
