# Advanced Database Testing Guide

## Overview

Advanced database testing ensures data integrity, performance, and reliability across complex database systems and operations. This comprehensive guide establishes sophisticated testing methodologies, frameworks, and validation procedures for database-driven applications.

### Purpose and Scope
- Define advanced database testing strategies and methodologies
- Establish comprehensive data validation and integrity frameworks
- Provide performance testing and optimization procedures
- Create database security and compliance testing protocols

### Target Audience
- QA Engineers specializing in database testing
- Database administrators implementing testing procedures
- Performance engineers optimizing database operations
- DevOps engineers managing database CI/CD pipelines

### Key Benefits
- Ensures data accuracy and consistency across operations
- Validates complex business logic and constraints
- Identifies performance bottlenecks before production
- Maintains data security and compliance standards
- Enables confident database schema migrations

## Fundamental Principles

### Advanced Database Testing Concepts

#### 1. Database Testing Pyramid
```
Database Testing Layers
├── Unit Tests (Database Functions/Procedures)
│   ├── Individual stored procedure testing
│   ├── Function return value validation
│   ├── Trigger behavior verification
│   └── Constraint enforcement testing
├── Integration Tests (Data Flow)
│   ├── Multi-table transaction testing
│   ├── Cross-schema dependency validation
│   ├── API-database integration testing
│   └── ETL pipeline validation
├── System Tests (End-to-End)
│   ├── Complete business workflow testing
│   ├── Data consistency across systems
│   ├── Backup and recovery validation
│   └── Performance under realistic load
└── Acceptance Tests (Business Logic)
    ├── Business rule validation
    ├── Data quality standards
    ├── Reporting accuracy verification
    └── Compliance requirement testing
```

#### 2. Database Testing Categories

| Testing Type | Focus Area | Tools/Methods | Success Criteria |
|--------------|------------|---------------|------------------|
| **Structural Testing** | Schema validation, constraints | DDL scripts, schema comparison | Schema integrity maintained |
| **Functional Testing** | CRUD operations, business logic | SQL testing frameworks | All operations work correctly |
| **Performance Testing** | Query optimization, load handling | Load testing tools, profilers | Performance targets met |
| **Security Testing** | Access control, injection prevention | Security scanners, penetration testing | Security standards enforced |
| **Data Quality Testing** | Accuracy, completeness, consistency | Data profiling tools, validation scripts | Data quality standards met |

#### 3. Database Testing Anti-Patterns

❌ **Testing Against Production Data**
- Use anonymized or synthetic test data
- Implement proper test data management strategies

❌ **Ignoring Transaction Boundaries**
- Test transaction rollback scenarios
- Validate ACID properties in complex operations

❌ **Limited Test Data Scenarios**
- Include edge cases and boundary conditions
- Test with realistic data volumes

❌ **Manual Database State Management**
- Automate database setup and teardown
- Use database migration tools for test environments

## Step-by-Step Implementation

### Phase 1: Database Testing Framework Setup

#### 1.1 Comprehensive Database Testing Framework

