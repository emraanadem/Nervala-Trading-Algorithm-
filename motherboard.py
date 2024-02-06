import threading
import Piston
import PistonStocks
import Pistontwo



if __name__ == "__main__":
    #server = Server(Piston.borjan())
    #server.serve()
    threading.Thread(target=Piston.borjan).start()
   #threading.Thread(target=Pistontwo.borjan).start()
   #threading.Thread(target=PistonStocks.borjan).start()


# /* © 2022 Emraan Adem Ibrahim. See the license terms in the file 'license.txt' which should
# have been included with this distribution. */