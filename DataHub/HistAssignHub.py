import threading
import HistAssignOne
import HistAssignStocks
import HistAssignTwo

def control():
    threading.Thread(target=HistAssignOne.begin).start()
    threading.Thread(target=HistAssignTwo.begin).start()
    threading.Thread(target=HistAssignStocks.begin).start()