-- Add proposal templates to default_contract_templates
-- These are templates where the contractor offers to pay the client (proposal contracts)

-- 1. Service Proposal Template
INSERT INTO default_contract_templates (name, category, description, content, fields, contract_type) VALUES (
  'Service Proposal',
  'Proposals',
  'Professional proposal template for offering services with compensation to the client. Perfect for partnerships, collaborations, or service offerings.',
  'SERVICE PROPOSAL

This Service Proposal ("Proposal") is submitted on {{proposalDate}} (the "Effective Date") by {{contractorName}}, a {{contractorEntityType}} ("Service Provider"), to {{clientName}}, a {{clientEntityType}} ("Client").

WHEREAS, Service Provider is engaged in the business of providing {{serviceType}} services; and
WHEREAS, Service Provider desires to offer services to Client with compensation;

NOW, THEREFORE, Service Provider proposes the following:

1. PROPOSED SERVICES
1.1 Service Provider proposes to provide the following services (the "Services"):
   - Service Type: {{serviceType}}
   - Service Description: {{serviceDescription}}
   - Deliverables: {{deliverables}}
   - Project Duration: {{projectDuration}}

1.2 Service Provider will perform the Services in a professional and workmanlike manner, consistent with industry standards.

1.3 Any changes to the scope of Services must be agreed upon in writing by both parties and may result in adjustments to compensation and timeline.

2. PROJECT TIMELINE
2.1 Proposed Start Date: {{startDate}}
2.2 Expected Completion Date: {{completionDate}}
2.3 Milestones:
   {{milestones}}

2.4 Service Provider will use commercially reasonable efforts to meet the timeline, but timelines are estimates and not guarantees.

3. COMPENSATION OFFER
3.1 Total Compensation: ${{totalAmount}} (the "Total Compensation")

3.2 Compensation Schedule:
   - Initial Payment: ${{initialPaymentAmount}} ({{initialPaymentPercentage}}%) due upon acceptance of this Proposal
   - Milestone Payment 1: ${{milestone1Amount}} ({{milestone1Percentage}}%) due upon {{milestone1Date}} or completion of {{milestone1Deliverable}}
   - Milestone Payment 2: ${{milestone2Amount}} ({{milestone2Percentage}}%) due upon {{milestone2Date}} or completion of {{milestone2Deliverable}}
   - Final Payment: ${{finalPayment}} ({{finalPaymentPercentage}}%) due upon final delivery and acceptance

3.3 All compensation payments will be made within {{paymentTerms}} days of the specified due date.

3.4 Service Provider is responsible for all applicable taxes related to this compensation.

4. CLIENT RESPONSIBILITIES
4.1 Client agrees to:
   (a) Provide all necessary information, materials, and access in a timely manner;
   (b) Provide timely feedback and approvals (within {{feedbackTimeframe}} business days);
   (c) Designate a single point of contact for approvals and communications;
   (d) Accept deliverables in accordance with the terms of this Proposal.

4.2 Delays in Client performance may extend the project timeline.

5. INTELLECTUAL PROPERTY RIGHTS
5.1 Upon completion of services and full payment of compensation, Service Provider hereby assigns to Client all right, title, and interest in and to the Deliverables, including all copyrights, trademarks, and other intellectual property rights.

5.2 Service Provider reserves the right to:
   (a) Use the Deliverables in Service Provider''s portfolio and marketing materials;
   (b) Retain ownership of any pre-existing methodologies, processes, or know-how.

6. ACCEPTANCE
6.1 This Proposal shall become effective upon written acceptance by Client.

6.2 Client may accept this Proposal by signing and returning it to Service Provider within {{acceptancePeriod}} days.

7. TERMINATION
7.1 Either party may terminate this arrangement:
   (a) For convenience, upon {{terminationNotice}} days written notice to the other party;
   (b) For material breach, if the breaching party fails to cure such breach within {{curePeriod}} days after written notice.

7.2 Upon termination, Service Provider will pay Client for all completed work up to the date of termination.

8. GENERAL PROVISIONS
8.1 This Proposal, together with any exhibits or attachments, constitutes the entire agreement between the parties upon acceptance.

8.2 This Proposal shall be governed by the laws of {{jurisdiction}}.

8.3 Any disputes arising from this Proposal shall be resolved through {{disputeResolution}}.

IN WITNESS WHEREOF, the parties have executed this Proposal as of the date first written above.

Service Provider:
_________________________
{{contractorName}}
Date: _________________

Client:
_________________________
{{clientName}}
Date: _________________',
  '[
    {"id": "proposalDate", "label": "Proposal Date", "type": "date", "required": true},
    {"id": "contractorName", "label": "Service Provider Name", "type": "text", "required": true},
    {"id": "contractorEntityType", "label": "Service Provider Entity Type", "type": "text", "required": false, "placeholder": "e.g., LLC, Corporation, Sole Proprietorship"},
    {"id": "clientName", "label": "Client Name", "type": "text", "required": true},
    {"id": "clientEntityType", "label": "Client Entity Type", "type": "text", "required": false},
    {"id": "serviceType", "label": "Service Type", "type": "text", "required": true},
    {"id": "serviceDescription", "label": "Service Description", "type": "textarea", "required": true},
    {"id": "deliverables", "label": "Deliverables", "type": "textarea", "required": true},
    {"id": "projectDuration", "label": "Project Duration", "type": "text", "required": true},
    {"id": "startDate", "label": "Start Date", "type": "date", "required": true},
    {"id": "completionDate", "label": "Completion Date", "type": "date", "required": true},
    {"id": "milestones", "label": "Milestones", "type": "textarea", "required": false},
    {"id": "totalAmount", "label": "Total Compensation Amount", "type": "number", "required": true},
    {"id": "initialPaymentAmount", "label": "Initial Payment Amount", "type": "number", "required": true},
    {"id": "initialPaymentPercentage", "label": "Initial Payment Percentage", "type": "number", "required": false},
    {"id": "milestone1Amount", "label": "Milestone 1 Amount", "type": "number", "required": false},
    {"id": "milestone1Percentage", "label": "Milestone 1 Percentage", "type": "number", "required": false},
    {"id": "milestone1Date", "label": "Milestone 1 Date", "type": "date", "required": false},
    {"id": "milestone1Deliverable", "label": "Milestone 1 Deliverable", "type": "text", "required": false},
    {"id": "milestone2Amount", "label": "Milestone 2 Amount", "type": "number", "required": false},
    {"id": "milestone2Percentage", "label": "Milestone 2 Percentage", "type": "number", "required": false},
    {"id": "milestone2Date", "label": "Milestone 2 Date", "type": "date", "required": false},
    {"id": "milestone2Deliverable", "label": "Milestone 2 Deliverable", "type": "text", "required": false},
    {"id": "finalPayment", "label": "Final Payment Amount", "type": "number", "required": false},
    {"id": "finalPaymentPercentage", "label": "Final Payment Percentage", "type": "number", "required": false},
    {"id": "paymentTerms", "label": "Payment Terms (days)", "type": "number", "required": false},
    {"id": "feedbackTimeframe", "label": "Feedback Timeframe (business days)", "type": "number", "required": false},
    {"id": "acceptancePeriod", "label": "Acceptance Period (days)", "type": "number", "required": false},
    {"id": "terminationNotice", "label": "Termination Notice Period (days)", "type": "number", "required": false},
    {"id": "curePeriod", "label": "Cure Period (days)", "type": "number", "required": false},
    {"id": "jurisdiction", "label": "Jurisdiction", "type": "text", "required": false},
    {"id": "disputeResolution", "label": "Dispute Resolution Method", "type": "text", "required": false}
  ]'::jsonb,
  'proposal'
);

-- 2. Partnership Proposal Template
INSERT INTO default_contract_templates (name, category, description, content, fields, contract_type) VALUES (
  'Partnership Proposal',
  'Proposals',
  'Template for proposing a partnership or collaboration where you offer compensation to the client. Ideal for joint ventures and strategic partnerships.',
  'PARTNERSHIP PROPOSAL

This Partnership Proposal ("Proposal") is submitted on {{proposalDate}} by {{contractorName}} ("Proposer") to {{clientName}} ("Partner").

WHEREAS, Proposer seeks to establish a partnership with Partner; and
WHEREAS, Proposer is prepared to offer compensation as part of this partnership;

NOW, THEREFORE, Proposer offers the following partnership terms:

1. PARTNERSHIP OVERVIEW
1.1 Partnership Type: {{partnershipType}}
1.2 Partnership Purpose: {{partnershipPurpose}}
1.3 Duration: {{partnershipDuration}}

2. PROPOSED CONTRIBUTIONS
2.1 Proposer will contribute:
   - Services: {{proposerServices}}
   - Resources: {{proposerResources}}
   - Compensation: ${{totalCompensation}}

2.2 Partner will contribute:
   - {{partnerContributions}}

3. COMPENSATION OFFER
3.1 Total Compensation: ${{totalCompensation}}
3.2 Initial Payment: ${{initialPayment}} due upon acceptance
3.3 Ongoing Payments: {{ongoingPaymentSchedule}}
3.4 Payment Method: {{paymentMethod}}

4. PARTNERSHIP TERMS
4.1 Decision Making: {{decisionMakingProcess}}
4.2 Profit/Loss Sharing: {{profitSharing}}
4.3 Responsibilities: {{responsibilities}}

5. TERMINATION
5.1 Either party may terminate this partnership with {{terminationNotice}} days written notice.

5.2 Upon termination, Proposer will fulfill all compensation obligations up to the termination date.

6. ACCEPTANCE
This Proposal shall become effective upon written acceptance by Partner within {{acceptancePeriod}} days.

IN WITNESS WHEREOF, the parties have executed this Proposal as of the date first written above.

Proposer:
_________________________
{{contractorName}}
Date: _________________

Partner:
_________________________
{{clientName}}
Date: _________________',
  '[
    {"id": "proposalDate", "label": "Proposal Date", "type": "date", "required": true},
    {"id": "contractorName", "label": "Proposer Name", "type": "text", "required": true},
    {"id": "clientName", "label": "Partner Name", "type": "text", "required": true},
    {"id": "partnershipType", "label": "Partnership Type", "type": "text", "required": true},
    {"id": "partnershipPurpose", "label": "Partnership Purpose", "type": "textarea", "required": true},
    {"id": "partnershipDuration", "label": "Partnership Duration", "type": "text", "required": true},
    {"id": "proposerServices", "label": "Proposer Services", "type": "textarea", "required": true},
    {"id": "proposerResources", "label": "Proposer Resources", "type": "textarea", "required": false},
    {"id": "totalCompensation", "label": "Total Compensation", "type": "number", "required": true},
    {"id": "partnerContributions", "label": "Partner Contributions", "type": "textarea", "required": true},
    {"id": "initialPayment", "label": "Initial Payment", "type": "number", "required": true},
    {"id": "ongoingPaymentSchedule", "label": "Ongoing Payment Schedule", "type": "textarea", "required": false},
    {"id": "paymentMethod", "label": "Payment Method", "type": "text", "required": false},
    {"id": "decisionMakingProcess", "label": "Decision Making Process", "type": "textarea", "required": false},
    {"id": "profitSharing", "label": "Profit/Loss Sharing", "type": "text", "required": false},
    {"id": "responsibilities", "label": "Responsibilities", "type": "textarea", "required": false},
    {"id": "terminationNotice", "label": "Termination Notice (days)", "type": "number", "required": false},
    {"id": "acceptancePeriod", "label": "Acceptance Period (days)", "type": "number", "required": false}
  ]'::jsonb,
  'proposal'
);

-- 3. Service Compensation Proposal
INSERT INTO default_contract_templates (name, category, description, content, fields, contract_type) VALUES (
  'Service Compensation Proposal',
  'Proposals',
  'Simple proposal template for offering services with compensation. Perfect for service-based proposals where you pay the client.',
  'SERVICE COMPENSATION PROPOSAL

This Service Compensation Proposal ("Proposal") is submitted on {{proposalDate}} by {{contractorName}} ("Service Provider") to {{clientName}} ("Client").

SERVICE PROVIDER PROPOSES:

1. SERVICES TO BE PROVIDED
Service Provider proposes to provide the following services:
{{serviceDescription}}

2. COMPENSATION OFFER
Service Provider offers the following compensation:
- Total Compensation: ${{totalCompensation}}
- Initial Payment: ${{initialPayment}} (due upon acceptance)
- Remaining Balance: ${{remainingBalance}} (due upon {{completionDate}})

3. TERMS AND CONDITIONS
3.1 This Proposal is valid for {{validityPeriod}} days from the date of submission.

3.2 Upon acceptance, Service Provider will begin work within {{startTimeframe}} days.

3.3 Service Provider will complete the services by {{completionDate}}.

4. ACCEPTANCE
This Proposal shall become effective upon written acceptance by Client.

Service Provider:
_________________________
{{contractorName}}
Date: _________________

Client:
_________________________
{{clientName}}
Date: _________________',
  '[
    {"id": "proposalDate", "label": "Proposal Date", "type": "date", "required": true},
    {"id": "contractorName", "label": "Service Provider Name", "type": "text", "required": true},
    {"id": "clientName", "label": "Client Name", "type": "text", "required": true},
    {"id": "serviceDescription", "label": "Service Description", "type": "textarea", "required": true},
    {"id": "totalCompensation", "label": "Total Compensation", "type": "number", "required": true},
    {"id": "initialPayment", "label": "Initial Payment", "type": "number", "required": true},
    {"id": "remainingBalance", "label": "Remaining Balance", "type": "number", "required": false},
    {"id": "completionDate", "label": "Completion Date", "type": "date", "required": true},
    {"id": "validityPeriod", "label": "Proposal Validity Period (days)", "type": "number", "required": false},
    {"id": "startTimeframe", "label": "Start Timeframe (days)", "type": "number", "required": false}
  ]'::jsonb,
  'proposal'
);

