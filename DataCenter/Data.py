import requests
import json
import msgspec

accinfo = []
with open('accinfo.json', 'r') as accinf:
    accinfo = json.loads(accinf.read())
accinf.close()

session = requests.Session()

import os
from supabase import create_client, Client


url: str = "https://nvlbmpghemfunkpnhwee.supabase.co"
key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52bGJtcGdoZW1mdW5rcG5od2VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDgxMTg3ODcsImV4cCI6MjAyMzY5NDc4N30.woZOGh5WaEcUtEyvsXaNP3Kg6BsNP8UOWhmv5RG4iMY"
supabase: Client = create_client(url, key)


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
        query = {"count": 1000, "granularity": "M5"}
        response = session.get("https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles", headers = header, params = query)
        resp = response.json()['candles']
        values = []
        length = len(resp)
        response.close()
        for x in range(length):
            values.append(float(list(resp[x]['mid'].values())[3]))
        dict = {}
        dict[instrument] = values
        with open('idkeys.json', 'r') as inst:
            datas = json.load(inst)
        ids = datas[instrument + " Close"]
        data = supabase.table('Five_Min') \
            .update({'Data': values}) \
            .eq('id', ids) \
            .execute()
        return values

    @staticmethod
    def Fifteen_Min(instrument):
        accountID = str(accinfo[0])
        token = str(accinfo[1])
        header = {"Authorization": "Bearer "+token}
        query = {"count": 1000, "granularity": "M15"}
        response = session.get("https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles", headers = header, params = query)
        resp = response.json()['candles']
        values = []
        length = len(resp)
        response.close()
        for x in range(length):
            values.append(float(list(resp[x]['mid'].values())[3]))
        dict = {}
        dict[instrument] = values
        with open('idkeys.json', 'r') as inst:
            datas = json.load(inst)
        ids = datas[instrument + " Close"]
        data = supabase.table('Fifteen_Min') \
            .update({'Data': values}) \
            .eq('id', ids) \
            .execute()
        return(values)

    @staticmethod
    def Thirty_Min(instrument):
        accountID = str(accinfo[0])
        token = str(accinfo[1])
        header = {"Authorization": "Bearer "+token}
        query = {"count": 1000, "granularity": "M30"}
        response = session.get("https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles", headers = header, params = query)
        resp = response.json()['candles']
        values = []
        length = len(resp)
        response.close()
        for x in range(length):
            values.append(float(list(resp[x]['mid'].values())[3]))
        dict = {}
        dict[instrument] = values
        with open('idkeys.json', 'r') as inst:
            datas = json.load(inst)
        ids = datas[instrument + " Close"]
        data = supabase.table('Thirty_Min') \
            .update({'Data': values}) \
            .eq('id', ids) \
            .execute()
        return(values)

    @staticmethod
    def One_Hour(instrument):
        accountID = str(accinfo[0])
        token = str(accinfo[1])
        header = {"Authorization": "Bearer "+token}
        query = {"count": 1000, "granularity": "H1"}
        response = session.get("https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles", headers = header, params = query)
        resp = response.json()['candles']
        values = []
        length = len(resp)
        response.close()
        for x in range(length):
            values.append(float(list(resp[x]['mid'].values())[3]))
        dict = {}
        dict[instrument] = values
        with open('idkeys.json', 'r') as inst:
            datas = json.load(inst)
        ids = datas[instrument + " Close"]
        data = supabase.table('One_Hour') \
            .update({'Data': values}) \
            .eq('id', ids) \
            .execute()
        return(values)

    @staticmethod
    def Two_Hour(instrument):
        accountID = str(accinfo[0])
        token = str(accinfo[1])
        header = {"Authorization": "Bearer "+token}
        query = {"count": 1000, "granularity": "H2"}
        response = session.get("https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles", headers = header, params = query)
        resp = response.json()['candles']
        values = []
        length = len(resp)
        response.close()
        for x in range(length):
            values.append(float(list(resp[x]['mid'].values())[3]))
        dict = {}
        dict[instrument] = values
        with open('idkeys.json', 'r') as inst:
            datas = json.load(inst)
        ids = datas[instrument + " Close"]
        data = supabase.table('Two_Hour') \
            .update({'Data': values}) \
            .eq('id', ids) \
            .execute()
        return(values)

    @staticmethod
    def Four_Hour(instrument):
        accountID = str(accinfo[0])
        token = str(accinfo[1])
        header = {"Authorization": "Bearer "+token}
        query = {"count": 1000, "granularity": "H4"}
        response = session.get("https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles", headers = header, params = query)
        resp = response.json()['candles']
        values = []
        length = len(resp)
        response.close()
        for x in range(length):
            values.append(float(list(resp[x]['mid'].values())[3]))
        dict = {}
        dict[instrument] = values
        with open('idkeys.json', 'r') as inst:
            datas = json.load(inst)
        ids = datas[instrument + " Close"]
        data = supabase.table('Four_Hour') \
            .update({'Data': values}) \
            .eq('id', ids) \
            .execute()
        return(values)

    @staticmethod
    def Daily(instrument):
        accountID = str(accinfo[0])
        token = str(accinfo[1])
        header = {"Authorization": "Bearer "+token}
        query = {"count": 1000, "granularity": "D"}
        response = session.get("https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles", headers = header, params = query)
        resp = response.json()['candles']
        values = []
        length = len(resp)
        response.close()
        for x in range(length):
            values.append(float(list(resp[x]['mid'].values())[3]))
        dict = {}
        dict[instrument] = values
        with open('idkeys.json', 'r') as inst:
            datas = json.load(inst)
        ids = datas[instrument + " Close"]
        data = supabase.table('Daily') \
            .update({'Data': values}) \
            .eq('id', ids) \
            .execute()
        return(values)

    @staticmethod
    def Weekly(instrument):
        accountID = str(accinfo[0])
        token = str(accinfo[1])
        header = {"Authorization": "Bearer "+token}
        query = {"count": 1000, "granularity": "W"}
        response = session.get("https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles", headers = header, params = query)
        resp = response.json()['candles']
        values = []
        length = len(resp)
        response.close()
        for x in range(length):
            values.append(float(list(resp[x]['mid'].values())[3]))
        dict = {}
        dict[instrument] = values
        with open('idkeys.json', 'r') as inst:
            datas = json.load(inst)
        ids = datas[instrument + " Close"]
        data = supabase.table('Weekly') \
            .update({'Data': values}) \
            .eq('id', ids) \
            .execute()
        return(values)
    

# /* © 2022 Emraan Adem Ibrahim. See the license terms in the file 'license.txt' which should
# have been included with this distribution. */