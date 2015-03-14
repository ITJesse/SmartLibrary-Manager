$(document).on('ready', function(){
    $("#exit").on('click', function(){
        window.close();
    });

    $("#record").on('click', function(){
        chrome.app.window.create('record.html', {
            'bounds': {
                'width': 800,
                'height': 600
            },
            frame: 'none'
        });
        window.close();
    });

    $("#manage").on('click', function(){
        chrome.app.window.create('manage.html', {
            'bounds': {
                'width': 800,
                'height': 600
            },
            frame: 'none'
        });
        window.close();
    });

    $("#setting").on('click', function(){
        chrome.app.window.create('setting.html', {
            'bounds': {
                'width': 800,
                'height': 600
            },
            frame: 'none'
        });
        window.close();
    });
});
