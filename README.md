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

CONFIGURATION
-------------

To configure the console, edit js/settings.js and set the base URL of
your Nagios installation. Other than a working copy of the api.cgi
binary from the aforementioned git branch, there are no external
dependencies or server requirements.

Enjoy!

