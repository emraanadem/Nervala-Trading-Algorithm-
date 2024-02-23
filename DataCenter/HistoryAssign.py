from supabase import create_client, Client
import json

url: str = "https://nvlbmpghemfunkpnhwee.supabase.co"
key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52bGJtcGdoZW1mdW5rcG5od2VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDgxMTg3ODcsImV4cCI6MjAyMzY5NDc4N30.woZOGh5WaEcUtEyvsXaNP3Kg6BsNP8UOWhmv5RG4iMY"
supabase: Client = create_client(url, key)


datas = {}
datas['Five_Min'] = {}
datas['Five_Min']['c'] = []
datas['Five_Min']['h'] = []
datas['Five_Min']['l'] = []
datas['Five_Min_Extend'] = {}
datas['Five_Min_Extend']['c'] = []
datas['Five_Min_Extend']['h'] = []
datas['Five_Min_Extend']['l'] = []
datas['Fifteen_Min'] = {}
datas['Fifteen_Min']['c'] = []
datas['Fifteen_Min']['h'] = []
datas['Fifteen_Min']['l'] = []
datas['Fifteen_Min_Extend'] = {}
datas['Fifteen_Min_Extend']['c'] = []
datas['Fifteen_Min_Extend']['h'] = []
datas['Fifteen_Min_Extend']['l'] = []
datas['Thirty_Min'] = {}
datas['Thirty_Min']['c'] = []
datas['Thirty_Min']['h'] = []
datas['Thirty_Min']['l'] = []
datas['Thirty_Min_Extend'] = {}
datas['Thirty_Min_Extend']['c'] = []
datas['Thirty_Min_Extend']['h'] = []
datas['Thirty_Min_Extend']['l'] = []
datas['One_Hour'] = {}
datas['One_Hour']['c'] = []
datas['One_Hour']['h'] = []
datas['One_Hour']['l'] = []
datas['One_Hour_Extend'] = {}
datas['One_Hour_Extend']['c'] = []
datas['One_Hour_Extend']['h'] = []
datas['One_Hour_Extend']['l'] = []
datas['Two_Hour'] = {}
datas['Two_Hour']['c'] = []
datas['Two_Hour']['h'] = []
datas['Two_Hour']['l'] = []
datas['Two_Hour_Extend'] = {}
datas['Two_Hour_Extend']['c'] = []
datas['Two_Hour_Extend']['h'] = []
datas['Two_Hour_Extend']['l'] = []
datas['Four_Hour'] = {}
datas['Four_Hour']['c'] = []
datas['Four_Hour']['h'] = []
datas['Four_Hour']['l'] = []
datas['Four_Hour_Extend'] = {}
datas['Four_Hour_Extend']['c'] = []
datas['Four_Hour_Extend']['h'] = []
datas['Four_Hour_Extend']['l'] = []
datas['Daily'] = {}
datas['Daily']['c'] = []
datas['Daily']['h'] = []
datas['Daily']['l'] = []
datas['Daily_Extend'] = {}
datas['Daily_Extend']['c'] = []
datas['Daily_Extend']['h'] = []
datas['Daily_Extend']['l'] = []
datas['Weekly'] = {}
datas['Weekly']['c'] = []
datas['Weekly']['h'] = []
datas['Weekly']['l'] = []
datas['Weekly_Extend'] = {}
datas['Weekly_Extend']['c'] = []
datas['Weekly_Extend']['h'] = []
datas['Weekly_Extend']['l'] = []

