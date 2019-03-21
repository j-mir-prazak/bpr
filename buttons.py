#!/usr/bin/python3
from random import randint
from time import sleep
import sys



print("system:connected")
sys.stdout.flush()
sleep(0.5)
print("system:buttons:3")
sys.stdout.flush()
sleep(0.5)

button0 = 0
button1 = 0
button2 = 0


while 1:

    irand0 = randint(0,999)
    irand1 = randint(0,999)
    irand2 = randint(0,999)

    if irand0 > 690:
        button0 = 1

    if irand1 > 990:
        button1 = 1

    if irand2 > 690:
        button2 = 1

    if (button0 + button1 + button2) > 0:
        print("buttons:" + str(button0) + ":" + str(button1) + ":" + str(button2) )
        sys.stdout.flush()

    button0 = 0
    button1 = 0
    button2 = 0
    sleep(0.01)
