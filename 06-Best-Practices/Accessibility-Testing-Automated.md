# Automated Accessibility Testing Guide

## Overview

Automated accessibility testing provides the foundation for accessibility quality assurance, enabling teams to catch common accessibility issues early in the development cycle. This guide establishes comprehensive automated testing standards, frameworks, and tools for QA professionals.

### Purpose and Scope
- Define automated accessibility testing standards for digital products
- Establish tool integration and CI/CD pipelines for accessibility
- Provide comprehensive testing frameworks and scripts
- Create automated reporting and tracking systems

### Target Audience
- QA Engineers implementing automated accessibility testing
- DevOps engineers setting up CI/CD accessibility pipelines
- Development teams integrating accessibility tools
- Test automation engineers and accessibility specialists

### Key Benefits
- Early detection of accessibility issues in development
- Consistent accessibility validation across environments
- Scalable testing approach for large applications
- Integration with existing development workflows
- Comprehensive reporting and trend analysis

## Fundamental Principles

### Core Automated Testing Concepts

#### 1. WCAG 2.1 Principles for Automation
```
Automated Testing Coverage
├── Perceivable (High Coverage)
│   ├── Color contrast validation
│   ├── Image alt text detection
│   ├── Text scaling compatibility
│   └── Audio/video accessibility checks
├── Operable (Medium Coverage)
│   ├── Keyboard navigation detection
│   ├── Focus management validation
│   └── Timing and motion checks
├── Understandable (Low Coverage)
│   ├── Language detection
│   ├── Form validation patterns
│   └── Consistent navigation detection
└── Robust (High Coverage)
    ├── HTML validation
    ├── ARIA usage validation
    └── Browser compatibility checks
```

#### 2. Automation Testing Levels

| Level | Coverage | Tool Reliability | Manual Verification Needed |
|-------|----------|------------------|---------------------------|
| **Automated High** | 30-40% of issues | Very High | Minimal |
| **Automated Medium** | 20-30% of issues | High | Some verification |
| **Manual Required** | 30-50% of issues | N/A | Complete manual testing |

#### 3. Tool Categories and Use Cases

| Tool Category | Best For | Limitations | Integration Level |
|--------------|----------|-------------|------------------|
| **Browser Extensions** | Quick development checks | Limited CI/CD integration | Development |
| **API Testing Tools** | Automated scanning | No user experience validation | CI/CD |
| **Framework Integration** | Continuous testing | Setup complexity | Development + CI/CD |
| **Command Line Tools** | Pipeline integration | Limited context | CI/CD |

## Step-by-Step Implementation

### Phase 1: Core Automated Testing Framework

