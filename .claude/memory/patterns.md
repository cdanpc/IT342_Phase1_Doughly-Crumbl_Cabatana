# Patterns — Doughly Crumbl

## Android XML patterns
- All inputs use @drawable/bg_input (never TextInputLayout
  with Material outline — custom drawable instead)
- All buttons use @drawable/bg_button_primary_selector
- All cards use MaterialCardView with elevation 2dp
- Category chips: bg_chip_active (selected) /
  bg_chip_inactive (unselected), HorizontalScrollView wrapper
- Status pills: programmatic backgroundTintList in adapter,
  base shape bg_status_pill.xml

## Kotlin patterns
- ViewModels expose LiveData<Result<T>> not plain LiveData
- Repositories call ApiService and wrap in try/catch
- AuthInterceptor adds Bearer token from SessionManager
- All API calls on Dispatchers.IO via viewModelScope.launch

## Backend patterns
- Every feature slice has: Controller, Service, Repository,
  Entity, Request DTO, Response DTO
- @ConfigurationProperties for all app.* properties
- GlobalExceptionHandler returns ErrorResponse for all errors
- OrderService uses Strategy pattern for status transitions

## Known anti-patterns (never do these)
- Never hardcode hex colors in XML layouts
- Never hardcode dp values in XML layouts
- Never call API directly from Fragment — always via ViewModel
- Never skip order status transitions (state machine is strict)
- Never commit credentials or API keys
