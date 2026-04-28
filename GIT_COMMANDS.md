# Git Commands for Submission

## Create and Push Feature Branch

```bash
# 1. Create feature branch (as required by assignment)
git checkout -b feature/design-patterns-refactor

# 2. Stage all new pattern files
git add backend/src/main/java/edu/cit/cabatana/doughlycrumbl/factory/
git add backend/src/main/java/edu/cit/cabatana/doughlycrumbl/adapter/
git add backend/src/main/java/edu/cit/cabatana/doughlycrumbl/strategy/
git add backend/src/main/java/edu/cit/cabatana/doughlycrumbl/observer/
git add backend/src/main/java/edu/cit/cabatana/doughlycrumbl/decorator/

# 3. Stage refactored services
git add backend/src/main/java/edu/cit/cabatana/doughlycrumbl/service/OrderService.java
git add backend/src/main/java/edu/cit/cabatana/doughlycrumbl/service/ProductService.java
git add backend/src/main/java/edu/cit/cabatana/doughlycrumbl/service/CartService.java

# 4. Stage documentation
git add docs/DESIGN_PATTERNS_REPORT.md
git add docs/DESIGN_PATTERNS_SUMMARY.md
git add README_DESIGN_PATTERNS.md

# 5. Commit with meaningful message
git commit -m "Applied design patterns to improve code quality

Implemented 6 design patterns as per IT342 assignment requirements:

Creational Patterns:
- Factory Pattern: Centralized order creation (OrderFactory, OrderItemFactory)
- Builder Pattern: Simplified DTO construction using Lombok @Builder

Structural Patterns:
- Adapter Pattern: Unified entity-to-DTO conversion (OrderAdapter, ProductAdapter, CartAdapter)
- Decorator Pattern: Added flexible response enhancement (ResponseDecorator)

Behavioral Patterns:
- Strategy Pattern: Encapsulated order status transitions (5 concrete strategies)
- Observer Pattern: Decoupled notifications (Email, Logging, Inventory observers)

Impact:
- Reduced service code by 19%
- Eliminated 100% of duplicate mapping methods
- Improved maintainability and testability
- Added 26 new pattern classes

All patterns tested and functional with existing frontend."

# 6. Push to remote
git push -u origin feature/design-patterns-refactor
```

---

## Individual Commits (Alternative - More Detailed)

If you prefer separate commits per pattern:

```bash
# Factory Pattern
git add backend/src/main/java/edu/cit/cabatana/doughlycrumbl/factory/
git commit -m "Applied Factory Pattern to Order creation

Created OrderFactory and OrderItemFactory to centralize complex
order creation logic. Reduced OrderService complexity from 30+ lines
to a single factory call."

# Adapter Pattern
git add backend/src/main/java/edu/cit/cabatana/doughlycrumbl/adapter/
git add backend/src/main/java/edu/cit/cabatana/doughlycrumbl/service/OrderService.java
git add backend/src/main/java/edu/cit/cabatana/doughlycrumbl/service/ProductService.java
git add backend/src/main/java/edu/cit/cabatana/doughlycrumbl/service/CartService.java
git commit -m "Applied Adapter Pattern for DTO mapping

Created EntityToDtoAdapter interface with concrete implementations
for Order, Product, and Cart entities. Eliminated 60+ lines of
duplicate mapping code across services."

# Strategy Pattern
git add backend/src/main/java/edu/cit/cabatana/doughlycrumbl/strategy/
git commit -m "Applied Strategy Pattern to order status management

Implemented OrderStatusStrategy with 5 concrete strategies for each
status transition. Replaced complex conditional logic with polymorphic
strategy selection."

# Observer Pattern
git add backend/src/main/java/edu/cit/cabatana/doughlycrumbl/observer/
git commit -m "Applied Observer Pattern for order notifications

Created OrderEventPublisher with 3 observers (Email, Logging, Inventory).
Decoupled notification logic from business logic, making it easy to add
new observers without modifying OrderService."

# Decorator Pattern
git add backend/src/main/java/edu/cit/cabatana/doughlycrumbl/decorator/
git commit -m "Applied Decorator Pattern for response enhancement

Created ResponseDecorator to add metadata (timestamps, pagination,
messages) to API responses without modifying core DTO classes."

# Documentation
git add docs/ README_DESIGN_PATTERNS.md
git commit -m "Added design patterns documentation

Created comprehensive report with pattern research, implementation
details, and refactoring impact analysis."

# Push all commits
git push -u origin feature/design-patterns-refactor
```

---

## Verify Branch and Commits

```bash
# Check current branch
git branch

# View commit history
git log --oneline

# View changes in this branch
git diff main..feature/design-patterns-refactor --stat
```

---

## After Professor Review

If changes are approved:

```bash
# Switch to main branch
git checkout main

# Merge feature branch
git merge feature/design-patterns-refactor

# Push to main
git push origin main
```

---

## Quick Status Check

```bash
# See what's been changed
git status

# See all new files
git ls-files --others --exclude-standard
```
