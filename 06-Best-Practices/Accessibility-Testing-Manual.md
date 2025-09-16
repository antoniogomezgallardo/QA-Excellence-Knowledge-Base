# Manual Accessibility Testing Guide

## Overview

Manual accessibility testing provides critical validation that automated tools cannot achieve, ensuring real user experiences are accessible and usable. This comprehensive guide establishes manual testing procedures, screen reader testing protocols, and WCAG compliance validation for QA professionals.

### Purpose and Scope
- Define manual accessibility testing procedures and methodologies
- Establish comprehensive screen reader testing protocols
- Provide WCAG 2.1 compliance validation frameworks
- Create user experience validation processes for assistive technologies

### Target Audience
- QA Engineers performing manual accessibility testing
- Accessibility specialists conducting compliance audits
- UX/UI designers validating inclusive design
- Product managers ensuring accessible user experiences

### Key Benefits
- Validates real user experiences with assistive technologies
- Identifies usability issues beyond technical compliance
- Ensures meaningful accessibility implementation
- Provides comprehensive WCAG compliance validation
- Tests complex interactions and user workflows

## Fundamental Principles

### Manual Testing Concepts

#### 1. Human-Centered Accessibility Testing
```
Manual Testing Focus Areas
├── User Experience Validation
│   ├── Screen reader navigation patterns
│   ├── Cognitive load assessment
│   ├── Task completion workflows
│   └── Error recovery procedures
├── Assistive Technology Compatibility
│   ├── Screen reader compatibility
│   ├── Voice control functionality
│   ├── Switch navigation support
│   └── Magnification software compatibility
├── Real-World Usage Scenarios
│   ├── Multi-step task completion
│   ├── Form submission workflows
│   ├── Error handling and recovery
│   └── Content comprehension validation
└── Contextual Accessibility
    ├── Content meaning and structure
    ├── Navigation efficiency
    ├── Information architecture
    └── User mental model alignment
```

#### 2. Manual vs Automated Testing Coverage

| Testing Aspect | Manual Coverage | Automated Coverage | Why Manual is Essential |
|---------------|-----------------|-------------------|------------------------|
| **Screen Reader Experience** | Complete | None | Requires human interpretation |
| **Content Quality** | Complete | Partial | Context and meaning validation |
| **Navigation Flow** | Complete | Basic | User workflow understanding |
| **Error Messages** | Complete | Partial | Clarity and helpfulness assessment |
| **Cognitive Load** | Complete | None | Human experience evaluation |
| **Task Completion** | Complete | None | End-to-end user journey validation |

#### 3. Disability-Specific Testing Approaches

| Disability Category | Manual Testing Focus | Key Validation Points |
|-------------------|---------------------|----------------------|
| **Visual Impairments** | Screen reader testing, content structure | Navigation efficiency, content comprehension |
| **Motor Impairments** | Keyboard-only testing, voice control | Task completion, error recovery |
| **Auditory Impairments** | Caption quality, visual alternatives | Information equivalence, visual indicators |
| **Cognitive Impairments** | Content clarity, navigation consistency | Cognitive load, task complexity |

## Step-by-Step Implementation

### Phase 1: Screen Reader Testing Framework

#### 1.1 Screen Reader Testing Setup and Protocols

