@echo off
echo Enviando atualizacoes...

discloud app c 1775077175166
if %errorlevel% neq 0 (
    echo ERRO no commit!
    pause
    exit
)

echo Reiniciando bot...

discloud app restart
if %errorlevel% neq 0 (
    echo ERRO no restart!
    pause
    exit
)

echo Deploy feito com sucesso!
pause