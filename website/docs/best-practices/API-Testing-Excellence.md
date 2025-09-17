# 🔌 API Testing Excellence

> Comprehensive strategies for testing the backbone of modern applications

## 📋 Overview

### Purpose and Scope
This guide provides advanced API testing methodologies, tools, and best practices for ensuring robust, reliable, and performant API implementations. It covers REST, GraphQL, gRPC, and WebSocket testing approaches, along with contract testing, security validation, and performance optimization.

### Target Audience
- API Test Engineers and QA Professionals
- Backend Developers and API Designers
- DevOps Engineers implementing API gateways
- Technical Architects designing API strategies
- Product Managers overseeing API products

### Key Benefits
- **Complete API Coverage:** Test functionality, security, and performance
- **Early Issue Detection:** Find API problems before UI implementation
- **Contract Confidence:** Ensure API compatibility across services
- **Documentation as Tests:** Tests serve as living API documentation
- **Faster Development:** Enable parallel frontend/backend development

## 🏛️ Fundamental Principles

### Core API Testing Concepts
1. **Contract-First Testing:** Define and validate API contracts
2. **Layered Testing:** Unit, integration, contract, and E2E API tests
3. **Negative Testing:** Validate error handling and edge cases
4. **Performance Awareness:** Every API test includes performance validation
5. **Security by Default:** Security testing integrated, not added

### API Testing Pyramid
```
        ┌───────────┐
        │    E2E    │ 5%
        ├───────────┤
        │Integration│ 15%
        ├───────────┤
        │ Contract  │ 20%
        ├───────────┤
        │Component │ 25%
        ├───────────┤
        │   Unit    │ 35%
        └───────────┘
```

### Anti-Patterns to Avoid
❌ **Testing only happy paths** - Miss critical error scenarios
❌ **Ignoring performance** - APIs can become bottlenecks
❌ **Hard-coded test data** - Tests become brittle and unmaintainable
❌ **No contract testing** - Breaking changes reach production
❌ **Testing implementation, not behavior** - Tests break with refactoring

## 🔧 REST API Testing

### Comprehensive REST Testing Strategy

```javascript
// rest-api-test-framework.js
const axios = require('axios');
const { expect } = require('chai');

class RESTAPITester {
  constructor(baseURL, config = {}) {
    this.client = axios.create({
      baseURL,
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      }
    });

    // Add request/response interceptors
    this.setupInterceptors();
    this.metrics = [];
  }

  setupInterceptors() {
    // Request interceptor for logging and metrics
    this.client.interceptors.request.use(
      config => {
        config.metadata = { startTime: Date.now() };
        console.log(`🚀 ${config.method.toUpperCase()} ${config.url}`);
        return config;
      },
      error => Promise.reject(error)
    );

    // Response interceptor for validation and metrics
    this.client.interceptors.response.use(
      response => {
        const duration = Date.now() - response.config.metadata.startTime;

        this.metrics.push({
          method: response.config.method,
          url: response.config.url,
          status: response.status,
          duration
        });

        console.log(`✅ ${response.status} (${duration}ms)`);

        // Validate response structure
        this.validateResponse(response);

        return response;
      },
      error => {
        if (error.response) {
          const duration = Date.now() - error.config.metadata.startTime;
          console.log(`❌ ${error.response.status} (${duration}ms)`);
        }
        return Promise.reject(error);
      }
    );
  }

  validateResponse(response) {
    // Common validations
    expect(response.status).to.be.at.least(100).and.below(600);
    expect(response.headers['content-type']).to.include('application/json');

    // Performance validation
    const duration = this.metrics[this.metrics.length - 1].duration;
    expect(duration).to.be.below(1000, 'Response time should be under 1 second');
  }

  async testCRUDOperations(endpoint, testData) {
    const results = {
      create: null,
      read: null,
      update: null,
      delete: null
    };

    // CREATE
    results.create = await this.testCreate(endpoint, testData);
    const id = results.create.data.id;

    // READ
    results.read = await this.testRead(endpoint, id);

    // UPDATE
    results.update = await this.testUpdate(endpoint, id, { ...testData, updated: true });

    // DELETE
    results.delete = await this.testDelete(endpoint, id);

    // Verify deletion
    await this.testReadNotFound(endpoint, id);

    return results;
  }

  async testCreate(endpoint, data) {
    const response = await this.client.post(endpoint, data);

    expect(response.status).to.equal(201);
    expect(response.data).to.have.property('id');
    expect(response.data).to.deep.include(data);

    return response;
  }

  async testRead(endpoint, id) {
    const response = await this.client.get(`${endpoint}/${id}`);

    expect(response.status).to.equal(200);
    expect(response.data).to.have.property('id', id);

    return response;
  }

  async testUpdate(endpoint, id, data) {
    const response = await this.client.put(`${endpoint}/${id}`, data);

    expect(response.status).to.be.oneOf([200, 204]);
    if (response.data) {
      expect(response.data).to.deep.include(data);
    }

    return response;
  }

  async testDelete(endpoint, id) {
    const response = await this.client.delete(`${endpoint}/${id}`);

    expect(response.status).to.be.oneOf([200, 204]);

    return response;
  }

  async testReadNotFound(endpoint, id) {
    try {
      await this.client.get(`${endpoint}/${id}`);
      throw new Error('Expected 404 but request succeeded');
    } catch (error) {
      expect(error.response.status).to.equal(404);
    }
  }

  async testPagination(endpoint, totalItems = 100) {
    // Test different page sizes
    const pageSizes = [10, 25, 50];

    for (const pageSize of pageSizes) {
      const response = await this.client.get(endpoint, {
        params: { page: 1, limit: pageSize }
      });

      expect(response.data).to.have.property('items');
      expect(response.data.items).to.have.lengthOf.at.most(pageSize);
      expect(response.data).to.have.property('total', totalItems);
      expect(response.data).to.have.property('page', 1);
      expect(response.data).to.have.property('totalPages', Math.ceil(totalItems / pageSize));
    }
  }

  async testFiltering(endpoint, filterParams) {
    for (const [key, value] of Object.entries(filterParams)) {
      const response = await this.client.get(endpoint, {
        params: { [key]: value }
      });

      expect(response.status).to.equal(200);
      expect(response.data.items).to.be.an('array');

      // Verify all items match filter
      response.data.items.forEach(item => {
        expect(item[key]).to.equal(value);
      });
    }
  }

  async testSorting(endpoint, sortFields) {
    for (const field of sortFields) {
      // Test ascending
      const ascResponse = await this.client.get(endpoint, {
        params: { sort: field, order: 'asc' }
      });

      const ascValues = ascResponse.data.items.map(item => item[field]);
      expect(ascValues).to.deep.equal([...ascValues].sort());

      // Test descending
      const descResponse = await this.client.get(endpoint, {
        params: { sort: field, order: 'desc' }
      });

      const descValues = descResponse.data.items.map(item => item[field]);
      expect(descValues).to.deep.equal([...descValues].sort().reverse());
    }
  }

  getPerformanceReport() {
    const report = {
      totalRequests: this.metrics.length,
      avgResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0
    };

    if (this.metrics.length === 0) return report;

    const times = this.metrics.map(m => m.duration).sort((a, b) => a - b);

    report.avgResponseTime = times.reduce((a, b) => a + b, 0) / times.length;
    report.minResponseTime = times[0];
    report.maxResponseTime = times[times.length - 1];
    report.p95ResponseTime = times[Math.floor(times.length * 0.95)];
    report.p99ResponseTime = times[Math.floor(times.length * 0.99)];

    return report;
  }
}

// Usage Example
describe('User API Tests', () => {
  let apiTester;

  before(() => {
    apiTester = new RESTAPITester('https://api.example.com');
  });

  it('should perform CRUD operations', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user'
    };

    await apiTester.testCRUDOperations('/users', userData);
  });

  it('should handle pagination correctly', async () => {
    await apiTester.testPagination('/users', 150);
  });

  it('should filter results correctly', async () => {
    await apiTester.testFiltering('/users', {
      role: 'admin',
      status: 'active'
    });
  });

  it('should sort results correctly', async () => {
    await apiTester.testSorting('/users', ['name', 'createdAt', 'email']);
  });

  after(() => {
    console.log('Performance Report:', apiTester.getPerformanceReport());
  });
});
```

