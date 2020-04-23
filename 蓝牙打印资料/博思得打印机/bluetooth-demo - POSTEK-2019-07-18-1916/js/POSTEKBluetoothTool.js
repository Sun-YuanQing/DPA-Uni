var BluetoothAdapter = null;
var Intent = null;
var IntentFilter = null;
var BluetoothDevice = null;
var UUID = null;
var Toast = null;
var invoke = null;
var btAdapter = null;
var activity = null;
var MY_UUID = null;
var device = null;
var btSocket = null;
var btFindReceiver = null; //蓝牙搜索广播接收器
var btStatusReceiver = null; //蓝牙状态监听广播
var flag = false; //是否已连接设备
// 蓝牙设备mac地址
var deviceId = null;
// 蓝牙服务ID
var serviceId = null;
// 蓝牙服务特征值ID
var characteristicId = null;
var resultStr = [];
var a=0;
var monitorIntervals = [];// 定时器

// 扩展API加载完毕，现在可以正常调用扩展API
function onPlusReady() {
    BluetoothAdapter = plus.android.importClass("android.bluetooth.BluetoothAdapter"); //本地的蓝牙适配器
    Intent = plus.android.importClass("android.content.Intent"); //用于应用间的交互和通讯
    IntentFilter = plus.android.importClass("android.content.IntentFilter"); //愿意接收什么样的 Intent 对象
    BluetoothDevice = plus.android.importClass("android.bluetooth.BluetoothDevice"); //远程蓝牙设备
    UUID = plus.android.importClass("java.util.UUID"); //唯一识别码
    Toast = plus.android.importClass("android.widget.Toast"); //一种提供给用户简洁信息的视图
    invoke = plus.android.invoke; //调用
    btAdapter = BluetoothAdapter.getDefaultAdapter(); //获取远程蓝牙设备
    activity = plus.android.runtimeMainActivity(); //启用原生activity
    MY_UUID = UUID.fromString("0000ffe0-0000-1000-8000-00805f9b34fb"); //连接串口设备的 UUID

    for (var i = 0; i < monitorIntervals.length; i++) {//清空旧的定时器
        if (typeof monitorIntervals[i] !== 'undefined') {
            clearInterval(monitorIntervals[i]);
        }
    }
    // 创建定时器  定时刷新数据
    var monitorInterval = setInterval("bluetoothInit()", 5000);
    // 定时器放到全局变量中 用于取消定时器
    monitorIntervals.push(monitorInterval);
}


// 蓝牙状态
var state = {
    bluetoothEnable: false, //蓝牙是否开启
    bluetoothState: false, //当前蓝牙状态
    discoveryDeviceState: false, //是否正在搜索蓝牙设备
    readThreadState: false, //数据读取线程状态
    msg: '', //消息
};

/**
 * 初始化蓝牙状态 定时执行
 */
function bluetoothInit() {
    state.bluetoothEnable = isSupportBluetooth();
    plus.bluetooth.getConnectedBluetoothDevices({//是否已连接设备
        success: function (e) {
            if (e.devices[0] != undefined && e.devices[0].deviceId != undefined) {
                state.bluetoothState = true;
            } else {
                state.bluetoothState = false;
            }
        },
        complete: function (e) {
            init();
        }
    });
}

/**
 * 蓝牙状态赋值
 */
function init() {
    $("#bluetoothEnable").html(JSON.stringify(state.bluetoothEnable));
    $("#bluetoothState").html(JSON.stringify(state.bluetoothState));
    $("#discoveryDeviceState").html(JSON.stringify(state.discoveryDeviceState));
    $("#readThreadState").html(JSON.stringify(state.readThreadState));
    $("#msg").html(state.msg);
}

/**
 * 获取蓝牙的状态
 * @return {boolean} 是否已开启
 */
function isSupportBluetooth() {
    if (btAdapter != null) {
        return btAdapter.isEnabled();
    }
    return false;
}

/**
 * 打开蓝牙
 */
