<div align="center">

  <img src="public/macbook.png" alt="macOS Portfolio Logo" width="100" />

  #  macOS Web Portfolio

  <p align="center">
    <strong>An interactive, macOS-inspired desktop web portfolio designed to deliver an authentic Mac operating system experience directly in the browser.</strong>
  </p>

  <p align="center">
    <a href="https://github.com/jigyanshsahu/MacOS-portfolio"><img src="https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black" alt="React 19" /></a>
    <a href="https://vite.dev/"><img src="https://img.shields.io/badge/Vite-7-646CFF?style=flat&logo=vite&logoColor=white" alt="Vite" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
    <a href="https://gsap.com/"><img src="https://img.shields.io/badge/GSAP-Animations-88CE02?style=flat&logo=greensock&logoColor=white" alt="GSAP" /></a>
    <a href="https://github.com/pmndrs/zustand"><img src="https://img.shields.io/badge/State-Zustand-orange?style=flat" alt="Zustand" /></a>
    <a href="https://github.com/jigyanshsahu/MacOS-portfolio/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat" alt="License" /></a>
  </p>

  <p align="center">
    <a href="#-features">Features</a> •
    <a href="#-apps-included">Apps Included</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-configuration--customization">Customization</a> •
    <a href="#-project-structure">Structure</a> •
    <a href="#-author">Author</a>
  </p>

</div>

---

## 🖥️ Overview

**macOS Web Portfolio** is a developer portfolio designed with attention to detail to replicate Apple's macOS desktop interface. It features realistic window management with draggable physics, a responsive macOS dock, an authentic top menu bar with live time and ambient audio player, and native-feeling desktop applications highlighting projects, tech skills, articles, photos, resume, and contact details.

---

## ✨ Features

- 🍏 **Authentic macOS Desktop UI**:
  - **Top Menu Bar**: Displays live date & time, system status icons, quick navigation links, and integrated background music controls.
  - **Interactive Dock**: Smooth magnification/bounce hover animations, active dot indicators, and quick-launch shortcuts.
  - **Desktop Typography**: Interactive kinetic typography powered by GSAP with variable font-weight distortion responding to cursor movement.
  - **Desktop Shortcuts**: Double-click or tap desktop folder shortcuts to jump straight to featured projects.

- 🪟 **Advanced Window Management**:
  - **GSAP Draggable Integration**: Smooth, lag-free drag-and-drop support for every window with automatic boundary detection.
  - **Dynamic Z-Index Stacking**: Click or drag any window to bring it to the foreground, managed with **Zustand**.
  - **macOS Window Controls**: Functional traffic light buttons (close, minimize, maximize) with hover effects.

- 🎵 **Ambient Background Music Player**:
  - Seamlessly embedded ambient audio powered by the **YouTube IFrame API**.
  - Toggle audio playback on/off directly from the menu bar with animated audio wave status.

- 📱 **Screen Adaptive Layout**:
  - Optimized for desktop and tablet screens, featuring an adaptive advisory overlay for compact mobile viewports.

---

## 🚀 Apps Included

| App | Icon | Description |
| :--- | :---: | :--- |
| **Finder** | 📁 | Browse folders across **Work (Projects)**, **About Me**, **Resume**, and **Trash**. Open project specs (`.txt`), screenshots (`.png`), and live demos (`.com`). |
| **Terminal** | 💻 | macOS-style command-line interface highlighting technical skills categorized by Frontend, Mobile, Styling, Backend, Database, and Dev Tools. |
| **Safari** | 🧭 | Browser window showcasing curated technical blogs, articles, and development tutorials. |
| **Photos** | 🖼️ | Mac Photos gallery application featuring categorized photo albums and previews. |
| **Resume** | 📄 | Built-in PDF reader powered by `react-pdf` to view and download the developer's resume in-app. |
| **Contact** | ✉️ | Interactive contact card displaying avatar, direct messaging details, and links to GitHub, LinkedIn, X (Twitter), and YouTube. |
| **TextEdit & Preview** | 📝 | Modal file viewers for inspecting markdown/text notes and previewing project screenshots. |

---

## 🛠️ Tech Stack

