package com.archflow.modules.storage;

import com.archflow.core.security.JwtService;
import com.archflow.modules.auth.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = StorageController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("StorageController - Testes da Camada Web")
class StorageControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private StorageService storageService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserRepository userRepository;

    @Test
    @DisplayName("ECP Válido: POST /api/v1/storage/upload deve receber multipart e retornar metadados")
    void shouldUploadFileSuccessfully() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "memorial-descritivo.pdf",
                "application/pdf",
                "conteudo do memorial".getBytes(StandardCharsets.UTF_8)
        );

        Map<String, String> mockResponse = Map.of(
                "fileKey", "uuid-memorial.pdf",
                "fileName", "memorial-descritivo.pdf",
                "fileUrl", "/api/v1/storage/download/uuid-memorial.pdf",
                "mimeType", "application/pdf",
                "fileSize", "20"
        );

        when(storageService.storeFile(any())).thenReturn(mockResponse);

        mockMvc.perform(multipart("/api/v1/storage/upload").file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fileKey").value("uuid-memorial.pdf"))
                .andExpect(jsonPath("$.fileName").value("memorial-descritivo.pdf"))
                .andExpect(jsonPath("$.fileUrl").value("/api/v1/storage/download/uuid-memorial.pdf"));
    }

    @Test
    @DisplayName("ECP Válido: GET /api/v1/storage/download/:fileKey deve retornar recurso para download")
    void shouldDownloadFileSuccessfully() throws Exception {
        byte[] data = "arquivo binario para download".getBytes(StandardCharsets.UTF_8);
        Resource resource = new ByteArrayResource(data) {
            @Override
            public String getFilename() {
                return "projeto-executivo.pdf";
            }
        };

        when(storageService.loadFileAsResource("uuid-key.pdf")).thenReturn(resource);

        mockMvc.perform(get("/api/v1/storage/download/uuid-key.pdf"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"projeto-executivo.pdf\""))
                .andExpect(header().string(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE));
    }
}
