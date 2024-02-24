import json

total = []

with open('instrumentsthree.json', 'r') as inst:
    instrum = json.load(inst)
    instrument = instrum['instruments']
    for item in instrument:
        total.append(item)

with open('instrumentstwo.json', 'r') as inst:
    instrum = json.load(inst)
    instrument = instrum['instruments']
    for item in instrument:
        total.append(item)
with open('StockInstruments.json', 'r') as inst:
    instrum = json.load(inst)
    instrument = instrum['instruments']
    for item in instrument:
        total.append(item)

ids = {}
count = 3001
for val in total:
    ids[val] = count
    count += 1

with open('IDS.json', 'w') as inst:
    instrum = json.dump(ids, inst)