class Four_Hour_Functions:
    def __init__(self):
        self.multiplier = 0
        self.priceHist = []
        self.extendHist = []
        self.rejectionzones = []
        self.timeperiods = {}
        self.extendHigh = []
        self.extendLow = []
        self.resistance = 0
        self.support = 0
        self.vals = []
        self.price = 0
        self.maxes = []
        self.mins = []
        self.recentHisto = []
        self.highs = []
        self.lows = []

    @staticmethod
    def instrument_name():
        with open('instrument.json', 'r') as file:
            instrument = json.load(file)
            dataspecific = instrument['instrument']
        return dataspecific

    @staticmethod
    def HistoryAssigner():
        instrument = Four_Hour_Functions.instrument_name()
        try:
            response = supabase.from_('Four_Hour').select('Data').eq('Instrument', instrument).eq('OHLC', 'c')
            datas['Four_Hour']['c'] = response[0]['Data']
            response = supabase.from_('Four_Hour').select('Data').eq('Instrument', instrument).eq('OHLC', 'h')
            datas['Four_Hour']['h'] = response[0]['Data']
            response = supabase.from_('Four_Hour').select('Data').eq('Instrument', instrument).eq('OHLC', 'l')
            datas['Four_Hour']['l'] = response[0]['Data']
            response = supabase.from_('Four_Hour Extend').select('Data').eq('Instrument', instrument).eq('OHLC', 'c')
            datas['Four_Hour_Extend']['c'] = response[0]['Data']
            response = supabase.from_('Four_Hour Extend').select('Data').eq('Instrument', instrument).eq('OHLC', 'h')
            datas['Four_Hour_Extend']['h'] = response[0]['Data']
            response = supabase.from_('Four_Hour Extend').select('Data').eq('Instrument', instrument).eq('OHLC', 'l')
            datas['Four_Hour_Extend']['l'] = response[0]['Data']
        except Exception as error:
            print(error)

        lens = []
        Four_Hour_Functions.priceHist = datas['Four_Hour']['c']
        Four_Hour_Functions.highs = datas['Four_Hour']['h']
        Four_Hour_Functions.lows = datas['Four_Hour']['l']
        Four_Hour_Functions.extendHist = datas['Four_Hour_Extend']['c']
        Four_Hour_Functions.extendHigh = datas['Four_Hour_Extend']['h']
        Four_Hour_Functions.extendLow = datas['Four_Hour_Extend']['l']
        lens.append(len(Four_Hour_Functions.priceHist))
        lens.append(len(Four_Hour_Functions.highs))
        lens.append(len(Four_Hour_Functions.lows))
        minlens = min(lens)
        lists = [Four_Hour_Functions.priceHist, Four_Hour_Functions.highs, Four_Hour_Functions.lows]
        for items in lists:
            if len(items) > minlens:
                if items == Four_Hour_Functions.priceHist:
                    for item in range(Four_Hour_Functions.priceHist - minlens):
                        Four_Hour_Functions.priceHist.pop(0)
                if items == Four_Hour_Functions.lows:
                    for item in range(Four_Hour_Functions.lows - minlens):
                        Four_Hour_Functions.lows.pop(0)
                if items == Four_Hour_Functions.highs:
                    for item in range(Four_Hour_Functions.highs - minlens):
                        Four_Hour_Functions.highs.pop(0)

        lens = []
        lens.append(len(Four_Hour_Functions.extendHist))
        lens.append(len(Four_Hour_Functions.extendHigh))
        lens.append(len(Four_Hour_Functions.extendLow))
        minlens = min(lens)
        lists = [Four_Hour_Functions.extendHist, Four_Hour_Functions.extendHigh, Four_Hour_Functions.extendLow]
        for items in lists:
            if len(items) > minlens:
                if items == Four_Hour_Functions.extendHist:
                    for item in range(Four_Hour_Functions.extendHist - minlens):
                        Four_Hour_Functions.extendHist.pop(0)
                if items == Four_Hour_Functions.extendLow:
                    for item in range(Four_Hour_Functions.extendLow - minlens):
                        Four_Hour_Functions.extendLow.pop(0)
                if items == Four_Hour_Functions.extendHigh:
                    for item in range(Four_Hour_Functions.extendHigh - minlens):
                        Four_Hour_Functions.extendHigh.pop(0)

