package com.archflow.modules.inspection.controller;

import com.archflow.core.exception.GlobalExceptionHandler;
import com.archflow.modules.inspection.domain.InspectionStatus;
import com.archflow.modules.inspection.domain.PunchListSeverity;
import com.archflow.modules.inspection.domain.PunchListStatus;
import com.archflow.modules.inspection.dto.CreatePunchListItemRequest;
import com.archflow.modules.inspection.dto.CreateSiteInspectionRequest;
import com.archflow.modules.inspection.dto.PunchListItemResponse;
import com.archflow.modules.inspection.dto.ResolvePunchListItemRequest;
import com.archflow.modules.inspection.dto.SiteInspectionResponse;
import com.archflow.modules.inspection.service.InspectionService;
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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = InspectionController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
@DisplayName("InspectionController - Testes da Camada Web")
class InspectionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private InspectionService inspectionService;

    @MockitoBean
    private com.archflow.core.security.JwtService jwtService;

    @MockitoBean
    private com.archflow.modules.auth.repository.UserRepository userRepository;

    private SiteInspectionResponse sampleInspectionResponse(String id, String title) {
        return new SiteInspectionResponse(
            id, title, LocalDateTime.now(), InspectionStatus.DRAFT,
            "Notas de obra", "Ensolarado", "proj-1", "user-1",
            LocalDateTime.now(), LocalDateTime.now()
        );
    }

    @Nested
    @DisplayName("Endpoint GET /api/v1/inspections")
    class ListInspectionsTests {

        @Test
        @DisplayName("Deve retornar 200 OK com página de vistorias")
        void shouldReturnPagedInspections() throws Exception {
            SiteInspectionResponse inspection = sampleInspectionResponse("insp-1", "Vistoria Fase 1");
            when(inspectionService.listInspections(any(), any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(inspection)));

            mockMvc.perform(get("/api/v1/inspections"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value("insp-1"))
                .andExpect(jsonPath("$.content[0].title").value("Vistoria Fase 1"));
        }
    }

    @Nested
    @DisplayName("Endpoint POST /api/v1/inspections")
    class CreateInspectionTests {

        @Test
        @DisplayName("Deve retornar 201 Created quando payload for válido")
        void shouldCreateInspectionSuccessfully() throws Exception {
            CreateSiteInspectionRequest request = new CreateSiteInspectionRequest(
                "Vistoria Acabamento", LocalDateTime.now(), "Notas", "Chuvoso", "proj-1"
            );

            SiteInspectionResponse response = sampleInspectionResponse("insp-new", request.title());
            when(inspectionService.createInspection(any(CreateSiteInspectionRequest.class), any())).thenReturn(response);

            mockMvc.perform(post("/api/v1/inspections")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.id").value("insp-new"))
                .andExpect(jsonPath("$.title").value("Vistoria Acabamento"));
        }

        @Test
        @DisplayName("Deve retornar 400 Bad Request RFC 7807 quando título estiver em branco")
        void shouldReturn400WhenTitleBlank() throws Exception {
            CreateSiteInspectionRequest invalidRequest = new CreateSiteInspectionRequest(
                "", null, null, null, "proj-1"
            );

            mockMvc.perform(post("/api/v1/inspections")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Validation Error"))
                .andExpect(jsonPath("$.invalidParams.title").exists());
        }
    }

    @Nested
    @DisplayName("Endpoint PATCH /api/v1/inspections/{id}/status")
    class UpdateStatusTests {

        @Test
        @DisplayName("Deve retornar 200 OK ao atualizar status")
        void shouldUpdateStatusSuccessfully() throws Exception {
            SiteInspectionResponse response = sampleInspectionResponse("insp-1", "Vistoria");
            when(inspectionService.updateInspectionStatus("insp-1", InspectionStatus.COMPLETED)).thenReturn(response);

            mockMvc.perform(patch("/api/v1/inspections/insp-1/status")
                    .param("status", "COMPLETED"))
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Endpoints de Punch List")
    class PunchListEndpointTests {

        @Test
        @DisplayName("POST /api/v1/inspections/{id}/items: Deve criar item de pendência")
        void shouldAddPunchListItem() throws Exception {
            CreatePunchListItemRequest request = new CreatePunchListItemRequest(
                "Cozinha", "Pintura", "Empreiteiro X", "Tinta descascando",
                PunchListSeverity.MEDIUM, LocalDateTime.now().plusDays(2), "antes.jpg"
            );

            PunchListItemResponse response = new PunchListItemResponse(
                "item-1", request.environment(), request.contractorTrade(), request.contractorName(),
                request.description(), request.severity(), PunchListStatus.PENDING, request.dueDate(),
                request.beforePhotoUrl(), null, null, null, "insp-1", "proj-1",
                LocalDateTime.now(), LocalDateTime.now()
            );

            when(inspectionService.addPunchListItem(eq("insp-1"), any(CreatePunchListItemRequest.class))).thenReturn(response);

            mockMvc.perform(post("/api/v1/inspections/insp-1/items")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("item-1"))
                .andExpect(jsonPath("$.environment").value("Cozinha"));
        }

        @Test
        @DisplayName("PATCH /api/v1/inspections/items/{itemId}/resolve: Deve resolver item")
        void shouldResolveItem() throws Exception {
            ResolvePunchListItemRequest request = new ResolvePunchListItemRequest("Resolvido", "depois.jpg");
            PunchListItemResponse response = new PunchListItemResponse(
                "item-1", "Cozinha", "Pintura", "Empreiteiro X", "Desc",
                PunchListSeverity.MEDIUM, PunchListStatus.RESOLVED, null, "antes.jpg",
                "depois.jpg", "Resolvido", LocalDateTime.now(), "insp-1", "proj-1",
                LocalDateTime.now(), LocalDateTime.now()
            );

            when(inspectionService.resolvePunchListItem(eq("item-1"), any(ResolvePunchListItemRequest.class))).thenReturn(response);

            mockMvc.perform(patch("/api/v1/inspections/items/item-1/resolve")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RESOLVED"));
        }
    }

    @Nested
    @DisplayName("Endpoint DELETE /api/v1/inspections/{id}")
    class DeleteInspectionTests {

        @Test
        @DisplayName("Deve retornar 204 No Content no soft delete de vistoria")
        void shouldDeleteInspection() throws Exception {
            doNothing().when(inspectionService).deleteInspection("insp-1");

            mockMvc.perform(delete("/api/v1/inspections/insp-1"))
                .andExpect(status().isNoContent());
        }
    }
}