#### 1.1 Accessibility Testing Framework Setup
```python
#!/usr/bin/env python3
"""
Automated Accessibility Testing Framework
Integrates multiple accessibility testing tools for comprehensive coverage
"""

import json
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from axe_selenium_python import Axe
import requests
from typing import Dict, List, Any
from dataclasses import dataclass

@dataclass
class AccessibilityIssue:
    rule_id: str
    impact: str
    description: str
    help_url: str
    element: str
    tags: List[str]
    fix_suggestions: List[str]

class AccessibilityTestFramework:
    def __init__(self, driver_path: str = None):
        self.driver = None
        self.axe = None
        self.test_results = []
        self.driver_path = driver_path

    def setup_driver(self, browser: str = 'chrome', headless: bool = False):
        """Setup WebDriver with accessibility testing configurations"""
        if browser.lower() == 'chrome':
            from selenium.webdriver.chrome.options import Options
            options = Options()
            if headless:
                options.add_argument('--headless')
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument('--disable-gpu')

            # Accessibility-specific Chrome options
            options.add_argument('--force-prefers-reduced-motion')
            options.add_argument('--enable-accessibility-logging')

            self.driver = webdriver.Chrome(options=options)

        elif browser.lower() == 'firefox':
            from selenium.webdriver.firefox.options import Options
            options = Options()
            if headless:
                options.add_argument('--headless')

            # Firefox accessibility preferences
            profile = webdriver.FirefoxProfile()
            profile.set_preference('accessibility.force_disabled', 0)
            profile.set_preference('ui.prefersReducedMotion', 1)

            self.driver = webdriver.Firefox(options=options, firefox_profile=profile)

        # Initialize axe-core
        self.axe = Axe(self.driver)

    def run_automated_scan(self, url: str, ruleset: str = 'wcag21aa') -> Dict[str, Any]:
        """Run comprehensive automated accessibility scan"""
        print(f"Running accessibility scan for: {url}")

        # Navigate to page
        self.driver.get(url)
        time.sleep(3)  # Allow page to load

        # Wait for page to be ready
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )

        # Inject axe-core and run scan
        self.axe.inject()

        # Configure axe rules based on ruleset
        axe_options = self._get_axe_options(ruleset)
        results = self.axe.run(options=axe_options)

        # Process and enhance results
        processed_results = self._process_axe_results(results, url)

        # Run additional custom checks
        custom_results = self._run_custom_accessibility_checks()

        # Combine results
        combined_results = {
            'url': url,
            'timestamp': time.time(),
            'axe_results': processed_results,
            'custom_results': custom_results,
            'summary': self._generate_summary(processed_results, custom_results)
        }

        self.test_results.append(combined_results)
        return combined_results

    def _get_axe_options(self, ruleset: str) -> Dict:
        """Get axe-core configuration options based on ruleset"""
        base_options = {
            'reporter': 'v2',
            'resultTypes': ['violations', 'incomplete', 'passes']
        }

        if ruleset == 'wcag21aa':
            base_options['tags'] = ['wcag2a', 'wcag2aa', 'wcag21aa']
        elif ruleset == 'wcag21aaa':
            base_options['tags'] = ['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21aa', 'wcag21aaa']
        elif ruleset == 'section508':
            base_options['tags'] = ['section508']
        else:
            base_options['tags'] = ['wcag2a', 'wcag2aa']

        return base_options

    def _process_axe_results(self, results: Dict, url: str) -> Dict:
        """Process and enhance axe-core results"""
        processed = {
            'violations': [],
            'incomplete': [],
            'passes': [],
            'inapplicable': []
        }

        for category in processed.keys():
            if category in results:
                for item in results[category]:
                    processed_item = {
                        'id': item['id'],
                        'impact': item.get('impact', 'unknown'),
                        'description': item['description'],
                        'help': item['help'],
                        'helpUrl': item['helpUrl'],
                        'tags': item['tags'],
                        'nodes': []
                    }

                    # Process nodes (specific elements with issues)
                    for node in item.get('nodes', []):
                        node_info = {
                            'html': node['html'],
                            'target': node['target'],
                            'failureSummary': node.get('failureSummary', ''),
                            'fixes': self._generate_fix_suggestions(item['id'], node)
                        }
                        processed_item['nodes'].append(node_info)

                    processed[category].append(processed_item)

        return processed

    def _generate_fix_suggestions(self, rule_id: str, node: Dict) -> List[str]:
        """Generate specific fix suggestions for accessibility issues"""
        suggestions = []

        fix_mapping = {
            'color-contrast': [
                'Increase color contrast ratio to at least 4.5:1 for normal text',
                'Use darker text on light backgrounds or lighter text on dark backgrounds',
                'Test with online contrast checkers',
                'Consider using a color palette designed for accessibility'
            ],
            'image-alt': [
                'Add descriptive alt text that conveys the image content and function',
                'Use empty alt="" for decorative images',
                'For complex images, provide extended descriptions',
                'Ensure alt text is concise but informative'
            ],
            'label': [
                'Associate form controls with descriptive labels using <label> elements',
                'Use aria-label or aria-labelledby for controls without visible labels',
                'Ensure labels clearly describe the purpose of the form control',
                'Place labels adjacent to their associated controls'
            ],
            'keyboard': [
                'Ensure all interactive elements are keyboard accessible',
                'Implement proper focus management and visible focus indicators',
                'Use tabindex appropriately (avoid positive values)',
                'Test navigation using only the keyboard'
            ],
            'heading-order': [
                'Use heading levels sequentially (h1, h2, h3, etc.)',
                'Ensure page has a single h1 element',
                'Use headings to create a logical document outline',
                'Don\'t skip heading levels for styling purposes'
            ],
            'link-name': [
                'Provide descriptive link text that makes sense out of context',
                'Avoid generic text like "click here" or "read more"',
                'Use aria-label for links where additional context is needed',
                'Ensure link purpose is clear from text or context'
            ]
        }

        # Get specific suggestions for this rule
        if rule_id in fix_mapping:
            suggestions.extend(fix_mapping[rule_id])

        # Add element-specific suggestions based on HTML
        html = node.get('html', '').lower()
        if 'input' in html and 'type="submit"' in html:
            suggestions.append('Consider using <button> instead of <input type="submit"> for better accessibility')

        if 'div' in html and 'onclick' in html:
            suggestions.append('Use semantic HTML elements like <button> instead of div with onclick handlers')

        return suggestions

    def _run_custom_accessibility_checks(self) -> Dict[str, Any]:
        """Run custom accessibility checks not covered by axe-core"""
        custom_results = {
            'focus_management': self._check_focus_management(),
            'keyboard_navigation': self._check_keyboard_navigation(),
            'responsive_accessibility': self._check_responsive_accessibility(),
            'performance_accessibility': self._check_performance_accessibility()
        }

        return custom_results

    def _check_focus_management(self) -> Dict[str, Any]:
        """Check focus management and visual focus indicators"""
        focus_issues = []

        try:
            # Find all focusable elements
            focusable_elements = self.driver.find_elements(
                By.CSS_SELECTOR,
                'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )

            focus_management_score = 0
            total_checks = 0

            for element in focusable_elements[:10]:  # Check first 10 elements
                try:
                    # Check if element can receive focus
                    element.click()
                    focused_element = self.driver.switch_to.active_element

                    if focused_element == element:
                        focus_management_score += 1
                    else:
                        focus_issues.append({
                            'element': element.get_attribute('outerHTML'),
                            'issue': 'Element cannot receive focus properly'
                        })

                    # Check for visible focus indicator
                    outline_style = element.value_of_css_property('outline')
                    box_shadow = element.value_of_css_property('box-shadow')

                    if outline_style == 'none' and 'none' in box_shadow:
                        focus_issues.append({
                            'element': element.get_attribute('outerHTML'),
                            'issue': 'No visible focus indicator'
                        })

                    total_checks += 1

                except Exception as e:
                    focus_issues.append({
                        'element': 'Unknown',
                        'issue': f'Focus test failed: {str(e)}'
                    })

            focus_score = (focus_management_score / total_checks * 100) if total_checks > 0 else 0

        except Exception as e:
            focus_issues.append({'error': f'Focus management check failed: {str(e)}'})
            focus_score = 0

        return {
            'score': focus_score,
            'issues': focus_issues,
            'total_checks': total_checks
        }

    def _check_keyboard_navigation(self) -> Dict[str, Any]:
        """Check keyboard navigation functionality"""
        keyboard_issues = []

        try:
            # Test Tab navigation
            body = self.driver.find_element(By.TAG_NAME, 'body')

            # Record initial focus
            initial_focus = self.driver.switch_to.active_element

            # Press Tab 5 times and track focus changes
            focus_changes = 0
            previous_focus = initial_focus

            for i in range(5):
                body.send_keys('\ue004')  # Tab key
                time.sleep(0.1)
                current_focus = self.driver.switch_to.active_element

                if current_focus != previous_focus:
                    focus_changes += 1
                previous_focus = current_focus

            # Test Shift+Tab (reverse navigation)
            for i in range(2):
                body.send_keys('\ue008\ue004')  # Shift+Tab
                time.sleep(0.1)

            # Test Enter key activation
            try:
                current_focus = self.driver.switch_to.active_element
                tag_name = current_focus.tag_name.lower()

                if tag_name in ['button', 'a']:
                    # Test Enter key activation
                    current_focus.send_keys('\ue007')  # Enter key
                    time.sleep(0.1)

            except Exception as e:
                keyboard_issues.append({
                    'issue': f'Enter key activation test failed: {str(e)}'
                })

            keyboard_score = min((focus_changes / 5) * 100, 100)

        except Exception as e:
            keyboard_issues.append({'error': f'Keyboard navigation check failed: {str(e)}'})
            keyboard_score = 0

        return {
            'score': keyboard_score,
            'focus_changes': focus_changes,
            'issues': keyboard_issues
        }

    def _check_responsive_accessibility(self) -> Dict[str, Any]:
        """Check accessibility across different viewport sizes"""
        responsive_issues = []

        try:
            # Test different viewport sizes
            viewports = [
                {'width': 320, 'height': 568, 'name': 'Mobile Portrait'},
                {'width': 768, 'height': 1024, 'name': 'Tablet'},
                {'width': 1920, 'height': 1080, 'name': 'Desktop'}
            ]

            responsive_score = 0

            for viewport in viewports:
                self.driver.set_window_size(viewport['width'], viewport['height'])
                time.sleep(1)

                # Check for horizontal scrolling
                body_width = self.driver.execute_script("return document.body.scrollWidth")
                window_width = self.driver.execute_script("return window.innerWidth")

                if body_width > window_width:
                    responsive_issues.append({
                        'viewport': viewport['name'],
                        'issue': 'Horizontal scrolling detected'
                    })
                else:
                    responsive_score += 1

                # Check touch target sizes (for mobile)
                if viewport['width'] <= 768:
                    interactive_elements = self.driver.find_elements(
                        By.CSS_SELECTOR, 'button, a, input, select'
                    )

                    for element in interactive_elements[:5]:
                        size = element.size
                        if size['width'] < 44 or size['height'] < 44:
                            responsive_issues.append({
                                'viewport': viewport['name'],
                                'issue': f'Touch target too small: {size["width"]}x{size["height"]}px'
                            })

            responsive_score = (responsive_score / len(viewports)) * 100

        except Exception as e:
            responsive_issues.append({'error': f'Responsive accessibility check failed: {str(e)}'})
            responsive_score = 0

        return {
            'score': responsive_score,
            'issues': responsive_issues
        }

    def _check_performance_accessibility(self) -> Dict[str, Any]:
        """Check performance aspects that affect accessibility"""
        performance_issues = []

        try:
            # Check page load time
            navigation_timing = self.driver.execute_script(
                "return window.performance.timing"
            )

            load_time = navigation_timing['loadEventEnd'] - navigation_timing['navigationStart']

            if load_time > 3000:  # 3 seconds
                performance_issues.append({
                    'issue': f'Page load time too slow: {load_time}ms'
                })

            # Check for reduced motion support
            prefers_reduced_motion = self.driver.execute_script(
                "return window.matchMedia('(prefers-reduced-motion: reduce)').matches"
            )

            if not prefers_reduced_motion:
                performance_issues.append({
                    'issue': 'No support for prefers-reduced-motion detected'
                })

            performance_score = 100 - (len(performance_issues) * 25)
            performance_score = max(0, performance_score)

        except Exception as e:
            performance_issues.append({'error': f'Performance accessibility check failed: {str(e)}'})
            performance_score = 0

        return {
            'score': performance_score,
            'issues': performance_issues
        }

    def _generate_summary(self, axe_results: Dict, custom_results: Dict) -> Dict:
        """Generate comprehensive test summary"""
        total_violations = len(axe_results.get('violations', []))
        total_incomplete = len(axe_results.get('incomplete', []))
        total_passes = len(axe_results.get('passes', []))

        # Calculate severity distribution
        severity_counts = {'critical': 0, 'serious': 0, 'moderate': 0, 'minor': 0}

        for violation in axe_results.get('violations', []):
            impact = violation.get('impact', 'minor')
            if impact in severity_counts:
                severity_counts[impact] += len(violation.get('nodes', []))

        # Calculate overall score
        total_issues = sum(severity_counts.values())
        score_deductions = (
            severity_counts['critical'] * 10 +
            severity_counts['serious'] * 5 +
            severity_counts['moderate'] * 2 +
            severity_counts['minor'] * 1
        )

        accessibility_score = max(0, 100 - score_deductions)

        return {
            'accessibility_score': accessibility_score,
            'total_violations': total_violations,
            'total_incomplete': total_incomplete,
            'total_passes': total_passes,
            'severity_distribution': severity_counts,
            'custom_test_scores': {
                'focus_management': custom_results.get('focus_management', {}).get('score', 0),
                'keyboard_navigation': custom_results.get('keyboard_navigation', {}).get('score', 0),
                'responsive_accessibility': custom_results.get('responsive_accessibility', {}).get('score', 0),
                'performance_accessibility': custom_results.get('performance_accessibility', {}).get('score', 0)
            }
        }

    def generate_report(self, output_file: str = 'accessibility_report.html'):
        """Generate comprehensive HTML report"""
        html_template = """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Accessibility Test Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
                .score { font-size: 2em; font-weight: bold; color: #2e7d32; }
                .violation { background: #ffebee; padding: 10px; margin: 10px 0; border-left: 4px solid #f44336; }
                .violation.critical { border-left-color: #d32f2f; }
                .violation.serious { border-left-color: #f57c00; }
                .violation.moderate { border-left-color: #fbc02d; }
                .violation.minor { border-left-color: #689f38; }
                .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
                .summary-card { background: #f9f9f9; padding: 15px; border-radius: 5px; text-align: center; }
                .chart { width: 100%; height: 300px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Accessibility Test Report</h1>
                <p>Generated on: {timestamp}</p>
            </div>

            {summary_section}

            {violations_section}

            {custom_results_section}

        </body>
        </html>
        """

        # Process results for each tested URL
        summary_sections = []
        violations_sections = []
        custom_sections = []

        for result in self.test_results:
            summary = result['summary']

            # Generate summary section
            summary_html = f"""
            <div class="summary">
                <div class="summary-card">
                    <h3>Overall Score</h3>
                    <div class="score">{summary['accessibility_score']}/100</div>
                </div>
                <div class="summary-card">
                    <h3>Violations</h3>
                    <div class="score">{summary['total_violations']}</div>
                </div>
                <div class="summary-card">
                    <h3>Needs Review</h3>
                    <div class="score">{summary['total_incomplete']}</div>
                </div>
                <div class="summary-card">
                    <h3>Passes</h3>
                    <div class="score">{summary['total_passes']}</div>
                </div>
            </div>
            """
            summary_sections.append(summary_html)

            # Generate violations section
            violations_html = "<h2>Violations by Severity</h2>"

            for violation in result['axe_results']['violations']:
                impact = violation.get('impact', 'minor')
                violations_html += f"""
                <div class="violation {impact}">
                    <h3>{violation['description']}</h3>
                    <p><strong>Impact:</strong> {impact.title()}</p>
                    <p><strong>Help:</strong> {violation['help']}</p>
                    <p><strong>Affected Elements:</strong> {len(violation['nodes'])}</p>
                    <a href="{violation['helpUrl']}" target="_blank">Learn More</a>
                </div>
                """
            violations_sections.append(violations_html)

        # Combine all sections
        final_html = html_template.format(
            timestamp=time.strftime('%Y-%m-%d %H:%M:%S'),
            summary_section=''.join(summary_sections),
            violations_section=''.join(violations_sections),
            custom_results_section=''.join(custom_sections)
        )

        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(final_html)

        print(f"Report generated: {output_file}")

    def cleanup(self):
        """Clean up resources"""
        if self.driver:
            self.driver.quit()

# Usage example
if __name__ == "__main__":
    # Initialize framework
    framework = AccessibilityTestFramework()

    try:
        # Setup browser
        framework.setup_driver(browser='chrome', headless=True)

        # Test multiple pages
        test_urls = [
            'https://example.com',
            'https://example.com/login',
            'https://example.com/products'
        ]

        for url in test_urls:
            results = framework.run_automated_scan(url, ruleset='wcag21aa')
            print(f"Tested {url}: Score {results['summary']['accessibility_score']}/100")

        # Generate report
        framework.generate_report('accessibility_report.html')

    finally:
        framework.cleanup()
```

