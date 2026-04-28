package edu.cit.cabatana.doughlycrumbl.features.product;

import lombok.RequiredArgsConstructor;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Order(1)
@RequiredArgsConstructor
public class ProductSchemaFixer implements org.springframework.boot.CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        convertColumnIfBytea("name", "VARCHAR(150)");
        convertColumnIfBytea("description", "TEXT");
        convertColumnIfBytea("category", "VARCHAR(50)");
        convertColumnIfBytea("image_url", "VARCHAR(500)");
    }

    private void convertColumnIfBytea(String columnName, String targetType) {
        String dataType = jdbcTemplate.query(
                "SELECT data_type FROM information_schema.columns " +
                        "WHERE table_schema = 'public' AND table_name = 'products' AND column_name = ?",
                ps -> ps.setString(1, columnName),
                rs -> rs.next() ? rs.getString("data_type") : null
        );

        if (!"bytea".equalsIgnoreCase(dataType)) {
            return;
        }

        jdbcTemplate.execute(
                "ALTER TABLE products ALTER COLUMN " + columnName +
                        " TYPE " + targetType +
                        " USING convert_from(" + columnName + ", 'UTF8')"
        );
    }
}
