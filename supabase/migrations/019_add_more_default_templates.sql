-- Additional default contract templates for various industries and use cases

-- 8. Photography Services Agreement
INSERT INTO default_contract_templates (name, category, description, content, fields) VALUES (
  'Photography Services Agreement',
  'Photography',
  'Comprehensive photography contract for events, portraits, commercial photography, and wedding photography with detailed usage rights and cancellation policies.',
  'PHOTOGRAPHY SERVICES AGREEMENT

This Photography Services Agreement ("Agreement") is entered into on {{contractDate}} (the "Effective Date") between {{contractorName}}, a {{contractorEntityType}} ("Photographer"), and {{clientName}}, a {{clientEntityType}} ("Client").

WHEREAS, Photographer is engaged in the business of providing photography services; and
WHEREAS, Client desires to engage Photographer to provide photography services;

NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, the parties agree as follows:

1. PHOTOGRAPHY SERVICES
1.1 Event/Project: {{eventName}}
1.2 Date: {{eventDate}}
1.3 Location: {{eventLocation}}
1.4 Duration: {{sessionDuration}} hours
1.5 Number of Photographers: {{numberOfPhotographers}}
1.6 Services Included: {{servicesIncluded}}
1.7 Special Requests: {{specialRequests}}

2. COMPENSATION
2.1 Session Fee: ${{sessionFee}}
2.2 Additional Services: {{additionalServices}}
2.3 Total Amount: ${{totalAmount}}
2.4 Payment Schedule:
   - Deposit: ${{depositAmount}} ({{depositPercentage}}%) due upon execution of this Agreement
   - Balance Due: ${{balanceAmount}} ({{balancePercentage}}%) due {{balanceDueDate}} or on the day of the event
2.5 Late payments will incur interest at {{latePaymentInterest}}% per month.

3. DELIVERABLES
3.1 Number of Edited Photos: {{numberOfPhotos}}
3.2 Delivery Format: {{deliveryFormat}}
3.3 Delivery Method: {{deliveryMethod}}
3.4 Delivery Timeline: {{deliveryTimeline}} days after event
3.5 Additional edits beyond the included number will be billed at ${{additionalEditRate}} per photo.

4. USAGE RIGHTS
4.1 Upon full payment, Client receives {{usageRights}} license to use the photographs.
4.2 Photographer retains copyright and the right to:
   (a) Use images for portfolio and marketing purposes;
   (b) Submit images to photography contests and publications;
   (c) Display images in galleries or exhibitions.
4.3 Client may not:
   (a) Edit or alter the photographs without Photographer''s written consent;
   (b) Remove watermarks or copyright notices;
   (c) Use images for commercial purposes beyond the scope of the license granted.

5. CLIENT RESPONSIBILITIES
5.1 Client agrees to:
   (a) Provide access to the location at the agreed time;
   (b) Ensure adequate lighting if needed (or allow Photographer to set up lighting);
   (c) Provide a shot list if applicable;
   (d) Make timely payments;
   (e) Obtain necessary permits or permissions for the location;
   (f) Ensure all subjects have consented to being photographed.

6. CANCELLATION POLICY
6.1 Cancellation more than {{cancellationNotice}} days before the event:
   - Full refund minus ${{cancellationFee}} cancellation fee
6.2 Cancellation less than {{cancellationNotice}} days before the event:
   - No refund of deposit
   - Balance may be refunded at Photographer''s discretion
6.3 Rescheduling:
   - Allowed once with {{rescheduleNotice}} days notice at no additional cost
   - Additional reschedules may incur a ${{rescheduleFee}} fee

7. WEATHER/OUTDOOR EVENTS
7.1 For outdoor events, if weather prevents photography, the session will be rescheduled at no additional cost.
7.2 Client and Photographer will agree on a backup date in advance.

8. MODEL RELEASES
8.1 Client is responsible for obtaining model releases for all subjects if required.
8.2 Photographer will provide model release forms upon request.

9. TERMINATION
9.1 Either party may terminate with {{terminationNotice}} days written notice.
9.2 Client will pay for services rendered to date upon termination.

10. WARRANTIES AND DISCLAIMERS
10.1 Photographer warrants that services will be performed in a professional manner.
10.2 Photographer does not guarantee specific shots or poses.
10.3 Photographer is not responsible for:
    (a) Missed shots due to Client or subject unavailability;
    (b) Poor image quality due to lighting or environmental conditions beyond Photographer''s control;
    (c) Loss of images due to equipment failure (though Photographer will use backup equipment).

11. LIMITATION OF LIABILITY
11.1 Photographer''s total liability shall not exceed the total fees paid under this Agreement.
11.2 Photographer is not liable for indirect, incidental, or consequential damages.

12. GOVERNING LAW
12.1 This Agreement is governed by the laws of {{governingState}}.
12.2 Disputes shall be resolved through {{disputeResolution}} in {{disputeLocation}}.

IN WITNESS WHEREOF, the parties have executed this Agreement.

PHOTOGRAPHER:
{{contractorName}}
By: _________________________
Name: {{contractorSignatory}}
Title: {{contractorTitle}}
Date: {{contractDate}}

CLIENT:
{{clientName}}
By: _________________________
Name: {{clientSignatory}}
Title: {{clientTitle}}
Date: {{signDate}}',
  '[
    {"id": "contractDate", "label": "Contract Date", "type": "date", "required": true, "placeholder": "YYYY-MM-DD"},
    {"id": "contractorName", "label": "Photographer Name", "type": "text", "required": true, "placeholder": "Your Name/Company"},
    {"id": "contractorEntityType", "label": "Photographer Entity Type", "type": "text", "required": false, "placeholder": "e.g., LLC, Sole Proprietorship"},
    {"id": "clientName", "label": "Client Name", "type": "text", "required": true, "placeholder": "Client Name"},
    {"id": "clientEntityType", "label": "Client Entity Type", "type": "text", "required": false, "placeholder": "e.g., LLC, Individual"},
    {"id": "eventName", "label": "Event/Project Name", "type": "text", "required": true, "placeholder": "e.g., Wedding, Corporate Event, Portrait Session"},
    {"id": "eventDate", "label": "Event Date", "type": "date", "required": true, "placeholder": "YYYY-MM-DD"},
    {"id": "eventLocation", "label": "Event Location", "type": "text", "required": true, "placeholder": "Full address"},
    {"id": "sessionDuration", "label": "Session Duration (hours)", "type": "number", "required": true, "placeholder": "0"},
    {"id": "numberOfPhotographers", "label": "Number of Photographers", "type": "number", "required": false, "placeholder": "1"},
    {"id": "servicesIncluded", "label": "Services Included", "type": "textarea", "required": true, "placeholder": "List of services"},
    {"id": "specialRequests", "label": "Special Requests", "type": "textarea", "required": false, "placeholder": "Any special requests or requirements"},
    {"id": "sessionFee", "label": "Session Fee", "type": "number", "required": true, "placeholder": "0.00"},
    {"id": "additionalServices", "label": "Additional Services", "type": "textarea", "required": false, "placeholder": "Additional services and pricing"},
    {"id": "totalAmount", "label": "Total Amount", "type": "number", "required": true, "placeholder": "0.00"},
    {"id": "depositAmount", "label": "Deposit Amount", "type": "number", "required": false, "placeholder": "0.00"},
    {"id": "depositPercentage", "label": "Deposit Percentage", "type": "number", "required": false, "placeholder": "50"},
    {"id": "balanceAmount", "label": "Balance Amount", "type": "number", "required": false, "placeholder": "0.00"},
    {"id": "balancePercentage", "label": "Balance Percentage", "type": "number", "required": false, "placeholder": "50"},
    {"id": "balanceDueDate", "label": "Balance Due Date", "type": "date", "required": false, "placeholder": "YYYY-MM-DD"},
    {"id": "latePaymentInterest", "label": "Late Payment Interest Rate (%)", "type": "number", "required": false, "placeholder": "1.5"},
    {"id": "numberOfPhotos", "label": "Number of Edited Photos", "type": "number", "required": true, "placeholder": "0"},
    {"id": "deliveryFormat", "label": "Delivery Format", "type": "text", "required": false, "placeholder": "e.g., Digital files, USB drive, Online gallery"},
    {"id": "deliveryMethod", "label": "Delivery Method", "type": "text", "required": false, "placeholder": "e.g., Online gallery, Email, Physical delivery"},
    {"id": "deliveryTimeline", "label": "Delivery Timeline (days)", "type": "number", "required": true, "placeholder": "0"},
    {"id": "additionalEditRate", "label": "Additional Edit Rate (per photo)", "type": "number", "required": false, "placeholder": "0.00"},
    {"id": "usageRights", "label": "Usage Rights", "type": "text", "required": false, "placeholder": "e.g., Personal use, Commercial use, Unlimited"},
    {"id": "cancellationNotice", "label": "Cancellation Notice (days)", "type": "number", "required": false, "placeholder": "14"},
    {"id": "cancellationFee", "label": "Cancellation Fee", "type": "number", "required": false, "placeholder": "0.00"},
    {"id": "rescheduleNotice", "label": "Reschedule Notice (days)", "type": "number", "required": false, "placeholder": "7"},
    {"id": "rescheduleFee", "label": "Reschedule Fee", "type": "number", "required": false, "placeholder": "0.00"},
    {"id": "terminationNotice", "label": "Termination Notice (days)", "type": "number", "required": false, "placeholder": "30"},
    {"id": "governingState", "label": "Governing State/Province", "type": "text", "required": false, "placeholder": "State or Province"},
    {"id": "disputeResolution", "label": "Dispute Resolution Method", "type": "text", "required": false, "placeholder": "e.g., binding arbitration"},
    {"id": "disputeLocation", "label": "Dispute Resolution Location", "type": "text", "required": false, "placeholder": "City, State"},
    {"id": "contractorSignatory", "label": "Photographer Signatory Name", "type": "text", "required": false, "placeholder": "Name"},
    {"id": "contractorTitle", "label": "Photographer Signatory Title", "type": "text", "required": false, "placeholder": "Title"},
    {"id": "clientSignatory", "label": "Client Signatory Name", "type": "text", "required": false, "placeholder": "Name"},
    {"id": "clientTitle", "label": "Client Signatory Title", "type": "text", "required": false, "placeholder": "Title"},
    {"id": "signDate", "label": "Client Sign Date", "type": "date", "required": false, "placeholder": "YYYY-MM-DD"}
  ]'::jsonb
);

