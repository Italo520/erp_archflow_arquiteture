package com.archflow.modules.client.controller;

import com.archflow.modules.client.domain.ClientStatus;
import com.archflow.modules.client.dto.ClientResponse;
import com.archflow.modules.client.dto.CreateClientRequest;
import com.archflow.modules.client.dto.UpdateClientRequest;
import com.archflow.modules.client.dto.UpdateClientStatusRequest;
import com.archflow.modules.client.service.ClientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/api/v1/clients")
@Tag(name = "Clientes", description = "Endpoints para gerenciamento de clientes e contatos")
@SecurityRequirement(name = "Bearer Authentication")
public class ClientController {

    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    @GetMapping
    @Operation(summary = "Listar clientes com paginação e busca")
    public ResponseEntity<Page<ClientResponse>> listClients(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) ClientStatus status,
        @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<ClientResponse> page = clientService.listClients(search, status, pageable);
        return ResponseEntity.ok(page);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter detalhes de um cliente por ID")
    public ResponseEntity<ClientResponse> getClientById(@PathVariable String id) {
        ClientResponse response = clientService.getClientById(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Operation(summary = "Cadastrar um novo cliente")
    public ResponseEntity<ClientResponse> createClient(@Valid @RequestBody CreateClientRequest request) {
        ClientResponse created = clientService.createClient(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(created.id())
            .toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar dados de um cliente existente")
    public ResponseEntity<ClientResponse> updateClient(
        @PathVariable String id,
        @Valid @RequestBody UpdateClientRequest request
    ) {
        ClientResponse updated = clientService.updateClient(id, request);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Atualizar status de um cliente")
    public ResponseEntity<ClientResponse> updateClientStatus(
        @PathVariable String id,
        @Valid @RequestBody UpdateClientStatusRequest request
    ) {
        ClientResponse updated = clientService.updateClientStatus(id, request.status());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir logicamente um cliente (Soft Delete)")
    public ResponseEntity<Void> deleteClient(@PathVariable String id) {
        clientService.deleteClient(id);
        return ResponseEntity.noContent().build();
    }
}
