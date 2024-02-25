import requests
import json
import os
import sys
from supabase import create_client, Client

url = "https://nvlbmpghemfunkpnhwee.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52bGJtcGdoZW1mdW5rcG5od2VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDgxMTg3ODcsImV4cCI6MjAyMzY5NDc4N30.woZOGh5WaEcUtEyvsXaNP3Kg6BsNP8UOWhmv5RG4iMY"
supabase: Client = create_client(url, key)

timeperiods = ['Five_Min', 'Fifteen_Min', 'Thirty_Min', 'One_Hour', 'Two_Hour', 'Four_Hour', 'Daily', 'Weekly', 'Five_Min Extend', 'Fifteen_Min Extend', 'Thirty_Min Extend', 'One_Hour Extend', 'Two_Hour Extend', 'Four_Hour Extend', 'Daily Extend', 'Weekly Extend']

datas = {}
datas['Five_Min'] = {}
datas['Five_Min']['c'] = []
datas['Five_Min']['h'] = []
datas['Five_Min']['l'] = []
datas['Five_Min Extend'] = {}
datas['Five_Min Extend']['c'] = []
datas['Five_Min Extend']['h'] = []
datas['Five_Min Extend']['l'] = []
datas['Fifteen_Min'] = {}
datas['Fifteen_Min']['c'] = []
datas['Fifteen_Min']['h'] = []
datas['Fifteen_Min']['l'] = []
datas['Fifteen_Min Extend'] = {}
datas['Fifteen_Min Extend']['c'] = []
datas['Fifteen_Min Extend']['h'] = []
datas['Fifteen_Min Extend']['l'] = []
datas['Thirty_Min'] = {}
datas['Thirty_Min']['c'] = []
datas['Thirty_Min']['h'] = []
datas['Thirty_Min']['l'] = []
datas['Thirty_Min Extend'] = {}
datas['Thirty_Min Extend']['c'] = []
datas['Thirty_Min Extend']['h'] = []
datas['Thirty_Min Extend']['l'] = []
datas['One_Hour'] = {}
datas['One_Hour']['c'] = []
datas['One_Hour']['h'] = []
datas['One_Hour']['l'] = []
datas['One_Hour Extend'] = {}
datas['One_Hour Extend']['c'] = []
datas['One_Hour Extend']['h'] = []
datas['One_Hour Extend']['l'] = []
datas['Two_Hour'] = {}
datas['Two_Hour']['c'] = []
datas['Two_Hour']['h'] = []
datas['Two_Hour']['l'] = []
datas['Two_Hour Extend'] = {}
datas['Two_Hour Extend']['c'] = []
datas['Two_Hour Extend']['h'] = []
datas['Two_Hour Extend']['l'] = []
datas['Four_Hour'] = {}
datas['Four_Hour']['c'] = []
datas['Four_Hour']['h'] = []
datas['Four_Hour']['l'] = []
datas['Four_Hour Extend'] = {}
datas['Four_Hour Extend']['c'] = []
datas['Four_Hour Extend']['h'] = []
datas['Four_Hour Extend']['l'] = []
datas['Daily'] = {}
datas['Daily']['c'] = []
datas['Daily']['h'] = []
datas['Daily']['l'] = []
datas['Daily Extend'] = {}
datas['Daily Extend']['c'] = []
datas['Daily Extend']['h'] = []
datas['Daily Extend']['l'] = []
datas['Weekly'] = {}
datas['Weekly']['c'] = []
datas['Weekly']['h'] = []
datas['Weekly']['l'] = []
datas['Weekly Extend'] = {}
datas['Weekly Extend']['c'] = []
datas['Weekly Extend']['h'] = []
datas['Weekly Extend']['l'] = []

def begin():
    with open('instrumentsthree.json', 'r') as inst:
        instrum = json.load(inst)
        instlist = instrum['instruments']
    for instrument in instlist:
        for period in timeperiods:
            datas[period]['c'] = supabase.table(period).select('Data').eq('Instrument', instrument).eq('OHLC', 'c').execute().data[0]['Data']
            datas[period]['h'] = supabase.table(period).select('Data').eq('Instrument', instrument).eq('OHLC', 'h').execute().data[0]['Data']
            datas[period]['l'] = supabase.table(period).select('Data').eq('Instrument', instrument).eq('OHLC', 'l').execute().data[0]['Data']
            flasker(instrument)

def flasker(instrument):
    with open('IDS.json', 'r') as inst:
        instrum = json.load(inst)
        id = instrum[instrument]
    from flask import Flask
    cli = sys.modules['flask.cli']
    cli.show_server_banner = lambda *x: None
    app = Flask(__name__)
    @app.route('/')
    def hello_world():
        return datas
    app.run(port=id)
