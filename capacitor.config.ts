import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sgc.teachertrack',
  appName: 'SGC-TeacherTrack',
  webDir: '.',
  bundledWebRuntime: false,
  
  // Configuration Android
  android: {
    allowMixedContent: true,
    backgroundColor: '#0f766e'
  },
  
  // Configuration des plugins
  plugins: {
    Filesystem: {
      // Demander la permission au premier démarrage
      requestPermissionsOnFirstRun: true
    }
  },
  
  // Serveur (pour le développement)
  server: {
    androidScheme: 'https'
  }
};

export default config;
