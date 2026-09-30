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

// High-definition professional authentic Indian portrait images
const INDIAN_AVATARS = {
  admin: '/avatars/ayush_shukla.png', // Avinash Dev DabasShukla / HR Lead & Founder
  aarav: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=500&auto=format&fit=crop&q=80', // Aarav Sharma - UX/UI Lead & Architect
  priya: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=500&auto=format&fit=crop&q=80', // Priya Patel - Principal Frontend Engineer
  rohan: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80', // Rohan Verma - People Operations & Culture Lead
};

const seedData = async (forceReset = false) => {
  const userCount = await User.countDocuments();
  if (userCount > 0 && !forceReset) {
    console.log('Database already contains records. Pass forceReset=true to clear & re-seed.');
    return;
  }

  console.log('🧹 Purging all old records from MongoDB database...');
  await Promise.all([
    User.deleteMany({}),
    Employee.deleteMany({}),
    Department.deleteMany({}),
    Attendance.deleteMany({}),
    Leave.deleteMany({}),
    Payroll.deleteMany({}),
    Job.deleteMany({}),
    Application.deleteMany({}),
    Performance.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  console.log('🌱 Seeding fresh Indian HRMS organizational data with 3 employees...');

  // 1. Create Indian Departments
  const departmentsData = [
    { name: 'Product & Design', code: 'PRD', description: 'UX/UI research, design systems, design sprints, and user journey flows', budget: 450000, location: 'Cyber City, Gurugram - Floor 4' },
    { name: 'Engineering & Technology', code: 'ENG', description: 'Full stack development, cloud infrastructure, AI services, and DevOps', budget: 950000, location: 'Bengaluru Tech Park - Floor 6' },
    { name: 'Human Resources & People Ops', code: 'HR', description: 'Talent acquisition, organizational culture, benefits, and employee appraisals', budget: 250000, location: 'BKC, Mumbai - Floor 2' },
  ];

  const createdDepts = await Department.insertMany(departmentsData);
  const prdDept = createdDepts.find(d => d.code === 'PRD');
  const engDept = createdDepts.find(d => d.code === 'ENG');
  const hrDept = createdDepts.find(d => d.code === 'HR');

  // 2. Create Admin / HR Lead User
  const adminUser = await User.create({
    name: 'Avinash Dev DabasShukla (HR Lead)',
    email: 'admin@hrms.com',
    password: 'admin123',
    role: 'admin',
    avatar: INDIAN_AVATARS.admin,
  });

  // 3. Create Exactly 3 Indian Employees
  const employeesToCreate = [
    {
      empCustomId: 'EMP-1001',
      firstName: 'Aarav',
      lastName: 'Sharma',
      email: 'aarav.sharma@hrms.com',
      phone: '+91 98765 43210',
      department: prdDept._id,
      designation: 'UX/UI Lead & Architect',
      joiningDate: new Date('2023-04-10'),
      salary: 110000,
      address: { street: 'DLF Phase 5, Golf Course Road', city: 'Gurugram', state: 'Haryana', zipCode: '122002', country: 'India' },
      profilePicture: INDIAN_AVATARS.aarav,
      employmentType: 'Full-Time',
      status: 'Active',
      gender: 'Male',
      dateOfBirth: new Date('1994-08-15'),
      bankDetails: { bankName: 'HDFC Bank', accountNumber: '50100234567890', ifscCode: 'HDFC0001234', panNumber: 'ABCPS1234A' },
    },
    {
      empCustomId: 'EMP-1002',
      firstName: 'Priya',
      lastName: 'Patel',
      email: 'priya.patel@hrms.com',
      phone: '+91 98112 34567',
      department: engDept._id,
      designation: 'Principal Frontend Engineer',
      joiningDate: new Date('2022-06-15'),
      salary: 125000,
      address: { street: 'Koramangala 4th Block', city: 'Bengaluru', state: 'Karnataka', zipCode: '560034', country: 'India' },
      profilePicture: INDIAN_AVATARS.priya,
      employmentType: 'Full-Time',
      status: 'Active',
      gender: 'Female',
      dateOfBirth: new Date('1993-11-20'),
      bankDetails: { bankName: 'ICICI Bank', accountNumber: '001105001234', ifscCode: 'ICIC0000011', panNumber: 'BPPPT5678B' },
    },
    {
      empCustomId: 'EMP-1003',
      firstName: 'Rohan',
      lastName: 'Verma',
      email: 'rohan.verma@hrms.com',
      phone: '+91 99887 76655',
      department: hrDept._id,
      designation: 'People Operations & Culture Lead',
      joiningDate: new Date('2022-09-01'),
      salary: 118000,
      address: { street: 'Bandra West, Hill Road', city: 'Mumbai', state: 'Maharashtra', zipCode: '400050', country: 'India' },
      profilePicture: INDIAN_AVATARS.rohan,
      employmentType: 'Full-Time',
      status: 'Active',
      gender: 'Male',
      dateOfBirth: new Date('1991-03-12'),
      bankDetails: { bankName: 'State Bank of India', accountNumber: '30456789012', ifscCode: 'SBIN0001234', panNumber: 'CRVVR9012C' },
    },
  ];

  const createdEmployees = [];
  for (const empData of employeesToCreate) {
    const employee = await Employee.create(empData);
    createdEmployees.push(employee);

    // Create user login account for employee
    const userAcc = await User.create({
      name: `${empData.firstName} ${empData.lastName}`,
      email: empData.email,
      password: 'employee123',
      role: 'employee',
      employeeId: employee._id,
      avatar: empData.profilePicture,
    });

    employee.userAccount = userAcc._id;
    await employee.save();
  }

  // Update Department Heads
  await Department.findByIdAndUpdate(prdDept._id, { headOfDepartment: createdEmployees[0]._id });
  await Department.findByIdAndUpdate(engDept._id, { headOfDepartment: createdEmployees[1]._id });
  await Department.findByIdAndUpdate(hrDept._id, { headOfDepartment: createdEmployees[2]._id });

  // 4. Seed Attendance Records for Today
  const todayDate = new Date().toISOString().split('T')[0];
  const aarav = createdEmployees[0];
  const priya = createdEmployees[1];
  const rohan = createdEmployees[2];

  await Attendance.create([
    {
      employee: aarav._id,
      date: todayDate,
      checkIn: null,
      checkOut: null,
      status: 'Absent',
      workHours: 0,
      location: 'Gurugram HQ',
    },
    {
      employee: priya._id,
      date: todayDate,
      checkIn: new Date(new Date().setHours(9, 0, 0, 0)),
      checkOut: new Date(new Date().setHours(17, 30, 0, 0)),
      status: 'Present',
      workHours: 8.5,
      location: 'Bengaluru Tech Park',
    },
    {
      employee: rohan._id,
      date: todayDate,
      checkIn: new Date(new Date().setHours(9, 30, 0, 0)),
      checkOut: null,
      status: 'Present',
      workHours: 0,
      location: 'Mumbai Financial Center',
    },
  ]);

  // 5. Seed Leave Applications
  await Leave.create([
    {
      employee: aarav._id,
      leaveType: 'Casual Leave',
      startDate: new Date('2026-10-05'),
      endDate: new Date('2026-10-06'),
      daysCount: 2,
      reason: 'Family festival celebration in Jaipur',
      status: 'Pending',
    },
    {
      employee: priya._id,
      leaveType: 'Sick Leave',
      startDate: new Date('2026-09-20'),
      endDate: new Date('2026-09-21'),
      daysCount: 2,
      reason: 'Viral fever recovery',
      status: 'Approved',
      approvedBy: adminUser._id,
      adminRemarks: 'Approved by HR Lead. Get well soon.',
    },
    {
      employee: rohan._id,
      leaveType: 'Earned Leave',
      startDate: new Date('2026-10-12'),
      endDate: new Date('2026-10-16'),
      daysCount: 5,
      reason: 'Annual vacation trip to Ladakh',
      status: 'Pending',
    },
  ]);

  // 6. Seed Payroll Records
  await Payroll.create([
    {
      employee: aarav._id,
      month: 'September',
      year: 2026,
      basicSalary: 88000,
      allowances: { hra: 17600, conveyance: 2400, medical: 2000, special: 0 },
      deductions: { providentFund: 4400, tax: 8800, insurance: 1500 },
      bonus: 5000,
      grossSalary: 115000,
      totalDeductions: 14700,
      netSalary: 100300,
      paymentStatus: 'Paid',
      paymentMethod: 'Direct Deposit',
      paymentDate: new Date(),
    },
    {
      employee: priya._id,
      month: 'September',
      year: 2026,
      basicSalary: 100000,
      allowances: { hra: 20000, conveyance: 2500, medical: 2500, special: 0 },
      deductions: { providentFund: 5000, tax: 10000, insurance: 1500 },
      bonus: 8000,
      grossSalary: 133000,
      totalDeductions: 16500,
      netSalary: 116500,
      paymentStatus: 'Paid',
      paymentMethod: 'Direct Deposit',
      paymentDate: new Date(),
    },
    {
      employee: rohan._id,
      month: 'September',
      year: 2026,
      basicSalary: 94000,
      allowances: { hra: 18800, conveyance: 2400, medical: 2000, special: 0 },
      deductions: { providentFund: 4700, tax: 9400, insurance: 1500 },
      bonus: 4000,
      grossSalary: 121200,
      totalDeductions: 15600,
      netSalary: 105600,
      paymentStatus: 'Paid',
      paymentMethod: 'Direct Deposit',
      paymentDate: new Date(),
    },
  ]);

  // 7. Seed Job Requisitions & Candidates
  const job1 = await Job.create({
    title: 'Senior React & Next.js Engineer',
    department: engDept._id,
    location: 'Bengaluru / Hybrid',
    employmentType: 'Full-Time',
    experience: '3-5 years',
    salaryRange: { min: 90000, max: 140000, currency: 'USD' },
    description: 'Lead high-performance design system implementations and scalable dashboard UI workflows.',
    openings: 2,
    status: 'Active',
    applicantCount: 2,
  });

  const job2 = await Job.create({
    title: 'Lead Product Designer (Design Systems)',
    department: prdDept._id,
    location: 'Gurugram / Remote',
    employmentType: 'Full-Time',
    experience: '4-7 years',
    salaryRange: { min: 95000, max: 150000, currency: 'USD' },
    description: 'Define micro-interactions, dark mode tokens, and design language for enterprise SaaS suites.',
    openings: 1,
    status: 'Active',
    applicantCount: 1,
  });

  await Application.create([
    {
      job: job1._id,
      applicantName: 'Devansh Verma',
      email: 'devansh.v@gmail.com',
      phone: '+91 98711 22334',
      experienceYears: 4,
      status: 'Interview',
      rating: 5,
      notes: 'Exceptional portfolio, strong mastery of Framer Motion and TailwindCSS.',
    },
    {
      job: job1._id,
      applicantName: 'Ishaan Trivedi',
      email: 'ishaan.t@outlook.com',
      phone: '+91 98122 33445',
      experienceYears: 3,
      status: 'Screening',
      rating: 4,
      notes: 'Strong backend integration and Node.js REST API skills.',
    },
    {
      job: job2._id,
      applicantName: 'Meera Nambiar',
      email: 'meera.nambiar@design.io',
      phone: '+91 99455 66778',
      experienceYears: 5,
      status: 'Offered',
      rating: 5,
      notes: 'Top tier UI mockup quality and Bento box layout aesthetics.',
    },
  ]);

  // 8. Seed Performance Appraisal
  await Performance.create({
    employee: aarav._id,
    reviewer: adminUser._id,
    reviewPeriod: 'Q2 2026',
    rating: 5,
    feedback: 'Aarav has transformed our enterprise interface with stunning minimalist aesthetics, Bento grids, and flawless micro-animations.',
    achievements: 'Shipped dark mode theme engine, sunburst analytics visualizers, and interactive component libraries.',
    areasOfImprovement: 'Expand design tokens to upcoming mobile React Native modules.',
    goals: [
      { title: 'Deliver Design System 2.0 Tokens', weightage: 50, progressPercent: 100 },
      { title: 'Mentor Junior UX Researchers', weightage: 50, progressPercent: 95 },
    ],
    employeeComments: 'Grateful for the leadership support. Excited to roll out the new Bento dashboard experience.',
  });

  // 9. Seed Notifications
  await Notification.create([
    {
      recipient: adminUser._id,
      title: 'New Leave Request from Aarav Sharma',
      message: 'Aarav Sharma (EMP-1001) requested 2 day(s) Casual Leave from Oct 5 to Oct 6. Reason: "Family festival celebration in Jaipur"',
      type: 'leave',
      link: '/leaves',
    },
    {
      recipient: adminUser._id,
      title: 'Leave Request Pending Review',
      message: 'Rohan Verma (EMP-1003) applied for 5 day(s) Earned Leave for upcoming vacation trip.',
      type: 'leave',
      link: '/leaves',
    },
  ]);

  console.log('✅ Successfully seeded fresh Indian HRMS database records with 3 employees!');
};

module.exports = seedData;
