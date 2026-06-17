import os as sysOS
import time, random
from utils import func_os
func_os.OS.boot()
os = func_os.OS
import re
p_echo = re.compile(r"echo\s(.*)", re.DOTALL)
p_cls = re.compile("cls")
p_off = re.compile("off")
p_cal = re.compile(r"cal\s(.*)", re.DOTALL)
while True:
  choice = input("cmd >>> ")
  if p_echo.match(choice):
    os.echo(p_echo.sub(r"\g<1>", choice))
  elif p_cls.match(choice):
    os.cls()
  elif p_off.match(choice):
    os.off()
  elif p_cal.match(choice):
    os.cal(p_cal.sub(r"\g<1>", choice))
  elif choice == "cmd":
    print("cmd")