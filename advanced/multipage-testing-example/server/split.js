require('dotenv').config();
const { SplitFactory } = require('@splitsoftware/splitio');

// the SDK client singleton instance
let client;

function getSplitClient() {
  
  // This implementation of the singleton pattern ensures
  // that only one instance of the SplitFactory is created.
  // This means that only one copy of the Split (feature flag
  // and segment) definitions are downloaded and synchronized.

  if (!client) {
    client = SplitFactory({
      core: {
        authorizationKey: process.env.SERVER_SIDE_SDK_KEY,
      },
      scheduler: {
        impressionsRefreshRate: 2 // s - send information on who got what treatment at
      },                          //     what time back to Split server every 2 seconds
      debug: 'INFO'
    }).client();
  }

  return client;
}

module.exports = getSplitClient;