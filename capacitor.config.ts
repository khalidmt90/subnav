import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.subscriptionsradar.app',
  appName: 'رادار الاشتراكات',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
  },
  ios: {
    backgroundColor: '#0B0C14',
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'Subscriptions Radar',
  },
  plugins: {
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#0B0C14',
    },
    SplashScreen: {
      backgroundColor: '#0B0C14',
      launchAutoHide: true,
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
  },
};

export default config;
