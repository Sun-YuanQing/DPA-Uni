/* 蓝牙打印
 * 1.要确定打印机类型，不同的打印机 指令集不同
 * 2.查询蓝牙打印机
 * 3.连接蓝牙
 * 4.关闭蓝牙
 * 5.命令输出
 */
'use strict';
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) {
	return typeof obj;
} : function(obj) {
	return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" :
		typeof obj;
};
/* 
import storage from '../../common/storage.js';
import consts from '../../common/consts.js'; */

// import cpcl from '../../common/print/cpcl.js';
// import tsc from '../../common/print/tsc.js';

let cpcl = require("./cpcl.js")
/**
 * @description 打印机类型
 */
var EPrinterType = {
	cpcl: 0,
	tsc: 1,
	esc: 2,
	pple: 3
};

let deviceId = ''
let serviceId = 0
let services = []

let writeCharacter = false
let readCharacter = false
let notifyCharacter = false

let writeCharaterId = ''
let writeServiceId = ''
let notifyCharaterId = ''
let notifyServiceId = ''
let readCharaterId = ''
let readServiceId = ''

/**
 * @param {Object} options 打印机类型
 */
let printerType = EPrinterType.cpcl
/**
 * @description 命令对象
 */
let command = null;
/**
 * @param {Object} options 每次蓝牙传输字节
 */
let maxBit = 20

/**
 * @description 查询蓝牙 
 */
function searchPrinter(options) {
	/* uni.openBluetoothAdapter({
		success: function(res) {
			getBluetoothDevices(options)
		},
		fail: function(err) {
			uni.showToast({
				title: "请检查蓝牙是否已经打开",
				icon: 'none'
			})
		}
	}) */


	uni.openBluetoothAdapter({
		success: function(res) {
			uni.getBluetoothAdapterState({
				success: function(res) {
					console.log(res)
					if (res.available) {
						if (res.discovering) {
							uni.stopBluetoothDevicesDiscovery({
								success: function(res) {
									console.log(res)
								}
							})
						}
						return getBluetoothDevices(options)
					} else {
						uni.showModal({
							title: '提示',
							content: '本机蓝牙不可用'
						})
					}
				}
			})
		},
		fail: function() {
			uni.showModal({
				title: '提示',
				content: '请检查蓝牙与GPS是否已经打开'
			})
		}
	})
}

/**
 * @description 获取蓝牙设备信息
 */
function getBluetoothDevices(options) {
	console.log("start search")
	uni.showLoading({
		title: '正在加载',
	})
	uni.startBluetoothDevicesDiscovery({
		success: function(res) {
			// console.log({
			// 	rlt: res
			// });
			/* uni.onBluetoothDeviceFound(function(res) {
				// console.log({rlt: res});
				console.log(3);
				var devices = []
				var num = 0
				for (var i = 0; i < res.devices.length; ++i) {
					if (res.devices[i].name != "") {
						devices[num] = res.devices[i]
						num++
					}
				}
				console.log(devices.length);
				if (devices.length > 0) {
					options.success && options.success.call(options.scope || this, devices);
				}else{
					options.fail && options.fail.call(options.scope || this);
				}
			}) */

			setTimeout(function() {
				uni.getBluetoothDevices({
					success: function(res) {
						var devices = []
						var num = 0
						for (var i = 0; i < res.devices.length; ++i) {
							if (res.devices[i].name != "未知设备") {
								devices[num] = res.devices[i]
								num++
							}
						}
						console.log({
							rlt: devices
						});
						if (devices.length > 0) {
							options.success && options.success.call(options.scope || this, devices);
						} else {
							options.fail && options.fail.call(options.scope || this);
						}
					},
				})
			}, 1000);
		},
		fail: function(err) {
			console.log(2);
			uni.showToast({
				title: "请检查蓝牙与GPS是否已经打开",
				icon: 'none'
			})
		},
		complete() {
			uni.hideLoading()
		}
	})
}

/**
 * @description 停止搜索设备
 */
