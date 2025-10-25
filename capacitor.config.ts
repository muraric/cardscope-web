import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.shomuran.cardscope',
    appName: 'CardScope',
    webDir: '.next',
    server: {
        androidScheme: 'https'
    },
    plugins: {
        GoogleAuth: {
            scopes: ['profile', 'email'],
            serverClientId: '488875684334-urrslagsla2btuuri02acrunqum7d2bk.apps.googleusercontent.com',
            forceCodeForRefreshToken: true
        }
    }
};

export default config;
