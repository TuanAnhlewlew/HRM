from flask import Blueprint, jsonify, request, current_app
from . import db
from .models import Department, Employee, Admin, PTORequest, OTRequest, LeaveType
import jwt
from datetime import date, datetime, timedelta
from functools import wraps

bp = Blueprint('main', __name__)


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Invalid token format'}), 401
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user_type = data['type']
            current_user_id = data['sub']
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError as e:
            return jsonify({'message': 'Token is invalid', 'error': str(e)}), 401
        return f(current_user_type, current_user_id, *args, **kwargs)
    return decorated


def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        # token_required passes current_user_type as the first positional arg
        user_type = kwargs.get('current_user_type') or (args[0] if args else None)
        if user_type != 'admin':
            return jsonify({'message': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated


def manager_or_admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user_type = kwargs.get('current_user_type') or (args[0] if args else None)
        if user_type not in ('admin', 'employee'):
            return jsonify({'message': 'Access denied'}), 403
        return f(*args, **kwargs)
    return decorated


def get_current_employee(employee_id):
    """Get non-deleted employee by ID; returns None if not found."""
    return Employee.query.filter_by(id=employee_id, deleted=False).first()


@bp.route('/health')
def health():
    return jsonify({'status': 'OK'})


# --- Authenticated user info ---

@bp.route('/me', methods=['GET'])
@token_required
def get_me(current_user_type, current_user_id):
    """Return the profile of the currently logged-in user."""
    if current_user_type == 'admin':
        user = Admin.query.get_or_404(current_user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        return jsonify({
            'id': user.id,
            'type': 'admin',
            'username': user.username,
            'email': user.email,
            'is_active': user.is_active,
        })
    else:
        uid = current_user_id
        user = Employee.query.get_or_404(uid)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        return jsonify({
            'id': user.id,
            'type': 'employee',
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'phone_number': user.phone_number,
            'job_title': user.job_title,
            'department_id': user.department_id,
            'department_name': user.department.name if user.department else None,
            'hire_date': user.hire_date.isoformat() if user.hire_date else None,
            'gender': user.gender,
        })


# --- Department endpoints ---

@bp.route('/departments', methods=['GET'])
def get_departments():
    departments = Department.query.all()
    return jsonify([{
        'id': d.id,
        'name': d.name,
        'description': d.description
    } for d in departments])


@bp.route('/departments', methods=['POST'])
@token_required
@admin_required
def create_department(current_user_type, current_user_id):
    data = request.get_json()
    if not data or 'name' not in data:
        return jsonify({'error': 'Department name is required'}), 400
    department = Department(name=data['name'], description=data.get('description', ''))
    db.session.add(department)
    db.session.commit()
    return jsonify({'id': department.id, 'name': department.name, 'description': department.description}), 201


# --- Employee endpoints ---

@bp.route('/employees', methods=['GET'])
@token_required
def get_employees(current_user_type, current_user_id):
    uid = current_user_id
    if current_user_type == 'admin':
        employees = Employee.query.filter_by(deleted=False).all()
    else:
        # Employees can only see their own record + their direct reports
        employees = Employee.query.filter(
            db.or_(Employee.id == uid, Employee.manager_id == uid),
            Employee.deleted == False
        ).all()
    return jsonify([{
        'id': e.id,
        'first_name': e.first_name,
        'last_name': e.last_name,
        'email': e.email,
        'phone_number': e.phone_number,
        'hire_date': e.hire_date.isoformat() if e.hire_date else None,
        'job_title': e.job_title,
        'department_id': e.department_id,
        'department_name': e.department.name if e.department else None,
        'salary': e.salary,
        'manager_id': e.manager_id,
        'manager_name': f'{e.manager.first_name} {e.manager.last_name}' if e.manager else None,
    } for e in employees])


@bp.route('/employees/<string:employee_id>', methods=['GET'])
@token_required
def get_employee(current_user_type, current_user_id, employee_id):
    uid = current_user_id
    # Admin can view any employee; employee can only view themselves or their reports
    employee = Employee.query.get_or_404(employee_id)
    if employee.deleted:
        return jsonify({'message': 'Employee not found'}), 404
    if current_user_type != 'admin' and employee_id != uid:
        if employee.manager_id != uid:
            return jsonify({'message': 'Access denied'}), 403
    direct_reports = employee.direct_reports
    return jsonify({
        'id': employee.id,
        'first_name': employee.first_name,
        'last_name': employee.last_name,
        'email': employee.email,
        'phone_number': employee.phone_number,
        'hire_date': employee.hire_date.isoformat() if employee.hire_date else None,
        'job_title': employee.job_title,
        'department_id': employee.department_id,
        'department_name': employee.department.name if employee.department else None,
        'salary': employee.salary,
        'manager_id': employee.manager_id,
        'manager_name': f'{employee.manager.first_name} {employee.manager.last_name}' if employee.manager else None,
        'direct_reports': [{
            'id': r.id,
            'first_name': r.first_name,
            'last_name': r.last_name,
            'job_title': r.job_title,
            'department_id': r.department_id,
            'department_name': r.department.name if r.department else None,
        } for r in direct_reports],
    })


@bp.route('/employees', methods=['POST'])
@token_required
@admin_required
def create_employee(current_user_type, current_user_id):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    required_fields = ['first_name', 'last_name', 'email']
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({'error': f'{field} is required'}), 400
    if Employee.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    employee = Employee(
        first_name=data['first_name'],
        last_name=data['last_name'],
        email=data['email'],
        phone_number=data.get('phone_number'),
        hire_date=datetime.fromisoformat(data['hire_date']) if data.get('hire_date') else None,
        job_title=data.get('job_title'),
        department_id=data.get('department_id'),
        salary=data.get('salary'),
        manager_id=data.get('manager_id'),
        gender=data.get('gender'),
    )
    if data.get('password'):
        employee.set_password(data['password'])
    else:
        employee.set_password('password123')
    db.session.add(employee)
    db.session.commit()
    return jsonify({
        'id': employee.id,
        'first_name': employee.first_name,
        'last_name': employee.last_name,
        'email': employee.email,
        'phone_number': employee.phone_number,
        'hire_date': employee.hire_date.isoformat() if employee.hire_date else None,
        'job_title': employee.job_title,
        'department_id': employee.department_id,
        'department_name': employee.department.name if employee.department else None,
        'salary': employee.salary,
        'manager_id': employee.manager_id,
        'gender': employee.gender,
    }), 201


@bp.route('/employees/<string:employee_id>', methods=['PUT'])
@token_required
@admin_required
def update_employee(current_user_type, current_user_id, employee_id):
    employee = Employee.query.get_or_404(employee_id)
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    for field in ['first_name', 'last_name', 'email', 'phone_number', 'job_title', 'salary', 'manager_id', 'gender']:
        if field in data:
            setattr(employee, field, data[field])
    if 'department_id' in data:
        employee.department_id = data['department_id']
    if 'hire_date' in data and data['hire_date']:
        employee.hire_date = datetime.fromisoformat(data['hire_date'])
    if 'password' in data and data['password']:
        employee.set_password(data['password'])
    # Validate unique email if changed
    if 'email' in data and Employee.query.filter(Employee.email == data['email'], Employee.id != employee_id).first():
        return jsonify({'error': 'Email already exists'}), 400
    db.session.commit()
    return jsonify({
        'id': employee.id,
        'first_name': employee.first_name,
        'last_name': employee.last_name,
        'email': employee.email,
        'phone_number': employee.phone_number,
        'hire_date': employee.hire_date.isoformat() if employee.hire_date else None,
        'job_title': employee.job_title,
        'department_id': employee.department_id,
        'department_name': employee.department.name if employee.department else None,
        'salary': employee.salary,
        'manager_id': employee.manager_id,
    })


@bp.route('/employees/<string:employee_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_employee(current_user_type, current_user_id, employee_id):
    employee = Employee.query.get_or_404(employee_id)
    if employee.deleted:
        return jsonify({'message': 'Employee not found'}), 404
    employee.delete()
    return jsonify({'message': 'Employee deleted'})


# --- Admin endpoints ---

@bp.route('/admins', methods=['GET'])
@token_required
@admin_required
def get_admins(current_user_type, current_user_id):
    admins = Admin.query.all()
    return jsonify([{
        'id': a.id,
        'username': a.username,
        'email': a.email,
        'is_active': a.is_active
    } for a in admins])


@bp.route('/admins', methods=['POST'])
def create_admin():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    required_fields = ['username', 'email', 'password']
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({'error': f'{field} is required'}), 400
    if Admin.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    if Admin.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    # First admin creation without token (bootstrapping)
    if Admin.query.count() == 0:
        pass  # Allow without auth
    else:
        # Subsequent admins require token
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Invalid token format'}), 401
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        try:
            jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid'}), 401
    admin = Admin(username=data['username'], email=data['email'], is_active=data.get('is_active', True))
    admin.set_password(data['password'])
    db.session.add(admin)
    db.session.commit()
    return jsonify({'id': admin.id, 'username': admin.username, 'email': admin.email, 'is_active': admin.is_active}), 201



# --- PTO Request Validation ---

def calculate_weekdays(start, end):
    """Calculate number of weekdays between two dates (inclusive)."""
    days = 0
    current = start
    while current <= end:
        if current.weekday() < 5:
            days += 1
        current += timedelta(days=1)
    return days


def get_pto_quotas(employee):
    """Return the leave quotas for an employee."""
    return {
        LeaveType.Annual.name: {
            'max': 12,
            'used': PTORequest.query.filter_by(employee_id=employee.id, request_type=LeaveType.Annual, status='Approved').count() * 0,
            'pending': sum(
                r.days for r in PTORequest.query.filter_by(employee_id=employee.id, request_type=LeaveType.Annual, status='Pending').all()
            ),
            'approved': sum(
                r.days for r in PTORequest.query.filter_by(employee_id=employee.id, request_type=LeaveType.Annual, status='Approved').all()
            ),
        },
        LeaveType.Maternity.name: {'max': 180, 'used': 0, 'pending': 0, 'approved': 0},
        LeaveType.Paternity.name: {'max': 14, 'used': 0, 'pending': 0, 'approved': 0},
        LeaveType.Sick.name: {'max': 14, 'used': 0, 'pending': 0, 'approved': 0},
        LeaveType.Unpaid.name: {'max': None, 'used': 0, 'pending': 0, 'approved': 0},
    }


def validate_pto_request(employee, request_type, days):
    """Validate that an employee has enough leave quota for a PTO request."""
    quotas = get_pto_quotas(employee)

    try:
        lt = LeaveType[request_type]
    except KeyError:
        return False, f'Invalid PTO type: {request_type}'

    if lt == LeaveType.Maternity and employee.gender != 'Female':
        return False, 'Maternity leave is only available to female employees'

    if lt == LeaveType.Paternity and employee.gender != 'Male':
        return False, 'Paternity leave is only available to male employees'

    if lt == LeaveType.Unpaid:
        return True, None

    max_days = quotas[request_type]['max']
    approved_days = sum(
        r.days for r in PTORequest.query.filter_by(
            employee_id=employee.id, request_type=lt, status='Approved'
        ).all()
    )
    pending_days = sum(
        r.days for r in PTORequest.query.filter_by(
            employee_id=employee.id, request_type=lt, status='Pending'
        ).all()
    )

    if approved_days + pending_days + days > max_days:
        remaining = max_days - approved_days
        return False, f'Insufficient {request_type} leave. {remaining} day(s) remaining (pending requests hold {pending_days} day(s))'

    return True, None


# --- PTO Request endpoints ---

@bp.route('/pto-requests', methods=['GET'])
@token_required
def get_pto_requests(current_user_type, current_user_id):
    uid = current_user_id
    if current_user_type == 'admin':
        pto_requests = PTORequest.query.all()
    else:
        employee = get_current_employee(uid)
        if not employee:
            return jsonify({'message': 'Employee not found'}), 404
        reports_ids = [r.id for r in employee.direct_reports]
        pto_requests = PTORequest.query.filter(
            db.or_(PTORequest.employee_id == uid, PTORequest.employee_id.in_(reports_ids))
        ).all()

    result = []
    for r in pto_requests:
        result.append({
            'id': r.id,
            'employee_id': r.employee_id,
            'employee_name': f'{r.employee.first_name} {r.employee.last_name}',
            'start_date': r.start_date.isoformat() if r.start_date else None,
            'end_date': r.end_date.isoformat() if r.end_date else None,
            'days': r.days,
            'reason': r.reason,
            'status': r.status,
            'request_type': r.request_type.name,
            'created_at': r.created_at.isoformat() if r.created_at else None,
        })
    return jsonify(result)


@bp.route('/pto-requests', methods=['POST'])
@token_required
def create_pto_request(current_user_type, current_user_id):
    if current_user_type != 'employee':
        return jsonify({'message': 'Only employees can submit PTO requests'}), 403

    uid = current_user_id
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    required = ['start_date', 'end_date', 'reason', 'request_type']
    for field in required:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400

    try:
        start = date.fromisoformat(data['start_date'])
        end = date.fromisoformat(data['end_date'])
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400

    if end < start:
        return jsonify({'error': 'End date must be after start date'}), 400

    days = calculate_weekdays(start, end)
    if days <= 0:
        return jsonify({'error': 'Request must include at least one weekday'}), 400

    employee = get_current_employee(uid)
    if not employee:
        return jsonify({'message': 'Employee not found'}), 404
    request_type_str = data['request_type']
    # Map frontend display name to enum (accepts "Annual", "Maternity", "Paternity", "Sick", "Unpaid")
    try:
        request_type = LeaveType[request_type_str]
    except KeyError:
        return jsonify({'error': f'Invalid PTO type: {request_type_str}'}), 400

    valid, error_msg = validate_pto_request(employee, request_type.name, days)
    if not valid:
        return jsonify({'error': error_msg}), 400

    # Check for overlapping PTO requests
    overlapping = PTORequest.query.filter(
        PTORequest.employee_id == uid,
        PTORequest.status.in_(['Pending', 'Approved']),
        PTORequest.start_date <= end,
        PTORequest.end_date >= start,
    ).first()
    if overlapping:
        overlap_start = overlapping.start_date.isoformat()
        overlap_end = overlapping.end_date.isoformat()
        overlap_type = overlapping.request_type.name
        return jsonify({
            'error': f'Dates overlap with an existing {overlap_type} request ({overlap_start} to {overlap_end})'
        }), 400

    pto_request = PTORequest(
        employee_id=uid,
        start_date=start,
        end_date=end,
        days=days,
        reason=data['reason'],
        request_type=request_type,
        status='Pending',
    )
    db.session.add(pto_request)
    db.session.commit()

    return jsonify({
        'id': pto_request.id,
        'employee_id': pto_request.employee_id,
        'start_date': pto_request.start_date.isoformat(),
        'end_date': pto_request.end_date.isoformat(),
        'days': pto_request.days,
        'reason': pto_request.reason,
        'status': pto_request.status,
        'request_type': pto_request.request_type.name,
        'created_at': pto_request.created_at.isoformat() if pto_request.created_at else None,
    }), 201


@bp.route('/pto-requests/<string:request_id>', methods=['GET'])
@token_required
def get_pto_request(current_user_type, current_user_id, request_id):
    uid = current_user_id
    pto_request = PTORequest.query.get_or_404(request_id)

    if current_user_type != 'admin':
        employee = get_current_employee(uid)
        if not employee:
            return jsonify({'message': 'Employee not found'}), 404
        reports_ids = [r.id for r in employee.direct_reports]
        if pto_request.employee_id != uid and pto_request.employee_id not in reports_ids:
            return jsonify({'message': 'Access denied'}), 403

    return jsonify({
        'id': pto_request.id,
        'employee_id': pto_request.employee_id,
        'employee_name': f'{pto_request.employee.first_name} {pto_request.employee.last_name}',
        'start_date': pto_request.start_date.isoformat() if pto_request.start_date else None,
        'end_date': pto_request.end_date.isoformat() if pto_request.end_date else None,
        'days': pto_request.days,
        'reason': pto_request.reason,
        'status': pto_request.status,
        'request_type': pto_request.request_type.name,
        'created_at': pto_request.created_at.isoformat() if pto_request.created_at else None,
    })


@bp.route('/pto-requests/<string:request_id>/approve', methods=['PUT'])
@token_required
def approve_pto_request(current_user_type, current_user_id, request_id):
    uid = current_user_id
    pto_request = PTORequest.query.get_or_404(request_id)

    if pto_request.status != 'Pending':
        return jsonify({'message': 'Request is not pending'}), 400

    if current_user_type != 'admin':
        employee = get_current_employee(uid)
        if not employee:
            return jsonify({'message': 'Employee not found'}), 404
        report_ids = [r.id for r in employee.direct_reports]
        if pto_request.employee_id not in report_ids:
            return jsonify({'message': 'Access denied'}), 403

    pto_request.status = 'Approved'
    db.session.commit()

    return jsonify({
        'id': pto_request.id,
        'status': pto_request.status,
        'message': 'PTO request approved',
    })


@bp.route('/pto-requests/<string:request_id>/reject', methods=['PUT'])
@token_required
def reject_pto_request(current_user_type, current_user_id, request_id):
    uid = current_user_id
    pto_request = PTORequest.query.get_or_404(request_id)

    if pto_request.status != 'Pending':
        return jsonify({'message': 'Request is not pending'}), 400

    if current_user_type != 'admin':
        employee = get_current_employee(uid)
        if not employee:
            return jsonify({'message': 'Employee not found'}), 404
        report_ids = [r.id for r in employee.direct_reports]
        if pto_request.employee_id not in report_ids:
            return jsonify({'message': 'Access denied'}), 403

    pto_request.status = 'Rejected'
    db.session.commit()

    return jsonify({
        'id': pto_request.id,
        'status': pto_request.status,
        'message': 'PTO request rejected',
    })


@bp.route('/pto-requests/<string:request_id>', methods=['DELETE'])
@token_required
def cancel_pto_request(current_user_type, current_user_id, request_id):
    uid = current_user_id
    pto_request = PTORequest.query.get_or_404(request_id)

    if pto_request.deleted:
        return jsonify({'message': 'PTO request not found'}), 404

    if pto_request.status != 'Pending':
        return jsonify({'message': 'Can only cancel pending requests'}), 400

    current_user = get_current_employee(uid)
    if not current_user:
        return jsonify({'message': 'Employee not found'}), 404
    if pto_request.employee_id != uid and pto_request.employee_id not in [r.id for r in current_user.direct_reports]:
        return jsonify({'message': 'Access denied'}), 403

    pto_request.delete()
    return jsonify({'message': 'PTO request cancelled'})


# --- OT Request endpoints ---

@bp.route('/ot-requests', methods=['GET'])
@token_required
def get_ot_requests(current_user_type, current_user_id):
    uid = current_user_id
    if current_user_type == 'admin':
        ot_requests = OTRequest.query.all()
    else:
        employee = get_current_employee(uid)
        if not employee:
            return jsonify({'message': 'Employee not found'}), 404
        report_ids = [r.id for r in employee.direct_reports]
        ot_requests = OTRequest.query.filter(
            db.or_(OTRequest.employee_id == uid, OTRequest.employee_id.in_(report_ids))
        ).all()

    result = []
    for r in ot_requests:
        result.append({
            'id': r.id,
            'employee_id': r.employee_id,
            'employee_name': f'{r.employee.first_name} {r.employee.last_name}',
            'date': r.date.isoformat() if r.date else None,
            'hours': r.hours,
            'reason': r.reason,
            'status': r.status,
            'created_at': r.created_at.isoformat() if r.created_at else None,
        })
    return jsonify(result)


@bp.route('/ot-requests', methods=['POST'])
@token_required
def create_ot_request(current_user_type, current_user_id):
    if current_user_type != 'employee':
        return jsonify({'message': 'Only employees can submit OT requests'}), 403

    uid = current_user_id
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    required = ['date', 'hours', 'reason']
    for field in required:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400

    try:
        ot_date = date.fromisoformat(data['date'])
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400

    hours = data['hours']
    if not isinstance(hours, (int, float)) or hours <= 0 or hours > 16:
        return jsonify({'error': 'Hours must be between 0.5 and 16'}), 400

    ot_request = OTRequest(
        employee_id=uid,
        date=ot_date,
        hours=hours,
        reason=data['reason'],
        status='Pending',
    )
    db.session.add(ot_request)
    db.session.commit()

    return jsonify({
        'id': ot_request.id,
        'employee_id': ot_request.employee_id,
        'date': ot_request.date.isoformat(),
        'hours': ot_request.hours,
        'reason': ot_request.reason,
        'status': ot_request.status,
        'created_at': ot_request.created_at.isoformat() if ot_request.created_at else None,
    }), 201


@bp.route('/ot-requests/<string:request_id>', methods=['GET'])
@token_required
def get_ot_request(current_user_type, current_user_id, request_id):
    uid = current_user_id
    ot_request = OTRequest.query.get_or_404(request_id)

    if current_user_type != 'admin':
        employee = get_current_employee(uid)
        if not employee:
            return jsonify({'message': 'Employee not found'}), 404
        report_ids = [r.id for r in employee.direct_reports]
        if ot_request.employee_id != uid and ot_request.employee_id not in report_ids:
            return jsonify({'message': 'Access denied'}), 403

    return jsonify({
        'id': ot_request.id,
        'employee_id': ot_request.employee_id,
        'employee_name': f'{ot_request.employee.first_name} {ot_request.employee.last_name}',
        'date': ot_request.date.isoformat() if ot_request.date else None,
        'hours': ot_request.hours,
        'reason': ot_request.reason,
        'status': ot_request.status,
        'created_at': ot_request.created_at.isoformat() if ot_request.created_at else None,
    })


@bp.route('/ot-requests/<string:request_id>/approve', methods=['PUT'])
@token_required
def approve_ot_request(current_user_type, current_user_id, request_id):
    uid = current_user_id
    ot_request = OTRequest.query.get_or_404(request_id)

    if ot_request.status != 'Pending':
        return jsonify({'message': 'Request is not pending'}), 400

    if current_user_type != 'admin':
        employee = get_current_employee(uid)
        if not employee:
            return jsonify({'message': 'Employee not found'}), 404
        report_ids = [r.id for r in employee.direct_reports]
        if ot_request.employee_id not in report_ids:
            return jsonify({'message': 'Access denied'}), 403

    ot_request.status = 'Approved'
    db.session.commit()

    return jsonify({
        'id': ot_request.id,
        'status': ot_request.status,
        'message': 'OT request approved',
    })


@bp.route('/ot-requests/<string:request_id>/reject', methods=['PUT'])
@token_required
def reject_ot_request(current_user_type, current_user_id, request_id):
    uid = current_user_id
    ot_request = OTRequest.query.get_or_404(request_id)

    if ot_request.status != 'Pending':
        return jsonify({'message': 'Request is not pending'}), 400

    if current_user_type != 'admin':
        employee = get_current_employee(uid)
        if not employee:
            return jsonify({'message': 'Employee not found'}), 404
        report_ids = [r.id for r in employee.direct_reports]
        if ot_request.employee_id not in report_ids:
            return jsonify({'message': 'Access denied'}), 403

    ot_request.status = 'Rejected'
    db.session.commit()

    return jsonify({
        'id': ot_request.id,
        'status': ot_request.status,
        'message': 'OT request rejected',
    })


# --- Change password endpoint ---

@bp.route('/me/password', methods=['PUT'])
@token_required
def change_password(current_user_type, current_user_id):
    uid = current_user_id
    data = request.get_json()
    if not data or 'current_password' not in data or 'new_password' not in data:
        return jsonify({'error': 'Current password and new password are required'}), 400

    if current_user_type == 'admin':
        user = Admin.query.filter_by(id=uid, deleted=False).first()
    else:
        user = Employee.query.filter_by(id=uid, deleted=False).first()

    if not user:
        return jsonify({'message': 'User not found'}), 404

    if not user.check_password(data['current_password']):
        return jsonify({'error': 'Current password is incorrect'}), 401

    user.set_password(data['new_password'])
    db.session.commit()

    return jsonify({'message': 'Password changed successfully'})


# --- Employee Balance endpoint ---

@bp.route('/me/balance', methods=['GET'])
@token_required
def get_employee_balance(current_user_type, current_user_id):
    if current_user_type != 'employee':
        return jsonify({'message': 'Only employees can view balance'}), 403

    uid = current_user_id
    employee = get_current_employee(uid)
    if not employee:
        return jsonify({'message': 'Employee not found'}), 404

    approved_annual = PTORequest.query.filter_by(
        employee_id=uid, request_type=LeaveType.Annual, status='Approved'
    ).all()
    used_annual = sum(r.days for r in approved_annual)

    pending_annual = PTORequest.query.filter_by(
        employee_id=uid, request_type=LeaveType.Annual, status='Pending'
    ).all()
    pending_annual_days = sum(r.days for r in pending_annual)

    approved_ot = OTRequest.query.filter_by(
        employee_id=uid, status='Approved'
    ).all()
    ot_hours = sum(r.hours for r in approved_ot)

    return jsonify({
        'total_annual': 12,
        'remaining': 12 - used_annual - pending_annual_days,
        'taken': used_annual,
        'pending': pending_annual_days,
        'ot_hours': ot_hours,
        'maternity_max': 180 if employee.gender == 'Female' else 0,
        'paternity_max': 14 if employee.gender == 'Male' else 0,
        'sick_max': 14,
    })


# --- Authentication endpoints ---

@bp.route('/login/admin', methods=['POST'])
def login_admin():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Username and password required'}), 400
    username = data['username'].lower()
    admin = Admin.query.filter(
        db.or_(Admin.username.ilike(data['username']), Admin.email.ilike(data['username'])),
        Admin.deleted == False
    ).first()
    if not admin or not admin.check_password(data['password']):
        return jsonify({'message': 'Invalid credentials'}), 401
    token = admin.generate_token()
    return jsonify({
        'token': token,
        'user': {
            'id': admin.id,
            'username': admin.username,
            'email': admin.email,
            'type': 'admin',
        }
    })


@bp.route('/login/employee', methods=['POST'])
def login_employee():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email and password required'}), 400
    employee = Employee.query.filter(
        Employee.email.ilike(data['email']),
        Employee.deleted == False
    ).first()
    if not employee or not employee.check_password(data['password']):
        return jsonify({'message': 'Invalid credentials'}), 401
    token = employee.generate_token()
    return jsonify({
        'token': token,
        'user': {
            'id': employee.id,
            'email': employee.email,
            'first_name': employee.first_name,
            'last_name': employee.last_name,
            'type': 'employee',
        }
    })


# Protected test endpoint
@bp.route('/protected', methods=['GET'])
@token_required
def protected(current_user_type, current_user_id):
    return jsonify({
        'message': 'This is a protected route',
        'user_type': current_user_type,
        'user_id': current_user_id
    })
