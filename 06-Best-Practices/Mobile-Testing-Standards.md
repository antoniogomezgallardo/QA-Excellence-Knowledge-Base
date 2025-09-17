# Mobile Testing Standards

## Overview

Mobile testing is a specialized discipline that ensures applications perform optimally across diverse mobile devices, operating systems, and network conditions. This guide establishes comprehensive standards for mobile application testing covering native, hybrid, and web mobile applications.

### Purpose and Scope
- Define mobile testing standards for QA professionals
- Establish device testing strategies and methodologies
- Provide platform-specific testing approaches
- Create frameworks for mobile automation and performance testing

### Target Audience
- QA Engineers implementing mobile testing strategies
- Mobile automation specialists
- Cross-platform testing teams
- DevOps teams integrating mobile CI/CD

### Key Benefits
- Comprehensive mobile device coverage
- Improved user experience across platforms
- Reduced platform-specific defects
- Enhanced mobile performance and accessibility
- Streamlined mobile release processes

## Fundamental Principles

### Core Mobile Testing Concepts

#### 1. Mobile Testing Pyramid
```
Manual Exploratory Testing (Top)
├── Usability Testing
├── Device-Specific Testing
└── User Journey Validation

Automated UI Testing (Middle)
├── Cross-Platform UI Tests
├── Platform-Specific Tests
└── Visual Regression Tests

Unit & Integration Testing (Base)
├── Business Logic Tests
├── API Integration Tests
└── Component Tests
```

#### 2. Mobile Testing Types Matrix

| Test Type | iOS Focus | Android Focus | Tools | Frequency |
|-----------|-----------|---------------|-------|-----------|
| **Functional** | iOS SDK compatibility | Android API levels | Appium, XCUITest | Every build |
| **Performance** | iOS memory constraints | Android fragmentation | Firebase Performance | Sprint cycles |
| **Compatibility** | iOS versions | Device variations | Device labs | Major releases |
| **Usability** | iOS design guidelines | Material Design | Manual testing | Feature releases |
| **Security** | iOS App Store review | Android permissions | OWASP Mobile | Security sprints |
| **Accessibility** | VoiceOver testing | TalkBack testing | Accessibility scanners | Accessibility sprints |

#### 3. Device Testing Strategy

**Device Selection Framework:**
```
Priority 1 (Must Test - 80% Coverage)
├── Latest flagship devices (iPhone 14/15, Samsung Galaxy S23/24)
├── Previous generation flagship (iPhone 13, Samsung Galaxy S22)
├── Popular mid-range devices (iPhone SE, Samsung Galaxy A54)
└── Minimum supported OS versions

Priority 2 (Should Test - 15% Coverage)
├── Tablet devices (iPad, Samsung Galaxy Tab)
├── Older but popular devices
└── Regional market leaders

Priority 3 (Nice to Test - 5% Coverage)
├── Emerging market devices
├── Unusual screen sizes/resolutions
└── Legacy device support
```

#### 4. Mobile Testing Anti-Patterns to Avoid

❌ **Testing Only on Simulators/Emulators**
- Always test on real devices for accurate results
- Use simulators for initial development only

❌ **Ignoring Network Conditions**
- Test across different network speeds and conditions
- Include offline scenarios in testing

❌ **Platform-Agnostic Testing Only**
- Respect platform-specific design patterns
- Test platform-specific features thoroughly

❌ **Overlooking Performance on Lower-End Devices**
- Include budget devices in performance testing
- Test memory and CPU constraints

## Step-by-Step Implementation

### Phase 1: Mobile Test Environment Setup

#### 1.1 Device Lab Configuration
```yaml
# Mobile Device Lab Configuration
device_lab:
  physical_devices:
    ios_devices:
      - model: "iPhone 15 Pro"
        ios_version: "17.0"
        udid: "00008030-001C34E834A3402E"
        location: "QA Lab Rack 1"

      - model: "iPhone 14"
        ios_version: "16.5"
        udid: "00008101-000255923E40401E"
        location: "QA Lab Rack 1"

      - model: "iPhone SE (3rd generation)"
        ios_version: "16.0"
        udid: "00008101-000A31A83E82402E"
        location: "QA Lab Rack 2"

      - model: "iPad Pro 12.9"
        ios_version: "17.0"
        udid: "00008027-001C54443CB2802E"
        location: "QA Lab Rack 2"

    android_devices:
      - model: "Samsung Galaxy S24"
        android_version: "14"
        api_level: 34
        serial: "R3CR90BZKMH"
        location: "QA Lab Rack 3"

      - model: "Google Pixel 8"
        android_version: "14"
        api_level: 34
        serial: "3A071FDFS00123"
        location: "QA Lab Rack 3"

      - model: "Samsung Galaxy A54"
        android_version: "13"
        api_level: 33
        serial: "R3CT40AZQMX"
        location: "QA Lab Rack 4"

  cloud_devices:
    browserstack:
      enabled: true
      api_key: "${BROWSERSTACK_API_KEY}"
      devices: ["iPhone 15", "Samsung Galaxy S24", "iPad Pro"]

    firebase_test_lab:
      enabled: true
      project_id: "mobile-testing-project"
      devices: ["Pixel8", "Galaxy S24", "iPhone15Pro"]

  simulators_emulators:
    ios_simulator:
      xcode_version: "15.0"
      simulator_versions: ["17.0", "16.5", "15.5"]

    android_emulator:
      android_studio_version: "Hedgehog 2023.1.1"
      api_levels: [34, 33, 30, 28]
      system_images: ["google_apis", "google_apis_playstore"]
```

#### 1.2 Mobile Automation Framework Setup
```python
#!/usr/bin/env python3
"""
Mobile Test Automation Framework
Cross-platform mobile testing with Appium
"""

import pytest
import time
from appium import webdriver
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

class MobileTestFramework:
    def __init__(self, platform: str, device_name: str, app_path: str):
        self.platform = platform.lower()
        self.device_name = device_name
        self.app_path = app_path
        self.driver = None
        self.wait = None

    def setup_ios_capabilities(self):
        """Setup iOS testing capabilities"""
        return {
            'platformName': 'iOS',
            'deviceName': self.device_name,
            'automationName': 'XCUITest',
            'app': self.app_path,
            'bundleId': 'com.example.testapp',
            'newCommandTimeout': 60,
            'wdaLaunchTimeout': 60000,
            'wdaConnectionTimeout': 60000,
            'iosInstallPause': 8000,
            'xcodeOrgId': 'TEAM_ID',
            'xcodeSigningId': 'iPhone Developer',
            'udid': 'auto',
            'showXcodeLog': True,
            'realDevice': True
        }

    def setup_android_capabilities(self):
        """Setup Android testing capabilities"""
        return {
            'platformName': 'Android',
            'deviceName': self.device_name,
            'automationName': 'UiAutomator2',
            'app': self.app_path,
            'appPackage': 'com.example.testapp',
            'appActivity': '.MainActivity',
            'newCommandTimeout': 60,
            'adbExecTimeout': 20000,
            'androidDeviceReadyTimeout': 30,
            'androidInstallTimeout': 150000,
            'autoGrantPermissions': True,
            'noReset': False,
            'fullReset': False
        }

    def start_driver(self, appium_server_url: str = 'http://localhost:4723/wd/hub'):
        """Initialize Appium driver"""
        if self.platform == 'ios':
            capabilities = self.setup_ios_capabilities()
        elif self.platform == 'android':
            capabilities = self.setup_android_capabilities()
        else:
            raise ValueError(f"Unsupported platform: {self.platform}")

        self.driver = webdriver.Remote(appium_server_url, capabilities)
        self.wait = WebDriverWait(self.driver, 10)
        return self.driver

    def stop_driver(self):
        """Clean up driver"""
        if self.driver:
            self.driver.quit()

    def find_element_safely(self, by, value, timeout=10):
        """Find element with proper error handling"""
        try:
            element = WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((by, value))
            )
            return element
        except TimeoutException:
            print(f"Element not found: {by}={value} within {timeout} seconds")
            return None

    def tap_element_safely(self, by, value, timeout=10):
        """Tap element with safety checks"""
        element = self.find_element_safely(by, value, timeout)
        if element:
            element.click()
            return True
        return False

    def swipe_screen(self, direction: str, distance: float = 0.5):
        """Perform swipe gesture"""
        size = self.driver.get_window_size()
        start_x = size['width'] * 0.5
        start_y = size['height'] * 0.5

        if direction.lower() == 'up':
            end_x, end_y = start_x, start_y * (1 - distance)
        elif direction.lower() == 'down':
            end_x, end_y = start_x, start_y * (1 + distance)
        elif direction.lower() == 'left':
            end_x, end_y = start_x * (1 - distance), start_y
        elif direction.lower() == 'right':
            end_x, end_y = start_x * (1 + distance), start_y
        else:
            raise ValueError(f"Invalid swipe direction: {direction}")

        self.driver.swipe(start_x, start_y, end_x, end_y, 800)

    def enter_text_safely(self, by, value, text, clear_first=True):
        """Enter text with proper handling"""
        element = self.find_element_safely(by, value)
        if element:
            if clear_first:
                element.clear()
            element.send_keys(text)
            return True
        return False

    def wait_for_element_visible(self, by, value, timeout=10):
        """Wait for element to be visible"""
        try:
            element = WebDriverWait(self.driver, timeout).until(
                EC.visibility_of_element_located((by, value))
            )
            return element
        except TimeoutException:
            return None

    def capture_screenshot(self, filename: str = None):
        """Capture screenshot for debugging"""
        if not filename:
            timestamp = int(time.time())
            filename = f"screenshot_{timestamp}.png"

        self.driver.save_screenshot(filename)
        return filename

    def get_device_info(self):
        """Get device information for reporting"""
        if self.platform == 'ios':
            return {
                'platform': self.driver.capabilities['platformName'],
                'platform_version': self.driver.capabilities['platformVersion'],
                'device_name': self.driver.capabilities['deviceName'],
                'automation_name': self.driver.capabilities['automationName']
            }
        else:  # Android
            return {
                'platform': self.driver.capabilities['platformName'],
                'platform_version': self.driver.capabilities['platformVersion'],
                'device_name': self.driver.capabilities['deviceName'],
                'automation_name': self.driver.capabilities['automationName'],
                'device_manufacturer': self.driver.capabilities.get('deviceManufacturer', 'Unknown'),
                'device_model': self.driver.capabilities.get('deviceModel', 'Unknown')
            }

# Example test class using the framework
class TestMobileApp:
    @pytest.fixture(autouse=True)
    def setup_teardown(self, request):
        """Setup and teardown for each test"""
        platform = request.config.getoption("--platform", default="android")
        device = request.config.getoption("--device", default="emulator")
        app_path = request.config.getoption("--app", default="/path/to/app")

        self.mobile_framework = MobileTestFramework(platform, device, app_path)
        self.driver = self.mobile_framework.start_driver()

        yield

        self.mobile_framework.stop_driver()

    def test_user_login(self):
        """Test user login functionality"""
        # Navigate to login screen
        self.mobile_framework.tap_element_safely(AppiumBy.ID, "login_button")

        # Enter credentials
        self.mobile_framework.enter_text_safely(
            AppiumBy.ID, "email_field", "test@example.com"
        )
        self.mobile_framework.enter_text_safely(
            AppiumBy.ID, "password_field", "password123"
        )

        # Submit login
        self.mobile_framework.tap_element_safely(AppiumBy.ID, "submit_button")

        # Verify successful login
        welcome_element = self.mobile_framework.wait_for_element_visible(
            AppiumBy.ID, "welcome_message", timeout=15
        )
        assert welcome_element is not None, "Login failed - welcome message not found"

    def test_app_navigation(self):
        """Test app navigation flow"""
        # Test tab navigation
        tabs = ["home_tab", "search_tab", "profile_tab"]

        for tab in tabs:
            self.mobile_framework.tap_element_safely(AppiumBy.ID, tab)
            time.sleep(1)  # Allow transition

        # Test swipe navigation
        self.mobile_framework.swipe_screen("left")
        time.sleep(1)
        self.mobile_framework.swipe_screen("right")

    def test_network_error_handling(self):
        """Test app behavior with network issues"""
        # Enable airplane mode (requires device permission)
        self.driver.set_network_connection(0)  # No connection

        # Perform action that requires network
        self.mobile_framework.tap_element_safely(AppiumBy.ID, "refresh_button")

        # Check for proper error handling
        error_message = self.mobile_framework.wait_for_element_visible(
            AppiumBy.ID, "network_error_message", timeout=10
        )
        assert error_message is not None, "Network error not handled properly"

        # Restore network connection
        self.driver.set_network_connection(6)  # WiFi + Data

if __name__ == "__main__":
    # Example usage
    framework = MobileTestFramework("android", "Pixel_8_API_34", "/path/to/app.apk")
    driver = framework.start_driver()

    # Perform test actions
    framework.tap_element_safely(AppiumBy.ID, "login_button")
    device_info = framework.get_device_info()
    print(f"Testing on: {device_info}")

    framework.stop_driver()
```

