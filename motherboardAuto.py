import threading
import PistonAnalysisAuto
import PistontwoAnalysisAuto
import PistonStocksAnalysisAuto



if __name__ == "__main__":
    threading.Thread(target=PistonAnalysisAuto.borjan).start()
    threading.Thread(target=PistontwoAnalysisAuto.borjan).start()
    threading.Thread(target=PistonStocksAnalysisAuto.borjan).start()


# /* © 2022 Emraan Adem Ibrahim. See the license terms in the file 'license.txt' which should
# have been included with this distribution. */