### Advanced REST Testing Patterns

#### 1. Authentication & Authorization Testing

```javascript
// auth-testing.js
class AuthenticationTester {
  async testAuthenticationFlows() {
    // Test successful authentication
    await this.testSuccessfulLogin();

    // Test invalid credentials
    await this.testInvalidCredentials();

    // Test token expiration
    await this.testTokenExpiration();

    // Test token refresh
    await this.testTokenRefresh();

    // Test logout
    await this.testLogout();
  }

  async testSuccessfulLogin() {
    const response = await axios.post('/auth/login', {
      username: 'testuser',
      password: 'Test123!'
    });

    expect(response.status).to.equal(200);
    expect(response.data).to.have.property('accessToken');
    expect(response.data).to.have.property('refreshToken');

    // Validate JWT structure
    const tokenParts = response.data.accessToken.split('.');
    expect(tokenParts).to.have.lengthOf(3);

    // Decode and validate payload
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    expect(payload).to.have.property('sub');
    expect(payload).to.have.property('exp');
    expect(payload.exp).to.be.above(Date.now() / 1000);

    return response.data.accessToken;
  }

  async testAuthorizationLevels() {
    const testCases = [
      {
        role: 'admin',
        endpoint: '/admin/users',
        expectedStatus: 200
      },
      {
        role: 'user',
        endpoint: '/admin/users',
        expectedStatus: 403
      },
      {
        role: 'guest',
        endpoint: '/api/profile',
        expectedStatus: 401
      }
    ];

    for (const testCase of testCases) {
      const token = await this.getTokenForRole(testCase.role);

      try {
        const response = await axios.get(testCase.endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });
        expect(response.status).to.equal(testCase.expectedStatus);
      } catch (error) {
        expect(error.response.status).to.equal(testCase.expectedStatus);
      }
    }
  }

  async testRateLimiting() {
    const requests = [];
    const endpoint = '/api/data';
    const rateLimit = 100; // Expected rate limit

    // Send requests rapidly
    for (let i = 0; i < rateLimit + 10; i++) {
      requests.push(
        axios.get(endpoint).catch(err => err.response)
      );
    }

    const responses = await Promise.all(requests);

    // Check that rate limiting kicked in
    const rateLimitedResponses = responses.filter(r => r.status === 429);
    expect(rateLimitedResponses).to.have.lengthOf.at.least(1);

    // Check rate limit headers
    const lastResponse = responses[responses.length - 1];
    expect(lastResponse.headers).to.have.property('x-ratelimit-limit');
    expect(lastResponse.headers).to.have.property('x-ratelimit-remaining');
    expect(lastResponse.headers).to.have.property('x-ratelimit-reset');
  }
}
```

