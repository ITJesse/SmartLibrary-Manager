$(document).on('ready', function() {
    $('#bookTable').dataTable({
        "ajax": "http://192.168.1.204:3000/API/Client/GetBookList"
    });
});
