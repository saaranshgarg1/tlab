# Smart Garbage Monitoring System - Complete API Documentation

## Overview

This API provides comprehensive endpoints for managing smart garbage bins, including real-time monitoring, historical analytics, collection scheduling, and user reviews.

**Base URL:** `http://localhost:5000`

**Version:** 2.0.0

---

## Table of Contents

1. [Bin Management](#bin-management)
2. [Bin Operations](#bin-operations)
3. [History & Analytics](#history--analytics)
4. [Reviews](#reviews)
5. [Collections](#collections)
6. [Analytics](#analytics)

---

## Bin Management

### Create New Bin (Admin)

**POST** `/api/bins`

Create a new garbage bin in the system.

**Request Body:**
```json
{
  "binId": "BIN-001",
  "location": "Main Street Corner",
  "lat": 40.7128,
  "lng": -74.0060,
  "label": "Downtown Bin #1",
  "threshold": 70
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Bin created successfully",
  "data": {
    "binId": "BIN-001",
    "location": "Main Street Corner",
    "lat": 40.7128,
    "lng": -74.0060,
    "label": "Downtown Bin #1",
    "threshold": 70,
    "fillLevel": 0,
    "status": "Empty",
    "maintenanceFlag": false,
    "stats": {
      "totalCollections": 0,
      "averageFillRate": 0,
      "totalReviews": 0,
      "averageRating": 0
    },
    "lastUpdated": "2025-11-03T10:00:00.000Z",
    "createdAt": "2025-11-03T10:00:00.000Z"
  }
}
```

---

### Update Bin Fill Level

**POST** `/api/bins/update`

Update bin fill level. **Automatically schedules collection if fillLevel > threshold and no collection is already scheduled.**

**Request Body:**
```json
{
  "binId": "BIN-001",
  "fillLevel": 75,
  "location": "Main Street Corner"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Bin updated successfully",
  "data": {
    "binId": "BIN-001",
    "fillLevel": 75,
    "status": "Filling",
    "lastUpdated": "2025-11-03T10:30:00.000Z",
    ...
  },
  "collectionScheduled": true
}
```

**Features:**
- Creates bin if doesn't exist (upsert)
- Auto-determines status based on fill level
- Saves history entry for analytics
- Auto-schedules collection if fillLevel > threshold

---

### Get All Bins

**GET** `/api/bins/status`

Retrieve status of all bins.

**Response (200):**
```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "binId": "BIN-001",
      "location": "Main Street",
      "fillLevel": 75,
      "status": "Filling",
      "threshold": 60,
      "lat": 40.7128,
      "lng": -74.0060,
      "maintenanceFlag": false,
      "stats": { ... },
      "lastUpdated": "2025-11-03T10:30:00.000Z"
    },
    ...
  ]
}
```

---

### Get Specific Bin

**GET** `/api/bins/status/:binId`

Get detailed status of a specific bin.

**Example:** `GET /api/bins/status/BIN-001`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "binId": "BIN-001",
    "location": "Main Street",
    "fillLevel": 75,
    "status": "Filling",
    "threshold": 60,
    "lat": 40.7128,
    "lng": -74.0060,
    "label": "Downtown Bin #1",
    "maintenanceFlag": false,
    "stats": {
      "totalCollections": 15,
      "averageFillRate": 12.5,
      "lastCollectionDate": "2025-11-01T09:00:00.000Z",
      "totalReviews": 23,
      "averageRating": 4.2
    },
    "lastUpdated": "2025-11-03T10:30:00.000Z",
    "createdAt": "2025-10-01T08:00:00.000Z"
  }
}
```

---

### Get Full Bins

**GET** `/api/bins/full`

Get all bins where `fillLevel >= threshold` (requiring collection).

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "binId": "BIN-003",
      "fillLevel": 95,
      "threshold": 60,
      "status": "Full",
      "location": "Park Avenue",
      ...
    },
    ...
  ]
}
```

---

### Update Bin Metadata (Admin)

**PUT** `/api/bins/:binId`

Update bin configuration and metadata.

**Request Body:**
```json
{
  "location": "Updated Location",
  "lat": 40.7580,
  "lng": -73.9855,
  "label": "Updated Label",
  "threshold": 75,
  "maintenanceFlag": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Bin updated successfully",
  "data": { ... }
}
```

---

### Delete Bin (Admin)

**DELETE** `/api/bins/:binId`

Delete a bin and all related data (history, collections, reviews).

**Response (200):**
```json
{
  "success": true,
  "message": "Bin and related data deleted successfully",
  "data": { ... }
}
```

---

## History & Analytics

### Get Bin Fill Level History

**GET** `/api/bins/:binId/history`

Get time-series fill level data for charts and analytics.

**Query Parameters:**
- `from` - Start date (ISO format, e.g., `2025-10-01`)
- `to` - End date (ISO format, e.g., `2025-10-31`)
- `interval` - Grouping interval: `hour`, `day`, `week` (default: `hour`)

**Example:** `GET /api/bins/BIN-001/history?from=2025-10-01&to=2025-10-31&interval=day`

**Response (200):**
```json
{
  "success": true,
  "binId": "BIN-001",
  "series": [
    {
      "ts": "2025-10-01T00:00:00.000Z",
      "fill": 25,
      "status": "Empty"
    },
    {
      "ts": "2025-10-02T00:00:00.000Z",
      "fill": 45,
      "status": "Empty"
    },
    {
      "ts": "2025-10-03T00:00:00.000Z",
      "fill": 72,
      "status": "Filling"
    },
    ...
  ]
}
```

**Use Cases:**
- Line charts showing fill level over time
- Trend analysis
- Predicting when bins will be full
- Identifying patterns in bin usage

---

## Reviews

### Submit Review

**POST** `/api/bins/:binId/review`

Submit a cleanliness review for a bin.

**Request Body:**
```json
{
  "stars": 4,
  "text": "Bin is well-maintained and clean!",
  "name_of_user": "John Doe"
}
```

**Validation:**
- `stars`: Required, 1-5
- `name_of_user`: Required
- `text`: Optional, max 1000 characters

**Response (201):**
```json
{
  "success": true,
  "message": "Review submitted successfully",
  "data": {
    "_id": "...",
    "binId": "BIN-001",
    "stars": 4,
    "text": "Bin is well-maintained and clean!",
    "name_of_user": "John Doe",
    "createdAt": "2025-11-03T10:45:00.000Z"
  }
}
```

**Side Effects:**
- Updates bin's `stats.totalReviews`
- Recalculates bin's `stats.averageRating`

---

### Get Reviews for Bin

**GET** `/api/bins/:binId/reviews`

Get all reviews for a specific bin.

**Query Parameters:**
- `limit` - Max number of reviews to return (default: 50)

**Example:** `GET /api/bins/BIN-001/reviews?limit=20`

**Response (200):**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "_id": "...",
      "binId": "BIN-001",
      "stars": 5,
      "text": "Very clean!",
      "name_of_user": "Jane Smith",
      "createdAt": "2025-11-03T09:30:00.000Z"
    },
    ...
  ]
}
```

---

## Collections

### Get Collection Schedule

**GET** `/api/bins/:binId/collection`

Get all scheduled and completed collections for a bin.

**Query Parameters:**
- `status` - Filter by status: `Scheduled`, `In Progress`, `Completed`, `Cancelled`

**Example:** `GET /api/bins/BIN-001/collection?status=Scheduled`

**Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "...",
      "binId": "BIN-001",
      "scheduledDate": "2025-11-04T09:00:00.000Z",
      "status": "Scheduled",
      "fillLevelAtSchedule": 75,
      "autoScheduled": true,
      "createdAt": "2025-11-03T10:30:00.000Z"
    },
    {
      "_id": "...",
      "binId": "BIN-001",
      "scheduledDate": "2025-11-01T09:00:00.000Z",
      "status": "Completed",
      "fillLevelAtSchedule": 85,
      "fillLevelAtCollection": 90,
      "collectedBy": "Team A",
      "completedAt": "2025-11-01T10:15:00.000Z",
      "autoScheduled": false
    },
    ...
  ]
}
```

---

## Analytics

### Get Summary Analytics

**GET** `/api/analytics/summary`

Get comprehensive KPIs and aggregated statistics.

**Query Parameters:**
- `from` - Start date (ISO format)
- `to` - End date (ISO format)

**Example:** `GET /api/analytics/summary?from=2025-10-01&to=2025-10-31`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalBins": 50,
      "emptyBins": 20,
      "fillingBins": 15,
      "fullBins": 12,
      "maintenanceBins": 3,
      "binsRequiringAttention": 15,
      "averageFillLevel": 62
    },
    "collections": {
      "total": 145,
      "scheduled": 12,
      "inProgress": 2,
      "completed": 128,
      "avgInterval": 3
    },
    "reviews": {
      "total": 342,
      "averageRating": 4.1
    },
    "distribution": {
      "0-20": 8,
      "21-40": 12,
      "41-60": 10,
      "61-80": 14,
      "81-100": 6
    },
    "topRatedBins": [
      {
        "binId": "BIN-023",
        "location": "Central Park",
        "rating": 4.8,
        "reviews": 45
      },
      ...
    ],
    "urgentBins": [
      {
        "binId": "BIN-007",
        "location": "Main Square",
        "fillLevel": 95,
        "status": "Full",
        "maintenanceFlag": false
      },
      ...
    ],
    "trends": [
      {
        "date": "2025-10-27",
        "averageFill": 58,
        "updates": 120
      },
      {
        "date": "2025-10-28",
        "averageFill": 62,
        "updates": 115
      },
      ...
    ]
  },
  "period": {
    "from": "2025-10-01",
    "to": "2025-10-31"
  }
}
```

**Use Cases:**
- Dashboard overview
- Executive reports
- Real-time monitoring
- Trend identification
- Resource allocation

---

### Get Collection Statistics

**GET** `/api/analytics/collection-stats`

Get detailed statistics about collections.

**Query Parameters:**
- `from` - Start date
- `to` - End date

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total": 145,
    "byStatus": {
      "Scheduled": 12,
      "In Progress": 2,
      "Completed": 128,
      "Cancelled": 3
    },
    "scheduling": {
      "autoScheduled": 98,
      "manualScheduled": 47
    },
    "avgFillAtCollection": 87
  }
}
```

