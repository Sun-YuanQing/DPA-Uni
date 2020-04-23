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

let cpcl = require("./cpcl.js")
let tsc = require("./tsc.js")

/**
 * @description 打印机类型
 */
var EPrinterType = {
	cpcl: 1,
	tsc: 2,
	esc: 3
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
let maxBit = 200

/**
 * @description 查询蓝牙 
 */
function searchPrinter(options) {
	uni.openBluetoothAdapter({
		success: function(res) {
			uni.getBluetoothAdapterState({
				success: function(res) {
					// console.log(res)
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
							content: '本机蓝牙不可用',
						})
					}
				}
			})
		},
		fail: function() {
			uni.showModal({
				title: '提示',
				content: '蓝牙初始化失败，请打开蓝牙',
			})
		}
	})
}

/**
 * @description 获取蓝牙设备信息
 */
function getBluetoothDevices(options) {
	// console.log("start search")
	uni.showLoading({
		title: '正在加载',
	})
	uni.startBluetoothDevicesDiscovery({
		success: function(res) {
			uni.onBluetoothDeviceFound(function(res) {
				var devices = []
				var num = 0
				for (var i = 0; i < res.devices.length; ++i) {
					if (res.devices[i].name != "") {
						devices[num] = res.devices[i]
						num++
					}
				}
				if (devices.length > 0) {
					options.success && options.success.call(options.scope || this, devices);
				}
			})

			// setTimeout(function() {
			// 	uni.getBluetoothDevices({
			// 		success: function(res) {
			// 			var devices = []
			// 			var num = 0
			// 			for (var i = 0; i < res.devices.length; ++i) {
			// 				if (res.devices[i].name != "未知设备") {
			// 					devices[num] = res.devices[i]
			// 					num++
			// 				}
			// 			}
			// 			console.log(devices); 
			// 			options.success && options.success.call(options.scope || this, devices);
			// 		},
			// 	})
			// }, 3000);
		},
		fail: function(err) {
			uni.showToast({
				title: "请检查蓝牙是否已经打开"
			})
		},
		complete() {
			uni.hideLoading()
		}
	})
}

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
					console.log(res)
				}
			})
			deviceId = options.data.deviceId
			getBLEDeviceServices(options)
			uni.hideLoading()
		},
		fail: function(res) {
			console.log("蓝牙连接失败")
			console.log(res)
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
			console.log(res)
			services = res.services
			getCharacteristics(options)
		},
		fail: function(e) {
			console.log(e)
			uni.showToast({
				title: '服务不存在，请重试！'
			})
		},
		complete: function(e) {
			console.log(e)
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
	console.log({
		rlt: list
	});
	console.log("num:" + num);
	if (list.length == 0 || !list[num].uuid) {
		uni.showModal({
			title: '提示',
			content: '请重新搜索',
		})
		return;
	}

	uni.getBLEDeviceCharacteristics({
		deviceId: deviceId,
		serviceId: list[num].uuid,
		success: function(res) {
			console.log(res)
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
				} else {
					console.log('================================');
					getCharacteristics(options)
				}
			} else {
				setTimeout(function() {
					//给设备连接响应时间
					options.success && options.success.call(options.scope || this, '');
				}, 500);
			}
		},
		fail: function(e) {
			console.log(e)
		},
		complete: function(e) {
			console.log("write:" + writeCharaterId)
			console.log("read:" + readCharaterId)
			console.log("notify:" + notifyCharaterId)
		}
	})
}



/***********************  以下为打印命令 *************************************************/
/**
 * @description 设置打印机类型
 * @param {Number} type 打印机类型
 *  cpcl: 1,
	tsc: 2,
	esc: 3
 */
function setPrinterType(type) {
	printerType = type
}

/**
 * @description 初始化打印机命令
 */
function initCommand() {
	switch (printerType) {
		case EPrinterType.tsc:
			command = tsc.jpPrinter.createNew()
			break;
			// case EPrinterType.esc:
			// 	command = esc.jpPrinter.createNew()
			// 	break;
		case EPrinterType.cpcl:
			command = cpcl.jpPrinter.createNew()
			break;
		default:
			//cpcl
			command = cpcl.jpPrinter.createNew()
			break;
	}
}

/***********************  通用命令*******************************************/
/**
 * @description  清空打印命令
 */
