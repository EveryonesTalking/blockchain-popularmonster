# Notes Application with Blockchain

**CSIT360 - Blockchain Project** | *Demonstrating blockchain concepts through a practical notes application*

---

## Overview

This project implements a **decentralized notes application** that integrates fundamental blockchain principles. Each note is cryptographically linked to a blockchain block, creating an immutable ledger that ensures data integrity and demonstrates distributed ledger technology. It showcases how blockchain can be applied beyond cryptocurrencies by providing a secure and transparent way to store and manage personal notes. Users can create, view, and manage notes while experiencing how each entry becomes part of an immutable blockchain ledger, ensuring permanent and verifiable recordkeeping.

### Key Features
- **Cardano Wallet Integration** - Pay 2 ADA (Preprod) to create notes via Lace wallet
- **Cryptographic Hash Linking** - Each note is linked to a blockchain block
- **Transaction Verification** - Note creation tied to on-chain Cardano transactions
- **User-based Note Management** - Secure authentication with BCrypt password hashing
- **Blockchain Validation** - Integrity checks and tamper detection through hash verification

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | React.js + Vite |
| **Backend** | Spring Boot (Java 21, Maven) |
| **Database** | PostgreSQL 17.6 |
| **Blockchain** | Cardano (Preprod Testnet) |
| **Wallet** | Lace (via lucid-cardano) |
| **Version Control** | GitHub |

---

## Project Structure

```
notes-application-blockchain/
├── backend/                    # Spring Boot API server
│   └── src/main/java/com/notesapp/backend/
│       ├── controller/         # REST endpoints
│       ├── model/              # Entity classes
│       ├── dto/                # Data transfer objects
│       ├── service/            # Business logic
│       ├── repository/         # Database access
│       └── security/           # Auth & config
├── frontend/notes-app/         # React.js client application
│   └── src/
│       ├── api/                # API client
│       ├── components/         # Reusable components
│       ├── context/            # Auth context
│       ├── hooks/              # Custom hooks (useWallet)
│       ├── pages/              # Page components
│       └── css/                # Stylesheets
└── README.md                   # Project documentation
```

---

## Development Team

*2AM DISCORD DECISIONS*

- **Cantiller, Christian Jayson J.** *(Frontend Dev)*
- **Diva, Justin Andry N.** *(Frontend Dev)*
- **Lada, Nathan Xander** *(Backend Dev)*
- **Go, Felix Christian T.** *(Frontend Dev)*

---

## Quick Start

