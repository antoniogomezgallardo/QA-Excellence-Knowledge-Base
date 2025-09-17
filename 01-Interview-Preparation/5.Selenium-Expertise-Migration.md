# 🌐 Selenium Expertise & Migration Mastery - 7+ Years

## 🎯 Your Selenium Authority - Strategic Positioning

**Your Statement**: "I have 7+ years of Selenium experience, from Selenium 2 WebDriver to Selenium 4. I've built and maintained enterprise test suites with 1000+ tests, managed Selenium Grid deployments, and led multiple modernization initiatives migrating legacy Selenium to Playwright. I understand both the power and limitations of Selenium, which makes me the ideal person to decide when to use it vs. when to migrate."

---

## 📈 YOUR SELENIUM JOURNEY - 7+ Years Evolution

### **Timeline of Expertise**
```timeline
2017-2018: Selenium WebDriver 3.x, basic Page Object Model
2019-2020: Advanced patterns, Grid setup, CI/CD integration
2021-2022: Selenium 4 adoption, Docker containerization
2023-2024: Migration strategies to Playwright, legacy maintenance
```

### **Your Selenium Milestones**
- **Built enterprise frameworks** serving 40+ QA engineers
- **Managed Selenium Grid** with 50+ nodes across environments
- **Migrated 1000+ Selenium tests** to modern frameworks
- **Optimized execution time** from 4 hours to 45 minutes
- **Established best practices** reducing flaky tests by 85%

---

## 🏗️ SELENIUM FRAMEWORK ARCHITECTURE MASTERY

### **Enterprise-Grade Framework Design**

#### **Advanced Base Framework Implementation**
```java
// BaseTest.java - 7+ years of refinement
@ExtendWith({ScreenshotExtension.class, TestDataExtension.class})
public abstract class BaseTest {

    protected WebDriver driver;
    protected WebDriverWait wait;
    protected Actions actions;
    protected JavascriptExecutor jsExecutor;

    private static final Duration DEFAULT_TIMEOUT = Duration.ofSeconds(30);
    private static final Duration POLLING_INTERVAL = Duration.ofMillis(500);

    @BeforeEach
    void setUp(TestInfo testInfo) {
        BrowserConfig config = BrowserConfigFactory.getConfig(
            System.getProperty("browser", "chrome"),
            Boolean.parseBoolean(System.getProperty("headless", "false"))
        );

        this.driver = WebDriverFactory.createDriver(config);
        this.wait = new WebDriverWait(driver, DEFAULT_TIMEOUT, POLLING_INTERVAL);
        this.actions = new Actions(driver);
        this.jsExecutor = (JavascriptExecutor) driver;

        // Advanced driver configuration
        configureDriver(config);

        // Test context setup
        TestContext.setCurrentTest(testInfo);
        TestContext.setDriver(driver);

        // Navigation with performance tracking
        String baseUrl = EnvironmentConfig.getBaseUrl();
        navigateWithPerformanceTracking(baseUrl);
    }

    @AfterEach
    void tearDown() {
        try {
            if (TestContext.hasFailures()) {
                captureFailureArtifacts();
            }

            cleanupTestData();
        } finally {
            if (driver != null) {
                driver.quit();
            }
            TestContext.clear();
        }
    }

    private void configureDriver(BrowserConfig config) {
        // Window management
        if (!config.isMobile()) {
            driver.manage().window().maximize();
        }

        // Timeouts configuration
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
        driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(60));
        driver.manage().timeouts().scriptTimeout(Duration.ofSeconds(30));

        // Performance optimization
        if (config.getBrowserType() == BrowserType.CHROME) {
            ChromeDriver chromeDriver = (ChromeDriver) driver;
            chromeDriver.executeCdpCommand("Network.enable", Map.of());
            chromeDriver.executeCdpCommand("Performance.enable", Map.of());
        }
    }

    protected void navigateWithPerformanceTracking(String url) {
        long startTime = System.currentTimeMillis();

        driver.get(url);

        // Wait for page load completion
        wait.until(webDriver -> jsExecutor.executeScript("return document.readyState").equals("complete"));

        long loadTime = System.currentTimeMillis() - startTime;
        TestContext.addMetric("page_load_time", loadTime);

        if (loadTime > 10000) { // 10 seconds
            System.err.println("WARNING: Page load took " + loadTime + "ms");
        }
    }

    private void captureFailureArtifacts() {
        String testName = TestContext.getCurrentTestName();
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss"));

        // Screenshot
        if (driver instanceof TakesScreenshot) {
            byte[] screenshot = ((TakesScreenshot) driver).getScreenshotAs(OutputType.BYTES);
            TestContext.attachScreenshot(screenshot, testName + "_" + timestamp);
        }

        // Page source
        String pageSource = driver.getPageSource();
        TestContext.attachText(pageSource, "page-source_" + testName + "_" + timestamp + ".html");

        // Browser logs
        if (driver instanceof ChromeDriver) {
            LogEntries logs = driver.manage().logs().get(LogType.BROWSER);
            StringBuilder logBuilder = new StringBuilder();
            for (LogEntry log : logs) {
                logBuilder.append(log.toString()).append("\n");
            }
            TestContext.attachText(logBuilder.toString(), "browser-logs_" + testName + "_" + timestamp + ".log");
        }

        // Network performance (Chrome only)
        captureNetworkPerformance(testName, timestamp);
    }

    private void captureNetworkPerformance(String testName, String timestamp) {
        if (driver instanceof ChromeDriver) {
            ChromeDriver chromeDriver = (ChromeDriver) driver;
            try {
                Object performanceLog = chromeDriver.executeCdpCommand("Performance.getMetrics", Map.of());
                TestContext.attachText(performanceLog.toString(),
                    "performance-metrics_" + testName + "_" + timestamp + ".json");
            } catch (Exception e) {
                System.err.println("Failed to capture performance metrics: " + e.getMessage());
            }
        }
    }

    private void cleanupTestData() {
        // Cleanup implementation based on test context
        TestDataCleanupManager.cleanup(TestContext.getCreatedData());
    }

    // Advanced utility methods accumulated over 7+ years
    protected void waitForElementToBeClickable(By locator) {
        wait.until(ExpectedConditions.elementToBeClickable(locator));
    }

    protected void waitForElementToDisappear(By locator) {
        wait.until(ExpectedConditions.invisibilityOfElementLocated(locator));
    }

    protected void waitForTextToAppear(By locator, String text) {
        wait.until(ExpectedConditions.textToBePresentInElementLocated(locator, text));
    }

    protected void scrollToElement(WebElement element) {
        jsExecutor.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", element);
        // Wait for scroll to complete
        try { Thread.sleep(500); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }

    protected void highlightElement(WebElement element) {
        if (Boolean.parseBoolean(System.getProperty("highlight.elements", "false"))) {
            String originalStyle = element.getAttribute("style");
            jsExecutor.executeScript("arguments[0].style.border='3px solid red';", element);
            try { Thread.sleep(300); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
            jsExecutor.executeScript("arguments[0].style.border='" + originalStyle + "';", element);
        }
    }

    protected void safeClick(WebElement element) {
        try {
            scrollToElement(element);
            highlightElement(element);
            wait.until(ExpectedConditions.elementToBeClickable(element));
            element.click();
        } catch (ElementClickInterceptedException e) {
            // Handle overlay elements
            dismissOverlays();
            wait.until(ExpectedConditions.elementToBeClickable(element));
            element.click();
        } catch (StaleElementReferenceException e) {
            // Re-find element and retry
            throw new RetryableException("Stale element encountered", e);
        }
    }

    private void dismissOverlays() {
        String[] overlaySelectors = {
            ".modal-backdrop", ".overlay", ".cookie-banner .close",
            ".notification .dismiss", "[data-dismiss='modal']"
        };

        for (String selector : overlaySelectors) {
            try {
                List<WebElement> overlays = driver.findElements(By.cssSelector(selector));
                for (WebElement overlay : overlays) {
                    if (overlay.isDisplayed()) {
                        overlay.click();
                        Thread.sleep(200);
                    }
                }
            } catch (Exception e) {
                // Continue to next overlay type
            }
        }
    }
}
```

