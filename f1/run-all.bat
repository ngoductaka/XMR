REM filepath: /Users/mac/Documents/XRM/f1/run-all.bat
@echo off
REM This batch file runs run_all.js with the parameter passed from command line
REM and re-runs it after 12 hours

:start
SET param=%~1
IF "%param%"=="" (
  echo No parameter provided. Using default value "pc"
  SET param=pc
)
SET param2=%~2
IF "%param2%"=="" (
  echo No second parameter provided. Using default empty value.
  SET param2=""
)

echo Running command: node run_all.js %param% %param2%
node run_all.js %param% %param2%

echo Script finished. Waiting 12 hours before running again...
timeout /t 43200 /nobreak
echo Restarting script...
goto start