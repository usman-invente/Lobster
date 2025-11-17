# API Integration Setup

## Axios Configuration

This project uses Axios for API communication with Laravel Sanctum authentication.

### Files Created:
- `src/lib/axios.ts` - Axios instance configuration
- `src/services/authService.ts` - Authentication API service
- `src/services/offloadService.ts` - Offload records API service

## Laravel Sanctum API Endpoints

### Required Backend Routes (Laravel):

```php
// routes/api.php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\OffloadRecordController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Protected routes (requires authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Offload Records
    Route::apiResource('offload-records', OffloadRecordController::class);
    
    // Add your other protected API routes here
});
```

### Laravel Controller Example:

```php
// app/Http/Controllers/Auth/AuthController.php

<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // For SPA authentication
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful',
            'user' => $user,
            'token' => $token,
        ], 201);
    }
}
```

### Offload Records Controller Example:

```php
// app/Http/Controllers/OffloadRecordController.php

<?php

namespace App\Http\Controllers;

use App\Models\OffloadRecord;
use Illuminate\Http\Request;

class OffloadRecordController extends Controller
{
    /**
     * Display a listing of offload records.
     */
    public function index()
    {
        $records = OffloadRecord::with('user')
            ->latest()
            ->get();

        return response()->json([
            'data' => $records,
        ]);
    }

    /**
     * Store a newly created offload record.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'boatName' => 'required|string|max:255',
            'offloadDate' => 'required|date',
            'tripNumber' => 'required|string|max:255',
            'externalFactory' => 'required|string|max:255',
            'totalKgOffloaded' => 'required|numeric|min:0',
            'totalKgReceived' => 'required|numeric|min:0',
            'totalKgDead' => 'required|numeric|min:0',
            'totalKgRotten' => 'required|numeric|min:0',
            'totalKgAlive' => 'required|numeric|min:0',
            'sizeU' => 'required|numeric|min:0',
            'sizeA' => 'required|numeric|min:0',
            'sizeB' => 'required|numeric|min:0',
            'sizeC' => 'required|numeric|min:0',
            'sizeD' => 'required|numeric|min:0',
            'sizeE' => 'required|numeric|min:0',
            'deadOnTanks' => 'nullable|numeric|min:0',
            'rottenOnTanks' => 'nullable|numeric|min:0',
        ]);

        $record = $request->user()->offloadRecords()->create($validated);

        return response()->json([
            'message' => 'Offload record created successfully',
            'data' => $record,
        ], 201);
    }

    /**
     * Display the specified offload record.
     */
    public function show(OffloadRecord $offloadRecord)
    {
        return response()->json([
            'data' => $offloadRecord->load('user'),
        ]);
    }

    /**
     * Update the specified offload record.
     */
    public function update(Request $request, OffloadRecord $offloadRecord)
    {
        $validated = $request->validate([
            'boatName' => 'sometimes|string|max:255',
            'offloadDate' => 'sometimes|date',
            'tripNumber' => 'sometimes|string|max:255',
            'externalFactory' => 'sometimes|string|max:255',
            'totalKgOffloaded' => 'sometimes|numeric|min:0',
            'totalKgReceived' => 'sometimes|numeric|min:0',
            'totalKgDead' => 'sometimes|numeric|min:0',
            'totalKgRotten' => 'sometimes|numeric|min:0',
            'totalKgAlive' => 'sometimes|numeric|min:0',
            'sizeU' => 'sometimes|numeric|min:0',
            'sizeA' => 'sometimes|numeric|min:0',
            'sizeB' => 'sometimes|numeric|min:0',
            'sizeC' => 'sometimes|numeric|min:0',
            'sizeD' => 'sometimes|numeric|min:0',
            'sizeE' => 'sometimes|numeric|min:0',
            'deadOnTanks' => 'nullable|numeric|min:0',
            'rottenOnTanks' => 'nullable|numeric|min:0',
        ]);

        $offloadRecord->update($validated);

        return response()->json([
            'message' => 'Offload record updated successfully',
            'data' => $offloadRecord,
        ]);
    }

    /**
     * Remove the specified offload record.
     */
    public function destroy(OffloadRecord $offloadRecord)
    {
        $offloadRecord->delete();

        return response()->json([
            'message' => 'Offload record deleted successfully',
        ]);
    }
}
```

### Offload Record Model Example:

```php
// app/Models/OffloadRecord.php

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OffloadRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'boatName',
        'offloadDate',
        'tripNumber',
        'externalFactory',
        'totalKgOffloaded',
        'totalKgReceived',
        'totalKgDead',
        'totalKgRotten',
        'totalKgAlive',
        'sizeU',
        'sizeA',
        'sizeB',
        'sizeC',
        'sizeD',
        'sizeE',
        'deadOnTanks',
        'rottenOnTanks',
        'user_id',
    ];

    protected $casts = [
        'offloadDate' => 'date',
        'totalKgOffloaded' => 'decimal:2',
        'totalKgReceived' => 'decimal:2',
        'totalKgDead' => 'decimal:2',
        'totalKgRotten' => 'decimal:2',
        'totalKgAlive' => 'decimal:2',
        'sizeU' => 'decimal:2',
        'sizeA' => 'decimal:2',
        'sizeB' => 'decimal:2',
        'sizeC' => 'decimal:2',
        'sizeD' => 'decimal:2',
        'sizeE' => 'decimal:2',
        'deadOnTanks' => 'decimal:2',
        'rottenOnTanks' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
```

