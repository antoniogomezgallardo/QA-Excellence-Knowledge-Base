# 🎭 Playwright Mastery Guide - 3+ Years Expertise Showcase

## 🎯 Your Playwright Advantage - Key Talking Points

**Your Positioning**: "I've been working with Playwright for 3+ years, since early adoption. I've seen it evolve from experimental to production-ready and have built enterprise frameworks with it."

---

## 🚀 PLAYWRIGHT FUNDAMENTALS - Beyond Basics

### **Architecture Understanding**

#### **How Playwright Works (Advanced Explanation)**
```typescript
// Demonstrate understanding of Playwright's architecture
// Direct browser communication via DevTools Protocol
const browser = await chromium.launch({
  // Show knowledge of browser contexts vs pages
  args: ['--disable-features=VizDisplayCompositor']
});

const context = await browser.newContext({
  // Demonstrate context-level configuration
  viewport: { width: 1920, height: 1080 },
  userAgent: 'Custom Test Agent 1.0',
  permissions: ['geolocation', 'camera'],
  geolocation: { latitude: 59.95, longitude: 30.31667 },
  locale: 'en-GB',
  timezoneId: 'Europe/London'
});

// Multiple pages in single context share state
const page1 = await context.newPage();
const page2 = await context.newPage();

// Storage state is shared between pages
await page1.goto('https://example.com/login');
await page1.fill('#username', 'user@example.com');
await page1.fill('#password', 'password');
await page1.click('#login');

// page2 automatically has the login state
await page2.goto('https://example.com/dashboard');
// No need to login again!
```

#### **Auto-Waiting Intelligence**
```typescript
// Show deep understanding of Playwright's waiting strategy
class PlaywrightWaitingDemo {

  async demonstrateIntelligentWaiting(page: Page) {
    // Playwright automatically waits for elements to be:
    // 1. Attached to DOM
    // 2. Visible
    // 3. Stable (not animating)
    // 4. Receives events (not covered by other elements)

    // No explicit wait needed - Playwright handles it
    await page.click('#dynamic-button'); // Waits until clickable

    // Advanced: Custom wait conditions
    await page.waitForFunction(
      () => document.querySelector('#loading')?.style.display === 'none'
    );

    // Wait for network activity to settle
    await page.waitForLoadState('networkidle');

    // Wait for specific API calls
    await page.waitForResponse(resp =>
      resp.url().includes('/api/data') && resp.status() === 200
    );
  }

  async advancedElementInteraction(page: Page) {
    // Demonstrate element state checking
    const button = page.locator('#submit-btn');

    // Wait for element to be in the correct state
    await button.waitFor({ state: 'visible' });

    // Check multiple conditions
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
    await expect(button).not.toHaveClass('disabled');

    // Conditional actions based on element state
    if (await button.isEnabled()) {
      await button.click();
    } else {
      // Handle disabled state
      await page.locator('#enable-submit').click();
      await button.waitFor({ state: 'enabled' });
      await button.click();
    }
  }
}
```

---

## 🏗️ ADVANCED PLAYWRIGHT PATTERNS

### **Page Object Model Evolution**