-- 4. Marketing Services Proposal
INSERT INTO default_contract_templates (name, category, description, content, fields, contract_type) VALUES (
  'Marketing Services Proposal',
  'Proposals',
  'Comprehensive marketing services proposal template. Perfect for digital marketing, social media, SEO, and advertising proposals.',
  'MARKETING SERVICES PROPOSAL

This Marketing Services Proposal ("Proposal") is submitted on {{proposalDate}} by {{contractorName}} ("Marketing Provider") to {{clientName}} ("Client").

WHEREAS, Marketing Provider specializes in {{marketingSpecialty}}; and
WHEREAS, Client seeks to enhance their marketing presence and reach;

NOW, THEREFORE, Marketing Provider proposes the following:

1. MARKETING SERVICES OVERVIEW
1.1 Services to be Provided:
   - Marketing Strategy: {{marketingStrategy}}
   - Target Audience: {{targetAudience}}
   - Marketing Channels: {{marketingChannels}}
   - Campaign Duration: {{campaignDuration}}
   - Expected Results: {{expectedResults}}

1.2 Deliverables:
   {{deliverables}}

2. COMPENSATION OFFER
2.1 Total Compensation: ${{totalCompensation}}
2.2 Payment Schedule:
   - Initial Payment: ${{initialPayment}} ({{initialPercentage}}%) upon acceptance
   - Monthly Payments: ${{monthlyPayment}} for {{numberOfMonths}} months
   - Performance Bonus: ${{performanceBonus}} (if {{performanceMetrics}} are achieved)

3. TIMELINE
3.1 Campaign Start Date: {{startDate}}
3.2 Campaign End Date: {{endDate}}
3.3 Key Milestones:
   {{milestones}}

4. REPORTING & ANALYTICS
4.1 Marketing Provider will provide:
   - Weekly progress reports
   - Monthly analytics dashboard
   - Performance metrics: {{keyMetrics}}

5. ACCEPTANCE
This Proposal shall become effective upon written acceptance by Client within {{acceptancePeriod}} days.

Marketing Provider:
_________________________
{{contractorName}}
Date: _________________

Client:
_________________________
{{clientName}}
Date: _________________',
  '[
    {"id": "proposalDate", "label": "Proposal Date", "type": "date", "required": true},
    {"id": "contractorName", "label": "Marketing Provider Name", "type": "text", "required": true},
    {"id": "clientName", "label": "Client Name", "type": "text", "required": true},
    {"id": "marketingSpecialty", "label": "Marketing Specialty", "type": "text", "required": true},
    {"id": "marketingStrategy", "label": "Marketing Strategy", "type": "textarea", "required": true},
    {"id": "targetAudience", "label": "Target Audience", "type": "text", "required": true},
    {"id": "marketingChannels", "label": "Marketing Channels", "type": "textarea", "required": true},
    {"id": "campaignDuration", "label": "Campaign Duration", "type": "text", "required": true},
    {"id": "expectedResults", "label": "Expected Results", "type": "textarea", "required": false},
    {"id": "deliverables", "label": "Deliverables", "type": "textarea", "required": true},
    {"id": "totalCompensation", "label": "Total Compensation", "type": "number", "required": true},
    {"id": "initialPayment", "label": "Initial Payment", "type": "number", "required": true},
    {"id": "initialPercentage", "label": "Initial Payment Percentage", "type": "number", "required": false},
    {"id": "monthlyPayment", "label": "Monthly Payment", "type": "number", "required": false},
    {"id": "numberOfMonths", "label": "Number of Months", "type": "number", "required": false},
    {"id": "performanceBonus", "label": "Performance Bonus Amount", "type": "number", "required": false},
    {"id": "performanceMetrics", "label": "Performance Metrics for Bonus", "type": "text", "required": false},
    {"id": "startDate", "label": "Start Date", "type": "date", "required": true},
    {"id": "endDate", "label": "End Date", "type": "date", "required": true},
    {"id": "milestones", "label": "Key Milestones", "type": "textarea", "required": false},
    {"id": "keyMetrics", "label": "Key Performance Metrics", "type": "textarea", "required": false},
    {"id": "acceptancePeriod", "label": "Acceptance Period (days)", "type": "number", "required": false}
  ]'::jsonb,
  'proposal'
);

-- 5. Software Development Proposal
INSERT INTO default_contract_templates (name, category, description, content, fields, contract_type) VALUES (
  'Software Development Proposal',
  'Proposals',
  'Professional software development proposal template. Ideal for app development, web development, and software engineering proposals.',
  'SOFTWARE DEVELOPMENT PROPOSAL

This Software Development Proposal ("Proposal") is submitted on {{proposalDate}} by {{contractorName}} ("Developer") to {{clientName}} ("Client").

WHEREAS, Developer specializes in {{developmentType}}; and
WHEREAS, Client requires software development services;

NOW, THEREFORE, Developer proposes the following:

1. PROJECT OVERVIEW
1.1 Project Name: {{projectName}}
1.2 Project Description: {{projectDescription}}
1.3 Technology Stack: {{technologyStack}}
1.4 Development Approach: {{developmentApproach}}

2. SCOPE OF WORK
2.1 Features & Functionality:
   {{features}}

2.2 Deliverables:
   - Source code
   - Documentation
   - Testing suite
   - Deployment package
   - User manual

3. DEVELOPMENT TIMELINE
3.1 Project Start: {{startDate}}
3.2 Estimated Completion: {{completionDate}}
3.3 Development Phases:
   {{developmentPhases}}

4. COMPENSATION OFFER
4.1 Total Compensation: ${{totalCompensation}}
4.2 Payment Schedule:
   - Initial Payment: ${{initialPayment}} ({{initialPercentage}}%) upon acceptance
   - Phase 1 Completion: ${{phase1Payment}} ({{phase1Percentage}}%)
   - Phase 2 Completion: ${{phase2Payment}} ({{phase2Percentage}}%)
   - Final Delivery: ${{finalPayment}} ({{finalPercentage}}%)

5. SUPPORT & MAINTENANCE
5.1 Post-launch Support: {{supportPeriod}} months included
5.2 Maintenance: ${{monthlyMaintenance}}/month after support period

6. INTELLECTUAL PROPERTY
6.1 Upon full payment, all code and deliverables will be assigned to Client.

7. ACCEPTANCE
This Proposal shall become effective upon written acceptance by Client within {{acceptancePeriod}} days.

Developer:
_________________________
{{contractorName}}
Date: _________________

Client:
_________________________
{{clientName}}
Date: _________________',
  '[
    {"id": "proposalDate", "label": "Proposal Date", "type": "date", "required": true},
    {"id": "contractorName", "label": "Developer Name", "type": "text", "required": true},
    {"id": "clientName", "label": "Client Name", "type": "text", "required": true},
    {"id": "developmentType", "label": "Development Type", "type": "text", "required": true},
    {"id": "projectName", "label": "Project Name", "type": "text", "required": true},
    {"id": "projectDescription", "label": "Project Description", "type": "textarea", "required": true},
    {"id": "technologyStack", "label": "Technology Stack", "type": "textarea", "required": true},
    {"id": "developmentApproach", "label": "Development Approach", "type": "text", "required": false},
    {"id": "features", "label": "Features & Functionality", "type": "textarea", "required": true},
    {"id": "startDate", "label": "Start Date", "type": "date", "required": true},
    {"id": "completionDate", "label": "Completion Date", "type": "date", "required": true},
    {"id": "developmentPhases", "label": "Development Phases", "type": "textarea", "required": false},
    {"id": "totalCompensation", "label": "Total Compensation", "type": "number", "required": true},
    {"id": "initialPayment", "label": "Initial Payment", "type": "number", "required": true},
    {"id": "initialPercentage", "label": "Initial Payment Percentage", "type": "number", "required": false},
    {"id": "phase1Payment", "label": "Phase 1 Payment", "type": "number", "required": false},
    {"id": "phase1Percentage", "label": "Phase 1 Percentage", "type": "number", "required": false},
    {"id": "phase2Payment", "label": "Phase 2 Payment", "type": "number", "required": false},
    {"id": "phase2Percentage", "label": "Phase 2 Percentage", "type": "number", "required": false},
    {"id": "finalPayment", "label": "Final Payment", "type": "number", "required": false},
    {"id": "finalPercentage", "label": "Final Payment Percentage", "type": "number", "required": false},
    {"id": "supportPeriod", "label": "Support Period (months)", "type": "number", "required": false},
    {"id": "monthlyMaintenance", "label": "Monthly Maintenance Fee", "type": "number", "required": false},
    {"id": "acceptancePeriod", "label": "Acceptance Period (days)", "type": "number", "required": false}
  ]'::jsonb,
  'proposal'
);

-- 6. Consulting Proposal
INSERT INTO default_contract_templates (name, category, description, content, fields, contract_type) VALUES (
  'Consulting Proposal',
  'Proposals',
  'Professional consulting services proposal template. Perfect for business consulting, strategy consulting, and advisory services.',
  'CONSULTING SERVICES PROPOSAL

This Consulting Services Proposal ("Proposal") is submitted on {{proposalDate}} by {{contractorName}} ("Consultant") to {{clientName}} ("Client").

WHEREAS, Consultant has expertise in {{consultingArea}}; and
WHEREAS, Client seeks consulting services to achieve {{clientObjectives}};

NOW, THEREFORE, Consultant proposes the following:

1. CONSULTING ENGAGEMENT
1.1 Consulting Focus: {{consultingFocus}}
1.2 Engagement Objectives: {{engagementObjectives}}
1.3 Scope of Work: {{scopeOfWork}}
1.4 Methodology: {{methodology}}

2. DELIVERABLES
2.1 Consultant will deliver:
   {{deliverables}}

2.2 Reporting Schedule: {{reportingSchedule}}

3. ENGAGEMENT TIMELINE
3.1 Start Date: {{startDate}}
3.2 End Date: {{endDate}}
3.3 Estimated Hours: {{estimatedHours}}
3.4 Key Milestones:
   {{milestones}}

4. COMPENSATION OFFER
4.1 Total Compensation: ${{totalCompensation}}
4.2 Payment Structure:
   - Initial Payment: ${{initialPayment}} ({{initialPercentage}}%) upon acceptance
   - Monthly Retainer: ${{monthlyRetainer}} for {{numberOfMonths}} months
   - Final Payment: ${{finalPayment}} upon completion

5. CONSULTANT RESPONSIBILITIES
5.1 Consultant will:
   - Provide expert advice and recommendations
   - Deliver all agreed-upon deliverables
   - Maintain confidentiality
   - Act in Client''s best interests

6. CLIENT RESPONSIBILITIES
6.1 Client will:
   - Provide necessary information and access
   - Designate key personnel for collaboration
   - Provide timely feedback

7. ACCEPTANCE
This Proposal shall become effective upon written acceptance by Client within {{acceptancePeriod}} days.

Consultant:
_________________________
{{contractorName}}
Date: _________________

Client:
_________________________
{{clientName}}
Date: _________________',
  '[
    {"id": "proposalDate", "label": "Proposal Date", "type": "date", "required": true},
    {"id": "contractorName", "label": "Consultant Name", "type": "text", "required": true},
    {"id": "clientName", "label": "Client Name", "type": "text", "required": true},
    {"id": "consultingArea", "label": "Consulting Area", "type": "text", "required": true},
    {"id": "clientObjectives", "label": "Client Objectives", "type": "textarea", "required": true},
    {"id": "consultingFocus", "label": "Consulting Focus", "type": "textarea", "required": true},
    {"id": "engagementObjectives", "label": "Engagement Objectives", "type": "textarea", "required": true},
    {"id": "scopeOfWork", "label": "Scope of Work", "type": "textarea", "required": true},
    {"id": "methodology", "label": "Methodology", "type": "textarea", "required": false},
    {"id": "deliverables", "label": "Deliverables", "type": "textarea", "required": true},
    {"id": "reportingSchedule", "label": "Reporting Schedule", "type": "text", "required": false},
    {"id": "startDate", "label": "Start Date", "type": "date", "required": true},
    {"id": "endDate", "label": "End Date", "type": "date", "required": true},
    {"id": "estimatedHours", "label": "Estimated Hours", "type": "number", "required": false},
    {"id": "milestones", "label": "Key Milestones", "type": "textarea", "required": false},
    {"id": "totalCompensation", "label": "Total Compensation", "type": "number", "required": true},
    {"id": "initialPayment", "label": "Initial Payment", "type": "number", "required": true},
    {"id": "initialPercentage", "label": "Initial Payment Percentage", "type": "number", "required": false},
    {"id": "monthlyRetainer", "label": "Monthly Retainer", "type": "number", "required": false},
    {"id": "numberOfMonths", "label": "Number of Months", "type": "number", "required": false},
    {"id": "finalPayment", "label": "Final Payment", "type": "number", "required": false},
    {"id": "acceptancePeriod", "label": "Acceptance Period (days)", "type": "number", "required": false}
  ]'::jsonb,
  'proposal'
);
-- Additional Proposal Templates (7-25)

