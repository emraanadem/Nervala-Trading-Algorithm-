import os
from timeloop import Timeloop
import subprocess
import threading
import msgspec
import json
import shutil
import csv
import time
from datetime import timedelta
from flask import *
from datetime import date

today = date.today()

app = Flask(__name__)

tl = Timeloop()

class Starters:
    stocklist = ['MMM', 'AOS', 'ABT', 'ABBV', 'ACN', 'ADBE', 'AMD', 'AES', 'AFL', 'A', 'APD', 'ABNB', 'AKAM', 'ALB', 
                 'ARE', 'ALGN', 'ALLE', 'LNT', 'ALL', 'GOOGL', 'GOOG', 'MO', 'AMZN', 'AMCR', 'AEE', 'AAL', 'AEP', 
                 'AXP', 'AIG', 'AMT', 'AWK', 'AMP', 'AME', 'AMGN', 'APH', 'ADI', 'ANSS', 'AON', 'APA', 'AAPL', 
                 'AMAT', 'APTV', 'ACGL', 'ADM', 'ANET', 'AJG', 'AIZ', 'T', 'ATO', 'ADSK', 'ADP', 'AZO', 'AVB', 
                 'AVY', 'AXON', 'BKR', 'BALL', 'BAC', 'BK', 'BBWI', 'BAX', 'BDX', 'BRK.B', 'BBY', 'BIO', 'TECH', 
                 'BIIB', 'BLK', 'BX', 'BA', 'BKNG', 'BWA', 'BXP', 'BSX', 'BMY', 'AVGO', 'BR', 'BRO', 'BF.B', 'BLDR', 
                 'BG', 'CDNS', 'CZR', 'CPT', 'CPB', 'COF', 'CAH', 'KMX', 'CCL', 'CARR', 'CTLT', 'CAT', 'CBOE', 'CBRE', 
                 'CDW', 'CE', 'COR', 'CNC', 'CNP', 'CDAY', 'CF', 'CHRW', 'CRL', 'SCHW', 'CHTR', 'CVX', 'CMG', 'CB', 'CHD', 
                 'CI', 'CINF', 'CTAS', 'CSCO', 'C', 'CFG', 'CLX', 'CME', 'CMS', 'KO', 'CTSH', 'CL', 'CMCSA', 'CMA', 'CAG', 
                 'COP', 'ED', 'STZ', 'CEG', 'COO', 'CPRT', 'GLW', 'CTVA', 'CSGP', 'COST', 'CTRA', 'CCI', 'CSX', 'CMI', 'CVS', 
                 'DHR', 'DRI', 'DVA', 'DE', 'DAL', 'XRAY', 'DVN', 'DXCM', 'FANG', 'DLR', 'DFS', 'DG', 'DLTR', 'D', 'DPZ', 'DOV', 
                 'DOW', 'DHI', 'DTE', 'DUK', 'DD', 'EMN', 'ETN', 'EBAY', 'ECL', 'EIX', 'EW', 'EA', 'ELV', 'LLY', 'EMR', 'ENPH', 
                 'ETR', 'EOG', 'EPAM', 'EQT', 'EFX', 'EQIX', 'EQR', 'ESS', 'EL', 'ETSY', 'EG', 'EVRG', 'ES', 'EXC', 'EXPE', 'EXPD', 
                 'EXR', 'XOM', 'FFIV', 'FDS', 'FICO', 'FAST', 'FRT', 'FDX', 'FIS', 'FITB', 'FSLR', 'FE', 'FI', 'FLT', 'FMC', 'F', 
                 'GILD', 'GPN', 'GL', 'GS', 'HAL', 'HIG', 'HAS', 'HCA', 'PEAK', 'HSIC', 'HSY', 'HES', 'HPE', 'HLT', 'HOLX', 'HD', 
                 'HON', 'HRL', 'HST', 'HWM', 'HPQ', 'HUBB', 'HUM', 'HBAN', 'HII', 'IBM', 'IEX', 'IDXX', 'ITW', 'ILMN', 'INCY', 'IR', 
                 'PODD', 'INTC', 'ICE', 'IFF', 'IP', 'IPG', 'INTU', 'ISRG', 'IVZ', 'INVH', 'IQV', 'IRM', 'JBHT', 'JBL', 'JKHY', 'J', 
                 'JNJ', 'JCI', 'JPM', 'JNPR', 'K', 'KVUE', 'KDP', 'KEY', 'KEYS', 'KMB', 'KIM', 'KMI', 'KLAC', 'KHC', 'KR', 'LHX', 'LH',
                   'LRCX', 'LW', 'LVS', 'LDOS', 'LEN', 'LIN', 'LYV', 'LKQ', 'LMT', 'L', 'LOW', 'LULU', 'LYB', 'MTB', 'MRO', 'MPC', 'MKTX',
                     'MAR', 'MMC', 'MLM', 'MAS', 'MA', 'MTCH', 'MKC', 'MCD', 'MCK', 'MDT', 'MRK', 'META', 'MET', 'MTD', 'MGM', 'MCHP', 'MU', 
                     'MSFT', 'MAA', 'MRNA', 'MHK', 'MOH', 'TAP', 'MDLZ', 'MPWR', 'MNST', 'MCO', 'MS', 'MOS', 'MSI', 'MSCI', 'NDAQ',
                       'NTAP', 'NFLX', 'NEM', 'NWSA', 'NWS', 'NEE', 'NKE', 'NI', 'NDSN', 'NSC', 'NTRS', 'NOC', 'NCLH', 'NRG', 'NUE',
                         'NVDA', 'NVR', 'NXPI', 'ORLY', 'OXY', 'ODFL', 'OMC', 'ON', 'OKE', 'ORCL', 'OTIS', 'PCAR', 'PKG', 'PANW', 'PARA', 
                         'PH', 'PAYX', 'PAYC', 'PYPL', 'PNR', 'PEP', 'PFE', 'PCG', 'PM', 'PSX', 'PNW', 'PXD', 'PNC', 'POOL', 'PPG', 'PPL', 
                         'PFG', 'PG', 'PGR', 'PLD', 'PRU', 'PEG', 'PTC', 'PSA', 'PHM', 'QRVO', 'PWR', 'QCOM', 'DGX', 'RL', 'RJF', 'RTX', 'O',
                           'REG', 'REGN', 'RF', 'RSG', 'RMD', 'RVTY', 'RHI', 'ROK', 'ROL', 'ROP', 'ROST', 'RCL', 'SPGI', 'CRM', 'SBAC', 'SLB', 
                           'STX', 'SRE', 'NOW', 'SHW', 'SPG', 'SWKS', 'SJM', 'SNA', 'SO', 'LUV', 'SWK', 'SBUX', 'STT', 'STLD', 'STE', 'SYK', 
                           'SYF', 'SNPS', 'SYY', 'TMUS', 'TROW', 'TTWO', 'TPR', 'TRGP', 'TGT', 'TEL', 'TDY', 'TFX', 'TER', 'TSLA', 'TXN', 'TXT',
                             'TMO', 'TJX', 'TSCO', 'TT', 'TDG', 'TRV', 'TRMB', 'TFC', 'TYL', 'TSN', 'USB', 'UBER', 'UDR', 'ULTA', 'UNP', 'UAL', 
                             'UPS', 'URI', 'UNH', 'UHS', 'VLO', 'VTR', 'VLTO', 'VRSN', 'VRSK', 'VZ', 'VRTX', 'VFC', 'VTRS', 'VICI', 'V', 'VMC', 
                             'WRB', 'WAB', 'WBA', 'WMT', 'DIS', 'WBD', 'WM', 'WAT', 'WEC', 'WFC', 'WELL', 'WST', 'WDC', 'WRK', 'WY', 'WHR', 'WMB', 
                             'WTW', 'GWW', 'WYNN', 'XEL', 'XYL', 'YUM', 'ZBRA', 'ZBH', 'ZION', 'ZTS']
    instrument_bank = []
    instrument_list = []
    banktwo = []
    current_val = ''
    current_dir = os.getcwd()
    accinfo = []
    paths = []
    importantinfo = []

    def begin(val):
        import pathlib
        path = str(pathlib.Path(__file__).parent.resolve())
        acclist = []
        with open(path + '/accounts.txt', 'r') as infor:
            datas = list(csv.reader(infor, delimiter = ' '))
            for row in datas:
                Starters.accinfo.append([str(row[0]), str(row[1])])
        redo = True
        Starters.current_val = val
        pathtwo = str(pathlib.Path(__file__).parent.resolve()) + "/" + val + "_Analysis"
        #path = str(pathlib.Path(__file__).parent.resolve()) + "/" + val
        if os.path.isdir(pathtwo):
            dict = {}
            dict['instrument'] = val
            with open(pathtwo + '/instrument.json', 'w') as inst:
                inst.write(json.dumps(dict))
        else:
            os.mkdir(pathtwo)
            orig_path = str(pathlib.Path(__file__).parent.resolve()) + "/Analysis"
            for files in os.listdir(orig_path):
                if os.path.isdir(orig_path + "/" + files):
                    if (os.path.isdir(pathtwo + "/" + files)) == True:
                        os.rmdir(pathtwo + "/" + files)
                    shutil.copytree(orig_path + "/" + files, pathtwo + "/" + files)
                else:
                    try:
                        shutil.copy(orig_path + "/"+files, pathtwo)
                    except:
                        q = 0
            dict = {}
            dict['instrument'] = val
            with open(pathtwo + '/instrument.json', 'w') as inst:
                inst.write(json.dumps(dict))
           
        import pathlib
        path = str(pathlib.Path(__file__).parent.resolve()) + "/" + val + "_Analysis"
        #path = str(pathlib.Path(__file__).parent.resolve()) + "/" + val
        Starters.importantinfo.append([path, val])

    def starting(path, current_val):
        path = str(current_val) + "_Analysis"
        with open(path + '/pythoner' + current_val + ".py", "w+") as file:
            file.write('\nimport sparkerStocks as starttt' + "\nstarttt.Automatically.automatic()")
            file.close()
        threading.Thread(target=Starters.initiator, args = [path, current_val]).start()
        if current_val in Starters.banktwo:
            Starters.banktwo.remove(current_val)

    def initiator(path, current_val):
        subprocess.Popen('cd ' + path + ';' + 'python3 pythoner' + current_val + ".py", shell = True)

