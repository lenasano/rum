require('dotenv').config();
const puppeteer = require('puppeteer');

const Split = require('./server/split.js');
const splitClient = Split.getInstance().client;

const SAMPLE_SIZE = 200;

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

  // Launch browser
  const browser = await puppeteer.launch();

  for (let id = 0; id < SAMPLE_SIZE; id++) {
    console.log(`Running ${id} of ${SAMPLE_SIZE}`);

    // Open new page
    const page = await browser.newPage();

    // Emulate network conditions and disable cache to simulate new users
    await page.setCacheEnabled(false);

    // Evaluate Split flag to determine what the emulated network conditions should be for this user
    const networkSpeed = splitClient.getTreatment(id, process.env.FEATURE_FLAG_SPEED_NAME);

    (networkSpeed in NETWORK_CONDITIONS) ? 
      await page.emulateNetworkConditions(NETWORK_CONDITIONS[networkSpeed]) : 
      await page.emulateNetworkConditions(NETWORK_CONDITIONS.Good3G);

    // Navigate to URL
    await page.goto(`http://localhost:3000/?id=${id}`);

    // Perform click on an element
    await page.click('#split_logo');

    // Wait some time
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Close browser
  await browser.close();

  console.log('Automation script finished');
})();