### Phase 2: Platform-Specific Testing

#### 2.1 iOS-Specific Testing
```swift
// iOS XCUITest Framework Example
import XCTest

class iOSSpecificTests: XCTestCase {
    var app: XCUIApplication!

    override func setUp() {
        super.setUp()
        continueAfterFailure = false
        app = XCUIApplication()

        // Configure app launch arguments
        app.launchArguments.append("--uitesting")
        app.launchEnvironment["UITEST_DISABLE_ANIMATIONS"] = "YES"
        app.launch()
    }

    override func tearDown() {
        app.terminate()
        super.tearDown()
    }

    func testIOSNotificationPermissions() {
        // Test notification permission flow
        let allowButton = app.buttons["Allow"]
        let dontAllowButton = app.buttons["Don't Allow"]

        // Trigger notification permission request
        app.buttons["enable_notifications"].tap()

        // Handle iOS system dialog
        if allowButton.waitForExistence(timeout: 5) {
            allowButton.tap()
        }

        // Verify permission granted
        XCTAssertTrue(app.staticTexts["notifications_enabled"].exists)
    }

    func testIOSLocationPermissions() {
        // Test location permission handling
        app.buttons["request_location"].tap()

        let allowOnceButton = app.buttons["Allow Once"]
        let allowWhileUsingButton = app.buttons["Allow While Using App"]
        let dontAllowButton = app.buttons["Don't Allow"]

        if allowWhileUsingButton.waitForExistence(timeout: 5) {
            allowWhileUsingButton.tap()
        }

        // Verify location access
        XCTAssertTrue(app.staticTexts["location_access_granted"].exists)
    }

    func testIOSAppStoreGuidelines() {
        // Test compliance with iOS App Store guidelines

        // Check for required privacy policy link
        app.buttons["settings"].tap()
        XCTAssertTrue(app.buttons["privacy_policy"].exists,
                     "Privacy policy link required for App Store")

        // Check for terms of service
        XCTAssertTrue(app.buttons["terms_of_service"].exists,
                     "Terms of service required for App Store")

        // Test that app handles interruptions properly
        testPhoneCallInterruption()
    }

    func testIOSAccessibility() {
        // Test VoiceOver compatibility
        let mainButton = app.buttons["main_action"]
        XCTAssertNotEqual(mainButton.label, "",
                         "Button must have accessibility label")
        XCTAssertTrue(mainButton.isAccessibilityElement,
                     "Interactive elements must be accessible")

        // Test Dynamic Type support
        // This would require UI verification at different text sizes
        testDynamicTypeSupport()
    }

    func testIOSBackgroundModes() {
        // Test app behavior when backgrounded
        XCUIDevice.shared.press(.home)

        // Wait for background
        Thread.sleep(forTimeInterval: 2)

        // Reactivate app
        app.activate()

        // Verify app state preserved
        XCTAssertTrue(app.staticTexts["app_active"].exists)
    }

    func testIOSKeyboardHandling() {
        // Test keyboard appearance and dismissal
        let textField = app.textFields["search_field"]
        textField.tap()

        // Verify keyboard appears
        XCTAssertTrue(app.keyboards.firstMatch.exists)

        // Test keyboard dismissal
        textField.typeText("test search\\n")

        // Verify keyboard dismissed
        XCTAssertFalse(app.keyboards.firstMatch.exists)
    }

    func testIOSRotationHandling() {
        // Test rotation support
        XCUIDevice.shared.orientation = .landscapeLeft

        // Verify UI adapts to landscape
        XCTAssertTrue(app.staticTexts["landscape_mode"].exists)

        // Rotate back
        XCUIDevice.shared.orientation = .portrait

        // Verify UI adapts to portrait
        XCTAssertTrue(app.staticTexts["portrait_mode"].exists)
    }

    private func testPhoneCallInterruption() {
        // Simulate phone call interruption
        // This requires actual device testing
    }

    private func testDynamicTypeSupport() {
        // Test different text sizes
        // Requires accessibility settings manipulation
    }
}

// iOS Performance Testing Extension
extension iOSSpecificTests {
    func testIOSMemoryUsage() {
        // Monitor memory usage during test
        let startMemory = getMemoryUsage()

        // Perform memory-intensive operations
        for _ in 0..<100 {
            app.buttons["load_data"].tap()
            app.buttons["clear_data"].tap()
        }

        let endMemory = getMemoryUsage()
        let memoryIncrease = endMemory - startMemory

        // Assert memory increase is within acceptable limits
        XCTAssertLessThan(memoryIncrease, 50.0,
                         "Memory usage increased by more than 50MB")
    }

    private func getMemoryUsage() -> Double {
        // Implementation to get memory usage
        // Would use iOS-specific APIs
        return 0.0
    }
}
```

