```markdown
# IT342_Phase1_Doughly-Crumbl_Cabatana Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches development patterns and conventions for the `IT342_Phase1_Doughly-Crumbl_Cabatana` Java codebase. The repository focuses on backend logic, with an emphasis on modular design and the use of established design patterns. You'll learn how to structure code, follow naming conventions, and implement workflows such as introducing new design patterns to refactor or enhance backend services.

## Coding Conventions

- **File Naming:**  
  Use PascalCase for Java class files.  
  *Example:*  
  ```
  OrderService.java
  UserRepository.java
  ```

- **Import Style:**  
  Use relative imports within the project structure.  
  *Example:*  
  ```java
  import edu.cit.cabatana.doughlycrumbl.service.OrderService;
  ```

- **Export Style:**  
  Use named exports (i.e., declare classes with `public class ClassName`).  
  *Example:*  
  ```java
  public class OrderService {
      // class implementation
  }
  ```

- **Commit Messages:**  
  Freeform, typically concise (average 44 characters). No enforced prefix.

## Workflows

### Implement Design Pattern
**Trigger:** When you want to refactor backend logic using a design pattern (e.g., Factory, Adapter, Strategy, Observer, Decorator).  
**Command:** `/add-design-pattern`

1. **Create a new subdirectory** under `backend/src/main/java/edu/cit/cabatana/doughlycrumbl/` named after the design pattern you are implementing.
   - *Example:*  
     ```
     backend/src/main/java/edu/cit/cabatana/doughlycrumbl/factory/
     ```
2. **Implement one or more Java classes** in this directory to encapsulate the pattern's logic.
   - *Example (Factory Pattern):*  
     ```java
     // backend/src/main/java/edu/cit/cabatana/doughlycrumbl/factory/CookieFactory.java
     public class CookieFactory {
         public Cookie createCookie(String type) {
             if (type.equals("ChocolateChip")) {
                 return new ChocolateChipCookie();
             }
             // Add more types as needed
             return null;
         }
     }
     ```
3. **Optionally update related service classes** to use the new pattern implementation.
   - *Example:*  
     ```java
     import edu.cit.cabatana.doughlycrumbl.factory.CookieFactory;

     public class OrderService {
         private CookieFactory factory = new CookieFactory();

         public void addCookieToOrder(String type) {
             Cookie cookie = factory.createCookie(type);
             // add cookie to order
         }
     }
     ```

**Files Involved:**
- `backend/src/main/java/edu/cit/cabatana/doughlycrumbl/*/*.java`
- `backend/src/main/java/edu/cit/cabatana/doughlycrumbl/service/*.java`

**Frequency:** ~4 times per month

## Testing Patterns

- **Framework:** Unknown (not detected).
- **File Pattern:** Test files follow the pattern `*.test.*`.
  - *Example:*  
    ```
    OrderService.test.java
    ```
- **How to Write Tests:**  
  Place test files alongside or in a dedicated test directory, using the `.test.` naming convention.

## Commands

| Command             | Purpose                                                      |
|---------------------|--------------------------------------------------------------|
| /add-design-pattern | Scaffold and integrate a new design pattern into the backend |
```
