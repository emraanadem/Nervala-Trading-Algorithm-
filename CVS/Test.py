import json
with open('instrument.json', 'r') as instrum:
        instrument = json.loads(instrum.read())['instrument']
print(instrument)