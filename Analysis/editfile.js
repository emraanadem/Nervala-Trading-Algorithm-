listoflens = []
listoflens.append(Variables.lenfive)
listoflens.append(Variables.lenfifteen)
listoflens.append(Variables.lenthirty)
listoflens.append(Variables.lenhour)
listoflens.append(Variables.lentwohour)
listoflens.append(Variables.lenfourhour)
listoflens.append(Variables.lendaily)
listoflens.append(Variables.lenweekly)
listofitems = []
listofitems.append(Variables.five)
listofitems.append(Variables.fifteen)
listofitems.append(Variables.thirty)
listofitems.append(Variables.hour)
listofitems.append(Variables.twohour)
listofitems.append(Variables.fourhour)
listofitems.append(Variables.daily)
listofitems.append(Variables.weekly)
minlen = min(listoflens)
for(item in listofitems){
    if(len(item) > minlen){
        for(const x in range(0, len(item)-minlen)){
            item.splice(0, 1)
        }}}
Variables.five = listofitems[0]
Variables.fifteen = listofitems[1]
Variables.thirty = listofitems[2]
Variables.hour = listofitems[3]
Variables.twohour = listofitems[4]
Variables.fourhour = listofitems[5]
Variables.daily = listofitems[6]
Variables.weekly = listofitems[7]
listoflens = []
listoflens.append(Variables.extendlenfive)
listoflens.append(Variables.extendlenfifteen)
listoflens.append(Variables.extendlenthirty)
listoflens.append(Variables.extendlenhour)
listoflens.append(Variables.extendlentwohour)
listoflens.append(Variables.extendlenfourhour)
listoflens.append(Variables.extendlendaily)
listoflens.append(Variables.extendlenweekly)
listofitems = []
listofitems.append(Variables.extendfive)
listofitems.append(Variables.extendfifteen)
listofitems.append(Variables.extendthirty)
listofitems.append(Variables.extendhour)
listofitems.append(Variables.extendtwohour)
listofitems.append(Variables.extendfourhour)
listofitems.append(Variables.extenddaily)
listofitems.append(Variables.extendweekly)
minlen = min(listoflens)
for(item in listofitems){
    if(len(item) > minlen){
        for(const x in range(0, len(item)-minlen)){
            item.splice(0, 1)
        }}}
Variables.extendfive = listofitems[0]
Variables.extendfifteen = listofitems[1]
Variables.extendthirty = listofitems[2]
Variables.extendhour = listofitems[3]
Variables.extendtwohour = listofitems[4]
Variables.extendfourhour = listofitems[5]
Variables.extenddaily = listofitems[6]
Variables.extendweekly = listofitems[7]