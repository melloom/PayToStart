// Script to populate the knowledge base with contract templates and legal documents
// Run with: npx tsx scripts/populate-knowledge-base.ts
// Or: node --loader ts-node/esm scripts/populate-knowledge-base.ts

// IMPORTANT: Load environment variables BEFORE any other imports
// This must be done using require() to ensure it runs before ES6 imports
const dotenv = require("dotenv");
const { resolve } = require("path");

// Load .env.local file
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

// Also try .env if .env.local doesn't exist or OPENAI_API_KEY is still missing
if (!process.env.OPENAI_API_KEY) {
  dotenv.config({ path: resolve(process.cwd(), ".env") });
}

// Validate required environment variables
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ Error: OPENAI_API_KEY is not set!");
  console.error("Please set OPENAI_API_KEY in your .env.local file.");
  console.error("Current working directory:", process.cwd());
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Error: SUPABASE_SERVICE_ROLE_KEY is not set!");
  console.error("Please set SUPABASE_SERVICE_ROLE_KEY in your .env.local file.");
  process.exit(1);
}

// Now safe to import modules that use environment variables
import { createServiceClient } from "../lib/supabase/service";
import { generateEmbedding } from "../lib/ai/embeddings";
import { addKnowledgeBaseEntry } from "../lib/ai/knowledge-base";
import { log } from "../lib/logger";

const supabase = createServiceClient();

interface Template {
  name: string;
  category: string;
  description?: string;
  content: string;
  fields?: any[];
}

// Comprehensive legal principles for training
const legalPrinciples = [
  {
    title: "Essential Contract Elements",
    category: "legal_principle",
    contentType: "principle",
    content: `A valid contract must contain five essential elements:
1. Offer - A clear proposal by one party
2. Acceptance - Unconditional agreement to the offer
3. Consideration - Something of value exchanged between parties
4. Capacity - Both parties must be legally competent
5. Legality - The contract must be for a legal purpose

Without all five elements, a contract may be unenforceable.`,
    metadata: { principleType: "contract_formation" },
  },
  {
    title: "Payment Terms Best Practices",
    category: "legal_principle",
    contentType: "principle",
    content: `Payment terms should be clear and specific:
- Specify exact amounts and currency
- Define payment schedule (deposit, milestones, final payment)
- Include late payment penalties (within legal limits, typically 1.5% per month)
- State payment methods accepted (check, wire, ACH, credit card)
- Define when payment is due (upon completion, net 30, net 15, etc.)
- Include refund policies if applicable
- Specify what happens if payment is delayed (work suspension, interest, collection)
- Define retainage if applicable (common in construction/consulting)
- Include grace periods before penalties apply

Clear payment terms prevent disputes and ensure timely compensation. Always specify currency for international contracts.`,
    metadata: { principleType: "payment_terms" },
  },
  {
    title: "Intellectual Property Rights",
    category: "legal_principle",
    contentType: "principle",
    content: `Intellectual property clauses should clearly define:
- Who owns the work product upon completion
- Whether IP transfers upon full payment or remains with creator
- Rights to use work in portfolio/marketing (typically retained by creator)
- Ownership of pre-existing materials and tools (typically retained by creator)
- Third-party materials and licensing requirements (client responsibility)
- Work-for-hire vs. independent contractor distinctions
- Moral rights (where applicable by jurisdiction)
- Source code ownership vs. compiled deliverables
- License grants (exclusive, non-exclusive, perpetual, limited term)

Clear IP clauses prevent ownership disputes and protect both parties. Always specify what transfers and what is retained.`,
    metadata: { principleType: "intellectual_property" },
  },
  {
    title: "Termination Clauses",
    category: "legal_principle",
    contentType: "principle",
    content: `Termination clauses should specify:
- Conditions for termination (breach, convenience, insolvency, etc.)
- Notice period required (typically 30 days, can be 7-90 days depending on contract)
- Payment obligations upon termination (work completed, expenses, cancellation fees)
- Return of materials and deliverables
- Survival of certain clauses (confidentiality, IP, liability, indemnification)
- Dispute resolution procedures
- Effect on ongoing work and deadlines
- Transition assistance requirements
- Data return/destruction obligations

Well-defined termination clauses protect both parties and provide clear exit strategies. Specify what survives termination.`,
    metadata: { principleType: "termination" },
  },
  {
    title: "Liability Limitations",
    category: "legal_principle",
    contentType: "principle",
    content: `Liability limitation clauses should:
- Limit total liability to contract value or a specified amount (often 1x-2x contract value)
- Exclude indirect, consequential, and punitive damages
- Include disclaimers of warranties (where legally allowed)
- Specify exceptions (gross negligence, willful misconduct, fraud)
- Comply with local laws (some jurisdictions limit liability clauses)
- Include indemnification provisions where appropriate
- Define what constitutes "direct damages" vs "consequential damages"
- Specify time limits for claims (typically 1-2 years after completion)

Proper liability limitations protect service providers while remaining enforceable. Some jurisdictions don't allow limitation of liability for personal injury or fraud.`,
    metadata: { principleType: "liability" },
  },
  {
    title: "Scope of Work Definition",
    category: "legal_principle",
    contentType: "principle",
    content: `Scope of work should be detailed and specific:
- Clearly describe all services to be performed
- Define deliverables with specific criteria
- Include acceptance criteria and testing requirements
- Specify what is NOT included (exclusions)
- Define assumptions and dependencies
- Include change order procedures
- Specify revision limits and additional work pricing
- Define quality standards and performance metrics
- Include timeline and milestone details
- Specify resource requirements and access needs

Vague scope leads to disputes. Be specific about what is included and excluded. Use "includes but not limited to" carefully.`,
    metadata: { principleType: "scope_definition" },
  },
  {
    title: "Confidentiality and NDA Provisions",
    category: "legal_principle",
    contentType: "principle",
    content: `Confidentiality clauses should cover:
- Definition of confidential information (broad vs. narrow)
- Obligations of receiving party (non-disclosure, non-use)
- Exceptions (publicly available, independently developed, required by law)
- Duration of confidentiality (typically 2-5 years, sometimes perpetual)
- Return/destruction of confidential materials
- Permitted disclosures (employees, advisors, with consent)
- Remedies for breach (injunctive relief, damages)
- Survival after termination

Strong confidentiality protects trade secrets and proprietary information. Define what is confidential clearly.`,
    metadata: { principleType: "confidentiality" },
  },
  {
    title: "Warranties and Disclaimers",
    category: "legal_principle",
    contentType: "principle",
    content: `Warranty clauses should balance protection with reality:
- Express warranties (what you specifically guarantee)
- Implied warranty disclaimers (merchantability, fitness for purpose)
- Warranty period and remedies (repair, replace, refund)
- Limitations on warranties (time, scope, conditions)
- "As-is" disclaimers where appropriate
- Performance warranties vs. result warranties
- Third-party service/product warranties
- Compliance with specifications warranties

Be realistic about warranties. Over-promising creates liability. Disclaim implied warranties where legally allowed.`,
    metadata: { principleType: "warranties" },
  },
  {
    title: "Indemnification Provisions",
    category: "legal_principle",
    contentType: "principle",
    content: `Indemnification clauses should specify:
- Who indemnifies whom (typically client indemnifies service provider for client content)
- What triggers indemnification (third-party claims, IP infringement, etc.)
- Scope of indemnification (damages, costs, attorneys' fees)
- Procedures for handling claims (notice, defense, settlement)
- Exceptions to indemnification (service provider's negligence, breach)
- Mutual indemnification where appropriate
- Insurance requirements
- Limits on indemnification (cap on liability)

Indemnification protects against third-party claims. Be specific about what is covered and procedures.`,
    metadata: { principleType: "indemnification" },
  },
  {
    title: "Dispute Resolution Methods",
    category: "legal_principle",
    contentType: "principle",
    content: `Dispute resolution clauses should specify:
- Escalation process (negotiation, mediation, arbitration, litigation)
- Mediation requirements (mandatory or optional, timing)
- Arbitration rules (AAA, JAMS, ICC, ad hoc)
- Arbitration location and language
- Number of arbitrators and selection process
- Class action waivers
- Governing law and jurisdiction
- Attorneys' fees to prevailing party
- Small claims court exceptions

Choose dispute resolution method based on contract value and complexity. Arbitration is faster but limits appeal rights.`,
    metadata: { principleType: "dispute_resolution" },
  },
  {
    title: "Independent Contractor Status",
    category: "legal_principle",
    contentType: "principle",
    content: `Independent contractor clauses should establish:
- Service provider is not an employee
- No employment benefits, taxes, or insurance provided
- Service provider responsible for own taxes and insurance
- Right to work for others (non-exclusivity)
- Control over how work is performed
- Use of own tools and equipment
- No right to direct or control work methods
- Payment as contractor, not salary

Misclassification as employee creates tax and liability issues. Clearly establish independent contractor relationship.`,
    metadata: { principleType: "contractor_status" },
  },
  {
    title: "Timeline and Milestone Management",
    category: "legal_principle",
    contentType: "principle",
    content: `Timeline clauses should address:
- Project start date and completion date
- Milestone dates and deliverables
- What constitutes delay (excusable vs. non-excusable)
- Extension procedures and approvals
- Liquidated damages for delays (if applicable)
- Time is of the essence clauses
- Force majeure delays
- Client-caused delays (content, approvals, access)
- Early completion bonuses (if applicable)
- Critical path dependencies

Realistic timelines prevent disputes. Specify what happens with delays and who bears risk.`,
    metadata: { principleType: "timeline_management" },
  },
  {
    title: "Change Order Procedures",
    category: "legal_principle",
    contentType: "principle",
    content: `Change order clauses should specify:
- What constitutes a change (scope, timeline, price)
- Written change order requirement
- Approval process and authority
- Pricing for changes (hourly rate, fixed price, cost-plus)
- Timeline impact of changes
- Work continuation during change order negotiation
- Rejection of change orders
- Emergency change procedures
- Documentation requirements

Clear change order procedures prevent scope creep and payment disputes. Require written approval.`,
    metadata: { principleType: "change_orders" },
  },
  {
    title: "Data Protection and Privacy",
    category: "legal_principle",
    contentType: "principle",
    content: `Data protection clauses should address:
- GDPR, CCPA, and other privacy law compliance
- Data processing agreements where required
- Personal data handling and security measures
- Data breach notification requirements
- Data retention and deletion policies
- Right to access and deletion
- Data transfer restrictions
- Subprocessor requirements
- Security standards (encryption, access controls)

Privacy laws require specific provisions. Include data protection clauses for contracts involving personal data.`,
    metadata: { principleType: "data_protection" },
  },
  {
    title: "Non-Compete and Non-Solicitation",
    category: "legal_principle",
    contentType: "principle",
    content: `Non-compete clauses must be reasonable:
- Geographic scope (specific region, not worldwide)
- Duration (typically 6 months to 2 years, not excessive)
- Scope of restricted activities (specific, not overly broad)
- Legitimate business interest requirement
- Consideration for non-compete (payment, employment)
- Enforceability varies by jurisdiction
- Non-solicitation of clients/employees (often more enforceable)
- Garden leave provisions (paid non-compete period)

Non-competes are heavily regulated. Make them narrow and reasonable. Non-solicitation is often more enforceable.`,
    metadata: { principleType: "non_compete" },
  },
  {
    title: "Governing Law and Jurisdiction",
    category: "legal_principle",
    contentType: "principle",
    content: `Governing law clauses should specify:
- Which state/country's laws apply
- Jurisdiction for disputes (courts, location)
- Venue selection (specific court location)
- Waiver of jury trial (if desired)
- Service of process procedures
- International contracts (choice of law, UN Convention)
- Conflict of law rules
- Enforcement of foreign judgments

Choose governing law that is favorable and predictable. Consider where parties are located and where disputes will occur.`,
    metadata: { principleType: "governing_law" },
  },
  {
    title: "Assignment and Subcontracting",
    category: "legal_principle",
    contentType: "principle",
    content: `Assignment clauses should address:
- Prohibition or permission to assign contract
- Assignment with consent (typical requirement)
- Assignment to affiliates or in merger (often permitted)
- Subcontracting rights and restrictions
- Service provider remains liable for subcontractors
- Client approval of subcontractors (if required)
- Delegation of duties vs. assignment of rights
- Anti-assignment clauses and exceptions

Assignment restrictions protect parties from unwanted third parties. Allow assignment with consent or to affiliates.`,
    metadata: { principleType: "assignment" },
  },
  {
    title: "Severability and Waiver",
    category: "legal_principle",
    contentType: "principle",
    content: `Severability clauses should provide:
- If one provision is invalid, others remain in effect
- Court may modify invalid provision to make it enforceable
- No waiver of rights unless in writing
- Waiver of one breach doesn't waive future breaches
- Cumulative remedies (one remedy doesn't exclude others)
- Partial invalidity doesn't invalidate entire contract

Severability protects contract if one clause is unenforceable. Prevents entire contract from being voided.`,
    metadata: { principleType: "severability" },
  },
  {
    title: "Entire Agreement and Modifications",
    category: "legal_principle",
    contentType: "principle",
    content: `Entire agreement clauses should state:
- This contract is the complete agreement
- Supersedes all prior agreements and discussions
- No oral modifications (must be in writing)
- Written modifications must be signed by both parties
- Side letters and exhibits are part of agreement
- Prevents "he said, she said" disputes
- Integration clause prevents parol evidence

Entire agreement clauses prevent disputes about prior discussions. Require written modifications.`,
    metadata: { principleType: "entire_agreement" },
  },
];

