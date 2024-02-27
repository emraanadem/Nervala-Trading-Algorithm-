import json
import threading
from supabase import create_client, Client
url = "https://nvlbmpghemfunkpnhwee.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52bGJtcGdoZW1mdW5rcG5od2VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDgxMTg3ODcsImV4cCI6MjAyMzY5NDc4N30.woZOGh5WaEcUtEyvsXaNP3Kg6BsNP8UOWhmv5RG4iMY"
supabase: Client = create_client(url, key)

timeperiods = ['Five_Min', 'Fifteen_Min', 'Thirty_Min', 'One_Hour', 'Two_Hour', 'Four_Hour', 'Daily', 'Weekly', 'Five_Min Extend', 'Fifteen_Min Extend', 'Thirty_Min Extend', 'One_Hour Extend', 'Two_Hour Extend', 'Four_Hour Extend', 'Daily Extend', 'Weekly Extend']




with open('instruments.json', 'r') as instr:
   instruments = json.loads(instr.read())['instruments']

datas = {}
def organizer():
    for inst in instruments:
        threading.Thread(target=assigner, args = [inst]).start()

def assigner(inst):
    datas[inst] = {}
    for period in timeperiods:
        datas[inst][period] = {}
        datas[inst][period]['c'] = supabase.table(period).select('Data').eq('Instrument', inst).eq('OHLC', 'c').execute().data[0]['Data']
        datas[inst][period]['h'] = supabase.table(period).select('Data').eq('Instrument', inst).eq('OHLC', 'h').execute().data[0]['Data']
        datas[inst][period]['l'] = supabase.table(period).select('Data').eq('Instrument', inst).eq('OHLC', 'l').execute().data[0]['Data']
