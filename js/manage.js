$(document).on('ready', function() {
    $('#bookTable').dataTable({
        "ajax": "http://library.itjesse.cn/API/Client/GetBookList"
    });
});