```python
#!/usr/bin/env python3
"""
Advanced Database Testing Framework
Comprehensive framework for database testing including schema validation,
data integrity, performance testing, and security validation
"""

import json
import time
import logging
import hashlib
import random
import string
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum
import sqlite3
import psycopg2
import pymysql
from sqlalchemy import create_engine, text, MetaData, Table, inspect
from sqlalchemy.orm import sessionmaker
import pandas as pd
import pytest

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DatabaseType(Enum):
    POSTGRESQL = "postgresql"
    MYSQL = "mysql"
    SQLITE = "sqlite"
    MSSQL = "mssql"
    ORACLE = "oracle"

class TestCategory(Enum):
    STRUCTURAL = "structural"
    FUNCTIONAL = "functional"
    PERFORMANCE = "performance"
    SECURITY = "security"
    DATA_QUALITY = "data_quality"

@dataclass
class DatabaseConfig:
    host: str
    port: int
    database: str
    username: str
    password: str
    db_type: DatabaseType
    connection_params: Dict[str, Any] = field(default_factory=dict)

@dataclass
class TestResult:
    test_name: str
    category: TestCategory
    status: str
    execution_time: float
    details: Dict[str, Any]
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)

class DatabaseTestFramework:
    def __init__(self, config: DatabaseConfig):
        self.config = config
        self.engine = None
        self.session_factory = None
        self.metadata = None
        self.test_results = []
        self.test_data_cleanup = []

    def connect(self):
        """Establish database connection"""
        try:
            connection_string = self._build_connection_string()
            self.engine = create_engine(connection_string, **self.config.connection_params)
            self.session_factory = sessionmaker(bind=self.engine)
            self.metadata = MetaData()
            self.metadata.reflect(bind=self.engine)
            logger.info(f"Connected to {self.config.db_type.value} database")
        except Exception as e:
            logger.error(f"Failed to connect to database: {e}")
            raise

    def _build_connection_string(self) -> str:
        """Build database connection string based on database type"""
        if self.config.db_type == DatabaseType.POSTGRESQL:
            return f"postgresql://{self.config.username}:{self.config.password}@{self.config.host}:{self.config.port}/{self.config.database}"
        elif self.config.db_type == DatabaseType.MYSQL:
            return f"mysql+pymysql://{self.config.username}:{self.config.password}@{self.config.host}:{self.config.port}/{self.config.database}"
        elif self.config.db_type == DatabaseType.SQLITE:
            return f"sqlite:///{self.config.database}"
        else:
            raise ValueError(f"Unsupported database type: {self.config.db_type}")

    def setup_test_environment(self):
        """Setup test environment with proper isolation"""
        logger.info("Setting up test environment")

        # Create test schema if needed
        if self.config.db_type != DatabaseType.SQLITE:
            self._create_test_schema()

        # Setup test data
        self._setup_base_test_data()

        # Create test tables if needed
        self._create_test_tables()

    def _create_test_schema(self):
        """Create dedicated test schema"""
        schema_name = f"test_schema_{int(time.time())}"

        with self.engine.connect() as conn:
            if self.config.db_type == DatabaseType.POSTGRESQL:
                conn.execute(text(f"CREATE SCHEMA IF NOT EXISTS {schema_name}"))
            elif self.config.db_type == DatabaseType.MYSQL:
                conn.execute(text(f"CREATE DATABASE IF NOT EXISTS {schema_name}"))
            conn.commit()

        logger.info(f"Created test schema: {schema_name}")
        return schema_name

    def _setup_base_test_data(self):
        """Setup base test data for various test scenarios"""
        test_data_sets = {
            'users': self._generate_user_test_data(1000),
            'orders': self._generate_order_test_data(500),
            'products': self._generate_product_test_data(100),
            'transactions': self._generate_transaction_test_data(2000)
        }

        for table_name, data in test_data_sets.items():
            self._insert_test_data(table_name, data)

    def _generate_user_test_data(self, count: int) -> List[Dict]:
        """Generate realistic user test data"""
        users = []
        for i in range(count):
            user = {
                'user_id': i + 1,
                'email': f"user{i+1}@testdomain.com",
                'username': f"user_{i+1}",
                'first_name': random.choice(['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa']),
                'last_name': random.choice(['Smith', 'Johnson', 'Brown', 'Davis', 'Wilson', 'Moore']),
                'age': random.randint(18, 80),
                'created_at': f"2024-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}",
                'is_active': random.choice([True, False]),
                'balance': round(random.uniform(0, 10000), 2)
            }
            users.append(user)
        return users

    def _generate_order_test_data(self, count: int) -> List[Dict]:
        """Generate realistic order test data"""
        orders = []
        for i in range(count):
            order = {
                'order_id': i + 1,
                'user_id': random.randint(1, 1000),
                'product_id': random.randint(1, 100),
                'quantity': random.randint(1, 10),
                'price': round(random.uniform(10, 1000), 2),
                'order_date': f"2024-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}",
                'status': random.choice(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
            }
            orders.append(order)
        return orders

    def _generate_product_test_data(self, count: int) -> List[Dict]:
        """Generate realistic product test data"""
        products = []
        categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty']

        for i in range(count):
            product = {
                'product_id': i + 1,
                'name': f"Product {i+1}",
                'category': random.choice(categories),
                'price': round(random.uniform(5, 500), 2),
                'stock_quantity': random.randint(0, 1000),
                'description': f"Description for product {i+1}",
                'created_at': f"2024-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}"
            }
            products.append(product)
        return products

    def _generate_transaction_test_data(self, count: int) -> List[Dict]:
        """Generate realistic transaction test data"""
        transactions = []
        for i in range(count):
            transaction = {
                'transaction_id': i + 1,
                'user_id': random.randint(1, 1000),
                'amount': round(random.uniform(-1000, 1000), 2),
                'transaction_type': random.choice(['deposit', 'withdrawal', 'transfer', 'purchase']),
                'timestamp': f"2024-{random.randint(1, 12):02d}-{random.randint(1, 28):02d} {random.randint(0, 23):02d}:{random.randint(0, 59):02d}:{random.randint(0, 59):02d}",
                'status': random.choice(['completed', 'pending', 'failed'])
            }
            transactions.append(transaction)
        return transactions

    def _create_test_tables(self):
        """Create test tables if they don't exist"""
        test_tables_sql = {
            'users': """
                CREATE TABLE IF NOT EXISTS test_users (
                    user_id INTEGER PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    username VARCHAR(100) UNIQUE NOT NULL,
                    first_name VARCHAR(100),
                    last_name VARCHAR(100),
                    age INTEGER CHECK (age >= 0 AND age <= 150),
                    created_at DATE,
                    is_active BOOLEAN DEFAULT TRUE,
                    balance DECIMAL(10, 2) DEFAULT 0.00
                )
            """,
            'orders': """
                CREATE TABLE IF NOT EXISTS test_orders (
                    order_id INTEGER PRIMARY KEY,
                    user_id INTEGER,
                    product_id INTEGER,
                    quantity INTEGER CHECK (quantity > 0),
                    price DECIMAL(10, 2),
                    order_date DATE,
                    status VARCHAR(50),
                    FOREIGN KEY (user_id) REFERENCES test_users(user_id)
                )
            """,
            'products': """
                CREATE TABLE IF NOT EXISTS test_products (
                    product_id INTEGER PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    category VARCHAR(100),
                    price DECIMAL(10, 2) CHECK (price >= 0),
                    stock_quantity INTEGER CHECK (stock_quantity >= 0),
                    description TEXT,
                    created_at DATE
                )
            """,
            'transactions': """
                CREATE TABLE IF NOT EXISTS test_transactions (
                    transaction_id INTEGER PRIMARY KEY,
                    user_id INTEGER,
                    amount DECIMAL(10, 2),
                    transaction_type VARCHAR(50),
                    timestamp TIMESTAMP,
                    status VARCHAR(50),
                    FOREIGN KEY (user_id) REFERENCES test_users(user_id)
                )
            """
        }

        with self.engine.connect() as conn:
            for table_name, sql in test_tables_sql.items():
                conn.execute(text(sql))
            conn.commit()

        logger.info("Created test tables")

    def _insert_test_data(self, table_name: str, data: List[Dict]):
        """Insert test data into specified table"""
        if not data:
            return

        table_map = {
            'users': 'test_users',
            'orders': 'test_orders',
            'products': 'test_products',
            'transactions': 'test_transactions'
        }

        actual_table_name = table_map.get(table_name, table_name)

        try:
            df = pd.DataFrame(data)
            df.to_sql(actual_table_name, self.engine, if_exists='append', index=False)
            logger.info(f"Inserted {len(data)} records into {actual_table_name}")
            self.test_data_cleanup.append(actual_table_name)
        except Exception as e:
            logger.error(f"Failed to insert test data into {actual_table_name}: {e}")

    def run_structural_tests(self) -> List[TestResult]:
        """Run comprehensive structural database tests"""
        logger.info("Running structural tests")
        structural_tests = []

        # Schema validation tests
        structural_tests.extend(self._test_schema_integrity())
        structural_tests.extend(self._test_constraints())
        structural_tests.extend(self._test_indexes())
        structural_tests.extend(self._test_foreign_keys())

        return structural_tests

    def _test_schema_integrity(self) -> List[TestResult]:
        """Test database schema integrity"""
        results = []
        start_time = time.time()

        try:
            inspector = inspect(self.engine)
            tables = inspector.get_table_names()

            # Check required tables exist
            required_tables = ['test_users', 'test_orders', 'test_products', 'test_transactions']
            missing_tables = [table for table in required_tables if table not in tables]

            if missing_tables:
                result = TestResult(
                    test_name="schema_integrity_required_tables",
                    category=TestCategory.STRUCTURAL,
                    status="FAIL",
                    execution_time=time.time() - start_time,
                    details={'missing_tables': missing_tables},
                    errors=[f"Missing required tables: {', '.join(missing_tables)}"]
                )
            else:
                result = TestResult(
                    test_name="schema_integrity_required_tables",
                    category=TestCategory.STRUCTURAL,
                    status="PASS",
                    execution_time=time.time() - start_time,
                    details={'tables_found': required_tables}
                )

            results.append(result)

            # Check column definitions
            for table in required_tables:
                if table in tables:
                    columns = inspector.get_columns(table)
                    column_results = self._validate_table_columns(table, columns)
                    results.extend(column_results)

        except Exception as e:
            result = TestResult(
                test_name="schema_integrity_check",
                category=TestCategory.STRUCTURAL,
                status="ERROR",
                execution_time=time.time() - start_time,
                details={},
                errors=[f"Schema integrity check failed: {e}"]
            )
            results.append(result)

        return results

    def _validate_table_columns(self, table_name: str, columns: List[Dict]) -> List[TestResult]:
        """Validate table column definitions"""
        results = []
        start_time = time.time()

        expected_columns = {
            'test_users': ['user_id', 'email', 'username', 'first_name', 'last_name', 'age', 'created_at', 'is_active', 'balance'],
            'test_orders': ['order_id', 'user_id', 'product_id', 'quantity', 'price', 'order_date', 'status'],
            'test_products': ['product_id', 'name', 'category', 'price', 'stock_quantity', 'description', 'created_at'],
            'test_transactions': ['transaction_id', 'user_id', 'amount', 'transaction_type', 'timestamp', 'status']
        }

        if table_name in expected_columns:
            actual_columns = [col['name'] for col in columns]
            missing_columns = [col for col in expected_columns[table_name] if col not in actual_columns]
            extra_columns = [col for col in actual_columns if col not in expected_columns[table_name]]

            if missing_columns or extra_columns:
                result = TestResult(
                    test_name=f"column_validation_{table_name}",
                    category=TestCategory.STRUCTURAL,
                    status="FAIL",
                    execution_time=time.time() - start_time,
                    details={
                        'missing_columns': missing_columns,
                        'extra_columns': extra_columns,
                        'expected_columns': expected_columns[table_name],
                        'actual_columns': actual_columns
                    },
                    errors=[f"Column mismatch in {table_name}"]
                )
            else:
                result = TestResult(
                    test_name=f"column_validation_{table_name}",
                    category=TestCategory.STRUCTURAL,
                    status="PASS",
                    execution_time=time.time() - start_time,
                    details={'columns_validated': actual_columns}
                )

            results.append(result)

        return results

    def _test_constraints(self) -> List[TestResult]:
        """Test database constraints"""
        results = []
        constraint_tests = [
            ("test_users", "email", "UNIQUE", "user1@test.com"),
            ("test_users", "age", "CHECK", -5),
            ("test_orders", "quantity", "CHECK", -1),
            ("test_products", "price", "CHECK", -10.50)
        ]

        for table, column, constraint_type, test_value in constraint_tests:
            result = self._test_constraint_violation(table, column, constraint_type, test_value)
            results.append(result)

        return results

    def _test_constraint_violation(self, table: str, column: str, constraint_type: str, test_value: Any) -> TestResult:
        """Test that constraints properly prevent invalid data"""
        start_time = time.time()

        try:
            with self.engine.connect() as conn:
                # First insert valid data to test unique constraints
                if constraint_type == "UNIQUE" and table == "test_users":
                    conn.execute(text(f"INSERT INTO {table} (user_id, email, username) VALUES (99999, '{test_value}', 'test_user_unique')"))
                    conn.commit()

                # Now try to violate the constraint
                if constraint_type == "UNIQUE":
                    sql = f"INSERT INTO {table} (user_id, email, username) VALUES (99998, '{test_value}', 'test_user_unique2')"
                elif constraint_type == "CHECK":
                    if table == "test_users":
                        sql = f"INSERT INTO {table} (user_id, email, username, {column}) VALUES (99997, 'test@test.com', 'test_user_check', {test_value})"
                    elif table == "test_orders":
                        sql = f"INSERT INTO {table} (order_id, user_id, product_id, {column}) VALUES (99997, 1, 1, {test_value})"
                    elif table == "test_products":
                        sql = f"INSERT INTO {table} (product_id, name, {column}) VALUES (99997, 'Test Product', {test_value})"

                conn.execute(text(sql))
                conn.commit()

                # If we get here, constraint failed to prevent invalid data
                result = TestResult(
                    test_name=f"constraint_{constraint_type.lower()}_{table}_{column}",
                    category=TestCategory.STRUCTURAL,
                    status="FAIL",
                    execution_time=time.time() - start_time,
                    details={'test_value': test_value},
                    errors=[f"{constraint_type} constraint on {table}.{column} did not prevent invalid data"]
                )

        except Exception as e:
            # Expected behavior - constraint should prevent invalid data
            result = TestResult(
                test_name=f"constraint_{constraint_type.lower()}_{table}_{column}",
                category=TestCategory.STRUCTURAL,
                status="PASS",
                execution_time=time.time() - start_time,
                details={'test_value': test_value, 'constraint_error': str(e)}
            )

        return result

    def _test_indexes(self) -> List[TestResult]:
        """Test database indexes"""
        results = []
        start_time = time.time()

        try:
            inspector = inspect(self.engine)

            # Check for expected indexes on primary keys and foreign keys
            expected_indexes = {
                'test_users': ['user_id'],
                'test_orders': ['order_id', 'user_id'],
                'test_products': ['product_id'],
                'test_transactions': ['transaction_id', 'user_id']
            }

            for table, expected_cols in expected_indexes.items():
                try:
                    indexes = inspector.get_indexes(table)
                    pk_constraints = inspector.get_pk_constraint(table)

                    # Check primary key index
                    pk_columns = pk_constraints.get('constrained_columns', [])

                    for col in expected_cols:
                        if col in pk_columns:
                            # Primary key columns are automatically indexed
                            continue

                        # Check if column has an index
                        has_index = any(col in idx['column_names'] for idx in indexes)

                        if not has_index and col.endswith('_id') and col != f"{table.split('_')[1]}_id":
                            # Foreign key should have index
                            result = TestResult(
                                test_name=f"index_check_{table}_{col}",
                                category=TestCategory.STRUCTURAL,
                                status="WARN",
                                execution_time=time.time() - start_time,
                                details={'table': table, 'column': col},
                                warnings=[f"Foreign key {col} in {table} should have an index for performance"]
                            )
                            results.append(result)

                except Exception as e:
                    result = TestResult(
                        test_name=f"index_check_{table}",
                        category=TestCategory.STRUCTURAL,
                        status="ERROR",
                        execution_time=time.time() - start_time,
                        details={'table': table},
                        errors=[f"Failed to check indexes for {table}: {e}"]
                    )
                    results.append(result)

        except Exception as e:
            result = TestResult(
                test_name="index_check_general",
                category=TestCategory.STRUCTURAL,
                status="ERROR",
                execution_time=time.time() - start_time,
                details={},
                errors=[f"Failed to check database indexes: {e}"]
            )
            results.append(result)

        return results

    def _test_foreign_keys(self) -> List[TestResult]:
        """Test foreign key constraints"""
        results = []

        foreign_key_tests = [
            ("test_orders", "user_id", "test_users", "user_id"),
            ("test_transactions", "user_id", "test_users", "user_id")
        ]

        for child_table, child_col, parent_table, parent_col in foreign_key_tests:
            result = self._test_foreign_key_constraint(child_table, child_col, parent_table, parent_col)
            results.append(result)

        return results

    def _test_foreign_key_constraint(self, child_table: str, child_col: str, parent_table: str, parent_col: str) -> TestResult:
        """Test that foreign key constraints work properly"""
        start_time = time.time()

        try:
            with self.engine.connect() as conn:
                # Try to insert record with non-existent foreign key
                if child_table == "test_orders":
                    sql = f"INSERT INTO {child_table} (order_id, {child_col}, product_id, quantity, price) VALUES (99999, 999999, 1, 1, 10.00)"
                elif child_table == "test_transactions":
                    sql = f"INSERT INTO {child_table} (transaction_id, {child_col}, amount, transaction_type) VALUES (99999, 999999, 100.00, 'test')"

                conn.execute(text(sql))
                conn.commit()

                # If we get here, foreign key constraint failed
                result = TestResult(
                    test_name=f"foreign_key_{child_table}_{child_col}",
                    category=TestCategory.STRUCTURAL,
                    status="FAIL",
                    execution_time=time.time() - start_time,
                    details={
                        'child_table': child_table,
                        'child_column': child_col,
                        'parent_table': parent_table,
                        'parent_column': parent_col
                    },
                    errors=[f"Foreign key constraint {child_table}.{child_col} -> {parent_table}.{parent_col} did not prevent invalid reference"]
                )

        except Exception as e:
            # Expected behavior - foreign key should prevent invalid reference
            result = TestResult(
                test_name=f"foreign_key_{child_table}_{child_col}",
                category=TestCategory.STRUCTURAL,
                status="PASS",
                execution_time=time.time() - start_time,
                details={
                    'child_table': child_table,
                    'child_column': child_col,
                    'parent_table': parent_table,
                    'parent_column': parent_col,
                    'constraint_error': str(e)
                }
            )

        return result

    def run_functional_tests(self) -> List[TestResult]:
        """Run comprehensive functional database tests"""
        logger.info("Running functional tests")
        functional_tests = []

        # CRUD operation tests
        functional_tests.extend(self._test_crud_operations())
        functional_tests.extend(self._test_transaction_handling())
        functional_tests.extend(self._test_business_logic())
        functional_tests.extend(self._test_data_consistency())

        return functional_tests

    def _test_crud_operations(self) -> List[TestResult]:
        """Test basic CRUD operations"""
        results = []

        # Test CREATE operations
        results.append(self._test_create_operation())

        # Test READ operations
        results.append(self._test_read_operations())

        # Test UPDATE operations
        results.append(self._test_update_operations())

        # Test DELETE operations
        results.append(self._test_delete_operations())

        return results

    def _test_create_operation(self) -> TestResult:
        """Test CREATE operations"""
        start_time = time.time()

        try:
            with self.engine.connect() as conn:
                # Insert new user
                sql = """
                INSERT INTO test_users (user_id, email, username, first_name, last_name, age, is_active, balance)
                VALUES (99990, 'crud_test@test.com', 'crud_test_user', 'Test', 'User', 25, TRUE, 100.00)
                """
                result = conn.execute(text(sql))
                conn.commit()

                # Verify insertion
                verify_sql = "SELECT COUNT(*) as count FROM test_users WHERE user_id = 99990"
                verify_result = conn.execute(text(verify_sql)).fetchone()

                if verify_result[0] == 1:
                    test_result = TestResult(
                        test_name="crud_create_operation",
                        category=TestCategory.FUNCTIONAL,
                        status="PASS",
                        execution_time=time.time() - start_time,
                        details={'rows_inserted': result.rowcount, 'verified': True}
                    )
                else:
                    test_result = TestResult(
                        test_name="crud_create_operation",
                        category=TestCategory.FUNCTIONAL,
                        status="FAIL",
                        execution_time=time.time() - start_time,
                        details={'rows_inserted': result.rowcount, 'verified': False},
                        errors=["Failed to verify inserted record"]
                    )

        except Exception as e:
            test_result = TestResult(
                test_name="crud_create_operation",
                category=TestCategory.FUNCTIONAL,
                status="ERROR",
                execution_time=time.time() - start_time,
                details={},
                errors=[f"CREATE operation failed: {e}"]
            )

        return test_result

    def _test_read_operations(self) -> TestResult:
        """Test READ operations"""
        start_time = time.time()

        try:
            with self.engine.connect() as conn:
                # Test simple SELECT
                sql = "SELECT COUNT(*) as total_users FROM test_users"
                result = conn.execute(text(sql)).fetchone()
                total_users = result[0]

                # Test SELECT with WHERE clause
                sql = "SELECT COUNT(*) as active_users FROM test_users WHERE is_active = TRUE"
                result = conn.execute(text(sql)).fetchone()
                active_users = result[0]

                # Test JOIN operation
                sql = """
                SELECT COUNT(*) as order_count
                FROM test_orders o
                JOIN test_users u ON o.user_id = u.user_id
                WHERE u.is_active = TRUE
                """
                result = conn.execute(text(sql)).fetchone()
                order_count = result[0]

                test_result = TestResult(
                    test_name="crud_read_operations",
                    category=TestCategory.FUNCTIONAL,
                    status="PASS",
                    execution_time=time.time() - start_time,
                    details={
                        'total_users': total_users,
                        'active_users': active_users,
                        'orders_by_active_users': order_count
                    }
                )

        except Exception as e:
            test_result = TestResult(
                test_name="crud_read_operations",
                category=TestCategory.FUNCTIONAL,
                status="ERROR",
                execution_time=time.time() - start_time,
                details={},
                errors=[f"READ operations failed: {e}"]
            )

        return test_result

    def _test_update_operations(self) -> TestResult:
        """Test UPDATE operations"""
        start_time = time.time()

        try:
            with self.engine.connect() as conn:
                # Update user balance
                sql = "UPDATE test_users SET balance = balance + 50.00 WHERE user_id = 1"
                result = conn.execute(text(sql))
                conn.commit()

                # Verify update
                verify_sql = "SELECT balance FROM test_users WHERE user_id = 1"
                verify_result = conn.execute(text(verify_sql)).fetchone()

                if result.rowcount > 0:
                    test_result = TestResult(
                        test_name="crud_update_operations",
                        category=TestCategory.FUNCTIONAL,
                        status="PASS",
                        execution_time=time.time() - start_time,
                        details={
                            'rows_updated': result.rowcount,
                            'new_balance': float(verify_result[0]) if verify_result else None
                        }
                    )
                else:
                    test_result = TestResult(
                        test_name="crud_update_operations",
                        category=TestCategory.FUNCTIONAL,
                        status="FAIL",
                        execution_time=time.time() - start_time,
                        details={'rows_updated': result.rowcount},
                        errors=["No rows were updated"]
                    )

        except Exception as e:
            test_result = TestResult(
                test_name="crud_update_operations",
                category=TestCategory.FUNCTIONAL,
                status="ERROR",
                execution_time=time.time() - start_time,
                details={},
                errors=[f"UPDATE operations failed: {e}"]
            )

        return test_result

    def _test_delete_operations(self) -> TestResult:
        """Test DELETE operations"""
        start_time = time.time()

        try:
            with self.engine.connect() as conn:
                # Delete test user created earlier
                sql = "DELETE FROM test_users WHERE user_id = 99990"
                result = conn.execute(text(sql))
                conn.commit()

                test_result = TestResult(
                    test_name="crud_delete_operations",
                    category=TestCategory.FUNCTIONAL,
                    status="PASS",
                    execution_time=time.time() - start_time,
                    details={'rows_deleted': result.rowcount}
                )

        except Exception as e:
            test_result = TestResult(
                test_name="crud_delete_operations",
                category=TestCategory.FUNCTIONAL,
                status="ERROR",
                execution_time=time.time() - start_time,
                details={},
                errors=[f"DELETE operations failed: {e}"]
            )

        return test_result

    def _test_transaction_handling(self) -> List[TestResult]:
        """Test transaction handling and ACID properties"""
        results = []

        # Test transaction rollback
        results.append(self._test_transaction_rollback())

        # Test transaction commit
        results.append(self._test_transaction_commit())

        # Test concurrent transactions
        results.append(self._test_concurrent_transactions())

        return results

    def _test_transaction_rollback(self) -> TestResult:
        """Test transaction rollback functionality"""
        start_time = time.time()

        try:
            with self.engine.connect() as conn:
                # Start transaction
                trans = conn.begin()

                try:
                    # Insert test data
                    conn.execute(text("INSERT INTO test_users (user_id, email, username) VALUES (99991, 'rollback_test@test.com', 'rollback_user')"))

                    # Verify data exists within transaction
                    result = conn.execute(text("SELECT COUNT(*) FROM test_users WHERE user_id = 99991")).fetchone()
                    count_in_transaction = result[0]

                    # Force rollback
                    trans.rollback()

                    # Verify data was rolled back
                    result = conn.execute(text("SELECT COUNT(*) FROM test_users WHERE user_id = 99991")).fetchone()
                    count_after_rollback = result[0]

                    if count_in_transaction == 1 and count_after_rollback == 0:
                        test_result = TestResult(
                            test_name="transaction_rollback",
                            category=TestCategory.FUNCTIONAL,
                            status="PASS",
                            execution_time=time.time() - start_time,
                            details={
                                'count_in_transaction': count_in_transaction,
                                'count_after_rollback': count_after_rollback
                            }
                        )
                    else:
                        test_result = TestResult(
                            test_name="transaction_rollback",
                            category=TestCategory.FUNCTIONAL,
                            status="FAIL",
                            execution_time=time.time() - start_time,
                            details={
                                'count_in_transaction': count_in_transaction,
                                'count_after_rollback': count_after_rollback
                            },
                            errors=["Transaction rollback did not work correctly"]
                        )

                except Exception as inner_e:
                    trans.rollback()
                    raise inner_e

        except Exception as e:
            test_result = TestResult(
                test_name="transaction_rollback",
                category=TestCategory.FUNCTIONAL,
                status="ERROR",
                execution_time=time.time() - start_time,
                details={},
                errors=[f"Transaction rollback test failed: {e}"]
            )

        return test_result

    def _test_transaction_commit(self) -> TestResult:
        """Test transaction commit functionality"""
        start_time = time.time()

        try:
            with self.engine.connect() as conn:
                # Start transaction
                trans = conn.begin()

                try:
                    # Insert test data
                    conn.execute(text("INSERT INTO test_users (user_id, email, username) VALUES (99992, 'commit_test@test.com', 'commit_user')"))

                    # Commit transaction
                    trans.commit()

                    # Verify data persists after commit
                    result = conn.execute(text("SELECT COUNT(*) FROM test_users WHERE user_id = 99992")).fetchone()
                    count_after_commit = result[0]

                    if count_after_commit == 1:
                        test_result = TestResult(
                            test_name="transaction_commit",
                            category=TestCategory.FUNCTIONAL,
                            status="PASS",
                            execution_time=time.time() - start_time,
                            details={'count_after_commit': count_after_commit}
                        )
                    else:
                        test_result = TestResult(
                            test_name="transaction_commit",
                            category=TestCategory.FUNCTIONAL,
                            status="FAIL",
                            execution_time=time.time() - start_time,
                            details={'count_after_commit': count_after_commit},
                            errors=["Transaction commit did not persist data"]
                        )

                except Exception as inner_e:
                    trans.rollback()
                    raise inner_e

        except Exception as e:
            test_result = TestResult(
                test_name="transaction_commit",
                category=TestCategory.FUNCTIONAL,
                status="ERROR",
                execution_time=time.time() - start_time,
                details={},
                errors=[f"Transaction commit test failed: {e}"]
            )

        return test_result

    def _test_concurrent_transactions(self) -> TestResult:
        """Test concurrent transaction handling"""
        start_time = time.time()

        try:
            # This is a simplified test - in practice, you'd use threading
            # or multiprocessing to test true concurrency

            with self.engine.connect() as conn1, self.engine.connect() as conn2:
                # Start transactions on both connections
                trans1 = conn1.begin()
                trans2 = conn2.begin()

                try:
                    # Transaction 1: Update user balance
                    conn1.execute(text("UPDATE test_users SET balance = balance + 100 WHERE user_id = 1"))

                    # Transaction 2: Try to read the same user's balance
                    result = conn2.execute(text("SELECT balance FROM test_users WHERE user_id = 1")).fetchone()
                    balance_before_commit = float(result[0])

                    # Commit transaction 1
                    trans1.commit()

                    # Now read again from transaction 2
                    result = conn2.execute(text("SELECT balance FROM test_users WHERE user_id = 1")).fetchone()
                    balance_after_commit = float(result[0])

                    trans2.commit()

                    # Check if isolation was maintained
                    isolation_maintained = balance_before_commit == balance_after_commit

                    test_result = TestResult(
                        test_name="concurrent_transactions",
                        category=TestCategory.FUNCTIONAL,
                        status="PASS",
                        execution_time=time.time() - start_time,
                        details={
                            'balance_before_commit': balance_before_commit,
                            'balance_after_commit': balance_after_commit,
                            'isolation_maintained': isolation_maintained
                        }
                    )

                except Exception as inner_e:
                    trans1.rollback()
                    trans2.rollback()
                    raise inner_e

        except Exception as e:
            test_result = TestResult(
                test_name="concurrent_transactions",
                category=TestCategory.FUNCTIONAL,
                status="ERROR",
                execution_time=time.time() - start_time,
                details={},
                errors=[f"Concurrent transaction test failed: {e}"]
            )

        return test_result

    def _test_business_logic(self) -> List[TestResult]:
        """Test business logic implemented in database"""
        results = []

        # Test calculated fields
        results.append(self._test_calculated_fields())

        # Test data validation rules
        results.append(self._test_data_validation_rules())

        # Test aggregation functions
        results.append(self._test_aggregation_functions())

        return results

    def _test_calculated_fields(self) -> TestResult:
        """Test calculated fields and computed columns"""
        start_time = time.time()

        try:
            with self.engine.connect() as conn:
                # Test order total calculation
                sql = """
                SELECT
                    order_id,
                    quantity,
                    price,
                    (quantity * price) as calculated_total
                FROM test_orders
                WHERE order_id <= 10
                ORDER BY order_id
                """

                results = conn.execute(text(sql)).fetchall()

                calculation_errors = []
                for row in results:
                    order_id, quantity, price, calculated_total = row
                    expected_total = quantity * price

                    if abs(float(calculated_total) - float(expected_total)) > 0.01:
                        calculation_errors.append({
                            'order_id': order_id,
                            'expected': expected_total,
                            'calculated': calculated_total
                        })

                if not calculation_errors:
                    test_result = TestResult(
                        test_name="calculated_fields",
                        category=TestCategory.FUNCTIONAL,
                        status="PASS",
                        execution_time=time.time() - start_time,
                        details={'orders_tested': len(results)}
                    )
                else:
                    test_result = TestResult(
                        test_name="calculated_fields",
                        category=TestCategory.FUNCTIONAL,
                        status="FAIL",
                        execution_time=time.time() - start_time,
                        details={'calculation_errors': calculation_errors},
                        errors=[f"Found {len(calculation_errors)} calculation errors"]
                    )

        except Exception as e:
            test_result = TestResult(
                test_name="calculated_fields",
                category=TestCategory.FUNCTIONAL,
                status="ERROR",
                execution_time=time.time() - start_time,
                details={},
                errors=[f"Calculated fields test failed: {e}"]
            )

        return test_result

    def _test_data_validation_rules(self) -> TestResult:
        """Test data validation rules and business constraints"""
        start_time = time.time()

        try:
            with self.engine.connect() as conn:
                # Test that all active users have valid email addresses
                sql = """
                SELECT user_id, email
                FROM test_users
                WHERE is_active = TRUE
                AND (email IS NULL OR email = '' OR email NOT LIKE '%@%')
                """

                invalid_emails = conn.execute(text(sql)).fetchall()

                # Test that all orders have positive quantities
                sql = "SELECT order_id, quantity FROM test_orders WHERE quantity <= 0"
                invalid_quantities = conn.execute(text(sql)).fetchall()

                # Test that product prices are non-negative
                sql = "SELECT product_id, price FROM test_products WHERE price < 0"
                invalid_prices = conn.execute(text(sql)).fetchall()

                validation_errors = []
                if invalid_emails:
                    validation_errors.append(f"Found {len(invalid_emails)} users with invalid emails")
                if invalid_quantities:
                    validation_errors.append(f"Found {len(invalid_quantities)} orders with invalid quantities")
                if invalid_prices:
                    validation_errors.append(f"Found {len(invalid_prices)} products with invalid prices")

                if not validation_errors:
                    test_result = TestResult(
                        test_name="data_validation_rules",
                        category=TestCategory.FUNCTIONAL,
                        status="PASS",
                        execution_time=time.time() - start_time,
                        details={'validation_checks_passed': 3}
                    )
                else:
                    test_result = TestResult(
                        test_name="data_validation_rules",
                        category=TestCategory.FUNCTIONAL,
                        status="FAIL",
                        execution_time=time.time() - start_time,
                        details={
                            'invalid_emails': len(invalid_emails),
                            'invalid_quantities': len(invalid_quantities),
                            'invalid_prices': len(invalid_prices)
                        },
                        errors=validation_errors
                    )

        except Exception as e:
            test_result = TestResult(
                test_name="data_validation_rules",
                category=TestCategory.FUNCTIONAL,
                status="ERROR",
                execution_time=time.time() - start_time,
                details={},
                errors=[f"Data validation rules test failed: {e}"]
            )

        return test_result

    def _test_aggregation_functions(self) -> TestResult:
        """Test aggregation functions and complex queries"""
        start_time = time.time()

        try:
            with self.engine.connect() as conn:
                # Test various aggregation functions
                sql = """
                SELECT
                    COUNT(*) as total_orders,
                    SUM(price * quantity) as total_revenue,
                    AVG(price) as avg_order_price,
                    MAX(price) as max_order_price,
                    MIN(price) as min_order_price
                FROM test_orders
                """

                result = conn.execute(text(sql)).fetchone()
                total_orders, total_revenue, avg_price, max_price, min_price = result

                # Test GROUP BY aggregation
                sql = """
                SELECT
                    status,
                    COUNT(*) as order_count,
                    SUM(price * quantity) as status_revenue
                FROM test_orders
                GROUP BY status
                ORDER BY order_count DESC
                """

                grouped_results = conn.execute(text(sql)).fetchall()

                # Validate aggregation results
                aggregation_issues = []

                if total_orders <= 0:
                    aggregation_issues.append("Total orders count is invalid")

                if total_revenue is None or total_revenue < 0:
                    aggregation_issues.append("Total revenue calculation is invalid")

                if not grouped_results:
                    aggregation_issues.append("GROUP BY aggregation returned no results")

                if not aggregation_issues:
                    test_result = TestResult(
                        test_name="aggregation_functions",
                        category=TestCategory.FUNCTIONAL,
                        status="PASS",
                        execution_time=time.time() - start_time,
                        details={
                            'total_orders': total_orders,
                            'total_revenue': float(total_revenue) if total_revenue else 0,
                            'avg_price': float(avg_price) if avg_price else 0,
                            'grouped_results_count': len(grouped_results)
                        }
                    )
                else:
                    test_result = TestResult(
                        test_name="aggregation_functions",
                        category=TestCategory.FUNCTIONAL,
                        status="FAIL",
                        execution_time=time.time() - start_time,
                        details={
                            'total_orders': total_orders,
                            'total_revenue': float(total_revenue) if total_revenue else 0,
                            'grouped_results_count': len(grouped_results)
                        },
                        errors=aggregation_issues
                    )

        except Exception as e:
            test_result = TestResult(
                test_name="aggregation_functions",
                category=TestCategory.FUNCTIONAL,
                status="ERROR",
                execution_time=time.time() - start_time,
                details={},
                errors=[f"Aggregation functions test failed: {e}"]
            )

        return test_result

    def _test_data_consistency(self) -> List[TestResult]:
        """Test data consistency across related tables"""
        results = []

        # Test referential integrity
        results.append(self._test_referential_integrity())

        # Test data synchronization
        results.append(self._test_data_synchronization())

        return results

    def _test_referential_integrity(self) -> TestResult:
        """Test referential integrity across tables"""
        start_time = time.time()

        try:
            with self.engine.connect() as conn:
                # Check for orphaned orders (orders without valid users)
                sql = """
                SELECT COUNT(*) as orphaned_orders
                FROM test_orders o
                LEFT JOIN test_users u ON o.user_id = u.user_id
                WHERE u.user_id IS NULL
                """

                orphaned_orders = conn.execute(text(sql)).fetchone()[0]

                # Check for orphaned transactions
                sql = """
                SELECT COUNT(*) as orphaned_transactions
                FROM test_transactions t
                LEFT JOIN test_users u ON t.user_id = u.user_id
                WHERE u.user_id IS NULL
                """

                orphaned_transactions = conn.execute(text(sql)).fetchone()[0]

                integrity_issues = []
                if orphaned_orders > 0:
                    integrity_issues.append(f"Found {orphaned_orders} orphaned orders")
                if orphaned_transactions > 0:
                    integrity_issues.append(f"Found {orphaned_transactions} orphaned transactions")

                if not integrity_issues:
                    test_result = TestResult(
                        test_name="referential_integrity",
                        category=TestCategory.FUNCTIONAL,
                        status="PASS",
                        execution_time=time.time() - start_time,
                        details={
                            'orphaned_orders': orphaned_orders,
                            'orphaned_transactions': orphaned_transactions
                        }
                    )
                else:
                    test_result = TestResult(
                        test_name="referential_integrity",
                        category=TestCategory.FUNCTIONAL,
                        status="FAIL",
                        execution_time=time.time() - start_time,
                        details={
                            'orphaned_orders': orphaned_orders,
                            'orphaned_transactions': orphaned_transactions
                        },
                        errors=integrity_issues
                    )

        except Exception as e:
            test_result = TestResult(
                test_name="referential_integrity",
                category=TestCategory.FUNCTIONAL,
                status="ERROR",
                execution_time=time.time() - start_time,
                details={},
                errors=[f"Referential integrity test failed: {e}"]
            )

        return test_result

    def _test_data_synchronization(self) -> TestResult:
        """Test data synchronization and consistency rules"""
        start_time = time.time()

        try:
            with self.engine.connect() as conn:
                # Check if user balances match transaction history
                sql = """
                SELECT
                    u.user_id,
                    u.balance as current_balance,
                    COALESCE(SUM(CASE WHEN t.transaction_type IN ('deposit', 'transfer_in') THEN t.amount
                                     WHEN t.transaction_type IN ('withdrawal', 'purchase', 'transfer_out') THEN -t.amount
                                     ELSE 0 END), 0) as calculated_balance
                FROM test_users u
                LEFT JOIN test_transactions t ON u.user_id = t.user_id AND t.status = 'completed'
                WHERE u.user_id <= 10  -- Test first 10 users
                GROUP BY u.user_id, u.balance
                HAVING ABS(u.balance - COALESCE(SUM(CASE WHEN t.transaction_type IN ('deposit', 'transfer_in') THEN t.amount
                                                        WHEN t.transaction_type IN ('withdrawal', 'purchase', 'transfer_out') THEN -t.amount
                                                        ELSE 0 END), 0)) > 0.01
                """

                balance_discrepancies = conn.execute(text(sql)).fetchall()

                if not balance_discrepancies:
                    test_result = TestResult(
                        test_name="data_synchronization",
                        category=TestCategory.FUNCTIONAL,
                        status="PASS",
                        execution_time=time.time() - start_time,
                        details={'users_checked': 10, 'discrepancies_found': 0}
                    )
                else:
                    test_result = TestResult(
                        test_name="data_synchronization",
                        category=TestCategory.FUNCTIONAL,
                        status="FAIL",
                        execution_time=time.time() - start_time,
                        details={
                            'users_checked': 10,
                            'discrepancies_found': len(balance_discrepancies),
                            'discrepancies': [dict(row._mapping) for row in balance_discrepancies]
                        },
                        errors=[f"Found {len(balance_discrepancies)} balance discrepancies"]
                    )

        except Exception as e:
            test_result = TestResult(
                test_name="data_synchronization",
                category=TestCategory.FUNCTIONAL,
                status="ERROR",
                execution_time=time.time() - start_time,
                details={},
                errors=[f"Data synchronization test failed: {e}"]
            )

        return test_result

    def run_performance_tests(self) -> List[TestResult]:
        """Run comprehensive database performance tests"""
        logger.info("Running performance tests")
        performance_tests = []

        # Query performance tests
        performance_tests.extend(self._test_query_performance())
        performance_tests.extend(self._test_bulk_operations())
        performance_tests.extend(self._test_concurrent_load())

        return performance_tests

    def _test_query_performance(self) -> List[TestResult]:
        """Test individual query performance"""
        results = []

        performance_tests = [
            ("simple_select", "SELECT COUNT(*) FROM test_users", 0.1),
            ("indexed_lookup", "SELECT * FROM test_users WHERE user_id = 1", 0.05),
            ("range_query", "SELECT * FROM test_orders WHERE order_date >= '2024-01-01'", 0.2),
            ("join_query", "SELECT u.username, COUNT(o.order_id) FROM test_users u LEFT JOIN test_orders o ON u.user_id = o.user_id GROUP BY u.user_id, u.username", 0.5),
            ("complex_aggregation", "SELECT status, COUNT(*), AVG(price * quantity) FROM test_orders GROUP BY status ORDER BY COUNT(*) DESC", 0.3)
        ]

        for test_name, query, max_time in performance_tests:
            result = self._test_single_query_performance(test_name, query, max_time)
            results.append(result)

        return results

    def _test_single_query_performance(self, test_name: str, query: str, max_execution_time: float) -> TestResult:
        """Test performance of a single query"""
        start_time = time.time()

        try:
            with self.engine.connect() as conn:
                query_start = time.time()
                result = conn.execute(text(query))
                rows = result.fetchall()
                query_time = time.time() - query_start

                if query_time <= max_execution_time:
                    test_result = TestResult(
                        test_name=f"query_performance_{test_name}",
                        category=TestCategory.PERFORMANCE,
                        status="PASS",
                        execution_time=time.time() - start_time,
                        details={
                            'query_execution_time': query_time,
                            'max_allowed_time': max_execution_time,
                            'rows_returned': len(rows),
                            'query': query
                        }
                    )
                else:
                    test_result = TestResult(
                        test_name=f"query_performance_{test_name}",
                        category=TestCategory.PERFORMANCE,
                        status="FAIL",
                        execution_time=time.time() - start_time,
                        details={
                            'query_execution_time': query_time,
                            'max_allowed_time': max_execution_time,
                            'rows_returned': len(rows),
                            'query': query
                        },
                        errors=[f"Query took {query_time:.3f}s, exceeding limit of {max_execution_time}s"]
                    )

        except Exception as e:
            test_result = TestResult(
                test_name=f"query_performance_{test_name}",
                category=TestCategory.PERFORMANCE,
                status="ERROR",
                execution_time=time.time() - start_time,
                details={'query': query},
                errors=[f"Query performance test failed: {e}"]
            )

        return test_result

    def _test_bulk_operations(self) -> List[TestResult]:
        """Test bulk operation performance"""
        results = []

        # Test bulk insert
        results.append(self._test_bulk_insert_performance())

        # Test bulk update
        results.append(self._test_bulk_update_performance())

        # Test bulk delete
        results.append(self._test_bulk_delete_performance())

        return results

    def _test_bulk_insert_performance(self) -> TestResult:
        """Test bulk insert performance"""
        start_time = time.time()

        try:
            # Generate test data
            bulk_users = []
            for i in range(1000):  # Insert 1000 users
                user = {
                    'user_id': 50000 + i,
                    'email': f'bulk_user_{i}@test.com',
                    'username': f'bulk_user_{i}',
                    'first_name': 'Bulk',
                    'last_name': 'User',
                    'age': 25,
                    'is_active': True,
                    'balance': 0.00
                }
                bulk_users.append(user)

            # Perform bulk insert
            insert_start = time.time()
            df = pd.DataFrame(bulk_users)
            df.to_sql('test_users', self.engine, if_exists='append', index=False)
            insert_time = time.time() - insert_start

            # Verify insertions
            with self.engine.connect() as conn:
                verify_sql = "SELECT COUNT(*) FROM test_users WHERE user_id >= 50000 AND user_id < 51000"
                result = conn.execute(text(verify_sql)).fetchone()
                inserted_count = result[0]

            # Performance threshold: should insert 1000 records in under 5 seconds
            max_insert_time = 5.0

            if insert_time <= max_insert_time and inserted_count == 1000:
                test_result = TestResult(
                    test_name="bulk_insert_performance",
                    category=TestCategory.PERFORMANCE,
                    status="PASS",
                    execution_time=time.time() - start_time,
                    details={
                        'insert_time': insert_time,
                        'max_allowed_time': max_insert_time,
                        'records_inserted': inserted_count,
                        'records_per_second': 1000 / insert_time
                    }
                )
            else:
                errors = []
                if insert_time > max_insert_time:
                    errors.append(f"Insert took {insert_time:.3f}s, exceeding limit of {max_insert_time}s")
                if inserted_count != 1000:
                    errors.append(f"Expected 1000 insertions, got {inserted_count}")

                test_result = TestResult(
                    test_name="bulk_insert_performance",
                    category=TestCategory.PERFORMANCE,
                    status="FAIL",
                    execution_time=time.time() - start_time,
                    details={
                        'insert_time': insert_time,
                        'max_allowed_time': max_insert_time,
                        'records_inserted': inserted_count,
                        'records_per_second': inserted_count / insert_time if insert_time > 0 else 0
                    },
                    errors=errors
                )

        except Exception as e:
            test_result = TestResult(
                test_name="bulk_insert_performance",
                category=TestCategory.PERFORMANCE,
                status="ERROR",
                execution_time=time.time() - start_time,
                details={},
                errors=[f"Bulk insert performance test failed: {e}"]
            )

        return test_result

    def _test_bulk_update_performance(self) -> TestResult:
        """Test bulk update performance"""
        start_time = time.time()

        try:
            with self.engine.connect() as conn:
                # Perform bulk update
                update_start = time.time()
                sql = "UPDATE test_users SET balance = balance + 10.00 WHERE user_id >= 50000 AND user_id < 51000"
                result = conn.execute(text(sql))
                conn.commit()
                update_time = time.time() - update_start

                updated_count = result.rowcount

                # Performance threshold: should update 1000 records in under 2 seconds
                max_update_time = 2.0

                if update_time <= max_update_time and updated_count == 1000:
                    test_result = TestResult(
                        test_name="bulk_update_performance",
                        category=TestCategory.PERFORMANCE,
                        status="PASS",
                        execution_time=time.time() - start_time,
                        details={
                            'update_time': update_time,
                            'max_allowed_time': max_update_time,
                            'records_updated': updated_count,
                            'records_per_second': updated_count / update_time if update_time > 0 else 0
                        }
                    )
                else:
                    errors = []
                    if update_time > max_update_time:
                        errors.append(f"Update took {update_time:.3f}s, exceeding limit of {max_update_time}s")
                    if updated_count != 1000:
                        errors.append(f"Expected 1000 updates, got {updated_count}")

                    test_result = TestResult(
                        test_name="bulk_update_performance",
                        category=TestCategory.PERFORMANCE,
                        status="FAIL",
                        execution_time=time.time() - start_time,
                        details={
                            'update_time': update_time,
                            'max_allowed_time': max_update_time,
                            'records_updated': updated_count,
                            'records_per_second': updated_count / update_time if update_time > 0 else 0
                        },
                        errors=errors
                    )

        except Exception as e:
            test_result = TestResult(
                test_name="bulk_update_performance",
                category=TestCategory.PERFORMANCE,
                status="ERROR",
                execution_time=time.time() - start_time,
                details={},
                errors=[f"Bulk update performance test failed: {e}"]
            )

        return test_result

    def _test_bulk_delete_performance(self) -> TestResult:
        """Test bulk delete performance"""
        start_time = time.time()

        try:
            with self.engine.connect() as conn:
                # Perform bulk delete
                delete_start = time.time()
                sql = "DELETE FROM test_users WHERE user_id >= 50000 AND user_id < 51000"
                result = conn.execute(text(sql))
                conn.commit()
                delete_time = time.time() - delete_start

                deleted_count = result.rowcount

                # Performance threshold: should delete 1000 records in under 2 seconds
                max_delete_time = 2.0

                if delete_time <= max_delete_time and deleted_count == 1000:
                    test_result = TestResult(
                        test_name="bulk_delete_performance",
                        category=TestCategory.PERFORMANCE,
                        status="PASS",
                        execution_time=time.time() - start_time,
                        details={
                            'delete_time': delete_time,
                            'max_allowed_time': max_delete_time,
                            'records_deleted': deleted_count,
                            'records_per_second': deleted_count / delete_time if delete_time > 0 else 0
                        }
                    )
                else:
                    errors = []
                    if delete_time > max_delete_time:
                        errors.append(f"Delete took {delete_time:.3f}s, exceeding limit of {max_delete_time}s")
                    if deleted_count != 1000:
                        errors.append(f"Expected 1000 deletions, got {deleted_count}")

                    test_result = TestResult(
                        test_name="bulk_delete_performance",
                        category=TestCategory.PERFORMANCE,
                        status="FAIL",
                        execution_time=time.time() - start_time,
                        details={
                            'delete_time': delete_time,
                            'max_allowed_time': max_delete_time,
                            'records_deleted': deleted_count,
                            'records_per_second': deleted_count / delete_time if delete_time > 0 else 0
                        },
                        errors=errors
                    )

        except Exception as e:
            test_result = TestResult(
                test_name="bulk_delete_performance",
                category=TestCategory.PERFORMANCE,
                status="ERROR",
                execution_time=time.time() - start_time,
                details={},
                errors=[f"Bulk delete performance test failed: {e}"]
            )

        return test_result

    def _test_concurrent_load(self) -> List[TestResult]:
        """Test database performance under concurrent load"""
        results = []

        # Simulate concurrent read operations
        results.append(self._test_concurrent_reads())

        # Simulate concurrent write operations
        results.append(self._test_concurrent_writes())

        return results

    def _test_concurrent_reads(self) -> TestResult:
        """Test concurrent read performance"""
        start_time = time.time()

        try:
            import threading
            import queue

            # Results queue for threads
            results_queue = queue.Queue()

            def read_worker(worker_id):
                try:
                    with self.engine.connect() as conn:
                        worker_start = time.time()

                        # Perform multiple read operations
                        for i in range(10):
                            sql = f"SELECT COUNT(*) FROM test_users WHERE user_id % {worker_id + 1} = 0"
                            result = conn.execute(text(sql)).fetchone()

                        worker_time = time.time() - worker_start
                        results_queue.put(('success', worker_id, worker_time))

                except Exception as e:
                    results_queue.put(('error', worker_id, str(e)))

            # Start 5 concurrent read workers
            threads = []
            for i in range(5):
                thread = threading.Thread(target=read_worker, args=(i,))
                threads.append(thread)
                thread.start()

            # Wait for all threads to complete
            for thread in threads:
                thread.join()

            # Collect results
            worker_results = []
            errors = []

            while not results_queue.empty():
                result_type, worker_id, data = results_queue.get()
                if result_type == 'success':
                    worker_results.append(data)
                else:
                    errors.append(f"Worker {worker_id}: {data}")

            if not errors and len(worker_results) == 5:
                avg_time = sum(worker_results) / len(worker_results)
                max_time = max(worker_results)

                # Performance threshold: average should be under 1 second
                max_avg_time = 1.0

                if avg_time <= max_avg_time:
                    test_result = TestResult(
                        test_name="concurrent_reads_performance",
                        category=TestCategory.PERFORMANCE,
                        status="PASS",
                        execution_time=time.time() - start_time,
                        details={
                            'concurrent_workers': 5,
                            'avg_worker_time': avg_time,
                            'max_worker_time': max_time,
                            'max_allowed_avg_time': max_avg_time
                        }
                    )
                else:
                    test_result = TestResult(
                        test_name="concurrent_reads_performance",
                        category=TestCategory.PERFORMANCE,
                        status="FAIL",
                        execution_time=time.time() - start_time,
                        details={
                            'concurrent_workers': 5,
                            'avg_worker_time': avg_time,
                            'max_worker_time': max_time,
                            'max_allowed_avg_time': max_avg_time
                        },
                        errors=[f"Average concurrent read time {avg_time:.3f}s exceeds limit of {max_avg_time}s"]
                    )
            else:
                test_result = TestResult(
                    test_name="concurrent_reads_performance",
                    category=TestCategory.PERFORMANCE,
                    status="ERROR",
                    execution_time=time.time() - start_time,
                    details={'workers_completed': len(worker_results)},
                    errors=errors or ["Not all workers completed successfully"]
                )

        except Exception as e:
            test_result = TestResult(
                test_name="concurrent_reads_performance",
                category=TestCategory.PERFORMANCE,
                status="ERROR",
                execution_time=time.time() - start_time,
                details={},
                errors=[f"Concurrent reads test failed: {e}"]
            )

        return test_result

    def _test_concurrent_writes(self) -> TestResult:
        """Test concurrent write performance"""
        start_time = time.time()

        try:
            import threading
            import queue

            # Results queue for threads
            results_queue = queue.Queue()

            def write_worker(worker_id):
                try:
                    with self.engine.connect() as conn:
                        worker_start = time.time()

                        # Perform multiple write operations
                        for i in range(5):
                            user_id = 60000 + (worker_id * 100) + i
                            sql = f"""
                            INSERT INTO test_users (user_id, email, username, first_name, last_name, age, is_active, balance)
                            VALUES ({user_id}, 'worker{worker_id}_user{i}@test.com', 'worker{worker_id}_user{i}', 'Worker', 'User', 25, TRUE, 0.00)
                            """
                            conn.execute(text(sql))
                            conn.commit()

                        worker_time = time.time() - worker_start
                        results_queue.put(('success', worker_id, worker_time))

                except Exception as e:
                    results_queue.put(('error', worker_id, str(e)))

            # Start 3 concurrent write workers (fewer to avoid lock contention)
            threads = []
            for i in range(3):
                thread = threading.Thread(target=write_worker, args=(i,))
                threads.append(thread)
                thread.start()

            # Wait for all threads to complete
            for thread in threads:
                thread.join()

            # Collect results
            worker_results = []
            errors = []

            while not results_queue.empty():
                result_type, worker_id, data = results_queue.get()
                if result_type == 'success':
                    worker_results.append(data)
                else:
                    errors.append(f"Worker {worker_id}: {data}")

            if not errors and len(worker_results) == 3:
                avg_time = sum(worker_results) / len(worker_results)
                max_time = max(worker_results)

                # Performance threshold: average should be under 2 seconds
                max_avg_time = 2.0

                if avg_time <= max_avg_time:
                    test_result = TestResult(
                        test_name="concurrent_writes_performance",
                        category=TestCategory.PERFORMANCE,
                        status="PASS",
                        execution_time=time.time() - start_time,
                        details={
                            'concurrent_workers': 3,
                            'avg_worker_time': avg_time,
                            'max_worker_time': max_time,
                            'max_allowed_avg_time': max_avg_time
                        }
                    )
                else:
                    test_result = TestResult(
                        test_name="concurrent_writes_performance",
                        category=TestCategory.PERFORMANCE,
                        status="FAIL",
                        execution_time=time.time() - start_time,
                        details={
                            'concurrent_workers': 3,
                            'avg_worker_time': avg_time,
                            'max_worker_time': max_time,
                            'max_allowed_avg_time': max_avg_time
                        },
                        errors=[f"Average concurrent write time {avg_time:.3f}s exceeds limit of {max_avg_time}s"]
                    )
            else:
                test_result = TestResult(
                    test_name="concurrent_writes_performance",
                    category=TestCategory.PERFORMANCE,
                    status="ERROR",
                    execution_time=time.time() - start_time,
                    details={'workers_completed': len(worker_results)},
                    errors=errors or ["Not all workers completed successfully"]
                )

        except Exception as e:
            test_result = TestResult(
                test_name="concurrent_writes_performance",
                category=TestCategory.PERFORMANCE,
                status="ERROR",
                execution_time=time.time() - start_time,
                details={},
                errors=[f"Concurrent writes test failed: {e}"]
            )

        return test_result

    def run_all_tests(self) -> Dict[str, Any]:
        """Run all database tests and generate comprehensive report"""
        logger.info("Starting comprehensive database testing")

        all_results = []

        try:
            # Setup test environment
            self.setup_test_environment()

            # Run all test categories
            all_results.extend(self.run_structural_tests())
            all_results.extend(self.run_functional_tests())
            all_results.extend(self.run_performance_tests())

            # Store results
            self.test_results = all_results

            # Generate summary
            summary = self._generate_test_summary()

            return summary

        except Exception as e:
            logger.error(f"Database testing failed: {e}")
            return {
                'status': 'ERROR',
                'error': str(e),
                'completed_tests': len(all_results)
            }

        finally:
            # Cleanup test data
            self.cleanup_test_environment()

    def _generate_test_summary(self) -> Dict[str, Any]:
        """Generate comprehensive test summary"""
        total_tests = len(self.test_results)
        passed_tests = sum(1 for r in self.test_results if r.status == "PASS")
        failed_tests = sum(1 for r in self.test_results if r.status == "FAIL")
        error_tests = sum(1 for r in self.test_results if r.status == "ERROR")

        # Group by category
        category_summary = {}
        for category in TestCategory:
            category_results = [r for r in self.test_results if r.category == category]
            category_summary[category.value] = {
                'total': len(category_results),
                'passed': sum(1 for r in category_results if r.status == "PASS"),
                'failed': sum(1 for r in category_results if r.status == "FAIL"),
                'errors': sum(1 for r in category_results if r.status == "ERROR")
            }

        # Calculate overall score
        if total_tests > 0:
            success_rate = (passed_tests / total_tests) * 100
        else:
            success_rate = 0

        return {
            'overall_status': 'PASS' if failed_tests == 0 and error_tests == 0 else 'FAIL',
            'total_tests': total_tests,
            'passed_tests': passed_tests,
            'failed_tests': failed_tests,
            'error_tests': error_tests,
            'success_rate': success_rate,
            'category_summary': category_summary,
            'test_results': [
                {
                    'test_name': r.test_name,
                    'category': r.category.value,
                    'status': r.status,
                    'execution_time': r.execution_time,
                    'details': r.details,
                    'errors': r.errors,
                    'warnings': r.warnings
                }
                for r in self.test_results
            ]
        }

    def generate_html_report(self, output_file: str = 'database_test_report.html'):
        """Generate comprehensive HTML test report"""
        summary = self._generate_test_summary()

        html_template = """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Database Testing Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                .header { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
                .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                          gap: 15px; margin: 20px 0; }
                .summary-card { background: #f9f9f9; padding: 15px; border-radius: 5px; text-align: center; }
                .score { font-size: 2em; font-weight: bold; margin: 10px 0; }
                .score-excellent { color: #4caf50; }
                .score-good { color: #ff9800; }
                .score-poor { color: #f44336; }
                .category-section { margin: 30px 0; }
                .test-result { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
                .test-pass { background: #e8f5e8; border-left: 4px solid #4caf50; }
                .test-fail { background: #ffebee; border-left: 4px solid #f44336; }
                .test-error { background: #fff3e0; border-left: 4px solid #ff9800; }
                .details { background: #f5f5f5; padding: 10px; border-radius: 3px; margin: 10px 0; }
                .errors { background: #ffebee; padding: 10px; border-radius: 3px; margin: 10px 0; }
                .warnings { background: #fff3e0; padding: 10px; border-radius: 3px; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Database Testing Report</h1>
                <p><strong>Database:</strong> {database_type} - {database_name}</p>
                <p><strong>Generated:</strong> {timestamp}</p>
            </div>

            <div class="summary">
                <div class="summary-card">
                    <h3>Overall Status</h3>
                    <div class="score {score_class}">{overall_status}</div>
                </div>
                <div class="summary-card">
                    <h3>Success Rate</h3>
                    <div class="score {score_class}">{success_rate:.1f}%</div>
                </div>
                <div class="summary-card">
                    <h3>Total Tests</h3>
                    <div class="score">{total_tests}</div>
                </div>
                <div class="summary-card">
                    <h3>Passed</h3>
                    <div class="score" style="color: #4caf50;">{passed_tests}</div>
                </div>
                <div class="summary-card">
                    <h3>Failed</h3>
                    <div class="score" style="color: #f44336;">{failed_tests}</div>
                </div>
                <div class="summary-card">
                    <h3>Errors</h3>
                    <div class="score" style="color: #ff9800;">{error_tests}</div>
                </div>
            </div>

            <h2>Results by Category</h2>
            {category_results}

            <h2>Detailed Test Results</h2>
            {detailed_results}

        </body>
        </html>
        """

        # Determine score class
        success_rate = summary['success_rate']
        if success_rate >= 95:
            score_class = "score-excellent"
        elif success_rate >= 80:
            score_class = "score-good"
        else:
            score_class = "score-poor"

        # Generate category results
        category_results_html = ""
        for category, stats in summary['category_summary'].items():
            category_results_html += f"""
            <div class="category-section">
                <h3>{category.replace('_', ' ').title()}</h3>
                <p>Total: {stats['total']}, Passed: {stats['passed']}, Failed: {stats['failed']}, Errors: {stats['errors']}</p>
            </div>
            """

        # Generate detailed results
        detailed_results_html = ""
        for result in summary['test_results']:
            status_class = f"test-{result['status'].lower()}"

            details_html = ""
            if result['details']:
                details_html = f"""
                <div class="details">
                    <h5>Details:</h5>
                    <pre>{json.dumps(result['details'], indent=2)}</pre>
                </div>
                """

            errors_html = ""
            if result['errors']:
                errors_html = f"""
                <div class="errors">
                    <h5>Errors:</h5>
                    <ul>{"".join(f"<li>{error}</li>" for error in result['errors'])}</ul>
                </div>
                """

            warnings_html = ""
            if result['warnings']:
                warnings_html = f"""
                <div class="warnings">
                    <h5>Warnings:</h5>
                    <ul>{"".join(f"<li>{warning}</li>" for warning in result['warnings'])}</ul>
                </div>
                """

            detailed_results_html += f"""
            <div class="test-result {status_class}">
                <h4>{result['test_name']} ({result['category']})</h4>
                <p><strong>Status:</strong> {result['status']}</p>
                <p><strong>Execution Time:</strong> {result['execution_time']:.3f}s</p>
                {details_html}
                {errors_html}
                {warnings_html}
            </div>
            """

        final_html = html_template.format(
            database_type=self.config.db_type.value.upper(),
            database_name=self.config.database,
            timestamp=time.strftime('%Y-%m-%d %H:%M:%S'),
            overall_status=summary['overall_status'],
            success_rate=summary['success_rate'],
            score_class=score_class,
            total_tests=summary['total_tests'],
            passed_tests=summary['passed_tests'],
            failed_tests=summary['failed_tests'],
            error_tests=summary['error_tests'],
            category_results=category_results_html,
            detailed_results=detailed_results_html
        )

        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(final_html)

        logger.info(f"HTML report generated: {output_file}")

    def cleanup_test_environment(self):
        """Clean up test environment and data"""
        logger.info("Cleaning up test environment")

        try:
            with self.engine.connect() as conn:
                # Clean up test data
                cleanup_tables = ['test_transactions', 'test_orders', 'test_users', 'test_products']

                for table in cleanup_tables:
                    try:
                        # Delete test data (keep original data intact)
                        conn.execute(text(f"DELETE FROM {table} WHERE {table.split('_')[1]}_id >= 50000"))
                        conn.commit()
                    except Exception as e:
                        logger.warning(f"Failed to cleanup {table}: {e}")

        except Exception as e:
            logger.error(f"Failed to cleanup test environment: {e}")

    def disconnect(self):
        """Close database connection"""
        if self.engine:
            self.engine.dispose()
            logger.info("Database connection closed")

# Usage Example
if __name__ == "__main__":
    # Database configuration
    config = DatabaseConfig(
        host="localhost",
        port=5432,
        database="test_db",
        username="test_user",
        password="test_password",
        db_type=DatabaseType.POSTGRESQL,
        connection_params={"pool_pre_ping": True}
    )

    # Initialize testing framework
    framework = DatabaseTestFramework(config)

    try:
        # Connect to database
        framework.connect()

        # Run all tests
        results = framework.run_all_tests()

        # Generate reports
        framework.generate_html_report()

        # Print summary
        print(f"Database Testing Complete")
        print(f"Overall Status: {results['overall_status']}")
        print(f"Success Rate: {results['success_rate']:.1f}%")
        print(f"Total Tests: {results['total_tests']}")
        print(f"Passed: {results['passed_tests']}")
        print(f"Failed: {results['failed_tests']}")
        print(f"Errors: {results['error_tests']}")

    finally:
        # Disconnect
        framework.disconnect()
```

This database testing framework provides comprehensive testing across structural, functional, performance, security, and data quality dimensions. The framework is designed to be extensible and can be adapted for different database systems and testing requirements.

The next sections will continue with security testing, data quality validation, and migration testing procedures to complete the advanced database testing guide.