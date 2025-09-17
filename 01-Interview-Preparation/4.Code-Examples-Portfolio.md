# 💻 Code Examples Portfolio - Ready-to-Show Implementations

## 🎯 Live Coding Interview Ready Examples

This portfolio contains working code examples demonstrating your expertise across all claimed technologies. Perfect for live coding interviews or technical discussions.

---

## 🎭 PLAYWRIGHT EXAMPLES

### **Example 1: Complete Page Object with Advanced Features**
```typescript
// LoginPage.ts - Production-ready implementation
import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  private readonly page: Page;
  private readonly url: string;

  // Locators with multiple selector strategies
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;
  private readonly loadingSpinner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.url = '/login';

    // Robust selectors with fallbacks
    this.emailInput = page.locator('#email, [data-testid="email"], input[type="email"]');
    this.passwordInput = page.locator('#password, [data-testid="password"], input[type="password"]');
    this.loginButton = page.locator('#login-btn, [data-testid="login"], button[type="submit"]');
    this.errorMessage = page.locator('.error-message, .alert-danger, [role="alert"]');
    this.loadingSpinner = page.locator('.loading, .spinner, [data-loading="true"]');
  }

  async navigate(): Promise<void> {
    await this.page.goto(this.url);
    await this.waitForPageLoad();
  }

  async login(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickLogin();
    await this.waitForLoginResult();
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.waitFor({ state: 'visible' });
    await this.emailInput.fill(email);
    await expect(this.emailInput).toHaveValue(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.waitFor({ state: 'visible' });
    await this.passwordInput.fill(password);
    // Don't validate password value for security
  }

  async clickLogin(): Promise<void> {
    await this.loginButton.waitFor({ state: 'visible' });
    await this.loginButton.waitFor({ state: 'enabled' });
    await this.loginButton.click();
  }

  async getErrorMessage(): Promise<string> {
    await this.errorMessage.waitFor({ state: 'visible' });
    return await this.errorMessage.textContent() || '';
  }

  async isLoading(): Promise<boolean> {
    return await this.loadingSpinner.isVisible();
  }

  private async waitForPageLoad(): Promise<void> {
    // Wait for login form to be ready
    await this.emailInput.waitFor({ state: 'visible' });
    await this.passwordInput.waitFor({ state: 'visible' });
    await this.loginButton.waitFor({ state: 'visible' });

    // Wait for any initial loading to complete
    await this.page.waitForLoadState('networkidle');
  }

  private async waitForLoginResult(): Promise<void> {
    // Wait for either success (redirect) or error message
    await Promise.race([
      this.page.waitForURL(/\/dashboard|\/home/, { timeout: 10000 }),
      this.errorMessage.waitFor({ state: 'visible', timeout: 10000 })
    ]);
  }
}

// Test implementation
import { test, expect } from '@playwright/test';

test.describe('Login Functionality', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('successful login with valid credentials', async ({ page }) => {
    await loginPage.login('valid@example.com', 'validpassword');

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('.user-profile')).toBeVisible();
  });

  test('displays error for invalid credentials', async () => {
    await loginPage.login('invalid@example.com', 'wrongpassword');

    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('Invalid credentials');
  });

  test('handles network delays gracefully', async ({ page }) => {
    // Simulate slow network
    await page.route('**/api/auth/login', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });

    await loginPage.fillEmail('test@example.com');
    await loginPage.fillPassword('password');
    await loginPage.clickLogin();

    // Verify loading state
    expect(await loginPage.isLoading()).toBeTruthy();

    // Wait for completion
    await page.waitForResponse(resp =>
      resp.url().includes('/api/auth/login') && resp.status() === 200
    );
  });
});
```