#### **Modern Page Object with Playwright**
```typescript
// Base Page with advanced patterns
export abstract class BasePage {
  protected page: Page;
  protected url: string;

  constructor(page: Page, url: string = '') {
    this.page = page;
    this.url = url;
  }

  // Intelligent navigation with wait strategies
  async navigate(waitUntil: 'load' | 'domcontentloaded' | 'networkidle' = 'load') {
    await this.page.goto(this.url, { waitUntil });
    await this.waitForPageLoad();
  }

  // Custom page load detection
  protected async waitForPageLoad(): Promise<void> {
    // Override in specific pages
    await this.page.waitForLoadState('domcontentloaded');
  }

  // Advanced element interaction with retry
  protected async safeClick(selector: string, options?: ClickOptions): Promise<void> {
    const element = this.page.locator(selector);

    // Wait for element to be stable and clickable
    await element.waitFor({ state: 'visible' });
    await element.waitFor({ state: 'stable' });

    // Handle potential overlays
    try {
      await element.click(options);
    } catch (error) {
      if (error.message.includes('intercepts pointer events')) {
        // Dismiss any overlays and retry
        await this.dismissOverlays();
        await element.click({ force: true });
      } else {
        throw error;
      }
    }
  }

  private async dismissOverlays(): Promise<void> {
    // Common overlay dismissal patterns
    const overlays = [
      '.modal-backdrop',
      '.cookie-banner .close',
      '.notification .dismiss',
      '.popup .close-btn'
    ];

    for (const overlay of overlays) {
      const element = this.page.locator(overlay);
      if (await element.isVisible()) {
        await element.click();
        await element.waitFor({ state: 'hidden' });
      }
    }
  }

  // Smart element location with fallbacks
  protected async getElement(selectors: string[]): Promise<Locator> {
    for (const selector of selectors) {
      const element = this.page.locator(selector);
      if (await element.count() > 0) {
        return element;
      }
    }
    throw new Error(`None of the selectors found: ${selectors.join(', ')}`);
  }
}

// Specific page implementation
export class CheckoutPage extends BasePage {
  // Encapsulated locators with multiple selector strategies
  private readonly elements = {
    emailField: () => this.page.locator('#email, [data-testid="email"], input[type="email"]'),
    submitButton: () => this.page.locator('#submit, [data-testid="submit"], button[type="submit"]'),
    errorMessage: () => this.page.locator('.error-message, .alert-danger, [role="alert"]'),
    loadingSpinner: () => this.page.locator('.loading, .spinner, [data-loading="true"]')
  };

  constructor(page: Page) {
    super(page, '/checkout');
  }

  protected async waitForPageLoad(): Promise<void> {
    // Checkout-specific loading logic
    await Promise.all([
      this.page.waitForSelector('#checkout-form'),
      this.page.waitForFunction(() => window.paymentProvider?.initialized === true),
      this.elements.loadingSpinner().waitFor({ state: 'hidden' })
    ]);
  }

  async fillEmail(email: string): Promise<void> {
    const emailField = this.elements.emailField();
    await emailField.fill(email);

    // Validate input
    await expect(emailField).toHaveValue(email);
  }

  async submitForm(): Promise<void> {
    await this.safeClick(this.elements.submitButton().locator);

    // Wait for submission to complete
    await this.page.waitForResponse(resp =>
      resp.url().includes('/api/checkout') && resp.status() === 200
    );
  }

  async getErrorMessage(): Promise<string> {
    const errorElement = this.elements.errorMessage();
    await errorElement.waitFor({ state: 'visible' });
    return await errorElement.textContent() || '';
  }
}
```

### **Component Testing Mastery**

#### **Advanced Component Testing Setup**
```typescript
// playwright-ct.config.ts - Component testing configuration
import { defineConfig, devices } from '@playwright/experimental-ct-react';

export default defineConfig({
  testDir: './src/components',
  use: {
    ctPort: 3100,
    ctViteConfig: {
      define: {
        'process.env.NODE_ENV': '"test"'
      },
      plugins: [
        // Custom Vite plugins for testing
      ]
    }
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
    }
  ]
});

// Advanced component testing patterns
import { test, expect } from '@playwright/experimental-ct-react';
import { LoginForm } from './LoginForm';
import { UserProvider } from '../contexts/UserContext';

// Testing with providers and context
test('login form with authentication context', async ({ mount }) => {
  const mockUser = { id: 1, name: 'Test User' };
  let submittedData: any;

  const component = await mount(
    <UserProvider initialUser={mockUser}>
      <LoginForm onSubmit={(data) => { submittedData = data; }} />
    </UserProvider>
  );

  // Component interaction
  await component.getByLabel('Email').fill('test@example.com');
  await component.getByLabel('Password').fill('password123');
  await component.getByRole('button', { name: 'Login' }).click();

  // Assert component behavior
  expect(submittedData).toEqual({
    email: 'test@example.com',
    password: 'password123'
  });
});

// Testing component with complex state
test('shopping cart component with multiple items', async ({ mount }) => {
  const initialItems = [
    { id: 1, name: 'Product 1', price: 29.99, quantity: 2 },
    { id: 2, name: 'Product 2', price: 19.99, quantity: 1 }
  ];

  const component = await mount(
    <ShoppingCart initialItems={initialItems} />
  );

  // Test quantity updates
  await component.getByTestId('item-1-increase').click();
  await expect(component.getByTestId('item-1-quantity')).toHaveText('3');

  // Test total calculation
  await expect(component.getByTestId('cart-total')).toHaveText('$79.97');

  // Test item removal
  await component.getByTestId('item-2-remove').click();
  await expect(component.getByTestId('cart-total')).toHaveText('$59.98');
});

// Snapshot testing for components
test('button component visual regression', async ({ mount }) => {
  const variants = ['primary', 'secondary', 'danger'];

  for (const variant of variants) {
    const component = await mount(
      <Button variant={variant}>Click me</Button>
    );

    await expect(component).toHaveScreenshot(`button-${variant}.png`);
  }
});
```