function turnOnBluetooth() {
    if (btAdapter == null) {
        shortToast("没有蓝牙");
        return;
    }
    if (!btAdapter.isEnabled()) {
        if (activity == null) {
            shortToast("未获取到activity");
            return;
        } else {
            var intent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            var requestCode = 1;
            activity.startActivityForResult(intent, requestCode);
            state.bluetoothEnable = true;
            init();
            return;
        }
    } else {
        shortToast("蓝牙已经打开");
    }
}

/**
 * 关闭蓝牙
 */
function turnOffBluetooth() {
    flag = false;
    cancelDiscovery(); //停止搜索
    closeBtSocket(); //断开连接设备
    if (btAdapter != null && btAdapter.isEnabled()) {
        btAdapter.disable();
        state.bluetoothEnable = false;
        state.readThreadState = false;
        init();
        shortToast("蓝牙关闭成功");
    } else {
        shortToast("蓝牙已经关闭");
    }
    //清空设备列表
    clearList();
}

/**
 * 初始化蓝牙
 */
function initBluetooth() {
    plus.bluetooth.openBluetoothAdapter({
        success: function (e) {
            state.msg = '初始化成功';
            // console.log('initBluetooth success: ' + JSON.stringify(e));
        },
        fail: function (e) {
            state.msg = '初始化失败';
            // console.log('initBluetooth failed: ' + JSON.stringify(e));
        },
        complete: function (e) {
            init();
        }
    });
}

/**
 * 获取已经配对的设备
 * @returns {Array}
 */
function getPairedDevices() {
    var pairedDevices = [];
    var devicesList = "";
    $("#pairedDevices").html("");
    //蓝牙连接android原生对象，是一个set集合
    var pairedDevicesAndroid = null;
    if (btAdapter != null && btAdapter.isEnabled()) {
        pairedDevicesAndroid = btAdapter.getBondedDevices();
    } else {
        shortToast("蓝牙未开启");
    }
    if (!pairedDevicesAndroid) {
        return pairedDevices;
    }

    //遍历连接设备的set集合，转换为js数组
    var it = invoke(pairedDevicesAndroid, "iterator");
    while (invoke(it, "hasNext")) {
        var devices = invoke(it, "next");
        pairedDevices.push({
            "name": invoke(devices, "getName"),
            "address": invoke(devices, "getAddress")
        });
        var input = "<input type='button' value='连接' onclick='SetconnDevice(\"" + devices.getAddress() + "\")' />";
        devicesList += "<li>名称：" + devices.getName() + "<br> 地址：" + devices.getAddress() + "<br>" + input + "</li>";
    }

    $("#pairedDevices").append(devicesList);
    state.msg = '查询到 ' + pairedDevices.length + ' 台已配对的设备';
    init();
    return pairedDevices;
}

/**
 * 搜索蓝牙设备
 */
