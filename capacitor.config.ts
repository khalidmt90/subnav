import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.khalid.subscriptionsradar',
  appName: 'رادار الاشتراكات',
  webDir: 'dist/public',

  server: {
    url: 'https://subnav-production.up.railway.app',
    cleartext: false,
    androidScheme: 'https'
  },

  ios: {
    backgroundColor: '#0B0C14',
    contentInset: 'automatic',
    preferredContentMode: 'mobile'
  },

  plugins: {
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#0B0C14'
    },
    SplashScreen: {
      backgroundColor: '#0B0C14',
      launchAutoHide: true,
      showSpinner: false
    }
  }
};

export default config;
