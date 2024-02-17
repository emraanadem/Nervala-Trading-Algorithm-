import time
import asyncio
import HighExtend
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
        Work.dict[instrument] = {"Five_Min" : [], "Fifteen_Min" : [], "Thirty_Min" : [], "One_Hour" : [], "Two_Hour" : [], "Four_Hour" : [], "Daily" : [], "Weekly" : []}
        Work.dict[instrument]["Five_Min"] = HighExtend.History.Five_Min(instrument)
        Work.dict[instrument]["Fifteen_Min"] = HighExtend.History.Fifteen_Min(instrument)
        Work.dict[instrument]["Thirty_Min"] = HighExtend.History.Thirty_Min(instrument)
        Work.dict[instrument]["One_Hour"] = HighExtend.History.One_Hour(instrument)
        Work.dict[instrument]["Two_Hour"] = HighExtend.History.Two_Hour(instrument)
        Work.dict[instrument]["Four_Hour"] = HighExtend.History.Four_Hour(instrument)
        Work.dict[instrument]["Daily"] = HighExtend.History.Daily(instrument)
        Work.dict[instrument]["Weekly"] = HighExtend.History.Weekly(instrument)

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
            ends = time.time()
        ## print((ends - end))


# /* © 2022 Emraan Adem Ibrahim. See the license terms in the file 'license.txt' which should
# have been included with this distribution. */