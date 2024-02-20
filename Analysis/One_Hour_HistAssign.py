import threading
import subprocess


def controller():
    t = threading.Thread(target=start)
    t.start()
    t.join()


def start():
    from subprocess import check_output
    out = check_output(["One_Hour_HistAssign.js"])
    print(out)
controller()