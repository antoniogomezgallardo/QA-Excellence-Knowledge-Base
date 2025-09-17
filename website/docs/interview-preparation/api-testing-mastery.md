# 🔗 API Testing Mastery - 10+ Years Expertise Showcase

## 🎯 Your API Testing Authority - Key Positioning

**Your Statement**: "I've been doing API testing for 10+ years - from SOAP to REST to GraphQL. I've seen the evolution from manual tools to sophisticated automation frameworks. I bring both depth in REST Assured (6+ years) and breadth across the entire API testing ecosystem."

---

## 🏆 API TESTING FUNDAMENTALS - Beyond the Basics

### **Your Evolution Story**
```timeline
2013-2015: SOAP services, SoapUI, XML validation
2016-2018: REST APIs, Postman collections, JSON schemas
2019-2020: REST Assured automation, CI/CD integration
2021-2022: Contract testing with Pact, OpenAPI validation
2023-2024: GraphQL testing, performance integration, observability
```

### **Modern API Testing Architecture**
```java
// Demonstrate 10+ years of architectural thinking
@TestConfiguration
public class APITestArchitecture {

    // Environment abstraction
    @Bean
    @ConfigurationProperties("api")
    public APIConfiguration apiConfig() {
        return APIConfiguration.builder()
            .baseUrl(getEnvironmentUrl())
            .timeout(Duration.ofSeconds(30))
            .retryConfig(RetryConfig.ofDefaults())
            .authenticationProvider(new OAuth2Provider())
            .build();
    }

    // Centralized request/response handling
    @Bean
    public RequestSpecification baseRequestSpec(APIConfiguration config) {
        return new RequestSpecBuilder()
            .setBaseUri(config.getBaseUrl())
            .setContentType(ContentType.JSON)
            .addFilter(new RequestLoggingFilter())
            .addFilter(new ResponseLoggingFilter())
            .addFilter(new AllureRestAssured())
            .addFilter(new TimingFilter())
            .build();
    }

    // Response validation framework
    @Bean
    public ResponseSpecification baseResponseSpec() {
        return new ResponseSpecBuilder()
            .expectResponseTime(lessThan(5000L))
            .expectHeader("Content-Type", containsString("json"))
            .expectStatusCode(anyOf(
                equalTo(200), equalTo(201), equalTo(204)
            ))
            .build();
    }
}
```

---

## 🛠️ REST ASSURED MASTERY (6+ Years)

### **Advanced Request Building Patterns**

#### **Complex Authentication Scenarios**
```java
@Component
public class AuthenticationManager {

    private String cachedToken;
    private LocalDateTime tokenExpiry;

    public String getValidToken() {
        if (isTokenExpired()) {
            refreshToken();
        }
        return cachedToken;
    }

    @Retryable(value = {Exception.class}, maxAttempts = 3)
    public void refreshToken() {
        Response tokenResponse = given()
            .contentType(ContentType.URLENC)
            .formParam("grant_type", "client_credentials")
            .formParam("client_id", config.getClientId())
            .formParam("client_secret", config.getClientSecret())
            .formParam("scope", "api:read api:write")
        .when()
            .post("/oauth/token")
        .then()
            .statusCode(200)
            .extract().response();

        JsonPath tokenData = tokenResponse.jsonPath();
        this.cachedToken = tokenData.getString("access_token");
        this.tokenExpiry = LocalDateTime.now()
            .plusSeconds(tokenData.getInt("expires_in"))
            .minusMinutes(5); // Refresh 5 minutes early
    }

    public RequestSpecification authenticatedRequest() {
        return given()
            .spec(baseRequestSpec)
            .header("Authorization", "Bearer " + getValidToken());
    }
}

// Usage in tests
@Test
public void testProtectedEndpoint() {
    UserCreateRequest request = UserCreateRequest.builder()
        .username("testuser")
        .email("test@example.com")
        .role("ADMIN")
        .build();

    Response response = authManager.authenticatedRequest()
        .body(request)
    .when()
        .post("/api/users")
    .then()
        .spec(baseResponseSpec)
        .statusCode(201)
        .body("id", notNullValue())
        .body("username", equalTo(request.getUsername()))
        .body("email", equalTo(request.getEmail()))
        .extract().response();

    // Store created user ID for cleanup
    testDataManager.addCreatedUser(response.jsonPath().getInt("id"));
}
```

