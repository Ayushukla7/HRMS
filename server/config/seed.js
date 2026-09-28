const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Performance = require('../models/Performance');
const Notification = require('../models/Notification');

const seedData = async () => {
  const userCount = await User.countDocuments();
  if (userCount > 0) {
    console.log('Database already contains records. Skipping initial seeding.');
    return;
  }

  console.log('🌱 Seeding initial HRMS sample data...');

  // 1. Create Departments
  const departmentsData = [
    { name: 'Engineering', code: 'ENG', description: 'Software engineering, architecture, QA, and platform infrastructure', budget: 750000, location: 'Building A - Floor 3' },
    { name: 'Human Resources', code: 'HR', description: 'People operations, talent acquisition, culture, and benefits', budget: 200000, location: 'Building B - Floor 1' },
    { name: 'Product & Design', code: 'PRD', description: 'Product management, UX/UI research, and creative direction', budget: 350000, location: 'Building A - Floor 2' },
    { name: 'Marketing & Growth', code: 'MKT', description: 'Brand strategy, social media, performance marketing, and PR', budget: 400000, location: 'Building B - Floor 2' },
    { name: 'Finance & Legal', code: 'FIN', description: 'Accounting, financial planning, compliance, and auditing', budget: 300000, location: 'Building B - Floor 3' },
    { name: 'Sales & Customer Success', code: 'SLS', description: 'Enterprise sales, account management, and client support', budget: 500000, location: 'Building A - Floor 1' },
  ];

  const createdDepts = await Department.insertMany(departmentsData);
  const engDept = createdDepts.find(d => d.code === 'ENG');
  const hrDept = createdDepts.find(d => d.code === 'HR');
  const prdDept = createdDepts.find(d => d.code === 'PRD');
  const mktDept = createdDepts.find(d => d.code === 'MKT');
  const finDept = createdDepts.find(d => d.code === 'FIN');

  // 2. Create Admin User
  const adminUser = await User.create({
    name: 'Eleanor Vance (HR Admin)',
    email: 'admin@hrms.com',
    password: 'admin123',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  });

  // 3. Create Sample Employees
  const employeesData = [
    {
      empCustomId: 'EMP-0001',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      email: 'sarah.jenkins@hrms.com',
      phone: '+1 (555) 234-5678',
      department: engDept._id,
      designation: 'Senior Full Stack Engineer',
      joiningDate: new Date('2022-03-15'),
      salary: 8500,
      address: { street: '742 Evergreen Terrace', city: 'San Francisco', state: 'CA', zipCode: '94107', country: 'USA' },
      profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      employmentType: 'Full-Time',
      status: 'Active',
      gender: 'Female',
      dateOfBirth: new Date('1994-06-12'),
      bankDetails: { bankName: 'Chase Bank', accountNumber: '9876543210', ifscCode: 'CHASUS33', panNumber: 'PAN987654' },
    },
    {
      empCustomId: 'EMP-0002',
      firstName: 'Alex',
      lastName: 'Rivera',
      email: 'alex.rivera@hrms.com',
      phone: '+1 (555) 345-6789',
      department: prdDept._id,
      designation: 'Lead Product Designer',
      joiningDate: new Date('2021-09-01'),
      salary: 7800,
      address: { street: '1200 Market Street', city: 'San Francisco', state: 'CA', zipCode: '94102', country: 'USA' },
      profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      employmentType: 'Full-Time',
      status: 'Active',
      gender: 'Male',
      dateOfBirth: new Date('1991-11-20'),
      bankDetails: { bankName: 'Bank of America', accountNumber: '8765432109', ifscCode: 'BOFAUS3N', panNumber: 'PAN876543' },
    },
    {
      empCustomId: 'EMP-0003',
      firstName: 'Emily',
      lastName: 'Chen',
      email: 'emily.chen@hrms.com',
      phone: '+1 (555) 456-7890',
      department: engDept._id,
      designation: 'Backend & Cloud Architect',
      joiningDate: new Date('2023-01-10'),
      salary: 9200,
      address: { street: '450 Sutter St', city: 'San Francisco', state: 'CA', zipCode: '94108', country: 'USA' },
      profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      employmentType: 'Full-Time',
      status: 'Active',
      gender: 'Female',
      dateOfBirth: new Date('1993-04-18'),
      bankDetails: { bankName: 'Wells Fargo', accountNumber: '7654321098', ifscCode: 'WFBIUS6S', panNumber: 'PAN765432' },
    },
    {
      empCustomId: 'EMP-0004',
      firstName: 'Marcus',
      lastName: 'Vance',
      email: 'marcus.vance@hrms.com',
      phone: '+1 (555) 567-8901',
      department: engDept._id,
      designation: 'DevOps & Site Reliability Engineer',
      joiningDate: new Date('2023-05-20'),
      salary: 8000,
      address: { street: '88 Colin P Kelly Jr St', city: 'San Francisco', state: 'CA', zipCode: '94107', country: 'USA' },
      profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      employmentType: 'Full-Time',
      status: 'Active',
      gender: 'Male',
      dateOfBirth: new Date('1990-08-14'),
      bankDetails: { bankName: 'Citibank', accountNumber: '6543210987', ifscCode: 'CITIUS33', panNumber: 'PAN654321' },
    },
    {
      empCustomId: 'EMP-0005',
      firstName: 'Priya',
      lastName: 'Patel',
      email: 'priya.patel@hrms.com',
      phone: '+1 (555) 678-9012',
      department: hrDept._id,
      designation: 'Senior HR Specialist',
      joiningDate: new Date('2022-11-01'),
      salary: 6500,
      address: { street: '300 Post St', city: 'San Francisco', state: 'CA', zipCode: '94108', country: 'USA' },
      profilePicture: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      employmentType: 'Full-Time',
      status: 'Active',
      gender: 'Female',
      dateOfBirth: new Date('1995-02-28'),
      bankDetails: { bankName: 'Silicon Valley Bank', accountNumber: '5432109876', ifscCode: 'SVBKUS6S', panNumber: 'PAN543210' },
    },
    {
      empCustomId: 'EMP-0006',
      firstName: 'David',
      lastName: 'Kim',
      email: 'david.kim@hrms.com',
      phone: '+1 (555) 789-0123',
      department: mktDept._id,
      designation: 'Growth Marketing Manager',
      joiningDate: new Date('2023-08-15'),
      salary: 7200,
      address: { street: '550 Howard St', city: 'San Francisco', state: 'CA', zipCode: '94105', country: 'USA' },
      profilePicture: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      employmentType: 'Full-Time',
      status: 'Active',
      gender: 'Male',
      dateOfBirth: new Date('1992-12-05'),
      bankDetails: { bankName: 'Chase Bank', accountNumber: '4321098765', ifscCode: 'CHASUS33', panNumber: 'PAN432109' },
    }
  ];

  const createdEmployees = await Employee.insertMany(employeesData);

  // Link Department Heads
  await Department.findByIdAndUpdate(engDept._id, { headOfDepartment: createdEmployees[2]._id });
  await Department.findByIdAndUpdate(hrDept._id, { headOfDepartment: createdEmployees[4]._id });
  await Department.findByIdAndUpdate(prdDept._id, { headOfDepartment: createdEmployees[1]._id });

  // 4. Create User Accounts for Employees
  for (const emp of createdEmployees) {
    const user = await User.create({
      name: `${emp.firstName} ${emp.lastName}`,
      email: emp.email,
      password: 'employee123',
      role: 'employee',
      employeeId: emp._id,
      avatar: emp.profilePicture,
    });
    emp.userAccount = user._id;
    await emp.save();
  }

  // 5. Create Sample Attendance records for current month
  const today = new Date();
  const currentMonthStr = today.toISOString().split('T')[0];

  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Skip weekend
    if (d.getDay() === 0 || d.getDay() === 6) continue;

    for (let j = 0; j < createdEmployees.length; j++) {
      const emp = createdEmployees[j];
      const isLate = (i + j) % 5 === 0;
      const checkInHour = isLate ? 9 : 8;
      const checkInMin = isLate ? 45 : 55;

      const checkInDate = new Date(d);
      checkInDate.setHours(checkInHour, checkInMin, 0);

      const checkOutDate = new Date(d);
      checkOutDate.setHours(17, 30, 0);

      await Attendance.create({
        employee: emp._id,
        date: dateStr,
        checkIn: checkInDate,
        checkOut: i === 0 && j === 0 ? null : checkOutDate, // Today Sarah is checked in, not yet checked out
        status: isLate ? 'Late' : 'Present',
        workHours: i === 0 && j === 0 ? 4.5 : 8.5,
        location: j % 2 === 0 ? 'Office' : 'Remote',
      });
    }
  }

  // 6. Create Sample Leaves
  await Leave.create([
    {
      employee: createdEmployees[0]._id, // Sarah
      leaveType: 'Casual Leave',
      startDate: new Date(Date.now() + 86400000 * 3),
      endDate: new Date(Date.now() + 86400000 * 5),
      daysCount: 3,
      reason: 'Family wedding trip out of state',
      status: 'Approved',
      approvedBy: adminUser._id,
      decisionDate: new Date(),
      adminRemarks: 'Approved. Enjoy your time off!',
    },
    {
      employee: createdEmployees[1]._id, // Alex
      leaveType: 'Sick Leave',
      startDate: new Date(Date.now() + 86400000 * 1),
      endDate: new Date(Date.now() + 86400000 * 2),
      daysCount: 2,
      reason: 'Dental surgery and post-op recovery',
      status: 'Pending',
    },
    {
      employee: createdEmployees[3]._id, // Marcus
      leaveType: 'Earned Leave',
      startDate: new Date(Date.now() + 86400000 * 10),
      endDate: new Date(Date.now() + 86400000 * 15),
      daysCount: 6,
      reason: 'Annual European vacation',
      status: 'Pending',
    },
  ]);

  // 7. Create Sample Payroll records
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September'];
  const curMonthName = months[today.getMonth()] || 'September';
  const curYear = today.getFullYear();

  for (const emp of createdEmployees) {
    const basic = emp.salary;
    const hra = Math.round(basic * 0.20);
    const conveyance = 200;
    const medical = 150;
    const special = 100;
    const pf = Math.round(basic * 0.05);
    const tax = Math.round(basic * 0.10);
    const insurance = 120;

    const allowances = { hra, da: 0, conveyance, medical, special };
    const deductions = { providentFund: pf, tax, insurance, unpaidLeaveDeduction: 0 };
    const grossSalary = basic + hra + conveyance + medical + special;
    const totalDeductions = pf + tax + insurance;
    const netSalary = grossSalary - totalDeductions;

    await Payroll.create({
      employee: emp._id,
      month: curMonthName,
      year: curYear,
      basicSalary: basic,
      allowances,
      deductions,
      bonus: emp.firstName === 'Sarah' ? 500 : 0,
      grossSalary: grossSalary + (emp.firstName === 'Sarah' ? 500 : 0),
      totalDeductions,
      netSalary: netSalary + (emp.firstName === 'Sarah' ? 500 : 0),
      payDate: new Date(),
      paymentStatus: 'Paid',
      paymentMethod: 'Bank Transfer',
      notes: 'Monthly salary disbursed on time',
    });
  }

  // 8. Create Sample Job Postings & Applications
  const job1 = await Job.create({
    title: 'Senior Frontend React Developer',
    department: engDept._id,
    location: 'Remote / San Francisco',
    employmentType: 'Full-Time',
    experience: '3-5 years',
    salaryRange: { min: 110000, max: 145000, currency: 'USD' },
    description: 'We are looking for an experienced React developer to build high-performance, elegant enterprise applications.',
    requirements: ['3+ years in React.js, TypeScript, Tailwind', 'State management (Redux/Context/Zustand)', 'REST & GraphQL APIs', 'Clean modular architecture'],
    responsibilities: ['Build modular React UI components', 'Optimize Web Vitals and load performance', 'Collaborate with Product & Design teams'],
    openings: 2,
    status: 'Active',
    postedBy: adminUser._id,
  });

  const job2 = await Job.create({
    title: 'Product Growth Manager',
    department: prdDept._id,
    location: 'Hybrid - New York',
    employmentType: 'Full-Time',
    experience: '4-7 years',
    salaryRange: { min: 125000, max: 160000, currency: 'USD' },
    description: 'Drive user onboarding, conversion funnels, and retention metrics across our core B2B platform.',
    requirements: ['4+ years in product management or growth analytics', 'Deep understanding of SaaS metrics & retention loops', 'Experience with Mixpanel/Amplitude/A/B testing'],
    responsibilities: ['Define conversion OKRs and experiment roadmaps', 'Run weekly growth sprints', 'Partner with sales and engineering'],
    openings: 1,
    status: 'Active',
    postedBy: adminUser._id,
  });

  await Application.create([
    {
      job: job1._id,
      applicantName: 'Ethan Wright',
      email: 'ethan.wright@gmail.com',
      phone: '+1 (555) 991-8822',
      experienceYears: 4,
      coverLetter: 'I have 4 years of building React and Next.js applications in fast-paced SaaS startups.',
      status: 'Interview',
      interviewDate: new Date(Date.now() + 86400000 * 2),
      rating: 4.5,
      notes: 'Strong technical screener, passed Take-home test with distinction.',
    },
    {
      job: job1._id,
      applicantName: 'Jessica Martinez',
      email: 'jessica.m@outlook.com',
      phone: '+1 (555) 882-7733',
      experienceYears: 5,
      coverLetter: 'Excited to apply for the Senior Frontend position. Expertise in micro-frontends and design systems.',
      status: 'Screening',
      rating: 4.0,
      notes: 'Resume looks very solid. Scheduled for initial HR chat.',
    },
    {
      job: job2._id,
      applicantName: 'Liam O’Connor',
      email: 'liam.oc@gmail.com',
      phone: '+1 (555) 773-6644',
      experienceYears: 6,
      coverLetter: 'Previous Growth Lead at FinTech scale-up where we doubled self-serve ARR in 14 months.',
      status: 'Offered',
      rating: 5.0,
      notes: 'Outstanding candidate. Offer letter sent on Friday.',
    },
  ]);

  // 9. Create Sample Performance Appraisals
  await Performance.create([
    {
      employee: createdEmployees[0]._id, // Sarah
      reviewer: adminUser._id,
      reviewPeriod: 'Q2 2026',
      goals: [
        { title: 'Revamp UI Component Library', description: 'Migrate legacy CSS to Tailwind and Shadcn-inspired tokens', weightage: 30, status: 'Completed', progressPercent: 100 },
        { title: 'Core Web Vitals Optimization', description: 'Achieve LCP < 1.5s across all dashboard views', weightage: 30, status: 'Completed', progressPercent: 100 },
        { title: 'Mentor Junior Engineers', description: 'Host bi-weekly code review workshops', weightage: 40, status: 'In Progress', progressPercent: 80 },
      ],
      rating: 4.8,
      feedback: 'Sarah has shown stellar technical execution and leadership. Her UI re-architecture significantly improved front-end velocity across the entire engineering department.',
      achievements: 'Shipped design system overhaul 2 weeks ahead of schedule with 0 critical bugs.',
      areasOfImprovement: 'Continue expanding cross-functional mentorship.',
      status: 'Submitted',
    },
    {
      employee: createdEmployees[1]._id, // Alex
      reviewer: adminUser._id,
      reviewPeriod: 'Q2 2026',
      goals: [
        { title: 'Mobile Responsive Redesign', description: 'Design mobile views for HRMS portal', weightage: 50, status: 'Completed', progressPercent: 100 },
        { title: 'Accessibility Compliance WCAG 2.1 AA', description: 'Audit and resolve contrast & keyboard navigation', weightage: 50, status: 'Completed', progressPercent: 95 },
      ],
      rating: 4.5,
      feedback: 'Alex continues to produce world-class design prototypes that elevate user delight.',
      achievements: 'User satisfaction scores jumped from 82% to 94% following new UX rollouts.',
      areasOfImprovement: 'Document design tokens in Figma shared library.',
      status: 'Submitted',
    },
  ]);

  // 10. Sample Notifications
  await Notification.create([
    {
      recipient: adminUser._id,
      title: 'Leave Request Received',
      message: 'Alex Rivera submitted a 2-day Sick Leave request for review.',
      type: 'leave',
      link: '/leaves',
      isRead: false,
    },
    {
      recipient: adminUser._id,
      title: 'New Job Candidate',
      message: 'Ethan Wright applied for Senior Frontend React Developer position.',
      type: 'recruitment',
      link: '/recruitment',
      isRead: false,
    },
    {
      recipient: createdEmployees[0].userAccount,
      title: 'Payslip Disbursed',
      message: `Your payslip for ${curMonthName} ${curYear} is ready for download.`,
      type: 'payroll',
      link: '/payroll',
      isRead: false,
    },
  ]);

  console.log('✅ HRMS Database seeded successfully!');
  console.log('--------------------------------------------------');
  console.log('🔑 Demo Admin Credentials:');
  console.log('   Email:    admin@hrms.com');
  console.log('   Password: admin123');
  console.log('');
  console.log('👤 Demo Employee Credentials:');
  console.log('   Email:    sarah.jenkins@hrms.com');
  console.log('   Password: employee123');
  console.log('--------------------------------------------------');
};

module.exports = seedData;
