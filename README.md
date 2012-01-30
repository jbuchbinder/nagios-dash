NAGIOS-DASH
===========

OVERVIEW
--------

This is a jQuery-based administration dashboard for Nagios, meant to
replace the standard Nagios dashboard for operations teams and NOCs.

It does not have all of the functionality of the standard Nagios UI,
nor does it intend to do so.

It requires the Nagios API work in the nagios-3.x-api branch, located
here:

  https://github.com/jbuchbinder/nagios/tree/nagios-3.x-api

or the Icinga API patch, available here:

  https://github.com/jbuchbinder/icinga-core

It should also have a copy of Ganglia 2.x+ available with the host
API implemented, which is available here:

  https://github.com/ganglia/ganglia-web

CONFIGURATION
-------------

To configure the console, edit js/settings.js and set the base URL of
your Nagios/Icinga installation. Other than a working copy of the api.cgi
binary from the aforementioned git branch, and a copy of the Ganglia web
interface, there are no external dependencies or server requirements.

Enjoy!

