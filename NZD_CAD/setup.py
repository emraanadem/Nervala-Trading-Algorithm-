import requests
from datetime import date
from datetime import timedelta
today = date.today()
response = requests.get("https://api.polygon.io/v2/aggs/ticker/AAPL/range/5/minute/2000-01-01/"+str(today)+"?adjusted=true&sort=asc&limit=1&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG")
resp = response.json()
price = resp['results'][0]['c']
print(price)