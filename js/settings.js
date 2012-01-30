// NAGIOS-DASH
// https://github.com/jbuchbinder/nagios-dash

// Set your Nagios URI here. If you run Nagios on the same server as
// Nagios-Dash, this will probably work for you. Nagios needs to be
// using the API branch from github to work properly:
//
//      https://github.com/jbuchbinder/nagios/tree/nagios-3.x-api
//

var nagiosuri = '/nagios';

// Set your Ganglia 2.x+ web UI URL here. This is required for detail
// views.

var gangliauri = '/ganglia-2';

var transform_nagios_hostname = function(orig) {
  // This function should take a Nagios hostname and transform it into
  // a Ganglia-acceptable hostname for your setup. By default, hostnames
  // are passed through.
  return orig;
};

var resolve_ganglia_cluster = function(host) {
	// This function should resolve to the ganglia cluster name for
	// a particular host. By default, this function is probably pretty
	// broken for your installation.
	return 'Infrastructure';
};

// vim: tabstop=4:softtabstop=4:shiftwidth=4:noexpandtab

