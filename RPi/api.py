"""
Smart Garbage Monitoring System - Python Client
Simulates a Raspberry Pi with ultrasonic sensor sending garbage fill level data
to the backend via HTTP REST API.
"""

import requests
import time
import random
import os

# ==================== CONFIGURATION ====================
BACKEND_URL = f"https://backend-545776890937.asia-southeast1.run.app/api/bins/update"
BIN_ID = "RASPI-BIN-007"
UPDATE_INTERVAL = 5  # seconds
# =======================================================


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
