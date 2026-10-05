package com.archflow.modules.client.service;

import com.archflow.core.exception.BusinessException;
import com.archflow.core.exception.ResourceNotFoundException;
import com.archflow.modules.client.domain.ClientCategory;
import com.archflow.modules.client.domain.ClientLegalType;
import com.archflow.modules.client.domain.ClientStatus;
import com.archflow.modules.client.domain.ContactPreference;
import com.archflow.modules.client.dto.ClientResponse;
import com.archflow.modules.client.dto.CreateClientRequest;
import com.archflow.modules.client.dto.UpdateClientRequest;
import com.archflow.modules.client.entity.Client;
import com.archflow.modules.client.mapper.ClientMapper;
import com.archflow.modules.client.repository.ClientRepository;
import com.archflow.modules.client.service.impl.ClientServiceImpl;
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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("ClientService - Suíte de Testes Formais de QA")
class ClientServiceTest {

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private ClientMapper clientMapper;

    private ClientServiceImpl clientService;

    @BeforeEach
    void setUp() {
        clientService = new ClientServiceImpl(clientRepository, clientMapper);
    }

    private Client createMockClient(String id, String name, String email, String doc, ClientLegalType legalType) {
        return Client.builder()
            .id(id)
            .name(name)
            .email(email)
            .document(doc)
            .legalType(legalType)
            .category(ClientCategory.RESIDENTIAL)
            .status(ClientStatus.PROSPECT)
            .rating(5.0)
            .totalSpent(BigDecimal.ZERO)
            .contactPreference(ContactPreference.WHATSAPP)
            .build();
    }

    private ClientResponse createMockResponse(String id, String name, String email, String doc, ClientLegalType legalType) {
        return new ClientResponse(
            id, name, email, null, null, legalType, doc, null, null, null,
            ClientCategory.RESIDENTIAL, ClientStatus.PROSPECT, 5.0, BigDecimal.ZERO,
            null, null, ContactPreference.WHATSAPP, null, LocalDateTime.now(), LocalDateTime.now(), LocalDateTime.now()
        );
    }

    @Nested
    @DisplayName("Classes de Equivalência (ECP) e Valor Limite (BVA) - Cadastro de Cliente")
    class CreateClientTests {

        @Test
        @DisplayName("ECP Válido 1: Deve criar cliente PF com CPF válido (11 dígitos)")
        void shouldCreatePfClientWithValidCpf() {
            CreateClientRequest request = new CreateClientRequest(
                "Carlos Silva", "carlos@arq.com", "11988887777", null,
                ClientLegalType.PF, "123.456.789-01", null, null, null,
                ClientCategory.RESIDENTIAL, ContactPreference.WHATSAPP, null, null
            );

            Client unmapped = createMockClient(null, request.name(), request.email(), "12345678901", ClientLegalType.PF);
            Client saved = createMockClient("client-1", request.name(), request.email(), "12345678901", ClientLegalType.PF);
            ClientResponse response = createMockResponse("client-1", request.name(), request.email(), "12345678901", ClientLegalType.PF);

            when(clientRepository.existsByEmailAndDeletedAtIsNull("carlos@arq.com")).thenReturn(false);
            when(clientRepository.existsByDocumentAndDeletedAtIsNull("12345678901")).thenReturn(false);
            when(clientMapper.toEntity(request)).thenReturn(unmapped);
            when(clientRepository.save(unmapped)).thenReturn(saved);
            when(clientMapper.toResponse(saved)).thenReturn(response);

            ClientResponse result = clientService.createClient(request);

            assertThat(result).isNotNull();
            assertThat(result.id()).isEqualTo("client-1");
            assertThat(result.document()).isEqualTo("12345678901");
            verify(clientRepository).save(unmapped);
        }