#### 2. Error Handling & Edge Cases

```javascript
// error-handling-tests.js
class ErrorHandlingTester {
  async testErrorScenarios() {
    await this.testMalformedRequests();
    await this.testBoundaryValues();
    await this.testConcurrency();
    await this.testIdempotency();
  }

  async testMalformedRequests() {
    const testCases = [
      {
        name: 'Invalid JSON',
        data: '{invalid json}',
        headers: { 'Content-Type': 'application/json' },
        expectedStatus: 400,
        expectedError: 'Invalid JSON'
      },
      {
        name: 'Missing required fields',
        data: { email: 'test@example.com' }, // Missing 'name' field
        expectedStatus: 400,
        expectedError: 'Validation error'
      },
      {
        name: 'Invalid data types',
        data: { age: 'not a number', email: 'invalid-email' },
        expectedStatus: 400,
        expectedError: 'Type validation failed'
      },
      {
        name: 'SQL injection attempt',
        data: { name: "'; DROP TABLE users; --" },
        expectedStatus: 400,
        expectedError: 'Invalid input'
      },
      {
        name: 'XSS attempt',
        data: { description: '<script>alert("XSS")</script>' },
        expectedStatus: 400,
        expectedError: 'Invalid input'
      }
    ];

    for (const testCase of testCases) {
      try {
        const response = await axios.post('/api/users', testCase.data, {
          headers: testCase.headers
        });

        throw new Error(`Expected error for ${testCase.name}`);
      } catch (error) {
        expect(error.response.status).to.equal(testCase.expectedStatus);
        expect(error.response.data.error).to.include(testCase.expectedError);
      }
    }
  }

  async testBoundaryValues() {
    const boundaries = [
      {
        field: 'age',
        min: 0,
        max: 150,
        testValues: [-1, 0, 1, 149, 150, 151]
      },
      {
        field: 'name',
        minLength: 1,
        maxLength: 100,
        testValues: ['', 'a', 'a'.repeat(100), 'a'.repeat(101)]
      },
      {
        field: 'price',
        min: 0.01,
        max: 999999.99,
        testValues: [0, 0.01, 999999.99, 1000000]
      }
    ];

    for (const boundary of boundaries) {
      for (const value of boundary.testValues) {
        const isValid = this.isWithinBoundary(value, boundary);

        try {
          const response = await axios.post('/api/products', {
            [boundary.field]: value
          });

          expect(isValid).to.be.true;
          expect(response.status).to.equal(201);
        } catch (error) {
          expect(isValid).to.be.false;
          expect(error.response.status).to.equal(400);
        }
      }
    }
  }

  async testIdempotency() {
    const idempotencyKey = 'test-key-' + Date.now();
    const requestData = {
      amount: 100,
      currency: 'USD'
    };

    // First request
    const response1 = await axios.post('/api/payments', requestData, {
      headers: { 'Idempotency-Key': idempotencyKey }
    });

    // Duplicate requests
    const response2 = await axios.post('/api/payments', requestData, {
      headers: { 'Idempotency-Key': idempotencyKey }
    });

    const response3 = await axios.post('/api/payments', requestData, {
      headers: { 'Idempotency-Key': idempotencyKey }
    });

    // All responses should be identical
    expect(response1.data).to.deep.equal(response2.data);
    expect(response2.data).to.deep.equal(response3.data);

    // Same transaction ID
    expect(response1.data.transactionId).to.equal(response2.data.transactionId);
  }
}
```

## 🔷 GraphQL Testing

### GraphQL Testing Framework