#### 1.2 CI/CD Integration Framework
```yaml
# .github/workflows/accessibility-testing.yml
name: Accessibility Testing

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  accessibility-testing:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: |
        npm ci
        npm install -g @axe-core/cli
        npm install -g pa11y-ci

    - name: Build application
      run: npm run build

    - name: Start application
      run: |
        npm start &
        sleep 30

    - name: Run axe-core accessibility tests
      run: |
        axe --dir ./dist --save axe-results.json --exit

    - name: Run pa11y accessibility tests
      run: |
        pa11y-ci --sitemap http://localhost:3000/sitemap.xml

    - name: Run custom accessibility framework
      run: |
        python accessibility_test_framework.py

    - name: Upload accessibility reports
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: accessibility-reports
        path: |
          axe-results.json
          accessibility_report.html
          pa11y-results/

    - name: Comment PR with results
      if: github.event_name == 'pull_request'
      uses: actions/github-script@v6
      with:
        script: |
          const fs = require('fs');
          const results = JSON.parse(fs.readFileSync('axe-results.json', 'utf8'));
          const violations = results.violations.length;
          const comment = `
          ## Accessibility Test Results
          - **Violations Found:** ${violations}
          - **Overall Score:** ${results.summary?.accessibility_score || 'N/A'}/100

          ${violations > 0 ? '⚠️ Please review and fix accessibility issues before merging.' : '✅ No accessibility violations found!'}

          [View detailed report](../actions/runs/${context.runId})
          `;

          github.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: comment
          });

  lighthouse-accessibility:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install Lighthouse CI
      run: npm install -g @lhci/cli

    - name: Build and test with Lighthouse
      run: |
        npm ci
        npm run build
        npm start &
        sleep 30
        lhci autorun --config=./lighthouserc.json

    - name: Upload Lighthouse reports
      uses: actions/upload-artifact@v3
      with:
        name: lighthouse-reports
        path: .lighthouseci/
```

