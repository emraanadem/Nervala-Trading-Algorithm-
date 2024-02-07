import PriceStocks
import asyncio
import time
import threading
import json
import msgspec
i = 0

def caller():
    i = 0
    while i == 0:
        try:
            with open('instrument.json', 'rb') as accinf:
                instrum = msgspec.json.decode(accinf.read())
                instrument = instrum['instrument']
            if len(instrument) > 1:
                 break
        except json.decoder.JSONDecodeError:
             q = 0
    
    PriceStocks.loop(instrument)




def controlbox():
    caller()