-- 9. Social Media Management Agreement
INSERT INTO default_contract_templates (name, category, description, content, fields) VALUES (
  'Social Media Management Agreement',
  'Marketing',
  'Comprehensive social media management contract covering content creation, posting schedules, engagement, and reporting.',
  'SOCIAL MEDIA MANAGEMENT AGREEMENT

This Social Media Management Agreement ("Agreement") is entered into on {{contractDate}} (the "Effective Date") between {{contractorName}}, a {{contractorEntityType}} ("Manager"), and {{clientName}}, a {{clientEntityType}} ("Client").

WHEREAS, Manager is engaged in the business of providing social media management services; and
WHEREAS, Client desires to engage Manager to manage Client''s social media presence;

NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, the parties agree as follows:

1. SERVICES
1.1 Manager agrees to provide the following social media management services:
   - Platforms: {{socialMediaPlatforms}}
   - Content Creation: {{contentCreation}}
   - Posting Frequency: {{postingFrequency}}
   - Engagement Management: {{engagementManagement}}
   - Services Included: {{servicesIncluded}}

1.2 Manager will:
   (a) Create and schedule social media content;
   (b) Monitor and respond to comments and messages (within {{responseTime}} hours);
   (c) Provide monthly reports on performance metrics;
   (d) Develop and implement social media strategy.

2. COMPENSATION
2.1 Monthly Retainer: ${{monthlyRetainer}}
2.2 Additional Services: {{additionalServices}}
2.3 Payment Terms:
   - Payment is due on the {{paymentDueDate}} of each month
   - Late payments will incur interest at {{latePaymentInterest}}% per month
2.4 Client is responsible for all advertising costs and platform fees.

3. TERM
3.1 This Agreement shall commence on {{startDate}} and continue for {{contractDuration}} months.
3.2 This Agreement will automatically renew for successive {{renewalPeriod}} month periods unless either party provides {{terminationNotice}} days written notice of non-renewal.

4. DELIVERABLES
4.1 Manager will provide:
   (a) {{contentPostsPerMonth}} posts per month across all platforms;
   (b) Monthly performance reports;
   (c) Content calendar;
   (d) Strategy recommendations.

5. CLIENT RESPONSIBILITIES
5.1 Client agrees to:
   (a) Provide brand guidelines and assets;
   (b) Approve content in a timely manner (within {{approvalTimeframe}} hours);
   (c) Provide necessary access to social media accounts;
   (d) Provide timely feedback;
   (e) Make timely payments.

6. CONTENT APPROVAL
6.1 Manager will submit content for Client approval {{approvalDays}} days before scheduled posting.
6.2 If Client does not respond within the approval timeframe, Manager may proceed with posting.

7. INTELLECTUAL PROPERTY
7.1 Content created by Manager becomes Client''s property upon full payment.
7.2 Manager retains portfolio rights to use content for self-promotion.
7.3 Client is responsible for ensuring all content provided does not infringe upon third-party rights.

8. CONFIDENTIALITY
8.1 Manager agrees to maintain confidentiality of Client''s business information for {{confidentialityPeriod}} years.

9. TERMINATION
9.1 Either party may terminate with {{terminationNotice}} days written notice.
9.2 Client will pay for services rendered to date upon termination.

10. GOVERNING LAW
10.1 This Agreement is governed by the laws of {{governingState}}.

IN WITNESS WHEREOF, the parties have executed this Agreement.

MANAGER:
{{contractorName}}
By: _________________________
Name: {{contractorSignatory}}
Title: {{contractorTitle}}
Date: {{contractDate}}

CLIENT:
{{clientName}}
By: _________________________
Name: {{clientSignatory}}
Title: {{clientTitle}}
Date: {{signDate}}',
  '[
    {"id": "contractDate", "label": "Contract Date", "type": "date", "required": true, "placeholder": "YYYY-MM-DD"},
    {"id": "contractorName", "label": "Manager Name", "type": "text", "required": true, "placeholder": "Your Name/Company"},
    {"id": "contractorEntityType", "label": "Manager Entity Type", "type": "text", "required": false, "placeholder": "e.g., LLC, Sole Proprietorship"},
    {"id": "clientName", "label": "Client Name", "type": "text", "required": true, "placeholder": "Client Company Name"},
    {"id": "clientEntityType", "label": "Client Entity Type", "type": "text", "required": false, "placeholder": "e.g., LLC, Corporation"},
    {"id": "socialMediaPlatforms", "label": "Social Media Platforms", "type": "textarea", "required": true, "placeholder": "e.g., Facebook, Instagram, Twitter, LinkedIn"},
    {"id": "contentCreation", "label": "Content Creation", "type": "textarea", "required": true, "placeholder": "Description of content creation services"},
    {"id": "postingFrequency", "label": "Posting Frequency", "type": "text", "required": true, "placeholder": "e.g., 3 posts per week, Daily posts"},
    {"id": "engagementManagement", "label": "Engagement Management", "type": "textarea", "required": true, "placeholder": "Description of engagement management"},
    {"id": "servicesIncluded", "label": "Services Included", "type": "textarea", "required": true, "placeholder": "List of all services"},
    {"id": "responseTime", "label": "Response Time (hours)", "type": "number", "required": false, "placeholder": "24"},
    {"id": "monthlyRetainer", "label": "Monthly Retainer", "type": "number", "required": true, "placeholder": "0.00"},
    {"id": "additionalServices", "label": "Additional Services", "type": "textarea", "required": false, "placeholder": "Additional services and pricing"},
    {"id": "paymentDueDate", "label": "Payment Due Date (day of month)", "type": "number", "required": false, "placeholder": "1"},
    {"id": "latePaymentInterest", "label": "Late Payment Interest Rate (%)", "type": "number", "required": false, "placeholder": "1.5"},
    {"id": "startDate", "label": "Start Date", "type": "date", "required": true, "placeholder": "YYYY-MM-DD"},
    {"id": "contractDuration", "label": "Contract Duration (months)", "type": "number", "required": true, "placeholder": "0"},
    {"id": "renewalPeriod", "label": "Renewal Period (months)", "type": "number", "required": false, "placeholder": "1"},
    {"id": "contentPostsPerMonth", "label": "Content Posts Per Month", "type": "number", "required": true, "placeholder": "0"},
    {"id": "approvalTimeframe", "label": "Approval Timeframe (hours)", "type": "number", "required": false, "placeholder": "48"},
    {"id": "approvalDays", "label": "Approval Days Before Posting", "type": "number", "required": false, "placeholder": "3"},
    {"id": "confidentialityPeriod", "label": "Confidentiality Period (years)", "type": "number", "required": false, "placeholder": "3"},
    {"id": "terminationNotice", "label": "Termination Notice (days)", "type": "number", "required": false, "placeholder": "30"},
    {"id": "governingState", "label": "Governing State/Province", "type": "text", "required": false, "placeholder": "State or Province"},
    {"id": "contractorSignatory", "label": "Manager Signatory Name", "type": "text", "required": false, "placeholder": "Name"},
    {"id": "contractorTitle", "label": "Manager Signatory Title", "type": "text", "required": false, "placeholder": "Title"},
    {"id": "clientSignatory", "label": "Client Signatory Name", "type": "text", "required": false, "placeholder": "Name"},
    {"id": "clientTitle", "label": "Client Signatory Title", "type": "text", "required": false, "placeholder": "Title"},
    {"id": "signDate", "label": "Client Sign Date", "type": "date", "required": false, "placeholder": "YYYY-MM-DD"}
  ]'::jsonb
);

