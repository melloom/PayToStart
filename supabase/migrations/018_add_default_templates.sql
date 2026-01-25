-- Create a table to store default/system templates that users can import
CREATE TABLE IF NOT EXISTS default_contract_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  fields JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert comprehensive, legally-sound contract templates

-- 1. Website Development Agreement (Enhanced)
INSERT INTO default_contract_templates (name, category, description, content, fields) VALUES (
  'Website Development Agreement',
  'Web Development',
  'Comprehensive, legally-protected contract for website development projects with detailed terms covering scope, IP rights, warranties, and liability.',
  'WEBSITE DEVELOPMENT AGREEMENT

This Website Development Agreement ("Agreement") is entered into on {{contractDate}} (the "Effective Date") between {{contractorName}}, a {{contractorEntityType}} ("Developer" or "Contractor"), and {{clientName}}, a {{clientEntityType}} ("Client").

WHEREAS, Developer is engaged in the business of website development and related services; and
WHEREAS, Client desires to engage Developer to perform website development services;

NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, the parties agree as follows:

1. DEFINITIONS
1.1 "Deliverables" means all work product, code, designs, documentation, and materials created by Developer in connection with the Services.
1.2 "Services" means the website development services described in Section 2.
1.3 "Project" means the website development project described in Exhibit A (if attached) or as otherwise specified in writing.

2. SCOPE OF SERVICES
2.1 Developer agrees to provide the following services (the "Services"):
   - Project Name: {{projectName}}
   - Website Type: {{websiteType}}
   - Platform/Technology: {{platform}}
   - Features and Functionality: {{featuresList}}
   - Deliverables: {{deliverables}}

2.2 Developer will perform the Services in a professional and workmanlike manner, consistent with industry standards.

2.3 Any changes to the scope of Services must be agreed upon in writing by both parties and may result in additional fees and timeline adjustments.

3. PROJECT TIMELINE
3.1 Project Start Date: {{startDate}}
3.2 Expected Completion Date: {{completionDate}}
3.3 Milestones:
   {{milestones}}

3.4 Developer will use commercially reasonable efforts to meet the timeline, but timelines are estimates and not guarantees. Delays caused by Client (including delayed feedback, content delivery, or approvals) will extend the timeline accordingly.

4. COMPENSATION AND PAYMENT TERMS
4.1 Total Project Fee: ${{totalAmount}} (the "Project Fee")

4.2 Payment Schedule:
   - Deposit: ${{depositAmount}} ({{depositPercentage}}%) due upon execution of this Agreement
   - Milestone Payment 1: ${{milestone1Amount}} ({{milestone1Percentage}}%) due upon {{milestone1Date}} or completion of {{milestone1Deliverable}}
   - Milestone Payment 2: ${{milestone2Amount}} ({{milestone2Percentage}}%) due upon {{milestone2Date}} or completion of {{milestone2Deliverable}}
   - Final Payment: ${{finalPayment}} ({{finalPaymentPercentage}}%) due upon final delivery and acceptance

4.3 All payments are due within {{paymentTerms}} days of invoice date. Late payments will incur interest at the rate of {{latePaymentInterest}}% per month or the maximum rate allowed by law, whichever is less.

4.4 Client is responsible for all applicable taxes, except taxes based on Developer''s income.

5. CLIENT RESPONSIBILITIES
5.1 Client agrees to:
   (a) Provide all necessary content, images, text, logos, and materials in a timely manner and in formats specified by Developer;
   (b) Provide timely feedback and approvals (within {{feedbackTimeframe}} business days);
   (c) Designate a single point of contact for approvals and communications;
   (d) Make timely payments as specified in Section 4;
   (e) Provide access to necessary accounts, hosting, domains, and third-party services;
   (f) Ensure all content provided does not infringe upon any third-party rights.

5.2 Delays in Client performance will extend the project timeline and may result in additional fees.

6. REVISIONS AND CHANGE ORDERS
6.1 Client is entitled to {{includedRevisions}} rounds of revisions per deliverable. Additional revisions will be billed at ${{revisionRate}} per hour.

6.2 Any material changes to the scope of work (a "Change Order") must be agreed upon in writing and may result in:
   (a) Additional fees;
   (b) Timeline adjustments;
   (c) Modification of deliverables.

6.3 Developer will provide a written estimate for any Change Order before commencing work.

7. INTELLECTUAL PROPERTY RIGHTS
7.1 Upon full payment of the Project Fee, Developer hereby assigns to Client all right, title, and interest in and to the Deliverables, including all copyrights, trademarks, and other intellectual property rights, subject to the reservations in Section 7.2.

7.2 Developer reserves the right to:
   (a) Use the Deliverables in Developer''s portfolio and marketing materials;
   (b) Retain ownership of any pre-existing code, frameworks, libraries, or tools used in the project;
   (c) Retain ownership of any general methodologies, processes, or know-how developed or used in connection with the Services.

7.3 Client represents and warrants that all content, materials, and information provided to Developer are owned by Client or Client has obtained all necessary rights and licenses for their use.

7.4 If Developer uses any third-party materials, components, or services, Client will be responsible for any associated licensing fees or ongoing costs.

8. WARRANTIES AND DISCLAIMERS
8.1 Developer warrants that:
   (a) The Services will be performed in a professional and workmanlike manner;
   (b) The Deliverables will be free from material defects for {{warrantyPeriod}} days following final delivery;
   (c) The Deliverables will not knowingly infringe upon any third-party intellectual property rights.

8.2 EXCEPT AS EXPRESSLY SET FORTH IN THIS AGREEMENT, DEVELOPER MAKES NO WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.

8.3 Developer does not warrant that the website will be error-free, uninterrupted, or meet all of Client''s requirements.

9. LIMITATION OF LIABILITY
9.1 IN NO EVENT SHALL DEVELOPER BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION LOSS OF PROFITS, DATA, OR BUSINESS OPPORTUNITIES, REGARDLESS OF THE THEORY OF LIABILITY.

9.2 DEVELOPER''S TOTAL LIABILITY UNDER THIS AGREEMENT SHALL NOT EXCEED THE TOTAL AMOUNT PAID BY CLIENT TO DEVELOPER UNDER THIS AGREEMENT.

9.3 This limitation of liability shall apply even if Developer has been advised of the possibility of such damages.

10. INDEMNIFICATION
10.1 Client agrees to indemnify, defend, and hold harmless Developer from and against any claims, damages, losses, liabilities, and expenses (including reasonable attorneys'' fees) arising out of or relating to:
   (a) Client''s use of the Deliverables;
   (b) Content or materials provided by Client;
   (c) Client''s breach of this Agreement;
   (d) Any claim that Client''s content infringes upon any third-party rights.

11. CONFIDENTIALITY
11.1 Both parties agree to maintain the confidentiality of all proprietary information disclosed during the course of this Agreement ("Confidential Information").

11.2 Confidential Information includes, but is not limited to, business plans, financial information, customer lists, technical information, and any information marked as confidential.

11.3 This obligation of confidentiality shall survive termination of this Agreement and continue for {{confidentialityPeriod}} years thereafter.

12. TERMINATION
12.1 Either party may terminate this Agreement:
   (a) For convenience, upon {{terminationNotice}} days written notice to the other party;
   (b) For material breach, if the breaching party fails to cure such breach within {{curePeriod}} days after written notice.

12.2 Upon termination:
   (a) Client will pay Developer for all Services performed and expenses incurred up to the date of termination;
   (b) Developer will deliver to Client all completed Deliverables;
   (c) Each party will return or destroy all Confidential Information of the other party.

12.3 Sections 7 (Intellectual Property), 9 (Limitation of Liability), 10 (Indemnification), 11 (Confidentiality), and 15 (General Provisions) shall survive termination.

13. FORCE MAJEURE
13.1 Neither party shall be liable for any failure or delay in performance due to circumstances beyond its reasonable control, including acts of God, natural disasters, war, terrorism, labor disputes, or government actions.

14. INDEPENDENT CONTRACTOR
14.1 Developer is an independent contractor and not an employee, agent, or partner of Client. Developer is solely responsible for all taxes, insurance, and benefits.

15. GENERAL PROVISIONS
15.1 Entire Agreement: This Agreement, together with any exhibits or attachments, constitutes the entire agreement between the parties and supersedes all prior agreements and understandings.

15.2 Amendment: This Agreement may only be amended in writing and signed by both parties.

15.3 Assignment: Neither party may assign this Agreement without the prior written consent of the other party, except that Developer may assign this Agreement to an affiliate or in connection with a merger or acquisition.

15.4 Severability: If any provision of this Agreement is held to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.

15.5 Waiver: No waiver of any provision of this Agreement shall be effective unless in writing and signed by the party waiving such provision.

15.6 Notices: All notices must be in writing and delivered to the addresses specified below or as otherwise designated in writing.

15.7 Governing Law: This Agreement shall be governed by and construed in accordance with the laws of {{governingState}}, without regard to its conflict of law principles.

15.8 Dispute Resolution: Any disputes arising under this Agreement shall be resolved through {{disputeResolution}} in {{disputeLocation}}.

15.9 Counterparts: This Agreement may be executed in counterparts, including electronic signatures, each of which shall be deemed an original.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the Effective Date.

DEVELOPER:
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
    {"id": "contractDate", "label": "Contract Date (Effective Date)", "type": "date", "required": true, "placeholder": "YYYY-MM-DD"},
    {"id": "contractorName", "label": "Developer/Contractor Name", "type": "text", "required": true, "placeholder": "Your Company Name"},
    {"id": "contractorEntityType", "label": "Contractor Entity Type", "type": "text", "required": false, "placeholder": "e.g., LLC, Corporation, Sole Proprietorship"},
    {"id": "clientName", "label": "Client Name", "type": "text", "required": true, "placeholder": "Client Company Name"},
    {"id": "clientEntityType", "label": "Client Entity Type", "type": "text", "required": false, "placeholder": "e.g., LLC, Corporation"},
    {"id": "projectName", "label": "Project Name", "type": "text", "required": true, "placeholder": "Website Project Name"},
    {"id": "websiteType", "label": "Website Type", "type": "text", "required": true, "placeholder": "e.g., E-commerce, Corporate, Portfolio"},
    {"id": "platform", "label": "Platform/Technology", "type": "text", "required": true, "placeholder": "e.g., WordPress, React, Custom"},
    {"id": "featuresList", "label": "Features and Functionality", "type": "textarea", "required": true, "placeholder": "Detailed list of features"},
    {"id": "deliverables", "label": "Deliverables", "type": "textarea", "required": true, "placeholder": "List of all deliverables"},
    {"id": "startDate", "label": "Project Start Date", "type": "date", "required": true, "placeholder": "YYYY-MM-DD"},
    {"id": "completionDate", "label": "Expected Completion Date", "type": "date", "required": true, "placeholder": "YYYY-MM-DD"},
    {"id": "milestones", "label": "Project Milestones", "type": "textarea", "required": false, "placeholder": "Key milestones with dates"},
    {"id": "totalAmount", "label": "Total Project Fee", "type": "number", "required": true, "placeholder": "0.00"},
    {"id": "depositAmount", "label": "Deposit Amount", "type": "number", "required": false, "placeholder": "0.00"},
    {"id": "depositPercentage", "label": "Deposit Percentage", "type": "number", "required": false, "placeholder": "30"},
    {"id": "milestone1Amount", "label": "Milestone 1 Amount", "type": "number", "required": false, "placeholder": "0.00"},
    {"id": "milestone1Percentage", "label": "Milestone 1 Percentage", "type": "number", "required": false, "placeholder": "30"},
    {"id": "milestone1Date", "label": "Milestone 1 Due Date", "type": "date", "required": false, "placeholder": "YYYY-MM-DD"},
    {"id": "milestone1Deliverable", "label": "Milestone 1 Deliverable", "type": "text", "required": false, "placeholder": "e.g., Design approval"},
    {"id": "milestone2Amount", "label": "Milestone 2 Amount", "type": "number", "required": false, "placeholder": "0.00"},
    {"id": "milestone2Percentage", "label": "Milestone 2 Percentage", "type": "number", "required": false, "placeholder": "30"},
    {"id": "milestone2Date", "label": "Milestone 2 Due Date", "type": "date", "required": false, "placeholder": "YYYY-MM-DD"},
    {"id": "milestone2Deliverable", "label": "Milestone 2 Deliverable", "type": "text", "required": false, "placeholder": "e.g., Development complete"},
    {"id": "finalPayment", "label": "Final Payment Amount", "type": "number", "required": false, "placeholder": "0.00"},
    {"id": "finalPaymentPercentage", "label": "Final Payment Percentage", "type": "number", "required": false, "placeholder": "10"},
    {"id": "paymentTerms", "label": "Payment Terms (days)", "type": "number", "required": false, "placeholder": "15"},
    {"id": "latePaymentInterest", "label": "Late Payment Interest Rate (%)", "type": "number", "required": false, "placeholder": "1.5"},
    {"id": "feedbackTimeframe", "label": "Feedback Timeframe (business days)", "type": "number", "required": false, "placeholder": "5"},
    {"id": "includedRevisions", "label": "Included Revision Rounds", "type": "number", "required": false, "placeholder": "3"},
    {"id": "revisionRate", "label": "Revision Rate (per hour)", "type": "number", "required": false, "placeholder": "0.00"},
    {"id": "warrantyPeriod", "label": "Warranty Period (days)", "type": "number", "required": false, "placeholder": "90"},
    {"id": "confidentialityPeriod", "label": "Confidentiality Period (years)", "type": "number", "required": false, "placeholder": "3"},
    {"id": "terminationNotice", "label": "Termination Notice (days)", "type": "number", "required": false, "placeholder": "30"},
    {"id": "curePeriod", "label": "Cure Period for Breach (days)", "type": "number", "required": false, "placeholder": "30"},
    {"id": "governingState", "label": "Governing State/Province", "type": "text", "required": false, "placeholder": "State or Province"},
    {"id": "disputeResolution", "label": "Dispute Resolution Method", "type": "text", "required": false, "placeholder": "e.g., binding arbitration, mediation"},
    {"id": "disputeLocation", "label": "Dispute Resolution Location", "type": "text", "required": false, "placeholder": "City, State"},
    {"id": "contractorSignatory", "label": "Contractor Signatory Name", "type": "text", "required": false, "placeholder": "Name of person signing"},
    {"id": "contractorTitle", "label": "Contractor Signatory Title", "type": "text", "required": false, "placeholder": "Title"},
    {"id": "clientSignatory", "label": "Client Signatory Name", "type": "text", "required": false, "placeholder": "Name of person signing"},
    {"id": "clientTitle", "label": "Client Signatory Title", "type": "text", "required": false, "placeholder": "Title"},
    {"id": "signDate", "label": "Client Sign Date", "type": "date", "required": false, "placeholder": "YYYY-MM-DD"}
  ]'::jsonb
);