#### 2.2 Android-Specific Testing
```java
// Android Espresso Test Framework Example
package com.example.androidtests;

import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.rule.ActivityTestRule;
import androidx.test.rule.GrantPermissionRule;
import androidx.test.uiautomator.UiDevice;
import androidx.test.uiautomator.UiObject;
import androidx.test.uiautomator.UiSelector;

import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.action.ViewActions.click;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.matcher.ViewMatchers.isDisplayed;
import static androidx.test.espresso.matcher.ViewMatchers.withId;
import static androidx.test.platform.app.InstrumentationRegistry.getInstrumentation;

@RunWith(AndroidJUnit4.class)
public class AndroidSpecificTests {

    @Rule
    public ActivityTestRule<MainActivity> activityRule =
        new ActivityTestRule<>(MainActivity.class);

    @Rule
    public GrantPermissionRule permissionRule =
        GrantPermissionRule.grant(android.Manifest.permission.CAMERA,
                                android.Manifest.permission.ACCESS_FINE_LOCATION);

    @Test
    public void testAndroidPermissionHandling() {
        // Test runtime permissions (Android 6.0+)
        onView(withId(R.id.request_camera_permission)).perform(click());

        UiDevice device = UiDevice.getInstance(getInstrumentation());

        // Handle system permission dialog
        UiObject allowButton = device.findObject(
            new UiSelector().text("Allow").className("android.widget.Button"));

        if (allowButton.exists()) {
            try {
                allowButton.click();
            } catch (Exception e) {
                // Handle permission dialog interaction failure
            }
        }

        // Verify permission granted
        onView(withId(R.id.camera_permission_granted))
            .check(matches(isDisplayed()));
    }

    @Test
    public void testAndroidBackButtonHandling() {
        // Navigate through app
        onView(withId(R.id.open_settings)).perform(click());
        onView(withId(R.id.settings_screen)).check(matches(isDisplayed()));

        // Test back button behavior
        UiDevice device = UiDevice.getInstance(getInstrumentation());
        device.pressBack();

        // Verify returned to main screen
        onView(withId(R.id.main_screen)).check(matches(isDisplayed()));
    }

    @Test
    public void testAndroidIntentHandling() {
        // Test sharing intent
        onView(withId(R.id.share_button)).perform(click());

        UiDevice device = UiDevice.getInstance(getInstrumentation());

        // Verify share dialog appears
        UiObject shareDialog = device.findObject(
            new UiSelector().textContains("Share"));
        assertTrue("Share dialog should appear", shareDialog.exists());

        // Cancel sharing
        device.pressBack();
    }

    @Test
    public void testAndroidNotificationHandling() {
        // Trigger notification
        onView(withId(R.id.send_notification)).perform(click());

        UiDevice device = UiDevice.getInstance(getInstrumentation());

        // Open notification panel
        device.openNotification();

        // Verify notification appears
        UiObject notification = device.findObject(
            new UiSelector().textContains("Test Notification"));
        assertTrue("Notification should appear", notification.exists());

        // Clear notification
        device.pressBack(); // Close notification panel
    }

    @Test
    public void testAndroidMultiWindowSupport() {
        // Test multi-window mode (Android 7.0+)
        UiDevice device = UiDevice.getInstance(getInstrumentation());

        // Enter multi-window mode
        try {
            device.executeShellCommand("input keyevent KEYCODE_APP_SWITCH");
            Thread.sleep(1000);
            device.executeShellCommand("input keyevent KEYCODE_DPAD_DOWN");
            device.executeShellCommand("input keyevent KEYCODE_ENTER");
        } catch (Exception e) {
            // Handle multi-window setup failure
        }

        // Verify app continues to function in multi-window
        onView(withId(R.id.main_content)).check(matches(isDisplayed()));
    }

    @Test
    public void testAndroidAccessibilityServices() {
        // Test TalkBack compatibility

        // Verify content descriptions are present
        onView(withId(R.id.main_button))
            .check(matches(hasContentDescription()));

        // Test focus navigation
        onView(withId(R.id.main_button)).perform(click());

        // Verify accessibility announcements
        // This would require accessibility service interaction
    }

    @Test
    public void testAndroidBatteryOptimization() {
        // Test app behavior under battery optimization
        UiDevice device = UiDevice.getInstance(getInstrumentation());

        try {
            // Simulate battery saver mode
            device.executeShellCommand("settings put global low_power 1");

            // Test app functionality under battery constraints
            onView(withId(R.id.background_sync)).perform(click());

            // Verify graceful handling of battery restrictions
            onView(withId(R.id.sync_status))
                .check(matches(withText("Sync paused for battery saving")));

            // Restore normal battery mode
            device.executeShellCommand("settings put global low_power 0");

        } catch (Exception e) {
            // Handle battery optimization testing failure
        }
    }

    @Test
    public void testAndroidDataSaverMode() {
        // Test app behavior under data saver mode
        UiDevice device = UiDevice.getInstance(getInstrumentation());

        try {
            // Enable data saver
            device.executeShellCommand("cmd netpolicy set restrict-background true");

            // Test network operations
            onView(withId(R.id.load_images)).perform(click());

            // Verify appropriate handling of data restrictions
            onView(withId(R.id.data_saver_message))
                .check(matches(isDisplayed()));

            // Disable data saver
            device.executeShellCommand("cmd netpolicy set restrict-background false");

        } catch (Exception e) {
            // Handle data saver testing failure
        }
    }

    // Helper method to check content description
    private static Matcher<View> hasContentDescription() {
        return new TypeSafeMatcher<View>() {
            @Override
            public void describeTo(Description description) {
                description.appendText("has content description");
            }

            @Override
            public boolean matchesSafely(View view) {
                CharSequence contentDescription = view.getContentDescription();
                return contentDescription != null &&
                       contentDescription.length() > 0;
            }
        };
    }
}
```

### Phase 3: Mobile Performance Testing