### Core Framework & Build
- **[React 19](https://react.dev/)**: Modern UI development with hooks and concurrent features.
- **[Vite 7](https://vite.dev/)**: Ultra-fast next-generation frontend tooling and HMR.

### Styling & Design
- **[Tailwind CSS v4](https://tailwindcss.com/)**: Cutting-edge utility-first CSS framework.
- **Vanilla CSS**: Custom glassmorphism, blur filters, and macOS-style shadows.
- **[Lucide React](https://lucide.dev/)**: Consistent, lightweight SVG icon system.

### Animation & Physics
- **[GSAP (GreenSock Animation Platform)](https://gsap.com/)**: Production-grade animation library.
- **[GSAP Draggable Plugin](https://gsap.com/docs/v3/Plugins/Draggable/)**: Realistic dragging physics and window manipulation.
- **[@gsap/react](https://www.npmjs.com/package/@gsap/react)**: React-safe hook integration for GSAP animations.

### State & Utilities
- **[Zustand](https://github.com/pmndrs/zustand)**: Minimalist, predictable global state management for window coordinates, z-indices, and active folders.
- **[Immer](https://immerjs.github.io/immer/)**: Immutable state updates.
- **[React-PDF](https://github.com/wojtekcut/react-pdf)**: In-browser PDF document rendering.
- **[Day.js](https://day.js.org/)**: Lightweight date and time formatting for the status bar.

---

## 📂 Project Structure

```text
MacOS-portfolio/
├── public/
│   ├── icons/            # App and system icons (wifi, battery, finder, etc.)
│   ├── images/           # Wallpapers, project screenshots, gallery photos
│   └── files/            # Downloadable assets (e.g. resume PDF)
├── src/
│   ├── assets/           # Bundled styles and static assets
│   ├── components/       # Reusable macOS UI components
│   │   ├── Dock.jsx             # macOS bottom dock
│   │   ├── Navbar.jsx           # Top system menu bar
│   │   ├── Welcome.jsx          # Desktop greeting with kinetic text hover
│   │   ├── WindowControls.jsx   # Traffic light close/minimize/maximize buttons
│   │   └── MusicPlayer.jsx      # Background YouTube audio controller
│   ├── constants/
│   │   └── index.js             # Central configuration: projects, skills, socials, folders
│   ├── hoc/
│   │   └── WindowWrapper.jsx    # HOC providing GSAP Draggable and window behavior
│   ├── store/
│   │   ├── Window.js            # Zustand store for open/close state and z-index stacking
│   │   └── Location.js          # Zustand store for active Finder paths and files
│   ├── windows/                 # Applications & modal windows
│   │   ├── Finder.jsx           # File manager and project browser
│   │   ├── Terminal.jsx         # Tech stack CLI viewer
│   │   ├── Safari.jsx           # Articles and web viewer
│   │   ├── Contact.jsx          # Contact info & social links
│   │   ├── Resume.jsx           # Embedded PDF resume reader
│   │   ├── images.jsx           # Photos application
│   │   ├── text.jsx             # TextEdit modal viewer
│   │   └── Imgfile.jsx          # Image preview modal
│   ├── App.jsx                  # Main desktop shell layout
│   ├── index.css                # Tailwind configuration and global styles
│   └── main.jsx                 # Application entry point
├── package.json
└── vite.config.js
```

---

## ⚡ Getting Started

Follow these steps to run the project locally on your machine.

### Prerequisites
- **Node.js** (v18.x or higher recommended)
- **npm**, **yarn**, or **pnpm**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jigyanshsahu/MacOS-portfolio.git
   cd MacOS-portfolio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to `http://localhost:5173` (or the URL shown in your terminal) to view the portfolio.

---

## ⚙️ Configuration & Customization

All portfolio content is decoupled and configured inside **`src/constants/index.js`**:

- **Update Projects**: Modify `WORK_LOCATION.children` to add or edit project folders, descriptions, live demo links (`.com`), and preview images.
- **Update Skills**: Modify `techStack` array to add or categorize your languages, frameworks, databases, and developer tools.
- **Update Social Links & Bio**: Edit `socials` and `ABOUT_LOCATION` with your own profile links, email, avatar, and personal statement.
- **Update Background Music**: Open `src/components/MusicPlayer.jsx` and change `YOUTUBE_VIDEO_ID` to your preferred YouTube audio track ID.
- **Update Resume**: Place your PDF file in `public/files/` and update `RESUME_LOCATION` in `src/constants/index.js`.

---

## 📦 Build & Deployment

To compile the application for production:

```bash
npm run build
```

This generates an optimized production bundle inside the `dist/` directory.

To preview the production build locally:

```bash
npm run preview
```

### Deploy to Vercel / Netlify / GitHub Pages
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

---

## 👤 Author

**Jigyansh Sahu**
- **GitHub**: [@jigyanshsahu](https://github.com/jigyanshsahu)
- **LinkedIn**: [Jigyansh Sahu](https://www.linkedin.com/in/jigyansh-sahu-b39944322/)
- **X (Twitter)**: [@SahuJigyansh](https://x.com/SahuJigyansh)
- **YouTube**: [@Jigyansh-te8rc](https://www.youtube.com/@Jigyansh-te8rc)
- **Email**: [jigyanshsahu8@gmail.com](mailto:jigyanshsahu8@gmail.com)

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
