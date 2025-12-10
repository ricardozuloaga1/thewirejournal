# The Wire Journal - React Frontend

React + TypeScript + Vite frontend for The Wire Journal.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create `.env` file:

```bash
cp .env.example .env
```

Make sure it contains:
```
VITE_API_URL=http://localhost:5000/api
```

### 3. Run Development Server

```bash
npm run dev
```

App runs on http://localhost:5173

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable components
│   ├── pages/            # Page components
│   ├── context/          # React context (Auth)
│   ├── services/         # API services
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── public/               # Static assets
└── index.html           # HTML template
```

## Backend Required

This frontend requires the Flask backend to be running on http://localhost:5000

See `../backend/README.md` for backend setup.