-- 10. SEO Services Agreement
INSERT INTO default_contract_templates (name, category, description, content, fields) VALUES (
  'SEO Services Agreement',
  'Marketing',
  'Comprehensive SEO services contract covering keyword research, on-page optimization, link building, and reporting.',
  'SEO SERVICES AGREEMENT

This SEO Services Agreement ("Agreement") is entered into on {{contractDate}} (the "Effective Date") between {{contractorName}}, a {{contractorEntityType}} ("SEO Provider"), and {{clientName}}, a {{clientEntityType}} ("Client").

WHEREAS, SEO Provider is engaged in the business of providing search engine optimization services; and
WHEREAS, Client desires to engage SEO Provider to improve Client''s search engine rankings;

NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, the parties agree as follows:

1. SERVICES
1.1 SEO Provider agrees to provide the following SEO services:
   - Keyword Research: {{keywordResearch}}
   - On-Page Optimization: {{onPageOptimization}}
   - Off-Page Optimization: {{offPageOptimization}}
   - Technical SEO: {{technicalSEO}}
   - Content Optimization: {{contentOptimization}}
   - Link Building: {{linkBuilding}}
   - Services Included: {{servicesIncluded}}

1.2 SEO Provider will:
   (a) Conduct comprehensive SEO audits;
   (b) Develop and implement SEO strategy;
   (c) Optimize website content and structure;
   (d) Build quality backlinks;
   (e) Provide monthly performance reports.

2. COMPENSATION
2.1 Monthly Retainer: ${{monthlyRetainer}}
2.2 Setup Fee: ${{setupFee}} (one-time, due upon execution)
2.3 Additional Services: {{additionalServices}}
2.4 Payment Terms:
   - Setup fee due upon execution
   - Monthly retainer due on the {{paymentDueDate}} of each month
   - Late payments will incur interest at {{latePaymentInterest}}% per month

3. TERM
3.1 This Agreement shall commence on {{startDate}} and continue for {{contractDuration}} months.
3.2 This Agreement will automatically renew for successive {{renewalPeriod}} month periods unless either party provides {{terminationNotice}} days written notice.

4. DELIVERABLES
4.1 SEO Provider will provide:
   (a) Initial SEO audit and report;
   (b) Monthly performance reports with metrics;
   (c) Keyword rankings reports;
   (d) Recommendations for improvement;
   (e) Implementation of approved optimizations.

5. PERFORMANCE METRICS
5.1 SEO Provider will track and report on:
   - Organic traffic growth
   - Keyword rankings
   - Backlink acquisition
   - Technical SEO improvements
   - Conversion rate improvements

5.2 SEO Provider does not guarantee specific rankings or traffic numbers, as search engine algorithms are constantly changing.

6. CLIENT RESPONSIBILITIES
6.1 Client agrees to:
   (a) Provide access to website, analytics, and search console;
   (b) Implement recommended changes in a timely manner;
   (c) Provide necessary content and information;
   (d) Make timely payments;
   (e) Not engage in black-hat SEO practices that could harm rankings.

7. PROHIBITED PRACTICES
7.1 Client agrees not to engage in:
   (a) Keyword stuffing;
   (b) Buying links;
   (c) Cloaking;
   (d) Any other practices that violate search engine guidelines.

8. INTELLECTUAL PROPERTY
8.1 SEO strategies and methodologies remain the property of SEO Provider.
8.2 Optimized content becomes Client''s property upon payment.

9. TERMINATION
9.1 Either party may terminate with {{terminationNotice}} days written notice.
9.2 Client will pay for services rendered to date upon termination.

10. GOVERNING LAW
10.1 This Agreement is governed by the laws of {{governingState}}.

IN WITNESS WHEREOF, the parties have executed this Agreement.

SEO PROVIDER:
{{contractorName}}
By: _________________________
Name: {{contractorSignatory}}
Title: {{contractorTitle}}
Date: {{contractDate}}

CLIENT:
{{clientName}}
By: _________________________
Name: {{clientSignatory}}
Title: {{clientTitle}}
Date: {{signDate}}',
  '[
    {"id": "contractDate", "label": "Contract Date", "type": "date", "required": true, "placeholder": "YYYY-MM-DD"},
    {"id": "contractorName", "label": "SEO Provider Name", "type": "text", "required": true, "placeholder": "Your Name/Company"},
    {"id": "contractorEntityType", "label": "SEO Provider Entity Type", "type": "text", "required": false, "placeholder": "e.g., LLC, Corporation"},
    {"id": "clientName", "label": "Client Name", "type": "text", "required": true, "placeholder": "Client Company Name"},
    {"id": "clientEntityType", "label": "Client Entity Type", "type": "text", "required": false, "placeholder": "e.g., LLC, Corporation"},
    {"id": "keywordResearch", "label": "Keyword Research", "type": "textarea", "required": true, "placeholder": "Description of keyword research services"},
    {"id": "onPageOptimization", "label": "On-Page Optimization", "type": "textarea", "required": true, "placeholder": "Description of on-page optimization"},
    {"id": "offPageOptimization", "label": "Off-Page Optimization", "type": "textarea", "required": true, "placeholder": "Description of off-page optimization"},
    {"id": "technicalSEO", "label": "Technical SEO", "type": "textarea", "required": true, "placeholder": "Description of technical SEO services"},
    {"id": "contentOptimization", "label": "Content Optimization", "type": "textarea", "required": true, "placeholder": "Description of content optimization"},
    {"id": "linkBuilding", "label": "Link Building", "type": "textarea", "required": true, "placeholder": "Description of link building services"},
    {"id": "servicesIncluded", "label": "Services Included", "type": "textarea", "required": true, "placeholder": "List of all services"},
    {"id": "monthlyRetainer", "label": "Monthly Retainer", "type": "number", "required": true, "placeholder": "0.00"},
    {"id": "setupFee", "label": "Setup Fee (one-time)", "type": "number", "required": false, "placeholder": "0.00"},
    {"id": "additionalServices", "label": "Additional Services", "type": "textarea", "required": false, "placeholder": "Additional services and pricing"},
    {"id": "paymentDueDate", "label": "Payment Due Date (day of month)", "type": "number", "required": false, "placeholder": "1"},
    {"id": "latePaymentInterest", "label": "Late Payment Interest Rate (%)", "type": "number", "required": false, "placeholder": "1.5"},
    {"id": "startDate", "label": "Start Date", "type": "date", "required": true, "placeholder": "YYYY-MM-DD"},
    {"id": "contractDuration", "label": "Contract Duration (months)", "type": "number", "required": true, "placeholder": "0"},
    {"id": "renewalPeriod", "label": "Renewal Period (months)", "type": "number", "required": false, "placeholder": "1"},
    {"id": "terminationNotice", "label": "Termination Notice (days)", "type": "number", "required": false, "placeholder": "30"},
    {"id": "governingState", "label": "Governing State/Province", "type": "text", "required": false, "placeholder": "State or Province"},
    {"id": "contractorSignatory", "label": "SEO Provider Signatory Name", "type": "text", "required": false, "placeholder": "Name"},
    {"id": "contractorTitle", "label": "SEO Provider Signatory Title", "type": "text", "required": false, "placeholder": "Title"},
    {"id": "clientSignatory", "label": "Client Signatory Name", "type": "text", "required": false, "placeholder": "Name"},
    {"id": "clientTitle", "label": "Client Signatory Title", "type": "text", "required": false, "placeholder": "Title"},
    {"id": "signDate", "label": "Client Sign Date", "type": "date", "required": false, "placeholder": "YYYY-MM-DD"}
  ]'::jsonb
);

