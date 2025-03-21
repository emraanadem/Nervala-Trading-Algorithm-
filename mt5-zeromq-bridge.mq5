//+------------------------------------------------------------------+
//|                                           MT5-ZeroMQ-Bridge.mq5 |
//|                     MetaTrader 5 Expert Advisor for NodeJS API  |
//|                   Connects MT5 platform to the trading algorithms|
//+------------------------------------------------------------------+
#property copyright "Nervala Trading System"
#property link      ""
#property version   "1.0"
#property strict

// Include the ZeroMQ library for MetaTrader
#include <Zmq/Zmq.mqh>
#include <Trade/Trade.mqh>
#include <JAson.mqh>  // MQL5's built-in JSON library

// Constants
#define PUSH_PORT 5557 // Port to push data to Node.js
#define PULL_PORT 5558 // Port to pull commands from Node.js
#define PUB_PORT  5559 // Port to publish market data

// ZeroMQ Context and Sockets
input string ZmqPushAddress = "tcp://*:5557";
input string ZmqPullAddress = "tcp://*:5558";
input string ZmqPubAddress  = "tcp://*:5559";
input int ZmqPublishInterval = 1000; // Publish interval in milliseconds

// Magic number for trade identification
input int MagicNumber = 12345;

// Connection monitoring
input bool AutoReconnect = true;
input int  ReconnectInterval = 5000; // milliseconds

// Debug settings
input bool DebugMode = true;
input bool LogToFile = true;
input string LogFileName = "mt5-zeromq-bridge.log";

// Global variables
Context context;        // ZeroMQ context
Socket pushSocket;      // Socket to push data to Node.js 
Socket pullSocket;      // Socket to pull commands from Node.js
Socket pubSocket;       // Socket to publish market data
bool   isConnected;     // Connection status
int    lastReconnect;   // Time of last reconnection attempt
int    lastPublish;     // Time of last market data publish
int    fileHandle;      // Log file handle
CTrade  trade;          // Trading object

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   // Open log file if needed
   if (LogToFile) {
      fileHandle = FileOpen(LogFileName, FILE_WRITE|FILE_TXT);
      if (fileHandle == INVALID_HANDLE) {
         Print("Failed to open log file: ", GetLastError());
      }
   }
   
   Log("Initializing ZeroMQ bridge...");
   
   // Initialize ZeroMQ context
   context.create(1);
   
   // Initialize sockets
   isConnected = InitializeSockets();
   
   // Set up trading
   trade.SetExpertMagicNumber(MagicNumber);
   
   // Start timer for regular updates
   EventSetMillisecondTimer(100);
   
   if (isConnected) {
      Log("ZeroMQ bridge initialized successfully");
   } else {
      Log("ZeroMQ bridge initialization failed");
   }
   
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   Log("Shutting down ZeroMQ bridge...");
   
   // Clean up ZeroMQ
   CloseSockets();
   
   // Close log file
   if (LogToFile && fileHandle != INVALID_HANDLE) {
      FileClose(fileHandle);
   }
   
   Log("ZeroMQ bridge shut down");
}

//+------------------------------------------------------------------+
//| Initialize ZeroMQ sockets                                        |
//+------------------------------------------------------------------+
bool InitializeSockets()
{
   Log("Initializing sockets...");
   
   // Create push socket
   pushSocket.create(context, ZMQ_PUSH);
   if (!pushSocket.bind(ZmqPushAddress)) {
      Log("Error binding PUSH socket: " + IntegerToString(GetLastError()));
      return false;
   }
   
   // Create pull socket
   pullSocket.create(context, ZMQ_PULL);
   if (!pullSocket.bind(ZmqPullAddress)) {
      Log("Error binding PULL socket: " + IntegerToString(GetLastError()));
      pushSocket.unbind(ZmqPushAddress);
      return false;
   }
   
   // Create publisher socket
   pubSocket.create(context, ZMQ_PUB);
   if (!pubSocket.bind(ZmqPubAddress)) {
      Log("Error binding PUB socket: " + IntegerToString(GetLastError()));
      pushSocket.unbind(ZmqPushAddress);
      pullSocket.unbind(ZmqPullAddress);
      return false;
   }
   
   // Set socket options
   pubSocket.setLinger(1000);  // Linger period in milliseconds
   pushSocket.setLinger(1000);
   pullSocket.setLinger(1000);
   
   // Set socket non-blocking
   pubSocket.setReceiveTimeout(1);
   pushSocket.setReceiveTimeout(1);
   pullSocket.setReceiveTimeout(1);
   
   Log("Sockets initialized successfully");
   return true;
}

