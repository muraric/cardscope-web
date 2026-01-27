import UIKit
import Capacitor
import SafariServices

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?
    var pendingAuthUrl: URL? // Store URL to process after window is ready

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.

        // Check if app was launched with a URL
        if let url = launchOptions?[.url] as? URL {
            print("📱 App launched with URL: \(url.absoluteString)")
            if url.scheme == "cardscope" {
                pendingAuthUrl = url
                UserDefaults.standard.set(url.absoluteString, forKey: "pendingDeepLink")
            }
        }

        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.

        print("📱 applicationDidBecomeActive called")
        print("📱 window: \(String(describing: self.window))")
        print("📱 rootViewController: \(String(describing: self.window?.rootViewController))")

        // Check for pending auth URL stored in memory
        if let url = pendingAuthUrl {
            print("📱 Processing pendingAuthUrl: \(url.absoluteString)")
            pendingAuthUrl = nil // Clear to prevent duplicate processing

            // Give the WebView time to fully initialize
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                self.navigateToAuthSuccess(url: url)
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 2.5) {
                self.injectDeepLinkJS(url: url)
            }
            return
        }

        // Check for pending deep link in UserDefaults
        if let pendingDeepLink = UserDefaults.standard.string(forKey: "pendingDeepLink"),
           let url = URL(string: pendingDeepLink) {
            print("📱 Processing pending deep link from UserDefaults: \(pendingDeepLink)")

            // Clear it immediately to prevent duplicate processing
            UserDefaults.standard.removeObject(forKey: "pendingDeepLink")

            // Wait for WebView to be ready, then navigate
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                self.navigateToAuthSuccess(url: url)
            }

            // Also try injecting JS as backup
            DispatchQueue.main.asyncAfter(deadline: .now() + 2.5) {
                self.injectDeepLinkJS(url: url)
            }
        }
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call

        print("📱 application(_:open:options:) called")
        print("📱 URL: \(url.absoluteString)")
        print("📱 window: \(String(describing: self.window))")

        // Handle custom deep link schemes
        if url.scheme == "cardscope" {
            print("📱 Received cardscope deep link: \(url.absoluteString)")

            // Store the deep link URL in UserDefaults for persistence
            UserDefaults.standard.set(url.absoluteString, forKey: "pendingDeepLink")

            // Check if window and WebView are ready
            if let rootViewController = self.window?.rootViewController as? CAPBridgeViewController,
               let bridge = rootViewController.bridge,
               bridge.webView != nil {
                print("📱 WebView is ready, navigating immediately")
                // WebView is ready, navigate now
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                    self.navigateToAuthSuccess(url: url)
                }
            } else {
                print("📱 WebView not ready, storing URL for later processing")
                // WebView not ready, store URL to process in applicationDidBecomeActive
                pendingAuthUrl = url
            }

            // Also inject JavaScript as backup with increasing delays
            let delays: [Double] = [1.5, 2.5, 3.5]
            for delay in delays {
                DispatchQueue.main.asyncAfter(deadline: .now() + delay) {
                    self.injectDeepLinkJS(url: url)
                }
            }

            return true
        }

        // For HTTP/HTTPS URLs, let Capacitor handle it
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    private func navigateToAuthSuccess(url: URL, retryCount: Int = 0) {
        // Extract query params from cardscope:// URL and navigate WebView to the web auth-success page
        guard let components = URLComponents(url: url, resolvingAgainstBaseURL: false) else {
            print("📱 ERROR: Failed to parse URL components")
            return
        }

        // Build the web URL with the same query params
        var webComponents = URLComponents(string: "https://cardscope-web.vercel.app/auth-success")!
        webComponents.queryItems = components.queryItems

        guard let webUrl = webComponents.url else {
            print("📱 ERROR: Failed to build web URL")
            return
        }

        print("📱 navigateToAuthSuccess called (attempt \(retryCount + 1))")
        print("📱 Target URL: \(webUrl.absoluteString)")
        print("📱 self.window: \(String(describing: self.window))")
        print("📱 rootViewController type: \(type(of: self.window?.rootViewController ?? UIViewController()))")

        // Try to get WebView and navigate
        if let rootViewController = self.window?.rootViewController as? CAPBridgeViewController {
            print("📱 Found CAPBridgeViewController")
            if let bridge = rootViewController.bridge {
                print("📱 Found bridge")
                if let webView = bridge.webView {
                    print("📱 Found webView, current URL: \(webView.url?.absoluteString ?? "nil")")
                    print("📱 Loading auth-success URL...")
                    webView.load(URLRequest(url: webUrl))
                    print("📱 ✅ URL load initiated successfully")
                    // Clear UserDefaults since we successfully navigated
                    UserDefaults.standard.removeObject(forKey: "pendingDeepLink")
                    return
                } else {
                    print("📱 ERROR: webView is nil")
                }
            } else {
                print("📱 ERROR: bridge is nil")
            }
        } else {
            print("📱 ERROR: rootViewController is not CAPBridgeViewController")
            if let vc = self.window?.rootViewController {
                print("📱 Actual rootViewController type: \(type(of: vc))")
            }
        }

        // Retry with exponential backoff (up to 5 attempts)
        if retryCount < 5 {
            let delay = Double(retryCount + 1) * 0.5 // 0.5, 1.0, 1.5, 2.0, 2.5 seconds
            print("📱 Will retry navigation in \(delay) seconds...")
            DispatchQueue.main.asyncAfter(deadline: .now() + delay) {
                self.navigateToAuthSuccess(url: url, retryCount: retryCount + 1)
            }
        } else {
            print("📱 ❌ Failed to navigate after \(retryCount + 1) attempts")
        }
    }

    private func injectDeepLinkJS(url: URL) {
        // Use self.window instead of deprecated keyWindow
        if let rootViewController = self.window?.rootViewController as? CAPBridgeViewController,
           let bridge = rootViewController.bridge {
            let escapedUrl = url.absoluteString.replacingOccurrences(of: "'", with: "\\'")
            let js = """
            (function() {
                console.log('📱 Native: Injecting deep link event');
                window.dispatchEvent(new CustomEvent('deepLink', { detail: '\(escapedUrl)' }));
                // Also store in localStorage as backup
                try {
                    localStorage.setItem('pendingDeepLink', '\(escapedUrl)');
                } catch(e) {}
            })();
            """
            bridge.webView?.evaluateJavaScript(js, completionHandler: nil)
            print("📱 Injected JavaScript to notify WebView about deep link")
        }
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}