#### **Advanced Page Object Model**
```java
// BasePage.java - Refined over 7+ years
public abstract class BasePage {

    protected final WebDriver driver;
    protected final WebDriverWait wait;
    protected final Actions actions;
    protected final JavascriptExecutor jsExecutor;

    // Page-specific configuration
    protected final Duration pageLoadTimeout;
    protected final String pageUrl;
    protected final By pageLoadIndicator;

    public BasePage(WebDriver driver, String pageUrl, By pageLoadIndicator) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(30));
        this.actions = new Actions(driver);
        this.jsExecutor = (JavascriptExecutor) driver;
        this.pageUrl = pageUrl;
        this.pageLoadIndicator = pageLoadIndicator;
        this.pageLoadTimeout = Duration.ofSeconds(45);
    }

    // Navigation with validation
    public void navigateTo() {
        driver.get(EnvironmentConfig.getBaseUrl() + pageUrl);
        waitForPageLoad();
        validatePageLoaded();
    }

    protected void waitForPageLoad() {
        // Wait for basic page load
        wait.until(ExpectedConditions.presenceOfElementLocated(pageLoadIndicator));

        // Wait for dynamic content
        wait.until(webDriver ->
            jsExecutor.executeScript("return document.readyState").equals("complete"));

        // Wait for AJAX calls to complete (jQuery)
        wait.until(webDriver -> {
            try {
                return (Boolean) jsExecutor.executeScript("return jQuery.active == 0");
            } catch (Exception e) {
                return true; // jQuery not present
            }
        });

        // Wait for Angular (if present)
        wait.until(webDriver -> {
            try {
                return (Boolean) jsExecutor.executeScript(
                    "return window.getAllAngularTestabilities().findIndex(x=>!x.isStable()) === -1");
            } catch (Exception e) {
                return true; // Angular not present
            }
        });
    }

    protected abstract void validatePageLoaded();

    // Advanced element interaction patterns
    protected WebElement findElement(By locator, Duration timeout) {
        WebDriverWait customWait = new WebDriverWait(driver, timeout);
        return customWait.until(ExpectedConditions.presenceOfElementLocated(locator));
    }

    protected List<WebElement> findElements(By locator, Duration timeout) {
        WebDriverWait customWait = new WebDriverWait(driver, timeout);
        customWait.until(ExpectedConditions.presenceOfElementLocated(locator));
        return driver.findElements(locator);
    }

    protected void typeText(By locator, String text) {
        WebElement element = wait.until(ExpectedConditions.elementToBeClickable(locator));
        element.clear();
        element.sendKeys(text);

        // Verify text was entered correctly
        String actualText = element.getAttribute("value");
        if (!text.equals(actualText)) {
            throw new AssertionError("Text entry failed. Expected: " + text + ", Actual: " + actualText);
        }
    }

    protected void selectDropdownByText(By dropdownLocator, String optionText) {
        WebElement dropdown = wait.until(ExpectedConditions.elementToBeClickable(dropdownLocator));
        Select select = new Select(dropdown);
        select.selectByVisibleText(optionText);

        // Verify selection
        String selectedText = select.getFirstSelectedOption().getText();
        if (!optionText.equals(selectedText)) {
            throw new AssertionError("Dropdown selection failed. Expected: " + optionText + ", Actual: " + selectedText);
        }
    }

    protected void uploadFile(By fileInputLocator, String filePath) {
        WebElement fileInput = driver.findElement(fileInputLocator);

        // Verify file exists
        File file = new File(filePath);
        if (!file.exists()) {
            throw new IllegalArgumentException("File not found: " + filePath);
        }

        fileInput.sendKeys(file.getAbsolutePath());

        // Wait for upload to process
        wait.until(webDriver -> {
            String fileName = fileInput.getAttribute("value");
            return fileName != null && fileName.contains(file.getName());
        });
    }

    // Table interaction patterns
    protected WebElement findTableCell(By tableLocator, int row, int column) {
        WebElement table = wait.until(ExpectedConditions.presenceOfElementLocated(tableLocator));
        List<WebElement> rows = table.findElements(By.tagName("tr"));

        if (row >= rows.size()) {
            throw new NoSuchElementException("Row " + row + " not found in table");
        }

        List<WebElement> cells = rows.get(row).findElements(By.tagName("td"));
        if (column >= cells.size()) {
            throw new NoSuchElementException("Column " + column + " not found in row " + row);
        }

        return cells.get(column);
    }

    protected List<Map<String, String>> extractTableData(By tableLocator) {
        WebElement table = wait.until(ExpectedConditions.presenceOfElementLocated(tableLocator));
        List<WebElement> headerRows = table.findElements(By.cssSelector("thead tr"));
        List<WebElement> dataRows = table.findElements(By.cssSelector("tbody tr"));

        if (headerRows.isEmpty()) {
            throw new IllegalStateException("Table header not found");
        }

        // Extract headers
        List<String> headers = headerRows.get(0).findElements(By.tagName("th"))
            .stream()
            .map(WebElement::getText)
            .collect(Collectors.toList());

        // Extract data
        List<Map<String, String>> tableData = new ArrayList<>();
        for (WebElement row : dataRows) {
            List<String> cellTexts = row.findElements(By.tagName("td"))
                .stream()
                .map(WebElement::getText)
                .collect(Collectors.toList());

            Map<String, String> rowData = new HashMap<>();
            for (int i = 0; i < Math.min(headers.size(), cellTexts.size()); i++) {
                rowData.put(headers.get(i), cellTexts.get(i));
            }
            tableData.add(rowData);
        }

        return tableData;
    }
}

// Specific page implementation
public class LoginPage extends BasePage {

    // Locators with multiple fallback strategies
    private final By emailInput = By.cssSelector("#email, [data-testid='email'], input[type='email']");
    private final By passwordInput = By.cssSelector("#password, [data-testid='password'], input[type='password']");
    private final By loginButton = By.cssSelector("#login-btn, [data-testid='login'], button[type='submit']");
    private final By errorMessage = By.cssSelector(".error-message, .alert-danger, [role='alert']");
    private final By loadingSpinner = By.cssSelector(".loading, .spinner, [data-loading='true']");

    public LoginPage(WebDriver driver) {
        super(driver, "/login", By.id("login-form"));
    }

    @Override
    protected void validatePageLoaded() {
        wait.until(ExpectedConditions.presenceOfElementLocated(emailInput));
        wait.until(ExpectedConditions.presenceOfElementLocated(passwordInput));
        wait.until(ExpectedConditions.elementToBeClickable(loginButton));

        // Validate page title
        String expectedTitle = "Login - QA Application";
        wait.until(ExpectedConditions.titleIs(expectedTitle));
    }

    public void login(String email, String password) {
        typeText(emailInput, email);
        typeText(passwordInput, password);
        clickLoginButton();
        waitForLoginResult();
    }

    public void typeEmail(String email) {
        typeText(emailInput, email);
    }

    public void typePassword(String password) {
        typeText(passwordInput, password);
    }

    public void clickLoginButton() {
        WebElement button = wait.until(ExpectedConditions.elementToBeClickable(loginButton));
        safeClick(button);
    }

    public String getErrorMessage() {
        WebElement error = wait.until(ExpectedConditions.visibilityOfElementLocated(errorMessage));
        return error.getText();
    }

    public boolean isLoading() {
        try {
            WebElement spinner = driver.findElement(loadingSpinner);
            return spinner.isDisplayed();
        } catch (NoSuchElementException e) {
            return false;
        }
    }

    private void waitForLoginResult() {
        // Wait for either success (redirect) or error message
        wait.until(ExpectedConditions.or(
            ExpectedConditions.urlContains("/dashboard"),
            ExpectedConditions.visibilityOfElementLocated(errorMessage)
        ));
    }

    private void safeClick(WebElement element) {
        try {
            element.click();
        } catch (ElementClickInterceptedException e) {
            // Use JavaScript click as fallback
            jsExecutor.executeScript("arguments[0].click();", element);
        }
    }
}
```

