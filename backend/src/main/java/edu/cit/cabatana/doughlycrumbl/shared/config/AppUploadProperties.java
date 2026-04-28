package edu.cit.cabatana.doughlycrumbl.shared.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "app.upload")
public class AppUploadProperties {
    private String dir;
    private String baseUrl;
}
