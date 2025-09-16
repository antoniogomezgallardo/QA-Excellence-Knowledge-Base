# Microservices Testing Excellence Guide

## Overview

Microservices testing requires sophisticated strategies to validate distributed systems effectively while maintaining development velocity and system reliability. This comprehensive guide establishes advanced testing methodologies, frameworks, and practices for complex microservices architectures.

### Purpose and Scope
- Define comprehensive microservices testing strategies and patterns
- Establish contract testing and service virtualization frameworks
- Provide chaos engineering and resilience testing methodologies
- Create distributed tracing and observability testing practices

### Target Audience
- Senior QA Engineers working with distributed systems
- Microservices architects implementing quality strategies
- DevOps engineers integrating testing into service pipelines
- Test automation engineers scaling testing across services

### Key Benefits
- Ensures reliable inter-service communication and integration
- Validates system resilience and failure recovery mechanisms
- Enables independent service development and testing
- Maintains system quality at scale with distributed teams
- Reduces production incidents through comprehensive testing

## Fundamental Principles

### Microservices Testing Philosophy

#### 1. Testing Pyramid for Microservices
```
Microservices Testing Pyramid
├── End-to-End Tests (5%)
│   ├── Critical user journeys
│   ├── Cross-service workflows
│   └── Production-like environments
├── Integration Tests (15%)
│   ├── Contract testing
│   ├── API gateway testing
│   ├── Database integration
│   └── External service integration
├── Component Tests (30%)
│   ├── Service-level testing
│   ├── Test doubles for dependencies
│   ├── Database testing
│   └── Configuration testing
└── Unit Tests (50%)
    ├── Business logic testing
    ├── Domain model validation
    ├── Utility function testing
    └── Error handling verification
```

#### 2. Service Testing Strategies

| Testing Type | Scope | Isolation Level | Tools/Frameworks |
|-------------|-------|-----------------|------------------|
| **Unit Testing** | Single service components | Complete isolation | JUnit, pytest, Jest |
| **Component Testing** | Service with test doubles | Service boundary | Testcontainers, WireMock |
| **Contract Testing** | API agreements | Consumer-provider | PACT, Spring Cloud Contract |
| **Integration Testing** | Service interactions | Limited isolation | REST Assured, Postman |
| **End-to-End Testing** | Complete workflows | No isolation | Selenium, Playwright, Cypress |

#### 3. Microservices Testing Anti-Patterns

❌ **End-to-End Test Heavy**
- Avoid over-reliance on brittle E2E tests
- Focus on lower-level testing for faster feedback

❌ **Shared Test Environments**
- Each service team should own their testing environments
- Use containerization for environment consistency

❌ **Ignoring Service Boundaries**
- Test at appropriate abstraction levels
- Respect service encapsulation in tests

❌ **Manual Integration Testing**
- Automate all integration testing
- Use contract testing for reliable service integration

## Step-by-Step Implementation

### Phase 1: Service Testing Foundation

#### 1.1 Component Testing Framework