---

## 🔧 SELENIUM 4 ADVANCED FEATURES

### **Chrome DevTools Protocol Integration**
```java
// Advanced Selenium 4 capabilities
@Service
public class AdvancedSeleniumCapabilities {

    public void demonstrateSelenium4Features(WebDriver driver) {
        if (driver instanceof ChromeDriver) {
            ChromeDriver chromeDriver = (ChromeDriver) driver;
            DevTools devTools = chromeDriver.getDevTools();
            devTools.createSession();

            // Network monitoring
            enableNetworkMonitoring(devTools);

            // Performance metrics
            enablePerformanceMonitoring(devTools);

            // Geolocation mocking
            mockGeolocation(devTools, 37.7749, -122.4194); // San Francisco

            // Device emulation
            emulateDevice(devTools);
        }
    }

    private void enableNetworkMonitoring(DevTools devTools) {
        devTools.send(Network.enable(Optional.empty(), Optional.empty(), Optional.empty()));

        // Monitor failed requests
        devTools.addListener(Network.loadingFailed(), loadingFailed -> {
            System.err.println("Request failed: " + loadingFailed.getErrorText() +
                " for URL: " + loadingFailed.getRequestId());
        });

        // Monitor response times
        devTools.addListener(Network.responseReceived(), response -> {
            Response res = response.getResponse();
            if (res.getUrl().contains("/api/")) {
                System.out.println("API Response: " + res.getUrl() +
                    " - Status: " + res.getStatus() +
                    " - Time: " + response.getTimestamp());
            }
        });

        // Block specific resources
        devTools.send(Network.setBlockedURLs(
            Arrays.asList("*google-analytics*", "*facebook*", "*doubleclick*")
        ));
    }

    private void enablePerformanceMonitoring(DevTools devTools) {
        devTools.send(Performance.enable(Optional.empty()));

        // Collect performance metrics
        List<Metric> metrics = devTools.send(Performance.getMetrics());

        for (Metric metric : metrics) {
            if (metric.getName().equals("JSHeapUsedSize") ||
                metric.getName().equals("JSHeapTotalSize") ||
                metric.getName().equals("ScriptDuration")) {
                System.out.println("Performance Metric - " +
                    metric.getName() + ": " + metric.getValue());
            }
        }
    }

    private void mockGeolocation(DevTools devTools, double latitude, double longitude) {
        devTools.send(Emulation.setGeolocationOverride(
            Optional.of(latitude),
            Optional.of(longitude),
            Optional.of(100) // accuracy
        ));
    }

    private void emulateDevice(DevTools devTools) {
        // Emulate iPhone 12
        devTools.send(Emulation.setDeviceMetricsOverride(
            390,    // width
            844,    // height
            3.0,    // deviceScaleFactor
            true,   // mobile
            Optional.empty(),
            Optional.empty(),
            Optional.empty(),
            Optional.empty(),
            Optional.empty(),
            Optional.empty(),
            Optional.empty(),
            Optional.empty(),
            Optional.empty()
        ));

        devTools.send(Emulation.setUserAgentOverride(
            "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15",
            Optional.empty(),
            Optional.empty(),
            Optional.empty()
        ));
    }
}
```