function stopSearchPrinter() {
	uni.stopBluetoothDevicesDiscovery({
		success: function(res) {
			console.log(res)
		}
	})
}

let loopTime = 0;
/**
 * @description 连接
 * @param {Object} options
 */
function connect(options) {
	disconnect();
	uni.showLoading({
		title: '正在连接蓝牙',
	})
	uni.createBLEConnection({
		deviceId: options.data.deviceId,
		success: function(res) {
			uni.stopBluetoothDevicesDiscovery({
				success: function(res) {
					// console.log(res)
				}
			})
			deviceId = options.data.deviceId
			loopTime = 0;
			getBLEDeviceServices(options)
			/* let bluetoothPrinterSet = getBluetoothPrinterSet()
			setTimeout(function() {
				getBLEDeviceServices(options)
				uni.hideLoading()
			}, bluetoothPrinterSet.delayConnTime); */
		},
		fail: function(res) {
			console.log("蓝牙连接失败")
			console.log(res)
			uni.hideLoading()
		},
		complete: function() {
			uni.hideLoading()
		}
	})
}

/*断开连接，关闭蓝牙适配器
 */
function disconnect() {
	if (deviceId.length == 0) return;
	uni.closeBLEConnection({
		deviceId: deviceId,
		success: function(res) {

			deviceId = ''
			serviceId = 0
			services = []

			writeCharacter = false
			readCharacter = false
			notifyCharacter = false

			writeCharaterId = ''
			writeServiceId = ''
			notifyCharaterId = ''
			notifyServiceId = ''
			readCharaterId = ''
			readServiceId = ''
		},
	})
}

/**
 * @description 获取蓝牙设备所有服务(service)。
 */
function getBLEDeviceServices(options) {
	uni.getBLEDeviceServices({
		deviceId: deviceId,
		success: function(res) {
			// console.log(res)
			if (res.services.length == 0) {
				if (loopTime < 5) {
					//有得设备连接上之后不能立马得到服务
					setTimeout(function() {
						console.log('第 循环：' + loopTime);
						getBLEDeviceServices(options)
					}, 600);
				} else {
					disconnect();
					uni.showToast({
						title: '服务不存在，请重试！',
						icon: 'none'
					})
				}
				loopTime++;
			} else {
				services = res.services
				getCharacteristics(options)
			}
		},
		fail: function(e) {
			if (loopTime < 5) {
				//有得设备连接上之后不能立马得到服务
				setTimeout(function() {
					console.log('第 循环：' + loopTime);
					getBLEDeviceServices(options)
				}, 600);
			} else {
				disconnect();
				uni.showToast({
					title: '服务不存在，请重试！',
					icon: 'none'
				})
			}
			loopTime++;
		},
		complete: function(e) {
			// console.log(e)
		}
	})
}
/**
 * @description 获取蓝牙设备某个服务中所有特征值(characteristic)。
 */
function getCharacteristics(options) {
	var list = services
	var num = serviceId
	var write = writeCharacter
	var read = readCharacter
	var notify = notifyCharacter
	// console.log({
	// 	rlt: list
	// });
	// console.log("num:" + num);
	if (list.length == 0 || !list[num].uuid) {
		uni.showModal({
			title: '提示',
			content: '请重试或重启蓝牙打印机后，重新搜索!',
		})
		return;
	}

	uni.getBLEDeviceCharacteristics({
		deviceId: deviceId,
		serviceId: list[num].uuid,
		success: function(res) {
			// console.log(res)
			for (var i = 0; i < res.characteristics.length; ++i) {
				var properties = res.characteristics[i].properties
				var item = res.characteristics[i].uuid
				if (!notify) {
					if (properties.notify) {
						notifyCharaterId = item
						notifyServiceId = list[num].uuid
						notify = true
					}
				}
				if (!write) {
					if (properties.write) {
						writeCharaterId = item
						writeServiceId = list[num].uuid
						write = true
					}
				}
				if (!read) {
					if (properties.read) {
						readCharaterId = item
						readServiceId = list[num].uuid
						read = true
					}
				}
			}
			if (!write || !notify || !read) {
				num++
				writeCharacter = write;
				readCharacter = read;
				notifyCharacter = notify;
				serviceId = num;
				if (num == list.length) {
					uni.showModal({
						title: '提示',
						content: '找不到该读写的特征值',
					})
					disconnect();
				} else {
					getCharacteristics(options)
				}
			} else {
				setTimeout(function() {
					readData();
					//给设备连接响应时间
					options.success && options.success.call(options.scope || this, '');
				}, 500);
			}
		},
		fail: function(e) {
			console.log(e)
			uni.showToast({
				title: '找不到该读写的特征值，请重试！',
				icon: 'none'
			})
			disconnect();
		},
		complete: function(e) {
			// console.log("write:" + writeCharaterId)
			// console.log("read:" + readCharaterId)
			// console.log("notify:" + notifyCharaterId)
		}
	})
}

