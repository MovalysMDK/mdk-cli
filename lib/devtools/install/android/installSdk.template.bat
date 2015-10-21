@echo off

echo y | call {{{cmd}}}

{{#cmdBuildTools}}
echo y | call {{{cmdBuildTools}}}
{{/cmdBuildTools}}

goto :EOF

:error
exit /b 1
