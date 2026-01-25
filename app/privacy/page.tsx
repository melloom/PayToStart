"use client";

import Link from "next/link";
import { PublicNav } from "@/components/navigation/public-nav";
import { ArrowLeft, Shield, Calendar, Mail, Lock, Eye, Database, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicyPage() {
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
            <Shield className="h-8 w-8 text-indigo-400" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">Privacy Policy</h1>
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
                Pay2Start ("we", "us", "our", or "Service") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our contract management platform and related services.
              </p>
              <p className="leading-relaxed mt-4">
                By using Pay2Start, you agree to the collection and use of information in accordance with this Privacy Policy. If you do not agree with our policies and practices, please do not use our Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.1 Information You Provide</h3>
              <p className="leading-relaxed">We collect information that you provide directly to us, including:</p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li><strong className="text-white">Account Information:</strong> Name, email address, password, company name, phone number</li>
                <li><strong className="text-white">Contract Data:</strong> Contracts you create, edit, or sign through the Service</li>
                <li><strong className="text-white">Client Information:</strong> Names, email addresses, and contact information of your clients</li>
                <li><strong className="text-white">Payment Information:</strong> Billing address, payment method details (processed securely through Stripe)</li>
                <li><strong className="text-white">Communication Data:</strong> Messages, support requests, and feedback you send to us</li>
                <li><strong className="text-white">Profile Information:</strong> Profile picture, preferences, and settings</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.2 Automatically Collected Information</h3>
              <p className="leading-relaxed">When you use our Service, we automatically collect certain information, including:</p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li><strong className="text-white">Usage Data:</strong> Pages visited, features used, time spent on the Service</li>
                <li><strong className="text-white">Device Information:</strong> Device type, operating system, browser type and version</li>
                <li><strong className="text-white">IP Address:</strong> Your Internet Protocol address</li>
                <li><strong className="text-white">Log Data:</strong> Access times, dates, and referring website addresses</li>
                <li><strong className="text-white">Cookies and Tracking Technologies:</strong> See our <Link href="/cookies" className="text-indigo-400 hover:text-indigo-300 underline">Cookie Policy</Link> for details</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.3 Third-Party Information</h3>
              <p className="leading-relaxed">We may receive information about you from third-party services, including:</p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li><strong className="text-white">Stripe:</strong> Payment processing information and transaction data</li>
                <li><strong className="text-white">Authentication Providers:</strong> If you sign in using third-party authentication</li>
                <li><strong className="text-white">Analytics Services:</strong> Usage and performance data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
              <p className="leading-relaxed">We use the information we collect for the following purposes:</p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li><strong className="text-white">Service Provision:</strong> To provide, maintain, and improve our Service</li>
                <li><strong className="text-white">Account Management:</strong> To create and manage your account, process transactions, and send related communications</li>
                <li><strong className="text-white">Contract Processing:</strong> To facilitate contract creation, signing, and management</li>
                <li><strong className="text-white">Payment Processing:</strong> To process payments, manage subscriptions, and handle billing</li>
                <li><strong className="text-white">Communication:</strong> To send you service-related notifications, updates, and support responses</li>
                <li><strong className="text-white">Security:</strong> To detect, prevent, and address security issues and fraudulent activity</li>
                <li><strong className="text-white">Analytics:</strong> To analyze usage patterns and improve our Service</li>
                <li><strong className="text-white">Legal Compliance:</strong> To comply with legal obligations and enforce our Terms of Service</li>
                <li><strong className="text-white">Marketing:</strong> To send you promotional communications (with your consent, where required)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. How We Share Your Information</h2>
              <p className="leading-relaxed">We do not sell your personal information. We may share your information in the following circumstances:</p>
              
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.1 Service Providers</h3>
              <p className="leading-relaxed">We share information with trusted third-party service providers who assist us in operating our Service, including:</p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li><strong className="text-white">Stripe:</strong> For payment processing and subscription management</li>
                <li><strong className="text-white">Supabase:</strong> For database and authentication services</li>
                <li><strong className="text-white">Email Service Providers:</strong> For sending transactional and marketing emails</li>
                <li><strong className="text-white">Cloud Hosting Providers:</strong> For data storage and infrastructure</li>
                <li><strong className="text-white">Analytics Providers:</strong> For usage analytics and performance monitoring</li>
              </ul>
              <p className="leading-relaxed mt-4">
                These service providers are contractually obligated to protect your information and use it only for the purposes we specify.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.2 Legal Requirements</h3>
              <p className="leading-relaxed">We may disclose your information if required by law or in response to:</p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Valid legal requests, subpoenas, or court orders</li>
                <li>Government investigations or regulatory inquiries</li>
                <li>Protection of our rights, property, or safety</li>
                <li>Protection of our users' rights, property, or safety</li>
                <li>Prevention of fraud or illegal activity</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.3 Business Transfers</h3>
              <p className="leading-relaxed">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity. We will notify you of any such change in ownership or control.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.4 With Your Consent</h3>
              <p className="leading-relaxed">
                We may share your information with third parties when you explicitly consent to such sharing.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Data Security</h2>
              <p className="leading-relaxed">
                We implement industry-standard security measures to protect your information, including:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li><strong className="text-white">Encryption:</strong> Data in transit is encrypted using TLS/SSL protocols</li>
                <li><strong className="text-white">Secure Storage:</strong> Data at rest is encrypted and stored in secure, access-controlled environments</li>
                <li><strong className="text-white">Access Controls:</strong> Limited access to personal information on a need-to-know basis</li>
                <li><strong className="text-white">Authentication:</strong> Secure authentication mechanisms and password hashing</li>
                <li><strong className="text-white">Regular Audits:</strong> Security assessments and vulnerability testing</li>
                <li><strong className="text-white">Monitoring:</strong> Continuous monitoring for security threats and breaches</li>
              </ul>
              <p className="leading-relaxed mt-4">
                However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Your Privacy Rights</h2>
              <p className="leading-relaxed">Depending on your location, you may have certain rights regarding your personal information:</p>
              
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.1 General Rights</h3>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li><strong className="text-white">Access:</strong> Request access to your personal information</li>
                <li><strong className="text-white">Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong className="text-white">Deletion:</strong> Request deletion of your personal information</li>
                <li><strong className="text-white">Portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong className="text-white">Opt-Out:</strong> Opt out of marketing communications</li>
                <li><strong className="text-white">Account Deletion:</strong> Delete your account and associated data</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.2 GDPR Rights (European Users)</h3>
              <p className="leading-relaxed">If you are located in the European Economic Area (EEA), you have additional rights under the General Data Protection Regulation (GDPR):</p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Right to access your personal data</li>
                <li>Right to rectification of inaccurate data</li>
                <li>Right to erasure ("right to be forgotten")</li>
                <li>Right to restrict processing</li>
                <li>Right to data portability</li>
                <li>Right to object to processing</li>
                <li>Right to withdraw consent</li>
                <li>Right to lodge a complaint with a supervisory authority</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.3 CCPA Rights (California Users)</h3>
              <p className="leading-relaxed">If you are a California resident, you have rights under the California Consumer Privacy Act (CCPA):</p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Right to know what personal information is collected</li>
                <li>Right to know if personal information is sold or disclosed</li>
                <li>Right to opt-out of the sale of personal information</li>
                <li>Right to non-discrimination for exercising your privacy rights</li>
                <li>Right to deletion of personal information</li>
              </ul>

              <p className="leading-relaxed mt-4">
                To exercise any of these rights, please contact us at <a href="mailto:support@pay2start.com" className="text-indigo-400 hover:text-indigo-300 underline">support@pay2start.com</a>. We will respond to your request within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Data Retention</h2>
              <p className="leading-relaxed">
                We retain your personal information for as long as necessary to:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Provide our Service to you</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes and enforce our agreements</li>
                <li>Maintain security and prevent fraud</li>
              </ul>
              <p className="leading-relaxed mt-4">
                When you delete your account, we will delete or anonymize your personal information within 30 days, except where we are required to retain it for legal or regulatory purposes.
              </p>
              <p className="leading-relaxed mt-4">
                Contract data may be retained longer if required for legal or business purposes, such as maintaining audit trails for signed contracts.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. International Data Transfers</h2>
              <p className="leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country.
              </p>
              <p className="leading-relaxed mt-4">
                We take appropriate safeguards to ensure that your information receives an adequate level of protection, including:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Using standard contractual clauses approved by relevant authorities</li>
                <li>Ensuring our service providers comply with applicable data protection laws</li>
                <li>Implementing appropriate technical and organizational security measures</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Children's Privacy</h2>
              <p className="leading-relaxed">
                Our Service is not intended for children under the age of 18. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
              </p>
              <p className="leading-relaxed mt-4">
                If we become aware that we have collected personal information from a child under 18, we will take steps to delete such information promptly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Cookies and Tracking Technologies</h2>
              <p className="leading-relaxed">
                We use cookies and similar tracking technologies to track activity on our Service and store certain information. For detailed information about the cookies we use and how to manage them, please see our <Link href="/cookies" className="text-indigo-400 hover:text-indigo-300 underline">Cookie Policy</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Third-Party Links</h2>
              <p className="leading-relaxed">
                Our Service may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to read the privacy policies of any third-party websites or services you visit.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Changes to This Privacy Policy</h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Posting the updated Privacy Policy on this page</li>
                <li>Updating the "Last Updated" date at the top of this page</li>
                <li>Sending an email notification to your registered email address</li>
                <li>Displaying a notice within the Service</li>
              </ul>
              <p className="leading-relaxed mt-4">
                Your continued use of the Service after any changes constitutes acceptance of the updated Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">13. Contact Us</h2>
              <p className="leading-relaxed">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="mt-4 p-6 bg-slate-700/50 rounded-lg border border-slate-600">
                <p className="text-white font-semibold mb-2">Pay2Start Privacy Team</p>
                <p className="text-slate-300">
                  Email: <a href="mailto:support@pay2start.com" className="text-indigo-400 hover:text-indigo-300 underline">support@pay2start.com</a>
                </p>
                <p className="text-slate-300 mt-2">
                  Website: <Link href="/" className="text-indigo-400 hover:text-indigo-300 underline">www.pay2start.com</Link>
                </p>
                <p className="text-slate-300 mt-2">
                  Data Protection Officer: <a href="mailto:privacy@pay2start.com" className="text-indigo-400 hover:text-indigo-300 underline">privacy@pay2start.com</a>
                </p>
              </div>
            </section>

          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span>Your privacy is important to us</span>
          </div>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-indigo-400 transition-colors">
              Terms of Service
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
