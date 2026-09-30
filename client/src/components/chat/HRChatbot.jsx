import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  attendanceApi,
  leaveApi,
  payrollApi,
  dashboardApi,
  employeeApi,
} from '../../api';
import {
  Bot,
  X,
  Send,
  Sparkles,
  RotateCcw,
  ArrowRight,
  Clock,
  Calendar,
  IndianRupee,
  Users,
  CheckCircle2,
  HelpCircle,
  Briefcase,
  ChevronDown,
} from 'lucide-react';

const HRChatbot = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  // Cached HR context data
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [adminStats, setAdminStats] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const loggedInName = user?.name ? user.name.split(' ')[0] : 'there';

  // Quick suggestion chips based on user role
  const staffSuggestions = [
    'What is my leave balance?',
    'Check my shift punch status',
    'How is my monthly salary calculated?',
    'What is the company WFH policy?',
    'Show official working hours',
  ];

  const adminSuggestions = [
    'How many employees are present today?',
    'Show pending leave approvals',
    'Total workforce headcount',
    'Monthly payroll expense summary',
    'Department distribution summary',
  ];

  const activeSuggestions = isAdmin ? adminSuggestions : staffSuggestions;

  // Initialize welcome message
  useEffect(() => {
    const welcome = {
      id: 'welcome-1',
      sender: 'bot',
      text: `Hello **${loggedInName}**! 👋 I am your **HR Pulse AI Assistant**.\n\nI can help you instantly with real-time leave balances, shift attendance, payroll breakdowns, and company policies.`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      actionButtons: isAdmin
        ? [
            { label: '📊 Today\'s Attendance', query: 'How many employees are present today?' },
            { label: '📋 Pending Leaves', query: 'Show pending leave approvals' },
            { label: '👥 Workforce Stats', query: 'Total workforce headcount' },
          ]
        : [
            { label: '🏖️ Leave Balance', query: 'What is my leave balance?' },
            { label: '⏱️ Shift Status', query: 'Check my shift punch status' },
            { label: '💰 Salary Breakdown', query: 'How is my monthly salary calculated?' },
          ],
    };
    setMessages([welcome]);
  }, [user]);

  // Fetch contextual live data on open
  useEffect(() => {
    if (!isOpen) return;

    const fetchLiveContext = async () => {
      try {
        const [attRes, balRes] = await Promise.all([
          attendanceApi.getToday().catch(() => null),
          leaveApi.getBalance().catch(() => null),
        ]);

        if (attRes?.data?.success) setTodayAttendance(attRes.data.data);
        if (balRes?.data?.success) setLeaveBalance(balRes.data.data);

        if (isAdmin) {
          const statsRes = await dashboardApi.getAdminStats().catch(() => null);
          if (statsRes?.data?.success) setAdminStats(statsRes.data.data);
        }
      } catch (err) {
        console.error('Chatbot context fetch error:', err);
      }
    };

    fetchLiveContext();
    if (inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, isAdmin]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Process and generate intelligent responses
  const generateBotResponse = async (userQuery) => {
    const q = userQuery.toLowerCase().trim();

    // 1. LEAVE BALANCE & INQUIRIES
    if (q.includes('leave balance') || q.includes('chhutti') || q.includes('how many leave') || q.includes('casual leave') || q.includes('sick leave')) {
      const casualLeft = leaveBalance?.casualLeave ?? 12;
      const sickLeft = leaveBalance?.sickLeave ?? 10;
      const earnedLeft = leaveBalance?.earnedLeave ?? 15;
      const totalLeft = casualLeft + sickLeft + earnedLeft;

      return {
        text: `Here is your current **Live Leave Quota Balance** for 2026:\n\n• **Casual Leave (CL):** ${casualLeft} days remaining\n• **Sick Leave (SL):** ${sickLeft} days remaining\n• **Earned/Privilege Leave (EL):** ${earnedLeft} days remaining\n\n📌 **Total Available:** **${totalLeft} Paid Leaves**\n\nWould you like to submit a new leave application?`,
        link: '/leaves',
        linkText: 'Go to Leave Requests →',
      };
    }

    // 2. SHIFT STATUS & ATTENDANCE
    if (q.includes('shift') || q.includes('punch') || q.includes('attendance') || q.includes('check in') || q.includes('clock in') || q.includes('working hour')) {
      if (isAdmin) {
        const presentCount = adminStats?.stats?.presentToday ?? 2;
        const totalCount = adminStats?.stats?.totalEmployees ?? 3;
        const rate = adminStats?.stats?.attendanceRate ?? 100;
        return {
          text: `📊 **Today's Organization Attendance Summary**:\n\n• **Present / Clocked In:** ${presentCount} / ${totalCount} Employees\n• **Daily Punctuality Rate:** ${rate}%\n• **Location:** Gurugram HQ, Bengaluru R&D, Mumbai\n\nYou can track live punch times directly from the Attendance terminal.`,
          link: '/attendance',
          linkText: 'Open Real-time Attendance Terminal →',
        };
      }

      if (todayAttendance?.checkIn && todayAttendance?.checkOut) {
        return {
          text: `✅ **Today's Shift is Completed!**\n\n• **Punch In:** ${new Date(todayAttendance.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}\n• **Punch Out:** ${new Date(todayAttendance.checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}\n• **Logged Hours:** ${todayAttendance.workHours || 8.0} hrs\n• **Status:** Present`,
          link: '/attendance',
          linkText: 'View Monthly Attendance Card →',
        };
      } else if (todayAttendance?.checkIn) {
        return {
          text: `🟢 **Your Shift is currently ACTIVE & RUNNING!**\n\n• **Punched In at:** ${new Date(todayAttendance.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}\n• **Status:** Clocked In (Live Duration Tracking)\n\nRemember to click **Punch Out** when concluding your workday.`,
          link: '/dashboard',
          linkText: 'Go to Punch Out Button →',
        };
      } else {
        return {
          text: `⚠️ **You have not clocked in for today yet.**\n\nStandard shift hours begin at 09:00 AM IST. You can punch in with 1-tap directly from your Dashboard or Attendance page.`,
          link: '/dashboard',
          linkText: '1-Tap Punch In Now →',
        };
      }
    }

    // 3. ADMIN: PENDING LEAVES
    if (isAdmin && (q.includes('pending leave') || q.includes('leave request') || q.includes('leave approval'))) {
      const pendingCount = adminStats?.stats?.pendingLeaves ?? 1;
      return {
        text: `📋 **Pending Leave Approvals**:\n\nThere are currently **${pendingCount} pending leave application(s)** awaiting your review.\n\nYou can approve or reject them with 1-click directly from the Dashboard or Leaves portal.`,
        link: '/leaves',
        linkText: 'Review Leave Requests Now →',
      };
    }

    // 4. ADMIN: WORKFORCE HEADCOUNT & DEPARTMENTS
    if (isAdmin && (q.includes('total employee') || q.includes('headcount') || q.includes('workforce') || q.includes('department distribution') || q.includes('how many employee'))) {
      const total = adminStats?.stats?.totalEmployees ?? 3;
      return {
        text: `👥 **Workforce Overview**:\n\n• **Total Active Employees:** ${total}\n• **Key Teams:** Product & Design (PRD), Engineering (ENG), Human Resources (HR)\n• **Headquarters:** New Delhi HQ & Bengaluru R&D`,
        link: '/employees',
        linkText: 'View Employee Directory →',
      };
    }

    // 5. PAYROLL & SALARY BREAKDOWN
    if (q.includes('salary') || q.includes('payroll') || q.includes('payslip') || q.includes('tax') || q.includes('epf') || q.includes('tds') || q.includes('paisa')) {
      if (isAdmin) {
        const totalPayroll = adminStats?.stats?.totalPayrollSpent ?? 353000;
        return {
          text: `💼 **Monthly Payroll Velocity**:\n\n• **Monthly Total Disbursement:** ₹${(totalPayroll / 100000).toFixed(2)} Lakhs\n• **Components:** Basic, HRA (20%), Conveyance, Medical, EPF (12%), TDS/Tax, ESI\n• **Compliance:** 100% Indian Statutory & Labor Law Compliant`,
          link: '/payroll',
          linkText: 'Manage Organization Payroll →',
        };
      }

      return {
        text: `💳 **Salary Structure & Compensation**:\n\nYour salary is disbursed via Direct Deposit on the **last working day of each month**.\n\n• **Allowances:** HRA, Medical, Conveyance, Special\n• **Deductions:** Provident Fund (PF 12%), Income Tax (TDS), Professional Tax\n• **Payslips:** Digitally generated with CTC breakdowns.`,
        link: '/payroll',
        linkText: 'Download My Payslip →',
      };
    }

    // 6. WFH & OFFICE POLICIES
    if (q.includes('wfh') || q.includes('work from home') || q.includes('remote') || q.includes('hybrid')) {
      return {
        text: `🏡 **Hybrid & Work From Home (WFH) Policy**:\n\n• **Eligibility:** Up to 2 WFH days per week permitted with prior lead approval.\n• **Core Hours:** Available on Slack/Email between 09:30 AM – 06:00 PM IST.\n• **Time Tracking:** Please record your shift check-in using the HRMS terminal even while working remotely.`,
      };
    }

    // 7. WORKING HOURS & TIMINGS
    if (q.includes('working hour') || q.includes('timings') || q.includes('office time') || q.includes('office hour') || q.includes('late')) {
      return {
        text: `⏰ **Official Organization Work Timings**:\n\n• **Standard Hours:** 09:00 AM – 06:00 PM IST (Mon – Fri)\n• **Lunch Recess:** 01:00 PM – 02:00 PM IST\n• **Late Grace Period:** Check-ins after 09:30 AM are marked as *Late Arrival*.\n• **Half Day Threshold:** Shifts under 4 hours are automatically calculated as Half Day.`,
      };
    }

    // 8. HOLIDAYS & CALENDAR
    if (q.includes('holiday') || q.includes('festival') || q.includes('calendar') || q.includes('diwali') || q.includes('off')) {
      return {
        text: `🎉 **Upcoming Recognized Public Holidays (2026)**:\n\n• **Oct 02, 2026:** Gandhi Jayanti\n• **Oct 20, 2026:** Dussehra (Vijayadashami)\n• **Nov 08, 2026:** Diwali (Deepavali)\n• **Dec 25, 2026:** Christmas Day\n\nAll recognized holidays are fully paid non-working days.`,
      };
    }

    // 9. LEADERSHIP & FOUNDER
    if (q.includes('founder') || q.includes('ayush') || q.includes('ceo') || q.includes('who is ayush') || q.includes('management')) {
      return {
        text: `👑 **Leadership & Administration**:\n\n• **Founder & HR Administrator:** **Avinash Dev DabasShukla**\n• **Designation:** HR Administrator & Founder\n• **Headquarters:** New Delhi HQ & Bengaluru R&D Hub\n• **Platform:** HR Pulse Enterprise Human Resource Management System.`,
      };
    }

    // 10. GREETINGS & CASUAL
    if (q.includes('hi') || q.includes('hello') || q.includes('hey') || q.includes('namaste') || q.includes('good morning') || q.includes('good afternoon')) {
      return {
        text: `Hello again, **${loggedInName}**! 😊 How can I help you today?\n\nYou can ask me about your leave quota, shift clock status, payslips, or company HR policies.`,
      };
    }

    if (q.includes('thank') || q.includes('shukriya') || q.includes('dhanyawad') || q.includes('great') || q.includes('awesome')) {
      return {
        text: `You are very welcome, **${loggedInName}**! Always happy to assist. Let me know if there's anything else you need! 👍`,
      };
    }

    // 11. GENERAL SMART FALLBACK
    return {
      text: `I'm here to assist you with everything HRMS! Here are popular topics you can ask me about:\n\n1. **Leave Quotas:** *"How many leaves do I have left?"*\n2. **Shift Status:** *"Check today's shift punch status"*\n3. **Salary & Payroll:** *"How is TDS or PF deducted?"*\n4. **Work Policies:** *"Explain the WFH policy"*\n5. **Office Timings:** *"What are the standard working hours?"*`,
      actionButtons: [
        { label: '🏖️ Check Leaves', query: 'What is my leave balance?' },
        { label: '⏱️ Shift Timings', query: 'Show official working hours' },
        { label: '🏡 WFH Guidelines', query: 'What is the company WFH policy?' },
      ],
    };
  };

  const handleSendMessage = async (customQuery = null) => {
    const textToSend = customQuery || inputMessage;
    if (!textToSend.trim()) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate realistic brief thinking time
    setTimeout(async () => {
      const response = await generateBotResponse(textToSend);
      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: response.text,
        link: response.link,
        linkText: response.linkText,
        actionButtons: response.actionButtons,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 450);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'bot',
        text: `Chat cleared! How can I assist you now, **${loggedInName}**?`,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      },
    ]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Action Trigger Button (Bottom-Right, Icon Only) */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => {
              setIsOpen(true);
              setHasUnread(false);
            }}
            className="group flex items-center justify-center w-12 h-12 rounded-full bg-black text-white shadow-2xl hover:bg-neutral-800 transition-all transform hover:scale-110 active:scale-95 border border-neutral-700 focus:outline-none"
            title="HR AI Assistant"
            aria-label="Open HR Assistant"
          >
            <div className="relative flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-black animate-pulse" />
            </div>
          </button>
        )}
      </div>

      {/* Floating Chat Modal Box */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[400px] h-[560px] max-h-[85vh] bg-white border border-neutral-300 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fade-in font-sans">
          {/* Header Bar */}
          <div className="bg-neutral-900 text-white px-5 py-4 flex items-center justify-between border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-tight">HR Pulse Assistant</h3>
                  <span className="flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-neutral-800 text-emerald-400 border border-neutral-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    LIVE
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400">Instant answers for {user?.name || 'Staff'}</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                title="Clear Conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                title="Close Assistant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-neutral-50/50">
            {messages.map((msg) => {
              const isBot = msg.sender === 'bot';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isBot ? 'items-start' : 'items-end'} space-y-1`}
                >
                  <div className="flex items-end gap-2 max-w-[86%]">
                    {isBot && (
                      <div className="w-6 h-6 rounded-lg bg-neutral-900 text-white flex items-center justify-center shrink-0 mb-1 text-[10px] font-bold">
                        AI
                      </div>
                    )}

                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isBot
                          ? 'bg-white border border-neutral-200 text-neutral-900 shadow-2xs rounded-bl-xs'
                          : 'bg-black text-white shadow-xs rounded-br-xs'
                      }`}
                    >
                      <p className="whitespace-pre-line">
                        {msg.text.split('**').map((part, i) =>
                          i % 2 === 1 ? (
                            <strong key={i} className={isBot ? 'text-black font-bold' : 'font-bold'}>
                              {part}
                            </strong>
                          ) : (
                            part
                          )
                        )}
                      </p>

                      {/* Optional Clickable Route Link */}
                      {msg.link && (
                        <div className="mt-3 pt-2.5 border-t border-neutral-200">
                          <button
                            onClick={() => {
                              navigate(msg.link);
                              setIsOpen(false);
                            }}
                            className="inline-flex items-center gap-1.5 font-bold text-neutral-900 hover:underline text-[11px]"
                          >
                            <span>{msg.linkText || 'View Details'}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {/* Interactive Action Query Buttons */}
                      {msg.actionButtons && msg.actionButtons.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-neutral-100 flex flex-wrap gap-1.5">
                          {msg.actionButtons.map((btn, bIdx) => (
                            <button
                              key={bIdx}
                              onClick={() => handleSendMessage(btn.query)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-neutral-100 text-neutral-800 hover:bg-black hover:text-white border border-neutral-200 transition-colors"
                            >
                              {btn.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] text-neutral-400 px-2 font-mono">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 text-neutral-400 text-xs py-1">
                <div className="w-6 h-6 rounded-lg bg-neutral-900 text-white flex items-center justify-center shrink-0 text-[10px]">
                  AI
                </div>
                <div className="bg-white border border-neutral-200 px-3 py-2 rounded-2xl flex items-center gap-1.5 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Pills */}
          <div className="px-3 py-2 bg-white border-t border-neutral-100 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
            <span className="text-[10px] uppercase font-bold text-neutral-400 shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-neutral-500" />
              Ask:
            </span>
            {activeSuggestions.slice(0, 3).map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(sug)}
                className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium bg-neutral-100 hover:bg-black hover:text-white text-neutral-700 transition-colors border border-neutral-200"
              >
                {sug}
              </button>
            ))}
          </div>

          {/* User Input & Send Bar */}
          <div className="p-3 bg-white border-t border-neutral-200">
            <div className="flex items-center gap-2 bg-neutral-100 border border-neutral-200 rounded-2xl px-3 py-1.5 focus-within:border-black focus-within:bg-white transition-all">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about leaves, attendance, salary..."
                className="flex-1 bg-transparent border-none outline-none text-xs text-neutral-900 placeholder:text-neutral-400 py-1"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isTyping}
                className={`p-1.5 rounded-xl transition-all ${
                  inputMessage.trim() && !isTyping
                    ? 'bg-black text-white hover:bg-neutral-800 shadow-xs'
                    : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                }`}
                title="Send Question"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HRChatbot;
