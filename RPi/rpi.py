#!/usr/bin/env python3
import time
import RPi.GPIO as GPIO
from RPLCD.i2c import CharLCD

# --------- CONFIG ---------
TRIG_PIN = 24      # BCM numbering
ECHO_PIN = 23       # BCM numbering
SOUND_SPEED = 343.2 # m/s at ~20°C; adjust for temp if needed
I2C_ADDR = 0x27     # Common PCF8574 backpack address (try 0x27 or 0x3F)
I2C_PORT = 1        # Pi I2C bus
# --------------------------

def setup_gpio():
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(TRIG_PIN, GPIO.OUT, initial=GPIO.LOW)
    GPIO.setup(ECHO_PIN, GPIO.IN)

def measure_distance(timeout_s=0.03):
    """
    Returns distance in centimeters. Uses timeouts so it won't hang if sensor is unplugged.
    """
    # ensure trigger is low
    GPIO.output(TRIG_PIN, GPIO.LOW)
    time.sleep(0.0002)

    # 10µs trigger pulse
    GPIO.output(TRIG_PIN, GPIO.HIGH)
    time.sleep(10e-6)
    GPIO.output(TRIG_PIN, GPIO.LOW)

    # wait for echo to go HIGH
    start_wait = time.time()
    while GPIO.input(ECHO_PIN) == 0:
        if time.time() - start_wait > timeout_s:
            return None
    t_start = time.time()

    # wait for echo to go LOW
    while GPIO.input(ECHO_PIN) == 1:
        if time.time() - t_start > timeout_s:
            return None
    t_end = time.time()

    # time-of-flight
    tof = t_end - t_start  # seconds
    # distance (one-way) = (tof * speed_of_sound) / 2
    dist_m = (tof * SOUND_SPEED) / 2.0
    return dist_m * 100.0  # cm

def main():
    setup_gpio()
    # Initialize LCD: 16 cols, 2 rows
    lcd = CharLCD('PCF8574', I2C_ADDR, port=I2C_PORT, cols=16, rows=2, charmap='A00', auto_linebreaks=False)
    lcd.clear()
    lcd.write_string("HC-SR04 Ready")
    time.sleep(1)

    try:
        while True:
            # take a few readings and median-filter
            readings = []
            for _ in range(5):
                d = measure_distance()
                if d is not None:
                    readings.append(d)
                time.sleep(0.03)  # small pause between pings

            if readings:
                readings.sort()
                dist_cm = readings[len(readings)//2]
                line1 = "Distance:"
                line2 = "{:6.1f} cm".format(dist_cm)

                # write to LCD
                lcd.cursor_pos = (0, 0)
                lcd.write_string("{:<16}".format(line1[:16]))
                lcd.cursor_pos = (1, 0)
                lcd.write_string("{:<16}".format(line2[:16]))

                # also print to console
                print("Distance: {:.2f} cm".format(dist_cm))
            else:
                # show error if no valid reading
                lcd.cursor_pos = (0, 0)
                lcd.write_string("{:<16}".format("No reading"))
                lcd.cursor_pos = (1, 0)
                lcd.write_string("{:<16}".format("Check wiring"))
                print("No valid reading (timeout)")

            time.sleep(0.2)

    except KeyboardInterrupt:
        pass
    finally:
        lcd.clear()
        lcd.write_string("Bye!")
        time.sleep(0.5)
        GPIO.cleanup()

if __name__ == "__main__":
    main()
