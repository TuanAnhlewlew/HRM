# HRM Application

A Human Resource Management web application built with Python Flask backend and React frontend.

## Overview
This application provides basic HRM functionality including:
- Employee management
- Department management
- RESTful API
- Modern React interface

## Technology Stack
- **Backend**: Python Flask, Flask-SQLAlchemy, Flask-Migrate
- **Frontend**: ReactJS, Vite
- **Database**: SQLite
- **Development**: Concurrent development setup

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+ and npm
- Git

### Backend Setup
```bash
# Clone repository
git clone <repository-url>
cd HRM

# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Unix/MacOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables (create .env file)
# SECRET_KEY=your-secret-key
# DATABASE_URL=sqlite:///app.db

# Initialize database
flask db init
flask db migrate
flask db upgrade

# Run the server
flask run
```

### Frontend Setup
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

## Development
For concurrent development:
1. Start backend: `cd backend && flask run`
2. Start frontend: `cd frontend && npm run dev`

The frontend will be available at http://localhost:5173
The backend API will be available at http://localhost:5000

## API Endpoints
- `GET /health` - Health check
- `GET /departments` - List all departments
- `POST /departments` - Create new department
- `GET /employees` - List all employees
- `POST /employees` - Create new employee

## Project Structure
See CLAUDE.md for detailed project structure and development guidelines.

## License
MIT