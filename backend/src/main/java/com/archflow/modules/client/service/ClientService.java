package com.archflow.modules.client.service;

import com.archflow.modules.client.domain.ClientStatus;
import com.archflow.modules.client.dto.ClientResponse;
import com.archflow.modules.client.dto.CreateClientRequest;
import com.archflow.modules.client.dto.UpdateClientRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ClientService {

    Page<ClientResponse> listClients(String search, ClientStatus status, Pageable pageable);

    ClientResponse getClientById(String id);

    ClientResponse createClient(CreateClientRequest request);

    ClientResponse updateClient(String id, UpdateClientRequest request);

    ClientResponse updateClientStatus(String id, ClientStatus newStatus);

    void deleteClient(String id);
}
