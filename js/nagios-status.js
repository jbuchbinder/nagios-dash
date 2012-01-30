// NAGIOS-DASH
// https://github.com/jbuchbinder/nagios-dash

var baseuri = nagiosuri + '/cgi-bin/api.cgi';

// Global place to store Nagios alert data.
var alertData;

// Global place to store list of currently selected items.
var selectedItems;

function loadNagiosStatus() {
	$('#global-refresh').attr('disabled', 'disabled');
	$('#nagios-status-container').html('<div align="center" class="loading"><img src="img/ajax-loader.gif" border="0" /> <span style="display: block; vertical-align: middle; margin: 5px;">Loading ...</span></div>');
	var s = [];
	$.get(baseuri + '?action=service.problems' + ( $('#only-active').is(':checked') ? '&only_active=1' : '' ), function(data) {
		$('#global-refresh').removeAttr('disabled');
		alertData = data;
		// TODO: Sort and manipulate?
		alertData = sortByStatus(alertData);
		consolePopulate(alertData);
	});
}

function consolePopulate(data) {
	var toInsert = '';
	var iter = 0;
	$.each(data, function(k, d) {
		toInsert += '<div id="nagios-status-id-' + iter + '" class="nagios-status ' + d.status.toLowerCase() + '">' + statusToText(d, iter) + '</div>';
		iter++;
	});
	preLoadBinding(true);
	$('#nagios-status-container').html(toInsert);
	postLoadBinding();
}

function sortByStatus(data) {
	var crit = [ ];
	var warn = [ ];
	var unk  = [ ];
	$.each(data, function(k, d) {
		if (d.status == 'CRITICAL') { crit.push(d); }
		if (d.status == 'WARNING')  { warn.push(d); }
		if (d.status == 'UNKNOWN')  { unk.push(d);  }
	});
	return crit.concat(warn,unk);
}

function statusToText(s, i) {
	var acked = (s.acknowledged == 1);
	var muted = !(s.notifications_enabled == 1);
	//var selected = false;
	//$.each(selectedItems, function(key, item) {
	//	if (item == i) { selected = true; }
	//});
	return '<span class="statustext service">' + s.host + '[' + s.service + ']</span>' +
		'<span class="statustext action">' +
			( acked
				? '<img src="img/tick.png" border="0" id="ack-' + i + '" alt="Acknowledge Problem" />'
				: '<img src="img/check_box.png" border="0" alt="Acknowledged" />'
			) +
			( muted
				? '<img src="img/sound.png" border="0" id="unmute-' + i + '" alt="Enable Notifications" />'
				: '<img src="img/sound_mute.png" border="0" id="mute-' + i + '" alt="Disable Notifications" />'
			) +
			'<img src="img/umbrella.png" border="0" id="down-' + i + '" alt="Schedule Downtime" />' +
			'<img src="img/zoom_in.png" border="0" id="zoom-' + i + '" alt="View Details" />' +
			'<input type="checkbox" id="nagios-status-checkbox-' + i + '" class="nagios-status-checkbox" value="1" />' +
		'</span>' +
		'<span class="statustext output">' + s.plugin_output + '</span>';
}

// Refresh display for a particular service line, to be called after an
// action has been completed which would change its status.
function updateIndividualStatusLine(s, i) {
	var divId = 'nagios-status-id-' + id;

	// Hack alert -- rebinding *all* status line events
	preLoadBinding(false);
	$( '#' + divId ).html(statusToText(s, i));
	postLoadBinding();
}

function preLoadBinding(all) {
	// Remove all "selected items"
	if (all) { selectedItems = [ ]; }

	// Remove any past bindings to keep everything clean
	$( '.statustext' ).unbind();
	$( '.statustext.action img' ).unbind();
}

