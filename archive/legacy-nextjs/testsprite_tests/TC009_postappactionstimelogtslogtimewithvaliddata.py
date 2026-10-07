import requests

BASE_URL = "http://localhost:3000"
AUTH_URL = f"{BASE_URL}/api/auth/callback/credentials"
PROJECT_CREATE_URL = f"{BASE_URL}/app/actions/project.ts"
KANBAN_URL = f"{BASE_URL}/app/actions/kanban.ts"
TASK_CREATE_URL = f"{BASE_URL}/app/actions/task"  # Not explicitly in PRD, fallback for task creation if needed
TIMELOG_URL = f"{BASE_URL}/app/actions/timeLog.ts"
HEADERS = {"Content-Type": "application/json"}
TIMEOUT = 30

# Substitute with valid test user credentials for authentication
TEST_USER_CREDENTIALS = {
    "username": "testuser@example.com",
    "password": "TestPassword123!"
}

def test_postappactionstimelogtslogtimewithvaliddata():
    session = requests.Session()
    try:
        # 1. Authenticate and get access token (e.g., JWT cookie or header)
        auth_resp = session.post(AUTH_URL, json=TEST_USER_CREDENTIALS, timeout=TIMEOUT)
        assert auth_resp.status_code == 200, f"Authentication failed with status {auth_resp.status_code}"
        # Presume auth cookies or token now in session for further requests

        # 2. Create a new project with valid project and client data
        # Creating minimal valid client first since project requires client

        # Create minimal valid client
        client_payload = {
            "name": "Test Client for TimeLog",
            "email": "client.timelog@example.com",
            "document": "123456789"
        }
        client_create_url = f"{BASE_URL}/app/actions/client.ts"
        client_resp = session.post(client_create_url, json=client_payload, timeout=TIMEOUT)
        assert client_resp.status_code == 200, f"Client creation failed: {client_resp.text}"
        client_data = client_resp.json()
        client_id = client_data.get("id")
        assert client_id, "Client ID not returned"

        # Create project linked to client
        project_payload = {
            "name": "Test Project for TimeLog",
            "clientId": client_id,
            "startDate": "2026-01-01",
            "endDate": "2026-12-31",
            "description": "Project created for time log test",
        }
        project_resp = session.post(PROJECT_CREATE_URL, json=project_payload, timeout=TIMEOUT)
        assert project_resp.status_code == 200, f"Project creation failed: {project_resp.text}"
        project_data = project_resp.json()
        project_id = project_data.get("id")
        assert project_id, "Project ID not returned"

        # 3. Create a task in the project for the time log
        # According to PRD, tasks are part of Kanban & Tasks, but no POST endpoint explicitly given for task creation.
        # To proceed, we assume a task creation endpoint at "/app/actions/task" with POST and auth required.
        task_payload = {
            "title": "Test Task for Time Logging",
            "projectId": project_id,
            "description": "Task for logging time in test",
            "status": "To Do"
        }
        task_resp = session.post(TASK_CREATE_URL, json=task_payload, timeout=TIMEOUT)
        assert task_resp.status_code == 200, f"Task creation failed: {task_resp.text}"
        task_data = task_resp.json()
        task_id = task_data.get("id")
        assert task_id, "Task ID not returned"

        # 4. Post a time log with valid project, task, duration, and category
        time_log_payload = {
            "projectId": project_id,
            "taskId": task_id,
            "duration": 120,  # 2 hours
            "category": "Design"
        }
        time_log_resp = session.post(TIMELOG_URL, json=time_log_payload, timeout=TIMEOUT)
        assert time_log_resp.status_code == 200, f"Time log POST failed: {time_log_resp.text}"
        time_log_data = time_log_resp.json()
        time_log_id = time_log_data.get("id")
        assert time_log_id, "Time log ID not returned"
        # Validate time log fields
        assert time_log_data.get("projectId") == project_id, "Time log project ID mismatch"
        assert time_log_data.get("taskId") == task_id, "Time log task ID mismatch"
        assert time_log_data.get("duration") == 120, "Time log duration mismatch"
        assert time_log_data.get("category") == "Design", "Time log category mismatch"

        # 5. Validate that the time log is included in timesheet and project metrics

        time_logs_resp = session.get(TIMELOG_URL, params={"projectId": project_id}, timeout=TIMEOUT)
        assert time_logs_resp.status_code == 200, "Failed to fetch project time logs"
        all_time_logs = time_logs_resp.json()
        assert isinstance(all_time_logs, list), "Time logs response not a list"

        # Check that newly created time log is in list
        found_log = any(tl.get("id") == time_log_id for tl in all_time_logs)
        assert found_log, "Newly created time log not found in project time logs"

        # Validate project metrics from project details endpoint (assumed included)
        project_metrics_resp = session.get(f"{PROJECT_CREATE_URL}?id={project_id}", timeout=TIMEOUT)
        assert project_metrics_resp.status_code == 200, "Failed to retrieve project details with metrics"
        project_details = project_metrics_resp.json()
        metrics = project_details.get("metrics") or project_details.get("timeTrackingMetrics")
        assert metrics, "Project metrics missing in response"
        assert metrics.get("totalLoggedTime") and metrics["totalLoggedTime"] >= 120, "Logged time not reflected in project metrics"

    finally:
        # Cleanup created resources if possible
        def safe_delete(url, desc):
            try:
                resp = session.delete(url, timeout=TIMEOUT)
                if resp.status_code not in (200, 204, 404):
                    print(f"Warning: failed to delete {desc}, status {resp.status_code}")
            except Exception as e:
                print(f"Exception on deleting {desc}: {e}")

        if 'time_log_id' in locals():
            safe_delete(f"{TIMELOG_URL}/{time_log_id}", "time log")
        if 'task_id' in locals():
            safe_delete(f"{TASK_CREATE_URL}/{task_id}", "task")
        if 'project_id' in locals():
            safe_delete(f"{PROJECT_CREATE_URL}/{project_id}", "project")
        if 'client_id' in locals():
            safe_delete(f"{client_create_url}/{client_id}", "client")

test_postappactionstimelogtslogtimewithvaliddata()
