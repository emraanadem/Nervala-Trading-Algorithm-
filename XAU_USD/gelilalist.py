

def count_votes_for(name, votes):
    namematch = []
    for name in votes:
        if(votes[votes.index(name)] == votes[votes.index(name)+1]):
            namematch.append(votes[votes.index(name)])
    amount = len(namematch)
    print(amount)


count_votes_for("Gelila", ["Gelila", "Gelila", "Gelila", "Gelila", "Gelilas","Gelila"])
        
# /* © 2022 Emraan Adem Ibrahim. See the license terms in the file 'license.txt' which should
# have been included with this distribution. */