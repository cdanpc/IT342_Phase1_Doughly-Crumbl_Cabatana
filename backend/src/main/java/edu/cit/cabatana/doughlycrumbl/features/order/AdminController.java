package edu.cit.cabatana.doughlycrumbl.features.order;

import edu.cit.cabatana.doughlycrumbl.features.product.ProductRequest;
import edu.cit.cabatana.doughlycrumbl.features.order.UpdateOrderStatusRequest;
import edu.cit.cabatana.doughlycrumbl.features.order.OrderResponse;
import edu.cit.cabatana.doughlycrumbl.features.product.ProductResponse;
import edu.cit.cabatana.doughlycrumbl.features.payment.FileUploadService;
import edu.cit.cabatana.doughlycrumbl.features.order.OrderService;
import edu.cit.cabatana.doughlycrumbl.features.product.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final ProductService productService;
    private final OrderService orderService;
    private final FileUploadService fileUploadService;

    // ===== Product Management =====

    @GetMapping("/products")
    public ResponseEntity<Map<String, Object>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<ProductResponse> productPage = productService.getAllProducts(page, size);

        Map<String, Object> response = new HashMap<>();
        response.put("content", productPage.getContent());
        response.put("totalElements", productPage.getTotalElements());
        response.put("totalPages", productPage.getTotalPages());
        response.put("currentPage", productPage.getNumber());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/products")
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProduct(request));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/products/upload-image")
    public ResponseEntity<Map<String, String>> uploadProductImage(
            @RequestParam MultipartFile file) {
        String url = fileUploadService.saveImage(file);
        return ResponseEntity.ok(Map.of("url", url));
    }

    // ===== Order Management =====

    @GetMapping("/orders")
    public ResponseEntity<List<OrderResponse>> getAllOrders(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(orderService.getAllOrders(status, page, size).getContent());
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderByIdAdmin(id));
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, request));
    }

    @PutMapping("/orders/{id}/delivery-fee")
    public ResponseEntity<OrderResponse> quoteDeliveryFee(
            @PathVariable Long id,
            @RequestParam BigDecimal fee) {
        return ResponseEntity.ok(orderService.quoteDeliveryFee(id, fee));
    }
}