function postLoadBinding() {
	// Make sure "selected" exists for everything in selectedItems,
	// otherwise we'll lose selection on non-"all" reload.
	$.each(selectedItems, function(k, v) {
		$('#nagios-status-checkbox-' + v).prop('checked', true);

		// Add 'selected' class to parent, to let the CSS handle the
		// visual element of this being selected.
		$('#nagios-status-id-' + v).addClass('selected');
	});

	// Set click handler for all columns so that a click on the column
	// is the same as a virtual click on a checkbox so that we don't
	// have to include a checkbox.
	$( '.statustext' ).bind('click', function() {
		var id = $(this).parent().attr('id').replace('nagios-status-id-', '');
		var checked = $('#nagios-status-checkbox-' + id).is(':checked');
		$('#nagios-status-checkbox-' + id).prop('checked', !checked);

		// Add 'selected' class to parent, to let the CSS handle the
		// visual element of this being selected.
		if (!checked) {
			$(this).parent().addClass('selected');
		} else {
			$(this).parent().removeClass('selected');
		}
		return false;
	});

	// Click handler for all "action" icons for atomic actions.
	$('.statustext.action img').bind('click', function() {
		var parts = $(this).attr('id').split('-'); 
		var action = parts[0];
		var id = parts[1];
		var d = alertData[ id ];
		var onlyActive = $('#only-active').is(':checked');

		if ( action == 'ack') {
			$( "#dialog-ack-single" ).dialog({
				resizable: false,
				height: 140,
				modal: true,
				buttons: {
					"Acknowledge": function() {
						$( '#nagios-notification-bar').text( d.host + '[' + d.service + '] acknowledged' );
						$( '#nagios-notification-bar').show();
						$( this ).dialog( "close" );
						nagiosAction( action, d, null );
					},
					"Cancel": function() {
						$( this ).dialog( "close" );
					}
				}
			});
		} else if ( action == 'mute' ) {
			$( "#dialog-ack-mute" ).dialog({
				resizable: false,
				height: 140,
				modal: true,
				buttons: {
					"Mute": function() {
						$( '#nagios-notification-bar').text( d.host + '[' + d.service + '] muted notifications' );
						$( '#nagios-notification-bar').show();
						$( this ).dialog( "close" );
						nagiosAction( action, d, null );
					},
					"Cancel": function() {
						$( this ).dialog( "close" );
					}
				}
			});
		} else if ( action == 'unmute' ) {
			$( "#dialog-ack-unmute" ).dialog({
				resizable: false,
				height: 140,
				modal: true,
				buttons: {
					"Unmute": function() {
						$( '#nagios-notification-bar').text( d.host + '[' + d.service + '] unmuted notifications' );
						$( '#nagios-notification-bar').show();
						$( this ).dialog( "close" );
						nagiosAction( action, d, null );
					},
					"Cancel": function() {
						$( this ).dialog( "close" );
					}
				}
			});
		} else if ( action == 'zoom' ) {
			// Populate zoom with host settings
			var g_hostname = transform_nagios_hostname( d.host );

			// TODO: Show some sort of loading dialog to avoid awkward
			// stale data in certain cases.

			// Pre-render display
			renderZoom( g_hostname );

			// Display zoom dialog
			$( '#dialog-zoom' ).dialog({
				resizable: false,
				height: 400,
				modal: true,
				buttons: {
					"Close": function() {
						$( this ).dialog( "close" );
					}
				}
			});
		} else if ( action == 'down' ) {
			$( "#dialog-ack-down" ).dialog({
				resizable: false,
				height: 140,
				modal: true,
				buttons: {
					"Set Downtime": function() {
						$( '#nagios-notification-bar').text( d.host + '[' + d.service + '] set for downtime' );
						$( '#nagios-notification-bar').show();
						$( this ).dialog( "close" );
						nagiosAction( action, d, null );
					},
					"Cancel": function() {
						$( this ).dialog( "close" );
					}
				}
			});
		}

		return false; // stop executing here
	});
}

// Perform the actual calls to the Nagios API which execute the
// action in question.
function nagiosAction( action, d, options ) {
	var reqUrl = baseuri + '?action=';

	// Form request URL based on the action
	if (action == 'ack') {
		reqUrl += 'service.ack&host=' + encodeURIComponent(d.host) +
			'&service=' + encodeURIComponent(d.service) +
			'&persistent_comment=1' +
			'&send_notification=1' +
			'&comment=' + encodeURIComponent(options['comment']);
	} else if (action == 'hostack') {
		// TODO: implement in UI
		reqUrl += 'host.ack&host=' + encodeURIComponent(d.host) +
			'&persistent_comment=1' +
			'&send_notification=1' +
			'&comment=' + encodeURIComponent(options['comment']);
	} else if (action == 'down') {
		// TODO: implement down in API
	} else if (action == 'mute') {
		reqUrl += 'service.notifications&host=' + encodeURIComponent(d.host) +
			'&enable=0';
	} else if (action == 'unmute') {
		reqUrl += 'service.notifications&host=' + encodeURIComponent(d.host) +
			'&enable=1';
	} else {
		alert('Invalid action "' + action + '" specified!');
		return;
	}

	// Perform API call
	$.get(reqUrl, function(data) {
		if (onlyActive) {
			// If we're only showing 'active' stuff, animate hide action
			$( '#nagios-status-id-' + id ).hide( 'pulsate', {}, 300, function() {
				$( '#nagios-notification-bar').hide();
			});
		} else {
			// If we're displaying everything, we need to populate the UI
			// with all applicable data, so re-render.

			// Adjust our internal data structure
			if (action == 'ack') {
				d.acknowledged = 1;	
			} else if (action == 'down') {
				// TODO: fix action
			} else if (action == 'mute') {
				d.notifications_enabled = 0;
			} else if (action == 'unmute') {
				d.notifications_enabled = 1;
			}

			// Force UI update for that line
			updateIndividualStatusLine(d, id);
		}
	});
}

function renderZoom( hostname ) {
	$.get(gangliauri + '/api/host.php?action=get&h=' + encodeURIComponent(hostname), function(data) {
		var html = "";
		$.each(data['graph'], function(k, d) {
			html += '<img src="' + d['graph_url'] + '" />'
		});
		$( '#dialog-zoom' ).html( html );
	});
} // end renderZoom

$(document).ready(function() {
	// Bind button actions
	$( '#global-refresh' ).bind('click', function() {
		loadNagiosStatus();
	});
	$( '#nagios-notification-bar').hide();

	// Load all data
	loadNagiosStatus();
});

// vim: tabstop=4:softtabstop=4:shiftwidth=4:noexpandtab

