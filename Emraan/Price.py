import requests
import LivePrice
import json
import msgspec

accinfo = []
with open('accinfo.json', 'rb') as accinf:
    accinfo = msgspec.json.decode(accinf.read())
accinf.close()

with open("instrument.json", 'rb') as inst:
    instrum = msgspec.json.decode(inst.read())  
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
        query = {"count":  1, "granularity": "M1"}
        response = requests.get("https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles", headers = header, params = query)
        resp = str(response.content)
        listofnums = resp.split(':')
        numlist = listofnums[-1]
        placeholder = numlist
        secondplaceholder = []
        finalstr = ""
        numlisttwo = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.']
        for char in numlist:
            if (char in numlisttwo):
                secondplaceholder.append(char)
        for val in secondplaceholder:
            finalstr += val
        print(numlist, finalstr)
        price = float(finalstr)
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

print(Prices.priceswitcher("AUD_USD"))

# /* © 2022 Emraan Adem Ibrahim. See the license terms in the file 'license.txt' which should
# have been included with this distribution. */
