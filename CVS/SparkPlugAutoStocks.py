import threading
import json
import msgspec
import os
import time

with open('instrument.json', 'rb') as accinf:
     instrum = msgspec.json.decode(accinf.read(), type=object)
     instrumentt = instrum['instrument']

class Auto:
    
    inst = ''
    instrument_bank = ['AMD']
    instrument_banks = ['NVDA', 'AAPL', 'GOOG', 'MSFT', 'AMD', 'INTC', 'ORCL', 'CSCO', 'ADBE', 'TEAM', 
                        'HPE', 'DELL', 'META', 'DASH', 'AMZN', 'TSLA', 'PYPL', 'EA', 'BABA', 'YELP', 
                        'ZG', 'BAC', 'PFE', 'KO', 'DAL', 'DFS', 'TMO', 'TGT', 'DIS', 'GOOGL']

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
        import Motor22Stocks, Motor32Stocks, Motor42Stocks, Motor12Stocks, Motor52Stocks, Motor1StocksExtend2, Motor2StocksExtend2, Motor3Extend2Stocks, Motor5ExtendStocks2
        Motor42Stocks.controller()
        Motor12Stocks.controller()
        Motor22Stocks.controller()
        Motor32Stocks.controller()
        Motor52Stocks.controller()
        Motor1StocksExtend2.controller()
        Motor2StocksExtend2.controller()
        Motor3Extend2Stocks.controller()
        Motor5ExtendStocks2.controller()
        i = 0
        while i == 0:
            with open('Data.json', 'rb') as inst:
                instrum = msgspec.json.decode(inst.read(), type=object)                
                instrumen = next(iter(instrum))
                if len(instrumen) > 1:
                    break
                
        datainst = next(iter(instrum))
        while i == 0:
            with open('High.json', 'rb') as inst2:
                instrum = msgspec.json.decode(inst2.read(), type=object)                
                instrumen = next(iter(instrum))
                if len(instrumen) > 1:
                    break

        highinst = next(iter(instrum))
        while i == 0:
            with open('Low.json', 'rb') as inst3:
                instrum = msgspec.json.decode(inst3.read(), type=object)                
                instrumen = next(iter(instrum))
                if len(instrumen) > 1:
                    break

        lowinst = next(iter(instrum))
        while i == 0:
            with open('Open.json', 'rb') as inst4:
                instrum = msgspec.json.decode(inst4.read(), type=object)                
                instrumen = next(iter(instrum))
                if len(instrumen) > 1:
                    break
            
        openinst = next(iter(instrum))
        while i == 0:
            with open('DataExtend.json', 'rb') as inst:
                instrum = msgspec.json.decode(inst.read(), type=object)                
                instrumen = next(iter(instrum))
                if len(instrumen) > 1:
                    break
           
        dataextendinst = next(iter(instrum))
        while i == 0:
            with open('HighExtend.json', 'rb') as inst2:
                instrum = msgspec.json.decode(inst2.read(), type=object)                
                instrumen = next(iter(instrum))
                if len(instrumen) > 1:
                    break

        highextendinst = next(iter(instrum))
        while i == 0:
                with open('LowExtend.json', 'rb') as inst3:
                    instrum = msgspec.json.decode(inst3.read(), type=object)                
                    instrumen = next(iter(instrum))
                    if len(instrumen) > 1:
                        break

        lowextendinst = next(iter(instrum))
        while i == 0:
                with open('OpenExtend.json', 'rb') as inst4:
                    instrum = msgspec.json.decode(inst4.read(), type=object)                
                    instrumen = next(iter(instrum))
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

