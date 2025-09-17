# Advanced Quality Metrics and Analytics Guide

## Overview

Advanced quality metrics provide data-driven insights into software quality, enabling predictive analytics, automated decision-making, and strategic quality investment optimization. This comprehensive guide establishes enterprise-grade quality measurement frameworks, real-time monitoring systems, and executive reporting strategies.

### Purpose and Scope
- Define comprehensive quality measurement frameworks and KPIs
- Establish predictive analytics and machine learning for quality forecasting
- Provide real-time quality monitoring and alerting systems
- Create executive-level quality dashboards and business value metrics

### Target Audience
- QA Managers implementing enterprise quality measurement systems
- Data Engineers building quality analytics platforms
- Engineering Directors making data-driven quality investments
- Executive stakeholders requiring quality business insights

### Key Benefits
- Enables data-driven quality decisions and resource optimization
- Provides predictive insights into quality trends and risks
- Demonstrates measurable business value of quality investments
- Facilitates proactive quality management and early intervention
- Creates transparent quality visibility across organization levels

## Fundamental Principles

### Advanced Quality Metrics Philosophy

#### 1. Quality Metrics Hierarchy
```
Enterprise Quality Metrics Framework
├── Strategic Metrics (Executive Level)
│   ├── Quality ROI and business impact
│   ├── Customer satisfaction correlation
│   ├── Market competitiveness indicators
│   └── Quality investment optimization
├── Tactical Metrics (Product Level)
│   ├── Release quality trends
│   ├── Feature quality assessment
│   ├── Technical debt tracking
│   └── Quality velocity indicators
├── Operational Metrics (Team Level)
│   ├── Test effectiveness measurement
│   ├── Defect detection efficiency
│   ├── Quality gate performance
│   └── Process improvement tracking
└── Real-time Metrics (System Level)
    ├── Production quality monitoring
    ├── User experience indicators
    ├── System reliability metrics
    └── Performance quality trends
```

#### 2. Quality Metrics Categories

| Metric Category | Business Purpose | Measurement Frequency | Stakeholder Audience |
|----------------|------------------|----------------------|---------------------|
| **Business Impact** | ROI demonstration, investment justification | Monthly/Quarterly | Executives, Product |
| **Quality Velocity** | Development efficiency, delivery speed | Weekly/Sprint | Engineering, Management |
| **User Experience** | Customer satisfaction, product success | Daily/Real-time | Product, Support |
| **Technical Health** | System reliability, maintainability | Continuous | Engineering, Operations |
| **Process Effectiveness** | Team performance, improvement tracking | Weekly/Monthly | QA, Process |

#### 3. Quality Metrics Anti-Patterns

❌ **Vanity Metrics Focus**
- Avoid metrics that look impressive but don't drive decisions
- Focus on actionable insights and business correlation

❌ **Metrics Without Context**
- Always provide baseline comparisons and trend analysis
- Include external factors affecting quality metrics

❌ **Static Metric Definitions**
- Evolve metrics based on organizational maturity
- Regularly reassess metric relevance and value

❌ **Alert Fatigue**
- Design intelligent alerting with proper thresholds
- Focus on actionable alerts that require intervention

## Step-by-Step Implementation

### Phase 1: Advanced Quality Metrics Foundation

#### 1.1 Comprehensive Quality Metrics Framework

