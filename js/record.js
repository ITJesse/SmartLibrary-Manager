$(document).on('ready', function() {
    var getIsbnInfo = function() {
        var isbn = $('#isbn').val();
        $.ajax({
            url: 'https://api.douban.com/v2/book/isbn/' + isbn,
            dataType: 'json',
            success: function(res) {
                $('#publisher').val(res.publisher);
                $('#bookName').val(res.title ? res.title : res.series.title);
                $('#author').val(res.author[0]);
                $('#info').val(res.summary);
                $('#bookImg').data('src', res.images.medium);
                var xhr = new XMLHttpRequest();
                xhr.open('GET', res.images.medium, true);
                xhr.responseType = 'blob';
                xhr.onload = function(e) {
                    var img = document.getElementById('bookImg');
                    img.src = window.URL.createObjectURL(this.response);
                };
                xhr.send();

                $('#isbnLabel').addClass('has-success');
                $('#isbnLabel').removeClass('has-error');
            }
        });
    };

    var checkTagId = function() {
        var tagId = $('#tagId').val();
        $.ajax({
            url: 'http://127.0.0.1:3000/api/CheckTagId',
            type: 'get',
            data: 'tagId=' + tagId,
            success: function(res) {
                if (res == '-1') {
                    $('#tagIdLabel').removeClass('has-success');
                    $('#tagIdLabel').addClass('has-error');
                    $('#tagId').val('');
                    $('#tagId').attr('placeholder', '标签已录入');
                } else {
                    $('#tagIdLabel').addClass('has-success');
                    $('#tagIdLabel').removeClass('has-error');
                }
            }
        });
    };

    $("#isbn").on('keypress', function(event) {
        if (event.keyCode == "13") {
            getIsbnInfo();
        }
    });

    $("#isbn").on('click', function() {
        $(this).select();
    });

    $("#reset").on('click', function() {
        $("#bookImg").attr("src", "./images/noimg.png");
    });

    $('#submit').on('click', function() {
        var isbn = $('#isbn').val();
        var tagId = $('#tagId').val();
        var title = $('#bookName').val();
        var author = $('#author').val();
        var publisher = $('#publisher').val();
        var summary = $('#info').val();
        var image = $('#bookImg').data('src');
        if (isbn && tagId) {
            $.ajax({
                url: 'http://127.0.0.1:3000/api/InsertBook',
                type: 'post',
                data: '&isbn=' + isbn + '&tagId=' + tagId + '&title=' + title + '&author=' + author + '&publisher=' + publisher + '&summary=' + summary + '&image=' + image,
                success: function(res) {
                    if (res == '-1') {
                        layer.alert('提交失败！', 8);
                    } else {
                        layer.alert('提交成功！', 1);
                        $("#reset").click();
                        lastTagId = '';
                    }
                }
            });
        } else {
            layer.alert('请检查ISBN和标签号是否填写正确');
        }
    });

    var barcodeScannerComId, tagScannerComId;
    chrome.storage.local.get(['barcodeScannerCom', 'tagScannerCom'], function(data) {
        if (chrome.runtime.lastError) {
            return layer.alert('获取设置失败');
        }

        chrome.serial.connect(data.barcodeScannerCom, {
            bitrate: 9600
        }, function(connectionInfo) {
            // console.log(connectionInfo);
            if (chrome.runtime.lastError) {
                return layer.alert('打开串口失败，请检查设置', 8, function() {
                    chrome.app.window.create('setting.html#setting', {
                        'bounds': {
                            'width': 800,
                            'height': 600
                        },
                        frame: 'none'
                    });
                    window.close();
                });
            }
            barcodeScannerConn = connectionInfo;
        });

        chrome.serial.connect(data.tagScannerCom, {
            bitrate: 115200
        }, function(connectionInfo) {
            // console.log(connectionInfo);
            if (chrome.runtime.lastError) {
                return layer.alert('打开串口失败，请检查设置', 8, function() {
                    chrome.app.window.create('setting.html#setting', {
                        'bounds': {
                            'width': 800,
                            'height': 600
                        },
                        frame: 'none'
                    });
                    window.close();
                });
            }
            tagScannerConn = connectionInfo;
            var sendData = new ArrayBuffer(3);
            var bufView = new Uint8Array(sendData);
            bufView[0] = parseInt(0x31, 10);
            bufView[1] = parseInt(0x03, 10);
            bufView[2] = parseInt(0x01, 10);
            setInterval(function() {
                chrome.serial.send(tagScannerConn.connectionId, sendData, function(sendInfo) {
                    // console.log(sendData);
                });
            }, 500);
        });
    });

    var stringReceived = '';
    var dataArray = [];
    var lastReceiveTime;
    var lastTagId = '';

    var onReceiveCallback = function(info) {
        // console.log(info);
        var str = '';
        if (info.connectionId == barcodeScannerConn.connectionId && info.data) {
            str = String.fromCharCode.apply(null, new Uint8Array(info.data));
            if (str.charAt(str.length - 1) === '\n') {
                stringReceived += str.substring(0, str.length - 1);
                // console.log('Get ISBN: ' + stringReceived);
                $('#isbn').val(stringReceived);
                getIsbnInfo();
                stringReceived = '';
            } else {
                stringReceived += str;
            }
        }

        if (info.connectionId == tagScannerConn.connectionId && info.data) {
            if ((new Date()).valueOf() - lastReceiveTime > 100) {
                // console.log(dataArray);
                var res = '';
                for (var j in dataArray) {
                    res += dataArray[j].toString(16);
                }
                console.log(res.slice(0, 4));
                dataArray = [];

                if (res.slice(0, 4) == '3212') {
                    var list = res.split('3212');
                    list.splice(0, 1);
                    if (list.length > 1) {
                        $('#tagIdLabel').removeClass('has-success');
                        $('#tagIdLabel').addClass('has-error');
                        $('#tagId').val('');
                        $('#tagId').attr('placeholder', '检测到多张标签');
                        lastTagId = '';
                    } else {
                        var tagId = list[0].slice(2, list[0].length);
                        // console.log(tagId);
                        if (tagId != lastTagId) {
                            $('#tagId').val(tagId);
                            checkTagId();
                        }
                        lastTagId = tagId;
                    }

                    // if(parseInt(res.slice(4, 5), 16) == list.length){
                    //     console.log(list);
                    //     for(var k in list){
                    //         if(list[k].length == 24){
                    //             // some code
                    //         }
                    //     }
                    // }
                }

                if (res.slice(0, 4) == '3240') {
                    $('#tagIdLabel').removeClass('has-success');
                    $('#tagIdLabel').addClass('has-error');
                    $('#tagId').val('');
                    $('#tagId').attr('placeholder', '未检测到标签');
                    lastTagId = '';
                }
            }
            var bufView = new Uint8Array(info.data);
            for (var i in bufView) {
                // console.log(bufView[i]);
                dataArray.push(bufView[i]);
                lastReceiveTime = (new Date()).valueOf();
            }
        }
    };

    chrome.serial.onReceive.addListener(onReceiveCallback);
});
