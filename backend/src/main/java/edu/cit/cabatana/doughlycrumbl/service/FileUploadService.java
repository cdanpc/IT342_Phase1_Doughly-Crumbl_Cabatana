package edu.cit.cabatana.doughlycrumbl.service;

import edu.cit.cabatana.doughlycrumbl.config.properties.AppUploadProperties;
import edu.cit.cabatana.doughlycrumbl.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileUploadService {

    private final AppUploadProperties uploadProperties;

    private static final long MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    private static final java.util.Set<String> ALLOWED_TYPES = java.util.Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );

    public String saveImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("No file provided");
        }
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new BadRequestException("Only JPEG, PNG, WebP, and GIF images are allowed");
        }
        if (file.getSize() > MAX_SIZE) {
            throw new BadRequestException("File size must not exceed 5 MB");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
        }
        String filename = UUID.randomUUID() + extension;

        try {
            Path uploadDir = Paths.get(uploadProperties.getDir()).toAbsolutePath();
            Files.createDirectories(uploadDir);
            Path destination = uploadDir.resolve(filename);
            file.transferTo(destination.toFile());
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }

        return uploadProperties.getBaseUrl() + "/" + filename;
    }

    public byte[] loadImage(String filename) throws IOException {
        Path filePath = Paths.get(uploadProperties.getDir()).toAbsolutePath().resolve(filename);
        if (!Files.exists(filePath)) {
            throw new java.io.FileNotFoundException("File not found: " + filename);
        }
        return Files.readAllBytes(filePath);
    }

    public String getContentType(String filename) {
        String lower = filename.toLowerCase();
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".webp")) return "image/webp";
        if (lower.endsWith(".gif")) return "image/gif";
        return "image/jpeg";
    }
}