-- 2. Consulting Services Agreement (Enhanced)
INSERT INTO default_contract_templates (name, category, description, content, fields) VALUES (
  'Consulting Services Agreement',
  'Consulting',
  'Comprehensive consulting services contract with detailed terms covering scope, deliverables, IP rights, non-compete, and liability protection.',
  'CONSULTING SERVICES AGREEMENT

This Consulting Services Agreement ("Agreement") is made effective as of {{contractDate}} (the "Effective Date") between {{contractorName}}, a {{contractorEntityType}} ("Consultant"), and {{clientName}}, a {{clientEntityType}} ("Client").

WHEREAS, Consultant is engaged in the business of providing consulting services in the field of {{consultingField}}; and
WHEREAS, Client desires to engage Consultant to provide consulting services;

NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, the parties agree as follows:

1. SERVICES
1.1 Consultant agrees to provide the following consulting services (the "Services"):
   - Service Type: {{serviceType}}
   - Scope: {{serviceScope}}
   - Deliverables: {{deliverables}}
   - Duration: {{serviceDuration}}
   - Specific Objectives: {{objectives}}

1.2 Consultant will perform the Services in a professional and workmanlike manner, consistent with industry standards and best practices.

1.3 Consultant will devote such time and attention to the Services as is reasonably necessary to complete the Services in accordance with this Agreement.

2. COMPENSATION
2.1 Client agrees to pay Consultant as follows:
   {{compensationStructure}}

2.2 Payment Terms:
   - Invoices will be submitted {{invoiceFrequency}}
   - Payment is due within {{paymentTerms}} days of invoice date
   - Late payments will incur interest at {{latePaymentInterest}}% per month or the maximum rate allowed by law

2.3 Client is responsible for all applicable taxes, except taxes based on Consultant''s income.

2.4 Consultant is responsible for all expenses unless otherwise agreed in writing.

3. TERM AND TERMINATION
3.1 This Agreement shall commence on {{startDate}} and continue until {{endDate}}, unless earlier terminated in accordance with this Section 3.

3.2 Either party may terminate this Agreement:
   (a) For convenience, upon {{terminationNotice}} days written notice;
   (b) For material breach, if the breaching party fails to cure such breach within {{curePeriod}} days after written notice;
   (c) Immediately upon written notice if the other party becomes insolvent, files for bankruptcy, or makes an assignment for the benefit of creditors.

3.3 Upon termination, Client will pay Consultant for all Services performed and expenses incurred up to the date of termination.

4. INDEPENDENT CONTRACTOR
4.1 Consultant is an independent contractor and not an employee, agent, or partner of Client. Consultant is solely responsible for:
   (a) All federal, state, and local taxes;
   (b) All insurance, including workers'' compensation, disability, and liability insurance;
   (c) All benefits, including health insurance and retirement benefits.

4.2 Consultant has no authority to bind Client or enter into agreements on Client''s behalf.

5. CONFIDENTIALITY
5.1 Consultant agrees to maintain strict confidentiality of all Confidential Information (as defined below) and not to disclose any Confidential Information to third parties without Client''s prior written consent.

5.2 "Confidential Information" includes, but is not limited to:
   (a) Business plans, strategies, and financial information;
   (b) Customer lists, supplier information, and business relationships;
   (c) Technical information, trade secrets, and proprietary processes;
   (d) Any information marked as confidential or which would reasonably be considered confidential.

5.3 This obligation of confidentiality shall survive termination of this Agreement and continue for {{confidentialityPeriod}} years thereafter.

5.4 The confidentiality obligations do not apply to information that:
   (a) Is or becomes publicly available through no breach of this Agreement;
   (b) Was known to Consultant prior to disclosure;
   (c) Is independently developed by Consultant;
   (d) Is required to be disclosed by law or court order.

6. INTELLECTUAL PROPERTY
6.1 All work product, reports, analyses, recommendations, and deliverables created by Consultant in connection with the Services (the "Work Product") shall be the exclusive property of Client upon full payment.

6.2 Consultant hereby assigns to Client all right, title, and interest in and to the Work Product, including all copyrights, patents, trade secrets, and other intellectual property rights.

6.3 Consultant retains the right to use general methodologies, processes, and know-how developed or used in connection with the Services, provided such use does not disclose Client''s Confidential Information.

7. NON-COMPETE AND NON-SOLICITATION
7.1 During the term of this Agreement and for {{nonCompetePeriod}} months thereafter, Consultant agrees not to:
   (a) Provide similar consulting services to direct competitors of Client in {{geographicArea}} without Client''s prior written consent;
   (b) Solicit or accept business from Client''s customers or prospects that Consultant became aware of through the Services.

7.2 During the term of this Agreement and for {{nonSolicitPeriod}} months thereafter, Consultant agrees not to solicit, recruit, or hire any employees or contractors of Client.

8. WARRANTIES AND DISCLAIMERS
8.1 Consultant warrants that:
   (a) The Services will be performed in a professional and workmanlike manner;
   (b) Consultant has the right and authority to enter into this Agreement;
   (c) Consultant will comply with all applicable laws and regulations.

8.2 EXCEPT AS EXPRESSLY SET FORTH IN THIS AGREEMENT, CONSULTANT MAKES NO WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.

8.3 Consultant does not guarantee specific results or outcomes from the Services.

9. LIMITATION OF LIABILITY
9.1 IN NO EVENT SHALL CONSULTANT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION LOSS OF PROFITS, DATA, OR BUSINESS OPPORTUNITIES.

9.2 CONSULTANT''S TOTAL LIABILITY UNDER THIS AGREEMENT SHALL NOT EXCEED THE TOTAL AMOUNT PAID BY CLIENT TO CONSULTANT UNDER THIS AGREEMENT IN THE {{liabilityPeriod}} MONTHS PRECEDING THE CLAIM.

10. INDEMNIFICATION
10.1 Client agrees to indemnify, defend, and hold harmless Consultant from and against any claims, damages, losses, liabilities, and expenses (including reasonable attorneys'' fees) arising out of or relating to:
   (a) Client''s use of the Work Product;
   (b) Client''s breach of this Agreement;
   (c) Any third-party claims arising from Client''s business operations.

11. FORCE MAJEURE
11.1 Neither party shall be liable for any failure or delay in performance due to circumstances beyond its reasonable control, including acts of God, natural disasters, war, terrorism, labor disputes, or government actions.

12. GENERAL PROVISIONS
12.1 Entire Agreement: This Agreement constitutes the entire agreement between the parties and supersedes all prior agreements and understandings.

12.2 Amendment: This Agreement may only be amended in writing and signed by both parties.

12.3 Assignment: Neither party may assign this Agreement without the prior written consent of the other party.

12.4 Governing Law: This Agreement shall be governed by and construed in accordance with the laws of {{governingState}}, without regard to its conflict of law principles.

12.5 Dispute Resolution: Any disputes shall be resolved through {{disputeResolution}} in {{disputeLocation}}.

12.6 Severability: If any provision is held invalid, the remaining provisions shall remain in full force and effect.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the Effective Date.

CONSULTANT:
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
    {"id": "contractDate", "label": "Contract Date (Effective Date)", "type": "date", "required": true, "placeholder": "YYYY-MM-DD"},
    {"id": "contractorName", "label": "Consultant Name", "type": "text", "required": true, "placeholder": "Your Name/Company"},
    {"id": "contractorEntityType", "label": "Consultant Entity Type", "type": "text", "required": false, "placeholder": "e.g., LLC, Corporation"},
    {"id": "clientName", "label": "Client Name", "type": "text", "required": true, "placeholder": "Client Company Name"},
    {"id": "clientEntityType", "label": "Client Entity Type", "type": "text", "required": false, "placeholder": "e.g., LLC, Corporation"},
    {"id": "consultingField", "label": "Consulting Field", "type": "text", "required": true, "placeholder": "e.g., Business Strategy, Marketing, Technology"},
    {"id": "serviceType", "label": "Service Type", "type": "text", "required": true, "placeholder": "e.g., Strategic Planning, Market Analysis"},
    {"id": "serviceScope", "label": "Service Scope", "type": "textarea", "required": true, "placeholder": "Detailed description of services"},
    {"id": "deliverables", "label": "Deliverables", "type": "textarea", "required": true, "placeholder": "List of deliverables"},
    {"id": "serviceDuration", "label": "Service Duration", "type": "text", "required": true, "placeholder": "e.g., 3 months, 6 months"},
    {"id": "objectives", "label": "Specific Objectives", "type": "textarea", "required": false, "placeholder": "Key objectives and goals"},
    {"id": "compensationStructure", "label": "Compensation Structure", "type": "textarea", "required": true, "placeholder": "e.g., Hourly rate: $X, Monthly retainer: $Y, Project fee: $Z"},
    {"id": "invoiceFrequency", "label": "Invoice Frequency", "type": "text", "required": false, "placeholder": "e.g., Monthly, Weekly, Upon completion"},
    {"id": "paymentTerms", "label": "Payment Terms (days)", "type": "number", "required": false, "placeholder": "30"},
    {"id": "latePaymentInterest", "label": "Late Payment Interest Rate (%)", "type": "number", "required": false, "placeholder": "1.5"},
    {"id": "startDate", "label": "Start Date", "type": "date", "required": true, "placeholder": "YYYY-MM-DD"},
    {"id": "endDate", "label": "End Date", "type": "date", "required": true, "placeholder": "YYYY-MM-DD"},
    {"id": "terminationNotice", "label": "Termination Notice (days)", "type": "number", "required": false, "placeholder": "30"},
    {"id": "curePeriod", "label": "Cure Period for Breach (days)", "type": "number", "required": false, "placeholder": "30"},
    {"id": "confidentialityPeriod", "label": "Confidentiality Period (years)", "type": "number", "required": false, "placeholder": "3"},
    {"id": "nonCompetePeriod", "label": "Non-Compete Period (months)", "type": "number", "required": false, "placeholder": "12"},
    {"id": "geographicArea", "label": "Geographic Area for Non-Compete", "type": "text", "required": false, "placeholder": "e.g., United States, State of California"},
    {"id": "nonSolicitPeriod", "label": "Non-Solicitation Period (months)", "type": "number", "required": false, "placeholder": "12"},
    {"id": "liabilityPeriod", "label": "Liability Period (months)", "type": "number", "required": false, "placeholder": "12"},
    {"id": "governingState", "label": "Governing State/Province", "type": "text", "required": false, "placeholder": "State or Province"},
    {"id": "disputeResolution", "label": "Dispute Resolution Method", "type": "text", "required": false, "placeholder": "e.g., binding arbitration"},
    {"id": "disputeLocation", "label": "Dispute Resolution Location", "type": "text", "required": false, "placeholder": "City, State"},
    {"id": "contractorSignatory", "label": "Consultant Signatory Name", "type": "text", "required": false, "placeholder": "Name"},
    {"id": "contractorTitle", "label": "Consultant Signatory Title", "type": "text", "required": false, "placeholder": "Title"},
    {"id": "clientSignatory", "label": "Client Signatory Name", "type": "text", "required": false, "placeholder": "Name"},
    {"id": "clientTitle", "label": "Client Signatory Title", "type": "text", "required": false, "placeholder": "Title"},
    {"id": "signDate", "label": "Client Sign Date", "type": "date", "required": false, "placeholder": "YYYY-MM-DD"}
  ]'::jsonb
);