// Comprehensive legal clauses for training
const legalClauses = [
  {
    title: "Comprehensive Confidentiality Clause",
    category: "legal_clause",
    contentType: "clause",
    content: `CONFIDENTIALITY

Both parties agree to maintain the confidentiality of all proprietary information disclosed during the course of this Agreement ("Confidential Information"). Confidential Information includes, but is not limited to, business plans, financial information, customer lists, technical information, trade secrets, marketing strategies, product plans, and any information marked as confidential or which should reasonably be understood to be confidential. Each party agrees: (a) to hold all Confidential Information in strict confidence; (b) not to disclose Confidential Information to any third party without prior written consent; (c) to use Confidential Information solely for the purposes of this Agreement; and (d) to return or destroy all Confidential Information upon termination. This obligation shall survive termination of this Agreement and continue for [3-5] years thereafter. The following information is excluded from confidentiality obligations: (i) information publicly available or independently developed; (ii) information rightfully received from third parties; (iii) information required to be disclosed by law or court order.`,
    metadata: { clauseType: "confidentiality", comprehensive: true },
  },
  {
    title: "Intellectual Property Assignment with Reservations",
    category: "legal_clause",
    contentType: "clause",
    content: `INTELLECTUAL PROPERTY RIGHTS

Upon full payment of all fees due under this Agreement, [Service Provider] hereby assigns to [Client] all right, title, and interest in and to the Deliverables, including all copyrights, trademarks, trade secrets, and other intellectual property rights therein. Notwithstanding the foregoing, [Service Provider] reserves the right to: (a) use the Deliverables in [Service Provider]'s portfolio and marketing materials; (b) retain ownership of any pre-existing code, frameworks, libraries, tools, methodologies, or know-how used in connection with the Services; (c) use general skills and knowledge gained during performance of the Services. [Client] represents and warrants that all content, materials, and information provided to [Service Provider] are owned by [Client] or [Client] has obtained all necessary rights and licenses for their use. If [Service Provider] uses any third-party materials, [Client] will be responsible for any associated licensing fees or ongoing costs.`,
    metadata: { clauseType: "intellectual_property", comprehensive: true },
  },
  {
    title: "Comprehensive Limitation of Liability",
    category: "legal_clause",
    contentType: "clause",
    content: `LIMITATION OF LIABILITY

EXCEPT FOR BREACHES OF CONFIDENTIALITY, INDEMNIFICATION OBLIGATIONS, OR GROSS NEGLIGENCE OR WILLFUL MISCONDUCT, IN NO EVENT SHALL EITHER PARTY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION LOSS OF PROFITS, REVENUE, DATA, OR BUSINESS OPPORTUNITIES, REGARDLESS OF THE THEORY OF LIABILITY (CONTRACT, TORT, STRICT LIABILITY, OR OTHERWISE), EVEN IF SUCH PARTY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. [SERVICE PROVIDER]'S TOTAL AGGREGATE LIABILITY UNDER THIS AGREEMENT SHALL NOT EXCEED THE TOTAL AMOUNT PAID BY [CLIENT] TO [SERVICE PROVIDER] UNDER THIS AGREEMENT IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR [SPECIFIED AMOUNT], WHICHEVER IS LESS. THE FOREGOING LIMITATIONS SHALL APPLY NOTWITHSTANDING ANY FAILURE OF ESSENTIAL PURPOSE OF ANY LIMITED REMEDY.`,
    metadata: { clauseType: "liability", comprehensive: true },
  },
  {
    title: "Termination for Convenience and Cause",
    category: "legal_clause",
    contentType: "clause",
    content: `TERMINATION

Either party may terminate this Agreement: (a) for convenience, upon [30] days written notice to the other party; or (b) for material breach, if the breaching party fails to cure such breach within [30] days after written notice specifying the breach. Upon termination: (i) [Client] will pay [Service Provider] for all services performed and expenses incurred up to the date of termination, plus any cancellation fees specified herein; (ii) [Service Provider] will deliver to [Client] all completed Deliverables in their then-current state; (iii) Each party will return or destroy all Confidential Information of the other party; (iv) [Service Provider] will provide reasonable transition assistance for [30] days after termination. Sections relating to Intellectual Property, Limitation of Liability, Indemnification, Confidentiality, Payment Obligations, and General Provisions shall survive termination of this Agreement.`,
    metadata: { clauseType: "termination", comprehensive: true },
  },
  {
    title: "Mutual Indemnification Clause",
    category: "legal_clause",
    contentType: "clause",
    content: `INDEMNIFICATION

[Client] agrees to indemnify, defend, and hold harmless [Service Provider] and its officers, directors, employees, and agents from and against any claims, damages, losses, liabilities, and expenses (including reasonable attorneys' fees) arising out of or relating to: (a) [Client]'s use of the Deliverables; (b) Content, materials, or information provided by [Client]; (c) [Client]'s breach of this Agreement; (d) Any claim that [Client]'s content infringes upon any third-party intellectual property rights; (e) [Client]'s violation of any applicable laws or regulations. [Service Provider] agrees to indemnify, defend, and hold harmless [Client] from and against any claims arising solely from [Service Provider]'s gross negligence or willful misconduct in performing the Services. Each party will: (i) promptly notify the other party of any claim; (ii) allow the indemnifying party to control the defense and settlement; (iii) provide reasonable cooperation in the defense.`,
    metadata: { clauseType: "indemnification", comprehensive: true },
  },
  {
    title: "Arbitration Dispute Resolution",
    category: "legal_clause",
    contentType: "clause",
    content: `DISPUTE RESOLUTION

Any dispute, controversy, or claim arising out of or relating to this Agreement shall be resolved as follows: (a) The parties shall first attempt to resolve the dispute through good faith negotiation for a period of [30] days; (b) If negotiation fails, the parties agree to submit the dispute to binding arbitration administered by the American Arbitration Association (AAA) in accordance with its Commercial Arbitration Rules. The arbitration shall be conducted by a single arbitrator in [City, State], and judgment on the award may be entered in any court having jurisdiction. The parties waive any right to a jury trial and agree that arbitration is the exclusive remedy. Notwithstanding the foregoing, either party may seek injunctive relief in any court of competent jurisdiction to protect its intellectual property or confidential information. The prevailing party in any dispute shall be entitled to recover its reasonable attorneys' fees and costs.`,
    metadata: { clauseType: "dispute_resolution", method: "arbitration" },
  },
  {
    title: "Mediation and Litigation Dispute Resolution",
    category: "legal_clause",
    contentType: "clause",
    content: `DISPUTE RESOLUTION

Any dispute arising under this Agreement shall be resolved as follows: (a) The parties agree to first attempt to resolve disputes through good faith negotiation; (b) If negotiation fails within [30] days, the parties agree to submit the dispute to non-binding mediation administered by [Mediation Organization] in [Location]; (c) If mediation fails to resolve the dispute within [60] days, either party may commence litigation in the state and federal courts located in [County, State], and the parties consent to the exclusive jurisdiction and venue of such courts. The parties waive any objection to venue or jurisdiction. The prevailing party in any dispute shall be entitled to recover its reasonable attorneys' fees and costs from the non-prevailing party.`,
    metadata: { clauseType: "dispute_resolution", method: "mediation_litigation" },
  },
  {
    title: "Comprehensive Force Majeure",
    category: "legal_clause",
    contentType: "clause",
    content: `FORCE MAJEURE

Neither party shall be liable for any failure or delay in performance under this Agreement due to circumstances beyond its reasonable control, including but not limited to: acts of God, natural disasters, fires, floods, earthquakes, epidemics, pandemics, war, terrorism, riots, civil unrest, labor strikes, government actions, changes in laws or regulations, internet or telecommunications failures, cyber attacks, or other events that are unforeseeable and beyond the party's reasonable control (each, a "Force Majeure Event"). The affected party shall: (a) promptly notify the other party in writing of the Force Majeure Event and its expected duration; (b) use commercially reasonable efforts to mitigate the effects of the Force Majeure Event; (c) resume performance as soon as reasonably practicable. If a Force Majeure Event continues for more than [60] days, either party may terminate this Agreement upon written notice. Payment obligations for services already performed are not excused by Force Majeure.`,
    metadata: { clauseType: "force_majeure", comprehensive: true },
  },
  {
    title: "Payment Terms with Late Fees",
    category: "legal_clause",
    contentType: "clause",
    content: `PAYMENT TERMS

All fees are due and payable as follows: [Payment Schedule]. Invoices are due within [Net 30] days of invoice date. Late payments shall incur interest at the rate of [1.5%] per month ([18%] annually) or the maximum rate allowed by applicable law, whichever is less, calculated from the due date until paid in full. [Service Provider] reserves the right to suspend work if payment is more than [15] days overdue, and work will resume upon receipt of payment plus applicable late fees. [Client] agrees to pay all reasonable collection costs, including attorneys' fees, incurred in collecting overdue amounts. All payments are non-refundable except as expressly provided in this Agreement.`,
    metadata: { clauseType: "payment_terms", includesLateFees: true },
  },
  {
    title: "Milestone-Based Payment Schedule",
    category: "legal_clause",
    contentType: "clause",
    content: `PAYMENT SCHEDULE

Total Project Fee: $[Amount]. Payment shall be made as follows: (a) Deposit of $[Amount] ([X]%) due upon execution of this Agreement; (b) Milestone Payment 1 of $[Amount] ([X]%) due upon [Milestone 1 Description] and [Service Provider]'s delivery of [Deliverable 1]; (c) Milestone Payment 2 of $[Amount] ([X]%) due upon [Milestone 2 Description] and [Service Provider]'s delivery of [Deliverable 2]; (d) Final Payment of $[Amount] ([X]%) due upon final delivery and [Client]'s written acceptance of all Deliverables. Each milestone payment is due within [Net 15] days of milestone completion. [Service Provider] will invoice [Client] upon completion of each milestone. Failure to pay any milestone payment may result in suspension of work until payment is received.`,
    metadata: { clauseType: "payment_terms", type: "milestone" },
  },
  {
    title: "Warranty and Warranty Disclaimer",
    category: "legal_clause",
    contentType: "clause",
    content: `WARRANTIES AND DISCLAIMERS

[Service Provider] warrants that: (a) the Services will be performed in a professional and workmanlike manner consistent with industry standards; (b) the Deliverables will be free from material defects for [90] days following final delivery; (c) the Deliverables will not knowingly infringe upon any third-party intellectual property rights. [Service Provider]'s sole obligation for breach of warranty is to repair or replace the defective Deliverables, or at [Service Provider]'s option, refund the fees paid for the defective portion. EXCEPT AS EXPRESSLY SET FORTH ABOVE, [SERVICE PROVIDER] MAKES NO WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. [Service Provider] does not warrant that the Deliverables will be error-free, uninterrupted, or meet all of [Client]'s requirements.`,
    metadata: { clauseType: "warranties", includesDisclaimer: true },
  },
  {
    title: "Scope of Work with Exclusions",
    category: "legal_clause",
    contentType: "clause",
    content: `SCOPE OF SERVICES

[Service Provider] agrees to provide the following services (the "Services"): [Detailed Description]. The Services include: [List of Included Items]. The Services do NOT include: (a) [Excluded Item 1]; (b) [Excluded Item 2]; (c) Third-party services, software licenses, or ongoing maintenance unless specifically stated; (d) Content creation, copywriting, or content strategy unless specified; (e) Hosting, domain registration, or ongoing technical support after project completion. Any services not expressly included in this Agreement require a separate written agreement or change order. [Service Provider] will perform the Services in accordance with industry standards and the specifications set forth in [Exhibit/Attachment].`,
    metadata: { clauseType: "scope", includesExclusions: true },
  },
  {
    title: "Change Order Procedure",
    category: "legal_clause",
    contentType: "clause",
    content: `CHANGE ORDERS

Any changes to the scope of work, timeline, or fees (a "Change Order") must be agreed upon in writing by both parties. [Service Provider] will provide a written estimate for any requested changes, including the impact on timeline and fees, before commencing work on such changes. [Client] must approve the Change Order in writing before [Service Provider] will proceed. If [Client] requests changes orally or informally, [Service Provider] may proceed at its discretion, and [Client] will be billed at [Service Provider]'s standard hourly rate of $[Rate] per hour. No Change Order shall be effective unless signed by both parties. Change Orders may result in adjustments to the project timeline, fees, and deliverables.`,
    metadata: { clauseType: "change_orders" },
  },
  {
    title: "Independent Contractor Relationship",
    category: "legal_clause",
    contentType: "clause",
    content: `INDEPENDENT CONTRACTOR

[Service Provider] is an independent contractor and not an employee, agent, or partner of [Client]. This Agreement does not create an employment, agency, partnership, or joint venture relationship. [Service Provider] is solely responsible for: (a) all taxes, insurance, and benefits related to [Service Provider]'s performance of the Services; (b) compliance with all applicable laws and regulations; (c) maintaining any required licenses or certifications. [Service Provider] has the right to control the manner and means by which the Services are performed, subject to the specifications and requirements set forth in this Agreement. [Service Provider] may work for other clients and is not required to work exclusively for [Client].`,
    metadata: { clauseType: "contractor_status" },
  },
  {
    title: "Governing Law and Jurisdiction",
    category: "legal_clause",
    contentType: "clause",
    content: `GOVERNING LAW AND JURISDICTION

This Agreement shall be governed by and construed in accordance with the laws of the State of [State], without regard to its conflict of law principles. Any legal action or proceeding arising under this Agreement shall be brought exclusively in the state and federal courts located in [County, State], and the parties consent to the exclusive jurisdiction and venue of such courts. The parties waive any objection to venue or jurisdiction based on forum non conveniens or any other ground.`,
    metadata: { clauseType: "governing_law" },
  },
  {
    title: "Assignment and Subcontracting",
    category: "legal_clause",
    contentType: "clause",
    content: `ASSIGNMENT

Neither party may assign this Agreement or any rights or obligations hereunder without the prior written consent of the other party, except that: (a) either party may assign this Agreement to an affiliate or in connection with a merger, acquisition, or sale of all or substantially all of its assets; (b) [Service Provider] may subcontract portions of the Services to qualified third parties, provided that [Service Provider] remains fully responsible for the performance of all subcontracted work and compliance with this Agreement. Any attempted assignment in violation of this section shall be void. This Agreement shall be binding upon and inure to the benefit of the parties and their permitted successors and assigns.`,
    metadata: { clauseType: "assignment" },
  },
  {
    title: "Severability and Waiver",
    category: "legal_clause",
    contentType: "clause",
    content: `SEVERABILITY AND WAIVER

If any provision of this Agreement is held to be invalid, illegal, or unenforceable, the remaining provisions shall remain in full force and effect, and the invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable. No waiver of any provision of this Agreement shall be effective unless in writing and signed by the party waiving such provision. A waiver of any breach shall not constitute a waiver of any subsequent breach. The failure of either party to enforce any right or remedy shall not constitute a waiver of such right or remedy.`,
    metadata: { clauseType: "severability" },
  },
  {
    title: "Entire Agreement and Modifications",
    category: "legal_clause",
    contentType: "clause",
    content: `ENTIRE AGREEMENT

This Agreement, together with any exhibits or attachments, constitutes the entire agreement between the parties and supersedes all prior agreements, understandings, negotiations, and discussions, whether oral or written, relating to the subject matter hereof. This Agreement may only be amended, modified, or supplemented by a written instrument signed by both parties. No course of conduct or trade usage shall modify the terms of this Agreement.`,
    metadata: { clauseType: "entire_agreement" },
  },
  {
    title: "Non-Solicitation of Employees",
    category: "legal_clause",
    contentType: "clause",
    content: `NON-SOLICITATION

During the term of this Agreement and for [12] months thereafter, [Client] agrees not to directly or indirectly solicit, recruit, or hire any employee or contractor of [Service Provider] who was involved in performing the Services, without [Service Provider]'s prior written consent. This restriction does not apply to: (a) general job postings not targeted at [Service Provider]'s personnel; (b) responses to unsolicited applications from [Service Provider]'s personnel; or (c) personnel who were terminated by [Service Provider] more than [6] months prior. If [Client] breaches this provision, [Client] agrees to pay [Service Provider] a fee equal to [50%] of the employee's annual compensation as liquidated damages.`,
    metadata: { clauseType: "non_solicitation" },
  },
  {
    title: "Data Protection and Privacy",
    category: "legal_clause",
    contentType: "clause",
    content: `DATA PROTECTION

Each party agrees to comply with all applicable data protection and privacy laws, including GDPR, CCPA, and other relevant regulations. [Service Provider] will implement appropriate technical and organizational measures to protect any personal data processed in connection with the Services. [Service Provider] will: (a) process personal data only as necessary to perform the Services; (b) maintain confidentiality of personal data; (c) notify [Client] promptly of any data breach; (d) assist [Client] in responding to data subject requests; (e) return or delete personal data upon termination. [Client] represents that it has the right to provide any personal data to [Service Provider] and has obtained all necessary consents.`,
    metadata: { clauseType: "data_protection" },
  },
  {
    title: "Time is of the Essence",
    category: "legal_clause",
    contentType: "clause",
    content: `TIME IS OF THE ESSENCE

Time is of the essence with respect to all deadlines, milestones, and performance obligations under this Agreement. Any delay in performance may result in material breach. [Service Provider] will use commercially reasonable efforts to meet all deadlines, but delays caused by [Client] (including delayed approvals, content delivery, or access) will extend deadlines accordingly. [Client]'s failure to provide timely feedback, approvals, or materials shall not constitute a breach by [Service Provider] of any deadline or milestone.`,
    metadata: { clauseType: "timeline" },
  },
  {
    title: "Acceptance and Rejection of Deliverables",
    category: "legal_clause",
    contentType: "clause",
    content: `ACCEPTANCE OF DELIVERABLES

[Client] shall have [14] business days from delivery of each Deliverable to review and either accept or reject such Deliverable in writing. If [Client] rejects a Deliverable, [Client] must provide written notice specifying the reasons for rejection in reasonable detail. [Service Provider] will have [30] days to cure any defects and resubmit the Deliverable. If [Client] fails to provide written acceptance or rejection within the review period, the Deliverable shall be deemed accepted. [Client] may not unreasonably reject Deliverables that substantially conform to the specifications. Acceptance of a Deliverable does not waive [Client]'s rights with respect to latent defects discovered later.`,
    metadata: { clauseType: "acceptance" },
  },
];

