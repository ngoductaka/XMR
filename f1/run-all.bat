@echo off
REM This batch file runs the Node.js run.js script with the provided machine name parameter
REM and automatically restarts it after 5 seconds if it exits
REM Usage: auto-restart.bat [machine_name]

SETLOCAL EnableDelayedExpansion

REM Get the machine name parameter or use "w" as default
SET machine=%1
IF "%machine%"=="" SET machine=w

:start
echo Running run.js with machine: %machine%
node run.js %machine%
echo Process exited, restarting in 60 seconds...
timeout /t 20 /nobreak
REM Kill all Chrome processes
echo Killing all Chrome processes...
taskkill /F /IM chrome.exe /T
timeout /t 20 /nobreak
goto start