#### 1.3 Lighthouse Configuration
```json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:3000",
        "http://localhost:3000/login",
        "http://localhost:3000/dashboard",
        "http://localhost:3000/profile"
      ],
      "settings": {
        "chromeFlags": "--no-sandbox --disable-dev-shm-usage"
      }
    },
    "assert": {
      "assertions": {
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "categories:best-practices": ["warn", {"minScore": 0.8}],
        "categories:seo": ["warn", {"minScore": 0.8}]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

### Phase 2: Advanced Automated Testing

#### 2.1 Multi-Browser Accessibility Testing
```python
#!/usr/bin/env python3
"""
Multi-Browser Accessibility Testing Framework
Tests accessibility across different browsers and assistive technologies
"""

import asyncio
import json
from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium.webdriver.edge.options import Options as EdgeOptions
from typing import Dict, List, Any

class MultiBrowserAccessibilityTester:
    def __init__(self):
        self.browsers = ['chrome', 'firefox', 'edge']
        self.test_results = {}

    async def run_cross_browser_tests(self, urls: List[str]) -> Dict[str, Any]:
        """Run accessibility tests across multiple browsers"""

        tasks = []
        for browser in self.browsers:
            for url in urls:
                task = asyncio.create_task(
                    self._test_browser_url(browser, url)
                )
                tasks.append(task)

        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Process results
        return self._process_multi_browser_results(results)

    async def _test_browser_url(self, browser: str, url: str) -> Dict[str, Any]:
        """Test accessibility for specific browser and URL"""

        driver = self._setup_browser_driver(browser)

        try:
            # Use the AccessibilityTestFramework from previous example
            framework = AccessibilityTestFramework()
            framework.driver = driver
            framework.axe = Axe(driver)

            result = framework.run_automated_scan(url)
            result['browser'] = browser

            return result

        finally:
            driver.quit()

    def _setup_browser_driver(self, browser: str):
        """Setup WebDriver for specific browser with accessibility options"""

        if browser == 'chrome':
            options = ChromeOptions()
            options.add_argument('--headless')
            options.add_argument('--enable-accessibility-logging')
            options.add_argument('--force-prefers-reduced-motion')
            return webdriver.Chrome(options=options)

        elif browser == 'firefox':
            options = FirefoxOptions()
            options.add_argument('--headless')

            profile = webdriver.FirefoxProfile()
            profile.set_preference('accessibility.force_disabled', 0)
            profile.set_preference('ui.prefersReducedMotion', 1)

            return webdriver.Firefox(options=options, firefox_profile=profile)

        elif browser == 'edge':
            options = EdgeOptions()
            options.add_argument('--headless')
            options.add_argument('--enable-accessibility-logging')
            return webdriver.Edge(options=options)

    def _process_multi_browser_results(self, results: List[Dict]) -> Dict[str, Any]:
        """Process and compare results across browsers"""

        processed_results = {
            'cross_browser_summary': {},
            'browser_specific_issues': {},
            'common_issues': [],
            'browser_compatibility_score': 0
        }

        # Group results by browser
        browser_results = {}
        for result in results:
            if isinstance(result, dict) and 'browser' in result:
                browser = result['browser']
                if browser not in browser_results:
                    browser_results[browser] = []
                browser_results[browser].append(result)

        # Analyze cross-browser consistency
        all_violations = {}
        for browser, results_list in browser_results.items():
            browser_violations = set()

            for result in results_list:
                for violation in result.get('axe_results', {}).get('violations', []):
                    violation_key = f"{violation['id']}:{violation.get('impact', 'unknown')}"
                    browser_violations.add(violation_key)

            all_violations[browser] = browser_violations

        # Find common issues across browsers
        if all_violations:
            common_violations = set.intersection(*all_violations.values())
            processed_results['common_issues'] = list(common_violations)

        # Calculate compatibility score
        total_violations = sum(len(violations) for violations in all_violations.values())
        common_violations_count = len(processed_results['common_issues'])

        if total_violations > 0:
            compatibility_score = (common_violations_count / total_violations) * 100
        else:
            compatibility_score = 100

        processed_results['browser_compatibility_score'] = compatibility_score
        processed_results['browser_specific_issues'] = all_violations

        return processed_results