```javascript
// graphql-tester.js
const { request, gql } = require('graphql-request');

class GraphQLTester {
  constructor(endpoint) {
    this.endpoint = endpoint;
    this.client = request;
  }

  async testQuery(query, variables = {}, expectedShape = {}) {
    const startTime = Date.now();

    try {
      const data = await this.client(this.endpoint, query, variables);
      const responseTime = Date.now() - startTime;

      // Performance check
      expect(responseTime).to.be.below(1000);

      // Shape validation
      this.validateShape(data, expectedShape);

      return data;
    } catch (error) {
      this.handleGraphQLError(error);
    }
  }

  async testMutation(mutation, variables, expectedResult) {
    const data = await this.client(this.endpoint, mutation, variables);

    // Validate mutation result
    expect(data).to.deep.include(expectedResult);

    return data;
  }

  async testSubscription(subscription, variables, timeout = 5000) {
    // WebSocket connection for subscriptions
    const ws = new WebSocket(this.endpoint.replace('http', 'ws'));

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        ws.close();
        reject(new Error('Subscription timeout'));
      }, timeout);

      ws.on('message', (data) => {
        clearTimeout(timer);
        ws.close();
        resolve(JSON.parse(data));
      });

      ws.on('open', () => {
        ws.send(JSON.stringify({
          type: 'subscription',
          payload: { query: subscription, variables }
        }));
      });
    });
  }

  async testBatchedQueries(queries) {
    const batchedQuery = gql`
      query BatchedQuery {
        ${queries.map((q, i) => `
          query${i}: ${q}
        `).join('\n')}
      }
    `;

    const startTime = Date.now();
    const results = await this.client(this.endpoint, batchedQuery);
    const responseTime = Date.now() - startTime;

    // Batched queries should be more efficient
    const individualTime = await this.measureIndividualQueries(queries);
    expect(responseTime).to.be.below(individualTime * 0.7);

    return results;
  }

  async testFieldResolver(type, field, args = {}) {
    const query = gql`
      query TestFieldResolver {
        ${type} {
          ${field}${args ? `(${this.argsToString(args)})` : ''}
        }
      }
    `;

    const result = await this.client(this.endpoint, query);

    // Validate field exists and has correct type
    expect(result[type]).to.have.property(field);

    return result[type][field];
  }

  async testPaginationPatterns() {
    // Cursor-based pagination
    await this.testCursorPagination();

    // Offset-based pagination
    await this.testOffsetPagination();

    // Relay-style pagination
    await this.testRelayPagination();
  }

  async testCursorPagination() {
    const query = gql`
      query GetItems($cursor: String, $limit: Int!) {
        items(after: $cursor, first: $limit) {
          edges {
            node {
              id
              name
            }
            cursor
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;

    let cursor = null;
    let hasMore = true;
    const allItems = [];

    while (hasMore) {
      const result = await this.client(this.endpoint, query, {
        cursor,
        limit: 10
      });

      allItems.push(...result.items.edges);
      hasMore = result.items.pageInfo.hasNextPage;
      cursor = result.items.pageInfo.endCursor;
    }

    // Verify no duplicates
    const ids = allItems.map(e => e.node.id);
    expect(new Set(ids).size).to.equal(ids.length);
  }

  async testComplexQueries() {
    const complexQuery = gql`
      query ComplexQuery($userId: ID!, $orderStatus: OrderStatus) {
        user(id: $userId) {
          id
          name
          email
          orders(status: $orderStatus) {
            id
            total
            items {
              product {
                id
                name
                category {
                  name
                }
              }
              quantity
              price
            }
          }
          statistics {
            totalOrders
            totalSpent
            averageOrderValue
          }
        }
      }
    `;

    const result = await this.testQuery(complexQuery, {
      userId: '123',
      orderStatus: 'COMPLETED'
    });

    // Validate nested structure
    expect(result.user).to.have.property('orders');
    expect(result.user.orders[0]).to.have.property('items');
    expect(result.user.orders[0].items[0]).to.have.property('product');
    expect(result.user.orders[0].items[0].product).to.have.property('category');
  }

  async testErrorHandling() {
    // Test malformed query
    try {
      await this.client(this.endpoint, 'invalid query');
    } catch (error) {
      expect(error.response.errors).to.be.an('array');
      expect(error.response.errors[0]).to.have.property('message');
    }

    // Test unauthorized access
    const restrictedQuery = gql`
      query {
        adminData {
          sensitiveInfo
        }
      }
    `;

    try {
      await this.client(this.endpoint, restrictedQuery);
    } catch (error) {
      expect(error.response.errors[0].extensions.code).to.equal('UNAUTHENTICATED');
    }
  }

  async testPerformanceMetrics() {
    const performanceQuery = gql`
      query PerformanceTest {
        users(limit: 100) {
          id
          name
          posts(limit: 10) {
            id
            title
            comments(limit: 5) {
              id
              text
            }
          }
        }
      }
    `;

    const metrics = await this.measureQueryPerformance(performanceQuery);

    expect(metrics.totalTime).to.be.below(2000);
    expect(metrics.resolverTime).to.be.below(1500);
    expect(metrics.databaseQueries).to.be.below(10); // N+1 query check
  }
}

// Usage Example
describe('GraphQL API Tests', () => {
  let tester;

  before(() => {
    tester = new GraphQLTester('http://localhost:4000/graphql');
  });

  it('should query user data', async () => {
    const query = gql`
      query GetUser($id: ID!) {
        user(id: $id) {
          id
          name
          email
        }
      }
    `;

    const result = await tester.testQuery(query, { id: '123' });
    expect(result.user).to.have.property('name');
  });

  it('should create user via mutation', async () => {
    const mutation = gql`
      mutation CreateUser($input: CreateUserInput!) {
        createUser(input: $input) {
          id
          name
          email
        }
      }
    `;

    const result = await tester.testMutation(mutation, {
      input: {
        name: 'Test User',
        email: 'test@example.com'
      }
    });

    expect(result.createUser).to.have.property('id');
  });
});
```

## 📝 Contract Testing

### Consumer-Driven Contract Testing with Pact

```javascript
// pact-consumer-test.js
const { Pact } = require('@pact-foundation/pact');
const path = require('path');
const { UserApiClient } = require('./user-api-client');

describe('User API Consumer Tests', () => {
  const provider = new Pact({
    consumer: 'Frontend Application',
    provider: 'User Service',
    port: 1234,
    log: path.resolve(process.cwd(), 'logs', 'pact.log'),
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: 'INFO'
  });

  before(() => provider.setup());
  after(() => provider.finalize());

  describe('Get User', () => {
    before(() => {
      const interaction = {
        state: 'user with ID 123 exists',
        uponReceiving: 'a request for user 123',
        withRequest: {
          method: 'GET',
          path: '/users/123',
          headers: {
            Accept: 'application/json'
          }
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            id: '123',
            name: 'John Doe',
            email: 'john@example.com',
            createdAt: '2024-01-01T00:00:00Z'
          }
        }
      };

      return provider.addInteraction(interaction);
    });

    it('returns the correct user', async () => {
      const client = new UserApiClient('http://localhost:1234');
      const user = await client.getUser('123');

      expect(user).to.deep.equal({
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: '2024-01-01T00:00:00Z'
      });
    });
  });

  describe('Create User', () => {
    before(() => {
      const interaction = {
        state: 'ready to create users',
        uponReceiving: 'a request to create a user',
        withRequest: {
          method: 'POST',
          path: '/users',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: {
            name: 'Jane Doe',
            email: 'jane@example.com'
          }
        },
        willRespondWith: {
          status: 201,
          headers: {
            'Content-Type': 'application/json',
            Location: '/users/456'
          },
          body: {
            id: '456',
            name: 'Jane Doe',
            email: 'jane@example.com',
            createdAt: '2024-01-02T00:00:00Z'
          }
        }
      };

      return provider.addInteraction(interaction);
    });

    it('creates a new user', async () => {
      const client = new UserApiClient('http://localhost:1234');
      const user = await client.createUser({
        name: 'Jane Doe',
        email: 'jane@example.com'
      });

      expect(user).to.have.property('id', '456');
      expect(user).to.have.property('name', 'Jane Doe');
    });
  });
});

