import json
count = 0
proxylist = []
with open("proxies.txt", "r") as inst:
    for line in inst:
        proxylist.append(["http",line.split("\n")[0].split(":")[0], line.split("\n")[0].split(":")[1], count])
        count+= 1
proxyauth = {"username": "lxiauodp", "password": "eq1hgfhblamm"}
jsonlist = json.dumps(proxyauth, indent=1)

with open("proxyfinal.json", "w") as inst:
    inst.write(jsonlist)
