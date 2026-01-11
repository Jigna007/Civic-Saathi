# CivicSaathi

**CivicSaathi** is an intelligent civic maintenance management platform that empowers citizens to report infrastructure issues and helps administrators efficiently manage and resolve them using AI-powered analysis.

---

## Key Features

### For Citizens
- **AI-Augmented Reporting**: Upload images and descriptions - AI automatically categorizes and assesses severity
- **Speech-to-Text**: Voice input for issue descriptions
- **Interactive Maps**: View all issues with geocoding, heatmaps, and location tagging
- **Community Engagement**: Upvote important issues to increase priority
- **Real-time Tracking**: Monitor your reports from submission to resolution
- **My Reports Dashboard**: Track all your submitted issues in one place

### For Administrators
- **Analytics Dashboard**: Statistics, severity distribution and category breakdown
- **Issue Management**: Update status, assign technicians, track progress (0-100%)
- **Technician Management**: Manage specialists, availability, and assignments
- **Priority System**: View issues sorted by upvotes and severity
- **Manual Intervention**: Read, modify and delete reports depending upon the requirement

---

## Technology Stack

### Frontend
- **React 18** + **TypeScript** - Type-safe component architecture
- **Vite** - Builder tool for fast development
- **Tailwind CSS** + **Shadcn/UI** - Modern, accessible UI components
- **TanStack Query + Wouter** - Server state management and routing
- **Leaflet** + **React Leaflet** - Interactive map visualization
  
### Backend
- **Node.js** + **Express.js** - RESTful API server
- **TypeScript** - Shared types across stack
- **Firebase DB** - Type-safe database access
- **Google Gemini 1.5 Flash** - AI-powered multimodal analysis
- **CORS** + **.env** - Security and configuration

---

## Project Structure

```
Civic-Saathi/
├── client/src/
│   ├── components/
│   │   ├── admin/          # Admin dashboard components
│   │   ├── feed/           # Issue feed and creation
│   │   ├── layout/         # Header, sidebar
│   │   └── ui/             # Shadcn/UI components
│   ├── hooks/              # Custom React hooks (auth, mobile)
│   ├── lib/                # Utilities (firebase, gemini, geocode)
│   ├── pages/              # Page components
│   └── App.tsx             # Main app component
├── server/
│   ├── services/           # Gemini AI integration
│   ├── routes.ts           # API endpoints
│   └── storage.ts          # Database access layer
├── shared/
│   ├── categories.ts       # 8 category constants
│   └── schema.ts           # Database schema & types
└── package.json
```

---

### Installation

1. **Clone and Install**
```bash
git clone https://github.com/yourusername/Civic-Saathi.git
cd Civic-Saathi
npm install
```

2. **Configure Environment**

Create `.env` file in root:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

3. **Run Application**
```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### Demo Login
- **Admin**: `username: admin`, `password: password`
- **User**: `username: user`, `password: password`

---

## 🤖 AI Integration

### Google Gemini 1.5 Flash

**Capabilities:**
- Multimodal analysis (text + images)
- Automatic categorization into 8 predefined categories
- Severity assessment (critical, major, moderate, minor)
- Confidence scoring and reasoning

**8 Category System:**
1. **Roads & Transport** - Potholes, traffic signals, road damage
2. **Water Supply & Drainage** - Leaks, flooding, pipe issues
3. **Sanitation & Waste Management** - Garbage, litter, waste bins
4. **Electricity & Lighting** - Streetlights, power outages, wiring
5. **Public Safety & Hazards** - Dangerous conditions, security
6. **Buildings & Infrastructure** - Structural damage, facilities
7. **Environment & Pollution** - Air quality, noise, green spaces
8. **Miscellaneous** - Other civic issues

**Fallback:** If AI fails, keyword-based analysis provides basic categorization.

---

## 📖 User Guide

### Creating a Report
1. Login and click **"Report Issue"**
2. Fill in title, description (or use voice input)
3. Select category or let AI suggest
4. Add location (address, GPS, or map)
5. Upload images (AI analyzes them)
6. Click **"Analyze with AI"** for automatic categorization
7. Review and **"Submit Report"**

### Tracking Reports
- Navigate to **"My Reports"** to view all your submissions
- Click any issue to see status, progress, comments, and upvotes

### Using the Map
- Click **"Map"** icon to view all issues on interactive map
- Click pins for issue details
- Use heatmap to identify problem areas

### Admin Dashboard
- View statistics: total issues, status breakdown, severity distribution
- Manage issues: update status, assign technicians, track progress
- Manage technicians: add specialists, update availability

---
