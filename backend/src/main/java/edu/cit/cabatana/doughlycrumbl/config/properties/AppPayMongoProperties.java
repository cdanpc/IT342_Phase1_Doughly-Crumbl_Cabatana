package edu.cit.cabatana.doughlycrumbl.config.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "app.paymongo")
public class AppPayMongoProperties {
    private String secretKey;
    private String publicKey;
}
