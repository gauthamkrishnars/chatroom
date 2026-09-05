# PulseChat — Real Time Chat Application

A high contrast, real time community chat room application built with React, Vite, Tailwind CSS, and Firebase (Authentication & Cloud Firestore).

---

## Features

- **Dual Authentication**: Google Sign In via OAuth popup and email/password signup and login.
- **Real Time Firestore Sync**: Messages stream instantly with `onSnapshot` subscriptions.
- **Multi Channel Architecture**: Switch between public rooms or launch new chat rooms with custom topics, icons, and descriptions.
- **Live Reactions**: Quick emoji reactions on all incoming and outgoing messages.
- **Smart Timestamp & Date Grouping**: Formats message timestamps and groups chats by day with clean dividers.
- **Resilient Fallback Mode**: If Firebase credentials are not yet added to `.env`, PulseChat automatically activates a local multi tab broadcast engine so you can test all features immediately.
- **Zero Dead Links & Legal Modals**: Dedicated popup modals for legally sound Terms of Service and Privacy Policy.
- **Technical SEO**: Full Open Graph meta tags, Twitter card tags, structured JSON-LD data, and responsive layout.

---

## Directory Structure

```
chatroom/
├── .env.example                # Example environment variables template
├── .env                        # Local environment variables (fill in your Firebase keys)
├── firestore.rules             # Production security rules for Firestore
├── index.html                  # HTML shell with complete SEO, Open Graph & JSON-LD
├── package.json                # Dependencies and project scripts
├── vite.config.js              # Vite configuration with React and Tailwind
├── public/
│   └── favicon.svg             # Modern vector favicon
└── src/
    ├── main.jsx                # React root bootstrap
    ├── App.jsx                 # App layout orchestrator
    ├── App.css                 # Custom keyframe animations and glows
    ├── index.css               # Tailwind CSS imports and scrollbar styles
    ├── context/
    │   ├── authContextDef.js   # React context definition
    │   ├── AuthContext.jsx     # Auth state provider and dispatchers
    │   └── useAuth.js          # Custom authentication hook
    ├── firebase/
    │   ├── config.js           # Firebase app, auth, and firestore initialization
    │   ├── authService.js      # Google OAuth and email auth handlers
    │   └── chatService.js      # Firestore rooms and message subscriptions
    ├── components/
    │   ├── Navbar.jsx          # Top header with room breadcrumb and user menu
    │   ├── Sidebar.jsx         # Rooms list, instant search, and mobile drawer
    │   ├── ChatArea.jsx        # Room header, message stream, and input container
    │   ├── MessageList.jsx     # Date group dividers and skeleton loading states
    │   ├── MessageItem.jsx     # Message bubble, avatars, and reaction badges
    │   ├── MessageInput.jsx    # Auto expanding text area, emoji bar, and submit
    │   ├── CreateRoomModal.jsx # Room creator with category and icon selection
    │   ├── AuthModal.jsx       # Google and email/password authentication modal
    │   ├── LegalModal.jsx      # Realistic Terms of Service & Privacy Policy popups
    │   └── Footer.jsx          # Live status indicator and legal modal triggers
    └── utils/
        └── helpers.js          # Timestamp formatting, avatar gradients, and initials
```

---

## Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Firebase (Optional for instant demo)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your Firebase project credentials:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

> **Note**: If you run the project without adding keys, PulseChat runs in instant **Demo Mode** using a built in multi tab synchronization engine. You can open two browser tabs side by side to experience instant real time messaging right away!

### 3. Start Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

---

## Firebase Setup Walkthrough

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a project.
2. In **Build > Authentication**:
   - Enable **Google** provider under Sign-in method.
   - Enable **Email/Password** provider.
3. In **Build > Firestore Database**:
   - Create a database in production mode.
   - Deploy the rules provided in `firestore.rules`.
4. In **Project Settings > General > Your Apps**:
   - Click the Web icon `</>` to register a web app.
   - Copy the configuration object into your `.env` file.
