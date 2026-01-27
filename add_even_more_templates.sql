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
