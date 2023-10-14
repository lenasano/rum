require('dotenv').config();
const puppeteer = require('puppeteer');

const getSplitClient = require('./server/split.js');
const splitClient = getSplitClient();

const SAMPLE_SIZE = 100;

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
  const browser = await puppeteer.launch({headless: false, defaultViewport: null});

  for (let id = 0; id < SAMPLE_SIZE; id++) {
    console.log(`Running ${id} of ${SAMPLE_SIZE}`);

    // Open new page
    const page = await browser.newPage();

    // Emulate network conditions and disable cache to simulate new users
    await page.setCacheEnabled(false);

    // Evaluate Split flag to determine what the emulated network conditions should be for this user
    const networkSpeed = splitClient.getTreatment(id, process.env.FEATURE_FLAG_NETWORK_SPEED);

    await page.emulateNetworkConditions(
      (networkSpeed in NETWORK_CONDITIONS)
      ? NETWORK_CONDITIONS[networkSpeed]
      : NETWORK_CONDITIONS.Good3G
    );

    // Navigate to URL
    await page.goto(`http://localhost:3000/?id=${id}`, { waitUntil: "networkidle0" });

    // Close the tab so that the Web Vitals Interaction to Next Paint (INP)
    // and Cumulative Layout Shift (CLS) measurements will be sent
    await page.close();

    // Wait some time
    //await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Close browser
  await browser.close();

  console.log('Automation script finished');
})();
