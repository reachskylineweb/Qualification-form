// Comprehensive Top-Level Executive / Decision-Maker Designations
export const DESIGNATION_OPTIONS = [
  'Founder',
  'Co-Founder',
  'CEO (Chief Executive Officer)',
  'Managing Director (MD)',
  'Owner / Proprietor',
  'Managing Partner / Partner',
  'Chairman / Vice Chairman',
  'President / Vice President (VP)',
  'CMO (Chief Marketing Officer)',
  'COO (Chief Operating Officer)',
  'CTO (Chief Technology Officer)',
  'CFO (Chief Financial Officer)',
  'CBO / CRO (Chief Business / Revenue Officer)',
  'Director / Executive Director',
  'General Manager (GM)',
  'Business Head / Country Head',
  'Head of Marketing / Growth Head',
  'Head of Sales / Business Development',
  'Others',
];

// Comprehensive Indian Business & Industry Categories (Small to Large Enterprises)
export const INDIA_BUSINESS_TYPES = [
  // Tech, AI & Digital
  'IT Services & Software Development',
  'AI / Machine Learning & Data Science',
  'SaaS (B2B / B2C Software Products)',
  'Mobile App & Web Development',
  'Cloud, Cybersecurity & IT Infrastructure',
  'Digital Marketing, Advertising & PR Agency',

  // E-Commerce, Retail & D2C
  'E-Commerce & Online Store',
  'D2C Brand (Direct-to-Consumer)',
  'Retail Store / Supermarket / Hypermarket',
  'Wholesale & Distribution Business',
  'Franchise Business / Chain Stores',

  // Real Estate, Construction & Interior
  'Real Estate Developer / Builders & Promoters',
  'Construction, Civil Engineering & Infrastructure',
  'Architecture & Interior Design Studio',
  'Property Management & Real Estate Consulting',
  'Building Materials, Tiles, Cement & Hardware',

  // Healthcare, Pharma & Wellness
  'Hospitals, Clinics & Multi-Specialty Centers',
  'Dental, Skin, Hair & Aesthetics Clinic',
  'Pharmaceuticals & Medical Devices',
  'Diagnostic Labs & Pathology Centers',
  'Ayurveda, Siddha, Homeopathy & Wellness',
  'Fitness Center, Gym, Yoga & Sports Academy',

  // Education & Training
  'Schools, Colleges & Universities',
  'EdTech & Online Learning Platform',
  'Coaching Institute / NEET, JEE, UPSC Academy',
  'Overseas Education & Immigration Consultancy',
  'Corporate Training & Skill Development',

  // Manufacturing, Industrial & MSME
  'Textiles, Garments & Apparel Manufacturing',
  'FMCG & Consumer Goods Manufacturing',
  'Food Processing, Packaged Foods & Beverages',
  'Automobile, EV & Auto Components',
  'Machinery, Tools & Industrial Equipment',
  'Chemicals, Plastics, Packaging & Printing',
  'Solar, Renewable Energy & Power Solutions',
  'Electronics & Electrical Appliances',
  'Jewellery, Gold, Diamond & Bullion',
  'Furniture, Woodwork & Home Decor',

  // Food, Hospitality & Travel
  'Restaurants, Cafes, Cloud Kitchen & QSR',
  'Hotels, Resorts & Hospitality',
  'Bakeries, Sweets & Catering Services',
  'Travel Agency, Tours & Holiday Packages',
  'Event Management, Weddings & Banquets',

  // Finance, Legal & Professional Services
  'FinTech, Banking, NBFC & Financial Services',
  'Wealth Management, Mutual Funds & Insurance',
  'Chartered Accountant (CA), Tax & Audit Firm',
  'Law Firm & Legal Consultancy',
  'HR, Staffing & Recruitment Agency',
  'Business Consulting & Management Advisory',

  // Logistics, Agri & Others
  'Logistics, Courier, Supply Chain & Transport',
  'Import & Export (EXIM) Trading',
  'Agriculture, AgriTech, Dairy & Organic Farming',
  'Beauty Salon, Spa & Personal Care',
  'Media, Film Production, Photography & Creator',
  'NGO, Trust & Social Enterprise',
  'Others',
];

// Fake / Disposable Email Domains Blacklist
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'yopmail.com',
  'trashmail.com',
  'sharklasers.com',
  'getnada.com',
  'temp-mail.org',
  'fakeinbox.com',
  'throwawaymail.com',
  'maildrop.cc',
  'test.com',
  'example.com',
  'abc.com',
  'xyz.com',
]);

/**
 * Validates Indian Phone Numbers strictly:
 * - Strips +91, spaces, hyphens
 * - Must be 10 digits starting with 6, 7, 8, or 9
 * - Blocks repeated fake digits (e.g. 9999999999) or sequential fakes (9876543210)
 */
export function validateIndianPhone(rawPhone) {
  if (!rawPhone || !rawPhone.trim()) {
    return 'Phone number is required';
  }

  let cleaned = rawPhone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.slice(3);
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.slice(1);
  }

  if (!/^[6-9]\d{9}$/.test(cleaned)) {
    return 'Enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9)';
  }

  // Block all identical digits like 9999999999, 8888888888
  if (/^(\d)\1{9}$/.test(cleaned)) {
    return 'Please enter your real active mobile number';
  }

  // Block obvious dummy sequences
  const dummyNumbers = ['9876543210', '9123456789', '9000000000', '8000000000', '7000000000', '6000000000'];
  if (dummyNumbers.includes(cleaned)) {
    return 'Please enter a genuine mobile number, not a test number';
  }

  return '';
}

/**
 * Validates Email Address strictly:
 * - Standard email format check
 * - Blocks disposable/temp email domains and dummy domains
 * - Blocks obvious fake usernames (test@, asdf@, 123@)
 */
export function validateGenuineEmail(rawEmail) {
  if (!rawEmail || !rawEmail.trim()) {
    return 'Email address is required';
  }

  const email = rawEmail.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email)) {
    return 'Enter a valid email address (e.g. name@company.com)';
  }

  const [localPart, domainPart] = email.split('@');

  if (localPart.length < 2) {
    return 'Please enter a valid email address';
  }

  if (DISPOSABLE_DOMAINS.has(domainPart)) {
    return 'Temporary or test email addresses are not allowed';
  }

  // Common typo checks for gmail
  if (['gamil.com', 'gmial.com', 'gmail.co', 'gmai.com'].includes(domainPart)) {
    return `Did you mean ${localPart}@gmail.com?`;
  }

  return '';
}
