import LivePrice
import threading
import LowHub
import HighHub
import DataHub

def controller():
    threading.Thread(target=LivePrice.controlbox).start()
    threading.Thread(target=DataHub.controlbox).start()
    threading.Thread(target=HighHub.controlbox).start()
    threading.Thread(target=LowHub.controlbox).start()

controller()

# /* © 2022 Emraan Adem Ibrahim. See the license terms in the file 'license.txt' which should
# have been included with this distribution. */