### **Relative Locators and Advanced Element Finding**
```java
// Selenium 4 relative locators
public class RelativeLocatorExamples {

    public void demonstrateRelativeLocators(WebDriver driver) {
        // Find elements relative to other elements
        WebElement passwordField = driver.findElement(By.id("password"));
        WebElement usernameField = driver.findElement(By.id("username"));

        // Find login button to the right of password field
        WebElement loginButton = driver.findElement(
            RelativeLocator.with(By.tagName("button")).toRightOf(passwordField)
        );

        // Find forgot password link below the login form
        WebElement forgotPasswordLink = driver.findElement(
            RelativeLocator.with(By.linkText("Forgot Password?"))
                .below(loginButton)
                .toRightOf(usernameField)
        );

        // Find element near another element (within 50 pixels)
        WebElement helpIcon = driver.findElement(
            RelativeLocator.with(By.className("help-icon")).near(usernameField)
        );

        // Complex relative positioning
        WebElement submitButton = driver.findElement(
            RelativeLocator.with(By.tagName("button"))
                .below(passwordField)
                .above(forgotPasswordLink)
                .toRightOf(usernameField)
        );
    }

    public List<WebElement> findElementsInTable(WebDriver driver, String headerText, String cellValue) {
        // Find table header
        WebElement header = driver.findElement(By.xpath("//th[text()='" + headerText + "']"));

        // Find all cells in that column with specific value
        List<WebElement> cells = driver.findElements(
            RelativeLocator.with(By.tagName("td"))
                .below(header)
                .and(By.xpath(".//text()[contains(., '" + cellValue + "')]"))
        );

        return cells;
    }
}
```

---

## 🚀 SELENIUM GRID MASTERY

### **Enterprise Grid Configuration**
```yaml
# docker-compose.yml for Selenium Grid 4
version: '3.8'
services:
  selenium-hub:
    image: selenium/hub:4.15.0
    container_name: selenium-hub
    ports:
      - "4444:4444"
      - "4442:4442"
      - "4443:4443"
    environment:
      - GRID_MAX_SESSION=16
      - GRID_BROWSER_TIMEOUT=300
      - GRID_TIMEOUT=300
    volumes:
      - /dev/shm:/dev/shm

  chrome-node-1:
    image: selenium/node-chrome:4.15.0
    container_name: chrome-node-1
    shm_size: 2gb
    depends_on:
      - selenium-hub
    environment:
      - HUB_HOST=selenium-hub
      - HUB_PORT=4444
      - NODE_MAX_INSTANCES=2
      - NODE_MAX_SESSION=2
    volumes:
      - /dev/shm:/dev/shm
    ports:
      - "5901:5900"

  chrome-node-2:
    image: selenium/node-chrome:4.15.0
    container_name: chrome-node-2
    shm_size: 2gb
    depends_on:
      - selenium-hub
    environment:
      - HUB_HOST=selenium-hub
      - HUB_PORT=4444
      - NODE_MAX_INSTANCES=2
      - NODE_MAX_SESSION=2
    volumes:
      - /dev/shm:/dev/shm
    ports:
      - "5902:5900"

  firefox-node:
    image: selenium/node-firefox:4.15.0
    container_name: firefox-node
    shm_size: 2gb
    depends_on:
      - selenium-hub
    environment:
      - HUB_HOST=selenium-hub
      - HUB_PORT=4444
      - NODE_MAX_INSTANCES=1
      - NODE_MAX_SESSION=1
    volumes:
      - /dev/shm:/dev/shm
    ports:
      - "5903:5900"

  edge-node:
    image: selenium/node-edge:4.15.0
    container_name: edge-node
    shm_size: 2gb
    depends_on:
      - selenium-hub
    environment:
      - HUB_HOST=selenium-hub
      - HUB_PORT=4444
      - NODE_MAX_INSTANCES=1
      - NODE_MAX_SESSION=1
    volumes:
      - /dev/shm:/dev/shm
    ports:
      - "5904:5900"
```