#### **Advanced Data-Driven Testing**
```java
@ParameterizedTest
@MethodSource("userTestDataProvider")
@DisplayName("User Creation with Various Input Combinations")
public void testUserCreationVariations(UserTestData testData) {
    given()
        .spec(authenticatedSpec)
        .body(testData.getRequest())
    .when()
        .post("/api/users")
    .then()
        .statusCode(testData.getExpectedStatus())
        .body(testData.getValidationMatcher());
}

static Stream<UserTestData> userTestDataProvider() {
    return Stream.of(
        // Valid scenarios
        UserTestData.valid()
            .username("john.doe")
            .email("john@example.com")
            .expectStatus(201)
            .expectValidation("id", notNullValue()),

        // Validation scenarios
        UserTestData.invalid()
            .username("") // Empty username
            .email("john@example.com")
            .expectStatus(400)
            .expectValidation("errors.username", contains("Username is required")),

        UserTestData.invalid()
            .username("john.doe")
            .email("invalid-email")
            .expectStatus(400)
            .expectValidation("errors.email", contains("Invalid email format")),

        // Edge cases
        UserTestData.edge()
            .username("a".repeat(256)) // Too long
            .email("test@example.com")
            .expectStatus(400)
            .expectValidation("errors.username", contains("Username too long")),

        // Business rule validation
        UserTestData.businessRule()
            .username("admin") // Reserved username
            .email("admin@example.com")
            .expectStatus(409)
            .expectValidation("error", equalTo("Username not available"))
    );
}
```

#### **Schema Validation Mastery**
```java
@Service
public class SchemaValidationService {

    private final Map<String, JsonSchema> schemaCache = new ConcurrentHashMap<>();

    public void validateResponseSchema(Response response, String schemaName) {
        JsonSchema schema = getOrLoadSchema(schemaName);

        ProcessingReport report = schema.validate(
            JsonLoader.fromString(response.asString())
        );

        if (!report.isSuccess()) {
            StringBuilder errors = new StringBuilder("Schema validation failed:\n");
            report.forEach(message ->
                errors.append("- ").append(message.getMessage()).append("\n")
            );
            throw new AssertionError(errors.toString());
        }
    }

    private JsonSchema getOrLoadSchema(String schemaName) {
        return schemaCache.computeIfAbsent(schemaName, this::loadSchema);
    }

    private JsonSchema loadSchema(String schemaName) {
        try {
            String schemaPath = String.format("/schemas/%s.json", schemaName);
            JsonNode schemaNode = JsonLoader.fromResource(schemaPath);
            return JsonSchemaFactory.byDefault().getJsonSchema(schemaNode);
        } catch (Exception e) {
            throw new RuntimeException("Failed to load schema: " + schemaName, e);
        }
    }
}

// Advanced schema validation in tests
@Test
public void testCompleteOrderWorkflow() {
    // Create customer
    Response customerResponse = createCustomer(validCustomerData);
    schemaValidator.validateResponseSchema(customerResponse, "customer-response");

    int customerId = customerResponse.jsonPath().getInt("id");

    // Create order
    OrderRequest orderRequest = OrderRequest.builder()
        .customerId(customerId)
        .items(Arrays.asList(
            OrderItem.builder().productId(1).quantity(2).build(),
            OrderItem.builder().productId(2).quantity(1).build()
        ))
        .build();

    Response orderResponse = given()
        .spec(authenticatedSpec)
        .body(orderRequest)
    .when()
        .post("/api/orders")
    .then()
        .statusCode(201)
        .extract().response();

    // Validate complex nested schema
    schemaValidator.validateResponseSchema(orderResponse, "order-response");

    // Additional business validation
    JsonPath orderData = orderResponse.jsonPath();
    assertThat(orderData.getInt("customerId"), equalTo(customerId));
    assertThat(orderData.getList("items"), hasSize(2));
    assertThat(orderData.getBigDecimal("total"), greaterThan(BigDecimal.ZERO));
    assertThat(orderData.getString("status"), equalTo("PENDING"));
}
```

### **Performance Testing Integration**
```java
@Test
@Timeout(value = 30, unit = TimeUnit.SECONDS)
public void testAPIPerformanceUnderLoad() {
    ExecutorService executor = Executors.newFixedThreadPool(20);
    List<Future<Response>> futures = new ArrayList<>();

    // Simulate 100 concurrent requests
    for (int i = 0; i < 100; i++) {
        Future<Response> future = executor.submit(() -> {
            long startTime = System.currentTimeMillis();

            Response response = given()
                .spec(authenticatedSpec)
            .when()
                .get("/api/products?page=1&size=50")
            .then()
                .statusCode(200)
                .extract().response();

            long responseTime = System.currentTimeMillis() - startTime;

            // Performance assertions
            assertThat(responseTime, lessThan(1000L)); // < 1 second

            return response;
        });

        futures.add(future);
    }

    // Collect results
    List<Long> responseTimes = new ArrayList<>();
    int successCount = 0;

    for (Future<Response> future : futures) {
        try {
            Response response = future.get();
            successCount++;

            // Track response times for analysis
            String responseTimeHeader = response.getHeader("X-Response-Time");
            if (responseTimeHeader != null) {
                responseTimes.add(Long.parseLong(responseTimeHeader));
            }
        } catch (Exception e) {
            System.err.println("Request failed: " + e.getMessage());
        }
    }

    executor.shutdown();

    // Performance metrics validation
    assertThat(successCount, greaterThanOrEqualTo(95)); // 95% success rate

    if (!responseTimes.isEmpty()) {
        OptionalDouble avgResponseTime = responseTimes.stream()
            .mapToLong(Long::longValue)
            .average();

        assertThat(avgResponseTime.orElse(0), lessThan(500.0)); // Avg < 500ms
    }
}
```

