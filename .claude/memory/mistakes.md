# Mistakes — Doughly Crumbl
(Things that went wrong — never repeat these)

## ISS-001 — Package declarations not updated after VSA move
Files moved with git mv but package declarations still pointed
to old layer-based packages. Caused 74+ compile errors.
Fix: Always update package declaration when moving a file.

## ISS-002 — CartService stale wildcard import
import edu.cit.cabatana.doughlycrumbl.model.* left after VSA.
Fix: Never use wildcard imports. Always explicit imports.

## ISS-003 — BackendApplicationTests needed H2
Tests failed without live Supabase. Fix: @ActiveProfiles("test")
+ application-test.properties with H2 datasource.

## ISS-004 — Spring Security returned 403 not 401
CartControllerIntegrationTest expected 401 but got 403.
Fix: Use is4xxClientError() not isUnauthorized() in tests.
Also: add explicit AuthenticationEntryPoint to SecurityConfig.

## ISS-005 — OrderServiceTest stale imports after VSA
All imports pointed to old model.* and repository.* packages.
Fix: Run grep for old package names after every file move.

## ISS-006 — Frontend imports broke after VSA
main.tsx still imported from ./store/X after moving to
./shared/hooks/X. Fix: grep for old paths after every move.

## MOBILE-001 — Old orange color #C8874E leaked into layouts
Design tool exported with wrong primary color. All 18 layouts
had to be updated. Fix: Always grep for old hex values after
any color system change.

## MOBILE-003 — Data model drift across all entities (BUG-3)
8 out of 10 Kotlin data classes had field names that did not match
backend JSON response keys. Root cause: models were written by
guessing field names instead of reading the actual Java response DTOs.
Affected: Order, OrderItem, Cart, CartItem, Product, ProductRequest,
RegisterRequest, UpdateOrderStatusRequest. Notification.kt was missing
entirely. Fixed by reading OrderResponse.java, CartResponse.java,
ProductResponse.java, NotificationResponse.java directly.
Fix: Always read the backend *Response.java before writing any mobile
data class. Use @SerializedName on every field. Verify with
docs/data-models.md. Note: backend ProductResponse sends `id` not
`productId` — do not blindly follow prompt schemas, read the source.

## MOBILE-002 — poppins.xml not in font folder
Themes.xml referenced @font/poppins but file did not exist.
Caused runtime crash. Fix: Verify font file exists before
referencing in themes.
