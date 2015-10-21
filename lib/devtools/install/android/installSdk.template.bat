@echo off

echo y | call {{{cmd}}}  || goto :error

{{#cmdBuildTools}}
echo y | call {{{cmdBuildTools}}}  || goto :error
{{/cmdBuildTools}}

goto :EOF

:error
exit /b 1