-- 11. Virtual Assistant Services Agreement
INSERT INTO default_contract_templates (name, category, description, content, fields) VALUES (
  'Virtual Assistant Services Agreement',
  'General',
  'Comprehensive virtual assistant contract covering administrative tasks, scheduling, email management, and various support services.',
  'VIRTUAL ASSISTANT SERVICES AGREEMENT

This Virtual Assistant Services Agreement ("Agreement") is entered into on {{contractDate}} (the "Effective Date") between {{contractorName}}, a {{contractorEntityType}} ("Virtual Assistant" or "VA"), and {{clientName}}, a {{clientEntityType}} ("Client").

WHEREAS, Virtual Assistant is engaged in the business of providing virtual administrative and support services; and
WHEREAS, Client desires to engage Virtual Assistant to provide such services;

NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, the parties agree as follows:

1. SERVICES
1.1 Virtual Assistant agrees to provide the following services:
   - Administrative Tasks: {{administrativeTasks}}
   - Email Management: {{emailManagement}}
   - Scheduling: {{scheduling}}
   - Data Entry: {{dataEntry}}
   - Research: {{research}}
   - Customer Service: {{customerService}}
   - Additional Services: {{additionalServices}}

1.2 Virtual Assistant will perform services in a professional and timely manner.

2. COMPENSATION
2.1 Compensation Structure: {{compensationStructure}}
2.2 Payment Terms:
   - {{paymentTerms}}
   - Late payments will incur interest at {{latePaymentInterest}}% per month
2.3 Virtual Assistant will provide detailed time logs or task reports upon request.

3. TERM
3.1 This Agreement shall commence on {{startDate}} and continue until {{endDate}}, unless earlier terminated in accordance with this Agreement.
3.2 This Agreement may be extended by mutual written agreement.

4. WORK SCHEDULE
4.1 Virtual Assistant''s availability: {{availability}}
4.2 Response Time: Virtual Assistant will respond to Client communications within {{responseTime}} hours during business hours.
4.3 Business Hours: {{businessHours}}

5. CLIENT RESPONSIBILITIES
5.1 Client agrees to:
   (a) Provide clear instructions and priorities;
   (b) Provide necessary access to systems and accounts;
   (c) Provide timely feedback;
   (d) Make timely payments;
   (e) Respect Virtual Assistant''s working hours.

6. CONFIDENTIALITY
6.1 Virtual Assistant agrees to maintain strict confidentiality of all Client information for {{confidentialityPeriod}} years.
6.2 Virtual Assistant will not disclose Client information to third parties without written consent.

7. INDEPENDENT CONTRACTOR
7.1 Virtual Assistant is an independent contractor and not an employee of Client.
7.2 Virtual Assistant is responsible for all taxes, insurance, and benefits.

8. INTELLECTUAL PROPERTY
8.1 Work product created specifically for Client becomes Client''s property upon payment.
8.2 Virtual Assistant retains rights to general methodologies and processes.

9. TERMINATION
9.1 Either party may terminate with {{terminationNotice}} days written notice.
9.2 Client will pay for all services rendered to date upon termination.

10. LIMITATION OF LIABILITY
10.1 Virtual Assistant''s total liability shall not exceed the total fees paid under this Agreement.

11. GOVERNING LAW
11.1 This Agreement is governed by the laws of {{governingState}}.

IN WITNESS WHEREOF, the parties have executed this Agreement.

VIRTUAL ASSISTANT:
{{contractorName}}
By: _________________________
Name: {{contractorSignatory}}
Title: {{contractorTitle}}
Date: {{contractDate}}

CLIENT:
{{clientName}}
By: _________________________
Name: {{clientSignatory}}
Title: {{clientTitle}}
Date: {{signDate}}',
  '[
    {"id": "contractDate", "label": "Contract Date", "type": "date", "required": true, "placeholder": "YYYY-MM-DD"},
    {"id": "contractorName", "label": "Virtual Assistant Name", "type": "text", "required": true, "placeholder": "Your Name/Company"},
    {"id": "contractorEntityType", "label": "Virtual Assistant Entity Type", "type": "text", "required": false, "placeholder": "e.g., LLC, Sole Proprietorship"},
    {"id": "clientName", "label": "Client Name", "type": "text", "required": true, "placeholder": "Client Company Name"},
    {"id": "clientEntityType", "label": "Client Entity Type", "type": "text", "required": false, "placeholder": "e.g., LLC, Corporation"},
    {"id": "administrativeTasks", "label": "Administrative Tasks", "type": "textarea", "required": true, "placeholder": "List of administrative tasks"},
    {"id": "emailManagement", "label": "Email Management", "type": "textarea", "required": true, "placeholder": "Description of email management services"},
    {"id": "scheduling", "label": "Scheduling", "type": "textarea", "required": true, "placeholder": "Description of scheduling services"},
    {"id": "dataEntry", "label": "Data Entry", "type": "textarea", "required": true, "placeholder": "Description of data entry services"},
    {"id": "research", "label": "Research", "type": "textarea", "required": true, "placeholder": "Description of research services"},
    {"id": "customerService", "label": "Customer Service", "type": "textarea", "required": true, "placeholder": "Description of customer service"},
    {"id": "additionalServices", "label": "Additional Services", "type": "textarea", "required": false, "placeholder": "Additional services"},
    {"id": "compensationStructure", "label": "Compensation Structure", "type": "textarea", "required": true, "placeholder": "e.g., Hourly rate: $X, Monthly retainer: $Y"},
    {"id": "paymentTerms", "label": "Payment Terms", "type": "textarea", "required": false, "placeholder": "Payment schedule and terms"},
    {"id": "latePaymentInterest", "label": "Late Payment Interest Rate (%)", "type": "number", "required": false, "placeholder": "1.5"},
    {"id": "startDate", "label": "Start Date", "type": "date", "required": true, "placeholder": "YYYY-MM-DD"},
    {"id": "endDate", "label": "End Date", "type": "date", "required": true, "placeholder": "YYYY-MM-DD"},
    {"id": "availability", "label": "Availability", "type": "textarea", "required": true, "placeholder": "e.g., Monday-Friday, 9am-5pm EST"},
    {"id": "responseTime", "label": "Response Time (hours)", "type": "number", "required": false, "placeholder": "24"},
    {"id": "businessHours", "label": "Business Hours", "type": "text", "required": false, "placeholder": "e.g., Monday-Friday, 9am-5pm EST"},
    {"id": "confidentialityPeriod", "label": "Confidentiality Period (years)", "type": "number", "required": false, "placeholder": "3"},
    {"id": "terminationNotice", "label": "Termination Notice (days)", "type": "number", "required": false, "placeholder": "30"},
    {"id": "governingState", "label": "Governing State/Province", "type": "text", "required": false, "placeholder": "State or Province"},
    {"id": "contractorSignatory", "label": "Virtual Assistant Signatory Name", "type": "text", "required": false, "placeholder": "Name"},
    {"id": "contractorTitle", "label": "Virtual Assistant Signatory Title", "type": "text", "required": false, "placeholder": "Title"},
    {"id": "clientSignatory", "label": "Client Signatory Name", "type": "text", "required": false, "placeholder": "Name"},
    {"id": "clientTitle", "label": "Client Signatory Title", "type": "text", "required": false, "placeholder": "Title"},
    {"id": "signDate", "label": "Client Sign Date", "type": "date", "required": false, "placeholder": "YYYY-MM-DD"}
  ]'::jsonb
);