function clrCommand() {
	command.clrCommand()
}

/**
 * @description  设置页面宽高
 */
function addSize(pageWidght, pageHeight) {
	switch (printerType) {
		case EPrinterType.tsc:
			command.addSize(pageWidght, pageHeight)
			break;
		case EPrinterType.cpcl:
			command.addSize(pageWidght * 8, pageHeight * 8)
			break;
		case EPrinterType.esc:
			break;
	}
}
/**
 * @description 该指令用于定义两张卷标纸间的垂直间距距离
 * @param {Object} command
 * @param {Object} printGap
 */
function addGap(printGap) {
	switch (printerType) {
		case EPrinterType.tsc:
			command.addGap(printGap)
			break;
		case EPrinterType.cpcl:
			command.addGap()
			break;
		case EPrinterType.esc:
			break;
	}
}
/**
 * @description 设置打印机速度
 * @param {Object} printSpeed
 */
function addSpeed(printSpeed) {
	switch (printerType) {
		case EPrinterType.tsc:
		case EPrinterType.cpcl:
			command.addSpeed(printSpeed)
			break;
		case EPrinterType.esc:
			break;
	}
}
/**
 * @description 设置打印机浓度
 * @param {Object} printDensity
 */
function addDensity(printDensity) {
	switch (printerType) {
		case EPrinterType.tsc:
		case EPrinterType.cpcl:
			command.addDensity(printDensity)
			break;
		case EPrinterType.esc:
			break;
	}
}
/**
 * @description 清除打印机缓存
 * @param {Object} command
 */
function addCls() {
	switch (printerType) {
		case EPrinterType.tsc:
		case EPrinterType.cpcl:
			command.addCls()
			break;
		case EPrinterType.esc:
			break;
	}
}

/**
 * @description 根据Size找到下一张标签纸的位置
 * @param {Object} command
 */
function addHome(command) {
	switch (printerType) {
		case EPrinterType.tsc:
		case EPrinterType.cpcl:
			command.addHome()
			break;
		case EPrinterType.esc:
			break;
	}
}
/**
 * @description 绘制线条
 * @param {Object} x_start:number 线条起始点x坐标
 * @param {Object} y_start:number 线条起始点y坐标
 * @param {Object} x_end:number 线条结束点x坐标
 * @param {Object} y_end:number 线条结束点y坐标
 * @param {Object} width:number 线条宽度
 * @param {Object} fullline:bool  true:实线  false: 虚线
 */
function addLine(x_start, y_start, x_end, y_end, width, fullline) {
	switch (printerType) {
		case EPrinterType.tsc:
			command.addLine(x_start, y_start, x_end - x_start, y_start - y_start)
			break;
		case EPrinterType.esc:
			break;
		case EPrinterType.cpcl:
			command.addLine(x_start, y_start, x_end, y_end, width, fullline)
			break;
	}
}
/**
 * @description 打印文字
 * @param {Number} x
 * @param {Number} y
 * @param {String} text
 * @param {Number} fontSize 
 * @param {Number} bold 0|1 
 * @param {Boolen} underline 下划线
 */
function addText(x, y, text, fontSize, bold, underline) {
	switch (printerType) {
		case EPrinterType.tsc:
			command.addText(x, y, text, 'TSS24.BF2', 1, 1)
			break;
		case EPrinterType.esc:
			break;
		case EPrinterType.cpcl:
			command.addText(x, y, text, fontSize, 0, bold, false, underline)
			break;
	}
}

/**
 * @description 打印一维码
 * @param {Number} x
 * @param {Number} y
 * @param {String} content
 * @param {Number} codetype
 * @param {Number} height
 * @param {Boolen} readable 文本内容是否可见
 * @param {Boolen} portrait 水平还是垂直
 * @param {Number} radio 宽条与窄条的比率
 */
function addBarcode(x, y, content, codetype, height, readable, portrait, radio) {
	switch (codetype) {
		case 'Code128':
			codetype = "128"
			break;
		case 'Code39':
			codetype = "39"
			break;
		case 'Code39':
			codetype = "93"
			break;
		default:
			break;
	}
	switch (printerType) {
		case EPrinterType.tsc:
			//x, y, content, codetype, height, readable, portrait, radio
			readable = readable == "true" ? 1 : 0;
			command.addBarcode(x, y, content, codetype, height, readable, portrait, radio)
			break;
		case EPrinterType.esc:
			break;
		case EPrinterType.cpcl:
			//x, y, content, codetype, height, portrait, radio, linewidth
			readable = readable == "true" ? true : false;
			command.addBarcode(x, y, content, codetype, height, readable, portrait, radio, radio)
			break;
	}
}