```python
#!/usr/bin/env python3
"""
Screen Reader Testing Framework
Comprehensive framework for testing with multiple screen readers
"""

import time
import json
from enum import Enum
from dataclasses import dataclass
from typing import Dict, List, Any, Optional

class ScreenReader(Enum):
    NVDA = "NVDA"
    JAWS = "JAWS"
    VOICEOVER = "VoiceOver"
    TALKBACK = "TalkBack"
    ORCA = "Orca"

class TestComplexity(Enum):
    BASIC = "Basic"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"

@dataclass
class ScreenReaderTestCase:
    test_id: str
    description: str
    complexity: TestComplexity
    screen_reader: ScreenReader
    navigation_method: str
    expected_behavior: str
    actual_behavior: str = ""
    status: str = "Not Started"
    notes: str = ""
    time_to_complete: float = 0.0
    errors_encountered: List[str] = None

    def __post_init__(self):
        if self.errors_encountered is None:
            self.errors_encountered = []

class ScreenReaderTestingFramework:
    def __init__(self):
        self.test_cases = []
        self.test_sessions = []
        self.current_session = None

    def create_comprehensive_test_suite(self, url: str, screen_reader: ScreenReader) -> List[ScreenReaderTestCase]:
        """Create comprehensive test suite for specific screen reader"""

        test_cases = []

        # Basic Navigation Tests
        basic_tests = [
            ScreenReaderTestCase(
                test_id="SR001",
                description="Navigate page using heading structure",
                complexity=TestComplexity.BASIC,
                screen_reader=screen_reader,
                navigation_method="Heading navigation (H key or heading list)",
                expected_behavior="All headings announced with level, logical structure clear"
            ),
            ScreenReaderTestCase(
                test_id="SR002",
                description="Navigate using landmarks",
                complexity=TestComplexity.BASIC,
                screen_reader=screen_reader,
                navigation_method="Landmark navigation (D key or landmark list)",
                expected_behavior="All landmarks identified and accessible, clear page structure"
            ),
            ScreenReaderTestCase(
                test_id="SR003",
                description="Navigate all interactive elements",
                complexity=TestComplexity.BASIC,
                screen_reader=screen_reader,
                navigation_method="Tab key navigation",
                expected_behavior="All interactive elements reachable, clear purpose announced"
            ),
            ScreenReaderTestCase(
                test_id="SR004",
                description="Read all page content linearly",
                complexity=TestComplexity.BASIC,
                screen_reader=screen_reader,
                navigation_method="Arrow key reading (browse mode)",
                expected_behavior="All content readable, proper reading order, no missing information"
            )
        ]

        # Intermediate Tests
        intermediate_tests = [
            ScreenReaderTestCase(
                test_id="SR005",
                description="Navigate and interact with forms",
                complexity=TestComplexity.INTERMEDIATE,
                screen_reader=screen_reader,
                navigation_method="Form navigation (F key, Tab, arrow keys)",
                expected_behavior="All form fields accessible, labels clear, validation announced"
            ),
            ScreenReaderTestCase(
                test_id="SR006",
                description="Navigate data tables",
                complexity=TestComplexity.INTERMEDIATE,
                screen_reader=screen_reader,
                navigation_method="Table navigation (T key, Ctrl+Alt+arrows)",
                expected_behavior="Table structure clear, headers associated, navigation efficient"
            ),
            ScreenReaderTestCase(
                test_id="SR007",
                description="Interact with dynamic content",
                complexity=TestComplexity.INTERMEDIATE,
                screen_reader=screen_reader,
                navigation_method="ARIA live regions and focus management",
                expected_behavior="Changes announced appropriately, focus managed correctly"
            ),
            ScreenReaderTestCase(
                test_id="SR008",
                description="Navigate lists and nested structures",
                complexity=TestComplexity.INTERMEDIATE,
                screen_reader=screen_reader,
                navigation_method="List navigation (L key, list item counting)",
                expected_behavior="List structure clear, nesting announced, item count accurate"
            )
        ]

        # Advanced Tests
        advanced_tests = [
            ScreenReaderTestCase(
                test_id="SR009",
                description="Complete complex multi-step workflow",
                complexity=TestComplexity.ADVANCED,
                screen_reader=screen_reader,
                navigation_method="Mixed navigation strategies",
                expected_behavior="Task completable efficiently, progress clear, errors recoverable"
            ),
            ScreenReaderTestCase(
                test_id="SR010",
                description="Navigate complex interactive widgets",
                complexity=TestComplexity.ADVANCED,
                screen_reader=screen_reader,
                navigation_method="Widget-specific navigation patterns",
                expected_behavior="Widget functionality accessible, state changes announced"
            ),
            ScreenReaderTestCase(
                test_id="SR011",
                description="Handle error scenarios and recovery",
                complexity=TestComplexity.ADVANCED,
                screen_reader=screen_reader,
                navigation_method="Error navigation and correction",
                expected_behavior="Errors clearly announced, correction guidance provided"
            )
        ]

        test_cases.extend(basic_tests)
        test_cases.extend(intermediate_tests)
        test_cases.extend(advanced_tests)

        return test_cases

    def start_test_session(self, url: str, screen_reader: ScreenReader, tester_name: str) -> str:
        """Start new screen reader testing session"""

        session_id = f"session_{int(time.time())}"

        session = {
            'session_id': session_id,
            'url': url,
            'screen_reader': screen_reader,
            'tester_name': tester_name,
            'start_time': time.time(),
            'test_cases': self.create_comprehensive_test_suite(url, screen_reader),
            'status': 'In Progress'
        }

        self.test_sessions.append(session)
        self.current_session = session

        return session_id

    def execute_test_case(self, test_id: str, actual_behavior: str,
                         status: str, notes: str = "", errors: List[str] = None) -> Dict:
        """Record results for specific test case"""

        if not self.current_session:
            return {'error': 'No active testing session'}

        test_case = None
        for tc in self.current_session['test_cases']:
            if tc.test_id == test_id:
                test_case = tc
                break

        if not test_case:
            return {'error': f'Test case {test_id} not found'}

        # Record test execution
        test_case.actual_behavior = actual_behavior
        test_case.status = status
        test_case.notes = notes
        if errors:
            test_case.errors_encountered.extend(errors)

        return {
            'test_id': test_id,
            'status': status,
            'recorded': True
        }

    def generate_test_session_report(self, session_id: str) -> str:
        """Generate comprehensive test session report"""

        session = None
        for s in self.test_sessions:
            if s['session_id'] == session_id:
                session = s
                break

        if not session:
            return "Session not found"

        # Calculate statistics
        total_tests = len(session['test_cases'])
        passed_tests = sum(1 for tc in session['test_cases'] if tc.status == 'Pass')
        failed_tests = sum(1 for tc in session['test_cases'] if tc.status == 'Fail')
        blocked_tests = sum(1 for tc in session['test_cases'] if tc.status == 'Blocked')
        not_started = sum(1 for tc in session['test_cases'] if tc.status == 'Not Started')

        # Generate HTML report
        html_template = """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Screen Reader Testing Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
                .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                          gap: 15px; margin: 20px 0; }
                .summary-card { background: #f9f9f9; padding: 15px; border-radius: 5px; text-align: center; }
                .test-case { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
                .test-pass { background: #e8f5e8; border-left: 4px solid #4caf50; }
                .test-fail { background: #ffebee; border-left: 4px solid #f44336; }
                .test-blocked { background: #fff3e0; border-left: 4px solid #ff9800; }
                .test-not-started { background: #f5f5f5; border-left: 4px solid #9e9e9e; }
                .score { font-size: 1.5em; font-weight: bold; }
                .navigation-tip { background: #e3f2fd; padding: 10px; border-radius: 5px; margin: 5px 0; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Screen Reader Testing Report</h1>
                <p><strong>Session ID:</strong> {session_id}</p>
                <p><strong>URL:</strong> {url}</p>
                <p><strong>Screen Reader:</strong> {screen_reader}</p>
                <p><strong>Tester:</strong> {tester}</p>
                <p><strong>Date:</strong> {date}</p>
            </div>

            <div class="summary">
                <div class="summary-card">
                    <h3>Total Tests</h3>
                    <div class="score">{total}</div>
                </div>
                <div class="summary-card">
                    <h3>Passed</h3>
                    <div class="score" style="color: #4caf50;">{passed}</div>
                </div>
                <div class="summary-card">
                    <h3>Failed</h3>
                    <div class="score" style="color: #f44336;">{failed}</div>
                </div>
                <div class="summary-card">
                    <h3>Blocked</h3>
                    <div class="score" style="color: #ff9800;">{blocked}</div>
                </div>
                <div class="summary-card">
                    <h3>Success Rate</h3>
                    <div class="score">{success_rate}%</div>
                </div>
            </div>

            <h2>Test Results by Complexity</h2>
            {test_results}

            <h2>Pre-test Setup</h2>
            <div class="navigation-tip">
                <h3>Before starting {screen_reader} testing:</h3>
                <ul>
                    {setup_instructions}
                </ul>
            </div>

            <h2>Important Commands for {screen_reader}</h2>
            <div class="navigation-tip">
                {commands}
            </div>

            <h2>Post-test Notes</h2>
            <div class="navigation-tip">
                <h3>After completing tests:</h3>
                <ul>
                    <li>Document any unique issues or patterns discovered</li>
                    <li>Note any screen reader-specific behaviors</li>
                    <li>Identify priority issues for development team</li>
                    <li>Compare results with other screen reader testing sessions</li>
                </ul>
            </div>
        </body>
        </html>
        """

        # Generate test results by complexity
        test_results_html = ""
        complexities = [TestComplexity.BASIC, TestComplexity.INTERMEDIATE, TestComplexity.ADVANCED]

        for complexity in complexities:
            complexity_tests = [tc for tc in session['test_cases'] if tc.complexity == complexity]

            test_results_html += f"<h3>{complexity.value} Tests</h3>"

            for test_case in complexity_tests:
                status_class = f"test-{test_case.status.lower().replace(' ', '-')}"

                test_results_html += f"""
                <div class="test-case {status_class}">
                    <h4>Test {test_case.test_id}: {test_case.description}</h4>
                    <p><strong>Navigation Method:</strong> {test_case.navigation_method}</p>
                    <p><strong>Expected:</strong> {test_case.expected_behavior}</p>
                    <p><strong>Actual:</strong> {test_case.actual_behavior or 'Not recorded'}</p>
                    <p><strong>Status:</strong> {test_case.status}</p>
                    {f'<p><strong>Notes:</strong> {test_case.notes}</p>' if test_case.notes else ''}
                    {f'<p><strong>Errors:</strong> {", ".join(test_case.errors_encountered)}</p>' if test_case.errors_encountered else ''}
                </div>
                """

        # Generate screen reader specific instructions
        setup_instructions, commands = self._get_screen_reader_instructions(session['screen_reader'])

        success_rate = int((passed_tests / total_tests * 100)) if total_tests > 0 else 0

        return html_template.format(
            session_id=session['session_id'],
            url=session['url'],
            screen_reader=session['screen_reader'].value,
            tester=session['tester_name'],
            date=time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(session['start_time'])),
            total=total_tests,
            passed=passed_tests,
            failed=failed_tests,
            blocked=blocked_tests,
            success_rate=success_rate,
            test_results=test_results_html,
            setup_instructions=setup_instructions,
            commands=commands
        )

    def _get_screen_reader_instructions(self, screen_reader: ScreenReader) -> tuple:
        """Get screen reader specific setup instructions and commands"""

        instructions_map = {
            ScreenReader.NVDA: {
                'setup': [
                    'Download and install NVDA (free) from nvaccess.org',
                    'Ensure NVDA is running (Ctrl+Alt+N to start)',
                    'Set speech rate to comfortable level (NVDA+Ctrl+Arrow keys)',
                    'Configure verbosity settings (NVDA+V for voice settings)',
                    'Ensure focus tracking is enabled (default setting)'
                ],
                'commands': """
                    <ul>
                        <li><strong>NVDA+Space:</strong> Toggle between browse and focus modes</li>
                        <li><strong>H/Shift+H:</strong> Next/Previous heading</li>
                        <li><strong>1-6:</strong> Navigate by heading levels</li>
                        <li><strong>D/Shift+D:</strong> Next/Previous landmark</li>
                        <li><strong>B/Shift+B:</strong> Next/Previous button</li>
                        <li><strong>F/Shift+F:</strong> Next/Previous form field</li>
                        <li><strong>L/Shift+L:</strong> Next/Previous list</li>
                        <li><strong>T/Shift+T:</strong> Next/Previous table</li>
                        <li><strong>G/Shift+G:</strong> Next/Previous graphic</li>
                        <li><strong>NVDA+F7:</strong> Elements list (links, headings, landmarks)</li>
                        <li><strong>Insert+T:</strong> Read window title</li>
                        <li><strong>Insert+Down Arrow:</strong> Say all (read everything)</li>
                    </ul>
                """
            },
            ScreenReader.JAWS: {
                'setup': [
                    'Ensure JAWS is installed and licensed',
                    'Start JAWS before opening browser',
                    'Set speech rate to comfortable level (Ctrl+Alt+2-9)',
                    'Configure verbosity (Insert+V)',
                    'Ensure virtual cursor is enabled (default for web)'
                ],
                'commands': """
                    <ul>
                        <li><strong>Insert+Z:</strong> Toggle virtual cursor on/off</li>
                        <li><strong>H/Shift+H:</strong> Next/Previous heading</li>
                        <li><strong>1-6:</strong> Navigate by heading levels</li>
                        <li><strong>R/Shift+R:</strong> Next/Previous region (landmark)</li>
                        <li><strong>B/Shift+B:</strong> Next/Previous button</li>
                        <li><strong>F/Shift+F:</strong> Next/Previous form field</li>
                        <li><strong>L/Shift+L:</strong> Next/Previous list</li>
                        <li><strong>T/Shift+T:</strong> Next/Previous table</li>
                        <li><strong>G/Shift+G:</strong> Next/Previous graphic</li>
                        <li><strong>Insert+F6:</strong> Elements list</li>
                        <li><strong>Insert+T:</strong> Read window title</li>
                        <li><strong>Insert+Down Arrow:</strong> Say all</li>
                    </ul>
                """
            },
            ScreenReader.VOICEOVER: {
                'setup': [
                    'Enable VoiceOver in System Preferences > Accessibility',
                    'Start VoiceOver (Cmd+F5 or Cmd+Touch ID 3 times)',
                    'Set speech rate (VO+Cmd+Left/Right arrows)',
                    'Configure verbosity (VO+V)',
                    'Ensure web navigation is optimized'
                ],
                'commands': """
                    <ul>
                        <li><strong>VO+Cmd+H:</strong> Next heading</li>
                        <li><strong>VO+Cmd+Shift+H:</strong> Previous heading</li>
                        <li><strong>VO+Cmd+L:</strong> Next link</li>
                        <li><strong>VO+Cmd+J:</strong> Next form control</li>
                        <li><strong>VO+Cmd+T:</strong> Next table</li>
                        <li><strong>VO+Cmd+G:</strong> Next graphic</li>
                        <li><strong>VO+Cmd+X:</strong> Next list</li>
                        <li><strong>VO+U:</strong> Web rotor (elements list)</li>
                        <li><strong>VO+A:</strong> Read all</li>
                        <li><strong>VO+Shift+I:</strong> Read page statistics</li>
                    </ul>
                """
            },
            ScreenReader.TALKBACK: {
                'setup': [
                    'Enable TalkBack in Android Settings > Accessibility',
                    'Complete TalkBack tutorial for gesture familiarity',
                    'Adjust speech rate in TalkBack settings',
                    'Configure reading preferences',
                    'Ensure explore by touch is enabled'
                ],
                'commands': """
                    <ul>
                        <li><strong>Swipe Right:</strong> Next item</li>
                        <li><strong>Swipe Left:</strong> Previous item</li>
                        <li><strong>Swipe Up then Right:</strong> Next heading</li>
                        <li><strong>Swipe Up then Left:</strong> Previous heading</li>
                        <li><strong>Swipe Down then Right:</strong> Next link</li>
                        <li><strong>Swipe Down then Left:</strong> Previous link</li>
                        <li><strong>Double Tap:</strong> Activate item</li>
                        <li><strong>Two Finger Swipe Up:</strong> Read from top</li>
                        <li><strong>Three Finger Swipe Up:</strong> Scroll up</li>
                        <li><strong>Three Finger Swipe Down:</strong> Scroll down</li>
                    </ul>
                """
            }
        }

        screen_reader_info = instructions_map.get(screen_reader, {
            'setup': ['Configure screen reader according to documentation'],
            'commands': '<p>Refer to screen reader documentation for navigation commands</p>'
        })

        setup_html = '\n'.join(f'<li>{instruction}</li>' for instruction in screen_reader_info['setup'])

        return setup_html, screen_reader_info['commands']

# Usage example with manual testing workflow
if __name__ == "__main__":
    # Initialize testing framework
    framework = ScreenReaderTestingFramework()

    # Start testing session
    session_id = framework.start_test_session(
        url="https://example.com",
        screen_reader=ScreenReader.NVDA,
        tester_name="QA Tester"
    )

    print(f"Started testing session: {session_id}")
    print("Execute tests manually and record results using execute_test_case()")

    # Example of recording test results (would be done manually during testing)
    framework.execute_test_case(
        test_id="SR001",
        actual_behavior="Headings announced correctly with levels, logical structure maintained",
        status="Pass",
        notes="Navigation was efficient and intuitive"
    )

    framework.execute_test_case(
        test_id="SR002",
        actual_behavior="Main landmark missing, navigation unclear",
        status="Fail",
        notes="Unable to efficiently navigate page structure",
        errors=["Missing main landmark", "No skip navigation"]
    )

    # Generate report
    report_html = framework.generate_test_session_report(session_id)

    with open(f'screen_reader_report_{session_id}.html', 'w') as f:
        f.write(report_html)

    print(f"Report generated: screen_reader_report_{session_id}.html")
```

