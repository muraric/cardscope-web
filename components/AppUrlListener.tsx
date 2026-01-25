"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { App as CapacitorApp } from '@capacitor/app';

const AppUrlListener = () => {
    const router = useRouter();

    useEffect(() => {
        // Listen for app URL open events (custom scheme)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        CapacitorApp.addListener('appUrlOpen', (data: any) => {
            console.log('📱 App opened with URL:', data.url);

            // Parse the URL: cardscope://auth/sync?token=...
            if (data.url.startsWith('cardscope://')) {
                const path = data.url.replace('cardscope://', '/');
                console.log('📱 Navigating to:', path);
                router.push(path);
            }
        });

        return () => {
            CapacitorApp.removeAllListeners();
        };
    }, [router]);

    return null;
};

export default AppUrlListener;
