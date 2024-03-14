import csv
import json
proxyinfo = []

with open('accounts.txt', 'r') as infor:
    datas = list(csv.reader(infor, delimiter = ' '))
    rowid = 0
    for row in datas:
            proxyinfo.append(row)
            rowid+=1
with open('accounts.json', 'w') as inst:
    json.dump(proxyinfo, inst)