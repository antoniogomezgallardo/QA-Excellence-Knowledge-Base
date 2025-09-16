# 🗄️ Test Data Management Excellence

> Transforming test data from chaos to strategic asset

## 📋 Overview

### Purpose and Scope
This guide provides comprehensive strategies for managing test data throughout the testing lifecycle, ensuring reliable, compliant, and efficient data practices. It covers synthetic data generation, production data masking, GDPR compliance, and advanced data management patterns.

### Target Audience
- QA Engineers and Test Data Engineers
- Database Administrators
- DevOps Engineers managing test environments
- Data Protection Officers
- Technical Architects designing data strategies

### Key Benefits
- **Reliable Testing:** Consistent, predictable test data
- **Compliance Assured:** GDPR and privacy regulation adherence
- **Faster Execution:** Optimized data creation and cleanup
- **Environment Independence:** Tests run anywhere with proper data
- **Cost Efficiency:** Reduced storage and processing costs

## 🏛️ Fundamental Principles

### Core Test Data Concepts
1. **Data as Code:** Version control and automate data creation
2. **Privacy by Design:** Protect sensitive data from the start
3. **Environment Parity:** Consistent data across all test environments
4. **Data Lifecycle Management:** Systematic creation, usage, and cleanup
5. **Performance Optimization:** Right-sized data for test needs

### Test Data Strategy Pyramid
```
        ┌─────────────┐
        │  Production │ 5% - Anonymized
        │     Data    │
        ├─────────────┤
        │  Synthetic  │ 25% - Generated
        │    Data     │
        ├─────────────┤
        │  Minimal    │ 70% - Essential only
        │  Test Data  │
        └─────────────┘
```

### Anti-Patterns to Avoid
❌ **Production data in test environments** - Privacy and security risks
❌ **Hard-coded test data** - Brittle tests, poor maintainability
❌ **Shared test data** - Test interference and unreliable results
❌ **No data cleanup** - Environment pollution and storage waste
❌ **Manual data creation** - Time-consuming and error-prone

## 🏗️ Data Architecture & Strategy

### Test Data Categories

```markdown
## Data Classification Framework

### Static Reference Data
- Country codes, currencies
- Product categories, tax rates
- System configuration values
- **Characteristics:** Rarely changes, shared across tests
- **Management:** Version controlled, centrally maintained

### Master Data
- Users, customers, products
- Organizations, locations
- **Characteristics:** Core business entities
- **Management:** Template-based generation

### Transactional Data
- Orders, payments, messages
- Audit logs, events
- **Characteristics:** High volume, time-dependent
- **Management:** Generated per test scenario

### Sensitive Data (PII)
- Personal information, financial data
- Medical records, legal documents
- **Characteristics:** Privacy-protected, regulated
- **Management:** Masked, anonymized, or synthetic
```

### Data Environment Strategy

```yaml
# test-data-environments.yml
environments:
  unit:
    data_source: "synthetic"
    volume: "minimal"
    privacy: "safe"
    lifecycle: "per_test"

  integration:
    data_source: "templates"
    volume: "medium"
    privacy: "masked"
    lifecycle: "per_suite"

  system:
    data_source: "production_subset"
    volume: "large"
    privacy: "anonymized"
    lifecycle: "per_release"

  performance:
    data_source: "generated"
    volume: "production_scale"
    privacy: "synthetic"
    lifecycle: "persistent"

  staging:
    data_source: "production_clone"
    volume: "full"
    privacy: "masked"
    lifecycle: "weekly_refresh"
```

## 🔧 Synthetic Data Generation

### Advanced Data Generation Framework

