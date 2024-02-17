import os
import threading
import json
import shutil
import  msgspec
info = ''
accinfo = []
with open("instrument.json", 'rb') as inst:
    instrum = msgspec.json.decode(inst.read(), type=object)  
    instrument = instrum['instrument']
    info = instrument

class Starters:
    instrument_bank = [info]
    banktwo = []
    current_val = ''
    def begin():
        redo = True
        val = Starters.instrument_bank[0]
        import pathlib
        Starters.current_val = val
        path = str(pathlib.Path(__file__).parent.resolve())
        if os.path.isdir(path):
            dict = {}
            dict['instrument'] = val
            with open(path + '/instrument.json', 'w') as inst:
                json.dump(dict, inst)
        else:
            os.mkdir(path)
            orig_path = str(pathlib.Path(__file__).parent.resolve())
            for files in os.listdir(orig_path):
                shutil.copy(orig_path + "/"+files, path)
            dict = {}
            dict['instrument'] = val
            with open(path + '/instrument.json', 'w') as inst:
                json.dump(dict, inst)
        Starters.banktwo = Starters.instrument_bank
        threading.Thread(target=Starters.starting, args = [path, val]).start()

    def starting(path, current_val):
        try:
            os.system("python3 " + path + "/SparkPlugAuto.py")
            Starters.banktwo.remove(current_val)
        except Exception as error:
            print(error)

# /* © 2022 Emraan Adem Ibrahim. See the license terms in the file 'license.txt' which should
# have been included with this distribution. */