//+------------------------------------------------------------------+
//| Close ZeroMQ sockets                                             |
//+------------------------------------------------------------------+
void CloseSockets()
{
   Log("Closing sockets...");
   
   // Close sockets
   pubSocket.unbind(ZmqPubAddress);
   pushSocket.unbind(ZmqPushAddress);
   pullSocket.unbind(ZmqPullAddress);
   
   pubSocket.close();
   pushSocket.close();
   pullSocket.close();
   
   // Terminate context
   context.shutdown();
   context.destroy();
   
   isConnected = false;
   
   Log("Sockets closed");
}

//+------------------------------------------------------------------+
//| Expert timer function - process messages and publish data        |
//+------------------------------------------------------------------+
void OnTimer()
{
   // Check connection status
   if (!isConnected && AutoReconnect) {
      if (TimeCurrent() - lastReconnect > ReconnectInterval/1000) {
         Log("Attempting to reconnect...");
         isConnected = InitializeSockets();
         lastReconnect = TimeCurrent();
      }
      return;
   }
   
   // Process incoming commands
   ProcessCommands();
   
   // Publish market data on intervals
   if (TimeCurrent() - lastPublish > ZmqPublishInterval/1000) {
      PublishMarketData();
      lastPublish = TimeCurrent();
   }
}

//+------------------------------------------------------------------+
//| Process incoming commands from Node.js                           |
//+------------------------------------------------------------------+
void ProcessCommands()
{
   string message = "";
   
   // Non-blocking check for messages
   while (pullSocket.recv(message, true) > 0) {
      if (message == "") continue;
      
      Log("Received command: " + message);
      
      // Use MQL5's built-in JSON parsing
      CJAVal json;
      if (!json.Deserialize(message)) {
         SendError("Invalid JSON format");
         continue;
      }
      
      string action = json["action"].ToStr();
      string requestId = json["requestId"].ToStr();
      
      if (action == "") {
         SendError("Missing 'action' field in command", requestId);
         continue;
      }
      
      // Process based on action type
      if (action == "PING") {
         HandlePing(requestId);
      } else if (action == "OPEN_ORDER") {
         HandleOpenOrder(json, requestId);
      } else if (action == "CLOSE_POSITION") {
         HandleClosePosition(json, requestId);
      } else if (action == "MODIFY_POSITION") {
         HandleModifyPosition(json, requestId);
      } else if (action == "GET_ACCOUNT_INFO") {
         HandleGetAccountInfo(requestId);
      } else {
         SendError("Unknown action: " + action, requestId);
      }
   }
}

//+------------------------------------------------------------------+
//| Handle ping command                                             |
//+------------------------------------------------------------------+
void HandlePing(string requestId)
{
   CJAVal response;
   response["type"] = "PONG";
   response["requestId"] = requestId;
   response["timestamp"] = (int)TimeCurrent();
   
   SendResponse(response.Serialize());
}