```javascript
// synthetic-data-generator.js
const { faker } = require('@faker-js/faker');
const { v4: uuidv4 } = require('uuid');

class SyntheticDataGenerator {
  constructor(seed = null) {
    if (seed) faker.seed(seed); // Reproducible data
    this.constraints = {};
    this.relationships = {};
  }

  // Define data constraints and business rules
  defineConstraints(entityType, constraints) {
    this.constraints[entityType] = constraints;
  }

  defineRelationship(parentEntity, childEntity, cardinality) {
    this.relationships[childEntity] = {
      parent: parentEntity,
      cardinality
    };
  }

  generateUser(overrides = {}) {
    const baseUser = {
      id: uuidv4(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      phoneNumber: faker.phone.number(),
      dateOfBirth: faker.date.between({
        from: '1950-01-01',
        to: '2005-12-31'
      }),
      address: this.generateAddress(),
      preferences: this.generateUserPreferences(),
      metadata: {
        createdAt: faker.date.recent(),
        updatedAt: faker.date.recent(),
        isActive: faker.datatype.boolean(0.8), // 80% active users
        source: faker.helpers.arrayElement(['web', 'mobile', 'api'])
      }
    };

    return { ...baseUser, ...overrides };
  }

  generateAddress() {
    return {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      country: faker.location.country(),
      postalCode: faker.location.zipCode(),
      coordinates: {
        latitude: faker.location.latitude(),
        longitude: faker.location.longitude()
      }
    };
  }

  generateUserPreferences() {
    return {
      language: faker.helpers.arrayElement(['en', 'es', 'fr', 'de']),
      timezone: faker.helpers.arrayElement([
        'UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo'
      ]),
      currency: faker.helpers.arrayElement(['USD', 'EUR', 'GBP', 'JPY']),
      notifications: {
        email: faker.datatype.boolean(0.7),
        sms: faker.datatype.boolean(0.3),
        push: faker.datatype.boolean(0.8)
      }
    };
  }

  generateProduct(category = null) {
    const categories = ['electronics', 'clothing', 'books', 'home', 'sports'];
    const selectedCategory = category || faker.helpers.arrayElement(categories);

    return {
      id: uuidv4(),
      name: this.generateProductName(selectedCategory),
      description: faker.lorem.paragraph(),
      category: selectedCategory,
      price: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
      cost: null, // Will be calculated
      sku: faker.string.alphanumeric(8).toUpperCase(),
      weight: faker.number.float({ min: 0.1, max: 50, precision: 0.1 }),
      dimensions: {
        length: faker.number.float({ min: 1, max: 100, precision: 0.1 }),
        width: faker.number.float({ min: 1, max: 100, precision: 0.1 }),
        height: faker.number.float({ min: 1, max: 100, precision: 0.1 })
      },
      inventory: {
        quantity: faker.number.int({ min: 0, max: 1000 }),
        reorderLevel: faker.number.int({ min: 10, max: 50 }),
        location: faker.location.zipCode()
      },
      metadata: {
        createdAt: faker.date.recent({ days: 365 }),
        isActive: faker.datatype.boolean(0.9),
        tags: faker.helpers.arrayElements([
          'bestseller', 'new', 'sale', 'featured', 'limited'
        ], { min: 0, max: 3 })
      }
    };
  }

  generateProductName(category) {
    const adjectives = {
      electronics: ['Smart', 'Wireless', 'Pro', 'Ultra', 'Digital'],
      clothing: ['Premium', 'Casual', 'Designer', 'Classic', 'Modern'],
      books: ['Complete', 'Essential', 'Advanced', 'Beginner\'s', 'Ultimate'],
      home: ['Deluxe', 'Compact', 'Multi-purpose', 'Elegant', 'Durable'],
      sports: ['Professional', 'Training', 'Competition', 'All-Weather', 'Lightweight']
    };

    const nouns = {
      electronics: ['Smartphone', 'Laptop', 'Headphones', 'Camera', 'Speaker'],
      clothing: ['Jacket', 'Shirt', 'Pants', 'Dress', 'Shoes'],
      books: ['Guide', 'Manual', 'Handbook', 'Course', 'Reference'],
      home: ['Chair', 'Table', 'Lamp', 'Storage', 'Organizer'],
      sports: ['Equipment', 'Gear', 'Kit', 'Accessory', 'Tool']
    };

    const adjective = faker.helpers.arrayElement(adjectives[category]);
    const noun = faker.helpers.arrayElement(nouns[category]);

    return `${adjective} ${noun}`;
  }

  generateOrder(userId, productIds = []) {
    const orderDate = faker.date.recent({ days: 30 });
    const items = this.generateOrderItems(productIds);
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal > 50 ? 0 : 9.99;

    return {
      id: uuidv4(),
      userId,
      orderNumber: faker.string.numeric(8),
      status: faker.helpers.arrayElement([
        'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'
      ]),
      items,
      payment: {
        method: faker.helpers.arrayElement(['credit_card', 'paypal', 'bank_transfer']),
        status: faker.helpers.arrayElement(['pending', 'completed', 'failed']),
        transactionId: faker.string.alphanumeric(16)
      },
      pricing: {
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        shipping: shipping,
        total: parseFloat((subtotal + tax + shipping).toFixed(2))
      },
      shipping: {
        address: this.generateAddress(),
        method: faker.helpers.arrayElement(['standard', 'express', 'overnight']),
        trackingNumber: faker.string.alphanumeric(12).toUpperCase()
      },
      dates: {
        ordered: orderDate,
        shipped: faker.date.between({ from: orderDate, to: new Date() }),
        delivered: null // Set based on status
      }
    };
  }

  generateOrderItems(productIds) {
    const itemCount = faker.number.int({ min: 1, max: 5 });
    const items = [];

    for (let i = 0; i < itemCount; i++) {
      const productId = productIds.length > 0
        ? faker.helpers.arrayElement(productIds)
        : uuidv4();

      const quantity = faker.number.int({ min: 1, max: 3 });
      const price = parseFloat(faker.commerce.price({ min: 10, max: 200 }));

      items.push({
        productId,
        productName: faker.commerce.productName(),
        quantity,
        unitPrice: price,
        total: parseFloat((quantity * price).toFixed(2))
      });
    }

    return items;
  }

  generateDataSet(specifications) {
    const dataset = {};

    for (const [entityType, spec] of Object.entries(specifications)) {
      dataset[entityType] = [];

      for (let i = 0; i < spec.count; i++) {
        let entity;

        switch (entityType) {
          case 'users':
            entity = this.generateUser(spec.overrides);
            break;
          case 'products':
            entity = this.generateProduct(spec.category);
            break;
          case 'orders':
            const userId = spec.userIds
              ? faker.helpers.arrayElement(spec.userIds)
              : uuidv4();
            entity = this.generateOrder(userId, spec.productIds);
            break;
          default:
            throw new Error(`Unknown entity type: ${entityType}`);
        }

        dataset[entityType].push(entity);
      }
    }

    return this.linkRelationships(dataset);
  }

  linkRelationships(dataset) {
    // Create realistic relationships between entities
    if (dataset.users && dataset.orders) {
      dataset.orders.forEach(order => {
        order.userId = faker.helpers.arrayElement(dataset.users).id;
      });
    }

    return dataset;
  }

  // Generate data with realistic distributions
  generateRealisticDataset(size = 'small') {
    const sizes = {
      small: { users: 100, products: 50, orders: 200 },
      medium: { users: 1000, products: 500, orders: 5000 },
      large: { users: 10000, products: 2000, orders: 50000 }
    };

    const spec = sizes[size];

    return this.generateDataSet({
      users: { count: spec.users },
      products: { count: spec.products },
      orders: { count: spec.orders }
    });
  }

  // Export data in different formats
  exportData(dataset, format = 'json') {
    switch (format) {
      case 'json':
        return JSON.stringify(dataset, null, 2);
      case 'sql':
        return this.generateSQLInserts(dataset);
      case 'csv':
        return this.generateCSV(dataset);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  generateSQLInserts(dataset) {
    let sql = '';

    for (const [table, records] of Object.entries(dataset)) {
      if (records.length === 0) continue;

      const columns = Object.keys(records[0]);
      sql += `-- ${table.toUpperCase()} TABLE\n`;

      records.forEach(record => {
        const values = columns.map(col => {
          const value = record[col];
          if (value === null) return 'NULL';
          if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
          if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
          return value;
        });

        sql += `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
      });

      sql += '\n';
    }

    return sql;
  }
}

