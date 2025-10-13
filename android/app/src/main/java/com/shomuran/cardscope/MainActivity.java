package com.shomuran.cardscope;

import android.os.Bundle;
import android.view.WindowManager;
import androidx.core.view.WindowCompat; // ✅ correct import (AndroidX)
import androidx.core.view.WindowInsetsControllerCompat; // ✅ correct import
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
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
    }
}
