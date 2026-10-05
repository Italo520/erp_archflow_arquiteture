package com.archflow.modules.inspection.service;

import com.archflow.core.exception.BusinessException;
import com.archflow.core.exception.ResourceNotFoundException;
import com.archflow.modules.inspection.domain.InspectionStatus;
import com.archflow.modules.inspection.domain.PunchListSeverity;
import com.archflow.modules.inspection.domain.PunchListStatus;
import com.archflow.modules.inspection.dto.CreatePunchListItemRequest;
import com.archflow.modules.inspection.dto.CreateSiteInspectionRequest;
import com.archflow.modules.inspection.dto.PunchListItemResponse;
import com.archflow.modules.inspection.dto.ResolvePunchListItemRequest;
import com.archflow.modules.inspection.dto.SiteInspectionResponse;
import com.archflow.modules.inspection.entity.PunchListItem;
import com.archflow.modules.inspection.entity.SiteInspection;
import com.archflow.modules.inspection.mapper.InspectionMapper;
import com.archflow.modules.inspection.repository.PunchListItemRepository;
import com.archflow.modules.inspection.repository.SiteInspectionRepository;
import com.archflow.modules.inspection.service.impl.InspectionServiceImpl;
import com.archflow.modules.project.entity.Project;
import com.archflow.modules.project.repository.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("InspectionService - Suíte de Testes Formais de QA")
class InspectionServiceTest {

    @Mock
    private SiteInspectionRepository inspectionRepository;

    @Mock
    private PunchListItemRepository itemRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private InspectionMapper mapper;

    private InspectionServiceImpl inspectionService;

    @BeforeEach
    void setUp() {
        inspectionService = new InspectionServiceImpl(
            inspectionRepository,
            itemRepository,
            projectRepository,
            mapper
        );
    }

    private SiteInspection createMockInspection(String id, String title, String projectId) {
        SiteInspection inspection = new SiteInspection(
            title, LocalDateTime.now(), InspectionStatus.DRAFT,
            "Notas gerais de vistoria", "Ensolarado", projectId, "inspector-1"
        );
        inspection.setId(id);
        return inspection;
    }

    private SiteInspectionResponse createMockInspectionResponse(String id, String title, String projectId) {
        return new SiteInspectionResponse(
            id, title, LocalDateTime.now(), InspectionStatus.DRAFT,
            "Notas gerais", "Ensolarado", projectId, "inspector-1",
            LocalDateTime.now(), LocalDateTime.now()
        );
    }

    @Nested
    @DisplayName("ECP e Regras de Negócio - Criação de Vistoria")
    class CreateInspectionTests {

        @Test
        @DisplayName("ECP Válido 1: Deve criar vistoria técnica com data explícita e projeto existente")
        void shouldCreateInspectionWithExplicitDate() {
            LocalDateTime inspectionDate = LocalDateTime.now().minusDays(1);
            CreateSiteInspectionRequest request = new CreateSiteInspectionRequest(
                "Vistoria Estrutural Fundações", inspectionDate, "Sem anomalias", "Nublado", "proj-1"
            );

            Project project = Project.builder().id("proj-1").name("Edifício Solar").build();
            SiteInspection unmapped = createMockInspection(null, request.title(), "proj-1");
            SiteInspection saved = createMockInspection("insp-1", request.title(), "proj-1");
            SiteInspectionResponse response = createMockInspectionResponse("insp-1", request.title(), "proj-1");

            when(projectRepository.findByIdAndDeletedAtIsNull("proj-1")).thenReturn(Optional.of(project));
            when(mapper.toInspectionEntity(request)).thenReturn(unmapped);
            when(inspectionRepository.save(unmapped)).thenReturn(saved);
            when(mapper.toInspectionResponse(saved)).thenReturn(response);

            SiteInspectionResponse result = inspectionService.createInspection(request, "inspector-arq");

            assertThat(result).isNotNull();
            assertThat(result.id()).isEqualTo("insp-1");
            assertThat(unmapped.getInspectorId()).isEqualTo("inspector-arq");
            assertThat(unmapped.getDate()).isEqualTo(inspectionDate);
        }

