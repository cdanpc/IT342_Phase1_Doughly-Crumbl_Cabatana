package edu.cit.cabatana.doughlycrumbl.shared.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class SupabaseStorageService {

    @Value("${supabase.url:}")
    private String supabaseUrl;

    @Value("${supabase.service-key:}")
    private String serviceKey;

    @Value("${supabase.storage.bucket:product-images}")
    private String bucket;

    private final RestTemplate restTemplate = new RestTemplate();

    public boolean isConfigured() {
        return supabaseUrl != null && !supabaseUrl.isBlank()
                && serviceKey != null && !serviceKey.isBlank();
    }

    public String upload(MultipartFile file) throws IOException {
        String original = file.getOriginalFilename();
        String ext = (original != null && original.contains("."))
                ? original.substring(original.lastIndexOf('.'))
                : ".jpg";
        String filename = UUID.randomUUID() + ext;

        String uploadUrl = supabaseUrl + "/storage/v1/object/" + bucket + "/" + filename;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + serviceKey);
        headers.setContentType(MediaType.parseMediaType(
                file.getContentType() != null ? file.getContentType() : "image/jpeg"));
        headers.set("x-upsert", "true");

        HttpEntity<byte[]> entity = new HttpEntity<>(file.getBytes(), headers);
        restTemplate.exchange(uploadUrl, HttpMethod.POST, entity, String.class);

        return supabaseUrl + "/storage/v1/object/public/" + bucket + "/" + filename;
    }
}
