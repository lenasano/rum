require('dotenv').config();
const { SplitFactory } = require('@splitsoftware/splitio');

class PrivateSplit {
  constructor() {
      this.client = SplitFactory({
        core: {
          authorizationKey: process.env.SERVER_SIDE_SDK_KEY,
        },
        scheduler: {
          impressionsRefreshRate: 2 // s - send information on who got what treatment at
        },                          //     what time back to Split server every 2 seconds
        debug: 'INFO'
      }).client();
  }
}
class Split {
  constructor() {
      throw new Error('Use Split.getInstance()');
  }
  static getInstance() {
      if (!Split.instance) {
          Split.instance = new PrivateSplit();
      }
      return Split.instance;
  }
}

module.exports = Split;