### Database Migration Example:

```php
// database/migrations/xxxx_xx_xx_create_offload_records_table.php

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('offload_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('boatName');
            $table->date('offloadDate');
            $table->string('tripNumber');
            $table->string('externalFactory');
            $table->decimal('totalKgOffloaded', 10, 2);
            $table->decimal('totalKgReceived', 10, 2);
            $table->decimal('totalKgDead', 10, 2);
            $table->decimal('totalKgRotten', 10, 2);
            $table->decimal('totalKgAlive', 10, 2);
            $table->decimal('sizeU', 10, 2)->default(0);
            $table->decimal('sizeA', 10, 2)->default(0);
            $table->decimal('sizeB', 10, 2)->default(0);
            $table->decimal('sizeC', 10, 2)->default(0);
            $table->decimal('sizeD', 10, 2)->default(0);
            $table->decimal('sizeE', 10, 2)->default(0);
            $table->decimal('deadOnTanks', 10, 2)->default(0);
            $table->decimal('rottenOnTanks', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('offload_records');
    }
};
```

### User Model Relationship:

```php
// app/Models/User.php

public function offloadRecords()
{
    return $this->hasMany(OffloadRecord::class);
}
```

### Laravel CORS Configuration:

Update `config/cors.php`:

```php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:5173'], // Your frontend URL
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

### Laravel Sanctum Configuration:

Update `config/sanctum.php`:

```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
    '%s%s',
    'localhost,localhost:3000,localhost:5173,127.0.0.1,127.0.0.1:8000,::1',
    Sanctum::currentApplicationUrlWithPort()
))),
```

### Environment Variables:

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:8000
```

**Backend (.env):**
```env
SESSION_DRIVER=cookie
SANCTUM_STATEFUL_DOMAINS=localhost:5173
SESSION_DOMAIN=localhost
```

## Usage in Frontend

### Authentication Examples:
```typescript
import { authService } from './services/authService';

// Login
const response = await authService.login('user@example.com', 'password');

// Logout
await authService.logout();

// Get Current User
const user = await authService.getCurrentUser();
```

### Offload Records Examples:
```typescript
import { offloadService } from './services/offloadService';

// Get all offload records
const records = await offloadService.getAllOffloadRecords();

// Create offload record
const newRecord = await offloadService.createOffloadRecord({
  boatName: 'Boat A',
  offloadDate: '2025-11-17',
  tripNumber: 'T-001',
  externalFactory: 'Factory X',
  totalKgOffloaded: 500,
  totalKgReceived: 480,
  totalKgDead: 10,
  totalKgRotten: 10,
  totalKgAlive: 460,
  sizeU: 100,
  sizeA: 100,
  sizeB: 100,
  sizeC: 80,
  sizeD: 50,
  sizeE: 30,
  deadOnTanks: 0,
  rottenOnTanks: 0,
});

// Update offload record
const updated = await offloadService.updateOffloadRecord('1', {
  boatName: 'Updated Boat Name',
});

// Delete offload record
await offloadService.deleteOffloadRecord('1');
```

## Configuration

To change the API base URL, update `src/lib/axios.ts`:

```typescript
baseURL: 'http://localhost:8000', // Change to your Laravel API URL
```

Or use environment variable:
```typescript
baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
```

## Features

- ✅ CSRF protection (Laravel Sanctum)
- ✅ Cookie-based authentication
- ✅ Token-based authentication support
- ✅ Automatic token refresh
- ✅ Error handling with proper status codes
- ✅ Request/Response interceptors
- ✅ Automatic 401 handling (redirect to login)
- ✅ Loading states for better UX
- ✅ API error messages display
- ✅ Fallback to local data if API fails

## API Endpoints Summary

### Authentication
- `GET /sanctum/csrf-cookie` - Get CSRF token
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user (protected)
- `GET /api/user` - Get authenticated user (protected)
- `POST /api/register` - Register new user

### Offload Records (Protected)
- `GET /api/offload-records` - Get all offload records
- `POST /api/offload-records` - Create new offload record
- `GET /api/offload-records/{id}` - Get single offload record
- `PUT /api/offload-records/{id}` - Update offload record
- `DELETE /api/offload-records/{id}` - Delete offload record

## Testing Without Backend

The login will attempt to connect to the API. If the backend is not ready:
1. The error will be caught and displayed to the user
2. You can temporarily comment out the API call in `Login.tsx`
3. Or set up mock API responses for testing
