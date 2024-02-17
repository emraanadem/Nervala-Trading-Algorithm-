
import msgspec

with open('instrument.json', 'rb') as accinf:
     instrum = msgspec.json.decode(accinf.read(), type=object)
     print(type(instrum))