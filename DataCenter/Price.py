import requests
import LivePrice
import json
import msgspec

accinfo = []
with open('accinfo.json', 'r') as accinf:
    accinfo = json.loads(accinf.read())

with open('instrument.json', 'r') as accinf:
    instrum = json.loads(accinf.read())
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
        accountID = str(accinfo[0])
        token = str(accinfo[1])
        header = {"Authorization": "Bearer "+token}
        query = {"count": 1, "granularity": "M1"}
        response = requests.get("https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles", headers = header, params = query)
        resp = response.json()['candles']
        price = float(list(resp[0]['mid'].values())[3])
        dict[instrument] = {"Price": 0}
        dict[instrument]["Price"] = price
        response.close()

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
    dict = {"instrument": str(inst)}
    dict_as_json = json.dumps(dict)
    with open("instrument.json", "w+") as outfile:
        outfile.truncate()
        outfile.write(dict_as_json)
        outfile.close()
        Prices.control(inst)


# /* © 2022 Emraan Adem Ibrahim. See the license terms in the file 'license.txt' which should
# have been included with this distribution. */