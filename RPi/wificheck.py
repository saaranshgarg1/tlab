import subprocess
import sys

def get_current_wifi_ssid():
    """
    Checks the currently connected WiFi SSID using native Linux commands.
    Tries 'iwgetid' first (standard on RPi), then falls back to 'nmcli'.
    """
    try:
        output = subprocess.check_output(
            ['nmcli', '-t', '-f', 'NAME', 'connection', 'show', '--active'], 
            text=True
        ).strip()
        if output:
            return output.split('\n')[0] # Return the first active connection
    except (FileNotFoundError, subprocess.CalledProcessError):
        pass

    return None