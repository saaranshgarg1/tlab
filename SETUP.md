# 🗑️ Smart Garbage Monitoring System

A complete IoT solution for monitoring garbage bin fill levels in real-time. This system consists of a Node.js backend server with MongoDB database and a Python client that simulates or connects to actual sensors on Raspberry Pi devices.

## 🎯 Overview

This system enables municipal waste management by:
- Monitoring garbage bin fill levels in real-time
- Automatically determining bin status (Empty, Filling, Full)
- Providing REST API endpoints for municipal applications
- Enabling data-driven collection route optimization

## 🏗️ System Architecture

```
┌─────────────────────┐
│   Python Client     │
│   (Raspberry Pi)    │
│  - Ultrasonic       │
│    Sensor           │
└──────────┬──────────┘
           │
           │ HTTP POST
           │ (REST API)
           ▼
┌─────────────────────┐
│   Node.js Backend   │
│   - Express.js      │
│   - REST API        │
└──────────┬──────────┘
           │
           │ Mongoose
           ▼
┌─────────────────────┐
│   MongoDB Database  │
│   - Bin Data        │
│   - Status History  │
└─────────────────────┘
           │
           │ HTTP GET
           ▼
┌─────────────────────┐
│  Municipal App      │
│  (Frontend/Mobile)  │
└─────────────────────┘
```

## 📁 Project Structure

```
tlab/
├── backend/                    # Node.js backend server
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── models/
│   │   └── GarbageBin.js      # Mongoose schema
│   ├── routes/
│   │   └── api/
│   │       └── bins.js        # API endpoints
│   ├── .env.example           # Environment template
│   ├── .gitignore
│   ├── package.json
│   ├── README.md
│   └── server.js              # Main entry point
│
├── RPi/                       # Python client for Raspberry Pi
│   ├── py_client.py           # Main client script
│   ├── requirements.txt       # Python dependencies
│   └── README.md
│
└── frontend/                  # (Next.js frontend - separate)
```

## 🚀 Quick Start Guide

### 1️⃣ Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB connection string
   ```

4. **Start the server:**
   ```bash
   pnpm run dev
   ```

   The backend will be available at `http://localhost:5000`

### 2️⃣ Python Client Setup

1. **Navigate to RPi directory:**
   ```bash
   cd RPi
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure the client:**
   Edit `py_client.py` and update:
   ```python
   BACKEND_URL = "http://localhost:5000/api/bins/update"
   BIN_ID = "RASPI-BIN-007"
   UPDATE_INTERVAL = 15
   ```

4. **Run the client:**
   ```bash
   python py_client.py
   ```

## 📡 API Endpoints

### Backend REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bins/update` | Update bin fill level |
| GET | `/api/bins/status` | Get all bins status |
| GET | `/api/bins/full` | Get only full bins |
| GET | `/api/bins/status/:binId` | Get specific bin status |

### Example API Usage

**Update Bin:**
```bash
curl -X POST http://localhost:5000/api/bins/update \
  -H "Content-Type: application/json" \
  -d '{"binId":"RASPI-BIN-007","fillLevel":85}'
```

**Get All Bins:**
```bash
curl http://localhost:5000/api/bins/status
```

**Get Full Bins:**
```bash
curl http://localhost:5000/api/bins/full
```

## 🎯 Status Determination Logic

The system automatically assigns status based on fill level:

| Fill Level | Status | Action Required |
|------------|--------|-----------------|
| 0-60% | Empty | No action needed |
| 61-80% | Filling | Monitor |
| 81-100% | Full | Collection needed |

## 🔧 Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **ODM**: Mongoose
- **Middleware**: CORS, dotenv

### Client
- **Language**: Python 3
- **Libraries**: requests, time, random
- **Platform**: Raspberry Pi (or any Python-supported device)

## 📊 Data Flow

1. **Sensor Reading**: Python client reads ultrasonic sensor (or simulates reading)
2. **Data Transmission**: Client sends fill level via HTTP POST to backend
3. **Data Processing**: Backend validates, determines status, and stores in MongoDB
4. **Status Update**: Database is updated with new fill level and timestamp
5. **Data Retrieval**: Municipal app queries backend for bin statuses
6. **Action**: Collection teams are dispatched to full bins

## 🛠️ Development

### Backend Development

```bash
cd backend
pnpm run dev  # Runs with nodemon for auto-reload
```

### Testing the System

1. Start MongoDB (local or Atlas)
2. Start the backend server
3. Run one or more Python clients
4. Query the API to see updated data

### Multiple Bins Simulation

Run multiple Python clients with different BIN_IDs to simulate a network of bins.

## 🔒 Security Considerations

- ✅ Use environment variables for sensitive data
- ✅ Enable CORS appropriately for production
- ✅ Implement authentication for production APIs
- ✅ Use HTTPS in production
- ✅ Validate and sanitize all inputs
- ✅ Implement rate limiting
- ✅ Use secure MongoDB connections

## 📈 Future Enhancements

- [ ] Real-time dashboard with WebSocket updates
- [ ] Historical data analysis and trends
- [ ] Predictive analytics for collection scheduling
- [ ] Mobile app for collection teams
- [ ] Multi-tenancy support for multiple municipalities
- [ ] Email/SMS alerts for full bins
- [ ] Route optimization for collection vehicles
- [ ] Battery level monitoring for IoT devices
- [ ] Temperature and odor sensors integration

## 🤝 Integration with Frontend

The backend is ready to integrate with any frontend application:

- **React/Next.js**: Use fetch or axios to call API endpoints
- **Mobile Apps**: Use HTTP clients (e.g., axios in React Native)
- **Dashboard**: Visualize data with charts and maps

## 📝 Environment Variables

### Backend (.env)
```env
MONGO_URI=mongodb://localhost:27017/garbage-monitoring
PORT=5000
NODE_ENV=development
```

### Python Client (py_client.py)
```python
BACKEND_URL = "http://localhost:5000/api/bins/update"
BIN_ID = "RASPI-BIN-007"
UPDATE_INTERVAL = 15
```

## 🐛 Troubleshooting

### Backend Issues

**Cannot connect to MongoDB:**
- Verify MongoDB is running
- Check MONGO_URI in .env file
- Ensure network connectivity

**Port already in use:**
- Change PORT in .env file
- Kill process using port 5000

### Client Issues

**Connection refused:**
- Ensure backend server is running
- Check BACKEND_URL is correct
- Verify firewall settings

**Module not found:**
- Run `pip install -r requirements.txt`
- Activate virtual environment if using one

## 📄 License

ISC

## 👨‍💻 Author

Developed as part of the TLab IoT Solutions Project

---

For detailed component documentation, see:
- [Backend README](./backend/README.md)
- [Python Client README](./RPi/README.md)
