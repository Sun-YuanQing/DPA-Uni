//常用功能

import consts from '../common/consts.js';
import storage from '../common/storage.js';

/**
 * @description 金额转换
 * @param {Object} s
 * @param {Object} n
 */
function FormatMoney(s, n) {
	n = n > 0 && n <= 20 ? n : 2;
	s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
	var l = s.split(".")[0].split("").reverse(),
		r = s.split(".")[1];
	t = "";
	for (i = 0; i < l.length; i++) {
		t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
	}
	return t.split("").reverse().join("") + "." + r;
}

/**
 * @description 金额转换
 * @param {Object} s
 */
function MoneyUnitConvert(s) {
	var unitArr = ["元", "万", "亿"];
	var numberScale = [100000000, 10000];
	var unit = unitArr[0];
	var rlt = "";
	if (eval(s) >= numberScale[0]) {
		rlt = FormatMoney(s / numberScale[0], 2);
		unit = unitArr[2];
	} else if (eval(s) >= numberScale[1]) {
		rlt = FormatMoney(s / numberScale[1], 2);
		unit = unitArr[1];
	} else {
		rlt = FormatMoney(s, 2);
	}
	return rlt + unit;
}



/**
 * @description 判断是否是字符，如果不是返回0 否则返回本身
 * @param {Object} s
 */
function NumberIsNullConvert(s) {
	if (s == null || isNaN(s))
		return 0;
	return s;
}

/**
 * @description 百分比转换
 * @param {Object} s
 */
function PercentUnitConvert(s) {
	return Math.round(eval(s) * 100) + "%";
}

/**
 * @description 关闭自身窗口
 */
function closeme() {
	var ws = plus.webview.currentWebview();
	plus.webview.close(ws);
}
/**
 * @description Clone
 */
function clone(obj) {
	var o;
	if (typeof obj == "object") {
		if (obj === null) {
			o = null;
		} else {
			if (obj instanceof Array) {
				o = [];
				for (var i = 0, len = obj.length; i < len; i++) {
					o.push(clone(obj[i]));
				}
			} else {
				o = {};
				for (var j in obj) {
					o[j] = clone(obj[j]);
				}
			}
		}
	} else {
		o = obj;
	}
	return o;
}


