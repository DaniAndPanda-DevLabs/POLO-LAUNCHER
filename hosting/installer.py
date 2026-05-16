import zipfile

print("polo os를 설치하시겠습니까? (y/n)")
input = input()
if input == "y":
    print("설치를 시작합니다...")
    # ./install.zip을 ../luncher/에 압축 해제하는 코드

    with zipfile.ZipFile('./install.zip', 'r') as zip_ref:
        zip_ref.extractall('../luncher/')
    print("설치가 완료되었습니다.")
else:
    print("설치를 취소하였습니다.")

# 참고 : 이거 ai 없이 내가 다 만든거임.