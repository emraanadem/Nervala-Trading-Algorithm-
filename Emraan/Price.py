import requests
import LivePrice
import json
import msgspec

accinfo = []
with open('accinfo.json', 'r') as accinf:
    accinfo = json.loads(accinf.read())
accinf.close()

with open("instrument.json", 'r') as inst:
    instrum = json.load(inst)
    instrument = instrum['instrument']


    
dict = {}

class Prices:

    q = 0

    @staticmethod
    def control(instrument):
        Prices.pricehub(instrument)
        Prices.database()
    
    @staticmethod
    def priceswitcher(instrument):
        accountID = str(accinfo[0])
        token = str(accinfo[1])
        header = {"Authorization": "Bearer "+token}
        query = {"count":  1, "granularity": "M1"}
        response = requests.get("https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles", headers = header, params = query)
        resp = str(response.content)
        listofnums = resp.split(':')
        numlist = listofnums[-1]
        placeholder = numlist
        response.close()
        return placeholder
        

    @staticmethod
    def pricehub(instrument):
        i = 0
        periodcount = 0
        numlisttwo = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.']
        while i == 0:
            placeholder = ""
            number = Prices.priceswitcher(instrument)
            for char in number:
                if char in numlisttwo:
                    placeholder += char
                if char == ".":
                    periodcount +=1
            if periodcount < 2:
                break
        price = float(placeholder)
        dict[instrument] = {"Price": 0}
        dict[instrument]["Price"] = price
        return price

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