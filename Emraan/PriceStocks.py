import requests
import LivePrice
import json
from datetime import date
from datetime import timedelta
import msgspec
import yfinance as yf

accinfo = []
with open("instrument.json", 'r') as inst:
    instrum = json.load(inst)
    instrument = instrum['instrument']

dict = {}
class Prices:

    q = 0

    @staticmethod
    def control(instrument):
        Prices.priceswitcher(instrument)
        Prices.database()
    

    @staticmethod
    def priceswitcher(instrument):
        Share = yf.Ticker(instrument).info
        market_price = Share['currentPrice']
        dict[instrument] = {"Price": 0}
        dict[instrument]["Price"] = float(market_price)

    @staticmethod
    def database():
        # Create JSON Object
        dict_as_json = json.dumps(dict)
        # Write the JSON object created from our dictionary to the file data.json
        with open("LivePrice.json", "w") as outfile:
            outfile.write(dict_as_json)
        outfile.close()
        dict.clear()

def loop(inst):
    if LivePrice.i == 0:
        while(Prices.q == 0):
            dict = {"instrument": str(inst)}
            dict_as_json = json.dumps(dict)
            with open("instrument.json", "w+") as outfile:
                outfile.truncate()
                outfile.write(dict_as_json)
            outfile.close()
            Prices.q += 1
    with open("instrument.json", 'rb') as inst:
        instrum = msgspec.json.decode(inst.read())  
        instrument = instrum['instrument']  
        Prices.control(instrument)


# /* © 2022 Emraan Adem Ibrahim. See the license terms in the file 'license.txt' which should
# have been included with this distribution. */