-- 7. Content Creation Proposal
INSERT INTO default_contract_templates (name, category, description, content, fields, contract_type) VALUES (
  'Content Creation Proposal',
  'Proposals',
  'Content creation and content marketing proposal template. Ideal for blog writing, video production, social media content, and creative content proposals.',
  'CONTENT CREATION PROPOSAL

This Content Creation Proposal ("Proposal") is submitted on {{proposalDate}} by {{contractorName}} ("Content Creator") to {{clientName}} ("Client").

WHEREAS, Content Creator specializes in {{contentType}}; and
WHEREAS, Client requires high-quality content for {{contentPurpose}};

NOW, THEREFORE, Content Creator proposes the following:

1. CONTENT STRATEGY
1.1 Content Type: {{contentType}}
1.2 Content Themes: {{contentThemes}}
1.3 Target Audience: {{targetAudience}}
1.4 Content Goals: {{contentGoals}}
1.5 Distribution Channels: {{distributionChannels}}

2. CONTENT DELIVERABLES
2.1 Content Package:
   {{contentDeliverables}}

2.2 Content Volume:
   - {{contentQuantity}} pieces of {{contentFormat}}
   - Publishing Schedule: {{publishingSchedule}}

3. TIMELINE
3.1 Project Start: {{startDate}}
3.2 Project Completion: {{completionDate}}
3.3 Content Calendar:
   {{contentCalendar}}

4. COMPENSATION OFFER
4.1 Total Compensation: ${{totalCompensation}}
4.2 Payment Schedule:
   - Initial Payment: ${{initialPayment}} ({{initialPercentage}}%) upon acceptance
   - Monthly Payments: ${{monthlyPayment}} for {{numberOfMonths}} months
   - Final Payment: ${{finalPayment}} upon completion

5. REVISIONS & APPROVALS
5.1 Revisions: {{numberOfRevisions}} rounds of revisions included
5.2 Approval Process: {{approvalProcess}}

6. RIGHTS & USAGE
6.1 Upon full payment, Client receives full rights to all content created.

7. ACCEPTANCE
This Proposal shall become effective upon written acceptance by Client within {{acceptancePeriod}} days.

Content Creator:
_________________________
{{contractorName}}
Date: _________________

Client:
_________________________
{{clientName}}
Date: _________________',
  '[
    {"id": "proposalDate", "label": "Proposal Date", "type": "date", "required": true},
    {"id": "contractorName", "label": "Content Creator Name", "type": "text", "required": true},
    {"id": "clientName", "label": "Client Name", "type": "text", "required": true},
    {"id": "contentType", "label": "Content Type", "type": "text", "required": true},
    {"id": "contentPurpose", "label": "Content Purpose", "type": "text", "required": true},
    {"id": "contentThemes", "label": "Content Themes", "type": "textarea", "required": true},
    {"id": "targetAudience", "label": "Target Audience", "type": "text", "required": true},
    {"id": "contentGoals", "label": "Content Goals", "type": "textarea", "required": true},
    {"id": "distributionChannels", "label": "Distribution Channels", "type": "textarea", "required": false},
    {"id": "contentDeliverables", "label": "Content Deliverables", "type": "textarea", "required": true},
    {"id": "contentQuantity", "label": "Content Quantity", "type": "number", "required": true},
    {"id": "contentFormat", "label": "Content Format", "type": "text", "required": true},
    {"id": "publishingSchedule", "label": "Publishing Schedule", "type": "text", "required": false},
    {"id": "startDate", "label": "Start Date", "type": "date", "required": true},
    {"id": "completionDate", "label": "Completion Date", "type": "date", "required": true},
    {"id": "contentCalendar", "label": "Content Calendar", "type": "textarea", "required": false},
    {"id": "totalCompensation", "label": "Total Compensation", "type": "number", "required": true},
    {"id": "initialPayment", "label": "Initial Payment", "type": "number", "required": true},
    {"id": "initialPercentage", "label": "Initial Payment Percentage", "type": "number", "required": false},
    {"id": "monthlyPayment", "label": "Monthly Payment", "type": "number", "required": false},
    {"id": "numberOfMonths", "label": "Number of Months", "type": "number", "required": false},
    {"id": "finalPayment", "label": "Final Payment", "type": "number", "required": false},
    {"id": "numberOfRevisions", "label": "Number of Revisions", "type": "number", "required": false},
    {"id": "approvalProcess", "label": "Approval Process", "type": "textarea", "required": false},
    {"id": "acceptancePeriod", "label": "Acceptance Period (days)", "type": "number", "required": false}
  ]'::jsonb,
  'proposal'
);

-- 8. Event Planning Proposal
INSERT INTO default_contract_templates (name, category, description, content, fields, contract_type) VALUES (
  'Event Planning Proposal',
  'Proposals',
  'Event planning and management proposal template. Perfect for corporate events, conferences, weddings, and special event proposals.',
  'EVENT PLANNING PROPOSAL

This Event Planning Proposal ("Proposal") is submitted on {{proposalDate}} by {{contractorName}} ("Event Planner") to {{clientName}} ("Client").

WHEREAS, Event Planner specializes in {{eventType}} planning; and
WHEREAS, Client requires professional event planning services for {{eventName}};

NOW, THEREFORE, Event Planner proposes the following:

1. EVENT OVERVIEW
1.1 Event Name: {{eventName}}
1.2 Event Type: {{eventType}}
1.3 Event Date: {{eventDate}}
1.4 Event Location: {{eventLocation}}
1.5 Expected Attendance: {{expectedAttendance}} guests
1.6 Event Theme: {{eventTheme}}

2. EVENT PLANNING SERVICES
2.1 Services Included:
   {{servicesIncluded}}

2.2 Event Elements:
   {{eventElements}}

3. PLANNING TIMELINE
3.1 Planning Start Date: {{startDate}}
3.2 Event Date: {{eventDate}}
3.3 Key Planning Milestones:
   {{planningMilestones}}

4. COMPENSATION OFFER
4.1 Total Compensation: ${{totalCompensation}}
4.2 Payment Schedule:
   - Initial Payment: ${{initialPayment}} ({{initialPercentage}}%) upon acceptance
   - Mid-Point Payment: ${{midPointPayment}} ({{midPointPercentage}}%) on {{midPointDate}}
   - Final Payment: ${{finalPayment}} ({{finalPercentage}}%) {{finalPaymentTiming}}

5. VENDOR MANAGEMENT
5.1 Event Planner will coordinate with:
   {{vendors}}

6. CLIENT RESPONSIBILITIES
6.1 Client will:
   - Provide event vision and requirements
   - Approve vendor selections
   - Provide guest list and preferences
   - Make timely decisions

7. ACCEPTANCE
This Proposal shall become effective upon written acceptance by Client within {{acceptancePeriod}} days.

Event Planner:
_________________________
{{contractorName}}
Date: _________________

Client:
_________________________
{{clientName}}
Date: _________________',
  '[
    {"id": "proposalDate", "label": "Proposal Date", "type": "date", "required": true},
    {"id": "contractorName", "label": "Event Planner Name", "type": "text", "required": true},
    {"id": "clientName", "label": "Client Name", "type": "text", "required": true},
    {"id": "eventType", "label": "Event Type", "type": "text", "required": true},
    {"id": "eventName", "label": "Event Name", "type": "text", "required": true},
    {"id": "eventDate", "label": "Event Date", "type": "date", "required": true},
    {"id": "eventLocation", "label": "Event Location", "type": "text", "required": true},
    {"id": "expectedAttendance", "label": "Expected Attendance", "type": "number", "required": false},
    {"id": "eventTheme", "label": "Event Theme", "type": "text", "required": false},
    {"id": "servicesIncluded", "label": "Services Included", "type": "textarea", "required": true},
    {"id": "eventElements", "label": "Event Elements", "type": "textarea", "required": false},
    {"id": "startDate", "label": "Planning Start Date", "type": "date", "required": true},
    {"id": "planningMilestones", "label": "Planning Milestones", "type": "textarea", "required": false},
    {"id": "totalCompensation", "label": "Total Compensation", "type": "number", "required": true},
    {"id": "initialPayment", "label": "Initial Payment", "type": "number", "required": true},
    {"id": "initialPercentage", "label": "Initial Payment Percentage", "type": "number", "required": false},
    {"id": "midPointPayment", "label": "Mid-Point Payment", "type": "number", "required": false},
    {"id": "midPointPercentage", "label": "Mid-Point Payment Percentage", "type": "number", "required": false},
    {"id": "midPointDate", "label": "Mid-Point Payment Date", "type": "date", "required": false},
    {"id": "finalPayment", "label": "Final Payment", "type": "number", "required": false},
    {"id": "finalPercentage", "label": "Final Payment Percentage", "type": "number", "required": false},
    {"id": "finalPaymentTiming", "label": "Final Payment Timing", "type": "text", "required": false},
    {"id": "vendors", "label": "Vendors to Coordinate", "type": "textarea", "required": false},
    {"id": "acceptancePeriod", "label": "Acceptance Period (days)", "type": "number", "required": false}
  ]'::jsonb,
  'proposal'
);

-- 9. Investment Proposal
INSERT INTO default_contract_templates (name, category, description, content, fields, contract_type) VALUES (
  'Investment Proposal',
  'Proposals',
  'Investment and funding proposal template. Ideal for investment opportunities, funding proposals, and capital investment offers.',
  'INVESTMENT PROPOSAL

This Investment Proposal ("Proposal") is submitted on {{proposalDate}} by {{contractorName}} ("Investor") to {{clientName}} ("Company").

WHEREAS, Investor seeks to invest in Company; and
WHEREAS, Company requires capital for {{investmentPurpose}};

NOW, THEREFORE, Investor proposes the following:

1. INVESTMENT OVERVIEW
1.1 Investment Amount: ${{investmentAmount}}
1.2 Investment Type: {{investmentType}}
1.3 Investment Purpose: {{investmentPurpose}}
1.4 Expected Return: {{expectedReturn}}
1.5 Investment Term: {{investmentTerm}}

2. INVESTMENT STRUCTURE
2.1 Investment Terms:
   {{investmentTerms}}

2.2 Equity/Ownership: {{equityPercentage}}%
2.3 Valuation: ${{companyValuation}}

3. USE OF FUNDS
3.1 Funds will be used for:
   {{useOfFunds}}

4. COMPENSATION OFFER
4.1 Total Investment: ${{investmentAmount}}
4.2 Payment Schedule:
   - Initial Investment: ${{initialInvestment}} ({{initialPercentage}}%) upon acceptance
   - Milestone 1: ${{milestone1Investment}} ({{milestone1Percentage}}%) on {{milestone1Date}}
   - Milestone 2: ${{milestone2Investment}} ({{milestone2Percentage}}%) on {{milestone2Date}}

5. INVESTOR RIGHTS
5.1 Investor will receive:
   {{investorRights}}

6. COMPANY OBLIGATIONS
6.1 Company agrees to:
   {{companyObligations}}

7. ACCEPTANCE
This Proposal shall become effective upon written acceptance by Company within {{acceptancePeriod}} days.

Investor:
_________________________
{{contractorName}}
Date: _________________

Company:
_________________________
{{clientName}}
Date: _________________',
  '[
    {"id": "proposalDate", "label": "Proposal Date", "type": "date", "required": true},
    {"id": "contractorName", "label": "Investor Name", "type": "text", "required": true},
    {"id": "clientName", "label": "Company Name", "type": "text", "required": true},
    {"id": "investmentPurpose", "label": "Investment Purpose", "type": "textarea", "required": true},
    {"id": "investmentAmount", "label": "Investment Amount", "type": "number", "required": true},
    {"id": "investmentType", "label": "Investment Type", "type": "text", "required": true},
    {"id": "expectedReturn", "label": "Expected Return", "type": "text", "required": false},
    {"id": "investmentTerm", "label": "Investment Term", "type": "text", "required": false},
    {"id": "investmentTerms", "label": "Investment Terms", "type": "textarea", "required": true},
    {"id": "equityPercentage", "label": "Equity/Ownership Percentage", "type": "number", "required": false},
    {"id": "companyValuation", "label": "Company Valuation", "type": "number", "required": false},
    {"id": "useOfFunds", "label": "Use of Funds", "type": "textarea", "required": true},
    {"id": "initialInvestment", "label": "Initial Investment", "type": "number", "required": true},
    {"id": "initialPercentage", "label": "Initial Investment Percentage", "type": "number", "required": false},
    {"id": "milestone1Investment", "label": "Milestone 1 Investment", "type": "number", "required": false},
    {"id": "milestone1Percentage", "label": "Milestone 1 Percentage", "type": "number", "required": false},
    {"id": "milestone1Date", "label": "Milestone 1 Date", "type": "date", "required": false},
    {"id": "milestone2Investment", "label": "Milestone 2 Investment", "type": "number", "required": false},
    {"id": "milestone2Percentage", "label": "Milestone 2 Percentage", "type": "number", "required": false},
    {"id": "milestone2Date", "label": "Milestone 2 Date", "type": "date", "required": false},
    {"id": "investorRights", "label": "Investor Rights", "type": "textarea", "required": false},
    {"id": "companyObligations", "label": "Company Obligations", "type": "textarea", "required": false},
    {"id": "acceptancePeriod", "label": "Acceptance Period (days)", "type": "number", "required": false}
  ]'::jsonb,
  'proposal'
);

