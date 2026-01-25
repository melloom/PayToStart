"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import {
  SpellCheck,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  BookOpen,
  Zap,
  Wand2,
  Settings,
  Type,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ============================================
// COMPREHENSIVE AUTO-FIX ALGORITHM
// ============================================

// 1. COMMON MISSPELLINGS - Direct word replacements
const COMMON_MISSPELLINGS: Record<string, string[]> = {
  // Business/Contract terms
  "recieve": ["receive"],
  "reciept": ["receipt"],
  "seperate": ["separate"],
  "occured": ["occurred"],
  "occurence": ["occurrence"],
  "accomodate": ["accommodate"],
  "acommodate": ["accommodate"],
  "committment": ["commitment"],
  "commited": ["committed"],
  "definately": ["definitely"],
  "definitly": ["definitely"],
  "embarass": ["embarrass"],
  "embarras": ["embarrass"],
  "independant": ["independent"],
  "indepedent": ["independent"],
  "liason": ["liaison"],
  "lisence": ["license"],
  "lisense": ["license"],
  "maintainance": ["maintenance"],
  "maintanance": ["maintenance"],
  "neccessary": ["necessary"],
  "necessery": ["necessary"],
  "occassion": ["occasion"],
  "occassionally": ["occasionally"],
  "paralell": ["parallel"],
  "priviledge": ["privilege"],
  "priveledge": ["privilege"],
  "profesional": ["professional"],
  "proffesional": ["professional"],
  "recomend": ["recommend"],
  "reccomend": ["recommend"],
  "refered": ["referred"],
  "referance": ["reference"],
  "relevent": ["relevant"],
  "responsable": ["responsible"],
  "responsability": ["responsibility"],
  "succesful": ["successful"],
  "sucessful": ["successful"],
  "transfered": ["transferred"],
  "untill": ["until"],
  "wierd": ["weird"],
  "writting": ["writing"],
  
  // Common typos
  "teh": ["the"],
  "adn": ["and"],
  "taht": ["that"],
  "thier": ["their"],
  "recieved": ["received"],
  "beleive": ["believe"],
  "belive": ["believe"],
  "acheive": ["achieve"],
  "achive": ["achieve"],
  "adress": ["address"],
  "agrement": ["agreement"],
  "agrrement": ["agreement"],
  "ammount": ["amount"],
  "anual": ["annual"],
  "aparent": ["apparent"],
  "aproximate": ["approximate"],
  "aproximately": ["approximately"],
  "availabe": ["available"],
  "availible": ["available"],
  "begining": ["beginning"],
  "buisness": ["business"],
  "busines": ["business"],
  "calender": ["calendar"],
  "catagory": ["category"],
  "completly": ["completely"],
  "concious": ["conscious"],
  "contrat": ["contract"],
  "controled": ["controlled"],
  "convienent": ["convenient"],
  "correspondance": ["correspondence"],
  "critisism": ["criticism"],
  "decison": ["decision"],
  "discription": ["description"],
  "develope": ["develop"],
  "developement": ["development"],
  "diferent": ["different"],
  "dissapear": ["disappear"],
  "dissapoint": ["disappoint"],
  "enviroment": ["environment"],
  "equipement": ["equipment"],
  "excelent": ["excellent"],
  "existance": ["existence"],
  "experiance": ["experience"],
  "familar": ["familiar"],
  "finaly": ["finally"],
  "foriegn": ["foreign"],
  "fourty": ["forty"],
  "freind": ["friend"],
  "goverment": ["government"],
  "governement": ["government"],
  "grammer": ["grammar"],
  "gurantee": ["guarantee"],
  "garantee": ["guarantee"],
  "harrass": ["harass"],
  "immediatly": ["immediately"],
  "imediately": ["immediately"],
  "incidently": ["incidentally"],
  "knowlege": ["knowledge"],
  "knowlede": ["knowledge"],
  "lenght": ["length"],
  "libary": ["library"],
  "mispell": ["misspell"],
  "mispelled": ["misspelled"],
  "noticable": ["noticeable"],
  "occuring": ["occurring"],
  "omision": ["omission"],
  "oportunity": ["opportunity"],
  "oppurtunity": ["opportunity"],
  "orignal": ["original"],
  "particulary": ["particularly"],
  "payement": ["payment"],
  "performace": ["performance"],
  "persue": ["pursue"],
  "possesion": ["possession"],
  "potencial": ["potential"],
  "preceeding": ["preceding"],
  "prefered": ["preferred"],
  "prejudise": ["prejudice"],
  "presense": ["presence"],
  "probaly": ["probably"],
  "procede": ["proceed"],
  "profesion": ["profession"],
  "publically": ["publicly"],
  "realy": ["really"],
  "reccommend": ["recommend"],
  "refrence": ["reference"],
  "reguardless": ["regardless"],
  "religous": ["religious"],
  "repitition": ["repetition"],
  "resistence": ["resistance"],
  "rythm": ["rhythm"],
  "saftey": ["safety"],
  "schedul": ["schedule"],
  "sentance": ["sentence"],
  "similiar": ["similar"],
  "sincerly": ["sincerely"],
  "speach": ["speech"],
  "strenght": ["strength"],
  "suprise": ["surprise"],
  "tecnical": ["technical"],
  "therfore": ["therefore"],
  "tommorow": ["tomorrow"],
  "tommorrow": ["tomorrow"],
  "truely": ["truly"],
  "underate": ["underrate"],
  "unfortunatly": ["unfortunately"],
  "usally": ["usually"],
  "vaccum": ["vacuum"],
  "vegatable": ["vegetable"],
  "visable": ["visible"],
  "wether": ["whether"],
  "wheras": ["whereas"],
  "wich": ["which"],
  
  // Contract-specific terms
  "agreeement": ["agreement"],
  "ammendment": ["amendment"],
  "arbitation": ["arbitration"],
  "breech": ["breach"],
  "claus": ["clause"],
  "compensaton": ["compensation"],
  "confidentality": ["confidentiality"],
  "considertation": ["consideration"],
  "deliverble": ["deliverable"],
  "efective": ["effective"],
  "enforcable": ["enforceable"],
  "excecution": ["execution"],
  "governning": ["governing"],
  "indemification": ["indemnification"],
  "indemnifcation": ["indemnification"],
  "intelectual": ["intellectual"],
  "jurisdicton": ["jurisdiction"],
  "liabilty": ["liability"],
  "libility": ["liability"],
  "milstone": ["milestone"],
  "negotation": ["negotiation"],
  "obligaton": ["obligation"],
  "penality": ["penalty"],
  "performence": ["performance"],
  "provison": ["provision"],
  "renumeration": ["remuneration"],
  "represenation": ["representation"],
  "representaton": ["representation"],
  "resoution": ["resolution"],
  "severablity": ["severability"],
  "signiture": ["signature"],
  "stipuation": ["stipulation"],
  "subcontrator": ["subcontractor"],
  "termiantion": ["termination"],
  "terminaton": ["termination"],
  "waranty": ["warranty"],
  "warrenty": ["warranty"],
  "wherby": ["whereby"],
  
  // Additional common errors
  "accross": ["across"],
  "alot": ["a lot"],
  "arguement": ["argument"],
  "basicly": ["basically"],
  "beautifull": ["beautiful"],
  "beggining": ["beginning"],
  "benifit": ["benefit"],
  "benifits": ["benefits"],
  "carreer": ["career"],
  "cemetary": ["cemetery"],
  "changable": ["changeable"],
  "cheif": ["chief"],
  "collegue": ["colleague"],
  "comming": ["coming"],
  "commision": ["commission"],
  "comparision": ["comparison"],
  "competance": ["competence"],
  "competant": ["competent"],
  "concensus": ["consensus"],
  "consistant": ["consistent"],
  "continous": ["continuous"],
  "copywrite": ["copyright"],
  "curiousity": ["curiosity"],
  "currantly": ["currently"],
  "definate": ["definite"],
  "dependant": ["dependent"],
  "desparate": ["desperate"],
  "deterrant": ["deterrent"],
  "dilema": ["dilemma"],
  "disasterous": ["disastrous"],
  "dispite": ["despite"],
  "drunkeness": ["drunkenness"],
  "dumbell": ["dumbbell"],
  "efficency": ["efficiency"],
  "eigth": ["eighth"],
  "embarrasment": ["embarrassment"],
  "enterance": ["entrance"],
  "enthusiatic": ["enthusiastic"],
  "enviorment": ["environment"],
  "excede": ["exceed"],
  "excercise": ["exercise"],
  "explaination": ["explanation"],
  "facinate": ["fascinate"],
  "farenheit": ["fahrenheit"],
  "febuary": ["february"],
  "firey": ["fiery"],
  "flourescent": ["fluorescent"],
  "forseeable": ["foreseeable"],
  "foward": ["forward"],
  "freindly": ["friendly"],
  "fulfil": ["fulfill"],
  "geneology": ["genealogy"],
  "generaly": ["generally"],
  "gratefull": ["grateful"],
  "greatful": ["grateful"],
  "guarentee": ["guarantee"],
  "happend": ["happened"],
  "harrased": ["harassed"],
  "heighth": ["height"],
  "heros": ["heroes"],
  "hiarchy": ["hierarchy"],
  "hygene": ["hygiene"],
  "ignorence": ["ignorance"],
  "imaginery": ["imaginary"],
  "imitate": ["imitate"],
  "imediate": ["immediate"],
  "incidently": ["incidentally"],
  "independance": ["independence"],
  "indispensible": ["indispensable"],
  "innoculate": ["inoculate"],
  "inteligence": ["intelligence"],
  "intresting": ["interesting"],
  "irresistable": ["irresistible"],
  "jeapardy": ["jeopardy"],
  "jewelery": ["jewelry"],
  "judgement": ["judgment"],
  "knowlegeable": ["knowledgeable"],
  "labratory": ["laboratory"],
  "liesure": ["leisure"],
  "lightening": ["lightning"],
  "likeable": ["likable"],
  "liquer": ["liquor"],
  "lonliness": ["loneliness"],
  "loosing": ["losing"],
  "maintenence": ["maintenance"],
  "managable": ["manageable"],
  "manuever": ["maneuver"],
  "marrige": ["marriage"],
  "medeval": ["medieval"],
  "memento": ["memento"],
  "millenium": ["millennium"],
  "minature": ["miniature"],
  "miniscule": ["minuscule"],
  "mischievious": ["mischievous"],
  "misspel": ["misspell"],
  "morgage": ["mortgage"],
  "naturaly": ["naturally"],
  "neice": ["niece"],
  "nieghbor": ["neighbor"],
  "noticible": ["noticeable"],
  "occurance": ["occurrence"],
  "occurrance": ["occurrence"],
  "offically": ["officially"],
  "omited": ["omitted"],
  "oppinion": ["opinion"],
  "optomistic": ["optimistic"],
  "outragous": ["outrageous"],
  "overun": ["overrun"],
  "parliment": ["parliament"],
  "passtime": ["pastime"],
  "pasttime": ["pastime"],
  "peice": ["piece"],
  "percieve": ["perceive"],
  "permenent": ["permanent"],
  "permision": ["permission"],
  "persistant": ["persistent"],
  "personel": ["personnel"],
  "persue": ["pursue"],
  "phenominal": ["phenomenal"],
  "playwrite": ["playwright"],
  "pleasent": ["pleasant"],
  "politican": ["politician"],
  "posession": ["possession"],
  "possesion": ["possession"],
  "practicly": ["practically"],
  "preceed": ["precede"],
  "predjudice": ["prejudice"],
  "presance": ["presence"],
  "privelege": ["privilege"],
  "proceedure": ["procedure"],
  "professer": ["professor"],
  "programing": ["programming"],
  "prominant": ["prominent"],
  "pronounciation": ["pronunciation"],
  "propoganda": ["propaganda"],
  "prufe": ["proof"],
  "pschology": ["psychology"],
  "publically": ["publicly"],
  "pursuade": ["persuade"],
  "questionaire": ["questionnaire"],
  "readible": ["readable"],
  "realy": ["really"],
  "reciept": ["receipt"],
  "recognise": ["recognize"],
  "recomendation": ["recommendation"],
  "recurrance": ["recurrence"],
  "refering": ["referring"],
  "reknown": ["renown"],
  "religous": ["religious"],
  "reluctent": ["reluctant"],
  "remeber": ["remember"],
  "repitition": ["repetition"],
  "representive": ["representative"],
  "restaraunt": ["restaurant"],
  "rediculous": ["ridiculous"],
  "sacrafice": ["sacrifice"],
  "sacreligious": ["sacrilegious"],
  "safty": ["safety"],
  "sandwhich": ["sandwich"],
  "satisfyed": ["satisfied"],
  "scedule": ["schedule"],
  "scholership": ["scholarship"],
  "scisors": ["scissors"],
  "secretery": ["secretary"],
  "seize": ["seize"],
  "sence": ["sense"],
  "seperation": ["separation"],
  "sergent": ["sergeant"],
  "shineing": ["shining"],
  "shouldnt": ["shouldn't"],
  "sieze": ["seize"],
  "similer": ["similar"],
  "simplfy": ["simplify"],
  "sinceerly": ["sincerely"],
  "skilfull": ["skillful"],
  "slowy": ["slowly"],
  "sofware": ["software"],
  "soley": ["solely"],
  "speach": ["speech"],
  "sponser": ["sponsor"],
  "stoping": ["stopping"],
  "stragedy": ["strategy"],
  "strengh": ["strength"],
  "studing": ["studying"],
  "subconsious": ["subconscious"],
  "succede": ["succeed"],
  "sucess": ["success"],
  "sucessfull": ["successful"],
  "sufficent": ["sufficient"],
  "sumary": ["summary"],
  "superintendant": ["superintendent"],
  "supercede": ["supersede"],
  "surley": ["surely"],
  "surounding": ["surrounding"],
  "surveilance": ["surveillance"],
  "survivied": ["survived"],
  "sytem": ["system"],
  "tatoo": ["tattoo"],
  "tendancy": ["tendency"],
  "therefor": ["therefore"],
  "threshhold": ["threshold"],
  "throught": ["through"],
  "tounge": ["tongue"],
  "tradegy": ["tragedy"],
  "transfering": ["transferring"],
  "trully": ["truly"],
  "twelth": ["twelfth"],
  "tyrany": ["tyranny"],
  "underate": ["underrate"],
  "unecessary": ["unnecessary"],
  "unfortunatley": ["unfortunately"],
  "unneccessary": ["unnecessary"],
  "usefull": ["useful"],
  "vaccuum": ["vacuum"],
  "vegeterian": ["vegetarian"],
  "vehical": ["vehicle"],
  "vengance": ["vengeance"],
  "villian": ["villain"],
  "violance": ["violence"],
  "visious": ["vicious"],
  "volumne": ["volume"],
  "warrent": ["warrant"],
  "wensday": ["wednesday"],
  "whereever": ["wherever"],
  "whos": ["who's", "whose"],
  "wonderfull": ["wonderful"],
  "wouldnt": ["wouldn't"],
  "writen": ["written"],
  "yeild": ["yield"],
};

