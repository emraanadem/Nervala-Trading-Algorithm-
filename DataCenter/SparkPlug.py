import threading
import json
import os

def controll():
    with open('instrument.json', 'r') as instrum:
        instrumen = json.loads(instrum.read())
    instrument = instrumen['instrument']
    import Motor2, Motor3, Motor4, Motor5, Motor, MotorExtend, Motor2Extend, Motor3Extend, Motor5Extend
    threading.Thread(target=Motor4.controller).start()
    threading.Thread(target=Motor.controller).start()
    threading.Thread(target=Motor2.controller).start()
    threading.Thread(target=Motor3.controller).start()
    threading.Thread(target=Motor5.controller).start()
    threading.Thread(target=MotorExtend.controller).start()
    threading.Thread(target=Motor2Extend.controller).start()
    threading.Thread(target=Motor3Extend.controller).start()
    threading.Thread(target=Motor5Extend.controller).start()
    q = 0
    i = 0
    while i == 0:
        try:
            with open('Data.json', 'r') as inst:
                instrum = json.loads(inst.read()) 
            instrumen = next(iter(instrum))
            if len(instrumen) > 1:
                break
        except:
            q = 0
    datainst = next(iter(instrum))
    while i == 0:
        try:
            with open('High.json', 'r') as inst:
                instrum = json.loads(inst.read()) 
            instrumen = next(iter(instrum))
            if len(instrumen) > 1:
                break
        except:
            q = 0
    highinst = next(iter(instrum))
    while i == 0:
        try:
            with open('Low.json', 'r') as inst:
                instrum = json.loads(inst.read()) 
            instrumen = next(iter(instrum))
            if len(instrumen) > 1:
                break
        except:
            q = 0
    lowinst = next(iter(instrum))
    while i == 0:
        try:
            with open('Open.json', 'r') as inst:
                instrum = json.loads(inst.read()) 
            instrumen = next(iter(instrum))
            if len(instrumen) > 1:
                break
        except:
            q = 0
    openinst = next(iter(instrum))
    while i == 0:
        try:
            with open('DataExtend.json', 'r') as inst:
                instrum = json.loads(inst.read()) 
            instrumen = next(iter(instrum))
            if len(instrumen) > 1:
                break
        except:
            q = 0
    dataextendinst = next(iter(instrum))
    while i == 0:
        try:
            with open('HighExtend.json', 'r') as inst:
                instrum = json.loads(inst.read()) 
            instrumen = next(iter(instrum))
            if len(instrumen) > 1:
                break
        except:
            q = 0
    highextendinst = next(iter(instrum))
    while i == 0:
        try:
            with open('LowExtend.json', 'r') as inst:
                instrum = json.loads(inst.read()) 
            instrumen = next(iter(instrum))
            if len(instrumen) > 1:
                break
        except:
            q = 0
    lowextendinst = next(iter(instrum))
    while i == 0:
        try:
            with open('OpenExtend.json', 'r') as inst:
                instrum = json.loads(inst.read()) 
            instrumen = next(iter(instrum))
            if len(instrumen) > 1:
                break
        except:
            q = 0
    openextendinst = next(iter(instrum))
    if (instrument == datainst and instrument == highinst and instrument == lowinst 
        and instrument == dataextendinst and instrument == highextendinst and 
        instrument == lowextendinst and instrument == openinst and instrument == openextendinst):
        print("Successfully Loading Program for " + instrument + ". Please Wait ...")
        print('Program Loaded.\n')
        threading.Thread(target=startfifteen).start()
        threading.Thread(target=startthirty).start()
        threading.Thread(target=starthour).start()
        threading.Thread(target=starttwohour).start()
        threading.Thread(target=startfourhour).start()
        threading.Thread(target=startdaily).start()
        threading.Thread(target=startweekly).start()

def startfifteen():
    os.system('node FifteenMin.js')

def startthirty():
    os.system('node ThirtyMin.js')

def starthour():
    os.system('node OneHour.js')

def starttwohour():
    os.system('node TwoHour.js')

def startfourhour():
    os.system('node FourHour.js')

def startdaily():
    os.system('node Daily.js')

def startweekly():
    os.system('node Weekly.js')




controll()

# /* © 2022 Emraan Adem Ibrahim. See the license terms in the file 'license.txt' which should
# have been included with this distribution. */