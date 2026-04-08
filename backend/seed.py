"""Seed script: creates departments, admin, and sample employees with passwords."""
from datetime import datetime
from app import create_app, db
from app.models import Department, Employee, Admin
import csv
import os

app = create_app()

with app.app_context():
    # Create all tables
    db.create_all()

    # Clear existing data
    Employee.query.delete()
    Admin.query.delete()
    Department.query.delete()
    db.session.commit()

    # Create departments
    departments = [
        Department(name='R&D', description='R&D department'),
        Department(name='Sale', description='Sale department'),
        Department(name='HR', description='Human resources department'),
        Department(name='Finance', description='Finance department'),
    ]
    for d in departments:
        db.session.add(d)
    db.session.commit()

    # Create admin
    admin = Admin(username='admin', email='admin@hrm.com', is_active=True)
    admin.set_password('admin123')
    db.session.add(admin)
    db.session.commit()

    # Create employees - managers first (no manager_id)
    employees = []

    current_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(current_dir, 'data.csv')
    print(file_path)
    with open(file_path, newline='\n', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            employee = Employee(
                first_name= row['firstname'].capitalize(), 
                last_name= row['lastname'].capitalize(),
                email= row['email'].lower(),
                phone_number= row['phone'],
                hire_date=datetime(2023, 1, 1),
                job_title= row['title'],
                department= departments[0],
                salary= 1000,
                gender= "Male" if row['gender'] == "1" else "Female",
            )
            employee.set_password("password123")
            employees.append(employee)
            db.session.add(employee)
            db.session.commit()
    
    with open(file_path, newline='\n', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            employee_email = row['email'].lower()
            employee_manager = row['manager'].lower()
            
            if not employee_manager:
                continue

            manager_id = None
            for manager in employees:
                if manager.email == employee_manager:
                    manager_id = manager.id
                    break

            if not manager_id:
                continue

            for employee in employees:
                if employee.email == employee_email:
                    employee.manager_id = manager_id

    for employee in employees:
        db.session.add(employee)
        print("Seeded Employee:", employee.email)

    db.session.commit()

    
    # john = Employee(
    #     first_name='John', last_name='Doe',
    #     email='john.doe@company.com',
    #     phone_number='555-0101',
    #     hire_date=datetime(2023, 1, 15),
    #     job_title='Software Engineer',
    #     department=departments[0],
    #     salary=75000,
    #     gender='Male',
    # )
    # john.set_password('employee123')
    # db.session.add(john)

    # jane = Employee(
    #     first_name='Jane', last_name='Smith',
    #     email='jane.smith@company.com',
    #     phone_number='555-0102',
    #     hire_date=datetime(2022, 3, 22),
    #     job_title='Product Manager',
    #     department=departments[1],
    #     salary=82000,
    #     gender='Female',
    # )
    # jane.set_password('employee123')
    # db.session.add(jane)
    # db.session.commit()

    # # Employees with managers
    # mike = Employee(
    #     first_name='Mike', last_name='Johnson',
    #     email='mike.johnson@company.com',
    #     phone_number='555-0103',
    #     hire_date=datetime(2023, 6, 10),
    #     job_title='UX Designer',
    #     department=departments[2],
    #     salary=68000,
    #     manager_id=jane.id,
    #     gender='Male',
    # )
    # mike.set_password('employee123')
    # db.session.add(mike)

    # sarah = Employee(
    #     first_name='Sarah', last_name='Wilson',
    #     email='sarah.wilson@company.com',
    #     phone_number='555-0104',
    #     hire_date=datetime(2021, 11, 5),
    #     job_title='DevOps Engineer',
    #     department=departments[0],
    #     salary=78000,
    #     manager_id=john.id,
    #     gender='Female',
    # )
    # sarah.set_password('employee123')
    # db.session.add(sarah)

    # david = Employee(
    #     first_name='David', last_name='Brown',
    #     email='david.brown@company.com',
    #     phone_number='555-0105',
    #     hire_date=datetime(2023, 2, 18),
    #     job_title='QA Engineer',
    #     department=departments[0],
    #     salary=65000,
    #     manager_id=john.id,
    #     gender='Male',
    # )
    # david.set_password('employee123')
    # db.session.add(david)
    # db.session.commit()

    # print('Seeded:')
    # print(f'  Admin: admin / admin123')
    # print(f'  Employees (all password: employee123):')
    # print(f'    John Doe (john.doe@company.com) - Male - Manager')
    # print(f'    Jane Smith (jane.smith@company.com) - Female - Manager')
    # print(f'    Mike Johnson (mike.johnson@company.com) - Male -> Manager: Jane Smith')
    # print(f'    Sarah Wilson (sarah.wilson@company.com) - Female -> Manager: John Doe')
    # print(f'    David Brown (david.brown@company.com) - Male -> Manager: John Doe')