-- 10. Sponsorship Proposal
INSERT INTO default_contract_templates (name, category, description, content, fields, contract_type) VALUES (
  'Sponsorship Proposal',
  'Proposals',
  'Sponsorship and brand partnership proposal template. Perfect for event sponsorships, content sponsorships, and brand collaboration proposals.',
  'SPONSORSHIP PROPOSAL

This Sponsorship Proposal ("Proposal") is submitted on {{proposalDate}} by {{contractorName}} ("Sponsor") to {{clientName}} ("Sponsored Party").

WHEREAS, Sponsor seeks to sponsor {{sponsorshipType}}; and
WHEREAS, Sponsored Party offers sponsorship opportunities;

NOW, THEREFORE, Sponsor proposes the following:

1. SPONSORSHIP OVERVIEW
1.1 Sponsorship Type: {{sponsorshipType}}
1.2 Sponsorship Title: {{sponsorshipTitle}}
1.3 Sponsorship Duration: {{sponsorshipDuration}}
1.4 Sponsorship Value: ${{sponsorshipValue}}

2. SPONSORSHIP BENEFITS
2.1 Sponsor will receive:
   {{sponsorBenefits}}

2.2 Brand Exposure:
   {{brandExposure}}

3. SPONSORSHIP ACTIVATION
3.1 Activation Activities:
   {{activationActivities}}

3.2 Marketing Support:
   {{marketingSupport}}

4. COMPENSATION OFFER
4.1 Total Sponsorship Fee: ${{totalSponsorshipFee}}
4.2 Payment Schedule:
   - Initial Payment: ${{initialPayment}} ({{initialPercentage}}%) upon acceptance
   - Mid-Term Payment: ${{midTermPayment}} ({{midTermPercentage}}%) on {{midTermDate}}
   - Final Payment: ${{finalPayment}} ({{finalPercentage}}%) upon completion

5. SPONSOR OBLIGATIONS
5.1 Sponsor will:
   {{sponsorObligations}}

6. SPONSORED PARTY OBLIGATIONS
6.1 Sponsored Party will:
   {{sponsoredPartyObligations}}

7. BRAND GUIDELINES
7.1 Sponsor must adhere to: {{brandGuidelines}}

8. ACCEPTANCE
This Proposal shall become effective upon written acceptance by Sponsored Party within {{acceptancePeriod}} days.

Sponsor:
_________________________
{{contractorName}}
Date: _________________

Sponsored Party:
_________________________
{{clientName}}
Date: _________________',
  '[
    {"id": "proposalDate", "label": "Proposal Date", "type": "date", "required": true},
    {"id": "contractorName", "label": "Sponsor Name", "type": "text", "required": true},
    {"id": "clientName", "label": "Sponsored Party Name", "type": "text", "required": true},
    {"id": "sponsorshipType", "label": "Sponsorship Type", "type": "text", "required": true},
    {"id": "sponsorshipTitle", "label": "Sponsorship Title", "type": "text", "required": true},
    {"id": "sponsorshipDuration", "label": "Sponsorship Duration", "type": "text", "required": true},
    {"id": "sponsorshipValue", "label": "Sponsorship Value", "type": "number", "required": false},
    {"id": "sponsorBenefits", "label": "Sponsor Benefits", "type": "textarea", "required": true},
    {"id": "brandExposure", "label": "Brand Exposure Details", "type": "textarea", "required": true},
    {"id": "activationActivities", "label": "Activation Activities", "type": "textarea", "required": false},
    {"id": "marketingSupport", "label": "Marketing Support", "type": "textarea", "required": false},
    {"id": "totalSponsorshipFee", "label": "Total Sponsorship Fee", "type": "number", "required": true},
    {"id": "initialPayment", "label": "Initial Payment", "type": "number", "required": true},
    {"id": "initialPercentage", "label": "Initial Payment Percentage", "type": "number", "required": false},
    {"id": "midTermPayment", "label": "Mid-Term Payment", "type": "number", "required": false},
    {"id": "midTermPercentage", "label": "Mid-Term Payment Percentage", "type": "number", "required": false},
    {"id": "midTermDate", "label": "Mid-Term Payment Date", "type": "date", "required": false},
    {"id": "finalPayment", "label": "Final Payment", "type": "number", "required": false},
    {"id": "finalPercentage", "label": "Final Payment Percentage", "type": "number", "required": false},
    {"id": "sponsorObligations", "label": "Sponsor Obligations", "type": "textarea", "required": false},
    {"id": "sponsoredPartyObligations", "label": "Sponsored Party Obligations", "type": "textarea", "required": false},
    {"id": "brandGuidelines", "label": "Brand Guidelines", "type": "textarea", "required": false},
    {"id": "acceptancePeriod", "label": "Acceptance Period (days)", "type": "number", "required": false}
  ]'::jsonb,
  'proposal'
);
-- Additional Proposal Templates (11-25)

-- 11. Real Estate Proposal
INSERT INTO default_contract_templates (name, category, description, content, fields, contract_type) VALUES (
  'Real Estate Proposal',
  'Proposals',
  'Real estate and property proposal template. Ideal for property development, real estate partnerships, and property investment proposals.',
  'REAL ESTATE PROPOSAL

This Real Estate Proposal ("Proposal") is submitted on {{proposalDate}} by {{contractorName}} ("Proposer") to {{clientName}} ("Property Owner").

WHEREAS, Proposer seeks to {{proposalPurpose}} regarding {{propertyDescription}}; and
WHEREAS, Property Owner owns or controls the property;

NOW, THEREFORE, Proposer proposes the following:

1. PROPERTY OVERVIEW
1.1 Property Address: {{propertyAddress}}
1.2 Property Type: {{propertyType}}
1.3 Property Description: {{propertyDescription}}
1.4 Property Size: {{propertySize}}
1.5 Current Use: {{currentUse}}

2. PROPOSAL DETAILS
2.1 Proposal Purpose: {{proposalPurpose}}
2.2 Proposed Use: {{proposedUse}}
2.3 Development Plan: {{developmentPlan}}
2.4 Timeline: {{timeline}}

3. COMPENSATION OFFER
3.1 Total Compensation: ${{totalCompensation}}
3.2 Payment Structure:
   - Initial Payment: ${{initialPayment}} ({{initialPercentage}}%) upon acceptance
   - Closing Payment: ${{closingPayment}} ({{closingPercentage}}%) on {{closingDate}}
   - Additional Terms: {{additionalTerms}}

4. TERMS & CONDITIONS
4.1 Lease/Purchase Terms: {{leasePurchaseTerms}}
4.2 Duration: {{duration}}
4.3 Responsibilities: {{responsibilities}}

5. ACCEPTANCE
This Proposal shall become effective upon written acceptance by Property Owner within {{acceptancePeriod}} days.

Proposer:
_________________________
{{contractorName}}
Date: _________________

Property Owner:
_________________________
{{clientName}}
Date: _________________',
  '[
    {"id": "proposalDate", "label": "Proposal Date", "type": "date", "required": true},
    {"id": "contractorName", "label": "Proposer Name", "type": "text", "required": true},
    {"id": "clientName", "label": "Property Owner Name", "type": "text", "required": true},
    {"id": "proposalPurpose", "label": "Proposal Purpose", "type": "text", "required": true},
    {"id": "propertyDescription", "label": "Property Description", "type": "textarea", "required": true},
    {"id": "propertyAddress", "label": "Property Address", "type": "text", "required": true},
    {"id": "propertyType", "label": "Property Type", "type": "text", "required": true},
    {"id": "propertySize", "label": "Property Size", "type": "text", "required": false},
    {"id": "currentUse", "label": "Current Use", "type": "text", "required": false},
    {"id": "proposedUse", "label": "Proposed Use", "type": "textarea", "required": true},
    {"id": "developmentPlan", "label": "Development Plan", "type": "textarea", "required": false},
    {"id": "timeline", "label": "Timeline", "type": "text", "required": false},
    {"id": "totalCompensation", "label": "Total Compensation", "type": "number", "required": true},
    {"id": "initialPayment", "label": "Initial Payment", "type": "number", "required": true},
    {"id": "initialPercentage", "label": "Initial Payment Percentage", "type": "number", "required": false},
    {"id": "closingPayment", "label": "Closing Payment", "type": "number", "required": false},
    {"id": "closingPercentage", "label": "Closing Payment Percentage", "type": "number", "required": false},
    {"id": "closingDate", "label": "Closing Date", "type": "date", "required": false},
    {"id": "additionalTerms", "label": "Additional Terms", "type": "textarea", "required": false},
    {"id": "leasePurchaseTerms", "label": "Lease/Purchase Terms", "type": "textarea", "required": false},
    {"id": "duration", "label": "Duration", "type": "text", "required": false},
    {"id": "responsibilities", "label": "Responsibilities", "type": "textarea", "required": false},
    {"id": "acceptancePeriod", "label": "Acceptance Period (days)", "type": "number", "required": false}
  ]'::jsonb,
  'proposal'
);

-- 12. Licensing Proposal
INSERT INTO default_contract_templates (name, category, description, content, fields, contract_type) VALUES (
  'Licensing Proposal',
  'Proposals',
  'Intellectual property licensing proposal template. Perfect for technology licensing, brand licensing, and IP licensing proposals.',
  'LICENSING PROPOSAL

This Licensing Proposal ("Proposal") is submitted on {{proposalDate}} by {{contractorName}} ("Licensee") to {{clientName}} ("Licensor").

WHEREAS, Licensor owns certain intellectual property rights in {{licensedProperty}}; and
WHEREAS, Licensee desires to obtain a license to use such intellectual property;

NOW, THEREFORE, Licensee proposes the following:

1. LICENSED PROPERTY
1.1 Licensed Property: {{licensedProperty}}
1.2 Property Description: {{propertyDescription}}
1.3 IP Rights: {{ipRights}}
1.4 Territory: {{territory}}

2. LICENSE TERMS
2.1 License Type: {{licenseType}}
2.2 License Scope: {{licenseScope}}
2.3 Exclusivity: {{exclusivity}}
2.4 Duration: {{licenseDuration}}
2.5 Permitted Uses: {{permittedUses}}

3. COMPENSATION OFFER
3.1 Total License Fee: ${{totalLicenseFee}}
3.2 Payment Structure:
   - Initial License Fee: ${{initialLicenseFee}} ({{initialPercentage}}%) upon acceptance
   - Royalty Rate: {{royaltyRate}}% of {{royaltyBase}}
   - Minimum Annual Royalty: ${{minimumRoyalty}}/year
   - Additional Payments: {{additionalPayments}}

4. LICENSEE OBLIGATIONS
4.1 Licensee will:
   {{licenseeObligations}}

5. LICENSOR OBLIGATIONS
5.1 Licensor will:
   {{licensorObligations}}

6. ACCEPTANCE
This Proposal shall become effective upon written acceptance by Licensor within {{acceptancePeriod}} days.

Licensee:
_________________________
{{contractorName}}
Date: _________________

Licensor:
_________________________
{{clientName}}
Date: _________________',
  '[
    {"id": "proposalDate", "label": "Proposal Date", "type": "date", "required": true},
    {"id": "contractorName", "label": "Licensee Name", "type": "text", "required": true},
    {"id": "clientName", "label": "Licensor Name", "type": "text", "required": true},
    {"id": "licensedProperty", "label": "Licensed Property", "type": "text", "required": true},
    {"id": "propertyDescription", "label": "Property Description", "type": "textarea", "required": true},
    {"id": "ipRights", "label": "IP Rights", "type": "textarea", "required": true},
    {"id": "territory", "label": "Territory", "type": "text", "required": false},
    {"id": "licenseType", "label": "License Type", "type": "text", "required": true},
    {"id": "licenseScope", "label": "License Scope", "type": "textarea", "required": true},
    {"id": "exclusivity", "label": "Exclusivity", "type": "text", "required": false},
    {"id": "licenseDuration", "label": "License Duration", "type": "text", "required": true},
    {"id": "permittedUses", "label": "Permitted Uses", "type": "textarea", "required": true},
    {"id": "totalLicenseFee", "label": "Total License Fee", "type": "number", "required": true},
    {"id": "initialLicenseFee", "label": "Initial License Fee", "type": "number", "required": true},
    {"id": "initialPercentage", "label": "Initial License Fee Percentage", "type": "number", "required": false},
    {"id": "royaltyRate", "label": "Royalty Rate (%)", "type": "number", "required": false},
    {"id": "royaltyBase", "label": "Royalty Base", "type": "text", "required": false},
    {"id": "minimumRoyalty", "label": "Minimum Annual Royalty", "type": "number", "required": false},
    {"id": "additionalPayments", "label": "Additional Payments", "type": "textarea", "required": false},
    {"id": "licenseeObligations", "label": "Licensee Obligations", "type": "textarea", "required": false},
    {"id": "licensorObligations", "label": "Licensor Obligations", "type": "textarea", "required": false},
    {"id": "acceptancePeriod", "label": "Acceptance Period (days)", "type": "number", "required": false}
  ]'::jsonb,
  'proposal'
);

-- 13. Research & Development Proposal
INSERT INTO default_contract_templates (name, category, description, content, fields, contract_type) VALUES (
  'Research & Development Proposal',
  'Proposals',
  'Research and development proposal template. Ideal for R&D partnerships, innovation projects, and research collaboration proposals.',
  'RESEARCH & DEVELOPMENT PROPOSAL

This Research & Development Proposal ("Proposal") is submitted on {{proposalDate}} by {{contractorName}} ("Researcher") to {{clientName}} ("Partner").

WHEREAS, Researcher specializes in {{researchArea}}; and
WHEREAS, Partner seeks to collaborate on {{researchProject}};

NOW, THEREFORE, Researcher proposes the following:

1. RESEARCH PROJECT OVERVIEW
1.1 Project Title: {{projectTitle}}
1.2 Research Area: {{researchArea}}
1.3 Research Objectives: {{researchObjectives}}
1.4 Expected Outcomes: {{expectedOutcomes}}
1.5 Research Methodology: {{researchMethodology}}

2. SCOPE OF WORK
2.1 Research Activities:
   {{researchActivities}}

2.2 Deliverables:
   {{deliverables}}

2.3 Timeline: {{timeline}}

3. COMPENSATION OFFER
3.1 Total Compensation: ${{totalCompensation}}
3.2 Payment Schedule:
   - Initial Payment: ${{initialPayment}} ({{initialPercentage}}%) upon acceptance
   - Milestone Payments: {{milestonePayments}}
   - Final Payment: ${{finalPayment}} upon completion

4. INTELLECTUAL PROPERTY
4.1 IP Ownership: {{ipOwnership}}
4.2 Publication Rights: {{publicationRights}}
4.3 Commercialization Rights: {{commercializationRights}}

5. COLLABORATION TERMS
5.1 Partner Contributions: {{partnerContributions}}
5.2 Researcher Responsibilities: {{researcherResponsibilities}}

6. ACCEPTANCE
This Proposal shall become effective upon written acceptance by Partner within {{acceptancePeriod}} days.

Researcher:
_________________________
{{contractorName}}
Date: _________________

Partner:
_________________________
{{clientName}}
Date: _________________',
  '[
    {"id": "proposalDate", "label": "Proposal Date", "type": "date", "required": true},
    {"id": "contractorName", "label": "Researcher Name", "type": "text", "required": true},
    {"id": "clientName", "label": "Partner Name", "type": "text", "required": true},
    {"id": "researchArea", "label": "Research Area", "type": "text", "required": true},
    {"id": "researchProject", "label": "Research Project", "type": "text", "required": true},
    {"id": "projectTitle", "label": "Project Title", "type": "text", "required": true},
    {"id": "researchObjectives", "label": "Research Objectives", "type": "textarea", "required": true},
    {"id": "expectedOutcomes", "label": "Expected Outcomes", "type": "textarea", "required": true},
    {"id": "researchMethodology", "label": "Research Methodology", "type": "textarea", "required": false},
    {"id": "researchActivities", "label": "Research Activities", "type": "textarea", "required": true},
    {"id": "deliverables", "label": "Deliverables", "type": "textarea", "required": true},
    {"id": "timeline", "label": "Timeline", "type": "text", "required": false},
    {"id": "totalCompensation", "label": "Total Compensation", "type": "number", "required": true},
    {"id": "initialPayment", "label": "Initial Payment", "type": "number", "required": true},
    {"id": "initialPercentage", "label": "Initial Payment Percentage", "type": "number", "required": false},
    {"id": "milestonePayments", "label": "Milestone Payments", "type": "textarea", "required": false},
    {"id": "finalPayment", "label": "Final Payment", "type": "number", "required": false},
    {"id": "ipOwnership", "label": "IP Ownership", "type": "textarea", "required": false},
    {"id": "publicationRights", "label": "Publication Rights", "type": "textarea", "required": false},
    {"id": "commercializationRights", "label": "Commercialization Rights", "type": "textarea", "required": false},
    {"id": "partnerContributions", "label": "Partner Contributions", "type": "textarea", "required": false},
    {"id": "researcherResponsibilities", "label": "Researcher Responsibilities", "type": "textarea", "required": false},
    {"id": "acceptancePeriod", "label": "Acceptance Period (days)", "type": "number", "required": false}
  ]'::jsonb,
  'proposal'
);

