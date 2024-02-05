import time
import asyncio
import StocksHighExtend
import json
import msgspec
import threading
class Work:
    dict = {}
    @staticmethod
    def loop(inst):
        threading.Thread(target=Work.callone(inst)).start()
        # Create JSON Object
        dict_as_json = json.dumps(Work.dict)
        # Write the JSON object created from our dictionary to the file data.json
        with open("HighExtend.json", "w+") as outfile:
            outfile.truncate()
            outfile.write(dict_as_json)

    @staticmethod
    def callone(instrument):
        StocksHighExtend.History.Equalizer(instrument)
        Work.dict[instrument] = {"Five_Min" : [], "Fifteen_Min" : [], "Thirty_Min" : [], "One_Hour" : [], "Two_Hour" : [], "Four_Hour" : [], "Daily" : [], "Weekly" : []}
        Work.dict[instrument]["Five_Min"] = StocksHighExtend.History.five
        Work.dict[instrument]["Fifteen_Min"] = StocksHighExtend.History.fifteen
        Work.dict[instrument]["Thirty_Min"] = StocksHighExtend.History.thirty
        Work.dict[instrument]["One_Hour"] = StocksHighExtend.History.hour
        Work.dict[instrument]["Two_Hour"] = StocksHighExtend.History.twohour
        Work.dict[instrument]["Four_Hour"] = StocksHighExtend.History.fourhour
        Work.dict[instrument]["Daily"] = StocksHighExtend.History.daily
        Work.dict[instrument]["Weekly"] = StocksHighExtend.History.weekly

def controlbox():
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