//+------------------------------------------------------------------+
//| Handle open order command                                        |
//+------------------------------------------------------------------+
void HandleOpenOrder(CJAVal &json, string requestId)
{
   // Extract order details
   CJAVal data = json["data"];
   string symbol = data["symbol"].ToStr();
   string orderType = data["type"].ToStr();
   double volume = data["volume"].ToDbl();
   double stopLoss = data["stopLoss"].ToDbl();
   double takeProfit = data["takeProfit"].ToDbl();
   int slippage = data["maxSlippage"].ToInt();
   string comment = data["comment"].ToStr();
   
   if (volume <= 0) volume = 0.01;  // Default value
   if (slippage <= 0) slippage = 3; // Default value
   
   // Normalize the symbol name (format conversion)
   symbol = NormalizeSymbol(symbol);
   
   // Check if symbol is valid
   if (!SymbolSelect(symbol, true)) {
      SendError("Invalid symbol: " + symbol, requestId);
      return;
   }
   
   // Prepare order parameters
   ENUM_ORDER_TYPE cmd;
   if (orderType == "BUY") cmd = ORDER_TYPE_BUY;
   else if (orderType == "SELL") cmd = ORDER_TYPE_SELL;
   else {
      SendError("Invalid order type: " + orderType, requestId);
      return;
   }
   
   double price = (cmd == ORDER_TYPE_BUY) ? SymbolInfoDouble(symbol, SYMBOL_ASK) : SymbolInfoDouble(symbol, SYMBOL_BID);
   
   // Execute the order using MQL5 trading functions
   trade.SetDeviationInPoints(slippage);
   trade.SetExpertMagicNumber(MagicNumber);
   
   bool success = false;
   if (cmd == ORDER_TYPE_BUY)
      success = trade.Buy(volume, symbol, price, stopLoss, takeProfit, comment);
   else
      success = trade.Sell(volume, symbol, price, stopLoss, takeProfit, comment);
   
   // Check for errors
   if (!success) {
      SendError("Order execution failed: " + IntegerToString(trade.ResultRetcode()), 
                requestId, trade.ResultRetcode());
      return;
   }
   
   // Send success response
   CJAVal response;
   response["type"] = "TRADE_RESPONSE";
   response["requestId"] = requestId;
   response["success"] = true;
   response["positionId"] = (int)trade.ResultDeal();
   response["symbol"] = symbol;
   
   SendResponse(response.Serialize());
   
   Log("Order executed: Deal=" + IntegerToString(trade.ResultDeal()) + 
       ", Symbol=" + symbol + ", Type=" + orderType + 
       ", Volume=" + DoubleToString(volume, 2));
}

//+------------------------------------------------------------------+
//| Handle close position command                                    |
//+------------------------------------------------------------------+
void HandleClosePosition(CJAVal &json, string requestId)
{
   // Extract position details
   CJAVal data = json["data"];
   ulong positionId = data["positionId"].ToInt();
   string symbol = data["symbol"].ToStr();
   
   // Normalize symbol if provided
   if (symbol != "")
      symbol = NormalizeSymbol(symbol);
   
   // Close the position
   bool success = false;
   
   // In MT5, we need to select the position first
   if (PositionSelectByTicket(positionId)) {
      symbol = PositionGetString(POSITION_SYMBOL);
      double volume = PositionGetDouble(POSITION_VOLUME);
      ENUM_POSITION_TYPE posType = (ENUM_POSITION_TYPE)PositionGetInteger(POSITION_TYPE);
      
      // Close the position
      if (posType == POSITION_TYPE_BUY)
         success = trade.Sell(volume, symbol, 0, 0, 0, "Close position");
      else
         success = trade.Buy(volume, symbol, 0, 0, 0, "Close position");
      
      if (!success) {
         SendError("Close position failed: " + IntegerToString(trade.ResultRetcode()), 
                   requestId, trade.ResultRetcode());
         return;
      }
   } else {
      SendError("Position not found: " + IntegerToString(positionId), requestId);
      return;
   }
   
   // Send success response
   CJAVal response;
   response["type"] = "TRADE_RESPONSE";
   response["requestId"] = requestId;
   response["success"] = true;
   response["positionId"] = (int)positionId;
   response["message"] = "Position closed successfully";
   
   SendResponse(response.Serialize());
   Log("Position closed: Ticket=" + IntegerToString(positionId) + ", Symbol=" + symbol);
}

//+------------------------------------------------------------------+
//| Handle modify position command                                   |
//+------------------------------------------------------------------+
void HandleModifyPosition(CJAVal &json, string requestId)
{
   // Extract position details
   CJAVal data = json["data"];
   ulong positionId = data["positionId"].ToInt();
   string symbol = data["symbol"].ToStr();
   double stopLoss = data["stopLoss"].ToDbl();
   double takeProfit = data["takeProfit"].ToDbl();
   
   // Normalize symbol if provided
   if (symbol != "")
      symbol = NormalizeSymbol(symbol);
   
   // Modify the position
   bool success = false;
   
   if (PositionSelectByTicket(positionId)) {
      // If stopLoss or takeProfit aren't specified, use existing values
      if (stopLoss == 0) stopLoss = PositionGetDouble(POSITION_SL);
      if (takeProfit == 0) takeProfit = PositionGetDouble(POSITION_TP);
      symbol = PositionGetString(POSITION_SYMBOL);
      
      success = trade.PositionModify(positionId, stopLoss, takeProfit);
      
      if (!success) {
         SendError("Modify position failed: " + IntegerToString(trade.ResultRetcode()), 
                   requestId, trade.ResultRetcode());
         return;
      }
   } else {
      SendError("Position not found: " + IntegerToString(positionId), requestId);
      return;
   }
   
   // Send success response
   CJAVal response;
   response["type"] = "TRADE_RESPONSE";
   response["requestId"] = requestId;
   response["success"] = true;
   response["positionId"] = (int)positionId;
   response["message"] = "Position modified successfully";
   
   SendResponse(response.Serialize());
   Log("Position modified: Ticket=" + IntegerToString(positionId) + 
       ", SL=" + DoubleToString(stopLoss, 5) + ", TP=" + DoubleToString(takeProfit, 5));
}

