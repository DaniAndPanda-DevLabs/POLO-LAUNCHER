
        const app_links = {
            '디데이': './apps/d-day.html',
            '타이머': './apps/timer.html',
            '주사위 던지기': './apps/dice.html',
            '랜덤 선택': './apps/random.html',
            '카메라' : './apps/cam.html',
            '돌림판': './apps/circlepan.html',
            '점수판': './apps/scoreboard.html',
            '메모': './apps/memo.html',
            '소음 측정기': './apps/noise-meter.html',
            'QR 코드 생성기': './apps/qrcodemaker.html',
            '실시간 시계': './apps/livetime.html',
            '체크리스트': './apps/checklist.html',
            'ChatAI': './apps/chatai.html',
            '설정': './apps/settings.html',
            '파일 암호화': './apps/filesecurety.html',
            'game': "./apps/game.html",
            '지구 라이브': './apps/earthlive.html',
            '업데이트 로그': "./apps/updateLog.html",
            '터미널': "./apps/terminal.html",
            '플레이어': "./apps/files-viewer/index.html"
        };

        alert("현재 POLO LAUNCHER는 베타 버전입니다. 일부 기능이 정상적으로 동작하지 않을 수 있습니다. ");

        function updateClock() {
        const now = new Date();

        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, "0");
        const d = String(now.getDate()).padStart(2, "0");

        let h = now.getHours();
        const min = String(now.getMinutes()).padStart(2, "0");

        const ampm = h >= 12 ? "오후" : "오전";
        h = h % 12 || 12;

        document.getElementById("livetime").innerHTML =
            `${y}-${m}-${d}<br>${ampm} ${h}:${min}`;
    }

        updateClock();
        setInterval(updateClock, 1000);

        const desktop = document.getElementById("desktop");
        const imageUrl = './bgimg.png';
        // const imageUrl = 'http://localhost:6678/backgroundimage.jpg';
        document.body.style.backgroundImage = `url(${imageUrl})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';

        let zIndexCounter = 100;

        function logLauncherEvent(message) {
            const timestamp = new Date().toISOString();
            fetch(`http://localhost:6766/logwrite/?writedata=${encodeURIComponent(`[${timestamp}] ${message}`)}`);
        }

        function createWindow(title, url) {
            // 이미 열려있는 창이 있는지 확인
            const windows = document.querySelectorAll('.window');
            for (let w of windows) {
                if (w.dataset.title === title) {
                    // 최소화 상태였다면 해제하고 맨 앞으로 가져오기
                    w.classList.remove('minimized');
                    w.style.zIndex = ++zIndexCounter;
                    logLauncherEvent(`launcher_window_restore_${title}`);
                    return;
                }
            }

            const win = document.createElement("div");
            win.className = "window";
            win.dataset.title = title;

            win.style.left = (100 + Math.random() * 150) + "px";
            win.style.top = (50 + Math.random() * 100) + "px";

            win.innerHTML = `
                <div class="window-header">
                    <span>${title}</span>
                    <div class="window-controls">
                        <button class="min-btn">─</button>
                        <button class="max-btn">□</button>
                        <button class="close-btn">✕</button>
                    </div>
                </div>
                <iframe src="${url}"></iframe>
            `;

            const iframe = win.querySelector('iframe');
            iframe.addEventListener('load', () => {
                logLauncherEvent(`launcher_iframe_loaded_${title}`);
            });

            desktop.appendChild(win);
            win.style.zIndex = ++zIndexCounter;
            logLauncherEvent(`launcher_window_created_${title}`);

            ['n', 'e', 's', 'w', 'ne', 'nw', 'se', 'sw'].forEach(direction => {
                const handle = document.createElement('div');
                handle.className = `resize-handle ${direction}`;
                win.appendChild(handle);

                handle.addEventListener('mousedown', (e) => {
                    if (win.classList.contains('maximized') || win.classList.contains('minimized')) return;

                    e.preventDefault();
                    e.stopPropagation();

                    const startX = e.clientX;
                    const startY = e.clientY;
                    const startWidth = win.offsetWidth;
                    const startHeight = win.offsetHeight;
                    const startLeft = win.offsetLeft;
                    const startTop = win.offsetTop;

                    win.classList.add('resizing');
                    document.body.style.userSelect = 'none';

                    logLauncherEvent(`launcher_window_resize_start_${title}_${direction}`);

                    const onMouseMove = (moveEvent) => {
                        const deltaX = moveEvent.clientX - startX;
                        const deltaY = moveEvent.clientY - startY;

                        let newWidth = startWidth;
                        let newHeight = startHeight;
                        let newLeft = startLeft;
                        let newTop = startTop;

                        if (direction.includes('e')) {
                            newWidth = Math.max(260, startWidth + deltaX);
                        }
                        if (direction.includes('w')) {
                            newWidth = Math.max(260, startWidth - deltaX);
                            newLeft = startLeft + (startWidth - newWidth);
                        }
                        if (direction.includes('s')) {
                            newHeight = Math.max(180, startHeight + deltaY);
                        }
                        if (direction.includes('n')) {
                            newHeight = Math.max(180, startHeight - deltaY);
                            newTop = startTop + (startHeight - newHeight);
                        }

                        win.style.width = `${newWidth}px`;
                        win.style.height = `${newHeight}px`;
                        win.style.left = `${newLeft}px`;
                        win.style.top = `${newTop}px`;
                        logLauncherEvent(`launcher_window_resize_${title}_${direction}_${Math.round(newWidth)}x${Math.round(newHeight)}`);
                    };

                    const onMouseUp = () => {
                        document.removeEventListener('mousemove', onMouseMove);
                        document.removeEventListener('mouseup', onMouseUp);
                        win.classList.remove('resizing');
                        document.body.style.userSelect = '';
                    };

                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('mouseup', onMouseUp);
                });
            });

            win.addEventListener("mousedown", () => {
                win.style.zIndex = ++zIndexCounter;
                logLauncherEvent(`launcher_window_focus_${title}`);
            });

            // 닫기
            win.querySelector(".close-btn").onclick = () => {
                win.remove();
                logLauncherEvent(`launcher_window_close_${title}`);
            };

            // 최소화 (접기/펴기)
            win.querySelector(".min-btn").onclick = (e) => {
                e.stopPropagation();
                // [수정] 최대화 상태일 때는 최소화(접기)가 작동하지 않도록 방어 코드 추가
                if(win.classList.contains("maximized")) win.classList.remove("maximized");
                win.classList.toggle("minimized");
                logLauncherEvent(`launcher_window_minimize_${title}_${win.classList.contains("minimized") ? "minimized" : "restored"}`);
            };

            // 최대화
            win.querySelector(".max-btn").onclick = (e) => {
                e.stopPropagation();
                // [수정] 최소화(접힌) 상태에서 최대화를 누르면 먼저 펼치도록 처리
                if(win.classList.contains("minimized")) win.classList.remove("minimized");
                win.classList.toggle("maximized");
                logLauncherEvent(`launcher_window_maximize_${title}_${win.classList.contains("maximized") ? "maximized" : "restored"}`);
            };

            // 드래그 로직
            const header = win.querySelector(".window-header");
            let dragging = false;
            let offsetX = 0;
            let offsetY = 0;

            header.addEventListener("mousedown", (e) => {
                if (win.classList.contains("maximized")) return;

                dragging = true;
                win.classList.add("dragging");
                logLauncherEvent(`launcher_window_drag_start_${title}`);
                
                offsetX = e.clientX - win.offsetLeft;
                offsetY = e.clientY - win.offsetTop;
            });

            document.addEventListener("mousemove", (e) => {
                if (!dragging) return;

                win.style.left = (e.clientX - offsetX) + "px";
                win.style.top = (e.clientY - offsetY) + "px";
                logLauncherEvent(`launcher_window_drag_move_${title}_${Math.round(win.offsetLeft)}_${Math.round(win.offsetTop)}`);
            });

            document.addEventListener("mouseup", () => {
                if (dragging) {
                    dragging = false;
                    win.classList.remove("dragging");
                    logLauncherEvent(`launcher_window_drag_end_${title}`);
                }
            });
        }

        // 태스크바 앱 클릭 이벤트
        document.querySelectorAll('.taskbar-app').forEach(button => {
            button.addEventListener('click', () => {
                const appName = button.title;
                if (app_links[appName]) {
                    logLauncherEvent(`launcher_taskbar_click_${appName}`);
                    createWindow(appName, app_links[appName]);
                }
            });
        });

        //404 오류 토스트
        let timer;

        function showToast() {
            const toast = document.getElementById("toast");

            clearTimeout(timer);

            toast.classList.add("show");

            timer = setTimeout(() => {
                toast.classList.remove("show");
            }, 5000);
        }

        // URL 파라미터 확인
        const params = new URLSearchParams(window.location.search);

        if (params.get("error") === "404") {
            showToast();
        }