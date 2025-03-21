//+------------------------------------------------------------------+
//|                                MT5-Simple-Bridge.mq5            |
//|                     MetaTrader 5 Expert Advisor for NodeJS API   |
//|                   Connects MT5 platform to trading algorithms    |
//+------------------------------------------------------------------+
#property copyright "Nervala Trading System"
#property link      ""
#property version   "1.0"
#property strict

#include <Trade\Trade.mqh>

// Constants for socket connection
#define SERVER_PORT 5555   // Port to communicate with Node.js app

// Magic number for trade identification
input int    MagicNumber = 12345;

// Debug settings
input bool   DebugMode = true;
input bool   LogToFile = true;
input string LogFileName = "mt5-bridge.log";

// Global variables
CTrade       trade;           // Trading object
int          fileHandle;      // Log file handle
int          serverSocket;    // Socket for communication

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   // Open log file if needed
   if(LogToFile) {
      fileHandle = FileOpen(LogFileName, FILE_WRITE|FILE_TXT);
      if(fileHandle == INVALID_HANDLE) {
         Print("Failed to open log file: ", GetLastError());
      }
   }
   
   Log("Initializing Simple MT5 Bridge...");
   
   // Set up trading
   trade.SetExpertMagicNumber(MagicNumber);
   
   // Start timer for regular updates
   EventSetMillisecondTimer(100);
   
   Log("Bridge initialized successfully");
   
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   Log("Shutting down bridge...");
   
   // Close log file
   if(LogToFile && fileHandle != INVALID_HANDLE) {
      FileClose(fileHandle);
   }
   
   Log("Bridge shut down");
}

//+------------------------------------------------------------------+
//| Expert timer function - process messages                         |
//+------------------------------------------------------------------+
void OnTimer()
{
   // Process trading logic on timer
   
   // Since we can't use sockets directly without the library,
   // we'll use files for inter-process communication
   
   // Check for command file
   string commandFileName = "mt5_commands.txt";
   if(FileIsExist(commandFileName, FILE_COMMON)) {
      int cmdFile = FileOpen(commandFileName, FILE_READ|FILE_TXT|FILE_COMMON);
      if(cmdFile != INVALID_HANDLE) {
         while(!FileIsEnding(cmdFile)) {
            string command = FileReadString(cmdFile);
            if(command != "") {
               ProcessCommand(command);
            }
         }
         FileClose(cmdFile);
         
         // Delete the file after processing
         FileDelete(commandFileName, FILE_COMMON);
      }
   }
}

//+------------------------------------------------------------------+
//| Process a command                                               |
//+------------------------------------------------------------------+
void ProcessCommand(string message)
{
   if(message == "") return;
   
   Log("Processing command: " + message);
   
   // Simple command parsing
   string parts[];
   int count = StringSplit(message, '|', parts);
   
   if(count < 1) {
      WriteResponse("ERROR|Invalid command format");
      return;
   }
   
   string action = parts[0];
   
   // Process based on action type
   if(action == "PING") {
      WriteResponse("PONG|" + TimeToString(TimeCurrent()));
   } 
   else if(action == "BUY" && count >= 5) {
      // Format: BUY|symbol|volume|sl|tp
      string symbol = parts[1];
      double volume = StringToDouble(parts[2]);
      double sl = StringToDouble(parts[3]);
      double tp = StringToDouble(parts[4]);
      
      // Execute buy order
      if(ExecuteBuy(symbol, volume, sl, tp)) {
         WriteResponse("SUCCESS|BUY|" + IntegerToString(trade.ResultDeal()));
      } else {
         WriteResponse("ERROR|BUY|" + IntegerToString(trade.ResultRetcode()));
      }
   }
   else if(action == "SELL" && count >= 5) {
      // Format: SELL|symbol|volume|sl|tp
      string symbol = parts[1];
      double volume = StringToDouble(parts[2]);
      double sl = StringToDouble(parts[3]);
      double tp = StringToDouble(parts[4]);
      
      // Execute sell order
      if(ExecuteSell(symbol, volume, sl, tp)) {
         WriteResponse("SUCCESS|SELL|" + IntegerToString(trade.ResultDeal()));
      } else {
         WriteResponse("ERROR|SELL|" + IntegerToString(trade.ResultRetcode()));
      }
   }
   else if(action == "CLOSE" && count >= 2) {
      // Format: CLOSE|ticket
      ulong ticket = StringToInteger(parts[1]);
      
      // Close position
      if(ClosePosition(ticket)) {
         WriteResponse("SUCCESS|CLOSE|" + parts[1]);
      } else {
         WriteResponse("ERROR|CLOSE|" + IntegerToString(trade.ResultRetcode()));
      }
   }
   else if(action == "MODIFY" && count >= 4) {
      // Format: MODIFY|ticket|sl|tp
      ulong ticket = StringToInteger(parts[1]);
      double sl = StringToDouble(parts[2]);
      double tp = StringToDouble(parts[3]);
      
      // Modify position
      if(ModifyPosition(ticket, sl, tp)) {
         WriteResponse("SUCCESS|MODIFY|" + parts[1]);
      } else {
         WriteResponse("ERROR|MODIFY|" + IntegerToString(trade.ResultRetcode()));
      }
   }
   else if(action == "ACCOUNT") {
      // Get account info
      string accountInfo = GetAccountInfo();
      WriteResponse("ACCOUNT|" + accountInfo);
   }
   else {
      WriteResponse("ERROR|Unknown command: " + action);
   }
}

