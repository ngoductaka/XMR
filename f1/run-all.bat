@echo off
REM This batch file runs run_all.js with the parameter passed from command line
REM and re-runs it after 10 seconds

SET param=%~1
IF "%param%"=="" (
  echo No parameter provided. Using default value "pc"
  SET param=pc
)
SET param2=%~2
IF "%param%"=="" (
  echo No parameter provided. Using default value "pc"
  SET param2=""
)

echo Running command: node run_all.js %param% %param2%
node run_all.js %param% %param2%
