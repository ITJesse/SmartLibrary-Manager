chrome.app.runtime.onLaunched.addListener(function() {
    chrome.app.window.create('index.html', {
        'bounds': {
            'width': 270,
            'height': 234
        },
        frame: 'none'
    });
});
