# Receiving Batches API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication
All endpoints require Laravel Sanctum authentication.

**Headers Required:**
```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

---

## Receiving Batches Endpoints

### 1. Get All Receiving Batches
```http
GET /api/receiving-batches
```

**Description:** Retrieve all receiving batches with their associated crates.

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
      "updated_at": "2025-11-17T10:00:00.000000Z",
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
          "status": "received",
          "user_id": 1,
          "created_at": "2025-11-17T10:00:00.000000Z",
          "updated_at": "2025-11-17T10:00:00.000000Z"
        },
        {
          "id": 2,
          "receiving_batch_id": 1,
          "boatName": "Boat B",
          "offloadDate": "2025-11-15",
          "crateNumber": 2,
          "size": "B",
          "kg": 30.00,
          "originalKg": 30.00,
          "originalSize": "B",
          "status": "received",
          "user_id": 1,
          "created_at": "2025-11-17T10:00:00.000000Z",
          "updated_at": "2025-11-17T10:00:00.000000Z"
        }
      ],
      "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

---

### 2. Create Receiving Batch
```http
POST /api/receiving-batches
```

**Description:** Create a new receiving batch with multiple crate line items.

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
    },
    {
      "boatName": "Boat C",
      "offloadDate": "2025-11-14",
      "crateNumber": 3,
      "size": "C",
      "kg": 22.75
    }
  ]
}
```

**Request Body Fields:**
- `date` (required, string): Receiving date in YYYY-MM-DD format
- `batchNumber` (required, string): Unique batch identifier
- `crates` (required, array): Array of crate objects
  - `boatName` (required, string): Name of the boat
  - `offloadDate` (required, string): Date when offloaded in YYYY-MM-DD format
  - `crateNumber` (required, integer): Crate number (must be unique)
  - `size` (required, string): Lobster size category (U, A, B, C, D, E)
  - `kg` (required, number): Weight in kilograms (positive decimal)

**Response (201):**
```json
{
  "message": "Receiving batch created successfully",
  "data": {
    "id": 1,
    "date": "2025-11-17",
    "batchNumber": "RB-001",
    "user_id": 1,
    "created_at": "2025-11-17T10:00:00.000000Z",
    "updated_at": "2025-11-17T10:00:00.000000Z",
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
        "status": "received",
        "user_id": 1,
        "created_at": "2025-11-17T10:00:00.000000Z",
        "updated_at": "2025-11-17T10:00:00.000000Z"
      },
      {
        "id": 2,
        "receiving_batch_id": 1,
        "boatName": "Boat B",
        "offloadDate": "2025-11-15",
        "crateNumber": 2,
        "size": "B",
        "kg": 30.00,
        "originalKg": 30.00,
        "originalSize": "B",
        "status": "received",
        "user_id": 1,
        "created_at": "2025-11-17T10:00:00.000000Z",
        "updated_at": "2025-11-17T10:00:00.000000Z"
      },
      {
        "id": 3,
        "receiving_batch_id": 1,
        "boatName": "Boat C",
        "offloadDate": "2025-11-14",
        "crateNumber": 3,
        "size": "C",
        "kg": 22.75,
        "originalKg": 22.75,
        "originalSize": "C",
        "status": "received",
        "user_id": 1,
        "created_at": "2025-11-17T10:00:00.000000Z",
        "updated_at": "2025-11-17T10:00:00.000000Z"
      }
    ]
  }
}
```

---

### 3. Get Single Receiving Batch
```http
GET /api/receiving-batches/{id}
```

**Description:** Retrieve a specific receiving batch by ID with all its crates.

**Path Parameters:**
- `id` (required, integer): Receiving batch ID

