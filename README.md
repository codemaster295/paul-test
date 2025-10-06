# Content Publisher App

A modern content management application built with Next.js (frontend) and Express.js (backend).

## Tech Stack

### Backend
- Node.js + Express.js
- TypeScript
- SQLite Database
- JWT Authentication

### Frontend
- Next.js 14
- TypeScript
- Shadcn UI Components
- Context API for state management

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Quick Start


1. **Run the setup script**
```bash
chmod +x setup.sh
./setup.sh
```

2. **Configure environment**
- Backend environment file will be created automatically at `backend/.env`
- Update `JWT_SECRET` in `backend/.env` for production use

3. **Start the application**

Development mode (both frontend and backend):
```bash
npm run dev
```

Or run separately:
```bash
# Backend (http://localhost:5000)
npm run server

# Frontend (http://localhost:3000)
npm run client
```

## Project Structure

```
├── backend/               # Express.js backend
│   ├── src/              # Source code
│   │   ├── controllers/  # Route controllers
│   │   ├── services/    # Business logic
│   │   ├── routes/     # API routes
│   │   └── ...
│   └── dist/           # Compiled JavaScript
├── frontend/           # Next.js frontend
│   ├── src/           # Source code
│   │   ├── app/      # Next.js app router
│   │   ├── components/# React components
│   │   └── lib/      # Utilities and API
└── setup.sh          # Setup script
```

## Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run server` - Start backend only
- `npm run client` - Start frontend only
- `npm run build` - Build both frontend and backend
- `npm run test` - Run tests (when implemented)

## License

MIT License