### Phase 2: WCAG Compliance Validation

#### 2.1 WCAG 2.1 Compliance Checker Framework

```python
#!/usr/bin/env python3
"""
WCAG 2.1 Compliance Validation Framework
Comprehensive manual testing framework for WCAG 2.1 compliance
"""

from enum import Enum
from dataclasses import dataclass
from typing import Dict, List, Any, Optional
import time
import json

class WCAGLevel(Enum):
    A = "A"
    AA = "AA"
    AAA = "AAA"

class WCAGPrinciple(Enum):
    PERCEIVABLE = "Perceivable"
    OPERABLE = "Operable"
    UNDERSTANDABLE = "Understandable"
    ROBUST = "Robust"

class TestResult(Enum):
    PASS = "Pass"
    FAIL = "Fail"
    NOT_APPLICABLE = "Not Applicable"
    NOT_TESTED = "Not Tested"

@dataclass
class WCAGCriterion:
    number: str
    title: str
    level: WCAGLevel
    principle: WCAGPrinciple
    description: str
    testing_procedure: str
    success_criteria: List[str]
    common_failures: List[str]
    testing_tools: List[str]

@dataclass
class ComplianceTestResult:
    criterion: WCAGCriterion
    result: TestResult
    evidence: str = ""
    notes: str = ""
    recommendations: List[str] = None
    impact_assessment: str = ""
    retest_required: bool = False

    def __post_init__(self):
        if self.recommendations is None:
            self.recommendations = []

class WCAGComplianceValidator:
    def __init__(self):
        self.criteria = self._initialize_wcag_criteria()
        self.test_results = []
        self.current_audit = None

    def _initialize_wcag_criteria(self) -> List[WCAGCriterion]:
        """Initialize WCAG 2.1 criteria for testing"""

        criteria = []

        # Perceivable Criteria
        criteria.extend([
            WCAGCriterion(
                number="1.1.1",
                title="Non-text Content",
                level=WCAGLevel.A,
                principle=WCAGPrinciple.PERCEIVABLE,
                description="All non-text content has a text alternative that serves the equivalent purpose",
                testing_procedure="""
                1. Identify all images, icons, charts, and media
                2. Check for appropriate alt text or text alternatives
                3. Verify alt text conveys the same information as the image
                4. For decorative images, verify empty alt text (alt="")
                5. For complex images, verify extended descriptions are available
                """,
                success_criteria=[
                    "Images have descriptive alt text that conveys content/function",
                    "Decorative images have empty alt text",
                    "Complex images have extended descriptions",
                    "Form image buttons have descriptive alt text",
                    "Image maps have alt text for each area"
                ],
                common_failures=[
                    "Missing alt attributes on images",
                    "Generic alt text like 'image' or 'photo'",
                    "Alt text that doesn't convey image purpose",
                    "Decorative images with descriptive alt text",
                    "Missing extended descriptions for complex images"
                ],
                testing_tools=["Screen reader", "Browser inspector", "Manual inspection"]
            ),
            WCAGCriterion(
                number="1.3.1",
                title="Info and Relationships",
                level=WCAGLevel.A,
                principle=WCAGPrinciple.PERCEIVABLE,
                description="Information, structure, and relationships conveyed through presentation can be programmatically determined",
                testing_procedure="""
                1. Check heading structure (h1-h6) for logical hierarchy
                2. Verify lists use proper list markup (ul, ol, dl)
                3. Check form labels are properly associated
                4. Verify table headers are marked up correctly
                5. Check ARIA labels and relationships
                6. Test with screen reader to verify structure is announced
                """,
                success_criteria=[
                    "Headings create logical page outline",
                    "Lists are marked up as lists",
                    "Form controls have associated labels",
                    "Tables have proper headers",
                    "Related content is grouped logically"
                ],
                common_failures=[
                    "Using visual formatting instead of proper markup",
                    "Missing or incorrect heading hierarchy",
                    "Form controls without labels",
                    "Tables without headers",
                    "Lists not marked up as lists"
                ],
                testing_tools=["Screen reader", "Browser inspector", "WAVE", "axe DevTools"]
            ),
            WCAGCriterion(
                number="1.4.3",
                title="Contrast (Minimum)",
                level=WCAGLevel.AA,
                principle=WCAGPrinciple.PERCEIVABLE,
                description="Text and background have a contrast ratio of at least 4.5:1",
                testing_procedure="""
                1. Use color contrast analyzer on all text
                2. Check normal text has 4.5:1 contrast ratio
                3. Check large text (18pt+ or 14pt+ bold) has 3:1 ratio
                4. Test all text colors against backgrounds
                5. Check text over images and gradients
                6. Verify focus indicators have sufficient contrast
                """,
                success_criteria=[
                    "Normal text: 4.5:1 contrast ratio minimum",
                    "Large text: 3:1 contrast ratio minimum",
                    "Focus indicators have sufficient contrast",
                    "Text over images is readable",
                    "All text colors meet requirements"
                ],
                common_failures=[
                    "Light gray text on white backgrounds",
                    "Low contrast focus indicators",
                    "Text over background images without sufficient contrast",
                    "Placeholder text with insufficient contrast",
                    "Button text with poor contrast"
                ],
                testing_tools=["Color Contrast Analyser", "WAVE", "axe DevTools", "Browser DevTools"]
            )
        ])

        # Operable Criteria
        criteria.extend([
            WCAGCriterion(
                number="2.1.1",
                title="Keyboard",
                level=WCAGLevel.A,
                principle=WCAGPrinciple.OPERABLE,
                description="All functionality is available from a keyboard",
                testing_procedure="""
                1. Navigate entire page using only keyboard
                2. Test Tab key to reach all interactive elements
                3. Test Shift+Tab for reverse navigation
                4. Test Enter and Space keys for activation
                5. Test arrow keys for custom widgets
                6. Verify no keyboard traps exist
                7. Check all functionality is keyboard accessible
                """,
                success_criteria=[
                    "All interactive elements reachable via keyboard",
                    "Tab order is logical and efficient",
                    "No keyboard traps present",
                    "All functionality available via keyboard",
                    "Custom widgets follow standard keyboard patterns"
                ],
                common_failures=[
                    "Interactive elements not reachable by keyboard",
                    "Keyboard traps that prevent navigation",
                    "Missing keyboard event handlers",
                    "Illogical tab order",
                    "Custom widgets without keyboard support"
                ],
                testing_tools=["Keyboard testing", "Screen reader", "Browser DevTools"]
            ),
            WCAGCriterion(
                number="2.4.3",
                title="Focus Order",
                level=WCAGLevel.A,
                principle=WCAGPrinciple.OPERABLE,
                description="Focusable components receive focus in an order that preserves meaning and operability",
                testing_procedure="""
                1. Tab through page from start to finish
                2. Verify tab order follows logical reading order
                3. Check focus moves to related content appropriately
                4. Test focus order with dynamic content
                5. Verify modal dialogs trap focus appropriately
                6. Check focus returns to appropriate location after interactions
                """,
                success_criteria=[
                    "Tab order follows logical sequence",
                    "Focus order preserves meaning",
                    "Modal dialogs trap focus appropriately",
                    "Focus returns to appropriate locations",
                    "Dynamic content maintains logical focus order"
                ],
                common_failures=[
                    "Tab order doesn't follow visual order",
                    "Focus jumps around illogically",
                    "Missing focus management in dynamic content",
                    "Modal dialogs don't trap focus",
                    "Focus lost after interactions"
                ],
                testing_tools=["Keyboard testing", "Focus indicators", "Manual inspection"]
            )
        ])

        # Understandable Criteria
        criteria.extend([
            WCAGCriterion(
                number="3.1.1",
                title="Language of Page",
                level=WCAGLevel.A,
                principle=WCAGPrinciple.UNDERSTANDABLE,
                description="The default human language of each web page can be programmatically determined",
                testing_procedure="""
                1. Check HTML lang attribute is present
                2. Verify lang attribute has valid language code
                3. Check lang attribute matches page content language
                4. Test with screen reader to verify correct pronunciation
                5. Check any language changes are marked up
                """,
                success_criteria=[
                    "HTML has lang attribute",
                    "Lang attribute uses valid language code",
                    "Language code matches content language",
                    "Language changes are marked appropriately"
                ],
                common_failures=[
                    "Missing lang attribute on html element",
                    "Invalid language codes",
                    "Wrong language code for content",
                    "Language changes not marked up"
                ],
                testing_tools=["Browser inspector", "Screen reader", "Markup validation"]
            ),
            WCAGCriterion(
                number="3.3.2",
                title="Labels or Instructions",
                level=WCAGLevel.A,
                principle=WCAGPrinciple.UNDERSTANDABLE,
                description="Labels or instructions are provided when content requires user input",
                testing_procedure="""
                1. Check all form fields have labels
                2. Verify labels clearly describe the required input
                3. Check required fields are clearly marked
                4. Verify format requirements are communicated
                5. Test instructions are available when needed
                6. Check error prevention guidance is provided
                """,
                success_criteria=[
                    "All form fields have descriptive labels",
                    "Required fields are clearly marked",
                    "Input format requirements are explained",
                    "Instructions are provided when needed",
                    "Error prevention guidance is available"
                ],
                common_failures=[
                    "Form fields without labels",
                    "Vague or unclear labels",
                    "Required fields not marked",
                    "Missing format instructions",
                    "No guidance for error prevention"
                ],
                testing_tools=["Screen reader", "Form testing", "Manual inspection"]
            )
        ])

        # Robust Criteria
        criteria.extend([
            WCAGCriterion(
                number="4.1.1",
                title="Parsing",
                level=WCAGLevel.A,
                principle=WCAGPrinciple.ROBUST,
                description="Content is implemented using valid HTML markup",
                testing_procedure="""
                1. Validate HTML markup using W3C validator
                2. Check for proper opening/closing tags
                3. Verify unique IDs throughout page
                4. Check attribute syntax is correct
                5. Test with multiple browsers and assistive technologies
                """,
                success_criteria=[
                    "HTML validates without critical errors",
                    "All elements have complete start and end tags",
                    "IDs are unique throughout page",
                    "Attributes follow proper syntax",
                    "Markup works across browsers and AT"
                ],
                common_failures=[
                    "Missing closing tags",
                    "Duplicate IDs",
                    "Invalid HTML attributes",
                    "Malformed markup",
                    "Browser-specific markup that fails elsewhere"
                ],
                testing_tools=["W3C Markup Validator", "Browser DevTools", "Cross-browser testing"]
            ),
            WCAGCriterion(
                number="4.1.2",
                title="Name, Role, Value",
                level=WCAGLevel.A,
                principle=WCAGPrinciple.ROBUST,
                description="UI components have accessible names, roles, and values that can be programmatically determined",
                testing_procedure="""
                1. Test all interactive elements with screen reader
                2. Verify accessible names are announced
                3. Check roles are communicated correctly
                4. Verify states and values are announced
                5. Test custom widgets have appropriate ARIA
                6. Check changes in state are announced
                """,
                success_criteria=[
                    "All UI components have accessible names",
                    "Roles are programmatically determined",
                    "States and values are accessible",
                    "Custom widgets use appropriate ARIA",
                    "State changes are announced"
                ],
                common_failures=[
                    "Interactive elements without accessible names",
                    "Custom widgets without proper ARIA",
                    "State changes not announced",
                    "Missing or incorrect role information",
                    "Values not programmatically available"
                ],
                testing_tools=["Screen reader", "ARIA inspector", "axe DevTools"]
            )
        ])

        return criteria

    def start_compliance_audit(self, url: str, target_level: WCAGLevel, auditor_name: str) -> str:
        """Start new WCAG compliance audit"""

        audit_id = f"audit_{int(time.time())}"

        self.current_audit = {
            'audit_id': audit_id,
            'url': url,
            'target_level': target_level,
            'auditor_name': auditor_name,
            'start_time': time.time(),
            'applicable_criteria': self._get_applicable_criteria(target_level),
            'status': 'In Progress'
        }

        return audit_id

    def _get_applicable_criteria(self, target_level: WCAGLevel) -> List[WCAGCriterion]:
        """Get criteria applicable for target compliance level"""

        applicable = []

        for criterion in self.criteria:
            if target_level == WCAGLevel.A and criterion.level == WCAGLevel.A:
                applicable.append(criterion)
            elif target_level == WCAGLevel.AA and criterion.level in [WCAGLevel.A, WCAGLevel.AA]:
                applicable.append(criterion)
            elif target_level == WCAGLevel.AAA:  # All criteria
                applicable.append(criterion)

        return applicable

    def test_criterion(self, criterion_number: str, result: TestResult,
                      evidence: str = "", notes: str = "",
                      recommendations: List[str] = None) -> Dict:
        """Record test result for specific WCAG criterion"""

        if not self.current_audit:
            return {'error': 'No active audit'}

        # Find criterion
        criterion = None
        for c in self.current_audit['applicable_criteria']:
            if c.number == criterion_number:
                criterion = c
                break

        if not criterion:
            return {'error': f'Criterion {criterion_number} not found in current audit'}

        # Create test result
        test_result = ComplianceTestResult(
            criterion=criterion,
            result=result,
            evidence=evidence,
            notes=notes,
            recommendations=recommendations or []
        )

        # Add impact assessment based on result and level
        if result == TestResult.FAIL:
            if criterion.level == WCAGLevel.A:
                test_result.impact_assessment = "High - Blocks basic accessibility"
            elif criterion.level == WCAGLevel.AA:
                test_result.impact_assessment = "Medium - Affects standard accessibility"
            else:
                test_result.impact_assessment = "Low - Affects enhanced accessibility"
            test_result.retest_required = True

        self.test_results.append(test_result)

        return {
            'criterion_number': criterion_number,
            'result': result.value,
            'recorded': True
        }

    def generate_compliance_report(self) -> str:
        """Generate comprehensive WCAG compliance report"""

        if not self.current_audit:
            return "No active audit to report on"

        # Calculate compliance statistics
        total_criteria = len(self.current_audit['applicable_criteria'])
        tested_criteria = len(self.test_results)
        passed_criteria = sum(1 for r in self.test_results if r.result == TestResult.PASS)
        failed_criteria = sum(1 for r in self.test_results if r.result == TestResult.FAIL)
        na_criteria = sum(1 for r in self.test_results if r.result == TestResult.NOT_APPLICABLE)
        not_tested = total_criteria - tested_criteria

        # Calculate compliance percentage
        testable_criteria = total_criteria - na_criteria
        compliance_percentage = (passed_criteria / testable_criteria * 100) if testable_criteria > 0 else 0

        # Group results by principle
        results_by_principle = {}
        for result in self.test_results:
            principle = result.criterion.principle.value
            if principle not in results_by_principle:
                results_by_principle[principle] = []
            results_by_principle[principle].append(result)

        html_template = """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>WCAG 2.1 Compliance Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                .header { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
                .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                          gap: 15px; margin: 20px 0; }
                .summary-card { background: #f9f9f9; padding: 15px; border-radius: 5px; text-align: center; }
                .compliance-score { font-size: 2.5em; font-weight: bold; margin: 10px 0; }
                .score-excellent { color: #4caf50; }
                .score-good { color: #ff9800; }
                .score-poor { color: #f44336; }
                .principle-section { margin: 30px 0; }
                .criterion { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
                .criterion-pass { background: #e8f5e8; border-left: 4px solid #4caf50; }
                .criterion-fail { background: #ffebee; border-left: 4px solid #f44336; }
                .criterion-na { background: #f5f5f5; border-left: 4px solid #9e9e9e; }
                .criterion-not-tested { background: #fff3e0; border-left: 4px solid #ff9800; }
                .recommendations { background: #e3f2fd; padding: 10px; border-radius: 5px; margin: 10px 0; }
                .impact-high { color: #f44336; font-weight: bold; }
                .impact-medium { color: #ff9800; font-weight: bold; }
                .impact-low { color: #9e9e9e; }
                .executive-summary { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>WCAG 2.1 Compliance Report</h1>
                <p><strong>Audit ID:</strong> {audit_id}</p>
                <p><strong>URL:</strong> {url}</p>
                <p><strong>Target Level:</strong> WCAG 2.1 {target_level}</p>
                <p><strong>Auditor:</strong> {auditor}</p>
                <p><strong>Date:</strong> {date}</p>
            </div>

            <div class="executive-summary">
                <h2>Executive Summary</h2>
                <div class="compliance-score {score_class}">{compliance_percentage:.1f}%</div>
                <p><strong>Compliance Status:</strong> {compliance_status}</p>
                <p>This audit evaluated {total_criteria} WCAG 2.1 {target_level} criteria.
                   {passed_criteria} criteria passed, {failed_criteria} failed, and {na_criteria} were not applicable.</p>
                {critical_issues}
            </div>

            <div class="summary">
                <div class="summary-card">
                    <h3>Total Criteria</h3>
                    <div style="font-size: 1.5em; font-weight: bold;">{total_criteria}</div>
                </div>
                <div class="summary-card">
                    <h3>Passed</h3>
                    <div style="font-size: 1.5em; font-weight: bold; color: #4caf50;">{passed_criteria}</div>
                </div>
                <div class="summary-card">
                    <h3>Failed</h3>
                    <div style="font-size: 1.5em; font-weight: bold; color: #f44336;">{failed_criteria}</div>
                </div>
                <div class="summary-card">
                    <h3>Not Applicable</h3>
                    <div style="font-size: 1.5em; font-weight: bold; color: #9e9e9e;">{na_criteria}</div>
                </div>
                <div class="summary-card">
                    <h3>Not Tested</h3>
                    <div style="font-size: 1.5em; font-weight: bold; color: #ff9800;">{not_tested}</div>
                </div>
            </div>

            <h2>Results by Principle</h2>
            {results_by_principle}

            <h2>Recommendations Summary</h2>
            <div class="recommendations">
                <h3>Priority Actions</h3>
                {priority_recommendations}
            </div>

        </body>
        </html>
        """

        # Determine compliance status and score class
        if compliance_percentage >= 95:
            compliance_status = "Excellent - Meets WCAG standards"
            score_class = "score-excellent"
        elif compliance_percentage >= 80:
            compliance_status = "Good - Minor issues to address"
            score_class = "score-good"
        else:
            compliance_status = "Poor - Significant accessibility barriers"
            score_class = "score-poor"

        # Generate critical issues summary
        critical_issues = ""
        high_impact_failures = [r for r in self.test_results
                               if r.result == TestResult.FAIL and "High" in r.impact_assessment]

        if high_impact_failures:
            critical_issues = f"""
            <div style="background: #ffebee; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <h3 style="color: #f44336;">⚠️ Critical Issues Found</h3>
                <p>{len(high_impact_failures)} Level A criteria failed, creating significant accessibility barriers.</p>
                <p><strong>Immediate action required</strong> to ensure basic accessibility compliance.</p>
            </div>
            """

        # Generate results by principle
        results_html = ""
        for principle, principle_results in results_by_principle.items():
            results_html += f"<div class='principle-section'><h3>{principle}</h3>"

            for result in principle_results:
                status_class = f"criterion-{result.result.value.lower().replace(' ', '-')}"

                results_html += f"""
                <div class="criterion {status_class}">
                    <h4>{result.criterion.number}: {result.criterion.title}</h4>
                    <p><strong>Level:</strong> {result.criterion.level.value}</p>
                    <p><strong>Result:</strong> {result.result.value}</p>
                    <p><strong>Description:</strong> {result.criterion.description}</p>
                    {f'<p><strong>Evidence:</strong> {result.evidence}</p>' if result.evidence else ''}
                    {f'<p><strong>Notes:</strong> {result.notes}</p>' if result.notes else ''}
                    {f'<p><strong>Impact:</strong> <span class="impact-{result.impact_assessment.split(" - ")[0].lower()}">{result.impact_assessment}</span></p>' if result.impact_assessment else ''}
                    {f'<div class="recommendations"><h5>Recommendations:</h5><ul>{"".join(f"<li>{rec}</li>" for rec in result.recommendations)}</ul></div>' if result.recommendations else ''}
                </div>
                """

            results_html += "</div>"

        # Generate priority recommendations
        all_recommendations = []
        for result in self.test_results:
            if result.result == TestResult.FAIL and result.recommendations:
                all_recommendations.extend(result.recommendations)

        priority_recs_html = ""
        if all_recommendations:
            # Get unique recommendations
            unique_recs = list(set(all_recommendations))
            priority_recs_html = "<ul>" + "".join(f"<li>{rec}</li>" for rec in unique_recs[:10]) + "</ul>"
        else:
            priority_recs_html = "<p>No specific recommendations at this time.</p>"

        return html_template.format(
            audit_id=self.current_audit['audit_id'],
            url=self.current_audit['url'],
            target_level=self.current_audit['target_level'].value,
            auditor=self.current_audit['auditor_name'],
            date=time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(self.current_audit['start_time'])),
            compliance_percentage=compliance_percentage,
            score_class=score_class,
            compliance_status=compliance_status,
            critical_issues=critical_issues,
            total_criteria=total_criteria,
            passed_criteria=passed_criteria,
            failed_criteria=failed_criteria,
            na_criteria=na_criteria,
            not_tested=not_tested,
            results_by_principle=results_html,
            priority_recommendations=priority_recs_html
        )

# Usage example
if __name__ == "__main__":
    # Initialize compliance validator
    validator = WCAGComplianceValidator()

    # Start compliance audit
    audit_id = validator.start_compliance_audit(
        url="https://example.com",
        target_level=WCAGLevel.AA,
        auditor_name="Accessibility Specialist"
    )

    print(f"Started WCAG compliance audit: {audit_id}")

    # Example test results (would be recorded during manual testing)
    validator.test_criterion(
        criterion_number="1.1.1",
        result=TestResult.FAIL,
        evidence="3 images missing alt text on homepage",
        notes="Product images in carousel lack descriptive alt text",
        recommendations=[
            "Add descriptive alt text to all product images",
            "Implement alt text guidelines for content editors",
            "Set up automated testing for missing alt attributes"
        ]
    )

    validator.test_criterion(
        criterion_number="1.4.3",
        result=TestResult.PASS,
        evidence="All text meets 4.5:1 contrast ratio requirement",
        notes="Tested with Color Contrast Analyser, all combinations pass"
    )

    validator.test_criterion(
        criterion_number="2.1.1",
        result=TestResult.FAIL,
        evidence="Dropdown menu not accessible via keyboard",
        notes="Cannot access submenu items using keyboard navigation",
        recommendations=[
            "Implement keyboard event handlers for dropdown menu",
            "Add ARIA attributes for menu structure",
            "Test keyboard navigation patterns thoroughly"
        ]
    )

    # Generate compliance report
    report_html = validator.generate_compliance_report()

    with open(f'wcag_compliance_report_{audit_id}.html', 'w') as f:
        f.write(report_html)

    print(f"WCAG compliance report generated: wcag_compliance_report_{audit_id}.html")
```