---

## 📮 POSTMAN/NEWMAN MASTERY (7+ Years)

### **Enterprise Collection Architecture**

#### **Advanced Collection Structure**
```json
{
  "info": {
    "name": "E-Commerce API Suite",
    "description": "Comprehensive API testing for e-commerce platform",
    "version": "2.0.0",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{auth_token}}",
        "type": "string"
      }
    ]
  },
  "event": [
    {
      "listen": "prerequest",
      "script": {
        "exec": [
          "// Global pre-request script",
          "const moment = require('moment');",
          "pm.globals.set('timestamp', moment().toISOString());",
          "",
          "// Token refresh logic",
          "if (!pm.globals.get('auth_token') || pm.globals.get('token_expires') < Date.now()) {",
          "    pm.sendRequest({",
          "        url: pm.environment.get('auth_url') + '/oauth/token',",
          "        method: 'POST',",
          "        header: 'Content-Type:application/x-www-form-urlencoded',",
          "        body: {",
          "            mode: 'urlencoded',",
          "            urlencoded: [",
          "                {key: 'grant_type', value: 'client_credentials'},",
          "                {key: 'client_id', value: pm.environment.get('client_id')},",
          "                {key: 'client_secret', value: pm.environment.get('client_secret')},",
          "                {key: 'scope', value: 'api:read api:write'}",
          "            ]",
          "        }",
          "    }, function (err, response) {",
          "        if (response.code === 200) {",
          "            const tokenData = response.json();",
          "            pm.globals.set('auth_token', tokenData.access_token);",
          "            pm.globals.set('token_expires', Date.now() + (tokenData.expires_in * 1000));",
          "        }",
          "    });",
          "}"
        ]
      }
    },
    {
      "listen": "test",
      "script": {
        "exec": [
          "// Global test script for all requests",
          "pm.test('Response time is acceptable', function () {",
          "    pm.expect(pm.response.responseTime).to.be.below(5000);",
          "});",
          "",
          "pm.test('Response has JSON content type', function () {",
          "    pm.expect(pm.response.headers.get('Content-Type')).to.include('application/json');",
          "});",
          "",
          "// Store response data for cross-request usage",
          "if (pm.response.code === 200 || pm.response.code === 201) {",
          "    const responseJson = pm.response.json();",
          "    ",
          "    // Auto-store IDs for cleanup",
          "    if (responseJson.id) {",
          "        const requestName = pm.info.requestName.toLowerCase();",
          "        if (requestName.includes('create') || requestName.includes('post')) {",
          "            const existingIds = pm.globals.get('created_ids') || '[]';",
          "            const idsArray = JSON.parse(existingIds);",
          "            idsArray.push({type: requestName, id: responseJson.id});",
          "            pm.globals.set('created_ids', JSON.stringify(idsArray));",
          "        }",
          "    }",
          "}"
        ]
      }
    }
  ]
}
```

