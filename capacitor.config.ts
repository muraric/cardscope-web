import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.shomuran.cardscope',
    appName: 'CardScope',
    webDir: 'out',

    server: {
        // 👇 Your dev / production server
        //url: 'http://192.168.1.67:3000', // or your deployed Vercel URL
        url: 'https://cardscope-web.vercel.app',
        cleartext: true,

        // 👇 Add custom Android scheme for deep link redirect
        androidScheme: 'cardscope',
    },
};

export default config;