class Daily_Functions:
    def __init__(self):
        self.multiplier = 0
        self.priceHist = []
        self.vals = []
        self.price = 0
        self.maxes = []
        self.mins = []
        self.recentHisto = []
        self.resistance = 0
        self.support = 0
        self.finlevs = []
        self.highs = []
        self.lows = []

    @staticmethod
    def HistoryAssigner():
        instrument = One_Hour_Functions.instrument_name()
        try:
            response = supabase.from_('Daily').select('Data').eq('Instrument', instrument).eq('OHLC', 'c')
            datas['Daily']['c'] = response[0]['Data']
            response = supabase.from_('Daily').select('Data').eq('Instrument', instrument).eq('OHLC', 'h')
            datas['Daily']['h'] = response[0]['Data']
            response = supabase.from_('Daily').select('Data').eq('Instrument', instrument).eq('OHLC', 'l')
            datas['Daily']['l'] = response[0]['Data']
            response = supabase.from_('Daily Extend').select('Data').eq('Instrument', instrument).eq('OHLC', 'c')
            datas['Daily_Extend']['c'] = response[0]['Data']
            response = supabase.from_('Daily Extend').select('Data').eq('Instrument', instrument).eq('OHLC', 'h')
            datas['Daily_Extend']['h'] = response[0]['Data']
            response = supabase.from_('Daily Extend').select('Data').eq('Instrument', instrument).eq('OHLC', 'l')
            datas['Daily_Extend']['l'] = response[0]['Data']
        except Exception as error:
            print(error)

        lens = []
        Daily_Functions.priceHist = datas['Daily']['c']
        Daily_Functions.highs = datas['Daily']['h']
        Daily_Functions.lows = datas['Daily']['l']
        Daily_Functions.extendHist = datas['Daily']['c']
        Daily_Functions.extendHigh = datas['Daily']['h']
        Daily_Functions.extendLow = datas['Daily']['l']
        lens.append(len(Daily_Functions.priceHist))
        lens.append(len(Daily_Functions.highs))
        lens.append(len(Daily_Functions.lows))
        minlens = min(lens)
        lists = [Daily_Functions.priceHist, Daily_Functions.highs, Daily_Functions.lows]
        for items in lists:
            if len(items) > minlens:
                if items == Daily_Functions.priceHist:
                    for item in range(Daily_Functions.priceHist - minlens):
                        Daily_Functions.priceHist.pop(0)
                if items == Daily_Functions.lows:
                    for item in range(Daily_Functions.lows - minlens):
                        Daily_Functions.lows.pop(0)
                if items == Daily_Functions.highs:
                    for item in range(Daily_Functions.highs - minlens):
                        Daily_Functions.highs.pop(0)

class One_Hour_Functions:
    def __init__(self):
        self.multiplier = 0
        self.rejectionzones = []
        self.priceHist = []
        self.timeperiods = {}
        self.extendHist = []
        self.extendHigh = []
        self.extendLow = []
        self.vals = []
        self.price = 0
        self.maxes = []
        self.mins = []
        self.recentHisto = []
        self.highs = []
        self.lows = []

    @staticmethod
    def instrument_name():
        with open('instrument.json', 'r') as file:
            instrument = json.load(file)
            dataspecific = instrument['instrument']
        return dataspecific

    @staticmethod
    def HistoryAssigner():
        instrument = One_Hour_Functions.instrument_name()
        try:
            response = supabase.from_('One_Hour').select('Data').eq('Instrument', instrument).eq('OHLC', 'c')
            datas['One_Hour']['c'] = response[0]['Data']
            response = supabase.from_('One_Hour').select('Data').eq('Instrument', instrument).eq('OHLC', 'h')
            datas['One_Hour']['h'] = response[0]['Data']
            response = supabase.from_('One_Hour').select('Data').eq('Instrument', instrument).eq('OHLC', 'l')
            datas['One_Hour']['l'] = response[0]['Data']
            response = supabase.from_('One_Hour Extend').select('Data').eq('Instrument', instrument).eq('OHLC', 'c')
            datas['One_Hour_Extend']['c'] = response[0]['Data']
            response = supabase.from_('One_Hour Extend').select('Data').eq('Instrument', instrument).eq('OHLC', 'h')
            datas['One_Hour_Extend']['h'] = response[0]['Data']
            response = supabase.from_('One_Hour Extend').select('Data').eq('Instrument', instrument).eq('OHLC', 'l')
            datas['One_Hour_Extend']['l'] = response[0]['Data']
        except Exception as error:
            print(error)

        lens = []
        One_Hour_Functions.priceHist = datas['One_Hour']['c']
        One_Hour_Functions.highs = datas['One_Hour']['h']
        One_Hour_Functions.lows = datas['One_Hour']['l']
        One_Hour_Functions.extendHist = datas['One_Hour']['c']
        One_Hour_Functions.extendHigh = datas['One_Hour']['h']
        One_Hour_Functions.extendLow = datas['One_Hour']['l']
        lens.append(len(One_Hour_Functions.priceHist))
        lens.append(len(One_Hour_Functions.highs))
        lens.append(len(One_Hour_Functions.lows))
        minlens = min(lens)
        lists = [One_Hour_Functions.priceHist, One_Hour_Functions.highs, One_Hour_Functions.lows]
        for items in lists:
            if len(items) > minlens:
                if items == One_Hour_Functions.priceHist:
                    for item in range(One_Hour_Functions.priceHist - minlens):
                        One_Hour_Functions.priceHist.pop(0)
                if items == One_Hour_Functions.lows:
                    for item in range(One_Hour_Functions.lows - minlens):
                        One_Hour_Functions.lows.pop(0)
                if items == One_Hour_Functions.highs:
                    for item in range(One_Hour_Functions.highs - minlens):
                        One_Hour_Functions.highs.pop(0)

        lens = []
        lens.append(len(One_Hour_Functions.extendHist))
        lens.append(len(One_Hour_Functions.extendHigh))
        lens.append(len(One_Hour_Functions.extendLow))
        minlens = min(lens)
        lists = [One_Hour_Functions.extendHist, One_Hour_Functions.extendHigh, One_Hour_Functions.extendLow]
        for items in lists:
            if len(items) > minlens:
                if items == One_Hour_Functions.extendHist:
                    for item in range(One_Hour_Functions.extendHist - minlens):
                        One_Hour_Functions.extendHist.pop(0)
                if items == One_Hour_Functions.extendLow:
                    for item in range(One_Hour_Functions.extendLow - minlens):
                        One_Hour_Functions.extendLow.pop(0)
                if items == One_Hour_Functions.extendHigh:
                    for item in range(One_Hour_Functions.extendHigh - minlens):
                        One_Hour_Functions.extendHigh.pop(0)

