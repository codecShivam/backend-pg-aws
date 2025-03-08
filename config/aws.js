
const AWS = require("aws-sdk");
require("dotenv").config();

// Validate required AWS credentials
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION) {
  console.error("Missing AWS credentials in environment variables");
  process.exit(1); // Exit if credentials are missing
}

try {
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });

  const ses = new AWS.SES({
    apiVersion: "2010-12-01",
  });

  // Test AWS credentials with a simple operation
  ses.listIdentities({}, (err) => {
    if (err) {
      console.error("AWS SES configuration error:", err);
      // Don't exit, but log the error
    } else {
      console.log("AWS SES configured successfully");
    }
  });

  module.exports = ses;
} catch (error) {
  console.error("Error configuring AWS SDK:", error);
  process.exit(1);
}