#### 3.1 Mobile Performance Monitoring Framework
```python
#!/usr/bin/env python3
"""
Mobile Performance Testing Framework
Monitors performance metrics during mobile testing
"""

import time
import json
import subprocess
import psutil
from appium import webdriver
from datetime import datetime

class MobilePerformanceMonitor:
    def __init__(self, platform: str, device_udid: str):
        self.platform = platform.lower()
        self.device_udid = device_udid
        self.performance_data = []
        self.monitoring = False

    def start_monitoring(self, interval: int = 5):
        """Start performance monitoring"""
        self.monitoring = True

        while self.monitoring:
            metrics = self.collect_performance_metrics()
            if metrics:
                self.performance_data.append({
                    'timestamp': datetime.now().isoformat(),
                    'metrics': metrics
                })
            time.sleep(interval)

    def stop_monitoring(self):
        """Stop performance monitoring"""
        self.monitoring = False

    def collect_performance_metrics(self):
        """Collect platform-specific performance metrics"""
        if self.platform == 'ios':
            return self._collect_ios_metrics()
        elif self.platform == 'android':
            return self._collect_android_metrics()
        else:
            return None

    def _collect_ios_metrics(self):
        """Collect iOS performance metrics using instruments"""
        try:
            # CPU Usage
            cpu_cmd = f"xcrun simctl spawn {self.device_udid} top -l 1 -pid"
            cpu_result = subprocess.run(cpu_cmd, shell=True, capture_output=True, text=True)

            # Memory Usage
            memory_cmd = f"xcrun simctl spawn {self.device_udid} vm_stat"
            memory_result = subprocess.run(memory_cmd, shell=True, capture_output=True, text=True)

            # Network Usage (requires additional setup)
            network_cmd = f"xcrun simctl spawn {self.device_udid} netstat -i"
            network_result = subprocess.run(network_cmd, shell=True, capture_output=True, text=True)

            return {
                'cpu_usage': self._parse_ios_cpu(cpu_result.stdout),
                'memory_usage': self._parse_ios_memory(memory_result.stdout),
                'network_usage': self._parse_ios_network(network_result.stdout),
                'battery_level': self._get_ios_battery_level(),
                'fps': self._get_ios_fps()
            }

        except Exception as e:
            print(f"Error collecting iOS metrics: {e}")
            return None

    def _collect_android_metrics(self):
        """Collect Android performance metrics using ADB"""
        try:
            # CPU Usage
            cpu_cmd = f"adb -s {self.device_udid} shell dumpsys cpuinfo"
            cpu_result = subprocess.run(cpu_cmd, shell=True, capture_output=True, text=True)

            # Memory Usage
            memory_cmd = f"adb -s {self.device_udid} shell dumpsys meminfo"
            memory_result = subprocess.run(memory_cmd, shell=True, capture_output=True, text=True)

            # Battery Usage
            battery_cmd = f"adb -s {self.device_udid} shell dumpsys battery"
            battery_result = subprocess.run(battery_cmd, shell=True, capture_output=True, text=True)

            # Network Usage
            network_cmd = f"adb -s {self.device_udid} shell dumpsys netstats"
            network_result = subprocess.run(network_cmd, shell=True, capture_output=True, text=True)

            # GPU Usage (Android 6.0+)
            gpu_cmd = f"adb -s {self.device_udid} shell dumpsys gpu"
            gpu_result = subprocess.run(gpu_cmd, shell=True, capture_output=True, text=True)

            return {
                'cpu_usage': self._parse_android_cpu(cpu_result.stdout),
                'memory_usage': self._parse_android_memory(memory_result.stdout),
                'battery_level': self._parse_android_battery(battery_result.stdout),
                'network_usage': self._parse_android_network(network_result.stdout),
                'gpu_usage': self._parse_android_gpu(gpu_result.stdout),
                'fps': self._get_android_fps()
            }

        except Exception as e:
            print(f"Error collecting Android metrics: {e}")
            return None

    def _parse_android_cpu(self, cpu_output: str) -> dict:
        """Parse Android CPU usage from dumpsys output"""
        lines = cpu_output.split('\n')
        cpu_data = {'total_usage': 0, 'app_usage': 0}

        for line in lines:
            if 'Total CPU usage' in line:
                # Extract percentage from line like "Total CPU usage: 25%"
                try:
                    cpu_data['total_usage'] = float(line.split(':')[1].strip().replace('%', ''))
                except:
                    pass
            elif 'com.example.testapp' in line:  # Replace with actual app package
                try:
                    # Extract app-specific CPU usage
                    parts = line.split()
                    for part in parts:
                        if '%' in part:
                            cpu_data['app_usage'] = float(part.replace('%', ''))
                            break
                except:
                    pass

        return cpu_data

    def _parse_android_memory(self, memory_output: str) -> dict:
        """Parse Android memory usage from dumpsys output"""
        lines = memory_output.split('\n')
        memory_data = {'total_pss': 0, 'total_private_dirty': 0, 'heap_size': 0}

        for line in lines:
            if 'TOTAL PSS:' in line:
                try:
                    memory_data['total_pss'] = int(line.split(':')[1].strip().split()[0])
                except:
                    pass
            elif 'Total Private Dirty:' in line:
                try:
                    memory_data['total_private_dirty'] = int(line.split(':')[1].strip().split()[0])
                except:
                    pass
            elif 'Heap Size:' in line:
                try:
                    memory_data['heap_size'] = int(line.split(':')[1].strip().split()[0])
                except:
                    pass

        return memory_data

    def _parse_android_battery(self, battery_output: str) -> dict:
        """Parse Android battery information"""
        lines = battery_output.split('\n')
        battery_data = {'level': 100, 'temperature': 0, 'voltage': 0}

        for line in lines:
            if 'level:' in line:
                try:
                    battery_data['level'] = int(line.split(':')[1].strip())
                except:
                    pass
            elif 'temperature:' in line:
                try:
                    battery_data['temperature'] = int(line.split(':')[1].strip()) / 10  # Convert to Celsius
                except:
                    pass
            elif 'voltage:' in line:
                try:
                    battery_data['voltage'] = int(line.split(':')[1].strip())
                except:
                    pass

        return battery_data

    def _get_android_fps(self) -> float:
        """Get Android FPS using gfxinfo"""
        try:
            cmd = f"adb -s {self.device_udid} shell dumpsys gfxinfo com.example.testapp"
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)

            # Parse FPS from gfxinfo output
            lines = result.stdout.split('\n')
            for line in lines:
                if 'Janky frames:' in line:
                    # Calculate FPS based on frame timing
                    # This is a simplified calculation
                    return 60.0  # Placeholder

            return 0.0
        except:
            return 0.0

    def generate_performance_report(self, output_file: str = 'mobile_performance_report.json'):
        """Generate performance test report"""
        if not self.performance_data:
            return "No performance data collected"

        # Calculate averages and trends
        avg_metrics = self._calculate_average_metrics()
        performance_trends = self._analyze_performance_trends()

        report = {
            'test_summary': {
                'platform': self.platform,
                'device_udid': self.device_udid,
                'test_duration': len(self.performance_data) * 5,  # Assuming 5-second intervals
                'data_points': len(self.performance_data)
            },
            'average_metrics': avg_metrics,
            'performance_trends': performance_trends,
            'detailed_data': self.performance_data,
            'recommendations': self._generate_performance_recommendations(avg_metrics)
        }

        with open(output_file, 'w') as f:
            json.dump(report, f, indent=2)

        return output_file

    def _calculate_average_metrics(self) -> dict:
        """Calculate average performance metrics"""
        if not self.performance_data:
            return {}

        totals = {}
        count = len(self.performance_data)

        for data_point in self.performance_data:
            metrics = data_point['metrics']
            for key, value in metrics.items():
                if isinstance(value, dict):
                    if key not in totals:
                        totals[key] = {}
                    for sub_key, sub_value in value.items():
                        if isinstance(sub_value, (int, float)):
                            if sub_key not in totals[key]:
                                totals[key][sub_key] = 0
                            totals[key][sub_key] += sub_value
                elif isinstance(value, (int, float)):
                    if key not in totals:
                        totals[key] = 0
                    totals[key] += value

        # Calculate averages
        averages = {}
        for key, value in totals.items():
            if isinstance(value, dict):
                averages[key] = {}
                for sub_key, sub_value in value.items():
                    averages[key][sub_key] = sub_value / count
            else:
                averages[key] = value / count

        return averages

    def _analyze_performance_trends(self) -> dict:
        """Analyze performance trends over time"""
        if len(self.performance_data) < 2:
            return {}

        # Compare first and last data points to identify trends
        first_metrics = self.performance_data[0]['metrics']
        last_metrics = self.performance_data[-1]['metrics']

        trends = {}

        # Analyze CPU trend
        if 'cpu_usage' in first_metrics and 'cpu_usage' in last_metrics:
            first_cpu = first_metrics['cpu_usage'].get('total_usage', 0)
            last_cpu = last_metrics['cpu_usage'].get('total_usage', 0)
            cpu_change = last_cpu - first_cpu
            trends['cpu_usage'] = {
                'change': cpu_change,
                'trend': 'increasing' if cpu_change > 5 else 'decreasing' if cpu_change < -5 else 'stable'
            }

        # Analyze memory trend
        if 'memory_usage' in first_metrics and 'memory_usage' in last_metrics:
            first_memory = first_metrics['memory_usage'].get('total_pss', 0)
            last_memory = last_metrics['memory_usage'].get('total_pss', 0)
            memory_change = last_memory - first_memory
            trends['memory_usage'] = {
                'change': memory_change,
                'trend': 'increasing' if memory_change > 10000 else 'decreasing' if memory_change < -10000 else 'stable'
            }

        return trends

    def _generate_performance_recommendations(self, avg_metrics: dict) -> list:
        """Generate performance optimization recommendations"""
        recommendations = []

        # CPU recommendations
        if 'cpu_usage' in avg_metrics:
            avg_cpu = avg_metrics['cpu_usage'].get('total_usage', 0)
            if avg_cpu > 80:
                recommendations.append("High CPU usage detected. Consider optimizing computationally intensive operations.")
            elif avg_cpu > 60:
                recommendations.append("Moderate CPU usage. Monitor for optimization opportunities.")

        # Memory recommendations
        if 'memory_usage' in avg_metrics:
            avg_memory = avg_metrics['memory_usage'].get('total_pss', 0)
            if avg_memory > 500000:  # 500MB
                recommendations.append("High memory usage detected. Review memory management and potential leaks.")
            elif avg_memory > 300000:  # 300MB
                recommendations.append("Moderate memory usage. Consider memory optimization strategies.")

        # Battery recommendations
        if 'battery_level' in avg_metrics:
            # This would require longer-term monitoring to be meaningful
            recommendations.append("Monitor battery usage over extended periods for comprehensive analysis.")

        if not recommendations:
            recommendations.append("Performance metrics within acceptable ranges. Continue monitoring.")

        return recommendations

# Usage example for performance testing
if __name__ == "__main__":
    import threading

    # Initialize performance monitor
    monitor = MobilePerformanceMonitor("android", "emulator-5554")

    # Start monitoring in background thread
    monitoring_thread = threading.Thread(target=monitor.start_monitoring, args=(2,))
    monitoring_thread.daemon = True
    monitoring_thread.start()

    # Simulate test execution
    print("Running performance test for 30 seconds...")
    time.sleep(30)

    # Stop monitoring
    monitor.stop_monitoring()
    monitoring_thread.join(timeout=1)

    # Generate report
    report_file = monitor.generate_performance_report()
    print(f"Performance report generated: {report_file}")
```

### Phase 4: Mobile Accessibility Testing

