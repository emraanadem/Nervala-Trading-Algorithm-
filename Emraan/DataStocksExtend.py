import requests
import json
import msgspec
from datetime import date, timedelta
from polygon import RESTClient


client = RESTClient(api_key="_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG")
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
with open('accinfo.json', 'rb') as accinf:
    accinfo = msgspec.json.decode(accinf.read())
accinf.close()

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
        for a in client.list_aggs(ticker=instrument, multiplier=5, timespan="minute", from_=refdayfive, to=today, limit=50000):
            History.five.append(a.close)
        History.lenfive = len(History.five)
        return(History.five)

    @staticmethod
    def Fifteen_Min(instrument):
        aggs = []
        for a in client.list_aggs(ticker=instrument, multiplier=15, timespan="minute", from_=refdayfifteen, to=today, limit=50000):
            History.fifteen.append(a.close)
        History.lenfifteen = len(History.fifteen)
        return(History.fifteen)

    @staticmethod
    def Thirty_Min(instrument):
        aggs = []
        for a in client.list_aggs(ticker=instrument, multiplier=30, timespan="minute", from_=refdaythirty, to=today, limit=50000):
            History.thirty.append(a.close)
        History.lenthirty = len(History.thirty)
        return(History.thirty)

    @staticmethod
    def One_Hour(instrument):
        aggs = []
        for a in client.list_aggs(ticker=instrument, multiplier=1, timespan="hour", from_=refdayhour, to=today, limit=50000):
            History.hour.append(a.close)
        History.lenhour = len(History.hour)
        return(History.hour)

    @staticmethod
    def Two_Hour(instrument):
        aggs = []
        for a in client.list_aggs(ticker=instrument, multiplier=2, timespan="hour", from_=refdaytwohour, to=today, limit=50000):
            History.twohour.append(a.close)
        History.lentwohour = len(History.twohour)
        return(History.twohour)

    @staticmethod
    def Four_Hour(instrument):
        aggs = []
        for a in client.list_aggs(ticker=instrument, multiplier=4, timespan="hour", from_=refdayfourhour, to=today, limit=50000):
            History.fourhour.append(a.close)
        History.lenfourhour = len(History.fourhour)
        return(History.fourhour)

    @staticmethod
    def Daily(instrument):
        close = []
        aggs = []
        for a in client.list_aggs(ticker=instrument, multiplier=1, timespan="day", from_=refdaydaily, to=today, limit=50000):
            History.daily.append(a.close)
        History.lendaily = len(History.daily)
        return(History.daily)
    
    @staticmethod
    def Weekly(instrument):
        close = []
        aggs = []
        for a in client.list_aggs(ticker=instrument, multiplier=1, timespan="week", from_=refdayweekly, to=today, limit=50000):
            History.weekly.append(a.close)
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