package com.archflow.modules.auth.repository;

import com.archflow.modules.auth.domain.Role;
import com.archflow.modules.auth.entity.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@DisplayName("UserRepository Integration Tests with PostgreSQL")
class UserRepositoryIT {

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("Deve persistir e buscar usuário por e-mail com sucesso")
    void shouldSaveAndFindUserByEmail() {
        // Arrange
        User user = User.builder()
                .fullName("Juliana Designer")
                .email("juliana@archflow.com")
                .passwordHash("$2a$12$someHashedPassword")
                .role(Role.VIEWER)
                .build();

        // Act
        User saved = userRepository.save(user);
        Optional<User> found = userRepository.findByEmail("juliana@archflow.com");

        // Assert
        assertThat(saved.getId()).isNotBlank();
        assertThat(found).isPresent();
        assertThat(found.get().getFullName()).isEqualTo("Juliana Designer");
        assertThat(found.get().getRole()).isEqualTo(Role.VIEWER);
        assertThat(found.get().getCreatedAt()).isNotNull();
    }

    @Test
    @DisplayName("Deve verificar se e-mail existe no banco de dados")
    void shouldCheckIfEmailExists() {
        // Arrange
        User user = User.builder()
                .fullName("Marcos Engenheiro")
                .email("marcos@archflow.com")
                .passwordHash("pwdHash")
                .role(Role.EDITOR)
                .build();
        userRepository.save(user);

        // Act & Assert
        assertThat(userRepository.existsByEmail("marcos@archflow.com")).isTrue();
        assertThat(userRepository.existsByEmail("naoexiste@archflow.com")).isFalse();
    }

    @Test
    @DisplayName("Deve ignorar usuários excluídos (soft-deleted) em findByEmailAndDeletedAtIsNull")
    void shouldIgnoreSoftDeletedUsers() {
        // Arrange
        User user = User.builder()
                .fullName("Renato Antigo")
                .email("renato@archflow.com")
                .passwordHash("pwdHash")
                .role(Role.VIEWER)
                .build();
        user.markAsDeleted();
        userRepository.save(user);

        // Act
        Optional<User> foundActive = userRepository.findByEmailAndDeletedAtIsNull("renato@archflow.com");
        Optional<User> foundAny = userRepository.findByEmail("renato@archflow.com");

        // Assert
        assertThat(foundActive).isEmpty();
        assertThat(foundAny).isPresent();
        assertThat(foundAny.get().isDeleted()).isTrue();
    }
}