// pact-provider-test.js
const { Verifier } = require('@pact-foundation/pact');
const path = require('path');

describe('User Service Provider Tests', () => {
  const verifier = new Verifier({
    provider: 'User Service',
    providerBaseUrl: 'http://localhost:3000',
    pactUrls: [
      path.resolve(process.cwd(), 'pacts', 'frontend_application-user_service.json')
    ],
    stateHandlers: {
      'user with ID 123 exists': () => {
        // Setup test data
        return createTestUser({ id: '123', name: 'John Doe' });
      },
      'ready to create users': () => {
        // Clean database
        return cleanDatabase();
      }
    },
    publishVerificationResult: true,
    providerVersion: '1.0.0'
  });

  it('validates the expectations of Frontend Application', () => {
    return verifier.verifyProvider();
  });
});
```

### Schema-Based Contract Testing

```javascript
// schema-contract-testing.js
const Joi = require('joi');
const OpenAPIValidator = require('express-openapi-validator');

class SchemaContractTester {
  constructor(schemaPath) {
    this.schemas = require(schemaPath);
  }

  validateResponse(endpoint, method, response) {
    const schema = this.getSchema(endpoint, method);
    const validation = schema.validate(response);

    if (validation.error) {
      throw new Error(`Schema validation failed: ${validation.error.message}`);
    }

    return validation.value;
  }

  getSchema(endpoint, method) {
    // User schema example
    if (endpoint === '/users' && method === 'GET') {
      return Joi.object({
        users: Joi.array().items(
          Joi.object({
            id: Joi.string().uuid().required(),
            name: Joi.string().min(1).max(100).required(),
            email: Joi.string().email().required(),
            role: Joi.string().valid('admin', 'user', 'guest').required(),
            createdAt: Joi.date().iso().required(),
            updatedAt: Joi.date().iso().required()
          })
        ),
        pagination: Joi.object({
          total: Joi.number().integer().min(0).required(),
          page: Joi.number().integer().min(1).required(),
          perPage: Joi.number().integer().min(1).max(100).required(),
          totalPages: Joi.number().integer().min(0).required()
        })
      });
    }

    // Add more schemas for different endpoints
    throw new Error(`No schema defined for ${method} ${endpoint}`);
  }

  async testOpenAPICompliance(apiSpec, baseUrl) {
    const validator = new OpenAPIValidator.middleware({
      apiSpec,
      validateRequests: true,
      validateResponses: true
    });

    // Test all defined endpoints
    const paths = Object.keys(apiSpec.paths);

    for (const path of paths) {
      const methods = Object.keys(apiSpec.paths[path]);

      for (const method of methods) {
        if (method === 'parameters') continue;

        const operation = apiSpec.paths[path][method];
        await this.testOperation(baseUrl, path, method, operation);
      }
    }
  }

  async testOperation(baseUrl, path, method, operation) {
    const testData = this.generateTestData(operation);

    const response = await axios({
      method,
      url: `${baseUrl}${path}`,
      data: testData.body,
      params: testData.params,
      headers: testData.headers
    });

    // Validate response against OpenAPI schema
    this.validateOpenAPIResponse(response, operation);
  }
}
```

## 🔐 API Security Testing

### Security Testing Framework

```javascript
// api-security-tester.js
class APISecurityTester {
  async runSecurityTests(baseUrl) {
    const results = {
      authentication: await this.testAuthentication(baseUrl),
      authorization: await this.testAuthorization(baseUrl),
      injection: await this.testInjection(baseUrl),
      encryption: await this.testEncryption(baseUrl),
      rateLimit: await this.testRateLimit(baseUrl),
      cors: await this.testCORS(baseUrl)
    };

    return results;
  }