-- 3. Graphic Design Services Agreement (Enhanced)
INSERT INTO default_contract_templates (name, category, description, content, fields) VALUES (
  'Graphic Design Services Agreement',
  'Design',
  'Comprehensive graphic design contract with detailed IP rights, usage rights, and liability protection for design projects.',
  'GRAPHIC DESIGN SERVICES AGREEMENT

This Graphic Design Services Agreement ("Agreement") is entered into on {{contractDate}} (the "Effective Date") between {{contractorName}}, a {{contractorEntityType}} ("Designer"), and {{clientName}}, a {{clientEntityType}} ("Client").

WHEREAS, Designer is engaged in the business of providing graphic design services; and
WHEREAS, Client desires to engage Designer to create graphic design work;

NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, the parties agree as follows:

1. PROJECT DESCRIPTION
1.1 Project: {{projectName}}
1.2 Design Services: {{designServices}}
1.3 Deliverables: {{deliverables}}
1.4 Project Timeline: {{projectTimeline}}

2. COMPENSATION
2.1 Total Project Fee: ${{totalAmount}}
2.2 Payment Schedule:
   - Deposit: ${{depositAmount}} ({{depositPercentage}}%) due upon execution of this Agreement
   - Final Payment: ${{finalPayment}} ({{finalPaymentPercentage}}%) due upon final delivery and acceptance
2.3 Additional Revisions: ${{revisionRate}} per hour (beyond {{includedRevisions}} included revisions)
2.4 Late payments will incur interest at {{latePaymentInterest}}% per month.

3. DELIVERABLES
3.1 Designer will provide the following:
   {{deliverablesList}}
3.2 Deliverables will be provided in the following formats: {{deliveryFormats}}
3.3 Designer will provide source files upon final payment.

4. REVISIONS
4.1 Client is entitled to {{includedRevisions}} rounds of revisions per deliverable.
4.2 Additional revisions will be billed at the hourly rate specified above.
4.3 Revisions must be requested within {{revisionTimeframe}} days of delivery.

5. INTELLECTUAL PROPERTY RIGHTS
5.1 Upon full payment, Designer hereby assigns to Client all right, title, and interest in and to the final designs, including all copyrights and other intellectual property rights.
5.2 Designer retains the right to:
   (a) Display the work in Designer''s portfolio and marketing materials;
   (b) Use the work for self-promotion;
   (c) Retain ownership of preliminary concepts, sketches, and rejected designs.
5.3 Client represents and warrants that all content, logos, and materials provided to Designer are owned by Client or Client has obtained all necessary rights.

6. USAGE RIGHTS
6.1 Upon full payment, Client receives:
   {{usageRights}}
6.2 Any usage beyond the scope specified above requires additional licensing and compensation.

7. CLIENT RESPONSIBILITIES
7.1 Client agrees to:
   (a) Provide all necessary information, content, and materials in a timely manner;
   (b) Provide timely feedback (within {{feedbackTimeframe}} business days);
   (c) Make payments according to the schedule above;
   (d) Ensure all content provided does not infringe upon any third-party rights.

8. TIMELINE
8.1 Project Start: {{startDate}}
8.2 First Draft Delivery: {{firstDraftDate}}
8.3 Final Delivery: {{completionDate}}
8.4 Delays caused by Client will extend the timeline accordingly.

9. TERMINATION
9.1 Either party may terminate with {{terminationNotice}} days written notice.
9.2 Upon termination, Client will pay for all work completed to date.
9.3 Designer will deliver all completed work to Client.

10. WARRANTIES AND DISCLAIMERS
10.1 Designer warrants that:
    (a) The work is original and does not knowingly infringe upon any third-party rights;
    (b) Designer has the right to enter into this Agreement.
10.2 EXCEPT AS EXPRESSLY SET FORTH, DESIGNER MAKES NO WARRANTIES, EXPRESS OR IMPLIED.

11. LIMITATION OF LIABILITY
11.1 Designer''s total liability shall not exceed the total fees paid under this Agreement.
11.2 Designer is not liable for indirect, incidental, or consequential damages.

12. INDEMNIFICATION
12.1 Client agrees to indemnify Designer from claims arising from Client''s use of the work or content provided by Client.

13. CONFIDENTIALITY
13.1 Both parties agree to maintain confidentiality of proprietary information for {{confidentialityPeriod}} years.

14. GOVERNING LAW
14.1 This Agreement is governed by the laws of {{governingState}}.
14.2 Disputes shall be resolved through {{disputeResolution}} in {{disputeLocation}}.

IN WITNESS WHEREOF, the parties have executed this Agreement.

DESIGNER:
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
    {"id": "contractorName", "label": "Designer Name", "type": "text", "required": true, "placeholder": "Your Name/Company"},
    {"id": "contractorEntityType", "label": "Designer Entity Type", "type": "text", "required": false, "placeholder": "e.g., LLC, Sole Proprietorship"},
    {"id": "clientName", "label": "Client Name", "type": "text", "required": true, "placeholder": "Client Company Name"},
    {"id": "clientEntityType", "label": "Client Entity Type", "type": "text", "required": false, "placeholder": "e.g., LLC, Corporation"},
    {"id": "projectName", "label": "Project Name", "type": "text", "required": true, "placeholder": "e.g., Brand Identity Design"},
    {"id": "designServices", "label": "Design Services", "type": "textarea", "required": true, "placeholder": "Description of design services"},
    {"id": "deliverables", "label": "Deliverables Summary", "type": "textarea", "required": true, "placeholder": "Summary of deliverables"},
    {"id": "deliverablesList", "label": "Detailed Deliverables List", "type": "textarea", "required": false, "placeholder": "Detailed list of all deliverables"},
    {"id": "projectTimeline", "label": "Project Timeline", "type": "text", "required": true, "placeholder": "e.g., 4-6 weeks"},
    {"id": "totalAmount", "label": "Total Amount", "type": "number", "required": true, "placeholder": "0.00"},
    {"id": "depositAmount", "label": "Deposit Amount", "type": "number", "required": false, "placeholder": "0.00"},
    {"id": "depositPercentage", "label": "Deposit Percentage", "type": "number", "required": false, "placeholder": "50"},
    {"id": "finalPayment", "label": "Final Payment Amount", "type": "number", "required": false, "placeholder": "0.00"},
    {"id": "finalPaymentPercentage", "label": "Final Payment Percentage", "type": "number", "required": false, "placeholder": "50"},
    {"id": "revisionRate", "label": "Revision Rate (per hour)", "type": "number", "required": false, "placeholder": "0.00"},
    {"id": "includedRevisions", "label": "Included Revision Rounds", "type": "number", "required": false, "placeholder": "3"},
    {"id": "latePaymentInterest", "label": "Late Payment Interest Rate (%)", "type": "number", "required": false, "placeholder": "1.5"},
    {"id": "deliveryFormats", "label": "Delivery Formats", "type": "text", "required": false, "placeholder": "e.g., AI, PDF, PNG, JPG"},
    {"id": "revisionTimeframe", "label": "Revision Request Timeframe (days)", "type": "number", "required": false, "placeholder": "14"},
    {"id": "usageRights", "label": "Usage Rights Granted", "type": "textarea", "required": false, "placeholder": "e.g., Unlimited commercial use, Print and digital media"},
    {"id": "feedbackTimeframe", "label": "Feedback Timeframe (business days)", "type": "number", "required": false, "placeholder": "5"},
    {"id": "startDate", "label": "Start Date", "type": "date", "required": true, "placeholder": "YYYY-MM-DD"},
    {"id": "firstDraftDate", "label": "First Draft Date", "type": "date", "required": false, "placeholder": "YYYY-MM-DD"},
    {"id": "completionDate", "label": "Completion Date", "type": "date", "required": true, "placeholder": "YYYY-MM-DD"},
    {"id": "terminationNotice", "label": "Termination Notice (days)", "type": "number", "required": false, "placeholder": "30"},
    {"id": "confidentialityPeriod", "label": "Confidentiality Period (years)", "type": "number", "required": false, "placeholder": "3"},
    {"id": "governingState", "label": "Governing State/Province", "type": "text", "required": false, "placeholder": "State or Province"},
    {"id": "disputeResolution", "label": "Dispute Resolution Method", "type": "text", "required": false, "placeholder": "e.g., binding arbitration"},
    {"id": "disputeLocation", "label": "Dispute Resolution Location", "type": "text", "required": false, "placeholder": "City, State"},
    {"id": "contractorSignatory", "label": "Designer Signatory Name", "type": "text", "required": false, "placeholder": "Name"},
    {"id": "contractorTitle", "label": "Designer Signatory Title", "type": "text", "required": false, "placeholder": "Title"},
    {"id": "clientSignatory", "label": "Client Signatory Name", "type": "text", "required": false, "placeholder": "Name"},
    {"id": "clientTitle", "label": "Client Signatory Title", "type": "text", "required": false, "placeholder": "Title"},
    {"id": "signDate", "label": "Client Sign Date", "type": "date", "required": false, "placeholder": "YYYY-MM-DD"}
  ]'::jsonb
);