/**
 * @param {Number} x_start
 * @param {Number} y_start
 * @param {Number} x_end
 * @param {Number} y_end
 * @param {Number} thickness 方框线宽
 */
function addBox(x_start, y_start, x_end, y_end, thickness) {
	switch (printerType) {
		case EPrinterType.tsc:
		case EPrinterType.cpcl:
			command.addBox(x_start, y_start, x_end, y_end, thickness)
			break;
		case EPrinterType.esc:
			break;
	}
}
/**
 * @description 打印二维码
 * @param {Object} x
 * @param {Object} y
 * @param {Object} content
 * @param {Object} width
 */
function addQR(x, y, content, width) {
	switch (printerType) {
		case EPrinterType.tsc:
		case EPrinterType.cpcl:
			command.addQR(x, y, content, width)
			break;
		case EPrinterType.esc:
			break;
	}
}
/**
 * @description 添加自定义命令
 * @param {String} content 自定义命令
 */
function addUserCommand(content) {
	switch (printerType) {
		case EPrinterType.tsc:
		case EPrinterType.cpcl:
			command.addUserCommand(content)
			break;
		case EPrinterType.esc:
			break;
	}
}

/**
 * @description 打印
 */
function addPagePrint(options) {
	switch (printerType) {
		case EPrinterType.tsc:
		case EPrinterType.cpcl:
			command.addPagePrint()
			break;
		case EPrinterType.esc:
			break;
	}
	uni.showLoading({
		title: '数据传输中',
	})
	var buf = getData();
	writeBLEValue(buf, options);
}

/**
 * @description 返回二进制命令数据
 */
function getData() {
	switch (printerType) {
		case EPrinterType.tsc:
		case EPrinterType.cpcl:
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
	let count = arrayBuffer.byteLength
	if (count > maxBit) {
		let leftArrayBuffer = arrayBuffer.slice(maxBit)
		try {
			uni.writeBLECharacteristicValue({
				deviceId: deviceId,
				serviceId: writeServiceId,
				characteristicId: writeCharaterId,
				value: arrayBuffer.slice(0, maxBit),
				success: function(res) {
					console.log("分部传输中, 剩余：" + leftArrayBuffer.byteLength) 
					setTimeout(function() {
						writeBLEValue(leftArrayBuffer, options)
					}, 50); 
					// writeBLEValue(leftArrayBuffer, options)
				},
				fail: function(e) {
					// setTimeout(function() {
					// 	writeBLEValue(leftArrayBuffer, options)
					// }, 50); 
					console.log(e)
					uni.hideLoading()
					uni.showToast({
						title: "传输数据失败",
						icon: 'none'
					})
					if (options && options.fail)
						options.fail && options.fail.call(options.scope || this, '');
				}
			})
		} catch (err) {
			uni.showToast({
				title: "传输数据失败",
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
						title: "传输数据失败",
						icon: 'none'
					})
					if (options && options.fail)
						options.fail && options.fail.call(options.scope || this, '');
				}
			})
		} catch (err) {
			uni.showToast({
				title: "传输数据失败",
				icon: 'none'
			})
			if (options && options.fail)
				options.fail && options.fail.call(options.scope || this, '');
		}
	}
}
/***********************  通用命令*******************************************/







module.exports = {
	searchPrinter: searchPrinter,
	connect: connect,
	disconnect: disconnect,

	setPrinterType: setPrinterType,
	initCommand: initCommand,
	clrCommand: clrCommand,
	addSize: addSize,
	addGap: addGap,
	addSpeed: addSpeed,
	addDensity: addDensity,
	addCls: addCls,
	addHome: addHome,
	addLine: addLine,
	addText: addText,
	addBarcode: addBarcode,
	addBox: addBox,
	addQR: addQR,
	addUserCommand: addUserCommand,
	addPagePrint: addPagePrint
	// getData: getData
}