  async testAuthentication(baseUrl) {
    const tests = [];

    // Test missing authentication
    tests.push(await this.testMissingAuth(baseUrl));

    // Test invalid tokens
    tests.push(await this.testInvalidTokens(baseUrl));

    // Test expired tokens
    tests.push(await this.testExpiredTokens(baseUrl));

    // Test token manipulation
    tests.push(await this.testTokenManipulation(baseUrl));

    return tests;
  }

  async testMissingAuth(baseUrl) {
    try {
      const response = await axios.get(`${baseUrl}/api/protected`);
      return {
        test: 'Missing Authentication',
        passed: false,
        message: 'Protected endpoint accessible without auth'
      };
    } catch (error) {
      return {
        test: 'Missing Authentication',
        passed: error.response?.status === 401,
        message: error.response?.status === 401
          ? 'Correctly rejected unauthorized request'
          : `Unexpected status: ${error.response?.status}`
      };
    }
  }

  async testInjection(baseUrl) {
    const injectionPayloads = [
      // SQL Injection
      "'; DROP TABLE users; --",
      "1' OR '1'='1",
      "admin'--",

      // NoSQL Injection
      '{"$gt": ""}',
      '{"$ne": null}',

      // Command Injection
      '; ls -la',
      '| cat /etc/passwd',

      // LDAP Injection
      '*)(uid=*',
      'admin)(|(password=*',

      // XPath Injection
      "' or '1'='1",
      "'] | //user/*",

      // XXE Injection
      '<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo>&xxe;</foo>'
    ];

    const results = [];

    for (const payload of injectionPayloads) {
      try {
        const response = await axios.post(`${baseUrl}/api/search`, {
          query: payload
        });

        // If request succeeds, check if payload was sanitized
        if (response.data.includes(payload)) {
          results.push({
            vulnerability: 'Injection',
            payload,
            status: 'VULNERABLE',
            message: 'Payload not sanitized'
          });
        } else {
          results.push({
            vulnerability: 'Injection',
            payload,
            status: 'SAFE',
            message: 'Payload properly sanitized'
          });
        }
      } catch (error) {
        results.push({
          vulnerability: 'Injection',
          payload,
          status: 'SAFE',
          message: 'Request rejected'
        });
      }
    }

    return results;
  }

  async testRateLimit(baseUrl) {
    const endpoint = `${baseUrl}/api/data`;
    const requests = [];
    const requestCount = 150; // Exceed expected rate limit

    // Send rapid requests
    for (let i = 0; i < requestCount; i++) {
      requests.push(
        axios.get(endpoint)
          .then(res => ({ status: res.status, headers: res.headers }))
          .catch(err => ({
            status: err.response?.status,
            headers: err.response?.headers
          }))
      );
    }

    const responses = await Promise.all(requests);

    // Analyze responses
    const rateLimited = responses.filter(r => r.status === 429);
    const successful = responses.filter(r => r.status === 200);

    return {
      test: 'Rate Limiting',
      totalRequests: requestCount,
      successful: successful.length,
      rateLimited: rateLimited.length,
      passed: rateLimited.length > 0,
      message: rateLimited.length > 0
        ? `Rate limiting active after ${successful.length} requests`
        : 'No rate limiting detected - VULNERABLE'
    };
  }

  async testCORS(baseUrl) {
    const origins = [
      'http://evil.com',
      'null',
      'file://',
      '*'
    ];

    const results = [];

    for (const origin of origins) {
      try {
        const response = await axios.get(`${baseUrl}/api/data`, {
          headers: { Origin: origin }
        });

        const allowedOrigin = response.headers['access-control-allow-origin'];

        results.push({
          origin,
          allowed: allowedOrigin === origin || allowedOrigin === '*',
          message: allowedOrigin
            ? `CORS allows: ${allowedOrigin}`
            : 'CORS not configured'
        });
      } catch (error) {
        results.push({
          origin,
          allowed: false,
          message: 'Request blocked'
        });
      }
    }

    return {
      test: 'CORS Configuration',
      results,
      vulnerable: results.some(r => r.origin === '*' && r.allowed),
      message: results.some(r => r.origin === '*' && r.allowed)
        ? 'VULNERABLE: Wildcard CORS allowed'
        : 'CORS properly configured'
    };
  }

  async testEncryption(baseUrl) {
    // Test HTTPS enforcement
    if (!baseUrl.startsWith('https://')) {
      return {
        test: 'Encryption',
        passed: false,
        message: 'API not using HTTPS'
      };
    }

    // Test sensitive data in responses
    const response = await axios.get(`${baseUrl}/api/user/profile`);
    const sensitiveFields = ['password', 'ssn', 'creditCard', 'token'];
    const exposedFields = sensitiveFields.filter(field =>
      response.data[field] !== undefined
    );

    return {
      test: 'Encryption',
      passed: exposedFields.length === 0,
      exposedFields,
      message: exposedFields.length > 0
        ? `Sensitive fields exposed: ${exposedFields.join(', ')}`
        : 'No sensitive data exposed'
    };
  }
}
```

## ⚡ Performance Testing

### API Performance Testing Suite

```javascript
// api-performance-tester.js
const autocannon = require('autocannon');
const k6 = require('k6');

