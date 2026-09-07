
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
    date: "2026-08-31",
    formattedDate: "31-August-2026",
    day: "Monday",
    slots: [
      {
        slotId: "slot-1",
        time: "7:00 – 8:30",
        subject: "Computer Accounting",
        status: "Present",
        room: "Room 302",
        teacher: "PHON Phanith",
        notes: ""
      },
      {
        slotId: "slot-2",
        time: "8:45 – 10:15",
        subject: "C# Programming II",
        status: "Present",
        room: "Lab 3",
        teacher: "HENG Monorom",
        notes: ""
      },
      {
        slotId: "slot-3",
        time: "10:15 – 11:45",
        subject: "C# Programming II",
        status: "Present",
        room: "Lab 3",
        teacher: "HENG Monorom",
        notes: ""
      }
    ],
    overallStatus: "Present",
    remarks: "Attended all morning sessions."
  },
  {
    id: 2,
    date: "2026-09-01",
    formattedDate: "01-September-2026",
    day: "Tuesday",
    slots: [
      {
        slotId: "slot-1",
        time: "7:00 – 8:30",
        subject: "Graphic Design III",
        status: "Present",
        room: "Lab 1",
        teacher: "ROM",
        notes: ""
      },
      {
        slotId: "slot-2",
        time: "8:45 – 10:15",
        subject: "Studio Photography I",
        status: "Present",
        room: "Studio 2",
        teacher: "SOKHA",
        notes: ""
      },
      {
        slotId: "slot-3",
        time: "10:15 – 11:45",
        subject: "Database Server Application I",
        status: "Present",
        room: "Lab 3",
        teacher: "PHON Phanith",
        notes: ""
      }
    ],
    overallStatus: "Present",
    remarks: "Full practicals completed."
  },
  {
    id: 3,
    date: "2026-09-02",
    formattedDate: "02-September-2026",
    day: "Wednesday",
    slots: [
      {
        slotId: "slot-1",
        time: "7:00 – 8:30",
        subject: "UX/UI",
        status: "Present",
        room: "Lab 2",
        teacher: "DARA",
        notes: ""
      },
      {
        slotId: "slot-2",
        time: "8:45 – 10:15",
        subject: "Networking I",
        status: "Present",
        room: "Lab 4",
        teacher: "VIBOL",
        notes: ""
      },
      {
        slotId: "slot-3",
        time: "10:15 – 11:45",
        subject: "Studio Photography I",
        status: "Present",
        room: "Studio 2",
        teacher: "SOKHA",
        notes: ""
      }
    ],
    overallStatus: "Present",
    remarks: "Attended all design & network labs."
  },
  {
    id: 4,
    date: "2026-09-03",
    formattedDate: "03-September-2026",
    day: "Thursday",
    slots: [
      {
        slotId: "slot-1",
        time: "7:00 – 8:30",
        subject: "Data Modeling",
        status: "Present",
        room: "Room 302",
        teacher: "PHON Phanith",
        notes: ""
      },
      {
        slotId: "slot-2",
        time: "8:45 – 10:15",
        subject: "Computer Accounting",
        status: "Present",
        room: "Room 302",
        teacher: "PHON Phanith",
        notes: ""
      },
      {
        slotId: "slot-3",
        time: "10:15 – 11:45",
        subject: "UX/UI",
        status: "Present",
        room: "Lab 2",
        teacher: "DARA",
        notes: ""
      }
    ],
    overallStatus: "Present",
    remarks: "Lectures and UI prototypes completed."
  },
  {
    id: 5,
    date: "2026-09-04",
    formattedDate: "04-September-2026",
    day: "Friday",
    slots: [
      {
        slotId: "slot-1",
        time: "7:00 – 8:30",
        subject: "Web Development II",
        status: "Present",
        room: "Lab 3",
        teacher: "HENG Monorom",
        notes: ""
      },
      {
        slotId: "slot-2",
        time: "8:45 – 10:15",
        subject: "Networking I",
        status: "Present",
        room: "Lab 4",
        teacher: "VIBOL",
        notes: ""
      },
      {
        slotId: "slot-3",
        time: "10:15 – 11:45",
        subject: "Data Modeling",
        status: "Present",
        room: "Room 302",
        teacher: "PHON Phanith",
        notes: ""
      }
    ],
    overallStatus: "Present",
    remarks: "Web Dev & Data Modeling completed."
  },
  {
    id: 6,
    date: "2026-09-05",
    formattedDate: "05-September-2026",
    day: "Saturday",
    slots: [
      {
        slotId: "slot-1",
        time: "7:00 – 8:30",
        subject: "Graphic Design III",
        status: "Present",
        room: "Lab 1",
        teacher: "ROM",
        notes: ""
      },
      {
        slotId: "slot-2",
        time: "8:45 – 10:15",
        subject: "Web Development II",
        status: "Present",
        room: "Lab 3",
        teacher: "HENG Monorom",
        notes: ""
      },
      {
        slotId: "slot-3",
        time: "10:15 – 11:45",
        subject: "Database Server Application I",
        status: "Present",
        room: "Lab 3",
        teacher: "PHON Phanith",
        notes: ""
      }
    ],
    overallStatus: "Present",
    remarks: "Weekend lab sessions fully completed."
  }
];
