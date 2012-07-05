var socket = io.connect();

socket.emit('signingInfo', $('#userId').val(), $('#userName').val(), $('#docId').val(), $('#email').val()); 

socket.on('recipientUrl', function(data) {
	$('#container h2').remove();
    $('#container iframe').attr('src', data);
})