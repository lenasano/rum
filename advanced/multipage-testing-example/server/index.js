require('dotenv').config();
const path = require('path');
const express = require('express');
const app = express();

const getSplitClient = require('./split.js');
const splitClient = getSplitClient();

// Split traffic to serve two variants of the Web page, using `id` query param as user key for feature flag evaluations
// Web page variants are located at different folders: `dist/off` ('off' treatment) and `dist/on` ('on' treatment)

app.use('/on', express.static(path.join(__dirname, '..', 'dist', 'on')));
app.use('/off', express.static(path.join(__dirname, '..', 'dist', 'off')));
app.use('/', (req, res, next) => {
  if (req.query.id) {

    const optimizeAsync = splitClient.getTreatment(req.query.id, process.env.FEATURE_FLAG_OPTIMIZE_PAGE);
    const imageSize = splitClient.getTreatment(req.query.id, process.env.FEATURE_FLAG_IMAGE_SIZE);

    if (optimizeAsync === 'on') {
      return res.redirect('/on' + req.url + '&img=' + imageSize)
    } else {
      return res.redirect('/off' + req.url + '&img=' + imageSize);
    }
  }

  next();
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
