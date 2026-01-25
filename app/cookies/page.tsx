"use client";

import Link from "next/link";
import { PublicNav } from "@/components/navigation/public-nav";
import { ArrowLeft, Cookie, Calendar, Mail, Settings, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CookiePolicyPage() {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-slate-950">
      <PublicNav />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-6 text-slate-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Cookie className="h-8 w-8 text-indigo-400" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">Cookie Policy</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Last Updated: {currentDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <a href="mailto:support@pay2start.com" className="hover:text-indigo-400 transition-colors">
                support@pay2start.com
              </a>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-slate-800 rounded-2xl p-8 md:p-12 border border-slate-700 shadow-xl">
          <div className="prose prose-invert max-w-none space-y-8 text-slate-300">
            
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
              <p className="leading-relaxed">
                This Cookie Policy explains how Pay2Start ("we", "us", "our", or "Service") uses cookies and similar tracking technologies when you visit our website and use our Service. This policy should be read in conjunction with our <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300 underline">Privacy Policy</Link> and <Link href="/terms" className="text-indigo-400 hover:text-indigo-300 underline">Terms of Service</Link>.
              </p>
              <p className="leading-relaxed mt-4">
                By using our Service, you consent to the use of cookies in accordance with this Cookie Policy. If you do not agree to our use of cookies, you should disable cookies in your browser settings or refrain from using our Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. What Are Cookies?</h2>
              <p className="leading-relaxed">
                Cookies are small text files that are placed on your device (computer, tablet, or mobile phone) when you visit a website. Cookies are widely used to make websites work more efficiently and provide information to website owners.
              </p>
              <p className="leading-relaxed mt-4">
                Cookies allow a website to recognize your device and store some information about your preferences or past actions. This enables websites to remember your settings, improve your user experience, and provide personalized content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Types of Cookies We Use</h2>
              
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.1 Essential Cookies</h3>
              <p className="leading-relaxed">
                These cookies are necessary for the Service to function properly. They enable core functionality such as security, network management, and accessibility. Without these cookies, services you have requested cannot be provided.
              </p>
              <div className="mt-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <p className="text-white font-semibold mb-2">Examples:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Authentication cookies to keep you logged in</li>
                  <li>Session cookies to maintain your session state</li>
                  <li>Security cookies to protect against fraud</li>
                  <li>Load balancing cookies to distribute traffic</li>
                </ul>
              </div>
              <p className="leading-relaxed mt-4">
                <strong className="text-white">Legal Basis:</strong> These cookies are essential for the performance of our contract with you (providing the Service).
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.2 Functional Cookies</h3>
              <p className="leading-relaxed">
                These cookies allow the Service to remember choices you make (such as your language preference or region) and provide enhanced, personalized features. They may also be used to provide services you have requested.
              </p>
              <div className="mt-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <p className="text-white font-semibold mb-2">Examples:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Language and region preferences</li>
                  <li>Theme and display settings</li>
                  <li>User interface customizations</li>
                  <li>Remembering your login credentials (with your consent)</li>
                </ul>
              </div>
              <p className="leading-relaxed mt-4">
                <strong className="text-white">Legal Basis:</strong> These cookies are based on your consent or our legitimate interest in providing a personalized user experience.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.3 Analytics Cookies</h3>
              <p className="leading-relaxed">
                These cookies help us understand how visitors interact with our Service by collecting and reporting information anonymously. This helps us improve the Service and user experience.
              </p>
              <div className="mt-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <p className="text-white font-semibold mb-2">Examples:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Page views and navigation patterns</li>
                  <li>Time spent on pages</li>
                  <li>Error messages and performance issues</li>
                  <li>Feature usage statistics</li>
                </ul>
              </div>
              <p className="leading-relaxed mt-4">
                <strong className="text-white">Legal Basis:</strong> These cookies are based on your consent or our legitimate interest in analyzing and improving our Service.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.4 Performance Cookies</h3>
              <p className="leading-relaxed">
                These cookies collect information about how you use our Service, such as which pages you visit most often. This data helps us optimize our Service's performance.
              </p>
              <div className="mt-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <p className="text-white font-semibold mb-2">Examples:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Load time measurements</li>
                  <li>Resource usage tracking</li>
                  <li>Performance bottlenecks identification</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.5 Marketing Cookies</h3>
              <p className="leading-relaxed">
                These cookies are used to track visitors across websites to display relevant advertisements. They may also be used to limit the number of times you see an advertisement and measure the effectiveness of advertising campaigns.
              </p>
              <div className="mt-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <p className="text-white font-semibold mb-2">Examples:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Ad targeting and personalization</li>
                  <li>Conversion tracking</li>
                  <li>Retargeting campaigns</li>
                </ul>
              </div>
              <p className="leading-relaxed mt-4">
                <strong className="text-white">Legal Basis:</strong> These cookies require your explicit consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. First-Party vs. Third-Party Cookies</h2>
              
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.1 First-Party Cookies</h3>
              <p className="leading-relaxed">
                First-party cookies are set directly by Pay2Start when you visit our Service. These cookies are used to provide core functionality and improve your experience on our platform.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.2 Third-Party Cookies</h3>
              <p className="leading-relaxed">
                Third-party cookies are set by domains other than Pay2Start. We use third-party services that may set cookies, including:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li><strong className="text-white">Stripe:</strong> Payment processing and fraud prevention</li>
                <li><strong className="text-white">Analytics Providers:</strong> Service usage analytics and performance monitoring</li>
                <li><strong className="text-white">Authentication Services:</strong> Secure login and session management</li>
                <li><strong className="text-white">Content Delivery Networks:</strong> Fast content delivery and caching</li>
              </ul>
              <p className="leading-relaxed mt-4">
                These third parties have their own privacy policies and cookie practices. We encourage you to review their policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Cookie Duration</h2>
              
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.1 Session Cookies</h3>
              <p className="leading-relaxed">
                Session cookies are temporary cookies that are deleted when you close your browser. They are used to maintain your session while you navigate our Service.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.2 Persistent Cookies</h3>
              <p className="leading-relaxed">
                Persistent cookies remain on your device for a set period or until you delete them. They are used to remember your preferences and improve your experience across multiple visits.
              </p>
              <div className="mt-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <p className="text-white font-semibold mb-2">Typical Duration:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Authentication cookies: 30 days to 1 year</li>
                  <li>Preference cookies: 1 year</li>
                  <li>Analytics cookies: 2 years</li>
                  <li>Marketing cookies: 90 days to 2 years</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Managing Cookies</h2>
              <p className="leading-relaxed">
                You have the right to accept or reject cookies. Most web browsers automatically accept cookies, but you can modify your browser settings to decline cookies if you prefer.
              </p>
              
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.1 Browser Settings</h3>
              <p className="leading-relaxed">
                You can control cookies through your browser settings. Here are links to instructions for popular browsers:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline">Google Chrome</a></li>
                <li><a href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline">Mozilla Firefox</a></li>
                <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline">Safari</a></li>
                <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline">Microsoft Edge</a></li>
                <li><a href="https://help.opera.com/en/latest/web-preferences/#cookies" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline">Opera</a></li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.2 Cookie Consent</h3>
              <p className="leading-relaxed">
                When you first visit our Service, you may see a cookie consent banner. You can accept or reject non-essential cookies through this banner. You can also change your preferences at any time through your account settings or by contacting us.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.3 Impact of Disabling Cookies</h3>
              <p className="leading-relaxed">
                Please note that disabling certain cookies may impact your experience on our Service:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Essential cookies are required for the Service to function - disabling them may prevent you from using certain features</li>
                <li>Disabling functional cookies may limit personalized features</li>
                <li>Disabling analytics cookies won't affect functionality but may limit our ability to improve the Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Do Not Track Signals</h2>
              <p className="leading-relaxed">
                Some browsers include a "Do Not Track" (DNT) feature that signals to websites you visit that you do not want to have your online activity tracked. Currently, there is no standard for how DNT signals should be interpreted.
              </p>
              <p className="leading-relaxed mt-4">
                We do not currently respond to DNT browser signals or mechanisms. However, you can control tracking through your browser settings and our cookie preferences.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Other Tracking Technologies</h2>
              <p className="leading-relaxed">
                In addition to cookies, we may use other tracking technologies, including:
              </p>
              
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">8.1 Web Beacons</h3>
              <p className="leading-relaxed">
                Small graphic images (also known as "pixel tags" or "clear GIFs") that may be included in our emails and web pages to track engagement.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">8.2 Local Storage</h3>
              <p className="leading-relaxed">
                HTML5 local storage that allows us to store information locally on your device to improve performance and functionality.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">8.3 Session Storage</h3>
              <p className="leading-relaxed">
                Temporary storage that exists only for the duration of your browser session.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Updates to This Cookie Policy</h2>
              <p className="leading-relaxed">
                We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Posting the updated Cookie Policy on this page</li>
                <li>Updating the "Last Updated" date at the top of this page</li>
                <li>Sending an email notification to your registered email address</li>
                <li>Displaying a notice within the Service</li>
              </ul>
              <p className="leading-relaxed mt-4">
                Your continued use of the Service after any changes constitutes acceptance of the updated Cookie Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Contact Us</h2>
              <p className="leading-relaxed">
                If you have any questions about this Cookie Policy or our use of cookies, please contact us:
              </p>
              <div className="mt-4 p-6 bg-slate-700/50 rounded-lg border border-slate-600">
                <p className="text-white font-semibold mb-2">Pay2Start Support</p>
                <p className="text-slate-300">
                  Email: <a href="mailto:support@pay2start.com" className="text-indigo-400 hover:text-indigo-300 underline">support@pay2start.com</a>
                </p>
                <p className="text-slate-300 mt-2">
                  Website: <Link href="/" className="text-indigo-400 hover:text-indigo-300 underline">www.pay2start.com</Link>
                </p>
              </div>
            </section>

          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>You control your cookie preferences</span>
          </div>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-indigo-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-indigo-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/" className="hover:text-indigo-400 transition-colors">
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