### **Grid Management and Monitoring**
```java
// Advanced Grid management
@Service
public class SeleniumGridManager {

    private final String gridUrl;
    private final RestTemplate restTemplate;

    public SeleniumGridManager(@Value("${selenium.grid.url}") String gridUrl) {
        this.gridUrl = gridUrl;
        this.restTemplate = new RestTemplate();
    }

    public GridStatus getGridStatus() {
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(
                gridUrl + "/status", String.class
            );

            ObjectMapper mapper = new ObjectMapper();
            JsonNode statusJson = mapper.readTree(response.getBody());

            return GridStatus.builder()
                .ready(statusJson.get("value").get("ready").asBoolean())
                .message(statusJson.get("value").get("message").asText())
                .nodes(extractNodeInfo(statusJson.get("value").get("nodes")))
                .build();

        } catch (Exception e) {
            throw new RuntimeException("Failed to get grid status", e);
        }
    }

    public void waitForGridReady(Duration timeout) {
        Instant deadline = Instant.now().plus(timeout);

        while (Instant.now().isBefore(deadline)) {
            try {
                GridStatus status = getGridStatus();
                if (status.isReady()) {
                    System.out.println("Grid is ready with " + status.getNodes().size() + " nodes");
                    return;
                }

                System.out.println("Grid not ready: " + status.getMessage());
                Thread.sleep(5000);

            } catch (Exception e) {
                System.err.println("Error checking grid status: " + e.getMessage());
                try { Thread.sleep(5000); } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Interrupted while waiting for grid", ie);
                }
            }
        }

        throw new TimeoutException("Grid did not become ready within " + timeout);
    }

    public List<NodeInfo> getAvailableNodes() {
        GridStatus status = getGridStatus();
        return status.getNodes().stream()
            .filter(node -> node.getAvailability().equals("UP"))
            .collect(Collectors.toList());
    }

    public void scaleNodes(String browserType, int desiredCount) {
        // This would integrate with Docker or Kubernetes to scale nodes
        System.out.println("Scaling " + browserType + " nodes to " + desiredCount);

        // Implementation would depend on orchestration platform
        // For Docker Compose:
        // docker-compose up --scale chrome-node={desiredCount}

        // For Kubernetes:
        // kubectl scale deployment chrome-node-deployment --replicas={desiredCount}
    }

    public SessionDistribution getSessionDistribution() {
        List<NodeInfo> nodes = getAvailableNodes();

        Map<String, Integer> distribution = nodes.stream()
            .collect(Collectors.groupingBy(
                NodeInfo::getBrowserName,
                Collectors.summingInt(NodeInfo::getUsedSlots)
            ));

        return new SessionDistribution(distribution);
    }

    private List<NodeInfo> extractNodeInfo(JsonNode nodesJson) {
        List<NodeInfo> nodes = new ArrayList<>();

        for (JsonNode node : nodesJson) {
            NodeInfo nodeInfo = NodeInfo.builder()
                .id(node.get("id").asText())
                .uri(node.get("uri").asText())
                .availability(node.get("availability").asText())
                .browserName(extractBrowserName(node))
                .maxSessions(node.get("maxSessions").asInt())
                .usedSlots(node.get("usedSlots").asInt())
                .build();

            nodes.add(nodeInfo);
        }

        return nodes;
    }

    private String extractBrowserName(JsonNode node) {
        JsonNode stereotypes = node.get("stereotypes");
        if (stereotypes != null && stereotypes.isArray() && stereotypes.size() > 0) {
            return stereotypes.get(0).get("browserName").asText();
        }
        return "unknown";
    }
}
```

---

## 🔄 MIGRATION STRATEGIES - Selenium to Modern Frameworks