// Contract sections and industry-specific examples
const contractSections = [
  {
    title: "Web Development Project Scope Section",
    category: "contract_section",
    contentType: "section",
    content: `SCOPE OF SERVICES

Developer agrees to provide the following website development services:

1. DESIGN PHASE
   - Creation of wireframes and mockups for [X] pages
   - Design revisions: [X] rounds included
   - Responsive design for desktop, tablet, and mobile devices
   - Brand identity integration (colors, fonts, logos)

2. DEVELOPMENT PHASE
   - Front-end development using [Technology Stack]
   - Back-end development and database integration
   - Content management system setup and configuration
   - Third-party API integrations: [List APIs]
   - E-commerce functionality (if applicable): shopping cart, payment processing, order management

3. TESTING AND QUALITY ASSURANCE
   - Cross-browser testing (Chrome, Firefox, Safari, Edge)
   - Mobile device testing
   - Functionality testing
   - Performance optimization
   - Security testing and SSL certificate setup

4. DELIVERABLES
   - Fully functional website deployed to [Hosting Platform]
   - Source code and documentation
   - Admin/user training materials
   - [X] months of post-launch support included

5. EXCLUSIONS
   - Content creation and copywriting (Client provides)
   - Stock photography and imagery (Client provides or purchases)
   - Ongoing hosting fees (Client responsibility after [X] months)
   - Third-party service subscriptions (Client responsibility)
   - SEO optimization beyond basic on-page elements`,
    metadata: { sectionType: "scope", industry: "web_development" },
  },
  {
    title: "Consulting Services Scope Section",
    category: "contract_section",
    contentType: "section",
    content: `SCOPE OF CONSULTING SERVICES

Consultant agrees to provide the following professional consulting services:

1. SERVICES TO BE PROVIDED
   - Strategic analysis and assessment of [Business Area]
   - Development of recommendations and action plans
   - Implementation support and guidance
   - Training and knowledge transfer to Client's team
   - Regular progress reports and status updates

2. DELIVERABLES
   - Written assessment report (due [Date])
   - Strategic recommendations document (due [Date])
   - Implementation roadmap (due [Date])
   - Training materials and presentations
   - Final summary report with findings and outcomes

3. CONSULTANT'S OBLIGATIONS
   - Provide services with professional skill and care
   - Maintain confidentiality of Client information
   - Comply with all applicable laws and regulations
   - Provide regular updates on progress
   - Make Consultant's personnel available as needed

4. CLIENT'S OBLIGATIONS
   - Provide timely access to necessary information and personnel
   - Designate a primary point of contact
   - Provide feedback and approvals within [X] business days
   - Make timely payments as specified
   - Provide necessary resources and access

5. EXCLUSIONS
   - Implementation of recommendations (separate engagement)
   - Ongoing operational management
   - Legal, accounting, or tax advice (unless specifically included)
   - Services outside the defined scope without written agreement`,
    metadata: { sectionType: "scope", industry: "consulting" },
  },
  {
    title: "Photography Services Scope Section",
    category: "contract_section",
    contentType: "section",
    content: `SCOPE OF PHOTOGRAPHY SERVICES

Photographer agrees to provide the following photography services:

1. EVENT DETAILS
   - Event Type: [Wedding/Corporate/Portrait/etc.]
   - Date: [Date]
   - Location: [Venue Name and Address]
   - Duration: [X] hours of coverage
   - Number of Photographers: [X] primary, [X] assistant/second shooter

2. SERVICES INCLUDED
   - Pre-event consultation and planning
   - On-site photography coverage for [X] hours
   - Professional editing and post-processing
   - Color correction and basic retouching
   - Online gallery for [X] months
   - High-resolution digital images delivered via [Method]

3. DELIVERABLES
   - Minimum of [X] edited high-resolution digital images
   - Images delivered in JPEG format, suitable for printing
   - Online gallery with download capability
   - Print release for personal use
   - Timeline: Images delivered within [X] weeks of event

4. USAGE RIGHTS
   - Client receives personal, non-commercial license to use images
   - Client may print and share images for personal use
   - Commercial use requires additional license and fee
   - Photographer retains copyright and may use images for portfolio and marketing

5. EXCLUSIONS
   - Additional editing beyond basic retouching (available at $[Rate]/hour)
   - Physical prints or albums (available for purchase separately)
   - Extended coverage beyond [X] hours (available at $[Rate]/hour)
   - Travel expenses beyond [X] miles (billed separately)`,
    metadata: { sectionType: "scope", industry: "photography" },
  },
  {
    title: "Software Development Milestone Section",
    category: "contract_section",
    contentType: "section",
    content: `PROJECT MILESTONES AND DELIVERABLES

The Project shall be completed in the following phases and milestones:

MILESTONE 1: REQUIREMENTS AND DESIGN (Due: [Date])
   - Requirements gathering and documentation
   - Technical specifications document
   - System architecture design
   - UI/UX wireframes and mockups
   - Deliverable: Requirements and Design Document
   - Payment: $[Amount] upon acceptance

MILESTONE 2: DEVELOPMENT PHASE 1 (Due: [Date])
   - Core functionality development
   - Database schema implementation
   - API development
   - Deliverable: Core System Build
   - Payment: $[Amount] upon acceptance

MILESTONE 3: DEVELOPMENT PHASE 2 (Due: [Date])
   - Additional features and integrations
   - User interface implementation
   - Admin panel development
   - Deliverable: Feature-Complete Build
   - Payment: $[Amount] upon acceptance

MILESTONE 4: TESTING AND DEPLOYMENT (Due: [Date])
   - Comprehensive testing and bug fixes
   - Performance optimization
   - Deployment to production environment
   - Documentation and training
   - Deliverable: Production-Ready System
   - Payment: $[Amount] upon acceptance

Each milestone must be accepted in writing by Client within [X] business days of delivery. If Client does not provide written acceptance or rejection within the review period, the milestone shall be deemed accepted.`,
    metadata: { sectionType: "milestones", industry: "software_development" },
  },
  {
    title: "Service Level Agreement Section",
    category: "contract_section",
    contentType: "section",
    content: `SERVICE LEVEL AGREEMENT

Service Provider agrees to maintain the following service levels:

1. AVAILABILITY
   - System uptime: [99.9%] (excluding scheduled maintenance)
   - Scheduled maintenance: [X] hours per month, with [X] days advance notice
   - Emergency maintenance: As needed, with notification as soon as practicable

2. RESPONSE TIMES
   - Critical issues (system down): Response within [1] hour, resolution target [4] hours
   - High priority issues: Response within [4] hours, resolution target [24] hours
   - Medium priority issues: Response within [1] business day, resolution target [3] business days
   - Low priority issues: Response within [3] business days, resolution target [1] week

3. PERFORMANCE METRICS
   - Page load time: Average [X] seconds or less
   - API response time: [X] milliseconds or less for [X]% of requests
   - Database query performance: [X] seconds or less for standard queries

4. SUPPORT HOURS
   - Standard support: [Business Days], [Hours] (e.g., Monday-Friday, 9 AM - 5 PM EST)
   - Emergency support: 24/7 for critical issues
   - Support channels: Email, phone, ticketing system

5. REMEDIES FOR BREACH
   - If uptime falls below [X]%: [X]% credit for that month
   - If response time exceeds SLA: [X]% credit per incident
   - Maximum credit per month: [X]% of monthly fee

Service levels are measured monthly and reported to Client.`,
    metadata: { sectionType: "sla", industry: "saas" },
  },
  {
    title: "Content Creation Services Scope",
    category: "contract_section",
    contentType: "section",
    content: `SCOPE OF CONTENT CREATION SERVICES

Content Creator agrees to provide the following content creation services:

1. CONTENT TYPES
   - Blog posts: [X] articles of [X] words each
   - Social media content: [X] posts per week for [X] platforms
   - Website copy: [X] pages
   - Marketing materials: [X] pieces (emails, brochures, etc.)
   - Video scripts: [X] scripts of [X] minutes each

2. CONTENT SPECIFICATIONS
   - Tone and style: [Professional/Casual/Technical/etc.]
   - Target audience: [Description]
   - SEO optimization: Keyword research and optimization included
   - Formatting: Delivered in [Format] with proper formatting
   - Revisions: [X] rounds of revisions included per piece

3. DELIVERABLES
   - All content delivered via [Method] by [Deadline]
   - Content calendar and publishing schedule
   - SEO keyword research document
   - Content performance report (monthly)

4. CLIENT RESPONSIBILITIES
   - Provide brand guidelines and style guide
   - Provide topic ideas and content briefs
   - Provide timely feedback (within [X] business days)
   - Provide access to necessary information and resources
   - Approve content before publication

5. EXCLUSIONS
   - Graphic design (unless specifically included)
   - Video production (scripts only)
   - Content distribution and posting (Client responsibility)
   - Ongoing content strategy beyond initial [X] months`,
    metadata: { sectionType: "scope", industry: "content_creation" },
  },
  {
    title: "Recitals Section Template",
    category: "contract_section",
    contentType: "section",
    content: `RECITALS

WHEREAS, [Service Provider Name] ("[Service Provider]") is engaged in the business of providing [Type of Services] and possesses the skills, qualifications, and experience necessary to perform such services;

WHEREAS, [Client Name] ("[Client]") desires to engage [Service Provider] to perform certain services as more fully described in this Agreement;

WHEREAS, [Service Provider] desires to perform such services for [Client] subject to the terms and conditions set forth in this Agreement;

NOW, THEREFORE, in consideration of the mutual covenants, promises, and agreements contained herein, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the parties agree as follows:`,
    metadata: { sectionType: "recitals", standard: true },
  },
  {
    title: "Definitions Section Template",
    category: "contract_section",
    contentType: "section",
    content: `DEFINITIONS

For purposes of this Agreement, the following terms shall have the meanings set forth below:

1.1 "Agreement" means this [Contract Type] and all exhibits and attachments hereto.

1.2 "Client" means [Client Name], a [Entity Type] located at [Address].

1.3 "Service Provider" means [Service Provider Name], a [Entity Type] located at [Address].

1.4 "Services" means the services described in Section [X] of this Agreement.

1.5 "Deliverables" means all work product, materials, documents, and other items created by Service Provider in connection with the Services and delivered to Client.

1.6 "Confidential Information" means all non-public, proprietary, or confidential information disclosed by one party to the other, including but not limited to business plans, financial information, customer lists, technical information, and trade secrets.

1.7 "Effective Date" means [Date], the date on which this Agreement becomes effective.

1.8 "Project" means the project described in [Section/Exhibit] of this Agreement.

1.9 "Term" means the period from the Effective Date until [End Date] or earlier termination in accordance with this Agreement.

1.10 "Intellectual Property Rights" means all patents, copyrights, trademarks, trade secrets, and other intellectual property rights, whether registered or unregistered.`,
    metadata: { sectionType: "definitions", standard: true },
  },
  {
    title: "Notices Section Template",
    category: "contract_section",
    contentType: "section",
    content: `NOTICES

All notices, requests, consents, and other communications under this Agreement must be in writing and will be deemed given: (a) when delivered personally; (b) when sent by confirmed email; (c) [X] days after being sent by registered or certified mail, return receipt requested; or (d) [X] day after being sent by overnight courier with confirmation of delivery. Notices must be sent to the addresses set forth below or to such other address as either party may specify in writing:

If to Service Provider:
[Service Provider Name]
[Address]
Email: [Email]
Attention: [Contact Person]

If to Client:
[Client Name]
[Address]
Email: [Email]
Attention: [Contact Person]`,
    metadata: { sectionType: "notices", standard: true },
  },
  {
    title: "Construction/Contractor Services Scope",
    category: "contract_section",
    contentType: "section",
    content: `SCOPE OF WORK

Contractor agrees to perform the following work:

1. WORK TO BE PERFORMED
   - [Description of Work]
   - Location: [Project Address]
   - Start Date: [Date]
   - Completion Date: [Date]

2. MATERIALS AND EQUIPMENT
   - Contractor will provide all materials, tools, and equipment necessary to complete the work
   - Materials will be of good quality and suitable for the intended purpose
   - Client will provide [List any materials Client provides]

3. PERMITS AND LICENSES
   - Contractor will obtain all necessary permits and licenses
   - Contractor is licensed and insured as required by law
   - License number: [Number]
   - Insurance: General liability [$Amount], Workers' compensation [Yes/No]

4. WORK STANDARDS
   - Work will be performed in a professional and workmanlike manner
   - Work will comply with all applicable building codes and regulations
   - Work will be completed in accordance with plans and specifications (if any)

5. CHANGE ORDERS
   - Any changes to the scope of work must be agreed upon in writing
   - Changes may result in adjustments to price and timeline
   - Client will be provided with written estimate before work begins on changes

6. CLEANUP AND REMOVAL
   - Contractor will clean up work area daily
   - Contractor will remove all debris and materials upon completion
   - Final cleanup included in contract price`,
    metadata: { sectionType: "scope", industry: "construction" },
  },
];