// Usage Examples
const generator = new SyntheticDataGenerator(12345); // Reproducible seed

// Generate individual entities
const user = generator.generateUser({
  email: 'test@example.com',
  isActive: true
});

// Generate complete dataset
const dataset = generator.generateRealisticDataset('medium');

// Export as SQL
const sqlScript = generator.exportData(dataset, 'sql');
```

### Data Factory Pattern

```javascript
// data-factory.js
class DataFactory {
  constructor() {
    this.sequences = {};
    this.templates = {};
  }

  // Define reusable data templates
  defineTemplate(name, template) {
    this.templates[name] = template;
  }

  // Create data using templates with overrides
  create(templateName, overrides = {}) {
    const template = this.templates[templateName];
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }

    const data = this.applyTemplate(template, overrides);
    return this.processSequences(data);
  }

  createMany(templateName, count, overridesFn = null) {
    const items = [];
    for (let i = 0; i < count; i++) {
      const overrides = overridesFn ? overridesFn(i) : {};
      items.push(this.create(templateName, overrides));
    }
    return items;
  }

  applyTemplate(template, overrides) {
    const result = {};

    for (const [key, value] of Object.entries(template)) {
      if (overrides.hasOwnProperty(key)) {
        result[key] = overrides[key];
      } else if (typeof value === 'function') {
        result[key] = value();
      } else if (typeof value === 'object' && value !== null) {
        result[key] = this.applyTemplate(value, overrides[key] || {});
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  processSequences(data) {
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string' && value.startsWith('{{seq:')) {
        const seqName = value.match(/{{seq:(.+)}}/)[1];
        data[key] = this.getNextSequence(seqName);
      } else if (typeof value === 'object' && value !== null) {
        data[key] = this.processSequences(value);
      }
    }
    return data;
  }

  getNextSequence(name) {
    if (!this.sequences[name]) {
      this.sequences[name] = 1;
    }
    return this.sequences[name]++;
  }

  resetSequence(name) {
    this.sequences[name] = 1;
  }
}

// Factory setup and usage
const factory = new DataFactory();

// Define templates
factory.defineTemplate('user', {
  id: '{{seq:userId}}',
  username: () => faker.internet.userName(),
  email: () => faker.internet.email(),
  profile: {
    firstName: () => faker.person.firstName(),
    lastName: () => faker.person.lastName(),
    age: () => faker.number.int({ min: 18, max: 80 })
  },
  preferences: {
    theme: () => faker.helpers.arrayElement(['light', 'dark']),
    language: 'en'
  },
  createdAt: () => new Date().toISOString()
});

factory.defineTemplate('adminUser', {
  ...factory.templates.user,
  role: 'admin',
  permissions: ['read', 'write', 'delete']
});

// Create test data
const regularUser = factory.create('user');
const adminUser = factory.create('adminUser', {
  email: 'admin@test.com'
});

const users = factory.createMany('user', 10, (index) => ({
  email: `user${index}@test.com`
}));
```

## 🔒 Data Privacy & Compliance

### GDPR-Compliant Data Masking

```javascript
// data-masking.js
class DataMasker {
  constructor() {
    this.maskingRules = {
      email: this.maskEmail,
      phone: this.maskPhone,
      ssn: this.maskSSN,
      creditCard: this.maskCreditCard,
      name: this.maskName,
      address: this.maskAddress,
      iban: this.maskIBAN
    };

    this.piiFields = [
      'email', 'phone', 'ssn', 'socialSecurityNumber',
      'creditCard', 'firstName', 'lastName', 'fullName',
      'address', 'street', 'city', 'postalCode',
      'iban', 'accountNumber', 'passport', 'license'
    ];
  }

  maskDataset(data, maskingLevel = 'standard') {
    if (Array.isArray(data)) {
      return data.map(item => this.maskRecord(item, maskingLevel));
    }
    return this.maskRecord(data, maskingLevel);
  }

  maskRecord(record, maskingLevel) {
    const masked = { ...record };

    for (const [field, value] of Object.entries(record)) {
      if (this.isPIIField(field)) {
        masked[field] = this.applyMasking(field, value, maskingLevel);
      } else if (typeof value === 'object' && value !== null) {
        masked[field] = this.maskRecord(value, maskingLevel);
      }
    }

    return masked;
  }

  isPIIField(fieldName) {
    return this.piiFields.some(pii =>
      fieldName.toLowerCase().includes(pii.toLowerCase())
    );
  }

  applyMasking(field, value, level) {
    if (!value) return value;

    const fieldType = this.identifyFieldType(field, value);
    const maskingFn = this.maskingRules[fieldType];

    if (!maskingFn) {
      return this.genericMask(value, level);
    }

    return maskingFn.call(this, value, level);
  }

  identifyFieldType(field, value) {
    const fieldLower = field.toLowerCase();

    if (fieldLower.includes('email')) return 'email';
    if (fieldLower.includes('phone')) return 'phone';
    if (fieldLower.includes('ssn') || fieldLower.includes('social')) return 'ssn';
    if (fieldLower.includes('credit') || fieldLower.includes('card')) return 'creditCard';
    if (fieldLower.includes('name')) return 'name';
    if (fieldLower.includes('address') || fieldLower.includes('street')) return 'address';
    if (fieldLower.includes('iban')) return 'iban';

    // Pattern-based detection
    if (/^\d{4}-?\d{4}-?\d{4}-?\d{4}$/.test(value)) return 'creditCard';
    if (/^\+?[\d\s\-\(\)]+$/.test(value) && value.length > 7) return 'phone';
    if (/@/.test(value)) return 'email';

    return 'generic';
  }

  maskEmail(email, level) {
    const [local, domain] = email.split('@');

    switch (level) {
      case 'light':
        return `${local.charAt(0)}${'*'.repeat(local.length - 1)}@${domain}`;
      case 'standard':
        return `${local.charAt(0)}***@${domain}`;
      case 'heavy':
        return 'masked@example.com';
      default:
        return email;
    }
  }

  maskPhone(phone, level) {
    const digits = phone.replace(/\D/g, '');

    switch (level) {
      case 'light':
        return phone.replace(/\d(?=\d{4})/g, '*');
      case 'standard':
        return `***-***-${digits.slice(-4)}`;
      case 'heavy':
        return '***-***-****';
      default:
        return phone;
    }
  }

  maskCreditCard(cardNumber, level) {
    const digits = cardNumber.replace(/\D/g, '');

    switch (level) {
      case 'light':
        return `****-****-****-${digits.slice(-4)}`;
      case 'standard':
      case 'heavy':
        return '****-****-****-****';
      default:
        return cardNumber;
    }
  }

  maskName(name, level) {
    if (!name || typeof name !== 'string') return name;

    switch (level) {
      case 'light':
        return name.charAt(0) + '*'.repeat(name.length - 1);
      case 'standard':
        return 'J*** D***';
      case 'heavy':
        return 'MASKED NAME';
      default:
        return name;
    }
  }

  maskAddress(address, level) {
    switch (level) {
      case 'light':
        return address.replace(/\d+/g, '***');
      case 'standard':
        return '*** Masked Street, City, State';
      case 'heavy':
        return 'MASKED ADDRESS';
      default:
        return address;
    }
  }

  genericMask(value, level) {
    if (typeof value !== 'string') return value;

    switch (level) {
      case 'light':
        return value.charAt(0) + '*'.repeat(Math.max(0, value.length - 2)) + value.slice(-1);
      case 'standard':
        return '*'.repeat(Math.min(value.length, 8));
      case 'heavy':
        return 'MASKED';
      default:
        return value;
    }
  }

  // Anonymization (irreversible)
  anonymizeDataset(data) {
    return this.maskDataset(data, 'heavy');
  }

  // Pseudonymization (reversible with key)
  pseudonymizeDataset(data, key) {
    // Implementation would use encryption with the provided key
    // This is a simplified example
    const crypto = require('crypto');

    const cipher = crypto.createCipher('aes192', key);

    return this.maskDataset(data, 'standard');
  }

  generateDataClassificationReport(data) {
    const report = {
      totalRecords: Array.isArray(data) ? data.length : 1,
      piiFields: new Set(),
      riskLevel: 'low',
      recommendations: []
    };

    const sampleRecord = Array.isArray(data) ? data[0] : data;

    this.analyzeRecord(sampleRecord, '', report);

    report.piiFields = Array.from(report.piiFields);
    report.riskLevel = this.calculateRiskLevel(report.piiFields);
    report.recommendations = this.generateRecommendations(report);

    return report;
  }

  analyzeRecord(record, prefix, report) {
    for (const [field, value] of Object.entries(record)) {
      const fullField = prefix ? `${prefix}.${field}` : field;

      if (this.isPIIField(field)) {
        report.piiFields.add(fullField);
      }

      if (typeof value === 'object' && value !== null) {
        this.analyzeRecord(value, fullField, report);
      }
    }
  }

  calculateRiskLevel(piiFields) {
    if (piiFields.length === 0) return 'low';
    if (piiFields.length <= 3) return 'medium';
    return 'high';
  }

  generateRecommendations(report) {
    const recommendations = [];

    if (report.piiFields.length > 0) {
      recommendations.push('Apply data masking before using in test environments');
    }

    if (report.riskLevel === 'high') {
      recommendations.push('Consider using synthetic data instead of production data');
      recommendations.push('Implement strong access controls');
    }

    recommendations.push('Ensure GDPR compliance for EU data subjects');
    recommendations.push('Regular audit of data usage and retention');

    return recommendations;
  }
}

// Usage example
const masker = new DataMasker();

const sensitiveData = {
  id: 123,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1-555-123-4567',
  creditCard: '4532-1234-5678-9012',
  address: {
    street: '123 Main Street',
    city: 'Anytown',
    postalCode: '12345'
  }
};

// Different masking levels
const lightMasked = masker.maskDataset(sensitiveData, 'light');
const standardMasked = masker.maskDataset(sensitiveData, 'standard');
const heavyMasked = masker.maskDataset(sensitiveData, 'heavy');

// Classification report
const report = masker.generateDataClassificationReport(sensitiveData);
console.log('PII Classification Report:', report);
```

### Production Data Subsetting

```javascript
// data-subsetting.js
class ProductionDataSubsetter {
  constructor(databaseConnection) {
    this.db = databaseConnection;
    this.relationships = {};
    this.constraints = {};
  }

  defineRelationships(relationships) {
    this.relationships = relationships;
  }

  defineConstraints(table, constraints) {
    this.constraints[table] = constraints;
  }

  async createSubset(subsetSpec) {
    const subset = {};

    // Start with primary entities
    for (const [table, spec] of Object.entries(subsetSpec.primaryEntities)) {
      subset[table] = await this.extractPrimaryData(table, spec);
    }

    // Extract related data
    for (const [table, relationships] of Object.entries(this.relationships)) {
      if (!subset[table]) {
        subset[table] = await this.extractRelatedData(table, subset);
      }
    }

    // Apply constraints and cleanup
    return this.applyConstraints(subset);
  }

  async extractPrimaryData(table, spec) {
    let query = `SELECT * FROM ${table}`;
    const params = [];

    // Apply filters
    if (spec.where) {
      query += ` WHERE ${spec.where}`;
      if (spec.params) {
        params.push(...spec.params);
      }
    }

    // Apply sampling
    if (spec.sampleSize) {
      if (spec.sampleMethod === 'random') {
        query += ` ORDER BY RANDOM() LIMIT ${spec.sampleSize}`;
      } else if (spec.sampleMethod === 'recent') {
        query += ` ORDER BY created_at DESC LIMIT ${spec.sampleSize}`;
      }
    }

    return await this.db.query(query, params);
  }

  async extractRelatedData(table, existingSubset) {
    const relationship = this.relationships[table];
    if (!relationship) return [];

    const parentTable = relationship.parentTable;
    const parentKey = relationship.parentKey;
    const foreignKey = relationship.foreignKey;

    if (!existingSubset[parentTable]) return [];

    const parentIds = existingSubset[parentTable].map(row => row[parentKey]);

    const query = `
      SELECT * FROM ${table}
      WHERE ${foreignKey} IN (${parentIds.map(() => '?').join(',')})
    `;

    return await this.db.query(query, parentIds);
  }

  applyConstraints(subset) {
    for (const [table, constraints] of Object.entries(this.constraints)) {
      if (subset[table]) {
        subset[table] = subset[table].filter(row => {
          return constraints.every(constraint => constraint(row));
        });
      }
    }

    return subset;
  }

  async createReferentiallyIntactSubset(primaryTable, primaryFilter, maxDepth = 3) {
    const visited = new Set();
    const subset = {};

    await this.extractWithDependencies(
      primaryTable,
      primaryFilter,
      subset,
      visited,
      0,
      maxDepth
    );

    return subset;
  }

  async extractWithDependencies(table, filter, subset, visited, depth, maxDepth) {
    if (visited.has(table) || depth > maxDepth) return;

    visited.add(table);

    // Extract primary data
    const data = await this.extractPrimaryData(table, filter);
    subset[table] = data;

    // Find and extract dependencies
    const dependencies = this.findDependencies(table);

    for (const dep of dependencies) {
      const foreignKeys = data.map(row => row[dep.foreignKey]).filter(Boolean);

      if (foreignKeys.length > 0) {
        await this.extractWithDependencies(
          dep.referencedTable,
          {
            where: `${dep.referencedKey} IN (${foreignKeys.map(() => '?').join(',')})`,
            params: foreignKeys
          },
          subset,
          visited,
          depth + 1,
          maxDepth
        );
      }
    }
  }

  findDependencies(table) {
    // This would typically query the database schema
    // to find foreign key relationships
    const schemaDependencies = {
      orders: [
        { foreignKey: 'user_id', referencedTable: 'users', referencedKey: 'id' },
        { foreignKey: 'product_id', referencedTable: 'products', referencedKey: 'id' }
      ],
      order_items: [
        { foreignKey: 'order_id', referencedTable: 'orders', referencedKey: 'id' },
        { foreignKey: 'product_id', referencedTable: 'products', referencedKey: 'id' }
      ]
    };

    return schemaDependencies[table] || [];
  }

  async generateSubsetScript(subset, outputFormat = 'sql') {
    switch (outputFormat) {
      case 'sql':
        return this.generateSQLScript(subset);
      case 'json':
        return JSON.stringify(subset, null, 2);
      case 'csv':
        return this.generateCSVArchive(subset);
      default:
        throw new Error(`Unsupported format: ${outputFormat}`);
    }
  }

  generateSQLScript(subset) {
    let script = '-- Production Data Subset\n';
    script += '-- Generated: ' + new Date().toISOString() + '\n\n';

    // Disable foreign key checks temporarily
    script += 'SET FOREIGN_KEY_CHECKS = 0;\n\n';

    for (const [table, rows] of Object.entries(subset)) {
      if (rows.length === 0) continue;

      script += `-- ${table.toUpperCase()}\n`;
      script += `TRUNCATE TABLE ${table};\n`;

      const columns = Object.keys(rows[0]);

      for (const row of rows) {
        const values = columns.map(col => {
          const value = row[col];
          if (value === null) return 'NULL';
          if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
          if (value instanceof Date) return `'${value.toISOString()}'`;
          return value;
        });

        script += `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
      }

      script += '\n';
    }

    script += 'SET FOREIGN_KEY_CHECKS = 1;\n';
    script += '-- End of subset script\n';

    return script;
  }

  async validateSubsetIntegrity(subset) {
    const issues = [];

    for (const [table, rows] of Object.entries(subset)) {
      const dependencies = this.findDependencies(table);

      for (const dep of dependencies) {
        for (const row of rows) {
          const foreignKeyValue = row[dep.foreignKey];

          if (foreignKeyValue && subset[dep.referencedTable]) {
            const referencedExists = subset[dep.referencedTable].some(
              refRow => refRow[dep.referencedKey] === foreignKeyValue
            );

            if (!referencedExists) {
              issues.push({
                table,
                issue: 'Orphaned reference',
                details: `${dep.foreignKey}=${foreignKeyValue} not found in ${dep.referencedTable}`
              });
            }
          }
        }
      }
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }
}

// Usage example
const subsetter = new ProductionDataSubsetter(databaseConnection);

// Define relationships
subsetter.defineRelationships({
  orders: {
    parentTable: 'users',
    parentKey: 'id',
    foreignKey: 'user_id'
  },
  order_items: {
    parentTable: 'orders',
    parentKey: 'id',
    foreignKey: 'order_id'
  }
});

// Create subset
const subset = await subsetter.createSubset({
  primaryEntities: {
    users: {
      where: 'created_at > ?',
      params: ['2024-01-01'],
      sampleSize: 1000,
      sampleMethod: 'random'
    }
  }
});

// Validate and export
const validation = await subsetter.validateSubsetIntegrity(subset);
if (validation.isValid) {
  const sqlScript = await subsetter.generateSubsetScript(subset, 'sql');
  console.log('Subset created successfully');
} else {
  console.error('Subset validation failed:', validation.issues);
}
```

## 🏗️ Data Lifecycle Management

### Automated Data Management Pipeline

```javascript
// data-lifecycle-manager.js
class DataLifecycleManager {
  constructor(config) {
    this.environments = config.environments;
    this.retentionPolicies = config.retentionPolicies;
    this.backupConfig = config.backupConfig;
    this.scheduler = config.scheduler;
  }

  async initializeEnvironment(environment) {
    const config = this.environments[environment];

    console.log(`Initializing ${environment} environment...`);

    // Create baseline data
    await this.createBaselineData(environment, config.baseline);

    // Apply environment-specific data
    if (config.seedData) {
      await this.seedEnvironmentData(environment, config.seedData);
    }

    // Set up monitoring
    await this.setupDataMonitoring(environment);

    console.log(`${environment} environment ready`);
  }

  async createBaselineData(environment, baselineConfig) {
    const generator = new SyntheticDataGenerator();

    for (const [entityType, spec] of Object.entries(baselineConfig)) {
      const data = generator.generateDataSet({ [entityType]: spec });
      await this.insertData(environment, entityType, data[entityType]);
    }
  }

  async seedEnvironmentData(environment, seedConfig) {
    for (const [table, seedFile] of Object.entries(seedConfig)) {
      const seedData = await this.loadSeedData(seedFile);
      await this.insertData(environment, table, seedData);
    }
  }

  async refreshEnvironment(environment, options = {}) {
    const config = this.environments[environment];

    console.log(`Refreshing ${environment} environment...`);

    // Backup current state if requested
    if (options.backup) {
      await this.backupEnvironment(environment);
    }

    // Clean existing data
    await this.cleanEnvironmentData(environment, config.cleanupStrategy);

    // Reinitialize
    await this.initializeEnvironment(environment);

    console.log(`${environment} environment refreshed`);
  }

  async cleanEnvironmentData(environment, strategy) {
    switch (strategy) {
      case 'truncate':
        await this.truncateAllTables(environment);
        break;
      case 'delete':
        await this.deleteNonStaticData(environment);
        break;
      case 'restore':
        await this.restoreFromBaseline(environment);
        break;
      default:
        throw new Error(`Unknown cleanup strategy: ${strategy}`);
    }
  }

  async setupDataRetention(environment) {
    const policies = this.retentionPolicies[environment];

    for (const [table, policy] of Object.entries(policies)) {
      this.scheduler.schedule(`cleanup-${environment}-${table}`, {
        interval: policy.interval,
        action: () => this.applyRetentionPolicy(environment, table, policy)
      });
    }
  }

  async applyRetentionPolicy(environment, table, policy) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - policy.retentionDays);

    const query = `
      DELETE FROM ${table}
      WHERE ${policy.dateColumn} < ?
      ${policy.conditions ? `AND ${policy.conditions}` : ''}
    `;

    const deletedCount = await this.executeQuery(
      environment,
      query,
      [cutoffDate.toISOString()]
    );

    console.log(`Cleaned ${deletedCount} records from ${table} in ${environment}`);

    return deletedCount;
  }

  async backupEnvironment(environment) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `${environment}-backup-${timestamp}`;

    const backup = {
      name: backupName,
      environment,
      timestamp: new Date(),
      tables: {}
    };

    const tables = await this.getAllTables(environment);

    for (const table of tables) {
      const data = await this.exportTableData(environment, table);
      backup.tables[table] = data;
    }

    await this.saveBackup(backup);

    return backupName;
  }

  async restoreFromBackup(environment, backupName) {
    const backup = await this.loadBackup(backupName);

    for (const [table, data] of Object.entries(backup.tables)) {
      await this.truncateTable(environment, table);
      await this.insertData(environment, table, data);
    }

    console.log(`Restored ${environment} from backup ${backupName}`);
  }

  async monitorDataHealth(environment) {
    const healthChecks = [
      this.checkDataConsistency,
      this.checkReferentialIntegrity,
      this.checkDataVolumes,
      this.checkDataQuality
    ];

    const results = [];

    for (const check of healthChecks) {
      try {
        const result = await check.call(this, environment);
        results.push(result);
      } catch (error) {
        results.push({
          check: check.name,
          status: 'error',
          error: error.message
        });
      }
    }

    return {
      environment,
      timestamp: new Date(),
      overallHealth: results.every(r => r.status === 'healthy') ? 'healthy' : 'degraded',
      checks: results
    };
  }

  async checkDataConsistency(environment) {
    // Check for orphaned records, invalid states, etc.
    const issues = [];

    // Example: Check for orders without users
    const orphanedOrders = await this.executeQuery(
      environment,
      `SELECT COUNT(*) as count FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE u.id IS NULL`
    );

    if (orphanedOrders[0].count > 0) {
      issues.push(`${orphanedOrders[0].count} orphaned orders found`);
    }

    return {
      check: 'dataConsistency',
      status: issues.length === 0 ? 'healthy' : 'warning',
      issues
    };
  }

  async scheduleDataOperations() {
    // Daily data refresh for development environments
    this.scheduler.schedule('daily-dev-refresh', {
      cron: '0 2 * * *', // 2 AM daily
      action: () => this.refreshEnvironment('development')
    });

    // Weekly data refresh for staging
    this.scheduler.schedule('weekly-staging-refresh', {
      cron: '0 2 * * 0', // 2 AM every Sunday
      action: () => this.refreshEnvironment('staging')
    });

    // Data retention cleanup
    this.scheduler.schedule('retention-cleanup', {
      cron: '0 3 * * *', // 3 AM daily
      action: () => this.runRetentionCleanup()
    });
  }

  async generateDataMetrics(environment) {
    const metrics = {
      environment,
      timestamp: new Date(),
      tables: {}
    };

    const tables = await this.getAllTables(environment);

    for (const table of tables) {
      const stats = await this.getTableStatistics(environment, table);
      metrics.tables[table] = stats;
    }

    metrics.summary = {
      totalTables: Object.keys(metrics.tables).length,
      totalRecords: Object.values(metrics.tables).reduce((sum, t) => sum + t.recordCount, 0),
      totalSize: Object.values(metrics.tables).reduce((sum, t) => sum + t.sizeBytes, 0)
    };

    return metrics;
  }
}

// Configuration example
const dataManager = new DataLifecycleManager({
  environments: {
    development: {
      baseline: {
        users: { count: 50 },
        products: { count: 100 },
        orders: { count: 200 }
      },
      cleanupStrategy: 'truncate',
      refreshSchedule: 'daily'
    },
    staging: {
      baseline: {
        users: { count: 1000 },
        products: { count: 500 },
        orders: { count: 5000 }
      },
      cleanupStrategy: 'restore',
      refreshSchedule: 'weekly'
    }
  },
  retentionPolicies: {
    development: {
      audit_logs: {
        retentionDays: 7,
        dateColumn: 'created_at',
        interval: 'daily'
      },
      temp_data: {
        retentionDays: 1,
        dateColumn: 'created_at',
        interval: 'hourly'
      }
    }
  }
});

// Initialize and schedule
await dataManager.initializeEnvironment('development');
dataManager.scheduleDataOperations();
```

## 📊 Performance Optimization

### Data Volume Management

```javascript
// data-volume-optimizer.js
class DataVolumeOptimizer {
  constructor() {
    this.volumeStrategies = {
      minimal: { users: 10, orders: 50, products: 25 },
      small: { users: 100, orders: 500, products: 200 },
      medium: { users: 1000, orders: 5000, products: 1000 },
      large: { users: 10000, orders: 50000, products: 5000 },
      xl: { users: 100000, orders: 500000, products: 20000 }
    };
  }

  optimizeDataForTestType(testType, baseData) {
    const strategy = this.getOptimizationStrategy(testType);
    return this.applyOptimization(baseData, strategy);
  }

  getOptimizationStrategy(testType) {
    const strategies = {
      unit: {
        maxRecords: 10,
        relationships: 'minimal',
        complexity: 'simple'
      },
      integration: {
        maxRecords: 100,
        relationships: 'focused',
        complexity: 'moderate'
      },
      e2e: {
        maxRecords: 1000,
        relationships: 'complete',
        complexity: 'realistic'
      },
      performance: {
        maxRecords: 100000,
        relationships: 'complete',
        complexity: 'realistic'
      },
      load: {
        maxRecords: 1000000,
        relationships: 'complete',
        complexity: 'realistic'
      }
    };

    return strategies[testType] || strategies.integration;
  }

  applyOptimization(data, strategy) {
    const optimized = {};

    for (const [table, records] of Object.entries(data)) {
      optimized[table] = this.optimizeTable(records, strategy);
    }

    return optimized;
  }

  optimizeTable(records, strategy) {
    let optimized = [...records];

    // Limit record count
    if (optimized.length > strategy.maxRecords) {
      optimized = this.sampleRecords(optimized, strategy.maxRecords);
    }

    // Simplify data based on complexity setting
    if (strategy.complexity === 'simple') {
      optimized = optimized.map(record => this.simplifyRecord(record));
    }

    return optimized;
  }

  sampleRecords(records, maxCount) {
    if (records.length <= maxCount) return records;

    // Stratified sampling to maintain data distribution
    const categories = this.categorizeRecords(records);
    const sampledRecords = [];

    for (const [category, categoryRecords] of Object.entries(categories)) {
      const categorySize = Math.ceil(maxCount * (categoryRecords.length / records.length));
      const sampled = this.randomSample(categoryRecords, categorySize);
      sampledRecords.push(...sampled);
    }

    return sampledRecords.slice(0, maxCount);
  }

  categorizeRecords(records) {
    // Simple categorization based on record properties
    const categories = { default: [] };

    for (const record of records) {
      let category = 'default';

      // Categorize based on common patterns
      if (record.status) {
        category = record.status;
      } else if (record.type) {
        category = record.type;
      } else if (record.category) {
        category = record.category;
      }

      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(record);
    }

    return categories;
  }

  randomSample(array, size) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, size);
  }

  simplifyRecord(record) {
    // Remove unnecessary complexity for simple tests
    const simplified = { ...record };

    // Remove optional fields
    delete simplified.metadata;
    delete simplified.analytics;
    delete simplified.preferences;

    // Simplify nested objects
    if (simplified.address) {
      simplified.address = {
        street: simplified.address.street,
        city: simplified.address.city
      };
    }

    return simplified;
  }

  async measureDataImpact(testFunction, dataSizes) {
    const results = [];

    for (const size of dataSizes) {
      const data = this.generateDataOfSize(size);
      const startTime = Date.now();
      const startMemory = process.memoryUsage().heapUsed;

      try {
        await testFunction(data);

        const endTime = Date.now();
        const endMemory = process.memoryUsage().heapUsed;

        results.push({
          size,
          executionTime: endTime - startTime,
          memoryUsed: endMemory - startMemory,
          status: 'success'
        });
      } catch (error) {
        results.push({
          size,
          status: 'failed',
          error: error.message
        });
      }
    }

    return this.analyzePerformanceResults(results);
  }

  analyzePerformanceResults(results) {
    const analysis = {
      optimalSize: null,
      recommendations: [],
      trends: {}
    };

    const successfulResults = results.filter(r => r.status === 'success');

    if (successfulResults.length === 0) {
      analysis.recommendations.push('All tests failed - data may be incompatible');
      return analysis;
    }

    // Find optimal size (fastest execution under reasonable memory usage)
    const maxMemory = 100 * 1024 * 1024; // 100MB threshold
    const viableResults = successfulResults.filter(r => r.memoryUsed < maxMemory);

    if (viableResults.length > 0) {
      analysis.optimalSize = viableResults.reduce((min, current) =>
        current.executionTime < min.executionTime ? current : min
      ).size;
    }

    // Generate recommendations
    if (!analysis.optimalSize) {
      analysis.recommendations.push('Consider reducing data volume - memory usage too high');
    }

    const avgExecutionTime = successfulResults.reduce((sum, r) => sum + r.executionTime, 0) / successfulResults.length;
    if (avgExecutionTime > 10000) { // 10 seconds
      analysis.recommendations.push('Tests are running slowly - consider data optimization');
    }

    return analysis;
  }
}
```

## 📋 Quick Reference

### Test Data Best Practices Checklist

```markdown
## Test Data Management Checklist

### Data Strategy
- [ ] Data types classified (static, master, transactional)
- [ ] Privacy requirements identified
- [ ] Volume optimization strategy defined
- [ ] Environment-specific data policies

### Synthetic Data
- [ ] Data generation framework implemented
- [ ] Realistic distributions maintained
- [ ] Business rules enforced
- [ ] Reproducible with seeds

### Privacy & Compliance
- [ ] PII fields identified and protected
- [ ] Data masking rules implemented
- [ ] GDPR compliance verified
- [ ] Access controls established

### Lifecycle Management
- [ ] Automated data refresh
- [ ] Retention policies defined
- [ ] Backup and restore procedures
- [ ] Data quality monitoring

### Performance
- [ ] Data volumes optimized per test type
- [ ] Database indexing optimized
- [ ] Cleanup procedures automated
- [ ] Resource usage monitored
```

### Common Data Patterns

```markdown
## Test Data Design Patterns

### Factory Pattern
- Create data through centralized factories
- Parameterized generation
- Consistent defaults with overrides

### Builder Pattern
- Fluent API for complex data creation
- Step-by-step data construction
- Validation at each step

### Template Pattern
- Predefined data templates
- Inheritance and composition
- Environment-specific templates

### Repository Pattern
- Abstract data access
- Consistent CRUD operations
- Environment-agnostic interface

### Fixture Pattern
- Predefined test scenarios
- Known data states
- Reproducible test conditions
```

---

## 🎯 Key Takeaways

1. **Data as Code** - Version control and automate all test data
2. **Privacy First** - Protect sensitive data from day one
3. **Right-Size Data** - Use appropriate volumes for test types
4. **Automate Lifecycle** - Don't manage data manually
5. **Synthetic Over Real** - Generate data when possible
6. **Monitor Quality** - Continuously validate data health
7. **Optimize Performance** - Data impacts test execution speed

---

*"Quality test data is the foundation of reliable testing. Invest in your data strategy, and your tests will reward you with consistent, trustworthy results."*

**Remember:** The best test data is the data you don't have to think about—it's there when you need it, accurate when you use it, and gone when you're done with it.