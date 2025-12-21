# Social Content Generator

A social media content generation platform built with modern web technologies. This monorepo contains both the backend API and frontend application.

## 🏗️ Monorepo Structure

```
├── backend/          # Node.js/Express API
├── frontend/         # Next.js React app
├── shared/           # Shared types and constants
├── docker-compose.yml # PostgreSQL local setup
└── README.md         # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+  
- npm 9+  
- Docker & Docker Compose (for local PostgreSQL)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd social-content-generator
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start PostgreSQL (optional)**
   ```bash
   docker-compose up -d
   ```

5. **Run development servers**
   ```bash
   npm run dev
   ```
   
   This will start:
   - **Backend API** at http://localhost:5000
   - **Frontend** at http://localhost:3000

### Individual Services

- **Backend only**: `npm run dev:backend`
- **Frontend only**: `npm run dev:frontend`

### Build for Production

```bash
# Build all services
npm run build

# Start production server (backend only)
npm start
```

## 📁 Project Structure

### Backend (`/backend`)
- **Express.js** API with TypeScript
- PostgreSQL database integration
- Middleware system for auth, CORS, and error handling
- RESTful API structure

### Frontend (`/frontend`)
- **Next.js 14** with React TypeScript
- Tailwind CSS for styling
- App Router architecture
- UI components library

### Shared (`/shared`)
- Common type definitions
- Shared constants and utilities
- Reusable across frontend and backend

## 🔧 Configuration

- **Backend**: Port 5000, CORS enabled, body parsing
- **Frontend**: Port 3000, API URL configurable via env
- **Database**: PostgreSQL 16, connection pooling

## 🛠️ Development

```bash
# Lint all code
npm run lint

# Type check
npm run typecheck

# Database management
docker-compose up    # Start database
docker-compose down  # Stop database
```

## 🔍 API Health Check

Verify the API is running:
```bash
curl http://localhost:5000/health
```

## 📝 Tech Stack

- **Backend**: Node.js, Express, TypeScript, PostgreSQL
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Database**: PostgreSQL 16
- **Development**: Docker, npm workspaces, Turborepo-ready

## 📄 License

MIT