```java
/**
 * Component Testing Framework for Microservices
 * Complete testing framework for individual services with dependency isolation
 */

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestcontainersTest
@ActiveProfiles("test")
public class OrderServiceComponentTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:13")
            .withDatabaseName("order_service_test")
            .withUsername("test")
            .withPassword("test");

    @Container
    static WireMockContainer wiremock = new WireMockContainer("wiremock/wiremock:2.35.0")
            .withMappingFromResource("payment-service", "payment-service-mappings.json")
            .withMappingFromResource("inventory-service", "inventory-service-mappings.json");

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private OrderRepository orderRepository;

    @MockBean
    private EmailService emailService;

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        // Database configuration
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);

        // External service URLs
        registry.add("services.payment.url",
            () -> "http://localhost:" + wiremock.getFirstMappedPort());
        registry.add("services.inventory.url",
            () -> "http://localhost:" + wiremock.getFirstMappedPort());
    }

    @Test
    @DisplayName("Should create order successfully when all dependencies are available")
    void shouldCreateOrderSuccessfully() {
        // Given
        CreateOrderRequest request = CreateOrderRequest.builder()
                .customerId("customer-123")
                .items(List.of(
                    OrderItem.builder()
                        .productId("product-456")
                        .quantity(2)
                        .price(new BigDecimal("29.99"))
                        .build()
                ))
                .build();

        // When
        ResponseEntity<OrderResponse> response = restTemplate.postForEntity(
                "/api/orders", request, OrderResponse.class);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getOrderId()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(OrderStatus.CONFIRMED);

        // Verify database state
        Optional<Order> savedOrder = orderRepository.findById(response.getBody().getOrderId());
        assertThat(savedOrder).isPresent();
        assertThat(savedOrder.get().getCustomerId()).isEqualTo("customer-123");

        // Verify external service interactions
        verify(exactly(1), postRequestedFor(urlEqualTo("/api/payments"))
                .withHeader("Content-Type", equalTo("application/json")));
        verify(exactly(1), putRequestedFor(urlMatching("/api/inventory/reserve/.*")));

        // Verify email notification
        verify(emailService).sendOrderConfirmation(eq("customer-123"), any(Order.class));
    }

    @Test
    @DisplayName("Should handle payment failure gracefully")
    void shouldHandlePaymentFailure() {
        // Given
        stubFor(post(urlEqualTo("/api/payments"))
                .willReturn(aResponse()
                        .withStatus(400)
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"error\":\"INSUFFICIENT_FUNDS\"}")));

        CreateOrderRequest request = CreateOrderRequest.builder()
                .customerId("customer-456")
                .items(List.of(OrderItem.builder()
                        .productId("product-789")
                        .quantity(1)
                        .price(new BigDecimal("999.99"))
                        .build()))
                .build();

        // When
        ResponseEntity<ErrorResponse> response = restTemplate.postForEntity(
                "/api/orders", request, ErrorResponse.class);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody().getErrorCode()).isEqualTo("PAYMENT_FAILED");

        // Verify no order was saved
        List<Order> orders = orderRepository.findByCustomerId("customer-456");
        assertThat(orders).isEmpty();

        // Verify compensation actions
        verify(exactly(1), deleteRequestedFor(urlMatching("/api/inventory/reserve/.*")));
    }

    @Test
    @DisplayName("Should retry on transient failures")
    void shouldRetryOnTransientFailures() {
        // Given
        stubFor(post(urlEqualTo("/api/payments"))
                .inScenario("Retry Scenario")
                .whenScenarioStateIs(STARTED)
                .willReturn(aResponse().withStatus(503))
                .willSetStateTo("First Retry"));

        stubFor(post(urlEqualTo("/api/payments"))
                .inScenario("Retry Scenario")
                .whenScenarioStateIs("First Retry")
                .willReturn(aResponse().withStatus(503))
                .willSetStateTo("Second Retry"));

        stubFor(post(urlEqualTo("/api/payments"))
                .inScenario("Retry Scenario")
                .whenScenarioStateIs("Second Retry")
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"paymentId\":\"payment-123\",\"status\":\"APPROVED\"}")));

        CreateOrderRequest request = CreateOrderRequest.builder()
                .customerId("customer-retry")
                .items(List.of(OrderItem.builder()
                        .productId("product-retry")
                        .quantity(1)
                        .price(new BigDecimal("49.99"))
                        .build()))
                .build();

        // When
        ResponseEntity<OrderResponse> response = restTemplate.postForEntity(
                "/api/orders", request, OrderResponse.class);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);

        // Verify retry attempts
        verify(exactly(3), postRequestedFor(urlEqualTo("/api/payments")));
    }

    @Nested
    @DisplayName("Order Status Management Tests")
    class OrderStatusTests {

        @Test
        @DisplayName("Should update order status through workflow")
        void shouldUpdateOrderStatusThroughWorkflow() {
            // Test complete order lifecycle
            // 1. Create order
            // 2. Process payment
            // 3. Reserve inventory
            // 4. Ship order
            // 5. Complete order

            String orderId = createTestOrder();

            // Process payment
            ResponseEntity<Void> paymentResponse = restTemplate.postForEntity(
                    "/api/orders/" + orderId + "/process-payment", null, Void.class);
            assertThat(paymentResponse.getStatusCode()).isEqualTo(HttpStatus.OK);

            // Verify status updated
            Order order = orderRepository.findById(orderId).orElseThrow();
            assertThat(order.getStatus()).isEqualTo(OrderStatus.PAYMENT_PROCESSED);

            // Ship order
            ResponseEntity<Void> shipResponse = restTemplate.postForEntity(
                    "/api/orders/" + orderId + "/ship", null, Void.class);
            assertThat(shipResponse.getStatusCode()).isEqualTo(HttpStatus.OK);

            // Verify final status
            order = orderRepository.findById(orderId).orElseThrow();
            assertThat(order.getStatus()).isEqualTo(OrderStatus.SHIPPED);
        }

        private String createTestOrder() {
            CreateOrderRequest request = CreateOrderRequest.builder()
                    .customerId("workflow-customer")
                    .items(List.of(OrderItem.builder()
                            .productId("workflow-product")
                            .quantity(1)
                            .price(new BigDecimal("19.99"))
                            .build()))
                    .build();

            ResponseEntity<OrderResponse> response = restTemplate.postForEntity(
                    "/api/orders", request, OrderResponse.class);

            return response.getBody().getOrderId();
        }
    }
}

/**
 * Test Configuration for Component Tests
 */
@TestConfiguration
@Profile("test")
public class ComponentTestConfiguration {

    @Bean
    @Primary
    public Clock testClock() {
        return Clock.fixed(Instant.parse("2024-01-15T10:00:00Z"), ZoneId.of("UTC"));
    }

    @Bean
    @Primary
    public IdGenerator testIdGenerator() {
        return new SequentialIdGenerator("TEST");
    }

    @EventListener
    public void handleOrderEvents(OrderEvent event) {
        // Capture events for testing
        TestEventCapture.capture(event);
    }
}

/**
 * Test Event Capture Utility
 */
public class TestEventCapture {
    private static final List<Object> capturedEvents = new ArrayList<>();

    public static void capture(Object event) {
        capturedEvents.add(event);
    }

    public static <T> List<T> getEventsOfType(Class<T> eventType) {
        return capturedEvents.stream()
                .filter(eventType::isInstance)
                .map(eventType::cast)
                .collect(Collectors.toList());
    }

    public static void clear() {
        capturedEvents.clear();
    }
}
```

