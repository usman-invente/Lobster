# Lobster Management System - Complete API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication
All endpoints (except login/register) require Laravel Sanctum authentication.

**Headers Required:**
```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

---

## Authentication Endpoints

### 1. Login
```http
POST /api/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com"
  },
  "token": "1|xxxxxxxxxxxxxxxxxxxxx"
}
```

---

### 2. Logout
```http
POST /api/logout
```

**Headers:** Authorization Bearer Token Required

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

### 3. Get Current User
```http
GET /api/user
```

**Headers:** Authorization Bearer Token Required

**Response (200):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "user@example.com",
  "created_at": "2025-11-17T10:00:00.000000Z"
}
```

---

## Offload Records Endpoints

### 1. Get All Offload Records
```http
GET /api/offload-records
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "boatName": "Boat A",
      "offloadDate": "2025-11-17",
      "tripNumber": "T-001",
      "externalFactory": "Factory X",
      "totalKgOffloaded": 500.00,
      "totalKgReceived": 480.00,
      "totalKgDead": 10.00,
      "totalKgRotten": 10.00,
      "totalKgAlive": 460.00,
      "sizeU": 100.00,
      "sizeA": 100.00,
      "sizeB": 100.00,
      "sizeC": 80.00,
      "sizeD": 50.00,
      "sizeE": 30.00,
      "deadOnTanks": 0.00,
      "rottenOnTanks": 0.00,
      "user_id": 1,
      "created_at": "2025-11-17T10:00:00.000000Z",
      "updated_at": "2025-11-17T10:00:00.000000Z"
    }
  ]
}
```

---

### 2. Create Offload Record
```http
POST /api/offload-records
```

**Request Body:**
```json
{
  "boatName": "Boat A",
  "offloadDate": "2025-11-17",
  "tripNumber": "T-001",
  "externalFactory": "Factory X",
  "totalKgOffloaded": 500.00,
  "totalKgReceived": 480.00,
  "totalKgDead": 10.00,
  "totalKgRotten": 10.00,
  "totalKgAlive": 460.00,
  "sizeU": 100.00,
  "sizeA": 100.00,
  "sizeB": 100.00,
  "sizeC": 80.00,
  "sizeD": 50.00,
  "sizeE": 30.00,
  "deadOnTanks": 0,
  "rottenOnTanks": 0
}
```

**Response (201):**
```json
{
  "message": "Offload record created successfully",
  "data": {
    "id": 1,
    "boatName": "Boat A",
    ...
  }
}
```

---

### 3. Get Single Offload Record
```http
GET /api/offload-records/{id}
```

**Response (200):**
```json
{
  "data": {
    "id": 1,
    "boatName": "Boat A",
    ...
  }
}
```

---

### 4. Update Offload Record
```http
PUT /api/offload-records/{id}
```

**Request Body:** (All fields optional)
```json
{
  "boatName": "Updated Boat Name",
  "totalKgOffloaded": 550.00
}
```

**Response (200):**
```json
{
  "message": "Offload record updated successfully",
  "data": {
    "id": 1,
    "boatName": "Updated Boat Name",
    ...
  }
}
```

---

### 5. Delete Offload Record
```http
DELETE /api/offload-records/{id}
```

**Response (200):**
```json
{
  "message": "Offload record deleted successfully"
}
```

---

## Receiving Batches Endpoints

### 1. Get All Receiving Batches
```http
GET /api/receiving-batches
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "date": "2025-11-17",
      "batchNumber": "RB-001",
      "user_id": 1,
      "created_at": "2025-11-17T10:00:00.000000Z",
      "crates": [
        {
          "id": 1,
          "receiving_batch_id": 1,
          "boatName": "Boat A",
          "offloadDate": "2025-11-16",
          "crateNumber": 1,
          "size": "A",
          "kg": 25.50,
          "originalKg": 25.50,
          "originalSize": "A",
          "status": "received"
        }
      ]
    }
  ]
}
```

---

### 2. Create Receiving Batch
```http
POST /api/receiving-batches
```

**Request Body:**
```json
{
  "date": "2025-11-17",
  "batchNumber": "RB-001",
  "crates": [
    {
      "boatName": "Boat A",
      "offloadDate": "2025-11-16",
      "crateNumber": 1,
      "size": "A",
      "kg": 25.50
    },
    {
      "boatName": "Boat B",
      "offloadDate": "2025-11-15",
      "crateNumber": 2,
      "size": "B",
      "kg": 30.00
    }
  ]
}
```

**Response (201):**
```json
{
  "message": "Receiving batch created successfully",
  "data": {
    "id": 1,
    "batchNumber": "RB-001",
    "crates": [...]
  }
}
```

---

### 3. Get Single Receiving Batch
```http
GET /api/receiving-batches/{id}
```

**Response (200):**
```json
{
  "data": {
    "id": 1,
    "batchNumber": "RB-001",
    "crates": [...]
  }
}
```

---

