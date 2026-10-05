package com.archflow.modules.client.repository;

import com.archflow.modules.client.domain.ClientCategory;
import com.archflow.modules.client.domain.ClientLegalType;
import com.archflow.modules.client.domain.ClientStatus;
import com.archflow.modules.client.domain.ContactPreference;
import com.archflow.modules.client.entity.Client;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@DisplayName("ClientRepository - Testes de Integração com PostgreSQL")
class ClientRepositoryIT {

    @Autowired
    private ClientRepository clientRepository;

    @Test
    @DisplayName("Deve persistir cliente e recuperar por ID se não deletado")
    void shouldPersistAndFindById() {
        Client client = Client.builder()
            .name("Escritório Design LTDA")
            .email("contato@escritoriodesign.com.br")
            .document("12345678000100")
            .legalType(ClientLegalType.PJ)
            .category(ClientCategory.DESIGNER)
            .status(ClientStatus.ACTIVE)
            .totalSpent(BigDecimal.valueOf(25000.00))
            .contactPreference(ContactPreference.EMAIL)
            .build();

        Client saved = clientRepository.save(client);
        assertThat(saved.getId()).isNotNull();

        Optional<Client> found = clientRepository.findByIdAndDeletedAtIsNull(saved.getId());
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Escritório Design LTDA");
        assertThat(found.get().getStatus()).isEqualTo(ClientStatus.ACTIVE);

        // Testar soft delete
        found.get().markAsDeleted();
        clientRepository.save(found.get());

        Optional<Client> afterDelete = clientRepository.findByIdAndDeletedAtIsNull(saved.getId());
        assertThat(afterDelete).isEmpty();
    }

    @Test
    @DisplayName("Deve filtrar clientes ativos por texto no searchClients")
    void shouldSearchClientsByTerm() {
        String uniqueSuffix = System.currentTimeMillis() + "";
        Client client1 = Client.builder()
            .name("Beatriz Fernandes " + uniqueSuffix)
            .email("beatriz." + uniqueSuffix + "@arq.com")
            .document("98765432100")
            .legalType(ClientLegalType.PF)
            .category(ClientCategory.RESIDENTIAL)
            .status(ClientStatus.ACTIVE)
            .build();

        Client client2 = Client.builder()
            .name("Roberto Santos " + uniqueSuffix)
            .email("roberto." + uniqueSuffix + "@arq.com")
            .document("11122233344")
            .legalType(ClientLegalType.PF)
            .category(ClientCategory.RESIDENTIAL)
            .status(ClientStatus.INACTIVE)
            .build();

        clientRepository.save(client1);
        clientRepository.save(client2);

        Page<Client> activeBeatriz = clientRepository.searchClients(
            "Beatriz", ClientStatus.ACTIVE, PageRequest.of(0, 10)
        );

        assertThat(activeBeatriz.getContent())
            .anyMatch(c -> c.getName().contains("Beatriz"));
    }
}