-- 4. Content Writing Services Agreement (Enhanced)
INSERT INTO default_contract_templates (name, category, description, content, fields) VALUES (
  'Content Writing Services Agreement',
  'Writing',
  'Comprehensive content writing contract with detailed IP rights, originality guarantees, and usage terms.',
  'CONTENT WRITING SERVICES AGREEMENT

This Content Writing Services Agreement ("Agreement") is entered into on {{contractDate}} (the "Effective Date") between {{contractorName}}, a {{contractorEntityType}} ("Writer"), and {{clientName}}, a {{clientEntityType}} ("Client").

WHEREAS, Writer is engaged in the business of providing content writing services; and
WHEREAS, Client desires to engage Writer to create written content;

NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, the parties agree as follows:

1. SERVICES
1.1 Writer agrees to provide the following content writing services (the "Services"):
   - Content Type: {{contentType}}
   - Topics/Subjects: {{contentTopics}}
   - Word Count per Piece: {{wordCount}} words
   - Number of Pieces: {{numberOfPieces}}
   - Deliverables: {{deliverables}}
   - Writing Style: {{writingStyle}}
   - Target Audience: {{targetAudience}}

1.2 Writer will perform the Services in a professional manner, consistent with industry standards.

2. COMPENSATION
2.1 Compensation Structure:
   {{compensationStructure}}
2.2 Payment Terms:
   - Invoices will be submitted {{invoiceFrequency}}
   - Payment is due within {{paymentTerms}} days of invoice date
   - Late payments will incur interest at {{latePaymentInterest}}% per month

3. DEADLINES AND DELIVERY
3.1 Project Start: {{startDate}}
3.2 First Draft Due: {{firstDraftDate}}
3.3 Final Delivery: {{completionDate}}
3.4 Revision Turnaround: {{revisionTimeframe}} business days
3.5 Writer will deliver content via {{deliveryMethod}}

4. REVISIONS
4.1 Client is entitled to {{includedRevisions}} rounds of revisions per piece.
4.2 Additional revisions will be billed at ${{revisionRate}} per hour.
4.3 Revisions must be requested within {{revisionRequestTimeframe}} days of delivery.

5. INTELLECTUAL PROPERTY
5.1 Upon full payment, Writer hereby assigns to Client all right, title, and interest in and to the content, including all copyrights and other intellectual property rights.
5.2 Writer retains the right to:
   (a) Use the work in Writer''s portfolio with attribution;
   (b) Use excerpts for self-promotion (not to exceed {{portfolioExcerptLength}} words per piece).
5.3 Client receives {{usageRights}} license to use the content.

6. ORIGINALITY AND PLAGIARISM
6.1 Writer guarantees that all content is original and will not plagiarize or infringe upon any third-party rights.
6.2 Writer will provide plagiarism reports upon request using {{plagiarismTool}}.
6.3 Writer will cite all sources as required by Client.

7. CLIENT RESPONSIBILITIES
7.1 Client agrees to:
   (a) Provide clear briefs, guidelines, and style guides;
   (b) Provide necessary research materials and access to information;
   (c) Provide timely feedback;
   (d) Make payments according to the schedule;
   (e) Ensure all information provided is accurate and does not infringe upon any third-party rights.

8. FACT-CHECKING AND ACCURACY
8.1 Writer will use reasonable efforts to ensure factual accuracy but relies on information provided by Client.
8.2 Client is responsible for fact-checking and verifying all information before publication.
8.3 Writer is not liable for inaccuracies in information provided by Client.

9. TERMINATION
9.1 Either party may terminate with {{terminationNotice}} days written notice.
9.2 Client will pay for all completed work upon termination.
9.3 Writer will deliver all completed content to Client.

10. WARRANTIES AND DISCLAIMERS
10.1 Writer warrants that:
    (a) The content is original;
    (b) The content does not knowingly infringe upon any third-party rights;
    (c) Writer has the right to enter into this Agreement.
10.2 EXCEPT AS EXPRESSLY SET FORTH, WRITER MAKES NO WARRANTIES, EXPRESS OR IMPLIED.

11. LIMITATION OF LIABILITY
11.1 Writer''s total liability shall not exceed the total fees paid under this Agreement.
11.2 Writer is not liable for indirect, incidental, or consequential damages.

12. INDEMNIFICATION
12.1 Client agrees to indemnify Writer from claims arising from:
    (a) Client''s use of the content;
    (b) Information provided by Client;
    (c) Client''s modifications to the content.

13. CONFIDENTIALITY
13.1 Both parties agree to maintain confidentiality for {{confidentialityPeriod}} years.

14. GOVERNING LAW
14.1 This Agreement is governed by the laws of {{governingState}}.
14.2 Disputes shall be resolved through {{disputeResolution}} in {{disputeLocation}}.

IN WITNESS WHEREOF, the parties have executed this Agreement.

WRITER:
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
    {"id": "contractorName", "label": "Writer Name", "type": "text", "required": true, "placeholder": "Your Name/Company"},
    {"id": "contractorEntityType", "label": "Writer Entity Type", "type": "text", "required": false, "placeholder": "e.g., LLC, Sole Proprietorship"},
    {"id": "clientName", "label": "Client Name", "type": "text", "required": true, "placeholder": "Client Company Name"},
    {"id": "clientEntityType", "label": "Client Entity Type", "type": "text", "required": false, "placeholder": "e.g., LLC, Corporation"},
    {"id": "contentType", "label": "Content Type", "type": "text", "required": true, "placeholder": "e.g., Blog posts, Articles, Web copy"},
    {"id": "contentTopics", "label": "Content Topics", "type": "textarea", "required": true, "placeholder": "List of topics/subjects"},
    {"id": "wordCount", "label": "Word Count per Piece", "type": "number", "required": true, "placeholder": "0"},
    {"id": "numberOfPieces", "label": "Number of Pieces", "type": "number", "required": true, "placeholder": "0"},
    {"id": "deliverables", "label": "Deliverables", "type": "textarea", "required": true, "placeholder": "List of deliverables"},
    {"id": "writingStyle", "label": "Writing Style", "type": "text", "required": false, "placeholder": "e.g., Professional, Casual, Technical"},
    {"id": "targetAudience", "label": "Target Audience", "type": "textarea", "required": false, "placeholder": "Target audience description"},
    {"id": "compensationStructure", "label": "Compensation Structure", "type": "textarea", "required": true, "placeholder": "e.g., Rate per word: $X, Rate per article: $Y, Total: $Z"},
    {"id": "invoiceFrequency", "label": "Invoice Frequency", "type": "text", "required": false, "placeholder": "e.g., Per article, Weekly, Monthly"},
    {"id": "paymentTerms", "label": "Payment Terms (days)", "type": "number", "required": false, "placeholder": "30"},
    {"id": "latePaymentInterest", "label": "Late Payment Interest Rate (%)", "type": "number", "required": false, "placeholder": "1.5"},
    {"id": "startDate", "label": "Start Date", "type": "date", "required": true, "placeholder": "YYYY-MM-DD"},
    {"id": "firstDraftDate", "label": "First Draft Date", "type": "date", "required": false, "placeholder": "YYYY-MM-DD"},
    {"id": "completionDate", "label": "Completion Date", "type": "date", "required": true, "placeholder": "YYYY-MM-DD"},
    {"id": "revisionTimeframe", "label": "Revision Timeframe (business days)", "type": "number", "required": false, "placeholder": "3"},
    {"id": "deliveryMethod", "label": "Delivery Method", "type": "text", "required": false, "placeholder": "e.g., Email, Google Docs, CMS"},
    {"id": "includedRevisions", "label": "Included Revision Rounds", "type": "number", "required": false, "placeholder": "2"},
    {"id": "revisionRate", "label": "Revision Rate (per hour)", "type": "number", "required": false, "placeholder": "0.00"},
    {"id": "revisionRequestTimeframe", "label": "Revision Request Timeframe (days)", "type": "number", "required": false, "placeholder": "14"},
    {"id": "portfolioExcerptLength", "label": "Portfolio Excerpt Length (words)", "type": "number", "required": false, "placeholder": "100"},
    {"id": "usageRights", "label": "Usage Rights", "type": "text", "required": false, "placeholder": "e.g., Exclusive, Non-exclusive, Unlimited"},
    {"id": "plagiarismTool", "label": "Plagiarism Tool", "type": "text", "required": false, "placeholder": "e.g., Copyscape, Grammarly"},
    {"id": "terminationNotice", "label": "Termination Notice (days)", "type": "number", "required": false, "placeholder": "30"},
    {"id": "confidentialityPeriod", "label": "Confidentiality Period (years)", "type": "number", "required": false, "placeholder": "3"},
    {"id": "governingState", "label": "Governing State/Province", "type": "text", "required": false, "placeholder": "State or Province"},
    {"id": "disputeResolution", "label": "Dispute Resolution Method", "type": "text", "required": false, "placeholder": "e.g., binding arbitration"},
    {"id": "disputeLocation", "label": "Dispute Resolution Location", "type": "text", "required": false, "placeholder": "City, State"},
    {"id": "contractorSignatory", "label": "Writer Signatory Name", "type": "text", "required": false, "placeholder": "Name"},
    {"id": "contractorTitle", "label": "Writer Signatory Title", "type": "text", "required": false, "placeholder": "Title"},
    {"id": "clientSignatory", "label": "Client Signatory Name", "type": "text", "required": false, "placeholder": "Name"},
    {"id": "clientTitle", "label": "Client Signatory Title", "type": "text", "required": false, "placeholder": "Title"},
    {"id": "signDate", "label": "Client Sign Date", "type": "date", "required": false, "placeholder": "YYYY-MM-DD"}
  ]'::jsonb
);

