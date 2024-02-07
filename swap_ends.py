for val in Starters.accinfo:
                for vals in Starters.impinfo:
                    if val[2] == vals[1]:
                        Starters.evenmoreimpinfo.append([val[0],val[1],vals[0]])
                        with open(pathtwo + '/accinfo.json', 'w') as inst:
                                inst.write(str(json.dump([val[0],val[1]], inst)))
                        Starters.evenmoreimpinfo = []



                        with open('instrumentsthree.json', 'rb') as insts:
            instrum = msgspec.json.decode(insts.read(), type=object)
            info = instrum['instruments']
            Starters.instrument_bank = info
            for val in info:
                placeholder = [val, rowid]
                Starters.impinfo.append(placeholder)
                rowid+=1
                if rowid == 24:
                    rowid = 0
            