### 4. Update Receiving Batch
```http
PUT /api/receiving-batches/{id}
```

**Request Body:**
```json
{
  "batchNumber": "RB-001-UPDATED"
}
```

**Response (200):**
```json
{
  "message": "Receiving batch updated successfully",
  "data": {...}
}
```

---

### 5. Delete Receiving Batch
```http
DELETE /api/receiving-batches/{id}
```

**Response (200):**
```json
{
  "message": "Receiving batch deleted successfully"
}
```

---

## Recheck Process Endpoints

### 1. Get All Recheck Records
```http
GET /api/recheck-records
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "date": "2025-11-17",
      "crateNumber": 1,
      "originalSize": "A",
      "originalKg": 25.50,
      "deadKg": 0.50,
      "rottenKg": 0.30,
      "sizeChanges": [
        {
          "fromSize": "A",
          "toSize": "B",
          "kg": 2.00
        }
      ],
      "finalSize": "A",
      "finalKg": 22.70,
      "tankAssigned": "Tank-1",
      "user_id": 1,
      "created_at": "2025-11-17T10:00:00.000000Z"
    }
  ]
}
```

---

### 2. Create Recheck Record
```http
POST /api/recheck-records
```

**Request Body:**
```json
{
  "date": "2025-11-17",
  "crateNumber": 1,
  "originalSize": "A",
  "originalKg": 25.50,
  "deadKg": 0.50,
  "rottenKg": 0.30,
  "sizeChanges": [
    {
      "fromSize": "A",
      "toSize": "B",
      "kg": 2.00
    }
  ],
  "finalSize": "A",
  "finalKg": 22.70,
  "tankAssigned": "Tank-1"
}
```

**Response (201):**
```json
{
  "message": "Recheck record created successfully",
  "data": {...}
}
```

---

## Tank Management Endpoints

### 1. Get All Tanks
```http
GET /api/tanks
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Tank-1",
      "capacity": 1000.00,
      "currentStock": 450.50,
      "status": "active",
      "crates": [
        {
          "id": 1,
          "crateNumber": 1,
          "size": "A",
          "kg": 25.50,
          "status": "stored"
        }
      ],
      "looseStock": [
        {
          "id": 1,
          "size": "B",
          "kg": 15.00
        }
      ]
    }
  ]
}
```

---

### 2. Create Tank
```http
POST /api/tanks
```

**Request Body:**
```json
{
  "name": "Tank-1",
  "capacity": 1000.00,
  "status": "active"
}
```

**Response (201):**
```json
{
  "message": "Tank created successfully",
  "data": {
    "id": 1,
    "name": "Tank-1",
    "capacity": 1000.00,
    "currentStock": 0,
    "status": "active"
  }
}
```

---

### 3. Update Tank
```http
PUT /api/tanks/{id}
```

**Request Body:**
```json
{
  "name": "Tank-1-Updated",
  "capacity": 1200.00,
  "status": "maintenance"
}
```

**Response (200):**
```json
{
  "message": "Tank updated successfully",
  "data": {...}
}
```

---

### 4. Get Tank Stock
```http
GET /api/tanks/{id}/stock
```

**Response (200):**
```json
{
  "data": {
    "tankId": 1,
    "tankName": "Tank-1",
    "crates": [...],
    "looseStock": [...],
    "totalKg": 450.50
  }
}
```

---

## Dispatch Management Endpoints

### 1. Get All Dispatches
```http
GET /api/dispatches
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "date": "2025-11-17",
      "customer": "Customer A",
      "invoiceNumber": "INV-001",
      "items": [
        {
          "size": "A",
          "kg": 50.00,
          "pricePerKg": 25.00,
          "total": 1250.00
        }
      ],
      "totalKg": 50.00,
      "totalAmount": 1250.00,
      "user_id": 1,
      "created_at": "2025-11-17T10:00:00.000000Z"
    }
  ]
}
```

---

### 2. Create Dispatch
```http
POST /api/dispatches
```

**Request Body:**
```json
{
  "date": "2025-11-17",
  "customer": "Customer A",
  "invoiceNumber": "INV-001",
  "items": [
    {
      "size": "A",
      "kg": 50.00,
      "pricePerKg": 25.00,
      "total": 1250.00
    },
    {
      "size": "B",
      "kg": 30.00,
      "pricePerKg": 20.00,
      "total": 600.00
    }
  ],
  "totalKg": 80.00,
  "totalAmount": 1850.00
}
```

**Response (201):**
```json
{
  "message": "Dispatch created successfully",
  "data": {...}
}
```

---

### 3. Get Single Dispatch
```http
GET /api/dispatches/{id}
```

**Response (200):**
```json
{
  "data": {
    "id": 1,
    "customer": "Customer A",
    "items": [...]
  }
}
```

---

### 4. Update Dispatch
```http
PUT /api/dispatches/{id}
```

**Request Body:**
```json
{
  "customer": "Customer A - Updated",
  "invoiceNumber": "INV-001-REV"
}
```

