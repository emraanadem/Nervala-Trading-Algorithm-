import csv
lists = []
with open('constituents.csv', newline='') as csvfile:
    spamreader = csv.reader(csvfile, delimiter=',')
    for row in spamreader:
        if row[0] != 'Symbol':
            lists.append(row[0])

print(lists)