-- 12. Coaching Services Agreement
INSERT INTO default_contract_templates (name, category, description, content, fields) VALUES (
  'Coaching Services Agreement',
  'Consulting',
  'Comprehensive coaching services contract covering one-on-one coaching, group coaching, and program delivery with detailed terms.',
  'COACHING SERVICES AGREEMENT

This Coaching Services Agreement ("Agreement") is entered into on {{contractDate}} (the "Effective Date") between {{contractorName}}, a {{contractorEntityType}} ("Coach"), and {{clientName}} ("Client").

WHEREAS, Coach is engaged in the business of providing coaching services in the field of {{coachingField}}; and
WHEREAS, Client desires to engage Coach to provide coaching services;

NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, the parties agree as follows:

1. COACHING SERVICES
1.1 Coach agrees to provide the following coaching services:
   - Coaching Type: {{coachingType}}
   - Program Duration: {{programDuration}}
   - Session Frequency: {{sessionFrequency}}
   - Session Length: {{sessionLength}} minutes per session
   - Total Sessions: {{totalSessions}}
   - Services Included: {{servicesIncluded}}
   - Program Goals: {{programGoals}}

1.2 Coach will:
   (a) Provide coaching sessions as scheduled;
   (b) Provide support materials and resources;
   (c) Maintain confidentiality of Client information;
   (d) Provide professional guidance and support.

2. COMPENSATION
2.1 Program Fee: ${{totalAmount}}
2.2 Payment Options:
   {{paymentOptions}}
2.3 Late payments will incur interest at {{latePaymentInterest}}% per month.

3. TERM
3.1 This Agreement shall commence on {{startDate}} and continue until {{endDate}} or completion of the program, whichever occurs first.

4. SESSION SCHEDULING
4.1 Sessions will be scheduled {{schedulingMethod}}.
4.2 Client must provide {{cancellationNotice}} hours notice to reschedule or cancel a session.
4.3 Sessions cancelled with less than {{cancellationNotice}} hours notice may be forfeited.
4.4 Coach will make reasonable efforts to reschedule missed sessions.

5. CLIENT RESPONSIBILITIES
5.1 Client agrees to:
   (a) Attend all scheduled sessions;
   (b) Complete assigned exercises and homework;
   (c) Be open and honest during sessions;
   (d) Make timely payments;
   (e) Provide feedback on progress.

6. CONFIDENTIALITY
6.1 Coach agrees to maintain strict confidentiality of all Client information shared during coaching sessions.
6.2 This obligation continues for {{confidentialityPeriod}} years after termination of this Agreement.
6.3 Exceptions: Coach may disclose information if required by law or if there is a risk of harm to Client or others.

7. NO GUARANTEES
7.1 Coach does not guarantee specific results or outcomes.
7.2 Results depend on Client''s commitment, effort, and participation.
7.3 Coach provides guidance and support but Client is responsible for their own decisions and actions.

8. TERMINATION
8.1 Either party may terminate with {{terminationNotice}} days written notice.
8.2 Client will pay for services rendered to date upon termination.
8.3 Refunds for unused sessions will be calculated on a pro-rata basis.

9. INDEPENDENT CONTRACTOR
9.1 Coach is an independent contractor and not an employee of Client.

10. GOVERNING LAW
10.1 This Agreement is governed by the laws of {{governingState}}.

IN WITNESS WHEREOF, the parties have executed this Agreement.

COACH:
{{contractorName}}
By: _________________________
Name: {{contractorSignatory}}
Title: {{contractorTitle}}
Date: {{contractDate}}

CLIENT:
{{clientName}}
Signature: _________________________
Date: {{signDate}}',
  '[
    {"id": "contractDate", "label": "Contract Date", "type": "date", "required": true, "placeholder": "YYYY-MM-DD"},
    {"id": "contractorName", "label": "Coach Name", "type": "text", "required": true, "placeholder": "Your Name/Company"},
    {"id": "contractorEntityType", "label": "Coach Entity Type", "type": "text", "required": false, "placeholder": "e.g., LLC, Sole Proprietorship"},
    {"id": "clientName", "label": "Client Name", "type": "text", "required": true, "placeholder": "Client Name"},
    {"id": "coachingField", "label": "Coaching Field", "type": "text", "required": true, "placeholder": "e.g., Life Coaching, Business Coaching, Career Coaching"},
    {"id": "coachingType", "label": "Coaching Type", "type": "text", "required": true, "placeholder": "e.g., One-on-one, Group, Online"},
    {"id": "programDuration", "label": "Program Duration", "type": "text", "required": true, "placeholder": "e.g., 3 months, 6 months"},
    {"id": "sessionFrequency", "label": "Session Frequency", "type": "text", "required": true, "placeholder": "e.g., Weekly, Bi-weekly"},
    {"id": "sessionLength", "label": "Session Length (minutes)", "type": "number", "required": true, "placeholder": "0"},
    {"id": "totalSessions", "label": "Total Sessions", "type": "number", "required": true, "placeholder": "0"},
    {"id": "servicesIncluded", "label": "Services Included", "type": "textarea", "required": true, "placeholder": "List of services"},
    {"id": "programGoals", "label": "Program Goals", "type": "textarea", "required": false, "placeholder": "Key goals and objectives"},
    {"id": "totalAmount", "label": "Total Program Fee", "type": "number", "required": true, "placeholder": "0.00"},
    {"id": "paymentOptions", "label": "Payment Options", "type": "textarea", "required": true, "placeholder": "e.g., Full payment: $X, Monthly: $Y per month"},
    {"id": "latePaymentInterest", "label": "Late Payment Interest Rate (%)", "type": "number", "required": false, "placeholder": "1.5"},
    {"id": "startDate", "label": "Start Date", "type": "date", "required": true, "placeholder": "YYYY-MM-DD"},
    {"id": "endDate", "label": "End Date", "type": "date", "required": true, "placeholder": "YYYY-MM-DD"},
    {"id": "schedulingMethod", "label": "Scheduling Method", "type": "text", "required": false, "placeholder": "e.g., Via calendar link, Email, Phone"},
    {"id": "cancellationNotice", "label": "Cancellation Notice (hours)", "type": "number", "required": false, "placeholder": "24"},
    {"id": "confidentialityPeriod", "label": "Confidentiality Period (years)", "type": "number", "required": false, "placeholder": "3"},
    {"id": "terminationNotice", "label": "Termination Notice (days)", "type": "number", "required": false, "placeholder": "30"},
    {"id": "governingState", "label": "Governing State/Province", "type": "text", "required": false, "placeholder": "State or Province"},
    {"id": "contractorSignatory", "label": "Coach Signatory Name", "type": "text", "required": false, "placeholder": "Name"},
    {"id": "contractorTitle", "label": "Coach Signatory Title", "type": "text", "required": false, "placeholder": "Title"},
    {"id": "signDate", "label": "Client Sign Date", "type": "date", "required": false, "placeholder": "YYYY-MM-DD"}
  ]'::jsonb
);

