import threading
import HistAssignOne

def control():
    threading.Thread(target=HistAssignOne.begin).start()

control()