//+------------------------------------------------------------------+
//|                                MT5-File-Bridge.mq5               |
//|                     MetaTrader 5 Expert Advisor for NodeJS API   |
//|                   Connects MT5 platform to trading algorithms    |
//+------------------------------------------------------------------+
#property copyright "Nervala Trading System"
#property link      ""
#property version   "1.0"
#property strict

#include <Trade\Trade.mqh>

// Magic number for trade identification
input int    MagicNumber = 12345;

// Debug settings
input bool   DebugMode = true;
input bool   LogToFile = true;
input string LogFileName = "mt5-file-bridge.log";

// File polling interval (milliseconds)
input int    PollInterval = 100;

// Global variables
CTrade       trade;           // Trading object
int          fileHandle;      // Log file handle
string       commandsFile;    // Commands file path 
string       responsesFile;   // Responses file path

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
   
   Log("Initializing MT5 File Bridge...");
   
   // Set up file paths
   commandsFile = "mt5_commands.txt";
   responsesFile = "mt5_responses.txt";
   
   // Delete old response file if it exists
   if(FileIsExist(responsesFile)) {
      FileDelete(responsesFile);
   }
   
   // Set up trading
   trade.SetExpertMagicNumber(MagicNumber);
   
   // Start timer for regular updates
   EventSetMillisecondTimer(PollInterval);
   
   Log("MT5 File Bridge initialized successfully");
   
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   Log("Shutting down MT5 File Bridge...");
   
   // Close log file
   if(LogToFile && fileHandle != INVALID_HANDLE) {
      FileClose(fileHandle);
   }
   
   Log("MT5 File Bridge shut down");
}

//+------------------------------------------------------------------+
//| Expert timer function - process messages                         |
//+------------------------------------------------------------------+
void OnTimer()
{
   // Check for command file
   if(FileIsExist(commandsFile)) {
      int cmdFile = FileOpen(commandsFile, FILE_READ|FILE_TXT);
      if(cmdFile != INVALID_HANDLE) {
         string allCommands = "";
         
         // Read all commands
         while(!FileIsEnding(cmdFile)) {
            string command = FileReadString(cmdFile);
            if(command != "") {
               allCommands += command + "\n";
            }
         }
         FileClose(cmdFile);
         
         // Delete the file after reading
         FileDelete(commandsFile);
         
         // Process each command
         if(allCommands != "") {
            string commands[];
            StringSplit(allCommands, '\n', commands);
            
            for(int i = 0; i < ArraySize(commands); i++) {
               if(commands[i] != "") {
                  ProcessCommand(commands[i]);
               }
            }
         }
      }
   }
}

//+------------------------------------------------------------------+
//| Process a command                                                |
//+------------------------------------------------------------------+
void ProcessCommand(string message)
{
   Log("Processing command: " + message);
   
   // Parse the command
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
         WriteResponse("SUCCESS|CLOSE|" + IntegerToString(trade.ResultDeal()));
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
         WriteResponse("SUCCESS|MODIFY|" + IntegerToString(ticket));
      } else {
         WriteResponse("ERROR|MODIFY|" + IntegerToString(trade.ResultRetcode()));
      }
   }
   else if(action == "ACCOUNT") {
      // Get account info
      WriteResponse("ACCOUNT|" + GetAccountInfo());
   }
   else {
      WriteResponse("ERROR|Unknown command: " + action);
   }
}

//+------------------------------------------------------------------+
//| Execute a buy order                                              |
//+------------------------------------------------------------------+
bool ExecuteBuy(string symbol, double volume, double stopLoss, double takeProfit)
{
   if(volume <= 0) volume = 0.01; // Default minimum volume
   
   // Get current price
   double price = SymbolInfoDouble(symbol, SYMBOL_ASK);
   
   // Calculate SL/TP if provided as points
   if(stopLoss > 0 && stopLoss < 1) {
      stopLoss = price - stopLoss * SymbolInfoDouble(symbol, SYMBOL_POINT) * 10000;
   }
   
   if(takeProfit > 0 && takeProfit < 1) {
      takeProfit = price + takeProfit * SymbolInfoDouble(symbol, SYMBOL_POINT) * 10000;
   }
   
   // Execute buy
   return trade.Buy(volume, symbol, price, stopLoss, takeProfit, "File Bridge");
}

//+------------------------------------------------------------------+
//| Execute a sell order                                             |
//+------------------------------------------------------------------+
bool ExecuteSell(string symbol, double volume, double stopLoss, double takeProfit)
{
   if(volume <= 0) volume = 0.01; // Default minimum volume
   
   // Get current price
   double price = SymbolInfoDouble(symbol, SYMBOL_BID);
   
   // Calculate SL/TP if provided as points
   if(stopLoss > 0 && stopLoss < 1) {
      stopLoss = price + stopLoss * SymbolInfoDouble(symbol, SYMBOL_POINT) * 10000;
   }
   
   if(takeProfit > 0 && takeProfit < 1) {
      takeProfit = price - takeProfit * SymbolInfoDouble(symbol, SYMBOL_POINT) * 10000;
   }
   
   // Execute sell
   return trade.Sell(volume, symbol, price, stopLoss, takeProfit, "File Bridge");
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
   int respFile = FileOpen(responsesFile, FILE_WRITE|FILE_TXT);
   
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
   // Process commands on each tick as well
   OnTimer();
} 