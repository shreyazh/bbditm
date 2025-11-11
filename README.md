# BBDITM AI Resume Reviewer and Interview Critique Simulator

A modern, responsive website for Babu Banarasi Das Institute of Technology & Management (BBDITM) built with Next.js, featuring an AI-powered chatbot for resume analysis and job description matching.

## 🚀 Features

### Website Sections
- **Hero Section**: Eye-catching landing section with institution branding
- **About Section**: Information about the institution
- **Programs**: Detailed information about available programs:
  - B.Tech in Computer Science
  - B.Tech in Information Technology
  - MBA in Technology Management
  - Lateral Entry B.Tech in Computer Science
- **Admissions**: Admissions information and procedures
- **Contact**: Contact information and footer

### AI-Powered Chatbot
- **Resume Analysis**: Upload resumes (PDF, DOCX) for analysis
- **Job Description Matching**: Compare resumes against job descriptions
- **ATS Scoring**: Get ATS (Applicant Tracking System) compatibility scores
- **Detailed Feedback**: Receive actionable feedback on resume improvements
- **Skills Assessment**: Analyze technical skills and experience relevance

## 🛠️ Tech Stack

### Core
- **Next.js 16.0.0** - React framework with App Router
- **React 19.2.0** - UI library
- **TypeScript 5** - Type-safe JavaScript
- **Tailwind CSS 4.1.9** - Utility-first CSS framework

### UI Components
- **Radix UI** - Headless UI component library
- **shadcn/ui** - Re-usable component library built on Radix UI
- **Lucide React** - Icon library
- **next-themes** - Dark/light theme support

### AI & Analytics
- **Google Gemini AI** - AI-powered chatbot and resume analysis
- **Vercel Analytics** - Website analytics

### Additional Libraries
- **mammoth** - DOCX file parsing
- **react-hook-form** - Form handling
- **zod** - Schema validation
- **date-fns** - Date utility library

## 📋 Prerequisites

- Node.js 18+ (recommended: Node.js 22+)
- npm or yarn package manager
- Google Gemini API key

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bbditm
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
bbditm/
├── app/                    # Next.js App Router
│   ├── api/
│   │   └── chat/          # Chat API endpoint
│   ├── admissions/        # Admissions page
│   ├── programs/          # Programs page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── about.tsx          # About section
│   ├── admissions.tsx     # Admissions component
│   ├── chatbot.tsx        # AI chatbot component
│   ├── footer.tsx         # Footer component
│   ├── header.tsx         # Header/Navigation
│   ├── hero.tsx           # Hero section
│   ├── programs.tsx       # Programs section
│   └── theme-provider.tsx # Theme provider
├── lib/                   # Utility functions
│   └── utils.ts           # Helper functions
├── public/                # Static assets
│   ├── bbd_logo.png       # Institution logo
│   ├── favicon.png        # Site favicon
│   └── ...                # Other assets
├── styles/                # Additional styles
└── package.json           # Dependencies and scripts
```

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔌 API Endpoints

### `/api/chat`
POST endpoint for chatbot interactions and resume analysis.

**Request Body:**
```json
{
  "message": "string",
  "file": "base64_encoded_file",
  "fileName": "string",
  "fileType": "application/pdf" | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
}
```

**Response:**
```json
{
  "response": "string",
  "ats_score": {
    "score": 0-100,
    "explanation": "string"
  },
  "feedback": {
    "positive": "string",
    "critical": "string"
  },
  "actionable_items": [...]
}
```

## 🎨 Customization

### Themes
The application supports dark and light themes via `next-themes`. Theme configuration can be found in `components/theme-provider.tsx`.

### Styling
- Global styles are in `app/globals.css`
- Tailwind configuration uses the default setup
- Component styles use Tailwind utility classes

### Content
- Update institution information in respective component files
- Modify program details in `components/programs.tsx`
- Update metadata in `app/layout.tsx`

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables (GEMINI_API_KEY)
4. Deploy

### Other Platforms
The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## 🔒 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key for chatbot functionality | Yes |

## 📝 License

This project is private and proprietary.

## 👥 Contributors

- Generator: shreyazh
- Contributor: ahmersiddiqui9889

## 🤝 Support

For issues or questions, please contact the development team.

## 📄 Notes

- The application uses ESLint and TypeScript, but build errors are ignored during builds (configured in `next.config.mjs`)
- Images are unoptimized in the current configuration
- The chatbot supports PDF and DOCX file formats for resume analysis

---

**Built with ❤️ for BBDITM**