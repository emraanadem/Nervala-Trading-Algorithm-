import requests
import json
import msgspec

accinfo = []
with open('accinfo.json', 'r') as accinf:
    accinfo = json.loads(accinf.read())
accinf.close()

class History:
    
    @staticmethod
    def control(instrument):
        History.Five_Min(instrument)
        History.Fifteen_Min(instrument)
        History.Thirty_Min(instrument)
        History.One_Hour(instrument)
        History.Two_Hour(instrument)
        History.Four_Hour(instrument)
        History.Daily(instrument)
        History.Weekly(instrument)

    @staticmethod
    def Five_Min(instrument):
        accountID = str(accinfo[0])
        token = str(accinfo[1])
        header = {"Authorization": "Bearer "+token}
        query = {"count": 2500, "granularity": "M5"}
        response = requests.get("https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles", headers = header, params = query)
        resp = response.json()['candles']
        values = []
        length = len(resp)
        response.close()
        for x in range(length):
            values.append(float(list(resp[x]['mid'].values())[3]))
        return(values)

    @staticmethod
    def Fifteen_Min(instrument):
        accountID = str(accinfo[0])
        token = str(accinfo[1])
        header = {"Authorization": "Bearer "+token}
        query = {"count": 2500, "granularity": "M15"}
        response = requests.get("https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles", headers = header, params = query)
        resp = response.json()['candles']
        values = []
        length = len(resp)
        response.close()
        for x in range(length):
            values.append(float(list(resp[x]['mid'].values())[3]))
        return(values)

    @staticmethod
    def Thirty_Min(instrument):
        accountID = str(accinfo[0])
        token = str(accinfo[1])
        header = {"Authorization": "Bearer "+token}
        query = {"count": 2500, "granularity": "M30"}
        response = requests.get("https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles", headers = header, params = query)
        resp = response.json()['candles']
        values = []
        length = len(resp)
        response.close()
        for x in range(length):
            values.append(float(list(resp[x]['mid'].values())[3]))
        return(values)

    @staticmethod
    def One_Hour(instrument):
        accountID = str(accinfo[0])
        token = str(accinfo[1])
        header = {"Authorization": "Bearer "+token}
        query = {"count": 2500, "granularity": "H1"}
        response = requests.get("https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles", headers = header, params = query)
        resp = response.json()['candles']
        values = []
        length = len(resp)
        response.close()
        for x in range(length):
            values.append(float(list(resp[x]['mid'].values())[3]))
        return(values)

    @staticmethod
    def Two_Hour(instrument):
        accountID = str(accinfo[0])
        token = str(accinfo[1])
        header = {"Authorization": "Bearer "+token}
        query = {"count": 2500, "granularity": "H2"}
        response = requests.get("https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles", headers = header, params = query)
        resp = response.json()['candles']
        values = []
        length = len(resp)
        response.close()
        for x in range(length):
            values.append(float(list(resp[x]['mid'].values())[3]))
        return(values)

    @staticmethod
    def Four_Hour(instrument):
        accountID = str(accinfo[0])
        token = str(accinfo[1])
        header = {"Authorization": "Bearer "+token}
        query = {"count": 2500, "granularity": "H4"}
        response = requests.get("https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles", headers = header, params = query)
        resp = response.json()['candles']
        values = []
        length = len(resp)
        response.close()
        for x in range(length):
            values.append(float(list(resp[x]['mid'].values())[3]))
        return(values)

    @staticmethod
    def Daily(instrument):
        accountID = str(accinfo[0])
        token = str(accinfo[1])
        header = {"Authorization": "Bearer "+token}
        query = {"count": 2500, "granularity": "D"}
        response = requests.get("https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles", headers = header, params = query)
        resp = response.json()['candles']
        values = []
        length = len(resp)
        response.close()
        for x in range(length):
            values.append(float(list(resp[x]['mid'].values())[3]))
        return(values)

    @staticmethod
    def Weekly(instrument):
        accountID = str(accinfo[0])
        token = str(accinfo[1])
        header = {"Authorization": "Bearer "+token}
        query = {"count": 2500, "granularity": "W"}
        response = requests.get("https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles", headers = header, params = query)
        resp = response.json()['candles']
        values = []
        length = len(resp)
        response.close()
        for x in range(length):
            values.append(float(list(resp[x]['mid'].values())[3]))
        return(values)

# /* © 2022 Emraan Adem Ibrahim. See the license terms in the file 'license.txt' which should
# have been included with this distribution. */