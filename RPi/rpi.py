#!/usr/bin/env python3
import time
import RPi.GPIO as GPIO
from RPLCD.i2c import CharLCD
from api import send_data_to_backend
from wificheck import get_current_wifi_ssid

# --------- CONFIG ---------
TRIG_PIN = 24       # BCM numbering
ECHO_PIN = 23       # BCM numbering
SOUND_SPEED = 343.2 # m/s at ~20°C
I2C_PORT = 1        # Pi I2C bus
# --------------------------

POSSIBLE_I2C_ADDRS = [0x27, 0x3F, 0x20, 0x3E]

def setup_gpio():
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(TRIG_PIN, GPIO.OUT, initial=GPIO.LOW)
    GPIO.setup(ECHO_PIN, GPIO.IN)

def measure_distance(timeout_s=0.03):
    # ensure trigger is low
    GPIO.output(TRIG_PIN, GPIO.LOW)
    time.sleep(0.0002)

    GPIO.output(TRIG_PIN, GPIO.HIGH)
    time.sleep(10e-6)
    GPIO.output(TRIG_PIN, GPIO.LOW)

    # wait for echo high
    start_wait = time.time()
    while GPIO.input(ECHO_PIN) == 0:
        if time.time() - start_wait > timeout_s:
            return None
    t_start = time.time()

    # wait for echo low
    while GPIO.input(ECHO_PIN) == 1:
        if time.time() - t_start > timeout_s:
            return None
    t_end = time.time()

    tof = t_end - t_start
    dist_m = (tof * SOUND_SPEED) / 2.0
    return dist_m * 100.0  # cm

def init_lcd():
    last_err = None
    for addr in POSSIBLE_I2C_ADDRS:
        try:
            for cmap in ('A00', 'A02'):
                lcd = CharLCD(
                    i2c_expander='PCF8574',
                    address=addr,
                    port=I2C_PORT,
                    cols=16,
                    rows=2,
                    charmap=cmap,
                    auto_linebreaks=False
                )
                lcd.backlight_enabled = True
                lcd.clear()
                lcd.home()
                # quick test to confirm it’s alive
                lcd.write_string("LCD @0x%02X %s" % (addr, cmap))
                time.sleep(0.5)
                lcd.clear()
                return lcd
        except Exception as e:
            last_err = e
            continue
    # If we get here, nothing worked
    raise RuntimeError(f"Could not init I2C LCD. Last error: {last_err}")

def lcd_write_two_lines(lcd, line1, line2):
    # Always clear first to avoid leftover chars
    lcd.clear()
    lcd.home()
    lcd.cursor_pos = (0, 0)
    lcd.write_string("{:<16}".format(line1[:16]))
    lcd.cursor_pos = (1, 0)
    lcd.write_string("{:<16}".format(line2[:16]))
    
def scroll_text(lcd, text, row, delay=0.2, cols=16):
    if len(text) <= cols:
        lcd.cursor_pos = (row, 0)
        lcd.write_string("{:<16}".format(text))
        return

    display_text = text + " " * cols
    
    for i in range(len(display_text) - cols + 1):
        lcd.cursor_pos = (row, 0)
        # Slice the string to get the current 16 chars
        lcd.write_string(display_text[i : i + cols])
        time.sleep(delay)
    

def main():
    setup_gpio()
    lcd = None
    
    try:
        lcd = init_lcd()
        lcd_write_two_lines(lcd, "HC-SR04 Ready", "Measuring...")
        time.sleep(0.03)
        try: 
            lcd_write_two_lines(lcd, "Connected to: ", str(get_current_wifi_ssid()))
        except:
            lcd_write_two_lines(lcd, "Not connected", "")
        time.sleep(0.1)
        
        arr = []

        while True:
            # check wifi connection:
            
            # median of a few samples
            readings = []
            for _ in range(5):
                d = measure_distance()
                if d is not None:
                    readings.append(d)
                time.sleep(0.03)

            if readings:
                readings.sort()
                dist_cm = readings[len(readings)//2]
                fill_pct = 100-dist_cm/0.3
                
                if fill_pct <= 0: 
                    lcd_write_two_lines(lcd, "Sensor blocked", "Please shake the dustbin")
                    time.sleep(0.1)
                else: 
                    arr.append(fill_pct)
                    if len(arr)>5: 
                        arr = arr[1:]
                    
                line1 = "   Fill level:"
                line2 = "    {:6.1f}%".format(sum(arr)/5)
                lcd_write_two_lines(lcd, line1, line2)
                send_data_to_backend(round(sum(arr)/5, 2))
                print("Fill level {:6.1f}".format(sum(arr)/5))
            else:
                lcd_write_two_lines(lcd, "No reading", "Check wiring")
                print("No valid reading (timeout)")

            time.sleep(0.2)

    except KeyboardInterrupt:
        pass
    except Exception as e:
        print("LCD/Program error:", e)
        if lcd:
            lcd_write_two_lines(lcd, "LCD error", "See console")
            time.sleep(1.5)
    finally:
        if lcd:
            try:
                lcd_write_two_lines(lcd, "Shutting down", "Bye!")
                time.sleep(1.0)
                lcd.clear()
                lcd.backlight_enabled = True  
                lcd.close(clear=True)
            except Exception:
                pass
        GPIO.cleanup()

if __name__ == "__main__":
    main()