        @Test
        @DisplayName("ECP Válido 2: Deve criar vistoria com data nula atribuindo data atual e inspectorId default")
        void shouldCreateInspectionWithNullDateAndDefaultInspector() {
            CreateSiteInspectionRequest request = new CreateSiteInspectionRequest(
                "Vistoria Alvenaria", null, null, null, "proj-1"
            );

            Project project = Project.builder().id("proj-1").name("Edifício Solar").build();
            SiteInspection unmapped = createMockInspection(null, request.title(), "proj-1");
            SiteInspection saved = createMockInspection("insp-2", request.title(), "proj-1");
            SiteInspectionResponse response = createMockInspectionResponse("insp-2", request.title(), "proj-1");

            when(projectRepository.findByIdAndDeletedAtIsNull("proj-1")).thenReturn(Optional.of(project));
            when(mapper.toInspectionEntity(request)).thenReturn(unmapped);
            when(inspectionRepository.save(unmapped)).thenReturn(saved);
            when(mapper.toInspectionResponse(saved)).thenReturn(response);

            SiteInspectionResponse result = inspectionService.createInspection(request, null);

            assertThat(result).isNotNull();
            assertThat(unmapped.getInspectorId()).isEqualTo("inspector-user");
            assertThat(unmapped.getDate()).isNotNull();
        }