# Usage example
async def main():
    tester = MultiBrowserAccessibilityTester()

    test_urls = [
        'https://example.com',
        'https://example.com/login',
        'https://example.com/dashboard'
    ]

    results = await tester.run_cross_browser_tests(test_urls)

    print(f"Browser Compatibility Score: {results['browser_compatibility_score']:.1f}%")
    print(f"Common Issues: {len(results['common_issues'])}")

    # Save results
    with open('cross_browser_accessibility_results.json', 'w') as f:
        json.dump(results, f, indent=2)

if __name__ == "__main__":
    asyncio.run(main())
```

#### 2.2 Accessibility Regression Testing
```python
#!/usr/bin/env python3
"""
Accessibility Regression Testing Framework
Tracks accessibility changes over time and prevents regressions
"""

import json
import time
import hashlib
from datetime import datetime
from typing import Dict, List, Any
from dataclasses import dataclass

@dataclass
class AccessibilityBaseline:
    url: str
    timestamp: float
    violations_hash: str
    violations_count: int
    accessibility_score: float
    ruleset: str

class AccessibilityRegressionTester:
    def __init__(self, baseline_file: str = 'accessibility_baseline.json'):
        self.baseline_file = baseline_file
        self.baselines = self._load_baselines()

    def _load_baselines(self) -> Dict[str, AccessibilityBaseline]:
        """Load existing accessibility baselines"""
        try:
            with open(self.baseline_file, 'r') as f:
                data = json.load(f)
                return {
                    url: AccessibilityBaseline(**baseline)
                    for url, baseline in data.items()
                }
        except FileNotFoundError:
            return {}

    def _save_baselines(self):
        """Save accessibility baselines to file"""
        data = {
            url: {
                'url': baseline.url,
                'timestamp': baseline.timestamp,
                'violations_hash': baseline.violations_hash,
                'violations_count': baseline.violations_count,
                'accessibility_score': baseline.accessibility_score,
                'ruleset': baseline.ruleset
            }
            for url, baseline in self.baselines.items()
        }

        with open(self.baseline_file, 'w') as f:
            json.dump(data, f, indent=2)

    def create_baseline(self, test_results: Dict[str, Any]) -> AccessibilityBaseline:
        """Create accessibility baseline from test results"""

        url = test_results['url']
        violations = test_results['axe_results']['violations']

        # Create hash of violations for comparison
        violations_data = json.dumps(
            sorted([v['id'] for v in violations]),
            sort_keys=True
        )
        violations_hash = hashlib.md5(violations_data.encode()).hexdigest()

        baseline = AccessibilityBaseline(
            url=url,
            timestamp=test_results['timestamp'],
            violations_hash=violations_hash,
            violations_count=len(violations),
            accessibility_score=test_results['summary']['accessibility_score'],
            ruleset='wcag21aa'
        )

        self.baselines[url] = baseline
        self._save_baselines()

        return baseline

    def check_regression(self, test_results: Dict[str, Any]) -> Dict[str, Any]:
        """Check for accessibility regressions against baseline"""

        url = test_results['url']
        current_violations = test_results['axe_results']['violations']
        current_score = test_results['summary']['accessibility_score']

        # Create hash of current violations
        current_violations_data = json.dumps(
            sorted([v['id'] for v in current_violations]),
            sort_keys=True
        )
        current_hash = hashlib.md5(current_violations_data.encode()).hexdigest()

        regression_result = {
            'url': url,
            'has_regression': False,
            'has_improvement': False,
            'baseline_exists': url in self.baselines,
            'changes': [],
            'summary': {}
        }

        if url not in self.baselines:
            # No baseline exists, create one
            self.create_baseline(test_results)
            regression_result['changes'].append('No baseline found - created new baseline')
            return regression_result

        baseline = self.baselines[url]

        # Compare violations
        if current_hash != baseline.violations_hash:
            # Analyze specific changes
            baseline_violations = set()  # Would need to store this in baseline
            current_violations_set = {v['id'] for v in current_violations}

            # Simplified comparison - in practice, you'd store more detail in baseline
            if len(current_violations) > baseline.violations_count:
                regression_result['has_regression'] = True
                regression_result['changes'].append(
                    f"Violation count increased: {baseline.violations_count} → {len(current_violations)}"
                )
            elif len(current_violations) < baseline.violations_count:
                regression_result['has_improvement'] = True
                regression_result['changes'].append(
                    f"Violation count decreased: {baseline.violations_count} → {len(current_violations)}"
                )

        # Compare scores
        score_change = current_score - baseline.accessibility_score
        if score_change < -5:  # 5 point decrease threshold
            regression_result['has_regression'] = True
            regression_result['changes'].append(
                f"Accessibility score decreased: {baseline.accessibility_score} → {current_score}"
            )
        elif score_change > 5:  # 5 point increase threshold
            regression_result['has_improvement'] = True
            regression_result['changes'].append(
                f"Accessibility score improved: {baseline.accessibility_score} → {current_score}"
            )

        # Update baseline if there are improvements
        if regression_result['has_improvement'] and not regression_result['has_regression']:
            self.create_baseline(test_results)
            regression_result['changes'].append('Baseline updated with improvements')

        regression_result['summary'] = {
            'baseline_score': baseline.accessibility_score,
            'current_score': current_score,
            'score_change': score_change,
            'baseline_violations': baseline.violations_count,
            'current_violations': len(current_violations),
            'violations_change': len(current_violations) - baseline.violations_count
        }

        return regression_result

    def generate_regression_report(self, regression_results: List[Dict]) -> str:
        """Generate HTML report for regression testing"""

        html_template = """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Accessibility Regression Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
                .regression { background: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 10px 0; }
                .improvement { background: #e8f5e8; border-left: 4px solid #4caf50; padding: 15px; margin: 10px 0; }
                .no-change { background: #f9f9f9; border-left: 4px solid #9e9e9e; padding: 15px; margin: 10px 0; }
                .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
                .summary-card { background: #f9f9f9; padding: 15px; border-radius: 5px; text-align: center; }
                .score { font-size: 1.5em; font-weight: bold; }
                .change-positive { color: #4caf50; }
                .change-negative { color: #f44336; }
                .change-neutral { color: #9e9e9e; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Accessibility Regression Report</h1>
                <p>Generated on: {timestamp}</p>
            </div>

            <div class="summary">
                <div class="summary-card">
                    <h3>Total URLs Tested</h3>
                    <div class="score">{total_urls}</div>
                </div>
                <div class="summary-card">
                    <h3>Regressions Found</h3>
                    <div class="score change-negative">{regressions}</div>
                </div>
                <div class="summary-card">
                    <h3>Improvements Found</h3>
                    <div class="score change-positive">{improvements}</div>
                </div>
                <div class="summary-card">
                    <h3>No Changes</h3>
                    <div class="score change-neutral">{no_changes}</div>
                </div>
            </div>

            {results_html}
        </body>
        </html>
        """

        # Count results
        total_urls = len(regression_results)
        regressions = sum(1 for r in regression_results if r['has_regression'])
        improvements = sum(1 for r in regression_results if r['has_improvement'] and not r['has_regression'])
        no_changes = total_urls - regressions - improvements

        # Generate results HTML
        results_html = ""
        for result in regression_results:
            if result['has_regression']:
                css_class = "regression"
                status = "⚠️ Regression Detected"
            elif result['has_improvement']:
                css_class = "improvement"
                status = "✅ Improvement Detected"
            else:
                css_class = "no-change"
                status = "ℹ️ No Changes"

            changes_html = ""
            for change in result['changes']:
                changes_html += f"<li>{change}</li>"

            summary = result.get('summary', {})

            results_html += f"""
            <div class="{css_class}">
                <h3>{status}: {result['url']}</h3>
                {f'<p><strong>Score Change:</strong> {summary.get("baseline_score", "N/A")} → {summary.get("current_score", "N/A")} ({summary.get("score_change", 0):+.1f})</p>' if summary else ''}
                {f'<p><strong>Violations Change:</strong> {summary.get("baseline_violations", "N/A")} → {summary.get("current_violations", "N/A")} ({summary.get("violations_change", 0):+d})</p>' if summary else ''}
                <ul>{changes_html}</ul>
            </div>
            """

        return html_template.format(
            timestamp=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            total_urls=total_urls,
            regressions=regressions,
            improvements=improvements,
            no_changes=no_changes,
            results_html=results_html
        )