### **Example 2: API + UI Integration Test**
```typescript
// E2E test combining API setup with UI verification
import { test, expect } from '@playwright/test';

test('complete user journey: API setup + UI verification', async ({ page, request }) => {
  // Step 1: Create test data via API
  const userData = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    role: 'PREMIUM'
  };

  const createUserResponse = await request.post('/api/users', {
    data: userData,
    headers: {
      'Authorization': 'Bearer admin-token',
      'Content-Type': 'application/json'
    }
  });

  expect(createUserResponse.ok()).toBeTruthy();
  const createdUser = await createUserResponse.json();

  // Step 2: Verify user can log in via UI
  await page.goto('/login');
  await page.fill('#email', userData.email);
  await page.fill('#password', 'defaultpassword');
  await page.click('#login-button');

  // Step 3: Verify UI shows correct user data
  await expect(page.locator('.user-profile .username')).toContainText(userData.username);
  await expect(page.locator('.user-profile .role')).toContainText('PREMIUM');

  // Step 4: Test premium features in UI
  await page.goto('/premium-features');
  await expect(page.locator('.premium-content')).toBeVisible();
  await expect(page.locator('.upgrade-prompt')).toBeHidden();

  // Step 5: Verify via API that UI actions are reflected
  const updatedUserResponse = await request.get(`/api/users/${createdUser.id}`, {
    headers: { 'Authorization': 'Bearer admin-token' }
  });

  const updatedUser = await updatedUserResponse.json();
  expect(updatedUser.lastLoginAt).toBeTruthy();

  // Cleanup
  await request.delete(`/api/users/${createdUser.id}`, {
    headers: { 'Authorization': 'Bearer admin-token' }
  });
});
```

---

## 🔗 REST ASSURED EXAMPLES