class APIPerformanceTester {
  async runLoadTest(url, options = {}) {
    const config = {
      url,
      connections: options.connections || 10,
      duration: options.duration || 30,
      pipelining: options.pipelining || 1,
      workers: options.workers || 4,
      ...options
    };

    return new Promise((resolve) => {
      const instance = autocannon(config, (err, result) => {
        if (err) throw err;
        resolve(this.analyzeResults(result));
      });

      autocannon.track(instance, { renderProgressBar: true });
    });
  }

  analyzeResults(results) {
    const analysis = {
      requests: {
        total: results.requests.total,
        persec: results.requests.persec
      },
      latency: {
        min: results.latency.min,
        max: results.latency.max,
        average: results.latency.mean,
        p50: results.latency.p50,
        p95: results.latency.p95,
        p99: results.latency.p99
      },
      throughput: {
        average: results.throughput.mean,
        total: results.throughput.total
      },
      errors: results.errors,
      timeouts: results.timeouts,
      // Performance grade calculation
      grade: this.calculatePerformanceGrade(results)
    };

    return analysis;
  }

  calculatePerformanceGrade(results) {
    let score = 100;

    // Deduct points based on performance metrics
    if (results.latency.p95 > 1000) score -= 20;
    if (results.latency.p95 > 500) score -= 10;
    if (results.errors > 0) score -= 30;
    if (results.timeouts > 0) score -= 20;
    if (results.requests.persec < 100) score -= 10;

    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  async runStressTest(url, options = {}) {
    const stages = options.stages || [
      { duration: '2m', target: 10 },   // Ramp up
      { duration: '5m', target: 50 },   // Stay at 50
      { duration: '2m', target: 100 },  // Spike
      { duration: '5m', target: 100 },  // Stay at peak
      { duration: '2m', target: 0 }     // Ramp down
    ];

    const k6Script = `
      import http from 'k6/http';
      import { check, sleep } from 'k6';

      export let options = {
        stages: ${JSON.stringify(stages)},
        thresholds: {
          http_req_duration: ['p(95)<500'],
          http_req_failed: ['rate<0.1']
        }
      };

      export default function() {
        let response = http.get('${url}');

        check(response, {
          'status is 200': (r) => r.status === 200,
          'response time < 500ms': (r) => r.timings.duration < 500
        });

        sleep(1);
      }
    `;

    // Execute k6 test
    const result = await this.executeK6Test(k6Script);
    return this.analyzeStressTestResults(result);
  }

  async runSpikeTest(url) {
    return this.runStressTest(url, {
      stages: [
        { duration: '10s', target: 10 },
        { duration: '10s', target: 1000 },  // Sudden spike
        { duration: '30s', target: 1000 },
        { duration: '10s', target: 10 }
      ]
    });
  }

  async runSoakTest(url) {
    return this.runLoadTest(url, {
      duration: 3600,  // 1 hour
      connections: 50,
      // Monitor for memory leaks and performance degradation
      onUpdate: (results) => {
        if (results.latency.p95 > 1000) {
          console.warn('Performance degradation detected');
        }
      }
    });
  }

  async compareAPIVersions(v1Url, v2Url) {
    const [v1Results, v2Results] = await Promise.all([
      this.runLoadTest(v1Url),
      this.runLoadTest(v2Url)
    ]);

    const comparison = {
      latencyImprovement: {
        p50: ((v1Results.latency.p50 - v2Results.latency.p50) / v1Results.latency.p50) * 100,
        p95: ((v1Results.latency.p95 - v2Results.latency.p95) / v1Results.latency.p95) * 100,
        p99: ((v1Results.latency.p99 - v2Results.latency.p99) / v1Results.latency.p99) * 100
      },
      throughputImprovement:
        ((v2Results.throughput.average - v1Results.throughput.average) / v1Results.throughput.average) * 100,
      errorRateComparison: {
        v1: v1Results.errors,
        v2: v2Results.errors
      },
      recommendation: this.getPerformanceRecommendation(v1Results, v2Results)
    };

    return comparison;
  }

  getPerformanceRecommendation(v1, v2) {
    if (v2.latency.p95 < v1.latency.p95 * 0.8) {
      return 'SIGNIFICANT_IMPROVEMENT: V2 shows >20% latency improvement';
    }
    if (v2.latency.p95 < v1.latency.p95) {
      return 'IMPROVEMENT: V2 performs better';
    }
    if (v2.latency.p95 > v1.latency.p95 * 1.1) {
      return 'REGRESSION: V2 shows performance degradation';
    }
    return 'NEUTRAL: Similar performance';
  }
}
```

## 📊 API Monitoring & Observability

### Continuous API Monitoring

```javascript
// api-monitor.js
class APIMonitor {
  constructor(config) {
    this.endpoints = config.endpoints;
    this.interval = config.interval || 60000; // 1 minute
    this.alerts = config.alerts;
    this.metrics = [];
  }

