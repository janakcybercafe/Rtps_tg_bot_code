export interface RtpsService {
  id: string;
  code: string;
  name: string;
  hindiName: string;
  category: string;
  buttonLabel: string;
  keywords: string[];
  documentsRequired: string[];
  verificationsRequired: string[];
  timelineDays: string;
  issuingAuthority: string;
  govtFee: string;
  portalName: string;
  importantNotes: string[];
}

export interface RtpsCategory {
  id: string;
  label: string;
  shortTitle: string;
  description: string;
}

export const INITIAL_CATEGORIES: RtpsCategory[] = [
  {
    id: 'general_cert',
    label: '📜 General Certificates',
    shortTitle: 'General Certificates',
    description: 'Caste, Residential (Domicile), Income, OBC/EBC NCL, EWS & Character Certificates'
  },
  {
    id: 'revenue_land',
    label: '🌾 Revenue & Land (Bhumi)',
    shortTitle: 'Revenue & Land',
    description: 'LPC (Land Possession), Dakhil-Kharij (Mutation) & Parimarjan Plus'
  },
  {
    id: 'ration_food',
    label: '🪪 Ration & Food Supply',
    shortTitle: 'Ration & Food Supply',
    description: 'New Ration Card (Form Ka), Member Addition/Deletion (Form Kha)'
  },
  {
    id: 'social_pension',
    label: '👵 Social Welfare & Pension',
    shortTitle: 'Social Welfare & Pension',
    description: 'Vridhjan Pension, Widow Pension & Disability Social Security Schemes'
  },
  {
    id: 'birth_municipal',
    label: '🏥 Birth, Death & Panchayat',
    shortTitle: 'Birth, Death & Panchayat',
    description: 'Birth Registration, Death Certificate & Marriage Registration'
  }
];