### **API Testing Integration**

#### **Playwright API Testing Excellence**
```typescript
// Advanced API testing with Playwright
class APITestSuite {
  private apiContext: APIRequestContext;
  private authToken: string;

  async setup() {
    this.apiContext = await request.newContext({
      baseURL: 'https://api.example.com',
      extraHTTPHeaders: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    // Authenticate and store token
    const loginResponse = await this.apiContext.post('/auth/login', {
      data: {
        username: 'testuser@example.com',
        password: 'testpassword'
      }
    });

    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();
    this.authToken = loginData.token;

    // Update context with auth token
    await this.apiContext.dispose();
    this.apiContext = await request.newContext({
      baseURL: 'https://api.example.com',
      extraHTTPHeaders: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      }
    });
  }

  async testUserCreation() {
    const userData = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      role: 'user'
    };

    // Create user
    const createResponse = await this.apiContext.post('/users', {
      data: userData
    });

    expect(createResponse.ok()).toBeTruthy();
    const createdUser = await createResponse.json();

    // Validate response structure
    expect(createdUser).toMatchObject({
      id: expect.any(Number),
      username: userData.username,
      email: userData.email,
      role: userData.role,
      createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    });

    // Verify user can be retrieved
    const getResponse = await this.apiContext.get(`/users/${createdUser.id}`);
    expect(getResponse.ok()).toBeTruthy();

    const retrievedUser = await getResponse.json();
    expect(retrievedUser).toEqual(createdUser);

    return createdUser;
  }

  async testUserWorkflow() {
    // Create user via API
    const user = await this.testUserCreation();

    // Create order for user
    const orderData = {
      userId: user.id,
      items: [
        { productId: 1, quantity: 2, price: 29.99 },
        { productId: 2, quantity: 1, price: 49.99 }
      ]
    };

    const orderResponse = await this.apiContext.post('/orders', {
      data: orderData
    });

    expect(orderResponse.ok()).toBeTruthy();
    const order = await orderResponse.json();

    // Verify order calculation
    expect(order.total).toBe(109.97);
    expect(order.items).toHaveLength(2);

    // Test order retrieval with user context
    const userOrdersResponse = await this.apiContext.get(`/users/${user.id}/orders`);
    const userOrders = await userOrdersResponse.json();

    expect(userOrders).toContainEqual(
      expect.objectContaining({ id: order.id })
    );

    return { user, order };
  }

  async cleanup(user: any) {
    // Clean up test data
    await this.apiContext.delete(`/users/${user.id}`);
  }
}

// Integration with UI tests
test('E2E user registration and order placement', async ({ page, request }) => {
  const apiSuite = new APITestSuite();
  apiSuite.apiContext = request;

  // Start with API setup
  await apiSuite.setup();

  // UI portion
  await page.goto('/register');

  const userData = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'securepassword123'
  };

  await page.fill('#username', userData.username);
  await page.fill('#email', userData.email);
  await page.fill('#password', userData.password);
  await page.click('#register-button');

  // Wait for registration success
  await expect(page.locator('.success-message')).toBeVisible();

  // Verify via API that user was created
  const apiResponse = await request.get('/users', {
    headers: { 'Authorization': `Bearer ${apiSuite.authToken}` }
  });

  const users = await apiResponse.json();
  const createdUser = users.find((u: any) => u.email === userData.email);
  expect(createdUser).toBeTruthy();

  // Continue with order placement...
  await page.goto('/products');
  await page.click('[data-product-id="1"] .add-to-cart');
  await page.goto('/cart');
  await page.click('#checkout-button');

  // Verify order was created via API
  const orderResponse = await request.get(`/users/${createdUser.id}/orders`, {
    headers: { 'Authorization': `Bearer ${apiSuite.authToken}` }
  });

  const orders = await orderResponse.json();
  expect(orders).toHaveLength(1);
});
```