**Response (200):**
```json
{
  "data": {
    "id": 1,
    "date": "2025-11-17",
    "batchNumber": "RB-001",
    "user_id": 1,
    "created_at": "2025-11-17T10:00:00.000000Z",
    "updated_at": "2025-11-17T10:00:00.000000Z",
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
    ],
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

---

### 4. Update Receiving Batch
```http
PUT /api/receiving-batches/{id}
```

**Description:** Update an existing receiving batch details.

**Path Parameters:**
- `id` (required, integer): Receiving batch ID

**Request Body:** (All fields optional)
```json
{
  "date": "2025-11-18",
  "batchNumber": "RB-001-UPDATED"
}
```

**Response (200):**
```json
{
  "message": "Receiving batch updated successfully",
  "data": {
    "id": 1,
    "date": "2025-11-18",
    "batchNumber": "RB-001-UPDATED",
    "user_id": 1,
    "created_at": "2025-11-17T10:00:00.000000Z",
    "updated_at": "2025-11-17T11:00:00.000000Z",
    "crates": [...]
  }
}
```

---

### 5. Delete Receiving Batch
```http
DELETE /api/receiving-batches/{id}
```

**Description:** Delete a receiving batch and all its associated crates.

**Path Parameters:**
- `id` (required, integer): Receiving batch ID

**Response (200):**
```json
{
  "message": "Receiving batch deleted successfully"
}
```

---

## Crate Management Endpoints

### 6. Get Available Crates
```http
GET /api/crates/available
```

**Description:** Get list of crate numbers that are available for assignment.

**Response (200):**
```json
{
  "data": {
    "availableCrates": [1, 2, 3, 5, 8, 10, 15],
    "totalAvailable": 7,
    "nextAvailable": 1
  }
}
```

---

### 7. Get Crate by Number
```http
GET /api/crates/{crateNumber}
```

**Description:** Get crate details by crate number.

**Path Parameters:**
- `crateNumber` (required, integer): Crate number

**Response (200):**
```json
{
  "data": {
    "id": 1,
    "receiving_batch_id": 1,
    "boatName": "Boat A",
    "offloadDate": "2025-11-16",
    "crateNumber": 1,
    "size": "A",
    "kg": 25.50,
    "originalKg": 25.50,
    "originalSize": "A",
    "status": "received",
    "receivingBatch": {
      "id": 1,
      "batchNumber": "RB-001",
      "date": "2025-11-17"
    }
  }
}
```

---

### 8. Update Crate
```http
PUT /api/crates/{id}
```

**Description:** Update crate details (e.g., after recheck process).

**Path Parameters:**
- `id` (required, integer): Crate ID

**Request Body:**
```json
{
  "size": "B",
  "kg": 23.00,
  "status": "stored"
}
```

**Response (200):**
```json
{
  "message": "Crate updated successfully",
  "data": {
    "id": 1,
    "size": "B",
    "kg": 23.00,
    "originalKg": 25.50,
    "originalSize": "A",
    "status": "stored",
    ...
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
    "date": [
      "The date field is required."
    ],
    "batchNumber": [
      "The batch number has already been taken."
    ],
    "crates.0.boatName": [
      "The boat name field is required."
    ],
    "crates.1.kg": [
      "The kg must be greater than 0."
    ],
    "crates.2.crateNumber": [
      "The crate number has already been taken."
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
  "message": "Receiving batch not found."
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

## Validation Rules

### Receiving Batch
- `date`: Required, valid date format (YYYY-MM-DD)
- `batchNumber`: Required, string, max 255 characters, unique
- `crates`: Required, array, minimum 1 item

### Crate Line Items
- `boatName`: Required, string, max 255 characters
- `offloadDate`: Required, valid date format (YYYY-MM-DD)
- `crateNumber`: Required, integer, unique (not already in use)
- `size`: Required, enum (U, A, B, C, D, E)
- `kg`: Required, numeric, greater than 0, max 2 decimal places

---

## Business Logic Notes

1. **Crate Numbers**: Each crate must have a unique number across the entire system
2. **Original Values**: `originalKg` and `originalSize` are set automatically from `kg` and `size` on creation
3. **Status Flow**: 
   - `received` → Initial status when batch is created
   - `stored` → After recheck and assignment to tank
   - `dispatched` → After dispatch to customer
4. **Batch Deletion**: Deleting a batch will also delete all associated crates (cascade delete)
5. **Available Crates**: System tracks which crate numbers are available for new assignments

---

## Laravel Backend Implementation

### Controller Example

```php
<?php

namespace App\Http\Controllers;

use App\Models\ReceivingBatch;
use App\Models\Crate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReceivingBatchController extends Controller
{
    /**
     * Display a listing of receiving batches.
     */
    public function index()
    {
        $batches = ReceivingBatch::with(['crates', 'user'])
            ->latest()
            ->get();

        return response()->json(['data' => $batches]);
    }

    /**
     * Store a newly created receiving batch.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'batchNumber' => 'required|string|max:255|unique:receiving_batches,batchNumber',
            'crates' => 'required|array|min:1',
            'crates.*.boatName' => 'required|string|max:255',
            'crates.*.offloadDate' => 'required|date',
            'crates.*.crateNumber' => 'required|integer|unique:crates,crateNumber',
            'crates.*.size' => 'required|in:U,A,B,C,D,E',
            'crates.*.kg' => 'required|numeric|min:0.01|regex:/^\d+(\.\d{1,2})?$/',
        ]);

        DB::beginTransaction();
        try {
            // Create batch
            $batch = $request->user()->receivingBatches()->create([
                'date' => $validated['date'],
                'batchNumber' => $validated['batchNumber'],
            ]);

            // Create crates
            $crates = [];
            foreach ($validated['crates'] as $crateData) {
                $crate = $batch->crates()->create([
                    'boatName' => $crateData['boatName'],
                    'offloadDate' => $crateData['offloadDate'],
                    'crateNumber' => $crateData['crateNumber'],
                    'size' => $crateData['size'],
                    'kg' => $crateData['kg'],
                    'originalKg' => $crateData['kg'],
                    'originalSize' => $crateData['size'],
                    'status' => 'received',
                    'user_id' => $request->user()->id,
                ]);
                $crates[] = $crate;
            }

            DB::commit();

            return response()->json([
                'message' => 'Receiving batch created successfully',
                'data' => $batch->load('crates'),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error creating receiving batch',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified receiving batch.
     */
    public function show(ReceivingBatch $receivingBatch)
    {
        return response()->json([
            'data' => $receivingBatch->load(['crates', 'user']),
        ]);
    }

    /**
     * Update the specified receiving batch.
     */
    public function update(Request $request, ReceivingBatch $receivingBatch)
    {
        $validated = $request->validate([
            'date' => 'sometimes|date',
            'batchNumber' => 'sometimes|string|max:255|unique:receiving_batches,batchNumber,' . $receivingBatch->id,
        ]);

        $receivingBatch->update($validated);

        return response()->json([
            'message' => 'Receiving batch updated successfully',
            'data' => $receivingBatch->load('crates'),
        ]);
    }

    /**
     * Remove the specified receiving batch.
     */
    public function destroy(ReceivingBatch $receivingBatch)
    {
        $receivingBatch->delete();

        return response()->json([
            'message' => 'Receiving batch deleted successfully',
        ]);
    }
}
```

---

### Model Example

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReceivingBatch extends Model
{
    protected $fillable = [
        'date',
        'batchNumber',
        'user_id',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function crates()
    {
        return $this->hasMany(Crate::class);
    }
}
```

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Crate extends Model
{
    protected $fillable = [
        'receiving_batch_id',
        'boatName',
        'offloadDate',
        'crateNumber',
        'size',
        'kg',
        'originalKg',
        'originalSize',
        'status',
        'user_id',
    ];

    protected $casts = [
        'offloadDate' => 'date',
        'kg' => 'decimal:2',
        'originalKg' => 'decimal:2',
        'crateNumber' => 'integer',
    ];

    public function receivingBatch()
    {
        return $this->belongsTo(ReceivingBatch::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
```

---

### Migration Example

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('receiving_batches', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('batchNumber')->unique();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('crates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('receiving_batch_id')->constrained()->onDelete('cascade');
            $table->string('boatName');
            $table->date('offloadDate');
            $table->integer('crateNumber')->unique();
            $table->enum('size', ['U', 'A', 'B', 'C', 'D', 'E']);
            $table->decimal('kg', 10, 2);
            $table->decimal('originalKg', 10, 2);
            $table->enum('originalSize', ['U', 'A', 'B', 'C', 'D', 'E']);
            $table->enum('status', ['received', 'stored', 'dispatched'])->default('received');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crates');
        Schema::dropIfExists('receiving_batches');
    }
};
```

---

### Routes Example

```php
// routes/api.php

use App\Http\Controllers\ReceivingBatchController;
use App\Http\Controllers\CrateController;

Route::middleware('auth:sanctum')->group(function () {
    // Receiving Batches
    Route::apiResource('receiving-batches', ReceivingBatchController::class);
    
    // Crates
    Route::get('crates/available', [CrateController::class, 'available']);
    Route::get('crates/{crateNumber}', [CrateController::class, 'showByNumber']);
    Route::put('crates/{crate}', [CrateController::class, 'update']);
});
```

---

## Frontend Integration Status

✅ **POST /api/receiving-batches** - Integrated with axios in `ReceivingManagement.tsx`

The component sends data in this format when form is submitted:
```javascript
{
  date: "2025-11-17",
  batchNumber: "RB-001",
  crates: [
    {
      boatName: "Boat A",
      offloadDate: "2025-11-16",
      crateNumber: 1,
      size: "A",
      kg: 25.50
    }
  ]
}
```