#### 1.2 Service Virtualization Framework

```python
#!/usr/bin/env python3
"""
Service Virtualization Framework for Microservices Testing
Provides realistic service mocks and stubs for isolated testing
"""

import json
import time
import random
import asyncio
from typing import Dict, List, Any, Optional, Callable
from dataclasses import dataclass, field
from enum import Enum
import aiohttp
from aiohttp import web
import pytest
import yaml
from unittest.mock import Mock, AsyncMock

class ServiceBehavior(Enum):
    NORMAL = "normal"
    SLOW = "slow"
    ERROR = "error"
    FLAKY = "flaky"
    TIMEOUT = "timeout"

@dataclass
class ServiceEndpoint:
    path: str
    method: str
    response_data: Dict[str, Any]
    status_code: int = 200
    delay_ms: int = 0
    behavior: ServiceBehavior = ServiceBehavior.NORMAL
    headers: Dict[str, str] = field(default_factory=dict)

@dataclass
class ServiceScenario:
    name: str
    description: str
    endpoints: List[ServiceEndpoint]
    duration_minutes: Optional[int] = None

class VirtualService:
    def __init__(self, service_name: str, port: int):
        self.service_name = service_name
        self.port = port
        self.endpoints = {}
        self.scenarios = {}
        self.current_scenario = None
        self.request_log = []
        self.app = web.Application()
        self.runner = None

    def add_endpoint(self, endpoint: ServiceEndpoint):
        """Add endpoint to virtual service"""
        key = f"{endpoint.method}:{endpoint.path}"
        self.endpoints[key] = endpoint

    def add_scenario(self, scenario: ServiceScenario):
        """Add testing scenario to virtual service"""
        self.scenarios[scenario.name] = scenario

    def activate_scenario(self, scenario_name: str):
        """Activate specific testing scenario"""
        if scenario_name in self.scenarios:
            self.current_scenario = self.scenarios[scenario_name]
            # Update endpoints with scenario configuration
            for endpoint in self.current_scenario.endpoints:
                self.add_endpoint(endpoint)
        else:
            raise ValueError(f"Scenario '{scenario_name}' not found")

    async def start(self):
        """Start virtual service"""
        self.app.router.add_route('*', '/{path:.*}', self._handle_request)
        self.runner = web.AppRunner(self.app)
        await self.runner.setup()
        site = web.TCPSite(self.runner, 'localhost', self.port)
        await site.start()
        print(f"Virtual service '{self.service_name}' started on port {self.port}")

    async def stop(self):
        """Stop virtual service"""
        if self.runner:
            await self.runner.cleanup()
            print(f"Virtual service '{self.service_name}' stopped")

    async def _handle_request(self, request: web.Request) -> web.Response:
        """Handle incoming requests"""
        path = request.path
        method = request.method.upper()
        key = f"{method}:{path}"

        # Log request
        self.request_log.append({
            'timestamp': time.time(),
            'method': method,
            'path': path,
            'headers': dict(request.headers),
            'query': dict(request.query),
            'body': await self._get_request_body(request)
        })

        # Find matching endpoint
        endpoint = self.endpoints.get(key)
        if not endpoint:
            return web.Response(status=404, text="Endpoint not found")

        # Apply behavior modifications
        await self._apply_behavior(endpoint)

        # Prepare response
        response_headers = endpoint.headers.copy()
        response_headers['Content-Type'] = 'application/json'

        return web.Response(
            status=endpoint.status_code,
            body=json.dumps(endpoint.response_data),
            headers=response_headers
        )

    async def _get_request_body(self, request: web.Request) -> Optional[Dict]:
        """Extract request body safely"""
        try:
            if request.content_type == 'application/json':
                return await request.json()
            else:
                text = await request.text()
                return {'raw_body': text} if text else None
        except:
            return None

    async def _apply_behavior(self, endpoint: ServiceEndpoint):
        """Apply behavioral modifications to endpoint"""
        if endpoint.behavior == ServiceBehavior.SLOW:
            delay = endpoint.delay_ms or random.randint(2000, 5000)
            await asyncio.sleep(delay / 1000)

        elif endpoint.behavior == ServiceBehavior.ERROR:
            error_codes = [500, 502, 503, 504]
            raise web.HTTPInternalServerError()

        elif endpoint.behavior == ServiceBehavior.FLAKY:
            if random.random() < 0.3:  # 30% chance of failure
                raise web.HTTPServiceUnavailable()
            elif random.random() < 0.5:  # 50% chance of slow response
                await asyncio.sleep(random.uniform(1, 3))

        elif endpoint.behavior == ServiceBehavior.TIMEOUT:
            await asyncio.sleep(30)  # Simulate timeout

        elif endpoint.delay_ms > 0:
            await asyncio.sleep(endpoint.delay_ms / 1000)

    def get_request_log(self) -> List[Dict]:
        """Get all logged requests"""
        return self.request_log.copy()

    def clear_request_log(self):
        """Clear request log"""
        self.request_log.clear()

    def verify_request(self, method: str, path: str, count: int = 1) -> bool:
        """Verify specific request was made"""
        matching_requests = [
            req for req in self.request_log
            if req['method'] == method.upper() and req['path'] == path
        ]
        return len(matching_requests) == count

class ServiceVirtualizationManager:
    def __init__(self):
        self.services = {}
        self.scenarios = {}

    def create_service(self, service_name: str, port: int) -> VirtualService:
        """Create new virtual service"""
        service = VirtualService(service_name, port)
        self.services[service_name] = service
        return service

    def load_service_definition(self, service_name: str, definition_file: str):
        """Load service definition from YAML file"""
        with open(definition_file, 'r') as f:
            definition = yaml.safe_load(f)

        service = self.create_service(service_name, definition['port'])

        # Load endpoints
        for endpoint_def in definition.get('endpoints', []):
            endpoint = ServiceEndpoint(
                path=endpoint_def['path'],
                method=endpoint_def['method'],
                response_data=endpoint_def['response'],
                status_code=endpoint_def.get('status_code', 200),
                delay_ms=endpoint_def.get('delay_ms', 0),
                behavior=ServiceBehavior(endpoint_def.get('behavior', 'normal')),
                headers=endpoint_def.get('headers', {})
            )
            service.add_endpoint(endpoint)

        # Load scenarios
        for scenario_def in definition.get('scenarios', []):
            scenario_endpoints = []
            for ep_def in scenario_def['endpoints']:
                endpoint = ServiceEndpoint(
                    path=ep_def['path'],
                    method=ep_def['method'],
                    response_data=ep_def['response'],
                    status_code=ep_def.get('status_code', 200),
                    delay_ms=ep_def.get('delay_ms', 0),
                    behavior=ServiceBehavior(ep_def.get('behavior', 'normal')),
                    headers=ep_def.get('headers', {})
                )
                scenario_endpoints.append(endpoint)

            scenario = ServiceScenario(
                name=scenario_def['name'],
                description=scenario_def['description'],
                endpoints=scenario_endpoints,
                duration_minutes=scenario_def.get('duration_minutes')
            )
            service.add_scenario(scenario)

        return service

    async def start_all_services(self):
        """Start all virtual services"""
        tasks = []
        for service in self.services.values():
            tasks.append(service.start())
        await asyncio.gather(*tasks)

    async def stop_all_services(self):
        """Stop all virtual services"""
        tasks = []
        for service in self.services.values():
            tasks.append(service.stop())
        await asyncio.gather(*tasks)

    def get_service(self, service_name: str) -> Optional[VirtualService]:
        """Get virtual service by name"""
        return self.services.get(service_name)

# Test Framework Integration
class MicroserviceTestFramework:
    def __init__(self):
        self.vm_manager = ServiceVirtualizationManager()
        self.active_services = []

    async def setup_test_environment(self, service_definitions: Dict[str, str]):
        """Setup complete test environment with service virtualizations"""
        for service_name, definition_file in service_definitions.items():
            service = self.vm_manager.load_service_definition(service_name, definition_file)
            self.active_services.append(service)

        await self.vm_manager.start_all_services()

    async def teardown_test_environment(self):
        """Teardown test environment"""
        await self.vm_manager.stop_all_services()

    def activate_scenario(self, service_name: str, scenario_name: str):
        """Activate specific scenario for service"""
        service = self.vm_manager.get_service(service_name)
        if service:
            service.activate_scenario(scenario_name)

    def verify_service_interaction(self, service_name: str, method: str,
                                 path: str, expected_count: int = 1) -> bool:
        """Verify service interaction occurred"""
        service = self.vm_manager.get_service(service_name)
        if service:
            return service.verify_request(method, path, expected_count)
        return False

# Example Service Definitions (YAML format)
"""
# payment-service.yaml
port: 8081
endpoints:
  - path: /api/payments
    method: POST
    response:
      paymentId: "payment-123"
      status: "APPROVED"
      amount: 99.99
    status_code: 200

  - path: /api/payments/payment-123
    method: GET
    response:
      paymentId: "payment-123"
      status: "APPROVED"
      amount: 99.99
      timestamp: "2024-01-15T10:00:00Z"

scenarios:
  - name: payment_failure
    description: Simulate payment processing failures
    endpoints:
      - path: /api/payments
        method: POST
        response:
          error: "INSUFFICIENT_FUNDS"
          errorCode: "PAYMENT_DECLINED"
        status_code: 400

  - name: slow_payment
    description: Simulate slow payment processing
    endpoints:
      - path: /api/payments
        method: POST
        response:
          paymentId: "payment-slow-123"
          status: "APPROVED"
          amount: 99.99
        delay_ms: 3000
        behavior: slow

  - name: flaky_payment
    description: Simulate unreliable payment service
    endpoints:
      - path: /api/payments
        method: POST
        response:
          paymentId: "payment-flaky-123"
          status: "APPROVED"
          amount: 99.99
        behavior: flaky
"""

# Usage Example
@pytest.fixture
async def microservice_environment():
    """Pytest fixture for microservice testing environment"""
    framework = MicroserviceTestFramework()

    service_definitions = {
        'payment-service': 'test/fixtures/payment-service.yaml',
        'inventory-service': 'test/fixtures/inventory-service.yaml',
        'notification-service': 'test/fixtures/notification-service.yaml'
    }

    await framework.setup_test_environment(service_definitions)

    yield framework

    await framework.teardown_test_environment()

@pytest.mark.asyncio
async def test_order_creation_with_payment_failure(microservice_environment):
    """Test order creation when payment service fails"""
    # Arrange
    framework = microservice_environment
    framework.activate_scenario('payment-service', 'payment_failure')

    # Act
    async with aiohttp.ClientSession() as session:
        order_data = {
            'customerId': 'customer-123',
            'items': [{'productId': 'product-456', 'quantity': 2, 'price': 29.99}]
        }

        async with session.post('http://localhost:8080/api/orders',
                               json=order_data) as response:
            result = await response.json()
            status_code = response.status

    # Assert
    assert status_code == 400
    assert result['error'] == 'PAYMENT_FAILED'

    # Verify service interactions
    assert framework.verify_service_interaction('payment-service', 'POST', '/api/payments', 1)
    assert framework.verify_service_interaction('inventory-service', 'DELETE', '/api/inventory/reserve/.*', 1)

if __name__ == "__main__":
    # Example usage
    async def main():
        # Create service virtualization
        manager = ServiceVirtualizationManager()

        # Create payment service mock
        payment_service = manager.create_service('payment-service', 8081)

        # Add normal behavior endpoint
        payment_endpoint = ServiceEndpoint(
            path='/api/payments',
            method='POST',
            response_data={'paymentId': 'payment-123', 'status': 'APPROVED'},
            status_code=200
        )
        payment_service.add_endpoint(payment_endpoint)

        # Add failure scenario
        failure_scenario = ServiceScenario(
            name='payment_failure',
            description='Payment processing failures',
            endpoints=[
                ServiceEndpoint(
                    path='/api/payments',
                    method='POST',
                    response_data={'error': 'INSUFFICIENT_FUNDS'},
                    status_code=400
                )
            ]
        )
        payment_service.add_scenario(failure_scenario)

        # Start services
        await manager.start_all_services()

        # Simulate some delay for testing
        await asyncio.sleep(5)

        # Stop services
        await manager.stop_all_services()

    # Run example
    asyncio.run(main())
```