---

## 🔧 ADVANCED FEATURES MASTERY

### **Network Interception & Mocking**

#### **Enterprise Network Mocking Patterns**
```typescript
class NetworkMockingMaster {

  async setupAdvancedMocking(page: Page) {
    // Mock specific API endpoints
    await page.route('**/api/users/**', async route => {
      const url = route.request().url();
      const method = route.request().method();

      if (method === 'GET' && url.includes('/api/users/')) {
        // Mock user data
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 123,
            name: 'Mock User',
            email: 'mock@example.com',
            premium: true
          })
        });
      } else if (method === 'POST' && url.includes('/api/users')) {
        // Simulate slow user creation
        await new Promise(resolve => setTimeout(resolve, 2000));
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 456,
            ...route.request().postDataJSON(),
            createdAt: new Date().toISOString()
          })
        });
      } else {
        // Pass through other requests
        await route.continue();
      }
    });

    // Mock external services
    await page.route('**/api/payment/process', async route => {
      const paymentData = route.request().postDataJSON();

      // Simulate payment processing based on card number
      if (paymentData.cardNumber === '4000000000000002') {
        // Declined card
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'CARD_DECLINED',
            message: 'Your card was declined'
          })
        });
      } else {
        // Successful payment
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            transactionId: `txn_${Date.now()}`,
            status: 'completed',
            amount: paymentData.amount
          })
        });
      }
    });

    // Mock file downloads
    await page.route('**/api/reports/download/**', async route => {
      const reportData = Buffer.from('Sample,CSV,Data\n1,2,3\n4,5,6');
      await route.fulfill({
        status: 200,
        contentType: 'text/csv',
        headers: {
          'Content-Disposition': 'attachment; filename="report.csv"'
        },
        body: reportData
      });
    });
  }

  async networkConditionTesting(page: Page) {
    // Simulate slow network
    await page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
      await route.continue();
    });

    // Test application behavior under slow conditions
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeGreaterThan(500);
    await expect(page.locator('.loading-spinner')).toBeVisible();
  }

  async failureScenarioTesting(page: Page) {
    let requestCount = 0;

    await page.route('**/api/data', async route => {
      requestCount++;

      if (requestCount === 1) {
        // First request fails
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' })
        });
      } else {
        // Subsequent requests succeed (testing retry logic)
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: 'Success after retry' })
        });
      }
    });

    await page.goto('/dashboard');

    // Verify application handles failure gracefully
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.retry-button')).toBeVisible();

    // Test retry functionality
    await page.click('.retry-button');
    await expect(page.locator('.success-message')).toBeVisible();
    await expect(page.locator('.data-content')).toContainText('Success after retry');
  }
}
```

### **Mobile Testing Excellence**

