import json
f= open('instrumentsthree.json')
prueba = json.load(f)
lists = prueba['instruments']
f = open('instrumentstwo.json')
prueba = json.load(f)
liststwo = prueba['instruments']


dicttwo = {}
dicttwo['instruments'] = lists
with open('instrumentsthree.json', 'w') as inst:
     json.dump(dicttwo, inst)
               
idkeys = {}
count = 0
idkeysextend = {}
for val in lists:
     idkeys[val + " Open"] = count
     idkeysextend[val + " Open Extend"] = count
     count += 1
     idkeys[val + " High"] = count
     idkeysextend[val + " High Extend"] = count
     count += 1
     idkeys[val + " Low"] = count
     idkeysextend[val + " Low Extend"] = count
     count += 1
     idkeys[val + " Close"] = count
     idkeysextend[val + " Close Extend"] = count
     count += 1

with open("idkeys.json", 'w') as inst:
    json.dump(idkeys, inst)


with open("idkeysextend.json", 'w') as inst:
    json.dump(idkeysextend, inst)


with open('idkeys.json', 'r') as inst:
        datas = json.load(inst)
        ids = datas["USD_NOK" + " Close"]
print(ids)