### **Example 1: Complete API Test Framework**
```java
// APITestBase.java - Framework foundation
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestMethodOrder(OrderAnnotation.class)
public abstract class APITestBase {

    @Autowired
    protected TestRestTemplate restTemplate;

    @LocalServerPort
    protected int port;

    protected RequestSpecification requestSpec;
    protected ResponseSpecification responseSpec;
    protected String baseUrl;

    @BeforeEach
    void setUp() {
        baseUrl = "http://localhost:" + port;

        requestSpec = new RequestSpecBuilder()
            .setBaseUri(baseUrl)
            .setContentType(ContentType.JSON)
            .addFilter(new RequestLoggingFilter())
            .addFilter(new ResponseLoggingFilter())
            .addFilter(new AllureRestAssured())
            .build();

        responseSpec = new ResponseSpecBuilder()
            .expectResponseTime(lessThan(5000L))
            .expectHeader("Content-Type", containsString("json"))
            .build();
    }

    protected String authenticateAndGetToken(String username, String password) {
        return given()
            .spec(requestSpec)
            .formParam("username", username)
            .formParam("password", password)
        .when()
            .post("/api/auth/login")
        .then()
            .statusCode(200)
            .extract()
            .path("access_token");
    }

    protected RequestSpecification authenticatedRequest(String token) {
        return given()
            .spec(requestSpec)
            .header("Authorization", "Bearer " + token);
    }
}

// UserAPITest.java - Specific test implementation
@DisplayName("User Management API Tests")
class UserAPITest extends APITestBase {

    private String adminToken;
    private List<Integer> createdUserIds = new ArrayList<>();

    @BeforeEach
    void authenticateAdmin() {
        adminToken = authenticateAndGetToken("admin@example.com", "adminpass");
    }

    @AfterEach
    void cleanup() {
        // Cleanup created users
        createdUserIds.forEach(id ->
            authenticatedRequest(adminToken)
                .delete("/api/users/" + id)
                .then()
                .statusCode(anyOf(200, 204, 404))
        );
        createdUserIds.clear();
    }

    @Test
    @Order(1)
    @DisplayName("Create user with valid data")
    void createUserSuccess() {
        CreateUserRequest request = CreateUserRequest.builder()
            .username("john.doe")
            .email("john.doe@example.com")
            .firstName("John")
            .lastName("Doe")
            .role("USER")
            .build();

        ValidatableResponse response = authenticatedRequest(adminToken)
            .body(request)
        .when()
            .post("/api/users")
        .then()
            .spec(responseSpec)
            .statusCode(201)
            .header("Location", matchesPattern("/api/users/\\d+"))
            .body("id", notNullValue())
            .body("username", equalTo(request.getUsername()))
            .body("email", equalTo(request.getEmail()))
            .body("fullName", equalTo("John Doe"))
            .body("role", equalTo("USER"))
            .body("active", equalTo(true))
            .body("createdAt", notNullValue())
            .body("password", nullValue()); // Ensure password not returned

        // Store ID for cleanup
        int userId = response.extract().path("id");
        createdUserIds.add(userId);

        // Verify user can be retrieved
        authenticatedRequest(adminToken)
            .get("/api/users/" + userId)
        .then()
            .statusCode(200)
            .body("id", equalTo(userId))
            .body("username", equalTo(request.getUsername()));
    }

    @ParameterizedTest
    @CsvSource({
        "'', john@example.com, Username is required",
        "ab, john@example.com, Username must be at least 3 characters",
        "john.doe, '', Email is required",
        "john.doe, invalid-email, Invalid email format",
        "john.doe, john@example.com, " // Duplicate email
    })
    @DisplayName("Create user validation scenarios")
    void createUserValidation(String username, String email, String expectedError) {
        // Pre-create user for duplicate email test
        if ("john@example.com".equals(email) && "john.doe".equals(username)) {
            CreateUserRequest existingUser = CreateUserRequest.builder()
                .username("existing.user")
                .email("john@example.com")
                .build();

            int existingUserId = authenticatedRequest(adminToken)
                .body(existingUser)
                .post("/api/users")
                .then()
                .statusCode(201)
                .extract()
                .path("id");

            createdUserIds.add(existingUserId);
        }

        CreateUserRequest request = CreateUserRequest.builder()
            .username(username)
            .email(email)
            .build();

        authenticatedRequest(adminToken)
            .body(request)
        .when()
            .post("/api/users")
        .then()
            .statusCode(400)
            .body("message", containsString(expectedError))
            .body("validationErrors", not(empty()));
    }

    @Test
    @DisplayName("User workflow: Create -> Update -> Deactivate -> Delete")
    void completeUserWorkflow() {
        // Create user
        CreateUserRequest createRequest = CreateUserRequest.builder()
            .username("workflow.user")
            .email("workflow@example.com")
            .firstName("Workflow")
            .lastName("User")
            .build();

        int userId = authenticatedRequest(adminToken)
            .body(createRequest)
            .post("/api/users")
        .then()
            .statusCode(201)
            .extract()
            .path("id");

        createdUserIds.add(userId);

        // Update user
        UpdateUserRequest updateRequest = UpdateUserRequest.builder()
            .firstName("Updated")
            .lastName("Name")
            .role("ADMIN")
            .build();

        authenticatedRequest(adminToken)
            .body(updateRequest)
            .put("/api/users/" + userId)
        .then()
            .statusCode(200)
            .body("firstName", equalTo("Updated"))
            .body("lastName", equalTo("Name"))
            .body("fullName", equalTo("Updated Name"))
            .body("role", equalTo("ADMIN"));

        // Deactivate user
        authenticatedRequest(adminToken)
            .patch("/api/users/" + userId + "/deactivate")
        .then()
            .statusCode(200)
            .body("active", equalTo(false));

        // Verify deactivated user cannot login
        given()
            .spec(requestSpec)
            .formParam("username", "workflow@example.com")
            .formParam("password", "defaultpass")
        .when()
            .post("/api/auth/login")
        .then()
            .statusCode(401)
            .body("error", equalTo("ACCOUNT_DISABLED"));

        // Delete user
        authenticatedRequest(adminToken)
            .delete("/api/users/" + userId)
        .then()
            .statusCode(204);

        // Verify user no longer exists
        authenticatedRequest(adminToken)
            .get("/api/users/" + userId)
        .then()
            .statusCode(404);

        createdUserIds.remove(Integer.valueOf(userId));
    }

    @Test
    @DisplayName("Concurrent user creation stress test")
    void concurrentUserCreation() throws InterruptedException {
        ExecutorService executor = Executors.newFixedThreadPool(10);
        List<Future<Integer>> futures = new ArrayList<>();

        // Create 20 users concurrently
        for (int i = 0; i < 20; i++) {
            final int index = i;
            Future<Integer> future = executor.submit(() -> {
                CreateUserRequest request = CreateUserRequest.builder()
                    .username("concurrent_user_" + index)
                    .email("concurrent_" + index + "@example.com")
                    .build();

                return authenticatedRequest(adminToken)
                    .body(request)
                    .post("/api/users")
                .then()
                    .statusCode(201)
                    .extract()
                    .path("id");
            });
            futures.add(future);
        }

        // Collect results
        List<Integer> userIds = new ArrayList<>();
        for (Future<Integer> future : futures) {
            try {
                userIds.add(future.get(10, TimeUnit.SECONDS));
            } catch (Exception e) {
                fail("Concurrent user creation failed: " + e.getMessage());
            }
        }

        executor.shutdown();

        // Verify all users were created
        assertThat(userIds).hasSize(20);
        assertThat(userIds).doesNotContainNull();
        assertThat(new HashSet<>(userIds)).hasSize(20); // All unique

        createdUserIds.addAll(userIds);
    }
}
```

