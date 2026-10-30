# CulturalGuide

This project consists of a **.NET 9 backend** with APIs and SQLite database, and a **React frontend** using Vite and TailwindCSS.

---

## Prerequisites

Make sure the following are installed on your machine:

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js v18+ and npm](https://nodejs.org/)
- [Git](https://git-scm.com/)
- Optional: Visual Studio Code or JetBrains Rider

```bash
Project Structure Back-End & Front-End
CulturalGuide/
├─ CulturalGuideBACKEND/       # .NET 9 Web API backend
│  ├─ Controllers/            # API controllers (AuthController, etc.)
│  ├─ Data/                   # DbContext and migrations
│  ├─ Models/                 # User and other model classes
│  └─ Program.cs              # Backend startup
├─ cultural-guide-frontend/   # React + Vite + Tailwind frontend
│  ├─ src/
│  │  ├─ components/         # React components (LoginForm, Dashboard, etc.)
│  │  ├─ pages/              # React pages (LoginPage, DashboardPage, etc.)
│  │  ├─ styles/             # TailwindCSS styles
│  │  ├─ locales/            # Language files for i18n
│  │  └─ App.js
│  └─ package.json
└─ README.md
```


## Backend Setup (.NET 9)

1. Navigate to the backend folder:

```bash
cd CulturalGuide/CulturalGuideBACKEND

dotnet restore

dotnet ef database update

OPTIONAL
dotnet ef migrations add MigrationName
dotnet ef database update

else continue normally with the following commands
dotnet build

dotnet run

cd CulturalGuide/cultural-guide-frontend

npm install
npm run
OPTIONAL
npm run dev
npm start

cd CulturalGuide/CulturalGuideBACKEND
dotnet run


cd CulturalGuide/cultural-guide-frontend
npm run dev
-- now go to localhost:3000 if not automatically opened yet




  