#### 4.1 Accessibility Testing Framework
```python
#!/usr/bin/env python3
"""
Mobile Accessibility Testing Framework
Automated accessibility testing for mobile applications
"""

from appium import webdriver
from appium.webdriver.common.appiumby import AppiumBy
import time
import json

class MobileAccessibilityTester:
    def __init__(self, platform: str, device_name: str, app_path: str):
        self.platform = platform.lower()
        self.device_name = device_name
        self.app_path = app_path
        self.driver = None
        self.accessibility_issues = []

    def setup_driver(self):
        """Setup Appium driver with accessibility capabilities"""
        if self.platform == 'ios':
            capabilities = {
                'platformName': 'iOS',
                'deviceName': self.device_name,
                'app': self.app_path,
                'automationName': 'XCUITest',
                'shouldUseTestManagerForVisibilityDetection': False,
                'enableVoiceOver': True  # Enable VoiceOver for testing
            }
        else:  # Android
            capabilities = {
                'platformName': 'Android',
                'deviceName': self.device_name,
                'app': self.app_path,
                'automationName': 'UiAutomator2',
                'enableTalkback': True  # Enable TalkBack for testing
            }

        self.driver = webdriver.Remote('http://localhost:4723/wd/hub', capabilities)

    def test_accessibility_labels(self):
        """Test for proper accessibility labels"""
        print("Testing accessibility labels...")

        # Find all interactive elements
        interactive_elements = self.driver.find_elements(AppiumBy.XPATH,
            "//android.widget.Button | //android.widget.ImageButton | "
            "//android.widget.EditText | //android.widget.CheckBox | "
            "//android.widget.RadioButton")

        for element in interactive_elements:
            # Check for accessibility label/content description
            if self.platform == 'ios':
                label = element.get_attribute('label')
                if not label or label.strip() == '':
                    self.accessibility_issues.append({
                        'type': 'Missing Accessibility Label',
                        'severity': 'High',
                        'element': element.get_attribute('name'),
                        'description': 'Interactive element lacks accessibility label'
                    })
            else:  # Android
                content_desc = element.get_attribute('content-desc')
                text = element.get_attribute('text')

                if not content_desc and not text:
                    self.accessibility_issues.append({
                        'type': 'Missing Content Description',
                        'severity': 'High',
                        'element': element.get_attribute('resource-id'),
                        'description': 'Interactive element lacks content description'
                    })

    def test_color_contrast(self):
        """Test color contrast ratios (simplified)"""
        print("Testing color contrast...")

        # This is a simplified example - real implementation would:
        # 1. Take screenshots
        # 2. Analyze pixel colors
        # 3. Calculate contrast ratios
        # 4. Compare against WCAG guidelines (4.5:1 for normal text, 3:1 for large text)

        # For now, we'll check for obvious issues
        elements_to_check = self.driver.find_elements(AppiumBy.XPATH,
            "//android.widget.TextView | //android.widget.Button")

        for element in elements_to_check:
            # In a real implementation, you would:
            # - Get element colors
            # - Calculate contrast ratio
            # - Compare against WCAG standards

            # Placeholder check
            text = element.get_attribute('text')
            if text and len(text) > 0:
                # This would be replaced with actual contrast calculation
                contrast_ratio = 4.5  # Placeholder value

                if contrast_ratio < 4.5:  # WCAG AA standard
                    self.accessibility_issues.append({
                        'type': 'Low Color Contrast',
                        'severity': 'Medium',
                        'element': text[:50],
                        'contrast_ratio': contrast_ratio,
                        'description': f'Text has low contrast ratio: {contrast_ratio}:1'
                    })

    def test_touch_target_size(self):
        """Test touch target sizes meet accessibility guidelines"""
        print("Testing touch target sizes...")

        # WCAG guidelines recommend minimum 44x44 points (iOS) or 48x48 dp (Android)
        min_size = 44 if self.platform == 'ios' else 48

        interactive_elements = self.driver.find_elements(AppiumBy.XPATH,
            "//android.widget.Button | //android.widget.ImageButton | "
            "//android.widget.CheckBox | //android.widget.RadioButton")

        for element in interactive_elements:
            size = element.size
            width = size['width']
            height = size['height']

            if width < min_size or height < min_size:
                self.accessibility_issues.append({
                    'type': 'Small Touch Target',
                    'severity': 'Medium',
                    'element': element.get_attribute('resource-id') or element.get_attribute('name'),
                    'size': f'{width}x{height}',
                    'description': f'Touch target too small: {width}x{height} (minimum: {min_size}x{min_size})'
                })

    def test_screen_reader_navigation(self):
        """Test screen reader navigation flow"""
        print("Testing screen reader navigation...")

        if self.platform == 'ios':
            self._test_voiceover_navigation()
        else:
            self._test_talkback_navigation()

    def _test_voiceover_navigation(self):
        """Test VoiceOver navigation on iOS"""
        # Enable VoiceOver gestures
        # Note: This requires actual device testing with VoiceOver enabled

        try:
            # Simulate VoiceOver swipe right gesture
            size = self.driver.get_window_size()
            start_x = size['width'] * 0.8
            start_y = size['height'] * 0.5
            end_x = size['width'] * 0.2
            end_y = size['height'] * 0.5

            # Perform swipe gesture to navigate between elements
            self.driver.swipe(start_x, start_y, end_x, end_y, 500)

            # Check if focus moved to next element
            # This would require VoiceOver API integration

        except Exception as e:
            self.accessibility_issues.append({
                'type': 'VoiceOver Navigation Issue',
                'severity': 'High',
                'description': f'VoiceOver navigation failed: {str(e)}'
            })

    def _test_talkback_navigation(self):
        """Test TalkBack navigation on Android"""
        # Enable TalkBack gestures
        # Note: This requires actual device testing with TalkBack enabled

        try:
            # Simulate TalkBack swipe gesture
            size = self.driver.get_window_size()
            start_x = size['width'] * 0.2
            start_y = size['height'] * 0.5
            end_x = size['width'] * 0.8
            end_y = size['height'] * 0.5

            # Perform swipe gesture to navigate between elements
            self.driver.swipe(start_x, start_y, end_x, end_y, 500)

            # Check if focus moved to next element
            # This would require TalkBack API integration

        except Exception as e:
            self.accessibility_issues.append({
                'type': 'TalkBack Navigation Issue',
                'severity': 'High',
                'description': f'TalkBack navigation failed: {str(e)}'
            })

    def test_dynamic_text_support(self):
        """Test dynamic text size support"""
        print("Testing dynamic text support...")

        if self.platform == 'ios':
            # Test iOS Dynamic Type
            self._test_dynamic_type()
        else:
            # Test Android font scaling
            self._test_android_font_scaling()

    def _test_dynamic_type(self):
        """Test iOS Dynamic Type support"""
        # This would require iOS-specific APIs to change text size
        # and verify UI adapts properly

        original_elements = self.driver.find_elements(AppiumBy.XPATH, "//XCUIElementTypeStaticText")

        # In a real implementation, you would:
        # 1. Change system text size setting
        # 2. Refresh the app
        # 3. Verify text scales appropriately
        # 4. Check that UI doesn't break

        # For now, just check if text elements exist
        if not original_elements:
            self.accessibility_issues.append({
                'type': 'Dynamic Type Issue',
                'severity': 'Medium',
                'description': 'No text elements found for Dynamic Type testing'
            })

    def _test_android_font_scaling(self):
        """Test Android font scaling support"""
        # This would require Android-specific commands to change font scale
        # and verify UI adapts properly

        try:
            # Get current font scale
            result = self.driver.execute_script("mobile: shell", {
                "command": "settings get system font_scale"
            })

            original_scale = float(result) if result else 1.0

            # Test with larger font scale
            self.driver.execute_script("mobile: shell", {
                "command": "settings put system font_scale 1.5"
            })

            # Refresh app to apply changes
            self.driver.background_app(1)

            # Check if UI still functions properly
            # This would involve more detailed UI verification

            # Restore original font scale
            self.driver.execute_script("mobile: shell", {
                "command": f"settings put system font_scale {original_scale}"
            })

        except Exception as e:
            self.accessibility_issues.append({
                'type': 'Font Scaling Issue',
                'severity': 'Medium',
                'description': f'Font scaling test failed: {str(e)}'
            })

    def run_accessibility_audit(self):
        """Run complete accessibility audit"""
        print("Starting mobile accessibility audit...")

        self.setup_driver()

        try:
            # Run all accessibility tests
            self.test_accessibility_labels()
            self.test_color_contrast()
            self.test_touch_target_size()
            self.test_screen_reader_navigation()
            self.test_dynamic_text_support()

        finally:
            if self.driver:
                self.driver.quit()

        return self.generate_accessibility_report()

    def generate_accessibility_report(self):
        """Generate accessibility test report"""
        if not self.accessibility_issues:
            return {
                'status': 'PASS',
                'message': 'No accessibility issues found',
                'issues': []
            }

        # Categorize issues by severity
        critical_issues = [issue for issue in self.accessibility_issues if issue['severity'] == 'Critical']
        high_issues = [issue for issue in self.accessibility_issues if issue['severity'] == 'High']
        medium_issues = [issue for issue in self.accessibility_issues if issue['severity'] == 'Medium']
        low_issues = [issue for issue in self.accessibility_issues if issue['severity'] == 'Low']

        report = {
            'status': 'FAIL' if critical_issues or high_issues else 'WARNING',
            'summary': {
                'total_issues': len(self.accessibility_issues),
                'critical': len(critical_issues),
                'high': len(high_issues),
                'medium': len(medium_issues),
                'low': len(low_issues)
            },
            'issues': self.accessibility_issues,
            'recommendations': self._generate_accessibility_recommendations()
        }

        return report

    def _generate_accessibility_recommendations(self):
        """Generate accessibility improvement recommendations"""
        recommendations = []

        # Count issue types
        issue_types = {}
        for issue in self.accessibility_issues:
            issue_type = issue['type']
            issue_types[issue_type] = issue_types.get(issue_type, 0) + 1

        # Generate recommendations based on common issues
        if 'Missing Accessibility Label' in issue_types or 'Missing Content Description' in issue_types:
            recommendations.append(
                "Add meaningful accessibility labels/content descriptions to all interactive elements"
            )

        if 'Low Color Contrast' in issue_types:
            recommendations.append(
                "Improve color contrast ratios to meet WCAG AA standards (4.5:1 for normal text)"
            )

        if 'Small Touch Target' in issue_types:
            recommendations.append(
                "Increase touch target sizes to minimum 44x44 points (iOS) or 48x48 dp (Android)"
            )

        if any('Navigation' in issue_type for issue_type in issue_types):
            recommendations.append(
                "Test and improve screen reader navigation flow"
            )

        if not recommendations:
            recommendations.append("Continue monitoring accessibility compliance")

        return recommendations

# Usage example
if __name__ == "__main__":
    tester = MobileAccessibilityTester("android", "Pixel_8_API_34", "/path/to/app.apk")
    report = tester.run_accessibility_audit()

    print("Accessibility Audit Report:")
    print(json.dumps(report, indent=2))
```

## Tools and Technologies

### Mobile Testing Tools Ecosystem

#### Device Cloud Platforms
| Platform | Features | Pricing | Best For |
|----------|----------|---------|----------|
| **BrowserStack** | 3000+ devices, Real devices | $29+/month | Cross-platform testing |
| **Sauce Labs** | Real & virtual devices | $39+/month | CI/CD integration |
| **Firebase Test Lab** | Google devices, Free tier | Free + usage | Android testing |
| **AWS Device Farm** | Pay-per-use, Real devices | $0.17/minute | AWS ecosystem |
| **Perfecto** | Enterprise features | Enterprise | Large organizations |

#### Mobile Automation Frameworks
| Framework | Platform Support | Language | Strengths |
|-----------|-----------------|----------|-----------|
| **Appium** | iOS, Android, Windows | Multi-language | Cross-platform, Open source |
| **Espresso** | Android only | Java, Kotlin | Fast, Reliable |
| **XCUITest** | iOS only | Swift, Objective-C | Native iOS support |
| **Detox** | iOS, Android | JavaScript | React Native apps |
| **Maestro** | iOS, Android | YAML | Simple syntax |

## Common Challenges

