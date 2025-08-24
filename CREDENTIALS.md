# 📄 CREDENTIALS.md

# LeadTable API Credentials

This file describes how to create credentials for the **LeadTable API** in n8n to use the [n8n-nodes-leadtable](./) node.

## 🔑 Required Credentials

To use the integration, you need the following information:

1. **API Key (`x-api-key`)**

- Your personal API key for LeadTable.
- You can get this from the [LeadTable Portal](https://portal.lead-table.com/).
  Go to **Settings → API Token → Create New API Token** or manage an existing one.
- Tip: Give the token a meaningful name, e.g., `n8n-leadtable-token`.

2. **Agency Email (`email`)**

- The email address of your LeadTable agency's account holder.
- This is used together with the API key for authentication.

3. **Base URL (`baseUrl`)** _(Default stored)_

- Default value:

```
https://api.lead-table.com/api/v3/external
```

- This value is already pre-filled when creating credentials in n8n and usually **does not need to be adjusted**.

## ⚙️ Setup in n8n

1. Open n8n and go to **Credentials → Add New Credential**.
2. Select **LeadTable API**.
3. Enter the values:

- **API Key:** Your `x-api-key` from the portal
- **Email:** Your agency owner email
- **Base URL:** (optional, default value is recommended)

4. Save.

## ✅ Test connection

To check if the credentials are working correctly, n8n automatically runs a test against the authentication endpoint:

```

GET /auth
Host: [https://api.lead-table.com/api/v3/external](https://api.lead-table.com/api/v3/external)
Headers:
x-api-key: <YOUR_API_KEY>
email: <YOUR_EMAIL>
accept: application/json

```

- If the data is correct, a confirmation with status **200 OK** should be returned.
- If an error occurs, please check your API key, email address, and whether your token is active.

## 📝 Notes

- API keys do not expire automatically, but can be revoked or recreated at any time in the [LeadTable Portal](https://portal.lead-table.com/).
- It is recommended to create a separate API token for each use case (e.g., `n8n-leadtable-token`).
- Changes to your API tokens immediately affect existing integrations.
