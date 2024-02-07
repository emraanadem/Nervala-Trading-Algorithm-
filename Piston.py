import os
import msgspec
import time
from timeloop import Timeloop
import subprocess
import threading
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

    instrument_bank = []
    instrument_list = []
    banktwo = []
    current_val = ''
    current_dir = os.getcwd()
    accinfo = []
    paths = []
    importantinfo = []
    impinfo = []
    evenmoreimpinfo = []

    def begin(val):
        import pathlib
        path = str(pathlib.Path(__file__).parent.resolve())
        acclist = []
        with open(path + '/accounts2.txt', 'r') as infor:
            datas = list(csv.reader(infor, delimiter = ' '))
            rowid = 0
            for row in datas:
                Starters.accinfo.append([str(row[0]), str(row[1]), rowid])
                rowid+=1 
        redo = True
        Starters.current_val = val
        pathtwo = str(pathlib.Path(__file__).parent.resolve()) + "/" + val
        #path = str(pathlib.Path(__file__).parent.resolve()) + "/" + val
        if os.path.isdir(pathtwo):
            dict = {}
            dict['instrument'] = val
            with open(pathtwo + '/instrument.json', 'w') as inst:
                json.dump(dict, inst)
            for valss in Starters.accinfo:
                for vals in Starters.impinfo:
                    if valss[2] == vals[1]:
                        Starters.evenmoreimpinfo.append([valss[0],valss[1],vals[0]])
                        with open(pathtwo + '/accinfo.json', 'w') as inst:
                            lists = [valss[0],valss[1]]
                            json.dump(lists, inst)
                        Starters.evenmoreimpinfo = []
        else:
            os.mkdir(pathtwo)
            orig_path = str(pathlib.Path(__file__).parent.resolve()) + "/Emraan"
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
                json.dump(dict, inst)
            for valss in Starters.accinfo:
                for vals in Starters.impinfo:
                    if valss[2] == vals[1]:
                        Starters.evenmoreimpinfo.append([valss[0],valss[1],vals[0]])
                        with open(pathtwo + '/accinfo.json', 'w') as inst:
                                json.dump([valss[0],valss[1]], inst)
                        Starters.evenmoreimpinfo = []
        import pathlib
        print(val)
        path = str(pathlib.Path(__file__).parent.resolve()) + "/" + val
        #path = str(pathlib.Path(__file__).parent.resolve()) + "/" + val
        Starters.importantinfo.append([path, val])

    def starting(path, current_val):
        try:
            path = str(current_val)
            with open(path + '/pythoner' + current_val + ".py", "w+") as file:
                file.write('\nimport sparker as starttt' + "\nstarttt.Automatically.automatic()")
            file.close()
            threading.Thread(target=Starters.initiator, args = [path, current_val]).start()
            if current_val in Starters.banktwo:
                Starters.banktwo.remove(current_val)
        except Exception as error:
            print(error)

    def initiator(path, current_val):
        subprocess.Popen('cd ' + path + ';' + 'python3 pythoner' + current_val + ".py", shell = True)
# git clone https://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@github.com/emraanadem/Project_Sampi.git
# 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
#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
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
    with open('instrumentstwo.json', 'rb') as insts:
        instrum = msgspec.json.decode(insts.read(), type=object)
        info = instrum['instruments']
        Starters.instrument_bank = info
        rowid = 0
        for val in info:
            placeholder = [val, rowid]
            Starters.impinfo.append(placeholder)
            rowid+=1
            if rowid == 24:
                rowid = 0
    threadsss = []
    for val in Starters.instrument_bank:
        if val not in Starters.instrument_list:
            t = threading.Thread(target=Starters.begin, args = [val])
            t.start()
            threadsss.append(t)
    for thread in threadsss:
        thread.join()
    pointer = 0
    while pointer < len(Starters.instrument_bank):
        threads = []
        try:
            t = threading.Thread(target=Starters.starting, args = [Starters.importantinfo[pointer][0], Starters.importantinfo[pointer][1]])
            threads.append([t, Starters.importantinfo[pointer][1]])
            t.start()
            pointer += 1
        except Exception as error:
            q = 0
        for threads in threads:
            threads[0].join()
    """for thread in threading.enumerate():
        if thread is not threading.main_thread():
            thread.join()
    time.sleep(5)
for val in Starters.instrument_bank:
    with open('avoidinst.json', 'r') as trades:
        if val in json.loads(trades.read())['instruments']:
            Starters.instrument_list.append(val)"""