-- 5. Software Development Agreement (Enhanced)
INSERT INTO default_contract_templates (name, category, description, content, fields) VALUES (
  'Software Development Agreement',
  'Software',
  'Comprehensive software development contract with detailed IP rights, source code provisions, warranties, and maintenance terms.',
  'SOFTWARE DEVELOPMENT AGREEMENT

This Software Development Agreement ("Agreement") is entered into on {{contractDate}} (the "Effective Date") between {{contractorName}}, a {{contractorEntityType}} ("Developer"), and {{clientName}}, a {{clientEntityType}} ("Client").

WHEREAS, Developer is engaged in the business of software development; and
WHEREAS, Client desires to engage Developer to develop custom software;

NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, the parties agree as follows:

1. PROJECT SCOPE
1.1 Project Name: {{projectName}}
1.2 Software Type: {{softwareType}}
1.3 Platform: {{platform}}
1.4 Features and Functionality: {{featuresList}}
1.5 Deliverables: {{deliverables}}
1.6 Technical Specifications: {{technicalSpecs}}

2. DEVELOPMENT PHASES
2.1 Phase 1 - Planning & Design: {{phase1Timeline}} ({{phase1Deliverables}})
2.2 Phase 2 - Development: {{phase2Timeline}} ({{phase2Deliverables}})
2.3 Phase 3 - Testing & QA: {{phase3Timeline}} ({{phase3Deliverables}})
2.4 Phase 4 - Deployment: {{phase4Timeline}} ({{phase4Deliverables}})

3. COMPENSATION
3.1 Total Project Cost: ${{totalAmount}}
3.2 Payment Schedule:
   - Deposit ({{depositPercentage}}%): ${{depositAmount}} due upon execution
   - Milestone 1 ({{milestone1Percentage}}%): ${{milestone1Amount}} due upon {{milestone1Date}} or completion of {{milestone1Deliverable}}
   - Milestone 2 ({{milestone2Percentage}}%): ${{milestone2Amount}} due upon {{milestone2Date}} or completion of {{milestone2Deliverable}}
   - Final Payment ({{finalPaymentPercentage}}%): ${{finalPayment}} due upon completion and acceptance
3.3 Late payments will incur interest at {{latePaymentInterest}}% per month.

4. INTELLECTUAL PROPERTY RIGHTS
4.1 Upon full payment, Developer hereby assigns to Client all right, title, and interest in and to the custom software code developed for this project, including all copyrights, patents, and other intellectual property rights.
4.2 Developer retains rights to:
   (a) Reusable code libraries, frameworks, and tools;
   (b) Third-party components and licenses (subject to their respective licenses);
   (c) General methodologies, processes, and know-how;
   (d) The right to use the project in Developer''s portfolio.
4.3 Client is responsible for all third-party licensing fees and ongoing costs.

5. SOURCE CODE AND DOCUMENTATION
5.1 Developer will provide:
   (a) Complete source code in {{sourceCodeFormat}};
   (b) Technical documentation;
   (c) User documentation;
   (d) Deployment instructions;
   (e) Database schemas and API documentation.
5.2 Source code will be delivered via {{sourceCodeDeliveryMethod}}.

6. TESTING AND QUALITY ASSURANCE
6.1 Developer will conduct thorough testing including: {{testingTypes}}
6.2 Client will have {{testingPeriod}} days for acceptance testing.
6.3 Bugs discovered during the warranty period will be fixed at no additional cost.
6.4 Client is responsible for testing in their production environment.

7. HOSTING AND DEPLOYMENT
7.1 {{hostingArrangements}}
7.2 Client is responsible for:
   (a) Hosting services and costs;
   (b) Domain registration;
   (c) SSL certificates;
   (d) Backup services.

8. MAINTENANCE AND SUPPORT
8.1 Warranty Period: {{warrantyPeriod}} days (bug fixes included)
8.2 Post-Warranty Support Options:
   (a) Hourly Support: ${{supportRate}} per hour
   (b) Monthly Support Plan: ${{monthlySupportFee}} per month (includes {{monthlySupportHours}} hours)
8.3 Support does not include new features or major enhancements.

9. THIRD-PARTY SERVICES AND LICENSES
9.1 Client is responsible for costs associated with:
   (a) Hosting services;
   (b) Domain registration;
   (c) Third-party API fees;
   (d) Software licenses;
   (e) Payment processing fees.

10. CLIENT RESPONSIBILITIES
10.1 Client agrees to:
    (a) Provide timely feedback and approvals (within {{feedbackTimeframe}} business days);
    (b) Provide necessary content, materials, and access;
    (c) Make timely payments;
    (d) Test and provide feedback within agreed timeframes;
    (e) Provide access to necessary accounts and systems.

11. TIMELINE
11.1 Project Start: {{startDate}}
11.2 Expected Completion: {{completionDate}}
11.3 Launch Date: {{launchDate}}
11.4 Delays caused by Client will extend the timeline accordingly.

12. CHANGE REQUESTS
12.1 Scope changes require written approval and may affect timeline and cost.
12.2 Change requests will be billed at ${{changeRequestRate}} per hour or as agreed in writing.
12.3 Developer will provide estimates for change requests before commencing work.

13. TERMINATION
13.1 Either party may terminate with {{terminationNotice}} days written notice.
13.2 Client will pay for all work completed to date upon termination.
13.3 Developer will deliver all completed work and source code to Client.

14. WARRANTIES AND DISCLAIMERS
14.1 Developer warrants that:
    (a) The software will function as specified in the agreed scope;
    (b) The software will be free from material defects for the warranty period;
    (c) Developer has the right to enter into this Agreement.
14.2 EXCEPT AS EXPRESSLY SET FORTH, DEVELOPER MAKES NO WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.

15. LIMITATION OF LIABILITY
15.1 Developer''s total liability shall not exceed the total fees paid under this Agreement.
15.2 Developer is not liable for indirect, incidental, special, or consequential damages.

16. INDEMNIFICATION
16.1 Client agrees to indemnify Developer from claims arising from Client''s use of the software or third-party services.

17. DATA PROTECTION AND SECURITY
17.1 Developer will implement reasonable security measures but does not guarantee absolute security.
17.2 Client is responsible for:
    (a) Data backups;
    (b) User access management;
    (c) Compliance with data protection laws.

18. GOVERNING LAW
18.1 This Agreement is governed by the laws of {{governingState}}.
18.2 Disputes shall be resolved through {{disputeResolution}} in {{disputeLocation}}.

IN WITNESS WHEREOF, the parties have executed this Agreement.

DEVELOPER:
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
    {"id": "contractorName", "label": "Developer Name", "type": "text", "required": true, "placeholder": "Your Name/Company"},
    {"id": "contractorEntityType", "label": "Developer Entity Type", "type": "text", "required": false, "placeholder": "e.g., LLC, Corporation"},
    {"id": "clientName", "label": "Client Name", "type": "text", "required": true, "placeholder": "Client Company Name"},
    {"id": "clientEntityType", "label": "Client Entity Type", "type": "text", "required": false, "placeholder": "e.g., LLC, Corporation"},
    {"id": "projectName", "label": "Project Name", "type": "text", "required": true, "placeholder": "Software Project Name"},
    {"id": "softwareType", "label": "Software Type", "type": "text", "required": true, "placeholder": "e.g., Web Application, Mobile App, Desktop"},
    {"id": "platform", "label": "Platform", "type": "text", "required": true, "placeholder": "e.g., Web, iOS, Android, Windows"},
    {"id": "featuresList", "label": "Features and Functionality", "type": "textarea", "required": true, "placeholder": "Detailed list of features"},
    {"id": "deliverables", "label": "Deliverables", "type": "textarea", "required": true, "placeholder": "List of deliverables"},
    {"id": "technicalSpecs", "label": "Technical Specifications", "type": "textarea", "required": false, "placeholder": "Technical requirements"},
    {"id": "phase1Timeline", "label": "Phase 1 Timeline", "type": "text", "required": false, "placeholder": "e.g., 2 weeks"},
    {"id": "phase1Deliverables", "label": "Phase 1 Deliverables", "type": "text", "required": false, "placeholder": "e.g., Wireframes, Design mockups"},
    {"id": "phase2Timeline", "label": "Phase 2 Timeline", "type": "text", "required": false, "placeholder": "e.g., 6 weeks"},
    {"id": "phase2Deliverables", "label": "Phase 2 Deliverables", "type": "text", "required": false, "placeholder": "e.g., Core functionality"},
    {"id": "phase3Timeline", "label": "Phase 3 Timeline", "type": "text", "required": false, "placeholder": "e.g., 2 weeks"},
    {"id": "phase3Deliverables", "label": "Phase 3 Deliverables", "type": "text", "required": false, "placeholder": "e.g., Testing complete"},
    {"id": "phase4Timeline", "label": "Phase 4 Timeline", "type": "text", "required": false, "placeholder": "e.g., 1 week"},
    {"id": "phase4Deliverables", "label": "Phase 4 Deliverables", "type": "text", "required": false, "placeholder": "e.g., Deployment"},
    {"id": "totalAmount", "label": "Total Amount", "type": "number", "required": true, "placeholder": "0.00"},
    {"id": "depositAmount", "label": "Deposit Amount", "type": "number", "required": false, "placeholder": "0.00"},
    {"id": "depositPercentage", "label": "Deposit Percentage", "type": "number", "required": false, "placeholder": "30"},
    {"id": "milestone1Amount", "label": "Milestone 1 Amount", "type": "number", "required": false, "placeholder": "0.00"},
    {"id": "milestone1Percentage", "label": "Milestone 1 Percentage", "type": "number", "required": false, "placeholder": "30"},
    {"id": "milestone1Date", "label": "Milestone 1 Date", "type": "date", "required": false, "placeholder": "YYYY-MM-DD"},
    {"id": "milestone1Deliverable", "label": "Milestone 1 Deliverable", "type": "text", "required": false, "placeholder": "e.g., Design approval"},
    {"id": "milestone2Amount", "label": "Milestone 2 Amount", "type": "number", "required": false, "placeholder": "0.00"},
    {"id": "milestone2Percentage", "label": "Milestone 2 Percentage", "type": "number", "required": false, "placeholder": "30"},
    {"id": "milestone2Date", "label": "Milestone 2 Date", "type": "date", "required": false, "placeholder": "YYYY-MM-DD"},
    {"id": "milestone2Deliverable", "label": "Milestone 2 Deliverable", "type": "text", "required": false, "placeholder": "e.g., Development complete"},
    {"id": "finalPayment", "label": "Final Payment Amount", "type": "number", "required": false, "placeholder": "0.00"},
    {"id": "finalPaymentPercentage", "label": "Final Payment Percentage", "type": "number", "required": false, "placeholder": "10"},
    {"id": "latePaymentInterest", "label": "Late Payment Interest Rate (%)", "type": "number", "required": false, "placeholder": "1.5"},
    {"id": "sourceCodeFormat", "label": "Source Code Format", "type": "text", "required": false, "placeholder": "e.g., Git repository, ZIP file"},
    {"id": "sourceCodeDeliveryMethod", "label": "Source Code Delivery Method", "type": "text", "required": false, "placeholder": "e.g., GitHub, Bitbucket, Email"},
    {"id": "testingTypes", "label": "Testing Types", "type": "textarea", "required": false, "placeholder": "e.g., Unit testing, Integration testing, User acceptance testing"},
    {"id": "testingPeriod", "label": "Testing Period (days)", "type": "number", "required": false, "placeholder": "14"},
    {"id": "hostingArrangements", "label": "Hosting Arrangements", "type": "textarea", "required": false, "placeholder": "Hosting and deployment details"},
    {"id": "warrantyPeriod", "label": "Warranty Period (days)", "type": "number", "required": false, "placeholder": "90"},
    {"id": "supportRate", "label": "Support Rate (per hour)", "type": "number", "required": false, "placeholder": "0.00"},
    {"id": "monthlySupportFee", "label": "Monthly Support Fee", "type": "number", "required": false, "placeholder": "0.00"},
    {"id": "monthlySupportHours", "label": "Monthly Support Hours Included", "type": "number", "required": false, "placeholder": "0"},
    {"id": "feedbackTimeframe", "label": "Feedback Timeframe (business days)", "type": "number", "required": false, "placeholder": "5"},
    {"id": "startDate", "label": "Start Date", "type": "date", "required": true, "placeholder": "YYYY-MM-DD"},
    {"id": "completionDate", "label": "Completion Date", "type": "date", "required": true, "placeholder": "YYYY-MM-DD"},
    {"id": "launchDate", "label": "Launch Date", "type": "date", "required": false, "placeholder": "YYYY-MM-DD"},
    {"id": "changeRequestRate", "label": "Change Request Rate (per hour)", "type": "number", "required": false, "placeholder": "0.00"},
    {"id": "terminationNotice", "label": "Termination Notice (days)", "type": "number", "required": false, "placeholder": "30"},
    {"id": "governingState", "label": "Governing State/Province", "type": "text", "required": false, "placeholder": "State or Province"},
    {"id": "disputeResolution", "label": "Dispute Resolution Method", "type": "text", "required": false, "placeholder": "e.g., binding arbitration"},
    {"id": "disputeLocation", "label": "Dispute Resolution Location", "type": "text", "required": false, "placeholder": "City, State"},
    {"id": "contractorSignatory", "label": "Developer Signatory Name", "type": "text", "required": false, "placeholder": "Name"},
    {"id": "contractorTitle", "label": "Developer Signatory Title", "type": "text", "required": false, "placeholder": "Title"},
    {"id": "clientSignatory", "label": "Client Signatory Name", "type": "text", "required": false, "placeholder": "Name"},
    {"id": "clientTitle", "label": "Client Signatory Title", "type": "text", "required": false, "placeholder": "Title"},
    {"id": "signDate", "label": "Client Sign Date", "type": "date", "required": false, "placeholder": "YYYY-MM-DD"}
  ]'::jsonb
);

