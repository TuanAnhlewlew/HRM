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
│   │   ├── types/
│   │   │   └── employee.ts              # Shared interfaces: PTOBalance, PTORequest, OTRequest
│   │   ├── components/
│   │   │   ├── form/                    # Shared form components (TextInput, SelectInput, etc.)
│   │   │   ├── employees/               # Admin-side: employee management
│   │   │   │   ├── EmployeeManagementView.tsx   # Container for employee CRUD
│   │   │   │   ├── EmployeeTable.tsx            # Sortable employee table with actions
│   │   │   │   ├── EmployeeDetailModal.tsx      # Employee detail + direct reports
│   │   │   │   └── EmployeeFormModal.tsx        # Create/edit employee form
│   │   │   └── employee/                # Employee-side: request management
│   │   │       ├── EmployeeDashboard.tsx        # PTO/OT summary, calendar, popup
│   │   │       ├── PersonalRequests.tsx         # PTO/OT toggle + request tables
│   │   │       ├── EmployeesRequests.tsx        # Team requests + approve/reject
│   │   │       ├── PTORequestForm.tsx           # New PTO request modal
│   │   │       └── OTRequestForm.tsx            # New OT request modal
│   │   ├── pages/
│   │   │   ├── Login.tsx              # Login page with admin/employee user type
│   │   │   ├── Home.tsx               # Admin view (dashboard + employee management)
│   │   │   └── EmployeeHome.tsx       # Employee view (dashboard, personal, team requests)
│   │   ├── App.tsx                     # Routes: /, /home, /employee/home
│   │   └── main.tsx                    # Entry point
│   ├── public/
│   ├── package.json                    # npm deps (react, react-router-dom, date-fns)
│   └── index.html
│
├── CLAUDE.md
├── .gitignore
└── README.md
```

### Overall Project Structure
- Root: `/c/Users/anhcu/Documents/HRM`
- Frontend: `./frontend/` (React app, run commands here)
- Backend: `./backend/` (Python Flask API, run commands here)

## Working Directory Rules
- Always run `npm install` / `npm run dev` from `./frontend/`
- Always execute command of backend from `./backend/`
- Never run build commands from the project root unless specified
- When in doubt, confirm the target directory before executing

## Building Rules
- Before run a server (both backend and frontend), make sure the running port process terminated. To find PID with port number, use `netstat -ano | findstr :<Port number>`. If there is process running on that port, Then terminate the process using `taskkill /PID <PID> /F`. Then it's good to run the server.

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
5. For each component, its own CSS style should be in separate style

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

## Completed Frontend Features

### Authentication & Routing
- Login page with user type selector (admin vs employee)
- Route-by-type: admin → `/home`, employee → `/employee/home`
- Logout button on both admin and employee views (clears localStorage, redirects to `/`)
- User info stored in localStorage as `loggedInUser`

### Admin View (`/home`)
- Sidebar navigation: Dashboard | Employees
- Dashboard: summary tiles (total employees, pending PTO, pending OT), recent activity, quick actions
- Employee management with full CRUD (create, view, edit, delete):
  - Sortable employee table with name, email, position, department, hire date
  - Employee detail modal showing personal info, employment details, leave/OT balance, request history
  - Employee form modal with validation (regex email, required fields)
- Management chain UI:
  - Employee can have a manager AND manage other employees (hierarchical)
  - Employee detail modal shows manager name + "Managed Employees" section with direct reports
  - Create/edit form "Reports To" dropdown excludes self, shows manager's position for disambiguation
  - Clicking a direct report navigates to their detail view (chain navigation)
- Mock data: 5 sample employees with management hierarchy (John Doe manages Sarah Wilson & David Brown; Jane Smith manages Mike Johnson)

### Employee View (`/employee/home`)
- Sidebar navigation: Dashboard | Personal Requests | Employees' Requests
- **Dashboard tab**:
  - 4 summary tiles: Total Annual PTO (15), Remaining PTO (11), Taken PTO (4), OT Hours (12)
  - Submit PTO Request / Submit OT Request action buttons (open modals)
  - Month calendar with prev/next navigation
  - Blue circular markers for PTO days, amber for OT days
  - Clickable calendar cells → popup showing PTO/OT request details (type, dates, days, reason, status)
- **Personal Requests tab**:
  - PTO/OT pill toggle switch
  - PTO requests table: Type, Start, End, Days, Reason, Status badges (green/yellow/red)
  - OT requests table: Date, Hours, Reason, Status
  - "New PTO/OT Request" buttons → modal forms with validation
  - PTO form: auto-computed weekday count (excludes weekends), date range validation
  - OT form: hours validation (0.5–16), required fields
- **Employees' Requests tab (manager view)**:
  - PTO/OT pill toggle switch
  - Tables of direct reports' pending requests with employee name
  - Approve (green ✓) / Reject (red ✕) buttons — disabled after action taken
  - Status updates reflected immediately in local state

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
- All data is currently mock data — backend API integration pending
- Dependencies added: `date-fns` for calendar and date manipulation
- Admin view is in `Home.tsx`; employee view is in `EmployeeHome.tsx`
- Shared components split: `components/employees/` (admin) and `components/employee/` (user-facing)