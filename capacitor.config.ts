import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'zw.ac.dare.digital',
  appName: 'DARE Digital Library',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  android: {
    buildOptions: {
      releaseType: 'APK',
    },
    backgroundColor: '#0D1F17',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0D1F17',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
  },
};

export default config;
