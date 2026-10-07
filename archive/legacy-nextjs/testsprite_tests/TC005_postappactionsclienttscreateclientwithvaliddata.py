import requests
import uuid

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

# Assuming valid authentication credentials are known and available
AUTH_CREDENTIALS = {
    "username": "testuser@example.com",
    "password": "StrongPassword123!"
}

def authenticate():
    url = f"{BASE_URL}/api/auth/callback/credentials"
    headers = {"Content-Type": "application/json"}
    response = requests.post(url, json=AUTH_CREDENTIALS, headers=headers, timeout=TIMEOUT)
    assert response.status_code == 200, f"Authentication failed with status {response.status_code}"
    # Return cookies from response to use for authenticated requests
    cookies = response.cookies
    assert cookies, "Authentication cookies not found in response"
    return cookies

def test_postappactionsclienttscreateclientwithvaliddata():
    cookies = authenticate()
    # Use Cookie header from cookies for authenticated requests
    cookie_header = '; '.join([f'{name}={value}' for name, value in cookies.items()])
    headers = {
        "Content-Type": "application/json",
        "Cookie": cookie_header
    }

    # Generate unique client data
    unique_id = str(uuid.uuid4())
    client_payload = {
        "name": f"Test Client {unique_id}",
        "email": f"testclient{unique_id[:8]}@example.com",
        "document": f"DOC-{unique_id[:8]}",
        "phone": "+1234567890",
        "address": "123 Test Lane",
        "notes": "Created for automated testing",
    }

    created_client_id = None

    try:
        # Create client
        create_url = f"{BASE_URL}/app/actions/client.ts"
        create_response = requests.post(create_url, json=client_payload, headers=headers, timeout=TIMEOUT)
        assert create_response.status_code == 200, f"Expected 200 OK but got {create_response.status_code}"
        created_client = create_response.json()
        # Validate created client fields at minimum presence and that IDs match
        created_client_id = created_client.get("id")
        assert created_client_id is not None, "Created client ID is missing in response"
        assert created_client.get("email") == client_payload["email"], "Email mismatch in created client"
        assert created_client.get("document") == client_payload["document"], "Document mismatch in created client"
        assert created_client.get("name") == client_payload["name"], "Name mismatch in created client"

        # Check client availability in client listings
        list_response = requests.get(create_url, headers=headers, timeout=TIMEOUT)
        assert list_response.status_code == 200, f"Expected 200 OK for client list but got {list_response.status_code}"
        clients_list = list_response.json()
        assert any(c.get("id") == created_client_id for c in clients_list), "Created client not found in client listing"

        # Check client detail view by filtering the listings or assuming same endpoint for detail by id
        # The PRD does not specify a detail endpoint, so verify again by filtering the list
        client_detail = next((c for c in clients_list if c.get("id") == created_client_id), None)
        assert client_detail is not None, "Created client detail not found in listing"
        assert client_detail["email"] == client_payload["email"], "Detail view email mismatch"
        assert client_detail["name"] == client_payload["name"], "Detail view name mismatch"

    finally:
        # Cleanup: delete the created client if possible - endpoint not provided,
        # so make assumption of DELETE to /app/actions/client.ts?id={id} or skip if not defined
        if created_client_id:
            try:
                delete_url = f"{BASE_URL}/app/actions/client.ts"
                del_response = requests.delete(delete_url,
                                              headers=headers,
                                              params={"id": created_client_id},
                                              timeout=TIMEOUT)
                # Not asserting here because deletion endpoint is not defined in PRD
            except Exception:
                pass

test_postappactionsclienttscreateclientwithvaliddata()
