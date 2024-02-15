import requests
import json
import msgspec
from datetime import date, timedelta
today = date.today()
refdayfive = today - timedelta(days = 5)
refdayfifteen = today - timedelta(days=16.25)
refdaythirty = today - timedelta(days=35)
refdayhour = today - timedelta(days=69)
refdaytwohour=today - timedelta(days=124.5)
refdayfourhour=today - timedelta(days=248)
refdaydaily = today - timedelta(days=1062.5)
refdayweekly = today - timedelta(days=5115)

accinfo = []
with open('accinfo.json', 'r') as accinf:
    accinfo = json.loads(accinf.read())
accinf.close()

session = requests.Session()

class History:
    lenfive = 0
    lenfifteen = 0
    lenthirty = 0
    lenhour = 0
    lentwohour = 0
    lenfourhour = 0
    lendaily = 0
    lenweekly = 0
    five = []
    fifteen = []
    thirty = []
    hour = []
    twohour = []
    fourhour = []
    daily = []
    weekly = []



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
        aggs = []
        response = session.get("https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/5/minute/"+str(refdayfive)+"/"+str(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG")
        resp = response.json()
        for item in resp['results']:
            aggs.append(item['o'])
        History.five = aggs
        History.lenfive = len(History.five)
        return(History.five)

    @staticmethod
    def Fifteen_Min(instrument):
        aggs = []
        response = session.get("https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/15/minute/"+str(refdayfifteen)+"/"+str(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG")
        resp = response.json()
        for item in resp['results']:
            aggs.append(item['o'])
        History.fifteen = aggs
        History.lenfifteen = len(History.fifteen)
        return(History.fifteen)


    @staticmethod
    def Thirty_Min(instrument):
        aggs = []
        response = session.get("https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/30/minute/"+str(refdaythirty)+"/"+str(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG")
        resp = response.json()
        for item in resp['results']:
            aggs.append(item['o'])
        History.thirty = aggs
        History.lenthirty = len(History.thirty)
        return(History.thirty)
        

    @staticmethod
    def One_Hour(instrument):
        aggs = []
        response = session.get("https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/hour/"+str(refdayhour)+"/"+str(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG")
        resp = response.json()
        for item in resp['results']:
            aggs.append(item['o'])
        History.hour = aggs
        History.lenhour = len(History.hour)
        return(History.hour)

    @staticmethod
    def Two_Hour(instrument):
        aggs = []
        response = session.get("https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/2/hour/"+str(refdaytwohour)+"/"+str(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG")
        resp = response.json()
        for item in resp['results']:
            aggs.append(item['o'])
        History.twohour = aggs
        History.lentwohour = len(History.twohour)
        return(History.twohour)

    @staticmethod
    def Four_Hour(instrument):
        aggs = []
        response = session.get("https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/4/hour/"+str(refdayfourhour)+"/"+str(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG")
        resp = response.json()
        for item in resp['results']:
            aggs.append(item['o'])
        History.fourhour = aggs
        History.lenfourhour = len(History.fourhour)
        return(History.fourhour)

    @staticmethod
    def Daily(instrument):
        aggs = []
        response = session.get("https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/day/"+str(refdaydaily)+"/"+str(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG")
        resp = response.json()
        for item in resp['results']:
            aggs.append(item['o'])
        History.daily = aggs
        History.lendaily = len(History.daily)
        return(History.daily)
    
    @staticmethod
    def Weekly(instrument):
        aggs = []
        response = session.get("https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/week/"+str(refdayweekly)+"/"+str(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG")
        resp = response.json()
        for item in resp['results']:
            aggs.append(item['o'])
        History.weekly = aggs
        History.lenweekly = len(History.weekly)
        return(History.weekly)

    @staticmethod 
    def Equalizer(instrument):
        History.Five_Min(instrument)
        History.Fifteen_Min(instrument)
        History.Thirty_Min(instrument)
        History.One_Hour(instrument)
        History.Two_Hour(instrument)
        History.Four_Hour(instrument)
        History.Daily(instrument)
        History.Weekly(instrument)
        listoflens = []
        listoflens.append(History.lenfive)
        listoflens.append(History.lenfifteen)
        listoflens.append(History.lenthirty)
        listoflens.append(History.lenhour)
        listoflens.append(History.lentwohour)
        listoflens.append(History.lenfourhour)
        listoflens.append(History.lendaily)
        listoflens.append(History.lenweekly)
        listofitems = []
        listofitems.append(History.five)
        listofitems.append(History.fifteen)
        listofitems.append(History.thirty)
        listofitems.append(History.hour)
        listofitems.append(History.twohour)
        listofitems.append(History.fourhour)
        listofitems.append(History.daily)
        listofitems.append(History.weekly)
        minlen = min(listoflens)
        for item in listofitems:
            if len(item) > minlen:
                for x in range(0, len(item)-minlen):
                    item.pop(0)
        History.five = listofitems[0]
        History.fifteen = listofitems[1]
        History.thirty = listofitems[2]
        History.hour = listofitems[3]
        History.twohour = listofitems[4]
        History.fourhour = listofitems[5]
        History.daily = listofitems[6]
        History.weekly = listofitems[7]




# /* © 2022 Emraan Adem Ibrahim. See the license terms in the file 'license.txt' which should
# have been included with this distribution. */