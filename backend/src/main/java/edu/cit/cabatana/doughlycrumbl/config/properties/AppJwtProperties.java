package edu.cit.cabatana.doughlycrumbl.config.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "app.jwt")
public class AppJwtProperties {
    private String secret;
    private long expirationMs;
}
