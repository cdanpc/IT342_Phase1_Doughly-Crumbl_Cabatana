package edu.cit.cabatana.doughlycrumbl.controller;

import edu.cit.cabatana.doughlycrumbl.service.FileUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.FileNotFoundException;
import java.io.IOException;

/**
 * Public endpoint for serving uploaded product images.
 * No authentication required — images are publicly accessible by URL.
 */
@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
public class FileController {

    private final FileUploadService fileUploadService;

    @GetMapping("/{filename}")
    public ResponseEntity<byte[]> serveFile(@PathVariable String filename) {
        // Basic path traversal protection
        if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
            return ResponseEntity.badRequest().build();
        }

        try {
            byte[] data = fileUploadService.loadImage(filename);
            String contentType = fileUploadService.getContentType(filename);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, contentType)
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=31536000")
                    .body(data);
        } catch (FileNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
