# TomatodoAI

TomatodoAI is a smart Pomodoro timer and task management application designed to help you stay focused and organized. It integrates an AI chat assistant to help you plan your tasks and manage your schedule effectively.

## ✨ Features

- **Pomodoro Timer**: Customizable timer with Focus (25m), Short Break (5m), and Long Break (15m) modes.
- **Task Management**: Create, edit, and track tasks with estimated vs. actual Pomodoro counts.
- **AI Assistant**: Built-in chat interface powered by Google GenAI to help you brainstorm tasks and organize your workflow.
- **Responsive Design**: Works seamlessly on desktop and mobile devices.

## 🎨 Design System

The application features a **"Claude-inspired"** aesthetic, utilizing a **Morandi color palette** and elegant typography to create a calm, focused environment.

- **Typography**: `Playfair Display` (Serif) for headings, `Inter` (Sans-serif) for UI.
- **Colors**: Warm cream backgrounds with muted Terra (Focus), Sage (Short Break), and Dusty Blue (Long Break) accents.

👉 See [DESIGN.md](./DESIGN.md) for the full design specifications.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **AI**: Google GenAI SDK
- **Icons**: Font Awesome

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- A Google Gemini API Key

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   Set your `GEMINI_API_KEY` in `.env.local`:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Run Locally:**
   ```bash
   npm run dev
   ```

4. **Build for Production:**
   ```bash
   npm run build
   ```