//+------------------------------------------------------------------+
//| Execute a buy order                                              |
//+------------------------------------------------------------------+
bool ExecuteBuy(string symbol, double volume, double sl, double tp)
{
   if(volume <= 0) volume = 0.01;  // Default value
   
   double price = SymbolInfoDouble(symbol, SYMBOL_ASK);
   return trade.Buy(volume, symbol, price, sl, tp, "Buy from Nervala");
}

//+------------------------------------------------------------------+
//| Execute a sell order                                             |
//+------------------------------------------------------------------+
bool ExecuteSell(string symbol, double volume, double sl, double tp)
{
   if(volume <= 0) volume = 0.01;  // Default value
   
   double price = SymbolInfoDouble(symbol, SYMBOL_BID);
   return trade.Sell(volume, symbol, price, sl, tp, "Sell from Nervala");
}

//+------------------------------------------------------------------+
//| Close a position                                                 |
//+------------------------------------------------------------------+
bool ClosePosition(ulong ticket)
{
   if(PositionSelectByTicket(ticket)) {
      string symbol = PositionGetString(POSITION_SYMBOL);
      double volume = PositionGetDouble(POSITION_VOLUME);
      ENUM_POSITION_TYPE posType = (ENUM_POSITION_TYPE)PositionGetInteger(POSITION_TYPE);
      
      // Close the position
      if(posType == POSITION_TYPE_BUY)
         return trade.Sell(volume, symbol, 0, 0, 0, "Close position");
      else
         return trade.Buy(volume, symbol, 0, 0, 0, "Close position");
   }
   
   return false;
}

//+------------------------------------------------------------------+
//| Modify a position                                                |
//+------------------------------------------------------------------+
bool ModifyPosition(ulong ticket, double sl, double tp)
{
   if(PositionSelectByTicket(ticket)) {
      // If stopLoss or takeProfit aren't specified, use existing values
      if(sl == 0) sl = PositionGetDouble(POSITION_SL);
      if(tp == 0) tp = PositionGetDouble(POSITION_TP);
      
      return trade.PositionModify(ticket, sl, tp);
   }
   
   return false;
}

//+------------------------------------------------------------------+
//| Get account information                                          |
//+------------------------------------------------------------------+
string GetAccountInfo()
{
   string info = "";
   
   info += AccountInfoString(ACCOUNT_COMPANY) + "|";
   info += AccountInfoString(ACCOUNT_SERVER) + "|";
   info += IntegerToString(AccountInfoInteger(ACCOUNT_LOGIN)) + "|";
   info += AccountInfoString(ACCOUNT_CURRENCY) + "|";
   info += DoubleToString(AccountInfoDouble(ACCOUNT_BALANCE), 2) + "|";
   info += DoubleToString(AccountInfoDouble(ACCOUNT_EQUITY), 2) + "|";
   info += DoubleToString(AccountInfoDouble(ACCOUNT_MARGIN), 2) + "|";
   info += DoubleToString(AccountInfoDouble(ACCOUNT_PROFIT), 2);
   
   return info;
}

//+------------------------------------------------------------------+
//| Write a response to file                                        |
//+------------------------------------------------------------------+
void WriteResponse(string message)
{
   string responseFileName = "mt5_responses.txt";
   int respFile = FileOpen(responseFileName, FILE_WRITE|FILE_TXT|FILE_COMMON);
   
   if(respFile != INVALID_HANDLE) {
      FileWriteString(respFile, message + "\n");
      FileClose(respFile);
      Log("Response written: " + message);
   } else {
      Log("Failed to write response: " + message + ", Error: " + IntegerToString(GetLastError()));
   }
}

//+------------------------------------------------------------------+
//| Log message to console and file                                 |
//+------------------------------------------------------------------+
void Log(string message)
{
   string logMessage = TimeToString(TimeCurrent(), TIME_DATE|TIME_SECONDS) + " - " + message;
   
   if(DebugMode) {
      Print(logMessage);
   }
   
   if(LogToFile && fileHandle != INVALID_HANDLE) {
      FileWriteString(fileHandle, logMessage + "\n");
      FileFlush(fileHandle);
   }
}

//+------------------------------------------------------------------+
//| Expert tick function - handle price updates                      |
//+------------------------------------------------------------------+
void OnTick()
{
   // Check for commands on each tick as well
   OnTimer();
} 