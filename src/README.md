# Lobster Stock Management System

A comprehensive web application for managing lobster stock from boat offloads through receiving, tank storage, and dispatching.

## Features

### 1. Offload Management
- Record boat offload data with trip details
- Track quality breakdown (dead, rotten, alive)
- Record live lobster by size categories (U, A, B, C, D, E)

### 2. Receiving
- Create receiving batches with crate line items
- Link crates to boat offloads
- Track 300 numbered crates
- Record size and weight for each crate

### 3. Recheck & Storage
- Recheck crate weights and sizes
- Store crates in tanks (keeps crate identity)
- Empty crates into loose stock
- Support for 20 tanks (expandable)

### 4. Tank Management
- View all tanks and their contents
- See crates and loose stock per tank
- Real-time stock summaries by size
- Track mixed tank contents

### 5. Dispatch Management
- Create export or regrade dispatches
- Select stock from any tank
- Support partial loose stock removal
- Automatic stock deduction
- Dispatch summary by size

### 6. Loss Adjustment
- Record dead, rotten, or lost product
- Select from crates or loose stock
- Automatic stock reduction
- Loss history tracking

### 7. Reports
- **Stock by Tank**: Complete breakdown per tank
- **Stock by Size**: Factory-wide size distribution
- **Stock by Boat/Trip**: Traceability from source to current stock

### 8. Settings
- User management with roles (Admin/Operator)
- Tank activation/deactivation
- Add new tanks as needed

## Size Categories
- **U**: Ultra size
- **A**: A grade
- **B**: B grade
- **C**: C grade
- **D**: D grade
- **E**: E grade

## Workflow

1. **Offload**: Create offload record when lobster arrives from boat
2. **Receive**: Create receiving batch with crate details
3. **Recheck**: Verify weights/sizes and assign to tanks
4. **Store**: Keep as crates or empty into loose stock
5. **Track**: Monitor stock across all tanks
6. **Adjust**: Record any losses (dead/rotten/lost)
7. **Dispatch**: Create export/regrade orders
8. **Report**: View comprehensive stock reports

## Data Persistence

This application uses localStorage for data persistence. All data is stored locally in your browser.

**Note**: This is a prototype system. For production use with real business data, you should implement a proper backend database with:
- User authentication
- Data backups
- Multi-user access control
- Audit trails
- API security

## Getting Started

The system initializes with:
- 20 active tanks (Tank 1-20)
- Default admin user
- Empty stock

Start by creating an offload record, then proceed through the workflow.

## Export Data

Use your browser's developer tools to export localStorage data:
```javascript
localStorage.getItem('lobsterStockData')
```

## Important Notes

- Crates are numbered 1-300
- Each crate maintains its identity until emptied
- Loose stock can be adjusted manually
- All stock movements are traceable
- Negative adjustments only through loss records
