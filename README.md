# SETEC — SX8 Study Tracking System

A study management dashboard for tracking courses, tasks, schedules, grades, and attendance — built as a lightweight, fully client-side web app.

🔗 **Live app:** [study-management-gamma.vercel.app](https://study-management-gamma.vercel.app)

## About

SX8 helps students and teachers keep track of academic progress in one place: course lists, task/assignment tracking, weekly class schedules, grades, and attendance/absence limits — all without needing a server to run it.

## Features

- 📚 **Courses** — manage and view enrolled courses
- ✅ **Tasks** — track assignments and to-dos
- 🗓️ **Schedule** — dynamic weekly schedule with Monday-first ordering
- 📊 **Grades** — record and review grades
- 🚫 **Attendance tracking** — 19-absence limit indicator to flag at-risk attendance
- 📥 **Excel Import/Export** — teachers can import and export data via Excel
- 💾 **Pure LocalStorage architecture** — all data is stored locally in the browser, no backend/database required

## Tech Stack

- **Frontend:** JavaScript, HTML, CSS
- **Build tool:** [Vite](https://vitejs.dev/)
- **Data storage:** Browser LocalStorage (no backend)
- **Deployment:** [Vercel](https://vercel.com/)

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (LTS recommended)
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/Monyudom/study-management.git
cd study-management

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173` (default Vite port).

### Build for production

```bash
npm run build
```

The production-ready files will be output to the `dist` folder.

## Deployment

This project is deployed on [Vercel](https://vercel.com/) and configured via `vercel.json`. See `DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

## Project Structure

```
├── public/          # Static assets
├── src/             # Application source code
├── index.html       # App entry point
├── vite.config.js   # Vite configuration
├── vercel.json       # Vercel deployment config
└── DEPLOYMENT_GUIDE.md
```

## License

No license specified yet.
