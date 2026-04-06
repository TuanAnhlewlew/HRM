"""Clear existing employees and import from data.csv via API."""
import csv
import sys
import json
import urllib.request

API_URL = "http://localhost:5000"

def login_admin():
    data = json.dumps({"username": "admin", "password": "admin123"}).encode()
    req = urllib.request.Request(
        f"{API_URL}/login/admin", data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    resp = urllib.request.urlopen(req)
    result = json.loads(resp.read())
    return result["token"]


def api(method, path, token=None, body=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(
        f"{API_URL}{path}", data=data, headers=headers, method=method,
    )
    try:
        resp = urllib.request.urlopen(req)
        if resp.status == 204:
            return None
        return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        detail = json.loads(e.read()) if e.fp else str(e)
        print(f"  API Error {e.code} {method} {path}: {detail}")
        raise


def main():
    token = login_admin()

    # Also hard-delete from DB so soft-deleted emails don't block re-import
    # Use API to clear active, then direct DB to purge soft-deleted
    import importlib
    sys.path.insert(0, ".")
    from app import create_app, db
    from app.models import Employee, PTORequest, OTRequest
    app_local = create_app()
    with app_local.app_context():
        count = PTORequest.query.count()
        if count > 0:
            db.session.query(PTORequest).delete()
            print(f"Removed {count} PTO requests.")
        count = OTRequest.query.count()
        if count > 0:
            db.session.query(OTRequest).delete()
            print(f"Removed {count} OT requests.")
        count = Employee.query.count()
        if count > 0:
            db.session.query(Employee).delete()
            print(f"Removed {count} employee records (including soft-deleted).")
        db.session.commit()

    # Check departments, ensure 'Engineering' exists
    depts = api("GET", "/departments", token)
    engineering = next((d for d in depts if d["name"] == "Engineering"), None)
    if not engineering:
        engineering = api("POST", "/departments", token, {"name": "Engineering", "description": "Engineering department"})
        print(f"Created department: {engineering['name']}")
    dept_id = engineering["id"]

    # Parse CSV
    employees_data = []
    with open("data.csv", newline="") as f:
        reader = csv.DictReader(f)
        # Normalize keys by stripping spaces
        for raw_row in reader:
            row = {k.strip(): v.strip() for k, v in raw_row.items()}
            employees_data.append({
                "firstname": row["firstname"],
                "lastname": row["lastname"],
                "email": row["email"],
                "role": row["role"],
                "manager_email": row["manager"] if row.get("manager") else None,
            })

    print(f"Importing {len(employees_data)} employees from CSV...")
    created = {}  # email -> {id, first_name, ...}

    for emp in employees_data:
        gender = "Male"  # default when not specified
        body = {
            "first_name": emp["firstname"],
            "last_name": emp["lastname"],
            "email": emp["email"],
            "job_title": emp["role"],
            "gender": gender,
            "hire_date": "2024-01-15",
            "department_id": dept_id,
            "salary": None,
            "password": "password123",
        }
        print(f"  Creating {emp['firstname']} {emp['lastname']} ({emp['email']})...")
        try:
            result = api("POST", "/employees", token, body)
            created[emp["email"]] = result
        except Exception:
            # Skip if already exists (e.g., soft-deleted or duplicate)
            print(f"    Skipped (may already exist).")
            continue

    # Update manager relationships
    print("\nSetting manager relationships...")
    update_count = 0
    for emp in employees_data:
        if emp["manager_email"]:
            manager_email = emp["manager_email"]
            if manager_email in created:
                employee_id = created[emp["email"]]["id"]
                manager_id = created[manager_email]["id"]
                if manager_id != employee_id:
                    update_body = {"manager_id": manager_id}
                    print(f"  Assigning {emp['firstname']} {emp['lastname']}'s manager: {manager_email}...")
                    api("PUT", f"/employees/{employee_id}", token, update_body)
                    update_count += 1
            else:
                print(f"  Warning: manager {manager_email} not found for {emp['email']}")

    print(f"\nDone! Created {len(created)} employees, updated {update_count} manager relationships.")


if __name__ == "__main__":
    main()
