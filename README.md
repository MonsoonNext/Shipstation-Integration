# ShipStation Integration Trial

This is a trial Azure Functions integration that pushes orders to ShipStation and receives shipment events back via webhook. It's built with Node.js on Azure Functions v4 to demonstrate two-way order and shipment synchronization.

## Prerequisites

Before you can run this project, install the following:

- **Node.js v18 or higher** - Download from [nodejs.org](https://nodejs.org/)
- **Azure Functions Core Tools v4** - Install with:
  ```
  npm install -g azure-functions-core-tools@4 --unsafe-perm
  ```
- **ngrok free account** - Sign up at [ngrok.com](https://ngrok.com) for webhook testing (optional for local testing only)

## Setup

1. **Clone the repository**
   ```
   git clone <repo-url>
   cd Shipstation_V1
   ```

2. **Install dependencies**
   ```
   npm install
   ```

3. **Create local settings file**
   Copy the example file to create your local settings:
   ```
   copy local.settings.json.example local.settings.json
   ```
   Note: `local.settings.json` is git-ignored and must be created manually. It contains your secrets and will not be committed.

4. **Add your ShipStation credentials**
   Open `local.settings.json` and fill in your ShipStation V1 API key and secret:
   ```json
   {
     "IsEncrypted": false,
     "Values": {
       "AzureWebJobsStorage": "",
       "FUNCTIONS_WORKER_RUNTIME": "node",
       "SHIPSTATION_API_KEY": "your-api-key-here",
       "SHIPSTATION_API_SECRET": "your-api-secret-here"
     }
   }
   ```

## local.settings.json Format

Your local settings file should have this structure:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "SHIPSTATION_API_KEY": "your-api-key-here",
    "SHIPSTATION_API_SECRET": "your-api-secret-here"
  }
}
```

**Important:** Do not commit this file. It contains your API credentials. The `.gitignore` file is already configured to exclude it.

## Running Locally

1. **Start the Azure Functions runtime**
   ```
   func start
   ```

2. **Verify both functions are running**
   You should see output similar to:
   ```
   PushTestOrder: [GET,POST] http://localhost:7071/api/PushTestOrder
   ReceiveShipmentWebhook: [POST] http://localhost:7071/api/ReceiveShipmentWebhook
   ```

Both functions are now available at `http://localhost:7071`.

## Testing

### Test 1: Push a Test Order

1. Open your browser or use curl/Postman to call:
   ```
   GET http://localhost:7071/api/PushTestOrder
   ```

2. You should receive a response with:
   - HTTP 200 status
   - A ShipStation orderId in the response
   - Order number: TEST-001

3. **Verify in ShipStation UI:**
   - Log into your ShipStation account
   - Go to "Orders" and filter by "Awaiting Shipment"
   - You should see TEST-001 with the test customer "Test Buyer"

### Test 2: Receive Shipment Webhooks

Webhook testing requires a public URL since ShipStation needs to call back to your functions. Use ngrok to create a tunnel:

1. **Install ngrok locally** (optional if not already installed):
   ```
   npm install -g ngrok
   ```

2. **In a new terminal, start ngrok:**
   ```
   ngrok http 7071
   ```

3. **Copy the forwarding URL** (looks like `https://xxxx-xx-xxx-xx-xxx.ngrok.io`)

4. **Register webhooks in ShipStation:**
   In ShipStation settings, register two webhooks pointing to:
   - `https://your-ngrok-url/api/ReceiveShipmentWebhook` for SHIP_NOTIFY events
   - `https://your-ngrok-url/api/ReceiveShipmentWebhook` for FULFILLMENT_SHIPPED events

5. **Test the webhook:**
   - In ShipStation, find TEST-001 in Awaiting Shipment
   - Click "Mark as Shipped" and select any carrier (UPS is fine)
   - Enter a test tracking number (e.g., TRACK123456)

6. **Watch the terminal** where you ran `func start`:
   You should see log output showing:
   ```
   Webhook received - Resource Type: FULFILLMENT_SHIPPED
   Webhook received - Resource URL: https://ssapi.shipstation.com/fulfillments/...
   Fulfillment Details:
     Tracking Number: TRACK123456
     Fulfillment Fee: 0
     Carrier Code: UPS
   ```

## Project Structure

```
├── src/
│   └── functions/
│       ├── PushTestOrder.js          - Pushes test orders to ShipStation
│       └── ReceiveShipmentWebhook.js - Receives and processes shipment webhooks
├── host.json                         - Azure Functions runtime configuration
├── package.json                      - Node.js dependencies
├── local.settings.json.example       - Template for local settings (commit this, not local.settings.json)
├── local.settings.json               - Your local credentials (git-ignored, create manually)
├── README.md                         - This file
└── TRIAL_LOG.md                      - Detailed trial documentation and results
```

## Troubleshooting

- **Functions won't start:** Make sure Node.js and Azure Functions Core Tools are installed (`func --version` to check)
- **API authentication errors:** Verify your SHIPSTATION_API_KEY and SHIPSTATION_API_SECRET are correct in local.settings.json
- **Webhooks not firing:** Make sure ngrok is running and ShipStation webhook URLs are registered correctly
- **"AzureWebJobsStorage" warning:** This is harmless in local development. The setting can be left empty.

## Next Steps

See `TRIAL_LOG.md` for detailed trial results and suggested next steps for production deployment.
