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
            with open('instrument.json', 'r') as accinf:
                instrum = json.load(accinf)
                instrument = instrum['instrument']
            if len(instrument) > 1:
                 break
        except json.decoder.JSONDecodeError:
             q = 0
    
    PriceStocks.loop(instrument)




def controlbox():
    caller()