function discoveryNewDevice() {
    var newDevice = [];
    $("#newDevices").html("");

    if (btAdapter != null && !btAdapter.isEnabled()) {
        shortToast("未打开蓝牙");
    }
    if (btFindReceiver != null) {
        try {
            activity.unregisterReceiver(btFindReceiver);
        } catch (e) {
            console.error(e);
        }
        btFindReceiver = null;
        cancelDiscovery();
    }
    var Build = plus.android.importClass("android.os.Build");
 
    //6.0以后的如果需要利用本机查找周围的wifi和蓝牙设备, 申请权限
    if (Build.VERSION.SDK_INT >= 6.0) {
		//plus.android.invoke(plus.android.runtimeMainActivity(), "requestPermissions",Location,1);
    }

    btFindReceiver = plus.android.implements("io.dcloud.android.content.BroadcastReceiver", {
        "onReceive": function (context, intent) {
            plus.android.importClass(context);
            plus.android.importClass(intent);
            var action = intent.getAction();
            if (BluetoothDevice.ACTION_FOUND == action) { // 找到设备
                var devices = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
				var devicesAddress=devices.getAddress();
				var ifAdd=0;
				console.log("newDevice: " + JSON.stringify(newDevice));
				if(devicesAddress.match("DC:0D:30")||devicesAddress.match("0F:04:15")){
				if(newDevice.length>0){
				for(var i in newDevice){
				if(!newDevice[i].address.match(devicesAddress)){ 
					newDevice.push({
				    "name": invoke(devices, "getName"),
				    "address": invoke(devices, "getAddress")
				});
				var input = "<input type='button' value='连接' onclick='SetconnDevice(\"" + devicesAddress + "\")' />";
				 var newDevicesList = "<li>名称：" + devices.getName() + "<br> 地址：" + devicesAddress + "<br>" + input +"</li>";
				  $("#newDevices").append(newDevicesList);
				  }
			}
			}else{
				 newDevice.push({
				    "name": invoke(devices, "getName"),
				    "address": invoke(devices, "getAddress")
				});
				var input = "<input type='button' value='连接' onclick='SetconnDevice(\"" + devicesAddress + "\")' />";
				 var newDevicesList = "<li>名称：" + devices.getName() + "<br> 地址：" + devicesAddress + "<br>" + input +"</li>";
				  $("#newDevices").append(newDevicesList);
			}
				}
            }
            if (BluetoothAdapter.ACTION_DISCOVERY_FINISHED == action) { // 搜索完成
                state.msg = '搜索完成，搜索到 ' + newDevice.length + ' 台打印机蓝牙设备';
				
                state.discoveryDeviceState = false;
                init();
                //停止搜索
                cancelDiscovery();
            }
        }
    });
    var filter = new IntentFilter();
    filter.addAction(BluetoothDevice.ACTION_FOUND);
    filter.addAction(BluetoothAdapter.ACTION_DISCOVERY_FINISHED);
    activity.registerReceiver(btFindReceiver, filter);
    btAdapter.startDiscovery(); //开启搜索
    state.msg = '正在搜索设备...';
    state.discoveryDeviceState = true;
    init();
}

/**
 * 清空设备列表
 */
function clearList() {
    $("#pairedDevices").html("");
    $("#newDevices").html("");
}

/**
 * 根据蓝牙地址，连接设备
 * 如果之前没有配对设备 需要重复执行一次
 * @param address
 */
function SetconnDevice(address) {
	setTimeout(() => {
		connDevice(address)
	}, 1000)
}
function connDevice(address) {
    try {
	    state.discoveryDeviceState = false;
		init();
		//停止搜索
		cancelDiscovery();
        device = invoke(btAdapter, "getRemoteDevice", address);
        btSocket = invoke(device, "createRfcommSocketToServiceRecord", MY_UUID);
        //初始化设备
        plus.bluetooth.openBluetoothAdapter({
            success: function (e) {
                /**
                 * 当前设备状态 device.getBondState()
                 * 11 正在配对 BluetoothDevice.BOND_BONDING
                 * 12 完成配对 BluetoothDevice.BOND_BONDED
                 * 10 取消配对 BluetoothDevice.BOND_NONE
                 */
                // if (device.getBondState() == BluetoothDevice.BOND_BONDED) { //完成配对
                    plus.bluetooth.createBLEConnection({
                        deviceId: address,
                        success: function (e) {
                            flag = true;
                            console.log('connDevice success: ' + JSON.stringify(e));
                            shortToast("连接成功");
                            state.msg = '已连接设备';
                            state.bluetoothState = true;
							plus.bluetooth.getConnectedBluetoothDevices({
							    success: function (e) {
									console.info("已连接的设备：" + JSON.stringify(e.devices));
									deviceId = e.devices[0].deviceId;
							    },
							    fail: function (e) {
							        console.log('连接--failed: ' + JSON.stringify(e));
							    },
							    complete: function (e) {
							        init();
							    }
							});
                        },
                        fail: function (e) {
                            // console.log('connDevice failed: ' + JSON.stringify(e));
                            shortToast("连接失败");
                            state.msg = '连接失败';
                        },
                        complete: function (e) {
                            init();
                        }
                    });
//                 } else {
//                     // 配对
//                     invoke(device, "createBond");
//                 }
            },
            fail: function (e) {
                shortToast("初始化失败");
            }
        });
    } catch (e) {
        shortToast("连接失败，获取Socket失败！");
    }
}
var bss = [];
//获取已连接设备服务
function getBLEDeviceServices(){
	plus.bluetooth.getBLEDeviceServices({
		
		deviceId:deviceId,
		success:function(e){
			var services = e.services;
			console.info("deviceId:"+deviceId);
			console.info('get services success: '+services.length);
			for(var i in services){
				console.info(i+': '+JSON.stringify(services[i]));
				//getCharacteristics(serviceId[i])
				bss.push(services[i]);
			}
			if(e.index>0){
				document.getElementById('service').value = serviceId = bss[bss.length-1].uuid;
			}
		},
		fail:function(e){
			console.info('get services failed: '+JSON.stringify(e));
		}
	});
}
//选择服务
function selectService(){
	if(bss.length <= 0){
		shortToast('未获取到有效蓝牙服务!');
		return;
	}
	var bts=[];
	for(var i in bss){
		bts.push({title:bss[i].uuid});
	}
	plus.nativeUI.actionSheet({title:"选择服务",cancel:"取消",buttons:bts}, function(e){
		if(e.index>0){
			document.getElementById('service').value = serviceId = bss[e.index-1].uuid;
			shortToast('选择了服务: "'+serviceId+'"');
			characteristicId=null,document.getElementById('characteristic').value='';
			setTimeout(() => {
				getCharacteristics(serviceId)
			}, 1000)
		}
	});
}
//获取特征值
var bscs = [];
var bscws = [];



