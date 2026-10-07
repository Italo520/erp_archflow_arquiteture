import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

# Credentials for authentication (replace with valid test credentials)
AUTH_CREDENTIALS = {
    "username": "testuser@example.com",
    "password": "testpassword"
}


def authenticate():
    try:
        resp = requests.post(
            f"{BASE_URL}/api/auth/callback/credentials",
            json=AUTH_CREDENTIALS,
            headers={"Content-Type": "application/json"},
            timeout=TIMEOUT
        )
        resp.raise_for_status()
        # Assuming response includes a token in JSON response "token"
        try:
            json_resp = resp.json()
        except Exception as e:
            raise RuntimeError(f"Authentication response is not valid JSON: {e}")
        token = json_resp.get("token")
        if not token:
            raise ValueError("Authentication token not found in response")
        return token
    except Exception as e:
        raise RuntimeError(f"Authentication failed: {e}")


def create_client(token):
    client_data = {
        "name": "Test Client TC008",
        "document": "TC008-123456",
        "email": "tc008-client@example.com"
    }
    headers = {
        "Authorization": f"Bearer {token}"
    }
    try:
        resp = requests.post(
            f"{BASE_URL}/app/actions/client.ts",
            json=client_data,
            headers=headers,
            timeout=TIMEOUT
        )
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        raise RuntimeError(f"Create client failed: {e}")


def create_project(token, client_id):
    project_data = {
        "name": "Test Project TC008",
        "clientId": client_id,
        "startDate": "2024-01-01",
        "endDate": "2024-12-31",
        "architecturalContext": {
            "phases": ["design", "construction"],
            "workflow": "standard"
        }
    }
    headers = {
        "Authorization": f"Bearer {token}"
    }
    try:
        resp = requests.post(
            f"{BASE_URL}/app/actions/project.ts",
            json=project_data,
            headers=headers,
            timeout=TIMEOUT
        )
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        raise RuntimeError(f"Create project failed: {e}")


def delete_project(token, project_id):
    # No explicit delete endpoint given, assuming DELETE on /app/actions/project.ts with projectId as param
    headers = {
        "Authorization": f"Bearer {token}"
    }
    try:
        resp = requests.delete(
            f"{BASE_URL}/app/actions/project.ts",
            params={"projectId": project_id},
            headers=headers,
            timeout=TIMEOUT
        )
        # Could be 204 No Content, treat 2xx as success
        if resp.status_code // 100 != 2:
            raise RuntimeError(f"Failed to delete project id {project_id}, status code {resp.status_code}")
    except Exception:
        # Swallow exceptions here to not mask original errors
        pass


def delete_client(token, client_id):
    # No explicit delete endpoint given, assuming DELETE on /app/actions/client.ts with clientId as param
    headers = {
        "Authorization": f"Bearer {token}"
    }
    try:
        resp = requests.delete(
            f"{BASE_URL}/app/actions/client.ts",
            params={"clientId": client_id},
            headers=headers,
            timeout=TIMEOUT
        )
        if resp.status_code // 100 != 2:
            raise RuntimeError(f"Failed to delete client id {client_id}, status code {resp.status_code}")
    except Exception:
        pass


def test_get_kanban_board_with_valid_project_context():
    token = authenticate()
    headers = {"Authorization": f"Bearer {token}"}

    client = None
    project = None
    try:
        # Create client
        client_resp = create_client(token)
        client = client_resp.get("id")
        assert client is not None, "Client ID not found in create client response"

        # Create project with the client ID
        project_resp = create_project(token, client)
        project = project_resp.get("id")
        assert project is not None, "Project ID not found in create project response"

        # Call GET Kanban board endpoint with valid project context
        # Assuming project context is passed as query param "projectId"
        resp = requests.get(
            f"{BASE_URL}/app/actions/kanban.ts",
            headers=headers,
            params={"projectId": project},
            timeout=TIMEOUT
        )
        assert resp.status_code == 200, f"Expected status code 200, got {resp.status_code}"

        json_data = resp.json()
        # Validate the presence of keys 'lists', 'tasks', and 'cardPositions'
        assert "lists" in json_data and isinstance(json_data["lists"], list), "Missing or invalid 'lists' in response"
        assert "tasks" in json_data and isinstance(json_data["tasks"], list), "Missing or invalid 'tasks' in response"
        assert "cardPositions" in json_data and isinstance(json_data["cardPositions"], dict), "Missing or invalid 'cardPositions' in response"

    finally:
        # Cleanup project and client if created
        if project:
            delete_project(token, project)
        if client:
            delete_client(token, client)


test_get_kanban_board_with_valid_project_context()