// Additional comprehensive full contract examples
const fullContractExamples = [
  {
    title: "Complete Professional Services Agreement Template",
    category: "contract_template",
    contentType: "full_contract",
    content: String.raw`PROFESSIONAL SERVICES AGREEMENT

This Professional Services Agreement ("Agreement") is entered into as of \{\{effectiveDate\}\} (the "Effective Date") by and between:

SERVICE PROVIDER:
\{\{serviceProviderName\}\}
\{\{serviceProviderAddress\}\}
Email: \{\{serviceProviderEmail\}\}
Phone: \{\{serviceProviderPhone\}\}

CLIENT:
\{\{clientName\}\}
\{\{clientAddress\}\}
Email: \{\{clientEmail\}\}
Phone: \{\{clientPhone\}\}

RECITALS

WHEREAS, Service Provider is engaged in the business of providing \{\{serviceType\}\} services and possesses the skills, qualifications, and experience necessary to perform such services;

WHEREAS, Client desires to engage Service Provider to perform certain services as more fully described in this Agreement;

WHEREAS, Service Provider desires to perform such services for Client subject to the terms and conditions set forth in this Agreement;

NOW, THEREFORE, in consideration of the mutual covenants, promises, and agreements contained herein, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the parties agree as follows:

1. DEFINITIONS

1.1 "Agreement" means this Professional Services Agreement and all exhibits and attachments hereto.

1.2 "Client" means \{\{clientName\}\} and its officers, directors, employees, and agents.

1.3 "Service Provider" means \{\{serviceProviderName\}\} and its officers, directors, employees, and agents.

1.4 "Services" means the services described in Section 2 of this Agreement.

1.5 "Deliverables" means all work product, materials, documents, reports, and other items created by Service Provider in connection with the Services and delivered to Client.

1.6 "Confidential Information" means all non-public, proprietary, or confidential information disclosed by one party to the other, including but not limited to business plans, financial information, customer lists, technical information, trade secrets, and any information marked as confidential.

1.7 "Intellectual Property Rights" means all patents, copyrights, trademarks, trade secrets, and other intellectual property rights, whether registered or unregistered.

2. SCOPE OF SERVICES

2.1 Service Provider agrees to provide the following services (the "Services"):
\{\{detailedServiceDescription\}\}

2.2 Service Provider will perform the Services in a professional and workmanlike manner, consistent with industry standards and best practices.

2.3 Service Provider will use commercially reasonable efforts to complete the Services by \{\{completionDate\}\}, subject to Client's timely performance of its obligations.

2.4 Any changes to the scope of Services must be agreed upon in writing by both parties and may result in adjustments to fees and timeline.

3. DELIVERABLES

3.1 Service Provider will deliver the following Deliverables:
\{\{listOfDeliverables\}\}

3.2 All Deliverables will be delivered in the format and manner specified in this Agreement or as otherwise agreed upon in writing.

4. COMPENSATION AND PAYMENT TERMS

4.1 Total Fee: $\{\{totalAmount\}\} (the "Fee")

4.2 Payment Schedule:
   (a) Deposit: $\{\{depositAmount\}\} (\{\{depositPercentage\}\}%) due upon execution of this Agreement
   (b) Progress Payment: $\{\{progressAmount\}\} (\{\{progressPercentage\}\}%) due upon \{\{milestoneDescription\}\}
   (c) Final Payment: $\{\{finalAmount\}\} (\{\{finalPercentage\}\}%) due upon completion and acceptance of all Deliverables

4.3 All payments are due within \{\{paymentTerms\}\} days of invoice date. Late payments will incur interest at the rate of \{\{latePaymentRate\}\}% per month or the maximum rate allowed by applicable law, whichever is less.

4.4 Client is responsible for all applicable taxes, except taxes based on Service Provider's income.

5. CLIENT RESPONSIBILITIES

5.1 Client agrees to:
   (a) Provide all necessary information, materials, and access in a timely manner
   (b) Designate a single point of contact for approvals and communications
   (c) Provide timely feedback and approvals (within \{\{feedbackTimeframe\}\} business days)
   (d) Make timely payments as specified in Section 4
   (e) Ensure all information provided is accurate and complete

5.2 Delays in Client's performance will extend the timeline accordingly and may result in additional fees.

6. INTELLECTUAL PROPERTY RIGHTS

6.1 Upon full payment of all fees due under this Agreement, Service Provider hereby assigns to Client all right, title, and interest in and to the Deliverables, including all Intellectual Property Rights therein.

6.2 Service Provider reserves the right to:
   (a) Use the Deliverables in Service Provider's portfolio and marketing materials
   (b) Retain ownership of any pre-existing materials, tools, methodologies, or know-how
   (c) Use general skills and knowledge gained during performance of the Services

6.3 Client represents and warrants that all content, materials, and information provided to Service Provider are owned by Client or Client has obtained all necessary rights and licenses for their use.

7. CONFIDENTIALITY

7.1 Both parties agree to maintain the confidentiality of all Confidential Information disclosed during the course of this Agreement.

7.2 Each party agrees: (a) to hold all Confidential Information in strict confidence; (b) not to disclose Confidential Information to any third party without prior written consent; (c) to use Confidential Information solely for the purposes of this Agreement; and (d) to return or destroy all Confidential Information upon termination.

7.3 This obligation shall survive termination of this Agreement and continue for \{\{confidentialityPeriod\}\} years thereafter.

8. WARRANTIES AND DISCLAIMERS

8.1 Service Provider warrants that:
   (a) The Services will be performed in a professional and workmanlike manner
   (b) The Deliverables will be free from material defects for \{\{warrantyPeriod\}\} days following final delivery
   (c) The Deliverables will not knowingly infringe upon any third-party Intellectual Property Rights

8.2 EXCEPT AS EXPRESSLY SET FORTH ABOVE, SERVICE PROVIDER MAKES NO WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.

9. LIMITATION OF LIABILITY

9.1 IN NO EVENT SHALL SERVICE PROVIDER BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION LOSS OF PROFITS, DATA, OR BUSINESS OPPORTUNITIES.

9.2 SERVICE PROVIDER'S TOTAL LIABILITY UNDER THIS AGREEMENT SHALL NOT EXCEED THE TOTAL AMOUNT PAID BY CLIENT TO SERVICE PROVIDER UNDER THIS AGREEMENT.

10. INDEMNIFICATION

10.1 Client agrees to indemnify, defend, and hold harmless Service Provider from and against any claims arising out of or relating to: (a) Client's use of the Deliverables; (b) Content or materials provided by Client; (c) Client's breach of this Agreement.

11. TERMINATION

11.1 Either party may terminate this Agreement: (a) for convenience, upon \{\{terminationNotice\}\} days written notice; or (b) for material breach, if the breaching party fails to cure such breach within \{\{curePeriod\}\} days after written notice.

11.2 Upon termination, Client will pay Service Provider for all services performed and expenses incurred up to the date of termination.

12. GENERAL PROVISIONS

12.1 This Agreement constitutes the entire agreement between the parties and supersedes all prior agreements.

12.2 This Agreement may only be amended in writing and signed by both parties.

12.3 This Agreement shall be governed by and construed in accordance with the laws of \{\{governingState\}\}.

12.4 Any disputes shall be resolved through \{\{disputeResolution\}\} in \{\{disputeLocation\}\}.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the Effective Date.

SERVICE PROVIDER:                    CLIENT:
\{\{serviceProviderName\}\}               \{\{clientName\}\}

By: _________________________        By: _________________________
Name: \{\{serviceProviderSignatory\}\}   Name: \{\{clientSignatory\}\}
Title: \{\{serviceProviderTitle\}\}      Title: \{\{clientTitle\}\}
Date: \{\{signDate\}\}                   Date: \{\{signDate\}\}`,
    metadata: { contractType: "professional_services", comprehensive: true, fullExample: true },
  },
  {
    title: "Complete Software Development Agreement Template",
    category: "contract_template",
    contentType: "full_contract",
    content: String.raw`SOFTWARE DEVELOPMENT AGREEMENT

This Software Development Agreement ("Agreement") is entered into as of \{\{effectiveDate\}\} (the "Effective Date") between \{\{developerName\}\} ("Developer") and \{\{clientName\}\} ("Client").

RECITALS

WHEREAS, Developer is engaged in the business of software development and related services;

WHEREAS, Client desires to engage Developer to develop custom software as described herein;

NOW, THEREFORE, the parties agree as follows:

1. DEFINITIONS

1.1 "Software" means the custom software application to be developed under this Agreement.

1.2 "Source Code" means human-readable code written in programming languages.

1.3 "Deliverables" means the Software, Source Code, documentation, and all related materials.

1.4 "Milestones" means the development phases and deliverables specified in Exhibit A.

2. DEVELOPMENT SERVICES

2.1 Developer agrees to develop the Software according to the specifications set forth in Exhibit A.

2.2 Development will proceed in phases as follows:
   Phase 1: Requirements and Design (Due: \{\{phase1Date\}\})
   Phase 2: Core Development (Due: \{\{phase2Date\}\})
   Phase 3: Testing and Refinement (Due: \{\{phase3Date\}\})
   Phase 4: Deployment and Documentation (Due: \{\{phase4Date\}\})

2.3 Developer will provide regular progress reports and demos as requested by Client.

3. CLIENT RESPONSIBILITIES

3.1 Client will:
   (a) Provide detailed requirements and specifications
   (b) Provide timely feedback on deliverables
   (c) Provide access to necessary systems and data
   (d) Test and provide feedback during testing phases
   (e) Make timely payments

4. COMPENSATION

4.1 Total Development Fee: $\{\{totalAmount\}\}

4.2 Payment Schedule:
   - 30% upon signing ($\{\{depositAmount\}\})
   - 30% upon completion of Phase 2 ($\{\{phase2Amount\}\})
   - 20% upon completion of Phase 3 ($\{\{phase3Amount\}\})
   - 20% upon final delivery and acceptance ($\{\{finalAmount\}\})

5. INTELLECTUAL PROPERTY

5.1 Upon full payment, Developer assigns all rights in the Software and Source Code to Client.

5.2 Developer retains rights to: (a) general methodologies and processes; (b) pre-existing code and libraries; (c) use in portfolio.

6. WARRANTIES

6.1 Developer warrants the Software will function substantially in accordance with specifications for \{\{warrantyPeriod\}\} days after delivery.

6.2 Developer will correct material defects at no additional cost during the warranty period.

7. LIMITATION OF LIABILITY

7.1 Developer's total liability shall not exceed the total fees paid under this Agreement.

8. TERMINATION

8.1 Either party may terminate with \{\{terminationNotice\}\} days written notice.

8.2 Upon termination, Client pays for work completed to date.

9. GENERAL PROVISIONS

9.1 This Agreement is governed by the laws of \{\{governingState\}\}.

9.2 Disputes shall be resolved through \{\{disputeResolution\}\}.

IN WITNESS WHEREOF, the parties have executed this Agreement.

DEVELOPER:                          CLIENT:
\{\{developerName\}\}                   \{\{clientName\}\}

By: _________________________       By: _________________________
Date: \{\{signDate\}\}                  Date: \{\{signDate\}\}`,
    metadata: { contractType: "software_development", comprehensive: true, fullExample: true },
  },
  {
    title: "Complete Consulting Agreement Template",
    category: "contract_template",
    contentType: "full_contract",
    content: String.raw`CONSULTING SERVICES AGREEMENT

This Consulting Services Agreement ("Agreement") is entered into as of \{\{effectiveDate\}\} between \{\{consultantName\}\} ("Consultant") and \{\{clientName\}\} ("Client").

1. ENGAGEMENT

Consultant agrees to provide consulting services regarding \{\{consultingSubject\}\} as described in Exhibit A.

2. TERM

This Agreement begins on \{\{startDate\}\} and continues until \{\{endDate\}\} or earlier termination.

3. SERVICES

Consultant will:
- Analyze \{\{subjectArea\}\}
- Provide recommendations and strategic guidance
- Deliver written reports as specified
- Provide \{\{numberOfMeetings\}\} consultation meetings
- Assist with implementation planning

4. COMPENSATION

4.1 Consulting Fee: $\{\{totalAmount\}\} or $\{\{hourlyRate\}\}/hour

4.2 Payment: \{\{paymentTerms\}\}

4.3 Expenses: Client will reimburse reasonable expenses with prior approval.

5. INDEPENDENT CONTRACTOR

Consultant is an independent contractor, not an employee.

6. CONFIDENTIALITY

Consultant will maintain confidentiality of Client's information for \{\{confidentialityPeriod\}\} years.

7. DELIVERABLES

Consultant will deliver:
- Assessment report by \{\{reportDate\}\}
- Recommendations document by \{\{recommendationsDate\}\}
- Final summary report by \{\{finalReportDate\}\}

8. INTELLECTUAL PROPERTY

All deliverables become Client's property upon payment.

9. TERMINATION

Either party may terminate with \{\{terminationNotice\}\} days notice.

10. GENERAL

This Agreement is governed by \{\{governingState\}\} law.

CONSULTANT:                         CLIENT:
\{\{consultantName\}\}                  \{\{clientName\}\}

By: _________________________       By: _________________________
Date: \{\{signDate\}\}                  Date: \{\{signDate\}\}`,
    metadata: { contractType: "consulting", comprehensive: true, fullExample: true },
  },
];