-- 6. General Service Agreement (Enhanced)
INSERT INTO default_contract_templates (name, category, description, content, fields) VALUES (
  'General Service Agreement',
  'General',
  'Comprehensive, flexible service agreement template suitable for various service-based businesses with detailed legal protections.',
  'SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into on {{contractDate}} (the "Effective Date") between {{contractorName}}, a {{contractorEntityType}} ("Service Provider"), and {{clientName}}, a {{clientEntityType}} ("Client").

WHEREAS, Service Provider is engaged in the business of providing {{serviceType}} services; and
WHEREAS, Client desires to engage Service Provider to provide such services;

NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, the parties agree as follows:

1. SERVICES TO BE PROVIDED
1.1 Service Provider agrees to provide the following services (the "Services"):
   {{serviceDescription}}

1.2 Service Provider will perform the Services in a professional and workmanlike manner, consistent with industry standards.

2. COMPENSATION
2.1 Service Fee: ${{totalAmount}}
2.2 Payment Schedule: {{paymentSchedule}}
2.3 Payment Terms:
   - Payment is due within {{paymentTerms}} days of invoice date
   - Late Payment Fee: {{latePaymentFee}}% per month on overdue amounts
   - Client is responsible for all applicable taxes, except taxes based on Service Provider''s income

3. TERM
3.1 This Agreement shall commence on {{startDate}} and continue until {{endDate}} or completion of services, whichever occurs first.
3.2 This Agreement may be extended by mutual written agreement.

4. DELIVERABLES
4.1 Service Provider will deliver the following:
   {{deliverables}}

5. TIMELINE
5.1 Project Start: {{startDate}}
5.2 Expected Completion: {{completionDate}}
5.3 Milestones: {{milestones}}
5.4 Delays caused by Client will extend the timeline accordingly.

6. PAYMENT TERMS
6.1 Deposit: ${{depositAmount}} ({{depositPercentage}}%) due upon execution of this Agreement
6.2 Progress Payments: {{progressPayments}}
6.3 Final Payment: ${{finalPayment}} ({{finalPaymentPercentage}}%) due upon completion and acceptance

7. INDEPENDENT CONTRACTOR
7.1 Service Provider is an independent contractor and not an employee, agent, or partner of Client.
7.2 Service Provider is solely responsible for:
   (a) All federal, state, and local taxes;
   (b) All insurance, including workers'' compensation, disability, and liability insurance;
   (c) All benefits.

8. CONFIDENTIALITY
8.1 Both parties agree to maintain confidentiality of all Confidential Information (as defined below) for {{confidentialityPeriod}} years.
8.2 "Confidential Information" includes business plans, financial information, customer lists, technical information, and any information marked as confidential.
8.3 This obligation survives termination of this Agreement.

9. INTELLECTUAL PROPERTY
9.1 Upon full payment, ownership of work product created specifically for this project transfers to Client.
9.2 Service Provider retains:
   (a) Portfolio rights;
   (b) Rights to general methodologies and processes;
   (c) Rights to pre-existing materials.

10. TERMINATION
10.1 Either party may terminate this Agreement:
    (a) For convenience, upon {{terminationNotice}} days written notice;
    (b) For material breach, if the breaching party fails to cure such breach within {{curePeriod}} days after written notice.
10.2 Upon termination, Client will pay for all services rendered to date.

11. WARRANTIES
11.1 Service Provider warrants that services will be performed in a professional manner and in accordance with industry standards.
11.2 EXCEPT AS EXPRESSLY SET FORTH, SERVICE PROVIDER MAKES NO WARRANTIES, EXPRESS OR IMPLIED.

12. LIMITATION OF LIABILITY
12.1 Service Provider''s total liability shall not exceed the total fees paid under this Agreement.
12.2 Service Provider is not liable for indirect, incidental, special, or consequential damages.

13. INDEMNIFICATION
13.1 Client agrees to indemnify Service Provider from claims arising from Client''s use of the work product or breach of this Agreement.

14. FORCE MAJEURE
14.1 Neither party shall be liable for failure or delay due to circumstances beyond reasonable control.

15. GENERAL PROVISIONS
15.1 Entire Agreement: This Agreement constitutes the entire understanding between the parties.
15.2 Amendment: This Agreement may only be amended in writing.
15.3 Assignment: Neither party may assign without prior written consent.
15.4 Severability: If any provision is invalid, the remaining provisions remain in effect.
15.5 Governing Law: This Agreement is governed by the laws of {{governingState}}.
15.6 Dispute Resolution: Disputes shall be resolved through {{disputeResolution}} in {{disputeLocation}}.

IN WITNESS WHEREOF, the parties have executed this Agreement.

SERVICE PROVIDER:
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
    {"id": "contractorName", "label": "Service Provider Name", "type": "text", "required": true, "placeholder": "Your Name/Company"},
    {"id": "contractorEntityType", "label": "Service Provider Entity Type", "type": "text", "required": false, "placeholder": "e.g., LLC, Corporation"},
    {"id": "clientName", "label": "Client Name", "type": "text", "required": true, "placeholder": "Client Company Name"},
    {"id": "clientEntityType", "label": "Client Entity Type", "type": "text", "required": false, "placeholder": "e.g., LLC, Corporation"},
    {"id": "serviceType", "label": "Service Type", "type": "text", "required": true, "placeholder": "e.g., Marketing, Consulting, Design"},
    {"id": "serviceDescription", "label": "Service Description", "type": "textarea", "required": true, "placeholder": "Detailed description of services"},
    {"id": "totalAmount", "label": "Total Amount", "type": "number", "required": true, "placeholder": "0.00"},
    {"id": "paymentSchedule", "label": "Payment Schedule", "type": "textarea", "required": false, "placeholder": "Payment terms and schedule"},
    {"id": "paymentTerms", "label": "Payment Terms (days)", "type": "number", "required": false, "placeholder": "15"},
    {"id": "latePaymentFee", "label": "Late Payment Fee (%)", "type": "number", "required": false, "placeholder": "1.5"},
    {"id": "startDate", "label": "Start Date", "type": "date", "required": true, "placeholder": "YYYY-MM-DD"},
    {"id": "endDate", "label": "End Date", "type": "date", "required": true, "placeholder": "YYYY-MM-DD"},
    {"id": "deliverables", "label": "Deliverables", "type": "textarea", "required": true, "placeholder": "List of deliverables"},
    {"id": "completionDate", "label": "Completion Date", "type": "date", "required": true, "placeholder": "YYYY-MM-DD"},
    {"id": "milestones", "label": "Project Milestones", "type": "textarea", "required": false, "placeholder": "Key milestones"},
    {"id": "depositAmount", "label": "Deposit Amount", "type": "number", "required": false, "placeholder": "0.00"},
    {"id": "depositPercentage", "label": "Deposit Percentage", "type": "number", "required": false, "placeholder": "30"},
    {"id": "progressPayments", "label": "Progress Payments", "type": "textarea", "required": false, "placeholder": "Progress payment schedule"},
    {"id": "finalPayment", "label": "Final Payment Amount", "type": "number", "required": false, "placeholder": "0.00"},
    {"id": "finalPaymentPercentage", "label": "Final Payment Percentage", "type": "number", "required": false, "placeholder": "70"},
    {"id": "confidentialityPeriod", "label": "Confidentiality Period (years)", "type": "number", "required": false, "placeholder": "3"},
    {"id": "terminationNotice", "label": "Termination Notice (days)", "type": "number", "required": false, "placeholder": "30"},
    {"id": "curePeriod", "label": "Cure Period for Breach (days)", "type": "number", "required": false, "placeholder": "30"},
    {"id": "governingState", "label": "Governing State/Province", "type": "text", "required": false, "placeholder": "State or Province"},
    {"id": "disputeResolution", "label": "Dispute Resolution Method", "type": "text", "required": false, "placeholder": "e.g., binding arbitration"},
    {"id": "disputeLocation", "label": "Dispute Resolution Location", "type": "text", "required": false, "placeholder": "City, State"},
    {"id": "contractorSignatory", "label": "Service Provider Signatory Name", "type": "text", "required": false, "placeholder": "Name"},
    {"id": "contractorTitle", "label": "Service Provider Signatory Title", "type": "text", "required": false, "placeholder": "Title"},
    {"id": "clientSignatory", "label": "Client Signatory Name", "type": "text", "required": false, "placeholder": "Name"},
    {"id": "clientTitle", "label": "Client Signatory Title", "type": "text", "required": false, "placeholder": "Title"},
    {"id": "signDate", "label": "Client Sign Date", "type": "date", "required": false, "placeholder": "YYYY-MM-DD"}
  ]'::jsonb
);