// 2. DOUBLED LETTER FIXES - Common double letter mistakes
const DOUBLED_LETTER_FIXES: Record<string, string> = {
  "accomodation": "accommodation",
  "adddress": "address",
  "aggresssive": "aggressive",
  "allready": "already",
  "alltogether": "altogether",
  "ammend": "amend",
  "annuall": "annual",
  "apparrent": "apparent",
  "assocciate": "associate",
  "attemmpt": "attempt",
  "balllance": "balance",
  "begginning": "beginning",
  "bussiness": "business",
  "calll": "call",
  "carrer": "career",
  "comittee": "committee",
  "commitee": "committee",
  "committe": "committee",
  "commmunity": "community",
  "connnect": "connect",
  "corrrect": "correct",
  "diffference": "difference",
  "disscuss": "discuss",
  "effecttive": "effective",
  "emmployee": "employee",
  "exammple": "example",
  "excelllent": "excellent",
  "expperience": "experience",
  "finallly": "finally",
  "generrally": "generally",
  "goverrnment": "government",
  "happppen": "happen",
  "immmediate": "immediate",
  "importtant": "important",
  "includde": "include",
  "informmation": "information",
  "intterest": "interest",
  "isssue": "issue",
  "mannage": "manage",
  "neccesssary": "necessary",
  "occassional": "occasional",
  "offfer": "offer",
  "oppportunity": "opportunity",
  "orriginal": "original",
  "parrticular": "particular",
  "personnal": "personal",
  "posssible": "possible",
  "proffessional": "professional",
  "proggram": "program",
  "provvide": "provide",
  "publlic": "public",
  "reallly": "really",
  "reccommendation": "recommendation",
  "refference": "reference",
  "requiree": "require",
  "responnsible": "responsible",
  "servicce": "service",
  "speciall": "special",
  "successfull": "successful",
  "supportt": "support",
  "systtem": "system",
  "toggether": "together",
  "underrstand": "understand",
  "ussualy": "usually",
  "valuue": "value",
  "withhin": "within",
  "worrd": "word",
};