/**
 * 已连接的设备
 */
function getConnectedBluetoothDevices() {
    //初始化蓝牙
    initBluetooth();
    plus.bluetooth.getConnectedBluetoothDevices({
        success: function (e) {
            console.info("已连接的设备：" + JSON.stringify(e.devices));
            var name = "[ ]"
            if (e.devices[0] != undefined && e.devices[0].deviceId != undefined) {
                name = e.devices[0].name != undefined ? e.devices[0].name : e.devices[0].deviceId;
                flag = true;
            } else {
                flag = false;
            }
            shortToast("已连接的设备：" + name);
        },
        fail: function (e) {
            console.log('连接--failed: ' + JSON.stringify(e));
        },
        complete: function (e) {
            init();
        }
    });
}

/**
 * 断开连接设备
 */
function disConnDevice() {
    closeBtSocket();
    // 取消配对
    invoke(device, "removeBond");
    flag = false;
    shortToast("已断开连接");
	resultStr=null;
	serviceId=null,document.getElementById('service').value='';
	characteristicId=null,document.getElementById('characteristic').value='';
	bss = [];
	bscs = [];
	bscws = [];
}

/**
 * 断开连接设备
 */
function closeBtSocket() {
    plus.bluetooth.closeBLEConnection({
        deviceId: deviceId,
        success: function (e) {
            flag = false;
            state.bluetoothState = false;
            state.readThreadState = false;
			init();
            console.log('--断开连接成功--');
        },
        fail: function (e) {
            console.log('closeBtSocket--failed: ' + JSON.stringify(e));
        },
        complete: function (e) {
            init();
        }
    });
}

/**
 * 停止搜索
 */
function cancelDiscovery() {
    if (btAdapter.isDiscovering()) {
        btAdapter.cancelDiscovery();
    }
    if (btFindReceiver != null) {
        activity.unregisterReceiver(btFindReceiver);
        btFindReceiver = null;
    }
   // console.info("--停止搜索--");
}
/**
 * 发送数据
 */
var  sl=12;
function onSendData(commandData) {
    if (flag) {
        //发送的数据不能为空
        if (commandData !== '') {
			var allLen=commandData.length;
			var y=parseInt(allLen%sl);
			 var n=parseInt(allLen/sl);
			if(n>0){
				for (var i = 0; i < n; i++) {
					 var data20="";
					 data20=commandData.substring(i*sl,(i+1)*sl);
					// console.log("--**--："+data20);
					send(data20);
				}
				var ss=commandData.substring(n*sl,allLen);
//				console.log("------****-----:"+ss)
				send(ss);
			}else{
				send(commandData);
			}
        } else {
            shortToast("发送失败");
        }
    } else {
        shortToast("未连接设备");
    }
}