        @Test
        @DisplayName("ECP Válido 2: Deve criar cliente PJ com CNPJ válido (14 dígitos)")
        void shouldCreatePjClientWithValidCnpj() {
            CreateClientRequest request = new CreateClientRequest(
                "Construtora Alpha", "contato@alpha.com", "1133334444", null,
                ClientLegalType.PJ, "12.345.678/0001-99", "Alpha Engenharia Ltda", null, null,
                ClientCategory.COMMERCIAL, ContactPreference.EMAIL, null, null
            );

            Client unmapped = createMockClient(null, request.name(), request.email(), "12345678000199", ClientLegalType.PJ);
            Client saved = createMockClient("client-2", request.name(), request.email(), "12345678000199", ClientLegalType.PJ);
            ClientResponse response = createMockResponse("client-2", request.name(), request.email(), "12345678000199", ClientLegalType.PJ);

            when(clientRepository.existsByEmailAndDeletedAtIsNull("contato@alpha.com")).thenReturn(false);
            when(clientRepository.existsByDocumentAndDeletedAtIsNull("12345678000199")).thenReturn(false);
            when(clientMapper.toEntity(request)).thenReturn(unmapped);
            when(clientRepository.save(unmapped)).thenReturn(saved);
            when(clientMapper.toResponse(saved)).thenReturn(response);

            ClientResponse result = clientService.createClient(request);

            assertThat(result).isNotNull();
            assertThat(result.id()).isEqualTo("client-2");
            assertThat(result.legalType()).isEqualTo(ClientLegalType.PJ);
        }

        @Test
        @DisplayName("ECP Válido 3: Deve aceitar cadastro de cliente sem documento")
        void shouldCreateClientWithoutDocument() {
            CreateClientRequest request = new CreateClientRequest(
                "Maria Sem Doc", "maria@arq.com", null, null,
                ClientLegalType.PF, null, null, null, null,
                ClientCategory.RESIDENTIAL, null, null, null
            );

            Client unmapped = createMockClient(null, request.name(), request.email(), null, ClientLegalType.PF);
            Client saved = createMockClient("client-3", request.name(), request.email(), null, ClientLegalType.PF);
            ClientResponse response = createMockResponse("client-3", request.name(), request.email(), null, ClientLegalType.PF);

            when(clientRepository.existsByEmailAndDeletedAtIsNull("maria@arq.com")).thenReturn(false);
            when(clientMapper.toEntity(request)).thenReturn(unmapped);
            when(clientRepository.save(unmapped)).thenReturn(saved);
            when(clientMapper.toResponse(saved)).thenReturn(response);

            ClientResponse result = clientService.createClient(request);

            assertThat(result).isNotNull();
            verify(clientRepository, never()).existsByDocumentAndDeletedAtIsNull(any());
        }

