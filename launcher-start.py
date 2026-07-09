#백엔드 실행하는 python 코드.
#USer가 이 파일 실행하면 자동으로 백앤드 열림
import subprocess
import sys
#백엔드 실행
subprocess.Popen(['python', './backend/app.py'])
print("백엔드가 실행되었습니다.")
sys.exit()