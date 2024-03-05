import csv
import json
proxyinfo = []

with open('proxies.txt', 'r') as infor:
    datas = list(csv.reader(infor, delimiter = ' '))
    rowid = 0
    for row in datas:
            proxyinfo.append(['http', row[0].split(":")[0], row[0].split(":")[1], rowid])
            rowid+=1
with open('proxylist2.json', 'w') as inst:
    json.dump(proxyinfo, inst)