### Mobile Testing Implementation Challenges

#### 1. Device Fragmentation Management
**Challenge**: Testing across thousands of device/OS combinations

**Solution Framework:**
```python
#!/usr/bin/env python3
"""
Device Fragmentation Strategy Manager
Optimizes device coverage based on market data and risk assessment
"""

import json
import requests
from typing import List, Dict

class DeviceFragmentationManager:
    def __init__(self, market_data_source: str = "internal"):
        self.market_data_source = market_data_source
        self.device_priorities = {}
        self.coverage_strategy = {}

    def analyze_market_share(self, region: str = "global") -> Dict:
        """Analyze device market share for targeted testing"""
        # This would integrate with market research APIs
        # Using mock data for example

        market_data = {
            "ios": {
                "iPhone 15": 15.2,
                "iPhone 14": 12.8,
                "iPhone 13": 11.5,
                "iPhone 12": 9.3,
                "iPhone SE": 6.1,
                "iPad Pro": 3.2,
                "iPad Air": 2.8
            },
            "android": {
                "Samsung Galaxy S24": 8.9,
                "Samsung Galaxy S23": 7.2,
                "Google Pixel 8": 4.5,
                "Samsung Galaxy A54": 6.8,
                "OnePlus 11": 3.1,
                "Xiaomi 13": 4.2,
                "Samsung Galaxy Tab": 2.1
            }
        }

        return market_data

    def calculate_device_priority(self, market_data: Dict) -> Dict:
        """Calculate device testing priority based on multiple factors"""
        priorities = {}

        # Factors for priority calculation
        factors = {
            'market_share_weight': 0.4,
            'business_impact_weight': 0.3,
            'technical_complexity_weight': 0.2,
            'support_cost_weight': 0.1
        }

        # Business-critical devices (configurable)
        business_critical = {
            "iPhone 15": 1.0,
            "iPhone 14": 0.9,
            "Samsung Galaxy S24": 1.0,
            "Samsung Galaxy S23": 0.8
        }

        # Technical complexity scores (higher = more complex/important to test)
        technical_complexity = {
            "iPhone 15": 0.9,  # New features, edge cases
            "iPhone SE": 0.7,   # Different screen size
            "Samsung Galaxy S24": 0.9,
            "Samsung Galaxy A54": 0.6,  # Mid-range device constraints
            "Google Pixel 8": 0.8      # Stock Android
        }

        for platform, devices in market_data.items():
            priorities[platform] = {}

            for device, market_share in devices.items():
                # Normalize market share (0-1)
                normalized_market_share = min(market_share / 20.0, 1.0)

                # Get business impact score
                business_impact = business_critical.get(device, 0.5)

                # Get technical complexity score
                tech_complexity = technical_complexity.get(device, 0.5)

                # Support cost (inverse of market share - rare devices cost more to support)
                support_cost = 1.0 - normalized_market_share

                # Calculate weighted priority score
                priority_score = (
                    normalized_market_share * factors['market_share_weight'] +
                    business_impact * factors['business_impact_weight'] +
                    tech_complexity * factors['technical_complexity_weight'] +
                    support_cost * factors['support_cost_weight']
                )

                priorities[platform][device] = {
                    'priority_score': priority_score,
                    'market_share': market_share,
                    'business_impact': business_impact,
                    'technical_complexity': tech_complexity,
                    'recommended_testing_frequency': self._get_testing_frequency(priority_score)
                }

        return priorities

    def _get_testing_frequency(self, priority_score: float) -> str:
        """Determine testing frequency based on priority score"""
        if priority_score >= 0.8:
            return "Every build"
        elif priority_score >= 0.6:
            return "Daily"
        elif priority_score >= 0.4:
            return "Weekly"
        else:
            return "Monthly"

    def generate_coverage_strategy(self, priorities: Dict, budget_constraints: Dict) -> Dict:
        """Generate optimal device coverage strategy"""

        max_devices = budget_constraints.get('max_devices', 20)
        max_cost = budget_constraints.get('max_monthly_cost', 5000)

        # Device costs (mock data - would come from cloud provider APIs)
        device_costs = {
            "iPhone 15": 50,
            "iPhone 14": 45,
            "Samsung Galaxy S24": 48,
            "Samsung Galaxy S23": 42,
            "Google Pixel 8": 40
        }

        strategy = {
            'tier_1_devices': [],  # Must test - every build
            'tier_2_devices': [],  # Should test - weekly
            'tier_3_devices': [],  # Nice to test - monthly
            'total_estimated_cost': 0
        }

        # Flatten and sort devices by priority
        all_devices = []
        for platform, devices in priorities.items():
            for device, data in devices.items():
                all_devices.append({
                    'platform': platform,
                    'device': device,
                    'priority_score': data['priority_score'],
                    'cost': device_costs.get(device, 35)
                })

        all_devices.sort(key=lambda x: x['priority_score'], reverse=True)

        current_cost = 0
        device_count = 0

        for device_info in all_devices:
            if device_count >= max_devices or current_cost + device_info['cost'] > max_cost:
                break

            device_entry = {
                'device': device_info['device'],
                'platform': device_info['platform'],
                'priority_score': device_info['priority_score'],
                'monthly_cost': device_info['cost']
            }

            if device_info['priority_score'] >= 0.8:
                strategy['tier_1_devices'].append(device_entry)
            elif device_info['priority_score'] >= 0.6:
                strategy['tier_2_devices'].append(device_entry)
            else:
                strategy['tier_3_devices'].append(device_entry)

            current_cost += device_info['cost']
            device_count += 1

        strategy['total_estimated_cost'] = current_cost
        strategy['device_count'] = device_count
        strategy['coverage_percentage'] = self._calculate_coverage_percentage(strategy, priorities)

        return strategy

    def _calculate_coverage_percentage(self, strategy: Dict, priorities: Dict) -> float:
        """Calculate market coverage percentage"""
        covered_market_share = 0
        total_market_share = 0

        # Get all selected devices
        selected_devices = []
        for tier in ['tier_1_devices', 'tier_2_devices', 'tier_3_devices']:
            selected_devices.extend([d['device'] for d in strategy[tier]])

        # Calculate coverage
        for platform, devices in priorities.items():
            for device, data in devices.items():
                total_market_share += data['market_share']
                if device in selected_devices:
                    covered_market_share += data['market_share']

        return (covered_market_share / total_market_share) * 100 if total_market_share > 0 else 0

    def generate_strategy_report(self, strategy: Dict) -> str:
        """Generate human-readable strategy report"""
        report = "Device Coverage Strategy Report\n"
        report += "=" * 40 + "\n\n"

        report += f"Total Devices: {strategy['device_count']}\n"
        report += f"Estimated Monthly Cost: ${strategy['total_estimated_cost']}\n"
        report += f"Market Coverage: {strategy['coverage_percentage']:.1f}%\n\n"

        for tier, tier_name in [('tier_1_devices', 'Tier 1 (Every Build)'),
                               ('tier_2_devices', 'Tier 2 (Weekly)'),
                               ('tier_3_devices', 'Tier 3 (Monthly)')]:
            if strategy[tier]:
                report += f"{tier_name}:\n"
                for device in strategy[tier]:
                    report += f"  - {device['device']} ({device['platform']}) - ${device['monthly_cost']}/month\n"
                report += "\n"

        return report

# Usage example
if __name__ == "__main__":
    manager = DeviceFragmentationManager()

    # Analyze market data
    market_data = manager.analyze_market_share("global")

    # Calculate priorities
    priorities = manager.calculate_device_priority(market_data)

    # Generate strategy with budget constraints
    budget = {
        'max_devices': 15,
        'max_monthly_cost': 3000
    }

    strategy = manager.generate_coverage_strategy(priorities, budget)

    # Generate report
    report = manager.generate_strategy_report(strategy)
    print(report)
```

#### 2. Network Condition Testing
**Challenge**: Testing app behavior across varying network conditions