function  send(data){
	// 蓝牙服务ID
	 var serviceId = '49535343-fe7d-4ae5-8fa9-9fafd205e455';
	 var characteristicId = '49535343-8841-43f4-a8d4-ecbe34729bb3';
	 /* var serviceId = '000018F0-0000-1000-8000-00805F9B34FB';
	  var characteristicId = '00002AF1-0000-1000-8000-00805F9B34FB'; */
	     plus.bluetooth.writeBLECharacteristicValue({
	    deviceId: deviceId,
	    serviceId: serviceId,
	    characteristicId: characteristicId,
		value: invoke(data, 'getBytes', 'gbk'),
	    success: function (e) {
	        state.msg = '发送成功';
//	        console.log('发送数据--success: ' + JSON.stringify(e));
	    },
	    fail: function (e) {
	        state.msg = '发送失败';
		//	console.log(serviceId+','+characteristicId);
	       // console.log('发送数据--failed: ' + JSON.stringify(e));
	    },
	    complete: function (e) {
	        init();
	    }
	});
	
}
function onSendDataQR(commandData){
	    if (flag) {
	        //发送的数据不能为空
	        if (commandData !== '') {
				var allLen=commandData.length;
				var y=parseInt(allLen%sl);
				 var n=parseInt(allLen/sl);
				if(n>0){
					for (var i = 0; i < n; i++) {
						 var data20="";
						 data20=commandData.substring(i*sl,(i+1)*sl);
						// console.log("--**--："+data20);
						sendQR(data20);
					}
					sendQR(commandData.substring(n*sl,allLen));
					
				}else{
					sendQR(commandData);
				}
	        } else {
	            shortToast("发送失败");
	        }
	    } else {
	        shortToast("未连接设备");
	    }
}
function  sendQR(data){
	// 蓝牙服务ID
	 var serviceId = '49535343-fe7d-4ae5-8fa9-9fafd205e455';
	var characteristicId = '49535343-8841-43f4-a8d4-ecbe34729bb3';
	/* var serviceId = '000018F0-0000-1000-8000-00805F9B34FB';
	  var characteristicId = '00002AF1-0000-1000-8000-00805F9B34FB'; */
	     plus.bluetooth.writeBLECharacteristicValue({
	    deviceId: deviceId,
	    serviceId: serviceId,
	    characteristicId: characteristicId,
		value: invoke(data, 'getBytes', 'UTF-8'),
	    success: function (e) {
	        state.msg = '发送成功';
	     //   console.log('发送数据--success: ' + JSON.stringify(e));
	    },
	    fail: function (e) {
	        state.msg = '发送失败';
			console.log(serviceId+','+characteristicId);
	        console.log('发送数据--failed: ' + JSON.stringify(e));
	    },
	    complete: function (e) {
	        init();
	    }
	});
	
}

function readData() {
    // 启用notify功能
		plus.bluetooth.notifyBLECharacteristicValueChange({
			state: true,
			deviceId: deviceId,
			serviceId: serviceId,
			characteristicId: characteristicId,
			success: function (e) {
				state.readThreadState = true;
				console.log('readData ===== success: ' + JSON.stringify(e));
			},
			fail: function (e) {
				state.readThreadState = false;
				console.log('readData ===== failed: ' + JSON.stringify(e));
			},
			complete: function (e) {
				init();
			}
		});
    // 监听低功耗蓝牙设备的特征值变化
	if(a==0){
		plus.bluetooth.onBLECharacteristicValueChange(function (e) {
			if (e.value != undefined) {
				$("#receiveDataArr").html(buffer2hex(e.value));
				$("#receiveDataStr").html(
			hexCharCodeToStr(buffer2hex(e.value)));
			}
		});
		a=1;
	}
}
function stopread(){
	console.log(deviceId+','+serviceId+','+characteristicId);
	plus.bluetooth.notifyBLECharacteristicValueChange({
			deviceId: deviceId,
			serviceId: serviceId,
			characteristicId: characteristicId,
			state: false,
			success: function (e) {
				state.readThreadState = false;
				console.log('停止监听成功');
			},
			fail: function (e) {
				state.readThreadState = true;
				console.log('停止监听失败');
			}, 
			complete: function (e) {
				init();
			}
	});
}
/**
 * 清空接收的数据
 */
function clearData() {
    $("#receiveDataArr").html("");
    $("#receiveDataStr").html("");
	resultStr=[];
}