## Manual Testing Procedures

### Comprehensive Manual Testing Checklist

#### Essential Manual Testing Areas

```markdown
# Manual Accessibility Testing Checklist

## Pre-Testing Setup
- [ ] **Test Environment**
  - [ ] Test in primary browser with screen reader installed
  - [ ] Disable mouse to force keyboard-only navigation
  - [ ] Test at different zoom levels (100%, 200%, 400%)
  - [ ] Test with Windows High Contrast mode enabled
  - [ ] Test with browser accessibility features enabled

## Screen Reader Testing
- [ ] **Basic Navigation** (30 minutes)
  - [ ] Navigate using headings (H key)
  - [ ] Navigate using landmarks (D key)
  - [ ] Tab through all interactive elements
  - [ ] Read entire page linearly (down arrow)

- [ ] **Complex Interactions** (45 minutes)
  - [ ] Complete primary user tasks
  - [ ] Fill out and submit forms
  - [ ] Navigate data tables
  - [ ] Interact with custom widgets
  - [ ] Handle error scenarios

## Keyboard Testing
- [ ] **Navigation Patterns** (20 minutes)
  - [ ] Tab reaches all interactive elements
  - [ ] Shift+Tab works in reverse
  - [ ] Tab order is logical
  - [ ] No keyboard traps exist
  - [ ] Skip links function properly

- [ ] **Interaction Testing** (25 minutes)
  - [ ] Enter/Space activate buttons and links
  - [ ] Arrow keys work in custom widgets
  - [ ] Escape key cancels operations
  - [ ] Focus indicators are visible
  - [ ] Modal dialogs trap focus appropriately

## Visual Testing
- [ ] **Color and Contrast** (15 minutes)
  - [ ] All text meets contrast requirements
  - [ ] Information isn't conveyed by color alone
  - [ ] Focus indicators are visible
  - [ ] Error states are clearly visible

- [ ] **Zoom and Magnification** (15 minutes)
  - [ ] Content remains functional at 200% zoom
  - [ ] No horizontal scrolling at 400% zoom
  - [ ] Text reflows appropriately
  - [ ] Interactive elements remain accessible

## Cognitive Testing
- [ ] **Content Understanding** (20 minutes)
  - [ ] Instructions are clear and complete
  - [ ] Error messages are helpful
  - [ ] Language is appropriate for audience
  - [ ] Content organization is logical

- [ ] **Task Completion** (30 minutes)
  - [ ] Primary tasks can be completed efficiently
  - [ ] Error recovery is possible
  - [ ] Help information is available
  - [ ] Progress indicators are clear
```