### **Migration Assessment Framework**
```java
// Migration analysis tool
@Service
public class SeleniumMigrationAnalyzer {

    public MigrationReport analyzeTestSuite(String testSourcePath) {
        MigrationReport report = new MigrationReport();

        try {
            Files.walk(Paths.get(testSourcePath))
                .filter(path -> path.toString().endsWith(".java"))
                .forEach(path -> analyzeTestFile(path, report));

        } catch (IOException e) {
            throw new RuntimeException("Failed to analyze test suite", e);
        }

        generateRecommendations(report);
        return report;
    }

    private void analyzeTestFile(Path filePath, MigrationReport report) {
        try {
            String content = Files.readString(filePath);
            TestFileAnalysis analysis = new TestFileAnalysis(filePath.getFileName().toString());

            // Analyze Selenium usage patterns
            analyzeSelectorPatterns(content, analysis);
            analyzeWaitPatterns(content, analysis);
            analyzePageObjectUsage(content, analysis);
            analyzeComplexInteractions(content, analysis);
            analyzeDataDrivenPatterns(content, analysis);

            // Calculate migration complexity
            analysis.setComplexityScore(calculateComplexityScore(analysis));
            analysis.setMigrationEffort(estimateMigrationEffort(analysis));

            report.addTestFile(analysis);

        } catch (IOException e) {
            System.err.println("Failed to analyze file: " + filePath);
        }
    }

    private void analyzeSelectorPatterns(String content, TestFileAnalysis analysis) {
        // Count different selector types
        analysis.setByCssCount(countOccurrences(content, "By\\.css"));
        analysis.setByXpathCount(countOccurrences(content, "By\\.xpath"));
        analysis.setByIdCount(countOccurrences(content, "By\\.id"));
        analysis.setByClassCount(countOccurrences(content, "By\\.className"));

        // Identify complex XPath patterns
        if (content.contains("//") && content.contains("[")) {
            analysis.setHasComplexXPath(true);
        }

        // Check for dynamic selector patterns
        if (content.contains("contains(") || content.contains("starts-with(")) {
            analysis.setHasDynamicSelectors(true);
        }
    }

    private void analyzeWaitPatterns(String content, TestFileAnalysis analysis) {
        analysis.setExplicitWaitCount(countOccurrences(content, "WebDriverWait"));
        analysis.setImplicitWaitCount(countOccurrences(content, "implicitlyWait"));
        analysis.setFluentWaitCount(countOccurrences(content, "FluentWait"));

        // Check for problematic wait patterns
        if (content.contains("Thread.sleep")) {
            analysis.setHasThreadSleep(true);
        }

        // Check for advanced wait conditions
        if (content.contains("ExpectedConditions")) {
            analysis.setUsesExpectedConditions(true);
        }
    }

    private void analyzePageObjectUsage(String content, TestFileAnalysis analysis) {
        if (content.contains("@FindBy") || content.contains("PageFactory")) {
            analysis.setUsesPageFactory(true);
        }

        if (content.contains("extends BasePage") || content.contains("extends Page")) {
            analysis.setUsesPageObjectModel(true);
        }

        // Check for Page Object inheritance complexity
        int inheritanceLevel = countOccurrences(content, "extends");
        analysis.setPageObjectComplexity(inheritanceLevel);
    }

    private void analyzeComplexInteractions(String content, TestFileAnalysis analysis) {
        // Check for advanced interactions
        if (content.contains("Actions")) {
            analysis.setUsesActions(true);
        }

        if (content.contains("JavascriptExecutor")) {
            analysis.setUsesJavaScript(true);
        }

        if (content.contains("TakesScreenshot")) {
            analysis.setUsesScreenshots(true);
        }

        // Check for file operations
        if (content.contains("sendKeys") && content.contains("file")) {
            analysis.setHasFileUpload(true);
        }

        // Check for frame/window handling
        if (content.contains("switchTo().frame") || content.contains("switchTo().window")) {
            analysis.setHasFrameHandling(true);
        }
    }

    private int calculateComplexityScore(TestFileAnalysis analysis) {
        int score = 0;

        // Selector complexity
        score += analysis.getByXpathCount() * 3; // XPath is most complex to migrate
        score += analysis.getByCssCount() * 1;   // CSS is easier
        score += analysis.getByIdCount() * 0;    // ID is easiest

        // Wait pattern complexity
        if (analysis.isHasThreadSleep()) score += 10;
        score += analysis.getExplicitWaitCount() * 2;

        // Interaction complexity
        if (analysis.isUsesActions()) score += 5;
        if (analysis.isUsesJavaScript()) score += 7;
        if (analysis.isHasFrameHandling()) score += 8;

        // Page Object complexity
        score += analysis.getPageObjectComplexity() * 3;

        return score;
    }

    private MigrationEffort estimateMigrationEffort(TestFileAnalysis analysis) {
        int complexityScore = analysis.getComplexityScore();

        if (complexityScore <= 20) {
            return MigrationEffort.LOW;    // 1-2 hours
        } else if (complexityScore <= 50) {
            return MigrationEffort.MEDIUM; // 4-8 hours
        } else {
            return MigrationEffort.HIGH;   // 1-2 days
        }
    }

    private void generateRecommendations(MigrationReport report) {
        List<String> recommendations = new ArrayList<>();

        long highComplexityTests = report.getTestFiles().stream()
            .mapToInt(TestFileAnalysis::getComplexityScore)
            .filter(score -> score > 50)
            .count();

        if (highComplexityTests > report.getTestFiles().size() * 0.3) {
            recommendations.add("Consider gradual migration - start with low complexity tests");
            recommendations.add("Invest in creating migration utilities for common patterns");
        }

        long threadSleepTests = report.getTestFiles().stream()
            .mapToLong(analysis -> analysis.isHasThreadSleep() ? 1 : 0)
            .sum();

        if (threadSleepTests > 0) {
            recommendations.add("Priority: Replace Thread.sleep with proper wait strategies");
        }

        long xpathHeavyTests = report.getTestFiles().stream()
            .mapToInt(TestFileAnalysis::getByXpathCount)
            .filter(count -> count > 10)
            .count();

        if (xpathHeavyTests > 0) {
            recommendations.add("Focus on converting complex XPath to CSS selectors or test-ids");
        }

        report.setRecommendations(recommendations);
    }

    private int countOccurrences(String content, String pattern) {
        return (content.length() - content.replace(pattern, "").length()) / pattern.length();
    }
}
```

