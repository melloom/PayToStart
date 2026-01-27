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
