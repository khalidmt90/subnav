import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.khalid.subscriptionsradar',
  appName: 'رادار الاشتراكات',
  webDir: 'dist/public',

  server: {
    androidScheme: 'https'
  },

  ios: {
    backgroundColor: '#0B0C14',
    contentInset: 'never',
    preferredContentMode: 'mobile',
    scrollEnabled: false
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
