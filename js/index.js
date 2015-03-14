$(document).on('ready', function() {
    $("#exit").on('click', function() {
        window.close();
    });

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
});
