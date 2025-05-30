@echo off

:start
echo Killing Chrome process, will kill again in 2 hours...
timeout /t 7200 /nobreak
taskkill /F /IM chrome.exe
goto start