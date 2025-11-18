# Loss Adjustment API Documentation

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

## Loss Adjustment Endpoints

### 1. Get All Loss Adjustments
```http
GET /api/loss-adjustments
```

**Description:** Retrieve all loss adjustment records.

**Query Parameters:**
- `start_date` (optional, string): Filter by date range start (YYYY-MM-DD)
- `end_date` (optional, string): Filter by date range end (YYYY-MM-DD)
- `type` (optional, string): Filter by loss type (dead, rotten, lost)

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "date": "2025-11-19",
      "tankId": "tank-1",
      "tankNumber": 1,
      "type": "dead",
      "size": "A",
      "kg": 5.50,
      "reason": "Found dead during morning inspection",
      "user_id": 1,
      "created_at": "2025-11-19T08:30:00.000000Z",
      "updated_at": "2025-11-19T08:30:00.000000Z",
      "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      }
    },
    {
      "id": 2,
      "date": "2025-11-19",
      "tankId": "tank-2",
      "tankNumber": 2,
      "type": "rotten",
      "size": "B",
      "kg": 3.20,
      "reason": "Quality deterioration, found during tank inspection",
      "user_id": 1,
      "created_at": "2025-11-19T10:15:00.000000Z",
      "updated_at": "2025-11-19T10:15:00.000000Z",
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

### 2. Create Loss Adjustment
```http
POST /api/loss-adjustments
```

**Description:** Record a new loss adjustment (dead, rotten, or lost lobsters).

**Request Body:**
```json
{
  "date": "2025-11-19",
  "tankId": "tank-1",
  "tankNumber": 1,
  "type": "dead",
  "size": "A",
  "kg": 5.50,
  "reason": "Found dead during morning inspection"
}
```

**Request Body Fields:**
- `date` (required, string): Date of loss adjustment (YYYY-MM-DD)
- `tankId` (required, string): Tank identifier
- `tankNumber` (required, integer): Tank number (1-8)
- `type` (required, string): Loss type - "dead", "rotten", or "lost"
- `size` (required, string): Lobster size (U, A, B, C, D, E)
- `kg` (required, number): Weight in kilograms (must be positive)
- `reason` (optional, string): Reason for loss adjustment

**Response (201):**
```json
{
  "message": "Loss adjustment created successfully",
  "data": {
    "id": 1,
    "date": "2025-11-19",
    "tankId": "tank-1",
    "tankNumber": 1,
    "type": "dead",
    "size": "A",
    "kg": 5.50,
    "reason": "Found dead during morning inspection",
    "user_id": 1,
    "created_at": "2025-11-19T08:30:00.000000Z",
    "updated_at": "2025-11-19T08:30:00.000000Z",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

---

### 3. Get Single Loss Adjustment
```http
GET /api/loss-adjustments/{id}
```

**Description:** Retrieve a specific loss adjustment record by ID.

**Path Parameters:**
- `id` (required, integer): Loss adjustment ID

**Response (200):**
```json
{
  "data": {
    "id": 1,
    "date": "2025-11-19",
    "tankId": "tank-1",
    "tankNumber": 1,
    "type": "dead",
    "size": "A",
    "kg": 5.50,
    "reason": "Found dead during morning inspection",
    "user_id": 1,
    "created_at": "2025-11-19T08:30:00.000000Z",
    "updated_at": "2025-11-19T08:30:00.000000Z",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

---

### 4. Update Loss Adjustment
```http
PUT /api/loss-adjustments/{id}
```

**Description:** Update an existing loss adjustment record.

**Path Parameters:**
- `id` (required, integer): Loss adjustment ID

**Request Body:** (All fields optional)
```json
{
  "date": "2025-11-20",
  "tankId": "tank-2",
  "tankNumber": 2,
  "type": "rotten",
  "size": "B",
  "kg": 6.00,
  "reason": "Updated reason after investigation"
}
```

**Response (200):**
```json
{
  "message": "Loss adjustment updated successfully",
  "data": {
    "id": 1,
    "date": "2025-11-20",
    "tankId": "tank-2",
    "tankNumber": 2,
    "type": "rotten",
    "size": "B",
    "kg": 6.00,
    "reason": "Updated reason after investigation",
    "user_id": 1,
    "created_at": "2025-11-19T08:30:00.000000Z",
    "updated_at": "2025-11-20T09:15:00.000000Z"
  }
}
```

---

### 5. Delete Loss Adjustment
```http
DELETE /api/loss-adjustments/{id}
```

**Description:** Delete a loss adjustment record.

**Path Parameters:**
- `id` (required, integer): Loss adjustment ID

**Response (200):**
```json
{
  "message": "Loss adjustment deleted successfully"
}
```

---

## Loss Reports Endpoints

### 6. Get Loss Summary by Date Range
```http
GET /api/loss-adjustments/summary?start_date=2025-11-01&end_date=2025-11-30
```

**Description:** Get summary of losses within a date range.

**Query Parameters:**
- `start_date` (required, string): Start date in YYYY-MM-DD format
- `end_date` (required, string): End date in YYYY-MM-DD format
- `type` (optional, string): Filter by loss type (dead, rotten, lost)
- `tank_number` (optional, integer): Filter by tank number

**Response (200):**
```json
{
  "data": {
    "period": {
      "start": "2025-11-01",
      "end": "2025-11-30"
    },
    "totalRecords": 45,
    "totalKg": 125.50,
    "byType": {
      "dead": {
        "count": 25,
        "totalKg": 75.50,
        "percentage": 60.16
      },
      "rotten": {
        "count": 15,
        "totalKg": 35.00,
        "percentage": 27.89
      },
      "lost": {
        "count": 5,
        "totalKg": 15.00,
        "percentage": 11.95
      }
    },
    "bySize": {
      "U": {
        "kg": 10.00,
        "count": 5,
        "percentage": 7.97
      },
      "A": {
        "kg": 25.50,
        "count": 10,
        "percentage": 20.32
      },
      "B": {
        "kg": 35.00,
        "count": 15,
        "percentage": 27.89
      },
      "C": {
        "kg": 30.00,
        "count": 10,
        "percentage": 23.90
      },
      "D": {
        "kg": 20.00,
        "count": 3,
        "percentage": 15.94
      },
      "E": {
        "kg": 5.00,
        "count": 2,
        "percentage": 3.98
      }
    },
    "byTank": {
      "1": {
        "count": 10,
        "totalKg": 25.50
      },
      "2": {
        "count": 8,
        "totalKg": 20.00
      },
      "3": {
        "count": 12,
        "totalKg": 30.00
      },
      "4": {
        "count": 7,
        "totalKg": 18.50
      },
      "5": {
        "count": 5,
        "totalKg": 15.00
      },
      "6": {
        "count": 2,
        "totalKg": 8.50
      },
      "7": {
        "count": 1,
        "totalKg": 8.00
      },
      "8": {
        "count": 0,
        "totalKg": 0
      }
    },
    "dailyAverage": {
      "records": 1.5,
      "kg": 4.18
    },
    "records": [
      {
        "id": 1,
        "date": "2025-11-19",
        "tankNumber": 1,
        "type": "dead",
        "size": "A",
        "kg": 5.50,
        "reason": "Found dead during morning inspection"
      }
    ]
  }
}
```

---

### 7. Get Loss Trends
```http
GET /api/loss-adjustments/trends?start_date=2025-11-01&end_date=2025-11-30
```

**Description:** Get daily loss trends for charting and analysis.

**Query Parameters:**
- `start_date` (required, string): Start date in YYYY-MM-DD format
- `end_date` (required, string): End date in YYYY-MM-DD format
- `type` (optional, string): Filter by loss type

**Response (200):**
```json
{
  "data": {
    "daily": [
      {
        "date": "2025-11-01",
        "totalKg": 4.50,
        "dead": 3.00,
        "rotten": 1.50,
        "lost": 0,
        "count": 3
      },
      {
        "date": "2025-11-02",
        "totalKg": 5.20,
        "dead": 4.00,
        "rotten": 0,
        "lost": 1.20,
        "count": 2
      }
    ],
    "weekly": [
      {
        "week": "2025-W45",
        "totalKg": 25.50,
        "averagePerDay": 3.64,
        "count": 15
      }
    ],
    "peakLossDays": [
      {
        "date": "2025-11-15",
        "totalKg": 12.50,
        "count": 8,
        "mainType": "dead"
      }
    ]
  }
}
```

---

### 8. Get Loss by Tank
```http
GET /api/loss-adjustments/by-tank/{tankNumber}?start_date=2025-11-01&end_date=2025-11-30
```

**Description:** Get loss summary for a specific tank.

**Path Parameters:**
- `tankNumber` (required, integer): Tank number (1-8)

**Query Parameters:**
- `start_date` (required, string): Start date in YYYY-MM-DD format
- `end_date` (required, string): End date in YYYY-MM-DD format

**Response (200):**
```json
{
  "data": {
    "tankNumber": 1,
    "period": {
      "start": "2025-11-01",
      "end": "2025-11-30"
    },
    "totalRecords": 10,
    "totalKg": 25.50,
    "byType": {
      "dead": { "count": 6, "kg": 15.00 },
      "rotten": { "count": 3, "kg": 8.50 },
      "lost": { "count": 1, "kg": 2.00 }
    },
    "bySize": {
      "U": { "kg": 2.00, "count": 1 },
      "A": { "kg": 8.50, "count": 3 },
      "B": { "kg": 10.00, "count": 4 },
      "C": { "kg": 5.00, "count": 2 }
    },
    "records": [
      {
        "id": 1,
        "date": "2025-11-19",
        "type": "dead",
        "size": "A",
        "kg": 5.50,
        "reason": "Found dead during morning inspection"
      }
    ]
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
    "tankNumber": [
      "The tank number must be between 1 and 8."
    ],
    "type": [
      "The selected type is invalid."
    ],
    "kg": [
      "The kg must be greater than 0."
    ],
    "size": [
      "The selected size is invalid."
    ]
  }
}
```

---

### Insufficient Stock Error (400)
```json
{
  "message": "Insufficient stock",
  "error": "Tank 1 has only 20.00 kg of size A available, cannot adjust 25.50 kg"
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
  "message": "Loss adjustment not found."
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

### Loss Adjustment
- `date`: Required, valid date (YYYY-MM-DD), cannot be future date
- `tankId`: Required, string
- `tankNumber`: Required, integer, between 1 and 8
- `type`: Required, enum (dead, rotten, lost)
- `size`: Required, enum (U, A, B, C, D, E)
- `kg`: Required, numeric, greater than 0, max 9999.99
- `reason`: Optional, string, max 500 characters

---

## Business Logic Notes

1. **Loss Types**:
   - `dead`: Lobsters found dead in tanks
   - `rotten`: Quality deterioration, unusable lobsters
   - `lost`: Unexplained losses or counting discrepancies

2. **Stock Validation**:
   - System validates that tank has sufficient stock before recording loss
   - Cannot record loss greater than available stock for specific size
   - Loss adjustments automatically deduct from tank inventory

3. **Inventory Impact**:
   - Immediately reduces available stock in specified tank
   - Updates loose stock quantities by size
   - Recorded in system for reporting and audit trail

4. **Reporting Period**:
   - Daily summaries for operational monitoring
   - Weekly/monthly trends for management analysis
   - Tank-specific analysis for identifying problem areas

5. **Audit Trail**:
   - All adjustments logged with user information
   - Timestamps for creation and updates
   - Reason field for documentation

---

## Laravel Backend Implementation

### Controller

```php
<?php

namespace App\Http\Controllers;

use App\Models\LossAdjustment;
use App\Models\Tank;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LossAdjustmentController extends Controller
{
    /**
     * Display a listing of loss adjustments.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = LossAdjustment::with('user:id,name,email');

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('date', [
                $request->start_date,
                $request->end_date
            ]);
        }

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter by tank number
        if ($request->has('tank_number')) {
            $query->where('tankNumber', $request->tank_number);
        }

        $lossAdjustments = $query->latest('date')->get();

        return response()->json([
            'data' => $lossAdjustments,
        ], 200);
    }

    /**
     * Store a newly created loss adjustment.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date|before_or_equal:today',
            'tankId' => 'required|string',
            'tankNumber' => 'required|integer|between:1,8',
            'type' => 'required|in:dead,rotten,lost',
            'size' => 'required|in:U,A,B,C,D,E',
            'kg' => 'required|numeric|min:0.01|max:9999.99',
            'reason' => 'nullable|string|max:500',
        ]);

        DB::beginTransaction();
        try {
            // Validate that tank has sufficient stock
            $tank = Tank::where('tankNumber', $validated['tankNumber'])->first();
            
            if (!$tank) {
                return response()->json([
                    'message' => 'Tank not found',
                ], 404);
            }

            // Check available stock for the specific size
            $sizeField = 'size' . $validated['size'];
            $availableStock = $tank->$sizeField ?? 0;

            if ($availableStock < $validated['kg']) {
                return response()->json([
                    'message' => 'Insufficient stock',
                    'error' => "Tank {$validated['tankNumber']} has only {$availableStock} kg of size {$validated['size']} available, cannot adjust {$validated['kg']} kg",
                ], 400);
            }

            // Create loss adjustment record
            $lossAdjustment = $request->user()->lossAdjustments()->create($validated);

            // Deduct from tank inventory
            $tank->decrement($sizeField, $validated['kg']);
            $tank->decrement('totalKg', $validated['kg']);

            DB::commit();

            return response()->json([
                'message' => 'Loss adjustment created successfully',
                'data' => $lossAdjustment->load('user:id,name,email'),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error creating loss adjustment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified loss adjustment.
     *
     * @param  \App\Models\LossAdjustment  $lossAdjustment
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(LossAdjustment $lossAdjustment)
    {
        return response()->json([
            'data' => $lossAdjustment->load('user:id,name,email'),
        ], 200);
    }

    /**
     * Update the specified loss adjustment.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\LossAdjustment  $lossAdjustment
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, LossAdjustment $lossAdjustment)
    {
        $validated = $request->validate([
            'date' => 'sometimes|date|before_or_equal:today',
            'tankId' => 'sometimes|string',
            'tankNumber' => 'sometimes|integer|between:1,8',
            'type' => 'sometimes|in:dead,rotten,lost',
            'size' => 'sometimes|in:U,A,B,C,D,E',
            'kg' => 'sometimes|numeric|min:0.01|max:9999.99',
            'reason' => 'nullable|string|max:500',
        ]);

        DB::beginTransaction();
        try {
            // If kg or size changed, revert old adjustment and apply new one
            if (isset($validated['kg']) || isset($validated['size'])) {
                $tank = Tank::where('tankNumber', $lossAdjustment->tankNumber)->first();
                
                // Revert old adjustment
                $oldSizeField = 'size' . $lossAdjustment->size;
                $tank->increment($oldSizeField, $lossAdjustment->kg);
                $tank->increment('totalKg', $lossAdjustment->kg);

                // Apply new adjustment
                $newSize = $validated['size'] ?? $lossAdjustment->size;
                $newKg = $validated['kg'] ?? $lossAdjustment->kg;
                $newSizeField = 'size' . $newSize;

                // Validate new adjustment
                $availableStock = $tank->$newSizeField ?? 0;
                if ($availableStock < $newKg) {
                    DB::rollBack();
                    return response()->json([
                        'message' => 'Insufficient stock for updated adjustment',
                        'error' => "Tank {$lossAdjustment->tankNumber} has only {$availableStock} kg of size {$newSize} available",
                    ], 400);
                }

                $tank->decrement($newSizeField, $newKg);
                $tank->decrement('totalKg', $newKg);
            }

            $lossAdjustment->update($validated);

            DB::commit();

            return response()->json([
                'message' => 'Loss adjustment updated successfully',
                'data' => $lossAdjustment->load('user:id,name,email'),
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error updating loss adjustment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified loss adjustment.
     *
     * @param  \App\Models\LossAdjustment  $lossAdjustment
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(LossAdjustment $lossAdjustment)
    {
        DB::beginTransaction();
        try {
            // Restore stock when deleting adjustment
            $tank = Tank::where('tankNumber', $lossAdjustment->tankNumber)->first();
            
            if ($tank) {
                $sizeField = 'size' . $lossAdjustment->size;
                $tank->increment($sizeField, $lossAdjustment->kg);
                $tank->increment('totalKg', $lossAdjustment->kg);
            }

            $lossAdjustment->delete();

            DB::commit();

            return response()->json([
                'message' => 'Loss adjustment deleted successfully',
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error deleting loss adjustment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get loss summary for date range.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function summary(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'type' => 'nullable|in:dead,rotten,lost',
            'tank_number' => 'nullable|integer|between:1,8',
        ]);

        try {
            $query = LossAdjustment::whereBetween('date', [
                $validated['start_date'],
                $validated['end_date']
            ]);

            if (isset($validated['type'])) {
                $query->where('type', $validated['type']);
            }

            if (isset($validated['tank_number'])) {
                $query->where('tankNumber', $validated['tank_number']);
            }

            $records = $query->get();
            $totalKg = $records->sum('kg');
            $totalRecords = $records->count();

            // Calculate days in period
            $startDate = Carbon::parse($validated['start_date']);
            $endDate = Carbon::parse($validated['end_date']);
            $days = $startDate->diffInDays($endDate) + 1;

            $summary = [
                'period' => [
                    'start' => $validated['start_date'],
                    'end' => $validated['end_date'],
                ],
                'totalRecords' => $totalRecords,
                'totalKg' => round($totalKg, 2),
                'byType' => [
                    'dead' => [
                        'count' => $records->where('type', 'dead')->count(),
                        'totalKg' => round($records->where('type', 'dead')->sum('kg'), 2),
                        'percentage' => $totalKg > 0 ? round(($records->where('type', 'dead')->sum('kg') / $totalKg) * 100, 2) : 0,
                    ],
                    'rotten' => [
                        'count' => $records->where('type', 'rotten')->count(),
                        'totalKg' => round($records->where('type', 'rotten')->sum('kg'), 2),
                        'percentage' => $totalKg > 0 ? round(($records->where('type', 'rotten')->sum('kg') / $totalKg) * 100, 2) : 0,
                    ],
                    'lost' => [
                        'count' => $records->where('type', 'lost')->count(),
                        'totalKg' => round($records->where('type', 'lost')->sum('kg'), 2),
                        'percentage' => $totalKg > 0 ? round(($records->where('type', 'lost')->sum('kg') / $totalKg) * 100, 2) : 0,
                    ],
                ],
                'bySize' => [],
                'byTank' => [],
                'dailyAverage' => [
                    'records' => $days > 0 ? round($totalRecords / $days, 2) : 0,
                    'kg' => $days > 0 ? round($totalKg / $days, 2) : 0,
                ],
                'records' => $records,
            ];

            // By size
            foreach (['U', 'A', 'B', 'C', 'D', 'E'] as $size) {
                $sizeRecords = $records->where('size', $size);
                $sizeKg = $sizeRecords->sum('kg');
                $summary['bySize'][$size] = [
                    'kg' => round($sizeKg, 2),
                    'count' => $sizeRecords->count(),
                    'percentage' => $totalKg > 0 ? round(($sizeKg / $totalKg) * 100, 2) : 0,
                ];
            }

            // By tank
            for ($i = 1; $i <= 8; $i++) {
                $tankRecords = $records->where('tankNumber', $i);
                $summary['byTank'][$i] = [
                    'count' => $tankRecords->count(),
                    'totalKg' => round($tankRecords->sum('kg'), 2),
                ];
            }

            return response()->json([
                'data' => $summary,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error retrieving loss summary',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get loss trends over time.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function trends(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'type' => 'nullable|in:dead,rotten,lost',
        ]);

        try {
            $query = LossAdjustment::whereBetween('date', [
                $validated['start_date'],
                $validated['end_date']
            ]);

            if (isset($validated['type'])) {
                $query->where('type', $validated['type']);
            }

            $records = $query->get();

            // Daily breakdown
            $daily = $records->groupBy('date')->map(function ($dayRecords) {
                return [
                    'date' => $dayRecords->first()->date->format('Y-m-d'),
                    'totalKg' => round($dayRecords->sum('kg'), 2),
                    'dead' => round($dayRecords->where('type', 'dead')->sum('kg'), 2),
                    'rotten' => round($dayRecords->where('type', 'rotten')->sum('kg'), 2),
                    'lost' => round($dayRecords->where('type', 'lost')->sum('kg'), 2),
                    'count' => $dayRecords->count(),
                ];
            })->values();

            // Weekly breakdown
            $weekly = $records->groupBy(function ($record) {
                return Carbon::parse($record->date)->format('Y-\WW');
            })->map(function ($weekRecords, $week) {
                $days = $weekRecords->groupBy('date')->count();
                return [
                    'week' => $week,
                    'totalKg' => round($weekRecords->sum('kg'), 2),
                    'averagePerDay' => $days > 0 ? round($weekRecords->sum('kg') / $days, 2) : 0,
                    'count' => $weekRecords->count(),
                ];
            })->values();

            // Peak loss days
            $peakLossDays = $daily->sortByDesc('totalKg')->take(5)->values();

            return response()->json([
                'data' => [
                    'daily' => $daily,
                    'weekly' => $weekly,
                    'peakLossDays' => $peakLossDays,
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error retrieving loss trends',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get loss summary for specific tank.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $tankNumber
     * @return \Illuminate\Http\JsonResponse
     */
    public function byTank(Request $request, $tankNumber)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        try {
            if ($tankNumber < 1 || $tankNumber > 8) {
                return response()->json([
                    'message' => 'Invalid tank number. Must be between 1 and 8.',
                ], 400);
            }

            $records = LossAdjustment::where('tankNumber', $tankNumber)
                ->whereBetween('date', [
                    $validated['start_date'],
                    $validated['end_date']
                ])
                ->get();

            $totalKg = $records->sum('kg');

            $summary = [
                'tankNumber' => $tankNumber,
                'period' => [
                    'start' => $validated['start_date'],
                    'end' => $validated['end_date'],
                ],
                'totalRecords' => $records->count(),
                'totalKg' => round($totalKg, 2),
                'byType' => [
                    'dead' => [
                        'count' => $records->where('type', 'dead')->count(),
                        'kg' => round($records->where('type', 'dead')->sum('kg'), 2),
                    ],
                    'rotten' => [
                        'count' => $records->where('type', 'rotten')->count(),
                        'kg' => round($records->where('type', 'rotten')->sum('kg'), 2),
                    ],
                    'lost' => [
                        'count' => $records->where('type', 'lost')->count(),
                        'kg' => round($records->where('type', 'lost')->sum('kg'), 2),
                    ],
                ],
                'bySize' => [],
                'records' => $records,
            ];

            // By size
            foreach (['U', 'A', 'B', 'C', 'D', 'E'] as $size) {
                $sizeRecords = $records->where('size', $size);
                $summary['bySize'][$size] = [
                    'kg' => round($sizeRecords->sum('kg'), 2),
                    'count' => $sizeRecords->count(),
                ];
            }

            return response()->json([
                'data' => $summary,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error retrieving tank loss summary',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
```

---

### Model

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LossAdjustment extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'date',
        'tankId',
        'tankNumber',
        'type',
        'size',
        'kg',
        'reason',
        'user_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date' => 'date',
        'tankNumber' => 'integer',
        'kg' => 'decimal:2',
    ];

    /**
     * Get the user that recorded this loss adjustment.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope a query to only include losses within a date range.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $startDate
     * @param  string  $endDate
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    /**
     * Scope a query to only include specific loss type.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $type
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope a query to only include specific tank.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  int  $tankNumber
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeForTank($query, $tankNumber)
    {
        return $query->where('tankNumber', $tankNumber);
    }

    /**
     * Get the formatted loss type.
     *
     * @return string
     */
    public function getFormattedTypeAttribute()
    {
        return ucfirst($this->type);
    }

    /**
     * Get loss percentage of total stock (requires tank context).
     *
     * @param  float  $totalStock
     * @return float
     */
    public function getLossPercentage($totalStock)
    {
        if ($totalStock <= 0) {
            return 0;
        }
        return round(($this->kg / $totalStock) * 100, 2);
    }
}
```

---

### Migration

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('loss_adjustments', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('tankId');
            $table->integer('tankNumber');
            $table->enum('type', ['dead', 'rotten', 'lost']);
            $table->enum('size', ['U', 'A', 'B', 'C', 'D', 'E']);
            $table->decimal('kg', 10, 2);
            $table->text('reason')->nullable();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            // Indexes for better query performance
            $table->index('date');
            $table->index('tankNumber');
            $table->index('type');
            $table->index(['date', 'tankNumber']);
            $table->index(['date', 'type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loss_adjustments');
    }
};
```

---

### Add Relationship to User Model

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;

    // ...existing code...

    /**
     * Get the loss adjustments recorded by this user.
     */
    public function lossAdjustments()
    {
        return $this->hasMany(LossAdjustment::class);
    }
}
```

---

### Routes

```php
<?php

// routes/api.php

use App\Http\Controllers\LossAdjustmentController;

Route::middleware('auth:sanctum')->group(function () {
    // Loss Adjustments CRUD
    Route::apiResource('loss-adjustments', LossAdjustmentController::class);
    
    // Loss Reports
    Route::get('loss-adjustments-summary', [LossAdjustmentController::class, 'summary']);
    Route::get('loss-adjustments-trends', [LossAdjustmentController::class, 'trends']);
    Route::get('loss-adjustments-by-tank/{tankNumber}', [LossAdjustmentController::class, 'byTank']);
});
```

---

### Seeder (Optional)

```php
<?php

namespace Database\Seeders;

use App\Models\LossAdjustment;
use App\Models\User;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class LossAdjustmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::first();

        if (!$user) {
            $this->command->warn('No user found. Please create a user first.');
            return;
        }

        $types = ['dead', 'rotten', 'lost'];
        $sizes = ['U', 'A', 'B', 'C', 'D', 'E'];
        $reasons = [
            'Found dead during morning inspection',
            'Quality deterioration observed',
            'Tank temperature issue',
            'Unexplained loss during stock check',
            'Fighting damage',
            'Water quality issue',
            'Natural mortality',
            'Stress from handling',
        ];

        // Create sample loss adjustments for last 30 days
        for ($i = 0; $i < 30; $i++) {
            $recordsPerDay = rand(1, 5);
            
            for ($j = 0; $j < $recordsPerDay; $j++) {
                LossAdjustment::create([
                    'date' => Carbon::now()->subDays($i)->format('Y-m-d'),
                    'tankId' => 'tank-' . rand(1, 8),
                    'tankNumber' => rand(1, 8),
                    'type' => $types[array_rand($types)],
                    'size' => $sizes[array_rand($sizes)],
                    'kg' => rand(10, 100) / 10, // 1.0 to 10.0 kg
                    'reason' => $reasons[array_rand($reasons)],
                    'user_id' => $user->id,
                ]);
            }
        }

        $this->command->info('Loss adjustments seeded successfully!');
    }
}
```

---

## Installation Instructions

### 1. Run Migration
```bash
php artisan migrate
```

### 2. (Optional) Run Seeder
```bash
php artisan db:seed --class=LossAdjustmentSeeder
```

### 3. Test API Endpoints
```bash
# Get all loss adjustments
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/loss-adjustments

# Create loss adjustment
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"date":"2025-11-19","tankId":"tank-1","tankNumber":1,"type":"dead","size":"A","kg":5.5,"reason":"Found dead"}' \
  http://localhost:8000/api/loss-adjustments

# Get summary
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/api/loss-adjustments-summary?start_date=2025-11-01&end_date=2025-11-30"
```

---

## Frontend Integration Status

✅ **POST /api/loss-adjustments** - Ready to integrate with axios in `LossAdjustment.tsx`

**Example Frontend Integration:**
```typescript
// In LossAdjustment.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  setError(null);

  try {
    const response = await axios.post('/api/loss-adjustments', {
      date: formData.date,
      tankId: formData.tankId,
      tankNumber: formData.tankNumber,
      type: formData.type,
      size: formData.size,
      kg: formData.kg,
      reason: formData.reason,
    });

    // Success - record created
    const newLoss: LossAdjustment = response.data.data;
    addLossAdjustment(newLoss);
    setShowForm(false);
    resetForm();
  } catch (err: any) {
    if (err.response?.status === 422) {
      const validationErrors = err.response.data.errors;
      const errorMessage = Object.values(validationErrors).flat().join(', ');
      setError(errorMessage);
    } else if (err.response?.status === 400) {
      setError(err.response.data.error || 'Insufficient stock');
    } else {
      setError('Failed to record loss adjustment');
    }
  } finally {
    setIsSubmitting(false);
  }
};
```

---

## Security Features

✅ **Authentication Required** - All endpoints protected by Sanctum  
✅ **User Authorization** - Records tied to authenticated user  
✅ **Input Validation** - Comprehensive validation rules  
✅ **SQL Injection Protection** - Using Eloquent ORM  
✅ **CSRF Protection** - Via Sanctum cookies  
✅ **Stock Validation** - Prevents negative stock  
✅ **Transaction Safety** - Database transactions for data integrity  
✅ **Audit Trail** - User and timestamp tracking

---

## Next Steps

1. ✅ Backend API implementation complete
2. ⏳ Frontend axios integration
3. ⏳ Real-time stock updates
4. ⏳ Loss alerts and notifications
5. ⏳ Advanced analytics and reporting

---