# HRM Application

A Human Resource Management web application built with Python Flask backend and React frontend.

## Overview
This application provides basic HRM functionality including:
- Employee management
- PTO/OT management

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

### Clone repository
```bash
git clone https://github.com/TuanAnhlewlew/HRM.git
cd HRM
```

### Backend Setup
```bash
# run backend setup
./backend/setup

# Set up environment variables (create .env file)
# SECRET_KEY=your-secret-key

# seed database for first database initialization
python ./backend/seed.py

# start backend
./backend/start
```

#### Admin account
```
username: admin
password: admin123
```
#### Employee account
```
username: <employee's email>
password: password123
```
NOTE: there is a change password after login


### Frontend Setup
```bash
# run frontend setup
./frontend/setup

# start frontend
./frontend/start
```

The frontend will be available at http://localhost:5173

The backend API will be available at http://localhost:5000