/* Statically import '@splitsoftware/browser-rum-agent' from NPM */
import { SplitRumAgent, webVitals } from '@splitsoftware/browser-rum-agent';

SplitRumAgent
  .setup(process.env.CLIENT_SIDE_SDK_KEY,
    // set 2 second pushRate so we can view events in realtime in Split Data hub
    { pushRate: 2 }
  )
  .addIdentities([
    // get key from URL query parameter `id`
    { key: new URLSearchParams(window.location.search).get('id'), trafficType: 'user' }
  ]);

SplitRumAgent.register(webVitals());
