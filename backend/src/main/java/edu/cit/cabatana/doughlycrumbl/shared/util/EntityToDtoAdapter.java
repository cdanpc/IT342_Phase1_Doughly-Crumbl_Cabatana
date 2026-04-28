package edu.cit.cabatana.doughlycrumbl.shared.util;

/**
 * Adapter Pattern Implementation - Structural Pattern
 * 
 * Purpose: Defines a common interface for converting entities to DTOs.
 * This adapter pattern provides a consistent way to transform domain models
 * into Data Transfer Objects for API responses.
 * 
 * Benefits:
 * - Consistent Interface: All entity-to-DTO conversions follow the same contract
 * - Separation of Concerns: Mapping logic is separated from business logic
 * - Flexibility: Easy to swap implementations or add new converters
 * - Maintainability: Centralized mapping reduces duplication
 * 
 * Real-world Use Case:
 * In microservices architectures, adapters are used to convert between
 * different data formats (internal models vs external APIs). For example,
 * Netflix uses adapters to convert between service-specific models.
 * 
 * @param <E> The entity type
 * @param <D> The DTO type
 */
public interface EntityToDtoAdapter<E, D> {
    
    /**
     * Converts an entity to a DTO with full details.
     * 
     * @param entity The entity to convert
     * @return The converted DTO
     */
    D toDto(E entity);
    
    /**
     * Converts an entity to a summary DTO (optional method).
     * Default implementation returns the same as toDto.
     * 
     * @param entity The entity to convert
     * @return The summary DTO
     */
    default D toSummaryDto(E entity) {
        return toDto(entity);
    }
}