**Response (200):**
```json
{
  "message": "Dispatch updated successfully",
  "data": {...}
}
```

---

### 5. Delete Dispatch
```http
DELETE /api/dispatches/{id}
```

**Response (200):**
```json
{
  "message": "Dispatch deleted successfully"
}
```

---

## Loss Adjustment Endpoints

### 1. Get All Loss Records
```http
GET /api/loss-adjustments
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "date": "2025-11-17",
      "type": "dead",
      "size": "A",
      "kg": 5.50,
      "reason": "Natural mortality",
      "source": "Tank-1",
      "user_id": 1,
      "created_at": "2025-11-17T10:00:00.000000Z"
    }
  ]
}
```

---

### 2. Create Loss Adjustment
```http
POST /api/loss-adjustments
```

**Request Body:**
```json
{
  "date": "2025-11-17",
  "type": "dead",
  "size": "A",
  "kg": 5.50,
  "reason": "Natural mortality",
  "source": "Tank-1"
}
```

**Response (201):**
```json
{
  "message": "Loss adjustment created successfully",
  "data": {...}
}
```

---

### 3. Get Single Loss Record
```http
GET /api/loss-adjustments/{id}
```

**Response (200):**
```json
{
  "data": {
    "id": 1,
    "type": "dead",
    "kg": 5.50,
    ...
  }
}
```

---

### 4. Update Loss Adjustment
```http
PUT /api/loss-adjustments/{id}
```

**Request Body:**
```json
{
  "kg": 6.00,
  "reason": "Updated reason"
}
```

**Response (200):**
```json
{
  "message": "Loss adjustment updated successfully",
  "data": {...}
}
```

---

### 5. Delete Loss Adjustment
```http
DELETE /api/loss-adjustments/{id}
```

**Response (200):**
```json
{
  "message": "Loss adjustment deleted successfully"
}
```

---

## Reports Endpoints

### 1. Get Stock Summary
```http
GET /api/reports/stock-summary
```

**Response (200):**
```json
{
  "data": {
    "totalStock": 1250.50,
    "bySize": {
      "U": 100.00,
      "A": 250.50,
      "B": 300.00,
      "C": 200.00,
      "D": 150.00,
      "E": 250.00
    },
    "byTank": [
      {
        "tankName": "Tank-1",
        "totalKg": 450.50
      }
    ]
  }
}
```

---

### 2. Get Dispatch Report
```http
GET /api/reports/dispatches?start_date=2025-11-01&end_date=2025-11-30
```

**Query Parameters:**
- `start_date` (required): Start date (YYYY-MM-DD)
- `end_date` (required): End date (YYYY-MM-DD)

**Response (200):**
```json
{
  "data": {
    "period": {
      "start": "2025-11-01",
      "end": "2025-11-30"
    },
    "totalDispatches": 15,
    "totalKg": 750.50,
    "totalAmount": 18750.00,
    "bySize": {
      "A": { "kg": 250.00, "amount": 6250.00 },
      "B": { "kg": 300.00, "amount": 6000.00 }
    }
  }
}
```

---

### 3. Get Loss Report
```http
GET /api/reports/losses?start_date=2025-11-01&end_date=2025-11-30
```

**Query Parameters:**
- `start_date` (required): Start date (YYYY-MM-DD)
- `end_date` (required): End date (YYYY-MM-DD)

**Response (200):**
```json
{
  "data": {
    "period": {
      "start": "2025-11-01",
      "end": "2025-11-30"
    },
    "totalLossKg": 45.50,
    "byType": {
      "dead": 25.00,
      "rotten": 20.50
    },
    "bySize": {
      "A": 15.00,
      "B": 20.50,
      "C": 10.00
    }
  }
}
```

---

## Error Responses

### Validation Error (422)
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "boatName": [
      "The boat name field is required."
    ],
    "kg": [
      "The kg must be at least 0."
    ]
  }
}
```

---

### Unauthorized (401)
```json
{
  "message": "Unauthenticated."
}
```

---

### Not Found (404)
```json
{
  "message": "Resource not found."
}
```

---

### Server Error (500)
```json
{
  "message": "Server Error",
  "error": "Error details..."
}
```

---

## Notes

1. All dates should be in `YYYY-MM-DD` format
2. All numeric values (kg, amounts) should be positive decimals
3. Size categories: `U`, `A`, `B`, `C`, `D`, `E`
4. Tank status: `active`, `maintenance`, `inactive`
5. Crate status: `received`, `stored`, `dispatched`
6. Loss types: `dead`, `rotten`

---

## Frontend Implementation Status

✅ **Offload Records** - POST endpoint integrated
✅ **Receiving Batches** - POST endpoint integrated
⏳ **Recheck Process** - Ready for integration
⏳ **Tank Management** - Ready for integration
⏳ **Dispatch Management** - Ready for integration
⏳ **Loss Adjustment** - Ready for integration
