import json
import os
import msgspec
import threading
from subprocess import Popen, PIPE

class Auto:
    
    inst = ''
    instrument_bank = ['XAU_USD', 'EUR_USD', 'NAS100_USD', 'GBP_JPY', 'US30_USD', 'GBP_USD', 
    'SPX500_USD', 'USD_JPY', 'AUD_USD', 'USD_CAD', 'EUR_JPY', 'AUD_JPY', 'NZD_USD', 'XAG_USD', 
    'GBP_AUD', 'USD_CHF', 'EUR_GBP', 'EUR_AUD', 'CAD_JPY', 'EUR_CAD', 'AUD_CAD', 'GBP_CAD', 
    'JP225_USD', 'NZD_JPY', 'EUR_NZD', 'DE30_EUR', 'USD_THB', 'AUD_CHF', 'EUR_CHF', 'GBP_CHF', 
    'NZD_CAD', 'AUD_NZD', 'USD_TRY', 'CHF_JPY', 'CAD_CHF', 'XPT_USD', 'GBP_NZD', 'BCO_USD', 
    'CN50_USD', 'HK33_HKD', 'WTICO_USD', 'XPD_USD', 'AU200_AUD', 'NZD_CHF', 'USD_INR', 'BTC_USD', 
    'US2000_USD', 'UK100_GBP', 'SUGAR_USD', 'USD_SGD', 'USD_ZAR', 'USD_SEK', 'USD_MXN', 'USD_PLN', 
    'USD_HUF', 'USD_NOK', 'USD_CZK', 'USD_DKK', 'USD_HKD', 'USD_SAR', 'EUR_HUF', 'USD_CNH', 'EUR_TRY', 
    'ZAR_JPY', 'SGD_JPY', 'EUR_PLN', 'GBP_HKD', 'AUD_SGD', 'EUR_SGD', 'GBP_SGD', 'GBP_ZAR', 'ETH_USD',
    'LTC_USD', 'BCH_USD', 'MBTC_USD', 'JP225Y_JPY', 'EU50_EUR', 'FR40_EUR', 'SG30_SGD', 'NL25_EUR',
    'TWIX_USD', 'GBP_PLN', 'XAU_EUR', 'XAU_AUD', 'XAU_SGD', 'XAU_XAG', 'XAU_GBP', 'XAU_JPY', 'XAG_EUR',
    'XAU_CHF', 'XAG_AUD', 'XAU_CAD', 'XAG_GBP', 'XAU_NZD', 'XAG_CAD', 'XAG_CHF', 'XAG_SGD', 'XAG_JPY', 
    'XAG_NZD', 'XAU_HKD', 'XAG_HKD', 'CH20_CHF', 'CHINAH_HKD', 'ESPIX_EUR', 'TRY_JPY', 'UK10YB_GBP',
    'SGD_CHF', 'SGD_HKD', 'DE10YB_EUR', 'HKD_JPY', 'CAD_HKD', 'CAD_SGD', 'CHF_ZAR', 'CHF_HKD', 'IN50_USD', 
    'NZD_HKD']

    @staticmethod
    def controll():
        dict = {}
        instrument = ''
        dict['instrument list'] = Auto.instrument_bank
        with open('inst_list.json', 'w') as inst:
            json.dump(dict, inst)
        with open('instrument.json', 'r') as accinf:
            instrum = json.load(accinf)
            instrument = str(instrum['instrument'])
            Auto.inst = instrument
        import MotorStocks, Motor3Stocks, Motor4Stocks, MotorStocks2, Motor5Stocks, MotorStocksExtend, MotorStocks2Extend, Motor3ExtendStocks, Motor5ExtendStocks
        Motor4Stocks.controller()
        MotorStocks.controller()
        MotorStocks2.controller()
        Motor3Stocks.controller()
        Motor5Stocks.controller()
        MotorStocksExtend.controller()
        MotorStocks2Extend.controller()
        Motor3ExtendStocks.controller()
        Motor5ExtendStocks.controller()

    @staticmethod
    def junction():
        listse = ['node FifteenMin3.js', 'node ThirtyMin3.js', 'node OneHour3.js', 'node TwoHour3.js', 'node FourHour3.js', 'node Daily3.js', 'node Weekly3.js']
        def commander():
            for item in listse:
                Popen(item, shell = True).communicate()
        threading.Thread(target=commander).start()


class Automatically:

    @staticmethod
    def automatic():
        Auto.controll()


# /* © 2022 Emraan Adem Ibrahim. See the license terms in the file 'license.txt' which should
# have been included with this distribution. */

# /* © 2022 Emraan Adem Ibrahim. See the license terms in the file 'license.txt' which should
# have been included with this distribution. */