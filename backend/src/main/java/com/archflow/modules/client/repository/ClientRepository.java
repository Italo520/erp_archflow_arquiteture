package com.archflow.modules.client.repository;

import com.archflow.modules.client.domain.ClientStatus;
import com.archflow.modules.client.entity.Client;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, String> {

    Optional<Client> findByIdAndDeletedAtIsNull(String id);

    Page<Client> findByDeletedAtIsNull(Pageable pageable);

    boolean existsByEmailAndDeletedAtIsNull(String email);

    boolean existsByDocumentAndDeletedAtIsNull(String document);

    boolean existsByEmailAndIdNotAndDeletedAtIsNull(String email, String id);

    boolean existsByDocumentAndIdNotAndDeletedAtIsNull(String document, String id);

    @Query("SELECT c FROM Client c WHERE c.deletedAt IS NULL AND " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:searchTerm IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', CAST(:searchTerm AS string), '%')) OR LOWER(c.email) LIKE LOWER(CONCAT('%', CAST(:searchTerm AS string), '%')))")
    Page<Client> searchClients(
        @Param("searchTerm") String searchTerm,
        @Param("status") ClientStatus status,
        Pageable pageable
    );
}