# Usage example
if __name__ == "__main__":
    # Initialize regression tester
    regression_tester = AccessibilityRegressionTester()

    # Initialize main testing framework
    framework = AccessibilityTestFramework()
    framework.setup_driver(browser='chrome', headless=True)

    test_urls = [
        'https://example.com',
        'https://example.com/login',
        'https://example.com/dashboard'
    ]

    regression_results = []

    try:
        for url in test_urls:
            # Run accessibility test
            test_result = framework.run_automated_scan(url)

            # Check for regression
            regression_result = regression_tester.check_regression(test_result)
            regression_results.append(regression_result)

            print(f"Tested {url}: {'Regression' if regression_result['has_regression'] else 'OK'}")

        # Generate regression report
        report_html = regression_tester.generate_regression_report(regression_results)

        with open('accessibility_regression_report.html', 'w') as f:
            f.write(report_html)

        print("Regression report generated: accessibility_regression_report.html")

    finally:
        framework.cleanup()
```

## Automated Testing Tools and Technologies

### Core Testing Tools Ecosystem

#### 1. Browser-Based Tools
```javascript
// Browser extension integration for real-time testing
class AccessibilityDevTools {
    constructor() {
        this.axeCore = null;
        this.initialized = false;
    }

    async initialize() {
        if (!this.initialized) {
            // Load axe-core dynamically
            await this.loadAxeCore();
            this.initialized = true;
        }
    }