# git clone https://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@github.com/emraanadem/Project_Sampi.git
# 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
#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
#@app.route("/")
def homepage():
    return Starters.begin()

def borjan():
    #from waitress import serve
    #app.run(host="0.0.0.0", port=4073, use_reloader = False)
    notinst = {}
    notinst['insts'] = []
    notssss = {}
    notssss['instruments'] = []
    threads = []
    with open('not instruments.json', 'w') as nots:
        nots.write(json.dumps(notinst))
    with open('StockInstruments.json', 'rb') as insts:
            instrum = msgspec.json.decode(insts.read(), type=object)
            info = instrum['instruments']
            Starters.instrument_bank = info
    with open('avoidinst.json', 'w+') as instss:
            instss.write(json.dumps(notssss))
    threadsss = []
    for val in Starters.instrument_bank:
        t = threading.Thread(target=Starters.begin, args = [val])
        t.start()
        threadsss.append(t)
    for thread in threadsss:
        thread.join()
    pointer = 0
    while pointer < len(Starters.instrument_bank):
        threads = []
        for num in range(0, len(Starters.importantinfo)):
            if pointer < len(Starters.importantinfo):  
                try:
                    t = threading.Thread(target=Starters.starting, args = [Starters.importantinfo[pointer][0], Starters.importantinfo[pointer][1]])
                    t.start()
                    threads.append([t, Starters.importantinfo[pointer][1]])
                    pointer += 1
                except Exception as error:
                    print(error)
        for threads in threads:
            threads[0].join()

# /* © 2022 Emraan Adem Ibrahim. See the license terms in the file 'license.txt' which should
# have been included with this distribution. */

