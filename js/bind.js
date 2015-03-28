$(document).on('ready', function() {
    var getStudentInfo = function() {
        var studentId = $('#studentId').val();
        $.ajax({
            url: 'http://42.96.200.228:3001/api/GetStudentInfo',
            data: 'studentId=' + studentId,
            type: 'get',
            dataType: 'json',
            success: function(res) {
                if (res.name) {
                    $('#name').val(res.name);
                    $('#sex').val(res.sex);
                    $('#college').val(res.college);
                    $('#class').val(res.class);
                    $('#studentId').parent().removeClass('has-error');
                    $('#studentId').parent().addClass('has-success');
                } else {
                    layer.alert('学号错误');
                    $('#studentId').val('');
                    $('#studentId').parent().removeClass('has-success');
                    $('#studentId').parent().addClass('has-error');
                }
            }
        });
    };

    var submitBind = function(uid) {
        var studentId = $('#studentId').val();
        $.ajax({
            url: 'http://42.96.200.228:3001/api/BindCard',
            data: 'uid=' + uid + '&studentId=' + studentId,
            type: 'get',
            success: function(res) {
                if (res == '1') {
                    layer.alert('绑定成功', 1);
                    $('#cardInfo').html('扫描卡片或手机进行绑定');
                    $('#studentId').parent().removeClass('has-success');
                    $('input').val('');
                } else {
                    layer.alert('绑定失败');
                    $('#cardInfo').html('扫描卡片或手机进行绑定');
                    $('input').val('');
                }
            }
        });
    };

    var checkCardId = function(uid) {
        $.ajax({
            url: 'http://42.96.200.228:3001/api/CheckCardId',
            data: 'uid=' + uid,
            type: 'get',
            success: function(res) {
                if (res == '-1') {
                    $('#cardInfo').html('卡片已录入');
                } else {
                    submitBind(uid);
                }
            }
        });
    };

    $("#studentId").on('keypress', function(event) {
        if (event.keyCode == "13") {
            getStudentInfo();
        }
    });

    chrome.runtime.getBackgroundPage(function(backgroundPage) {
        var nfcConn = backgroundPage.nfcConn;
        var stringReceived = '';

        var onReceiveCallback = function(info) {
            // console.log(info);
            var str = '';
            if (info.connectionId == nfcConn.connectionId && info.data) {
                str = String.fromCharCode.apply(null, new Uint8Array(info.data));
                if (str.charAt(str.length - 1) === '\n') {
                    stringReceived += str.substring(0, str.length - 1);
                    // console.log('Get ISBN: ' + stringReceived);
                    if ($("#studentId").val() && $("#studentId").parent().hasClass('has-success')) {
                        checkCardId(stringReceived);
                    }
                    stringReceived = '';
                } else {
                    stringReceived += str;
                }
            }
        };

        chrome.serial.onReceive.addListener(onReceiveCallback);
    });

});