---

## 📮 POSTMAN/NEWMAN EXAMPLES

### **Example 1: Advanced Collection with Dynamic Data**
```json
{
  "info": {
    "name": "E-Commerce API Test Suite",
    "description": "Comprehensive API testing with dynamic data management"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "{{$dotenv_API_BASE_URL}}",
      "type": "string"
    },
    {
      "key": "testRunId",
      "value": "{{$guid}}",
      "type": "string"
    }
  ],
  "event": [
    {
      "listen": "prerequest",
      "script": {
        "exec": [
          "// Dynamic test data generation",
          "const faker = require('faker');",
          "",
          "// Generate unique test data",
          "pm.globals.set('test_username', 'user_' + Date.now());",
          "pm.globals.set('test_email', faker.internet.email());",
          "pm.globals.set('test_firstname', faker.name.firstName());",
          "pm.globals.set('test_lastname', faker.name.lastName());",
          "",
          "// Token management",
          "const tokenExpiry = pm.globals.get('token_expires');",
          "const currentTime = Date.now();",
          "",
          "if (!pm.globals.get('auth_token') || tokenExpiry < currentTime) {",
          "    console.log('Refreshing authentication token...');",
          "    ",
          "    pm.sendRequest({",
          "        url: pm.environment.get('baseUrl') + '/auth/token',",
          "        method: 'POST',",
          "        header: {",
          "            'Content-Type': 'application/json'",
          "        },",
          "        body: {",
          "            mode: 'raw',",
          "            raw: JSON.stringify({",
          "                client_id: pm.environment.get('client_id'),",
          "                client_secret: pm.environment.get('client_secret'),",
          "                grant_type: 'client_credentials'",
          "            })",
          "        }",
          "    }, function (err, response) {",
          "        if (response.code === 200) {",
          "            const tokenData = response.json();",
          "            pm.globals.set('auth_token', tokenData.access_token);",
          "            pm.globals.set('token_expires', Date.now() + (tokenData.expires_in * 1000));",
          "            console.log('Token refreshed successfully');",
          "        } else {",
          "            console.error('Token refresh failed:', response.code);",
          "        }",
          "    });",
          "}"
        ]
      }
    }
  ]
}
```