### Phase 2: Contract Testing Implementation

#### 2.1 PACT Contract Testing Framework

```javascript
/**
 * PACT Contract Testing Framework
 * Consumer-driven contract testing for microservices
 */

// Consumer Side Testing (Order Service)
const { Pact } = require('@pact-foundation/pact');
const { like, eachLike, regex } = require('@pact-foundation/pact').Matchers;
const axios = require('axios');
const path = require('path');

describe('Order Service - Payment Service Contract', () => {
    let provider;

    beforeAll(async () => {
        provider = new Pact({
            consumer: 'order-service',
            provider: 'payment-service',
            port: 1234,
            log: path.resolve(process.cwd(), 'logs', 'pact.log'),
            dir: path.resolve(process.cwd(), 'pacts'),
            logLevel: 'INFO',
            spec: 2
        });

        await provider.setup();
    });

    afterAll(async () => {
        await provider.finalize();
    });

    afterEach(async () => {
        await provider.verify();
    });

    describe('Payment Processing', () => {
        test('should process payment successfully', async () => {
            // Given
            const paymentRequest = {
                customerId: 'customer-123',
                amount: 99.99,
                currency: 'USD',
                paymentMethod: {
                    type: 'CREDIT_CARD',
                    cardNumber: '****-****-****-1234'
                }
            };

            const expectedResponse = {
                paymentId: like('payment-456'),
                status: 'APPROVED',
                amount: like(99.99),
                currency: like('USD'),
                transactionId: regex(/^txn-[a-f0-9]{8}$/, 'txn-abc12345'),
                timestamp: regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, '2024-01-15T10:00:00')
            };

            // Set up Pact interaction
            await provider.addInteraction({
                state: 'customer has valid payment method',
                uponReceiving: 'a request to process payment',
                withRequest: {
                    method: 'POST',
                    path: '/api/payments',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': regex(/^Bearer .+/, 'Bearer valid-token')
                    },
                    body: paymentRequest
                },
                willRespondWith: {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: expectedResponse
                }
            });

            // When
            const client = axios.create({ baseURL: 'http://localhost:1234' });
            const response = await client.post('/api/payments', paymentRequest, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer valid-token'
                }
            });

            // Then
            expect(response.status).toBe(200);
            expect(response.data.status).toBe('APPROVED');
            expect(response.data.paymentId).toBeDefined();
            expect(response.data.transactionId).toMatch(/^txn-[a-f0-9]{8}$/);
        });

        test('should handle insufficient funds', async () => {
            // Given
            const paymentRequest = {
                customerId: 'customer-poor',
                amount: 999999.99,
                currency: 'USD',
                paymentMethod: {
                    type: 'CREDIT_CARD',
                    cardNumber: '****-****-****-5678'
                }
            };

            const expectedErrorResponse = {
                error: 'INSUFFICIENT_FUNDS',
                errorCode: 'PAYMENT_DECLINED',
                message: like('Insufficient funds for transaction'),
                timestamp: regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, '2024-01-15T10:00:00')
            };

            // Set up Pact interaction
            await provider.addInteraction({
                state: 'customer has insufficient funds',
                uponReceiving: 'a request to process large payment',
                withRequest: {
                    method: 'POST',
                    path: '/api/payments',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': regex(/^Bearer .+/, 'Bearer valid-token')
                    },
                    body: paymentRequest
                },
                willRespondWith: {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: expectedErrorResponse
                }
            });

            // When & Then
            const client = axios.create({ baseURL: 'http://localhost:1234' });
            try {
                await client.post('/api/payments', paymentRequest, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer valid-token'
                    }
                });
                fail('Expected payment to be declined');
            } catch (error) {
                expect(error.response.status).toBe(400);
                expect(error.response.data.error).toBe('INSUFFICIENT_FUNDS');
                expect(error.response.data.errorCode).toBe('PAYMENT_DECLINED');
            }
        });

        test('should handle payment method validation', async () => {
            // Given
            const invalidPaymentRequest = {
                customerId: 'customer-123',
                amount: 50.00,
                currency: 'USD',
                paymentMethod: {
                    type: 'CREDIT_CARD',
                    cardNumber: '****-****-****-0000' // Invalid card
                }
            };

            // Set up Pact interaction
            await provider.addInteraction({
                state: 'customer has invalid payment method',
                uponReceiving: 'a request with invalid payment method',
                withRequest: {
                    method: 'POST',
                    path: '/api/payments',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': regex(/^Bearer .+/, 'Bearer valid-token')
                    },
                    body: invalidPaymentRequest
                },
                willRespondWith: {
                    status: 422,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {
                        error: 'INVALID_PAYMENT_METHOD',
                        message: like('Payment method validation failed'),
                        fieldErrors: eachLike({
                            field: like('paymentMethod.cardNumber'),
                            message: like('Invalid card number')
                        })
                    }
                }
            });

            // When & Then
            const client = axios.create({ baseURL: 'http://localhost:1234' });
            try {
                await client.post('/api/payments', invalidPaymentRequest, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer valid-token'
                    }
                });
                fail('Expected validation error');
            } catch (error) {
                expect(error.response.status).toBe(422);
                expect(error.response.data.error).toBe('INVALID_PAYMENT_METHOD');
                expect(error.response.data.fieldErrors).toBeDefined();
            }
        });
    });

    describe('Payment Status Queries', () => {
        test('should retrieve payment status', async () => {
            // Given
            const paymentId = 'payment-456';
            const expectedPayment = {
                paymentId: like('payment-456'),
                customerId: like('customer-123'),
                amount: like(99.99),
                currency: like('USD'),
                status: 'APPROVED',
                transactionId: regex(/^txn-[a-f0-9]{8}$/, 'txn-abc12345'),
                timestamp: regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, '2024-01-15T10:00:00'),
                paymentMethod: {
                    type: like('CREDIT_CARD'),
                    lastFourDigits: like('1234')
                }
            };

            // Set up Pact interaction
            await provider.addInteraction({
                state: 'payment exists',
                uponReceiving: 'a request to get payment status',
                withRequest: {
                    method: 'GET',
                    path: `/api/payments/${paymentId}`,
                    headers: {
                        'Authorization': regex(/^Bearer .+/, 'Bearer valid-token')
                    }
                },
                willRespondWith: {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: expectedPayment
                }
            });

            // When
            const client = axios.create({ baseURL: 'http://localhost:1234' });
            const response = await client.get(`/api/payments/${paymentId}`, {
                headers: {
                    'Authorization': 'Bearer valid-token'
                }
            });

            // Then
            expect(response.status).toBe(200);
            expect(response.data.paymentId).toBe(paymentId);
            expect(response.data.status).toBe('APPROVED');
            expect(response.data.transactionId).toMatch(/^txn-[a-f0-9]{8}$/);
        });

        test('should handle payment not found', async () => {
            // Given
            const nonExistentPaymentId = 'payment-999';

            // Set up Pact interaction
            await provider.addInteraction({
                state: 'payment does not exist',
                uponReceiving: 'a request to get non-existent payment',
                withRequest: {
                    method: 'GET',
                    path: `/api/payments/${nonExistentPaymentId}`,
                    headers: {
                        'Authorization': regex(/^Bearer .+/, 'Bearer valid-token')
                    }
                },
                willRespondWith: {
                    status: 404,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {
                        error: 'PAYMENT_NOT_FOUND',
                        message: like('Payment not found'),
                        paymentId: like(nonExistentPaymentId)
                    }
                }
            });

            // When & Then
            const client = axios.create({ baseURL: 'http://localhost:1234' });
            try {
                await client.get(`/api/payments/${nonExistentPaymentId}`, {
                    headers: {
                        'Authorization': 'Bearer valid-token'
                    }
                });
                fail('Expected payment not found error');
            } catch (error) {
                expect(error.response.status).toBe(404);
                expect(error.response.data.error).toBe('PAYMENT_NOT_FOUND');
            }
        });
    });
});

// Provider Side Verification (Payment Service)
const { Verifier } = require('@pact-foundation/pact');
const path = require('path');

// Provider state setup
const stateHandlers = {
    'customer has valid payment method': async () => {
        // Set up test data for valid customer
        await setupCustomer('customer-123', { hasValidPaymentMethod: true });
    },

    'customer has insufficient funds': async () => {
        // Set up test data for customer with insufficient funds
        await setupCustomer('customer-poor', {
            hasValidPaymentMethod: true,
            balance: 100.00
        });
    },

    'customer has invalid payment method': async () => {
        // Set up test data for customer with invalid payment method
        await setupCustomer('customer-123', { hasValidPaymentMethod: false });
    },

    'payment exists': async () => {
        // Set up existing payment
        await setupPayment('payment-456', {
            customerId: 'customer-123',
            amount: 99.99,
            status: 'APPROVED'
        });
    },

    'payment does not exist': async () => {
        // Ensure payment doesn't exist
        await cleanupPayment('payment-999');
    }
};

describe('Payment Service Provider Verification', () => {
    test('should satisfy all consumer contracts', async () => {
        const opts = {
            provider: 'payment-service',
            providerBaseUrl: 'http://localhost:8080',
            pactUrls: [
                path.resolve(process.cwd(), 'pacts', 'order-service-payment-service.json')
            ],
            stateHandlers: stateHandlers,
            requestFilter: (req, res, next) => {
                // Add authentication header for testing
                req.headers['authorization'] = 'Bearer test-token';
                next();
            }
        };

        const verifier = new Verifier(opts);
        return verifier.verifyProvider().then(output => {
            console.log('Pact Verification Complete!');
            console.log(output);
        });
    });
});

// Test data setup utilities
async function setupCustomer(customerId, options = {}) {
    // Implementation would set up customer data in test database
    console.log(`Setting up customer ${customerId} with options:`, options);
}

async function setupPayment(paymentId, paymentData) {
    // Implementation would create payment record in test database
    console.log(`Setting up payment ${paymentId}:`, paymentData);
}

async function cleanupPayment(paymentId) {
    // Implementation would remove payment record from test database
    console.log(`Cleaning up payment ${paymentId}`);
}
```

