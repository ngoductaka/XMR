@echo off

:start
echo Killing Chrome process, will kill again in 2 hours...
taskkill /F /IM chrome.exe
timeout /t 7200 /nobreak
goto start