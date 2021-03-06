$(document).on('ready', function() {
  var getStudentInfo = function(uid) {
    $.ajax({
      url: 'http://library.itjesse.cn/API/Client/GetCardInfo',
      data: 'uid=' + uid,
      type: 'get',
      dataType: 'json',
      success: function(res) {
        if (res.error != '-1') {
          $('#uid').val(uid);
          $('#studentId').val(res.info.studentId);
          $('#name').val(res.info.name);
          $('#sex').val(res.info.sex);
          $('#college').val(res.info.college);
          $('#class').val(res.info.class);
          $('#submit').removeClass('hidden');
          $('#cardInfo').html('');
        } else {
          $('#cardInfo').html('一卡通未绑定');
          $('#submit').addClass('hidden');
        }
      }
    });
  };

  var submitUnBind = function() {
    var uid = $('#uid').val();
    $.ajax({
      url: 'http://library.itjesse.cn/API/Client/UnBindCard',
      data: 'uid=' + uid,
      type: 'get',
      success: function(res) {
        if (res == '1') {
          layer.alert('解绑成功', 1);
        } else {
          layer.alert('解绑失败');
        }
      }
    });
  };

  $('#submit').on('click', function(){
    submitUnBind();
    $('#submit').addClass('hidden');
    $('input').val('');
    $('#cardInfo').html('扫描卡片或手机进行解绑');
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
          $('input').val('');
          getStudentInfo(stringReceived);
          stringReceived = '';
        } else {
          stringReceived += str;
        }
      }
    };

    chrome.serial.onReceive.addListener(onReceiveCallback);
  });

});
