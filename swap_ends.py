for val in Starters.accinfo:
                for vals in Starters.impinfo:
                    if val[2] == vals[1]:
                        Starters.evenmoreimpinfo.append([val[0],val[1],vals[0]])
                        with open(pathtwo + '/accinfo.json', 'w') as inst:
                                inst.write(str(json.dump([val[0],val[1]], inst)))
                        Starters.evenmoreimpinfo = []