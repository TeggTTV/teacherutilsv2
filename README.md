# 🎓 Compyy. - Interactive Educational Games Platform

A modern, smart board-optimized platform for creating and playing educational games, starting with Jeopardy-style quizzes.

## ✨ Features

### 🎮 **Game Creation & Play**

-   **Jeopardy Game Creator**: Build custom Jeopardy games with 1-6 categories
-   **Smart Board Optimized**: Touch-friendly interface perfect for classroom smart boards
-   **Team Management**: Support for 1-6 teams with customizable names and scoring
-   **Responsive Design**: Works on desktop, tablet, and smart board displays

### 🎨 **Advanced Styling System**

-   **Multiple Themes**: Clean White, Professional Blue, Modern Dark, Colorful Gradient
-   **Typography Options**: Multiple font families and styles
-   **Animation Controls**: Customizable hover and interaction effects
-   **Real-time Preview**: See changes instantly while designing

### 👤 **User Management**

-   **Secure Authentication**: JWT-based auth with bcrypt password hashing
-   **User Profiles**: Teacher information including school, grade, and subject
-   **Game Library**: Personal dashboard to manage created games

## 🚀 Quick Start

### Prerequisites

-   Node.js 18+
-   MongoDB database (local or MongoDB Atlas)
-   Yarn package manager

### Installation

1. **Clone and install dependencies**

    ```bash
    git clone <repository-url>
    cd compyy
    yarn install
    ```

2. **Set up environment variables**

    ```bash
    cp .env.example .env
    # Edit .env with your MongoDB connection string and secrets
    ```

3. **Initialize the database**

    ```bash
    npx prisma generate
    npx prisma db push
    ```

4. **Start the development server**

    ```bash
    yarn dev
    ```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## 🛠 Tech Stack

-   **Framework**: Next.js 15 with TypeScript
-   **Styling**: Tailwind CSS with Framer Motion animations
-   **Database**: MongoDB with Prisma ORM
-   **Authentication**: Custom JWT implementation
-   **UI**: Responsive design optimized for smart boards

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── create/            # Game creation pages
│   ├── play/              # Game playing interface
│   └── dashboard/         # User dashboard
├── components/            # Reusable UI components
├── contexts/              # React contexts (Auth, etc.)
├── hooks/                 # Custom React hooks
└── lib/                   # Utilities and services
```

## 🎯 Usage

### Creating a Game

1. **Sign up/Login** to access the dashboard
2. **Click "Create New Game"** → "Jeopardy"
3. **Add categories and questions** using the visual editor
4. **Customize styling** with the theme system (optional)
5. **Save your game** to the library

### Playing a Game

1. **Select a game** from your dashboard
2. **Set up teams** with custom names
3. **Start playing** on any device or smart board
4. **Track scores** automatically as teams answer questions

### Smart Board Tips

-   **Touch-friendly interface** with large buttons
-   **Zero-gap layout** for seamless board interaction
-   **Fullscreen mode** hides browser chrome
-   **Team scoring** visible at all times

## 🔧 Configuration

### Environment Variables

```bash
DATABASE_URL="mongodb://..."           # MongoDB connection
NEXTAUTH_SECRET="your-secret-here"     # JWT signing secret
NEXTAUTH_URL="http://localhost:3000"   # App URL
```

### Database Schema

The app uses MongoDB with Prisma ORM. Key models:

-   **User**: Teacher accounts with profile information
-   **Game**: Jeopardy games with categories and questions
-   **GameType**: Enum supporting JEOPARDY, QUIZ, WORD_GAME

## 🚧 Development Status

### ✅ Completed

-   Core Jeopardy game creation and playing
-   Smart board optimization
-   User authentication and profiles
-   Advanced styling system
-   Team management and scoring

### 🔄 In Progress

-   Additional game types (Quiz, Word Games)
-   Media support (images, audio)
-   Game sharing and public library

### 📋 Planned

-   Real-time analytics dashboard
-   Student progress tracking
-   Curriculum standards alignment
-   AI-powered question generation

## 🤝 Contributing

This is an educational project. Contributions welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

Educational use - see license file for details.

---

**Built for educators, by educators** 🍎
