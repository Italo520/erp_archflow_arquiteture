import requests

BASE_URL = "http://localhost:3000"
AUTH_ENDPOINT = "/api/auth/callback/credentials"
CLIENTS_ENDPOINT = "/app/actions/client.ts"
TIMEOUT = 30

# Update these with valid test credentials
TEST_USERNAME = "testuser@example.com"
TEST_PASSWORD = "TestPassword123!"

def test_get_clients_with_valid_auth_and_filters():
    session = requests.Session()
    try:
        # Authenticate user to get session cookie or token
        auth_payload = {
            "email": TEST_USERNAME,
            "password": TEST_PASSWORD
        }
        auth_headers = {
            "Content-Type": "application/json"
        }
        auth_response = session.post(
            BASE_URL + AUTH_ENDPOINT,
            json=auth_payload,
            headers=auth_headers,
            timeout=TIMEOUT
        )
        assert auth_response.status_code == 200, f"Authentication failed: {auth_response.text}"
        
        # Make GET request with optional filters (e.g., by name or status)
        params = {
            # Example filter: "status": "active",
            # No filters provided to test default behavior
        }
        get_clients_response = session.get(
            BASE_URL + CLIENTS_ENDPOINT,
            params=params,
            timeout=TIMEOUT
        )
        assert get_clients_response.status_code == 200, f"Get clients failed: {get_clients_response.text}"
        
        clients_data = get_clients_response.json()
        # Expect clients_data to be a list or dict containing a list. Validate type and content.
        assert isinstance(clients_data, (list, dict)), "Clients response is not list or dict"
        
        # If dict, try to extract client list
        if isinstance(clients_data, dict):
            # Common key might be 'clients' or similar
            client_list = clients_data.get("clients") or clients_data.get("data") or clients_data.get("items") or clients_data
            if isinstance(client_list, (list)):
                assert all(isinstance(c, dict) for c in client_list), "Client items are not dicts"
            else:
                # If not list, skip this deep check but ensure clients_data is dict not empty
                assert len(clients_data) > 0, "Clients response dict is empty"
        else:
            # If list, check elements are dicts
            assert all(isinstance(c, dict) for c in clients_data), "Client items are not dicts"

    finally:
        session.close()

test_get_clients_with_valid_auth_and_filters()