/**
 * 提示信息
 * @param msg
 */
function shortToast(msg) {
    Toast.makeText(activity, msg, Toast.LENGTH_SHORT).show();
}

var IOException=-1002;//io流异常
var ParameterError=-1005;
  
function PTK_ClearBuffer() {
        var nReturn = 0;
        var sendData = "N\r\n";
        nReturn=onSendData(sendData);
        return nReturn;
    }

function PTK_SetPrintSpeed(px) {
        var nReturn = 0;
        var sendData = "S" + px + "\r\n";
        if((px < 0 || px > 10) && (px % 5 != 0 || px / 5 < 2 || px / 5 > 8) && (px % 10 != 0 || px / 10 < 4 || px / 10 > 10)) {
            nReturn = ParameterError;
            return nReturn;
        } else {
            nReturn=onSendData(sendData);
            return nReturn;
        }
    }

function PTK_SetDirection(direct) {
        var nReturn = 0;
        var sendData = "Z" + direct + "\r\n";
        if(!direct.equals("B") && !direct.equals("T")) {
            nReturn = ParameterError;
            return nReturn;
        } else {
            nReturn=onSendData(sendData);
            return nReturn;
        }
    }

function PTK_SetDarkness(id) {
        var nReturn = 0;
        var pid;
        if(id >= 0 && id <= 20) {
            pid = id;
        } else {
            pid = 10;
        }
        var sendData = "H" + pid + "\r\n";
        nReturn=onSendData(sendData);
        return nReturn;
    }

function PTK_SetLabelHeightAuto(lHeight) {
    	  var nReturn = 0;
          var sendData = "";
          if(lHeight >= 1 && lHeight <=65535) {
           sendData = "Q" + lHeight+"\r\n";
          }else {
			 nReturn=ParameterError;
			 return  nReturn;
		}
        nReturn=onSendData(sendData);
          return nReturn;
    	
    }
function PTK_SetLabelHeight(lHeight, gapH, gapOffset, bFlag) {
        var nReturn = 0;
        var sendData = "";
        if(lHeight >= 1 && lHeight <= 65535 && gapH >= 0 && gapH <= 240) {
            if(bFlag) {
                if(gapOffset >= 0) {
                    sendData = sendData + gapH + "+" + gapOffset;
                } else {
                    sendData = sendData + (gapH + gapOffset);
                }
                sendData = "Q" + lHeight + ",B" + sendData + "\r\n";
            } else {
                sendData = "Q" + lHeight + "," + gapH + "\r\n";
            }
        }
        nReturn=onSendData(sendData);
        return nReturn;
    }

function PTK_SetLabelWidth(lWidth) {
        var nReturn = 0;
        var sendData = "q" + lWidth + "\r\n";
        nReturn=onSendData(sendData);
        return nReturn;
    }

function PTK_SetCoordinateOrigin(px, py) {
        var nReturn = 0;
        var sendData = "R" + px + "," + py + "\r\n";
        nReturn=onSendData(sendData);
        return nReturn;
    }

function PTK_PrintLabel(number, cpnumber) {
        var nReturn = 0;
        var sendData = "";
        if(number >= 1 && number <= 65535) {
            if(cpnumber >= 1 && cpnumber <= 65535) {
                sendData = "W" + number + "," + cpnumber + "\r\n";
            } else {
                sendData = "W" + number + "," + 1 + "\r\n";
            }
            nReturn=onSendData(sendData);
            return nReturn;
        } else {
            nReturn =ParameterError;
            return nReturn;
        }
    }


 // 检测的各种方法：
 function Ccheck1(id) {
 		var rec = id;
 		if (rec >= 0 && rec <= 9) {
 			return true;
 		} else {
 			return false;
 		}
 	}

function Ccheck2(maxNum) {
 		var max = maxNum;
 		if (max > 0 && max < 40) {
 			return true;
 		} else {
 			return false;
 		}
 	}

function Ccheck3(text) {
 		var txt = text;
 		if (txt == 'L' || txt == 'C' || txt == 'R' || txt == 'N') {
 			return true;
 		} else {
 			return false;
 		}
 	}

 function AcheckA3(direct) {
 		var nReturn = 0;
 		if (direct == 0 || direct == 1 || direct == 2 || direct == 3) {
 			return nReturn;
 		} else {
 			return -1;
 		}
 	}