### **Automated Migration Tools**
```java
// Selenium to Playwright migration utility
@Service
public class SeleniumToPlaywrightMigrator {

    private final Map<String, String> selectorMappings = Map.of(
        "By.id(\"", "#",
        "By.className(\"", ".",
        "By.cssSelector(\"", "",
        "By.xpath(\"//", "//"
    );

    private final Map<String, String> methodMappings = Map.of(
        "driver.findElement", "page.locator",
        "element.click()", "element.click()",
        "element.sendKeys(", "element.fill(",
        "element.clear()", "element.fill('')",
        "element.getText()", "element.textContent()",
        "element.isDisplayed()", "element.isVisible()"
    );

    public MigrationResult migrateTestFile(String seleniumFilePath, String outputPath) {
        try {
            String seleniumContent = Files.readString(Paths.get(seleniumFilePath));
            String playwrightContent = convertSeleniumToPlaywright(seleniumContent);

            Files.writeString(Paths.get(outputPath), playwrightContent);

            return MigrationResult.success(seleniumFilePath, outputPath);

        } catch (Exception e) {
            return MigrationResult.failure(seleniumFilePath, e.getMessage());
        }
    }

    private String convertSeleniumToPlaywright(String seleniumContent) {
        String converted = seleniumContent;

        // Convert imports
        converted = converted.replace("import org.openqa.selenium", "// Selenium imports removed");
        converted = "import { test, expect, Page } from '@playwright/test';\n" + converted;

        // Convert class structure
        converted = convertClassStructure(converted);

        // Convert selectors
        converted = convertSelectors(converted);

        // Convert method calls
        converted = convertMethods(converted);

        // Convert wait patterns
        converted = convertWaitPatterns(converted);

        // Convert assertions
        converted = convertAssertions(converted);

        return converted;
    }

    private String convertClassStructure(String content) {
        // Convert from Java class to TypeScript test structure
        String converted = content;

        // Convert class declaration
        converted = converted.replaceAll(
            "public class (\\w+)Test.*\\{",
            "test.describe('$1', () => {"
        );

        // Convert test methods
        converted = converted.replaceAll(
            "@Test\\s+public void (\\w+)\\(\\).*\\{",
            "test('$1', async ({ page }) => {"
        );

        return converted;
    }

    private String convertSelectors(String content) {
        String converted = content;

        for (Map.Entry<String, String> mapping : selectorMappings.entrySet()) {
            converted = converted.replace(mapping.getKey(), mapping.getValue());
        }

        // Convert complex XPath patterns
        converted = convertXPathPatterns(converted);

        return converted;
    }

    private String convertXPathPatterns(String content) {
        // Convert common XPath patterns to CSS or Playwright locators
        Map<String, String> xpathConversions = Map.of(
            "//input[@type='text']", "input[type='text']",
            "//button[contains(text(), '", "button:has-text('",
            "//div[@class='", ".class[class='",
            "//a[contains(@href, '", "a[href*='",
            "//span[text()='", "span:has-text('"
        );

        String converted = content;
        for (Map.Entry<String, String> mapping : xpathConversions.entrySet()) {
            converted = converted.replace(mapping.getKey(), mapping.getValue());
        }

        return converted;
    }

    private String convertMethods(String content) {
        String converted = content;

        for (Map.Entry<String, String> mapping : methodMappings.entrySet()) {
            converted = converted.replace(mapping.getKey(), mapping.getValue());
        }

        return converted;
    }

    private String convertWaitPatterns(String content) {
        String converted = content;

        // Convert WebDriverWait patterns
        converted = converted.replaceAll(
            "wait\\.until\\(ExpectedConditions\\.elementToBeClickable\\((.*)\\)\\)",
            "await $1.waitFor({ state: 'visible' })"
        );

        converted = converted.replaceAll(
            "wait\\.until\\(ExpectedConditions\\.visibilityOfElementLocated\\((.*)\\)\\)",
            "await page.waitForSelector($1, { state: 'visible' })"
        );

        // Remove Thread.sleep
        converted = converted.replaceAll(
            "Thread\\.sleep\\(\\d+\\);",
            "// TODO: Replace with proper wait strategy"
        );

        return converted;
    }

    private String convertAssertions(String content) {
        String converted = content;

        // Convert common assertions
        converted = converted.replaceAll(
            "Assert\\.assertEquals\\((.+), (.+)\\.getText\\(\\)\\)",
            "await expect($2).toContainText($1)"
        );

        converted = converted.replaceAll(
            "Assert\\.assertTrue\\((.+)\\.isDisplayed\\(\\)\\)",
            "await expect($1).toBeVisible()"
        );

        return converted;
    }
}
```

---

## 📊 PERFORMANCE OPTIMIZATION - 7+ Years of Expertise

