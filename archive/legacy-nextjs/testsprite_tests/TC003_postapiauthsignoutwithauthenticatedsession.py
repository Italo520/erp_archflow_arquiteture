import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

# These credentials should be valid credentials known to the system for testing
VALID_CREDENTIALS = {
    "email": "testuser@example.com",
    "password": "TestUserPassword123!"
}

def test_postapiauthsignoutwithauthenticatedsession():
    session = requests.Session()
    try:
        # Step 1: Authenticate user and obtain a session (cookies or token)
        auth_response = session.post(
            f"{BASE_URL}/api/auth/callback/credentials",
            json=VALID_CREDENTIALS,
            timeout=TIMEOUT
        )
        assert auth_response.status_code == 200, f"Authentication failed: {auth_response.text}"
        
        # Step 2: Use authenticated session to access a protected route (e.g. get clients as example)
        protected_response_before_signout = session.get(
            f"{BASE_URL}/api/client",
            timeout=TIMEOUT
        )
        assert protected_response_before_signout.status_code == 200, "Protected route access failed before signout, expected 200."

        # Step 3: Sign out with the authenticated session
        signout_response = session.post(
            f"{BASE_URL}/api/auth/signout",
            timeout=TIMEOUT
        )
        assert signout_response.status_code == 200, "Sign out did not return 200 confirmation."

        # Step 4: Try to access the protected route again after sign out
        protected_response_after_signout = session.get(
            f"{BASE_URL}/api/client",
            timeout=TIMEOUT
        )
        # After sign out the session should be cleared and protected routes require login - expect 401 or 403
        assert protected_response_after_signout.status_code in (401, 403), \
            f"Expected 401 or 403 after signout but got {protected_response_after_signout.status_code}."

    finally:
        session.close()


test_postapiauthsignoutwithauthenticatedsession()
