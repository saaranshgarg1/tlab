# Smart Garbage Monitoring System - Python Client

A Python client that simulates a Raspberry Pi with an ultrasonic sensor, sending garbage bin fill level data to the backend server via HTTP REST API.

## 📋 Features

- Simulates ultrasonic sensor readings (0-100% fill level)
- Sends data to backend via HTTP POST requests
- Automatic retry and error handling
- Configurable update intervals
- Graceful shutdown with Ctrl+C

## 🚀 Getting Started

### Prerequisites

- Python 3.6 or higher
- `requests` library

### Installation

1. **Navigate to the RPi directory:**
   ```bash
   cd RPi
   ```

2. **Install required Python packages:**
   ```bash
   pip install requests
   ```

   Or if using a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install requests
   ```

### Configuration

Edit the configuration variables at the top of `py_client.py`:

```python
BACKEND_URL = "http://localhost:5000/api/bins/update"  # Backend API endpoint
BIN_ID = "RASPI-BIN-007"                                # Unique bin identifier
UPDATE_INTERVAL = 15                                    # Seconds between updates
```

**For remote backend:**
```python
BACKEND_URL = "http://your-server-ip:5000/api/bins/update"
```

**For cloud deployment:**
```python
BACKEND_URL = "https://your-domain.com/api/bins/update"
```

## 🏃 Running the Client

**Start the client:**
```bash
python py_client.py
```

Or:
```bash
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

✓ Data sent successfully: Level = 78%
  Status: Filling
Waiting 15 seconds until next reading...
```

**Stop the client:**
Press `Ctrl+C` to gracefully shut down the client.

## 🔧 How It Works

1. **Sensor Simulation**: The `get_simulated_fill_level()` function generates random fill levels (0-100%) to simulate an ultrasonic sensor reading.

2. **Data Transmission**: The `send_data_to_backend()` function:
   - Creates a JSON payload with `binId` and `fillLevel`
   - Sends an HTTP POST request to the backend
   - Handles connection errors and timeouts
   - Prints success/error messages

3. **Main Loop**: The `main()` function:
   - Runs continuously in an infinite loop
   - Gets a new sensor reading every UPDATE_INTERVAL seconds
   - Sends the data to the backend
   - Handles graceful shutdown on Ctrl+C

## 📡 API Communication

**Request sent to backend:**
```json
POST http://localhost:5000/api/bins/update
Content-Type: application/json

{
  "binId": "RASPI-BIN-007",
  "fillLevel": 75
}
```

**Response from backend:**
```json
{
  "success": true,
  "message": "Bin updated successfully",
  "data": {
    "binId": "RASPI-BIN-007",
    "location": "Default Location",
    "fillLevel": 75,
    "status": "Filling",
    "lastUpdated": "2025-11-03T10:30:00.000Z"
  }
}
```

## 🔍 Error Handling

The client handles various error scenarios:

- **Connection Error**: Backend server is not reachable
  ```
  ✗ Backend connection failed. Is the server running?
  ```

- **Timeout**: Server takes too long to respond
  ```
  ✗ Request timeout. Server took too long to respond.
  ```

- **Server Error**: Backend returns an error status
  ```
  ✗ Server returned error: 400
    Message: binId and fillLevel are required
  ```

## 🛠️ Adapting for Real Hardware

To use this with an actual ultrasonic sensor on a Raspberry Pi:

1. **Install GPIO library:**
   ```bash
   pip install RPi.GPIO
   ```

2. **Replace the simulation function:**
   ```python
   import RPi.GPIO as GPIO
   
   TRIG_PIN = 23
   ECHO_PIN = 24
   BIN_HEIGHT = 100  # cm
   
   def get_actual_fill_level():
       """
       Read actual ultrasonic sensor data.
       Returns fill level percentage based on distance measurement.
       """
       # Trigger pulse
       GPIO.output(TRIG_PIN, True)
       time.sleep(0.00001)
       GPIO.output(TRIG_PIN, False)
       
       # Measure echo time
       while GPIO.input(ECHO_PIN) == 0:
           pulse_start = time.time()
       while GPIO.input(ECHO_PIN) == 1:
           pulse_end = time.time()
       
       # Calculate distance
       pulse_duration = pulse_end - pulse_start
       distance = pulse_duration * 17150  # cm
       
       # Calculate fill level
       fill_level = ((BIN_HEIGHT - distance) / BIN_HEIGHT) * 100
       fill_level = max(0, min(100, fill_level))  # Clamp to 0-100
       
       return int(fill_level)
   ```

3. **Update the main loop** to use `get_actual_fill_level()` instead of `get_simulated_fill_level()`.

## 🚦 Running Multiple Clients

To simulate multiple bins, run multiple instances with different BIN_IDs:

**Terminal 1:**
```bash
# Edit BIN_ID to "RASPI-BIN-001"
python py_client.py
```

**Terminal 2:**
```bash
# Edit BIN_ID to "RASPI-BIN-002"
python py_client.py
```

## 📝 Notes

- Ensure the backend server is running before starting the client
- The client will continue running even if the backend is temporarily unavailable
- Check network connectivity if connection errors persist
- For production use, consider implementing reconnection logic and persistent logging

## 🔒 Security Considerations

- Use HTTPS in production environments
- Consider adding API authentication (API keys, tokens)
- Implement TLS/SSL certificate verification
- Avoid hardcoding sensitive credentials

## 📝 License

ISC