        @Test
        @DisplayName("ECP Inválido 1: Deve rejeitar cadastro com e-mail já existente")
        void shouldRejectDuplicateEmail() {
            CreateClientRequest request = new CreateClientRequest(
                "Duplicado", "jaexiste@arq.com", null, null,
                ClientLegalType.PF, null, null, null, null,
                ClientCategory.RESIDENTIAL, null, null, null
            );

            when(clientRepository.existsByEmailAndDeletedAtIsNull("jaexiste@arq.com")).thenReturn(true);

            assertThatThrownBy(() -> clientService.createClient(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Já existe um cliente cadastrado com este e-mail");

            verify(clientRepository, never()).save(any());
        }

        @Test
        @DisplayName("BVA Inválido 1: Rejeitar CPF com 10 dígitos (limite - 1)")
        void shouldRejectCpfWith10Digits() {
            CreateClientRequest request = new CreateClientRequest(
                "Carlos Erro", "carlos.err@arq.com", null, null,
                ClientLegalType.PF, "123.456.789-0", null, null, null,
                ClientCategory.RESIDENTIAL, null, null, null
            );

            when(clientRepository.existsByEmailAndDeletedAtIsNull("carlos.err@arq.com")).thenReturn(false);

            assertThatThrownBy(() -> clientService.createClient(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("CPF deve conter 11 dígitos");
        }

        @Test
        @DisplayName("BVA Inválido 2: Rejeitar CNPJ com 13 dígitos (limite - 1)")
        void shouldRejectCnpjWith13Digits() {
            CreateClientRequest request = new CreateClientRequest(
                "Empresa Erro", "empresa.err@arq.com", null, null,
                ClientLegalType.PJ, "12.345.678/0001-9", null, null, null,
                ClientCategory.COMMERCIAL, null, null, null
            );

            when(clientRepository.existsByEmailAndDeletedAtIsNull("empresa.err@arq.com")).thenReturn(false);

            assertThatThrownBy(() -> clientService.createClient(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("CNPJ deve conter 14 dígitos");
        }

        @Test
        @DisplayName("ECP Inválido 2: Rejeitar documento duplicado já cadastrado")
        void shouldRejectDuplicateDocument() {
            CreateClientRequest request = new CreateClientRequest(
                "Outro Cliente", "outro@arq.com", null, null,
                ClientLegalType.PF, "11122233344", null, null, null,
                ClientCategory.RESIDENTIAL, null, null, null
            );

            when(clientRepository.existsByEmailAndDeletedAtIsNull("outro@arq.com")).thenReturn(false);
            when(clientRepository.existsByDocumentAndDeletedAtIsNull("11122233344")).thenReturn(true);

            assertThatThrownBy(() -> clientService.createClient(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Já existe um cliente cadastrado com este documento");
        }
    }

    @Nested
    @DisplayName("Tabela de Decisão e Operações de Atualização / Status / Soft Delete")
    class UpdateAndLifecycleTests {

        @Test
        @DisplayName("Deve atualizar cliente existente com sucesso")
        void shouldUpdateExistingClient() {
            String clientId = "client-update-1";
            Client existing = createMockClient(clientId, "Antigo", "antigo@arq.com", "11122233344", ClientLegalType.PF);

            UpdateClientRequest request = new UpdateClientRequest(
                "Novo Nome", "novo@arq.com", "11999998888", null,
                ClientLegalType.PF, "111.222.333-44", null, null, null,
                ClientCategory.DESIGNER, ClientStatus.ACTIVE, 4.8, ContactPreference.PHONE, "Notas", null, null
            );

            ClientResponse expectedResponse = new ClientResponse(
                clientId, request.name(), request.email(), request.phone(), null,
                request.legalType(), "11122233344", null, null, null,
                request.category(), request.status(), 4.8, BigDecimal.ZERO, null, "Notas",
                request.contactPreference(), null, LocalDateTime.now(), LocalDateTime.now(), LocalDateTime.now()
            );

            when(clientRepository.findByIdAndDeletedAtIsNull(clientId)).thenReturn(Optional.of(existing));
            when(clientRepository.existsByEmailAndIdNotAndDeletedAtIsNull("novo@arq.com", clientId)).thenReturn(false);
            when(clientRepository.existsByDocumentAndIdNotAndDeletedAtIsNull("11122233344", clientId)).thenReturn(false);
            when(clientRepository.save(existing)).thenReturn(existing);
            when(clientMapper.toResponse(existing)).thenReturn(expectedResponse);

            ClientResponse result = clientService.updateClient(clientId, request);

            assertThat(result).isNotNull();
            assertThat(result.name()).isEqualTo("Novo Nome");
            verify(clientMapper).updateEntityFromRequest(request, existing);
            verify(clientRepository).save(existing);
        }

        @Test
        @DisplayName("Deve lançar ResourceNotFoundException ao atualizar cliente inexistente")
        void shouldThrowNotFoundOnUpdate() {
            UpdateClientRequest request = new UpdateClientRequest(
                "Nome", "teste@arq.com", null, null, ClientLegalType.PF, null, null, null, null,
                ClientCategory.RESIDENTIAL, ClientStatus.ACTIVE, 5.0, null, null, null, null
            );

            when(clientRepository.findByIdAndDeletedAtIsNull("invalido")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> clientService.updateClient("invalido", request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Cliente não encontrado com id: invalido");
        }

        @Test
        @DisplayName("Tabela de Decisão: Atualizar status do cliente para ACTIVE")
        void shouldUpdateClientStatus() {
            String clientId = "client-status-1";
            Client client = createMockClient(clientId, "Cliente Status", "status@arq.com", null, ClientLegalType.PF);
            client.setStatus(ClientStatus.PROSPECT);

            ClientResponse response = new ClientResponse(
                clientId, client.getName(), client.getEmail(), null, null, ClientLegalType.PF, null,
                null, null, null, ClientCategory.RESIDENTIAL, ClientStatus.ACTIVE, 5.0, BigDecimal.ZERO,
                null, null, ContactPreference.WHATSAPP, null, LocalDateTime.now(), LocalDateTime.now(), LocalDateTime.now()
            );

            when(clientRepository.findByIdAndDeletedAtIsNull(clientId)).thenReturn(Optional.of(client));
            when(clientRepository.save(client)).thenReturn(client);
            when(clientMapper.toResponse(client)).thenReturn(response);

            ClientResponse result = clientService.updateClientStatus(clientId, ClientStatus.ACTIVE);

            assertThat(result.status()).isEqualTo(ClientStatus.ACTIVE);
            assertThat(client.getStatus()).isEqualTo(ClientStatus.ACTIVE);
        }

        @Test
        @DisplayName("Deve rejeitar atualização de status nulo")
        void shouldRejectNullStatus() {
            String clientId = "client-status-2";
            Client client = createMockClient(clientId, "Cliente", "cl@arq.com", null, ClientLegalType.PF);

            when(clientRepository.findByIdAndDeletedAtIsNull(clientId)).thenReturn(Optional.of(client));

            assertThatThrownBy(() -> clientService.updateClientStatus(clientId, null))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("O status do cliente não pode ser nulo");
        }

        @Test
        @DisplayName("Soft Delete: Deve marcar deletedAt no cliente e persistir")
        void shouldSoftDeleteClient() {
            String clientId = "client-delete-1";
            Client client = createMockClient(clientId, "Para Deletar", "del@arq.com", null, ClientLegalType.PF);

            when(clientRepository.findByIdAndDeletedAtIsNull(clientId)).thenReturn(Optional.of(client));

            clientService.deleteClient(clientId);

            assertThat(client.getDeletedAt()).isNotNull();
            assertThat(client.isDeleted()).isTrue();
            verify(clientRepository).save(client);
        }

        @Test
        @DisplayName("Listagem paginada com filtro de busca")
        void shouldListClientsWithPagination() {
            Pageable pageable = PageRequest.of(0, 10);
            Client client = createMockClient("c-1", "Carlos Buscado", "busca@arq.com", null, ClientLegalType.PF);
            ClientResponse response = createMockResponse("c-1", "Carlos Buscado", "busca@arq.com", null, ClientLegalType.PF);

            Page<Client> page = new PageImpl<>(List.of(client), pageable, 1);

            when(clientRepository.searchClients(eq("carlos"), eq(ClientStatus.ACTIVE), eq(pageable))).thenReturn(page);
            when(clientMapper.toResponse(client)).thenReturn(response);

            Page<ClientResponse> result = clientService.listClients(" carlos ", ClientStatus.ACTIVE, pageable);

            assertThat(result.getTotalElements()).isEqualTo(1);
            assertThat(result.getContent().get(0).name()).isEqualTo("Carlos Buscado");
        }

        @Test
        @DisplayName("Busca por ID existente retorna ClientResponse")
        void shouldGetClientById() {
            String clientId = "c-find-1";
            Client client = createMockClient(clientId, "Encontrado", "enc@arq.com", null, ClientLegalType.PF);
            ClientResponse response = createMockResponse(clientId, "Encontrado", "enc@arq.com", null, ClientLegalType.PF);

            when(clientRepository.findByIdAndDeletedAtIsNull(clientId)).thenReturn(Optional.of(client));
            when(clientMapper.toResponse(client)).thenReturn(response);

            ClientResponse result = clientService.getClientById(clientId);

            assertThat(result.id()).isEqualTo(clientId);
        }
    }
}
