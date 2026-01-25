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
              <h2 className="text-2xl font-bold text-white mb-4">5. Subscription Plans, Payment Terms, and Purchase Agreements</h2>
              
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.1 Subscription Plans and Fees</h3>
              <p className="leading-relaxed">
                Pay2Start offers various subscription plans with different features and usage limits. By subscribing to a paid plan, you agree to:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Pay all fees associated with your selected plan, including subscription fees, transaction fees, and any additional fees</li>
                <li>Understand that fees are billed in advance on a recurring basis (monthly or annually, as applicable)</li>
                <li>Accept that subscription fees are NON-REFUNDABLE except as required by applicable law or as expressly stated in these Terms</li>
                <li>Authorize us to charge your payment method for all fees, including automatic renewal charges</li>
                <li>Provide accurate payment information and keep it updated at all times</li>
                <li>Understand that failure to pay fees may result in suspension or termination of your account</li>
                <li>Accept that we may change our pricing at any time, with notice to you</li>
                <li>Understand that price changes will apply to your next billing cycle</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.2 Payment Processing and Third-Party Payment Services</h3>
              <p className="leading-relaxed">
                <strong className="text-white">Payment Processing:</strong> Payments for subscription fees are processed through Stripe, a third-party payment processor. By using our payment features, you agree to Stripe's Terms of Service and Privacy Policy. We do not store your complete payment card information.
              </p>
              <p className="leading-relaxed mt-4">
                <strong className="text-white">Transaction Payments:</strong> If you use the Service to collect payments from clients or customers through purchase agreements or contracts:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>All payment processing for transactions is handled by Stripe or other third-party payment processors</li>
                <li>We are NOT a party to any payment transaction between you and your clients or customers</li>
                <li>We have NO liability for payment disputes, chargebacks, refunds, or payment processing issues</li>
                <li>All payment disputes are solely between you and your clients, customers, or the payment processor</li>
                <li>We do not guarantee that payments will be processed successfully or on time</li>
                <li>We are not responsible for payment delays, payment failures, or payment processing errors</li>
                <li>You are solely responsible for all payment terms, refund policies, and payment-related obligations in your contracts</li>
                <li>We are not an escrow agent, payment intermediary, or financial institution</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.3 Free Trial and Automatic Renewal</h3>
              <p className="leading-relaxed">
                <strong className="text-white">Free Trial:</strong> We may offer a free trial period. If you cancel before the trial ends, you will not be charged. After the trial period, your subscription will automatically convert to a paid plan unless cancelled. You acknowledge that:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Free trials are subject to availability and may be limited, modified, or discontinued at any time</li>
                <li>We may require a valid payment method to start a free trial</li>
                <li>If you do not cancel before the trial ends, you will be charged for the subscription</li>
                <li>You are responsible for canceling before the trial period ends if you do not wish to be charged</li>
              </ul>
              <p className="leading-relaxed mt-4">
                <strong className="text-white">Automatic Renewal:</strong> Unless you cancel, your subscription will automatically renew at the end of each billing period. You authorize us to charge your payment method for renewal fees. You may cancel your subscription at any time through your account settings or by contacting us.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.4 Cancellation and Refunds</h3>
              <p className="leading-relaxed">
                <strong className="text-white">Cancellation:</strong> You may cancel your subscription at any time. Cancellation will take effect at the end of your current billing period. You will continue to have access to the Service until the end of your paid period.
              </p>
              <p className="leading-relaxed mt-4">
                <strong className="text-white">No Refunds:</strong> Except as required by applicable law, all fees are NON-REFUNDABLE. This includes:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Subscription fees paid in advance</li>
                <li>Setup fees or one-time fees</li>
                <li>Transaction fees or processing fees</li>
                <li>Fees for unused portions of your subscription</li>
                <li>Fees paid during free trial periods that convert to paid subscriptions</li>
              </ul>
              <p className="leading-relaxed mt-4">
                <strong className="text-white">Pro-Rated Refunds:</strong> We do not provide pro-rated refunds for partial billing periods. If you cancel mid-cycle, you will continue to have access until the end of your paid period, but you will not receive a refund for the unused portion.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.5 Purchase Agreements and Transaction Fees</h3>
              <p className="leading-relaxed">
                If you use the Service to create purchase agreements or conduct transactions:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>You are solely responsible for all terms, conditions, and obligations in purchase agreements</li>
                <li>We are NOT a party to any purchase agreement or transaction</li>
                <li>We have NO liability for the performance, breach, or enforcement of purchase agreements</li>
                <li>Transaction fees may apply and are charged by payment processors, not by us</li>
                <li>We are not responsible for disputes, claims, or litigation arising from purchase agreements</li>
                <li>All purchase agreements are solely between you and your clients or customers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Contracts, Purchase Agreements, and User-Generated Content</h2>
              
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.1 No Legal Advice or Contract Review</h3>
              <p className="leading-relaxed">
                <strong className="text-white">CRITICAL DISCLAIMER:</strong> Pay2Start is a technology platform that provides tools for creating, managing, and signing contracts. We do NOT provide legal advice, contract review, contract drafting services, or any form of legal representation. We are NOT a law firm, legal service provider, or legal advisor.
              </p>
              <p className="leading-relaxed mt-4">
                You acknowledge and agree that:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>All contracts, purchase agreements, service agreements, and any other documents created using the Service are created entirely by you or your authorized representatives</li>
                <li>We have no involvement in, responsibility for, or liability regarding the content, terms, conditions, or legal validity of any contract or agreement you create</li>
                <li>We do not review, approve, validate, or verify the legal sufficiency, accuracy, or enforceability of any contract or agreement</li>
                <li>We do not provide any warranties or guarantees regarding the legal effectiveness of any contract or agreement</li>
                <li>You are solely and exclusively responsible for ensuring that all contracts comply with applicable federal, state, local, and international laws and regulations</li>
                <li>You must consult with qualified legal counsel before using any contract or agreement for important transactions</li>
                <li>We are not responsible for any disputes, claims, losses, or damages arising from contracts or agreements created using the Service</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.2 Purchase Agreements and Transaction Documents</h3>
              <p className="leading-relaxed">
                If you use the Service to create purchase agreements, sales contracts, service agreements, or any transaction documents:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>You are solely responsible for all terms, conditions, pricing, warranties, guarantees, and obligations contained in such agreements</li>
                <li>We are not a party to any purchase agreement, sales contract, or transaction created using the Service</li>
                <li>We have no liability for the performance, non-performance, breach, or enforcement of any purchase agreement or transaction</li>
                <li>We do not guarantee that any purchase agreement will be legally enforceable or valid in any jurisdiction</li>
                <li>You are responsible for ensuring compliance with all consumer protection laws, commercial laws, and regulations applicable to your transactions</li>
                <li>We are not responsible for payment disputes, delivery issues, quality disputes, or any other transaction-related disputes</li>
                <li>All disputes between you and your clients, customers, or contracting parties are solely between you and them</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.3 Contract Templates</h3>
              <p className="leading-relaxed">
                We may provide contract templates, form agreements, or sample documents for your convenience. You acknowledge that:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Templates are provided "AS IS" without any warranties, express or implied</li>
                <li>Templates may not be suitable for your specific needs, jurisdiction, or circumstances</li>
                <li>Templates do not constitute legal advice and may not comply with laws applicable to your situation</li>
                <li>You must have templates reviewed by qualified legal counsel before use</li>
                <li>We are not responsible for any losses, damages, or legal issues arising from use of templates</li>
                <li>Templates may be outdated, incomplete, or contain errors</li>
                <li>We reserve the right to modify, update, or remove templates at any time without notice</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.4 User Content and Contract Data</h3>
              <p className="leading-relaxed">
                You are solely responsible for all content, data, and information you create, upload, or store using the Service, including but not limited to:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Contract terms and conditions</li>
                <li>Pricing, payment terms, and financial information</li>
                <li>Client and customer information</li>
                <li>Personal data and sensitive information</li>
                <li>Business information and trade secrets</li>
                <li>Any other data or content you input into the Service</li>
              </ul>
              <p className="leading-relaxed mt-4">
                You represent and warrant that:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>You have the legal right to create, use, and store all content you create using the Service</li>
                <li>All content complies with applicable laws and regulations</li>
                <li>You have obtained all necessary consents, permissions, and authorizations</li>
                <li>Your content does not infringe upon any third-party rights, including intellectual property rights, privacy rights, or contractual rights</li>
                <li>Your content is accurate, complete, and not misleading</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.5 No Endorsement or Guarantee of Contracts</h3>
              <p className="leading-relaxed">
                By providing the Service, we do not:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Endorse, approve, or recommend any contract, purchase agreement, or transaction</li>
                <li>Guarantee the legal validity, enforceability, or effectiveness of any contract</li>
                <li>Warrant that contracts will achieve their intended purpose</li>
                <li>Assume any responsibility for the outcome of any contract or transaction</li>
                <li>Provide any assurance that contracts comply with applicable laws</li>
                <li>Act as an intermediary, escrow agent, or guarantor in any transaction</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Digital Signatures and Electronic Signatures</h2>
              <p className="leading-relaxed">
                Pay2Start provides electronic signature functionality. By using our digital signature features, you acknowledge and agree that:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Electronic signatures may be legally binding in many jurisdictions, but legal validity depends on applicable laws</li>
                <li>You are solely responsible for ensuring that electronic signatures are legally valid and enforceable in your jurisdiction and for your specific use case</li>
                <li>We provide the technology platform but do not provide legal advice regarding signature validity</li>
                <li>You must consult with qualified legal counsel to determine if electronic signatures are appropriate and legally valid for your contracts</li>
                <li>We maintain audit trails and records of signature events, but we do not guarantee the legal sufficiency of such records</li>
                <li>We are not responsible if electronic signatures are not recognized or enforced by courts or other authorities</li>
                <li>Some contracts, transactions, or documents may require handwritten signatures or notarization under applicable law</li>
                <li>You are responsible for determining whether electronic signatures are legally sufficient for your specific contracts</li>
                <li>We do not act as a certificate authority, trusted third party, or digital signature provider in the legal sense</li>
                <li>We are not responsible for disputes regarding signature authenticity, identity verification, or consent</li>
              </ul>
              <p className="leading-relaxed mt-4">
                <strong className="text-white">Signature Disputes:</strong> Any disputes regarding signatures, including disputes about whether a signature was authorized, authentic, or legally binding, are solely between you and the parties to the contract. We are not a party to such disputes and have no liability or responsibility regarding signature disputes.
              </p>
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
              <h2 className="text-2xl font-bold text-white mb-4">9. Third-Party Services and Integrations</h2>
              <p className="leading-relaxed">
                The Service integrates with third-party services, including but not limited to:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li><strong className="text-white">Stripe:</strong> For payment processing. Your use of Stripe is subject to Stripe's Terms of Service and Privacy Policy.</li>
                <li><strong className="text-white">Supabase:</strong> For database and authentication services.</li>
                <li><strong className="text-white">Email Services:</strong> For sending contract notifications and communications.</li>
                <li><strong className="text-white">Cloud Hosting Providers:</strong> For infrastructure and data storage.</li>
                <li><strong className="text-white">Analytics Services:</strong> For usage analytics and performance monitoring.</li>
              </ul>
              <p className="leading-relaxed mt-4">
                <strong className="text-white">No Responsibility for Third-Party Services:</strong> We are NOT responsible for:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>The availability, accuracy, reliability, or performance of third-party services</li>
                <li>The practices, policies, or terms of third-party services</li>
                <li>Any failures, errors, or issues with third-party services</li>
                <li>Any data loss, security breaches, or privacy violations by third-party services</li>
                <li>Any changes, modifications, or discontinuation of third-party services</li>
                <li>Any costs, fees, or charges imposed by third-party services</li>
                <li>Any disputes between you and third-party service providers</li>
              </ul>
              <p className="leading-relaxed mt-4">
                <strong className="text-white">Your Interactions:</strong> Your interactions with third-party services are solely between you and the third party. We are not a party to any agreement between you and a third-party service provider. You acknowledge that third-party services may have their own terms of service, privacy policies, and fees that apply to your use of such services.
              </p>
              <p className="leading-relaxed mt-4">
                <strong className="text-white">Service Interruptions:</strong> We are not responsible for Service interruptions, failures, or errors caused by third-party services. If a third-party service becomes unavailable or fails, the Service may be temporarily unavailable, and we are not liable for any resulting damages or losses.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9A. Service Availability, Data Loss, and Backup</h2>
              
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">9A.1 No Guarantee of Service Availability</h3>
              <p className="leading-relaxed">
                We do NOT guarantee that the Service will be available, uninterrupted, error-free, or secure at all times. The Service may be unavailable due to:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Scheduled maintenance or updates</li>
                <li>Unscheduled maintenance or emergency repairs</li>
                <li>Technical failures or system errors</li>
                <li>Third-party service failures or outages</li>
                <li>Network issues or internet connectivity problems</li>
                <li>Cyberattacks, security breaches, or malicious activity</li>
                <li>Natural disasters, acts of God, or force majeure events</li>
                <li>Government actions, regulations, or legal requirements</li>
                <li>Any other circumstances beyond our reasonable control</li>
              </ul>
              <p className="leading-relaxed mt-4">
                We are NOT liable for any damages, losses, or consequences resulting from Service unavailability, interruptions, or failures.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">9A.2 Data Loss and Backup Responsibilities</h3>
              <p className="leading-relaxed">
                <strong className="text-white">YOUR RESPONSIBILITY TO BACKUP:</strong> You are solely responsible for backing up and maintaining copies of all contracts, documents, data, and content you create or store using the Service. We are NOT responsible for:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Data loss, corruption, or deletion</li>
                <li>Loss of contracts, documents, or content</li>
                <li>Inability to access or retrieve your data</li>
                <li>Data loss due to Service failures, errors, or interruptions</li>
                <li>Data loss due to account termination or suspension</li>
                <li>Data loss due to security breaches or unauthorized access</li>
                <li>Data loss due to third-party service failures</li>
                <li>Any consequences of data loss, including business losses or legal issues</li>
              </ul>
              <p className="leading-relaxed mt-4">
                <strong className="text-white">No Data Recovery Guarantee:</strong> While we implement reasonable data backup and recovery procedures, we do NOT guarantee that we can recover lost data. You should maintain your own backups of all important contracts and documents.
              </p>
              <p className="leading-relaxed mt-4">
                <strong className="text-white">Export Your Data:</strong> You may export your data at any time through the Service. We recommend regularly exporting and backing up your contracts and data to protect against data loss.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">9A.3 Service Modifications and Discontinuation</h3>
              <p className="leading-relaxed">
                We reserve the right to:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Modify, update, or change the Service at any time, with or without notice</li>
                <li>Add, remove, or modify features, functionality, or capabilities</li>
                <li>Discontinue, suspend, or terminate the Service or any part thereof</li>
                <li>Change pricing, fees, or subscription terms</li>
                <li>Impose usage limits or restrictions</li>
                <li>Modify or discontinue support for certain features or integrations</li>
              </ul>
              <p className="leading-relaxed mt-4">
                We are NOT liable for any damages, losses, or consequences resulting from Service modifications, changes, or discontinuation. We recommend that you maintain backups and alternative solutions for critical business operations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Comprehensive Disclaimers and Limitations of Liability</h2>
              
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">10.1 Service Provided "As Is" - No Warranties</h3>
              <p className="leading-relaxed">
                <strong className="text-white">THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.</strong> To the fullest extent permitted by applicable law, Pay2Start, its affiliates, subsidiaries, officers, directors, employees, agents, and licensors (collectively, "Pay2Start Parties") DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Warranties of merchantability</li>
                <li>Warranties of fitness for a particular purpose</li>
                <li>Warranties of non-infringement</li>
                <li>Warranties of title</li>
                <li>Warranties of accuracy, completeness, or reliability</li>
                <li>Warranties that the Service will be uninterrupted, error-free, secure, or available at any time</li>
                <li>Warranties that defects will be corrected</li>
                <li>Warranties regarding the quality, performance, or results of using the Service</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">10.2 No Legal, Financial, or Professional Advice</h3>
              <p className="leading-relaxed">
                <strong className="text-white">CRITICAL DISCLAIMER:</strong> Pay2Start is a technology platform and software service provider. We do NOT provide:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Legal advice, legal services, or legal representation</li>
                <li>Financial advice, investment advice, or financial planning services</li>
                <li>Tax advice or tax preparation services</li>
                <li>Accounting advice or accounting services</li>
                <li>Business consulting or business advice</li>
                <li>Contract review, contract drafting, or contract analysis</li>
                <li>Professional advice of any kind</li>
              </ul>
              <p className="leading-relaxed mt-4">
                You are solely and exclusively responsible for:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>The content, terms, conditions, and legal sufficiency of all contracts, purchase agreements, and documents you create</li>
                <li>Ensuring all contracts comply with applicable federal, state, local, and international laws and regulations</li>
                <li>Obtaining appropriate legal, financial, tax, and professional counsel before using any contract or entering into any transaction</li>
                <li>The enforceability, validity, and legal effectiveness of your contracts</li>
                <li>All business decisions, transactions, and agreements you make using the Service</li>
                <li>Compliance with all applicable laws, regulations, and industry standards</li>
                <li>Verifying the identity and authority of parties signing contracts</li>
                <li>Ensuring all parties have the legal capacity to enter into contracts</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">10.3 No Liability for Contracts, Transactions, or Business Decisions</h3>
              <p className="leading-relaxed">
                <strong className="text-white">YOU EXPRESSLY ACKNOWLEDGE AND AGREE THAT:</strong>
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Pay2Start Parties have NO liability whatsoever for any contracts, purchase agreements, or transactions created using the Service</li>
                <li>Pay2Start Parties are NOT responsible for the legal validity, enforceability, or effectiveness of any contract</li>
                <li>Pay2Start Parties are NOT responsible for disputes, claims, or litigation arising from contracts or transactions</li>
                <li>Pay2Start Parties are NOT responsible for financial losses, business losses, or damages resulting from contracts or transactions</li>
                <li>Pay2Start Parties are NOT responsible for breach of contract, non-performance, or failure to fulfill obligations under any contract</li>
                <li>Pay2Start Parties are NOT responsible for payment disputes, delivery issues, quality disputes, or transaction disputes</li>
                <li>Pay2Start Parties are NOT responsible for any business decisions, strategies, or actions you take based on contracts created using the Service</li>
                <li>All risks associated with contracts, transactions, and business activities are solely and exclusively yours</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">10.4 Comprehensive Limitation of Liability</h3>
              <p className="leading-relaxed">
                <strong className="text-white">TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL PAY2START PARTIES BE LIABLE FOR:</strong>
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of profits, revenue, income, or business opportunities</li>
                <li>Loss of data, information, or content</li>
                <li>Loss of goodwill, reputation, or business relationships</li>
                <li>Cost of substitute goods or services</li>
                <li>Business interruption or loss of use</li>
                <li>Personal injury or property damage</li>
                <li>Any damages arising from contracts, purchase agreements, or transactions created using the Service</li>
                <li>Any damages arising from disputes between you and your clients, customers, or contracting parties</li>
                <li>Any damages arising from the use or inability to use the Service</li>
                <li>Any damages arising from unauthorized access to or use of the Service</li>
                <li>Any damages arising from errors, omissions, or inaccuracies in the Service</li>
                <li>Any damages arising from third-party services or integrations</li>
              </ul>
              <p className="leading-relaxed mt-4">
                <strong className="text-white">TOTAL LIABILITY CAP:</strong> To the maximum extent permitted by law, the total liability of Pay2Start Parties for any claims arising out of or relating to the Service, regardless of the form of action, shall not exceed the amount you paid to Pay2Start in the twelve (12) months preceding the claim, or ONE HUNDRED DOLLARS ($100.00), whichever is greater.
              </p>
              <p className="leading-relaxed mt-4">
                <strong className="text-white">NO LIABILITY FOR CONTRACTS:</strong> Notwithstanding anything to the contrary, Pay2Start Parties shall have NO liability whatsoever for any damages, losses, or claims arising from contracts, purchase agreements, transactions, or business activities created, managed, or conducted using the Service, regardless of the nature of the claim or the theory of liability.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">10.5 Jurisdictional Limitations</h3>
              <p className="leading-relaxed">
                Some jurisdictions do not allow the exclusion of certain warranties or the limitation or exclusion of liability for incidental or consequential damages. Accordingly, some of the above limitations may not apply to you. However, to the fullest extent permitted by law, the limitations and exclusions set forth in this section shall apply.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">10.6 No Guarantee of Results</h3>
              <p className="leading-relaxed">
                Pay2Start Parties make no guarantees, representations, or warranties regarding:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>The success, profitability, or outcome of any business using the Service</li>
                <li>The effectiveness of any contract or purchase agreement</li>
                <li>The ability to collect payments or enforce contracts</li>
                <li>The satisfaction of clients or customers</li>
                <li>Any specific results or outcomes from using the Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Comprehensive Indemnification</h2>
              <p className="leading-relaxed">
                <strong className="text-white">YOU AGREE TO INDEMNIFY, DEFEND, AND HOLD HARMLESS</strong> Pay2Start, its parent companies, subsidiaries, affiliates, officers, directors, employees, agents, licensors, suppliers, partners, and contractors (collectively, "Indemnified Parties") from and against ANY AND ALL claims, demands, actions, suits, proceedings, liabilities, damages, losses, costs, and expenses (including, without limitation, reasonable attorneys' fees, court costs, and settlement costs) arising out of or in any way connected with:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Your use or misuse of the Service</li>
                <li>Your violation of these Terms or any applicable law or regulation</li>
                <li>Your violation of any third-party rights, including intellectual property rights, privacy rights, publicity rights, or contractual rights</li>
                <li>All contracts, purchase agreements, service agreements, or any other documents you create, use, or store using the Service</li>
                <li>All transactions, business activities, or commercial dealings you conduct using the Service</li>
                <li>Any disputes, claims, or litigation between you and your clients, customers, contracting parties, or any third parties</li>
                <li>Any claims that contracts or agreements created using the Service are invalid, unenforceable, or illegal</li>
                <li>Any claims arising from the content, terms, or conditions of your contracts</li>
                <li>Any claims arising from digital signatures, electronic signatures, or signature disputes</li>
                <li>Any claims arising from payment processing, payment disputes, or financial transactions</li>
                <li>Any claims arising from your failure to comply with applicable laws, regulations, or industry standards</li>
                <li>Any claims arising from your use of contract templates or form agreements</li>
                <li>Any claims arising from data breaches, security incidents, or unauthorized access to your account (except to the extent caused by our gross negligence or willful misconduct)</li>
                <li>Any claims arising from your User Content or any content you create, upload, or store using the Service</li>
                <li>Any claims that the Service infringes upon third-party rights due to your use or combination of the Service with your content</li>
                <li>Any claims arising from your business decisions, strategies, or actions</li>
                <li>Any other claims, demands, or actions arising from your use of the Service</li>
              </ul>
              <p className="leading-relaxed mt-4">
                <strong className="text-white">Indemnification Procedures:</strong> We reserve the right, at our own expense, to assume the exclusive defense and control of any matter subject to indemnification by you. You agree to cooperate fully with us in the defense of any such claim. You will not settle any claim that affects us or our Indemnified Parties without our prior written consent.
              </p>
              <p className="leading-relaxed mt-4">
                <strong className="text-white">Continuing Obligation:</strong> Your indemnification obligations will survive termination of these Terms and your use of the Service.
              </p>
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
              <h2 className="text-2xl font-bold text-white mb-4">14. Force Majeure</h2>
              <p className="leading-relaxed">
                We shall not be liable for any failure or delay in performance under these Terms that is due to causes beyond our reasonable control, including but not limited to:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Natural disasters, earthquakes, floods, fires, or other acts of God</li>
                <li>War, terrorism, riots, civil unrest, or acts of public enemies</li>
                <li>Government actions, regulations, orders, or restrictions</li>
                <li>Cyberattacks, security breaches, or malicious activity</li>
                <li>Third-party service failures, outages, or interruptions</li>
                <li>Internet or telecommunications failures or disruptions</li>
                <li>Pandemics, epidemics, or public health emergencies</li>
                <li>Labor strikes, work stoppages, or labor disputes</li>
                <li>Shortages of materials, equipment, or supplies</li>
                <li>Any other circumstances beyond our reasonable control</li>
              </ul>
              <p className="leading-relaxed mt-4">
                In the event of a force majeure event, we will use reasonable efforts to resume performance as soon as practicable. However, we are not liable for any damages, losses, or consequences resulting from force majeure events.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">15. Governing Law and Dispute Resolution</h2>
              
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">15.1 Governing Law</h3>
              <p className="leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions. The United Nations Convention on Contracts for the International Sale of Goods does not apply to these Terms.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">15.2 Dispute Resolution</h3>
              <p className="leading-relaxed">
                Any disputes, claims, or controversies arising out of or relating to these Terms or the Service shall be resolved through the following process:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li><strong className="text-white">Good Faith Negotiation:</strong> The parties shall first attempt to resolve the dispute through good faith negotiation for a period of thirty (30) days</li>
                <li><strong className="text-white">Binding Arbitration:</strong> If negotiation fails, the dispute shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association (AAA) or a similar arbitration organization</li>
                <li><strong className="text-white">Arbitration Location:</strong> Arbitration shall take place in a location mutually agreed upon by the parties, or if no agreement is reached, in a location determined by the arbitration organization</li>
                <li><strong className="text-white">Arbitrator Selection:</strong> The arbitrator shall be selected in accordance with AAA rules</li>
                <li><strong className="text-white">Arbitration Costs:</strong> Each party shall bear its own costs and attorneys' fees, unless otherwise required by law</li>
                <li><strong className="text-white">Class Action Waiver:</strong> You agree that disputes will be resolved individually and not as part of a class action, consolidated action, or representative proceeding</li>
                <li><strong className="text-white">Jury Trial Waiver:</strong> You waive any right to a jury trial in connection with any dispute</li>
              </ul>
              <p className="leading-relaxed mt-4">
                <strong className="text-white">Exceptions:</strong> Notwithstanding the above, either party may seek injunctive relief or other equitable remedies in any court of competent jurisdiction to protect intellectual property rights or to prevent irreparable harm.
              </p>
              <p className="leading-relaxed mt-4">
                <strong className="text-white">Small Claims:</strong> Either party may bring claims in small claims court if the claims qualify and are brought in an individual capacity.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">16. General Provisions</h2>
              
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">16.1 Entire Agreement</h3>
              <p className="leading-relaxed">
                These Terms, together with our Privacy Policy and Cookie Policy, constitute the entire agreement between you and Pay2Start regarding the Service and supersede all prior or contemporaneous agreements, understandings, negotiations, and communications, whether oral or written.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">16.2 Severability</h3>
              <p className="leading-relaxed">
                If any provision of these Terms is found to be invalid, illegal, or unenforceable by a court of competent jurisdiction, such provision shall be modified to the minimum extent necessary to make it valid, legal, and enforceable, or if such modification is not possible, it shall be severed from these Terms. The remaining provisions will remain in full force and effect.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">16.3 Waiver</h3>
              <p className="leading-relaxed">
                Our failure to enforce any right or provision of these Terms will not be considered a waiver of such right or provision. No waiver of any term or condition shall be deemed a further or continuing waiver of such term or condition or any other term or condition.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">16.4 Assignment</h3>
              <p className="leading-relaxed">
                You may not assign, transfer, or delegate these Terms or your rights or obligations hereunder without our prior written consent. Any attempted assignment, transfer, or delegation without such consent shall be null and void. We may assign, transfer, or delegate these Terms or our rights or obligations hereunder without restriction, including in connection with a merger, acquisition, or sale of assets.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">16.5 Relationship of Parties</h3>
              <p className="leading-relaxed">
                Nothing in these Terms creates a partnership, joint venture, agency, or employment relationship between you and Pay2Start. You are an independent user of the Service, and we are an independent service provider.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">16.6 Notices</h3>
              <p className="leading-relaxed">
                All notices, requests, and communications under these Terms must be in writing and delivered to:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Pay2Start: support@pay2start.com or the address provided in the Contact Information section</li>
                <li>You: The email address associated with your account or the address you provide</li>
              </ul>
              <p className="leading-relaxed mt-4">
                Notices shall be deemed delivered when sent to the email address provided, or when received if sent by certified mail.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">16.7 Headings and Interpretation</h3>
              <p className="leading-relaxed">
                The section headings in these Terms are for convenience only and shall not affect the interpretation of these Terms. The word "including" means "including without limitation."
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">16.8 Survival</h3>
              <p className="leading-relaxed">
                The following provisions shall survive termination of these Terms and your use of the Service:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>All disclaimers and limitations of liability</li>
                <li>All indemnification obligations</li>
                <li>Intellectual property provisions</li>
                <li>Governing law and dispute resolution provisions</li>
                <li>Any other provisions that by their nature should survive</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">17. Contact Information</h2>
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