class Thirty_Min_Functions:
    def __init__(self):
        self.multiplier = 0
        self.priceHist = []
        self.extendHist = []
        self.rejectionzones = []
        self.extendHigh = []
        self.extendLow = []
        self.resistance = 0
        self.support = 0
        self.timeperiods = {}
        self.vals = []
        self.price = 0
        self.maxes = []
        self.mins = []
        self.recentHisto = []
        self.highs = []
        self.lows = []

    @staticmethod
    def instrument_name():
        with open('instrument.json', 'r') as file:
            instrument = json.load(file)
            dataspecific = instrument['instrument']
        return dataspecific

    @staticmethod
    def HistoryAssigner():
        instrument = Thirty_Min_Functions.instrument_name()
        try:
            response = supabase.from_('Thirty_Min').select('Data').eq('Instrument', instrument).eq('OHLC', 'c')
            datas['Thirty_Min']['c'] = response[0]['Data']
            response = supabase.from_('Thirty_Min').select('Data').eq('Instrument', instrument).eq('OHLC', 'h')
            datas['Thirty_Min']['h'] = response[0]['Data']
            response = supabase.from_('Thirty_Min').select('Data').eq('Instrument', instrument).eq('OHLC', 'l')
            datas['Thirty_Min']['l'] = response[0]['Data']
            response = supabase.from_('Thirty_Min Extend').select('Data').eq('Instrument', instrument).eq('OHLC', 'c')
            datas['Thirty_Min_Extend']['c'] = response[0]['Data']
            response = supabase.from_('Thirty_Min Extend').select('Data').eq('Instrument', instrument).eq('OHLC', 'h')
            datas['Thirty_Min_Extend']['h'] = response[0]['Data']
            response = supabase.from_('Thirty_Min Extend').select('Data').eq('Instrument', instrument).eq('OHLC', 'l')
            datas['Thirty_Min_Extend']['l'] = response[0]['Data']
        except Exception as error:
            print(error)

        lens = []
        Thirty_Min_Functions.priceHist = datas['Thirty_Min']['c']
        Thirty_Min_Functions.highs = datas['Thirty_Min']['h']
        Thirty_Min_Functions.lows = datas['Thirty_Min']['l']
        Thirty_Min_Functions.extendHist = datas['Thirty_Min_Extend']['c']
        Thirty_Min_Functions.extendHigh = datas['Thirty_Min_Extend']['h']
        Thirty_Min_Functions.extendLow = datas['Thirty_Min_Extend']['l']
        lens.append(len(Thirty_Min_Functions.priceHist))
        lens.append(len(Thirty_Min_Functions.highs))
        lens.append(len(Thirty_Min_Functions.lows))
        minlens = min(lens)
        lists = [Thirty_Min_Functions.priceHist, Thirty_Min_Functions.highs, Thirty_Min_Functions.lows]
        for items in lists:
            if len(items) > minlens:
                if items == Thirty_Min_Functions.priceHist:
                    for item in range(Thirty_Min_Functions.priceHist - minlens):
                        Thirty_Min_Functions.priceHist.pop(0)
                if items == Thirty_Min_Functions.lows:
                    for item in range(Thirty_Min_Functions.lows - minlens):
                        Thirty_Min_Functions.lows.pop(0)
                if items == Thirty_Min_Functions.highs:
                    for item in range(Thirty_Min_Functions.highs - minlens):
                        Thirty_Min_Functions.highs.pop(0)

        lens = []
        lens.append(len(Thirty_Min_Functions.extendHist))
        lens.append(len(Thirty_Min_Functions.extendHigh))
        lens.append(len(Thirty_Min_Functions.extendLow))
        minlens = min(lens)
        lists = [Thirty_Min_Functions.extendHist, Thirty_Min_Functions.extendHigh, Thirty_Min_Functions.extendLow]
        for items in lists:
            if len(items) > minlens:
                if items == Thirty_Min_Functions.extendHist:
                    for item in range(Thirty_Min_Functions.extendHist - minlens):
                        Thirty_Min_Functions.extendHist.pop(0)
                if items == Thirty_Min_Functions.extendLow:
                    for item in range(Thirty_Min_Functions.extendLow - minlens):
                        Thirty_Min_Functions.extendLow.pop(0)
                if items == Thirty_Min_Functions.extendHigh:
                    for item in range(Thirty_Min_Functions.extendHigh - minlens):
                        Thirty_Min_Functions.extendHigh.pop(0)