        @Test
        @DisplayName("ECP Inválido: Rejeitar criação de vistoria quando projeto não for encontrado")
        void shouldRejectWhenProjectNotFound() {
            CreateSiteInspectionRequest request = new CreateSiteInspectionRequest(
                "Vistoria Inválida", null, null, null, "proj-inexistente"
            );

            when(projectRepository.findByIdAndDeletedAtIsNull("proj-inexistente")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> inspectionService.createInspection(request, "inspector-1"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Projeto não encontrado com id: proj-inexistente");
        }
    }

    @Nested
    @DisplayName("Tabela de Decisão - Resolução de Punch List e Ciclo de Vida")
    class PunchListLifecycleTests {

        @Test
        @DisplayName("Deve adicionar item de pendência à vistoria com sucesso")
        void shouldAddPunchListItem() {
            String inspectionId = "insp-10";
            SiteInspection inspection = createMockInspection(inspectionId, "Vistoria Final", "proj-10");

            CreatePunchListItemRequest request = new CreatePunchListItemRequest(
                "Suíte Master", "Pintura", "Empreiteiro Silva",
                "Retoque de massa corrida na parede sul", PunchListSeverity.LOW,
                LocalDateTime.now().plusDays(3), "https://foto.com/antes.jpg"
            );

            PunchListItem item = new PunchListItem(
                request.environment(), request.contractorTrade(), request.contractorName(),
                request.description(), request.severity(), PunchListStatus.PENDING,
                request.dueDate(), request.beforePhotoUrl(), inspectionId, "proj-10"
            );
            item.setId("item-1");

            PunchListItemResponse expectedResponse = new PunchListItemResponse(
                "item-1", request.environment(), request.contractorTrade(), request.contractorName(),
                request.description(), request.severity(), PunchListStatus.PENDING, request.dueDate(),
                request.beforePhotoUrl(), null, null, null, inspectionId, "proj-10",
                LocalDateTime.now(), LocalDateTime.now()
            );

            when(inspectionRepository.findByIdAndDeletedAtIsNull(inspectionId)).thenReturn(Optional.of(inspection));
            when(mapper.toPunchListEntity(request)).thenReturn(item);
            when(itemRepository.save(item)).thenReturn(item);
            when(mapper.toPunchListResponse(item)).thenReturn(expectedResponse);

            PunchListItemResponse result = inspectionService.addPunchListItem(inspectionId, request);

            assertThat(result).isNotNull();
            assertThat(result.id()).isEqualTo("item-1");
            assertThat(item.getStatus()).isEqualTo(PunchListStatus.PENDING);
        }

        @Test
        @DisplayName("Tabela de Decisão: Resolver item pendente com foto após e notas de resolução")
        void shouldResolvePendingItem() {
            String itemId = "item-resolve-1";
            PunchListItem item = new PunchListItem(
                "Varanda", "Piso", "Ceramista João", "Trocar piso trincado",
                PunchListSeverity.HIGH, PunchListStatus.PENDING, LocalDateTime.now(),
                "antes.jpg", "insp-1", "proj-1"
            );
            item.setId(itemId);

            ResolvePunchListItemRequest request = new ResolvePunchListItemRequest(
                "Piso substituído e rejuntado com sucesso", "https://foto.com/depois.jpg"
            );

            PunchListItemResponse response = new PunchListItemResponse(
                itemId, item.getEnvironment(), item.getContractorTrade(), item.getContractorName(),
                item.getDescription(), item.getSeverity(), PunchListStatus.RESOLVED, item.getDueDate(),
                item.getBeforePhotoUrl(), request.afterPhotoUrl(), request.resolutionNotes(),
                LocalDateTime.now(), "insp-1", "proj-1", LocalDateTime.now(), LocalDateTime.now()
            );

            when(itemRepository.findByIdAndDeletedAtIsNull(itemId)).thenReturn(Optional.of(item));
            when(itemRepository.save(item)).thenReturn(item);
            when(mapper.toPunchListResponse(item)).thenReturn(response);

            PunchListItemResponse result = inspectionService.resolvePunchListItem(itemId, request);

            assertThat(result).isNotNull();
            assertThat(item.getStatus()).isEqualTo(PunchListStatus.RESOLVED);
            assertThat(item.getResolutionNotes()).isEqualTo("Piso substituído e rejuntado com sucesso");
            assertThat(item.getAfterPhotoUrl()).isEqualTo("https://foto.com/depois.jpg");
            assertThat(item.getResolvedAt()).isNotNull();
        }

        @Test
        @DisplayName("Tabela de Decisão: Rejeitar resolução se item já estiver RESOLVED")
        void shouldRejectResolvingAlreadyResolvedItem() {
            String itemId = "item-already-resolved";
            PunchListItem item = new PunchListItem(
                "Varanda", "Piso", null, "Desc", PunchListSeverity.LOW,
                PunchListStatus.RESOLVED, null, null, "insp-1", "proj-1"
            );

            ResolvePunchListItemRequest request = new ResolvePunchListItemRequest("Notas", null);

            when(itemRepository.findByIdAndDeletedAtIsNull(itemId)).thenReturn(Optional.of(item));

            assertThatThrownBy(() -> inspectionService.resolvePunchListItem(itemId, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("já foi resolvido anteriormente");
        }

        @Test
        @DisplayName("Atualizar status da vistoria com sucesso")
        void shouldUpdateInspectionStatus() {
            String inspectionId = "insp-status-1";
            SiteInspection inspection = createMockInspection(inspectionId, "Vistoria", "proj-1");
            SiteInspectionResponse response = createMockInspectionResponse(inspectionId, "Vistoria", "proj-1");

            when(inspectionRepository.findByIdAndDeletedAtIsNull(inspectionId)).thenReturn(Optional.of(inspection));
            when(inspectionRepository.save(inspection)).thenReturn(inspection);
            when(mapper.toInspectionResponse(inspection)).thenReturn(response);

            SiteInspectionResponse result = inspectionService.updateInspectionStatus(inspectionId, InspectionStatus.COMPLETED);

            assertThat(result).isNotNull();
            assertThat(inspection.getStatus()).isEqualTo(InspectionStatus.COMPLETED);
        }

        @Test
        @DisplayName("Rejeitar atualização de status nulo da vistoria")
        void shouldRejectNullInspectionStatus() {
            assertThatThrownBy(() -> inspectionService.updateInspectionStatus("insp-1", null))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("O status da vistoria não pode ser nulo.");
        }

        @Test
        @DisplayName("Buscar vistoria por ID")
        void shouldGetInspectionById() {
            String inspectionId = "insp-find-1";
            SiteInspection inspection = createMockInspection(inspectionId, "Vistoria Encontrada", "proj-1");
            SiteInspectionResponse response = createMockInspectionResponse(inspectionId, "Vistoria Encontrada", "proj-1");

            when(inspectionRepository.findByIdAndDeletedAtIsNull(inspectionId)).thenReturn(Optional.of(inspection));
            when(mapper.toInspectionResponse(inspection)).thenReturn(response);

            SiteInspectionResponse result = inspectionService.getInspectionById(inspectionId);

            assertThat(result.id()).isEqualTo(inspectionId);
        }

        @Test
        @DisplayName("Listar pendências da vistoria")
        void shouldGetInspectionItems() {
            String inspectionId = "insp-items-1";
            SiteInspection inspection = createMockInspection(inspectionId, "Vistoria", "proj-1");
            PunchListItem item = new PunchListItem("Cozinha", "Pia", null, "Vazamento", PunchListSeverity.HIGH, PunchListStatus.PENDING, null, null, inspectionId, "proj-1");
            PunchListItemResponse itemResp = new PunchListItemResponse("item-1", "Cozinha", "Pia", null, "Vazamento", PunchListSeverity.HIGH, PunchListStatus.PENDING, null, null, null, null, null, inspectionId, "proj-1", LocalDateTime.now(), LocalDateTime.now());

            when(inspectionRepository.findByIdAndDeletedAtIsNull(inspectionId)).thenReturn(Optional.of(inspection));
            when(itemRepository.findByInspectionIdAndDeletedAtIsNullOrderByCreatedAtDesc(inspectionId)).thenReturn(List.of(item));
            when(mapper.toPunchListResponse(item)).thenReturn(itemResp);

            List<PunchListItemResponse> items = inspectionService.getInspectionItems(inspectionId);

            assertThat(items).hasSize(1);
        }

        @Test
        @DisplayName("Soft Delete de vistoria técnica")
        void shouldSoftDeleteInspection() {
            String inspectionId = "insp-del-1";
            SiteInspection inspection = createMockInspection(inspectionId, "Vistoria Para Deletar", "proj-1");

            when(inspectionRepository.findByIdAndDeletedAtIsNull(inspectionId)).thenReturn(Optional.of(inspection));

            inspectionService.deleteInspection(inspectionId);

            assertThat(inspection.getDeletedAt()).isNotNull();
            assertThat(inspection.isDeleted()).isTrue();
            verify(inspectionRepository).save(inspection);
        }

        @Test
        @DisplayName("Listagem paginada de vistorias com busca e busca nula")
        void shouldListInspectionsWithSearch() {
            Pageable pageable = PageRequest.of(0, 10);
            SiteInspection inspection = createMockInspection("insp-list-1", "Vistoria Elétrica", "proj-1");
            SiteInspectionResponse response = createMockInspectionResponse("insp-list-1", "Vistoria Elétrica", "proj-1");

            when(inspectionRepository.searchInspections(eq("eletrica"), eq("proj-1"), eq(InspectionStatus.DRAFT), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(inspection), pageable, 1));
            when(mapper.toInspectionResponse(inspection)).thenReturn(response);

            Page<SiteInspectionResponse> result = inspectionService.listInspections(" eletrica ", "proj-1", InspectionStatus.DRAFT, pageable);

            assertThat(result.getTotalElements()).isEqualTo(1);
        }

        @Test
        @DisplayName("Listagem paginada de vistorias com busca em branco")
        void shouldListInspectionsWithBlankSearch() {
            Pageable pageable = PageRequest.of(0, 10);
            SiteInspection inspection = createMockInspection("insp-list-2", "Vistoria Geral", null);
            SiteInspectionResponse response = createMockInspectionResponse("insp-list-2", "Vistoria Geral", null);

            when(inspectionRepository.searchInspections(eq(null), eq(null), eq(null), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(inspection), pageable, 1));
            when(mapper.toInspectionResponse(inspection)).thenReturn(response);

            Page<SiteInspectionResponse> result = inspectionService.listInspections("   ", null, null, pageable);

            assertThat(result.getTotalElements()).isEqualTo(1);
        }
    }
}