#### **Advanced Test Scripts**
```javascript
// Comprehensive validation script for user creation
pm.test("User creation - Complete validation", function () {
    const responseJson = pm.response.json();
    const requestData = JSON.parse(pm.request.body.raw);

    // Status code validation
    pm.expect(pm.response.code).to.be.oneOf([200, 201]);

    // Response structure validation
    pm.expect(responseJson).to.have.property('id');
    pm.expect(responseJson).to.have.property('username');
    pm.expect(responseJson).to.have.property('email');
    pm.expect(responseJson).to.have.property('createdAt');
    pm.expect(responseJson).to.have.property('role');

    // Data type validation
    pm.expect(responseJson.id).to.be.a('number');
    pm.expect(responseJson.username).to.be.a('string');
    pm.expect(responseJson.email).to.be.a('string');
    pm.expect(responseJson.createdAt).to.be.a('string');
    pm.expect(responseJson.role).to.be.a('string');

    // Business logic validation
    pm.expect(responseJson.username).to.equal(requestData.username);
    pm.expect(responseJson.email).to.equal(requestData.email);
    pm.expect(responseJson.role).to.equal(requestData.role || 'USER');

    // Date validation
    const createdAt = new Date(responseJson.createdAt);
    const now = new Date();
    pm.expect(createdAt).to.be.at.most(now);
    pm.expect(createdAt).to.be.at.least(new Date(now.getTime() - 60000)); // Within last minute

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    pm.expect(responseJson.email).to.match(emailRegex);

    // Store for subsequent tests
    pm.globals.set('created_user_id', responseJson.id);
    pm.globals.set('created_username', responseJson.username);
});

// Error handling validation
pm.test("Error response structure", function () {
    if (pm.response.code >= 400) {
        const responseJson = pm.response.json();

        // Standard error response structure
        pm.expect(responseJson).to.have.property('error');
        pm.expect(responseJson).to.have.property('message');
        pm.expect(responseJson).to.have.property('timestamp');

        // Error categorization
        if (pm.response.code === 400) {
            pm.expect(responseJson).to.have.property('validationErrors');
            pm.expect(responseJson.validationErrors).to.be.an('array');
        }

        if (pm.response.code === 401) {
            pm.expect(responseJson.error).to.equal('UNAUTHORIZED');
        }

        if (pm.response.code === 403) {
            pm.expect(responseJson.error).to.equal('FORBIDDEN');
        }

        if (pm.response.code === 404) {
            pm.expect(responseJson.error).to.equal('NOT_FOUND');
        }
    }
});

// Performance tracking
pm.test("Performance metrics", function () {
    const responseTime = pm.response.responseTime;
    const requestSize = pm.request.body ? pm.request.body.raw.length : 0;
    const responseSize = pm.response.responseSize;

    // Log performance data
    console.log(`Request: ${pm.info.requestName}`);
    console.log(`Response Time: ${responseTime}ms`);
    console.log(`Request Size: ${requestSize} bytes`);
    console.log(`Response Size: ${responseSize} bytes`);

    // Store in environment for reporting
    const perfData = pm.environment.get('performance_data') || '[]';
    const perfArray = JSON.parse(perfData);

    perfArray.push({
        request: pm.info.requestName,
        timestamp: new Date().toISOString(),
        responseTime: responseTime,
        requestSize: requestSize,
        responseSize: responseSize
    });

    pm.environment.set('performance_data', JSON.stringify(perfArray));

    // Performance assertions
    if (pm.info.requestName.includes('search') || pm.info.requestName.includes('list')) {
        pm.expect(responseTime).to.be.below(1000); // List operations < 1s
    } else {
        pm.expect(responseTime).to.be.below(3000); // Other operations < 3s
    }
});
```

### **CI/CD Integration Excellence**

#### **Newman Command Line Mastery**
```bash
#!/bin/bash
# Advanced Newman execution script

# Environment setup
export API_ENV=${1:-staging}
export NEWMAN_VERSION="5.3.2"

# Create results directory
RESULTS_DIR="newman-results/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$RESULTS_DIR"

echo "Running API tests against $API_ENV environment..."

# Execute test suites with comprehensive reporting
newman run collections/smoke-tests.json \
    --environment "environments/$API_ENV.json" \
    --global-var "test_run_id=$(uuidgen)" \
    --delay-request 100 \
    --timeout-request 30000 \
    --timeout-script 5000 \
    --reporters cli,html,json,junit \
    --reporter-html-export "$RESULTS_DIR/smoke-report.html" \
    --reporter-json-export "$RESULTS_DIR/smoke-results.json" \
    --reporter-junit-export "$RESULTS_DIR/smoke-junit.xml" \
    --bail \
    --color on

SMOKE_EXIT_CODE=$?

if [ $SMOKE_EXIT_CODE -eq 0 ]; then
    echo "Smoke tests passed. Running full regression suite..."

    newman run collections/regression-tests.json \
        --environment "environments/$API_ENV.json" \
        --global-var "test_run_id=$(uuidgen)" \
        --iteration-count 1 \
        --delay-request 50 \
        --timeout-request 60000 \
        --reporters cli,html,json,junit \
        --reporter-html-export "$RESULTS_DIR/regression-report.html" \
        --reporter-json-export "$RESULTS_DIR/regression-results.json" \
        --reporter-junit-export "$RESULTS_DIR/regression-junit.xml" \
        --color on

    REGRESSION_EXIT_CODE=$?

    # Performance test suite
    if [ $REGRESSION_EXIT_CODE -eq 0 ]; then
        echo "Running performance validation..."

        newman run collections/performance-tests.json \
            --environment "environments/$API_ENV.json" \
            --iteration-count 10 \
            --delay-request 0 \
            --reporters cli,json \
            --reporter-json-export "$RESULTS_DIR/performance-results.json"

        PERF_EXIT_CODE=$?

        # Analyze performance results
        node scripts/analyze-performance.js "$RESULTS_DIR/performance-results.json"
    fi
else
    echo "Smoke tests failed. Skipping regression suite."
    exit 1
fi

# Generate consolidated report
node scripts/generate-test-report.js "$RESULTS_DIR"

# Cleanup created test data
newman run collections/cleanup.json \
    --environment "environments/$API_ENV.json" \
    --reporters cli \
    --silent

echo "Test execution completed. Results available in: $RESULTS_DIR"

# Exit with appropriate code
if [ $REGRESSION_EXIT_CODE -eq 0 ] && [ $PERF_EXIT_CODE -eq 0 ]; then
    exit 0
else
    exit 1
fi
```