// Additional comprehensive legal clauses with variations
const additionalLegalClauses = [
  {
    title: "Comprehensive Payment Terms with Multiple Options",
    category: "legal_clause",
    contentType: "clause",
    content: String.raw`PAYMENT TERMS AND SCHEDULE

OPTION 1 - SINGLE PAYMENT:
Total Fee: $\{\{totalAmount\}\} due upon \{\{paymentDueDate\}\}.

OPTION 2 - DEPOSIT AND FINAL PAYMENT:
Total Fee: $\{\{totalAmount\}\}
- Deposit: $\{\{depositAmount\}\} (\{\{depositPercentage\}\}%) due upon execution of this Agreement (non-refundable once work commences)
- Final Payment: $\{\{finalAmount\}\} (\{\{finalPercentage\}\}%) due upon completion and acceptance of all Deliverables

OPTION 3 - MILESTONE PAYMENTS:
Total Fee: $\{\{totalAmount\}\}
- Milestone 1: $\{\{milestone1Amount\}\} (\{\{milestone1Percentage\}\}%) due upon \{\{milestone1Trigger\}\}
- Milestone 2: $\{\{milestone2Amount\}\} (\{\{milestone2Percentage\}\}%) due upon \{\{milestone2Trigger\}\}
- Milestone 3: $\{\{milestone3Amount\}\} (\{\{milestone3Percentage\}\}%) due upon \{\{milestone3Trigger\}\}
- Final Payment: $\{\{finalAmount\}\} (\{\{finalPercentage\}\}%) due upon final delivery and acceptance

OPTION 4 - MONTHLY PAYMENTS:
Monthly Fee: $\{\{monthlyAmount\}\} due on the \{\{dayOfMonth\}\} of each month for \{\{numberOfMonths\}\} months.

PAYMENT TERMS:
- All invoices are due within \{\{paymentTerms\}\} days of invoice date
- Late payments incur interest at \{\{latePaymentRate\}\}% per month (\{\{annualRate\}\}% annually) or the maximum rate allowed by law
- Payment methods accepted: \{\{paymentMethods\}\}
- Work may be suspended if payment is more than \{\{suspensionDays\}\} days overdue
- Client agrees to pay all collection costs, including attorneys' fees, for overdue amounts
- All payments are non-refundable except as expressly provided herein`,
    metadata: { clauseType: "payment_terms", comprehensive: true, multipleOptions: true },
  },
  {
    title: "Comprehensive Intellectual Property Assignment",
    category: "legal_clause",
    contentType: "clause",
    content: String.raw`INTELLECTUAL PROPERTY RIGHTS AND OWNERSHIP

1. ASSIGNMENT OF DELIVERABLES
Upon full payment of all fees due under this Agreement, Service Provider hereby assigns, transfers, and conveys to Client all right, title, and interest in and to the Deliverables, including but not limited to:
   (a) All copyrights, including the right to reproduce, distribute, display, and create derivative works
   (b) All patent rights, if any, in inventions embodied in the Deliverables
   (c) All trade secret rights in proprietary information contained in the Deliverables
   (d) All trademark rights in marks created as part of the Deliverables
   (e) All other intellectual property rights of any kind or nature

2. RESERVED RIGHTS
Notwithstanding Section 1, Service Provider reserves and retains:
   (a) The right to use the Deliverables in Service Provider's portfolio, case studies, and marketing materials
   (b) Ownership of all pre-existing materials, code, frameworks, libraries, tools, methodologies, processes, and know-how used in connection with the Services
   (c) The right to use general skills, knowledge, and experience gained during performance of the Services
   (d) Ownership of any tools, templates, or utilities developed by Service Provider that are not specific to Client's project

3. PRE-EXISTING MATERIALS
Service Provider may incorporate pre-existing materials owned by Service Provider into the Deliverables. Service Provider grants Client a perpetual, non-exclusive, worldwide license to use such pre-existing materials solely as part of the Deliverables.

4. THIRD-PARTY MATERIALS
If Service Provider uses any third-party materials, components, or services in the Deliverables, Client will be responsible for any associated licensing fees, ongoing costs, or compliance requirements. Service Provider will identify all third-party materials and their licensing requirements.

5. CLIENT MATERIALS
Client represents and warrants that all content, materials, and information provided to Service Provider are owned by Client or Client has obtained all necessary rights and licenses for their use. Client grants Service Provider a license to use such materials solely for the purpose of performing the Services.

6. MORAL RIGHTS
To the extent permitted by law, Service Provider waives any moral rights or similar rights in the Deliverables.

7. FURTHER ASSURANCES
Each party agrees to execute and deliver such additional documents and take such additional actions as may be reasonably necessary to effectuate the intent of this Section.`,
    metadata: { clauseType: "intellectual_property", comprehensive: true, detailed: true },
  },
  {
    title: "Comprehensive Termination Clause with All Scenarios",
    category: "legal_clause",
    contentType: "clause",
    content: `TERMINATION

1. TERMINATION FOR CONVENIENCE
Either party may terminate this Agreement for convenience, without cause, upon \{\{terminationNotice\}\} days written notice to the other party. The notice period may be waived by mutual written agreement.

2. TERMINATION FOR BREACH
Either party may terminate this Agreement immediately upon written notice if the other party:
   (a) Materially breaches this Agreement and fails to cure such breach within \{\{curePeriod\}\} days after written notice specifying the breach
   (b) Becomes insolvent, files for bankruptcy, or has a receiver or trustee appointed
   (c) Ceases to conduct business in the ordinary course
   (d) Breaches any confidentiality or intellectual property obligations

3. TERMINATION FOR NON-PAYMENT
Service Provider may terminate this Agreement immediately upon written notice if Client fails to pay any amount when due and such failure continues for \{\{paymentGracePeriod\}\} days after written notice.

4. TERMINATION FOR CONVENIENCE BY CLIENT
If Client terminates for convenience:
   (a) Client will pay Service Provider for all Services performed and expenses incurred up to the date of termination
   (b) Client will pay Service Provider for all work in progress at Service Provider's standard rates
   (c) Client will pay any cancellation fees specified in this Agreement
   (d) Service Provider will deliver all completed Deliverables in their then-current state

5. TERMINATION FOR CONVENIENCE BY SERVICE PROVIDER
If Service Provider terminates for convenience:
   (a) Service Provider will complete all work in progress or refund a pro-rata portion of fees paid for incomplete work, at Service Provider's option
   (b) Service Provider will deliver all completed Deliverables
   (c) Service Provider will provide reasonable transition assistance for up to \{\{transitionPeriod\}\} days

6. TERMINATION FOR BREACH
Upon termination for breach by the other party:
   (a) The non-breaching party is entitled to all remedies available at law or in equity
   (b) The breaching party will pay all amounts due and any damages
   (c) Each party will return or destroy all Confidential Information of the other party

7. EFFECT OF TERMINATION
Upon termination:
   (a) All rights and obligations under this Agreement will cease, except those that by their nature should survive
   (b) Service Provider will deliver all completed Deliverables within \{\{deliveryPeriod\}\} days
   (c) Each party will return or destroy all Confidential Information within \{\{returnPeriod\}\} days
   (d) Service Provider will provide reasonable transition assistance as specified above

8. SURVIVAL
The following sections will survive termination: Intellectual Property Rights, Confidentiality, Limitation of Liability, Indemnification, Payment Obligations, and General Provisions.`,
    metadata: { clauseType: "termination", comprehensive: true, allScenarios: true },
  },
  {
    title: "Comprehensive Limitation of Liability with Exceptions",
    category: "legal_clause",
    contentType: "clause",
    content: `LIMITATION OF LIABILITY

1. EXCLUSION OF CONSEQUENTIAL DAMAGES
EXCEPT FOR BREACHES OF CONFIDENTIALITY, INDEMNIFICATION OBLIGATIONS, OR GROSS NEGLIGENCE OR WILLFUL MISCONDUCT, IN NO EVENT SHALL EITHER PARTY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION:
   (a) Loss of profits, revenue, or business opportunities
   (b) Loss of data or information
   (c) Cost of procurement of substitute goods or services
   (d) Business interruption
   (e) Loss of goodwill or reputation
   (f) Any other damages not directly resulting from the breach
REGARDLESS OF THE THEORY OF LIABILITY (CONTRACT, TORT, STRICT LIABILITY, NEGLIGENCE, OR OTHERWISE), EVEN IF SUCH PARTY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.

2. CAP ON LIABILITY
SERVICE PROVIDER'S TOTAL AGGREGATE LIABILITY UNDER THIS AGREEMENT, WHETHER IN CONTRACT, TORT, OR OTHERWISE, SHALL NOT EXCEED THE TOTAL AMOUNT PAID BY CLIENT TO SERVICE PROVIDER UNDER THIS AGREEMENT IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR $\{\{capAmount\}\}, WHICHEVER IS LESS.

3. EXCEPTIONS TO LIMITATION
The limitations in Sections 1 and 2 do not apply to:
   (a) Breaches of confidentiality obligations
   (b) Indemnification obligations
   (c) Gross negligence or willful misconduct
   (d) Infringement of intellectual property rights
   (e) Personal injury or death
   (f) Violation of applicable laws or regulations

4. ESSENTIAL PURPOSE
THE FOREGOING LIMITATIONS SHALL APPLY NOTWITHSTANDING ANY FAILURE OF ESSENTIAL PURPOSE OF ANY LIMITED REMEDY.

5. JURISDICTIONAL LIMITATIONS
Some jurisdictions do not allow the exclusion or limitation of certain damages. If such laws apply, the limitations and exclusions set forth above may not apply to Client, and Service Provider's liability will be limited to the maximum extent permitted by law.`,
    metadata: { clauseType: "liability", comprehensive: true, withExceptions: true },
  },
];

