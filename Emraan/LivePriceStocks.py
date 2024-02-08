import PriceStocks
import asyncio
import time
import threading
import msgspec
import json
i = 0


def caller():
    i = 0
    while i == 0:
        try:
            with open('instrument.json', 'r') as accinf:
                instrum = json.load(accinf)
                instrument = instrum['instrument']
            if len(instrument) > 1:
                break
        except json.decoder.JSONDecodeError:
            q = 0
        try:
            threading.Thread(target=PriceStocks.loop(instrument)).start()
        except Exception as error:
            q = 0
       ## print(end-start)

def controlbox():
    caller()

# /* © 2022 Emraan Adem Ibrahim. See the license terms in the file 'license.txt' which should
# have been included with this distribution. */