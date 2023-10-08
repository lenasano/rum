require('dotenv').config();
const puppeteer = require('puppeteer');

const getSplitClient = require('./server/split.js');
const splitClient = getSplitClient();


// You can optionally pass the loop variables on the command line, e.g. `npm run automation 0 200`
let [i, SAMPLE_SIZE] = process.argv.slice(2,4).map(n => parseInt(n, 10));
// Validate input
if ( !( i <= SAMPLE_SIZE ) ) {
  console.log(`Found invalid command line arguments '${i}' and '${SAMPLE_SIZE}'. Using default values instead.`);
  i = 0;
  SAMPLE_SIZE = 200;
}


// https://fdalvi.github.io/blog/2018-02-05-puppeteer-network-throttle/
const NETWORK_CONDITIONS = {
  Regular3G: {
    download: 750 * 1024 / 8,
    upload: 250 * 1024 / 8,
    latency: 100
  },
  Good3G: {
    offline: false,
    download: 1.5 * 1024 * 1024 / 8,
    upload: 750 * 1024 / 8,
    latency: 40
  },
  Regular4G: {
    download: 4 * 1024 * 1024 / 8,
    upload: 3 * 1024 * 1024 / 8,
    latency: 20
  },
  WiFi: {
    download: 30 * 1024 * 1024 / 8,
    upload: 15 * 1024 * 1024 / 8,
    latency: 2
  }
};


(async () => {
  console.log('Navigation script');

  // Launch browser, use headful mode to allow Cumulative Layout Shift (CLS) measurment
  const browser = await puppeteer.launch({headless: false, defaultViewport: null});

  for (; i < SAMPLE_SIZE; i++) {
    console.log(`Running ${i} of ${SAMPLE_SIZE}`);

    // Open new page
    const page = await browser.newPage();

    // Emulate network conditions and disable cache to simulate new users
    await page.setCacheEnabled(false);

    // Evaluate Split flag to determine what the emulated network conditions should be for this user
    const networkSpeed  = splitClient.getTreatment(i, process.env.FEATURE_FLAG_NETWORK_SPEED);

    await page.emulateNetworkConditions(
      (networkSpeed in NETWORK_CONDITIONS)
      ? NETWORK_CONDITIONS[networkSpeed]
      : NETWORK_CONDITIONS.Good3G
    );

    // Navigate to URL
    await page.goto (`http://localhost:3000/?id=${i}` , {waitUntil: "networkidle0", timeout: 0}); // Disabled timeout to avoid exception being thrown. If, however, the page gets 'stuck', click the refresh button.

    // Click on an element to start measuring First Input Delay (FID) and Interaction to Next Paint (INP) time
    await page.click('#split_logo');

    // Pause to allow time for the FID and INP measurement
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Close the tab so that the CLS and INP measurements are sent
    await page.close();
  }

  // Pause to allow the browser time to send the last CLS measurement
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Close browser
  await browser.close();

  console.log('Automation script finished');
})();
