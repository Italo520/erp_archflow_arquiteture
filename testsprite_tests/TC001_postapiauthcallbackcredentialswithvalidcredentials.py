import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_post_api_auth_callback_credentials_with_valid_credentials():
    login_url = f"{BASE_URL}/api/auth/callback/credentials"
    protected_url = f"{BASE_URL}/api/client"

    # Replace with existing valid test user credentials
    credentials_payload = {
        "username": "valid_username",
        "password": "valid_password"
    }
    headers = {
        "Content-Type": "application/json"
    }

    session = requests.Session()
    try:
        # Step 1: Authenticate with valid credentials
        auth_response = session.post(login_url, json=credentials_payload, headers=headers, timeout=TIMEOUT)
        assert auth_response.status_code == 200, f"Expected status code 200, got {auth_response.status_code}"

        # Check for session cookie or JWT token in response or cookies
        jwt_token = None
        # Try to find JWT in JSON response
        try:
            resp_json = auth_response.json()
            if "token" in resp_json:
                jwt_token = resp_json.get("token")
        except Exception:
            resp_json = None

        # If JWT token not found in body, check cookies for session cookie
        if not jwt_token and session.cookies:
            # assume session cookie presence means authenticated session
            assert session.cookies, "Session cookies missing after authentication"

        # Step 2: Access a protected route using the authenticated session or JWT
        if jwt_token:
            protected_headers = {
                "Authorization": f"Bearer {jwt_token}"
            }
        else:
            protected_headers = {}

        protected_response = session.get(protected_url, headers=protected_headers, timeout=TIMEOUT)
        assert protected_response.status_code == 200, f"Accessing protected route failed with status {protected_response.status_code}"

        # Check authenticated user context in returned data
        try:
            protected_data = protected_response.json()
            # Basic check: response includes client list or array or object
            assert protected_data is not None, "Protected route response json is None"
        except Exception:
            assert False, "Protected route response is not valid JSON"

    finally:
        session.close()

test_post_api_auth_callback_credentials_with_valid_credentials()
