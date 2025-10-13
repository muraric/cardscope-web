import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.shomuran.cardscope',
    appName: 'CardScope',
    webDir: 'out', // keep for local fallback
    server: {
        // 👇 Load your live Vercel app
        //url: 'http://192.168.1.67:3000', // Replace with your actual URL
       url: 'https://credit-card-advisor-web.vercel.app', // Replace with your actual URL
        cleartext: true,
    },
};

export default config;