### **Selenium Performance Patterns**
```java
// Performance optimization patterns learned over 7+ years
@Service
public class SeleniumPerformanceOptimizer {

    public void optimizeDriverPerformance(ChromeOptions options) {
        // Performance optimizations accumulated over 7+ years

        // Disable unnecessary features
        options.addArguments("--disable-web-security");
        options.addArguments("--disable-features=VizDisplayCompositor");
        options.addArguments("--disable-extensions");
        options.addArguments("--disable-plugins");
        options.addArguments("--disable-images");
        options.addArguments("--disable-javascript"); // Only for non-JS dependent tests

        // Memory optimizations
        options.addArguments("--memory-pressure-off");
        options.addArguments("--max_old_space_size=4096");

        // Network optimizations
        options.addArguments("--aggressive-cache-discard");
        options.addArguments("--disable-background-networking");

        // Rendering optimizations
        options.addArguments("--disable-renderer-backgrounding");
        options.addArguments("--disable-backgrounding-occluded-windows");
        options.addArguments("--disable-features=TranslateUI");

        // Logging optimization
        options.addArguments("--silent");
        options.addArguments("--log-level=3");

        // Set preferences for faster execution
        Map<String, Object> prefs = new HashMap<>();
        prefs.put("profile.default_content_setting_values.notifications", 2);
        prefs.put("profile.default_content_settings.popups", 0);
        prefs.put("profile.managed_default_content_settings.images", 2);
        options.setExperimentalOption("prefs", prefs);
    }

    public void implementSmartWaiting(WebDriver driver) {
        // Optimized timeout strategy
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(1)); // Reduced from default 10s
        driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(30));
        driver.manage().timeouts().scriptTimeout(Duration.ofSeconds(15));
    }

    public void enableParallelExecution() {
        // Thread-safe WebDriver management
        ThreadLocal<WebDriver> driverThreadLocal = new ThreadLocal<>();

        // Parallel test configuration
        System.setProperty("junit.jupiter.execution.parallel.enabled", "true");
        System.setProperty("junit.jupiter.execution.parallel.mode.default", "concurrent");
        System.setProperty("junit.jupiter.execution.parallel.config.strategy", "dynamic");
    }

    public void optimizeElementFinding(WebDriver driver) {
        // Batch element operations
        List<WebElement> elements = driver.findElements(By.cssSelector(".item"));

        // Pre-fetch commonly used elements
        Map<String, WebElement> elementCache = new HashMap<>();
        elementCache.put("header", driver.findElement(By.id("header")));
        elementCache.put("footer", driver.findElement(By.id("footer")));
        elementCache.put("nav", driver.findElement(By.id("nav")));

        // Use JavaScript for bulk operations
        JavascriptExecutor js = (JavascriptExecutor) driver;
        js.executeScript(
            "var elements = document.querySelectorAll('.item');" +
            "elements.forEach(el => el.style.display = 'none');"
        );
    }

    public void implementResourceManagement() {
        // Proper resource cleanup
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            // Cleanup any remaining WebDriver instances
            WebDriverManager.closeAll();
        }));
    }
}
```

---

## 🎯 INTERVIEW TALKING POINTS

### **Your Selenium Journey Story**
"I've been working with Selenium for 7+ years, starting with Selenium 2 WebDriver when I had to handle browser compatibility issues manually. I've seen the evolution through Selenium 3's stability improvements to Selenium 4's modern capabilities with CDP integration. This journey taught me not just how to use Selenium, but when NOT to use it - which is why I'm now leading migrations to modern tools like Playwright."

### **Technical Authority Demonstrations**
1. **Framework Architecture**: "I've built Selenium frameworks that scaled to 1000+ tests across 50+ nodes"
2. **Performance Mastery**: "I reduced execution time from 4 hours to 45 minutes through smart parallelization and optimization"
3. **Migration Leadership**: "I've led 3 major migrations from Selenium to modern frameworks, with detailed ROI analysis"
4. **Grid Expertise**: "I managed enterprise Selenium Grid deployments with Docker orchestration and auto-scaling"

### **Business Value Delivered**
- **Cost Reduction**: "Optimized Selenium infrastructure reducing cloud costs by 60%"
- **Quality Improvement**: "Reduced flaky tests from 30% to 5% through advanced wait strategies"
- **Team Enablement**: "Trained 40+ engineers on Selenium best practices"
- **Strategic Modernization**: "Led evidence-based decisions on when to modernize vs maintain Selenium"

### **Problem-Solving Examples**
- **Cross-Browser Issues**: "Solved rendering differences between Chrome and Safari using targeted browser capabilities"
- **Flaky Test Epidemic**: "Implemented comprehensive stability patterns reducing maintenance by 70%"
- **Performance Bottlenecks**: "Identified and resolved memory leaks in long-running test suites"

### **Modern Perspective**
"Selenium taught me the fundamentals of web automation, but 7+ years also showed me its limitations. That's why I champion Playwright for new projects while maintaining Selenium expertise for legacy systems. Understanding both makes me valuable for organizations at any stage of their automation journey."

---

## 📚 QUICK REFERENCE - Selenium Interview Cheat Sheet

### **Selenium 4 Key Features**
```java
// New capabilities to mention
- Relative Locators: with().above(), below(), toLeftOf(), toRightOf()
- Chrome DevTools Protocol: Network monitoring, Performance metrics
- Enhanced Screenshots: Element-specific screenshots
- Better Window Management: newWindow(WindowType.TAB)
- Improved Grid: Standalone mode, better observability
```

### **Common Interview Questions**
```java
// Be ready to explain:
1. "How do you handle dynamic elements?"
   → WebDriverWait + ExpectedConditions + Retry patterns

2. "What's your approach to flaky tests?"
   → Root cause analysis + Smart waits + Environment isolation

3. "How do you scale Selenium tests?"
   → Grid architecture + Parallel execution + Resource management

4. "When would you choose Selenium vs Playwright?"
   → Legacy browsers, Java ecosystem, team expertise
```

### **Architecture Decision Matrix**
| Factor | Selenium ✅ | Playwright ❌ |
|--------|-------------|---------------|
| Legacy Browser Support | IE, old Safari | Modern only |
| Java Integration | Native | Limited |
| Team Experience | Established | Learning curve |
| Mobile Testing | Appium integration | Limited |
| Performance | Good with optimization | Superior |

---

**You're ready to demonstrate 7+ years of Selenium mastery! Remember to balance your technical depth with strategic thinking about modernization. Show them you understand both the power and limitations of Selenium. 🚀**