//+------------------------------------------------------------------+
//| Handle get account info command                                  |
//+------------------------------------------------------------------+
void HandleGetAccountInfo(string requestId)
{
   // Get account info using MT5 functions
   CJAVal response, accountData;
   response["type"] = "ACCOUNT_INFO";
   response["requestId"] = requestId;
   
   accountData["broker"] = AccountInfoString(ACCOUNT_COMPANY);
   accountData["server"] = AccountInfoString(ACCOUNT_SERVER);
   accountData["accountNumber"] = (int)AccountInfoInteger(ACCOUNT_LOGIN);
   accountData["accountName"] = AccountInfoString(ACCOUNT_NAME);
   accountData["accountCurrency"] = AccountInfoString(ACCOUNT_CURRENCY);
   accountData["balance"] = AccountInfoDouble(ACCOUNT_BALANCE);
   accountData["equity"] = AccountInfoDouble(ACCOUNT_EQUITY);
   accountData["margin"] = AccountInfoDouble(ACCOUNT_MARGIN);
   accountData["freeMargin"] = AccountInfoDouble(ACCOUNT_MARGIN_FREE);
   accountData["profit"] = AccountInfoDouble(ACCOUNT_PROFIT);
   
   // Calculate daily profit/loss and drawdown
   double dailyProfitLoss = CalculateDailyProfitLoss();
   double drawdown = CalculateDrawdown();
   
   accountData["dailyProfitLoss"] = dailyProfitLoss;
   accountData["drawdown"] = drawdown;
   
   response["data"] = accountData;
   SendResponse(response.Serialize());
}

//+------------------------------------------------------------------+
//| Calculate daily profit/loss percentage                           |
//+------------------------------------------------------------------+
double CalculateDailyProfitLoss()
{
   double profit = 0;
   datetime todayStart = TimeCurrent() - (TimeCurrent() % 86400); // Start of current day
   
   // Get history from today
   HistorySelect(todayStart, TimeCurrent());
   
   // Process closed deals
   for(int i=0; i<HistoryDealsTotal(); i++) {
      ulong dealTicket = HistoryDealGetTicket(i);
      if(dealTicket > 0) {
         profit += HistoryDealGetDouble(dealTicket, DEAL_PROFIT);
         profit += HistoryDealGetDouble(dealTicket, DEAL_SWAP);
         profit += HistoryDealGetDouble(dealTicket, DEAL_COMMISSION);
      }
   }
   
   // Add unrealized P/L from open positions
   for(int i=0; i<PositionsTotal(); i++) {
      ulong posTicket = PositionGetTicket(i);
      if(posTicket > 0) {
         profit += PositionGetDouble(POSITION_PROFIT);
         profit += PositionGetDouble(POSITION_SWAP);
      }
   }
   
   // Return profit as percentage of balance
   double balance = AccountInfoDouble(ACCOUNT_BALANCE);
   return (balance > 0) ? (profit / balance * 100.0) : 0;
}

//+------------------------------------------------------------------+
//| Calculate drawdown percentage                                    |
//+------------------------------------------------------------------+
double CalculateDrawdown()
{
   double balance = AccountInfoDouble(ACCOUNT_BALANCE);
   double equity = AccountInfoDouble(ACCOUNT_EQUITY);
   
   if (balance <= 0) return 0;
   
   return ((balance - equity) / balance) * 100.0;
}

