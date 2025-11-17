# Dispatch Management API Documentation

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

## Dispatch Endpoints

### 1. Get All Dispatches
```http
GET /api/dispatches
```

**Description:** Retrieve all dispatch records with their line items.

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "type": "export",
      "clientAwb": "AWB-2025-001",
      "dispatchDate": "2025-11-17",
      "totalKg": 150.50,
      "sizeU": 25.00,
      "sizeA": 50.00,
      "sizeB": 35.50,
      "sizeC": 20.00,
      "sizeD": 15.00,
      "sizeE": 5.00,
      "user_id": 1,
      "created_at": "2025-11-17T10:00:00.000000Z",
      "updated_at": "2025-11-17T10:00:00.000000Z",
      "lineItems": [
        {
          "id": 1,
          "dispatch_id": 1,
          "tankId": "tank-1",
          "tankNumber": 1,
          "crateId": "crate-123",
          "looseStockId": null,
          "size": "A",
          "kg": 25.50,
          "crateNumber": 5,
          "isLoose": false,
          "created_at": "2025-11-17T10:00:00.000000Z",
          "updated_at": "2025-11-17T10:00:00.000000Z"
        },
        {
          "id": 2,
          "dispatch_id": 1,
          "tankId": "tank-2",
          "tankNumber": 2,
          "crateId": null,
          "looseStockId": "loose-456",
          "size": "B",
          "kg": 35.50,
          "crateNumber": null,
          "isLoose": true,
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

### 2. Create Dispatch
```http
POST /api/dispatches
```

**Description:** Create a new dispatch record with line items from tanks.

**Request Body:**
```json
{
  "type": "export",
  "clientAwb": "AWB-2025-001",
  "dispatchDate": "2025-11-17",
  "lineItems": [
    {
      "tankId": "tank-1",
      "tankNumber": 1,
      "crateId": "crate-123",
      "looseStockId": null,
      "size": "A",
      "kg": 25.50,
      "crateNumber": 5,
      "isLoose": false
    },
    {
      "tankId": "tank-2",
      "tankNumber": 2,
      "crateId": null,
      "looseStockId": "loose-456",
      "size": "B",
      "kg": 35.50,
      "crateNumber": null,
      "isLoose": true
    },
    {
      "tankId": "tank-1",
      "tankNumber": 1,
      "crateId": "crate-789",
      "looseStockId": null,
      "size": "C",
      "kg": 20.00,
      "crateNumber": 8,
      "isLoose": false
    }
  ],
  "totalKg": 81.00,
  "sizeU": 0,
  "sizeA": 25.50,
  "sizeB": 35.50,
  "sizeC": 20.00,
  "sizeD": 0,
  "sizeE": 0
}
```

**Request Body Fields:**
- `type` (required, string): Dispatch type - "export" or "regrade"
- `clientAwb` (required, string): Client AWB number or identifier
- `dispatchDate` (required, string): Dispatch date in YYYY-MM-DD format
- `lineItems` (required, array): Array of dispatch line items
  - `tankId` (required, string): Tank identifier
  - `tankNumber` (required, integer): Tank number
  - `crateId` (optional, string): Crate ID if dispatching from crate
  - `looseStockId` (optional, string): Loose stock ID if dispatching loose stock
  - `size` (required, string): Lobster size (U, A, B, C, D, E)
  - `kg` (required, number): Weight in kilograms
  - `crateNumber` (optional, integer): Crate number if applicable
  - `isLoose` (required, boolean): Whether item is loose stock
- `totalKg` (required, number): Total weight of all items
- `sizeU` (required, number): Total kg of size U
- `sizeA` (required, number): Total kg of size A
- `sizeB` (required, number): Total kg of size B
- `sizeC` (required, number): Total kg of size C
- `sizeD` (required, number): Total kg of size D
- `sizeE` (required, number): Total kg of size E

**Response (201):**
```json
{
  "message": "Dispatch created successfully",
  "data": {
    "id": 1,
    "type": "export",
    "clientAwb": "AWB-2025-001",
    "dispatchDate": "2025-11-17",
    "totalKg": 81.00,
    "sizeU": 0,
    "sizeA": 25.50,
    "sizeB": 35.50,
    "sizeC": 20.00,
    "sizeD": 0,
    "sizeE": 0,
    "user_id": 1,
    "created_at": "2025-11-17T10:00:00.000000Z",
    "updated_at": "2025-11-17T10:00:00.000000Z",
    "lineItems": [
      {
        "id": 1,
        "dispatch_id": 1,
        "tankId": "tank-1",
        "tankNumber": 1,
        "crateId": "crate-123",
        "looseStockId": null,
        "size": "A",
        "kg": 25.50,
        "crateNumber": 5,
        "isLoose": false
      }
    ]
  }
}
```

---

### 3. Get Single Dispatch
```http
GET /api/dispatches/{id}
```

**Description:** Retrieve a specific dispatch record by ID with all line items.

**Path Parameters:**
- `id` (required, integer): Dispatch ID

**Response (200):**
```json
{
  "data": {
    "id": 1,
    "type": "export",
    "clientAwb": "AWB-2025-001",
    "dispatchDate": "2025-11-17",
    "totalKg": 81.00,
    "sizeU": 0,
    "sizeA": 25.50,
    "sizeB": 35.50,
    "sizeC": 20.00,
    "sizeD": 0,
    "sizeE": 0,
    "user_id": 1,
    "created_at": "2025-11-17T10:00:00.000000Z",
    "updated_at": "2025-11-17T10:00:00.000000Z",
    "lineItems": [...],
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

---

### 4. Update Dispatch
```http
PUT /api/dispatches/{id}
```

**Description:** Update an existing dispatch record details.

**Path Parameters:**
- `id` (required, integer): Dispatch ID

**Request Body:** (All fields optional)
```json
{
  "type": "regrade",
  "clientAwb": "AWB-2025-001-UPDATED",
  "dispatchDate": "2025-11-18"
}
```

**Response (200):**
```json
{
  "message": "Dispatch updated successfully",
  "data": {
    "id": 1,
    "type": "regrade",
    "clientAwb": "AWB-2025-001-UPDATED",
    "dispatchDate": "2025-11-18",
    ...
  }
}
```

---

### 5. Delete Dispatch
```http
DELETE /api/dispatches/{id}
```

**Description:** Delete a dispatch record and all its line items.

**Path Parameters:**
- `id` (required, integer): Dispatch ID

**Response (200):**
```json
{
  "message": "Dispatch deleted successfully"
}
```

---

## Dispatch Reports Endpoints

### 6. Get Dispatch Summary by Date Range
```http
GET /api/dispatches/summary?start_date=2025-11-01&end_date=2025-11-30
```

**Description:** Get summary of dispatches within a date range.

**Query Parameters:**
- `start_date` (required, string): Start date in YYYY-MM-DD format
- `end_date` (required, string): End date in YYYY-MM-DD format
- `type` (optional, string): Filter by dispatch type ("export" or "regrade")

**Response (200):**
```json
{
  "data": {
    "period": {
      "start": "2025-11-01",
      "end": "2025-11-30"
    },
    "totalDispatches": 15,
    "totalKg": 1250.50,
    "byType": {
      "export": {
        "count": 12,
        "totalKg": 1050.00
      },
      "regrade": {
        "count": 3,
        "totalKg": 200.50
      }
    },
    "bySize": {
      "U": { "kg": 150.00, "percentage": 12.0 },
      "A": { "kg": 300.00, "percentage": 24.0 },
      "B": { "kg": 350.50, "percentage": 28.0 },
      "C": { "kg": 250.00, "percentage": 20.0 },
      "D": { "kg": 150.00, "percentage": 12.0 },
      "E": { "kg": 50.00, "percentage": 4.0 }
    },
    "dispatches": [
      {
        "id": 1,
        "clientAwb": "AWB-2025-001",
        "dispatchDate": "2025-11-17",
        "totalKg": 81.00,
        "type": "export"
      }
    ]
  }
}
```

---

### 7. Get Available Tank Stock
```http
GET /api/dispatches/available-stock
```

**Description:** Get available stock from all tanks that can be dispatched.

**Response (200):**
```json
{
  "data": {
    "tanks": [
      {
        "id": 1,
        "name": "Tank-1",
        "tankNumber": 1,
        "crates": [
          {
            "id": 1,
            "crateNumber": 5,
            "size": "A",
            "kg": 25.50,
            "status": "stored"
          }
        ],
        "looseStock": [
          {
            "id": 1,
            "size": "B",
            "kg": 35.50
          }
        ],
        "totalKg": 61.00
      }
    ],
    "summary": {
      "totalKg": 1500.00,
      "bySize": {
        "U": 200.00,
        "A": 300.00,
        "B": 350.00,
        "C": 250.00,
        "D": 200.00,
        "E": 200.00
      }
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
    "clientAwb": [
      "The client awb field is required."
    ],
    "dispatchDate": [
      "The dispatch date must be a valid date."
    ],
    "lineItems": [
      "The line items field is required."
    ],
    "lineItems.0.kg": [
      "The kg must be greater than 0."
    ],
    "totalKg": [
      "The total kg does not match sum of line items."
    ]
  }
}
```

---

### Insufficient Stock Error (400)
```json
{
  "message": "Insufficient stock",
  "error": "Tank 1 Crate 5 has only 20.00 kg available, requested 25.50 kg"
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
  "message": "Dispatch not found."
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

### Dispatch
- `type`: Required, enum (export, regrade)
- `clientAwb`: Required, string, max 255 characters
- `dispatchDate`: Required, valid date (YYYY-MM-DD)
- `lineItems`: Required, array, minimum 1 item
- `totalKg`: Required, numeric, must match sum of line items
- `sizeU`, `sizeA`, `sizeB`, `sizeC`, `sizeD`, `sizeE`: Required, numeric, >= 0

### Dispatch Line Items
- `tankId`: Required, string
- `tankNumber`: Required, integer
- `crateId`: Optional, string (required if not loose stock)
- `looseStockId`: Optional, string (required if loose stock)
- `size`: Required, enum (U, A, B, C, D, E)
- `kg`: Required, numeric, greater than 0
- `crateNumber`: Optional, integer
- `isLoose`: Required, boolean

---

## Business Logic Notes

1. **Dispatch Types**:
   - `export`: For external client shipments
   - `regrade`: For internal transfers or regrading

2. **Stock Validation**:
   - System validates available stock before dispatch
   - Cannot dispatch more than available in tanks
   - Crate status changes to "dispatched" after dispatch

3. **Line Items**:
   - Can dispatch from crates or loose stock
   - Each line item must reference a valid tank
   - Either `crateId` or `looseStockId` must be provided

4. **Calculations**:
   - `totalKg` must equal sum of all line item kg
   - Size totals (sizeU, sizeA, etc.) must match line items

5. **Stock Deduction**:
   - Upon dispatch creation, stock is deducted from tanks
   - Crates are marked as "dispatched"
   - Loose stock quantities are reduced

---

## Laravel Backend Implementation

### Controller Example

```php
<?php

namespace App\Http\Controllers;

use App\Models\Dispatch;
use App\Models\DispatchLineItem;
use App\Models\Tank;
use App\Models\Crate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DispatchController extends Controller
{
    /**
     * Display a listing of dispatches.
     */
    public function index()
    {
        $dispatches = Dispatch::with(['lineItems', 'user'])
            ->latest()
            ->get();

        return response()->json(['data' => $dispatches]);
    }

    /**
     * Store a newly created dispatch.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:export,regrade',
            'clientAwb' => 'required|string|max:255',
            'dispatchDate' => 'required|date',
            'lineItems' => 'required|array|min:1',
            'lineItems.*.tankId' => 'required|string',
            'lineItems.*.tankNumber' => 'required|integer',
            'lineItems.*.crateId' => 'nullable|string',
            'lineItems.*.looseStockId' => 'nullable|string',
            'lineItems.*.size' => 'required|in:U,A,B,C,D,E',
            'lineItems.*.kg' => 'required|numeric|min:0.01',
            'lineItems.*.crateNumber' => 'nullable|integer',
            'lineItems.*.isLoose' => 'required|boolean',
            'totalKg' => 'required|numeric|min:0.01',
            'sizeU' => 'required|numeric|min:0',
            'sizeA' => 'required|numeric|min:0',
            'sizeB' => 'required|numeric|min:0',
            'sizeC' => 'required|numeric|min:0',
            'sizeD' => 'required|numeric|min:0',
            'sizeE' => 'required|numeric|min:0',
        ]);

        // Validate total matches sum
        $calculatedTotal = array_sum(array_column($validated['lineItems'], 'kg'));
        if (abs($calculatedTotal - $validated['totalKg']) > 0.01) {
            return response()->json([
                'message' => 'Total kg does not match sum of line items'
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Validate stock availability
            foreach ($validated['lineItems'] as $item) {
                if ($item['isLoose']) {
                    // Validate loose stock
                    // Add your loose stock validation logic
                } else {
                    // Validate crate
                    $crate = Crate::where('id', $item['crateId'])
                        ->where('status', 'stored')
                        ->first();
                    
                    if (!$crate) {
                        throw new \Exception("Crate not found or not available");
                    }
                    
                    if ($crate->kg < $item['kg']) {
                        throw new \Exception(
                            "Insufficient stock in crate {$crate->crateNumber}"
                        );
                    }
                }
            }

            // Create dispatch
            $dispatch = $request->user()->dispatches()->create([
                'type' => $validated['type'],
                'clientAwb' => $validated['clientAwb'],
                'dispatchDate' => $validated['dispatchDate'],
                'totalKg' => $validated['totalKg'],
                'sizeU' => $validated['sizeU'],
                'sizeA' => $validated['sizeA'],
                'sizeB' => $validated['sizeB'],
                'sizeC' => $validated['sizeC'],
                'sizeD' => $validated['sizeD'],
                'sizeE' => $validated['sizeE'],
            ]);

            // Create line items and update stock
            foreach ($validated['lineItems'] as $itemData) {
                $dispatch->lineItems()->create($itemData);

                // Update crate status or deduct loose stock
                if (!$itemData['isLoose']) {
                    $crate = Crate::find($itemData['crateId']);
                    $crate->update(['status' => 'dispatched']);
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Dispatch created successfully',
                'data' => $dispatch->load('lineItems'),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error creating dispatch',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified dispatch.
     */
    public function show(Dispatch $dispatch)
    {
        return response()->json([
            'data' => $dispatch->load(['lineItems', 'user']),
        ]);
    }

    /**
     * Update the specified dispatch.
     */
    public function update(Request $request, Dispatch $dispatch)
    {
        $validated = $request->validate([
            'type' => 'sometimes|in:export,regrade',
            'clientAwb' => 'sometimes|string|max:255',
            'dispatchDate' => 'sometimes|date',
        ]);

        $dispatch->update($validated);

        return response()->json([
            'message' => 'Dispatch updated successfully',
            'data' => $dispatch->load('lineItems'),
        ]);
    }

    /**
     * Remove the specified dispatch.
     */
    public function destroy(Dispatch $dispatch)
    {
        DB::beginTransaction();
        try {
            // Restore stock before deleting
            foreach ($dispatch->lineItems as $item) {
                if (!$item->isLoose && $item->crateId) {
                    $crate = Crate::find($item->crateId);
                    if ($crate) {
                        $crate->update(['status' => 'stored']);
                    }
                }
            }

            $dispatch->delete();
            DB::commit();

            return response()->json([
                'message' => 'Dispatch deleted successfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error deleting dispatch',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get dispatch summary for date range.
     */
    public function summary(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'type' => 'nullable|in:export,regrade',
        ]);

        $query = Dispatch::whereBetween('dispatchDate', [
            $validated['start_date'],
            $validated['end_date']
        ]);

        if (isset($validated['type'])) {
            $query->where('type', $validated['type']);
        }

        $dispatches = $query->get();

        $summary = [
            'period' => [
                'start' => $validated['start_date'],
                'end' => $validated['end_date'],
            ],
            'totalDispatches' => $dispatches->count(),
            'totalKg' => $dispatches->sum('totalKg'),
            'byType' => [
                'export' => [
                    'count' => $dispatches->where('type', 'export')->count(),
                    'totalKg' => $dispatches->where('type', 'export')->sum('totalKg'),
                ],
                'regrade' => [
                    'count' => $dispatches->where('type', 'regrade')->count(),
                    'totalKg' => $dispatches->where('type', 'regrade')->sum('totalKg'),
                ],
            ],
            'bySize' => [
                'U' => ['kg' => $dispatches->sum('sizeU')],
                'A' => ['kg' => $dispatches->sum('sizeA')],
                'B' => ['kg' => $dispatches->sum('sizeB')],
                'C' => ['kg' => $dispatches->sum('sizeC')],
                'D' => ['kg' => $dispatches->sum('sizeD')],
                'E' => ['kg' => $dispatches->sum('sizeE')],
            ],
            'dispatches' => $dispatches,
        ];

        return response()->json(['data' => $summary]);
    }
}
```

---

### Model Example

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dispatch extends Model
{
    protected $fillable = [
        'type',
        'clientAwb',
        'dispatchDate',
        'totalKg',
        'sizeU',
        'sizeA',
        'sizeB',
        'sizeC',
        'sizeD',
        'sizeE',
        'user_id',
    ];

    protected $casts = [
        'dispatchDate' => 'date',
        'totalKg' => 'decimal:2',
        'sizeU' => 'decimal:2',
        'sizeA' => 'decimal:2',
        'sizeB' => 'decimal:2',
        'sizeC' => 'decimal:2',
        'sizeD' => 'decimal:2',
        'sizeE' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function lineItems()
    {
        return $this->hasMany(DispatchLineItem::class);
    }
}
```

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DispatchLineItem extends Model
{
    protected $fillable = [
        'dispatch_id',
        'tankId',
        'tankNumber',
        'crateId',
        'looseStockId',
        'size',
        'kg',
        'crateNumber',
        'isLoose',
    ];

    protected $casts = [
        'tankNumber' => 'integer',
        'kg' => 'decimal:2',
        'crateNumber' => 'integer',
        'isLoose' => 'boolean',
    ];

    public function dispatch()
    {
        return $this->belongsTo(Dispatch::class);
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
        Schema::create('dispatches', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['export', 'regrade']);
            $table->string('clientAwb');
            $table->date('dispatchDate');
            $table->decimal('totalKg', 10, 2);
            $table->decimal('sizeU', 10, 2)->default(0);
            $table->decimal('sizeA', 10, 2)->default(0);
            $table->decimal('sizeB', 10, 2)->default(0);
            $table->decimal('sizeC', 10, 2)->default(0);
            $table->decimal('sizeD', 10, 2)->default(0);
            $table->decimal('sizeE', 10, 2)->default(0);
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('dispatch_line_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dispatch_id')->constrained()->onDelete('cascade');
            $table->string('tankId');
            $table->integer('tankNumber');
            $table->string('crateId')->nullable();
            $table->string('looseStockId')->nullable();
            $table->enum('size', ['U', 'A', 'B', 'C', 'D', 'E']);
            $table->decimal('kg', 10, 2);
            $table->integer('crateNumber')->nullable();
            $table->boolean('isLoose')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dispatch_line_items');
        Schema::dropIfExists('dispatches');
    }
};
```

---

### Routes Example

```php
// routes/api.php

use App\Http\Controllers\DispatchController;

Route::middleware('auth:sanctum')->group(function () {
    // Dispatches
    Route::apiResource('dispatches', DispatchController::class);
    Route::get('dispatches/summary', [DispatchController::class, 'summary']);
    Route::get('dispatches/available-stock', [DispatchController::class, 'availableStock']);
});
```

---

## Frontend Integration Status

✅ **POST /api/dispatches** - Integrated with axios in `DispatchManagement.tsx`

The component sends data in this format when form is submitted:
```javascript
{
  type: "export",
  clientAwb: "AWB-2025-001",
  dispatchDate: "2025-11-17",
  lineItems: [
    {
      tankId: "tank-1",
      tankNumber: 1,
      crateId: "crate-123",
      looseStockId: null,
      size: "A",
      kg: 25.50,
      crateNumber: 5,
      isLoose: false
    }
  ],
  totalKg: 81.00,
  sizeU: 0,
  sizeA: 25.50,
  sizeB: 35.50,
  sizeC: 20.00,
  sizeD: 0,
  sizeE: 0
}
```
