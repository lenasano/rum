const path = require('path');
const express = require('express');
const appRouter = express.Router();

const { SplitFactory } = require('@splitsoftware/splitio');
require('dotenv').config();

const client = SplitFactory({
  core: {
    authorizationKey: process.env.SERVER_SIDE_SDK_KEY
  },
  scheduler: {
    impressionsRefreshRate: 5 // seconds - send information on who got what treatment at what time back to Split server every 5 seconds
  },
  debug: 'INFO'
}).client();

// Split traffic to serve two variants of the Web page, using `id` query param as user key for feature flag evaluations
// Web page variants are located at different folders: `dist/sync` (OFF treatment) and `dist/async` (ON treatment)

// Split traffic to serve assets from two different folders, `dist/sync` (OFF treatment) and `dist/async` (ON treatment), using id from query parameters
appRouter.use((req, res, next) => {
  const treatment = client.getTreatment(req.query.id, process.env.FEATURE_FLAG_NAME);
  console.log(`serving ${treatment}`);
  if (req.query.id && treatment === 'on') {
    req.url = '/on' + req.url;
  } else {
    req.url = '/off' + req.url;
  }

  next();
});

appRouter.use('/on', express.static(path.join(__dirname, '..', 'dist', 'async')));
appRouter.use('/off', express.static(path.join(__dirname, '..', 'dist', 'sync')));

/* is the client ready to evaluate treatments yet?
var congratsMessage = {
  "eng": "success", 
  "pol": "udało się", 
  "chs": "成功了", 
  "control": "warning: feature flag not evaluated"
};
const language = client.getTreatment(req.query.id, "language");
if (language in congratsMessage)
  console.log( congratsMessage[ language ] );*/

module.exports = appRouter;
