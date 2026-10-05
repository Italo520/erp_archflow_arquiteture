package com.archflow.modules.storage;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@Service
public class StorageService {

    private final Path storageLocation;

    public StorageService() {
        this.storageLocation = Paths.get(".storage").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.storageLocation);
        } catch (IOException e) {
            throw new RuntimeException("Não foi possível criar o diretório de arquivos técnicos .storage", e);
        }
    }

    public Map<String, String> storeFile(MultipartFile file) {
        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "arquivo";
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex >= 0) {
            extension = originalFilename.substring(dotIndex).toLowerCase();
        }
        String fileKey = UUID.randomUUID().toString() + extension;

        try {
            Path targetLocation = this.storageLocation.resolve(fileKey);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "/api/v1/storage/download/" + fileKey;
            return Map.of(
                    "fileKey", fileKey,
                    "fileName", originalFilename,
                    "fileUrl", fileUrl,
                    "mimeType", file.getContentType() != null ? file.getContentType() : "application/octet-stream",
                    "fileSize", String.valueOf(file.getSize())
            );
        } catch (IOException e) {
            throw new RuntimeException("Falha ao salvar o arquivo: " + originalFilename, e);
        }
    }

    public Resource loadFileAsResource(String fileKey) {
        try {
            // Previne Directory Traversal
            Path filePath = this.storageLocation.resolve(Paths.get(fileKey).getFileName().toString()).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Arquivo não encontrado ou inacessível: " + fileKey);
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Caminho de arquivo inválido: " + fileKey, e);
        }
    }
}
