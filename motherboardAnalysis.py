import threading
import PistonAnalysis
import PistontwoAnalysis
import PistonStocksAnalysis



if __name__ == "__main__":
    #threading.Thread(target=PistontwoAnalysis.borjan).start()
    #threading.Thread(target=PistonAnalysis.borjan).start()
    threading.Thread(target=PistonStocksAnalysis.borjan).start()


# /* © 2022 Emraan Adem Ibrahim. See the license terms in the file 'license.txt' which should
# have been included with this distribution. */