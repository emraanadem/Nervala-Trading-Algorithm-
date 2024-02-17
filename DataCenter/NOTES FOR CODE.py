## Fix Bugging with Json Decoding for data analysis of each ##
## FIXED ##

# Update: Some trades are losing, this is because the trades are being made, for example, on a higher time period whereas the lower time periods are consolidating.
    # Drafted fixes for this: Change analysis of smaller time periods to include consolidation measurements
        # Implemented this, waiting for market open Sunday night at midnight for testing : 6/18/22 1:35 PM Ethiopia Time

# Fixed MACD Bugs, where the MACD was being calculated manually. MACD is now calculated automatically.
            # MACD FIXED
# Fix TP and SL, make them interdependent somehow... accepting all ideas --- (HOW WOULD THIS IMPROVE THE CODE, AND HOW WOULD THIS BE IMPLEMENTED)
    # Also make it so that TP and SL are dependent on volatility, make it so that if its more volatile then it will move them up or down to accommodate ---- COMPLETED

# Make stop loss and TP tracking system, so we can have multiple stop losses and take profits in case price doesn't move in the anticipated direction,
    # but gives room for price to reverse and come back in the anticipated direction based on key level movement.
    # ** DO THIS FIRST BEFORE U DO THE VOLATILITY DEPENDENCY BECAUSE YOU WILL WANT TO MOVE ALL TP LEVELS AND STOP LOSSES ACCORDING TO THE PRICE MOVEMENT **
        # COMPLETED THIS AND VOLATILITY DEPENDENCY FOR TP, NEED TO DO IT FOR SL: 6/25/22 4:27 PM *****************
                                # Completed VOLATILITY DEPENDENCY FOR SL, changes SL dependent on volatility, no need for multiple SL/SL tracking system : 6/25/22 6:29 PM

# DONT FORGET TO CHANGE TRAILING SL TO MATCH TP1 IF TP1 IS PASSED -- COMPLETED AND MADE EVEN BETTER THAN I THOUGHT, MADE IT SO THAT TP1 CHANGES TO TP2 AND TP2 TO A NEW TP2 (TP3)
            # AND SO ON AND SO FORTH UNTIL A RETRACEMENT OCCURS TO TRAILING STOP LOSS, AT WHICH POINT TRADE WILL EXIT --- 6/26/22 12:47 AM Ethiopia Time




# TEST WITH THE NEW UPDATES ONCE MARKET OPENS BACK UP, SEE IF ANY MORE EDITS NEED TO BE MADE (FOR EXAMPLE, ADDING WICK LENGTH RATIO TO ONLY ALLOW TRADES ON MOMENTUM CANDLES)
                            # This is going to require adding the open candle, which will require painful work to be added to the structure of the code (a Motor5 will 
                                # be required to be added)

# ADD REJECINIT AND REJECSAVE TO OTHER TIME PERIODS IN EACH FILE BECAUSE ITS THROWING AN ERROR FOR EMPTY ARRAY ******
                            # ADDED, NOW ALL THAT THERE IS TO DO IS TO TEST AGAIN, ACCOUNT UP 75% THIS WEEK ON EQUITY, 45% ON BALANCE
                                # UPDATE: ACCOUNT NEARLY TRIPLED IN VALUE FROM 100K TO 296K, KEEP IMPROVING ...


# NEXT ROUND OF UPDATES: Find way to measure success rate chance per trade and adjust variables accordingly (for example, a trade highly likely to succeed will 
        # have looser SL and TP, vice versa)
            # Store previous trade data in an array, and the macd, rsi, obv, vol, etc values for each trade, and track price movement around that trade to see whether or not
                    # it is a good trade. Still working on the logic for this in my head, trying to figure it out how this would work. Taking any ideas.


#AFTER FIGURING OUT THE UPDATE ABOVE, FIND OUT HOW TO PIVOT. This program alone will not work as a product, you need to build a service around it kind of like acorns. Figure
    #out a similar solution, and build that program
#ROUND-DOWNS, USE CHANGE VALUE FROM PURCHASES AS INVESTMENT CAPITAL, SIMILAR CONCEPT AS ACORNS (they do round-ups). THEN USE AI TO GENERATE INVESTMENT PLAN BASED ON SURVEY. PARTNER WITH A BANK.


# /* © 2022 Emraan Adem Ibrahim. See the license terms in the file 'license.txt' which should
# have been included with this distribution. */