#### **GitHub Actions Integration**
```yaml
name: API Testing Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours

jobs:
  api-testing:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        environment: [staging, production]

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install Newman
        run: npm install -g newman newman-reporter-htmlextra

      - name: Create results directory
        run: mkdir -p test-results

      - name: Run API Smoke Tests
        run: |
          newman run postman/collections/smoke-tests.json \
            --environment postman/environments/${{ matrix.environment }}.json \
            --reporters cli,htmlextra,json \
            --reporter-htmlextra-export test-results/smoke-report-${{ matrix.environment }}.html \
            --reporter-json-export test-results/smoke-results-${{ matrix.environment }}.json \
            --env-var "api_key=${{ secrets.API_KEY }}" \
            --env-var "client_secret=${{ secrets.CLIENT_SECRET }}"

      - name: Run Regression Tests
        if: success()
        run: |
          newman run postman/collections/regression-tests.json \
            --environment postman/environments/${{ matrix.environment }}.json \
            --reporters cli,htmlextra,json \
            --reporter-htmlextra-export test-results/regression-report-${{ matrix.environment }}.html \
            --reporter-json-export test-results/regression-results-${{ matrix.environment }}.json \
            --env-var "api_key=${{ secrets.API_KEY }}" \
            --env-var "client_secret=${{ secrets.CLIENT_SECRET }}"

      - name: Performance Validation
        if: success()
        run: |
          newman run postman/collections/performance-tests.json \
            --environment postman/environments/${{ matrix.environment }}.json \
            --iteration-count 20 \
            --reporters json \
            --reporter-json-export test-results/performance-results-${{ matrix.environment }}.json \
            --env-var "api_key=${{ secrets.API_KEY }}"

      - name: Upload Test Results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: api-test-results-${{ matrix.environment }}
          path: test-results/

      - name: Publish Test Results
        uses: dorny/test-reporter@v1
        if: always()
        with:
          name: API Tests - ${{ matrix.environment }}
          path: test-results/*junit.xml
          reporter: java-junit

      - name: Comment PR with Results
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const resultsPath = 'test-results/regression-results-${{ matrix.environment }}.json';

            if (fs.existsSync(resultsPath)) {
              const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
              const totalTests = results.run.stats.tests.total;
              const passedTests = results.run.stats.tests.total - results.run.stats.tests.failed;
              const failedTests = results.run.stats.tests.failed;

              const comment = `## API Test Results - ${{ matrix.environment }}

              ✅ **Passed:** ${passedTests}
              ❌ **Failed:** ${failedTests}
              📊 **Total:** ${totalTests}
              ⏱️ **Duration:** ${results.run.timings.completed - results.run.timings.started}ms

              ${failedTests > 0 ? '⚠️ Some tests failed. Please check the detailed report.' : '🎉 All tests passed!'}`;

              github.rest.issues.createComment({
                issue_number: context.issue.number,
                owner: context.repo.owner,
                repo: context.repo.repo,
                body: comment
              });
            }
```

---

## 🤝 CONTRACT TESTING EXCELLENCE (4+ Years)

### **Pact Implementation Mastery**