-- 14. Manufacturing Proposal
INSERT INTO default_contract_templates (name, category, description, content, fields, contract_type) VALUES (
  'Manufacturing Proposal',
  'Proposals',
  'Manufacturing and production proposal template. Perfect for manufacturing partnerships, production agreements, and manufacturing service proposals.',
  'MANUFACTURING PROPOSAL

This Manufacturing Proposal ("Proposal") is submitted on {{proposalDate}} by {{contractorName}} ("Manufacturer") to {{clientName}} ("Client").

WHEREAS, Manufacturer has capabilities in {{manufacturingType}}; and
WHEREAS, Client requires manufacturing services for {{productDescription}};

NOW, THEREFORE, Manufacturer proposes the following:

1. MANUFACTURING OVERVIEW
1.1 Product Description: {{productDescription}}
1.2 Manufacturing Type: {{manufacturingType}}
1.3 Production Volume: {{productionVolume}} units
1.4 Quality Standards: {{qualityStandards}}
1.5 Manufacturing Location: {{manufacturingLocation}}

2. MANUFACTURING SERVICES
2.1 Services Included:
   {{servicesIncluded}}

2.2 Production Process:
   {{productionProcess}}

3. TIMELINE
3.1 Production Start: {{startDate}}
3.2 First Delivery: {{firstDeliveryDate}}
3.3 Completion Date: {{completionDate}}
3.4 Production Schedule: {{productionSchedule}}

4. COMPENSATION OFFER
4.1 Total Compensation: ${{totalCompensation}}
4.2 Payment Structure:
   - Initial Payment: ${{initialPayment}} ({{initialPercentage}}%) upon acceptance
   - Production Milestones: {{productionMilestones}}
   - Final Payment: ${{finalPayment}} upon final delivery

5. QUALITY ASSURANCE
5.1 Quality Control: {{qualityControl}}
5.2 Inspection Rights: {{inspectionRights}}
5.3 Warranty: {{warrantyTerms}}

6. DELIVERY TERMS
6.1 Delivery Method: {{deliveryMethod}}
6.2 Shipping Terms: {{shippingTerms}}
6.3 Delivery Locations: {{deliveryLocations}}

7. ACCEPTANCE
This Proposal shall become effective upon written acceptance by Client within {{acceptancePeriod}} days.

Manufacturer:
_________________________
{{contractorName}}
Date: _________________

Client:
_________________________
{{clientName}}
Date: _________________',
  '[
    {"id": "proposalDate", "label": "Proposal Date", "type": "date", "required": true},
    {"id": "contractorName", "label": "Manufacturer Name", "type": "text", "required": true},
    {"id": "clientName", "label": "Client Name", "type": "text", "required": true},
    {"id": "manufacturingType", "label": "Manufacturing Type", "type": "text", "required": true},
    {"id": "productDescription", "label": "Product Description", "type": "textarea", "required": true},
    {"id": "productionVolume", "label": "Production Volume", "type": "number", "required": true},
    {"id": "qualityStandards", "label": "Quality Standards", "type": "textarea", "required": false},
    {"id": "manufacturingLocation", "label": "Manufacturing Location", "type": "text", "required": false},
    {"id": "servicesIncluded", "label": "Services Included", "type": "textarea", "required": true},
    {"id": "productionProcess", "label": "Production Process", "type": "textarea", "required": false},
    {"id": "startDate", "label": "Production Start Date", "type": "date", "required": true},
    {"id": "firstDeliveryDate", "label": "First Delivery Date", "type": "date", "required": false},
    {"id": "completionDate", "label": "Completion Date", "type": "date", "required": true},
    {"id": "productionSchedule", "label": "Production Schedule", "type": "textarea", "required": false},
    {"id": "totalCompensation", "label": "Total Compensation", "type": "number", "required": true},
    {"id": "initialPayment", "label": "Initial Payment", "type": "number", "required": true},
    {"id": "initialPercentage", "label": "Initial Payment Percentage", "type": "number", "required": false},
    {"id": "productionMilestones", "label": "Production Milestones", "type": "textarea", "required": false},
    {"id": "finalPayment", "label": "Final Payment", "type": "number", "required": false},
    {"id": "qualityControl", "label": "Quality Control", "type": "textarea", "required": false},
    {"id": "inspectionRights", "label": "Inspection Rights", "type": "textarea", "required": false},
    {"id": "warrantyTerms", "label": "Warranty Terms", "type": "textarea", "required": false},
    {"id": "deliveryMethod", "label": "Delivery Method", "type": "text", "required": false},
    {"id": "shippingTerms", "label": "Shipping Terms", "type": "textarea", "required": false},
    {"id": "deliveryLocations", "label": "Delivery Locations", "type": "textarea", "required": false},
    {"id": "acceptancePeriod", "label": "Acceptance Period (days)", "type": "number", "required": false}
  ]'::jsonb,
  'proposal'
);

-- 15. Distribution Proposal
INSERT INTO default_contract_templates (name, category, description, content, fields, contract_type) VALUES (
  'Distribution Proposal',
  'Proposals',
  'Distribution and sales proposal template. Ideal for distribution partnerships, sales channel agreements, and distribution service proposals.',
  'DISTRIBUTION PROPOSAL

This Distribution Proposal ("Proposal") is submitted on {{proposalDate}} by {{contractorName}} ("Distributor") to {{clientName}} ("Supplier").

WHEREAS, Distributor has distribution capabilities in {{distributionChannels}}; and
WHEREAS, Supplier seeks to distribute {{productDescription}};

NOW, THEREFORE, Distributor proposes the following:

1. DISTRIBUTION OVERVIEW
1.1 Products: {{productDescription}}
1.2 Distribution Channels: {{distributionChannels}}
1.3 Territory: {{territory}}
1.4 Distribution Type: {{distributionType}}
1.5 Exclusivity: {{exclusivity}}

2. DISTRIBUTION SERVICES
2.1 Services Provided:
   {{servicesProvided}}

2.2 Sales Targets:
   {{salesTargets}}

3. COMPENSATION OFFER
3.1 Total Compensation: ${{totalCompensation}}
3.2 Payment Structure:
   - Initial Payment: ${{initialPayment}} ({{initialPercentage}}%) upon acceptance
   - Performance-Based Payments: {{performancePayments}}
   - Commission Structure: {{commissionStructure}}

4. DISTRIBUTOR OBLIGATIONS
4.1 Distributor will:
   {{distributorObligations}}

5. SUPPLIER OBLIGATIONS
5.1 Supplier will:
   {{supplierObligations}}

6. TERM & TERMINATION
6.1 Initial Term: {{initialTerm}}
6.2 Renewal Terms: {{renewalTerms}}
6.3 Termination: {{terminationTerms}}

7. ACCEPTANCE
This Proposal shall become effective upon written acceptance by Supplier within {{acceptancePeriod}} days.

Distributor:
_________________________
{{contractorName}}
Date: _________________

Supplier:
_________________________
{{clientName}}
Date: _________________',
  '[
    {"id": "proposalDate", "label": "Proposal Date", "type": "date", "required": true},
    {"id": "contractorName", "label": "Distributor Name", "type": "text", "required": true},
    {"id": "clientName", "label": "Supplier Name", "type": "text", "required": true},
    {"id": "distributionChannels", "label": "Distribution Channels", "type": "textarea", "required": true},
    {"id": "productDescription", "label": "Product Description", "type": "textarea", "required": true},
    {"id": "territory", "label": "Territory", "type": "text", "required": false},
    {"id": "distributionType", "label": "Distribution Type", "type": "text", "required": true},
    {"id": "exclusivity", "label": "Exclusivity", "type": "text", "required": false},
    {"id": "servicesProvided", "label": "Services Provided", "type": "textarea", "required": true},
    {"id": "salesTargets", "label": "Sales Targets", "type": "textarea", "required": false},
    {"id": "totalCompensation", "label": "Total Compensation", "type": "number", "required": true},
    {"id": "initialPayment", "label": "Initial Payment", "type": "number", "required": true},
    {"id": "initialPercentage", "label": "Initial Payment Percentage", "type": "number", "required": false},
    {"id": "performancePayments", "label": "Performance-Based Payments", "type": "textarea", "required": false},
    {"id": "commissionStructure", "label": "Commission Structure", "type": "textarea", "required": false},
    {"id": "distributorObligations", "label": "Distributor Obligations", "type": "textarea", "required": false},
    {"id": "supplierObligations", "label": "Supplier Obligations", "type": "textarea", "required": false},
    {"id": "initialTerm", "label": "Initial Term", "type": "text", "required": false},
    {"id": "renewalTerms", "label": "Renewal Terms", "type": "textarea", "required": false},
    {"id": "terminationTerms", "label": "Termination Terms", "type": "textarea", "required": false},
    {"id": "acceptancePeriod", "label": "Acceptance Period (days)", "type": "number", "required": false}
  ]'::jsonb,
  'proposal'
);

-- 16. Influencer Collaboration Proposal
INSERT INTO default_contract_templates (name, category, description, content, fields, contract_type) VALUES (
  'Influencer Collaboration Proposal',
  'Proposals',
  'Influencer and creator collaboration proposal template. Perfect for influencer partnerships, content creator collaborations, and social media influencer proposals.',
  'INFLUENCER COLLABORATION PROPOSAL

This Influencer Collaboration Proposal ("Proposal") is submitted on {{proposalDate}} by {{contractorName}} ("Influencer") to {{clientName}} ("Brand").

WHEREAS, Influencer has a following in {{targetAudience}}; and
WHEREAS, Brand seeks to collaborate on {{campaignDescription}};

NOW, THEREFORE, Influencer proposes the following:

1. COLLABORATION OVERVIEW
1.1 Campaign Description: {{campaignDescription}}
1.2 Target Audience: {{targetAudience}}
1.3 Platforms: {{platforms}}
1.4 Collaboration Type: {{collaborationType}}
1.5 Campaign Duration: {{campaignDuration}}

2. CONTENT DELIVERABLES
2.1 Content to be Created:
   {{contentDeliverables}}

2.2 Posting Schedule: {{postingSchedule}}
2.3 Content Format: {{contentFormat}}

3. COMPENSATION OFFER
3.1 Total Compensation: ${{totalCompensation}}
3.2 Payment Structure:
   - Initial Payment: ${{initialPayment}} ({{initialPercentage}}%) upon acceptance
   - Content Creation Payment: ${{contentPayment}} upon content delivery
   - Performance Bonus: ${{performanceBonus}} (if {{performanceMetrics}} are achieved)

4. INFLUENCER OBLIGATIONS
4.1 Influencer will:
   {{influencerObligations}}

5. BRAND OBLIGATIONS
5.1 Brand will:
   {{brandObligations}}

6. CONTENT APPROVAL
6.1 Approval Process: {{approvalProcess}}
6.2 Revisions: {{numberOfRevisions}} rounds included

7. ACCEPTANCE
This Proposal shall become effective upon written acceptance by Brand within {{acceptancePeriod}} days.

Influencer:
_________________________
{{contractorName}}
Date: _________________

Brand:
_________________________
{{clientName}}
Date: _________________',
  '[
    {"id": "proposalDate", "label": "Proposal Date", "type": "date", "required": true},
    {"id": "contractorName", "label": "Influencer Name", "type": "text", "required": true},
    {"id": "clientName", "label": "Brand Name", "type": "text", "required": true},
    {"id": "targetAudience", "label": "Target Audience", "type": "text", "required": true},
    {"id": "campaignDescription", "label": "Campaign Description", "type": "textarea", "required": true},
    {"id": "platforms", "label": "Platforms", "type": "textarea", "required": true},
    {"id": "collaborationType", "label": "Collaboration Type", "type": "text", "required": true},
    {"id": "campaignDuration", "label": "Campaign Duration", "type": "text", "required": true},
    {"id": "contentDeliverables", "label": "Content Deliverables", "type": "textarea", "required": true},
    {"id": "postingSchedule", "label": "Posting Schedule", "type": "textarea", "required": false},
    {"id": "contentFormat", "label": "Content Format", "type": "text", "required": false},
    {"id": "totalCompensation", "label": "Total Compensation", "type": "number", "required": true},
    {"id": "initialPayment", "label": "Initial Payment", "type": "number", "required": true},
    {"id": "initialPercentage", "label": "Initial Payment Percentage", "type": "number", "required": false},
    {"id": "contentPayment", "label": "Content Creation Payment", "type": "number", "required": false},
    {"id": "performanceBonus", "label": "Performance Bonus", "type": "number", "required": false},
    {"id": "performanceMetrics", "label": "Performance Metrics for Bonus", "type": "text", "required": false},
    {"id": "influencerObligations", "label": "Influencer Obligations", "type": "textarea", "required": false},
    {"id": "brandObligations", "label": "Brand Obligations", "type": "textarea", "required": false},
    {"id": "approvalProcess", "label": "Approval Process", "type": "textarea", "required": false},
    {"id": "numberOfRevisions", "label": "Number of Revisions", "type": "number", "required": false},
    {"id": "acceptancePeriod", "label": "Acceptance Period (days)", "type": "number", "required": false}
  ]'::jsonb,
  'proposal'
);