-- 7. Non-Disclosure Agreement (NDA)
INSERT INTO default_contract_templates (name, category, description, content, fields) VALUES (
  'Non-Disclosure Agreement (NDA)',
  'Legal',
  'Comprehensive mutual or one-way non-disclosure agreement to protect confidential information.',
  'NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into on {{contractDate}} (the "Effective Date") between {{disclosingPartyName}}, a {{disclosingPartyEntityType}} ("Disclosing Party"), and {{receivingPartyName}}, a {{receivingPartyEntityType}} ("Receiving Party").

WHEREAS, the parties desire to engage in discussions regarding {{purposeOfDisclosure}}; and
WHEREAS, in connection with such discussions, Disclosing Party may disclose Confidential Information to Receiving Party;

NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, the parties agree as follows:

1. DEFINITION OF CONFIDENTIAL INFORMATION
1.1 "Confidential Information" means all non-public, proprietary, or confidential information disclosed by Disclosing Party to Receiving Party, whether orally, in writing, or in any other form, including but not limited to:
   (a) Business plans, strategies, and financial information;
   (b) Customer lists, supplier information, and business relationships;
   (c) Technical information, trade secrets, know-how, and proprietary processes;
   (d) Product designs, specifications, and development plans;
   (e) Marketing plans, sales data, and pricing information;
   (f) Any information marked as "Confidential" or which would reasonably be considered confidential.

1.2 Confidential Information does not include information that:
   (a) Is or becomes publicly available through no breach of this Agreement;
   (b) Was known to Receiving Party prior to disclosure;
   (c) Is independently developed by Receiving Party without use of Confidential Information;
   (d) Is rightfully received from a third party without breach of any confidentiality obligation;
   (e) Is required to be disclosed by law or court order (subject to Section 3.3).

2. OBLIGATIONS OF RECEIVING PARTY
2.1 Receiving Party agrees to:
   (a) Hold and maintain all Confidential Information in strict confidence;
   (b) Not disclose any Confidential Information to any third party without Disclosing Party''s prior written consent;
   (c) Use Confidential Information solely for the purpose of {{permittedUse}};
   (d) Take reasonable precautions to protect the confidentiality of Confidential Information;
   (e) Not use Confidential Information for any purpose other than the permitted use;
   (f) Not reverse engineer, decompile, or disassemble any Confidential Information.

2.2 Receiving Party may disclose Confidential Information only to:
   (a) Employees, directors, officers, and advisors who have a need to know and who are bound by confidentiality obligations at least as restrictive as those in this Agreement;
   (b) With Disclosing Party''s prior written consent.

3. EXCEPTIONS
3.1 The obligations in Section 2 do not apply to information that falls within the exceptions in Section 1.2.

3.2 If Receiving Party is required by law or court order to disclose Confidential Information, Receiving Party will:
   (a) Provide Disclosing Party with prompt written notice;
   (b) Cooperate with Disclosing Party to obtain a protective order or other appropriate remedy;
   (c) Disclose only the minimum amount of Confidential Information necessary to comply with the legal requirement.

4. RETURN OF CONFIDENTIAL INFORMATION
4.1 Upon termination of this Agreement or upon Disclosing Party''s written request, Receiving Party will:
   (a) Return all documents and materials containing Confidential Information;
   (b) Delete all electronic copies of Confidential Information;
   (c) Certify in writing that all Confidential Information has been returned or destroyed.

5. TERM
5.1 This Agreement shall remain in effect for {{agreementTerm}} years from the Effective Date, unless earlier terminated by mutual written agreement.

5.2 The obligations of confidentiality shall survive termination of this Agreement and continue for {{confidentialityPeriod}} years after the date of last disclosure of Confidential Information.

6. NO LICENSE OR WARRANTY
6.1 This Agreement does not grant Receiving Party any license or right to use any Confidential Information except as expressly set forth herein.

6.2 Disclosing Party makes no warranty as to the accuracy or completeness of Confidential Information.

7. REMEDIES
7.1 Receiving Party acknowledges that breach of this Agreement would cause irreparable harm to Disclosing Party for which monetary damages would be inadequate.

7.2 Disclosing Party shall be entitled to:
   (a) Injunctive relief and other equitable remedies;
   (b) Monetary damages;
   (c) Recovery of attorneys'' fees and costs.

8. GENERAL PROVISIONS
8.1 This Agreement is governed by the laws of {{governingState}}.

8.2 Disputes shall be resolved through {{disputeResolution}} in {{disputeLocation}}.

8.3 This Agreement may not be assigned without prior written consent.

8.4 This Agreement constitutes the entire agreement between the parties regarding confidentiality.

8.5 This Agreement may only be amended in writing signed by both parties.

IN WITNESS WHEREOF, the parties have executed this Agreement.

DISCLOSING PARTY:
{{disclosingPartyName}}
By: _________________________
Name: {{disclosingPartySignatory}}
Title: {{disclosingPartyTitle}}
Date: {{contractDate}}

RECEIVING PARTY:
{{receivingPartyName}}
By: _________________________
Name: {{receivingPartySignatory}}
Title: {{receivingPartyTitle}}
Date: {{signDate}}',
  '[
    {"id": "contractDate", "label": "Contract Date", "type": "date", "required": true, "placeholder": "YYYY-MM-DD"},
    {"id": "disclosingPartyName", "label": "Disclosing Party Name", "type": "text", "required": true, "placeholder": "Company/Person Name"},
    {"id": "disclosingPartyEntityType", "label": "Disclosing Party Entity Type", "type": "text", "required": false, "placeholder": "e.g., LLC, Corporation"},
    {"id": "receivingPartyName", "label": "Receiving Party Name", "type": "text", "required": true, "placeholder": "Company/Person Name"},
    {"id": "receivingPartyEntityType", "label": "Receiving Party Entity Type", "type": "text", "required": false, "placeholder": "e.g., LLC, Corporation"},
    {"id": "purposeOfDisclosure", "label": "Purpose of Disclosure", "type": "textarea", "required": true, "placeholder": "e.g., Evaluation of potential business relationship"},
    {"id": "permittedUse", "label": "Permitted Use", "type": "textarea", "required": true, "placeholder": "Purpose for which Confidential Information may be used"},
    {"id": "agreementTerm", "label": "Agreement Term (years)", "type": "number", "required": false, "placeholder": "3"},
    {"id": "confidentialityPeriod", "label": "Confidentiality Period (years)", "type": "number", "required": false, "placeholder": "5"},
    {"id": "governingState", "label": "Governing State/Province", "type": "text", "required": false, "placeholder": "State or Province"},
    {"id": "disputeResolution", "label": "Dispute Resolution Method", "type": "text", "required": false, "placeholder": "e.g., binding arbitration"},
    {"id": "disputeLocation", "label": "Dispute Resolution Location", "type": "text", "required": false, "placeholder": "City, State"},
    {"id": "disclosingPartySignatory", "label": "Disclosing Party Signatory Name", "type": "text", "required": false, "placeholder": "Name"},
    {"id": "disclosingPartyTitle", "label": "Disclosing Party Signatory Title", "type": "text", "required": false, "placeholder": "Title"},
    {"id": "receivingPartySignatory", "label": "Receiving Party Signatory Name", "type": "text", "required": false, "placeholder": "Name"},
    {"id": "receivingPartyTitle", "label": "Receiving Party Signatory Title", "type": "text", "required": false, "placeholder": "Title"},
    {"id": "signDate", "label": "Receiving Party Sign Date", "type": "date", "required": false, "placeholder": "YYYY-MM-DD"}
  ]'::jsonb
);

-- Create RLS policies for default_contract_templates (read-only for all authenticated users)
ALTER TABLE default_contract_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Default templates are viewable by all authenticated users"
  ON default_contract_templates
  FOR SELECT
  TO authenticated
  USING (true);