-- 13. Video Production Agreement
INSERT INTO default_contract_templates (name, category, description, content, fields) VALUES (
  'Video Production Agreement',
  'Media',
  'Comprehensive video production contract covering pre-production, production, post-production, and delivery terms.',
  'VIDEO PRODUCTION AGREEMENT

This Video Production Agreement ("Agreement") is entered into on {{contractDate}} (the "Effective Date") between {{contractorName}}, a {{contractorEntityType}} ("Producer"), and {{clientName}}, a {{clientEntityType}} ("Client").

WHEREAS, Producer is engaged in the business of providing video production services; and
WHEREAS, Client desires to engage Producer to create video content;

NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, the parties agree as follows:

1. PROJECT DESCRIPTION
1.1 Project: {{projectName}}
1.2 Video Type: {{videoType}}
1.3 Video Length: Approximately {{videoLength}} minutes
1.4 Deliverables: {{deliverables}}
1.5 Project Timeline: {{projectTimeline}}

2. PRODUCTION PHASES
2.1 Pre-Production: {{preProductionTimeline}} ({{preProductionDeliverables}})
2.2 Production: {{productionTimeline}} ({{productionDeliverables}})
2.3 Post-Production: {{postProductionTimeline}} ({{postProductionDeliverables}})

3. COMPENSATION
3.1 Total Project Fee: ${{totalAmount}}
3.2 Payment Schedule:
   - Deposit ({{depositPercentage}}%): ${{depositAmount}} due upon execution
   - Production Payment ({{productionPercentage}}%): ${{productionAmount}} due {{productionDate}}
   - Final Payment ({{finalPaymentPercentage}}%): ${{finalPayment}} due upon final delivery
3.3 Additional Services: {{additionalServices}}
3.4 Late payments will incur interest at {{latePaymentInterest}}% per month.

4. DELIVERABLES
4.1 Producer will deliver:
   {{deliverablesList}}
4.2 Delivery Format: {{deliveryFormat}}
4.3 Delivery Method: {{deliveryMethod}}

5. REVISIONS
5.1 Client is entitled to {{includedRevisions}} rounds of revisions.
5.2 Additional revisions will be billed at ${{revisionRate}} per hour.

6. INTELLECTUAL PROPERTY
6.1 Upon full payment, Producer assigns to Client all rights to the final video.
6.2 Producer retains:
   (a) Portfolio rights;
   (b) Rights to behind-the-scenes footage;
   (c) Rights to raw footage (unless otherwise agreed).

7. CLIENT RESPONSIBILITIES
7.1 Client agrees to:
   (a) Provide all necessary content, scripts, and materials;
   (b) Provide timely approvals (within {{approvalTimeframe}} business days);
   (c) Provide access to locations and talent;
   (d) Make timely payments.

8. LOCATION AND TALENT
8.1 Client is responsible for:
   (a) Location permits and fees;
   (b) Talent fees and releases;
   (c) Music licensing (unless provided by Producer).

9. TERMINATION
9.1 Either party may terminate with {{terminationNotice}} days written notice.
9.2 Client will pay for all work completed to date upon termination.

10. GOVERNING LAW
10.1 This Agreement is governed by the laws of {{governingState}}.

IN WITNESS WHEREOF, the parties have executed this Agreement.

PRODUCER:
{{contractorName}}
By: _________________________
Name: {{contractorSignatory}}
Title: {{contractorTitle}}
Date: {{contractDate}}

CLIENT:
{{clientName}}
By: _________________________
Name: {{clientSignatory}}
Title: {{clientTitle}}
Date: {{signDate}}',
  '[
    {"id": "contractDate", "label": "Contract Date", "type": "date", "required": true, "placeholder": "YYYY-MM-DD"},
    {"id": "contractorName", "label": "Producer Name", "type": "text", "required": true, "placeholder": "Your Name/Company"},
    {"id": "contractorEntityType", "label": "Producer Entity Type", "type": "text", "required": false, "placeholder": "e.g., LLC, Corporation"},
    {"id": "clientName", "label": "Client Name", "type": "text", "required": true, "placeholder": "Client Company Name"},
    {"id": "clientEntityType", "label": "Client Entity Type", "type": "text", "required": false, "placeholder": "e.g., LLC, Corporation"},
    {"id": "projectName", "label": "Project Name", "type": "text", "required": true, "placeholder": "Video Project Name"},
    {"id": "videoType", "label": "Video Type", "type": "text", "required": true, "placeholder": "e.g., Commercial, Corporate, Documentary"},
    {"id": "videoLength", "label": "Video Length (minutes)", "type": "number", "required": true, "placeholder": "0"},
    {"id": "deliverables", "label": "Deliverables Summary", "type": "textarea", "required": true, "placeholder": "Summary of deliverables"},
    {"id": "projectTimeline", "label": "Project Timeline", "type": "text", "required": true, "placeholder": "e.g., 4-6 weeks"},
    {"id": "preProductionTimeline", "label": "Pre-Production Timeline", "type": "text", "required": false, "placeholder": "e.g., 1 week"},
    {"id": "preProductionDeliverables", "label": "Pre-Production Deliverables", "type": "text", "required": false, "placeholder": "e.g., Script, Storyboard"},
    {"id": "productionTimeline", "label": "Production Timeline", "type": "text", "required": false, "placeholder": "e.g., 2 days"},
    {"id": "productionDeliverables", "label": "Production Deliverables", "type": "text", "required": false, "placeholder": "e.g., Raw footage"},
    {"id": "postProductionTimeline", "label": "Post-Production Timeline", "type": "text", "required": false, "placeholder": "e.g., 2 weeks"},
    {"id": "postProductionDeliverables", "label": "Post-Production Deliverables", "type": "text", "required": false, "placeholder": "e.g., Final edited video"},
    {"id": "totalAmount", "label": "Total Amount", "type": "number", "required": true, "placeholder": "0.00"},
    {"id": "depositAmount", "label": "Deposit Amount", "type": "number", "required": false, "placeholder": "0.00"},
    {"id": "depositPercentage", "label": "Deposit Percentage", "type": "number", "required": false, "placeholder": "50"},
    {"id": "productionAmount", "label": "Production Payment Amount", "type": "number", "required": false, "placeholder": "0.00"},
    {"id": "productionPercentage", "label": "Production Payment Percentage", "type": "number", "required": false, "placeholder": "30"},
    {"id": "productionDate", "label": "Production Payment Due Date", "type": "date", "required": false, "placeholder": "YYYY-MM-DD"},
    {"id": "finalPayment", "label": "Final Payment Amount", "type": "number", "required": false, "placeholder": "0.00"},
    {"id": "finalPaymentPercentage", "label": "Final Payment Percentage", "type": "number", "required": false, "placeholder": "20"},
    {"id": "additionalServices", "label": "Additional Services", "type": "textarea", "required": false, "placeholder": "Additional services and pricing"},
    {"id": "latePaymentInterest", "label": "Late Payment Interest Rate (%)", "type": "number", "required": false, "placeholder": "1.5"},
    {"id": "deliverablesList", "label": "Detailed Deliverables List", "type": "textarea", "required": false, "placeholder": "Detailed list of deliverables"},
    {"id": "deliveryFormat", "label": "Delivery Format", "type": "text", "required": false, "placeholder": "e.g., MP4, MOV, 4K"},
    {"id": "deliveryMethod", "label": "Delivery Method", "type": "text", "required": false, "placeholder": "e.g., Online download, USB drive"},
    {"id": "includedRevisions", "label": "Included Revision Rounds", "type": "number", "required": false, "placeholder": "2"},
    {"id": "revisionRate", "label": "Revision Rate (per hour)", "type": "number", "required": false, "placeholder": "0.00"},
    {"id": "approvalTimeframe", "label": "Approval Timeframe (business days)", "type": "number", "required": false, "placeholder": "5"},
    {"id": "terminationNotice", "label": "Termination Notice (days)", "type": "number", "required": false, "placeholder": "30"},
    {"id": "governingState", "label": "Governing State/Province", "type": "text", "required": false, "placeholder": "State or Province"},
    {"id": "contractorSignatory", "label": "Producer Signatory Name", "type": "text", "required": false, "placeholder": "Name"},
    {"id": "contractorTitle", "label": "Producer Signatory Title", "type": "text", "required": false, "placeholder": "Title"},
    {"id": "clientSignatory", "label": "Client Signatory Name", "type": "text", "required": false, "placeholder": "Name"},
    {"id": "clientTitle", "label": "Client Signatory Title", "type": "text", "required": false, "placeholder": "Title"},
    {"id": "signDate", "label": "Client Sign Date", "type": "date", "required": false, "placeholder": "YYYY-MM-DD"}
  ]'::jsonb
);