### **Example 2: Comprehensive Test Script**
```javascript
// Advanced Postman test script for user creation endpoint
pm.test("User Creation - Comprehensive Validation", function () {
    const responseJson = pm.response.json();
    const requestData = JSON.parse(pm.request.body.raw);

    // Response time validation
    pm.test("Response time is acceptable", function () {
        pm.expect(pm.response.responseTime).to.be.below(2000);
    });

    // Status code validation
    pm.test("Status code is 201 Created", function () {
        pm.response.to.have.status(201);
    });

    // Headers validation
    pm.test("Content-Type is JSON", function () {
        pm.expect(pm.response.headers.get("Content-Type")).to.include("application/json");
    });

    pm.test("Location header is present", function () {
        pm.expect(pm.response.headers.get("Location")).to.match(/\/api\/users\/\d+/);
    });

    // Response structure validation
    pm.test("Response has required properties", function () {
        pm.expect(responseJson).to.have.property('id');
        pm.expect(responseJson).to.have.property('username');
        pm.expect(responseJson).to.have.property('email');
        pm.expect(responseJson).to.have.property('createdAt');
        pm.expect(responseJson).to.have.property('active');
    });

    // Data type validation
    pm.test("Data types are correct", function () {
        pm.expect(responseJson.id).to.be.a('number');
        pm.expect(responseJson.username).to.be.a('string');
        pm.expect(responseJson.email).to.be.a('string');
        pm.expect(responseJson.createdAt).to.be.a('string');
        pm.expect(responseJson.active).to.be.a('boolean');
    });

    // Business logic validation
    pm.test("Response data matches request", function () {
        pm.expect(responseJson.username).to.equal(requestData.username);
        pm.expect(responseJson.email).to.equal(requestData.email);
        pm.expect(responseJson.active).to.equal(true);
    });

    // Security validation
    pm.test("Sensitive data is not exposed", function () {
        pm.expect(responseJson).to.not.have.property('password');
        pm.expect(responseJson).to.not.have.property('passwordHash');
    });

    // Date validation
    pm.test("Date formats are correct", function () {
        const createdAt = new Date(responseJson.createdAt);
        pm.expect(createdAt).to.be.a('date');
        pm.expect(createdAt.getTime()).to.be.at.most(Date.now());
        pm.expect(createdAt.getTime()).to.be.at.least(Date.now() - 60000); // Within last minute
    });

    // Email format validation
    pm.test("Email format is valid", function () {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        pm.expect(responseJson.email).to.match(emailRegex);
    });

    // Store data for subsequent tests
    if (pm.response.code === 201) {
        pm.globals.set('created_user_id', responseJson.id);
        pm.globals.set('created_username', responseJson.username);

        // Store for cleanup
        const existingIds = pm.globals.get('cleanup_user_ids') || '[]';
        const idsArray = JSON.parse(existingIds);
        idsArray.push(responseJson.id);
        pm.globals.set('cleanup_user_ids', JSON.stringify(idsArray));

        console.log(`Created user with ID: ${responseJson.id}`);
    }
});

// Performance tracking
pm.test("Performance metrics", function () {
    const responseTime = pm.response.responseTime;
    const responseSize = pm.response.responseSize;

    // Log performance data
    console.log(`Request: ${pm.info.requestName}`);
    console.log(`Response Time: ${responseTime}ms`);
    console.log(`Response Size: ${responseSize} bytes`);

    // Store performance data for reporting
    const perfData = pm.environment.get('performance_metrics') || '[]';
    const perfArray = JSON.parse(perfData);

    perfArray.push({
        request: pm.info.requestName,
        timestamp: new Date().toISOString(),
        responseTime: responseTime,
        responseSize: responseSize,
        status: pm.response.code
    });

    pm.environment.set('performance_metrics', JSON.stringify(perfArray));

    // Performance assertions
    pm.expect(responseTime).to.be.below(2000);

    if (responseSize > 0) {
        pm.expect(responseSize).to.be.below(10000); // Response should be < 10KB
    }
});

// Error handling for failed requests
if (pm.response.code >= 400) {
    pm.test("Error response structure", function () {
        const errorResponse = pm.response.json();

        pm.expect(errorResponse).to.have.property('error');
        pm.expect(errorResponse).to.have.property('message');
        pm.expect(errorResponse).to.have.property('timestamp');

        if (pm.response.code === 400) {
            pm.expect(errorResponse).to.have.property('validationErrors');
            pm.expect(errorResponse.validationErrors).to.be.an('array');
        }
    });
}
```

---

## 🥒 CUCUMBER/BDD EXAMPLES

