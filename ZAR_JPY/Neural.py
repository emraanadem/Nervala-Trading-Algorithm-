from ast import Param
import pandas
import json

class Neural:


    @staticmethod
    def network():
        """ultimate goal is to make a data analysis tool that sends signal to json for interpretation in Node.js via AI/ML, ultimately making the code more accurate
        update 6/19/22 6:20 AM Ethiopia Time: made it in Javascript so its more streamlined and doesn't waste time communicating extra signals throguh JSON """
        with open('Data.json', 'r') as inst:
            history = json.loads(inst.read())

# /* © 2022 Emraan Adem Ibrahim. See the license terms in the file 'license.txt' which should
# have been included with this distribution. */