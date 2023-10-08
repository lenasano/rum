/* Dynamically import a local module, which in turn imports '@splitsoftware/browser-rum-agent' for tree-shaking, resulting in a smaller app */
import('./browser-rum-agent').then(({ SplitRumAgent, webVitals }) => {

  SplitRumAgent
    .setup(process.env.CLIENT_SIDE_SDK_KEY)
    .addIdentities([
      // in this example, we get the user key from URL query parameter `id`
      { key: new URLSearchParams(window.location.search).get('id'), trafficType: 'user' }
    ]);

  SplitRumAgent.register(webVitals());

}).catch(error => {
  console.log('An error occurred while loading the module: ' + error);
});