var dateUtils = {
	_now: new Date(),
	_nowDayOfWeek: new Date().getDay(), //今天本周的第几天   
	_nowDay: new Date().getDate(), //当前日   
	_nowMonth: new Date().getMonth(), //当前月   
	NowYear: function() {
		var year = this._now.getYear();
		return year += (year < 2000) ? 1900 : 0;
	},
	_dateFmt: "yyyy-MM-dd",
	//获得某月的天数   
	GetMonthDays: function(myMonth) {
		var monthStartDate = new Date(this.NowYear(), myMonth, 1);
		var monthEndDate = new Date(this.NowYear(), myMonth + 1, 1);
		var days = (monthEndDate - monthStartDate) / (1000 * 60 * 60 * 24);
		return days;
	},
	//获得本季度的开端月份 
	GetQuarterStartMonth: function() {
		var quarterStartMonth = 0;
		if (this._nowMonth < 3) {
			quarterStartMonth = 0;
		}
		if (2 < this._nowMonth && this._nowMonth < 6) {
			quarterStartMonth = 3;
		}
		if (5 < this._nowMonth && this._nowMonth < 9) {
			quarterStartMonth = 6;
		}
		if (this._nowMonth > 8) {
			quarterStartMonth = 9;
		}
		return quarterStartMonth;
	},
	//今日
	GetTodayDate: function() {
		var today = new Date();
		return today.Format(this._dateFmt);
	},
	//昨日
	GetYesterdayDate: function() {
		var yesterday = new Date(this.NowYear(), this._nowMonth, this._nowDay - 1);
		return yesterday.Format(this._dateFmt);
	},
	//获取本周开始时间
	GetWeekStartDate: function() {
		var weekStartDate = new Date(this.NowYear(), this._nowMonth, this._nowDay - this._nowDayOfWeek);
		return weekStartDate.Format(this._dateFmt);
	},
	//获取本周结束时间
	GetWeekEndDate: function getWeekEndDate() {
		var weekEndDate = new Date(this.NowYear(), this._nowMonth, this._nowDay + (6 - this._nowDayOfWeek));
		return weekEndDate.Format(this._dateFmt);
	},
	//获取上周开始时间
	GetLastWeekStartDate: function() {
		var weekStartDate = new Date(this.NowYear(), this._nowMonth, this._nowDay - this._nowDayOfWeek - 7);
		return weekStartDate.Format(this._dateFmt);
	},
	//获取上周结束时间
	GetLastWeekEndDate: function getWeekEndDate() {
		var weekStartDate = new Date(this.NowYear(), this._nowMonth, this._nowDay - this._nowDayOfWeek - 1);
		return weekStartDate.Format(this._dateFmt);
	},
	//获取本月开始时间
	GetMonthStartDate: function() {
		var monthStartDate = new Date(this.NowYear(), this._nowMonth, 1);
		return monthStartDate.Format(this._dateFmt);
	},
	//获取本月结束时间
	GetMonthEndDate: function() {
		var monthEndDate = new Date(this.NowYear(), this._nowMonth, this.GetMonthDays(this._nowMonth));
		return monthEndDate.Format(this._dateFmt);
	},
	//获取上月开始时间
	GetLastMonthStartDate: function() {
		var monthStartDate = new Date(this.NowYear(), this._nowMonth - 1, 1);
		return monthStartDate.Format(this._dateFmt);
	},
	//获取上月结束时间
	GetLastMonthEndDate: function() {
		var monthEndDate = new Date(this.NowYear(), this._nowMonth - 1, this.GetMonthDays(this._nowMonth));
		return monthEndDate.Format(this._dateFmt);
	},
	GetStartDateByMonth: function(month) {
		var monthStartDate = new Date(this.NowYear(), month - 1, 1);
		return monthStartDate.Format(this._dateFmt);
	},
	GetEndDateByMonth: function(month) {
		var monthEndDate = new Date(this.NowYear(), month - 1, this.GetMonthDays(month - 1));
		return monthEndDate.Format(this._dateFmt);
	},
	GetYearStartDate: function() {
		var monthStartDate = new Date(this.NowYear(), 0, 1);
		return monthStartDate.Format(this._dateFmt);
	},
	//获取本月结束时间
	GetYearEndDate: function() {
		var monthEndDate = new Date(this.NowYear(), 11, 31);
		return monthEndDate.Format(this._dateFmt);
	},
	GetLastYearStartDate: function() {
		var monthStartDate = new Date(this.NowYear() - 1, 0, 1);
		return monthStartDate.Format(this._dateFmt);
	},
	//获取本月结束时间
	GetLastYearEndDate: function() {
		var monthEndDate = new Date(this.NowYear() - 1, 11, 31);
		return monthEndDate.Format(this._dateFmt);
	},
	//获取本季度开始时间
	GetQuarterStartDate: function() {
		var quarterStartDate = new Date(this.NowYear(), this.GetQuarterStartMonth(), 1);
		return quarterStartDate.Format(this._dateFmt);
	},
	//获取本季度结束时间
	GetQuarterEndDate: function() {
		var quarterEndMonth = this.GetQuarterStartMonth() + 2;
		var quarterStartDate = new Date(this.NowYear(), quarterEndMonth, this.GetMonthDays(quarterEndMonth));
		return quarterStartDate.Format(this._dateFmt);
	},
	UNITS: {
		'年': 31557600000,
		'月': 2629800000,
		'天': 86400000,
		'小时': 3600000,
		'分钟': 60000,
		'秒': 1000
	},
	humanize: function(milliseconds) {
		var humanize = '';
		for (var key in this.UNITS) {
			if (milliseconds >= this.UNITS[key]) {
				humanize = Math.floor(milliseconds / this.UNITS[key]) + key + '前';
				break;
			}
		}
		return humanize || '刚刚';
	},
	format: function(dateStr) {
		var date = this.parse(dateStr)
		var diff = Date.now() - date.getTime();
		if (diff < this.UNITS['天']) {
			return this.humanize(diff);
		}
		var _format = function(number) {
			return (number < 10 ? ('0' + number) : number);
		};
		return date.getFullYear() + '/' + _format(date.getMonth() + 1) + '/' + _format(date.getDay()) + '-' +
			_format(date.getHours()) + ':' + _format(date.getMinutes());
	},
	parse: function(str) { //将"yyyy-mm-dd HH:MM:ss"格式的字符串，转化为一个Date对象
		var a = str.split(/[^0-9]/);
		return new Date(a[0], a[1] - 1, a[2], a[3], a[4], a[5]);
	}
};

