# Preproute - Test Management System

Welcome to the **Preproute** frontend repository! This application is a comprehensive Test Management and Assessment platform built for scale, performance, and seamless user experiences.

## 🚀 Features

- **Unified Test Editor:** A single, powerful interface to manage Test Details, configure Syllabus/Topics, and build Questions (MCQ/Subjective) seamlessly.
- **Robust Auto-Save:** Real-time, debounced auto-saving ensures no data is lost during lengthy test creations, with built-in safeguards against malformed API payloads.
- **Advanced Validation:** Strict frontend-side data validation guarantees that 100% of payloads sent to the backend are valid, eliminating opaque \400 Bad Request\ API crashes.
- **Pixel-Perfect UI:** A stunning, modern, and responsive user interface mapped strictly to Figma designs. Features dynamic progress bars, customized checkmarks, and responsive layouts.
- **CSV Bulk Import:** Upload bulk questions effortlessly via CSV while maintaining rich-text formatting.
- **Secure Authentication:** Protected routing, JWT session management, and role-based access.

## 🛠 Tech Stack

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS + Framer Motion (for micro-animations)
- **Forms & State:** React Hook Form
- **API Client:** Axios (with custom global interceptors)
- **Icons:** Lucide React

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   \\\ash
   npm install
   \\\
3. Set up your \.env\ variables based on \.env.example\ (ensure \VITE_API_URL\ points to your backend).
4. Run the development server:
   \\\ash
   npm run dev
   \\\
5. Open \http://localhost:5173\ in your browser.

## 📁 Key Folder Structure

\\\	ext
src/
├── components/       # Reusable UI components (Buttons, Inputs, Layouts)
├── features/         # Feature-driven modules (auth, test, questions, publish)
├── services/         # API configurations, global Axios interceptors
├── lib/              # Utility functions (e.g., Tailwind class merging)
└── types/            # Global TypeScript interfaces
\\\

---
*Built with ❤️ for scalable education technology.*