#### **Comprehensive Mobile Testing Strategy**
```typescript
class MobileTestingMaster {

  async setupMobileContext(browser: Browser, deviceName: string) {
    const device = devices[deviceName];

    const context = await browser.newContext({
      ...device,
      // Additional mobile-specific configurations
      permissions: ['geolocation', 'camera', 'microphone'],
      geolocation: { latitude: 37.7749, longitude: -122.4194 }, // San Francisco
      locale: 'en-US',
      timezoneId: 'America/Los_Angeles'
    });

    // Simulate mobile-specific behaviors
    const page = await context.newPage();

    // Mobile viewport adjustments
    await page.addInitScript(() => {
      // Mock device capabilities
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      });

      // Mock device orientation
      Object.defineProperty(screen.orientation, 'angle', {
        value: 0
      });

      // Mock touch capabilities
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 5
      });
    });

    return { context, page };
  }

  async testTouchGestures(page: Page) {
    // Swipe gestures
    const carousel = page.locator('.image-carousel');
    const boundingBox = await carousel.boundingBox();

    if (boundingBox) {
      // Swipe left
      await page.touchscreen.tap(boundingBox.x + boundingBox.width - 50, boundingBox.y + boundingBox.height / 2);
      await page.touchscreen.down(boundingBox.x + boundingBox.width - 50, boundingBox.y + boundingBox.height / 2);
      await page.touchscreen.move(boundingBox.x + 50, boundingBox.y + boundingBox.height / 2);
      await page.touchscreen.up();

      // Verify swipe effect
      await expect(page.locator('.carousel-item.active')).toHaveAttribute('data-index', '1');
    }

    // Long press gesture
    const contextMenuTrigger = page.locator('.long-press-target');
    await contextMenuTrigger.tap({ delay: 1000 }); // Long press

    await expect(page.locator('.context-menu')).toBeVisible();

    // Pinch zoom simulation
    await page.evaluate(() => {
      const element = document.querySelector('.zoomable-content');
      element?.dispatchEvent(new WheelEvent('wheel', {
        deltaY: -100,
        ctrlKey: true
      }));
    });

    await expect(page.locator('.zoomable-content')).toHaveCSS('transform', /scale\(1\.[1-9]/);
  }

  async testMobileNavigation(page: Page) {
    // Test mobile menu
    await page.click('.mobile-menu-toggle');
    await expect(page.locator('.mobile-nav')).toBeVisible();

    // Test navigation items
    await page.click('.mobile-nav .nav-item[data-target="products"]');
    await expect(page).toHaveURL(/.*\/products/);

    // Test back navigation
    await page.goBack();
    await expect(page).toHaveURL(/.*\/$/);

    // Test pull-to-refresh (simulate)
    await page.evaluate(() => {
      window.scrollTo(0, 0);
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 }]
      });
      const touchMove = new TouchEvent('touchmove', {
        touches: [{ clientX: 100, clientY: 200 }]
      });
      const touchEnd = new TouchEvent('touchend', {});

      document.dispatchEvent(touchStart);
      document.dispatchEvent(touchMove);
      document.dispatchEvent(touchEnd);
    });

    await expect(page.locator('.refresh-indicator')).toBeVisible();
  }

  async testResponsiveDesign(page: Page) {
    // Test different breakpoints
    const breakpoints = [
      { width: 320, height: 568, name: 'Mobile Small' },
      { width: 375, height: 667, name: 'Mobile Medium' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1024, height: 768, name: 'Tablet Landscape' },
      { width: 1920, height: 1080, name: 'Desktop' }
    ];

    for (const breakpoint of breakpoints) {
      await page.setViewportSize({
        width: breakpoint.width,
        height: breakpoint.height
      });

      // Test navigation visibility
      if (breakpoint.width < 768) {
        await expect(page.locator('.mobile-nav-toggle')).toBeVisible();
        await expect(page.locator('.desktop-nav')).toBeHidden();
      } else {
        await expect(page.locator('.mobile-nav-toggle')).toBeHidden();
        await expect(page.locator('.desktop-nav')).toBeVisible();
      }

      // Test layout adjustments
      const productGrid = page.locator('.product-grid');
      const gridColumns = await productGrid.evaluate(el => {
        return window.getComputedStyle(el).getPropertyValue('grid-template-columns');
      });

      // Verify responsive grid
      if (breakpoint.width < 768) {
        expect(gridColumns).toContain('1fr'); // Single column on mobile
      } else if (breakpoint.width < 1024) {
        expect(gridColumns.split(' ')).toHaveLength(2); // Two columns on tablet
      } else {
        expect(gridColumns.split(' ')).toHaveLength(3); // Three columns on desktop
      }

      // Take screenshot for visual verification
      await page.screenshot({
        path: `screenshots/responsive-${breakpoint.name.toLowerCase().replace(' ', '-')}.png`,
        fullPage: true
      });
    }
  }

  async testOfflineCapabilities(page: Page) {
    // Test online state
    await page.goto('/');
    await expect(page.locator('.online-indicator')).toBeVisible();

    // Simulate offline
    await page.context().setOffline(true);
    await page.reload();

    // Test offline behavior
    await expect(page.locator('.offline-message')).toBeVisible();
    await expect(page.locator('.cached-content')).toBeVisible();

    // Test offline functionality
    await page.fill('#offline-form input', 'offline data');
    await page.click('#offline-form button');

    // Verify data is stored locally
    const localData = await page.evaluate(() =>
      localStorage.getItem('offline-form-data')
    );
    expect(localData).toContain('offline data');

    // Return online and test sync
    await page.context().setOffline(false);
    await page.reload();

    await expect(page.locator('.sync-indicator')).toBeVisible();

    // Verify data was synced
    await page.waitForResponse(resp =>
      resp.url().includes('/api/sync') && resp.status() === 200
    );
  }
}
```

