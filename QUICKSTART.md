# 🚀 Quick Start Guide - Smart Garbage Monitoring System

This guide will help you set up and run the complete Smart Garbage Monitoring System in under 5 minutes.

## Prerequisites Check

Before starting, ensure you have:

- ✅ **Node.js** (v14+): Run `node --version`
- ✅ **pnpm**: Run `pnpm --version` (or use npm)
- ✅ **Python 3**: Run `python3 --version`
- ✅ **MongoDB**: Local installation or MongoDB Atlas account
- ✅ **curl**: For testing APIs (optional)

## Step-by-Step Setup

### 🔷 Step 1: Start MongoDB

**Option A - Local MongoDB:**
```bash
# Start MongoDB service
sudo systemctl start mongod
# or
sudo service mongod start
# or
mongod --dbpath ~/data/db
```

**Option B - MongoDB Atlas (Cloud):**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string

### 🔷 Step 2: Set Up Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pnpm install

# Configure environment (already done - .env file exists)
# If using MongoDB Atlas, edit .env and update MONGO_URI

# Start the server
pnpm run dev
```

**Expected output:**
```
Server running on port 5000
Environment: development
MongoDB Connected: localhost
```

The backend is now running at **http://localhost:5000** 🎉

### 🔷 Step 3: Test the Backend

Open a new terminal and test the API:

```bash
# Test root endpoint
curl http://localhost:5000

# Or run the test script
cd backend
./test-api-simple.sh
```

### 🔷 Step 4: Set Up Python Client

Open a new terminal:

```bash
# Navigate to RPi directory
cd RPi

# Install Python dependencies
pip install -r requirements.txt
# or
pip3 install -r requirements.txt

# Run the client
python py_client.py
# or
python3 py_client.py
```

**Expected output:**
```
============================================================
Smart Garbage Monitoring System - Client Started
============================================================
Bin ID: RASPI-BIN-007
Backend URL: http://localhost:5000/api/bins/update
Update Interval: 15 seconds
Press Ctrl+C to stop...
============================================================

✓ Data sent successfully: Level = 42%
  Status: Empty
Waiting 15 seconds until next reading...
```

The client is now sending data every 15 seconds! 🎉

### 🔷 Step 5: View the Data

You can query the backend to see the data:

```bash
# Get all bins
curl http://localhost:5000/api/bins/status

# Get only full bins
curl http://localhost:5000/api/bins/full

# Get specific bin
curl http://localhost:5000/api/bins/status/RASPI-BIN-007
```

## 🎯 What's Happening?

1. **Python Client** simulates a sensor and sends fill level data
2. **Backend Server** receives the data, determines status, and stores in MongoDB
3. **MongoDB** persists the bin data
4. **You** can query the API to see real-time bin status

## 📊 Testing Different Scenarios

### Simulate Multiple Bins

Run multiple Python clients with different BIN_IDs:

**Terminal 1:**
```bash
cd RPi
# Edit py_client.py and change BIN_ID to "RASPI-BIN-001"
python py_client.py
```

**Terminal 2:**
```bash
cd RPi
# Edit py_client.py and change BIN_ID to "RASPI-BIN-002"
python py_client.py
```

**Terminal 3:**
```bash
cd RPi
# Edit py_client.py and change BIN_ID to "RASPI-BIN-003"
python py_client.py
```

Now query the API to see all three bins:
```bash
curl http://localhost:5000/api/bins/status
```

### Test Different Fill Levels

The client generates random fill levels (0-100%). The backend automatically assigns status:

- **0-60%**: Empty 🟢
- **61-80%**: Filling 🟡
- **81-100%**: Full 🔴

## 🛠️ Troubleshooting

### Issue: Cannot connect to MongoDB

**Solution:**
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Or use MongoDB Atlas connection string in .env
```

### Issue: Port 5000 already in use

**Solution:**
```bash
# Change PORT in backend/.env
PORT=3000

# Or kill the process using port 5000
lsof -ti:5000 | xargs kill -9
```

### Issue: Python module 'requests' not found

**Solution:**
```bash
# Install requests
pip install requests

# Or use the requirements file
pip install -r requirements.txt
```

### Issue: Backend connection failed (Python client)

**Solution:**
- Ensure backend is running on port 5000
- Check BACKEND_URL in py_client.py
- Verify firewall settings

## 📡 API Quick Reference

### Create/Update Bin
```bash
curl -X POST http://localhost:5000/api/bins/update \
  -H "Content-Type: application/json" \
  -d '{"binId":"BIN-001","fillLevel":75}'
```

### Get All Bins
```bash
curl http://localhost:5000/api/bins/status
```

### Get Full Bins
```bash
curl http://localhost:5000/api/bins/full
```

### Get Specific Bin
```bash
curl http://localhost:5000/api/bins/status/BIN-001
```

## 🎨 Next Steps

1. **Build a Dashboard**: Create a frontend to visualize the data
2. **Add Real Sensors**: Connect actual ultrasonic sensors to Raspberry Pi
3. **Deploy to Cloud**: Deploy backend to Heroku, AWS, or similar
4. **Add Notifications**: Send alerts when bins are full
5. **Optimize Routes**: Use bin locations to optimize collection routes

## 📚 Additional Resources

- [Backend README](./backend/README.md) - Detailed backend documentation
- [Python Client README](./RPi/README.md) - Detailed client documentation
- [SETUP.md](./SETUP.md) - Complete system overview

## 🎉 Congratulations!

You now have a fully functional Smart Garbage Monitoring System running! The system is:

✅ Collecting simulated sensor data  
✅ Storing data in MongoDB  
✅ Providing REST API endpoints  
✅ Auto-determining bin status  

Ready for integration with a frontend dashboard or mobile app!

---

Need help? Check the troubleshooting section or refer to the detailed READMEs.
