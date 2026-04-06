import enum
import uuid
from . import db
from datetime import date, datetime, timedelta
import bcrypt
import jwt
from flask import current_app

class LeaveType(enum.Enum):
    Annual = 'Annual'
    Maternity = 'Maternity'
    Paternity = 'Paternity'
    Sick = 'Sick'
    Unpaid = 'Unpaid'


# Base model for HRM application - to be extended with actual models
class BaseModel(db.Model):
    __abstract__ = True
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted = db.Column(db.Boolean, default=False, nullable=False)

    def delete(self):
        """Soft delete: mark as deleted and commit."""
        self.deleted = True
        db.session.add(self)
        db.session.commit()

class Department(BaseModel):
    __tablename__ = 'department'

    name = db.Column(db.String(64), unique=True, nullable=False)
    description = db.Column(db.String(200))

    def __repr__(self):
        return f'<Department {self.name}>'

class Admin(BaseModel):
    __tablename__ = 'admin'

    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    is_active = db.Column(db.Boolean, default=True)

    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, password):
        """Check if provided password matches hash"""
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    def generate_token(self):
        """Generate JWT token"""
        payload = {
            'exp': datetime.utcnow() + timedelta(hours=24),
            'iat': datetime.utcnow(),
            'sub': self.id,
            'type': 'admin',
            'username': self.username
        }
        return jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')

    def __repr__(self):
        return f'<Admin {self.username}>'

class Employee(BaseModel):
    __tablename__ = 'employee'

    first_name = db.Column(db.String(64), nullable=False)
    last_name = db.Column(db.String(64), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone_number = db.Column(db.String(20))
    hire_date = db.Column(db.DateTime, default=datetime.utcnow)
    job_title = db.Column(db.String(64))
    department_id = db.Column(db.String(36), db.ForeignKey('department.id'))
    salary = db.Column(db.Float)
    gender = db.Column(db.Enum('Male', 'Female', name='gender_enum'), nullable=False)

    department = db.relationship('Department', backref='employees', lazy='joined')
    password_hash = db.Column(db.String(255))
    manager_id = db.Column(db.String(36), db.ForeignKey('employee.id'), nullable=True)

    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, password):
        """Check if provided password matches hash"""
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    def generate_token(self):
        """Generate JWT token"""
        payload = {
            'exp': datetime.utcnow() + timedelta(hours=24),
            'iat': datetime.utcnow(),
            'sub': self.id,
            'type': 'employee',
            'email': self.email
        }
        return jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')

    def __repr__(self):
        return f'<Employee {self.first_name} {self.last_name}>'


# Configure self-referential relationship after class definition
# This avoids the 'id' builtin collision in remote_side
Employee.manager = db.relationship(
    'Employee',
    remote_side=[Employee.id],
    backref=db.backref('direct_reports', lazy='select'),
    foreign_keys=[Employee.manager_id],
    lazy='joined',
)


class PTORequest(BaseModel):
    __tablename__ = 'pto_request'

    employee_id = db.Column(db.String(36), db.ForeignKey('employee.id'), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    days = db.Column(db.Integer, nullable=False)
    reason = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='Pending', nullable=False)  # Pending, Approved, Rejected
    request_type = db.Column(db.Enum(LeaveType), nullable=False)  # Annual, Maternity, Paternity, Sick, Unpaid

    # Relationships
    employee = db.relationship('Employee', backref='pto_requests')

    def __repr__(self):
        return f'<PTORequest {self.employee_id} {self.request_type} {self.status}>'


class OTRequest(BaseModel):
    __tablename__ = 'ot_request'

    employee_id = db.Column(db.String(36), db.ForeignKey('employee.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    hours = db.Column(db.Float, nullable=False)
    reason = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='Pending', nullable=False)  # Pending, Approved, Rejected

    # Relationships
    employee = db.relationship('Employee', backref='ot_requests')

    def __repr__(self):
        return f'<OTRequest {self.employee_id} {self.hours}h {self.status}>'