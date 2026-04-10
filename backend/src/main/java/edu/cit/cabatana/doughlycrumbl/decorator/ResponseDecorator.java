package edu.cit.cabatana.doughlycrumbl.decorator;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Decorator Pattern Implementation - Structural Pattern
 * 
 * Purpose: Allows behavior to be added to individual objects dynamically
 * without affecting other objects. This decorator adds metadata to API responses.
 * 
 * Benefits:
 * - Open/Closed Principle: Add new functionality without modifying existing code
 * - Single Responsibility: Each decorator has one specific enhancement
 * - Flexible Composition: Decorators can be stacked in any combination
 * - Runtime Configuration: Behavior can be added/removed at runtime
 * 
 * Real-world Use Case:
 * REST APIs often need to add metadata like timestamps, API versions,
 * request IDs, or pagination info. Decorators allow this without
 * modifying the core response objects. Used by companies like Stripe,
 * Twitter API, and GitHub API.
 * 
 * @param <T> The type of data being decorated
 */
public class ResponseDecorator<T> {
    
    private T data;
    private Map<String, Object> metadata;

    public ResponseDecorator(T data) {
        this.data = data;
        this.metadata = new HashMap<>();
    }

    /**
     * Adds a timestamp to the response.
     * 
     * @return This decorator for method chaining
     */
    public ResponseDecorator<T> withTimestamp() {
        metadata.put("timestamp", LocalDateTime.now());
        return this;
    }

    /**
     * Adds a success flag to the response.
     * 
     * @param success The success status
     * @return This decorator for method chaining
     */
    public ResponseDecorator<T> withSuccess(boolean success) {
        metadata.put("success", success);
        return this;
    }

    /**
     * Adds a custom message to the response.
     * 
     * @param message The message to add
     * @return This decorator for method chaining
     */
    public ResponseDecorator<T> withMessage(String message) {
        metadata.put("message", message);
        return this;
    }

    /**
     * Adds pagination information to the response.
     * 
     * @param page Current page number
     * @param size Page size
     * @param totalElements Total number of elements
     * @param totalPages Total number of pages
     * @return This decorator for method chaining
     */
    public ResponseDecorator<T> withPagination(int page, int size, long totalElements, int totalPages) {
        Map<String, Object> pagination = new HashMap<>();
        pagination.put("page", page);
        pagination.put("size", size);
        pagination.put("totalElements", totalElements);
        pagination.put("totalPages", totalPages);
        metadata.put("pagination", pagination);
        return this;
    }

    /**
     * Adds a custom metadata field.
     * 
     * @param key The metadata key
     * @param value The metadata value
     * @return This decorator for method chaining
     */
    public ResponseDecorator<T> withMetadata(String key, Object value) {
        metadata.put(key, value);
        return this;
    }

    /**
     * Builds the final decorated response.
     * 
     * @return A map containing the data and metadata
     */
    public Map<String, Object> build() {
        Map<String, Object> response = new HashMap<>();
        response.put("data", data);
        if (!metadata.isEmpty()) {
            response.put("metadata", metadata);
        }
        return response;
    }

    /**
     * Gets just the data without decoration.
     * 
     * @return The original data
     */
    public T getData() {
        return data;
    }

    /**
     * Gets the metadata.
     * 
     * @return The metadata map
     */
    public Map<String, Object> getMetadata() {
        return metadata;
    }
}
