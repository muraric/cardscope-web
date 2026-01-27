import UIKit
import Capacitor
import SafariServices

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
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

        // Check for pending deep link and process it
        if let pendingDeepLink = UserDefaults.standard.string(forKey: "pendingDeepLink"),
           let url = URL(string: pendingDeepLink) {
            print("📱 Processing pending deep link on app active: \(pendingDeepLink)")

            // Clear it immediately to prevent duplicate processing
            UserDefaults.standard.removeObject(forKey: "pendingDeepLink")

            // Wait for WebView to be ready, then navigate
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                self.navigateToAuthSuccess(url: url)
            }

            // Also try injecting JS as backup
            DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
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

        // Handle custom deep link schemes
        if url.scheme == "cardscope" {
            print("📱 Received deep link: \(url.absoluteString)")

            // Store the deep link URL in UserDefaults to be processed when WebView is ready
            UserDefaults.standard.set(url.absoluteString, forKey: "pendingDeepLink")

            // Navigate the WebView directly to the auth-success page with the query params
            // This is more reliable than injecting JS because Safari localStorage != WebView localStorage
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                self.navigateToAuthSuccess(url: url)
            }

            // Also inject JavaScript as backup
            let delays: [Double] = [1.0, 2.0, 3.0]
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

    private func navigateToAuthSuccess(url: URL) {
        // Extract query params from cardscope:// URL and navigate WebView to the web auth-success page
        guard let components = URLComponents(url: url, resolvingAgainstBaseURL: false) else { return }

        // Build the web URL with the same query params
        var webComponents = URLComponents(string: "https://cardscope-web.vercel.app/auth-success")!
        webComponents.queryItems = components.queryItems

        guard let webUrl = webComponents.url else { return }

        print("📱 Navigating WebView to: \(webUrl.absoluteString)")

        // Use self.window instead of deprecated keyWindow
        if let rootViewController = self.window?.rootViewController as? CAPBridgeViewController,
           let bridge = rootViewController.bridge {
            bridge.webView?.load(URLRequest(url: webUrl))
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
