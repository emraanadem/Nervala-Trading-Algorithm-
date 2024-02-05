import Price
import asyncio
import time
import threading
import json
import msgspec
i = 0

async def caller():
    i = 0
    while i == 0:
        with open('instrument.json', 'rb') as accinf:
            instrum = msgspec.json.decode(accinf.read())
            instrument = instrum['instrument']
        if len(instrument) > 1:
            break
        
    while i == 0:
        start = time.time()
        Price.loop(instrument)
        time.sleep(.25)
        break
        end = time.time()
        ## print(end-start)

def controlbox():
    asyncio.run(caller())

controlbox()