    async loadAxeCore() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/axe-core@4.6.3/axe.min.js';
            script.onload = () => {
                this.axeCore = window.axe;
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async runQuickScan() {
        await this.initialize();

        const results = await this.axeCore.run({
            tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
            resultTypes: ['violations', 'incomplete']
        });

        return this.processResults(results);
    }

    processResults(results) {
        const processed = {
            violations: results.violations.map(v => ({
                rule: v.id,
                impact: v.impact,
                description: v.description,
                help: v.help,
                helpUrl: v.helpUrl,
                elements: v.nodes.map(n => ({
                    target: n.target,
                    html: n.html,
                    failureSummary: n.failureSummary
                }))
            })),
            incomplete: results.incomplete.map(i => ({
                rule: i.id,
                description: i.description,
                help: i.help,
                elements: i.nodes.length
            }))
        };

        return processed;
    }

    injectResultsUI(results) {
        // Create floating results panel
        const panel = document.createElement('div');
        panel.id = 'accessibility-results-panel';
        panel.innerHTML = `
            <div style="position: fixed; top: 10px; right: 10px; width: 300px;
                        background: white; border: 2px solid #333; border-radius: 5px;
                        padding: 15px; z-index: 10000; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
                <h3>Accessibility Results</h3>
                <p><strong>Violations:</strong> ${results.violations.length}</p>
                <p><strong>Needs Review:</strong> ${results.incomplete.length}</p>
                <button onclick="document.getElementById('accessibility-results-panel').remove()">
                    Close
                </button>
                <div id="violations-list">
                    ${results.violations.map(v => `
                        <div style="margin: 10px 0; padding: 10px; background: #ffebee;">
                            <strong>${v.rule}</strong> (${v.impact})<br>
                            ${v.description}<br>
                            <small>Elements: ${v.elements.length}</small>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(panel);
    }

    async highlightIssues() {
        const results = await this.runQuickScan();

        // Remove existing highlights
        document.querySelectorAll('.accessibility-highlight').forEach(el => {
            el.classList.remove('accessibility-highlight');
        });

        // Add highlights for violations
        results.violations.forEach(violation => {
            violation.elements.forEach(element => {
                element.target.forEach(selector => {
                    try {
                        const el = document.querySelector(selector);
                        if (el) {
                            el.classList.add('accessibility-highlight');
                            el.style.outline = '3px solid red';
                            el.style.outlineOffset = '2px';
                            el.title = `Accessibility Issue: ${violation.description}`;
                        }
                    } catch (e) {
                        console.warn('Could not highlight element:', selector);
                    }
                });
            });
        });

        return results;
    }
}

// Auto-initialize for development
if (window.location.hostname === 'localhost' || window.location.hostname.includes('dev')) {
    window.accessibilityDevTools = new AccessibilityDevTools();

    // Add keyboard shortcut (Ctrl+Shift+A)
    document.addEventListener('keydown', async (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'A') {
            e.preventDefault();
            const results = await window.accessibilityDevTools.highlightIssues();
            window.accessibilityDevTools.injectResultsUI(results);
        }
    });
}
```

#### 2. API Testing Integration
```python
#!/usr/bin/env python3
"""
API Accessibility Testing Integration
Tests accessibility of API responses that generate HTML content
"""

import requests
import json
from bs4 import BeautifulSoup
from selenium import webdriver
from axe_selenium_python import Axe
from typing import Dict, List, Any