### Prerequisites
- Java 21+ installed
- Node.js 16+ installed
- PostgreSQL 17.6 installed
- Git installed
- [Lace Wallet](https://www.lace.io/) browser extension installed
- Blockfrost API key (get free at [blockfrost.io](https://blockfrost.io/))

### 1. Clone Repository
```bash
git clone https://github.com/Lumity-13/notes-application-blockchain.git
cd notes-application-blockchain
```

### 2. Database Setup

#### Step 1: Install & Launch PostgreSQL 17.6

`Note: spring.datasource.password=admin`

#### Step 2: Create Database via pgAdmin
1. Open windows search → type in "pgAdmin"
2. Open pgAdmin → Dropdown Server → Dropdown PostgreSQL 17 → Right-click "Databases" → Create
3. Database name: `notes_app`
4. Save

#### Step 3: Initialize Schema
1. Right-click `notes_app` → Query Tool
2. Execute the following SQL:

```sql
-- Create application tables
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(200) NOT NULL,
    avatar_url TEXT,
    token VARCHAR(255)
);

CREATE TABLE notes (
    note_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255),
    content TEXT NOT NULL,
    tx_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE blockchain_ledger (
    block_id SERIAL PRIMARY KEY,
    note_id INT NOT NULL REFERENCES notes(note_id) ON DELETE CASCADE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    previous_hash VARCHAR(255),
    hash VARCHAR(255) NOT NULL
);
```

#### Step 4: Verify the tables
```sql
-- Verify tables exist
SELECT * FROM users;
SELECT * FROM notes;
SELECT * FROM blockchain_ledger;
```

### 3. Environment Setup

#### Frontend (.env)
Create `frontend/notes-app/.env`:
```env
VITE_API_URL=http://localhost:8080
VITE_CARDANO_NETWORK=Preprod
VITE_BLOCKFROST_PROJECT_ID_PREPROD=your_blockfrost_project_id_here
```

### 4. Launch Application

#### Option A: Run both together (requires concurrently)
```bash
npm run dev
```

#### Option B: Run separately

**Terminal 1 - Backend:**
```bash
cd backend
mvn spring-boot:run
```
*Server runs on: http://localhost:8080*

**Terminal 2 - Frontend:**
```bash
cd frontend/notes-app
npm install
npm run dev
```
*Client runs on: http://localhost:5173*

---

## Wallet Setup (Preprod Testnet)

1. **Install Lace Wallet** - Download from [lace.io](https://www.lace.io/)
2. **Create/Import Wallet** - Set up a new wallet or import existing
3. **Switch to Preprod Network** - In Lace settings, change network to "Preprod"
4. **Get Test ADA** - Use the [Cardano Testnet Faucet](https://docs.cardano.org/cardano-testnets/tools/faucet/)

---

## How It Works

### Note Creation Flow
```
1. User writes note (title + content)
2. User clicks "Save"
3. Payment modal opens
4. User connects Lace wallet
5. User pays 2 ADA (Preprod)
6. Transaction submitted to Cardano blockchain
7. Note saved with transaction hash (txHash)
8. Internal blockchain block created with SHA-256 hash
```

### Payment Configuration
| Setting | Value |
|---------|-------|
| Amount | 2 ADA (2,000,000 Lovelace) |
| Network | Preprod Testnet |
| Recipient | `addr_test1qqt6gp96cldazkxg79ugk8k7qpgeyu8qnuxktg0q2f00ev5jv3g8druqq7ep8eyy6mj66hcle5vdp3rt5k9jrspteywqpy9mra` |

### Blockchain Integration
- **Cardano (External)**: Each note creation requires an on-chain ADA payment
- **Internal Ledger**: Notes are also linked in an internal SHA-256 blockchain for integrity verification

---

## API Testing with Postman

### Core Endpoints

#### 1. Register User
```http
POST http://localhost:8080/users/register
Content-Type: application/json

{
  "username": "nathan",
  "email": "nathan@example.com", 
  "password": "12345"
}
```

#### 2. Login
```http
POST http://localhost:8080/users/login
Content-Type: application/json

{
  "email": "nathan@example.com", 
  "password": "12345"
}
```

#### 3. Add Note (Requires txHash)
```http
POST http://localhost:8080/notes/user/1
Content-Type: application/json

{
  "title": "My First Note",
  "content": "First blockchain note",
  "txHash": "abc123..."
}
```

#### 4. Update Note (No payment required)
```http
PUT http://localhost:8080/notes/1
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content"
}
```

#### 5. View Blockchain
```http
GET http://localhost:8080/blocks
```

#### 6. Validate Chain Integrity
```http
GET http://localhost:8080/blocks/validate
```

---

## Development Utilities

### Database Queries
```sql
-- Users Table
SELECT * FROM users;

-- Notes Table (includes tx_hash)
SELECT * FROM notes;

-- Blockchain Ledger Table
SELECT * FROM blockchain_ledger;
```

### Database Reset (Development Only)
```sql
-- Clear all data and reset auto-increment IDs
TRUNCATE TABLE blockchain_ledger RESTART IDENTITY CASCADE;
TRUNCATE TABLE notes RESTART IDENTITY CASCADE; 
TRUNCATE TABLE users RESTART IDENTITY CASCADE;
```

---

## Security Features

- **BCrypt Password Hashing** - Passwords are securely hashed before storage
- **Wallet-based Payments** - Note creation requires verified Cardano transaction
- **Transaction Verification** - Each note stores its associated txHash
- **Chain Validation** - Built-in endpoint to verify blockchain integrity
