import threading
import PistonData
import PistontwoData
import PistonStocksData



if __name__ == "__main__":
    #threading.Thread(target=PistontwoData.borjan).start()
    #threading.Thread(target=PistonData.borjan).start()
    threading.Thread(target=PistonStocksData.borjan).start()

  
# /* © 2022 Emraan Adem Ibrahim. See the license terms in the file 'license.txt' which should
# have been included with this distribution. */