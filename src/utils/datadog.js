import { datadogRum } from '@datadog/browser-rum';
import { datadogLogs } from '@datadog/browser-logs';

function init() {
  datadogRum.init({
      applicationId: 'b11525e4-4558-4587-a1a5-c28b2bc12456',
      clientToken: 'pube0b5710409d225928754c18fd847d24e',
      site: 'us5.datadoghq.com',
      service:'zk-frontend',
      env:'dont-care-yet',
      // Specify a version number to identify the deployed version of your application in Datadog 
      // version: '1.0.0', 
      sessionSampleRate:100,
      premiumSampleRate: 100,
      trackUserInteractions: true,
      defaultPrivacyLevel:'mask-user-input'
  });

  datadogLogs.init({
    clientToken: 'pub2f6d00bb03f09f9c96e22bc7ac7da120',
    site: 'us5.datadoghq.com',
    forwardErrorsToLogs: true,
    forwardConsoleLogs: ["warn", "error"],
    sessionSampleRate: 100,
  });

  datadogRum.startSessionReplayRecording();
  // datadogLogs.logger.info('Initialization', { msg: "heyyyyyyy" });

}

export { init, datadogRum, datadogLogs };