### Assistive Technology Testing Matrix

| Technology | Testing Frequency | Key Focus Areas | Pass Criteria |
|------------|------------------|-----------------|---------------|
| **NVDA (Windows)** | Every Release | Navigation efficiency, content comprehension | All content accessible, tasks completable |
| **JAWS (Windows)** | Major Releases | Complex widgets, form interactions | Full functionality available |
| **VoiceOver (macOS)** | Major Releases | Mobile patterns, touch interfaces | Touch and keyboard navigation work |
| **TalkBack (Android)** | Mobile Releases | Touch gestures, mobile workflows | Mobile tasks completable |
| **Dragon (Voice)** | Quarterly | Voice commands, dictation | Voice interaction fully functional |

## Quick Reference

### Manual Testing Time Estimates

| Testing Type | Basic (< 5 pages) | Medium (5-20 pages) | Complex (20+ pages) |
|--------------|------------------|-------------------|-------------------|
| **Screen Reader** | 2-3 hours | 6-8 hours | 2-3 days |
| **Keyboard Only** | 1-2 hours | 3-4 hours | 1 day |
| **WCAG Compliance** | 4-6 hours | 1-2 days | 3-5 days |
| **Complete Audit** | 1 day | 2-3 days | 1-2 weeks |

### Common Manual Testing Findings

#### High Priority Issues
- Content not accessible to screen readers
- Keyboard navigation completely blocked
- Critical functionality missing keyboard support
- Form submission impossible with assistive technology

#### Medium Priority Issues
- Inefficient navigation patterns
- Missing or unclear labels
- Poor focus management
- Inconsistent interaction patterns

#### Low Priority Issues
- Suboptimal but functional navigation
- Minor usability improvements
- Enhanced experience opportunities
- Advanced feature accessibility

This manual accessibility testing guide provides comprehensive frameworks for human-centered accessibility validation that cannot be achieved through automated testing alone.