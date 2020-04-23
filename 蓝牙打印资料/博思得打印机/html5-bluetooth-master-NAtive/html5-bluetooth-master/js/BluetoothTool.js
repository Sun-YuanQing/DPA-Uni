/**
 * html+ 串口蓝牙操作
 */
function BluetoothTool() {
	let BluetoothAdapter = plus.android.importClass("android.bluetooth.BluetoothAdapter");
	let Intent = plus.android.importClass("android.content.Intent");
	let IntentFilter = plus.android.importClass("android.content.IntentFilter");
	let BluetoothDevice = plus.android.importClass("android.bluetooth.BluetoothDevice");
	let UUID = plus.android.importClass("java.util.UUID");
	let Toast = plus.android.importClass("android.widget.Toast");
	//连接串口设备的 UUID
	let MY_UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");

	let invoke = plus.android.invoke;
	let btAdapter = BluetoothAdapter.getDefaultAdapter();
	let activity = plus.android.runtimeMainActivity();

	let btSocket = null;
	let btInStream = null;
	let btOutStream = null;
	let setIntervalId = 0;

	let btFindReceiver = null; //蓝牙搜索广播接收器
	let btStatusReceiver = null; //蓝牙状态监听广播
   let  IOException=-1002;//io流异常
	let ParameterError=-1005;
	  
	let state = {
		bluetoothEnable: false, //蓝牙是否开启
		bluetoothState: "", //当前蓝牙状态
		discoveryDeviceState: false, //是否正在搜索蓝牙设备
		readThreadState: false, //数据读取线程状态
	};

	let options = {
		/**
		 * 监听蓝牙状态回调
		 * @param {String} state
		 */
		listenBTStatusCallback: function(state) {},
		/**
		 * 搜索到新的蓝牙设备回调
		 * @param {Device} newDevice
		 */
		discoveryDeviceCallback: function(newDevice) {},
		/**
		 * 蓝牙搜索完成回调
		 */
		discoveryFinishedCallback: function() {},
		/**
		 * 接收到数据回调
		 * @param {Array} dataByteArr
		 */
		readDataCallback: function(dataByteArr) {},
		/**
		 * 蓝牙连接中断回调
		 * @param {Exception} e
		 */
		connExceptionCallback: function(e) {}
	}

	let bluetoothToolInstance = {
		state: state, //蓝牙状态
		init: init, //初始化回调函数
		isSupportBluetooth: isSupportBluetooth,
		getBluetoothStatus: getBluetoothStatus,
		turnOnBluetooth: turnOnBluetooth,
		turnOffBluetooth: turnOffBluetooth,
		getPairedDevices: getPairedDevices,
		discoveryNewDevice: discoveryNewDevice,
		listenBluetoothStatus: listenBluetoothStatus,
		connDevice: connDevice,
		disConnDevice: disConnDevice,
		cancelDiscovery: cancelDiscovery,
		readData: readData,
		sendData: sendData,
		sendDataQRC:sendDataQRC,

		PTK_ClearBuffer:PTK_ClearBuffer,
		PTK_SetPrintSpeed:PTK_SetPrintSpeed,
		PTK_SetDirection:PTK_SetDirection,
		PTK_SetDarkness:PTK_SetDarkness,
		PTK_SetLabelHeight:PTK_SetLabelHeight,
		PTK_SetLabelWidth:PTK_SetLabelWidth,
		PTK_SetCoordinateOrigin:PTK_SetCoordinateOrigin,
		PTK_PrintLabel:PTK_PrintLabel,
		PTK_PrintLabelAuto:PTK_PrintLabelAuto,
		PTK_SoftFontList:PTK_SoftFontList,
		PTK_SoftFontDel:PTK_SoftFontDel,
		PTK_EnableBackFeed:PTK_EnableBackFeed,
		PTK_DisableBackFeed:PTK_DisableBackFeed,
		 PTK_PrintConfiguration:PTK_PrintConfiguration,
		 PTK_SetPrinterState:PTK_SetPrinterState,
		 PTK_EnableErrorReport:PTK_EnableErrorReport,
		 PTK_DisableErrorReport:PTK_DisableErrorReport,
		 PTK_EnableFLASH:PTK_EnableFLASH,
		 PTK_DisableFLASH:PTK_DisableFLASH,
		 PTK_FeedMedia:PTK_FeedMedia,
		 PTK_MediaDetect:PTK_MediaDetect,
		 PTK_Reset:PTK_Reset,
		 PTK_CutPage:PTK_CutPage,
		 PTK_FeedBack:PTK_FeedBack,
		 PTK_UserBackFeed:PTK_UserBackFeed,
		 PTK_SetNetworkFeedbackParameter:PTK_SetNetworkFeedbackParameter,
		 PTK_SetFeedbackPort:PTK_SetFeedbackPort,
		 PTK_DrawText:PTK_DrawText,
		 PTK_DrawBarcode:PTK_DrawBarcode,
		 PTK_DrawBar2D_QR:PTK_DrawBar2D_QR,
		 PTK_DrawBar2D_DATAMATRIX:PTK_DrawBar2D_DATAMATRIX,
		 PTK_DrawBar2D_MaxiCode:PTK_DrawBar2D_MaxiCode,
		 PTK_DrawBar2D_Pdf417:PTK_DrawBar2D_Pdf417,
		 PTK_DrawBar2D_HANXIN:PTK_DrawBar2D_HANXIN,
		 PTK_DrawRectangle:PTK_DrawRectangle,
		 PTK_DrawLineXor:PTK_DrawLineXor,
		 PTK_DrawLineOr:PTK_DrawLineOr,
		 PTK_DrawDiagonal:PTK_DrawDiagonal,
		 PTK_DrawWhiteLine:PTK_DrawWhiteLine,
		 PTK_PcxGraphicsList:PTK_PcxGraphicsList,
		 PTK_PcxGraphicsDel:PTK_PcxGraphicsDel,
		 PTK_PcxGraphicsDownload:PTK_PcxGraphicsDownload,
		 PTK_DrawPcxGraphics:PTK_DrawPcxGraphics,
		 PTK_PrintPCX:PTK_PrintPCX,
		 PTK_BinGraphicsList:PTK_BinGraphicsList,
		 PTK_BinGraphicsDel:PTK_BinGraphicsDel,
		 PTK_BinGraphicsDownloadbin:PTK_BinGraphicsDownloadbin,
		 PTK_RecallBinGraphics:PTK_RecallBinGraphics,
		 PTK_DrawBinGraphics:PTK_DrawBinGraphics,
		 PTK_FormList:PTK_FormList,
		 PTK_FormDel:PTK_FormDel,
		 PTK_FormDownload:PTK_FormDownload,
		 PTK_FormEnd:PTK_FormEnd,
		 PTK_ExecForm:PTK_ExecForm,
		 PTK_DefineCounter:PTK_DefineCounter,
		 PTK_DefineVariable:PTK_DefineVariable,
		 PTK_Download:PTK_Download,
		 PTK_DownloadInitVar:PTK_DownloadInitVar,
		 PTK_SetFontGap:PTK_SetFontGap,
		 PTK_SetCharSets:PTK_SetCharSets,
		 PTK_RenameDownloadFont:PTK_RenameDownloadFont,
		 PTK_RFIDCalibration:PTK_RFIDCalibration,
		 PTK_RWRFIDLabel:PTK_RWRFIDLabel,
		 PTK_SetRFLabelPWAndLockRFLabel:PTK_SetRFLabelPWAndLockRFLabel,
		 PTK_SetRFID:PTK_SetRFID,
		 PTK_RWRFIDLabelEx:PTK_RWRFIDLabelEx,
		PTK_ReadRFIdTagData:PTK_ReadRFIdTagData,
		 PTK_GetTrueTypeList:PTK_GetTrueTypeList,
		PTK_Print300DpiDemo:PTK_Print300DpiDemo,
		 Ccheck1:Ccheck1,
		Ccheck2:Ccheck2,
		  Ccheck3:Ccheck3,
		  AcheckA3:AcheckA3,
		 AcheckA4:AcheckA4,
		  AcheckA56:AcheckA56,
		 AcheckA7:AcheckA7,
		  AcheckBarcode7:AcheckBarcode7,
		Bar2d_check_S:Bar2d_check_S,
		Bar2d_check_C:Bar2d_check_C,
		Bar2d_check_PX:Bar2d_check_PX,
		 Bar2d_check_PY:Bar2d_check_PY,
		 Bar2d_check_T:Bar2d_check_T,
		 Bar2d_check_O:Bar2d_check_O,
		 Bar2d_check_PSTR:Bar2d_check_PSTR,
	}
	if(window.bluetoothToolInstance) {
		return window.bluetoothToolInstance;
	} else {
		window.bluetoothToolInstance = bluetoothToolInstance;
		return bluetoothToolInstance;
	}

	function init(setOptions) {
		Object.assign(options, setOptions);
		state.bluetoothEnable = getBluetoothStatus();
		listenBluetoothStatus();
	}

	function shortToast(msg) {
		Toast.makeText(activity, msg, Toast.LENGTH_SHORT).show();
	}

	/**
	 * 是否支持蓝牙
	 * @return {boolean}
	 */
	function isSupportBluetooth() {
		if(btAdapter != null) {
			return true;
		}
		return false;
	}
	/**
	 * 获取蓝牙的状态
	 * @return {boolean} 是否已开启
	 */
	function getBluetoothStatus() {
		if(btAdapter != null) {
			return btAdapter.isEnabled();
		}
		return false;
	}

	/**
	 * 打开蓝牙
	 * @param activity
	 * @param requestCode
	 */
	function turnOnBluetooth() {
		if(btAdapter == null) {
			shortToast("没有蓝牙");
			return;
		}
		if(!btAdapter.isEnabled()) {
			if(activity == null) {
				shortToast("未获取到activity");
				return;
			} else {
				let intent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
				let requestCode = 1;
				activity.startActivityForResult(intent, requestCode);
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
		if(btAdapter != null && btAdapter.isEnabled()) {
			btAdapter.disable();
		}
		if(btFindReceiver != null) {
			try {
				activity.unregisterReceiver(btFindReceiver);
			} catch(e) {

			}
			btFindReceiver = null;
		}
		state.bluetoothEnable = false;
		cancelDiscovery();
		closeBtSocket();

		if(btAdapter != null && btAdapter.isEnabled()) {
			btAdapter.disable();
			shortToast("蓝牙关闭成功");
		} else {
			shortToast("蓝牙已经关闭");
		}
	}

	/**
	 * 获取已经配对的设备
	 * @return {Array} connetedDevices
	 */
	function getPairedDevices() {
		let pairedDevices = [];

		//蓝牙连接android原生对象，是一个set集合
		let pairedDevicesAndroid = null;
		if(btAdapter != null && btAdapter.isEnabled()) {
			pairedDevicesAndroid = btAdapter.getBondedDevices();
		} else {
			shortToast("蓝牙未开启");
		}

		if(!pairedDevicesAndroid) {
			return pairedDevices;
		}

		//遍历连接设备的set集合，转换为js数组
		let it = invoke(pairedDevicesAndroid, "iterator");
		while(invoke(it, "hasNext")) {
			let device = invoke(it, "next");
			if(device.getAddress().indexOf("0F:04:15")!=-1){
			pairedDevices.push({
				"name": invoke(device, "getName"),
				"address": invoke(device, "getAddress")
			});
			}
		}
		return pairedDevices;
	}

	/**
	 * 发现设备
	 */
	
	function discoveryNewDevice() {
		let newDevice=[];
		if(btFindReceiver != null) {
			try {
				activity.unregisterReceiver(btFindReceiver);
			} catch(e) {
				console.error(e);
			}
			btFindReceiver = null;
			cancelDiscovery();
		}
		let Build = plus.android.importClass("android.os.Build");
		
		 //6.0以后的如果需要利用本机查找周围的wifi和蓝牙设备, 申请权限
        if(Build.VERSION.SDK_INT >= 6.0){
           
        }
		
		btFindReceiver = plus.android.implements("io.dcloud.android.content.BroadcastReceiver", {
			"onReceive": function(context, intent) {
				plus.android.importClass(context);
				plus.android.importClass(intent);
				let action = intent.getAction();

				if(BluetoothDevice.ACTION_FOUND == action) { // 找到设备
					let device = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
					
					let devicesAddress=device.getAddress();
				console.log("newDevice: " + JSON.stringify(newDevice));
					if(devicesAddress.indexOf("DC:0D:30")!=-1){
						if(newDevice.length>0){
							//console.log("2.1"+devicesAddress);
							for (let i in newDevice) {
								if(newDevice[i].address.indexOf(devicesAddress)==-1)
								{
								//console.log("2.2"+devicesAddress);
								 newDevice.push({
									"name": plus.android.invoke(device, "getName"),
									"address": plus.android.invoke(device, "getAddress")
								});
								let mDevice={"name": plus.android.invoke(device, "getName"),
									"address": plus.android.invoke(device, "getAddress")}
								options.discoveryDeviceCallback && options.discoveryDeviceCallback(mDevice);
								
								}
								
								}
							
						}else{
					 newDevice.push({
						"name": plus.android.invoke(device, "getName"),
						"address": plus.android.invoke(device, "getAddress")
					});
					let mDevice={"name": plus.android.invoke(device, "getName"),
						"address": plus.android.invoke(device, "getAddress")}
						//console.log("1"+devicesAddress);
					options.discoveryDeviceCallback && options.discoveryDeviceCallback(mDevice);
					}
					
					}
					//options.discoveryDeviceCallback && options.discoveryDeviceCallback(newDevice);
				}
				if(BluetoothAdapter.ACTION_DISCOVERY_FINISHED == action) { // 搜索完成
					cancelDiscovery();
					options.discoveryFinishedCallback && options.discoveryFinishedCallback();
				}
			}
		});
		let filter = new IntentFilter();
		filter.addAction(BluetoothDevice.ACTION_FOUND);
		filter.addAction(BluetoothAdapter.ACTION_DISCOVERY_FINISHED);
		activity.registerReceiver(btFindReceiver, filter);
		btAdapter.startDiscovery(); //开启搜索
		state.discoveryDeviceState = true;
	}

	/**
	 * 蓝牙状态监听
	 * @param {Activity} activity
	 */
	function listenBluetoothStatus() {
		if(btStatusReceiver != null) {
			try {
				activity.unregisterReceiver(btStatusReceiver);
			} catch(e) {
				console.error(e);
			}
			btStatusReceiver = null;
		}

		btStatusReceiver = plus.android.implements("io.dcloud.android.content.BroadcastReceiver", {
			"onReceive": function(context, intent) {
				plus.android.importClass(context);
				plus.android.importClass(intent);

				let action = intent.getAction();
				switch(action) {
					case BluetoothAdapter.ACTION_STATE_CHANGED:
						let blueState = intent.getIntExtra(BluetoothAdapter.EXTRA_STATE, 0);
						let stateStr = "";
						switch(blueState) {
							case BluetoothAdapter.STATE_TURNING_ON:
								stateStr = "STATE_TURNING_ON";
								break;
							case BluetoothAdapter.STATE_ON:
								state.bluetoothEnable = true;
								stateStr = "STATE_ON";
								break;
							case BluetoothAdapter.STATE_TURNING_OFF:
								stateStr = "STATE_TURNING_OFF";
								break;
							case BluetoothAdapter.STATE_OFF:
								stateStr = "STATE_OFF";
								state.bluetoothEnable = false;
								break;
						}
						state.bluetoothState = stateStr;
						options.listenBTStatusCallback && options.listenBTStatusCallback(stateStr);
						break;
				}
			}
		});
		let filter = new IntentFilter();
		filter.addAction(BluetoothAdapter.ACTION_STATE_CHANGED);
		activity.registerReceiver(btStatusReceiver, filter);
	}

	/**
	 * 根据蓝牙地址，连接设备
	 * @param {Stirng} address
	 * @return {Boolean}
	 */
	function connDevice(address) {
		let InputStream = plus.android.importClass("java.io.InputStream");
		let OutputStream = plus.android.importClass("java.io.OutputStream");
		let BluetoothSocket = plus.android.importClass("android.bluetooth.BluetoothSocket");

		cancelDiscovery();
		if(btSocket != null) {
			closeBtSocket();
		}
		state.readThreadState = false;

		try {
			let device = invoke(btAdapter, "getRemoteDevice", address);
			btSocket = invoke(device, "createRfcommSocketToServiceRecord", MY_UUID);
		} catch(e) {
			console.error(e);
			shortToast("连接失败，获取Socket失败！");
			return false;
		}
		try {
			invoke(btSocket, "connect");
			readData(); //读数据
			shortToast("连接成功");
		} catch(e) {
			console.error(e);
			shortToast("连接失败");
			try {
				btSocket.close();
				btSocket = null;
			} catch(e1) {
				console.error(e1);
			}
			return false;
		}
		return true;
	}

	/**
	 * 断开连接设备
	 * @param {Object} address
	 * @return {Boolean}
	 */
	function disConnDevice() {
		if(btSocket != null) {
			closeBtSocket();
		}
		state.readThreadState = false;
		shortToast("断开连接成功");
	}

	/**
	 * 断开连接设备
	 * @param {Object} address
	 * @return {Boolean}
	 */
	function closeBtSocket() {
		state.readThreadState = false;
		if(!btSocket) {
			return;
		}
		try {
			btSocket.close();
		} catch(e) {
			console.error(e);
			btSocket = null;
		}
	}

	/**
	 * 取消发现
	 */
	function cancelDiscovery() {
		if(btAdapter.isDiscovering()) {
			btAdapter.cancelDiscovery();
		}
		if(btFindReceiver != null) {
			activity.unregisterReceiver(btFindReceiver);
			btFindReceiver = null;
		}
		state.discoveryDeviceState = false;
	}

	/**
	 * 读取数据
	 * @param {Object} activity
	 * @param {Function} callback
	 * @return {Boolean}
	 */
	function readData() {
		if(!btSocket) {
			shortToast("请先连接蓝牙设备！");
			return false;
		}
		try {
			btInStream = invoke(btSocket, "getInputStream");
			btOutStream = invoke(btSocket, "getOutputStream");
		} catch(e) {
			console.error(e);
			shortToast("创建输入输出流失败！");
			closeBtSocket();
			return false;
		}
		let setTimeCount = 0;
		//read();
		//state.readThreadState = true;
		return true;

		/**
		 * 模拟java多线程读取数据
		 */
		function read() {
			clearInterval(setIntervalId);
			setIntervalId = setInterval(function() {
				setTimeCount++;
				if(state.readThreadState) {
					let t = new Date().getTime();
					//心跳检测
					if(setTimeCount % 60 == 0) {
						try {
							btOutStream.write([0b00]);
							//sendData("AT+CLOSEAT\r\n");
						} catch(e) {
							state.readThreadState = false;
							options.connExceptionCallback && options.connExceptionCallback(e);
						}
					}
					let dataArr = [];
					while(invoke(btInStream, "available") !== 0) {
						let data = invoke(btInStream, "read");
						dataArr.push(data);
						let ct = new Date().getTime();
						if(ct - t > 20) {
							break;
						}
					}
					if(dataArr.length > 0) {
						options.readDataCallback && options.readDataCallback(dataArr);
					}
				}
			}, 40);
		}

	}

	/**
	 * 发送数据
	 * @param {String} dataStr
	 * @return {Boolean}
	 */
	function sendData(dataStr) {
	//console.log("发送的数据："+dataStr);
		if(!btOutStream) {
			shortToast("创建输出流失败！");
			return;
		}
		let bytes = invoke(dataStr, 'getBytes', 'gbk');
		try {
			btOutStream.write(bytes);
		} catch(e) {
			return false;
		}
		return true;
	}
    function sendDataQRC(dataStr) {
    //console.log("发送的数据："+dataStr);
    	if(!btOutStream) {
    		shortToast("创建输出流失败！");
    		return;
    	}
    	let bytes = invoke(dataStr, 'getBytes', 'UTF-8');
    	try {
    		btOutStream.write(bytes);
    	} catch(e) {
    		return false;
    	}
    	return true;
    }
    

	  
	function PTK_ClearBuffer() {
	
	        let nReturn = 0;
	       let data = "N\r\n";
	        nReturn=sendData(data);
	        return nReturn;
	    }
	
	function PTK_SetPrintSpeed(px) {
	        let nReturn = 0;
	
	       let data = "S" + px + "\r\n";
	        if((px < 0 || px > 10) && (px % 5 != 0 || px / 5 < 2 || px / 5 > 8) && (px % 10 != 0 || px / 10 < 4 || px / 10 > 10)) {
	            nReturn = -1005;
	            return nReturn;
	        } else {
	            nReturn=sendData(data);
	            return nReturn;
	        }
	    }
	
	function PTK_SetDirection() {
	        let nReturn = 0;
	       
	       let data = "Z" + direct + "\r\n";
	        if(!direct.equals("B") && !direct.equals("T")) {
	            nReturn = ParameterError;
	            return nReturn;
	        } else {
	
	            nReturn=sendData(data);
	            return nReturn;
	        }
	    }
	
	function PTK_SetDarkness(id) {
	        let nReturn = 0;
	        let pid;
	        if(id >= 0 && id <= 20) {
	            pid = id;
	        } else {
	            pid = 10;
	        }
	       let data = "H" + pid + "\r\n";
	        nReturn=sendData(data);
	        return nReturn;
	    }
	
	function PTK_SetLabelHeight(lHeight, gapH, gapOffset, bFlag) {
	        let nReturn = 0;
	       let gap=0;
	       let data = "";
	        if(lHeight >= 1 && lHeight <= 65535 && gapH >= 0 && gapH <= 240) {
	            if(bFlag) {
	                if(gapOffset >= 0) {
	                    gap =  gapH + "+" + gapOffset;
	                } else {
	                    gap = gapH + gapOffset;
	                }
	
	                data = "Q" + lHeight + ",B" + gap + "\r\n";
	            } else {
	                data = "Q" + lHeight + "," + gapH + "\r\n";
	            }
	        }
	        nReturn=sendData(data);
	        return nReturn;
	    }
	
	function PTK_SetLabelWidth(lWidth) {
	        let nReturn = 0;
	       let data = "q" + lWidth + "\r\n";
	        nReturn=sendData(data);
	        return nReturn;
	    }
	
	function PTK_SetCoordinateOrigin(px, py) {
	        let nReturn = 0;
	       let data = "R" + px + "," + py + "\r\n";
	        nReturn=sendData(data);
	        return nReturn;
	    }
	
	function PTK_PrintLabel(number, cpnumber) {
	        let nReturn = 0;
	       let data = "";
	        if(number >= 1 && number <= 65535) {
	            if(cpnumber >= 1 && cpnumber <= 65535) {
	                data = "W" + number + "," + cpnumber + "\r\n";
	            } else {
	                data = "W" + number + "," + 1 + "\r\n";
	            }
	            nReturn=sendData(data);
	            return nReturn;
	        } else {
	            nReturn =ParameterError;
	            return nReturn;
	        }
	    }
	
	function PTK_PrintLabelAuto(number, cpnumber) {
	        let nReturn = 0;
	       let data = "";
	        if(number >= 1 && number <= 65535) {
	            if(cpnumber >= 1 && cpnumber <= 65535) {
	                data = "WA" + number + "," + cpnumber + "\r\n";
	            } else {
	                data = "WA" + number + "," + 1 + "\r\n";
	            }
	
	            nReturn=sendData(data);
	            return nReturn;
	        } else {
	            nReturn =ParameterError;
	            return nReturn;
	        }
	    }
	
	function PTK_SoftFontList() {
	        let nReturn = 0;
	       let data = "EI\r\n";
	        nReturn=sendData(data);
	        return nReturn;
	    }
	
	function PTK_SoftFontDel(id) {
	        let nReturn = 0;
	        if((id < 'A' || id > 'Z') && id != '*') {
	            nReturn =ParameterError;
	            return nReturn;
	        } else {
	           let data = "EK\"" + id + "\"\r\n";
	            nReturn=sendData(data);
	            return nReturn;
	        }
	    }
	
	function PTK_EnableBackFeed() {
	        let nReturn = 0;
	       let data = "JF\r\n";
	        nReturn=sendData(data);
	        return nReturn;
	    }
	
	function PTK_DisableBackFeed() {
	        let nReturn = 0;
	       let data = "JB\r\n";
	        nReturn=sendData(data);
	        return nReturn;
	    }
	
	function PTK_PrintConfiguration() {
	        let nReturn = 0;
	       let data = "U\r\n";
	        nReturn=sendData(data);
	        return nReturn;
	    }
	
	function PTK_SetPrinterState(state) {
	        let nReturn = 0;
	       let data = "O" + state + "\r\n";
	        if(state != 'P'&& state != 'L' && state != 'D' && state != 'C' && state != 'N') {
	            nReturn = ParameterError;
	            return nReturn;
	        } else {
	            nReturn=sendData(data);
	            return nReturn;
	        }
	    }
	
	function PTK_EnableErrorReport() {
	        let nReturn = 0;
	       let data = "US\r\n";
	        nReturn=sendData(data);
	        return nReturn;
	    }
	
	function PTK_DisableErrorReport() {
	        let nReturn = 0;
	       let data = "UN\r\n";
	        nReturn=sendData(data);
	        return nReturn;
	    }
	
	function PTK_EnableFLASH() {
	        let nReturn = 0;
	       let data = "ZS\r\n";
	        nReturn=sendData(data);
	        return nReturn;
	    }
	
	function PTK_DisableFLASH() {
	        let nReturn = 0;
	       let data = "ZN\r\n";
	        nReturn=sendData(data);
	        return nReturn;
	    }
	
	function PTK_FeedMedia() {
	        let nReturn = 0;
	       let data = "FM\r\n";
	        nReturn=sendData(data);
	        return nReturn;
	    }
	
	function PTK_MediaDetect() {
	        let nReturn = 0;
	       let data = "MD\r\n";
	        nReturn=sendData(data);
	        return nReturn;
	    }
	
	function PTK_Reset() {
	        let nReturn = 0;
	       let data = "^@\r\n";
	        nReturn=sendData(data);
	        return nReturn;
	    }
	
	function PTK_CutPage(page) {
	        let nReturn = 0;
	        let cp = page;
	        if(page > 999 || page < 1) {
	            cp = 1;
	        }
	       let data = "CT" + cp + "\r\n";
	        nReturn=sendData(data);
	        return nReturn;
	    }
	
	
	function PTK_FeedBack() {
	        let nReturn = 0;
	       let data = "^ee\r\n";
	        nReturn=sendData(data);
	        return nReturn;
	    }
	
	function PTK_UserBackFeed(feedLen) {
	        let nReturn = 0;
	       let data = "JH" + feedLen + "\r\n";
	        nReturn=sendData(data);
	        return nReturn;
	    }
	
	function PTK_SetNetworkFeedbackParameter(port,ip, cp) {
	        let nReturn = 0;
	       let data = "NF" + port + "," + ip + "," + cp + "\r\n";
	        if(cp != 0 && cp != 1) {
	            nReturn = ParameterError;
	            return nReturn;
	        } else {
	            nReturn=sendData(data);
	            return nReturn;
	        }
	    }
	
	function PTK_SetFeedbackPort(port) {
	        let nReturn = 0;
	       let data = "FB" + port + "\r\n";
	          nReturn=sendData(data);
	            return nReturn;
	    }
	
	 // 检测的各种方法：
	 	function Ccheck1(id) {
	 		let rec = id;
	 		if (rec >= 0 && rec <= 9) {
	 			return true;
	 		} else {
	 			return false;
	 		}
	 	}
	
	 	function Ccheck2(maxNum) {
	 		let max = maxNum;
	 		if (max > 0 && max < 40) {
	 			return true;
	 		} else {
	 			return false;
	 		}
	 	}
	
	 	function Ccheck3(text) {
	 		let txt = text;
	 		if (txt == 'L' || txt == 'C' || txt == 'R' || txt == 'N') {
	 			return true;
	 		} else {
	 			return false;
	 		}
	 	}
	
	 	function AcheckA3(direct) {
	 		let nReturn = 0;
	 		if (direct == 0 || direct == 1 || direct == 2 || direct == 3) {
	 			return nReturn;
	 		} else {
	 			return -1;
	 		}
	 	}
	
	 	function  AcheckA4(Afont) {
	 		let font = Afont;
	 		if (font >= '1' && font <= '7') {
	 			return 0;
	 		} else if ((font >= 'A' && font <= 'Z') ) {
	 			return 0;
	 		} else {
	 			return -1;
	 		}
	 	}
	
	 	function  AcheckA56(Horizontal,Vertical) {
	 		let h, v;
	 		let nReturn = 0;
	 		h = Horizontal;
	 		v = Vertical;
	 		if ((h >= 1 && h <= 999) && (v >= 1 && v <= 999)) {
	 			return nReturn;
	 		} else {
	 			return -1;
	 		}
	 	}
	
	 	function  AcheckA7(text) {
	 		let nReturn = 0;
	 		let txt = text;
	 		if (txt == 'N' || txt == 'R') {
	 			return nReturn;
	 		} else {
	 			return -1;
	 		}
	 	}
	
	 	function  AcheckBarcode7(text) {
	 		let nReturn = 0;
	 		let txt = text;
	 		if (txt == 'N' || txt == 'B') {
	 			return nReturn;
	 		} else {
	 			return -1;
	 		}
	 	}
	
	 	// 检测Bar2D_Pdf417函数第5个参数是否正确。
	 	function  Bar2d_check_S(s) {
	 		if (s >= 0 && s <= 8) {
	 			return 1;
	 		} else {
	 			return -1;
	 		}
	 	}
	
	 	// 检测Bar2D_Pdf417函数第6个参数是否正确。
	 	function  Bar2d_check_C(c) {
	 		if (c == 0 || c == 1) {
	 			return 1;
	 		} else {
	 			return -1;
	 		}
	 	}
	
	 	// 检测Bar2D_Pdf417函数第7个参数是否正确。
	 	function  Bar2d_check_PX(px) {
	 		if (px >= 0 && px <= 8) {
	 			return 1;
	 		} else {
	 			return -1;
	 		}
	 	}
	
	 	// 检测Bar2D_Pdf417函数第8个参数是否正确。
	 	function  Bar2d_check_PY(py) {
	 		if (py >= 4 && py <= 99) {
	 			return 1;
	 		} else {
	 			return -1;
	 		}
	 	}
	
	 	// 检测Bar2D_Pdf417函数第11个参数是否正确。
	 	function  Bar2d_check_T(t) {
	 		if (t == 0 || t == 1) {
	 			return 1;
	 		} else {
	 			return -1;
	 		}
	 	}
	
	 	// 检测Bar2D_Pdf417函数第12个参数是否正确。
	 	function  Bar2d_check_O(o) {
	 		if (o == 0 || o == 1 || o == 2 || o == 3) {
	 			return 1;
	 		} else {
	 			return -1;
	 		}
	 	}
	
	 	// 检测Bar2D_Pdf417函数第13个参数是否正确。
	 	function  Bar2d_check_PSTR(pstr) {
	 		if (pstr != null) {
	 			return 1;
	 		} else {
	 			return -1;
	 		}
	 	}
	
	    
	function PTK_DrawText(px, py, pdirec, pFont, pHorizontal, pVertical,  ptext, pstr) {
	        let nReturn = 0;
	       let data = "";
		 
			let reg = new RegExp( '\"' , "g" )
	        pstr=pstr.replace(reg, '\\\\\"');
			
			//console.log(this.AcheckA3(pdirec)+"---"+this.AcheckA4(pFont)+"---"+this.AcheckA56(pHorizontal, pVertical)+"---"+this.AcheckA7(ptext));
			
	        if(this.AcheckA3(pdirec) >= 0 && this.AcheckA4(pFont) >= 0 && this.AcheckA56(pHorizontal, pVertical) >= 0 && this.AcheckA7(ptext) >= 0) {
	            data = "T" + px + "," + py + "," + pdirec + "," + pFont + "," + pHorizontal + "," + pVertical + "," + ptext + ",\"" + pstr + "\"\r\n";
	
	            nReturn=sendData(data);
	
	            return nReturn;
	        } else {
	            nReturn=ParameterError;
	            return nReturn;
	        }
	    }
	   
	function PTK_DrawBarcode(px, py, pdirec,pCode, NarrowWidth, pHorizontal, pVertical,  ptext,  pstr) {
	        let nReturn = 0;
	       let data = "";
	        if(this.AcheckA3(pdirec) >= 0 && this.AcheckBarcode7(ptext) >= 0) {
	            data = "B" + px + "," + py + "," + pdirec + "," + pCode + "," + NarrowWidth + "," + pHorizontal + "," + pVertical + "," + ptext + ",\"" + pstr + "\"\r\n";
	            nReturn=sendData(data);
	            return nReturn;
	        } else {
	            nReturn = ParameterError;
	            return nReturn;
	        }
	    }
	
	 
	function PTK_DrawBar2D_QR(x, y, w, v, o, r, m, g, s, pstr) {
	        let nReturn = 0;
	       let data = "";
	        if(o >= 0 && o <= 3 && r >= 1 && r <= 999 && m >= 0 && m <= 4 && g >= 0 && g <= 3 && s >= 0 && s <= 8) {
	            data = "b" + x + "," + y + ",QR," + w + "," + v + ",o" + o + ",r" + r + ",m" + m + ",g" + g + ",s" + s + ",\"" + pstr + "\"\r\n";
	           nReturn=sendDataQRC(data);
	
	            return nReturn;
	        } else {
	            nReturn = ParameterError;
	            return nReturn;
	        }
	    }
	
	function PTK_DrawBar2D_DATAMATRIX(x, y, w, v, o, m, pstr) {
	        let nReturn = 0;
	       let data = "";
	        if(o >= 0 && o <= 3 && m >= 1 && m <= 9) {
	            data = "b" + x + "," + y + ",DX," + w + "," + v + ",o" + o + ",m" + m + ",\"" + pstr + "\"\r\n";
	            nReturn=sendData(data);
	            return nReturn;
	        } else {
	            nReturn =ParameterError;
	            return nReturn;
	        }
	    }
	
	function PTK_DrawBar2D_MaxiCode(x, y, m, u, pstr) {
	        let nReturn = 0;
	       let data = "";
	        if(u >= 0 && u <= 1 && m >= 2 && m <= 4) {
	            data ="b" + x + "," + y + ",M," + m + "," + u + ",\"" + pstr + "\"\r\n";
	            nReturn=sendData(data);
	
	            return nReturn;
	        } else {
	            nReturn = ParameterError;
	            return nReturn;
	        }
	    }
	
	function PTK_DrawBar2D_Pdf417(x, y, w, v, s, c, px, py, r, l, t, o, pstr) {
	        let nReturn = 0;
	       let data = "";
	        if(this.Bar2d_check_C(c) > 0 && this.Bar2d_check_O(o) > 0 && this.Bar2d_check_PX(px) > 0 && this.Bar2d_check_PY(py) > 0 && this.Bar2d_check_S(s) > 0 && this.Bar2d_check_T(t) > 0 && this.Bar2d_check_PSTR(pstr) > 0) {
	            data ="b" + x + "," + y + ",P," + w + "," + v + ",s" + s + ",c" + c + ",x" + px + ",y" + py + ",r" + r + ",l" + l + ",t" + t + ",o" + o + ",\"" + pstr + "\"\r\n";
	            nReturn=sendData(data);
	
	            return nReturn;
	        } else {
	            nReturn = ParameterError;
	            return nReturn;
	        }
	    }
	
	function PTK_DrawBar2D_HANXIN(x, y, w, v, m, o, r, g, s, pstr) {
	        let nReturn = 0;
	       let data = "";
	        if(o >= 0 && o <= 3 && m >= 0 && m <= 6 && r >= 0 && r <= 30 && g >= 0 && g <= 3 && s >= 0 && s <= 3) {
	            data ="b" + x + "," + y + ",HX," + w + "," + v + ",m" + m + ",o" + o + ",r" + r + ",g" + g + ",s" + s + ",\"" + pstr + "\"\r\n";
	            nReturn=sendData(data);
	            return nReturn;
	        } else {
	            nReturn =ParameterError;
	            return nReturn;
	        }
	    }
	
	function PTK_DrawRectangle(px, py, thickness, pEx, pEy) {
	        let nReturn = 0;
	       let data = "X" + px + "," + py + "," + thickness + "," + pEx + "," + pEy + "\r\n";
	        nReturn=sendData(data);
	        return nReturn;
	    }
	
	function PTK_DrawLineXor(px, py, pbyte, pH) {
	        let nReturn = 0;
	       let data = "LE" + px + "," + py + "," + pbyte + "," + pH + "\r\n";
	        nReturn=sendData(data);
	        return nReturn;
	    }
	
	function PTK_DrawLineOr(px, py, plength, pH) {
	        let nReturn = 0;
	       let data = "LO" + px + "," + py + "," + plength + "," + pH + "\r\n";
	        nReturn=sendData(data);
	        return nReturn;
	    }
	
	function PTK_DrawDiagonal(px, py, thickness, pEx, pEy) {
	        let nReturn = 0;
	       let data = "LS" + px + "," + py + "," + thickness + "," + pEx + "," + pEy + "\r\n";
	        nReturn=sendData(data);
	        return nReturn;
	    }
	
	function PTK_DrawWhiteLine(px, py, plength, pH) {
	        let nReturn = 0;
	       let data = "LW" + px + "," + py + "," + plength + "," + pH + "\r\n";
	        nReturn=sendData(data);
	        return nReturn;
	    }
	
	function PTK_PcxGraphicsList() {
	        let nReturn = 0;
	       let data = "GI\r\n";
	        nReturn=sendData(data);
	        return nReturn;
	    }
	
	function PTK_PcxGraphicsDel(pid) {
	        let nReturn = 0;
	       let data = "";
	        if((pid.length() <= 0 || pid.length() > 16)) {
	            nReturn = ParameterError;
	            return nReturn;
	        } else {
	            data ="GK\"" + pid + "\"\r\n";
	            nReturn=sendData(data);
	            return nReturn;
	        }
	    }
	
	function PTK_PcxGraphicsDownload(pcxname,pcxfile) {
	        let nReturn = 0;
	        let fileSize = pcxfile.length;
	       let data = "";
	        let LC="\r\n";
	        if(pcxname.length() > 0 && pcxname.length() <= 16) {
	            data ="GM\"" + pcxname + "\"" + fileSize + "\r\n";
	            nReturn=sendData(data);
	            nReturn=sendData(LC);
	            return nReturn;
	        } else {
	            nReturn =ParameterError;
	            return nReturn;
	        }
	    }
	
	function PTK_DrawPcxGraphics(px, py,  gname) {
	        let nReturn = 0;
	       let data = "";
	        if(gname.length() > 0 && gname.length() <= 16) {
	            data ="GG" + px + "," + py + ",\"" + gname + "\"\r\n";
	            nReturn=sendData(data);
	            return nReturn;
	        } else {
	            nReturn = ParameterError;
	            return nReturn;
	        }
	    }
	
	function PTK_PrintPCX(px, py, pcxname,pcxfile) {
	        let nReturn=0;
	        nReturn = this.PTK_PcxGraphicsDel(pcxname);
	        if(nReturn < 0) {
	            return nReturn;
	        } else {
	            nReturn = this.PTK_PcxGraphicsDownload(pcxname, pcxfile);
	            if(nReturn < 0) {
	                return nReturn;
	            } else {
	                nReturn = this.PTK_DrawPcxGraphics(px, py, pcxname);
	                return nReturn < 0?nReturn:nReturn;
	            }
	        }
	    }
	
	
	
	function PTK_BinGraphicsList() {
	        let nReturn = 0;
	       let data = "BI\r\n";
	        nReturn=sendData(data);
	        return nReturn;
	    }
	
	function PTK_BinGraphicsDel(pid) {
	        let nReturn = 0;
	       let data = "";
	        if(pid.length() <= 0 || pid.length() > 16) {
	            nReturn = ParameterError;
	            return nReturn;
	        } else {
	            data ="BK\"" + pid + "\"\r\n";
	            nReturn=sendData(data);
	
	            return nReturn;
	        }
	    }
	
	function PTK_BinGraphicsDownloadbin(Name, pbyte, pH, Gdata) {
	        let nReturn = 0;
	       let data = "GD\"" + binName + "\"" + pbyte + "," + pH + ","+Gdata+"\r\n";
	      nReturn=sendData(data);
	
	        return nReturn;
	    }
	
	function PTK_RecallBinGraphics(px, py, binName) {
	        let nReturn = 0;
	       let data = "";
	        if(binName.length() > 0 && binName.length() <= 16) {
	            data ="GC" + px + "," + py + ",\"" + binName + "\"\r\n";
	            nReturn=sendData(data);
	
	            return nReturn;
	        } else {
	            nReturn =ParameterError;
	            return nReturn;
	        }
	    }
	
	function PTK_DrawBinGraphics(px, py, pbyte, pH, Gdata) {
	        let nReturn = 0;
	       let data = "GW" + px + "," + py + "," + pbyte + "," + pH + ",";
	        
	        return nReturn;
	    }
	
	function PTK_FormList() {
	        let nReturn = 0;
	       let data = "FI\r\n";
	        nReturn=sendData(data);
	
	        return nReturn;
	    }
	
	function PTK_FormDel(pid) {
	        let nReturn = 0;
	       let data = "";
	        if(pid.length() <= 0 || pid.length() > 16) {
	            nReturn = ParameterError;
	            return nReturn;
	        } else {
	            data ="FK\"" + pid + "\"\r\n";
	            nReturn=sendData(data);
	
	            return nReturn;
	        }
	    }
	
	function PTK_FormDownload(pid) {
	        let nReturn = 0;
	       let data = "";
	        if(pid.length() <= 0 || pid.length() > 16) {
	            nReturn = ParameterError;
	            return nReturn;
	        } else {
	            data ="FS\"" + pid + "\"\r\n";
	            nReturn=sendData(data);
	
	            return nReturn;
	        }
	    }
	
	function PTK_FormEnd() {
	        let nReturn = 0;
	       let data = "FE\r\n";
	        nReturn=sendData(data);
	        return nReturn;
	    }
	
	function PTK_ExecForm(pid) {
	        let nReturn = 0;
	       let data = "";
	        if(pid.length() <= 0 || pid.length() > 16) {
	            nReturn = ParameterError;
	            return nReturn;
	        } else {
	            data ="FR\"" + pid + "\"\r\n";
	            nReturn=sendData(data);
	
	            return nReturn;
	        }
	    }
	
	function PTK_DefineCounter(id, maxNum, ptext, pstr, pMsg) {
	        let nReturn = 0;
	       let data = "";
	        if(this.Ccheck1(id) && this.Ccheck2(maxNum) && this.Ccheck3(ptext)) {
	            data ="C" + id + "," + maxNum + "," + ptext + "," + pstr + ",\"" + pMsg + "\"\r\n";
	            nReturn=sendData(data);
	
	            return nReturn;
	        } else {
	            nReturn = ParameterError;
	            return nReturn;
	        }
	    }
	
	function PTK_DefineVariable(pid, pmax,  porder,  pMsg) {
	        let nReturn = 0;
	       let data = "";
	        if(pid <= 99 && pmax >= 1 && pmax <= 99 && this.Ccheck3(porder)) {
	            data ="V" + pid + "," + pmax + "," + porder + ",\"" + pMsg + "\"\r\n";
	
	            nReturn=sendData(data);
	            return nReturn;
	        } else {
	            nReturn = ParameterError;
	            return nReturn;
	        }
	    }
	
	function PTK_Download() {
	        let nReturn = 0;
	       let data = "?\r\n";
	        nReturn=sendData(data);
	        return nReturn;
	    }
	
	function PTK_DownloadInitVar(pstr) {
	        let nReturn = 0;
	       let data = pstr + "\r\n";
	        nReturn=sendData(data);
	
	        return nReturn;
	    }
	
	function PTK_SetFontGap(gap) {
	        let nReturn = 0;
	        if(gap >= 100) {
	            gap = 99;
	        }
	
	        if(gap < -99) {
	            gap = -99;
	        }
	
	       let data = "g" + gap + "\r\n";
	        nReturn=sendData(data);
	
	        return nReturn;
	    }
	
	function PTK_SetCharSets(BitValue,  CharSets,  CountryCode) {
	        let nReturn = 0;
	       let data = "I" + BitValue + "," + CharSets + "," + CountryCode + "\r\n";
	        nReturn=sendData(data);
	
	        return nReturn;
	    }
	
	function PTK_RenameDownloadFont(StoreType,  Fontname,  DownloadFontName) {
	        let nReturn = 0;
	       let data = "CF" + StoreType + "," + Fontname + "," + DownloadFontName + "\r\n";
	        nReturn=sendData(data);
	
	        return nReturn;
	    }
	
	function PTK_RFIDCalibration() {
	        let nReturn = 0;
	       let data = "MR\r\n";
	        nReturn=sendData(data);
	
	        return nReturn;
	    }
	
	function PTK_RWRFIDLabel(nRWMode, nWForm, nStartBlock, nWDataNum, nWArea,  pstr) {
	        let nReturn = 0;
	       let data = "RF" + nRWMode + "," + nWForm + "," + nStartBlock + "," + nWDataNum + "," + nWArea + ",\"" + pstr + "\"\r\n";
	        nReturn=sendData(data);
	
	        return nReturn;
	    }
	
	function PTK_SetRFLabelPWAndLockRFLabel(nOperationMode, OperationnArea,  pstr) {
	        let nReturn = 0;
	       let data = "RZ" + nOperationMode + "," + OperationnArea + ",\"" + pstr + "\"\r\n";
	        nReturn=sendData(data);
	        return nReturn;
	    }
	
	function PTK_SetRFID(nReservationParameters, nReadWriteLocation, ReadWriteArea, nMaxErrNum, nErrProcessingMethod) {
	        let nReturn = 0;
	       let data = "RS" + nReservationParameters + "," + nReadWriteLocation + "," + ReadWriteArea + "," + nMaxErrNum + "," + nErrProcessingMethod + "\r\n";
	        nReturn=sendData(data);
	
	        return nReturn;
	    }
	
	    //此函数不会被clearbuffer函数清空  避免出现被清空而漏写芯片
	function PTK_RWRFIDLabelEx(nRWMode, nWForm, nStartBlock, nWDataNum, nWArea, pstr) {
	        let nReturn = 0;
	       let data = "RA" + nRWMode + "," + nWForm + "," + nStartBlock + "," + nWDataNum + "," + nWArea + "," + pstr + "\r\n";
	        nReturn=sendData(data);
	        return nReturn;
	    }
	   
	   function PTK_ReadRFIdTagData(dataBlock, ReadPower, feed) {
		   let nReturn=0;
	        let  data="RR"+dataBlock+","+feedBackPort+","+ReadPower+","+feed;
	      nReturn=sendData(data);
		  return nReturn;
	    }
	
	
	
			    
	    function PTK_GetTrueTypeList() {
			let  nReturn=0;
	       let data ="^S1\r\n";
		   nReturn=sendData(data);
	        return nReturn;
	    }
	
	
	
	  function PTK_Print300DpiDemo() {
	        let nReturn = 0;
	       
	       let  data = "I8,1,001\r\nQ886,24\r\nq1228\r\nH10\r\nZB\r\nR0,0\r\nN\r\nLO6,223,1216,12\r\nLO6,468,1216,12\r\nB46,258,0,0,3,9,137,N,\"42045458\"\r\nB170,551,0,0,6,18,258,N,\"00006141411234567890\"\r\nT43,16,0,3,1,1,N,\"FROM\"\r\nT169,52,0,3,1,1,N,\"BIG SUPPLY\"\r\nT172,95,0,3,1,1,N,\"SAVENUE\"\r\nT170,136,0,3,1,1,N,\"NEWYORK\"\r\nT177,178,0,3,1,1,N,\"USA\"\r\nT684,176,0,3,1,1,N,\"USA\"\r\nT683,136,0,3,1,1,N,\"DAYTON.OHIO\"\r\nT680,99,0,3,1,1,N,\"8163NEWCAJUN\"\r\nT687,56,0,3,1,1,N,\"GOEATVALUE\"\r\nT612,16,0,3,1,1,N,\"TO\"\r\nT734,404,0,3,1,1,N,\"PRO2895769\"\r\nT727,335,0,3,1,1,N,\"B/L853930\"\r\nT729,264,0,3,1,1,N,\"SHIP TO POST\"\r\nT554,490,0,1,2,2,N,\"0 0614141 123456789\"\r\nT197,93,0,3,1,1,N,\"th\"\r\nT178,407,0,1,2,2,N,\"(420)45458\"\r\nT179,821,0,1,3,3,N,\"(00)006141411234567890\"\r\nW1,1\r\n";
	        nReturn=sendData(data);
	        return nReturn;
	    }


};