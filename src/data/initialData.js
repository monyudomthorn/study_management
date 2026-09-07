
export const INITIAL_TEACHERS = [
  {
    id: 1,
    name: "PHON Phanith",
    subject: "Computer Accounting",
    email: "[EMAIL_ADDRESS]",
    phone: "+855 12 345 678",
    telegram: "@phonphanith",
    avatar: "PP",
    room: "Building A, Room 302"
  },
  {
    id: 2,
    name: "HENG Monorom",
    subject: "Web Development",
    email: "[EMAIL_ADDRESS]",
    phone: "+855 17 889 900",
    telegram: "@hengmonorom",
    avatar: "HM",
    room: "Lab 3, Floor 2"
  }
];

export const INITIAL_SUBJECTS = [
  {
    id: 1,
    name: "Computer Accounting",
    code: "C A/C",
    teacher: "PHON Phanith",
    progress: 85,
    status: "In Progress",
    description: "Computer Accounting"
  },
  {
    id: 2,
    name: "Web Development",
    code: "WD",
    teacher: "HENG Monorom",
    progress: 90,
    status: "In Progress",
    description: "Web Development"
  }
];

export const INITIAL_PRACTICES = [];

export const INITIAL_ASSIGNMENTS = [];

export const INITIAL_ATTENDANCES = [
  {
    id: 1,
    date: "2026-09-07",
    formattedDate: "07-September-2026",
    day: "Monday",
    slots: [
      {
        slotId: "slot-1",
        time: "7:00 – 8:30",
        subject: "Computer Accounting",
        status: "Present",
        room: "Room 302",
        teacher: "PHON Phanith",
        notes: "Ledger Accounts & Balance Sheet reconciliation"
      },
      {
        slotId: "slot-2",
        time: "8:45 – 10:15",
        subject: "Web Development",
        status: "Present",
        room: "Lab 3",
        teacher: "HENG Monorom",
        notes: "React component architecture and state hooks"
      },
      {
        slotId: "slot-3",
        time: "10:15 – 11:45",
        subject: "Web Development",
        status: "Present",
        room: "Lab 3",
        teacher: "HENG Monorom",
        notes: "Hands-on UI development & responsive layouts"
      }
    ],
    overallStatus: "Present",
    remarks: "Attended all 3 morning sessions on time."
  },
  {
    id: 2,
    date: "2026-09-05",
    formattedDate: "05-September-2026",
    day: "Saturday",
    slots: [
      {
        slotId: "slot-1",
        time: "7:00 – 8:30",
        subject: "Computer Accounting",
        status: "Present",
        room: "Room 302",
        teacher: "PHON Phanith",
        notes: "Financial Statements and Quickbooks practicals"
      },
      {
        slotId: "slot-2",
        time: "8:45 – 10:15",
        subject: "Web Development",
        status: "Present",
        room: "Lab 3",
        teacher: "HENG Monorom",
        notes: "REST API Integration & Async fetch patterns"
      },
      {
        slotId: "slot-3",
        time: "10:15 – 11:45",
        subject: "Computer Accounting",
        status: "Present",
        room: "Room 302",
        teacher: "PHON Phanith",
        notes: "Group assignment review and audit reports"
      }
    ],
    overallStatus: "Present",
    remarks: "Weekend lab sessions fully completed."
  },
  {
    id: 3,
    date: "2026-09-04",
    formattedDate: "04-September-2026",
    day: "Friday",
    slots: [
      {
        slotId: "slot-1",
        time: "7:00 – 8:30",
        subject: "Web Development",
        status: "Present",
        room: "Lab 3",
        teacher: "HENG Monorom",
        notes: "JavaScript ES6+ and Modern Tooling"
      },
      {
        slotId: "slot-2",
        time: "8:45 – 10:15",
        subject: "Computer Accounting",
        status: "Late",
        room: "Room 302",
        teacher: "PHON Phanith",
        notes: "Joined at 9:00 AM (traffic delay)"
      },
      {
        slotId: "slot-3",
        time: "10:15 – 11:45",
        subject: "Computer Accounting",
        status: "Present",
        room: "Room 302",
        teacher: "PHON Phanith",
        notes: "Taxation & Payroll systems analysis"
      }
    ],
    overallStatus: "Late",
    remarks: "Late for slot 2 due to traffic, slot 1 & 3 present."
  }
];
