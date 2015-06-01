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
            url: 'http://library.itjesse.cn/API/Client/CheckTagId',
            type: 'get',
            data: 'tagId=' + tagId,
            success: function(res) {
                if(!res.error){
                    if (res.check == '1') {
                        $('#tagIdLabel').removeClass('has-success');
                        $('#tagIdLabel').addClass('has-error');
                        $('#tagId').val('');
                        $('#tagId').attr('placeholder', '标签已录入');
                    } else {
                        $('#tagIdLabel').addClass('has-success');
                        $('#tagIdLabel').removeClass('has-error');
                    }
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
                url: 'http://library.itjesse.cn/API/Client/InsertBook',
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

    chrome.runtime.getBackgroundPage(function(backgroundPage) {
        var barcodeScannerConn = backgroundPage.barcodeScannerConn;
        var tagScannerConn = backgroundPage.tagScannerConn;

        var stringReceived = '';
        var dataArray = [];
        var lastReceiveTime;
        var lastTagId = '';

        var type;
        var status = 0;

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
                    console.log(dataArray);
                    if(dataArray[0] == parseInt(0x32, 10) && dataArray[2] == 1){
                        if(type == 1 && status > 2){
                            var tagCount = dataArray[2];
                            if(/^[0-9]*[1-9][0-9]*$/.test(dataArray.length / tagCount)){
                                for(var i=0; i<tagCount; i++){
                                    var tag = [];
                                    for(var j=i*18+7; j<(i+1)*18; j++){
                                        tag.push(dataArray[j]);
                                    }
                                    var tagId = '';
                                    for(var k in tag){
                                        var tmp = tag[k].toString(16);
                                        if(tmp.length < 2)
                                            tmp = '0' + tmp;
                                        tagId += tmp;
                                    }
                                    if (tagId != lastTagId) {
                                        $('#tagId').val(tagId);
                                        checkTagId();
                                    }
                                    lastTagId = tagId;
                                }
                            }
                        }
                        else if(type == 1 && status <= 2){
                            status ++;
                        }
                        else if(type != 1){
                            status = 1;
                            type = 1;
                        }
                    }

                    if(dataArray[0] == parseInt(0x32, 10) && dataArray[2] > 1){
                        if(type == 2 && status > 2){
                            $('#tagIdLabel').removeClass('has-success');
                            $('#tagIdLabel').addClass('has-error');
                            $('#tagId').val('');
                            $('#tagId').attr('placeholder', '检测到多张标签');
                            lastTagId = '';
                        }
                        else if(type == 2 && status <= 3){
                            status ++;
                        }
                        else if(type != 2){
                            status = 1;
                            type = 2;
                        }
                    }

                    if(dataArray[0] == parseInt(0x32, 10) && dataArray[1] == parseInt(0x04, 10)){
                        if(type == 3 && status > 2){
                            $('#tagIdLabel').removeClass('has-success');
                            $('#tagIdLabel').addClass('has-error');
                            $('#tagId').val('');
                            $('#tagId').attr('placeholder', '未检测到标签');
                            lastTagId = '';
                        }
                        else if(type == 3 && status <= 2){
                            status ++;
                        }
                        else if(type != 3){
                            status = 1;
                            type = 3;
                        }
                    }
                    dataArray = [];
                }
                var bufView = new Uint8Array(info.data);
                for (var a in bufView) {
                    // console.log(bufView[i]);
                    dataArray.push(bufView[a]);
                    lastReceiveTime = (new Date()).valueOf();
                }
            }
        };
        chrome.serial.onReceive.addListener(onReceiveCallback);
    });

});
