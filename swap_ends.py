import csv
import json
import requests

instruments = []
instrumentstwo = []





test = requests.get("https://companiesmarketcap.com/#google_vignette")
print(test._content)


with open('nasdaq.csv') as csvfile:
    test = csv.reader(csvfile, delimiter=',')
    for row in test:
        instruments.append(row[0])

with open('nasdaqw.csv') as csvfile:
    test = csv.reader(csvfile, delimiter=',')
    for row in test:
        instrumentstwo.append(row[0])


for x in instrumentstwo:
    instruments.append(x)
for val in instruments:
    instruments[instruments.index(val)] = val.strip()
instruments = list(set(instruments))
dict = {}
dict['instruments'] = instruments