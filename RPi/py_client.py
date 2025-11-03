"""
Smart Garbage Monitoring System - Python Client
Simulates a Raspberry Pi with ultrasonic sensor sending garbage fill level data
to the backend via HTTP REST API.
"""

import requests
import time
import random

# ==================== CONFIGURATION ====================
BACKEND_URL = "http://localhost:5000/api/bins/update"
BIN_ID = "RASPI-BIN-007"
UPDATE_INTERVAL = 15  # seconds
# =======================================================


def get_simulated_fill_level():
    """
    Simulate an ultrasonic sensor reading.
    Returns a random fill level between 0 and 100.
    
    Returns:
        int: Simulated fill level percentage (0-100)
    """
    return random.randint(0, 100)


def send_data_to_backend(level):
    """
    Send the fill level data to the backend server via HTTP POST.
    
    Args:
        level (int): Fill level percentage (0-100)
    
    Returns:
        bool: True if successful, False otherwise
    """
    # Construct the JSON payload
    payload = {
        "binId": BIN_ID,
        "fillLevel": level
    }
    
    try:
        # Make HTTP POST request to backend
        response = requests.post(
            BACKEND_URL,
            json=payload,
            timeout=10  # 10 second timeout
        )
        
        # Check if request was successful
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Data sent successfully: Level = {level}%")
            print(f"  Status: {data['data']['status']}")
            return True
        else:
            print(f"✗ Server returned error: {response.status_code}")
            print(f"  Message: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("✗ Backend connection failed. Is the server running?")
        return False
    except requests.exceptions.Timeout:
        print("✗ Request timeout. Server took too long to respond.")
        return False
    except requests.exceptions.RequestException as e:
        print(f"✗ Network error occurred: {e}")
        return False
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
        return False


def main():
    """
    Main function that runs the monitoring loop.
    Continuously reads sensor data and sends it to the backend.
    """
    print("=" * 60)
    print("Smart Garbage Monitoring System - Client Started")
    print("=" * 60)
    print(f"Bin ID: {BIN_ID}")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Update Interval: {UPDATE_INTERVAL} seconds")
    print("Press Ctrl+C to stop...")
    print("=" * 60)
    print()
    
    try:
        while True:
            # Get simulated sensor reading
            fill_level = get_simulated_fill_level()
            
            # Send data to backend
            send_data_to_backend(fill_level)
            
            # Wait before next reading
            print(f"Waiting {UPDATE_INTERVAL} seconds until next reading...\n")
            time.sleep(UPDATE_INTERVAL)
            
    except KeyboardInterrupt:
        print("\n" + "=" * 60)
        print("Client stopped by user (Ctrl+C)")
        print("=" * 60)


if __name__ == "__main__":
    main()
