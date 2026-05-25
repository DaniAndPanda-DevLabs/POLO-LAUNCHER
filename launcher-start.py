#백엔드 실행 그리고 gui 실행하는 python 코드.
#USer가 이 파일 실행하면 자동으로 백앤드 둥 다 열림
import subprocess
import sys
#백엔드 실행
subprocess.Popen(['python', 'backend.py'])
#GUI 실행
subprocess.Popen(['python', 'gui.py'])
print("백엔드와 GUI가 실행되었습니다.")
sys.exit()