//+------------------------------------------------------------------+
//| Publish market data to Node.js                                   |
//+------------------------------------------------------------------+
void PublishMarketData()
{
   // Get list of symbols we want to publish data for
   string symbols[];
   int symbolCount = GetActiveSymbols(symbols);
   
   for (int i = 0; i < symbolCount; i++) {
      string symbol = symbols[i];
      
      // Prepare market data
      CJAVal marketData;
      marketData["symbol"] = ConvertSymbolFormat(symbol);
      marketData["bid"] = SymbolInfoDouble(symbol, SYMBOL_BID);
      marketData["ask"] = SymbolInfoDouble(symbol, SYMBOL_ASK);
      marketData["spread"] = (int)SymbolInfoInteger(symbol, SYMBOL_SPREAD);
      marketData["digits"] = (int)SymbolInfoInteger(symbol, SYMBOL_DIGITS);
      marketData["point"] = SymbolInfoDouble(symbol, SYMBOL_POINT);
      
      // Publish under topic 'PRICE'
      string message = marketData.Serialize();
      pubSocket.send("PRICE", ZMQ_SNDMORE);
      pubSocket.send(message);
      
      if (DebugMode) {
         Log("Published market data for " + symbol + ": " + message);
      }
   }
}

//+------------------------------------------------------------------+
//| Get list of active symbols                                       |
//+------------------------------------------------------------------+
int GetActiveSymbols(string &symbols[])
{
   // Get symbols from open positions
   int count = 0;
   
   // Add current chart symbol
   ArrayResize(symbols, count + 1);
   symbols[count] = Symbol();
   count++;
   
   // Add symbols from open positions
   for (int i = 0; i < PositionsTotal(); i++) {
      ulong ticket = PositionGetTicket(i);
      if (ticket > 0) {
         string symbol = PositionGetString(POSITION_SYMBOL);
         
         // Check if already in the list
         bool found = false;
         for (int j = 0; j < count; j++) {
            if (symbols[j] == symbol) {
               found = true;
               break;
            }
         }
         
         // Add if not found
         if (!found) {
            ArrayResize(symbols, count + 1);
            symbols[count] = symbol;
            count++;
         }
      }
   }
   
   return count;
}

//+------------------------------------------------------------------+
//| Convert between our system's symbol format and MT5               |
//+------------------------------------------------------------------+
string ConvertSymbolFormat(string symbol)
{
   // Convert MT5 symbol format to our system's format (e.g., "EURUSD" to "EUR_USD")
   string result = symbol;
   
   // If it's a forex pair and doesn't have an underscore, insert one
   if (StringLen(symbol) == 6 && StringFind(symbol, "_") < 0) {
      result = StringSubstr(symbol, 0, 3) + "_" + StringSubstr(symbol, 3, 3);
   }
   
   return result;
}

//+------------------------------------------------------------------+
//| Normalize symbol from our format to MT5 format                  |
//+------------------------------------------------------------------+
string NormalizeSymbol(string symbol)
{
   // Convert our system's symbol format to MT5 format (e.g., "EUR_USD" to "EURUSD")
   string result = symbol;
   
   // Remove underscores
   StringReplace(result, "_", "");
   
   return result;
}

//+------------------------------------------------------------------+
//| Send error response                                              |
//+------------------------------------------------------------------+
void SendError(string errorMessage, string requestId = "", int errorCode = 0)
{
   Log("Error: " + errorMessage);
   
   CJAVal response;
   response["type"] = "ERROR";
   if (requestId != "") response["requestId"] = requestId;
   response["message"] = errorMessage;
   if (errorCode != 0) response["code"] = errorCode;
   
   SendResponse(response.Serialize());
}

//+------------------------------------------------------------------+
//| Send response back to Node.js                                    |
//+------------------------------------------------------------------+
void SendResponse(string message)
{
   if (!pushSocket.send(message)) {
      Log("Failed to send response: " + message);
   }
}

//+------------------------------------------------------------------+
//| Log message to console and file                                 |
//+------------------------------------------------------------------+
void Log(string message)
{
   string logMessage = TimeToString(TimeCurrent(), TIME_DATE|TIME_SECONDS) + " - " + message;
   
   if (DebugMode) {
      Print(logMessage);
   }
   
   if (LogToFile && fileHandle != INVALID_HANDLE) {
      FileWriteString(fileHandle, logMessage + "\n");
      FileFlush(fileHandle);
   }
}

//+------------------------------------------------------------------+
//| Expert tick function - handle price updates                      |
//+------------------------------------------------------------------+
void OnTick()
{
   // Process commands on each tick as well
   ProcessCommands();
} 