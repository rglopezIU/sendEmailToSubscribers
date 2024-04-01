## quick start guide :D

# Cloud Function Triggered by New Firestore Document
This demo code shows how to trigger a Google Cloud Function when a document is created in a specific collection in a specific database. The source code will also demonstrate how to access the content of the newly-created document.

## Deploying the Cloud Function
The following command should be executed in the **same** Google Cloud Project as the Firestore database.

In this example, the cloud function will execute when a new document is added to the `deal` collection in the `(default)` database.

```
gcloud functions deploy notifySubscribers \
--entry-point notifySubscribers \
--runtime nodejs18 \
--trigger-event "providers/cloud.firestore/eventTypes/document.create" \
--trigger-resource "projects/sp24-41200-rglopez-traveldeals/databases/(default)/documents/deals/{dealId}" \
--no-gen2
```