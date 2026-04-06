"""Script to seed the system with test PTO/OT request data via API calls."""
import requests

BASE_URL = "http://localhost:5000"

# Login credentials
credentials = [
    {"email": "john.doe@company.com", "password": "employee123"},
    {"email": "jane.smith@company.com", "password": "employee123"},
    {"email": "mike.johnson@company.com", "password": "employee123"},
    {"email": "sarah.wilson@company.com", "password": "employee123"},
    {"email": "david.brown@company.com", "password": "employee123"},
]

tokens = {}
names = {}

print("=== Logging in employees ===")
for cred in credentials:
    resp = requests.post(f"{BASE_URL}/login/employee", json=cred)
    data = resp.json()
    email = cred["email"]
    first_name = data["user"]["first_name"]
    last_name = data["user"]["last_name"]
    tokens[email] = data["token"]
    names[email] = f"{first_name} {last_name}"
    print(f"  {first_name} {last_name} logged in")

headers = lambda email: {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {tokens[email]}"
}

print("\n=== Creating PTO Requests ===")

pto_requests = [
    # John Doe: Annual leave approved
    ("john.doe@company.com", {
        "start_date": "2026-03-02", "end_date": "2026-03-06",
        "reason": "Family vacation to beach",
        "request_type": "Annual"
    }, "Approved"),

    # John Doe: Sick leave pending
    ("john.doe@company.com", {
        "start_date": "2026-04-20", "end_date": "2026-04-22",
        "reason": "Flu and doctor visit",
        "request_type": "Sick"
    }, "Pending"),

    # Jane Smith: Maternity leave approved
    ("jane.smith@company.com", {
        "start_date": "2026-05-04", "end_date": "2026-05-29",
        "reason": "Maternity leave",
        "request_type": "Maternity"
    }, "Pending"),

    # Jane Smith: Annual approved
    ("jane.smith@company.com", {
        "start_date": "2026-04-06", "end_date": "2026-04-10",
        "reason": "Spring break",
        "request_type": "Annual"
    }, "Approved"),

    # Mike Johnson: Unpaid leave pending
    ("mike.johnson@company.com", {
        "start_date": "2026-04-27", "end_date": "2026-05-01",
        "reason": "Personal trip",
        "request_type": "Unpaid"
    }, "Pending"),

    # Mike Johnson: Sick approved
    ("mike.johnson@company.com", {
        "start_date": "2026-03-16", "end_date": "2026-03-16",
        "reason": "Doctor appointment",
        "request_type": "Sick"
    }, "Approved"),

    # Sarah Wilson: Annual approved
    ("sarah.wilson@company.com", {
        "start_date": "2026-04-13", "end_date": "2026-04-17",
        "reason": "Annual vacation",
        "request_type": "Annual"
    }, "Approved"),

    # Sarah Wilson: Sick pending
    ("sarah.wilson@company.com", {
        "start_date": "2026-04-08", "end_date": "2026-04-09",
        "reason": "Medical checkup",
        "request_type": "Sick"
    }, "Pending"),

    # David Brown: Paternity leave pending
    ("david.brown@company.com", {
        "start_date": "2026-06-01", "end_date": "2026-06-12",
        "reason": "New baby arrival",
        "request_type": "Paternity"
    }, "Pending"),

    # David Brown: Annual rejected
    ("david.brown@company.com", {
        "start_date": "2026-03-09", "end_date": "2026-03-13",
        "reason": "Ski trip",
        "request_type": "Annual"
    }, "Rejected"),
]

for email, data, target_status in pto_requests:
    resp = requests.post(
        f"{BASE_URL}/pto-requests",
        headers=headers(email),
        json=data
    )
    if resp.status_code == 201:
        req_id = resp.json()["id"]
        if target_status == "Approved":
            approve = requests.put(
                f"{BASE_URL}/pto-requests/{req_id}/approve",
                headers=headers("john.doe@company.com") if email != "john.doe@company.com" else headers("jane.smith@company.com"),
                json={}
            )
            print(f"  + {names[email]}: {data['request_type']} ({data['start_date']} to {data['end_date']}) -> Approved")
        elif target_status == "Rejected":
            reject = requests.put(
                f"{BASE_URL}/pto-requests/{req_id}/reject",
                headers=headers("john.doe@company.com") if email != "john.doe@company.com" else headers("jane.smith@company.com"),
                json={}
            )
            print(f"  - {names[email]}: {data['request_type']} ({data['start_date']} to {data['end_date']}) -> Rejected")
        else:
            print(f"  ~ {names[email]}: {data['request_type']} ({data['start_date']} to {data['end_date']}) -> Pending")
    else:
        print(f"  x {names[email]}: {resp.json().get('error', resp.text)}")