### **Example 1: Feature File with Complex Scenarios**
```gherkin
# features/user-management.feature
@user-management @regression
Feature: User Management
  As a system administrator
  I want to manage user accounts
  So that I can control access to the system

  Background:
    Given the system is running
    And I am authenticated as an administrator
    And the user database is clean

  @smoke @positive
  Scenario: Create a new user with valid information
    Given I have valid user information:
      | field     | value              |
      | username  | john.doe           |
      | email     | john@example.com   |
      | firstName | John               |
      | lastName  | Doe                |
      | role      | USER               |
    When I create the user
    Then the user should be created successfully
    And the user should be active
    And the user should receive a welcome email
    And the user should be able to log in

  @negative
  Scenario Outline: Create user with invalid data
    Given I have user information with invalid <field>:
      | username  | <username>  |
      | email     | <email>     |
      | firstName | <firstName> |
      | lastName  | <lastName>  |
    When I attempt to create the user
    Then the creation should fail
    And I should see error message "<error_message>"
    And no user should be created

    Examples:
      | field     | username | email            | firstName | lastName | error_message           |
      | username  |          | john@example.com | John      | Doe      | Username is required    |
      | username  | ab       | john@example.com | John      | Doe      | Username too short      |
      | email     | john.doe |                  | John      | Doe      | Email is required       |
      | email     | john.doe | invalid-email    | John      | Doe      | Invalid email format    |
      | firstName | john.doe | john@example.com |           | Doe      | First name is required  |

  @integration
  Scenario: Complete user lifecycle
    Given I create a user with username "lifecycle.user"
    When I update the user's role to "ADMIN"
    And I deactivate the user
    And I reactivate the user
    And I delete the user
    Then the user should no longer exist in the system
    And all user-related data should be cleaned up

  @data-driven
  Scenario: Bulk user creation
    Given I have the following users to create:
      | username    | email              | role  | department |
      | alice.smith | alice@example.com  | USER  | Engineering|
      | bob.jones   | bob@example.com    | ADMIN | Operations |
      | carol.white | carol@example.com  | USER  | Marketing  |
    When I create all users in batch
    Then all users should be created successfully
    And each user should receive appropriate role permissions
    And each user should be assigned to the correct department

  @security
  Scenario: Access control validation
    Given I have users with different roles:
      | username | role       |
      | admin    | ADMIN      |
      | manager  | MANAGER    |
      | user     | USER       |
    When each user attempts to access their permitted resources
    Then they should succeed
    When each user attempts to access restricted resources
    Then they should be denied access
    And security events should be logged
```

