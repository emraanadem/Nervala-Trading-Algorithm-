import threading
import json
import os
import msgspec
import Transmission
import time

accinfo = []
with open("instrument.json", 'rb') as inst:
    instrum = msgspec.json.decode(inst.read(), type=object)  
    instrument = instrum['instrument']
    
class Auto:
    
    inst = ''
    instrument_bank = ["XAU_USD", "EUR_USD", "NAS100_USD", "GBP_JPY", "US30_USD", "GBP_USD", 
    "SPX500_USD", "USD_JPY", "AUD_USD", "USD_CAD", "EUR_JPY", "AUD_JPY", "NZD_USD", "XAG_USD", 
    "GBP_AUD", "USD_CHF", "EUR_GBP", "EUR_AUD", "CAD_JPY", "EUR_CAD", "AUD_CAD", "GBP_CAD", 
    "NZD_JPY", "EUR_NZD", "AUD_CHF", "EUR_CHF", "GBP_CHF", "NZD_CAD", "AUD_NZD", 
    "USD_TRY", "CHF_JPY", "CAD_CHF", "GBP_NZD", "BCO_USD","WTICO_USD", "NZD_CHF", "USD_INR", "BTC_USD",
    "USD_SGD", "USD_ZAR", "USD_SEK", "USD_MXN", "USD_PLN", "USD_HUF", "USD_NOK", "USD_CZK", "USD_DKK", 
    "USD_HKD", "USD_SAR", "EUR_HUF", "USD_CNH", "EUR_TRY", "ZAR_JPY", "SGD_JPY", "EUR_PLN", "GBP_HKD", 
    "AUD_SGD", "EUR_SGD", "GBP_SGD", "GBP_ZAR", "ETH_USD", "LTC_USD", "BCH_USD", "MBTC_USD", 
    "JP225Y_JPY", "EU50_EUR", "FR40_EUR", "SG30_SGD", "NL25_EUR", "TWIX_USD", "GBP_PLN", "XAU_EUR", 
    "XAU_AUD", "XAU_SGD", "XAU_JPY", "XAG_JPY", "TRY_JPY", "SGD_CHF", "SGD_HKD", 
    "HKD_JPY", "CAD_HKD", "CAD_SGD", "CHF_ZAR", "CHF_HKD", "IN50_USD", "NZD_HKD"]

    @staticmethod
    def controll(instrument):
        dict = {}
        dict['instrument list'] = Auto.instrument_bank
        dict2 = {}
        dict2['instrument'] = instrument
        with open('inst_list.json', 'w') as inst:
            json.dump(dict, inst)
        with open('instrument.json', 'w') as inst:
            json.dump(dict2, inst)
        instr = Auto.inst
        q = 0
        i = 0
        while i == 0:
            if instrument in Auto.instrument_bank:
                break
            else:
                c = 1
                if c == 1:
                    instr = Auto.inst
                    instrument = instr.upper()
                    if instrument in Auto.instrument_bank:
                        break
                c+= c
                instr = Auto.inst
                instrument = instr.upper()
                if instrument in Auto.instrument_bank:
                    break
        import Motor22, Motor32, Motor42, Motor12, Motor52, Motor1Extend2, Motor2Extend2, Motor3Extend2, Motor5Extend2
        Motor42.controller()
        Motor12.controller()
        Motor22.controller()
        Motor32.controller()
        Motor52.controller()
        Motor1Extend2.controller()
        Motor2Extend2.controller()
        Motor3Extend2.controller()
        Motor5Extend2.controller()
        i = 0
        while i == 0:
            inst2 = open('Data.json', 'rb')
            instrum = msgspec.json.decode(inst2.read(), type=object)                
            instrumen = next(iter(instrum))
            print(instrumen)
            if len(instrumen) > 1:
                 break
        datainst = next(iter(instrum))
        while i == 0:
            inst2 = open('High.json', 'rb')
            instrum = msgspec.json.decode(inst2.read(), type=object)                
            instrumen = next(iter(instrum))
            print(instrumen)
            if len(instrumen) > 1:
                 break
        highinst = next(iter(instrum))
        while i == 0:
            inst2 = open('Low.json', 'rb')
            instrum = msgspec.json.decode(inst2.read(), type=object)                
            instrumen = next(iter(instrum))
            print(instrumen)
            if len(instrumen) > 1:
                 break
        lowinst = next(iter(instrum))
        while i == 0:
            inst2 = open('Open.json', 'rb')
            instrum = msgspec.json.decode(inst2.read(), type=object)                
            instrumen = next(iter(instrum))
            print(instrumen)
            if len(instrumen) > 1:
                 break
            
        openinst = next(iter(instrum))
        while i == 0:
            inst2 = open('DataExtend.json', 'rb')
            instrum = msgspec.json.decode(inst2.read(), type=object)                
            instrumen = next(iter(instrum))
            print(instrumen)
            if len(instrumen) > 1:
                 break
           
        dataextendinst = next(iter(instrum))
        while i == 0:
            inst2 = open('HighExtend.json', 'rb')
            instrum = msgspec.json.decode(inst2.read(), type=object)                
            instrumen = next(iter(instrum))
            print(instrumen)
            if len(instrumen) > 1:
                 break
        highextendinst = next(iter(instrum))
        while i == 0:
            inst2 = open('LowExtend.json', 'rb')
            instrum = msgspec.json.decode(inst2.read(), type=object)                
            instrumen = next(iter(instrum))
            print(instrumen)
            if len(instrumen) > 1:
                 break
        lowextendinst = next(iter(instrum))
        while i == 0:
            inst2 = open('OpenExtend.json', 'rb')
            instrum = msgspec.json.decode(inst2.read(), type=object)                
            instrumen = next(iter(instrum))
            print(instrumen)
            if len(instrumen) > 1:
                 break
        openextendinst = next(iter(instrum))
        while i == 0:
            if (instrument == datainst and instrument == highinst and instrument == lowinst 
            and instrument == dataextendinst and instrument == highextendinst and instrument == lowextendinst 
            and instrument == openinst and instrument == openextendinst):
                print('Successfully Loading Program for ' + instrument + ': ')
                print('\n')
                os.system('node Daily3.js')
                print('\n')
                os.system('node FifteenMin3.js')
                print('\n')
                os.system('node FourHour3.js')
                print('\n')
                os.system('node OneHour3.js')
                print('\n')
                os.system('node ThirtyMin3.js')
                print('\n')
                os.system('node TwoHour3.js')
                print('\n')
                os.system('node Weekly3.js')
                os.kill
                break


class Automatically:

    @staticmethod
    def automatic():
        inst_bank = Auto.instrument_bank
        for instrument in inst_bank:
            print(instrument + " Signals: ")
            Auto.controll(instrument)


Automatically.automatic()

# /* © 2022 Emraan Adem Ibrahim. See the license terms in the file 'license.txt' which should
# have been included with this distribution. */