async function populateKnowledgeBase() {
  try {
    console.log("Starting knowledge base population...");

    // 1. Fetch all default contract templates
    console.log("\n1. Fetching default contract templates...");
    const { data: templates, error: templatesError } = await supabase
      .from("default_contract_templates")
      .select("id, name, category, description, content, fields");

    if (templatesError) {
      throw new Error(`Failed to fetch templates: ${templatesError.message}`);
    }

    console.log(`Found ${templates?.length || 0} default templates`);

    // 2. Add contract templates to knowledge base
    if (templates && templates.length > 0) {
      console.log("\n2. Adding contract templates to knowledge base...");
      for (const template of templates) {
        try {
          await addKnowledgeBaseEntry({
            title: template.name,
            category: "contract_template",
            contentType: "full_contract",
            content: template.content,
            metadata: {
              contractType: template.category,
              description: template.description,
              fields: template.fields || [],
            },
            source: "default_template",
            sourceId: template.id,
          });
          console.log(`  ✓ Added: ${template.name}`);
        } catch (error: any) {
          console.error(`  ✗ Failed to add ${template.name}: ${error.message}`);
        }
      }
    }

    // 3. Add legal principles
    console.log("\n3. Adding legal principles...");
    for (const principle of legalPrinciples) {
      try {
        await addKnowledgeBaseEntry(principle);
        console.log(`  ✓ Added: ${principle.title}`);
      } catch (error: any) {
        console.error(`  ✗ Failed to add ${principle.title}: ${error.message}`);
      }
    }

    // 4. Add legal clauses
    console.log("\n4. Adding legal clauses...");
    for (const clause of legalClauses) {
      try {
        await addKnowledgeBaseEntry(clause);
        console.log(`  ✓ Added: ${clause.title}`);
      } catch (error: any) {
        console.error(`  ✗ Failed to add ${clause.title}: ${error.message}`);
      }
    }

    // 5. Add contract sections and examples
    console.log("\n5. Adding contract sections and examples...");
    for (const section of contractSections) {
      try {
        await addKnowledgeBaseEntry(section);
        console.log(`  ✓ Added: ${section.title}`);
      } catch (error: any) {
        console.error(`  ✗ Failed to add ${section.title}: ${error.message}`);
      }
    }

    // 6. Add full contract examples
    console.log("\n6. Adding full contract examples...");
    for (const example of fullContractExamples) {
      try {
        await addKnowledgeBaseEntry(example);
        console.log(`  ✓ Added: ${example.title}`);
      } catch (error: any) {
        console.error(`  ✗ Failed to add ${example.title}: ${error.message}`);
      }
    }

    // 7. Add additional comprehensive legal clauses
    console.log("\n7. Adding additional comprehensive legal clauses...");
    for (const clause of additionalLegalClauses) {
      try {
        await addKnowledgeBaseEntry(clause);
        console.log(`  ✓ Added: ${clause.title}`);
      } catch (error: any) {
        console.error(`  ✗ Failed to add ${clause.title}: ${error.message}`);
      }
    }

    console.log("\n✅ Knowledge base population completed!");
    console.log(`\nSummary:
- Contract Templates: ${templates?.length || 0}
- Legal Principles: ${legalPrinciples.length}
- Legal Clauses: ${legalClauses.length}
- Additional Legal Clauses: ${additionalLegalClauses.length}
- Contract Sections: ${contractSections.length}
- Full Contract Examples: ${fullContractExamples.length}
- Total Entries: ${(templates?.length || 0) + legalPrinciples.length + legalClauses.length + additionalLegalClauses.length + contractSections.length + fullContractExamples.length}`);

  } catch (error: any) {
    console.error("\n❌ Error populating knowledge base:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
if (typeof require !== "undefined" && require.main === module) {
  populateKnowledgeBase()
    .then(() => {
      console.log("\nDone!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}

export { populateKnowledgeBase };
