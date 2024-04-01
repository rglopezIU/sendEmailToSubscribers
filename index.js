/**
 * Background Function triggered by a new Firestore document.
 *
 * @param {!Object} event The Cloud Functions event. (In this case: the actual Firestore document!)
 * @param {!Object} context Cloud Functions event metadata.
 */

const {Firestore} = require('@google-cloud/firestore');
require('dotenv').config()
const sgMail = require('@sendgrid/mail');

// Initialize Firestore
const firestore = new Firestore();

// GET OUR API KEY
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Function to send email
const sendEmail = async (toEmail, subject, text) => {
    const msg = {
        to: toEmail,
        from: process.env.SENDGRID_SENDER,
        subject: subject,
        text: text,
    };

    try {
        await sgMail.send(msg);
        console.log('Email sent successfully to', toEmail);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

// Cloud Function to be triggered when a new document is added to Firestore
exports.notifySubscribers = async (data, context) => {
    try {
        const dealId = context.params.dealId;

        // Fetch the document data from Firestore using the dealId
        const dealDoc = await firestore.collection('deals').doc(dealId).get();
        if (!dealDoc.exists) {
            console.error('Document does not exist');
            return;
        }

        const dealData = dealDoc.data();
        const {headline, location} = dealData;

        // Find subscribers watching the location
        const subscribersSnapshot = await firestore.collection('subscribers')
            .where('watch_regions', 'array-contains-any', location)
            .get();
        
        // Check if any subs have the watch regions
        if (subscribersSnapshot.empty) {
            console.log('No subscribers found for the watched region');
            return;
        }

        // Iterate over each subscriber and send email
        subscribersSnapshot.forEach(async (subscriberDoc) => {
            const {email_address} = subscriberDoc.data();
            // Send email to the subscriber
            await sendEmail(email_address, `rglopez: New Travel Deal! ${headline}`, `Check out this amazing travel deal: ${headline}`);
        });
    } catch (error) {
        console.error('Error processing document:', error);
    }
}; 