/**
 * @description 读取数据
 */
function readData() {
	uni.onBLEConnectionStateChange(function(res) {
		// 该方法回调中可以用于处理连接意外断开等异常情况
		console.log(`device ${res.deviceId} state has changed, connected: ${res.connected}`)
	})
	uni.notifyBLECharacteristicValueChange({
		// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
		deviceId: deviceId,
		// 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
		serviceId: notifyServiceId,
		// 这里的 characteristicId 需要在 getBLEDeviceCharacteristics 接口中获取
		characteristicId: notifyCharaterId,
		state: true, // 启用 notify 功能
		success(res) {
			console.log('notifyBLECharacteristicValueChange readData ===== success: ' + JSON.stringify(res));


			// 必须在这里的回调才能获取 
			uni.onBLECharacteristicValueChange(function(res) {
				console.log('onBLECharacteristicValueChange readData: ' + JSON.stringify(res));
				if (res.value != undefined) {
					console.log("buffer2hex: " + buffer2hex(res.value)); 
					console.log("hexCharCodeToStr: " + JSON.stringify(hexCharCodeToStr(buffer2hex(res.value))));
				}
			})

			uni.readBLECharacteristicValue({
				deviceId: deviceId,
				// 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
				serviceId: readServiceId,
				// 这里的 characteristicId 需要在 getBLEDeviceCharacteristics 接口中获取
				characteristicId: readCharaterId,
				success(res) {
					console.log("readBLECharacteristicValue: " + JSON.stringify(res));
				}
			})
		}
	})
}

/**
 * 写入的数据 格式转换
 * @param str
 * @returns 字符串 转 ArrayBuffer
 */
function hex2buffer(str) {
	console.info("写入的数据====" + str);
	//字符串 转 十六进制
	var val = "";
	for (var i = 0; i < str.length; i++) {
		if (val == "")
			val = str.charCodeAt(i).toString(16);
		else
			val += "," + str.charCodeAt(i).toString(16);
	}
	//十六进制 转 ArrayBuffer
	var buffer = new Uint8Array(val.match(/[\da-f]{2}/gi).map(function(h) {
		return parseInt(h, 16)
	})).buffer;

	return buffer;
}

/**
 * 读取的数据 格式转换
 * @param byte数组
 * @returns {string}
 */
function buffer2hex(buffer) {
	var hexArr = Array.prototype.map.call(
		new Uint8Array(buffer),
		function(bit) {
			return ('00' + bit.toString(16)).slice(-2)
		}
	);
	return hexArr.join('');
}

/**
 * 读取的数据 格式转换
 * @param 对应的string字符串
 * @returns {string}
 */
function hexCharCodeToStr(hexCharCodeStr) {
	var trimedStr = hexCharCodeStr.replace(/^\s+|\s+$/g, "");
	var hexCharCodeStr = trimedStr.substr(0, trimedStr.length - 4);
	var rawStr = trimedStr.substr(0, 2).toLowerCase() === "0x" ? trimedStr.substr(2) : hexCharCodeStr;
	//===========
	var resultStr = [];
	for (var i = 0; i < rawStr.length; i = i + 2) {
		var curCharCode = parseInt(rawStr.substr(i, 2), 16);
		resultStr.push(String.fromCharCode(curCharCode));
	}
	console.info("读取到的数据====" + JSON.stringify(resultStr))
	return resultStr.join("");
}

