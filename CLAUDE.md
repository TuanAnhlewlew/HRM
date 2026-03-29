# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is an HRM (Human Resource Management) web application with:
- Backend: Python Flask REST API
- Frontend: ReactJS with Vite
- Database: SQLite

## Development Commands

### Backend (Flask)
```bash
# Navigate to backend directory
cd backend

# Create virtual environment (if not already created)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Unix/MacOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations (if using Flask-Migrate)
flask db init  # First time only
flask db migrate  # Generate migration
flask db upgrade  # Apply migration

# Run development server
flask run  # or python run.py

# The API will be available at http://localhost:5000
```

### Frontend (React/Vite)
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# The application will be available at http://localhost:5173
```

### Concurrent Development
For development with both frontend and backend running:
1. Start backend in one terminal: `cd backend && flask run`
2. Start frontend in another terminal: `cd frontend && npm run dev`

The frontend is configured to proxy API requests to the backend (configured in vite.config.js).

## Project Structure
```
HRM/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── models.py     # Database models (BaseModel defined)
│   │   ├── routes.py     # API endpoints (health check only)
│   │   └── ...
│   ├── config.py         # Configuration
│   ├── run.py            # Application entry point
│   ├── requirements.txt  # Python dependencies
│   └── migrations/       # Database migrations
│
├── frontend/
│   ├── src/
│   │   ├── components/   # React components (to be created)
│   │   ├── pages/        # Page components (to be created)
│   │   ├── App.tsx       # Main App component
│   │   └── main.tsx      # Entry point
│   ├── public/           # Static assets
│   ├── package.json      # npm dependencies & scripts
│   ├── vite.config.js    # Vite configuration
│   └── index.html        # HTML template
│
├── CLAUDE.md             # This file
├── .gitignore            # Git ignore rules
└── README.md             # Project documentation
```

## Common Development Tasks

### Adding New API Endpoints
1. Edit `backend/app/routes.py` to add new routes
2. Define request handlers and database operations
3. Test with curl, Postman, or frontend

### Adding Database Models
1. Edit `backend/app/models.py` to add new models
2. Create and run migrations: `flask db migrate` and `flask db upgrade`
3. Update routes to use new models

### Adding Frontend Components
1. Create components in `frontend/src/components/`
2. Create pages in `frontend/src/pages/`
3. Add routes in `frontend/src/App.jsx` if needed
4. Import and use components as needed

### Environment Variables
Create a `.env` file in the backend directory:
```
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///app.db  # or other database URL
```

## Testing
- Backend: Use Python's unittest framework or pytest
- Frontend: Use React Testing Library or Vitest
- Run tests as needed based on project requirements

## Verification
✓ Backend server running and responding to /health endpoint
✓ Frontend dev server compiled and serving basic UI
✓ Frontend successfully proxies API requests to backend
✓ Both servers running concurrently in development
✓ Clear documentation of how to start development environment
✓ Basic project structure is logical and extensible for HRM features

## Notes
- The backend uses CORS to allow frontend requests during development
- Frontend is configured to proxy `/api` requests to backend for seamless development
- Both servers support hot reloading during development
- Initial database migrations have been applied (employees and departments tables created)