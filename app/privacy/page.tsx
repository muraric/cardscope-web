"use client";

import Layout from "../../components/Layout";

export default function PrivacyPolicy() {
    return (
        <Layout>
            <div className="max-w-lg mx-auto w-full px-4 space-y-6 py-6">
                <div className="bg-white shadow rounded-lg p-4 sm:p-6 space-y-4">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                        Privacy Policy – Shomuran Services LLC
                    </h1>
                    
                    <p className="text-sm text-gray-600">
                        <strong>Effective Date:</strong> December 2025
                    </p>

                    <div className="space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed">
                        <p>
                            At Shomuran Services LLC ("we," "our," or "us"), we build applications designed to help users make smarter decisions in finance, productivity, and lifestyle. This Privacy Policy explains how we handle information across all our apps, including CardCompass and other apps we publish.
                        </p>

                        <section className="space-y-2">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mt-6 mb-2">
                                1. Information We Do Not Collect
                            </h2>
                            <p>
                                We do not collect, store, or share personal, financial, or sensitive information unless explicitly stated in a specific app's section below.
                            </p>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mt-6 mb-2">
                                2. Optional Permissions
                            </h2>
                            <p>
                                Some apps may request limited permissions such as location (to detect nearby stores) or storage (to save preferences). These permissions are used locally on your device and never sent to our servers.
                            </p>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mt-6 mb-2">
                                3. App-Specific Details
                            </h2>
                            
                            <div className="ml-4 space-y-3">
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-1">CardCompass</h3>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>Works entirely offline and does not connect to any bank or payment system.</li>
                                        <li>Optional location access helps detect nearby merchants to suggest the best reward card.</li>
                                        <li>No personal or financial data is collected or transmitted.</li>
                                    </ul>
                                </div>
                                
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-1">Other Shomuran Apps</h3>
                                    <p>
                                        Each app will display its privacy details on the in-app settings page or at its listing on Google Play.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mt-6 mb-2">
                                4. Data Security
                            </h2>
                            <p>
                                All app data is stored locally on the user's device. We do not sell, trade, or share data with third parties.
                            </p>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mt-6 mb-2">
                                5. Children's Privacy
                            </h2>
                            <p>
                                Our apps are not directed toward children under 13. We do not knowingly collect information from minors.
                            </p>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mt-6 mb-2">
                                6. Updates to This Policy
                            </h2>
                            <p>
                                We may update this policy from time to time. Any changes will be reflected on this page with a new effective date.
                            </p>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mt-6 mb-2">
                                7. Contact Us
                            </h2>
                            <p>
                                If you have any questions about this Privacy Policy or our apps, please contact us:
                            </p>
                            <div className="ml-4 space-y-1">
                                <p>
                                    <strong>Email:</strong>{" "}
                                    <a 
                                        href="mailto:shomuran.developer@gmail.com" 
                                        className="text-blue-600 hover:underline"
                                    >
                                        shomuran.developer@gmail.com
                                    </a>
                                </p>
                                <p>
                                    <strong>Business:</strong> Shomuran Services LLC
                                </p>
                                <p>
                                    <strong>Website:</strong>{" "}
                                    <a 
                                        href="https://shomuran.com" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        https://shomuran.com
                                    </a>
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </Layout>
    );
}




