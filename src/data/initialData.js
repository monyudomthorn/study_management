
export const INITIAL_TEACHERS = [
  {
    id: 1,
    name: "Dr. Mengly Khorn",
    subject: "Database Systems & SQL",
    email: "mengly@setec.edu.kh",
    phone: "+855 12 345 678",
    telegram: "@mengly_khorn",
    avatar: "MK",
    room: "Building A, Room 302"
  },
  {
    id: 2,
    name: "Prof. Sokchea Chan",
    subject: "Web Development with React",
    email: "sokchea@setec.edu.kh",
    phone: "+855 17 889 900",
    telegram: "@sokchea_chan",
    avatar: "SC",
    room: "Lab 3, Floor 2"
  },
  {
    id: 3,
    name: "Ms. Sreynoch Bun",
    subject: "Enterprise System Analysis",
    email: "sreynoch@setec.edu.kh",
    phone: "+855 93 112 233",
    telegram: "@sreynoch_bun",
    avatar: "SB",
    room: "Building B, Room 204"
  },
  {
    id: 4,
    name: "Mr. Vanna Sam",
    subject: "Network Infrastructure",
    email: "vanna@setec.edu.kh",
    phone: "+855 89 445 566",
    telegram: "@vanna_sam",
    avatar: "VS",
    room: "Network Lab, Floor 1"
  }
];

export const INITIAL_SUBJECTS = [
  {
    id: 1,
    name: "Database Systems & SQL",
    code: "MIS-201",
    teacher: "Dr. Mengly Khorn",
    progress: 85,
    status: "In Progress",
    description: "Relational database architecture, normalization, complex SQL joins, indexing, and query optimization."
  },
  {
    id: 2,
    name: "Web Development with React",
    code: "CS-204",
    teacher: "Prof. Sokchea Chan",
    progress: 90,
    status: "In Progress",
    description: "Modern frontend application engineering using React, Vite, Hooks, and Component Architecture."
  },
  {
    id: 3,
    name: "Enterprise System Analysis",
    code: "MIS-205",
    teacher: "Ms. Sreynoch Bun",
    progress: 70,
    status: "In Progress",
    description: "Software engineering methodologies, UML diagrams, business process workflows, and ERP systems."
  },
  {
    id: 4,
    name: "Network Infrastructure",
    code: "IT-202",
    teacher: "Mr. Vanna Sam",
    progress: 60,
    status: "In Progress",
    description: "TCP/IP suite, IPv4/IPv6 subnetting, routing protocols, VLANs, and network security policies."
  }
];

export const INITIAL_PRACTICES = [
  {
    id: 1,
    title: "MySQL Query Optimization & Joins Lab",
    subject: "Database Systems & SQL",
    description: "Practiced complex inner/outer joins, subqueries, and analyzed execution plans using EXPLAIN.",
    created_date: "2026-09-01",
    createdDate: "2026-09-01",
    status: "Completed"
  },
  {
    id: 2,
    title: "React State Management with Context",
    subject: "Web Development with React",
    description: "Implemented a central theme and data management provider with local storage persistence.",
    created_date: "2026-09-02",
    createdDate: "2026-09-02",
    status: "Completed"
  },
  {
    id: 3,
    title: "UML Class & Sequence Diagram Workshop",
    subject: "Enterprise System Analysis",
    description: "Designed comprehensive class structures and sequence workflows for student tracking portal.",
    created_date: "2026-09-05",
    createdDate: "2026-09-05",
    status: "In Progress"
  },
  {
    id: 4,
    title: "VLAN Configuration & Inter-VLAN Routing",
    subject: "Network Infrastructure",
    description: "Set up Cisco switches with Trunking, Access ports, and Router-on-a-stick in Packet Tracer.",
    created_date: "2026-09-08",
    createdDate: "2026-09-08",
    status: "In Progress"
  }
];

export const INITIAL_ASSIGNMENTS = [
  {
    id: 1,
    title: "Final Database Normalization Case Study",
    subject: "Database Systems & SQL",
    description: "Analyze unnormalized legacy university records and normalize to BCNF with documentation.",
    due_date: "2026-09-15",
    dueDate: "2026-09-15",
    priority: "High",
    status: "Pending"
  },
  {
    id: 2,
    title: "Full-Stack React Dashboard Implementation",
    subject: "Web Development with React",
    description: "Build a responsive student management frontend featuring dark mode, charts, and local storage.",
    due_date: "2026-09-18",
    dueDate: "2026-09-18",
    priority: "High",
    status: "Pending"
  },
  {
    id: 3,
    title: "Business Process Flowchart Document",
    subject: "Enterprise System Analysis",
    description: "Prepare swimlane diagrams and system requirement specifications for course enrollment module.",
    due_date: "2026-09-22",
    dueDate: "2026-09-22",
    priority: "Medium",
    status: "Pending"
  },
  {
    id: 4,
    title: "VLSM Subnetting Calculation Task",
    subject: "Network Infrastructure",
    description: "Design and allocate subnets for 5 organizational departments with minimum address waste.",
    due_date: "2026-09-10",
    dueDate: "2026-09-10",
    priority: "Medium",
    status: "Completed"
  }
];

