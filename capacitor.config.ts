import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.shomuran.cardscope',
    appName: 'CardScope',
    webDir: 'dist',
    server: {
        // Use production Vercel URL
        url: 'https://cardscope-web.vercel.app',
        androidScheme: 'https',
        iosScheme: 'https'
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