---

## Status Codes

- **200** - Success
- **201** - Created
- **400** - Bad Request (validation error)
- **404** - Not Found
- **500** - Server Error

---

## Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (development only)"
}
```

---

## Data Models

### GarbageBin
```javascript
{
  binId: String (unique),
  location: String,
  lat: Number,
  lng: Number,
  fillLevel: Number (0-100),
  status: Enum ['Empty', 'Filling', 'Full', 'Error'],
  threshold: Number (default: 60),
  maintenanceFlag: Boolean,
  label: String,
  stats: {
    totalCollections: Number,
    averageFillRate: Number,
    lastCollectionDate: Date,
    totalReviews: Number,
    averageRating: Number
  },
  lastUpdated: Date,
  createdAt: Date
}
```

### Collection
```javascript
{
  binId: String,
  scheduledDate: Date,
  status: Enum ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
  fillLevelAtSchedule: Number,
  fillLevelAtCollection: Number,
  collectedBy: String,
  completedAt: Date,
  notes: String,
  autoScheduled: Boolean,
  createdAt: Date
}
```

### Review
```javascript
{
  binId: String,
  stars: Number (1-5),
  text: String,
  name_of_user: String,
  createdAt: Date
}
```

### History
```javascript
{
  binId: String,
  fillLevel: Number,
  status: String,
  timestamp: Date
}
```

---

## Key Features

### ✅ Auto-Scheduling
- Collections automatically scheduled when fillLevel > threshold
- Prevents duplicate scheduling
- Scheduled for 9 AM next day

### ✅ History Tracking
- Every fill level update is logged
- Enables time-series analytics
- Supports date range queries

### ✅ Smart Statistics
- Auto-calculated averages
- Real-time KPIs
- Distribution analysis

### ✅ User Reviews
- Community feedback on cleanliness
- Auto-updates bin ratings
- Identifies top-performing bins

---

## Frontend Integration Examples

### Fetch All Bins (React)
```javascript
const response = await fetch('http://localhost:5000/api/bins/status');
const { data } = await response.json();
// data contains array of all bins
```

### Create Review (React)
```javascript
await fetch(`http://localhost:5000/api/bins/${binId}/review`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    stars: 5,
    text: 'Very clean!',
    name_of_user: 'John Doe'
  })
});
```

### Get Analytics for Dashboard
```javascript
const response = await fetch('http://localhost:5000/api/analytics/summary');
const { data } = await response.json();
// Use data.overview, data.trends, etc. for charts
```

---

## Testing

Use the included test script:
```bash
cd backend
./test-api-simple.sh
```

Or use curl:
```bash
# Create a bin
curl -X POST http://localhost:5000/api/bins \
  -H "Content-Type: application/json" \
  -d '{"binId":"TEST-001","lat":40.7128,"lng":-74.0060,"threshold":70}'

# Get analytics
curl http://localhost:5000/api/analytics/summary
```

---

## Notes

- All dates are in ISO 8601 format
- Timestamps are in UTC
- Fill levels are percentages (0-100)
- Auto-scheduling happens at threshold crossing
- History is saved automatically on every update
