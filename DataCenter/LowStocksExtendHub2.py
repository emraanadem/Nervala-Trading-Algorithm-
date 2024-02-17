import time
import asyncio
import StocksLowExtend
import json
import msgspec
import threading
class Work:
    dict = {}
    @staticmethod
    def loop(inst):
        Work.callone(inst)
        

    @staticmethod
    def callone(instrument):
        StocksLowExtend.History.Equalizer(instrument)

def controlbox():
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
        Work.loop(instrument)
        
    except Exception as error:
        print(error)
    ends = time.time()
    ## print((ends - end))

# /* © 2022 Emraan Adem Ibrahim. See the license terms in the file 'license.txt' which should
# have been included with this distribution. */