function AcheckA4( Afont) {
 		var font = Afont;
 		if (font >= '1' && font <= '7') {
 			return 0;
 		} else if ((font >= 'A' && font <= 'Z')) {
 			return 0;
 		} else {
 			return -1;
 		}
 	}

function AcheckA56(Horizontal,Vertical) {
 		var h, v;
 		var nReturn = 0;
 		h = Horizontal;
 		v = Vertical;
 		if ((h >= 1 && h <= 999) && (v >= 1 && v <= 999)) {
 			return nReturn;
 		} else {
 			return -1;
 		}
 	}

function AcheckA7(text) {
 		var nReturn = 0;
 		var txt = text;
 		if (txt == 'N' || txt == 'R') {
 			return nReturn;
 		} else {
 			return -1;
 		}
 	}

function AcheckBarcode7(text) {
 		var nReturn = 0;
 		var txt = text;
 		if (txt == 'N' || txt == 'B') {
 			return nReturn;
 		} else {
 			return -1;
 		}
 	}

    
function PTK_DrawText(px, py, pdirec,  pFont, pHorizontal, pVertical,  ptext,  pstr) {
        var nReturn = 0;
        var sendData = "";
       	var reg = new RegExp( '\"' , "g" )
       pstr=pstr.replace(reg, '\\"');
        if(this.AcheckA3(pdirec) >= 0 && this.AcheckA4(pFont) >= 0 && this.AcheckA56(pHorizontal, pVertical) >= 0 && this.AcheckA7(ptext) >= 0) {
            sendData = "T" + px + "," + py + "," + pdirec + "," + pFont + "," + pHorizontal + "," + pVertical + "," + ptext + ",\"" + pstr + "\"\r\n";
            nReturn=onSendData(sendData);
            return nReturn;
        } else {
            nReturn =ParameterError;
            return nReturn;
        }
    }
   
function PTK_DrawBarcode(px, py, pdirec,pCode, NarrowWidth, pHorizontal, pVertical,  ptext,  pstr) {
        var nReturn = 0;
        var sendData = "";
        if(this.AcheckA3(pdirec) >= 0 && this.AcheckBarcode7(ptext) >= 0) {
            sendData = "B" + px + "," + py + "," + pdirec + "," + pCode + "," + NarrowWidth + "," + pHorizontal + "," + pVertical + "," + ptext + ",\"" + pstr + "\"\r\n";
            nReturn=onSendData(sendData);
            return nReturn;
        } else {
            nReturn = ParameterError;
            return nReturn;
        }
    }

 
function PTK_DrawBar2D_QR(x, y, w, v, o, r, m, g, s, pstr) {
        var nReturn = 0;
        var sendData = "";
        if(o >= 0 && o <= 3 && r >= 1 && r <= 999 && m >= 0 && m <= 4 && g >= 0 && g <= 3 && s >= 0 && s <= 8) {
            sendData = "b" + x + "," + y + ",QR," + w + "," + v + ",o" + o + ",r" + r + ",m" + m + ",g" + g + ",s" + s + ",\"" + pstr + "\"\r\n";
           nReturn=onSendDataQR(sendData);

            return nReturn;
        } else {
            nReturn = ParameterError;
            return nReturn;
        }
    }

function PTK_DrawRectangle(px, py, thickness, pEx, pEy) {
        var nReturn = 0;
        var sendData = "X" + px + "," + py + "," + thickness + "," + pEx + "," + pEy + "\r\n";
        nReturn=onSendData(sendData);
        return nReturn;
    }

function PTK_DrawLineXor(px, py, pbyte, pH) {
        var nReturn = 0;
        var sendData = "LE" + px + "," + py + "," + pbyte + "," + pH + "\r\n";
        nReturn=onSendData(sendData);
        return nReturn;
    }

function PTK_DrawLineOr(px, py, plength, pH) {
        var nReturn = 0;
        var sendData = "LO" + px + "," + py + "," + plength + "," + pH + "\r\n";
        nReturn=onSendData(sendData);
        return nReturn;
    }
