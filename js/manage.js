$(document).on('ready', function() {
    $('#bookTable').dataTable({
        "ajax": "http://42.96.200.228:3001/api/GetBookList"
    });
});
