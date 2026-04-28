# Unit Test Patterns — Doughly Crumbl (JUnit 5 + Mockito)

## Location
```
backend/src/test/java/edu/cit/cabatana/doughlycrumbl/features/<slice>/
```

## Base pattern
```java
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderAdapter orderAdapter;

    @InjectMocks
    private OrderService orderService;

    @Test
    void testCreateOrder_validPayload_returnsOrderResponse() {
        // Arrange
        Order mockOrder = Order.builder().id(1L).status(OrderStatus.ORDER_PLACED).build();
        OrderResponse mockResponse = new OrderResponse();
        mockResponse.setId(1L);

        when(orderRepository.save(any(Order.class))).thenReturn(mockOrder);
        when(orderAdapter.toDto(mockOrder)).thenReturn(mockResponse);

        // Act
        OrderResponse result = orderService.createOrder(...);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(orderRepository, times(1)).save(any(Order.class));
    }
}
```

## Delivery fee tier tests
```java
@Test void testCalculateFee_within3km_returns50()       { assertEquals(50,  calc.calculate(2.0)); }
@Test void testCalculateFee_between3and6km_returns80()  { assertEquals(80,  calc.calculate(4.5)); }
@Test void testCalculateFee_between6and10km_returns120(){ assertEquals(120, calc.calculate(8.0)); }
@Test void testCalculateFee_beyond10km_throwsException(){ assertThrows(BadRequestException.class, () -> calc.calculate(11.0)); }
```

## Order status transition tests
```java
@Test
void testUpdateOrderStatus_invalidTransition_throwsException() {
    Order order = Order.builder().status(OrderStatus.COMPLETED).build();
    when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
    assertThrows(BadRequestException.class,
        () -> orderService.updateStatus(1L, "ORDER_PLACED"));
}
```

## Naming convention
`test<MethodName>_<condition>_<expectedOutcome>()`

## Run
```bash
./mvnw test -pl backend                          # all tests
./mvnw test -Dtest=OrderServiceTest -pl backend  # single class
```