-- 14. Translation Services Agreement
INSERT INTO default_contract_templates (name, category, description, content, fields) VALUES (
  'Translation Services Agreement',
  'Writing',
  'Comprehensive translation services contract covering document translation, proofreading, and certification.',
  'TRANSLATION SERVICES AGREEMENT

This Translation Services Agreement ("Agreement") is entered into on {{contractDate}} (the "Effective Date") between {{contractorName}}, a {{contractorEntityType}} ("Translator"), and {{clientName}}, a {{clientEntityType}} ("Client").

WHEREAS, Translator is engaged in the business of providing translation services; and
WHEREAS, Client desires to engage Translator to translate documents;

NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, the parties agree as follows:

1. TRANSLATION SERVICES
1.1 Source Language: {{sourceLanguage}}
1.2 Target Language: {{targetLanguage}}
1.3 Document Type: {{documentType}}
1.4 Word Count: Approximately {{wordCount}} words
1.5 Services Included: {{servicesIncluded}}
1.6 Special Requirements: {{specialRequirements}}

2. COMPENSATION
2.1 Rate per Word: ${{ratePerWord}}
2.2 Total Project Fee: ${{totalAmount}}
2.3 Additional Services:
   - Proofreading: ${{proofreadingRate}} per word
   - Certification: ${{certificationFee}} (if required)
2.4 Payment Terms:
   - {{paymentTerms}}
   - Late payments will incur interest at {{latePaymentInterest}}% per month

3. DELIVERABLES
3.1 Translator will deliver:
   (a) Translated document in {{deliveryFormat}};
   (b) Proofread version (if included);
   (c) Certification document (if requested);
3.2 Delivery Timeline: {{deliveryTimeline}} days from receipt of source document
3.3 Delivery Method: {{deliveryMethod}}

4. QUALITY AND ACCURACY
4.1 Translator will use best efforts to provide accurate translations.
4.2 Translator will maintain the meaning, tone, and style of the original document.
4.3 Client may request revisions for accuracy within {{revisionTimeframe}} days of delivery.

5. CONFIDENTIALITY
5.1 Translator agrees to maintain strict confidentiality of all documents and information for {{confidentialityPeriod}} years.

6. CLIENT RESPONSIBILITIES
6.1 Client agrees to:
   (a) Provide clear, readable source documents;
   (b) Provide any reference materials or glossaries;
   (c) Provide context or explanations for specialized terms;
   (d) Make timely payments.

7. INTELLECTUAL PROPERTY
7.1 Translated work becomes Client''s property upon full payment.
7.2 Translator retains no rights to the translated content.

8. TERMINATION
8.1 Either party may terminate with {{terminationNotice}} days written notice.
8.2 Client will pay for work completed to date upon termination.

9. GOVERNING LAW
9.1 This Agreement is governed by the laws of {{governingState}}.

IN WITNESS WHEREOF, the parties have executed this Agreement.

TRANSLATOR:
{{contractorName}}
By: _________________________
Name: {{contractorSignatory}}
Title: {{contractorTitle}}
Date: {{contractDate}}

CLIENT:
{{clientName}}
By: _________________________
Name: {{clientSignatory}}
Title: {{clientTitle}}
Date: {{signDate}}',
  '[
    {"id": "contractDate", "label": "Contract Date", "type": "date", "required": true, "placeholder": "YYYY-MM-DD"},
    {"id": "contractorName", "label": "Translator Name", "type": "text", "required": true, "placeholder": "Your Name/Company"},
    {"id": "contractorEntityType", "label": "Translator Entity Type", "type": "text", "required": false, "placeholder": "e.g., LLC, Sole Proprietorship"},
    {"id": "clientName", "label": "Client Name", "type": "text", "required": true, "placeholder": "Client Company Name"},
    {"id": "clientEntityType", "label": "Client Entity Type", "type": "text", "required": false, "placeholder": "e.g., LLC, Corporation"},
    {"id": "sourceLanguage", "label": "Source Language", "type": "text", "required": true, "placeholder": "e.g., English, Spanish"},
    {"id": "targetLanguage", "label": "Target Language", "type": "text", "required": true, "placeholder": "e.g., Spanish, French"},
    {"id": "documentType", "label": "Document Type", "type": "text", "required": true, "placeholder": "e.g., Legal document, Marketing material"},
    {"id": "wordCount", "label": "Word Count", "type": "number", "required": true, "placeholder": "0"},
    {"id": "servicesIncluded", "label": "Services Included", "type": "textarea", "required": true, "placeholder": "List of services"},
    {"id": "specialRequirements", "label": "Special Requirements", "type": "textarea", "required": false, "placeholder": "Any special requirements"},
    {"id": "ratePerWord", "label": "Rate per Word", "type": "number", "required": true, "placeholder": "0.00"},
    {"id": "totalAmount", "label": "Total Amount", "type": "number", "required": true, "placeholder": "0.00"},
    {"id": "proofreadingRate", "label": "Proofreading Rate (per word)", "type": "number", "required": false, "placeholder": "0.00"},
    {"id": "certificationFee", "label": "Certification Fee", "type": "number", "required": false, "placeholder": "0.00"},
    {"id": "paymentTerms", "label": "Payment Terms", "type": "textarea", "required": false, "placeholder": "Payment schedule"},
    {"id": "latePaymentInterest", "label": "Late Payment Interest Rate (%)", "type": "number", "required": false, "placeholder": "1.5"},
    {"id": "deliveryFormat", "label": "Delivery Format", "type": "text", "required": false, "placeholder": "e.g., Word, PDF"},
    {"id": "deliveryTimeline", "label": "Delivery Timeline (days)", "type": "number", "required": true, "placeholder": "0"},
    {"id": "deliveryMethod", "label": "Delivery Method", "type": "text", "required": false, "placeholder": "e.g., Email, Online portal"},
    {"id": "revisionTimeframe", "label": "Revision Timeframe (days)", "type": "number", "required": false, "placeholder": "7"},
    {"id": "confidentialityPeriod", "label": "Confidentiality Period (years)", "type": "number", "required": false, "placeholder": "3"},
    {"id": "terminationNotice", "label": "Termination Notice (days)", "type": "number", "required": false, "placeholder": "30"},
    {"id": "governingState", "label": "Governing State/Province", "type": "text", "required": false, "placeholder": "State or Province"},
    {"id": "contractorSignatory", "label": "Translator Signatory Name", "type": "text", "required": false, "placeholder": "Name"},
    {"id": "contractorTitle", "label": "Translator Signatory Title", "type": "text", "required": false, "placeholder": "Title"},
    {"id": "clientSignatory", "label": "Client Signatory Name", "type": "text", "required": false, "placeholder": "Name"},
    {"id": "clientTitle", "label": "Client Signatory Title", "type": "text", "required": false, "placeholder": "Title"},
    {"id": "signDate", "label": "Client Sign Date", "type": "date", "required": false, "placeholder": "YYYY-MM-DD"}
  ]'::jsonb
);

