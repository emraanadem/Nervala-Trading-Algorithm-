import json

taglist = ["DECK", "WMT", "LLY", "ETN", "CAT", "MSFT", "AAPL", "AMZN", "GOOG", "NVDA", "META", "BRK-B", "TSM",
"TSLA", "AVGO", "V", "NVO", "JPM", "UNH", "MA", "XOM", "JNJ", "PG", "HD", "ASML", "TCEHY", "MRK", "ORCL", "COST",
"ABBV", "CVX", "CVS", "AMD", "ADBE", "CRM", "TM", "BAC", "KO", "NFLX", "PEP", "ACN", "MCD", "TMO", "NVS", "SAP", "SHEL", "CSCO",
"AZN", "LIN", "ABT", "TMUS", "DHR", "BABA", "INTC", "CMCSA", "INTU", "DIS", "VZ", "WFC", "AMGN", "IBM", "PDD", "QCOM", "NOW", "RTX",
"BHP", "NKE", "PFE", "UNP", "TTE", "HSBC", "AXP", "GE", "TXN", "PM", "SPGI", "MS", "UBER", "AMAT", "HDB", "RY", "ISRG", "IDEXY", "XAU_USD", "EUR_USD", "NAS100_USD", "GBP_JPY", "US30_USD", "GBP_USD", 
"SPX500_USD", "USD_JPY", "AUD_USD", "USD_CAD", "EUR_JPY", "AUD_JPY", "NZD_USD", "XAG_USD", 
"GBP_AUD", "USD_CHF", "EUR_GBP", "EUR_AUD", "CAD_JPY", "EUR_CAD", "AUD_CAD", "GBP_CAD", "NZD_JPY", 
"EUR_NZD", "GBP_CHF", "NZD_CAD", "AUD_NZD", "USD_TRY", "CHF_JPY", "CAD_CHF", "XPT_USD", "GBP_NZD", 
"BCO_USD", "WTICO_USD", "NZD_CHF", "BTC_USD", "USD_SGD", "USD_SEK","ZAR_JPY", "SGD_JPY", "EUR_PLN", 
"GBP_HKD", "AUD_SGD", "EUR_SGD", "GBP_SGD", "ETH_USD", "LTC_USD", "BCH_USD", "MBTC_USD","XAU_NZD", 
"XAG_JPY", "XAG_NZD", "XAU_HKD", "XAG_HKD", "SGD_CHF", "SGD_HKD", "HKD_JPY", "CAD_HKD", "CAD_SGD", 
"CHF_ZAR", "CHF_HKD", "NZD_HKD"]

tags = {}
counter = 0
for item in taglist:
    tags[str(counter)] = item
    counter += 1

dict_as_json = json.dumps(tags)
with open("TagList.json", "w+") as outfile:
    outfile.write(dict_as_json)
    outfile.close()
    tags.clear()

