import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'tp.caminapp',
  appName: 'caminapp',
  webDir: 'www',
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: [],
    },
    CapacitorGoogleMaps: {
      apiKey: "AIzaSyDO43RZhZjZv_5ulIqRRe7FYzCZS0gTGE8"
    }
  }
};

export default config;