**Solution:**
```python
#!/usr/bin/env python3
"""
Network Condition Testing Framework
Simulates various network conditions for mobile testing
"""

import subprocess
import time
import requests
from appium import webdriver
from enum import Enum

class NetworkCondition(Enum):
    WIFI_GOOD = "wifi_good"
    WIFI_POOR = "wifi_poor"
    LTE_GOOD = "lte_good"
    LTE_POOR = "lte_poor"
    EDGE = "edge"
    OFFLINE = "offline"

class NetworkConditionTester:
    def __init__(self, platform: str, device_udid: str):
        self.platform = platform.lower()
        self.device_udid = device_udid
        self.original_connection = None

    def setup_network_condition(self, condition: NetworkCondition):
        """Setup specific network condition"""
        print(f"Setting up network condition: {condition.value}")

        if self.platform == 'android':
            self._setup_android_network(condition)
        elif self.platform == 'ios':
            self._setup_ios_network(condition)

    def _setup_android_network(self, condition: NetworkCondition):
        """Setup Android network conditions using ADB"""
        conditions_map = {
            NetworkCondition.WIFI_GOOD: {
                'connection_type': 6,  # WiFi + Data
                'bandwidth': 100000,   # 100 Mbps
                'latency': 20         # 20ms
            },
            NetworkCondition.WIFI_POOR: {
                'connection_type': 6,
                'bandwidth': 1000,    # 1 Mbps
                'latency': 500        # 500ms
            },
            NetworkCondition.LTE_GOOD: {
                'connection_type': 2,  # Data only
                'bandwidth': 50000,   # 50 Mbps
                'latency': 50         # 50ms
            },
            NetworkCondition.LTE_POOR: {
                'connection_type': 2,
                'bandwidth': 1000,    # 1 Mbps
                'latency': 1000       # 1000ms
            },
            NetworkCondition.EDGE: {
                'connection_type': 2,
                'bandwidth': 200,     # 200 Kbps
                'latency': 2000       # 2000ms
            },
            NetworkCondition.OFFLINE: {
                'connection_type': 0,  # No connection
                'bandwidth': 0,
                'latency': 0
            }
        }

        config = conditions_map.get(condition)
        if not config:
            return

        try:
            # Set connection type
            cmd = f"adb -s {self.device_udid} shell svc data enable" if config['connection_type'] > 0 else \
                  f"adb -s {self.device_udid} shell svc data disable"
            subprocess.run(cmd, shell=True)

            # For more advanced network shaping, you might use:
            # - Network Link Conditioner on iOS
            # - tc (traffic control) on Android
            # - Proxy servers with bandwidth limiting

            if config['connection_type'] > 0:
                # Enable data connection
                subprocess.run(f"adb -s {self.device_udid} shell svc data enable", shell=True)

                # WiFi control
                if config['connection_type'] == 6:  # WiFi + Data
                    subprocess.run(f"adb -s {self.device_udid} shell svc wifi enable", shell=True)
                else:
                    subprocess.run(f"adb -s {self.device_udid} shell svc wifi disable", shell=True)

        except Exception as e:
            print(f"Error setting Android network condition: {e}")

    def _setup_ios_network(self, condition: NetworkCondition):
        """Setup iOS network conditions"""
        # iOS network condition testing typically requires:
        # 1. Network Link Conditioner in Xcode
        # 2. Physical device testing
        # 3. Proxy-based network shaping

        conditions_map = {
            NetworkCondition.WIFI_GOOD: "wifi-good",
            NetworkCondition.WIFI_POOR: "wifi-poor",
            NetworkCondition.LTE_GOOD: "lte-good",
            NetworkCondition.LTE_POOR: "lte-poor",
            NetworkCondition.EDGE: "edge",
            NetworkCondition.OFFLINE: "offline"
        }

        condition_profile = conditions_map.get(condition)
        if not condition_profile:
            return

        try:
            # For iOS simulator, you can use Network Link Conditioner
            # This requires Xcode Command Line Tools
            cmd = f"xcrun simctl spawn {self.device_udid} networkproxy {condition_profile}"
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)

            if result.returncode != 0:
                print(f"Failed to set iOS network condition: {result.stderr}")

        except Exception as e:
            print(f"Error setting iOS network condition: {e}")

    def test_network_scenarios(self, app_driver, test_scenarios: list):
        """Test app under various network conditions"""
        results = []

        for scenario in test_scenarios:
            condition = scenario['condition']
            test_actions = scenario['actions']
            expected_behavior = scenario['expected']

            print(f"Testing scenario: {scenario['name']}")

            # Set network condition
            self.setup_network_condition(condition)
            time.sleep(2)  # Allow network change to take effect

            # Execute test actions
            scenario_result = {
                'scenario': scenario['name'],
                'condition': condition.value,
                'success': True,
                'issues': [],
                'performance_metrics': {}
            }

            try:
                start_time = time.time()

                for action in test_actions:
                    self._execute_test_action(app_driver, action, scenario_result)

                end_time = time.time()
                scenario_result['performance_metrics']['total_time'] = end_time - start_time

                # Verify expected behavior
                self._verify_expected_behavior(app_driver, expected_behavior, scenario_result)

            except Exception as e:
                scenario_result['success'] = False
                scenario_result['issues'].append(f"Test execution failed: {str(e)}")

            results.append(scenario_result)

        # Restore normal network conditions
        self.restore_network_conditions()

        return results

    def _execute_test_action(self, driver, action: dict, result: dict):
        """Execute a single test action"""
        action_type = action['type']

        if action_type == 'tap':
            element = driver.find_element_by_id(action['element_id'])
            element.click()

        elif action_type == 'wait_for_element':
            element_id = action['element_id']
            timeout = action.get('timeout', 10)

            start_time = time.time()
            try:
                element = WebDriverWait(driver, timeout).until(
                    EC.presence_of_element_located((By.ID, element_id))
                )
                load_time = time.time() - start_time
                result['performance_metrics'][f'{element_id}_load_time'] = load_time

            except TimeoutException:
                result['issues'].append(f"Element {element_id} not found within {timeout}s")
                result['success'] = False

        elif action_type == 'api_call':
            url = action['url']
            start_time = time.time()

            try:
                response = requests.get(url, timeout=action.get('timeout', 30))
                response_time = time.time() - start_time
                result['performance_metrics'][f'api_response_time'] = response_time

                if response.status_code != 200:
                    result['issues'].append(f"API call failed: {response.status_code}")

            except requests.RequestException as e:
                result['issues'].append(f"API call error: {str(e)}")

    def _verify_expected_behavior(self, driver, expected: dict, result: dict):
        """Verify expected app behavior"""
        behavior_type = expected['type']

        if behavior_type == 'error_message':
            # Verify error message is displayed
            try:
                error_element = driver.find_element_by_id(expected['element_id'])
                if expected['message'] not in error_element.text:
                    result['issues'].append("Expected error message not displayed")
            except:
                result['issues'].append("Error message element not found")

        elif behavior_type == 'offline_cache':
            # Verify cached content is displayed
            try:
                cache_element = driver.find_element_by_id(expected['element_id'])
                if not cache_element.is_displayed():
                    result['issues'].append("Cached content not displayed offline")
            except:
                result['issues'].append("Cached content element not found")

        elif behavior_type == 'loading_indicator':
            # Verify loading indicator is shown
            try:
                loading_element = driver.find_element_by_id(expected['element_id'])
                if not loading_element.is_displayed():
                    result['issues'].append("Loading indicator not shown during slow network")
            except:
                result['issues'].append("Loading indicator element not found")

    def restore_network_conditions(self):
        """Restore normal network conditions"""
        print("Restoring normal network conditions...")

        if self.platform == 'android':
            subprocess.run(f"adb -s {self.device_udid} shell svc data enable", shell=True)
            subprocess.run(f"adb -s {self.device_udid} shell svc wifi enable", shell=True)
        elif self.platform == 'ios':
            subprocess.run(f"xcrun simctl spawn {self.device_udid} networkproxy none", shell=True)

    def generate_network_test_report(self, results: list) -> dict:
        """Generate network testing report"""
        total_scenarios = len(results)
        passed_scenarios = len([r for r in results if r['success']])

        report = {
            'summary': {
                'total_scenarios': total_scenarios,
                'passed': passed_scenarios,
                'failed': total_scenarios - passed_scenarios,
                'success_rate': (passed_scenarios / total_scenarios) * 100 if total_scenarios > 0 else 0
            },
            'scenarios': results,
            'recommendations': self._generate_network_recommendations(results)
        }

        return report

    def _generate_network_recommendations(self, results: list) -> list:
        """Generate recommendations based on network test results"""
        recommendations = []

        failed_scenarios = [r for r in results if not r['success']]

        if any('offline' in r['condition'] for r in failed_scenarios):
            recommendations.append("Implement offline caching and graceful degradation for network failures")

        if any('poor' in r['condition'] for r in failed_scenarios):
            recommendations.append("Add loading indicators and timeout handling for slow network conditions")

        slow_scenarios = [r for r in results if r['performance_metrics'].get('total_time', 0) > 10]
        if slow_scenarios:
            recommendations.append("Optimize app performance for slow network conditions")

        if not recommendations:
            recommendations.append("Network condition handling appears robust")

        return recommendations

# Usage example
if __name__ == "__main__":
    tester = NetworkConditionTester("android", "emulator-5554")

    # Define test scenarios
    scenarios = [
        {
            'name': 'Login with good WiFi',
            'condition': NetworkCondition.WIFI_GOOD,
            'actions': [
                {'type': 'tap', 'element_id': 'login_button'},
                {'type': 'wait_for_element', 'element_id': 'dashboard', 'timeout': 10}
            ],
            'expected': {
                'type': 'success_state',
                'element_id': 'dashboard'
            }
        },
        {
            'name': 'Login with poor network',
            'condition': NetworkCondition.LTE_POOR,
            'actions': [
                {'type': 'tap', 'element_id': 'login_button'},
                {'type': 'wait_for_element', 'element_id': 'loading_indicator', 'timeout': 5}
            ],
            'expected': {
                'type': 'loading_indicator',
                'element_id': 'loading_indicator'
            }
        },
        {
            'name': 'Offline mode',
            'condition': NetworkCondition.OFFLINE,
            'actions': [
                {'type': 'tap', 'element_id': 'refresh_button'}
            ],
            'expected': {
                'type': 'error_message',
                'element_id': 'network_error',
                'message': 'No internet connection'
            }
        }
    ]

    # Mock app driver (would be actual Appium driver)
    app_driver = None

    # Run network tests
    results = tester.test_network_scenarios(app_driver, scenarios)
    report = tester.generate_network_test_report(results)

    print(json.dumps(report, indent=2))
```

## Metrics and Measurement

### Mobile Testing KPIs Dashboard

