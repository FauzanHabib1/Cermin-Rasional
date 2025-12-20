# RATIO - Database Schema Documentation

## Overview
This document outlines the SQL schema for the RATIO Financial Management Application. The schema supports user management, transaction tracking, and financial analysis.

---

## Tables

### 1. `users`
Stores user account information and authentication credentials.

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_users_username ON users(username);
```

**Fields:**
- `id`: Unique user identifier
- `username`: Unique username for login (3+ characters)
- `password`: Plaintext password (consider hashing in production)
- `email`: User's email address (optional)
- `created_at`: Account creation timestamp
- `updated_at`: Last profile update timestamp
- `is_active`: Account status flag

---

### 2. `transactions`
Records all financial transactions (income and expenses).

```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
  category VARCHAR(20) NOT NULL CHECK (category IN ('need', 'want', 'savings')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_user_date ON transactions(user_id, date);
CREATE INDEX idx_transactions_user_type ON transactions(user_id, type);
CREATE INDEX idx_transactions_user_category ON transactions(user_id, category);
```

**Fields:**
- `id`: Unique transaction identifier
- `user_id`: Foreign key to users table
- `date`: Transaction date
- `description`: Transaction description (e.g., "Makan Siang", "Gaji")
- `amount`: Transaction amount in IDR
- `type`: Either 'income' or 'expense'
- `category`: 'need' (kebutuhan), 'want' (keinginan), or 'savings' (tabungan)
- `created_at`: Transaction creation timestamp
- `updated_at`: Last update timestamp

**Constraints:**
- `type` must be either 'income' or 'expense'
- `category` must be 'need', 'want', or 'savings'
- `amount` must be positive

---

### 3. `user_settings`
Stores user-specific financial preferences and targets.

```sql
CREATE TABLE user_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  target_need_ratio DECIMAL(5, 2) DEFAULT 50,
  target_want_ratio DECIMAL(5, 2) DEFAULT 30,
  target_savings_ratio DECIMAL(5, 2) DEFAULT 20,
  monthly_income_target DECIMAL(12, 2),
  currency VARCHAR(3) DEFAULT 'IDR',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
- `id`: Unique setting identifier
- `user_id`: Foreign key to users table
- `target_need_ratio`: Target percentage for needs (default: 50%)
- `target_want_ratio`: Target percentage for wants (default: 30%)
- `target_savings_ratio`: Target percentage for savings (default: 20%)
- `monthly_income_target`: Target monthly income goal
- `currency`: Currency code (default: IDR)
- `created_at`: Setting creation timestamp
- `updated_at`: Last update timestamp

---

### 4. `audit_logs`
Maintains a log of critical user actions for audit and debugging purposes.

```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id INTEGER,
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_date ON audit_logs(user_id, created_at);
```

**Fields:**
- `id`: Unique log entry identifier
- `user_id`: User who performed the action
- `action`: Action performed (e.g., 'CREATE_TRANSACTION', 'DELETE_TRANSACTION')
- `resource_type`: Type of resource affected (e.g., 'transaction')
- `resource_id`: ID of the affected resource
- `details`: Additional context stored as JSON
- `ip_address`: IP address of the request (for security)
- `created_at`: Timestamp of the action

---

## Key Relationships

```
users (1) ──── (M) transactions
  │
  └──── (1) user_settings

transactions (M) ──── (1) users

audit_logs (M) ──── (1) users
```

---

## Financial Logic

### Transaction Types & Categories

**Type: Income**
- Category: 'need' (Passive income, salary, etc.)
- Category: 'want' (Bonus, side income, etc.)
- Category: 'savings' (Investment returns, savings interest)

**Type: Expense**
- Category: 'need' (Food, rent, utilities, transportation)
- Category: 'want' (Entertainment, shopping, dining out)
- Category: 'savings' (Intentional savings, investments)

### Key Calculations

1. **Total Income (Monthly)**
   ```sql
   SELECT SUM(amount) FROM transactions 
   WHERE user_id = ? AND type = 'income' AND DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE)
   ```

2. **Total Expense (Monthly)**
   ```sql
   SELECT SUM(amount) FROM transactions 
   WHERE user_id = ? AND type = 'expense' AND DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE)
   ```

3. **Net Savings (Calculated)**
   ```
   Net Savings = Total Income - Total Expense
   ```

4. **Need Ratio**
   ```
   Need Ratio = (Sum of expense where category = 'need') / Total Expense * 100
   ```

5. **Want Ratio**
   ```
   Want Ratio = (Sum of expense where category = 'want') / Total Expense * 100
   ```

6. **Savings Ratio**
   ```
   Savings Ratio = Net Savings / Total Income * 100
   ```

---

## Indexes

For optimal performance, the following indexes are recommended:

```sql
-- User lookups
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Transaction queries
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date);
CREATE INDEX idx_transactions_user_type ON transactions(user_id, type);
CREATE INDEX idx_transactions_user_category ON transactions(user_id, category);
CREATE INDEX idx_transactions_date ON transactions(date);

-- Settings lookups
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- Audit logs
CREATE INDEX idx_audit_logs_user_date ON audit_logs(user_id, created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
```

---

## Data Integrity

- **Foreign Keys**: All user_id references enforce referential integrity with CASCADE delete
- **Constraints**: 
  - Transaction `type` must be 'income' or 'expense'
  - Transaction `category` must be 'need', 'want', or 'savings'
  - All amounts must be positive decimal values
- **Unique Constraints**: Username and user_id in settings are unique

---

## Backup & Migration

### Backup Strategy
- Daily automated backups
- Point-in-time recovery capability
- Separate backup storage location

### Migration Support
```sql
-- Example: Add new column to users
ALTER TABLE users ADD COLUMN phone_number VARCHAR(20);

-- Example: Rename column
ALTER TABLE transactions RENAME COLUMN description TO transaction_description;

-- Example: Create new index
CREATE INDEX idx_transactions_amount ON transactions(amount);
```

---

## Security Considerations

1. **Password Security**: Currently using plaintext passwords. Recommend using bcrypt or Argon2 in production
2. **Sensitive Data**: Consider encryption for stored passwords
3. **Audit Trail**: All critical operations logged to `audit_logs` table
4. **Access Control**: Implement role-based access control (RBAC) in application layer
5. **Data Validation**: All inputs validated in application before insertion

---

## Future Enhancements

- [ ] Implement budget tracking per category
- [ ] Add recurring transaction support
- [ ] Implement data export/import functionality
- [ ] Add multi-currency support with exchange rates
- [ ] Implement financial goals tracking
- [ ] Add notification/alert system for budget overruns
- [ ] Implement multi-user permissions for family accounts

---

## Contact & Support

For questions about the database schema or implementation, please refer to the main application documentation or contact the development team.