class Fifteen_Min_Functions:
    multiplier = 0
    priceHist = []
    extendHist = []
    rejectionzones = []
    extendHigh = []
    extendLow = []
    resistance = 0
    support = 0
    timeperiods = {}
    vals = []
    price = 0
    maxes = []
    mins = []
    recentHisto = []
    highs = []
    lows = []

    @staticmethod
    def instrument_name():
        raw = fs.readFileSync('instrument.json')
        instrument = JSON.parse(raw)
        dataspecific = instrument['instrument']
        return dataspecific

    @staticmethod
    def HistoryAssigner():
        instrument = Fifteen_Min_Functions.instrument_name()
        try:
            response = supabase.from_('Fifteen_Min').select('Data').eq('Instrument', instrument).eq('OHLC', 'c')
            datas['Fifteen_Min']['c'] = response[0]['Data']
            response = supabase.from_('Fifteen_Min').select('Data').eq('Instrument', instrument).eq('OHLC', 'h')
            datas['Fifteen_Min']['h'] = response[0]['Data']
            response = supabase.from_('Fifteen_Min').select('Data').eq('Instrument', instrument).eq('OHLC', 'l')
            datas['Fifteen_Min']['l'] = response[0]['Data']
            response = supabase.from_('Fifteen_Min Extend').select('Data').eq('Instrument', instrument).eq('OHLC', 'c')
            datas['Fifteen_Min_Extend']['c'] = response[0]['Data']
            response = supabase.from_('Fifteen_Min Extend').select('Data').eq('Instrument', instrument).eq('OHLC', 'h')
            datas['Fifteen_Min_Extend']['h'] = response[0]['Data']
            response = supabase.from_('Fifteen_Min Extend').select('Data').eq('Instrument', instrument).eq('OHLC', 'l')
            datas['Fifteen_Min_Extend']['l'] = response[0]['Data']
        except error:
            print(error)

        lens = []
        Fifteen_Min_Functions.priceHist = datas['Fifteen_Min']['c']
        Fifteen_Min_Functions.highs = datas['Fifteen_Min']['h']
        Fifteen_Min_Functions.lows = datas['Fifteen_Min']['l']
        Fifteen_Min_Functions.extendHist = datas['Fifteen_Min']['c']
        Fifteen_Min_Functions.extendHigh = datas['Fifteen_Min']['h']
        Fifteen_Min_Functions.extendLow = datas['Fifteen_Min']['l']
        lens.append(len(Fifteen_Min_Functions.priceHist))
        lens.append(len(Fifteen_Min_Functions.highs))
        lens.append(len(Fifteen_Min_Functions.lows))
        minlens = min(lens)
        lists = [Fifteen_Min_Functions.priceHist, Fifteen_Min_Functions.highs, Fifteen_Min_Functions.lows]
        for items in lists:
            if len(items) > minlens:
                if items == Fifteen_Min_Functions.priceHist:
                    for item in range(Fifteen_Min_Functions.priceHist.length - minlens):
                        Fifteen_Min_Functions.priceHist.pop(0)
                if items == Fifteen_Min_Functions.lows:
                    for item in range(Fifteen_Min_Functions.lows.length - minlens):
                        Fifteen_Min_Functions.lows.pop(0)
                if items == Fifteen_Min_Functions.highs:
                    for item in range(Fifteen_Min_Functions.highs.length - minlens):
                        Fifteen_Min_Functions.highs.pop(0)

        lens = []
        lens.append(len(Fifteen_Min_Functions.extendHist))
        lens.append(len(Fifteen_Min_Functions.extendHigh))
        lens.append(len(Fifteen_Min_Functions.extendLow))
        minlens = min(lens)
        lists = [Fifteen_Min_Functions.extendHist, Fifteen_Min_Functions.extendHigh, Fifteen_Min_Functions.extendLow]
        for items in lists:
            if len(items) > minlens:
                if items == Fifteen_Min_Functions.extendHist:
                    for item in range(Fifteen_Min_Functions.extendHist.length - minlens):
                        Fifteen_Min_Functions.extendHist.pop(0)
                if items == Fifteen_Min_Functions.extendLow:
                    for item in range(Fifteen_Min_Functions.extendLow.length - minlens):
                        Fifteen_Min_Functions.extendLow.pop(0)
                if items == Fifteen_Min_Functions.extendHigh:
                    for item in range(Fifteen_Min_Functions.extendHigh.length - minlens):
                        Fifteen_Min_Functions.extendHigh.pop(0)

