$(document).on('ready', function() {
    $('#bookTable').dataTable({
        "ajax": "http://127.0.0.1:3000/api/GetBookList"
    });
});