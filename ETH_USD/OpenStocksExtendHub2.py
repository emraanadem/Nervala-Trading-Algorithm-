import time
import asyncio
import StocksOpenExtend
import json
import threading
import msgspec

class Work:
    dict = {}
    @staticmethod
    def loop(inst):
        Work.callone(inst)
        # Create JSON Object
        dict_as_json = json.dumps(Work.dict)
        # Write the JSON object created from our dictionary to the file data.json
        with open("OpenExtend.json", "w+") as outfile:
            outfile.truncate()
            outfile.write(dict_as_json)
        Work.dict.clear()

    @staticmethod
    def callone(instrument):
        StocksOpenExtend.History.Equalizer(instrument)
        Work.dict[instrument] = {"Five_Min" : [], "Fifteen_Min" : [], "Thirty_Min" : [], "One_Hour" : [], "Two_Hour" : [], "Four_Hour" : [], "Daily" : [], "Weekly" : []}
        Work.dict[instrument]["Five_Min"] = StocksOpenExtend.History.five
        Work.dict[instrument]["Fifteen_Min"] = StocksOpenExtend.History.fifteen
        Work.dict[instrument]["Thirty_Min"] = StocksOpenExtend.History.thirty
        Work.dict[instrument]["One_Hour"] = StocksOpenExtend.History.hour
        Work.dict[instrument]["Two_Hour"] = StocksOpenExtend.History.twohour
        Work.dict[instrument]["Four_Hour"] = StocksOpenExtend.History.fourhour
        Work.dict[instrument]["Daily"] = StocksOpenExtend.History.daily
        Work.dict[instrument]["Weekly"] = StocksOpenExtend.History.weekly

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
    try:
        Work.loop(instrument)
        
    except Exception as error:
        print(error)
    ends = time.time()
    ## print((ends - end))

# /* © 2022 Emraan Adem Ibrahim. See the license terms in the file 'license.txt' which should
# have been included with this distribution. */