-- 17. Brand Ambassador Proposal
INSERT INTO default_contract_templates (name, category, description, content, fields, contract_type) VALUES (
  'Brand Ambassador Proposal',
  'Proposals',
  'Brand ambassador and endorsement proposal template. Ideal for brand ambassador programs, celebrity endorsements, and long-term brand partnerships.',
  'BRAND AMBASSADOR PROPOSAL

This Brand Ambassador Proposal ("Proposal") is submitted on {{proposalDate}} by {{contractorName}} ("Ambassador") to {{clientName}} ("Brand").

WHEREAS, Ambassador has influence and reach in {{targetMarket}}; and
WHEREAS, Brand seeks a brand ambassador for {{brandDescription}};

NOW, THEREFORE, Ambassador proposes the following:

1. BRAND AMBASSADORSHIP OVERVIEW
1.1 Brand: {{brandDescription}}
1.2 Target Market: {{targetMarket}}
1.3 Ambassadorship Type: {{ambassadorshipType}}
1.4 Duration: {{duration}}
1.5 Scope: {{scope}}

2. AMBASSADOR ACTIVITIES
2.1 Activities to be Performed:
   {{activities}}

2.2 Content Creation: {{contentCreation}}
2.3 Event Appearances: {{eventAppearances}}
2.4 Social Media Promotion: {{socialMediaPromotion}}

3. COMPENSATION OFFER
3.1 Total Compensation: ${{totalCompensation}}
3.2 Payment Structure:
   - Initial Payment: ${{initialPayment}} ({{initialPercentage}}%) upon acceptance
   - Monthly Retainer: ${{monthlyRetainer}} for {{numberOfMonths}} months
   - Performance Bonuses: {{performanceBonuses}}
   - Product/Service Compensation: {{productCompensation}}

4. AMBASSADOR OBLIGATIONS
4.1 Ambassador will:
   {{ambassadorObligations}}

5. BRAND OBLIGATIONS
5.1 Brand will:
   {{brandObligations}}

6. EXCLUSIVITY
6.1 Exclusivity Terms: {{exclusivityTerms}}

7. ACCEPTANCE
This Proposal shall become effective upon written acceptance by Brand within {{acceptancePeriod}} days.

Ambassador:
_________________________
{{contractorName}}
Date: _________________

Brand:
_________________________
{{clientName}}
Date: _________________',
  '[
    {"id": "proposalDate", "label": "Proposal Date", "type": "date", "required": true},
    {"id": "contractorName", "label": "Ambassador Name", "type": "text", "required": true},
    {"id": "clientName", "label": "Brand Name", "type": "text", "required": true},
    {"id": "targetMarket", "label": "Target Market", "type": "text", "required": true},
    {"id": "brandDescription", "label": "Brand Description", "type": "textarea", "required": true},
    {"id": "ambassadorshipType", "label": "Ambassadorship Type", "type": "text", "required": true},
    {"id": "duration", "label": "Duration", "type": "text", "required": true},
    {"id": "scope", "label": "Scope", "type": "textarea", "required": true},
    {"id": "activities", "label": "Activities", "type": "textarea", "required": true},
    {"id": "contentCreation", "label": "Content Creation", "type": "textarea", "required": false},
    {"id": "eventAppearances", "label": "Event Appearances", "type": "textarea", "required": false},
    {"id": "socialMediaPromotion", "label": "Social Media Promotion", "type": "textarea", "required": false},
    {"id": "totalCompensation", "label": "Total Compensation", "type": "number", "required": true},
    {"id": "initialPayment", "label": "Initial Payment", "type": "number", "required": true},
    {"id": "initialPercentage", "label": "Initial Payment Percentage", "type": "number", "required": false},
    {"id": "monthlyRetainer", "label": "Monthly Retainer", "type": "number", "required": false},
    {"id": "numberOfMonths", "label": "Number of Months", "type": "number", "required": false},
    {"id": "performanceBonuses", "label": "Performance Bonuses", "type": "textarea", "required": false},
    {"id": "productCompensation", "label": "Product/Service Compensation", "type": "textarea", "required": false},
    {"id": "ambassadorObligations", "label": "Ambassador Obligations", "type": "textarea", "required": false},
    {"id": "brandObligations", "label": "Brand Obligations", "type": "textarea", "required": false},
    {"id": "exclusivityTerms", "label": "Exclusivity Terms", "type": "textarea", "required": false},
    {"id": "acceptancePeriod", "label": "Acceptance Period (days)", "type": "number", "required": false}
  ]'::jsonb,
  'proposal'
);

-- 18. Technology Integration Proposal
INSERT INTO default_contract_templates (name, category, description, content, fields, contract_type) VALUES (
  'Technology Integration Proposal',
  'Proposals',
  'Technology integration and implementation proposal template. Perfect for software integration, system implementation, and technology partnership proposals.',
  'TECHNOLOGY INTEGRATION PROPOSAL

This Technology Integration Proposal ("Proposal") is submitted on {{proposalDate}} by {{contractorName}} ("Integrator") to {{clientName}} ("Client").

WHEREAS, Integrator specializes in {{technologyType}} integration; and
WHEREAS, Client requires integration services for {{integrationPurpose}};

NOW, THEREFORE, Integrator proposes the following:

1. INTEGRATION OVERVIEW
1.1 Integration Type: {{integrationType}}
1.2 Technology Stack: {{technologyStack}}
1.3 Systems to Integrate: {{systemsToIntegrate}}
1.4 Integration Purpose: {{integrationPurpose}}
1.5 Expected Benefits: {{expectedBenefits}}

2. INTEGRATION SERVICES
2.1 Services Included:
   {{servicesIncluded}}

2.2 Integration Approach: {{integrationApproach}}
2.3 Testing & Quality Assurance: {{testingQA}}

3. TIMELINE
3.1 Project Start: {{startDate}}
3.2 Integration Phases: {{integrationPhases}}
3.3 Completion Date: {{completionDate}}

4. COMPENSATION OFFER
4.1 Total Compensation: ${{totalCompensation}}
4.2 Payment Schedule:
   - Initial Payment: ${{initialPayment}} ({{initialPercentage}}%) upon acceptance
   - Phase Payments: {{phasePayments}}
   - Final Payment: ${{finalPayment}} upon completion

5. SUPPORT & MAINTENANCE
5.1 Post-Integration Support: {{supportPeriod}} months included
5.2 Maintenance: ${{monthlyMaintenance}}/month after support period

6. INTEGRATOR OBLIGATIONS
6.1 Integrator will:
   {{integratorObligations}}

7. CLIENT OBLIGATIONS
7.1 Client will:
   {{clientObligations}}

8. ACCEPTANCE
This Proposal shall become effective upon written acceptance by Client within {{acceptancePeriod}} days.

Integrator:
_________________________
{{contractorName}}
Date: _________________

Client:
_________________________
{{clientName}}
Date: _________________',
  '[
    {"id": "proposalDate", "label": "Proposal Date", "type": "date", "required": true},
    {"id": "contractorName", "label": "Integrator Name", "type": "text", "required": true},
    {"id": "clientName", "label": "Client Name", "type": "text", "required": true},
    {"id": "technologyType", "label": "Technology Type", "type": "text", "required": true},
    {"id": "integrationPurpose", "label": "Integration Purpose", "type": "textarea", "required": true},
    {"id": "integrationType", "label": "Integration Type", "type": "text", "required": true},
    {"id": "technologyStack", "label": "Technology Stack", "type": "textarea", "required": true},
    {"id": "systemsToIntegrate", "label": "Systems to Integrate", "type": "textarea", "required": true},
    {"id": "expectedBenefits", "label": "Expected Benefits", "type": "textarea", "required": false},
    {"id": "servicesIncluded", "label": "Services Included", "type": "textarea", "required": true},
    {"id": "integrationApproach", "label": "Integration Approach", "type": "textarea", "required": false},
    {"id": "testingQA", "label": "Testing & Quality Assurance", "type": "textarea", "required": false},
    {"id": "startDate", "label": "Start Date", "type": "date", "required": true},
    {"id": "integrationPhases", "label": "Integration Phases", "type": "textarea", "required": false},
    {"id": "completionDate", "label": "Completion Date", "type": "date", "required": true},
    {"id": "totalCompensation", "label": "Total Compensation", "type": "number", "required": true},
    {"id": "initialPayment", "label": "Initial Payment", "type": "number", "required": true},
    {"id": "initialPercentage", "label": "Initial Payment Percentage", "type": "number", "required": false},
    {"id": "phasePayments", "label": "Phase Payments", "type": "textarea", "required": false},
    {"id": "finalPayment", "label": "Final Payment", "type": "number", "required": false},
    {"id": "supportPeriod", "label": "Support Period (months)", "type": "number", "required": false},
    {"id": "monthlyMaintenance", "label": "Monthly Maintenance Fee", "type": "number", "required": false},
    {"id": "integratorObligations", "label": "Integrator Obligations", "type": "textarea", "required": false},
    {"id": "clientObligations", "label": "Client Obligations", "type": "textarea", "required": false},
    {"id": "acceptancePeriod", "label": "Acceptance Period (days)", "type": "number", "required": false}
  ]'::jsonb,
  'proposal'
);

-- 19. Training & Education Proposal
INSERT INTO default_contract_templates (name, category, description, content, fields, contract_type) VALUES (
  'Training & Education Proposal',
  'Proposals',
  'Training and education services proposal template. Ideal for corporate training, educational programs, workshops, and professional development proposals.',
  'TRAINING & EDUCATION PROPOSAL

This Training & Education Proposal ("Proposal") is submitted on {{proposalDate}} by {{contractorName}} ("Trainer") to {{clientName}} ("Client").

WHEREAS, Trainer specializes in {{trainingSubject}}; and
WHEREAS, Client requires training services for {{trainingPurpose}};

NOW, THEREFORE, Trainer proposes the following:

1. TRAINING OVERVIEW
1.1 Training Subject: {{trainingSubject}}
1.2 Training Purpose: {{trainingPurpose}}
1.3 Target Audience: {{targetAudience}}
1.4 Training Format: {{trainingFormat}}
1.5 Training Duration: {{trainingDuration}}

2. TRAINING PROGRAM
2.1 Curriculum:
   {{curriculum}}

2.2 Learning Objectives: {{learningObjectives}}
2.3 Training Materials: {{trainingMaterials}}
2.4 Assessment Methods: {{assessmentMethods}}

3. TIMELINE
3.1 Program Start: {{startDate}}
3.2 Program End: {{endDate}}
3.3 Training Schedule: {{trainingSchedule}}

4. COMPENSATION OFFER
4.1 Total Compensation: ${{totalCompensation}}
4.2 Payment Structure:
   - Initial Payment: ${{initialPayment}} ({{initialPercentage}}%) upon acceptance
   - Session Payments: {{sessionPayments}}
   - Final Payment: ${{finalPayment}} upon completion

5. TRAINER OBLIGATIONS
5.1 Trainer will:
   {{trainerObligations}}

6. CLIENT OBLIGATIONS
6.1 Client will:
   {{clientObligations}}

7. ACCEPTANCE
This Proposal shall become effective upon written acceptance by Client within {{acceptancePeriod}} days.

Trainer:
_________________________
{{contractorName}}
Date: _________________

Client:
_________________________
{{clientName}}
Date: _________________',
  '[
    {"id": "proposalDate", "label": "Proposal Date", "type": "date", "required": true},
    {"id": "contractorName", "label": "Trainer Name", "type": "text", "required": true},
    {"id": "clientName", "label": "Client Name", "type": "text", "required": true},
    {"id": "trainingSubject", "label": "Training Subject", "type": "text", "required": true},
    {"id": "trainingPurpose", "label": "Training Purpose", "type": "textarea", "required": true},
    {"id": "targetAudience", "label": "Target Audience", "type": "text", "required": true},
    {"id": "trainingFormat", "label": "Training Format", "type": "text", "required": true},
    {"id": "trainingDuration", "label": "Training Duration", "type": "text", "required": true},
    {"id": "curriculum", "label": "Curriculum", "type": "textarea", "required": true},
    {"id": "learningObjectives", "label": "Learning Objectives", "type": "textarea", "required": false},
    {"id": "trainingMaterials", "label": "Training Materials", "type": "textarea", "required": false},
    {"id": "assessmentMethods", "label": "Assessment Methods", "type": "textarea", "required": false},
    {"id": "startDate", "label": "Start Date", "type": "date", "required": true},
    {"id": "endDate", "label": "End Date", "type": "date", "required": true},
    {"id": "trainingSchedule", "label": "Training Schedule", "type": "textarea", "required": false},
    {"id": "totalCompensation", "label": "Total Compensation", "type": "number", "required": true},
    {"id": "initialPayment", "label": "Initial Payment", "type": "number", "required": true},
    {"id": "initialPercentage", "label": "Initial Payment Percentage", "type": "number", "required": false},
    {"id": "sessionPayments", "label": "Session Payments", "type": "textarea", "required": false},
    {"id": "finalPayment", "label": "Final Payment", "type": "number", "required": false},
    {"id": "trainerObligations", "label": "Trainer Obligations", "type": "textarea", "required": false},
    {"id": "clientObligations", "label": "Client Obligations", "type": "textarea", "required": false},
    {"id": "acceptancePeriod", "label": "Acceptance Period (days)", "type": "number", "required": false}
  ]'::jsonb,
  'proposal'
);

