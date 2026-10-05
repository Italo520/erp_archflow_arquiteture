package com.archflow.modules.auth.service;

import com.archflow.modules.auth.dto.AuthResponse;
import com.archflow.modules.auth.dto.LoginRequest;
import com.archflow.modules.auth.dto.RegisterRequest;
import com.archflow.modules.auth.dto.UserResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    UserResponse getCurrentUser(String email);
}
