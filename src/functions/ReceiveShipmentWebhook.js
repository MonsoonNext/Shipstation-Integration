const { app } = require('@azure/functions');
const axios = require('axios');

app.http('ReceiveShipmentWebhook', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            const body = await request.json();
            const resourceUrl = body.resource_url;
            const resourceType = body.resource_type;

            context.log(`Webhook received - Resource Type: ${resourceType}`);
            context.log(`Webhook received - Resource URL: ${resourceUrl}`);

            const apiKey = process.env.SHIPSTATION_API_KEY;
            const apiSecret = process.env.SHIPSTATION_API_SECRET;

            if (!apiKey || !apiSecret) {
                context.log('Error: Missing SHIPSTATION_API_KEY or SHIPSTATION_API_SECRET');
                return {
                    status: 200,
                    jsonBody: { status: 'received' }
                };
            }

            // Create Basic Auth header
            const credentials = `${apiKey}:${apiSecret}`;
            const encodedCredentials = Buffer.from(credentials).toString('base64');
            const authHeader = `Basic ${encodedCredentials}`;

            // Fetch shipment details from resource_url
            const response = await axios.get(resourceUrl, {
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json'
                }
            });

            const shipmentData = response.data;

            // Extract data from first fulfillment
            if (shipmentData && shipmentData.fulfillments && Array.isArray(shipmentData.fulfillments) && shipmentData.fulfillments.length > 0) {
                const firstFulfillment = shipmentData.fulfillments[0];
                const trackingNumber = firstFulfillment.trackingNumber;
                const fulfillmentFee = firstFulfillment.fulfillmentFee;
                const carrierCode = firstFulfillment.carrierCode;

                context.log(`Fulfillment Details:`);
                context.log(`  Tracking Number: ${trackingNumber}`);
                context.log(`  Fulfillment Fee: ${fulfillmentFee}`);
                context.log(`  Carrier Code: ${carrierCode}`);
            }

            return {
                status: 200,
                jsonBody: { status: 'received' }
            };
        } catch (error) {
            context.log(`Error processing webhook: ${error.message}`);
            context.log(`Response data:`, error.response?.data);

            // Return 200 OK to ShipStation even on error to prevent retries
            return {
                status: 200,
                jsonBody: { status: 'received' }
            };
        }
    }
});
