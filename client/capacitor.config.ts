import type { CapacitorConfig } from '@capacitor/cli';

// Local dev uses an HTTP API (e.g. http://192.168.x.x:8080). androidScheme must be
// 'http' or the WebView blocks those requests as mixed content (https page → http API).
// Store builds against HTTPS production API can switch this back to 'https'.
const isStoreBuild = process.env.STORE_BUILD === 'true';

const config: CapacitorConfig = {
  appId: 'com.intensity.app',
  appName: 'Intensity',
  webDir: 'dist',
  server: isStoreBuild
    ? {
        androidScheme: 'https',
      }
    : {
        androidScheme: 'http',
        cleartext: true,
      },
  android: isStoreBuild
    ? {}
    : {
        allowMixedContent: true,
      },
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      style: 'DARK',
      backgroundColor: '#fff7ed',
    },
  },
};

export default config;
