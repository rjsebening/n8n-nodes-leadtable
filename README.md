# n8n-nodes-leadtable

![LeadTable Node](https://img.shields.io/badge/n8n-community--node-FF6D5A)  
![Version](https://img.shields.io/badge/version-1.0.0-blue)  
![License](https://img.shields.io/badge/license-MIT-green)

A professional n8n custom node for seamless integration with the LeadTable API. Automate your lead-management workflows with full CRUD operations and real-time webhook support.

## What is n8n?

n8n is an easy-to-use workflow automation tool that connects different apps and services, like LeadTable.  
By creating "workflows" between apps, you can automate many manual tasks – saving you and your team valuable time.

## ⚖️ Legal Notice

This Community Node uses the public LeadTable API and is **not affiliated with, endorsed, or sponsored by LeadTable**.  
All trademarks are the property of their respective owners.

**Note**: This is a community-developed Node for the LeadTable API. For official support, please contact LeadTable directly.

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

### Installation in n8n

This node can be installed using the **Community Nodes** feature in n8n.

1. Open your n8n instance
2. Go to **Settings → Community Nodes → Install**
3. Enter one of the following package names:

#### Variant 1 – Scoped (personal scope)

```

@rjsebening/n8n-nodes-leadtable

```

#### Variant 2 – Unscoped (default)

```

n8n-nodes-leadtable

```

Both packages contain the same code. The scoped version exists to avoid name conflicts with future official packages.

4. Restart n8n → the node is available

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

-   Automatically create deals in your CRM when a new LeadTable lead comes in
    
-   Notify your sales team on Slack or Teams instantly
    
-   Enrich leads with external data before passing them on
    
-   Build complete onboarding pipelines triggered by LeadTable 

## 🌍 Why this matters

LeadTable helps agencies get the most from campaigns.  
But **without proper automation, leads often get stuck in spreadsheets or inboxes**.

This node changes that.  
It connects LeadTable with your systems — making sure **every lead is processed, followed up, and monetized automatically**.

## 📬 About the Author

I’m [Rezk Jörg Sebening](https://github.com/rjsebening) – Business Automation Expert (DACH).  
I build automation systems & n8n nodes that free agencies, coaches, and consultants from manual work.

👉 Follow me on GitHub to stay updated with new DACH-focused integrations.


## 📋 Disclaimer

This unofficial community Node is **not affiliated with, supported, or sponsored by LeadTable**.  
It only provides an interface to the publicly available LeadTable API under its terms of use.

**Important Notes:**

- This Node is developed and maintained by the community
- For issues with the LeadTable API itself, please contact official LeadTable support
- All LeadTable trademarks and logos belong to LeadTable
- This Node only acts as a connector to the public API