print("\n=== Creating OT Requests ===")

ot_requests = [
    # John Doe: Multiple OT hours
    ("john.doe@company.com", {"date": "2026-03-10", "hours": 3, "reason": "Urgent deployment"}, "Approved"),
    ("john.doe@company.com", {"date": "2026-03-15", "hours": 2, "reason": "Production fix"}, "Approved"),
    ("john.doe@company.com", {"date": "2026-04-05", "hours": 4, "reason": "Weekend release support"}, "Pending"),

    # Jane Smith: OT
    ("jane.smith@company.com", {"date": "2026-03-20", "hours": 2.5, "reason": "Sprint review prep"}, "Approved"),
    ("jane.smith@company.com", {"date": "2026-04-12", "hours": 3, "reason": "Client demo prep"}, "Pending"),

    # Mike Johnson: Design sprint OT
    ("mike.johnson@company.com", {"date": "2026-03-25", "hours": 4, "reason": "Design sprint deadline"}, "Approved"),
    ("mike.johnson@company.com", {"date": "2026-04-08", "hours": 1.5, "reason": "Prototype review"}, "Pending"),

    # Sarah Wilson: DevOps OT
    ("sarah.wilson@company.com", {"date": "2026-03-18", "hours": 5, "reason": "Server migration"}, "Approved"),
    ("sarah.wilson@company.com", {"date": "2026-03-22", "hours": 3, "reason": "Monitoring setup"}, "Approved"),
    ("sarah.wilson@company.com", {"date": "2026-04-15", "hours": 2, "reason": "Infrastructure review"}, "Pending"),

    # David Brown: QA OT
    ("david.brown@company.com", {"date": "2026-03-28", "hours": 6, "reason": "Regression testing"}, "Approved"),
    ("david.brown@company.com", {"date": "2026-04-10", "hours": 4, "reason": "Bug fix verification"}, "Rejected"),
]

for email, data, target_status in ot_requests:
    resp = requests.post(
        f"{BASE_URL}/ot-requests",
        headers=headers(email),
        json=data
    )
    if resp.status_code == 201:
        req_id = resp.json()["id"]
        if target_status == "Approved":
            approve = requests.put(
                f"{BASE_URL}/ot-requests/{req_id}/approve",
                headers=headers("john.doe@company.com") if email != "john.doe@company.com" else headers("jane.smith@company.com"),
                json={}
            )
            print(f"  + {names[email]}: OT {data['hours']}h on {data['date']} -> Approved")
        elif target_status == "Rejected":
            reject = requests.put(
                f"{BASE_URL}/ot-requests/{req_id}/reject",
                headers=headers("john.doe@company.com") if email != "john.doe@company.com" else headers("jane.smith@company.com"),
                json={}
            )
            print(f"  - {names[email]}: OT {data['hours']}h on {data['date']} -> Rejected")
        else:
            print(f"  ~ {names[email]}: OT {data['hours']}h on {data['date']} -> Pending")
    else:
        print(f"  x {names[email]}: {resp.json().get('error', resp.text)}")

print(f"\n=== Summary ===")
for email in [e["email"] for e in credentials]:
    ptos = requests.get(f"{BASE_URL}/pto-requests", headers=headers(email))
    ots = requests.get(f"{BASE_URL}/ot-requests", headers=headers(email))
    my_pto = [r for r in ptos.json() if r["employee_id"] == requests.get(f"{BASE_URL}/login/employee", json={"email": email, "password": "employee123"}).json()["user"]["id"]]
    my_ot = [r for r in ots.json() if r["employee_id"] == requests.get(f"{BASE_URL}/login/employee", json={"email": email, "password": "employee123"}).json()["user"]["id"]]
    print(f"  {names[email]}: {len(my_pto)} PTO requests, {len(my_ot)} OT requests")
