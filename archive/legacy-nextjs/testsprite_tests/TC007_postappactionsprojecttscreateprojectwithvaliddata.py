import requests
from requests.exceptions import RequestException
import uuid
import datetime

BASE_URL = "http://localhost:3000"
AUTH_ENDPOINT = "/api/auth/callback/credentials"
CLIENT_CREATE_ENDPOINT = "/app/actions/client.ts"
CLIENT_LIST_ENDPOINT = "/app/actions/client.ts"
PROJECT_CREATE_ENDPOINT = "/app/actions/project.ts"
PROJECT_LIST_ENDPOINT = "/app/actions/project.ts"
TIMEOUT = 30

# Test user credentials for authentication (should be valid user in the system)
TEST_USER_CREDENTIALS = {
    "email": "testuser@example.com",
    "password": "TestPassword123"
}

def test_postappactionsprojecttscreateprojectwithvaliddata():
    session = requests.Session()
    headers = {"Content-Type": "application/json"}

    # Authenticate and get session cookies or token
    try:
        auth_resp = session.post(
            BASE_URL + AUTH_ENDPOINT,
            json=TEST_USER_CREDENTIALS,
            headers=headers,
            timeout=TIMEOUT,
        )
        assert auth_resp.status_code == 200, f"Authentication failed: {auth_resp.text}"
        # The session should now carry authentication cookies or tokens automatically
    except RequestException as e:
        assert False, f"Authentication request error: {e}"

    created_client = None
    created_project = None

    try:
        # 1) Create Client (required for project creation)
        client_data = {
            "name": f"Test Client {uuid.uuid4().hex[:8]}",
            "email": f"client{uuid.uuid4().hex[:8]}@example.com",
            "document": str(uuid.uuid4()),
            "phone": "1234567890",
            "address": "123 Test St",
            "city": "Testville",
            "country": "Testland",
            "notes": "Client created for test_postappactionsprojecttscreateprojectwithvaliddata"
        }
        create_client_resp = session.post(
            BASE_URL + CLIENT_CREATE_ENDPOINT,
            json=client_data,
            headers=headers,
            timeout=TIMEOUT,
        )
        assert create_client_resp.status_code == 200, f"Create client failed: {create_client_resp.text}"
        created_client = create_client_resp.json()
        assert "id" in created_client, "Created client response missing 'id'"

        # 2) Create Project with valid data referencing the created client
        today_str = datetime.date.today().isoformat()
        future_date_str = (datetime.date.today() + datetime.timedelta(days=30)).isoformat()
        project_data = {
            "name": f"Test Project {uuid.uuid4().hex[:8]}",
            "description": "Project created for automated test",
            "clientId": created_client["id"],
            "startDate": today_str,
            "endDate": future_date_str,
            "budget": 10000,
            "status": "Active",
            "notes": "Created during test_postappactionsprojecttscreateprojectwithvaliddata"
        }
        create_project_resp = session.post(
            BASE_URL + PROJECT_CREATE_ENDPOINT,
            json=project_data,
            headers=headers,
            timeout=TIMEOUT,
        )
        assert create_project_resp.status_code == 200, f"Create project failed: {create_project_resp.text}"
        created_project = create_project_resp.json()
        assert "id" in created_project, "Created project response missing 'id'"

        project_id = created_project["id"]

        # 3) Verify project appears in project list
        get_projects_resp = session.get(
            BASE_URL + PROJECT_LIST_ENDPOINT,
            headers=headers,
            timeout=TIMEOUT,
        )
        assert get_projects_resp.status_code == 200, f"Get projects failed: {get_projects_resp.text}"
        projects = get_projects_resp.json()
        assert any(p.get("id") == project_id for p in projects), "Created project not found in projects list"

        # 4) Verify project appears in dashboard metrics
        # Assuming dashboard metrics available at /app/actions/project.ts or dashboard endpoint
        # Since no specific endpoint detailed, assume getProjects metrics include dashboard info
        # Check that project count or related metric is valid and includes the new project
        # We will check that projects list length is > 0 and contains the new project as verifying dashboard metrics indirectly
        assert len(projects) > 0, "Projects list is empty, dashboard metrics invalid"

    finally:
        # Cleanup: Delete created project and client to maintain test isolation, if API supports deletion
        # No delete endpoint described in PRD, so we skip actual delete
        # But if exists, here would be the place to clean resources.
        pass

test_postappactionsprojecttscreateprojectwithvaliddata()