#### 2.2 Spring Cloud Contract Implementation

```java
/**
 * Spring Cloud Contract Implementation
 * Contract-driven testing for Spring Boot microservices
 */

// Contract Definition (src/test/resources/contracts/payment/process_payment.groovy)
/*
Contract.make {
    description "should process payment successfully"
    request {
        method POST()
        url "/api/payments"
        headers {
            contentType(applicationJson())
            header("Authorization", regex("Bearer .+"))
        }
        body([
            customerId: $(regex("[a-z]+-[0-9]+")),
            amount: $(regex("[0-9]+\\.[0-9]{2}")),
            currency: "USD",
            paymentMethod: [
                type: "CREDIT_CARD",
                cardNumber: $(regex("\\*{4}-\\*{4}-\\*{4}-[0-9]{4}"))
            ]
        ])
    }
    response {
        status OK()
        headers {
            contentType(applicationJson())
        }
        body([
            paymentId: $(regex("payment-[a-f0-9]{8}")),
            status: "APPROVED",
            amount: fromRequest().body('$.amount'),
            currency: fromRequest().body('$.currency'),
            transactionId: $(regex("txn-[a-f0-9]{8}")),
            timestamp: $(regex("\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}"))
        ])
    }
}
*/

// Base Test Class for Contract Testing
@SpringBootTest(
    classes = PaymentServiceApplication.class,
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT
)
@ActiveProfiles("contract-test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
public abstract class PaymentServiceContractTestBase {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:13")
            .withDatabaseName("payment_service_test")
            .withUsername("test")
            .withPassword("test");

    @Autowired
    private PaymentController paymentController;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @MockBean
    private ExternalPaymentGateway externalPaymentGateway;

    @MockBean
    private NotificationService notificationService;

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @BeforeEach
    void setUp() {
        // Setup test data
        setupCustomers();
        setupPayments();
        setupMocks();
    }

    @AfterEach
    void tearDown() {
        // Clean up test data
        paymentRepository.deleteAll();
        customerRepository.deleteAll();
    }

    private void setupCustomers() {
        // Create test customers
        Customer validCustomer = Customer.builder()
                .customerId("customer-123")
                .email("customer@example.com")
                .status(CustomerStatus.ACTIVE)
                .paymentMethods(List.of(
                    PaymentMethod.builder()
                        .type(PaymentMethodType.CREDIT_CARD)
                        .cardNumber("****-****-****-1234")
                        .isValid(true)
                        .build()
                ))
                .build();

        Customer poorCustomer = Customer.builder()
                .customerId("customer-poor")
                .email("poor@example.com")
                .status(CustomerStatus.ACTIVE)
                .balance(BigDecimal.valueOf(100.00))
                .paymentMethods(List.of(
                    PaymentMethod.builder()
                        .type(PaymentMethodType.CREDIT_CARD)
                        .cardNumber("****-****-****-5678")
                        .isValid(true)
                        .build()
                ))
                .build();

        customerRepository.saveAll(List.of(validCustomer, poorCustomer));
    }

    private void setupPayments() {
        // Create existing payment for GET tests
        Payment existingPayment = Payment.builder()
                .paymentId("payment-456")
                .customerId("customer-123")
                .amount(BigDecimal.valueOf(99.99))
                .currency("USD")
                .status(PaymentStatus.APPROVED)
                .transactionId("txn-abc12345")
                .timestamp(Instant.parse("2024-01-15T10:00:00Z"))
                .build();

        paymentRepository.save(existingPayment);
    }

    private void setupMocks() {
        // Mock external payment gateway responses
        when(externalPaymentGateway.processPayment(any()))
                .thenAnswer(invocation -> {
                    PaymentRequest request = invocation.getArgument(0);

                    // Simulate different responses based on customer
                    if ("customer-poor".equals(request.getCustomerId()) &&
                        request.getAmount().compareTo(BigDecimal.valueOf(1000)) > 0) {
                        throw new InsufficientFundsException("Insufficient funds");
                    }

                    return PaymentGatewayResponse.builder()
                            .transactionId("txn-" + UUID.randomUUID().toString().substring(0, 8))
                            .status("APPROVED")
                            .timestamp(Instant.now())
                            .build();
                });

        // Mock notification service
        doNothing().when(notificationService).sendPaymentNotification(any(), any());
    }

    // Contract state handlers
    public void customer_has_valid_payment_method() {
        // Already set up in setupCustomers()
    }

    public void customer_has_insufficient_funds() {
        // Already set up in setupCustomers()
    }

    public void payment_exists() {
        // Already set up in setupPayments()
    }

    public void payment_does_not_exist() {
        // Ensure payment doesn't exist
        paymentRepository.deleteById("payment-999");
    }
}

/**
 * Enhanced Payment Controller with Contract Testing Support
 */
@RestController
@RequestMapping("/api/payments")
@Validated
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    public ResponseEntity<PaymentResponse> processPayment(
            @Valid @RequestBody PaymentRequest request,
            @RequestHeader("Authorization") String authorization) {

        log.info("Processing payment for customer: {}", request.getCustomerId());

        try {
            Payment payment = paymentService.processPayment(request);
            PaymentResponse response = mapToResponse(payment);

            return ResponseEntity.ok(response);

        } catch (InsufficientFundsException e) {
            return ResponseEntity.badRequest()
                    .body(PaymentResponse.error("INSUFFICIENT_FUNDS", "PAYMENT_DECLINED", e.getMessage()));

        } catch (InvalidPaymentMethodException e) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                    .body(PaymentResponse.error("INVALID_PAYMENT_METHOD", e.getMessage(), e.getFieldErrors()));

        } catch (Exception e) {
            log.error("Payment processing failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(PaymentResponse.error("PAYMENT_PROCESSING_ERROR", "Payment processing failed", e.getMessage()));
        }
    }

    @GetMapping("/{paymentId}")
    public ResponseEntity<PaymentResponse> getPayment(
            @PathVariable String paymentId,
            @RequestHeader("Authorization") String authorization) {

        log.info("Retrieving payment: {}", paymentId);

        Optional<Payment> payment = paymentService.getPayment(paymentId);

        if (payment.isPresent()) {
            PaymentResponse response = mapToResponse(payment.get());
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.notFound()
                    .header("Content-Type", "application/json")
                    .build();
        }
    }

    private PaymentResponse mapToResponse(Payment payment) {
        return PaymentResponse.builder()
                .paymentId(payment.getPaymentId())
                .customerId(payment.getCustomerId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .status(payment.getStatus().name())
                .transactionId(payment.getTransactionId())
                .timestamp(payment.getTimestamp())
                .build();
    }
}

/**
 * Contract Testing Configuration
 */
@TestConfiguration
@Profile("contract-test")
public class ContractTestConfiguration {

    @Bean
    @Primary
    public Clock testClock() {
        return Clock.fixed(Instant.parse("2024-01-15T10:00:00Z"), ZoneId.of("UTC"));
    }

    @Bean
    @Primary
    public PaymentIdGenerator testPaymentIdGenerator() {
        return new SequentialPaymentIdGenerator("payment");
    }

    @Bean
    @Primary
    public TransactionIdGenerator testTransactionIdGenerator() {
        return new SequentialTransactionIdGenerator("txn");
    }
}

/**
 * Contract Testing Utilities
 */
@Component
public class ContractTestSupport {

    public static void validatePaymentResponse(PaymentResponse response) {
        assertThat(response.getPaymentId()).matches("payment-[a-f0-9]{8}");
        assertThat(response.getTransactionId()).matches("txn-[a-f0-9]{8}");
        assertThat(response.getTimestamp()).matches("\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}");
    }

    public static void validateErrorResponse(PaymentResponse response, String expectedError) {
        assertThat(response.getError()).isEqualTo(expectedError);
        assertThat(response.getTimestamp()).isNotNull();
    }
}

// Maven configuration for contract testing
/*
<plugin>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-contract-maven-plugin</artifactId>
    <version>3.1.3</version>
    <extensions>true</extensions>
    <configuration>
        <baseClassForTests>com.example.payment.contract.PaymentServiceContractTestBase</baseClassForTests>
        <contractsDirectory>src/test/resources/contracts</contractsDirectory>
        <testFramework>JUNIT5</testFramework>
        <assertjVersion>3.23.1</assertjVersion>
    </configuration>
    <executions>
        <execution>
            <goals>
                <goal>generateTests</goal>
            </goals>
        </execution>
    </executions>
</plugin>
*/
```

This microservices testing guide provides comprehensive frameworks for testing distributed systems. The next sections will continue with chaos engineering, distributed tracing testing, and advanced end-to-end testing strategies to complete the advanced microservices testing approach.