---

## 🎯 INTERVIEW TALKING POINTS

### **Your Playwright Journey Story**
"I started with Playwright in early 2021 when it was still experimental. I was attracted to its modern architecture and direct browser communication via DevTools Protocol. Over 3+ years, I've:

- **Built enterprise frameworks** serving 50+ developers
- **Migrated legacy Selenium suites** with 90% time savings
- **Implemented component testing** for React applications
- **Created mobile testing strategies** across iOS/Android
- **Integrated with CI/CD pipelines** for continuous testing"

### **Technical Advantages You Bring**
1. **Framework Architecture**: "I design scalable Page Object Models with intelligent waiting strategies"
2. **Network Control**: "I implement comprehensive API mocking and failure simulation"
3. **Mobile Excellence**: "I handle touch gestures, responsive design, and offline scenarios"
4. **Performance Integration**: "I combine Playwright with performance testing for complete coverage"
5. **Component Testing**: "I test React components in isolation with realistic providers"

### **Problem-Solving Examples**
- **Flaky Tests**: "Reduced flakiness from 30% to 0.1% using intelligent waiting and retry mechanisms"
- **Cross-Browser Issues**: "Identified Safari-specific rendering bugs through systematic browser matrix testing"
- **Performance Debugging**: "Used Playwright's network interception to identify and fix API bottlenecks"

### **Future Vision**
"I see Playwright evolving toward AI-assisted testing and better observability. I'm already experimenting with self-healing selectors and intelligent test generation based on user journey analytics."

---

## 🚀 LIVE CODING INTERVIEW PREP

### **Common Coding Challenges**

#### **Challenge 1: Login Flow with Error Handling**
```typescript
// Interviewer: "Write a test for login with various error scenarios"

test('comprehensive login testing', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await test.step('Navigate to login page', async () => {
    await loginPage.navigate();
    await expect(loginPage.isLoaded()).toBeTruthy();
  });

  await test.step('Test empty form submission', async () => {
    await loginPage.submitForm();
    await expect(loginPage.getErrorMessage()).toContain('Email is required');
  });

  await test.step('Test invalid email format', async () => {
    await loginPage.fillEmail('invalid-email');
    await loginPage.submitForm();
    await expect(loginPage.getErrorMessage()).toContain('Invalid email format');
  });

  await test.step('Test invalid credentials', async () => {
    await loginPage.fillEmail('test@example.com');
    await loginPage.fillPassword('wrongpassword');
    await loginPage.submitForm();
    await expect(loginPage.getErrorMessage()).toContain('Invalid credentials');
  });

  await test.step('Test successful login', async () => {
    await loginPage.fillEmail('valid@example.com');
    await loginPage.fillPassword('correctpassword');
    await loginPage.submitForm();

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('.user-profile')).toBeVisible();
  });
});
```

