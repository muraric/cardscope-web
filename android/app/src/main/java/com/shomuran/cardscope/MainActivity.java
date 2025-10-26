package com.shomuran.cardscope;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.WindowManager;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import androidx.core.view.WindowCompat; // ✅ correct import (AndroidX)
import androidx.core.view.WindowInsetsControllerCompat; // ✅ correct import
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Bridge;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // ✅ Make the app respect safe area (prevent overlapping status bar)
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);

        // ✅ Optional: make status bar background white with dark icons
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        getWindow().setStatusBarColor(getResources().getColor(android.R.color.white));

        WindowInsetsControllerCompat controller =
            new WindowInsetsControllerCompat(getWindow(), getWindow().getDecorView());
        controller.setAppearanceLightStatusBars(true);

        // Handle deep link if app was opened via deep link
        handleDeepLink(getIntent());
        
        // Set up WebChromeClient to capture JavaScript console logs
        // Use post() to run after WebView is initialized
        if (getBridge() != null) {
            getWindow().getDecorView().post(new Runnable() {
                @Override
                public void run() {
                    Bridge bridge = getBridge();
                    if (bridge != null && bridge.getWebView() != null) {
                        bridge.getWebView().setWebChromeClient(new WebChromeClient() {
                            @Override
                            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                                Log.d(TAG, "JS: " + consoleMessage.message() + " -- From line "
                                        + consoleMessage.lineNumber() + " of "
                                        + consoleMessage.sourceId());
                                return true;
                            }
                        });
                        Log.d(TAG, "WebChromeClient configured");
                    }
                }
            });
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        
        // Handle deep link when app is already running
        handleDeepLink(intent);
    }

    private void handleDeepLink(Intent intent) {
        Uri data = intent.getData();
        if (data != null && "cardscope".equals(data.getScheme())) {
            Log.d(TAG, "Deep link received: " + data.toString());
            
            // Pass the entire URL to JavaScript via a custom event
            // This will be picked up by the AuthContext deep link handler
            String url = data.toString();
            
            // Inject JavaScript to notify the WebView about the deep link
            String js = "window.dispatchEvent(new CustomEvent('deepLink', { detail: '" + url.replace("'", "\\'") + "' }));";
            getBridge().getWebView().evaluateJavascript(js, null);
        }
    }
}