#### **Consumer-Driven Contract Testing**
```javascript
// Advanced Pact consumer test
const { Pact } = require('@pact-foundation/pact');
const { somethingLike, term, eachLike } = require('@pact-foundation/pact').Matchers;

describe('User Service Contract Tests', () => {
    const provider = new Pact({
        consumer: 'frontend-app',
        provider: 'user-service',
        port: 1234,
        log: path.resolve(process.cwd(), 'logs', 'pact.log'),
        dir: path.resolve(process.cwd(), 'pacts'),
        logLevel: 'INFO',
        spec: 2
    });

    beforeAll(() => provider.setup());
    afterAll(() => provider.finalize());
    afterEach(() => provider.verify());

    describe('User Management', () => {
        it('should get user details with complete profile', async () => {
            // Arrange
            await provider.addInteraction({
                state: 'user with ID 123 exists with complete profile',
                uponReceiving: 'a request for user details with ID 123',
                withRequest: {
                    method: 'GET',
                    path: '/api/users/123',
                    headers: {
                        'Authorization': term({
                            generate: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                            matcher: '^Bearer .+'
                        }),
                        'Accept': 'application/json'
                    }
                },
                willRespondWith: {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8'
                    },
                    body: {
                        id: 123,
                        username: somethingLike('john.doe'),
                        email: term({
                            generate: 'john.doe@example.com',
                            matcher: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
                        }),
                        profile: {
                            firstName: somethingLike('John'),
                            lastName: somethingLike('Doe'),
                            dateOfBirth: term({
                                generate: '1990-01-01',
                                matcher: '^\\d{4}-\\d{2}-\\d{2}$'
                            }),
                            address: {
                                street: somethingLike('123 Main St'),
                                city: somethingLike('New York'),
                                zipCode: term({
                                    generate: '10001',
                                    matcher: '^\\d{5}$'
                                }),
                                country: somethingLike('USA')
                            }
                        },
                        preferences: {
                            language: somethingLike('en'),
                            timezone: somethingLike('America/New_York'),
                            notifications: {
                                email: somethingLike(true),
                                sms: somethingLike(false),
                                push: somethingLike(true)
                            }
                        },
                        roles: eachLike('USER', { min: 1 }),
                        createdAt: term({
                            generate: '2023-01-01T00:00:00.000Z',
                            matcher: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$'
                        }),
                        lastLoginAt: term({
                            generate: '2024-01-01T12:00:00.000Z',
                            matcher: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$'
                        })
                    }
                }
            });

            // Act
            const result = await userService.getUserById(123, 'fake-token');

            // Assert
            expect(result).toMatchObject({
                id: 123,
                username: expect.any(String),
                email: expect.stringMatching(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
                profile: {
                    firstName: expect.any(String),
                    lastName: expect.any(String),
                    dateOfBirth: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
                    address: {
                        street: expect.any(String),
                        city: expect.any(String),
                        zipCode: expect.stringMatching(/^\d{5}$/),
                        country: expect.any(String)
                    }
                },
                preferences: expect.objectContaining({
                    language: expect.any(String),
                    timezone: expect.any(String),
                    notifications: expect.objectContaining({
                        email: expect.any(Boolean),
                        sms: expect.any(Boolean),
                        push: expect.any(Boolean)
                    })
                }),
                roles: expect.arrayContaining([expect.any(String)]),
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
                lastLoginAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });
        });

        it('should handle user creation with validation', async () => {
            const newUser = {
                username: 'new.user',
                email: 'new.user@example.com',
                password: 'securePassword123!',
                profile: {
                    firstName: 'New',
                    lastName: 'User'
                }
            };

            await provider.addInteraction({
                state: 'username "new.user" is available',
                uponReceiving: 'a request to create a new user',
                withRequest: {
                    method: 'POST',
                    path: '/api/users',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': term({
                            generate: 'Bearer admin-token',
                            matcher: '^Bearer .+'
                        })
                    },
                    body: newUser
                },
                willRespondWith: {
                    status: 201,
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                        'Location': term({
                            generate: '/api/users/456',
                            matcher: '^/api/users/\\d+$'
                        })
                    },
                    body: {
                        id: somethingLike(456),
                        username: newUser.username,
                        email: newUser.email,
                        profile: {
                            firstName: newUser.profile.firstName,
                            lastName: newUser.profile.lastName
                        },
                        roles: eachLike('USER'),
                        createdAt: term({
                            generate: '2024-01-01T12:00:00.000Z',
                            matcher: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$'
                        }),
                        emailVerified: false,
                        accountStatus: 'ACTIVE'
                    }
                }
            });

            const result = await userService.createUser(newUser, 'admin-token');

            expect(result).toMatchObject({
                id: expect.any(Number),
                username: newUser.username,
                email: newUser.email,
                emailVerified: false,
                accountStatus: 'ACTIVE'
            });
        });
    });
});
```

#### **Provider Verification with State Management**
```java
// Advanced Pact provider verification
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@PactBroker(url = "https://pact-broker.example.com")
@Provider("user-service")
@PactFolder("pacts")
public class UserServiceContractTest {

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private EmailService emailService;

    @LocalServerPort
    private int port;

    @BeforeEach
    void setUp(PactVerificationContext context) {
        context.setTarget(new HttpTestTarget("localhost", port, "/"));
    }

    @TestTemplate
    @ExtendWith(PactVerificationInvocationContextProvider.class)
    void pactVerificationTestTemplate(PactVerificationContext context) {
        context.verifyInteraction();
    }

    @State("user with ID 123 exists with complete profile")
    void userWithCompleteProfileExists() {
        User mockUser = User.builder()
            .id(123L)
            .username("john.doe")
            .email("john.doe@example.com")
            .profile(UserProfile.builder()
                .firstName("John")
                .lastName("Doe")
                .dateOfBirth(LocalDate.of(1990, 1, 1))
                .address(Address.builder()
                    .street("123 Main St")
                    .city("New York")
                    .zipCode("10001")
                    .country("USA")
                    .build())
                .build())
            .preferences(UserPreferences.builder()
                .language("en")
                .timezone("America/New_York")
                .notifications(NotificationSettings.builder()
                    .email(true)
                    .sms(false)
                    .push(true)
                    .build())
                .build())
            .roles(Set.of(Role.USER))
            .createdAt(Instant.parse("2023-01-01T00:00:00.000Z"))
            .lastLoginAt(Instant.parse("2024-01-01T12:00:00.000Z"))
            .build();

        when(userRepository.findById(123L)).thenReturn(Optional.of(mockUser));
    }

    @State("username \"new.user\" is available")
    void usernameIsAvailable() {
        when(userRepository.existsByUsername("new.user")).thenReturn(false);
        when(userRepository.existsByEmail("new.user@example.com")).thenReturn(false);

        // Mock user creation
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(456L);
            user.setCreatedAt(Instant.parse("2024-01-01T12:00:00.000Z"));
            user.setEmailVerified(false);
            user.setAccountStatus(AccountStatus.ACTIVE);
            return user;
        });

        // Mock email service
        doNothing().when(emailService).sendVerificationEmail(any(User.class));
    }

    @State("user with ID 999 does not exist")
    void userDoesNotExist() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());
    }

    @State("user with ID 123 has insufficient permissions")
    void userHasInsufficientPermissions() {
        User limitedUser = User.builder()
            .id(123L)
            .username("limited.user")
            .roles(Set.of(Role.USER)) // Only USER role, not ADMIN
            .build();

        when(userRepository.findById(123L)).thenReturn(Optional.of(limitedUser));
    }
}
```