-- 15. Event Planning Services Agreement
INSERT INTO default_contract_templates (name, category, description, content, fields) VALUES (
  'Event Planning Services Agreement',
  'General',
  'Comprehensive event planning contract covering event coordination, vendor management, and day-of coordination.',
  'EVENT PLANNING SERVICES AGREEMENT

This Event Planning Services Agreement ("Agreement") is entered into on {{contractDate}} (the "Effective Date") between {{contractorName}}, a {{contractorEntityType}} ("Event Planner"), and {{clientName}}, a {{clientEntityType}} ("Client").

WHEREAS, Event Planner is engaged in the business of providing event planning services; and
WHEREAS, Client desires to engage Event Planner to plan and coordinate an event;

NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, the parties agree as follows:

1. EVENT DETAILS
1.1 Event Type: {{eventType}}
1.2 Event Date: {{eventDate}}
1.3 Event Location: {{eventLocation}}
1.4 Expected Number of Guests: {{numberOfGuests}}
1.5 Event Budget: ${{eventBudget}}

2. SERVICES
2.1 Event Planner agrees to provide the following services:
   - Event Planning: {{eventPlanning}}
   - Vendor Coordination: {{vendorCoordination}}
   - Day-of Coordination: {{dayOfCoordination}}
   - Services Included: {{servicesIncluded}}

2.2 Event Planner will:
   (a) Develop event concept and theme;
   (b) Coordinate with vendors;
   (c) Manage event timeline;
   (d) Provide day-of coordination;
   (e) Handle event logistics.

3. COMPENSATION
3.1 Planning Fee: ${{planningFee}}
3.2 Coordination Fee: ${{coordinationFee}}
3.3 Total Fee: ${{totalAmount}}
3.4 Payment Schedule:
   - Deposit: ${{depositAmount}} ({{depositPercentage}}%) due upon execution
   - Progress Payment: ${{progressPayment}} ({{progressPercentage}}%) due {{progressDate}}
   - Final Payment: ${{finalPayment}} ({{finalPaymentPercentage}}%) due {{finalPaymentDate}}
3.5 Client is responsible for all vendor costs, venue fees, and event expenses.

4. VENDOR MANAGEMENT
4.1 Event Planner will:
   (a) Recommend and coordinate with vendors;
   (b) Negotiate vendor contracts (subject to Client approval);
   (c) Manage vendor relationships;
4.2 Client is responsible for:
   (a) Approving all vendor selections;
   (b) Signing vendor contracts;
   (c) Paying vendor invoices directly (unless otherwise agreed).

5. CLIENT RESPONSIBILITIES
5.1 Client agrees to:
   (a) Provide timely decisions and approvals;
   (b) Make timely payments;
   (c) Provide necessary information and access;
   (d) Attend planning meetings as scheduled.

6. CANCELLATION POLICY
6.1 Cancellation more than {{cancellationNotice}} days before event:
   - Client forfeits deposit
   - Additional fees may apply based on work completed
6.2 Cancellation less than {{cancellationNotice}} days before event:
   - Client is responsible for full fee
   - Vendor cancellation fees are Client''s responsibility

7. TERMINATION
7.1 Either party may terminate with {{terminationNotice}} days written notice.
7.2 Client will pay for services rendered to date upon termination.

8. GOVERNING LAW
8.1 This Agreement is governed by the laws of {{governingState}}.

IN WITNESS WHEREOF, the parties have executed this Agreement.

EVENT PLANNER:
{{contractorName}}
By: _________________________
Name: {{contractorSignatory}}
Title: {{contractorTitle}}
Date: {{contractDate}}

CLIENT:
{{clientName}}
By: _________________________
Name: {{clientSignatory}}
Title: {{clientTitle}}
Date: {{signDate}}',
  '[
    {"id": "contractDate", "label": "Contract Date", "type": "date", "required": true, "placeholder": "YYYY-MM-DD"},
    {"id": "contractorName", "label": "Event Planner Name", "type": "text", "required": true, "placeholder": "Your Name/Company"},
    {"id": "contractorEntityType", "label": "Event Planner Entity Type", "type": "text", "required": false, "placeholder": "e.g., LLC, Sole Proprietorship"},
    {"id": "clientName", "label": "Client Name", "type": "text", "required": true, "placeholder": "Client Company Name"},
    {"id": "clientEntityType", "label": "Client Entity Type", "type": "text", "required": false, "placeholder": "e.g., LLC, Corporation"},
    {"id": "eventType", "label": "Event Type", "type": "text", "required": true, "placeholder": "e.g., Wedding, Corporate Event, Conference"},
    {"id": "eventDate", "label": "Event Date", "type": "date", "required": true, "placeholder": "YYYY-MM-DD"},
    {"id": "eventLocation", "label": "Event Location", "type": "text", "required": true, "placeholder": "Full address"},
    {"id": "numberOfGuests", "label": "Expected Number of Guests", "type": "number", "required": true, "placeholder": "0"},
    {"id": "eventBudget", "label": "Event Budget", "type": "number", "required": true, "placeholder": "0.00"},
    {"id": "eventPlanning", "label": "Event Planning", "type": "textarea", "required": true, "placeholder": "Description of event planning services"},
    {"id": "vendorCoordination", "label": "Vendor Coordination", "type": "textarea", "required": true, "placeholder": "Description of vendor coordination"},
    {"id": "dayOfCoordination", "label": "Day-of Coordination", "type": "textarea", "required": true, "placeholder": "Description of day-of coordination"},
    {"id": "servicesIncluded", "label": "Services Included", "type": "textarea", "required": true, "placeholder": "List of all services"},
    {"id": "planningFee", "label": "Planning Fee", "type": "number", "required": false, "placeholder": "0.00"},
    {"id": "coordinationFee", "label": "Coordination Fee", "type": "number", "required": false, "placeholder": "0.00"},
    {"id": "totalAmount", "label": "Total Fee", "type": "number", "required": true, "placeholder": "0.00"},
    {"id": "depositAmount", "label": "Deposit Amount", "type": "number", "required": false, "placeholder": "0.00"},
    {"id": "depositPercentage", "label": "Deposit Percentage", "type": "number", "required": false, "placeholder": "50"},
    {"id": "progressPayment", "label": "Progress Payment Amount", "type": "number", "required": false, "placeholder": "0.00"},
    {"id": "progressPercentage", "label": "Progress Payment Percentage", "type": "number", "required": false, "placeholder": "30"},
    {"id": "progressDate", "label": "Progress Payment Due Date", "type": "date", "required": false, "placeholder": "YYYY-MM-DD"},
    {"id": "finalPayment", "label": "Final Payment Amount", "type": "number", "required": false, "placeholder": "0.00"},
    {"id": "finalPaymentPercentage", "label": "Final Payment Percentage", "type": "number", "required": false, "placeholder": "20"},
    {"id": "finalPaymentDate", "label": "Final Payment Due Date", "type": "date", "required": false, "placeholder": "YYYY-MM-DD"},
    {"id": "cancellationNotice", "label": "Cancellation Notice (days)", "type": "number", "required": false, "placeholder": "30"},
    {"id": "terminationNotice", "label": "Termination Notice (days)", "type": "number", "required": false, "placeholder": "30"},
    {"id": "governingState", "label": "Governing State/Province", "type": "text", "required": false, "placeholder": "State or Province"},
    {"id": "contractorSignatory", "label": "Event Planner Signatory Name", "type": "text", "required": false, "placeholder": "Name"},
    {"id": "contractorTitle", "label": "Event Planner Signatory Title", "type": "text", "required": false, "placeholder": "Title"},
    {"id": "clientSignatory", "label": "Client Signatory Name", "type": "text", "required": false, "placeholder": "Name"},
    {"id": "clientTitle", "label": "Client Signatory Title", "type": "text", "required": false, "placeholder": "Title"},
    {"id": "signDate", "label": "Client Sign Date", "type": "date", "required": false, "placeholder": "YYYY-MM-DD"}
  ]'::jsonb
);