export const INITIAL_SERVICES: RtpsService[] = [
  {
    id: 'caste_certificate',
    code: 'RTPS-GAD-01',
    name: 'Caste Certificate',
    hindiName: 'जाति प्रमाण पत्र',
    category: 'general_cert',
    buttonLabel: '📜 Caste Certificate',
    keywords: [
      'cast certificate',
      'caste certificate',
      'cast',
      'caste',
      'jati',
      'jaati',
      'jati praman patra',
      'sc st certificate',
      'bc ebc caste'
    ],
    documentsRequired: [
      'Applicant Aadhaar Card (आवेदक का आधार कार्ड)',
      'Self-Declaration Affidavit / स्व-घोषणा पत्र (Form-XI signed by applicant)',
      'Father / Ancestor Land Record (खतियान / जमीन की रसीद) showing caste, OR Father/Blood Relative Caste Certificate',
      'Voter ID / Ration Card / Electricity Bill for address proof',
      'Passport-size photograph (active live photo or clean scan)',
      'For Married Women: Father-side proof (Маyka Khatiyan/Father Caste Certificate) + Marriage proof if husband name is included'
    ],
    verificationsRequired: [
      'Step 1 — OTP / Aadhaar Demographic Verification during online submission on ServicePlus',
      'Step 2 — Halka Karamchari (हल्का कर्मचारी) field/record verification of Khatiyan & lineage',
      'Step 3 — Circle Inspector (CI) / Revenue Officer (RO / अंचल अधिकारी) digital signature approval',
      'Step 4 — If applying for SDO / DM level counter-signature: RO-issued Caste Certificate is mandatory first'
    ],
    timelineDays: '10 Working Days (Normal) / Tatkal: 2–3 Working Days',
    issuingAuthority: 'Revenue Officer (RO) / Circle Officer (CO) -> SDO -> DM',
    govtFee: '₹0 (Free on ServicePlus Portal)',
    portalName: 'serviceonline.bihar.gov.in (RTPS ServicePlus)',
    importantNotes: [
      'Always enter Father and Mother names exactly as per Matriculation/Aadhaar records.',
      'Caste of a married woman is determined solely by her biological father (पिता के पक्ष से), not husband.'
    ]
  },
  {
    id: 'residential_certificate',
    code: 'RTPS-GAD-02',
    name: 'Residential / Domicile Certificate',
    hindiName: 'निवास / आवासीय प्रमाण पत्र',
    category: 'general_cert',
    buttonLabel: '🏠 Residential Certificate',
    keywords: [
      'residential certificate',
      'residence certificate',
      'domicile certificate',
      'niwas',
      'nivas',
      'awasiya',
      'aawasiya',
      'niwas praman patra',
      'domicile'
    ],
    documentsRequired: [
      'Applicant Aadhaar Card (आधार कार्ड)',
      'Signed Self-Declaration Form (स्व-घोषणा पत्र)',
      'Voter ID Card / Ration Card / Driving License / Electricity Bill / Land Tax Receipt',
      'Passport-size photograph of applicant (scanned under 100 KB)'
    ],
    verificationsRequired: [
      'Step 1 — Online portal submission & SMS reference number generation',
      'Step 2 — Halka Karamchari verification of permanent residence in the Ward / Panchayat',
      'Step 3 — Revenue Officer (RO) digital approval and QR-coded certificate issuance'
    ],
    timelineDays: '10 Working Days',
    issuingAuthority: 'Revenue Officer (RO) / Circle Officer (CO)',
    govtFee: '₹0 (Free on Official RTPS Portal)',
    portalName: 'serviceonline.bihar.gov.in',
    importantNotes: [
      'Residential certificate has permanent validity unless address changes, though some recruitment boards ask for one issued within 1 year.'
    ]
  },
  {
    id: 'income_certificate',
    code: 'RTPS-GAD-03',
    name: 'Income Certificate',
    hindiName: 'आय प्रमाण पत्र',
    category: 'general_cert',
    buttonLabel: '💰 Income Certificate',
    keywords: [
      'income certificate',
      'income',
      'aay',
      'aay praman patra',
      'salary certificate',
      'family income'
    ],
    documentsRequired: [
      'Applicant Aadhaar Card (आधार कार्ड)',
      'Self-Declaration Form (स्व-घोषणा पत्र) stating farming, business, and other annual income',
      'Recent Land Revenue Receipt (लगान रसीद) if agricultural income is mentioned',
      'Salary Slip / Form-16 / ITR (if parents or applicant are in government/private salaried job)',
      'Passport-size photograph of the applicant'
    ],
    verificationsRequired: [
      'Step 1 — Halka Karamchari assessment of family annual income (Agriculture + Business + Salary)',
      'Step 2 — Verification that stated annual income matches BPL/scholarship/NCL threshold',
      'Step 3 — Revenue Officer (RO) digital signature approval'
    ],
    timelineDays: '10 Working Days',
    issuingAuthority: 'Revenue Officer (RO) / Circle Officer (CO)',
    govtFee: '₹0 (Free on Official RTPS Portal)',
    portalName: 'serviceonline.bihar.gov.in',
    importantNotes: [
      'Income Certificate is valid for 1 year from the date of issue.',
      'For scholarship or OBC NCL, always apply for Income Certificate before applying for NCL.'
    ]
  },
  {
    id: 'obc_ncl_certificate',
    code: 'RTPS-GAD-04',
    name: 'OBC / EBC Non-Creamy Layer (NCL) Certificate',
    hindiName: 'ओबीसी / ईबीसी नॉन-क्रीमी लेयर प्रमाण पत्र',
    category: 'general_cert',
    buttonLabel: '📑 OBC / EBC NCL Certificate',
    keywords: [
      'obc certificate',
      'ncl certificate',
      'obc ncl',
      'non creamy layer',
      'ebc certificate',
      'bc ebc ncl',
      'central obc',
      'bihar ncl'
    ],
    documentsRequired: [
      'Valid Caste Certificate (जाति प्रमाण पत्र)',
      'Valid Residential Certificate (निवास प्रमाण पत्र)',
      'Valid Income Certificate (आय प्रमाण पत्र — issued within last 1 year)',
      'Form-XI / Oath Form (शपथ पत्र - आवेदक द्वारा हस्ताक्षरित)',
      'Applicant Aadhaar Card & Passport Photo',
      'Khatiyan / Land Receipt if existing Caste Certificate is not available on portal'
    ],
    verificationsRequired: [
      'Step 1 — Auto-fetch or attachment verification of existing Caste, Residence & Income certificate numbers',
      'Step 2 — Verification that annual parental income (excluding agricultural & non-class-I/II salary rules) is below ₹8 Lakh',
      'Step 3 — Halka Karamchari & Revenue Officer (RO) verification and digital signature'
    ],
    timelineDays: '10–21 Working Days',
    issuingAuthority: 'Revenue Officer (RO) -> SDO -> DM',
    govtFee: '₹0 (Free on Official RTPS Portal)',
    portalName: 'serviceonline.bihar.gov.in',
    importantNotes: [
      'Ensure clearly whether the applicant needs State Government (BC/EBC Bihar) or Central Government (OBC Central) format.'
    ]
  },
  {
    id: 'ews_certificate',
    code: 'RTPS-GAD-05',
    name: 'EWS Certificate (Economically Weaker Section)',
    hindiName: 'ईडब्ल्यूएस प्रमाण पत्र (आर्थिक रूप से कमजोर वर्ग)',
    category: 'general_cert',
    buttonLabel: '📋 EWS Certificate',
    keywords: [
      'ews certificate',
      'ews',
      'economically weaker section',
      '10 percent reservation',
      'general ews'
    ],
    documentsRequired: [
      'Applicant Aadhaar Card & Passport Photo',
      'Valid Income Certificate (Annual family income strictly below ₹8 Lakh)',
      'Residential Certificate (निवास प्रमाण पत्र)',
      'Self-Declaration / Affidavit (परिशिष्ट-I) confirming land/flat limits (<5 acres agri land, <1000 sq ft flat)',
      'Caste proof (General category Khatiyan / document)'
    ],
    verificationsRequired: [
      'Step 1 — Halka Karamchari verification of total family land holdings and residential property limits',
      'Step 2 — Verification of gross annual family income (< ₹8,00,000 for preceding financial year)',
      'Step 3 — Circle Officer (CO) / Revenue Officer (RO) digital approval'
    ],
    timelineDays: '10–14 Working Days',
    issuingAuthority: 'Circle Officer (CO) / Revenue Officer (RO)',
    govtFee: '₹0 (Free on Official RTPS Portal)',
    portalName: 'serviceonline.bihar.gov.in',
    importantNotes: [
      'Valid for the current financial year (April 1 to March 31).'
    ]
  },
  {
    id: 'character_certificate',
    code: 'RTPS-HOME-01',
    name: 'Character Certificate (Police Verification)',
    hindiName: 'आचरण / चरित्र प्रमाण पत्र',
    category: 'general_cert',
    buttonLabel: '🛡️ Character Certificate',
    keywords: [
      'character certificate',
      'aacharan',
      'acharan',
      'charitra praman patra',
      'police verification',
      'pcc',
      'sp office character'
    ],
    documentsRequired: [
      'Applicant Aadhaar Card / Voter ID / PAN Card',
      'Residential Certificate or Address Proof (Last 2+ years stay details)',
      'Passport-size Photograph & Scanned Signature',
      'Active Mobile Number linked for SMS updates'
    ],
    verificationsRequired: [
      'Step 1 — Online submission routed to District Superintendent of Police (SP) Office',
      'Step 2 — Physical / Telephonic Police Station (थाना) verification — applicant must visit local Thana with original Aadhaar & Residential proof when called by Investigating Officer',
      'Step 3 — Thana SHO report uploaded back to District SP RTPS cell for final digital signature'
    ],
    timelineDays: '14 Working Days',
    issuingAuthority: 'Superintendent of Police (SP) Office',
    govtFee: '₹0 (Free on Official RTPS Portal)',
    portalName: 'serviceonline.bihar.gov.in',
    importantNotes: [
      'Keep your phone reachable; the local Police Station (Thana) Munshi/IO calls the applicant for physical document verification.'
    ]
  },
  {
    id: 'lpc_certificate',
    code: 'RTPS-REV-01',
    name: 'Land Possession Certificate (LPC)',
    hindiName: 'भूमि स्वामित्व प्रमाण पत्र (LPC)',
    category: 'revenue_land',
    buttonLabel: '🌾 LPC (Land Possession)',
    keywords: [
      'lpc',
      'land possession certificate',
      'bhumi swamitva',
      'kcc lpc',
      'land certificate'
    ],
    documentsRequired: [
      'Latest Online Land Tax Receipt (अद्यतन ऑनलाइन लगान रसीद / मालगुजारी रसीद)',
      'Jamabandi Register-II Copy (जमाबंदी पंजी प्रति)',
      'Self-Declaration Affidavit (स्व-घोषणा पत्र - Signed PDF)',
      'Applicant Aadhaar Card & Mobile Number'
    ],
    verificationsRequired: [
      'Step 1 — Jamabandi lookup on Bihar Bhumi portal (must be digitized in Register-II)',
      'Step 2 — Halka Karamchari verification of actual physical possession and tax clearance',
      'Step 3 — Circle Officer (CO / अंचल अधिकारी) digital signature approval'
    ],
    timelineDays: '10 Working Days',
    issuingAuthority: 'Circle Officer (CO)',
    govtFee: '₹0 (Free on Bihar Bhumi Portal)',
    portalName: 'biharbhumi.bihar.gov.in',
    importantNotes: [
      'Current year Lagaan Receipt (रसीद) must be paid online before applying for LPC.'
    ]
  },
  {
    id: 'land_mutation',
    code: 'RTPS-REV-02',
    name: 'Land Mutation (Dakhil-Kharij)',
    hindiName: 'दाखिल-खारिज (Mutation)',
    category: 'revenue_land',
    buttonLabel: '📐 Land Mutation (दाखिल-खारिज)',
    keywords: [
      'mutation',
      'dakhil kharij',
      'dakhil-kharij',
      'land transfer',
      'jamabandi transfer',
      'kevala mutation'
    ],
    documentsRequired: [
      'Complete Registered Sale Deed / Kevala (संपूर्ण रजिस्ट्री केवाला PDF in single file)',
      'Seller Previous Lagaan Receipt (विक्रेता की पुरानी लगान रसीद)',
      'Buyer & Seller Aadhaar Cards, Mobile Numbers & Email IDs',
      'Vanshavali (वंशावली) if applying on the basis of inheritance / partition'
    ],
    verificationsRequired: [
      'Step 1 — FIFO automated numbering & 14-day public objection notice generation',
      'Step 2 — Halka Karamchari & Circle Inspector (CI) verification of Plot, Khata, Khesra & boundary',
      'Step 3 — Circle Officer (CO) hearing/order and generation of Correction Slip (शुद्धि पत्र)'
    ],
    timelineDays: '35 Working Days (Uncontested) / 75 Working Days (Contested)',
    issuingAuthority: 'Circle Officer (CO)',
    govtFee: '₹0 (Portal Application Free)',
    portalName: 'biharbhumi.bihar.gov.in',
    importantNotes: [
      'All pages of the Sale Deed (Kevala) from first to last page must be scanned cleanly into a single PDF under 2 MB.'
    ]
  },
  {
    id: 'parimarjan_plus',
    code: 'RTPS-REV-03',
    name: 'Parimarjan Plus (Jamabandi Correction)',
    hindiName: 'परिमार्जन प्लस (जमाबंदी सुधार)',
    category: 'revenue_land',
    buttonLabel: '🛠️ Parimarjan Plus',
    keywords: [
      'parimarjan',
      'parimarjan plus',
      'jamabandi correction',
      'rasid sudhar',
      'khata khesra correction'
    ],
    documentsRequired: [
      'Last Offline/Online Lagaan Receipt (अंतिम लगान रसीद)',
      'Registered Deed (केवाला) or Khatiyan copy proving correct Khata, Khesra & Rakba',
      'Correction Slip (शुद्धि पत्र) if previously mutated',
      'Self-attested Application & Affidavit with Aadhaar Card'
    ],
    verificationsRequired: [
      'Step 1 — Halka Karamchari matches physical Register-II (हस्तलिखित पंजी-2) with online digitized record',
      'Step 2 — Circle Inspector & Circle Officer approval for missing Khata/Khesra/Lagaan update'
    ],
    timelineDays: '15–30 Working Days',
    issuingAuthority: 'Circle Officer (CO)',
    govtFee: '₹0',
    portalName: 'biharbhumi.bihar.gov.in',
    importantNotes: [
      'Attach clear scans of both the old offline receipt and original deed so the Karamchari can verify Rakba (Area).'
    ]
  },
  {
    id: 'new_ration_card',
    code: 'RTPS-FOOD-01',
    name: 'New Ration Card (Form Ka)',
    hindiName: 'नया राशन कार्ड (प्रपत्र-क)',
    category: 'ration_food',
    buttonLabel: '🪪 New Ration Card',
    keywords: [
      'ration card',
      'new ration card',
      'rashan card',
      'rashion card',
      'epds',
      'prapatra ka',
      'bpl card'
    ],
    documentsRequired: [
      'Aadhaar Cards of ALL family members (सभी सदस्यों का आधार कार्ड - self-attested in one PDF)',
      'Residential Certificate of the Female Head of Family (महिला मुखिया का निवास प्रमाण पत्र)',
      'Income Certificate of Head of Family (आय प्रमाण पत्र)',
      'Caste Certificate (जाति प्रमाण पत्र - for SC/ST/OBC categories)',
      'Bank Passbook front page of Female Head showing IFSC & Account Number',
      'Family Group Photograph (पूरे परिवार का एक साथ पासपोर्ट साइज फोटो)',
      'Signed Self-Declaration Form (स्व-घोषणा पत्र - Signed by Applicant)',
      'Disability Certificate (दिव्यांग प्रमाण पत्र - if applicable)'
    ],
    verificationsRequired: [
      'Step 1 — e-KYC / Aadhaar seeding check (none of the members should already exist in another active Ration Card)',
      'Step 2 — Block Supply Officer (BSO / प्रखंड आपूर्ति पदाधिकारी) & Panchayat Secretary physical/eligibility check',
      'Step 3 — Sub-Divisional Officer (SDO / अनुमंडल पदाधिकारी) final approval and Ration Card number generation'
    ],
    timelineDays: '30 Working Days',
    issuingAuthority: 'Sub-Divisional Officer (SDO)',
    govtFee: '₹0 (Free on Jan Parichay / ePDS Portal)',
    portalName: 'epds.bihar.gov.in / rconline.bihar.gov.in',
    importantNotes: [
      'The eldest woman of the household (above 18 years) must be made the Head of Family (मुखिया).',
      'If a newly married woman is being added, her name must first be deleted (Surrender Certificate) from her parents ration card.'
    ]
  },
  {
    id: 'ration_card_modification',
    code: 'RTPS-FOOD-02',
    name: 'Ration Card Member Addition / Correction (Form Kha)',
    hindiName: 'राशन कार्ड में नाम जोड़ना / सुधार (प्रपत्र-ख)',
    category: 'ration_food',
    buttonLabel: '➕ Ration Card Member Add',
    keywords: [
      'ration card add member',
      'ration card correction',
      'prapatra kha',
      'naam jodna',
      'ration card name add',
      'delete member ration'
    ],
    documentsRequired: [
      'Existing Ration Card Copy / Ration Card Number',
      'Aadhaar Card of new member(s) being added + Birth Certificate (for children)',
      'Bank Passbook & Residential Certificate of Head of Family',
      'Signed Self-Declaration Form for Form-Kha (प्रपत्र-ख घोषणा पत्र)',
      'Name Deletion Certificate (नाम विलोपन प्रमाण पत्र) if adding a newly married bride from another card'
    ],
    verificationsRequired: [
      'Step 1 — Duplicate Aadhaar de-duplication check on National Portability (ONORC) database',
      'Step 2 — Block Supply Officer (BSO) verification',
      'Step 3 — SDO digital approval and updated member list reflection on ePDS'
    ],
    timelineDays: '30 Working Days',
    issuingAuthority: 'Sub-Divisional Officer (SDO)',
    govtFee: '₹0',
    portalName: 'rconline.bihar.gov.in',
    importantNotes: [
      'After member addition is approved, the new member must complete thumb e-KYC at any nearest PDS dealer shop.'
    ]
  },
  {
    id: 'vridhjan_pension',
    code: 'RTPS-SSPMIS-01',
    name: 'Mukhyamantri Vridhjan Pension Yojana (Old Age Pension)',
    hindiName: 'मुख्यमंत्री वृद्धजन पेंशन योजना',
    category: 'social_pension',
    buttonLabel: '👵 Vridhjan Pension (60+)',
    keywords: [
      'vridhjan pension',
      'old age pension',
      'pension',
      'vridha pension',
      'sspmis',
      'budhapa pension',
      '60 years pension'
    ],
    documentsRequired: [
      'Applicant Aadhaar Card (Age must be 60 years or above)',
      'Voter ID Card (मतदाता पहचान पत्र - mandatory for SSPMIS verification)',
      'Bank Passbook (Account must be Aadhaar-seeded / NPCI DBT linked)',
      'Aadhaar Consent Form signed/thumb-imprinted by Applicant and identified by Ward Member / Mukhiya',
      'Passport-size Photographs (2 copies)'
    ],
    verificationsRequired: [
      'Step 1 — Real-time Aadhaar demographic authentication on SSPMIS portal',
      'Step 2 — Panchayat Secretary / Block Social Security Cell verification that applicant is not a retired government pensioner',
      'Step 3 — BDO (प्रखंड विकास पदाधिकारी) approval and Direct Benefit Transfer (DBT) activation'
    ],
    timelineDays: '21 Working Days',
    issuingAuthority: 'Block Development Officer (BDO) / Assistant Director Social Security',
    govtFee: '₹0',
    portalName: 'sspmis.bihar.gov.in',
    importantNotes: [
      'Annual Jeevan Pramaan (Elabharthi biometric life certificate) is mandatory every year to keep pension running.'
    ]
  },
  {
    id: 'widow_disability_pension',
    code: 'RTPS-SSPMIS-02',
    name: 'Widow & Disability Social Security Pension',
    hindiName: 'विधवा एवं दिव्यांग सामाजिक सुरक्षा पेंशन',
    category: 'social_pension',
    buttonLabel: '🤝 Widow / Disability Pension',
    keywords: [
      'widow pension',
      'vidhwa pension',
      'disability pension',
      'viklang pension',
      'divyang pension',
      'lakshmibai pension'
    ],
    documentsRequired: [
      'Applicant Aadhaar Card & Voter ID Card',
      'For Widow Pension: Husband Death Certificate (पति का मृत्यु प्रमाण पत्र) + Income Certificate (< ₹60,000/yr for Lakshmibai Pension)',
      'For Disability Pension: UDID Card / Civil Surgeon Disability Certificate (minimum 40% disability)',
      'Residential Certificate & Bank Passbook (NPCI DBT seeded)',
      'Passport-size Photograph & Signed Consent Form'
    ],
    verificationsRequired: [
      'Step 1 — Online SSPMIS / RTPS registration with Aadhaar authentication',
      'Step 2 — Verification of Death Certificate or UDID Disability Certificate at Block level',
      'Step 3 — BDO / District Social Security Cell sanction order'
    ],
    timelineDays: '21 Working Days',
    issuingAuthority: 'Block Development Officer (BDO)',
    govtFee: '₹0',
    portalName: 'sspmis.bihar.gov.in',
    importantNotes: [
      'Ensure the bank account has active NPCI/Aadhaar seeding at the bank branch, as payments are strictly Aadhaar-based.'
    ]
  },
  {
    id: 'birth_certificate',
    code: 'RTPS-CRS-01',
    name: 'Birth Certificate Registration',
    hindiName: 'जन्म प्रमाण पत्र',
    category: 'birth_municipal',
    buttonLabel: '👶 Birth Certificate',
    keywords: [
      'birth certificate',
      'janam praman patra',
      'janm praman patra',
      'baby birth certificate',
      'delayed birth registration',
      'crs birth'
    ],
    documentsRequired: [
      'Hospital Discharge Slip / Vaccination Card (अस्पताल डिस्चार्ज स्लिप या टीकाकरण कार्ड)',
      'Parents Aadhaar Cards (माता और पिता दोनों का आधार कार्ड)',
      'Self-Declaration / Anganwadi Sevika or Ward Member verification report',
      'For Delayed Registration (> 1 Year after birth): Notarized / Executive Magistrate First-Class Affidavit (शपथ पत्र) + School Bonafide / Panji Check Report'
    ],
    verificationsRequired: [
      'Step 1 — Within 21 Days: Direct registration by Hospital / Panchayat Secretary / Municipal Registrar',
      'Step 2 — 21 Days to 1 Year: Block Statistical Officer (BSO) / Medical Officer permission',
      'Step 3 — Above 1 Year (Delayed): Non-Availability Certificate (NAC) -> BDO / SDO Magistrate Order -> Registrar issuance'
    ],
    timelineDays: '7–15 Working Days (Normal) / 21–30 Days (Delayed >1 Year)',
    issuingAuthority: 'Registrar (Birth & Death) / Panchayat Secretary / BSO / Municipal Corporation',
    govtFee: '₹0 (within 21 days) / Nominal late fee ₹2–₹10 + Affidavit cost if delayed',
    portalName: 'dc.crsorgi.gov.in / serviceonline.bihar.gov.in',
    importantNotes: [
      'Always verify child and parents spelling carefully before final submission on CRS portal.'
    ]
  },
  {
    id: 'death_certificate',
    code: 'RTPS-CRS-02',
    name: 'Death Certificate Registration',
    hindiName: 'मृत्यु प्रमाण पत्र',
    category: 'birth_municipal',
    buttonLabel: '🕊️ Death Certificate',
    keywords: [
      'death certificate',
      'mrityu praman patra',
      'maran praman patra',
      'deceased certificate',
      'crs death'
    ],
    documentsRequired: [
      'Deceased Person Aadhaar Card & Voter ID (मृतक का आधार एवं वोटर कार्ड)',
      'Applicant (Spouse/Son/Daughter) Aadhaar Card',
      'Hospital Death Summary OR Cremation / Muktidham Slip OR Ward Parshad / Mukhiya / Panchayat Secretary Panchnama verification',
      'For Delayed Registration (> 1 Year): Executive Magistrate / Notary Affidavit + Non-Availability Certificate'
    ],
    verificationsRequired: [
      'Step 1 — Local Ward Member / Mukhiya / Hospital verification of date and place of death',
      'Step 2 — Panchayat Secretary / Block Statistical Officer (BSO) record check',
      'Step 3 — Digital CRS Death Certificate generation with QR verification code'
    ],
    timelineDays: '7–15 Working Days',
    issuingAuthority: 'Registrar (Birth & Death) / Panchayat Secretary / Municipal Corporation',
    govtFee: '₹0 (within 21 days)',
    portalName: 'dc.crsorgi.gov.in / serviceonline.bihar.gov.in',
    importantNotes: [
      'Required for Mutation (Vanshavali), Widow Pension, LIC Claim, and Bank Nominee settlement.'
    ]
  }
];