-- 20. Maintenance & Support Proposal
INSERT INTO default_contract_templates (name, category, description, content, fields, contract_type) VALUES (
  'Maintenance & Support Proposal',
  'Proposals',
  'Maintenance and support services proposal template. Perfect for ongoing maintenance, technical support, and service agreements.',
  'MAINTENANCE & SUPPORT PROPOSAL

This Maintenance & Support Proposal ("Proposal") is submitted on {{proposalDate}} by {{contractorName}} ("Service Provider") to {{clientName}} ("Client").

WHEREAS, Service Provider offers {{serviceType}} maintenance and support; and
WHEREAS, Client requires ongoing maintenance and support for {{supportedSystem}};

NOW, THEREFORE, Service Provider proposes the following:

1. SERVICE OVERVIEW
1.1 Service Type: {{serviceType}}
1.2 Supported System: {{supportedSystem}}
1.3 Service Level: {{serviceLevel}}
1.4 Coverage: {{coverage}}
1.5 Service Hours: {{serviceHours}}

2. MAINTENANCE SERVICES
2.1 Services Included:
   {{servicesIncluded}}

2.2 Support Channels: {{supportChannels}}
2.3 Response Times: {{responseTimes}}
2.4 Maintenance Schedule: {{maintenanceSchedule}}

3. SERVICE TERM
3.1 Initial Term: {{initialTerm}}
3.2 Start Date: {{startDate}}
3.3 Renewal Terms: {{renewalTerms}}

4. COMPENSATION OFFER
4.1 Total Compensation: ${{totalCompensation}}
4.2 Payment Structure:
   - Initial Payment: ${{initialPayment}} ({{initialPercentage}}%) upon acceptance
   - Monthly Fee: ${{monthlyFee}}/month
   - Additional Services: {{additionalServices}}

5. SERVICE PROVIDER OBLIGATIONS
5.1 Service Provider will:
   {{serviceProviderObligations}}

6. CLIENT OBLIGATIONS
6.1 Client will:
   {{clientObligations}}

7. ACCEPTANCE
This Proposal shall become effective upon written acceptance by Client within {{acceptancePeriod}} days.

Service Provider:
_________________________
{{contractorName}}
Date: _________________

Client:
_________________________
{{clientName}}
Date: _________________',
  '[
    {"id": "proposalDate", "label": "Proposal Date", "type": "date", "required": true},
    {"id": "contractorName", "label": "Service Provider Name", "type": "text", "required": true},
    {"id": "clientName", "label": "Client Name", "type": "text", "required": true},
    {"id": "serviceType", "label": "Service Type", "type": "text", "required": true},
    {"id": "supportedSystem", "label": "Supported System", "type": "text", "required": true},
    {"id": "serviceLevel", "label": "Service Level", "type": "text", "required": true},
    {"id": "coverage", "label": "Coverage", "type": "textarea", "required": false},
    {"id": "serviceHours", "label": "Service Hours", "type": "text", "required": false},
    {"id": "servicesIncluded", "label": "Services Included", "type": "textarea", "required": true},
    {"id": "supportChannels", "label": "Support Channels", "type": "textarea", "required": false},
    {"id": "responseTimes", "label": "Response Times", "type": "textarea", "required": false},
    {"id": "maintenanceSchedule", "label": "Maintenance Schedule", "type": "textarea", "required": false},
    {"id": "initialTerm", "label": "Initial Term", "type": "text", "required": true},
    {"id": "startDate", "label": "Start Date", "type": "date", "required": true},
    {"id": "renewalTerms", "label": "Renewal Terms", "type": "textarea", "required": false},
    {"id": "totalCompensation", "label": "Total Compensation", "type": "number", "required": true},
    {"id": "initialPayment", "label": "Initial Payment", "type": "number", "required": true},
    {"id": "initialPercentage", "label": "Initial Payment Percentage", "type": "number", "required": false},
    {"id": "monthlyFee", "label": "Monthly Fee", "type": "number", "required": false},
    {"id": "additionalServices", "label": "Additional Services", "type": "textarea", "required": false},
    {"id": "serviceProviderObligations", "label": "Service Provider Obligations", "type": "textarea", "required": false},
    {"id": "clientObligations", "label": "Client Obligations", "type": "textarea", "required": false},
    {"id": "acceptancePeriod", "label": "Acceptance Period (days)", "type": "number", "required": false}
  ]'::jsonb,
  'proposal'
);

-- 21. Market Research Proposal
INSERT INTO default_contract_templates (name, category, description, content, fields, contract_type) VALUES (
  'Market Research Proposal',
  'Proposals',
  'Market research and analysis proposal template. Ideal for market studies, consumer research, competitive analysis, and research projects.',
  'MARKET RESEARCH PROPOSAL

This Market Research Proposal ("Proposal") is submitted on {{proposalDate}} by {{contractorName}} ("Researcher") to {{clientName}} ("Client").

WHEREAS, Researcher specializes in {{researchType}}; and
WHEREAS, Client requires market research for {{researchPurpose}};

NOW, THEREFORE, Researcher proposes the following:

1. RESEARCH OVERVIEW
1.1 Research Type: {{researchType}}
1.2 Research Purpose: {{researchPurpose}}
1.3 Research Objectives: {{researchObjectives}}
1.4 Target Market: {{targetMarket}}
1.5 Research Scope: {{researchScope}}

2. RESEARCH METHODOLOGY
2.1 Methodology: {{methodology}}
2.2 Data Collection Methods: {{dataCollectionMethods}}
2.3 Sample Size: {{sampleSize}}
2.4 Research Timeline: {{researchTimeline}}

3. DELIVERABLES
3.1 Research Deliverables:
   {{deliverables}}

3.2 Reporting: {{reportingFormat}}

4. COMPENSATION OFFER
4.1 Total Compensation: ${{totalCompensation}}
4.2 Payment Schedule:
   - Initial Payment: ${{initialPayment}} ({{initialPercentage}}%) upon acceptance
   - Milestone Payments: {{milestonePayments}}
   - Final Payment: ${{finalPayment}} upon delivery

5. RESEARCHER OBLIGATIONS
5.1 Researcher will:
   {{researcherObligations}}

6. CLIENT OBLIGATIONS
6.1 Client will:
   {{clientObligations}}

7. CONFIDENTIALITY
7.1 All research data and findings will be kept confidential.

8. ACCEPTANCE
This Proposal shall become effective upon written acceptance by Client within {{acceptancePeriod}} days.

Researcher:
_________________________
{{contractorName}}
Date: _________________

Client:
_________________________
{{clientName}}
Date: _________________',
  '[
    {"id": "proposalDate", "label": "Proposal Date", "type": "date", "required": true},
    {"id": "contractorName", "label": "Researcher Name", "type": "text", "required": true},
    {"id": "clientName", "label": "Client Name", "type": "text", "required": true},
    {"id": "researchType", "label": "Research Type", "type": "text", "required": true},
    {"id": "researchPurpose", "label": "Research Purpose", "type": "textarea", "required": true},
    {"id": "researchObjectives", "label": "Research Objectives", "type": "textarea", "required": true},
    {"id": "targetMarket", "label": "Target Market", "type": "text", "required": true},
    {"id": "researchScope", "label": "Research Scope", "type": "textarea", "required": true},
    {"id": "methodology", "label": "Methodology", "type": "textarea", "required": true},
    {"id": "dataCollectionMethods", "label": "Data Collection Methods", "type": "textarea", "required": false},
    {"id": "sampleSize", "label": "Sample Size", "type": "text", "required": false},
    {"id": "researchTimeline", "label": "Research Timeline", "type": "text", "required": false},
    {"id": "deliverables", "label": "Deliverables", "type": "textarea", "required": true},
    {"id": "reportingFormat", "label": "Reporting Format", "type": "text", "required": false},
    {"id": "totalCompensation", "label": "Total Compensation", "type": "number", "required": true},
    {"id": "initialPayment", "label": "Initial Payment", "type": "number", "required": true},
    {"id": "initialPercentage", "label": "Initial Payment Percentage", "type": "number", "required": false},
    {"id": "milestonePayments", "label": "Milestone Payments", "type": "textarea", "required": false},
    {"id": "finalPayment", "label": "Final Payment", "type": "number", "required": false},
    {"id": "researcherObligations", "label": "Researcher Obligations", "type": "textarea", "required": false},
    {"id": "clientObligations", "label": "Client Obligations", "type": "textarea", "required": false},
    {"id": "acceptancePeriod", "label": "Acceptance Period (days)", "type": "number", "required": false}
  ]'::jsonb,
  'proposal'
);

-- 22. Product Launch Proposal
INSERT INTO default_contract_templates (name, category, description, content, fields, contract_type) VALUES (
  'Product Launch Proposal',
  'Proposals',
  'Product launch and go-to-market proposal template. Perfect for new product launches, product marketing, and launch campaign proposals.',
  'PRODUCT LAUNCH PROPOSAL

This Product Launch Proposal ("Proposal") is submitted on {{proposalDate}} by {{contractorName}} ("Launch Partner") to {{clientName}} ("Company").

WHEREAS, Launch Partner specializes in {{launchServices}}; and
WHEREAS, Company seeks to launch {{productName}};

NOW, THEREFORE, Launch Partner proposes the following:

1. PRODUCT LAUNCH OVERVIEW
1.1 Product Name: {{productName}}
1.2 Product Description: {{productDescription}}
1.3 Launch Date: {{launchDate}}
1.4 Target Market: {{targetMarket}}
1.5 Launch Objectives: {{launchObjectives}}

2. LAUNCH SERVICES
2.1 Services Included:
   {{servicesIncluded}}

2.2 Launch Strategy: {{launchStrategy}}
2.3 Marketing Channels: {{marketingChannels}}
2.4 Launch Activities: {{launchActivities}}

3. TIMELINE
3.1 Pre-Launch Period: {{preLaunchPeriod}}
3.2 Launch Date: {{launchDate}}
3.3 Post-Launch Period: {{postLaunchPeriod}}
3.4 Key Milestones: {{keyMilestones}}

4. COMPENSATION OFFER
4.1 Total Compensation: ${{totalCompensation}}
4.2 Payment Structure:
   - Initial Payment: ${{initialPayment}} ({{initialPercentage}}%) upon acceptance
   - Launch Payment: ${{launchPayment}} on launch date
   - Performance Bonus: ${{performanceBonus}} (if {{performanceMetrics}} are achieved)

5. LAUNCH PARTNER OBLIGATIONS
5.1 Launch Partner will:
   {{launchPartnerObligations}}

6. COMPANY OBLIGATIONS
6.1 Company will:
   {{companyObligations}}

7. ACCEPTANCE
This Proposal shall become effective upon written acceptance by Company within {{acceptancePeriod}} days.

Launch Partner:
_________________________
{{contractorName}}
Date: _________________

Company:
_________________________
{{clientName}}
Date: _________________',
  '[
    {"id": "proposalDate", "label": "Proposal Date", "type": "date", "required": true},
    {"id": "contractorName", "label": "Launch Partner Name", "type": "text", "required": true},
    {"id": "clientName", "label": "Company Name", "type": "text", "required": true},
    {"id": "launchServices", "label": "Launch Services", "type": "text", "required": true},
    {"id": "productName", "label": "Product Name", "type": "text", "required": true},
    {"id": "productDescription", "label": "Product Description", "type": "textarea", "required": true},
    {"id": "launchDate", "label": "Launch Date", "type": "date", "required": true},
    {"id": "targetMarket", "label": "Target Market", "type": "text", "required": true},
    {"id": "launchObjectives", "label": "Launch Objectives", "type": "textarea", "required": true},
    {"id": "servicesIncluded", "label": "Services Included", "type": "textarea", "required": true},
    {"id": "launchStrategy", "label": "Launch Strategy", "type": "textarea", "required": true},
    {"id": "marketingChannels", "label": "Marketing Channels", "type": "textarea", "required": false},
    {"id": "launchActivities", "label": "Launch Activities", "type": "textarea", "required": false},
    {"id": "preLaunchPeriod", "label": "Pre-Launch Period", "type": "text", "required": false},
    {"id": "postLaunchPeriod", "label": "Post-Launch Period", "type": "text", "required": false},
    {"id": "keyMilestones", "label": "Key Milestones", "type": "textarea", "required": false},
    {"id": "totalCompensation", "label": "Total Compensation", "type": "number", "required": true},
    {"id": "initialPayment", "label": "Initial Payment", "type": "number", "required": true},
    {"id": "initialPercentage", "label": "Initial Payment Percentage", "type": "number", "required": false},
    {"id": "launchPayment", "label": "Launch Payment", "type": "number", "required": false},
    {"id": "performanceBonus", "label": "Performance Bonus", "type": "number", "required": false},
    {"id": "performanceMetrics", "label": "Performance Metrics for Bonus", "type": "text", "required": false},
    {"id": "launchPartnerObligations", "label": "Launch Partner Obligations", "type": "textarea", "required": false},
    {"id": "companyObligations", "label": "Company Obligations", "type": "textarea", "required": false},
    {"id": "acceptancePeriod", "label": "Acceptance Period (days)", "type": "number", "required": false}
  ]'::jsonb,
  'proposal'
);

