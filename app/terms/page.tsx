"use client";

import Link from "next/link";
import { PublicNav } from "@/components/navigation/public-nav";
import { ArrowLeft, FileText, Calendar, Mail, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsOfServicePage() {
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
            <FileText className="h-8 w-8 text-indigo-400" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">Terms of Service</h1>
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
              <h2 className="text-2xl font-bold text-white mb-4">1. Agreement to Terms</h2>
              <p className="leading-relaxed">
                By accessing or using Pay2Start ("Service", "Platform", "we", "us", or "our"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
              </p>
              <p className="leading-relaxed mt-4">
                These Terms apply to all users of the Service, including without limitation users who are browsers, vendors, customers, merchants, and/or contributors of content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
              <p className="leading-relaxed">
                Pay2Start is a contract management platform that enables users to create, send, sign, and manage contracts digitally. The Service includes:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Digital contract creation and editing tools</li>
                <li>Electronic signature collection and management</li>
                <li>Payment processing integration through Stripe</li>
                <li>Client and contract management features</li>
                <li>Document storage and organization</li>
                <li>Template library and customization options</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts and Registration</h2>
              <p className="leading-relaxed">
                To access certain features of the Service, you must register for an account. You agree to:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Be at least 18 years old or have parental consent to use the Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Acceptable Use</h2>
              <p className="leading-relaxed mb-4">
                You agree not to use the Service to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Violate any applicable laws, regulations, or third-party rights</li>
                <li>Transmit any malicious code, viruses, or harmful software</li>
                <li>Attempt to gain unauthorized access to the Service or related systems</li>
                <li>Interfere with or disrupt the integrity or performance of the Service</li>
                <li>Use the Service for any illegal or fraudulent purpose</li>
                <li>Impersonate any person or entity or misrepresent your affiliation</li>
                <li>Collect or harvest information about other users without their consent</li>
                <li>Use automated systems to access the Service without authorization</li>
                <li>Create contracts that violate applicable laws or regulations</li>
                <li>Use the Service to send spam or unsolicited communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Subscription Plans and Payment</h2>
              <p className="leading-relaxed">
                Pay2Start offers various subscription plans with different features and usage limits. By subscribing to a paid plan, you agree to:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Pay all fees associated with your selected plan</li>
                <li>Understand that fees are billed in advance on a recurring basis</li>
                <li>Accept that subscription fees are non-refundable except as required by law</li>
                <li>Authorize us to charge your payment method for all fees</li>
                <li>Provide accurate payment information and keep it updated</li>
              </ul>
              <p className="leading-relaxed mt-4">
                <strong className="text-white">Payment Processing:</strong> Payments are processed through Stripe, a third-party payment processor. By using our payment features, you agree to Stripe's Terms of Service and Privacy Policy. We do not store your complete payment card information.
              </p>
              <p className="leading-relaxed mt-4">
                <strong className="text-white">Free Trial:</strong> We may offer a free trial period. If you cancel before the trial ends, you will not be charged. After the trial period, your subscription will automatically convert to a paid plan unless cancelled.
              </p>
              <p className="leading-relaxed mt-4">
                <strong className="text-white">Cancellation:</strong> You may cancel your subscription at any time. Cancellation will take effect at the end of your current billing period. You will continue to have access to the Service until the end of your paid period.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Digital Signatures</h2>
              <p className="leading-relaxed">
                Pay2Start provides electronic signature functionality. By using our digital signature features, you acknowledge that:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Electronic signatures are legally binding in many jurisdictions</li>
                <li>You are responsible for ensuring that electronic signatures are legally valid in your jurisdiction</li>
                <li>We provide the technology but do not provide legal advice</li>
                <li>You should consult with legal counsel regarding the enforceability of electronic signatures for your specific use case</li>
                <li>We maintain audit trails of signature events for your records</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Intellectual Property</h2>
              <p className="leading-relaxed">
                <strong className="text-white">Our Content:</strong> The Service, including its original content, features, and functionality, is owned by Pay2Start and is protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <p className="leading-relaxed mt-4">
                <strong className="text-white">Your Content:</strong> You retain ownership of all contracts, documents, and content you create or upload to the Service ("User Content"). By using the Service, you grant us a limited, non-exclusive, worldwide, royalty-free license to use, store, and process your User Content solely for the purpose of providing the Service to you.
              </p>
              <p className="leading-relaxed mt-4">
                <strong className="text-white">Templates:</strong> We provide contract templates for your convenience. These templates are provided "as is" and do not constitute legal advice. You are responsible for ensuring that any template you use is appropriate for your needs and complies with applicable laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Data and Privacy</h2>
              <p className="leading-relaxed">
                Your use of the Service is also governed by our Privacy Policy. We take data security seriously and implement industry-standard security measures. However, you acknowledge that:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>No method of transmission over the Internet is 100% secure</li>
                <li>We cannot guarantee absolute security of your data</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You should not share sensitive information through unsecured channels</li>
              </ul>
              <p className="leading-relaxed mt-4">
                For more information about how we collect, use, and protect your data, please review our <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300 underline">Privacy Policy</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Third-Party Services</h2>
              <p className="leading-relaxed">
                The Service integrates with third-party services, including but not limited to:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li><strong className="text-white">Stripe:</strong> For payment processing. Your use of Stripe is subject to Stripe's Terms of Service.</li>
                <li><strong className="text-white">Supabase:</strong> For database and authentication services.</li>
                <li><strong className="text-white">Email Services:</strong> For sending contract notifications and communications.</li>
              </ul>
              <p className="leading-relaxed mt-4">
                We are not responsible for the availability, accuracy, or practices of third-party services. Your interactions with third-party services are solely between you and the third party.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Disclaimers and Limitations of Liability</h2>
              <p className="leading-relaxed">
                <strong className="text-white">Service Provided "As Is":</strong> The Service is provided on an "as is" and "as available" basis. We make no warranties, expressed or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.
              </p>
              <p className="leading-relaxed mt-4">
                <strong className="text-white">No Legal Advice:</strong> Pay2Start is a technology platform. We do not provide legal, financial, or professional advice. You are solely responsible for:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>The content and terms of your contracts</li>
                <li>Ensuring your contracts comply with applicable laws</li>
                <li>Obtaining appropriate legal counsel when needed</li>
                <li>The enforceability and validity of your contracts</li>
              </ul>
              <p className="leading-relaxed mt-4">
                <strong className="text-white">Limitation of Liability:</strong> To the maximum extent permitted by law, Pay2Start shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Indemnification</h2>
              <p className="leading-relaxed">
                You agree to indemnify, defend, and hold harmless Pay2Start, its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorneys' fees, arising out of or in any way connected with:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Your use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party rights</li>
                <li>Your contracts or the content you create using the Service</li>
                <li>Any disputes between you and your clients</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Termination</h2>
              <p className="leading-relaxed">
                We may terminate or suspend your account and access to the Service immediately, without prior notice, for any reason, including if you breach these Terms. Upon termination:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Your right to use the Service will immediately cease</li>
                <li>You may request export of your data within 30 days of termination</li>
                <li>We may delete your account and data after the export period</li>
                <li>All provisions of these Terms that by their nature should survive termination shall survive</li>
              </ul>
              <p className="leading-relaxed mt-4">
                You may terminate your account at any time by contacting us at <a href="mailto:support@pay2start.com" className="text-indigo-400 hover:text-indigo-300 underline">support@pay2start.com</a> or through your account settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">13. Changes to Terms</h2>
              <p className="leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify you of any material changes by:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Posting the updated Terms on this page</li>
                <li>Updating the "Last Updated" date at the top of this page</li>
                <li>Sending an email notification to your registered email address</li>
                <li>Displaying a notice within the Service</li>
              </ul>
              <p className="leading-relaxed mt-4">
                Your continued use of the Service after any changes constitutes acceptance of the new Terms. If you do not agree to the modified Terms, you must stop using the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">14. Governing Law and Dispute Resolution</h2>
              <p className="leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions. Any disputes arising out of or relating to these Terms or the Service shall be resolved through:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Good faith negotiation between the parties</li>
                <li>If negotiation fails, binding arbitration in accordance with applicable arbitration rules</li>
                <li>If arbitration is not available, exclusive jurisdiction in the courts of the United States</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">15. General Provisions</h2>
              <p className="leading-relaxed">
                <strong className="text-white">Entire Agreement:</strong> These Terms, together with our Privacy Policy, constitute the entire agreement between you and Pay2Start regarding the Service.
              </p>
              <p className="leading-relaxed mt-4">
                <strong className="text-white">Severability:</strong> If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full effect.
              </p>
              <p className="leading-relaxed mt-4">
                <strong className="text-white">Waiver:</strong> Our failure to enforce any right or provision of these Terms will not be considered a waiver of such right or provision.
              </p>
              <p className="leading-relaxed mt-4">
                <strong className="text-white">Assignment:</strong> You may not assign or transfer these Terms or your account without our prior written consent. We may assign these Terms without restriction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">16. Contact Information</h2>
              <p className="leading-relaxed">
                If you have any questions about these Terms of Service, please contact us:
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
            <Shield className="h-4 w-4" />
            <span>Your data is protected and secure</span>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-indigo-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/cookies" className="hover:text-indigo-400 transition-colors">
              Cookie Policy
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