class Two_Hour_Functions:
    multiplier = 0
    priceHist = []
    extendHist = []
    rejectionzones = []
    extendHigh = []
    extendLow = []
    resistance = 0
    support = 0
    timeperiods = {}
    vals = []
    price = 0
    maxes = []
    mins = []
    recentHisto = []
    highs = []
    lows = []

    @staticmethod
    def instrument_name():
        raw = fs.readFileSync('instrument.json')
        instrument = JSON.parse(raw)
        dataspecific = instrument['instrument']
        return dataspecific

    @staticmethod
    def HistoryAssigner():
        instrument = Two_Hour_Functions.instrument_name()
        try:
            response = supabase.from_('Two_Hour').select('Data').eq('Instrument', instrument).eq('OHLC', 'c')
            datas['Two_Hour']['c'] = response[0]['Data']
            response = supabase.from_('Two_Hour').select('Data').eq('Instrument', instrument).eq('OHLC', 'h')
            datas['Two_Hour']['h'] = response[0]['Data']
            response = supabase.from_('Two_Hour').select('Data').eq('Instrument', instrument).eq('OHLC', 'l')
            datas['Two_Hour']['l'] = response[0]['Data']
            response = supabase.from_('Two_Hour Extend').select('Data').eq('Instrument', instrument).eq('OHLC', 'c')
            datas['Two_Hour_Extend']['c'] = response[0]['Data']
            response = supabase.from_('Two_Hour Extend').select('Data').eq('Instrument', instrument).eq('OHLC', 'h')
            datas['Two_Hour_Extend']['h'] = response[0]['Data']
            response = supabase.from_('Two_Hour Extend').select('Data').eq('Instrument', instrument).eq('OHLC', 'l')
            datas['Two_Hour_Extend']['l'] = response[0]['Data']
        except error:
            print(error)

        lens = []
        Two_Hour_Functions.priceHist = datas['Two_Hour']['c']
        Two_Hour_Functions.highs = datas['Two_Hour']['h']
        Two_Hour_Functions.lows = datas['Two_Hour']['l']
        Two_Hour_Functions.extendHist = datas['Two_Hour']['c']
        Two_Hour_Functions.extendHigh = datas['Two_Hour']['h']
        Two_Hour_Functions.extendLow = datas['Two_Hour']['l']
        lens.append(len(Two_Hour_Functions.priceHist))
        lens.append(len(Two_Hour_Functions.highs))
        lens.append(len(Two_Hour_Functions.lows))
        minlens = min(lens)
        lists = [Two_Hour_Functions.priceHist, Two_Hour_Functions.highs, Two_Hour_Functions.lows]
        for items in lists:
            if len(items) > minlens:
                if items == Two_Hour_Functions.priceHist:
                    for item in range(Two_Hour_Functions.priceHist.length - minlens):
                        Two_Hour_Functions.priceHist.pop(0)
                if items == Two_Hour_Functions.lows:
                    for item in range(Two_Hour_Functions.lows.length - minlens):
                        Two_Hour_Functions.lows.pop(0)
                if items == Two_Hour_Functions.highs:
                    for item in range(Two_Hour_Functions.highs.length - minlens):
                        Two_Hour_Functions.highs.pop(0)

        lens = []
        lens.append(len(Two_Hour_Functions.extendHist))
        lens.append(len(Two_Hour_Functions.extendHigh))
        lens.append(len(Two_Hour_Functions.extendLow))
        minlens = min(lens)
        lists = [Two_Hour_Functions.extendHist, Two_Hour_Functions.extendHigh, Two_Hour_Functions.extendLow]
        for items in lists:
            if len(items) > minlens:
                if items == Two_Hour_Functions.extendHist:
                    for item in range(Two_Hour_Functions.extendHist.length - minlens):
                        Two_Hour_Functions.extendHist.pop(0)
                if items == Two_Hour_Functions.extendLow:
                    for item in range(Two_Hour_Functions.extendLow.length - minlens):
                        Two_Hour_Functions.extendLow.pop(0)
                if items == Two_Hour_Functions.extendHigh:
                    for item in range(Two_Hour_Functions.extendHigh.length - minlens):
                        Two_Hour_Functions.extendHigh.pop(0)