//捕获访问服务器异常
function tryCatchApi(options) {
	options.status = options.status || 'success';
	options.icon = options.icon || 'none';
	options.duration = options.duration || 3000;
	if (options.status != 'success') {
		uni.showToast({
			title: options.message == undefined ? "数据请求失败" : options.message,
			icon: options.icon,
			duration: options.duration
		});
	}
}

/**
 * @description 播放异常声音提示 
 */
function showAudio() {
	let file = 'Syrma.mp3'
	playAudio(file);
}
/**
 * @description 播放扫描到声音
 */
function showScanedAudio() {
	let file = 'scaned.mp3'
	playAudio(file);
}
let bgAudioMannager = null;
/**
 * @description 播放音频
 * @param {Object} filePath 文件路径
 */
function playAudio(filePath) {
	if (bgAudioMannager == null) {
		bgAudioMannager = uni.getBackgroundAudioManager();
	}
	if (bgAudioMannager.src && bgAudioMannager.src.indexOf(filePath) > -1) {
		bgAudioMannager.play();
	} else {
		bgAudioMannager.src = '../../static/audio/' + filePath;
	}
}

/**
 * @description 用0拼接后缀 
 */
function getSuffix(length, val) {
	var rlt = val;
	var num = length - rlt.toString().length;
	for (var i = 0; i < num; i++) {
		rlt = "0" + rlt;
	}
	return rlt;
}



/**
 * @description 获取本地PDA设置
 * 如果校验不通过 返回 null
 */
function getPadBinding(options) {
	let setting = storage.get(consts.storageKeys.padBinding);
	options.data.showTips = options.data.showTips == undefined ? true : false;
	if (!setting) {
		if(options.data.showTips){
			let _self = this;
			uni.showModal({
				title: '提示',
				content: '请先配置 工作中心设置，在 首页 => 右上角菜单 => 工作中心设置',
				showCancel: false,
				success: function(res) {
					options.failure && options.failure.call(options.scope || this);
					uni.navigateTo({
						url: '/pages/appconfig/set-workcenter',
					})
				}
			});
		}else{
			options.success && options.success.call(options.scope || this, null);
		}
	} else if (setting.configDevice != options.data.deviceNo) {
		uni.showToast({
			title: '设备扫描错误，不是该PDA绑定的设备',
			icon: 'none'
		});
		options.failure && options.failure.call(options.scope || this);
	} else {
		options.success && options.success.call(options.scope || this, setting);
	}
}

/**
 * floatObj 包含加减乘除四个方法，能确保浮点数运算不丢失精度
 *
 * 我们知道计算机编程语言里浮点数计算会存在精度丢失问题（或称舍入误差），其根本原因是二进制和实现位数限制有些数无法有限表示
 * 以下是十进制小数对应的二进制表示
 *      0.1 >> 0.0001 1001 1001 1001…（1001无限循环）
 *      0.2 >> 0.0011 0011 0011 0011…（0011无限循环）
 * 计算机里每种数据类型的存储是一个有限宽度，比如 JavaScript 使用 64 位存储数字类型，因此超出的会舍去。舍去的部分就是精度丢失的部分。
 *
 * ** method **
 *  add / subtract / multiply /divide
 *
 * ** explame **
 *  0.1 + 0.2 == 0.30000000000000004 （多了 0.00000000000004）
 *  0.2 + 0.4 == 0.6000000000000001  （多了 0.0000000000001）
 *  19.9 * 100 == 1989.9999999999998 （少了 0.0000000000002）
 *
 * floatObj.add(0.1, 0.2) >> 0.3
 * floatObj.multiply(19.9, 100) >> 1990
 *
 */
