# API Changes - Geocoding Migration

## Report Endpoint Changes

### GET /api/report

**Before:**
```json
{
  "id": 1,
  "lat": 40.7128,
  "long": -74.0060,
  "pet": { ... },
  "reportedBy": { ... }
}
```

**After:**
```json
{
  "id": 1,
  "lat": 40.7128,
  "long": -74.0060,
  "address": "Broadway, Manhattan, New York",  // NEW FIELD
  "pet": { ... },
  "reportedBy": { ... }
}
```

### POST /api/report

**Request (unchanged):**
```json
{
  "petId": 1,
  "reportTypeId": 1,
  "lat": 40.7128,
  "long": -74.0060,
  "description": "Lost near Central Park"
}
```

**Response (now includes address):**
```json
{
  "id": 1,
  "lat": 40.7128,
  "long": -74.0060,
  "address": "Broadway, Manhattan, New York",  // NEW FIELD
  "description": "Lost near Central Park",
  "pet": { ... },
  "reportedBy": { ... }
}
```

## Frontend Integration

### Old Code (pet-finder/src/store/petStore.ts)
```typescript
// ❌ OLD: Frontend did reverse geocoding
const convertApiReportToStoreReport = async (apiReport: ApiReport): Promise<Report> => {
  const address = await reverseGeocode({
    lat: apiReport.lat,
    lng: apiReport.long
  })
  // ...
}
```

### New Code
```typescript
// ✅ NEW: Use address from API
const convertApiReportToStoreReport = async (apiReport: ApiReport): Promise<Report> => {
  const address = apiReport.address || `${apiReport.lat.toFixed(4)}, ${apiReport.long.toFixed(4)}`
  // ...
}
```

## Backward Compatibility

The `address` field is **optional** (`string | null`), so:
- ✅ Old reports without addresses still work (show coordinates)
- ✅ New reports automatically get addresses
- ✅ Frontend gracefully handles missing addresses
- ✅ Background process fills in missing addresses over time

## Rate Limiting

The backend respects OpenStreetMap Nominatim usage policy:
- **1 request per second** maximum
- Includes proper User-Agent header
- Graceful error handling with coordinate fallback

## Error Handling

If geocoding fails:
1. Address field contains coordinates: `"40.7128, -74.0060"`
2. Error is logged but doesn't block report creation
3. System retries on next fetch if address is missing
4. Frontend displays whatever is in the address field

## Performance Impact

### Before (Frontend Geocoding)
- Dashboard with 20 reports: **20 API calls** to Nominatim
- Load time: ~20 seconds (with rate limiting)
- Every page load triggers geocoding

### After (Backend Geocoding)
- Dashboard with 20 reports: **0 API calls** from frontend
- Load time: ~1 second (database query only)
- Geocoding happens once per report

**Result: ~95% faster dashboard loading** 🚀