### **OpenAPI Schema Validation**

#### **Schema-First Development Integration**
```java
@Service
public class OpenAPIValidationService {

    private final OpenAPIV3Parser parser = new OpenAPIV3Parser();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private OpenAPI openAPI;

    @PostConstruct
    public void init() {
        ParseOptions options = new ParseOptions();
        options.setResolve(true);
        options.setResolveFully(true);

        SwaggerParseResult result = parser.readLocation(
            "src/main/resources/api-spec.yaml", null, options
        );

        this.openAPI = result.getOpenAPI();

        if (result.getMessages() != null && !result.getMessages().isEmpty()) {
            throw new IllegalStateException("OpenAPI spec validation failed: " +
                String.join(", ", result.getMessages()));
        }
    }

    public void validateRequest(String path, String method, Object requestBody) {
        PathItem pathItem = openAPI.getPaths().get(path);
        if (pathItem == null) {
            throw new ValidationException("Path not found in OpenAPI spec: " + path);
        }

        Operation operation = getOperation(pathItem, method);
        if (operation == null) {
            throw new ValidationException("Method not allowed for path: " + method + " " + path);
        }

        if (requestBody != null) {
            validateRequestBody(operation, requestBody);
        }
    }

    public void validateResponse(String path, String method, int statusCode, Object responseBody) {
        PathItem pathItem = openAPI.getPaths().get(path);
        Operation operation = getOperation(pathItem, method);

        ApiResponse apiResponse = operation.getResponses().get(String.valueOf(statusCode));
        if (apiResponse == null) {
            apiResponse = operation.getResponses().get("default");
        }

        if (apiResponse == null) {
            throw new ValidationException("Unexpected response status: " + statusCode);
        }

        if (responseBody != null) {
            validateResponseBody(apiResponse, responseBody);
        }
    }

    private void validateRequestBody(Operation operation, Object requestBody) {
        RequestBody requestBodySpec = operation.getRequestBody();
        if (requestBodySpec == null) {
            throw new ValidationException("Request body not expected");
        }

        Content content = requestBodySpec.getContent();
        MediaType mediaType = content.get("application/json");
        if (mediaType == null) {
            throw new ValidationException("JSON request body not supported");
        }

        Schema schema = mediaType.getSchema();
        validateAgainstSchema(schema, requestBody, "Request body");
    }

    private void validateResponseBody(ApiResponse apiResponse, Object responseBody) {
        Content content = apiResponse.getContent();
        if (content == null) {
            return; // No content expected
        }

        MediaType mediaType = content.get("application/json");
        if (mediaType == null) {
            return; // JSON not expected
        }

        Schema schema = mediaType.getSchema();
        validateAgainstSchema(schema, responseBody, "Response body");
    }

    private void validateAgainstSchema(Schema schema, Object data, String context) {
        try {
            JsonNode jsonNode = objectMapper.valueToTree(data);
            Set<ValidationMessage> errors = JsonSchemaFactory.getInstance()
                .getSchema(objectMapper.writeValueAsString(schema))
                .validate(jsonNode);

            if (!errors.isEmpty()) {
                String errorMessage = errors.stream()
                    .map(ValidationMessage::getMessage)
                    .collect(Collectors.joining(", "));
                throw new ValidationException(context + " validation failed: " + errorMessage);
            }
        } catch (Exception e) {
            throw new ValidationException("Schema validation error: " + e.getMessage(), e);
        }
    }

    private Operation getOperation(PathItem pathItem, String method) {
        return switch (method.toUpperCase()) {
            case "GET" -> pathItem.getGet();
            case "POST" -> pathItem.getPost();
            case "PUT" -> pathItem.getPut();
            case "DELETE" -> pathItem.getDelete();
            case "PATCH" -> pathItem.getPatch();
            case "HEAD" -> pathItem.getHead();
            case "OPTIONS" -> pathItem.getOptions();
            default -> null;
        };
    }
}

// Integration in tests
@Test
public void testUserCreationAgainstOpenAPISpec() {
    UserCreateRequest request = UserCreateRequest.builder()
        .username("testuser")
        .email("test@example.com")
        .password("securePassword123!")
        .build();

    // Validate request against OpenAPI spec
    openAPIValidator.validateRequest("/api/users", "POST", request);

    Response response = given()
        .spec(authenticatedSpec)
        .body(request)
    .when()
        .post("/api/users")
    .then()
        .statusCode(201)
        .extract().response();

    // Validate response against OpenAPI spec
    openAPIValidator.validateResponse("/api/users", "POST", 201, response.as(UserResponse.class));

    // Additional business logic validation
    UserResponse userResponse = response.as(UserResponse.class);
    assertThat(userResponse.getUsername()).isEqualTo(request.getUsername());
    assertThat(userResponse.getEmail()).isEqualTo(request.getEmail());
    assertThat(userResponse.getId()).isNotNull();
}
```

