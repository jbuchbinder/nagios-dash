
var baseuri = nagiosuri + '/cgi-bin/api.cgi';

var alertData;

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
	preLoadBinding();
	$('#nagios-status-container').html(toInsert);
	postLoadBinding();
	$('.statustext.action img').bind('click', function() {
		var parts = $(this).attr('id').split('-'); 
		var action = parts[0];
		var id = parts[1];
		var d = alertData[ id ];
		if ( action == 'ack') {
			$( '#nagios-notification-bar').text( d.host + '[' + d.service + '] acknowledged' );
			$( '#nagios-notification-bar').show();
		} else if ( action = 'down' ) {
			$( '#nagios-notification-bar').text( d.host + '[' + d.service + '] set for downtime' );
			$( '#nagios-notification-bar').show();

		}
		$( '#nagios-status-id-' + id ).hide( 'pulsate', {}, 300, function() {
			$( '#nagios-notification-bar').hide();
		});
		return false; // stop executing here
	});
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
	return '<span class="statustext service">' + s.host + '[' + s.service + ']</span>' +
		'<span class="statustext action">' +
			'<img src="img/tick.png" border="0" id="ack-' + i + '" alt="Acknowledge Problem" />' +
			'<img src="img/sound_mute.png" border="0" id="mute-' + i + '" alt="Disable Notifications" />' +
			'<img src="img/umbrella.png" border="0" id="downtime-' + i + '" alt="Schedule Downtime" />' +
			'<input type="checkbox" id="nagios-status-checkbox-' + i + '" class="nagios-status-checkbox" value="1" />' +
		'</span>' +
		'<span class="statustext output">' + s.plugin_output + '</span>';
}

function preLoadBinding() {
	$( '.statustext' ).unbind();
}

function postLoadBinding() {
	$( '.statustext' ).bind('click', function() {
		var id = $(this).parent().attr('id').replace('nagios-status-id-', '');
		var checked = $('#nagios-status-checkbox-' + id).is(':checked');
		$('#nagios-status-checkbox-' + id).prop('checked', !checked);
		// Add 'selected' class to parent
		if (!checked) {
			$(this).parent().addClass('selected');
		} else {
			$(this).parent().removeClass('selected');
		}
		return false;
	});
	$( '.nagios-status-checkbox' ).click(function() {
		var id = $(this).attr('id').replace('nagios-status-checkbox-', '');
		var checked = $(this).is(':checked');
		if (checked) {
			$('#nagios-status-id-' + id).addClass('selected');
			$(this).prop('checked', true);
		} else {
			$('#nagios-status-id-' + id).removeClass('selected');
			$(this).prop('checked', false);
		}
		return false;
	});
}

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