#### **Challenge 2: Dynamic Content Testing**
```typescript
// Interviewer: "Test a dynamic search with auto-complete"

test('search with auto-complete functionality', async ({ page }) => {
  await page.goto('/search');

  const searchInput = page.locator('#search-input');
  const searchResults = page.locator('.search-results');
  const autoComplete = page.locator('.autocomplete-dropdown');

  await test.step('Type search query and verify autocomplete', async () => {
    await searchInput.fill('Java');

    // Wait for autocomplete to appear
    await autoComplete.waitFor({ state: 'visible' });

    // Verify suggestions contain search term
    const suggestions = autoComplete.locator('.suggestion-item');
    await expect(suggestions).toHaveCount.greaterThan(0);

    const firstSuggestion = suggestions.first();
    await expect(firstSuggestion).toContainText('Java');
  });

  await test.step('Select suggestion and verify search results', async () => {
    await autoComplete.locator('.suggestion-item').first().click();

    // Wait for search results
    await page.waitForResponse(resp =>
      resp.url().includes('/api/search') && resp.status() === 200
    );

    await expect(searchResults).toBeVisible();
    const resultItems = searchResults.locator('.result-item');
    await expect(resultItems).toHaveCount.greaterThan(0);

    // Verify all results contain search term
    const resultTexts = await resultItems.allTextContents();
    resultTexts.forEach(text => {
      expect(text.toLowerCase()).toContain('java');
    });
  });

  await test.step('Test search result interactions', async () => {
    const firstResult = searchResults.locator('.result-item').first();
    const resultTitle = await firstResult.locator('.title').textContent();

    await firstResult.click();

    // Verify navigation to detail page
    await expect(page.locator('h1')).toContainText(resultTitle || '');
  });
});
```

---

## 📚 QUICK REFERENCE CHEAT SHEET

### **Essential Playwright APIs**
```typescript
// Navigation & Waiting
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForLoadState('domcontentloaded');
await page.waitForSelector('.element', { state: 'visible' });
await page.waitForFunction(() => window.dataLoaded === true);

// Element Interaction
await page.click('#button', { force: true });
await page.fill('#input', 'text', { timeout: 5000 });
await page.selectOption('#select', 'value');
await page.setInputFiles('#file', 'path/to/file.pdf');

// Advanced Locators
page.locator('#id >> text="Submit"');  // Chain selectors
page.locator('#parent').locator('.child');  // Scope to parent
page.locator('.item').filter({ hasText: 'Active' });  // Filter by text
page.locator('.item').nth(2);  // Get nth element

// Assertions
await expect(page).toHaveTitle(/Pattern/);
await expect(locator).toBeVisible();
await expect(locator).toHaveAttribute('class', 'active');
await expect(locator).toContainText('Expected text');
await expect(page).toHaveScreenshot('page.png');

// Network & API
await page.route('**/api/**', route => route.fulfill({ ... }));
await page.waitForResponse(resp => resp.url().includes('/api/data'));
const response = await request.get('/api/endpoint');
expect(response.ok()).toBeTruthy();

// Mobile & Device
const context = await browser.newContext(devices['iPhone 13']);
await page.touchscreen.tap(x, y);
await page.setViewportSize({ width: 375, height: 667 });

// Files & Downloads
const download = await page.waitForEvent('download');
await download.saveAs('/path/to/save');
```

### **Configuration Quick Reference**
```typescript
// Essential config options
export default defineConfig({
  timeout: 30000,
  retries: 2,
  workers: 4,
  fullyParallel: true,

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
    { name: 'api', testDir: './tests/api' }
  ]
});
```

---

**You're ready to demonstrate your Playwright mastery! Remember to mention specific version features, performance improvements you've achieved, and how you've solved real-world testing challenges. Good luck! 🎭🚀**