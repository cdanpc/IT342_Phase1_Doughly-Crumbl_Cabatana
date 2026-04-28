# Spring Boot Patterns — Doughly Crumbl

## Project conventions
- Java 17, Spring Boot 3.5.0, Maven wrapper (`./mvnw`)
- Package root: `edu.cit.cabatana.doughlycrumbl`
- Lombok in use: `@Data`, `@Builder`, `@RequiredArgsConstructor`, `@NoArgsConstructor`, `@AllArgsConstructor`

## REST controller pattern
```java
@RestController
@RequestMapping("/api/feature")
@RequiredArgsConstructor
public class FeatureController {
    private final FeatureService featureService;

    @GetMapping
    public ResponseEntity<Page<FeatureResponse>> getAll(...) {
        return ResponseEntity.ok(featureService.getAll(...));
    }

    @PostMapping
    public ResponseEntity<FeatureResponse> create(@Valid @RequestBody FeatureRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(featureService.create(req));
    }
}
```

## Service pattern
```java
@Service
@RequiredArgsConstructor
public class FeatureService {
    private final FeatureRepository repo;
    private final FeatureAdapter adapter;  // use adapter, never inline mapping

    public FeatureResponse getById(Long id) {
        Feature entity = repo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Feature", id));
        return adapter.toDto(entity);
    }
}
```

## Exception handling
- `ResourceNotFoundException(String resource, Long id)` → 404
- `BadRequestException(String message)` → 400
- `UnauthorizedException` → 401
- `GlobalExceptionHandler` catches all via `@RestControllerAdvice`
- Never throw raw `RuntimeException` — use named exception classes

## @ConfigurationProperties
```java
@ConfigurationProperties(prefix = "app.feature")
@Component
@Data
public class AppFeatureProperties {
    private String someKey;
    private int someValue;
}
```
Register in `BackendApplication.java` with `@EnableConfigurationProperties(AppFeatureProperties.class)`

## JPA entities
```java
@Entity
@Table(name = "features")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Feature {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
```

## Security
- JWT filter: `JwtAuthFilter` extracts Bearer token and sets `SecurityContextHolder`
- Admin routes: `@PreAuthorize("hasRole('ADMIN')")` on controller methods
- Public routes configured in `SecurityConfig.requestMatchers(...).permitAll()`
- WebSocket endpoints permitted in `SecurityConfig`

## Compile check
```bash
./mvnw compile          # fast check
./mvnw test             # full test run
./mvnw spring-boot:run  # start server on :8080
```