  async startMonitoring() {
    setInterval(async () => {
      for (const endpoint of this.endpoints) {
        const result = await this.checkEndpoint(endpoint);
        this.metrics.push(result);

        if (result.status !== 'healthy') {
          await this.sendAlert(endpoint, result);
        }
      }
    }, this.interval);
  }

  async checkEndpoint(endpoint) {
    const startTime = Date.now();

    try {
      const response = await axios({
        method: endpoint.method || 'GET',
        url: endpoint.url,
        timeout: endpoint.timeout || 5000,
        validateStatus: () => true
      });

      const responseTime = Date.now() - startTime;

      return {
        endpoint: endpoint.name,
        timestamp: new Date().toISOString(),
        status: this.getHealthStatus(response.status, responseTime, endpoint),
        statusCode: response.status,
        responseTime,
        details: this.extractDetails(response)
      };
    } catch (error) {
      return {
        endpoint: endpoint.name,
        timestamp: new Date().toISOString(),
        status: 'down',
        error: error.message
      };
    }
  }

  getHealthStatus(statusCode, responseTime, endpoint) {
    if (statusCode >= 500) return 'critical';
    if (statusCode >= 400) return 'degraded';
    if (responseTime > endpoint.sla?.responseTime || 2000) return 'slow';
    return 'healthy';
  }

  async sendAlert(endpoint, result) {
    const alert = {
      severity: this.getSeverity(result.status),
      endpoint: endpoint.name,
      status: result.status,
      message: this.getAlertMessage(endpoint, result),
      timestamp: result.timestamp
    };

    // Send to multiple channels
    await Promise.all([
      this.sendSlackAlert(alert),
      this.sendEmailAlert(alert),
      this.sendPagerDutyAlert(alert)
    ]);
  }

  getSeverity(status) {
    const severityMap = {
      'critical': 'P1',
      'down': 'P1',
      'degraded': 'P2',
      'slow': 'P3'
    };
    return severityMap[status] || 'P4';
  }

  generateDashboard() {
    const last24Hours = this.metrics.filter(m =>
      new Date(m.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    return {
      summary: this.calculateSummary(last24Hours),
      availability: this.calculateAvailability(last24Hours),
      performance: this.calculatePerformanceMetrics(last24Hours),
      incidents: this.getIncidents(last24Hours),
      trends: this.calculateTrends(last24Hours)
    };
  }

  calculateAvailability(metrics) {
    const total = metrics.length;
    const healthy = metrics.filter(m => m.status === 'healthy').length;
    return (healthy / total) * 100;
  }
}
```

## 📋 Quick Reference

### API Testing Checklist

```markdown
## Comprehensive API Testing Checklist

### Functional Testing
- [ ] CRUD operations work correctly
- [ ] Input validation enforced
- [ ] Error messages informative
- [ ] Business logic validated
- [ ] Data persistence verified

### Security Testing
- [ ] Authentication required
- [ ] Authorization enforced
- [ ] Input sanitization
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] Rate limiting active
- [ ] HTTPS enforced
- [ ] Sensitive data protected

### Performance Testing
- [ ] Response time acceptable
- [ ] Throughput sufficient
- [ ] Load handling verified
- [ ] Memory leaks checked
- [ ] Database optimization

### Contract Testing
- [ ] API contracts defined
- [ ] Consumer expectations met
- [ ] Provider compliance verified
- [ ] Breaking changes detected
- [ ] Version compatibility

### Documentation
- [ ] OpenAPI/Swagger spec current
- [ ] Examples provided
- [ ] Error codes documented
- [ ] Authentication documented
- [ ] Rate limits documented
```

### Common API Status Codes

```markdown
## HTTP Status Code Reference

### Success (2xx)
- 200 OK - Request succeeded
- 201 Created - Resource created
- 202 Accepted - Request accepted for processing
- 204 No Content - Success with no response body

### Redirection (3xx)
- 301 Moved Permanently - Resource moved
- 304 Not Modified - Resource unchanged

### Client Error (4xx)
- 400 Bad Request - Invalid request
- 401 Unauthorized - Authentication required
- 403 Forbidden - Access denied
- 404 Not Found - Resource doesn't exist
- 409 Conflict - Request conflicts with state
- 422 Unprocessable Entity - Validation failed
- 429 Too Many Requests - Rate limited

### Server Error (5xx)
- 500 Internal Server Error - Server error
- 502 Bad Gateway - Invalid upstream response
- 503 Service Unavailable - Server temporarily down
- 504 Gateway Timeout - Upstream timeout
```

---

## 🎯 Key Takeaways

1. **Test All Layers** - Unit, integration, contract, and E2E testing all serve purposes
2. **Automate Everything** - Manual API testing doesn't scale
3. **Security is Essential** - Every API needs security testing
4. **Performance Matters** - APIs are often bottlenecks
5. **Contract Testing Prevents Breaks** - Catch incompatibilities early
6. **Monitor Production** - Testing doesn't stop at deployment
7. **Documentation is Critical** - Tests serve as living documentation

---

*"APIs are the contracts that bind our distributed systems together. Test them thoroughly, monitor them continuously, and never break them carelessly."*

**Remember:** A robust API is the foundation of modern applications. Invest in comprehensive API testing to ensure reliability, security, and performance.