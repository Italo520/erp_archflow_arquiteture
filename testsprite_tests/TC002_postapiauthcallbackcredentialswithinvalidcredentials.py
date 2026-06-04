import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_postapiauthcallbackcredentialswithinvalidcredentials():
    url = f"{BASE_URL}/api/auth/callback/credentials"
    invalid_credentials_payload = {
        "email": "invalid_user@example.com",
        "password": "wrong_password"
    }
    headers = {
        "Content-Type": "application/json"
    }

    # Attempt login with invalid credentials
    response = requests.post(url, json=invalid_credentials_payload, headers=headers, timeout=TIMEOUT)
    
    # Validate 401 unauthorized response
    assert response.status_code == 401, f"Expected status code 401 but got {response.status_code}"
    
    # Attempt to access a protected route without auth token/session
    protected_url = f"{BASE_URL}/app/actions/client.ts"
    protected_response = requests.get(protected_url, timeout=TIMEOUT)
    
    # Validate 401 unauthorized or access denied for protected route
    assert protected_response.status_code in (401, 403), f"Access to protected route should be blocked but got status {protected_response.status_code}"

test_postapiauthcallbackcredentialswithinvalidcredentials()
