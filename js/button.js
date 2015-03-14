$(document).on('ready', function() {
    var mark = window.location.href.split('#');
    $('[id='+mark[1]+']').parent().addClass('active');

    var title = '';
    switch(mark[1]){
        case 'record':
            title = '图书录入';
            break;
        case 'manage':
            title = '图书管理';
            break;
        case 'setting':
            title = '串口设置';
            break;
        default:
            title = '智慧图书馆';
    }
    $('#title').text(title);

    $("#record").on('click', function() {
        chrome.app.window.create('record.html#record', {
            'bounds': {
                'width': 800,
                'height': 600
            },
            frame: 'none'
        });
        window.close();
    });

    $("#manage").on('click', function() {
        chrome.app.window.create('manage.html#manage', {
            'bounds': {
                'width': 800,
                'height': 600
            },
            frame: 'none'
        });
        window.close();
    });

    $("#setting").on('click', function() {
        chrome.app.window.create('setting.html#setting', {
            'bounds': {
                'width': 800,
                'height': 600
            },
            frame: 'none'
        });
        window.close();
    });

    $("#exit").on('click', function() {
        window.close();
    });
});
