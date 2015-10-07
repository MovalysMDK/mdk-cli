#!/usr/bin/expect

set timeout -1;
spawn {{{cmd}}};
expect {
    "Do you accept the license" { exp_send "y\r" ; exp_continue }
    eof
}