### **Example 2: Step Definitions with Advanced Patterns**
```java
// UserManagementSteps.java
@Component
public class UserManagementSteps {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationService authService;

    @Autowired
    private TestDataManager testDataManager;

    @Autowired
    private EmailTestUtil emailTestUtil;

    private CreateUserRequest currentUserRequest;
    private UserResponse createdUser;
    private Exception lastException;

    @Given("I have valid user information:")
    public void i_have_valid_user_information(Map<String, String> userData) {
        currentUserRequest = CreateUserRequest.builder()
            .username(userData.get("username"))
            .email(userData.get("email"))
            .firstName(userData.get("firstName"))
            .lastName(userData.get("lastName"))
            .role(userData.get("role"))
            .build();
    }

    @Given("I have user information with invalid {string}:")
    public void i_have_user_information_with_invalid_field(String invalidField, Map<String, String> userData) {
        currentUserRequest = CreateUserRequest.builder()
            .username(userData.get("username"))
            .email(userData.get("email"))
            .firstName(userData.get("firstName"))
            .lastName(userData.get("lastName"))
            .build();
    }

    @Given("I have the following users to create:")
    public void i_have_users_to_create(List<Map<String, String>> usersData) {
        List<CreateUserRequest> userRequests = usersData.stream()
            .map(this::mapToUserRequest)
            .collect(Collectors.toList());

        testDataManager.setBulkUserRequests(userRequests);
    }

    @When("I create the user")
    public void i_create_the_user() {
        try {
            createdUser = userService.createUser(currentUserRequest);
            testDataManager.addCreatedUser(createdUser.getId());
        } catch (Exception e) {
            lastException = e;
        }
    }

    @When("I attempt to create the user")
    public void i_attempt_to_create_the_user() {
        try {
            createdUser = userService.createUser(currentUserRequest);
            testDataManager.addCreatedUser(createdUser.getId());
        } catch (Exception e) {
            lastException = e;
        }
    }

    @When("I create all users in batch")
    public void i_create_all_users_in_batch() {
        List<CreateUserRequest> requests = testDataManager.getBulkUserRequests();

        try {
            List<UserResponse> users = userService.createUsersInBatch(requests);
            users.forEach(user -> testDataManager.addCreatedUser(user.getId()));
            testDataManager.setBulkCreatedUsers(users);
        } catch (Exception e) {
            lastException = e;
        }
    }

    @When("I update the user's role to {string}")
    public void i_update_user_role(String newRole) {
        try {
            UpdateUserRequest updateRequest = UpdateUserRequest.builder()
                .role(newRole)
                .build();

            createdUser = userService.updateUser(createdUser.getId(), updateRequest);
        } catch (Exception e) {
            lastException = e;
        }
    }

    @When("I deactivate the user")
    public void i_deactivate_the_user() {
        try {
            userService.deactivateUser(createdUser.getId());
            createdUser = userService.getUserById(createdUser.getId());
        } catch (Exception e) {
            lastException = e;
        }
    }

    @Then("the user should be created successfully")
    public void the_user_should_be_created_successfully() {
        assertThat(lastException).isNull();
        assertThat(createdUser).isNotNull();
        assertThat(createdUser.getId()).isNotNull();
        assertThat(createdUser.getUsername()).isEqualTo(currentUserRequest.getUsername());
        assertThat(createdUser.getEmail()).isEqualTo(currentUserRequest.getEmail());
    }

    @Then("the user should be active")
    public void the_user_should_be_active() {
        assertThat(createdUser.isActive()).isTrue();
    }

    @Then("the user should receive a welcome email")
    public void the_user_should_receive_welcome_email() {
        // Wait for async email processing
        await().atMost(10, TimeUnit.SECONDS).untilAsserted(() -> {
            List<Email> emails = emailTestUtil.getEmailsSentTo(createdUser.getEmail());
            assertThat(emails).isNotEmpty();

            Email welcomeEmail = emails.stream()
                .filter(email -> email.getSubject().contains("Welcome"))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Welcome email not found"));

            assertThat(welcomeEmail.getBody()).contains(createdUser.getFirstName());
        });
    }

    @Then("the user should be able to log in")
    public void the_user_should_be_able_to_log_in() {
        try {
            AuthenticationResult authResult = authService.authenticate(
                createdUser.getEmail(),
                "defaultPassword" // Default password for new users
            );

            assertThat(authResult.isSuccessful()).isTrue();
            assertThat(authResult.getUser().getId()).isEqualTo(createdUser.getId());
        } catch (Exception e) {
            fail("User should be able to log in", e);
        }
    }

    @Then("the creation should fail")
    public void the_creation_should_fail() {
        assertThat(lastException).isNotNull();
        assertThat(createdUser).isNull();
    }

    @Then("I should see error message {string}")
    public void i_should_see_error_message(String expectedMessage) {
        assertThat(lastException).isInstanceOf(ValidationException.class);
        assertThat(lastException.getMessage()).contains(expectedMessage);
    }

    @Then("no user should be created")
    public void no_user_should_be_created() {
        if (currentUserRequest.getEmail() != null) {
            Optional<UserResponse> user = userService.findByEmail(currentUserRequest.getEmail());
            assertThat(user).isEmpty();
        }
    }

    @Then("all users should be created successfully")
    public void all_users_should_be_created_successfully() {
        assertThat(lastException).isNull();

        List<UserResponse> createdUsers = testDataManager.getBulkCreatedUsers();
        List<CreateUserRequest> requests = testDataManager.getBulkUserRequests();

        assertThat(createdUsers).hasSize(requests.size());

        for (int i = 0; i < requests.size(); i++) {
            CreateUserRequest request = requests.get(i);
            UserResponse user = createdUsers.get(i);

            assertThat(user.getUsername()).isEqualTo(request.getUsername());
            assertThat(user.getEmail()).isEqualTo(request.getEmail());
            assertThat(user.isActive()).isTrue();
        }
    }

    @Then("each user should receive appropriate role permissions")
    public void each_user_should_receive_appropriate_role_permissions() {
        List<UserResponse> users = testDataManager.getBulkCreatedUsers();

        users.forEach(user -> {
            Set<Permission> permissions = userService.getUserPermissions(user.getId());
            Role userRole = Role.valueOf(user.getRole());
            Set<Permission> expectedPermissions = userRole.getDefaultPermissions();

            assertThat(permissions).containsAll(expectedPermissions);
        });
    }

    // Helper methods
    private CreateUserRequest mapToUserRequest(Map<String, String> userData) {
        return CreateUserRequest.builder()
            .username(userData.get("username"))
            .email(userData.get("email"))
            .role(userData.get("role"))
            .department(userData.get("department"))
            .build();
    }
}

// TestDataManager.java - Test data management
@Component
@Scope("cucumber-glue")
public class TestDataManager {

    private final List<Integer> createdUserIds = new ArrayList<>();
    private final List<Integer> createdOrderIds = new ArrayList<>();
    private List<CreateUserRequest> bulkUserRequests;
    private List<UserResponse> bulkCreatedUsers;

    public void addCreatedUser(Integer userId) {
        createdUserIds.add(userId);
    }

    public void setBulkUserRequests(List<CreateUserRequest> requests) {
        this.bulkUserRequests = requests;
    }

    public List<CreateUserRequest> getBulkUserRequests() {
        return bulkUserRequests;
    }

    public void setBulkCreatedUsers(List<UserResponse> users) {
        this.bulkCreatedUsers = users;
    }

    public List<UserResponse> getBulkCreatedUsers() {
        return bulkCreatedUsers;
    }

    @PreDestroy
    public void cleanup() {
        // Cleanup created test data
        createdUserIds.forEach(this::cleanupUser);
        createdOrderIds.forEach(this::cleanupOrder);
    }

    private void cleanupUser(Integer userId) {
        try {
            // Implementation for user cleanup
        } catch (Exception e) {
            System.err.println("Failed to cleanup user " + userId + ": " + e.getMessage());
        }
    }

    private void cleanupOrder(Integer orderId) {
        try {
            // Implementation for order cleanup
        } catch (Exception e) {
            System.err.println("Failed to cleanup order " + orderId + ": " + e.getMessage());
        }
    }
}
```