class Weekly_Functions:
    multiplier = 0
    priceHist = []
    extendHist = []
    rejectionzones = []
    extendHigh = []
    extendLow = []
    resistance = 0
    support = 0
    timeperiods = {}
    vals = []
    price = 0
    maxes = []
    mins = []
    recentHisto = []
    highs = []
    lows = []

    @staticmethod
    def instrument_name():
        raw = fs.readFileSync('instrument.json')
        instrument = JSON.parse(raw)
        dataspecific = instrument['instrument']
        return dataspecific

    @staticmethod
    def HistoryAssigner():
        instrument = Weekly_Functions.instrument_name()
        try:
            response = supabase.from_('Weekly').select('Data').eq('Instrument', instrument).eq('OHLC', 'c')
            datas['Weekly']['c'] = response[0]['Data']
            response = supabase.from_('Weekly').select('Data').eq('Instrument', instrument).eq('OHLC', 'h')
            datas['Weekly']['h'] = response[0]['Data']
            response = supabase.from_('Weekly').select('Data').eq('Instrument', instrument).eq('OHLC', 'l')
            datas['Weekly']['l'] = response[0]['Data']
            response = supabase.from_('Weekly Extend').select('Data').eq('Instrument', instrument).eq('OHLC', 'c')
            datas['Weekly_Extend']['c'] = response[0]['Data']
            response = supabase.from_('Weekly Extend').select('Data').eq('Instrument', instrument).eq('OHLC', 'h')
            datas['Weekly_Extend']['h'] = response[0]['Data']
            response = supabase.from_('Weekly Extend').select('Data').eq('Instrument', instrument).eq('OHLC', 'l')
            datas['Weekly_Extend']['l'] = response[0]['Data']
        except error:
            print(error)

        lens = []
        Weekly_Functions.priceHist = datas['Weekly']['c']
        Weekly_Functions.highs = datas['Weekly']['h']
        Weekly_Functions.lows = datas['Weekly']['l']
        Weekly_Functions.extendHist = datas['Weekly']['c']
        Weekly_Functions.extendHigh = datas['Weekly']['h']
        Weekly_Functions.extendLow = datas['Weekly']['l']
        lens.append(len(Weekly_Functions.priceHist))
        lens.append(len(Weekly_Functions.highs))
        lens.append(len(Weekly_Functions.lows))
        minlens = min(lens)
        lists = [Weekly_Functions.priceHist, Weekly_Functions.highs, Weekly_Functions.lows]
        for items in lists:
            if len(items) > minlens:
                if items == Weekly_Functions.priceHist:
                    for item in range(Weekly_Functions.priceHist.length - minlens):
                        Weekly_Functions.priceHist.pop(0)
                if items == Weekly_Functions.lows:
                    for item in range(Weekly_Functions.lows.length - minlens):
                        Weekly_Functions.lows.pop(0)
                if items == Weekly_Functions.highs:
                    for item in range(Weekly_Functions.highs.length - minlens):
                        Weekly_Functions.highs.pop(0)

        lens = []
        lens.append(len(Weekly_Functions.extendHist))
        lens.append(len(Weekly_Functions.extendHigh))
        lens.append(len(Weekly_Functions.extendLow))
        minlens = min(lens)
        lists = [Weekly_Functions.extendHist, Weekly_Functions.extendHigh, Weekly_Functions.extendLow]
        for items in lists:
            if len(items) > minlens:
                if items == Weekly_Functions.extendHist:
                    for item in range(Weekly_Functions.extendHist.length - minlens):
                        Weekly_Functions.extendHist.pop(0)
                if items == Weekly_Functions.extendLow:
                    for item in range(Weekly_Functions.extendLow.length - minlens):
                        Weekly_Functions.extendLow.pop(0)
                if items == Weekly_Functions.extendHigh:
                    for item in range(Weekly_Functions.extendHigh.length - minlens):
                        Weekly_Functions.extendHigh.pop(0)

