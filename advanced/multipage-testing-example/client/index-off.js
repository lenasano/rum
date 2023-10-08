/* Statically import '@splitsoftware/browser-rum-agent' from NPM */
import { SplitRumAgent, webVitals } from '@splitsoftware/browser-rum-agent';

SplitRumAgent
  .setup(process.env.CLIENT_SIDE_SDK_KEY)
  .addIdentities([
    // in this example, we get the user key from URL query parameter `id`
    { key: new URLSearchParams(window.location.search).get('id'), trafficType: 'user' }
  ]);

SplitRumAgent.register(webVitals());