var floatObj = function() {

	/*
	 * 判断obj是否为一个整数
	 */
	function isInteger(obj) {
		return Math.floor(obj) === obj
	}

	/*
	 * 将一个浮点数转成整数，返回整数和倍数。如 3.14 >> 314，倍数是 100
	 * @param floatNum {number} 小数
	 * @return {object}
	 *   {times:100, num: 314}
	 */
	function toInteger(floatNum) {
		var ret = {
			times: 1,
			num: 0
		}
		if (isInteger(floatNum)) {
			ret.num = floatNum
			return ret
		}
		var strfi = floatNum + ''
		var dotPos = strfi.indexOf('.')
		var len = strfi.substr(dotPos + 1).length
		var times = Math.pow(10, len)
		var intNum = parseInt(floatNum * times + 0.5, 10)
		ret.times = times
		ret.num = intNum
		return ret
	}
	// 乘的资料 https://segmentfault.com/a/1190000015979292
	/*
	 * 获取精度
	 * @param floatNum {number} 小数 
	 */
	function getDigits(floatNum) {
		var strfi = floatNum + ''
		var dotPos = strfi.indexOf('.')
		return strfi.substr(dotPos + 1).length
	}

	/*
	 * 核心方法，实现加减乘除运算，确保不丢失精度
	 * 思路：把小数放大为整数（乘），进行算术运算，再缩小为小数（除）
	 *
	 * @param a {number} 运算数1
	 * @param b {number} 运算数2
	 * @param op {string} 运算类型，有加减乘除（add/subtract/multiply/divide）
	 *
	 */
	function operation(a, b, op) {
		var o1 = toInteger(a)
		var o2 = toInteger(b)
		var n1 = o1.num
		var n2 = o2.num
		var t1 = o1.times
		var t2 = o2.times
		var max = t1 > t2 ? t1 : t2
		var result = null
		switch (op) {
			case 'add':
				if (t1 === t2) { // 两个小数位数相同
					result = n1 + n2
				} else if (t1 > t2) { // o1 小数位 大于 o2
					result = n1 + n2 * (t1 / t2)
				} else { // o1 小数位 小于 o2
					result = n1 * (t2 / t1) + n2
				}
				return result / max
			case 'subtract':
				if (t1 === t2) {
					result = n1 - n2
				} else if (t1 > t2) {
					result = n1 - n2 * (t1 / t2)
				} else {
					result = n1 * (t2 / t1) - n2
				}
				return result / max
			case 'multiply':
				result = (n1 * n2) / (t1 * t2)
				return toFixed(result, 5)
			case 'divide':
				result = (n1 / n2) * (t2 / t1)
				return toFixed(result, 6);
		}
	}


	/**
	 * @description 加法
	 * @param {Object} a
	 * @param {Object} b
	 */
	function add(a, b) {
		return operation(a, b, 'add')
	}

	/**
	 * @description 减法
	 * @param {Object} a
	 * @param {Object} b
	 */
	function subtract(a, b) {
		return operation(a, b, 'subtract')
	}

	/**
	 * @description 乘法
	 * @param {Object} a
	 * @param {Object} b
	 */
	function multiply(a, b) {
		return operation(a, b, 'multiply')
	}

	/**
	 * @description 除法
	 * @param {Object} a
	 * @param {Object} b
	 */
	function divide(a, b) {
		return operation(a, b, 'divide')
	}

	// toFixed 修复
	function toFixed(num, s) {
		var times = Math.pow(10, s)
		var des = num * times + 0.5
		des = parseInt(des, 10) / times
		return des + ''
	}

	// exports
	return {
		add: add,
		subtract: subtract,
		multiply: multiply,
		divide: divide,
		toFixed: toFixed
	}
}();

/**
 * @param {Object} options 计算列表的高度
 */
function getListHeight(options) {
	let _self = options;
	var query = uni.createSelectorQuery().in(_self);
	query.select('#viewHeader').boundingClientRect();
	let winHeight = uni.getSystemInfoSync().windowHeight;
	if (_self.$refs.viewBtm) {
		_self.$refs.viewBtm.getContentHeight({
			success(footHeight) {
				query.exec(function(res) {
					let rlt = winHeight - res[0].height - footHeight;
					_self.$data.scrollHeight = `${rlt}px`;
					_self.$refs.viewBtm.setPosition();
				});
			}
		});
	} else {
		query.exec(function(res) {
			let rlt = winHeight - res[0].height;
			_self.$data.scrollHeight = `${rlt}px`;
		});
	}
}
/**
 * @param {Object} obj 数据初始化
 */
function dataInit(obj) {
	var dataModel = obj.$options.data();
	dataModel.scrollHeight = obj.$data.scrollHeight;
	if (dataModel.reportModel) {
		dataModel.reportModel.progNo = obj.$data.reportModel.progNo;
	}
	Object.assign(obj.$data, dataModel);
}

/**
 * 判断是否允许回退
 * @param {Object} options 回退对象
 * @param {Boolen} condition 判断条件
 */