/***********************  以下为打印命令 *************************************************/

/**
 * @description 打印
 */
function addPagePrint(options) {
	/* switch (printerType) {
		case EPrinterType.tsc:
		case EPrinterType.cpcl:
		case EPrinterType.pple:
			command.addPagePrint()
			break;
		case EPrinterType.esc:
			break;
	} */

	const buffs = 
		'SETBOLD false\r\n' +
		'SETMAG 1 1\r\n' +
		'TEXT 1 0 127 187 [库位]\r\n' +
		'SETMAG 1 1\r\n' +
		'TEXT 1 0 127 152 [Q]\r\n' +
		'SETMAG 1 1\r\n' +
		'TEXT 1 0 127 117 [R]\r\n' +
		'SETMAG 1 1\r\n' +
		'TEXT 1 0 127 82 [S]\r\n' +
		'SETMAG 1 1\r\n' +
		'TEXT 1 0 127 47 [P]\r\n' +
		'SETMAG 1 1\r\n' +
		'TEXT 1 0 127 12 [C]\r\n' +
		'BARCODE QR 13 115 M 2 U 3\r\nMA,(I)190813111934457-001||(S)||(P)19-1007||(Q)51000||(L)||(C)AAT001USD   ||(R)fggg||(D)2019/08/13\r\nENDQR\r\n' +
		'SETMAG 1 1\r\n' +
		'TEXT 1 0 180 187 C0A1B2D3\r\n' +
		'SETMAG 1 1\r\n' +
		'TEXT 1 0 160 152 51000\r\n' +
		// '\r\n' +
		// '\r\n' +
		// '\r\n' +
		// '\r\n' +
		// '\r\n' +
		'TEXT 1 0 362 191 Y\r\n'
		
		
		
		
	command = cpcl.jpPrinter.createNew()	
	// command.addUserCommand(buffs);
	/* command.addSize(50 * 8, 30 * 8);
	command.addGap() 
	command.addCls()
	// command.addText(50, 50, 'cpcl打印', 2, 0, false, false, false) 
	// command.addUserCommand("BARCODE 128 1 1 50 150 10 HORIZ\r\n")
	command.addUserCommand(buffs) 
	command.addUserCommand('FORM\r\n')
	command.addPagePrint() */

	let title = '数据传输中'
	uni.showLoading({
		title: title,
	})
	// var buf = command.getData() 
	// writeBLEValue(buf, options);
	
	  //TSC
      // let buf = new ArrayBuffer(3)
      // let dateView = new DataView(buf)
      // dateView.setUint8(0, 0x1b)
      // dateView.setUint8(1, 0x21) 
      // dateView.setUint8(2, 0x3F) 
	  
	  //cpcl
      // let buf = new ArrayBuffer(2)
      // let dateView = new DataView(buf)
      // dateView.setUint8(0, 0x1b)
      // dateView.setUint8(1, 0x68) 
	  
	  //esc
      let buf = new ArrayBuffer(3)
      let dateView = new DataView(buf)
      dateView.setUint8(0, 0x10)
      dateView.setUint8(1, 0x04)  
      dateView.setUint8(2, 0x02) 
	  
	  writeBLEValue(buf, options);
}

/**
 * @description 返回二进制命令数据
 */
function getData() {
	switch (printerType) {
		case EPrinterType.tsc:
		case EPrinterType.cpcl:
		case EPrinterType.pple:
			return command.getData()
			break;
		case EPrinterType.esc:
			break;
	}
}

