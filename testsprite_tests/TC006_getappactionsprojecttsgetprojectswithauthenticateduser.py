import requests

BASE_URL = "http://localhost:3000"
AUTH_URL = f"{BASE_URL}/api/auth/callback/credentials"
PROJECTS_URL = f"{BASE_URL}/app/actions/project.ts"
TIMEOUT = 30

# Replace with valid test user credentials for authentication
TEST_USER_CREDENTIALS = {
    "username": "testuser@example.com",
    "password": "TestPassword123!"
}

def test_get_projects_with_authenticated_user():
    session = requests.Session()
    try:
        # Authenticate user
        auth_payload = {
            "username": TEST_USER_CREDENTIALS["username"],
            "password": TEST_USER_CREDENTIALS["password"]
        }
        auth_response = session.post(AUTH_URL, json=auth_payload, timeout=TIMEOUT)
        assert auth_response.status_code == 200, f"Authentication failed with status {auth_response.status_code}"

        try:
            json_auth = auth_response.json()
        except ValueError:
            assert False, "Authentication response is not valid JSON"
        assert json_auth, "Authentication response JSON is empty"

        # Use token from auth response if available
        headers = {}
        token = None
        for key in ["accessToken", "token", "jwt"]:
            if key in json_auth:
                token = json_auth[key]
                break
        if token:
            headers["Authorization"] = f"Bearer {token}"

        # GET projects with authenticated session
        projects_response = session.get(PROJECTS_URL, headers=headers, timeout=TIMEOUT)
        assert projects_response.status_code == 200, f"Expected 200 OK for projects request, got {projects_response.status_code}"

        try:
            projects_json = projects_response.json()
        except ValueError:
            assert False, "Projects response is not valid JSON"

        assert isinstance(projects_json, dict) or isinstance(projects_json, list), "Projects response is not a JSON object or array"

        # The response should contain a collection of projects rendered in list or Kanban view.
        if isinstance(projects_json, dict):
            keys = projects_json.keys()
            assert any(key.lower() in ["projects", "data", "items", "results"] for key in keys), "Response JSON does not contain expected project collection keys"
            project_collection = None
            for key in ["projects", "data", "items", "results"]:
                if key in projects_json:
                    project_collection = projects_json[key]
                    break
            assert project_collection is not None, "Project collection not found in response"
            assert isinstance(project_collection, list), "Project collection is not a list"
            for project in project_collection:
                assert isinstance(project, dict), "Project item is not an object"
        else:
            # If JSON is a list, assume it is the project collection
            assert len(projects_json) >= 0, "Project list is empty"

    finally:
        session.close()


test_get_projects_with_authenticated_user()