function backPress(options, condition) {
	if (options.from === 'navigateBack') {
		return false;
	}
	if (condition) {
		uni.showModal({
			title: '提示',
			content: '确定放弃操作',
			success: function(res_mod) {
				if (res_mod.confirm) {
					uni.navigateBack();
				}
			}
		})
		return true;
	}
}

/**
 * @param {Object} data 直接要打印输出的数据
 */
function outputLog(data) {
	let log = {
		output: data
	}
	return log;
}

/**
 * @description 获取当前最大索引
 */
function getMaxZIndex() {
	var date = new Date()
	//console.log("getHours:" + date.getHours() + "getMinutes:" + date.getMinutes() + "getSeconds:" + date.getSeconds());
	var zIndex = eval(date.getHours() + date.getMinutes() + date.getSeconds())
	// console.log(zIndex);
	return zIndex;
}

/**
 * @description 针对用户不同的提示
 * util对象 针对用户不同的提示
 * uni对象 按官方提示
 */
function showToast(option) {

	//console.log(storage.get(consts.storageKeys.erpInterfaceType) + "==" + consts.erpInterfaceType.anfeinuo)
	if (storage.get(consts.storageKeys.erpInterfaceType) == consts.erpInterfaceType.anfeinuo) {
		var Modal_title = option.title;
		option.title = '提示';
		option.content = Modal_title;
		option.showCancel = false;
		option.success = function(res) {
			if (res.confirm) {} else if (res.cancel) {}
		}
		uni.showModal(option);
	} else {
		console.log(option);
		uni.showToast(option);
	}
}
/**
 * @description 验证单据是否在自然月中
 * @param {Object} order 单据信息
 * @param {Boolen} showTips 是否提示消息 
 */
function validOrderMonth(order, showTips){
	showTips = showTips == undefined ? true: showTips;
	let userInfo = storage.get(consts.storageKeys.login);
	let setting = storage.get(consts.storageKeys.ErpReturnSet);
	//ErpNoCloseSw: 在当前期间之后的库存单据是否可以过帐  0.不允许处理跨月单据,提示：当前单据不在本月，请联系管理员！；1.允许处理跨月单据；
	let now = new Date(userInfo.loginDatetime);
	let orderDate = new Date(order.sheetDate)
	if(Number(setting.erpNoCloseSw) == 1) return true;
	else if (now.format('yyyyMM') != orderDate.format('yyyyMM')){
		if (showTips){
			uni.showToast({
				title: '当前单据不在本月，请联系管理员！',
				icon: 'none'
			});
			showAudio(); 
		}
		return false;
	}
	return true;
}
/**
 * @description 自动提示保存(请注意异步情况，正确放置代码位置)
 * list *校验的数组|
 * name *校验字段名称|
 * number *校验值0或1或false或true|
 * onSave *回调保存的方法(无设参)|
 * onCancel 可选,回调取消的方法(无设参)
 */
function automateSave(list, name, number, onSave,onCancel) {
	if(number>1||number<0 ){
		console.log( "number的值只能是四个0/1/false/true" );
	}
	var len = list.length;
	var len_ok = 0; 
	for (var i = 0; i < len; i++) { 
		var item = list[i];
		if (item[name] == number) {
			//校验值==number
			len_ok += 1;
		}
	}
	/* 校验长度相等,提示 */
	if (len_ok == len) {
		uni.showModal({
			title: '提示',
			content: '完成是否保存?',
			success: function(res_mod) {
				if (res_mod.confirm) {
					onSave();
				} else if (res_mod.cancel) {
					
					if(onCancel){
						onCancel();
					}else{
						console.log("没有取消方法，取消了校验");
					}
				}
			}
		});
		return;
	} else {
		console.log("校验不成功");
	}
}

module.exports = {
	formatMoney: FormatMoney,
	moneyUnitConvert: MoneyUnitConvert,
	numberIsNullConvert: NumberIsNullConvert,
	percentUnitConvert: PercentUnitConvert,
	dateUtils: dateUtils,
	tryCatchApi: tryCatchApi,
	showScanedAudio: showScanedAudio,
	showAudio: showAudio,
	playAudio: playAudio,
	clone: clone,
	getSuffix: getSuffix,
	getPadBinding: getPadBinding,
	floatObj: floatObj,
	getListHeight: getListHeight,
	dataInit: dataInit,
	backPress: backPress,
	outputLog: outputLog,
	getMaxZIndex: getMaxZIndex,
	showToast: showToast,
	validOrderMonth: validOrderMonth,
	automateSave: automateSave
}