class Five_Min_Functions:
    multiplier = 0
    priceHist = []
    extendHist = []
    rejectionzones = []
    extendHigh = []
    extendLow = []
    resistance = 0
    support = 0
    timeperiods = {}
    vals = []
    price = 0
    maxes = []
    mins = []
    recentHisto = []
    highs = []
    lows = []

    @staticmethod
    def instrument_name():
        raw = fs.readFileSync('instrument.json')
        instrument = JSON.parse(raw)
        dataspecific = instrument['instrument']
        return dataspecific

    @staticmethod
    def HistoryAssigner():
        instrument = Five_Min_Functions.instrument_name()
        try:
            response = supabase.from_('Five_Min').select('Data').eq('Instrument', instrument).eq('OHLC', 'c')
            datas['Five_Min']['c'] = response[0]['Data']
            response = supabase.from_('Five_Min').select('Data').eq('Instrument', instrument).eq('OHLC', 'h')
            datas['Five_Min']['h'] = response[0]['Data']
            response = supabase.from_('Five_Min').select('Data').eq('Instrument', instrument).eq('OHLC', 'l')
            datas['Five_Min']['l'] = response[0]['Data']
            response = supabase.from_('Five_Min Extend').select('Data').eq('Instrument', instrument).eq('OHLC', 'c')
            datas['Five_Min_Extend']['c'] = response[0]['Data']
            response = supabase.from_('Five_Min Extend').select('Data').eq('Instrument', instrument).eq('OHLC', 'h')
            datas['Five_Min_Extend']['h'] = response[0]['Data']
            response = supabase.from_('Five_Min Extend').select('Data').eq('Instrument', instrument).eq('OHLC', 'l')
            datas['Five_Min_Extend']['l'] = response[0]['Data']
        except error:
            print(error)

        lens = []
        Five_Min_Functions.priceHist = datas['Five_Min']['c']
        Five_Min_Functions.highs = datas['Five_Min']['h']
        Five_Min_Functions.lows = datas['Five_Min']['l']
        Five_Min_Functions.extendHist = datas['Five_Min']['c']
        Five_Min_Functions.extendHigh = datas['Five_Min']['h']
        Five_Min_Functions.extendLow = datas['Five_Min']['l']
        lens.append(len(Five_Min_Functions.priceHist))
        lens.append(len(Five_Min_Functions.highs))
        lens.append(len(Five_Min_Functions.lows))
        minlens = min(lens)
        lists = [Five_Min_Functions.priceHist, Five_Min_Functions.highs, Five_Min_Functions.lows]
        for items in lists:
            if len(items) > minlens:
                if items == Five_Min_Functions.priceHist:
                    for item in range(Five_Min_Functions.priceHist.length - minlens):
                        Five_Min_Functions.priceHist.pop(0)
                if items == Five_Min_Functions.lows:
                    for item in range(Five_Min_Functions.lows.length - minlens):
                        Five_Min_Functions.lows.pop(0)
                if items == Five_Min_Functions.highs:
                    for item in range(Five_Min_Functions.highs.length - minlens):
                        Five_Min_Functions.highs.pop(0)

        lens = []
        lens.append(len(Five_Min_Functions.extendHist))
        lens.append(len(Five_Min_Functions.extendHigh))
        lens.append(len(Five_Min_Functions.extendLow))
        minlens = min(lens)
        lists = [Five_Min_Functions.extendHist, Five_Min_Functions.extendHigh, Five_Min_Functions.extendLow]
        for items in lists:
            if len(items) > minlens:
                if items == Five_Min_Functions.extendHist:
                    for item in range(Five_Min_Functions.extendHist.length - minlens):
                        Five_Min_Functions.extendHist.pop(0)
                if items == Five_Min_Functions.extendLow:
                    for item in range(Five_Min_Functions.extendLow.length - minlens):
                        Five_Min_Functions.extendLow.pop(0)
                if items == Five_Min_Functions.extendHigh:
                    for item in range(Five_Min_Functions.extendHigh.length - minlens):
                        Five_Min_Functions.extendHigh.pop(0)

def center():
    One_Hour_Functions.HistoryAssigner()
    Four_Hour_Functions.HistoryAssigner()
    Daily_Functions.HistoryAssigner()
    Thirty_Min_Functions.HistoryAssigner()
    Fifteen_Min_Functions.HistoryAssigner()
    Two_Hour_Functions.HistoryAssigner()
    Weekly_Functions.HistoryAssigner()
    Five_Min_Functions.HistoryAssigner()

center()