```python
#!/usr/bin/env python3
"""
Advanced Quality Metrics and Analytics Framework
Enterprise-grade quality measurement with predictive analytics and real-time monitoring
"""

import json
import time
import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional, Tuple, Callable
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime, timedelta
import sqlite3
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import warnings
warnings.filterwarnings('ignore')

class MetricType(Enum):
    BUSINESS_IMPACT = "business_impact"
    QUALITY_VELOCITY = "quality_velocity"
    USER_EXPERIENCE = "user_experience"
    TECHNICAL_HEALTH = "technical_health"
    PROCESS_EFFECTIVENESS = "process_effectiveness"

class MetricFrequency(Enum):
    REAL_TIME = "real_time"
    HOURLY = "hourly"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"

class AlertSeverity(Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

@dataclass
class QualityMetric:
    metric_id: str
    name: str
    description: str
    metric_type: MetricType
    frequency: MetricFrequency
    calculation_method: str
    target_value: Optional[float] = None
    warning_threshold: Optional[float] = None
    critical_threshold: Optional[float] = None
    business_context: str = ""
    data_source: str = ""
    owner: str = ""
    tags: List[str] = field(default_factory=list)

@dataclass
class MetricDataPoint:
    metric_id: str
    timestamp: datetime
    value: float
    dimensions: Dict[str, Any] = field(default_factory=dict)
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class QualityAlert:
    alert_id: str
    metric_id: str
    severity: AlertSeverity
    message: str
    timestamp: datetime
    current_value: float
    threshold_value: float
    recommended_actions: List[str] = field(default_factory=list)
    acknowledged: bool = False
    resolved: bool = False

class QualityMetricsFramework:
    def __init__(self, db_path: str = "quality_metrics.db"):
        self.db_path = db_path
        self.metrics = {}
        self.metric_data = []
        self.alerts = []
        self.predictive_models = {}
        self.alert_handlers = {}
        self.initialize_database()
        self.load_standard_metrics()

    def initialize_database(self):
        """Initialize SQLite database for metrics storage"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Create metrics table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS metrics (
                metric_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                metric_type TEXT,
                frequency TEXT,
                target_value REAL,
                warning_threshold REAL,
                critical_threshold REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Create metric_data table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS metric_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                metric_id TEXT,
                timestamp TIMESTAMP,
                value REAL,
                dimensions TEXT,
                metadata TEXT,
                FOREIGN KEY (metric_id) REFERENCES metrics (metric_id)
            )
        """)

        # Create alerts table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS alerts (
                alert_id TEXT PRIMARY KEY,
                metric_id TEXT,
                severity TEXT,
                message TEXT,
                timestamp TIMESTAMP,
                current_value REAL,
                threshold_value REAL,
                acknowledged BOOLEAN DEFAULT FALSE,
                resolved BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (metric_id) REFERENCES metrics (metric_id)
            )
        """)

        conn.commit()
        conn.close()

    def load_standard_metrics(self):
        """Load standard quality metrics definitions"""
        standard_metrics = [
            # Business Impact Metrics
            QualityMetric(
                metric_id="defect_cost_ratio",
                name="Defect Cost Ratio",
                description="Cost of fixing defects vs prevention cost",
                metric_type=MetricType.BUSINESS_IMPACT,
                frequency=MetricFrequency.MONTHLY,
                calculation_method="(bug_fix_cost + support_cost) / prevention_investment",
                target_value=0.3,
                warning_threshold=0.5,
                critical_threshold=0.8,
                business_context="Lower ratio indicates better quality ROI"
            ),
            QualityMetric(
                metric_id="customer_satisfaction_score",
                name="Customer Satisfaction Score",
                description="Quality-related customer satisfaction rating",
                metric_type=MetricType.BUSINESS_IMPACT,
                frequency=MetricFrequency.WEEKLY,
                calculation_method="weighted_average(quality_ratings, response_counts)",
                target_value=4.5,
                warning_threshold=4.0,
                critical_threshold=3.5,
                business_context="Direct correlation with quality perception"
            ),
            QualityMetric(
                metric_id="feature_adoption_rate",
                name="Feature Adoption Rate",
                description="Rate of new feature adoption by users",
                metric_type=MetricType.BUSINESS_IMPACT,
                frequency=MetricFrequency.WEEKLY,
                calculation_method="active_feature_users / total_active_users",
                target_value=0.6,
                warning_threshold=0.4,
                critical_threshold=0.2,
                business_context="Quality issues reduce feature adoption"
            ),

            # Quality Velocity Metrics
            QualityMetric(
                metric_id="test_automation_coverage",
                name="Test Automation Coverage",
                description="Percentage of tests that are automated",
                metric_type=MetricType.QUALITY_VELOCITY,
                frequency=MetricFrequency.DAILY,
                calculation_method="automated_tests / total_tests",
                target_value=0.8,
                warning_threshold=0.6,
                critical_threshold=0.4,
                business_context="Higher automation enables faster delivery"
            ),
            QualityMetric(
                metric_id="quality_gate_success_rate",
                name="Quality Gate Success Rate",
                description="Percentage of builds passing all quality gates",
                metric_type=MetricType.QUALITY_VELOCITY,
                frequency=MetricFrequency.DAILY,
                calculation_method="successful_builds / total_builds",
                target_value=0.95,
                warning_threshold=0.90,
                critical_threshold=0.80,
                business_context="Measures development quality consistency"
            ),
            QualityMetric(
                metric_id="defect_escape_rate",
                name="Defect Escape Rate",
                description="Percentage of defects found in production vs total defects",
                metric_type=MetricType.QUALITY_VELOCITY,
                frequency=MetricFrequency.WEEKLY,
                calculation_method="production_defects / total_defects",
                target_value=0.05,
                warning_threshold=0.10,
                critical_threshold=0.20,
                business_context="Lower rate indicates better testing effectiveness"
            ),

            # User Experience Metrics
            QualityMetric(
                metric_id="user_error_rate",
                name="User Error Rate",
                description="Rate of user-triggered errors per session",
                metric_type=MetricType.USER_EXPERIENCE,
                frequency=MetricFrequency.REAL_TIME,
                calculation_method="user_errors / total_sessions",
                target_value=0.02,
                warning_threshold=0.05,
                critical_threshold=0.10,
                business_context="High error rate indicates usability issues"
            ),
            QualityMetric(
                metric_id="page_load_performance",
                name="Page Load Performance",
                description="95th percentile page load time",
                metric_type=MetricType.USER_EXPERIENCE,
                frequency=MetricFrequency.REAL_TIME,
                calculation_method="percentile_95(page_load_times)",
                target_value=2.0,
                warning_threshold=3.0,
                critical_threshold=5.0,
                business_context="Performance directly impacts user satisfaction"
            ),

            # Technical Health Metrics
            QualityMetric(
                metric_id="technical_debt_ratio",
                name="Technical Debt Ratio",
                description="Technical debt as percentage of total development effort",
                metric_type=MetricType.TECHNICAL_HEALTH,
                frequency=MetricFrequency.WEEKLY,
                calculation_method="debt_remediation_effort / total_development_effort",
                target_value=0.15,
                warning_threshold=0.25,
                critical_threshold=0.40,
                business_context="High debt slows future development"
            ),
            QualityMetric(
                metric_id="code_coverage",
                name="Code Coverage",
                description="Percentage of code covered by automated tests",
                metric_type=MetricType.TECHNICAL_HEALTH,
                frequency=MetricFrequency.DAILY,
                calculation_method="covered_lines / total_lines",
                target_value=0.80,
                warning_threshold=0.70,
                critical_threshold=0.60,
                business_context="Higher coverage reduces bug risk"
            ),

            # Process Effectiveness Metrics
            QualityMetric(
                metric_id="mean_time_to_resolution",
                name="Mean Time to Resolution",
                description="Average time to resolve quality issues",
                metric_type=MetricType.PROCESS_EFFECTIVENESS,
                frequency=MetricFrequency.WEEKLY,
                calculation_method="sum(resolution_times) / count(resolved_issues)",
                target_value=24.0,  # hours
                warning_threshold=48.0,
                critical_threshold=72.0,
                business_context="Faster resolution reduces business impact"
            ),
            QualityMetric(
                metric_id="test_execution_efficiency",
                name="Test Execution Efficiency",
                description="Ratio of test value to execution time",
                metric_type=MetricType.PROCESS_EFFECTIVENESS,
                frequency=MetricFrequency.DAILY,
                calculation_method="bugs_found / test_execution_hours",
                target_value=0.5,
                warning_threshold=0.3,
                critical_threshold=0.1,
                business_context="Measures testing ROI and effectiveness"
            )
        ]

        for metric in standard_metrics:
            self.add_metric(metric)

    def add_metric(self, metric: QualityMetric):
        """Add metric to framework"""
        self.metrics[metric.metric_id] = metric

        # Store in database
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute("""
            INSERT OR REPLACE INTO metrics
            (metric_id, name, description, metric_type, frequency, target_value, warning_threshold, critical_threshold)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            metric.metric_id,
            metric.name,
            metric.description,
            metric.metric_type.value,
            metric.frequency.value,
            metric.target_value,
            metric.warning_threshold,
            metric.critical_threshold
        ))

        conn.commit()
        conn.close()

    def record_metric_data(self, metric_id: str, value: float,
                          dimensions: Dict[str, Any] = None,
                          metadata: Dict[str, Any] = None,
                          timestamp: datetime = None):
        """Record metric data point"""
        if metric_id not in self.metrics:
            raise ValueError(f"Metric '{metric_id}' not found")

        if timestamp is None:
            timestamp = datetime.now()

        data_point = MetricDataPoint(
            metric_id=metric_id,
            timestamp=timestamp,
            value=value,
            dimensions=dimensions or {},
            metadata=metadata or {}
        )

        self.metric_data.append(data_point)

        # Store in database
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO metric_data (metric_id, timestamp, value, dimensions, metadata)
            VALUES (?, ?, ?, ?, ?)
        """, (
            metric_id,
            timestamp.isoformat(),
            value,
            json.dumps(dimensions or {}),
            json.dumps(metadata or {})
        ))

        conn.commit()
        conn.close()

        # Check for alerts
        self._check_metric_alerts(metric_id, value, timestamp)

    def _check_metric_alerts(self, metric_id: str, value: float, timestamp: datetime):
        """Check if metric value triggers alerts"""
        metric = self.metrics[metric_id]
        alerts_triggered = []

        # Check critical threshold
        if metric.critical_threshold is not None:
            if self._threshold_exceeded(value, metric.critical_threshold, metric_id):
                alert = QualityAlert(
                    alert_id=f"alert_{metric_id}_{int(timestamp.timestamp())}",
                    metric_id=metric_id,
                    severity=AlertSeverity.CRITICAL,
                    message=f"{metric.name} exceeded critical threshold",
                    timestamp=timestamp,
                    current_value=value,
                    threshold_value=metric.critical_threshold,
                    recommended_actions=self._get_recommended_actions(metric_id, AlertSeverity.CRITICAL)
                )
                alerts_triggered.append(alert)

        # Check warning threshold
        elif metric.warning_threshold is not None:
            if self._threshold_exceeded(value, metric.warning_threshold, metric_id):
                alert = QualityAlert(
                    alert_id=f"alert_{metric_id}_{int(timestamp.timestamp())}",
                    metric_id=metric_id,
                    severity=AlertSeverity.HIGH,
                    message=f"{metric.name} exceeded warning threshold",
                    timestamp=timestamp,
                    current_value=value,
                    threshold_value=metric.warning_threshold,
                    recommended_actions=self._get_recommended_actions(metric_id, AlertSeverity.HIGH)
                )
                alerts_triggered.append(alert)

        # Process alerts
        for alert in alerts_triggered:
            self._process_alert(alert)

    def _threshold_exceeded(self, value: float, threshold: float, metric_id: str) -> bool:
        """Check if threshold is exceeded based on metric characteristics"""
        # For most metrics, higher values are worse (exceed when value > threshold)
        # For some metrics like satisfaction score, lower values are worse (exceed when value < threshold)
        inverse_metrics = {
            'customer_satisfaction_score',
            'feature_adoption_rate',
            'quality_gate_success_rate',
            'test_automation_coverage',
            'code_coverage'
        }

        if metric_id in inverse_metrics:
            return value < threshold
        else:
            return value > threshold

    def _get_recommended_actions(self, metric_id: str, severity: AlertSeverity) -> List[str]:
        """Get recommended actions for metric alerts"""
        action_map = {
            'defect_cost_ratio': [
                "Analyze root causes of recent defects",
                "Increase investment in preventive testing",
                "Review and improve quality processes"
            ],
            'customer_satisfaction_score': [
                "Investigate recent customer complaints",
                "Review quality of recent releases",
                "Conduct customer feedback analysis"
            ],
            'test_automation_coverage': [
                "Prioritize automation of manual tests",
                "Review test automation strategy",
                "Allocate resources for automation development"
            ],
            'defect_escape_rate': [
                "Strengthen testing processes",
                "Review test coverage gaps",
                "Improve quality gates and reviews"
            ],
            'technical_debt_ratio': [
                "Schedule technical debt remediation sprint",
                "Review code quality standards",
                "Implement stricter quality gates"
            ]
        }

        return action_map.get(metric_id, ["Review metric and take appropriate action"])

    def _process_alert(self, alert: QualityAlert):
        """Process and store alert"""
        self.alerts.append(alert)

        # Store in database
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO alerts (alert_id, metric_id, severity, message, timestamp, current_value, threshold_value)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            alert.alert_id,
            alert.metric_id,
            alert.severity.value,
            alert.message,
            alert.timestamp.isoformat(),
            alert.current_value,
            alert.threshold_value
        ))

        conn.commit()
        conn.close()

        # Trigger alert handlers
        if alert.metric_id in self.alert_handlers:
            self.alert_handlers[alert.metric_id](alert)

    def get_metric_data(self, metric_id: str, start_date: datetime = None,
                       end_date: datetime = None) -> pd.DataFrame:
        """Get metric data as DataFrame"""
        conn = sqlite3.connect(self.db_path)

        query = "SELECT * FROM metric_data WHERE metric_id = ?"
        params = [metric_id]

        if start_date:
            query += " AND timestamp >= ?"
            params.append(start_date.isoformat())

        if end_date:
            query += " AND timestamp <= ?"
            params.append(end_date.isoformat())

        query += " ORDER BY timestamp"

        df = pd.read_sql_query(query, conn, params=params)
        conn.close()

        if not df.empty:
            df['timestamp'] = pd.to_datetime(df['timestamp'])

        return df

    def calculate_quality_trends(self, metric_ids: List[str] = None,
                               days: int = 30) -> Dict[str, Any]:
        """Calculate quality trends and insights"""
        if metric_ids is None:
            metric_ids = list(self.metrics.keys())

        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)

        trends = {}

        for metric_id in metric_ids:
            data = self.get_metric_data(metric_id, start_date, end_date)

            if data.empty:
                continue

            # Calculate trend
            values = data['value'].values
            timestamps = data['timestamp'].values

            # Convert timestamps to numeric for trend calculation
            numeric_timestamps = [(ts - timestamps[0]).total_seconds() for ts in timestamps]

            if len(values) >= 2:
                # Linear regression for trend
                slope, intercept = np.polyfit(numeric_timestamps, values, 1)

                # Calculate trend direction and strength
                trend_direction = "increasing" if slope > 0 else "decreasing"
                trend_strength = abs(slope)

                # Calculate recent performance vs target
                recent_value = values[-1]
                target_value = self.metrics[metric_id].target_value

                performance_vs_target = None
                if target_value:
                    performance_vs_target = abs(recent_value - target_value) / target_value

                trends[metric_id] = {
                    'metric_name': self.metrics[metric_id].name,
                    'current_value': recent_value,
                    'target_value': target_value,
                    'trend_direction': trend_direction,
                    'trend_strength': trend_strength,
                    'performance_vs_target': performance_vs_target,
                    'data_points': len(values),
                    'volatility': np.std(values) if len(values) > 1 else 0
                }

        return trends

    def generate_quality_forecast(self, metric_id: str, forecast_days: int = 30) -> Dict[str, Any]:
        """Generate quality forecast using machine learning"""
        # Get historical data (last 90 days)
        end_date = datetime.now()
        start_date = end_date - timedelta(days=90)
        data = self.get_metric_data(metric_id, start_date, end_date)

        if len(data) < 10:
            return {'error': 'Insufficient data for forecasting'}

        # Prepare features
        data = data.sort_values('timestamp')
        data['day_of_week'] = data['timestamp'].dt.dayofweek
        data['hour'] = data['timestamp'].dt.hour
        data['is_weekend'] = data['day_of_week'].isin([5, 6]).astype(int)

        # Create lag features
        for lag in [1, 3, 7]:
            if len(data) > lag:
                data[f'lag_{lag}'] = data['value'].shift(lag)

        # Create rolling features
        for window in [3, 7, 14]:
            if len(data) > window:
                data[f'rolling_mean_{window}'] = data['value'].rolling(window=window).mean()
                data[f'rolling_std_{window}'] = data['value'].rolling(window=window).std()

        # Drop rows with NaN values
        data = data.dropna()

        if len(data) < 5:
            return {'error': 'Insufficient clean data for forecasting'}

        # Prepare features and target
        feature_columns = [col for col in data.columns if col not in ['timestamp', 'value', 'id', 'metric_id', 'dimensions', 'metadata']]
        X = data[feature_columns]
        y = data['value']

        # Split data
        if len(X) > 10:
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        else:
            X_train, X_test, y_train, y_test = X, X, y, y

        # Train model
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)

        # Generate forecast
        forecast_dates = [end_date + timedelta(days=i) for i in range(1, forecast_days + 1)]
        forecast_values = []

        last_row = data.iloc[-1].copy()

        for forecast_date in forecast_dates:
            # Update time-based features
            last_row['day_of_week'] = forecast_date.weekday()
            last_row['hour'] = forecast_date.hour
            last_row['is_weekend'] = 1 if forecast_date.weekday() in [5, 6] else 0

            # Make prediction
            X_forecast = last_row[feature_columns].values.reshape(1, -1)
            prediction = model.predict(X_forecast)[0]
            forecast_values.append(prediction)

            # Update lag features for next iteration
            last_row['value'] = prediction

        # Calculate confidence intervals (simplified)
        forecast_std = np.std(y_test - model.predict(X_test)) if len(X_test) > 0 else np.std(y)
        confidence_intervals = [
            (value - 1.96 * forecast_std, value + 1.96 * forecast_std)
            for value in forecast_values
        ]

        return {
            'metric_id': metric_id,
            'forecast_dates': [date.isoformat() for date in forecast_dates],
            'forecast_values': forecast_values,
            'confidence_intervals': confidence_intervals,
            'model_accuracy': model.score(X_test, y_test) if len(X_test) > 0 else None,
            'feature_importance': dict(zip(feature_columns, model.feature_importances_))
        }

    def detect_quality_anomalies(self, metric_id: str, sensitivity: float = 0.1) -> List[Dict[str, Any]]:
        """Detect anomalies in quality metrics using isolation forest"""
        # Get recent data (last 30 days)
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)
        data = self.get_metric_data(metric_id, start_date, end_date)

        if len(data) < 10:
            return []

        # Prepare features
        data = data.sort_values('timestamp')
        values = data['value'].values.reshape(-1, 1)

        # Detect anomalies
        iso_forest = IsolationForest(contamination=sensitivity, random_state=42)
        anomaly_labels = iso_forest.fit_predict(values)

        # Get anomalies
        anomalies = []
        for i, label in enumerate(anomaly_labels):
            if label == -1:  # Anomaly detected
                anomalies.append({
                    'timestamp': data.iloc[i]['timestamp'].isoformat(),
                    'value': data.iloc[i]['value'],
                    'anomaly_score': iso_forest.decision_function(values[i].reshape(1, -1))[0]
                })

        return anomalies

    def generate_executive_dashboard_data(self) -> Dict[str, Any]:
        """Generate data for executive quality dashboard"""
        # Calculate overall quality score
        business_metrics = [m for m in self.metrics.values() if m.metric_type == MetricType.BUSINESS_IMPACT]
        quality_scores = []

        for metric in business_metrics:
            recent_data = self.get_metric_data(metric.metric_id, datetime.now() - timedelta(days=7))
            if not recent_data.empty:
                current_value = recent_data['value'].iloc[-1]
                if metric.target_value:
                    score = min(100, max(0, (metric.target_value / max(current_value, 0.001)) * 100))
                    quality_scores.append(score)

        overall_quality_score = np.mean(quality_scores) if quality_scores else 0

        # Get recent alerts
        recent_alerts = [a for a in self.alerts if a.timestamp > datetime.now() - timedelta(days=7)]
        critical_alerts = [a for a in recent_alerts if a.severity == AlertSeverity.CRITICAL]

        # Calculate quality trends
        trends = self.calculate_quality_trends(days=30)

        # Quality investment ROI
        defect_cost_data = self.get_metric_data('defect_cost_ratio', datetime.now() - timedelta(days=30))
        quality_roi = None
        if not defect_cost_data.empty:
            latest_ratio = defect_cost_data['value'].iloc[-1]
            quality_roi = (1 - latest_ratio) * 100  # Simplified ROI calculation

        return {
            'overall_quality_score': overall_quality_score,
            'critical_alerts_count': len(critical_alerts),
            'quality_trends': trends,
            'quality_roi': quality_roi,
            'metrics_summary': {
                metric_type.value: len([m for m in self.metrics.values() if m.metric_type == metric_type])
                for metric_type in MetricType
            },
            'recent_performance': {
                metric_id: {
                    'current_value': trends[metric_id]['current_value'],
                    'vs_target': trends[metric_id]['performance_vs_target']
                }
                for metric_id in trends
                if trends[metric_id]['performance_vs_target'] is not None
            }
        }

    def create_interactive_dashboard(self, output_file: str = "quality_dashboard.html"):
        """Create interactive quality dashboard using Plotly"""
        dashboard_data = self.generate_executive_dashboard_data()

        # Create subplots
        fig = make_subplots(
            rows=3, cols=2,
            subplot_titles=("Overall Quality Score", "Quality Trends", "Metric Performance vs Target",
                          "Alert Summary", "Quality ROI Trend", "Metric Distribution"),
            specs=[[{"type": "indicator"}, {"type": "scatter"}],
                   [{"type": "bar"}, {"type": "pie"}],
                   [{"type": "scatter"}, {"type": "histogram"}]]
        )

        # Overall Quality Score Gauge
        fig.add_trace(
            go.Indicator(
                mode="gauge+number+delta",
                value=dashboard_data['overall_quality_score'],
                domain={'x': [0, 1], 'y': [0, 1]},
                title={'text': "Quality Score"},
                gauge={'axis': {'range': [None, 100]},
                      'bar': {'color': "darkblue"},
                      'steps': [{'range': [0, 50], 'color': "lightgray"},
                               {'range': [50, 80], 'color': "gray"}],
                      'threshold': {'line': {'color': "red", 'width': 4},
                                   'thickness': 0.75, 'value': 90}}
            ),
            row=1, col=1
        )

        # Quality Trends Line Chart
        trend_metrics = list(dashboard_data['quality_trends'].keys())[:5]  # Top 5 metrics
        for metric_id in trend_metrics:
            metric_data = self.get_metric_data(metric_id, datetime.now() - timedelta(days=30))
            if not metric_data.empty:
                fig.add_trace(
                    go.Scatter(
                        x=metric_data['timestamp'],
                        y=metric_data['value'],
                        mode='lines+markers',
                        name=self.metrics[metric_id].name,
                        line=dict(width=2)
                    ),
                    row=1, col=2
                )

        # Metric Performance vs Target Bar Chart
        performance_data = dashboard_data['recent_performance']
        metric_names = [self.metrics[mid].name for mid in performance_data.keys()]
        performance_values = [data['vs_target'] * 100 for data in performance_data.values()]

        fig.add_trace(
            go.Bar(
                x=metric_names,
                y=performance_values,
                name="Performance vs Target (%)",
                marker_color=['red' if v > 20 else 'yellow' if v > 10 else 'green' for v in performance_values]
            ),
            row=2, col=1
        )

        # Alert Summary Pie Chart
        alert_counts = {}
        for alert in self.alerts[-50:]:  # Last 50 alerts
            severity = alert.severity.value
            alert_counts[severity] = alert_counts.get(severity, 0) + 1

        if alert_counts:
            fig.add_trace(
                go.Pie(
                    labels=list(alert_counts.keys()),
                    values=list(alert_counts.values()),
                    name="Alert Distribution"
                ),
                row=2, col=2
            )

        # Update layout
        fig.update_layout(
            height=1200,
            title_text="Quality Metrics Executive Dashboard",
            showlegend=True
        )

        # Save dashboard
        fig.write_html(output_file)
        return output_file

    def export_metrics_report(self, output_file: str = "quality_metrics_report.json") -> str:
        """Export comprehensive metrics report"""
        report_data = {
            'report_metadata': {
                'generated_at': datetime.now().isoformat(),
                'reporting_period_days': 30,
                'total_metrics': len(self.metrics),
                'total_data_points': len(self.metric_data)
            },
            'executive_summary': self.generate_executive_dashboard_data(),
            'metric_definitions': {
                mid: {
                    'name': metric.name,
                    'description': metric.description,
                    'type': metric.metric_type.value,
                    'frequency': metric.frequency.value,
                    'target_value': metric.target_value,
                    'business_context': metric.business_context
                }
                for mid, metric in self.metrics.items()
            },
            'quality_trends': self.calculate_quality_trends(),
            'recent_alerts': [
                {
                    'alert_id': alert.alert_id,
                    'metric_id': alert.metric_id,
                    'severity': alert.severity.value,
                    'message': alert.message,
                    'timestamp': alert.timestamp.isoformat(),
                    'current_value': alert.current_value,
                    'threshold_value': alert.threshold_value
                }
                for alert in self.alerts[-20:]  # Last 20 alerts
            ]
        }

        with open(output_file, 'w') as f:
            json.dump(report_data, f, indent=2)

        return output_file

# Real-time Quality Monitoring System
class RealTimeQualityMonitor:
    def __init__(self, metrics_framework: QualityMetricsFramework):
        self.metrics_framework = metrics_framework
        self.monitoring_active = False
        self.alert_callbacks = {}

    def start_monitoring(self, poll_interval: int = 60):
        """Start real-time quality monitoring"""
        self.monitoring_active = True
        print(f"Starting quality monitoring with {poll_interval}s intervals")

        # In a real implementation, this would be a separate thread/process
        # For demo purposes, we'll show the monitoring setup

    def add_alert_callback(self, metric_id: str, callback: Callable[[QualityAlert], None]):
        """Add callback for metric alerts"""
        self.alert_callbacks[metric_id] = callback

    def simulate_real_time_data(self, duration_minutes: int = 10):
        """Simulate real-time data collection"""
        import random
        import time

        end_time = time.time() + (duration_minutes * 60)

        while time.time() < end_time:
            # Simulate data collection for each metric
            for metric_id in self.metrics_framework.metrics:
                # Generate realistic data based on metric type
                value = self._generate_realistic_value(metric_id)

                self.metrics_framework.record_metric_data(
                    metric_id=metric_id,
                    value=value,
                    timestamp=datetime.now()
                )

            time.sleep(10)  # Poll every 10 seconds for demo

    def _generate_realistic_value(self, metric_id: str) -> float:
        """Generate realistic values for simulation"""
        import random

        metric = self.metrics_framework.metrics[metric_id]
        target = metric.target_value or 1.0

        # Add some realistic variation around target
        if metric_id == 'customer_satisfaction_score':
            return max(1.0, min(5.0, target + random.gauss(0, 0.3)))
        elif metric_id == 'defect_escape_rate':
            return max(0.0, min(1.0, target + random.gauss(0, 0.02)))
        elif metric_id == 'page_load_performance':
            return max(0.5, target + random.gauss(0, 0.5))
        else:
            return max(0, target + random.gauss(0, target * 0.1))

# Usage Example
if __name__ == "__main__":
    # Initialize quality metrics framework
    metrics_framework = QualityMetricsFramework()

    # Record some sample data
    sample_data = [
        ('defect_cost_ratio', 0.25),
        ('customer_satisfaction_score', 4.3),
        ('test_automation_coverage', 0.75),
        ('quality_gate_success_rate', 0.92),
        ('technical_debt_ratio', 0.18),
        ('code_coverage', 0.78)
    ]

    # Record sample data over time
    for i in range(30):  # 30 days of data
        timestamp = datetime.now() - timedelta(days=30-i)
        for metric_id, base_value in sample_data:
            # Add some variation
            import random
            variation = random.gauss(0, base_value * 0.1)
            value = max(0, base_value + variation)

            metrics_framework.record_metric_data(
                metric_id=metric_id,
                value=value,
                timestamp=timestamp
            )

    # Generate quality trends
    trends = metrics_framework.calculate_quality_trends()
    print("Quality Trends Analysis:")
    for metric_id, trend_data in trends.items():
        print(f"  {trend_data['metric_name']}: {trend_data['trend_direction']} "
              f"(Current: {trend_data['current_value']:.3f})")

    # Generate forecasts
    forecast = metrics_framework.generate_quality_forecast('customer_satisfaction_score')
    if 'error' not in forecast:
        print(f"\nForecast for Customer Satisfaction (next 7 days):")
        for i, (date, value) in enumerate(zip(forecast['forecast_dates'][:7], forecast['forecast_values'][:7])):
            print(f"  {date[:10]}: {value:.2f}")

    # Create interactive dashboard
    dashboard_file = metrics_framework.create_interactive_dashboard()
    print(f"\nInteractive dashboard created: {dashboard_file}")

    # Export comprehensive report
    report_file = metrics_framework.export_metrics_report()
    print(f"Metrics report exported: {report_file}")

    # Generate executive summary
    exec_data = metrics_framework.generate_executive_dashboard_data()
    print(f"\nExecutive Summary:")
    print(f"  Overall Quality Score: {exec_data['overall_quality_score']:.1f}/100")
    print(f"  Critical Alerts: {exec_data['critical_alerts_count']}")
    print(f"  Quality ROI: {exec_data['quality_roi']:.1f}%" if exec_data['quality_roi'] else "  Quality ROI: Not available")
```

This advanced quality metrics framework provides comprehensive measurement, predictive analytics, and executive reporting capabilities. The framework enables data-driven quality decisions and demonstrates the business value of quality investments through sophisticated metrics and visualizations.