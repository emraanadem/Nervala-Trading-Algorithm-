import pathlib
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




class Starters:
    
    instrument_bank = []
    banktwo = []
    current_val = ''
    current_dir = os.getcwd()
    accinfo = []
    paths = []
    importantinfo = []
    impinfo = []
    evenmoreimpinfo = []


    def accinfoloader():
         rowid = 0
         with open('accounts2.txt', 'r') as infor:
            datas = list(csv.reader(infor, delimiter = ' '))
            for row in datas:
                Starters.accinfo.append([str(row[0]), str(row[1]),rowid])
                rowid+=1
            

    def begin(val):
        import pathlib
        path = str(pathlib.Path(__file__).parent.resolve())
        redo = True
        Starters.current_val = val
        pathtwo = str(pathlib.Path(__file__).parent.resolve()) + "/" + val
        #path = str(pathlib.Path(__file__).parent.resolve()) + "/" + val
        if os.path.isdir(pathtwo):
            dict = {}
            dict['instrument'] = val
            with open(pathtwo + '/instrument.json', 'w') as inst:
                inst.write(str(json.dump(dict), inst))
            for val in Starters.accinfo:
                for vals in Starters.impinfo:
                    if val[2] == vals[1]:
                        Starters.evenmoreimpinfo.append([val[0],val[1],vals[0]])
                        with open(pathtwo + '/accinfo.json', 'w') as inst:
                                inst.write(str(json.dump([val[0],val[1]], inst)))
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
                inst.write(str(json.dump(dict, inst)))
            for val in Starters.accinfo:
                for vals in Starters.impinfo:
                    if val[2] == vals[1]:
                        Starters.evenmoreimpinfo.append([val[0],val[1],vals[0]])
                        with open(pathtwo + '/accinfo.json', 'w') as inst:
                                inst.write(str(json.dump([val[0],val[1]], inst)))
        import pathlib
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
            q = 0
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
    threads = []
    placeholder = []
    rowid = 0
    Starters.accinfoloader()
    with open('instrumentsthree.json', 'rb') as insts:
            instrum = msgspec.json.decode(insts.read(), type=object)
            info = instrum['instruments']
            Starters.instrument_bank = info
            for val in info:
                placeholder = [val, rowid]
                Starters.impinfo.append(placeholder)
                rowid+=1
                if rowid == 24:
                    rowid = 0
            

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
        try:
            t = threading.Thread(target=Starters.starting, args = [Starters.importantinfo[pointer][0], Starters.importantinfo[pointer][1]])
            t.start()
            threads.append([t, Starters.importantinfo[pointer][1]])
            pointer += 1
        except Exception as error:
            q = 0 
    for threads in threads:
        threads[0].join()