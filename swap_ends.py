import csv
import json
proxyinfo = []

with open('proxylist.txt', 'r') as infor:
    datas = list(csv.reader(infor, delimiter = ' '))
    rowid = 0
    for row in datas:
        if "socks" in row[0]:
            pass
        else:
            proxyinfo.append([row[0].split(":")[0],row[0].split(":")[1], row[0].split(":")[2], rowid])
            rowid+=1
with open('proxylist2.txt', 'w') as inst:
    for row in proxyinfo:
        row[1] =  row[1].replace("//", "")
        inst.write(str([row[0], row[1], row[2], row[3]])+"\n")