---

## 🎯 INTERVIEW TALKING POINTS

### **Your API Testing Evolution Story**
"I've been doing API testing for 10+ years, which means I've seen the entire evolution:

- **Early Days (2013-2015)**: SOAP services with SoapUI, XML validation, WSDL parsing
- **REST Revolution (2016-2018)**: Postman collections, JSON schemas, first automation attempts
- **Automation Maturity (2019-2020)**: REST Assured frameworks, CI/CD integration, data-driven testing
- **Modern Practices (2021-2024)**: Contract testing, GraphQL, performance integration, observability"

### **Technical Depth Demonstration**
1. **Framework Design**: "I architect API testing frameworks with layered abstraction - configuration, authentication, validation, reporting"
2. **Contract Testing**: "I implement consumer-driven contracts with Pact to prevent integration failures"
3. **Performance Integration**: "I combine functional API tests with performance validation using the same test data"
4. **Schema Evolution**: "I handle API versioning and backward compatibility through comprehensive schema validation"

### **Business Value Delivered**
- **Prevented Production Issues**: "Contract testing caught 50+ breaking changes before production"
- **Accelerated Development**: "API-first testing enabled parallel frontend/backend development"
- **Reduced Testing Time**: "Automated API regression from 2 days to 30 minutes"
- **Improved Quality**: "Schema validation eliminated 90% of data format issues"

### **Problem-Solving Examples**
- **Flaky API Tests**: "Implemented intelligent retry mechanisms and better wait strategies"
- **Authentication Complexity**: "Built token management system handling OAuth2, refresh tokens, and multi-tenant scenarios"
- **Test Data Management**: "Created data factories with automatic cleanup and isolation strategies"

---

## 📚 QUICK REFERENCE - API Testing Arsenal

### **REST Assured Power Patterns**
```java
// Authentication management
RequestSpecification authSpec = given()
    .auth().oauth2(tokenManager.getValidToken())
    .contentType(ContentType.JSON);

// Response validation
.then()
    .statusCode(anyOf(200, 201, 204))
    .time(lessThan(5000L))
    .body("id", notNullValue())
    .body("email", matchesPattern("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$"))
    .body("items", hasSize(greaterThan(0)));

// Schema validation
.body(matchesJsonSchemaInClasspath("schemas/user-response.json"));

// Complex data extraction
int userId = response.jsonPath().getInt("id");
List<String> roles = response.jsonPath().getList("roles", String.class);
```

### **Postman Advanced Techniques**
```javascript
// Dynamic data generation
pm.globals.set('random_email',
    `test_${Math.random().toString(36).substr(2, 9)}@example.com`);

// Response chaining
const userId = pm.response.json().id;
pm.environment.set('created_user_id', userId);

// Schema validation
pm.test("Response matches schema", function () {
    const schema = {
        type: "object",
        required: ["id", "username", "email"],
        properties: {
            id: { type: "number" },
            username: { type: "string" },
            email: { type: "string", format: "email" }
        }
    };
    pm.expect(pm.response.json()).to.be.jsonSchema(schema);
});
```

### **Contract Testing Essentials**
```javascript
// Pact matchers
const { somethingLike, term, eachLike } = Matchers;

// Flexible matching
body: {
    id: somethingLike(123),
    email: term({
        generate: 'test@example.com',
        matcher: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$'
    }),
    roles: eachLike('USER', { min: 1 })
}

// State management
.state('user with premium subscription exists')
```

---

**You're ready to demonstrate your 10+ years of API testing mastery! Remember to emphasize both technical depth and business impact. Your experience spans the entire API testing evolution - use that as your unique advantage! 🚀**