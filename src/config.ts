// Central place for business details, pricing and booking availability.
// Edit this file to change what the website shows.

export const site = {
  name: 'KodeStudio',
  tagline: 'Workflow automation for Malaysian SMEs',
  phoneDisplay: '017-626 2550',
  whatsapp: '60176262550', // international format, no "+" or spaces
  email: 'kodestudio7@protonmail.com',
  location: 'Malaysia',
  url: 'https://kodestudio.klyihao.com',
};

export const whatsappLink = (text = "Hi KodeStudio, I'd like to know more about automating my business.") =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;

export const pricing = {
  plans: [
    {
      name: 'Starter',
      price: 'RM1,500',
      prefix: 'from',
      suffix: 'one-time setup',
      description: 'Automate one painful process end-to-end.',
      features: [
        '1–2 automated workflows',
        'Built on tools you already use',
        'Staff walkthrough & simple guide',
        '14 days of post-launch fixes',
        'Delivered in about 1–2 weeks',
      ],
      cta: 'Start with Starter',
      featured: false,
    },
    {
      name: 'Growth',
      price: 'RM4,000',
      prefix: 'from',
      suffix: 'one-time setup',
      description: 'Connect several teams and see everything in one place.',
      features: [
        '3–5 connected workflows',
        'Management dashboard & scheduled reports',
        'Approval flows across departments',
        'Team training session',
        '30 days of post-launch fixes',
      ],
      cta: 'Choose Growth',
      featured: true,
    },
    {
      name: 'Custom',
      price: 'Quote',
      prefix: '',
      suffix: 'scoped to your business',
      description: 'Internal portals, system integrations and bigger builds.',
      features: [
        'Custom internal web portal',
        'Integrations with your existing systems',
        'AI document & data extraction',
        'Phased delivery with milestones',
        'Priority support options',
      ],
      cta: 'Talk to us',
      featured: false,
    },
  ],
  care: {
    name: 'Care Plan',
    price: 'RM300',
    suffix: '/month',
    description:
      'Monitoring, fixes when something changes, small tweaks and one minor new automation each month. Optional, cancel anytime.',
  },
};

// Booking availability. All times are Malaysia time (UTC+8).
export const booking = {
  durationMinutes: 30,
  weekdays: [1, 2, 3, 4, 5], // 0 = Sunday … 6 = Saturday
  dayStart: '10:00',
  dayEnd: '18:00',
  daysAhead: 21,
  minNoticeHours: 12,
  utcOffset: '+08:00',
};

export const industries = [
  {
    id: 'accounting',
    name: 'Accounting firms',
    icon: 'calculator',
    flow: ['Invoice received', 'Approval', 'Notification', 'Filing'],
    example:
      'Client invoices land in a shared inbox. The workflow logs each one to a register, routes it to the right partner for approval on WhatsApp, notifies the client once approved and files the PDF into the correct client folder.',
  },
  {
    id: 'property',
    name: 'Property agencies',
    icon: 'home',
    flow: ['New lead', 'Follow-up', 'Appointment', 'CRM'],
    example:
      'Leads from portals, Facebook and WhatsApp are captured into one list, assigned to an agent, followed up automatically if untouched for 24 hours, and viewing appointments are confirmed with reminders to both sides.',
  },
  {
    id: 'tuition',
    name: 'Tuition centres',
    icon: 'book',
    flow: ['Registration', 'Payment', 'Attendance', 'Parent update'],
    example:
      'Parents register through a simple form, receive the fee schedule and payment reminders, teachers mark attendance on their phone and parents get an automatic message when a student is absent.',
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    icon: 'factory',
    flow: ['Sales order', 'Production status', 'Inventory alert'],
    example:
      'Each confirmed order creates a production job. Supervisors update status from the floor, sales sees progress without calling, and purchasing is alerted when raw materials drop below reorder level.',
  },
  {
    id: 'construction',
    name: 'Construction',
    icon: 'hardhat',
    flow: ['Site report', 'Approval', 'Document generation'],
    example:
      'Site supervisors submit daily reports with photos from their phone. Project managers approve in one tap, and progress reports or variation documents are generated automatically in your template.',
  },
  {
    id: 'hr',
    name: 'HR & recruitment',
    icon: 'users',
    flow: ['Applicant', 'Interview', 'Assessment', 'Onboarding'],
    example:
      'Applications are collected and screened into a pipeline, interviews are scheduled with reminders, assessment scores are recorded, and hired candidates receive their offer letter and onboarding checklist automatically.',
  },
  {
    id: 'corporate',
    name: 'Corporate services',
    icon: 'briefcase',
    flow: ['Incorporation', 'Document generation', 'Reminders'],
    example:
      'New company details are captured once and reused to generate resolutions, forms and letters. Annual return and filing deadlines trigger reminders to staff and clients well before they are due.',
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    icon: 'cart',
    flow: ['Order', 'Stock update', 'Customer notice', 'Fulfilment'],
    example:
      'Orders from your store and marketplaces flow into one sheet, stock is deducted across channels, customers get WhatsApp updates and the warehouse receives a daily picking list.',
  },
  {
    id: 'clinics',
    name: 'Clinics',
    icon: 'heart',
    flow: ['Appointment', 'Reminders', 'Follow-up'],
    example:
      'Patients book a slot online, receive reminders the day before to reduce no-shows, and get a follow-up message after the visit for reviews, repeat appointments or medication reminders.',
  },
  {
    id: 'restaurants',
    name: 'Restaurants',
    icon: 'utensils',
    flow: ['Reservation', 'Confirmation', 'Feedback'],
    example:
      'Reservations from WhatsApp and your website are logged in one place, guests get an instant confirmation and reminder, and a short feedback request goes out after the meal.',
  },
];

export const industryOptions = [...industries.map((i) => i.name), 'Retail', 'Logistics', 'Trading / distribution', 'Other'];
