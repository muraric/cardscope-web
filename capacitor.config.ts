import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.shomuran.cardscope',
    appName: 'CardScope',
    webDir: 'out',
    server: {
        androidScheme: 'https'
    },
    plugins: {
        GoogleAuth: {
            scopes: ['profile', 'email'],
            serverClientId: '375010610176-rf9ajtm5ut8r5oauel8dg5c50qqpjmrv.apps.googleusercontent.com',
            forceCodeForRefreshToken: true
        }
    }
};

export default config;
