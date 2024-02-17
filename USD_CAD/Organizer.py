import Data
import DataExtend
import DataStocks
import DataStocksExtend
import High
import HighExtend
import StocksHigh
import StocksHighExtend
import Low
import LowExtend
import StocksLow
import StocksLowExtend
import Open
import OpenExtend
import StocksOpen
import StocksOpenExtend
import json
import msgspec
import threading



class Organize:

    @staticmethod
    def gatherstock(instrument):
        dictstock = {}
        dictstock[instrument] = {}
        dictstock[instrument]['DataStocksfive'] = DataStocks.History.Five_Min(instrument)
        dictstock[instrument]['DataStocksfifteen'] = DataStocks.History.Fifteen_Min(instrument)
        dictstock[instrument]['DataStocksthirty'] = DataStocks.History.Thirty_Min(instrument)
        dictstock[instrument]['DataStockshour'] = DataStocks.History.One_Hour(instrument)
        dictstock[instrument]['DataStockstwohour'] = DataStocks.History.Two_Hour(instrument)
        dictstock[instrument]['DataStocksfourhour']= DataStocks.History.Four_Hour(instrument)
        dictstock[instrument]['DataStocksdaily']= DataStocks.History.Daily(instrument)
        dictstock[instrument]['DataStocksweekly']= DataStocks.History.Weekly(instrument)
        dictstock[instrument]['DataStocksextendfive'] = DataStocksExtend.History.Five_Min(instrument)
        dictstock[instrument]['DataStocksextendfifteen'] = DataStocksExtend.History.Fifteen_Min(instrument)
        dictstock[instrument]['DataStocksextendthirty'] = DataStocksExtend.History.Thirty_Min(instrument)
        dictstock[instrument]['DataStocksextendhour'] = DataStocksExtend.History.One_Hour(instrument)
        dictstock[instrument]['DataStocksextendtwohour'] = DataStocksExtend.History.Two_Hour(instrument)
        dictstock[instrument]['DataStocksextendfourhour'] = DataStocksExtend.History.Four_Hour(instrument)
        dictstock[instrument]['DataStocksextenddaily']= DataStocksExtend.History.Daily(instrument)
        dictstock[instrument]['DataStocksextendweekly'] = DataStocksExtend.History.Weekly(instrument)
        dictstock[instrument]['StocksHighfive'] = StocksHigh.History.Five_Min(instrument)
        dictstock[instrument]['StocksHighfifteen'] = StocksHigh.History.Fifteen_Min(instrument)
        dictstock[instrument]['StocksHighthirty'] = StocksHigh.History.Thirty_Min(instrument)
        dictstock[instrument]['StocksHighhour'] = StocksHigh.History.One_Hour(instrument)
        dictstock[instrument]['StocksHightwohour'] = StocksHigh.History.Two_Hour(instrument)
        dictstock[instrument]['StocksHighfourhour']= StocksHigh.History.Four_Hour(instrument)
        dictstock[instrument]['StocksHighdaily']= StocksHigh.History.Daily(instrument)
        dictstock[instrument]['StocksHighweekly']= StocksHigh.History.Weekly(instrument)
        dictstock[instrument]['StocksHighextendfive'] = StocksHighExtend.History.Five_Min(instrument)
        dictstock[instrument]['StocksHighextendfifteen'] = StocksHighExtend.History.Fifteen_Min(instrument)
        dictstock[instrument]['StocksHighextendthirty'] = StocksHighExtend.History.Thirty_Min(instrument)
        dictstock[instrument]['StocksHighextendhour'] = StocksHighExtend.History.One_Hour(instrument)
        dictstock[instrument]['StocksHighextendtwohour'] = StocksHighExtend.History.Two_Hour(instrument)
        dictstock[instrument]['StocksHighextendfourhour'] = StocksHighExtend.History.Four_Hour(instrument)
        dictstock[instrument]['StocksHighextenddaily']= StocksHighExtend.History.Daily(instrument)
        dictstock[instrument]['StocksHighextendweekly'] = StocksHighExtend.History.Weekly(instrument)
        dictstock[instrument]['StocksLowfive'] = StocksLow.History.Five_Min(instrument)
        dictstock[instrument]['StocksLowfifteen'] = StocksLow.History.Fifteen_Min(instrument)
        dictstock[instrument]['StocksLowthirty'] = StocksLow.History.Thirty_Min(instrument)
        dictstock[instrument]['StocksLowhour'] = StocksLow.History.One_Hour(instrument)
        dictstock[instrument]['StocksLowtwohour'] = StocksLow.History.Two_Hour(instrument)
        dictstock[instrument]['StocksLowfourhour']= StocksLow.History.Four_Hour(instrument)
        dictstock[instrument]['StocksLowdaily']= StocksLow.History.Daily(instrument)
        dictstock[instrument]['StocksLowweekly']= StocksLow.History.Weekly(instrument)
        dictstock[instrument]['StocksLowextendfive'] = StocksLowExtend.History.Five_Min(instrument)
        dictstock[instrument]['StocksLowextendfifteen'] = StocksLowExtend.History.Fifteen_Min(instrument)
        dictstock[instrument]['StocksLowextendthirty'] = StocksLowExtend.History.Thirty_Min(instrument)
        dictstock[instrument]['StocksLowextendhour'] = StocksLowExtend.History.One_Hour(instrument)
        dictstock[instrument]['StocksLowextendtwohour'] = StocksLowExtend.History.Two_Hour(instrument)
        dictstock[instrument]['StocksLowextendfourhour'] = StocksLowExtend.History.Four_Hour(instrument)
        dictstock[instrument]['StocksLowextenddaily']= StocksLowExtend.History.Daily(instrument)
        dictstock[instrument]['StocksLowextendweekly'] = StocksLowExtend.History.Weekly(instrument)
        dictstock[instrument]['StocksOpenfive'] = StocksOpen.History.Five_Min(instrument)
        dictstock[instrument]['StocksOpenfifteen'] = StocksOpen.History.Fifteen_Min(instrument)
        dictstock[instrument]['StocksOpenthirty'] = StocksOpen.History.Thirty_Min(instrument)
        dictstock[instrument]['StocksOpenhour'] = StocksOpen.History.One_Hour(instrument)
        dictstock[instrument]['StocksOpentwohour'] = StocksOpen.History.Two_Hour(instrument)
        dictstock[instrument]['StocksOpenfourhour']= StocksOpen.History.Four_Hour(instrument)
        dictstock[instrument]['StocksOpendaily']= StocksOpen.History.Daily(instrument)
        dictstock[instrument]['StocksOpenweekly']= StocksOpen.History.Weekly(instrument)
        dictstock[instrument]['StocksOpenextendfive'] = StocksOpenExtend.History.Five_Min(instrument)
        dictstock[instrument]['StocksOpenextendfifteen'] = StocksOpenExtend.History.Fifteen_Min(instrument)
        dictstock[instrument]['StocksOpenextendthirty'] = StocksOpenExtend.History.Thirty_Min(instrument)
        dictstock[instrument]['StocksOpenextendhour'] = StocksOpenExtend.History.One_Hour(instrument)
        dictstock[instrument]['StocksOpenextendtwohour'] = StocksOpenExtend.History.Two_Hour(instrument)
        dictstock[instrument]['StocksOpenextendfourhour'] = StocksOpenExtend.History.Four_Hour(instrument)
        dictstock[instrument]['StocksOpenextenddaily']= StocksOpenExtend.History.Daily(instrument)
        dictstock[instrument]['StocksOpenextendweekly'] = StocksOpenExtend.History.Weekly(instrument)
        dict_as_json = json.dumps(dictstock)
        # Write the JSON object created from our dictionary to the file data.json
        with open(instrument+".json", "w+") as outfile:
            outfile.write(dict_as_json)
        outfile.close()
        dictstock.clear()

    @staticmethod
    def gather(instrument):
        dict = {}
        dict[instrument] = {}
        dict[instrument]['Datafive'] = Data.History.Five_Min(instrument)
        dict[instrument]['Datafifteen'] = Data.History.Fifteen_Min(instrument)
        dict[instrument]['Datathirty'] = Data.History.Thirty_Min(instrument)
        dict[instrument]['Datahour'] = Data.History.One_Hour(instrument)
        dict[instrument]['Datatwohour'] = Data.History.Two_Hour(instrument)
        dict[instrument]['Datafourhour']= Data.History.Four_Hour(instrument)
        dict[instrument]['Datadaily']= Data.History.Daily(instrument)
        dict[instrument]['Dataweekly']= Data.History.Weekly(instrument)
        dict[instrument]['Dataextendfive'] = DataExtend.History.Five_Min(instrument)
        dict[instrument]['Dataextendfifteen'] = DataExtend.History.Fifteen_Min(instrument)
        dict[instrument]['Dataextendthirty'] = DataExtend.History.Thirty_Min(instrument)
        dict[instrument]['Dataextendhour'] = DataExtend.History.One_Hour(instrument)
        dict[instrument]['Dataextendtwohour'] = DataExtend.History.Two_Hour(instrument)
        dict[instrument]['Dataextendfourhour'] = DataExtend.History.Four_Hour(instrument)
        dict[instrument]['Dataextenddaily']= DataExtend.History.Daily(instrument)
        dict[instrument]['Dataextendweekly'] = DataExtend.History.Weekly(instrument)
        dict[instrument]['Highfive'] = High.History.Five_Min(instrument)
        dict[instrument]['Highfifteen'] = High.History.Fifteen_Min(instrument)
        dict[instrument]['Highthirty'] = High.History.Thirty_Min(instrument)
        dict[instrument]['Highhour'] = High.History.One_Hour(instrument)
        dict[instrument]['Hightwohour'] = High.History.Two_Hour(instrument)
        dict[instrument]['Highfourhour']= High.History.Four_Hour(instrument)
        dict[instrument]['Highdaily']= High.History.Daily(instrument)
        dict[instrument]['Highweekly']= High.History.Weekly(instrument)
        dict[instrument]['Highextendfive'] = HighExtend.History.Five_Min(instrument)
        dict[instrument]['Highextendfifteen'] = HighExtend.History.Fifteen_Min(instrument)
        dict[instrument]['Highextendthirty'] = HighExtend.History.Thirty_Min(instrument)
        dict[instrument]['Highextendhour'] = HighExtend.History.One_Hour(instrument)
        dict[instrument]['Highextendtwohour'] = HighExtend.History.Two_Hour(instrument)
        dict[instrument]['Highextendfourhour'] = HighExtend.History.Four_Hour(instrument)
        dict[instrument]['Highextenddaily']= HighExtend.History.Daily(instrument)
        dict[instrument]['Highextendweekly'] = HighExtend.History.Weekly(instrument)
        dict[instrument]['Lowfive'] = Low.History.Five_Min(instrument)
        dict[instrument]['Lowfifteen'] = Low.History.Fifteen_Min(instrument)
        dict[instrument]['Lowthirty'] = Low.History.Thirty_Min(instrument)
        dict[instrument]['Lowhour'] = Low.History.One_Hour(instrument)
        dict[instrument]['Lowtwohour'] = Low.History.Two_Hour(instrument)
        dict[instrument]['Lowfourhour']= Low.History.Four_Hour(instrument)
        dict[instrument]['Lowdaily']= Low.History.Daily(instrument)
        dict[instrument]['Lowweekly']= Low.History.Weekly(instrument)
        dict[instrument]['Lowextendfive'] = LowExtend.History.Five_Min(instrument)
        dict[instrument]['Lowextendfifteen'] = LowExtend.History.Fifteen_Min(instrument)
        dict[instrument]['Lowextendthirty'] = LowExtend.History.Thirty_Min(instrument)
        dict[instrument]['Lowextendhour'] = LowExtend.History.One_Hour(instrument)
        dict[instrument]['Lowextendtwohour'] = LowExtend.History.Two_Hour(instrument)
        dict[instrument]['Lowextendfourhour'] = LowExtend.History.Four_Hour(instrument)
        dict[instrument]['Lowextenddaily']= LowExtend.History.Daily(instrument)
        dict[instrument]['Lowextendweekly'] = LowExtend.History.Weekly(instrument)
        dict[instrument]['Openfive'] = Open.History.Five_Min(instrument)
        dict[instrument]['Openfifteen'] = Open.History.Fifteen_Min(instrument)
        dict[instrument]['Openthirty'] = Open.History.Thirty_Min(instrument)
        dict[instrument]['Openhour'] = Open.History.One_Hour(instrument)
        dict[instrument]['Opentwohour'] = Open.History.Two_Hour(instrument)
        dict[instrument]['Openfourhour']= Open.History.Four_Hour(instrument)
        dict[instrument]['Opendaily']= Open.History.Daily(instrument)
        dict[instrument]['Openweekly']= Open.History.Weekly(instrument)
        dict[instrument]['Openextendfive'] = OpenExtend.History.Five_Min(instrument)
        dict[instrument]['Openextendfifteen'] = OpenExtend.History.Fifteen_Min(instrument)
        dict[instrument]['Openextendthirty'] = OpenExtend.History.Thirty_Min(instrument)
        dict[instrument]['Openextendhour'] = OpenExtend.History.One_Hour(instrument)
        dict[instrument]['Openextendtwohour'] = OpenExtend.History.Two_Hour(instrument)
        dict[instrument]['Openextendfourhour'] = OpenExtend.History.Four_Hour(instrument)
        dict[instrument]['Openextenddaily']= OpenExtend.History.Daily(instrument)
        dict[instrument]['Openextendweekly'] = OpenExtend.History.Weekly(instrument)
        dict_as_json = json.dumps(dict)
        # Write the JSON object created from our dictionary to the file data.json
        with open(instrument+".json", "w+") as outfile:
            outfile.write(dict_as_json)
        outfile.close()
        dict.clear()
    
    @staticmethod
    def start():
        with open("instruments.json", 'rb') as currency:
            currencies = msgspec.json.decode(currency.read())
        with open("StockInstruments.json", 'rb') as stock:
            stocks = msgspec.json.decode(stock.read())
        with open("TagList.json", 'rb') as tags:
            tagss = msgspec.json.decode(tags.read())
            for key in tagss:
                instrument = tagss[key]
                if instrument in stocks:
                    threading.Thread(target=Organize.beginstocks, args = [instrument]).start()
                elif instrument in currencies:
                    threading.Thread(target=Organize.begincurrencies, args = [instrument]).start()



    @staticmethod
    def beginstocks(instrument):
        Organize.gather(instrument)


    @staticmethod
    def begincurrencies(instrument):
        Organize.gatherstock(instrument)


Organize.start()