-- 23. Affiliate Partnership Proposal
INSERT INTO default_contract_templates (name, category, description, content, fields, contract_type) VALUES (
  'Affiliate Partnership Proposal',
  'Proposals',
  'Affiliate marketing and partnership proposal template. Ideal for affiliate programs, referral partnerships, and performance-based marketing proposals.',
  'AFFILIATE PARTNERSHIP PROPOSAL

This Affiliate Partnership Proposal ("Proposal") is submitted on {{proposalDate}} by {{contractorName}} ("Affiliate") to {{clientName}} ("Merchant").

WHEREAS, Affiliate has reach and influence in {{targetAudience}}; and
WHEREAS, Merchant offers {{productServiceDescription}};

NOW, THEREFORE, Affiliate proposes the following:

1. PARTNERSHIP OVERVIEW
1.1 Partnership Type: {{partnershipType}}
1.2 Products/Services: {{productServiceDescription}}
1.3 Target Audience: {{targetAudience}}
1.4 Partnership Duration: {{partnershipDuration}}
1.5 Promotion Channels: {{promotionChannels}}

2. AFFILIATE SERVICES
2.1 Services Provided:
   {{servicesProvided}}

2.2 Promotion Strategy: {{promotionStrategy}}
2.3 Content Creation: {{contentCreation}}

3. COMPENSATION OFFER
3.1 Total Compensation: ${{totalCompensation}}
3.2 Commission Structure:
   - Commission Rate: {{commissionRate}}%
   - Commission Base: {{commissionBase}}
   - Minimum Guarantee: ${{minimumGuarantee}}
   - Performance Bonuses: {{performanceBonuses}}

4. AFFILIATE OBLIGATIONS
4.1 Affiliate will:
   {{affiliateObligations}}

5. MERCHANT OBLIGATIONS
5.1 Merchant will:
   {{merchantObligations}}

6. TRACKING & REPORTING
6.1 Tracking Method: {{trackingMethod}}
6.2 Reporting: {{reportingSchedule}}

7. TERM & TERMINATION
7.1 Initial Term: {{initialTerm}}
7.2 Renewal: {{renewalTerms}}
7.3 Termination: {{terminationTerms}}

8. ACCEPTANCE
This Proposal shall become effective upon written acceptance by Merchant within {{acceptancePeriod}} days.

Affiliate:
_________________________
{{contractorName}}
Date: _________________

Merchant:
_________________________
{{clientName}}
Date: _________________',
  '[
    {"id": "proposalDate", "label": "Proposal Date", "type": "date", "required": true},
    {"id": "contractorName", "label": "Affiliate Name", "type": "text", "required": true},
    {"id": "clientName", "label": "Merchant Name", "type": "text", "required": true},
    {"id": "targetAudience", "label": "Target Audience", "type": "text", "required": true},
    {"id": "productServiceDescription", "label": "Product/Service Description", "type": "textarea", "required": true},
    {"id": "partnershipType", "label": "Partnership Type", "type": "text", "required": true},
    {"id": "partnershipDuration", "label": "Partnership Duration", "type": "text", "required": true},
    {"id": "promotionChannels", "label": "Promotion Channels", "type": "textarea", "required": true},
    {"id": "servicesProvided", "label": "Services Provided", "type": "textarea", "required": true},
    {"id": "promotionStrategy", "label": "Promotion Strategy", "type": "textarea", "required": false},
    {"id": "contentCreation", "label": "Content Creation", "type": "textarea", "required": false},
    {"id": "totalCompensation", "label": "Total Compensation", "type": "number", "required": true},
    {"id": "commissionRate", "label": "Commission Rate (%)", "type": "number", "required": false},
    {"id": "commissionBase", "label": "Commission Base", "type": "text", "required": false},
    {"id": "minimumGuarantee", "label": "Minimum Guarantee", "type": "number", "required": false},
    {"id": "performanceBonuses", "label": "Performance Bonuses", "type": "textarea", "required": false},
    {"id": "affiliateObligations", "label": "Affiliate Obligations", "type": "textarea", "required": false},
    {"id": "merchantObligations", "label": "Merchant Obligations", "type": "textarea", "required": false},
    {"id": "trackingMethod", "label": "Tracking Method", "type": "text", "required": false},
    {"id": "reportingSchedule", "label": "Reporting Schedule", "type": "text", "required": false},
    {"id": "initialTerm", "label": "Initial Term", "type": "text", "required": false},
    {"id": "renewalTerms", "label": "Renewal Terms", "type": "textarea", "required": false},
    {"id": "terminationTerms", "label": "Termination Terms", "type": "textarea", "required": false},
    {"id": "acceptancePeriod", "label": "Acceptance Period (days)", "type": "number", "required": false}
  ]'::jsonb,
  'proposal'
);

-- 24. Design Services Proposal
INSERT INTO default_contract_templates (name, category, description, content, fields, contract_type) VALUES (
  'Design Services Proposal',
  'Proposals',
  'Design services proposal template. Perfect for graphic design, web design, UI/UX design, and creative design proposals.',
  'DESIGN SERVICES PROPOSAL

This Design Services Proposal ("Proposal") is submitted on {{proposalDate}} by {{contractorName}} ("Designer") to {{clientName}} ("Client").

WHEREAS, Designer specializes in {{designType}}; and
WHEREAS, Client requires design services for {{projectDescription}};

NOW, THEREFORE, Designer proposes the following:

1. DESIGN PROJECT OVERVIEW
1.1 Project Description: {{projectDescription}}
1.2 Design Type: {{designType}}
1.3 Design Scope: {{designScope}}
1.4 Target Audience: {{targetAudience}}
1.5 Design Objectives: {{designObjectives}}

2. DESIGN DELIVERABLES
2.1 Deliverables:
   {{deliverables}}

2.2 Design Formats: {{designFormats}}
2.3 Source Files: {{sourceFiles}}

3. DESIGN PROCESS
3.1 Design Process: {{designProcess}}
3.2 Revisions: {{numberOfRevisions}} rounds included
3.3 Timeline: {{timeline}}

4. COMPENSATION OFFER
4.1 Total Compensation: ${{totalCompensation}}
4.2 Payment Schedule:
   - Initial Payment: ${{initialPayment}} ({{initialPercentage}}%) upon acceptance
   - Design Phase Payment: ${{designPhasePayment}} upon design approval
   - Final Payment: ${{finalPayment}} upon delivery

5. DESIGNER OBLIGATIONS
5.1 Designer will:
   {{designerObligations}}

6. CLIENT OBLIGATIONS
6.1 Client will:
   {{clientObligations}}

7. INTELLECTUAL PROPERTY
7.1 Upon full payment, Client receives all rights to final designs.

8. ACCEPTANCE
This Proposal shall become effective upon written acceptance by Client within {{acceptancePeriod}} days.

Designer:
_________________________
{{contractorName}}
Date: _________________

Client:
_________________________
{{clientName}}
Date: _________________',
  '[
    {"id": "proposalDate", "label": "Proposal Date", "type": "date", "required": true},
    {"id": "contractorName", "label": "Designer Name", "type": "text", "required": true},
    {"id": "clientName", "label": "Client Name", "type": "text", "required": true},
    {"id": "designType", "label": "Design Type", "type": "text", "required": true},
    {"id": "projectDescription", "label": "Project Description", "type": "textarea", "required": true},
    {"id": "designScope", "label": "Design Scope", "type": "textarea", "required": true},
    {"id": "targetAudience", "label": "Target Audience", "type": "text", "required": false},
    {"id": "designObjectives", "label": "Design Objectives", "type": "textarea", "required": true},
    {"id": "deliverables", "label": "Deliverables", "type": "textarea", "required": true},
    {"id": "designFormats", "label": "Design Formats", "type": "textarea", "required": false},
    {"id": "sourceFiles", "label": "Source Files", "type": "text", "required": false},
    {"id": "designProcess", "label": "Design Process", "type": "textarea", "required": false},
    {"id": "numberOfRevisions", "label": "Number of Revisions", "type": "number", "required": false},
    {"id": "timeline", "label": "Timeline", "type": "text", "required": false},
    {"id": "totalCompensation", "label": "Total Compensation", "type": "number", "required": true},
    {"id": "initialPayment", "label": "Initial Payment", "type": "number", "required": true},
    {"id": "initialPercentage", "label": "Initial Payment Percentage", "type": "number", "required": false},
    {"id": "designPhasePayment", "label": "Design Phase Payment", "type": "number", "required": false},
    {"id": "finalPayment", "label": "Final Payment", "type": "number", "required": false},
    {"id": "designerObligations", "label": "Designer Obligations", "type": "textarea", "required": false},
    {"id": "clientObligations", "label": "Client Obligations", "type": "textarea", "required": false},
    {"id": "acceptancePeriod", "label": "Acceptance Period (days)", "type": "number", "required": false}
  ]'::jsonb,
  'proposal'
);

-- 25. Strategic Partnership Proposal
INSERT INTO default_contract_templates (name, category, description, content, fields, contract_type) VALUES (
  'Strategic Partnership Proposal',
  'Proposals',
  'Strategic partnership and alliance proposal template. Ideal for long-term partnerships, strategic alliances, and joint venture proposals.',
  'STRATEGIC PARTNERSHIP PROPOSAL

This Strategic Partnership Proposal ("Proposal") is submitted on {{proposalDate}} by {{contractorName}} ("Partner A") to {{clientName}} ("Partner B").

WHEREAS, Partner A and Partner B seek to establish a strategic partnership; and
WHEREAS, Both parties can benefit from collaboration on {{partnershipFocus}};

NOW, THEREFORE, Partner A proposes the following:

1. PARTNERSHIP OVERVIEW
1.1 Partnership Focus: {{partnershipFocus}}
1.2 Partnership Objectives: {{partnershipObjectives}}
1.3 Partnership Type: {{partnershipType}}
1.4 Partnership Duration: {{partnershipDuration}}
1.5 Strategic Value: {{strategicValue}}

2. PARTNER CONTRIBUTIONS
2.1 Partner A will contribute:
   {{partnerAContributions}}

2.2 Partner B will contribute:
   {{partnerBContributions}}

3. PARTNERSHIP ACTIVITIES
3.1 Joint Activities:
   {{jointActivities}}

3.2 Collaboration Areas: {{collaborationAreas}}

4. COMPENSATION OFFER
4.1 Total Compensation: ${{totalCompensation}}
4.2 Payment Structure:
   - Initial Payment: ${{initialPayment}} ({{initialPercentage}}%) upon acceptance
   - Ongoing Payments: {{ongoingPayments}}
   - Revenue Sharing: {{revenueSharing}}

5. GOVERNANCE
5.1 Decision Making: {{decisionMaking}}
5.2 Management Structure: {{managementStructure}}
5.3 Reporting: {{reportingStructure}}

6. PARTNER OBLIGATIONS
6.1 Partner A Obligations: {{partnerAObligations}}
6.2 Partner B Obligations: {{partnerBObligations}}

7. TERM & TERMINATION
7.1 Initial Term: {{initialTerm}}
7.2 Renewal: {{renewalTerms}}
7.3 Termination: {{terminationTerms}}

8. ACCEPTANCE
This Proposal shall become effective upon written acceptance by Partner B within {{acceptancePeriod}} days.

Partner A:
_________________________
{{contractorName}}
Date: _________________

Partner B:
_________________________
{{clientName}}
Date: _________________',
  '[
    {"id": "proposalDate", "label": "Proposal Date", "type": "date", "required": true},
    {"id": "contractorName", "label": "Partner A Name", "type": "text", "required": true},
    {"id": "clientName", "label": "Partner B Name", "type": "text", "required": true},
    {"id": "partnershipFocus", "label": "Partnership Focus", "type": "textarea", "required": true},
    {"id": "partnershipObjectives", "label": "Partnership Objectives", "type": "textarea", "required": true},
    {"id": "partnershipType", "label": "Partnership Type", "type": "text", "required": true},
    {"id": "partnershipDuration", "label": "Partnership Duration", "type": "text", "required": true},
    {"id": "strategicValue", "label": "Strategic Value", "type": "textarea", "required": false},
    {"id": "partnerAContributions", "label": "Partner A Contributions", "type": "textarea", "required": true},
    {"id": "partnerBContributions", "label": "Partner B Contributions", "type": "textarea", "required": true},
    {"id": "jointActivities", "label": "Joint Activities", "type": "textarea", "required": true},
    {"id": "collaborationAreas", "label": "Collaboration Areas", "type": "textarea", "required": false},
    {"id": "totalCompensation", "label": "Total Compensation", "type": "number", "required": true},
    {"id": "initialPayment", "label": "Initial Payment", "type": "number", "required": true},
    {"id": "initialPercentage", "label": "Initial Payment Percentage", "type": "number", "required": false},
    {"id": "ongoingPayments", "label": "Ongoing Payments", "type": "textarea", "required": false},
    {"id": "revenueSharing", "label": "Revenue Sharing", "type": "textarea", "required": false},
    {"id": "decisionMaking", "label": "Decision Making Process", "type": "textarea", "required": false},
    {"id": "managementStructure", "label": "Management Structure", "type": "textarea", "required": false},
    {"id": "reportingStructure", "label": "Reporting Structure", "type": "textarea", "required": false},
    {"id": "partnerAObligations", "label": "Partner A Obligations", "type": "textarea", "required": false},
    {"id": "partnerBObligations", "label": "Partner B Obligations", "type": "textarea", "required": false},
    {"id": "initialTerm", "label": "Initial Term", "type": "text", "required": false},
    {"id": "renewalTerms", "label": "Renewal Terms", "type": "textarea", "required": false},
    {"id": "terminationTerms", "label": "Termination Terms", "type": "textarea", "required": false},
    {"id": "acceptancePeriod", "label": "Acceptance Period (days)", "type": "number", "required": false}
  ]'::jsonb,
  'proposal'
);