function writeBLEValue(arrayBuffer, options) {
	if (!deviceId || !writeCharaterId) {
		uni.showToast({
			title: "传输数据失败",
			icon: 'none'
		})
		return
	}
	// console.log(arrayBuffer.byteLength)
	let count = arrayBuffer.byteLength;
	if (count > maxBit) {
		try {
			uni.writeBLECharacteristicValue({
				deviceId: deviceId,
				serviceId: writeServiceId,
				characteristicId: writeCharaterId,
				value: arrayBuffer.slice(0, maxBit),
				success: function(res) {
					let leftArrayBuffer = arrayBuffer.slice(maxBit)
					console.log("分部传输中, 剩余：" + leftArrayBuffer.byteLength)
					// 针对 QiRui 需要间隔40毫秒？？？
					setTimeout(function() {
						writeBLEValue(leftArrayBuffer)
					}, 10);
					//writeBLEValue(leftArrayBuffer, options)
				},
				fail: function(e) {
					console.log(e)
					uni.hideLoading()
					uni.showToast({
						title: "传输数据失败，请重试",
						icon: 'none'
					})
					if (options && options.fail)
						options.fail && options.fail.call(options.scope || this, '');
				}
			})
		} catch (err) {
			uni.showToast({
				title: "传输数据失败，请重试",
				icon: 'none'
			})
			if (options && options.fail)
				options.fail && options.fail.call(options.scope || this, '');
		}

	} else {
		try {
			// console.log("最后一部分")
			uni.writeBLECharacteristicValue({
				deviceId: deviceId,
				serviceId: writeServiceId,
				characteristicId: writeCharaterId,
				value: arrayBuffer,
				success: function(res) {
					console.log("打印成功")
					// console.log(res)
					uni.hideLoading()
					if (options && options.success)
						options.success && options.success.call(options.scope || this, '');
				},
				fail: function(e) {
					console.log(e)
					uni.hideLoading()
					uni.showToast({
						title: "传输数据失败，请重试",
						icon: 'none'
					})
					if (options && options.fail)
						options.fail && options.fail.call(options.scope || this, '');
				}
			})
		} catch (err) {
			uni.showToast({
				title: "传输数据失败，请重试",
				icon: 'none'
			})
			if (options && options.fail)
				options.fail && options.fail.call(options.scope || this, '');
		}
	}
}

let oneTimeData = 20,
	currentTime = 1,
	lastData = 0;

function prepareSend(buff) { //准备发送，根据每次发送字节数来处理分包数量
	console.log(buff)
	loopTime = parseInt(buff.length / oneTimeData) + 1
	lastData = parseInt(buff.length % oneTimeData)
	currentTime = 1
	console.log(loopTime + "---" + lastData)
	Send(buff)
}

function Send(buff) { //分包发送  
	var buf
	var dataView
	if (currentTime < loopTime) {
		buf = new ArrayBuffer(oneTimeData)
		dataView = new DataView(buf)
		for (var i = 0; i < oneTimeData; ++i) {
			dataView.setUint8(i, buff[(currentTime - 1) * oneTimeData + i])
		}
	} else {
		buf = new ArrayBuffer(lastData)
		dataView = new DataView(buf)
		for (var i = 0; i < lastData; ++i) {
			dataView.setUint8(i, buff[(currentTime - 1) * oneTimeData + i])
		}
	}
	console.log("第" + currentTime + "次发送数据大小为：" + buf.byteLength)
	uni.writeBLECharacteristicValue({
		deviceId: deviceId,
		serviceId: writeServiceId,
		characteristicId: writeCharaterId,
		value: buf,
		success: function(res) {
			console.log(res)
		},
		fail: function(e) {
			console.log(e)
		},
		complete: function() {
			currentTime++
			if (currentTime <= loopTime) {
				Send(buff)
			} else {
				loopTime = 0,
					lastData = 0,
					currentTime = 1
			}
		}
	})

}
/***********************  通用命令*******************************************/







module.exports = {
	searchPrinter: searchPrinter,
	stopSearchPrinter: stopSearchPrinter,
	connect: connect,
	disconnect: disconnect,

	// setPrinterType: setPrinterType, 
	addPagePrint: addPagePrint
	// getData: getData
}