class APIAccessibilityTester:
    def __init__(self):
        self.session = requests.Session()
        self.driver = None
        self.axe = None

    def setup_browser(self):
        """Setup headless browser for testing API responses"""
        from selenium.webdriver.chrome.options import Options
        options = Options()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')

        self.driver = webdriver.Chrome(options=options)
        self.axe = Axe(self.driver)

    def test_api_html_response(self, api_url: str, headers: Dict = None) -> Dict[str, Any]:
        """Test accessibility of HTML content returned by API"""

        # Make API request
        response = self.session.get(api_url, headers=headers or {})
        response.raise_for_status()

        # Check if response is HTML
        content_type = response.headers.get('content-type', '')
        if 'html' not in content_type.lower():
            return {'error': 'API response is not HTML content'}

        # Create temporary HTML page for testing
        html_content = response.text
        temp_html = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>API Response Test</title>
        </head>
        <body>
            {html_content}
        </body>
        </html>
        """

        # Load HTML in browser and test
        self.driver.get('data:text/html;charset=utf-8,' + temp_html)

        # Run accessibility test
        self.axe.inject()
        results = self.axe.run()

        return {
            'api_url': api_url,
            'response_status': response.status_code,
            'content_length': len(html_content),
            'accessibility_results': results
        }

    def test_json_api_with_template(self, api_url: str, template_file: str,
                                   headers: Dict = None) -> Dict[str, Any]:
        """Test accessibility of JSON API data rendered with template"""

        # Make API request
        response = self.session.get(api_url, headers=headers or {})
        response.raise_for_status()

        # Parse JSON response
        try:
            data = response.json()
        except json.JSONDecodeError:
            return {'error': 'API response is not valid JSON'}

        # Load template and render with data
        try:
            with open(template_file, 'r') as f:
                template_content = f.read()

            # Simple template rendering (in practice, use a proper template engine)
            rendered_html = self._render_template(template_content, data)

        except FileNotFoundError:
            return {'error': f'Template file not found: {template_file}'}

        # Load rendered HTML in browser and test
        self.driver.get('data:text/html;charset=utf-8,' + rendered_html)

        # Run accessibility test
        self.axe.inject()
        results = self.axe.run()

        return {
            'api_url': api_url,
            'template_file': template_file,
            'data_keys': list(data.keys()) if isinstance(data, dict) else 'non-dict',
            'accessibility_results': results
        }

    def _render_template(self, template: str, data: Dict) -> str:
        """Simple template rendering (replace with proper template engine)"""

        # Basic placeholder replacement
        rendered = template

        def replace_placeholder(match_obj):
            key = match_obj.group(1)
            return str(data.get(key, ''))

        import re
        rendered = re.sub(r'\{\{(\w+)\}\}', replace_placeholder, rendered)

        return rendered

    def test_form_submission_accessibility(self, form_url: str, form_data: Dict,
                                         headers: Dict = None) -> Dict[str, Any]:
        """Test accessibility of form submission responses"""

        # Submit form data
        response = self.session.post(form_url, data=form_data, headers=headers or {})

        # Handle different response types
        if response.headers.get('content-type', '').lower().startswith('application/json'):
            # JSON response - might contain HTML in a field
            try:
                json_data = response.json()
                html_content = None

                # Look for HTML content in common fields
                html_fields = ['html', 'content', 'message', 'body']
                for field in html_fields:
                    if field in json_data and isinstance(json_data[field], str):
                        if '<' in json_data[field] and '>' in json_data[field]:
                            html_content = json_data[field]
                            break

                if html_content:
                    # Test the HTML content
                    full_html = f"""
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <title>Form Response Test</title>
                    </head>
                    <body>{html_content}</body>
                    </html>
                    """

                    self.driver.get('data:text/html;charset=utf-8,' + full_html)
                    self.axe.inject()
                    results = self.axe.run()

                    return {
                        'form_url': form_url,
                        'response_type': 'json_with_html',
                        'accessibility_results': results
                    }
                else:
                    return {'form_url': form_url, 'response_type': 'json_no_html'}

            except json.JSONDecodeError:
                pass

        # HTML response
        if 'html' in response.headers.get('content-type', '').lower():
            self.driver.get('data:text/html;charset=utf-8,' + response.text)
            self.axe.inject()
            results = self.axe.run()

            return {
                'form_url': form_url,
                'response_type': 'html',
                'response_status': response.status_code,
                'accessibility_results': results
            }

        return {'form_url': form_url, 'response_type': 'unsupported'}

    def cleanup(self):
        """Clean up resources"""
        if self.driver:
            self.driver.quit()

# Usage example
if __name__ == "__main__":
    tester = APIAccessibilityTester()
    tester.setup_browser()

    try:
        # Test API endpoints
        api_tests = [
            {
                'url': 'https://api.example.com/user/profile/html',
                'headers': {'Accept': 'text/html'}
            },
            {
                'url': 'https://api.example.com/notifications',
                'headers': {'Accept': 'application/json'}
            }
        ]

        for test in api_tests:
            result = tester.test_api_html_response(test['url'], test['headers'])
            print(f"Tested {test['url']}: {len(result.get('accessibility_results', {}).get('violations', []))} violations")

        # Test form submissions
        form_result = tester.test_form_submission_accessibility(
            'https://example.com/contact',
            {'name': 'Test User', 'email': 'test@example.com', 'message': 'Test message'}
        )
        print(f"Form test: {form_result.get('response_type', 'unknown')}")

    finally:
        tester.cleanup()
```

## Quick Reference

### Automated Testing Checklist

#### Essential Automated Checks
- [ ] **Color Contrast** - Automated contrast ratio validation
- [ ] **Image Alt Text** - Missing or empty alt attributes
- [ ] **Form Labels** - Missing or improperly associated labels
- [ ] **Heading Structure** - Logical heading hierarchy
- [ ] **Link Text** - Descriptive link text validation
- [ ] **Keyboard Navigation** - Tab order and focus management
- [ ] **ARIA Usage** - Proper ARIA attributes and roles
- [ ] **HTML Validation** - Semantic HTML structure

#### CI/CD Integration Points
- [ ] **Pre-commit Hooks** - Basic accessibility linting
- [ ] **Pull Request Checks** - Automated accessibility scanning
- [ ] **Staging Deployment** - Full accessibility test suite
- [ ] **Production Monitoring** - Continuous accessibility monitoring

#### Tool Configuration
```bash
# Package.json scripts for accessibility testing
{
  "scripts": {
    "test:a11y": "axe --dir ./dist --exit",
    "test:a11y:ci": "axe --dir ./dist --save axe-results.json --exit",
    "lighthouse:a11y": "lhci autorun --config=./lighthouserc.json",
    "pa11y": "pa11y-ci --sitemap http://localhost:3000/sitemap.xml"
  }
}
```

### Common Automated Fixes

#### Auto-fixable Issues
```javascript
// Automated fix suggestions for common issues
const automaticFixes = {
    'missing-alt': {
        detect: 'img:not([alt])',
        fix: (element) => element.setAttribute('alt', '')
    },
    'missing-label': {
        detect: 'input:not([aria-label]):not([aria-labelledby])',
        fix: (element) => {
            const id = element.id || `input-${Date.now()}`;
            element.id = id;
            const label = document.createElement('label');
            label.setAttribute('for', id);
            label.textContent = 'Input field';
            element.parentNode.insertBefore(label, element);
        }
    },
    'missing-heading': {
        detect: 'main:not(:has(h1))',
        fix: (element) => {
            const h1 = document.createElement('h1');
            h1.textContent = document.title || 'Page Content';
            element.insertBefore(h1, element.firstChild);
        }
    }
};
```

This automated accessibility testing guide provides comprehensive frameworks and tools for implementing accessibility testing in development workflows. The next document will cover manual testing procedures and screen reader testing methodologies.