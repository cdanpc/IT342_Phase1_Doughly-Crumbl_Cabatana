package edu.cit.cabatana.doughlycrumbl.features.profile;

import edu.cit.cabatana.doughlycrumbl.features.order.Order;
import edu.cit.cabatana.doughlycrumbl.features.order.OrderRepository;
import edu.cit.cabatana.doughlycrumbl.features.product.Product;
import edu.cit.cabatana.doughlycrumbl.features.product.ProductAdapter;
import edu.cit.cabatana.doughlycrumbl.features.product.ProductRepository;
import edu.cit.cabatana.doughlycrumbl.features.product.ProductResponse;
import edu.cit.cabatana.doughlycrumbl.features.user.User;
import edu.cit.cabatana.doughlycrumbl.features.user.UserRepository;
import edu.cit.cabatana.doughlycrumbl.shared.exception.BadRequestException;
import edu.cit.cabatana.doughlycrumbl.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerProfileService {
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ProductAdapter productAdapter;
    private final DeliveryAddressRepository addressRepository;
    private final FavoriteProductRepository favoriteRepository;

    public CustomerProfileResponse getProfile(Long userId) {
        User user = getUser(userId);
        List<Order> orders = orderRepository.findByUserIdOrderByOrderDateDesc(userId);
        int total = orders.size();
        int completed = (int) orders.stream().filter(order -> "COMPLETED".equals(order.getStatus())).count();
        int cancelled = (int) orders.stream().filter(order -> "CANCELLED".equals(order.getStatus())).count();

        return CustomerProfileResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .totalOrders(total)
                .completedOrders(completed)
                .cancelledOrders(cancelled)
                .rating(calculateRating(total, completed, cancelled))
                .build();
    }

    @Transactional
    public CustomerProfileResponse updateProfile(Long userId, UpdateCustomerProfileRequest request) {
        User user = getUser(userId);
        String email = request.getEmail().trim();
        if (!email.equalsIgnoreCase(user.getEmail())) {
            throw new BadRequestException("Email changes require signing in again and are not available here");
        }
        userRepository.findByEmail(email).ifPresent(existing -> {
            if (!existing.getId().equals(userId)) {
                throw new BadRequestException("Email is already registered");
            }
        });

        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPhoneNumber(clean(request.getPhoneNumber()));
        user.setAddress(clean(request.getAddress()));
        userRepository.save(user);
        return getProfile(userId);
    }

    public List<DeliveryAddressResponse> getAddresses(Long userId) {
        return addressRepository.findByUserIdOrderByDefaultAddressDescCreatedAtDesc(userId).stream()
                .map(this::toAddressResponse)
                .toList();
    }

    @Transactional
    public DeliveryAddressResponse addAddress(Long userId, DeliveryAddressRequest request) {
        User user = getUser(userId);
        boolean isDefault = Boolean.TRUE.equals(request.getDefaultAddress());
        if (isDefault) {
            clearDefaultAddresses(userId);
        }
        DeliveryAddress address = DeliveryAddress.builder()
                .user(user)
                .label(request.getLabel().trim())
                .address(request.getAddress().trim())
                .defaultAddress(isDefault)
                .build();
        return toAddressResponse(addressRepository.save(address));
    }

    @Transactional
    public DeliveryAddressResponse updateAddress(Long userId, Long addressId, DeliveryAddressRequest request) {
        DeliveryAddress address = getOwnedAddress(userId, addressId);
        if (Boolean.TRUE.equals(request.getDefaultAddress())) {
            clearDefaultAddresses(userId);
        }
        address.setLabel(request.getLabel().trim());
        address.setAddress(request.getAddress().trim());
        address.setDefaultAddress(Boolean.TRUE.equals(request.getDefaultAddress()));
        return toAddressResponse(addressRepository.save(address));
    }

    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        DeliveryAddress address = getOwnedAddress(userId, addressId);
        addressRepository.delete(address);
    }

    public List<ProductResponse> getFavorites(Long userId) {
        return favoriteRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(FavoriteProduct::getProduct)
                .map(productAdapter::toDto)
                .toList();
    }

    @Transactional
    public List<ProductResponse> addFavorite(Long userId, Long productId) {
        if (!favoriteRepository.existsByUserIdAndProductId(userId, productId)) {
            User user = getUser(userId);
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product", productId));
            favoriteRepository.save(FavoriteProduct.builder().user(user).product(product).build());
        }
        return getFavorites(userId);
    }

    @Transactional
    public void removeFavorite(Long userId, Long productId) {
        FavoriteProduct favorite = favoriteRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Favorite product", productId));
        favoriteRepository.delete(favorite);
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
    }

    private DeliveryAddress getOwnedAddress(Long userId, Long addressId) {
        DeliveryAddress address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery address", addressId));
        if (!address.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Delivery address", addressId);
        }
        return address;
    }

    private void clearDefaultAddresses(Long userId) {
        addressRepository.findByUserIdOrderByDefaultAddressDescCreatedAtDesc(userId).forEach(address -> {
            address.setDefaultAddress(false);
            addressRepository.save(address);
        });
    }

    private DeliveryAddressResponse toAddressResponse(DeliveryAddress address) {
        return DeliveryAddressResponse.builder()
                .id(address.getId())
                .label(address.getLabel())
                .address(address.getAddress())
                .defaultAddress(address.getDefaultAddress())
                .build();
    }

    private BigDecimal calculateRating(int total, int completed, int cancelled) {
        if (total == 0) {
            return BigDecimal.ZERO.setScale(1);
        }
        double completionRatio = (double) completed / total;
        double cancellationPenalty = (double) cancelled / total;
        double value = Math.max(0.0, Math.min(5.0, 4.0 + completionRatio - cancellationPenalty));
        return BigDecimal.valueOf(value).setScale(1, RoundingMode.HALF_UP);
    }

    private String clean(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
