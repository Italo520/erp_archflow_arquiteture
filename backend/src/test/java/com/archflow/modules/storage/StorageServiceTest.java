package com.archflow.modules.storage;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("StorageService - Testes Unitários de Armazenamento Técnico")
class StorageServiceTest {

    private StorageService storageService;

    @BeforeEach
    void setUp() {
        storageService = new StorageService();
    }

    @Test
    @DisplayName("ECP Válido: Deve salvar arquivo multipart e retornar metadados completos com UUID")
    void shouldStoreFileSuccessfully() {
        byte[] content = "Conteúdo da prancha arquitetônica".getBytes(StandardCharsets.UTF_8);
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "planta-executiva.dwg",
                "application/acad",
                content
        );

        Map<String, String> result = storageService.storeFile(file);

        assertThat(result).isNotNull();
        assertThat(result.get("fileName")).isEqualTo("planta-executiva.dwg");
        assertThat(result.get("fileKey")).endsWith(".dwg");
        assertThat(result.get("fileUrl")).startsWith("/api/v1/storage/download/");
        assertThat(result.get("mimeType")).isEqualTo("application/acad");
        assertThat(result.get("fileSize")).isEqualTo(String.valueOf(content.length));

        // Validar leitura subsequente do recurso
        Resource loaded = storageService.loadFileAsResource(result.get("fileKey"));
        assertThat(loaded.exists()).isTrue();
        assertThat(loaded.isReadable()).isTrue();
    }

    @Test
    @DisplayName("Boundary: Deve armazenar arquivo sem extensão com fallback seguro")
    void shouldStoreFileWithoutExtension() {
        byte[] content = "Dados binários sem extensão".getBytes(StandardCharsets.UTF_8);
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "README",
                "text/plain",
                content
        );

        Map<String, String> result = storageService.storeFile(file);

        assertThat(result).isNotNull();
        assertThat(result.get("fileName")).isEqualTo("README");
        assertThat(result.get("fileKey")).doesNotContain(".");
    }

    @Test
    @DisplayName("Error Guessing: Deve lançar exceção ao buscar chave de arquivo inexistente")
    void shouldThrowExceptionWhenFileNotFound() {
        assertThatThrownBy(() -> storageService.loadFileAsResource("chave-inexistente-12345.pdf"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Arquivo não encontrado ou inacessível");
    }

    @Test
    @DisplayName("Segurança / Path Traversal: Sanitização deve impedir acesso fora do diretório de armazenamento")
    void shouldPreventDirectoryTraversalAttack() {
        // Tentativa de Directory Traversal com ../../
        assertThatThrownBy(() -> storageService.loadFileAsResource("../../etc/shadow"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Arquivo não encontrado ou inacessível");
    }
}
