import PriceStocks
import asyncio
import time
import threading
import msgspec
import json
i = 0

async def caller():
    i = 0
    while i == 0:
        try:
            with open('instrument.json', 'rb') as accinf:
                instrum = msgspec.json.decode(accinf.read())
                instrument = instrum['instrument']
            if len(instrument) > 1:
                break;
        except json.decoder.JSONDecodeError:
            q = 0
    while i == 0:
        start = time.time()
        try:
            threading.Thread(target=PriceStocks.loop(instrument)).start()
            time.sleep(.25)
        except Exception as error:
            print(error)
        end = time.time()
       ## print(end-start)

def controlbox():
    asyncio.run(caller())

# /* © 2022 Emraan Adem Ibrahim. See the license terms in the file 'license.txt' which should
# have been included with this distribution. */