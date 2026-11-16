# Trial Integration Log

**Date:** November 16, 2026

## Overview

This trial was a proof-of-concept integration between an order management system and ShipStation using the ShipStation V1 API and Azure Functions. The goal was to validate that orders can be pushed from an external system to ShipStation and that shipment events can be received back through webhooks, enabling a two-way integration for order fulfillment tracking.

## What Was Tested

1. **Pushing a test order to ShipStation** - Created an HTTP function that sends a test order (order number, customer address, line item) to ShipStation's `/orders/createorder` endpoint using API authentication.

2. **Verifying order appearance** - Confirmed that the pushed order appeared in ShipStation's "Awaiting Shipment" queue visible in the UI.

3. **Receiving shipment notifications** - Set up webhook listeners to receive FULFILLMENT_SHIPPED notifications when an order was manually marked as shipped in ShipStation.

4. **Extracting shipment data** - Parsed the webhook payload to retrieve tracking number, carrier code, and fulfillment fee from the fulfillments API response.

## Results

- **Order creation:** Orders pushed successfully via the API; ShipStation returned an orderId confirming successful creation.
- **Order visibility:** Orders appeared immediately in the ShipStation UI under "Awaiting Shipment" queue.
- **Webhook delivery:** Webhooks fired within seconds of marking an order as shipped in the ShipStation interface.
- **Data extraction:** All required fields extracted correctly from webhook responses:
  - Tracking Number: TRACK999
  - Carrier Code: UPS
  - Fulfillment Fee: 0

## Technical Notes

- **Authentication:** ShipStation V1 API uses Basic Authentication with API key and secret base64 encoded in the Authorization header.
- **Webhook resource URLs:** Webhook payloads contain a `resource_url` field that must be called separately to retrieve full shipment details; the webhook body alone does not contain the data.
- **Fulfillments vs. Shipments:** The FULFILLMENT_SHIPPED webhook event points to the `/fulfillments` API endpoint, which has a different response structure than the `/shipments` endpoint.
- **Response structure:** The fulfillments endpoint wraps results in a `fulfillments` array property (`response.fulfillments[0]`) rather than returning an array at the top level.
- **Webhooks registered:** Two webhooks were set up during testing:
  - SHIP_NOTIFY (ID: 48905)
  - FULFILLMENT_SHIPPED (ID: 48906)
- **Rate limiting:** ShipStation V1 API enforces a limit of 40 requests per minute.
- **Local development:** AzureWebJobsStorage warnings in local development mode are harmless and do not affect the trial; storage configuration is not required for this integration.

## What This Does Not Cover Yet

- Reading and transforming orders from the source order management system
- Writing tracking numbers and shipment status back to the source system
- Cloud deployment to Azure (currently runs in local development only)
- Integration with real carrier label workflows
- Production-grade error handling, retry logic, and dead-letter queues
- Infrastructure as Code (Bicep templates) for repeatable Azure deployment
- Security hardening (secrets management, authentication for webhooks, etc.)

## Suggested Next Steps

1. **Connect to source system:** Integrate with the real order management API to read orders and write shipment/tracking data back.
2. **Deploy to Azure:** Set up a cloud-hosted Azure Function App with appropriate resource groups and storage.
3. **Add infrastructure code:** Create Bicep templates to provision and manage Azure resources programmatically.
4. **Enhance error handling:** Add proper error handling, logging, and retry logic for production reliability.
5. **Test with real carriers:** Complete end-to-end testing with actual carrier label purchases and real tracking numbers.
