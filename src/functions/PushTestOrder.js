const { app } = require('@azure/functions');
const axios = require('axios');

app.http('PushTestOrder', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            const apiKey = process.env.SHIPSTATION_API_KEY;
            const apiSecret = process.env.SHIPSTATION_API_SECRET;

            if (!apiKey || !apiSecret) {
                return {
                    status: 400,
                    body: JSON.stringify({
                        error: 'Missing SHIPSTATION_API_KEY or SHIPSTATION_API_SECRET environment variables'
                    })
                };
            }

            // Create Basic Auth header
            const credentials = `${apiKey}:${apiSecret}`;
            const encodedCredentials = Buffer.from(credentials).toString('base64');
            const authHeader = `Basic ${encodedCredentials}`;

            // Build test order
            const today = new Date().toISOString().split('T')[0];
            const testOrder = {
                orderNumber: 'TEST-001',
                orderDate: today,
                orderStatus: 'awaiting_shipment',
                billTo: {
                    name: 'Test Buyer',
                    street1: '123 Test St',
                    city: 'Austin',
                    state: 'TX',
                    postalCode: '78701',
                    country: 'US'
                },
                shipTo: {
                    name: 'Test Buyer',
                    street1: '123 Test St',
                    city: 'Austin',
                    state: 'TX',
                    postalCode: '78701',
                    country: 'US'
                },
                items: [
                    {
                        sku: 'TEST-SKU-001',
                        name: 'Test Book',
                        quantity: 1,
                        unitPrice: 9.99
                    }
                ],
                amountPaid: 9.99,
                taxAmount: 0,
                shippingAmount: 0
            };

            // POST to ShipStation
            const response = await axios.post(
                'https://ssapi.shipstation.com/orders/createorder',
                testOrder,
                {
                    headers: {
                        'Authorization': authHeader,
                        'Content-Type': 'application/json'
                    }
                }
            );

            context.log(`ShipStation response - Status: ${response.status}`, response.data);

            return {
                status: 200,
                jsonBody: {
                    message: 'Order pushed to ShipStation successfully',
                    statusCode: response.status,
                    shipstationResponse: response.data
                }
            };
        } catch (error) {
            context.log(`Error pushing order to ShipStation:`, error.message);
            context.log(`Response data:`, error.response?.data);

            return {
                status: error.response?.status || 500,
                jsonBody: {
                    error: error.message,
                    details: error.response?.data
                }
            };
        }
    }
});
