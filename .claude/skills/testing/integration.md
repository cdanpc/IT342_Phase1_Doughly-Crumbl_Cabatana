# Integration Test Patterns — Doughly Crumbl (Spring Boot + MockMvc)

## Location
```
backend/src/test/java/edu/cit/cabatana/doughlycrumbl/features/<slice>/
```

## MockMvc pattern (no real DB)
```java
@WebMvcTest(CartController.class)
@Import(SecurityConfig.class)
class CartControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CartService cartService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @Test
    @WithMockUser(username = "user@test.com", roles = "CUSTOMER")
    void testAddToCart_validProduct_returns201() throws Exception {
        CartResponse mockResponse = new CartResponse();
        when(cartService.addItem(any(), any())).thenReturn(mockResponse);

        mockMvc.perform(post("/api/cart")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"productId\": 1, \"quantity\": 4}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.items").isArray());
    }

    @Test
    @WithMockUser(username = "user@test.com", roles = "CUSTOMER")
    void testGetCart_returnsCurrentItems() throws Exception {
        when(cartService.getCart(any())).thenReturn(new CartResponse());

        mockMvc.perform(get("/api/cart"))
            .andExpect(status().isOk());
    }
}
```

## Full Spring context test (real DB — use sparingly)
```java
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthIntegrationTest {
    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @Test
    void testRegister_validRequest_returns201() throws Exception {
        RegisterRequest req = new RegisterRequest("Dan", "dan@test.com", "Password1!", ...);
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.token").isNotEmpty());
    }
}
```

## Key imports
```java
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
```

## Run
```bash
./mvnw test                                            # all tests
./mvnw test -Dtest=CartControllerIntegrationTest       # single class
```