```json
{
  "mobile_testing_metrics": {
    "device_coverage": {
      "total_devices_tested": {
        "current": 25,
        "target": "> 20",
        "trend": "stable",
        "measurement": "Device lab + Cloud"
      },
      "market_coverage_percentage": {
        "current": "85%",
        "target": "> 80%",
        "trend": "improving",
        "measurement": "Market share analysis"
      },
      "platform_distribution": {
        "ios": "45%",
        "android": "55%",
        "target": "50/50 split",
        "measurement": "Test execution distribution"
      }
    },
    "test_execution": {
      "automation_coverage": {
        "current": "75%",
        "target": "> 70%",
        "trend": "improving",
        "measurement": "Automated vs manual tests"
      },
      "test_execution_time": {
        "current": "45 minutes",
        "target": "< 60 minutes",
        "trend": "stable",
        "measurement": "Full regression suite"
      },
      "test_stability": {
        "current": "92%",
        "target": "> 90%",
        "trend": "improving",
        "measurement": "Pass rate consistency"
      }
    },
    "performance_metrics": {
      "app_launch_time": {
        "current": "2.1 seconds",
        "target": "< 3 seconds",
        "trend": "stable",
        "measurement": "Average across devices"
      },
      "memory_usage": {
        "current": "180 MB",
        "target": "< 200 MB",
        "trend": "stable",
        "measurement": "Peak memory usage"
      },
      "battery_efficiency": {
        "current": "8% per hour",
        "target": "< 10% per hour",
        "trend": "improving",
        "measurement": "Battery drain testing"
      }
    },
    "quality_metrics": {
      "crash_rate": {
        "current": "0.02%",
        "target": "< 0.1%",
        "trend": "improving",
        "measurement": "Crash analytics"
      },
      "accessibility_compliance": {
        "current": "95%",
        "target": "> 90%",
        "trend": "stable",
        "measurement": "WCAG guidelines"
      },
      "user_satisfaction": {
        "current": "4.6/5",
        "target": "> 4.0/5",
        "trend": "improving",
        "measurement": "App store ratings"
      }
    }
  }
}
```

## Advanced Topics

### Cross-Platform Testing Strategies

#### 1. React Native Testing Framework
```javascript
// React Native Testing with Detox
const { device, element, by, expect } = require('detox');

describe('React Native App Tests', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  afterAll(async () => {
    await device.terminateApp();
  });

  it('should handle cross-platform navigation', async () => {
    // Test navigation that works on both iOS and Android
    await element(by.id('navigation_menu')).tap();
    await expect(element(by.id('menu_drawer'))).toBeVisible();

    await element(by.id('settings_option')).tap();
    await expect(element(by.id('settings_screen'))).toBeVisible();
  });

  it('should handle platform-specific features', async () => {
    if (device.getPlatform() === 'ios') {
      // iOS-specific tests
      await element(by.id('ios_specific_button')).tap();
      await expect(element(by.id('ios_alert'))).toBeVisible();
    } else {
      // Android-specific tests
      await element(by.id('android_specific_button')).tap();
      await expect(element(by.id('android_snackbar'))).toBeVisible();
    }
  });

  it('should maintain performance across platforms', async () => {
    const startTime = Date.now();

    await element(by.id('heavy_operation_button')).tap();
    await waitFor(element(by.id('operation_complete')))
      .toBeVisible()
      .withTimeout(5000);

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Performance should be consistent across platforms
    expect(duration).toBeLessThan(5000);
  });
});

// Cross-platform helper functions
class CrossPlatformHelper {
  static async handlePlatformSpecificAction(action) {
    const platform = device.getPlatform();

    if (platform === 'ios') {
      return await this.handleiOSAction(action);
    } else {
      return await this.handleAndroidAction(action);
    }
  }

  static async handleiOSAction(action) {
    switch (action) {
      case 'back_navigation':
        await element(by.id('back_button')).tap();
        break;
      case 'share':
        await element(by.id('share_button')).tap();
        break;
    }
  }

  static async handleAndroidAction(action) {
    switch (action) {
      case 'back_navigation':
        await device.pressBack();
        break;
      case 'share':
        await element(by.id('share_button')).tap();
        break;
    }
  }
}
```

#### 2. Flutter Testing Integration
```dart
// Flutter Integration Testing
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:myapp/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Cross-platform Flutter tests', () {
    testWidgets('App navigation works on all platforms', (WidgetTester tester) async {
      app.main();
      await tester.pumpAndSettle();

      // Test navigation
      await tester.tap(find.byKey(Key('home_tab')));
      await tester.pumpAndSettle();
      expect(find.byKey(Key('home_content')), findsOneWidget);

      await tester.tap(find.byKey(Key('profile_tab')));
      await tester.pumpAndSettle();
      expect(find.byKey(Key('profile_content')), findsOneWidget);
    });

    testWidgets('Platform-specific behavior', (WidgetTester tester) async {
      app.main();
      await tester.pumpAndSettle();

      // Test platform-specific UI elements
      if (Theme.of(tester.element(find.byType(MaterialApp))).platform == TargetPlatform.iOS) {
        expect(find.byType(CupertinoNavigationBar), findsOneWidget);
      } else {
        expect(find.byType(AppBar), findsOneWidget);
      }
    });

    testWidgets('Performance consistency', (WidgetTester tester) async {
      app.main();
      await tester.pumpAndSettle();

      final stopwatch = Stopwatch()..start();

      // Perform intensive operation
      await tester.tap(find.byKey(Key('load_data_button')));
      await tester.pumpAndSettle();

      stopwatch.stop();

      // Ensure consistent performance across platforms
      expect(stopwatch.elapsedMilliseconds, lessThan(3000));
    });
  });
}

// Platform-specific test helpers
class PlatformTestHelper {
  static Future<void> handleBackNavigation(WidgetTester tester) async {
    if (Theme.of(tester.element(find.byType(MaterialApp))).platform == TargetPlatform.iOS) {
      await tester.tap(find.byTooltip('Back'));
    } else {
      await tester.tap(find.byType(BackButton));
    }
  }

  static Future<void> verifyPlatformSpecificElements(WidgetTester tester) async {
    final platform = Theme.of(tester.element(find.byType(MaterialApp))).platform;

    if (platform == TargetPlatform.iOS) {
      expect(find.byType(CupertinoButton), findsWidgets);
      expect(find.byType(CupertinoTextField), findsWidgets);
    } else {
      expect(find.byType(ElevatedButton), findsWidgets);
      expect(find.byType(TextField), findsWidgets);
    }
  }
}
```

## Quick Reference

### Mobile Testing Checklist

#### Pre-Release Mobile Testing Checklist
- [ ] **Device Coverage**
  - [ ] Test on minimum 5 high-priority devices
  - [ ] Include both iOS and Android platforms
  - [ ] Test on different screen sizes
  - [ ] Include at least one tablet device

- [ ] **Functional Testing**
  - [ ] App installation and uninstallation
  - [ ] Core user flows work correctly
  - [ ] Navigation functions properly
  - [ ] Forms submit successfully
  - [ ] Search functionality works

- [ ] **Platform-Specific Testing**
  - [ ] iOS App Store guidelines compliance
  - [ ] Android Material Design adherence
  - [ ] Permission handling works correctly
  - [ ] Platform-specific features function

- [ ] **Performance Testing**
  - [ ] App launch time < 3 seconds
  - [ ] Memory usage within limits
  - [ ] No memory leaks detected
  - [ ] Smooth scrolling and animations
  - [ ] Battery usage acceptable

- [ ] **Network Testing**
  - [ ] Works on WiFi and cellular
  - [ ] Handles poor network conditions
  - [ ] Offline functionality works
  - [ ] Network error handling
  - [ ] Data usage optimized

- [ ] **Accessibility Testing**
  - [ ] Screen reader compatibility
  - [ ] Touch targets minimum 44x44 points
  - [ ] Color contrast meets WCAG standards
  - [ ] Text scaling support
  - [ ] Voice control works

### Mobile Testing Commands Quick Reference

```bash
# Appium Commands
appium --address 0.0.0.0 --port 4723 --relaxed-security
appium driver install uiautomator2
appium driver install xcuitest

# iOS Device Management
xcrun simctl list devices
xcrun simctl boot "iPhone 15"
xcrun simctl install booted app.app
ios-deploy --list-devices
ios-deploy --bundle app.app

# Android Device Management
adb devices
adb install app.apk
adb uninstall com.example.app
adb logcat | grep "MyApp"
adb shell dumpsys battery
adb shell am start -n com.example.app/.MainActivity

# Performance Monitoring
# iOS
xcrun simctl spawn "iPhone 15" instruments -t "Activity Monitor" app.app

# Android
adb shell dumpsys meminfo com.example.app
adb shell dumpsys cpuinfo | grep com.example.app
adb shell dumpsys battery
```

### Mobile Device Configuration Templates

```yaml
# BrowserStack Configuration
browserstack_devices:
  ios:
    - device: "iPhone 15"
      os_version: "17"
      real_mobile: true
    - device: "iPad Pro 12.9 2022"
      os_version: "16"
      real_mobile: true

  android:
    - device: "Samsung Galaxy S24"
      os_version: "14.0"
      real_mobile: true
    - device: "Google Pixel 8"
      os_version: "14.0"
      real_mobile: true

# Firebase Test Lab Configuration
firebase_test_lab:
  android:
    - model: "Pixel2"
      version: "28"
      locale: "en"
      orientation: "portrait"
    - model: "GalaxyS20"
      version: "30"
      locale: "en"
      orientation: "portrait"
```

---

**Next Steps:**
1. Set up mobile device lab with priority devices
2. Implement cross-platform mobile automation framework
3. Establish mobile performance monitoring
4. Create mobile accessibility testing process
5. Integrate mobile testing into CI/CD pipeline

This comprehensive guide provides the foundation for implementing world-class mobile testing standards that ensure optimal application performance and user experience across all mobile platforms and devices.