package com.archflow.modules.client.service.impl;

import com.archflow.core.exception.BusinessException;
import com.archflow.core.exception.ResourceNotFoundException;
import com.archflow.modules.client.domain.ClientLegalType;
import com.archflow.modules.client.domain.ClientStatus;
import com.archflow.modules.client.dto.ClientResponse;
import com.archflow.modules.client.dto.CreateClientRequest;
import com.archflow.modules.client.dto.UpdateClientRequest;
import com.archflow.modules.client.entity.Client;
import com.archflow.modules.client.mapper.ClientMapper;
import com.archflow.modules.client.repository.ClientRepository;
import com.archflow.modules.client.service.ClientService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional(readOnly = true)
public class ClientServiceImpl implements ClientService {

    private final ClientRepository clientRepository;
    private final ClientMapper clientMapper;

    public ClientServiceImpl(ClientRepository clientRepository, ClientMapper clientMapper) {
        this.clientRepository = clientRepository;
        this.clientMapper = clientMapper;
    }

    @Override
    public Page<ClientResponse> listClients(String search, ClientStatus status, Pageable pageable) {
        String trimmedSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        Page<Client> clientsPage = clientRepository.searchClients(trimmedSearch, status, pageable);
        return clientsPage.map(clientMapper::toResponse);
    }

    @Override
    public ClientResponse getClientById(String id) {
        Client client = findActiveClientById(id);
        return clientMapper.toResponse(client);
    }

    @Override
    @Transactional
    public ClientResponse createClient(CreateClientRequest request) {
        validateEmailUniqueness(request.email(), null);
        String cleanedDocument = sanitizeDocument(request.document());
        validateDocument(request.legalType(), cleanedDocument, null);

        Client client = clientMapper.toEntity(request);
        client.setDocument(cleanedDocument);
        client.setStatus(ClientStatus.PROSPECT);
        client.setLastInteractionAt(LocalDateTime.now());

        Client saved = clientRepository.save(client);
        return clientMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public ClientResponse updateClient(String id, UpdateClientRequest request) {
        Client client = findActiveClientById(id);

        validateEmailUniqueness(request.email(), id);
        String cleanedDocument = sanitizeDocument(request.document());
        validateDocument(request.legalType(), cleanedDocument, id);

        clientMapper.updateEntityFromRequest(request, client);
        client.setDocument(cleanedDocument);
        if (request.status() != null) {
            client.setStatus(request.status());
        }
        client.setLastInteractionAt(LocalDateTime.now());

        Client updated = clientRepository.save(client);
        return clientMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public ClientResponse updateClientStatus(String id, ClientStatus newStatus) {
        Client client = findActiveClientById(id);
        if (newStatus == null) {
            throw new BusinessException("O status do cliente não pode ser nulo");
        }
        client.setStatus(newStatus);
        client.setLastInteractionAt(LocalDateTime.now());
        Client updated = clientRepository.save(client);
        return clientMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void deleteClient(String id) {
        Client client = findActiveClientById(id);
        client.markAsDeleted();
        clientRepository.save(client);
    }

    private Client findActiveClientById(String id) {
        return clientRepository.findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado com id: " + id));
    }

    private void validateEmailUniqueness(String email, String excludeId) {
        if (email == null || email.trim().isEmpty()) {
            return;
        }
        boolean exists = (excludeId == null)
            ? clientRepository.existsByEmailAndDeletedAtIsNull(email.trim())
            : clientRepository.existsByEmailAndIdNotAndDeletedAtIsNull(email.trim(), excludeId);

        if (exists) {
            throw new BusinessException("Já existe um cliente cadastrado com este e-mail: " + email);
        }
    }

    private void validateDocument(ClientLegalType legalType, String cleanedDocument, String excludeId) {
        if (cleanedDocument == null || cleanedDocument.isEmpty()) {
            return;
        }

        if (legalType == ClientLegalType.PF && cleanedDocument.length() != 11) {
            throw new BusinessException("Documento inválido para Pessoa Física. CPF deve conter 11 dígitos.");
        }

        if (legalType == ClientLegalType.PJ && cleanedDocument.length() != 14) {
            throw new BusinessException("Documento inválido para Pessoa Jurídica. CNPJ deve conter 14 dígitos.");
        }

        boolean exists = (excludeId == null)
            ? clientRepository.existsByDocumentAndDeletedAtIsNull(cleanedDocument)
            : clientRepository.existsByDocumentAndIdNotAndDeletedAtIsNull(cleanedDocument, excludeId);

        if (exists) {
            throw new BusinessException("Já existe um cliente cadastrado com este documento: " + cleanedDocument);
        }
    }

    private String sanitizeDocument(String document) {
        if (document == null) {
            return null;
        }
        String clean = document.replaceAll("\\D", "").trim();
        return clean.isEmpty() ? null : clean;
    }
}
