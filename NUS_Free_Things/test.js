const { remote } = require('webdriverio');

const capabilities = {
  platformName: "Android",
  "appium:automationName": "UiAutomator2",
  "appium:appPackage": "host.exp.exponent",
  "appium:appActivity": "host.exp.exponent.experience.ExperienceActivity",
  "appium:deviceName": "Pixel 8 Pro API 34",
  "appium:platformVersion": "14",
  "appium:skipServerInstallation": "false",
  "appium:autoGrantPermissions": "true",
  "appium:appWaitForLaunch": "false"
};

const options = {
  path: '/wd/hub/',
  port: 4723,
};

const wdOpts = {
  hostname: process.env.APPIUM_HOST || 'localhost',
  port: parseInt(process.env.APPIUM_PORT, 10) || 4723,
  logLevel: 'info',
  capabilities,
};

async function launchExpoAndroid(client) {
  await client.startActivity(capabilities['appium:appPackage'], capabilities['appium:appActivity']);
  return client;
}

async function waitForAppToLoad(client) {
  // Example: Wait for an element that indicates the app has loaded
  // Replace 'appLoadedElementSelector' with the actual selector for an element that appears when the app is loaded
  const appLoadedElementSelector = '*//[@text="Email"]';
  await client.$(appLoadedElementSelector).waitForDisplayed({ timeout: 30000 });
}

async function runTest() {
  const driver = await remote(wdOpts);
  try {
    await launchExpoAndroid(driver);
    await waitForAppToLoad(driver);
    // Perform your test steps here
  } finally {
    await driver.deleteSession();
  }
}

runTest().catch(console.error);