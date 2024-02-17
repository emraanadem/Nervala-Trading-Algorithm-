import time
import asyncio
import msgspec
import StocksOpenExtend
import json
import threading
class Work:
    dict = {}
    @staticmethod
    def loop(inst):
        threading.Thread(target=Work.callone(inst)).start()
    

    @staticmethod
    def callone(instrument):
        StocksOpenExtend.History.Equalizer(instrument)

def controlbox():
    i = 0
    while i == 0:
        try:
            with open('instrument.json', 'r') as inst:
                instrum = json.load(inst)
                instrument = instrum['instrument']
            if len(instrument) > 1:
                break
        except json.decoder.JSONDecodeError:
            q = 0
    while i == 0:
        end = time.time()
        try:
            Work.loop(instrument)
        except Exception as error:
            print(error)
        ends = time.time()
        ## print((ends - end))

# /* © 2022 Emraan Adem Ibrahim. See the license terms in the file 'license.txt' which should
# have been included with this distribution. */