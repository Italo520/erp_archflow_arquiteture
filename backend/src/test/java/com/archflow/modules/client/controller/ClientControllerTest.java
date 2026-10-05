package com.archflow.modules.client.controller;

import com.archflow.core.exception.GlobalExceptionHandler;
import com.archflow.modules.client.domain.ClientCategory;
import com.archflow.modules.client.domain.ClientLegalType;
import com.archflow.modules.client.domain.ClientStatus;
import com.archflow.modules.client.domain.ContactPreference;
import com.archflow.modules.client.dto.ClientResponse;
import com.archflow.modules.client.dto.CreateClientRequest;
import com.archflow.modules.client.dto.UpdateClientRequest;
import com.archflow.modules.client.dto.UpdateClientStatusRequest;
import com.archflow.modules.client.service.ClientService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ClientController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
@DisplayName("ClientController - Testes da Camada Web")
class ClientControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ClientService clientService;

    @MockitoBean
    private com.archflow.core.security.JwtService jwtService;

    @MockitoBean
    private com.archflow.modules.auth.repository.UserRepository userRepository;

    private ClientResponse sampleClientResponse(String id, String name, String email) {
        return new ClientResponse(
            id, name, email, "11988887777", "https://arq.com",
            ClientLegalType.PF, "12345678901", null, null, "Rua das Flores, 100",
            ClientCategory.RESIDENTIAL, ClientStatus.ACTIVE, 5.0, BigDecimal.valueOf(15000.00),
            null, "Cliente vip", ContactPreference.WHATSAPP, "user-1",
            LocalDateTime.now(), LocalDateTime.now(), LocalDateTime.now()
        );
    }

    @Nested
    @DisplayName("Endpoint GET /api/v1/clients")
    class ListClientsTests {

        @Test
        @DisplayName("Deve retornar 200 OK com página de clientes")
        void shouldReturnPagedClients() throws Exception {
            ClientResponse client = sampleClientResponse("c-1", "Studio Arquitetura", "studio@arq.com");
            when(clientService.listClients(any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(client)));

            mockMvc.perform(get("/api/v1/clients")
                    .param("page", "0")
                    .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value("c-1"))
                .andExpect(jsonPath("$.content[0].name").value("Studio Arquitetura"));
        }
    }

    @Nested
    @DisplayName("Endpoint GET /api/v1/clients/{id}")
    class GetClientByIdTests {

        @Test
        @DisplayName("Deve retornar 200 OK com dados do cliente")
        void shouldReturnClientById() throws Exception {
            ClientResponse client = sampleClientResponse("c-1", "Studio Arquitetura", "studio@arq.com");
            when(clientService.getClientById("c-1")).thenReturn(client);

            mockMvc.perform(get("/api/v1/clients/c-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("c-1"))
                .andExpect(jsonPath("$.name").value("Studio Arquitetura"))
                .andExpect(jsonPath("$.email").value("studio@arq.com"));
        }
    }

    @Nested
    @DisplayName("Endpoint POST /api/v1/clients")
    class CreateClientTests {

        @Test
        @DisplayName("Deve retornar 201 Created quando payload for válido")
        void shouldCreateClientSuccessfully() throws Exception {
            CreateClientRequest request = new CreateClientRequest(
                "Carlos Silva", "carlos@arq.com", "11988887777", null,
                ClientLegalType.PF, "123.456.789-01", null, null, null,
                ClientCategory.RESIDENTIAL, ContactPreference.WHATSAPP, null, null
            );
            ClientResponse response = sampleClientResponse("c-new", request.name(), request.email());

            when(clientService.createClient(any(CreateClientRequest.class))).thenReturn(response);

            mockMvc.perform(post("/api/v1/clients")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.id").value("c-new"))
                .andExpect(jsonPath("$.name").value("Carlos Silva"));
        }

        @Test
        @DisplayName("Deve retornar 400 Bad Request RFC 7807 quando campos obrigatórios estiverem ausentes")
        void shouldReturn400WhenInvalidFields() throws Exception {
            CreateClientRequest invalidRequest = new CreateClientRequest(
                "", "email-invalido", null, null,
                null, null, null, null, null,
                null, null, null, null
            );

            mockMvc.perform(post("/api/v1/clients")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Validation Error"))
                .andExpect(jsonPath("$.invalidParams.name").exists())
                .andExpect(jsonPath("$.invalidParams.email").exists())
                .andExpect(jsonPath("$.invalidParams.legalType").exists())
                .andExpect(jsonPath("$.invalidParams.category").exists());
        }
    }

    @Nested
    @DisplayName("Endpoint PUT /api/v1/clients/{id}")
    class UpdateClientTests {

        @Test
        @DisplayName("Deve retornar 200 OK com cliente atualizado")
        void shouldUpdateClientSuccessfully() throws Exception {
            UpdateClientRequest request = new UpdateClientRequest(
                "Carlos Atualizado", "carlos.novo@arq.com", "11988887777", null,
                ClientLegalType.PF, "12345678901", null, null, null,
                ClientCategory.RESIDENTIAL, ClientStatus.ACTIVE, 5.0, ContactPreference.WHATSAPP, null, null, null
            );
            ClientResponse response = sampleClientResponse("c-1", request.name(), request.email());

            when(clientService.updateClient(eq("c-1"), any(UpdateClientRequest.class))).thenReturn(response);

            mockMvc.perform(put("/api/v1/clients/c-1")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Carlos Atualizado"));
        }
    }

    @Nested
    @DisplayName("Endpoint PATCH /api/v1/clients/{id}/status")
    class UpdateStatusTests {

        @Test
        @DisplayName("Deve retornar 200 OK ao atualizar status")
        void shouldUpdateStatusSuccessfully() throws Exception {
            UpdateClientStatusRequest request = new UpdateClientStatusRequest(ClientStatus.ACTIVE);
            ClientResponse response = sampleClientResponse("c-1", "Carlos", "carlos@arq.com");

            when(clientService.updateClientStatus("c-1", ClientStatus.ACTIVE)).thenReturn(response);

            mockMvc.perform(patch("/api/v1/clients/c-1/status")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Endpoint DELETE /api/v1/clients/{id}")
    class DeleteClientTests {

        @Test
        @DisplayName("Deve retornar 204 No Content ao realizar soft delete")
        void shouldDeleteClient() throws Exception {
            doNothing().when(clientService).deleteClient("c-1");

            mockMvc.perform(delete("/api/v1/clients/c-1"))
                .andExpect(status().isNoContent());
        }
    }
}