// 3. GRAMMAR PATTERNS - Common grammatical mistakes
const GRAMMAR_PATTERNS: Array<{
  pattern: RegExp;
  replacement: string;
  description: string;
  category: "grammar" | "style" | "punctuation";
}> = [
  // Double spaces
  { pattern: /  +/g, replacement: " ", description: "Remove extra spaces", category: "punctuation" },
  
  // Missing space after punctuation
  { pattern: /([.!?])([A-Z])/g, replacement: "$1 $2", description: "Add space after punctuation", category: "punctuation" },
  
  // Multiple punctuation
  { pattern: /([.!?]){2,}/g, replacement: "$1", description: "Remove duplicate punctuation", category: "punctuation" },
  
  // Space before punctuation
  { pattern: / +([.!?,;:])/g, replacement: "$1", description: "Remove space before punctuation", category: "punctuation" },
  
  // Capitalize first letter after period
  { pattern: /\. ([a-z])/g, replacement: (match, letter) => `. ${letter.toUpperCase()}`, description: "Capitalize after period", category: "grammar" },
  
  // Common grammar mistakes
  { pattern: /\bi am\b/gi, replacement: "I am", description: "Capitalize 'I'", category: "grammar" },
  { pattern: /\bi'm\b/gi, replacement: "I'm", description: "Capitalize 'I'm'", category: "grammar" },
  { pattern: /\bi've\b/gi, replacement: "I've", description: "Capitalize 'I've'", category: "grammar" },
  { pattern: /\bi'll\b/gi, replacement: "I'll", description: "Capitalize 'I'll'", category: "grammar" },
  { pattern: /\bi'd\b/gi, replacement: "I'd", description: "Capitalize 'I'd'", category: "grammar" },
  
  // Common word confusions
  { pattern: /\btheir is\b/gi, replacement: "there is", description: "their → there (before 'is')", category: "grammar" },
  { pattern: /\btheir are\b/gi, replacement: "there are", description: "their → there (before 'are')", category: "grammar" },
  { pattern: /\byour welcome\b/gi, replacement: "you're welcome", description: "your → you're (welcome)", category: "grammar" },
  { pattern: /\byour right\b/gi, replacement: "you're right", description: "your → you're (right)", category: "grammar" },
  { pattern: /\bits a\b/gi, replacement: "it's a", description: "its → it's (before 'a')", category: "grammar" },
  { pattern: /\bshould of\b/gi, replacement: "should have", description: "should of → should have", category: "grammar" },
  { pattern: /\bcould of\b/gi, replacement: "could have", description: "could of → could have", category: "grammar" },
  { pattern: /\bwould of\b/gi, replacement: "would have", description: "would of → would have", category: "grammar" },
  { pattern: /\bmight of\b/gi, replacement: "might have", description: "might of → might have", category: "grammar" },
  { pattern: /\bmust of\b/gi, replacement: "must have", description: "must of → must have", category: "grammar" },
  
  // Contractions that should be expanded in formal writing
  // { pattern: /\bdon't\b/gi, replacement: "do not", description: "Expand contraction", category: "style" },
  // { pattern: /\bwon't\b/gi, replacement: "will not", description: "Expand contraction", category: "style" },
  // { pattern: /\bcan't\b/gi, replacement: "cannot", description: "Expand contraction", category: "style" },
  
  // Repeated words
  { pattern: /\b(\w+)\s+\1\b/gi, replacement: "$1", description: "Remove repeated word", category: "grammar" },
  
  // A/An corrections
  { pattern: /\ba ([aeiou])/gi, replacement: "an $1", description: "a → an (before vowel)", category: "grammar" },
  { pattern: /\ban ([^aeiou\s])/gi, replacement: "a $1", description: "an → a (before consonant)", category: "grammar" },
];

// 4. CAPITALIZATION RULES
const CAPITALIZATION_RULES: Array<{
  pattern: RegExp;
  replacement: string | ((match: string) => string);
  description: string;
}> = [
  // Days of the week
  { pattern: /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi, replacement: (m) => m.charAt(0).toUpperCase() + m.slice(1).toLowerCase(), description: "Capitalize day names" },
  
  // Months
  { pattern: /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/gi, replacement: (m) => m.charAt(0).toUpperCase() + m.slice(1).toLowerCase(), description: "Capitalize month names" },
  
  // Common proper nouns in contracts
  { pattern: /\b(contractor|client|provider|customer|vendor|party|parties)\b/g, replacement: (m) => m.charAt(0).toUpperCase() + m.slice(1), description: "Capitalize party references" },
];

// 5. SMART QUOTES AND TYPOGRAPHY
const TYPOGRAPHY_FIXES: Array<{
  pattern: RegExp;
  replacement: string;
  description: string;
}> = [
  // Smart quotes (optional - can be enabled/disabled)
  // { pattern: /"([^"]+)"/g, replacement: ""$1"", description: "Smart double quotes" },
  // { pattern: /'([^']+)'/g, replacement: "'$1'", description: "Smart single quotes" },
  
  // Ellipsis
  { pattern: /\.\.\./g, replacement: "…", description: "Use proper ellipsis" },
  
  // Em dash
  { pattern: / - /g, replacement: " — ", description: "Use em dash" },
  { pattern: /--/g, replacement: "—", description: "Use em dash" },
  
  // Fractions
  { pattern: /\b1\/2\b/g, replacement: "½", description: "Use fraction symbol" },
  { pattern: /\b1\/4\b/g, replacement: "¼", description: "Use fraction symbol" },
  { pattern: /\b3\/4\b/g, replacement: "¾", description: "Use fraction symbol" },
];

// 6. LEGAL/FORMAL WRITING IMPROVEMENTS
const FORMAL_WRITING_FIXES: Array<{
  pattern: RegExp;
  replacement: string;
  description: string;
}> = [
  // Informal to formal
  { pattern: /\bgonna\b/gi, replacement: "going to", description: "Formalize 'gonna'" },
  { pattern: /\bwanna\b/gi, replacement: "want to", description: "Formalize 'wanna'" },
  { pattern: /\bgotta\b/gi, replacement: "have to", description: "Formalize 'gotta'" },
  { pattern: /\bkinda\b/gi, replacement: "kind of", description: "Formalize 'kinda'" },
  { pattern: /\bsorta\b/gi, replacement: "sort of", description: "Formalize 'sorta'" },
  { pattern: /\blotta\b/gi, replacement: "lot of", description: "Formalize 'lotta'" },
  { pattern: /\bdunno\b/gi, replacement: "do not know", description: "Formalize 'dunno'" },
  { pattern: /\blemme\b/gi, replacement: "let me", description: "Formalize 'lemme'" },
  { pattern: /\bgimme\b/gi, replacement: "give me", description: "Formalize 'gimme'" },
  
  // Text speak
  { pattern: /\bu\b/gi, replacement: "you", description: "Expand 'u' to 'you'" },
  { pattern: /\br\b/gi, replacement: "are", description: "Expand 'r' to 'are'" },
  { pattern: /\bur\b/gi, replacement: "your", description: "Expand 'ur' to 'your'" },
  { pattern: /\bpls\b/gi, replacement: "please", description: "Expand 'pls'" },
  { pattern: /\bthx\b/gi, replacement: "thanks", description: "Expand 'thx'" },
  { pattern: /\btmrw\b/gi, replacement: "tomorrow", description: "Expand 'tmrw'" },
  { pattern: /\bbtw\b/gi, replacement: "by the way", description: "Expand 'btw'" },
  { pattern: /\basap\b/gi, replacement: "as soon as possible", description: "Expand 'asap'" },
  { pattern: /\bfyi\b/gi, replacement: "for your information", description: "Expand 'fyi'" },
];

// 7. VALID WORDS DICTIONARY
const VALID_WORDS = new Set([
  // Common words
  "the", "and", "for", "are", "but", "not", "you", "all", "can", "had", "her",
  "was", "one", "our", "out", "day", "get", "has", "him", "his", "how", "its",
  "may", "new", "now", "old", "see", "way", "who", "boy", "did", "own", "say",
  "she", "too", "use", "said", "each", "which", "their", "will", "other",
  "about", "into", "than", "them", "these", "some", "time", "very", "when",
  "come", "could", "make", "like", "back", "only", "over", "such", "year",
  "also", "most", "work", "first", "after", "well", "must", "being", "before",
  
  // Legal/Business terms
  "herein", "hereto", "hereby", "hereof", "thereof", "thereto", "therein",
  "whereas", "whereby", "wherein", "whereof", "aforesaid", "aforementioned",
  "hereunder", "thereunder", "notwithstanding", "indemnify", "indemnification",
  "subcontractor", "subcontractors", "deliverable", "deliverables",
  "milestone", "milestones", "pro-rata", "prorata", "escrow", "arbitration",
  "mediation", "adjudication", "jurisdiction", "confidentiality", "proprietary",
  "intellectual", "trademark", "copyright", "patent", "licensing", "licensee",
  "licensor", "assignee", "assignor", "beneficiary", "signatory", "signatories",
  "counterpart", "counterparts", "amend", "amendment", "amendments",
  "termination", "terminate", "terminated", "breach", "breached", "breaches",
  "covenant", "covenants", "warranty", "warranties", "liability", "liabilities",
  "indemnity", "indemnities", "negligence", "negligent", "waiver", "waivers",
  "severability", "severance", "enforceability", "enforceable", "unenforceable",
  "supersede", "supersedes", "superseding", "prevail", "prevailing",
  "remuneration", "compensation", "reimbursement", "disbursement",
  "invoice", "invoices", "invoicing", "payable", "receivable",
  "accrued", "accrual", "accruals", "pro-rated", "prorated",
  
  // Tech terms
  "api", "apis", "url", "urls", "html", "css", "javascript", "typescript",
  "frontend", "backend", "fullstack", "database", "databases", "server",
  "servers", "hosting", "deployment", "deployments", "repository",
  "repositories", "codebase", "codebases", "framework", "frameworks",
  "responsive", "scalable", "scalability", "optimization", "optimizations",
  "analytics", "integration", "integrations", "authentication", "authorization",
  
  // Company/Business
  "llc", "inc", "corp", "ltd", "plc", "gmbh", "sarl", "bv", "nv",
  "ceo", "cto", "cfo", "coo", "vp", "svp", "evp", "md", "gm",
  "freelancer", "freelancers", "contractor", "contractors", "consultant",
  "consultants", "vendor", "vendors", "supplier", "suppliers", "client",
  "clients", "stakeholder", "stakeholders", "shareholder", "shareholders",
]);

// ============================================
// SPELL CHECK TYPES AND INTERFACES
// ============================================

interface SpellError {
  word: string;
  index: number;
  suggestions: string[];
  context: string;
  type: "spelling" | "grammar" | "style" | "punctuation" | "capitalization" | "typography" | "formal";
}

interface AutoFixResult {
  originalText: string;
  fixedText: string;
  changes: Array<{
    original: string;
    fixed: string;
    type: string;
    description: string;
  }>;
}

interface SpellCheckerProps {
  content: string;
  onFix: (oldWord: string, newWord: string) => void;
  onFixAll?: (fixes: Array<{ oldWord: string; newWord: string }>) => void;
  onAutoFix?: (fixedContent: string) => void;
  className?: string;
  variant?: "inline" | "panel";
  enableAutoFix?: boolean;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Extract plain text from HTML
function stripHtml(html: string): string {
  if (typeof document === "undefined") return html;
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

// Calculate Levenshtein distance for fuzzy matching
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

// Find similar words using Levenshtein distance
function findSimilarWords(word: string, dictionary: string[], maxDistance: number = 2): string[] {
  const lowerWord = word.toLowerCase();
  const similar: Array<{ word: string; distance: number }> = [];
  
  for (const dictWord of dictionary) {
    const distance = levenshteinDistance(lowerWord, dictWord.toLowerCase());
    if (distance <= maxDistance && distance > 0) {
      similar.push({ word: dictWord, distance });
    }
  }
  
  return similar
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3)
    .map((s) => s.word);
}

// Check if a word is likely valid
function isValidWord(word: string): boolean {
  const lowerWord = word.toLowerCase();
  
  if (word.length < 2) return true;
  if (/\d/.test(word)) return true;
  if (/^\{\{.*\}\}$/.test(word)) return true;
  if (VALID_WORDS.has(lowerWord)) return true;
  if (word[0] === word[0].toUpperCase() && word.length > 1) return true;
  if (word.includes("@") || word.includes("://") || word.includes(".com")) return true;
  
  return false;
}

// ============================================
// MAIN SPELL CHECK FUNCTIONS
// ============================================

// Find all spelling errors
function findSpellingErrors(text: string): SpellError[] {
  const plainText = stripHtml(text);
  const words = plainText.match(/\b[a-zA-Z]+\b/g) || [];
  const errors: SpellError[] = [];
  const seenWords = new Set<string>();
  
  let currentIndex = 0;
  
  for (const word of words) {
    const lowerWord = word.toLowerCase();
    
    if (seenWords.has(lowerWord)) {
      currentIndex = plainText.indexOf(word, currentIndex) + word.length;
      continue;
    }
    
    // Check common misspellings
    if (COMMON_MISSPELLINGS[lowerWord]) {
      const wordIndex = plainText.indexOf(word, currentIndex);
      const contextStart = Math.max(0, wordIndex - 20);
      const contextEnd = Math.min(plainText.length, wordIndex + word.length + 20);
      const context = plainText.substring(contextStart, contextEnd);
      
      errors.push({
        word,
        index: wordIndex,
        suggestions: COMMON_MISSPELLINGS[lowerWord],
        context: `...${context}...`,
        type: "spelling",
      });
      seenWords.add(lowerWord);
    }
    
    // Check doubled letter fixes
    if (DOUBLED_LETTER_FIXES[lowerWord]) {
      const wordIndex = plainText.indexOf(word, currentIndex);
      const contextStart = Math.max(0, wordIndex - 20);
      const contextEnd = Math.min(plainText.length, wordIndex + word.length + 20);
      const context = plainText.substring(contextStart, contextEnd);
      
      errors.push({
        word,
        index: wordIndex,
        suggestions: [DOUBLED_LETTER_FIXES[lowerWord]],
        context: `...${context}...`,
        type: "spelling",
      });
      seenWords.add(lowerWord);
    }
    
    currentIndex = plainText.indexOf(word, currentIndex) + word.length;
  }
  
  return errors;
}

// Find grammar errors
function findGrammarErrors(text: string): SpellError[] {
  const plainText = stripHtml(text);
  const errors: SpellError[] = [];
  
  for (const rule of GRAMMAR_PATTERNS) {
    const matches = plainText.matchAll(new RegExp(rule.pattern.source, rule.pattern.flags));
    
    for (const match of matches) {
      if (match.index !== undefined) {
        const contextStart = Math.max(0, match.index - 15);
        const contextEnd = Math.min(plainText.length, match.index + match[0].length + 15);
        const context = plainText.substring(contextStart, contextEnd);
        
        const replacement = typeof rule.replacement === "function"
          ? match[0].replace(rule.pattern, rule.replacement as any)
          : match[0].replace(rule.pattern, rule.replacement);
        
        if (replacement !== match[0]) {
          errors.push({
            word: match[0],
            index: match.index,
            suggestions: [replacement],
            context: `...${context}...`,
            type: rule.category,
          });
        }
      }
    }
  }
  
  return errors;
}

// Find formal writing issues
function findFormalWritingIssues(text: string): SpellError[] {
  const plainText = stripHtml(text);
  const errors: SpellError[] = [];
  
  for (const rule of FORMAL_WRITING_FIXES) {
    const matches = plainText.matchAll(new RegExp(rule.pattern.source, rule.pattern.flags));
    
    for (const match of matches) {
      if (match.index !== undefined) {
        const contextStart = Math.max(0, match.index - 15);
        const contextEnd = Math.min(plainText.length, match.index + match[0].length + 15);
        const context = plainText.substring(contextStart, contextEnd);
        
        errors.push({
          word: match[0],
          index: match.index,
          suggestions: [rule.replacement],
          context: `...${context}...`,
          type: "formal",
        });
      }
    }
  }
  
  return errors;
}

// Auto-fix all issues
function autoFixAll(text: string): AutoFixResult {
  let fixedText = text;
  const changes: AutoFixResult["changes"] = [];
  
  // 1. Fix spelling errors
  for (const [misspelling, corrections] of Object.entries(COMMON_MISSPELLINGS)) {
    const regex = new RegExp(`\\b${misspelling}\\b`, "gi");
    if (regex.test(fixedText)) {
      const original = fixedText;
      fixedText = fixedText.replace(regex, (match) => {
        // Preserve case
        if (match[0] === match[0].toUpperCase()) {
          return corrections[0].charAt(0).toUpperCase() + corrections[0].slice(1);
        }
        return corrections[0];
      });
      if (original !== fixedText) {
        changes.push({
          original: misspelling,
          fixed: corrections[0],
          type: "spelling",
          description: `Fixed spelling: ${misspelling} → ${corrections[0]}`,
        });
      }
    }
  }
  
  // 2. Fix doubled letters
  for (const [error, correction] of Object.entries(DOUBLED_LETTER_FIXES)) {
    const regex = new RegExp(`\\b${error}\\b`, "gi");
    if (regex.test(fixedText)) {
      const original = fixedText;
      fixedText = fixedText.replace(regex, (match) => {
        if (match[0] === match[0].toUpperCase()) {
          return correction.charAt(0).toUpperCase() + correction.slice(1);
        }
        return correction;
      });
      if (original !== fixedText) {
        changes.push({
          original: error,
          fixed: correction,
          type: "spelling",
          description: `Fixed doubled letters: ${error} → ${correction}`,
        });
      }
    }
  }
  
  // 3. Fix grammar patterns
  for (const rule of GRAMMAR_PATTERNS) {
    const original = fixedText;
    fixedText = fixedText.replace(rule.pattern, rule.replacement as string);
    if (original !== fixedText) {
      changes.push({
        original: "pattern",
        fixed: "corrected",
        type: rule.category,
        description: rule.description,
      });
    }
  }
  
  // 4. Fix formal writing
  for (const rule of FORMAL_WRITING_FIXES) {
    const original = fixedText;
    fixedText = fixedText.replace(rule.pattern, rule.replacement);
    if (original !== fixedText) {
      changes.push({
        original: "informal",
        fixed: "formal",
        type: "formal",
        description: rule.description,
      });
    }
  }
  
  // 5. Fix capitalization
  for (const rule of CAPITALIZATION_RULES) {
    const original = fixedText;
    fixedText = fixedText.replace(rule.pattern, rule.replacement as string);
    if (original !== fixedText) {
      changes.push({
        original: "lowercase",
        fixed: "capitalized",
        type: "capitalization",
        description: rule.description,
      });
    }
  }
  
  // 6. Fix typography
  for (const rule of TYPOGRAPHY_FIXES) {
    const original = fixedText;
    fixedText = fixedText.replace(rule.pattern, rule.replacement);
    if (original !== fixedText) {
      changes.push({
        original: "typography",
        fixed: "improved",
        type: "typography",
        description: rule.description,
      });
    }
  }
  
  return {
    originalText: text,
    fixedText,
    changes,
  };
}

// ============================================
// REACT COMPONENTS
// ============================================

export function SpellChecker({
  content,
  onFix,
  onFixAll,
  onAutoFix,
  className,
  variant = "panel",
  enableAutoFix = true,
}: SpellCheckerProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [errors, setErrors] = useState<SpellError[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [ignoredWords, setIgnoredWords] = useState<Set<string>>(new Set());
  const [hasChecked, setHasChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "spelling" | "grammar" | "style">("all");
  const [autoFixResult, setAutoFixResult] = useState<AutoFixResult | null>(null);

  const checkSpelling = useCallback(() => {
    setIsChecking(true);
    
    setTimeout(() => {
      const spellingErrors = findSpellingErrors(content);
      const grammarErrors = findGrammarErrors(content);
      const formalErrors = findFormalWritingIssues(content);
      
      const allErrors = [...spellingErrors, ...grammarErrors, ...formalErrors];
      const filteredErrors = allErrors.filter(
        (e) => !ignoredWords.has(e.word.toLowerCase())
      );
      
      // Remove duplicates
      const uniqueErrors = filteredErrors.filter(
        (error, index, self) =>
          index === self.findIndex((e) => e.word === error.word && e.index === error.index)
      );
      
      setErrors(uniqueErrors);
      setIsChecking(false);
      setHasChecked(true);
      
      // Also calculate auto-fix result
      if (enableAutoFix) {
        const result = autoFixAll(content);
        setAutoFixResult(result);
      }
    }, 300);
  }, [content, ignoredWords, enableAutoFix]);

  const handleFix = (error: SpellError, suggestion: string) => {
    onFix(error.word, suggestion);
    setErrors(errors.filter((e) => e.word !== error.word || e.index !== error.index));
  };

  const handleIgnore = (word: string) => {
    setIgnoredWords(new Set([...ignoredWords, word.toLowerCase()]));
    setErrors(errors.filter((e) => e.word.toLowerCase() !== word.toLowerCase()));
  };

  const handleFixAll = () => {
    if (onFixAll && errors.length > 0) {
      const fixes = errors.map((e) => ({
        oldWord: e.word,
        newWord: e.suggestions[0],
      }));
      onFixAll(fixes);
      setErrors([]);
    }
  };

  const handleAutoFix = () => {
    if (onAutoFix && autoFixResult) {
      onAutoFix(autoFixResult.fixedText);
      setErrors([]);
      setAutoFixResult(null);
      setHasChecked(false);
    }
  };

  useEffect(() => {
    if (hasChecked) {
      const timer = setTimeout(() => {
        checkSpelling();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [content, hasChecked, checkSpelling]);

  const filteredErrors = useMemo(() => {
    if (activeTab === "all") return errors;
    if (activeTab === "spelling") return errors.filter((e) => e.type === "spelling");
    if (activeTab === "grammar") return errors.filter((e) => e.type === "grammar" || e.type === "punctuation");
    if (activeTab === "style") return errors.filter((e) => e.type === "style" || e.type === "formal" || e.type === "typography");
    return errors;
  }, [errors, activeTab]);

  const errorCounts = useMemo(() => ({
    all: errors.length,
    spelling: errors.filter((e) => e.type === "spelling").length,
    grammar: errors.filter((e) => e.type === "grammar" || e.type === "punctuation").length,
    style: errors.filter((e) => e.type === "style" || e.type === "formal" || e.type === "typography").length,
  }), [errors]);

  const getTypeIcon = (type: SpellError["type"]) => {
    switch (type) {
      case "spelling": return <SpellCheck className="h-3.5 w-3.5 text-red-400" />;
      case "grammar": return <Type className="h-3.5 w-3.5 text-amber-400" />;
      case "punctuation": return <FileText className="h-3.5 w-3.5 text-blue-400" />;
      case "style": return <Sparkles className="h-3.5 w-3.5 text-purple-400" />;
      case "formal": return <FileText className="h-3.5 w-3.5 text-indigo-400" />;
      case "typography": return <Type className="h-3.5 w-3.5 text-cyan-400" />;
      default: return <AlertCircle className="h-3.5 w-3.5 text-slate-400" />;
    }
  };

  const getTypeLabel = (type: SpellError["type"]) => {
    switch (type) {
      case "spelling": return "Spelling";
      case "grammar": return "Grammar";
      case "punctuation": return "Punctuation";
      case "style": return "Style";
      case "formal": return "Formal Writing";
      case "typography": return "Typography";
      default: return "Issue";
    }
  };

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={checkSpelling}
          disabled={isChecking}
          className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
        >
          {isChecking ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <SpellCheck className="h-4 w-4 mr-2" />
          )}
          Check Spelling
        </Button>
        {hasChecked && (
          <span className={cn(
            "text-xs px-2 py-1 rounded-full",
            errors.length > 0
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              : "bg-green-500/20 text-green-300 border border-green-500/30"
          )}>
            {errors.length > 0
              ? `${errors.length} issue${errors.length > 1 ? "s" : ""} found`
              : "No issues found"}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("border-2 border-slate-700 rounded-lg overflow-hidden bg-slate-800/50", className)}>
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 bg-slate-800 border-b border-slate-700 cursor-pointer hover:bg-slate-700/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <SpellCheck className="h-4 w-4 text-indigo-400" />
          <span className="text-sm font-medium text-white">Spell Checker & Auto-Fix</span>
          {hasChecked && (
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              errors.length > 0
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "bg-green-500/20 text-green-300 border border-green-500/30"
            )}>
              {errors.length > 0
                ? `${errors.length} issue${errors.length > 1 ? "s" : ""}`
                : "All clear"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              checkSpelling();
            }}
            disabled={isChecking}
            className="h-7 px-2 text-slate-400 hover:text-white"
          >
            {isChecking ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
          </Button>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-3 space-y-3">
          {!hasChecked ? (
            <div className="text-center py-6">
              <BookOpen className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-400 mb-3">
                Check your content for spelling, grammar, and style issues
              </p>
              <div className="flex items-center justify-center gap-2">
                <Button
                  type="button"
                  onClick={checkSpelling}
                  disabled={isChecking}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {isChecking ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <SpellCheck className="h-4 w-4 mr-2" />
                      Check Now
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : isChecking ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
              <span className="ml-2 text-sm text-slate-400">Analyzing content...</span>
            </div>
          ) : errors.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                <Check className="h-6 w-6 text-green-400" />
              </div>
              <p className="text-sm font-medium text-green-400">No issues found!</p>
              <p className="text-xs text-slate-500 mt-1">Your content looks great</p>
            </div>
          ) : (
            <>
              {/* Auto-Fix All Button */}
              {enableAutoFix && autoFixResult && autoFixResult.changes.length > 0 && (
                <div className="p-3 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-lg border border-indigo-700/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Wand2 className="h-5 w-5 text-indigo-400" />
                      <span className="text-sm font-medium text-white">Auto-Fix Available</span>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAutoFix}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
                    >
                      <Wand2 className="h-3.5 w-3.5 mr-1.5" />
                      Fix All ({autoFixResult.changes.length})
                    </Button>
                  </div>
                  <p className="text-xs text-slate-400">
                    Automatically fix {autoFixResult.changes.length} issue{autoFixResult.changes.length > 1 ? "s" : ""} including spelling, grammar, and style improvements
                  </p>
                </div>
              )}

              {/* Tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-900/50 rounded-lg">
                {(["all", "spelling", "grammar", "style"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                      activeTab === tab
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                    )}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {errorCounts[tab] > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full bg-slate-700/50">
                        {errorCounts[tab]}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Error List */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {filteredErrors.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-xs text-slate-500">No {activeTab} issues found</p>
                  </div>
                ) : (
                  filteredErrors.map((error, idx) => (
                    <div
                      key={`${error.word}-${error.index}-${idx}`}
                      className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(error.type)}
                          <span className="text-xs px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400">
                            {getTypeLabel(error.type)}
                          </span>
                          <span className="text-sm text-white font-medium">
                            &ldquo;{error.word}&rdquo;
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleIgnore(error.word)}
                          className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          Ignore
                        </button>
                      </div>
                      
                      <p className="text-xs text-slate-500 mb-2 truncate">
                        {error.context}
                      </p>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Suggestions:</span>
                        <div className="flex flex-wrap gap-1">
                          {error.suggestions.map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => handleFix(error, suggestion)}
                              className="text-xs px-2 py-1 rounded bg-green-600/20 text-green-300 hover:bg-green-600/30 border border-green-600/30 transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Fix All Individual Button */}
              {filteredErrors.length > 1 && onFixAll && (
                <div className="pt-2 border-t border-slate-700">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleFixAll}
                    variant="outline"
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Zap className="h-3.5 w-3.5 mr-1.5" />
                    Fix All {activeTab !== "all" ? getTypeLabel(activeTab as any) : ""} Issues ({filteredErrors.length})
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// HOOK FOR PROGRAMMATIC USE
// ============================================

export function useSpellChecker() {
  const [ignoredWords, setIgnoredWords] = useState<Set<string>>(new Set());

  const checkText = useCallback((text: string): SpellError[] => {
    const spellingErrors = findSpellingErrors(text);
    const grammarErrors = findGrammarErrors(text);
    const formalErrors = findFormalWritingIssues(text);
    
    const allErrors = [...spellingErrors, ...grammarErrors, ...formalErrors];
    return allErrors.filter((e) => !ignoredWords.has(e.word.toLowerCase()));
  }, [ignoredWords]);

  const ignoreWord = useCallback((word: string) => {
    setIgnoredWords((prev) => new Set([...prev, word.toLowerCase()]));
  }, []);

  const getSuggestions = useCallback((word: string): string[] => {
    const lowerWord = word.toLowerCase();
    if (COMMON_MISSPELLINGS[lowerWord]) {
      return COMMON_MISSPELLINGS[lowerWord];
    }
    if (DOUBLED_LETTER_FIXES[lowerWord]) {
      return [DOUBLED_LETTER_FIXES[lowerWord]];
    }
    // Use fuzzy matching for unknown words
    const allCorrectWords = [
      ...Object.values(COMMON_MISSPELLINGS).flat(),
      ...Object.values(DOUBLED_LETTER_FIXES),
      ...Array.from(VALID_WORDS),
    ];
    return findSimilarWords(word, allCorrectWords);
  }, []);

  const fixWord = useCallback((text: string, oldWord: string, newWord: string): string => {
    const regex = new RegExp(`\\b${oldWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, "gi");
    return text.replace(regex, (match) => {
      if (match[0] === match[0].toUpperCase()) {
        return newWord.charAt(0).toUpperCase() + newWord.slice(1);
      }
      return newWord;
    });
  }, []);

  const fixAllWords = useCallback((text: string, fixes: Array<{ oldWord: string; newWord: string }>): string => {
    let result = text;
    for (const fix of fixes) {
      result = fixWord(result, fix.oldWord, fix.newWord);
    }
    return result;
  }, [fixWord]);

  const autoFix = useCallback((text: string): AutoFixResult => {
    return autoFixAll(text);
  }, []);

  return {
    checkText,
    ignoreWord,
    getSuggestions,
    fixWord,
    fixAllWords,
    autoFix,
    ignoredWords,
  };
}

export default SpellChecker;