---

## 📊 QUICK REFERENCE SYNTAX

### **Playwright Quick Commands**
```typescript
// Navigation & Waiting
await page.goto(url);
await page.waitForSelector('.element');
await page.waitForLoadState('networkidle');

// Interactions
await page.click('#button');
await page.fill('#input', 'text');
await page.selectOption('#select', 'value');

// Assertions
await expect(page).toHaveTitle('Title');
await expect(locator).toBeVisible();
await expect(locator).toContainText('text');

// API Testing
const response = await request.get('/api/endpoint');
expect(response.ok()).toBeTruthy();
```

### **REST Assured Quick Commands**
```java
// Basic request
given()
    .contentType(ContentType.JSON)
    .body(requestObject)
.when()
    .post("/api/endpoint")
.then()
    .statusCode(200)
    .body("field", equalTo("value"));

// Authentication
given()
    .auth().oauth2(token)
    .when()...

// Schema validation
.body(matchesJsonSchemaInClasspath("schema.json"));
```

### **Postman Test Scripts**
```javascript
// Basic assertions
pm.test("Status code is 200", () => {
    pm.response.to.have.status(200);
});

pm.test("Response has property", () => {
    pm.expect(pm.response.json()).to.have.property('id');
});

// Dynamic data
pm.globals.set('variable', pm.response.json().id);
```

---

**You now have a complete code portfolio ready for any technical interview! These examples demonstrate real-world expertise and can be adapted to any specific scenario they present. Practice explaining the patterns and decisions behind each implementation. Good luck! 🚀**