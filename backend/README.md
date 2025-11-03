# Smart Garbage Monitoring System - Backend

A RESTful API backend for monitoring smart garbage bins using Node.js, Express, and MongoDB.

## 📋 Features

- Real-time garbage bin fill level monitoring
- Automatic status determination (Empty, Filling, Full)
- RESTful API endpoints for data management
- MongoDB integration with Mongoose
- CORS enabled for cross-origin requests
- Error handling and validation

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- pnpm package manager

### Installation

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

4. **Edit the `.env` file with your MongoDB connection string:**
   ```env
   MONGO_URI=mongodb://localhost:27017/garbage-monitoring
   PORT=5000
   NODE_ENV=development
   ```

   For MongoDB Atlas, use:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/garbage-monitoring?retryWrites=true&w=majority
   ```

### Running the Server

**Development mode (with auto-reload):**
```bash
pnpm run dev
```

**Production mode:**
```bash
pnpm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### 1. Update Bin Data
**POST** `/api/bins/update`

Update bin fill level or create a new bin.

**Request Body:**
```json
{
  "binId": "RASPI-BIN-007",
  "fillLevel": 75,
  "location": "Main Street Corner" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bin updated successfully",
  "data": {
    "binId": "RASPI-BIN-007",
    "location": "Main Street Corner",
    "fillLevel": 75,
    "status": "Filling",
    "lastUpdated": "2025-11-03T10:30:00.000Z"
  }
}
```

### 2. Get All Bins Status
**GET** `/api/bins/status`

Retrieve status of all bins.

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "binId": "RASPI-BIN-007",
      "location": "Main Street Corner",
      "fillLevel": 75,
      "status": "Filling",
      "lastUpdated": "2025-11-03T10:30:00.000Z"
    }
  ]
}
```

### 3. Get Full Bins
**GET** `/api/bins/full`

Retrieve only bins that are full (status = "Full").

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "binId": "RASPI-BIN-005",
      "location": "Park Avenue",
      "fillLevel": 95,
      "status": "Full",
      "lastUpdated": "2025-11-03T10:25:00.000Z"
    }
  ]
}
```

### 4. Get Specific Bin Status
**GET** `/api/bins/status/:binId`

Retrieve status of a specific bin.

**Example:** `GET /api/bins/status/RASPI-BIN-007`

**Response:**
```json
{
  "success": true,
  "data": {
    "binId": "RASPI-BIN-007",
    "location": "Main Street Corner",
    "fillLevel": 75,
    "status": "Filling",
    "lastUpdated": "2025-11-03T10:30:00.000Z"
  }
}
```

## 📊 Status Logic

The system automatically determines bin status based on fill level:

- **0-60%**: Empty
- **61-80%**: Filling
- **81-100%**: Full

## 🗂️ Project Structure

```
backend/
├── config/
│   └── db.js              # MongoDB connection configuration
├── models/
│   └── GarbageBin.js      # Mongoose schema and model
├── routes/
│   └── api/
│       └── bins.js        # API route handlers
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore rules
├── package.json           # Project dependencies
└── server.js              # Main application entry point
```

## 🧪 Testing the API

You can test the API using curl, Postman, or any HTTP client:

**Example with curl:**
```bash
# Update bin data
curl -X POST http://localhost:5000/api/bins/update \
  -H "Content-Type: application/json" \
  -d '{"binId":"RASPI-BIN-007","fillLevel":75}'

# Get all bins
curl http://localhost:5000/api/bins/status

# Get full bins
curl http://localhost:5000/api/bins/full

# Get specific bin
curl http://localhost:5000/api/bins/status/RASPI-BIN-007
```

## 🔒 Security Notes

- Never commit the `.env` file to version control
- Use strong MongoDB credentials in production
- Consider adding rate limiting for production deployments
- Implement authentication/authorization for production use

## 📝 License

ISC
