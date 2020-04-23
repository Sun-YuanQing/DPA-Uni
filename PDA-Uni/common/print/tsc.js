/* 标签打印 */
let gbToBase64 = require("./gb2312ToBase64.js").encode64
var jpPrinter = {
	createNew: function() {
		var jpPrinter = {};
		var data = "";
		var command = [];

		jpPrinter.name = "蓝牙打印机";

		jpPrinter.init = function() {};
		/**
		 * @description 清空命令
		 */
		jpPrinter.clrCommand = function() {
			command = [];
		}

		jpPrinter.addStrToCommand = function(content) { //将指令转成数组装起			
			command.push(content)
		}

		jpPrinter.addGap = function(printGap) { //该指令用于定义两张卷标纸间的垂直间距距离
			data = "GAP " + printGap+ " mm\r\n";
			jpPrinter.addStrToCommand(data)
		};

		jpPrinter.addSize = function(pageWidght, pageHeight) { //设置页面大小 		
			data = "SIZE " + pageWidght+ " mm" + "," + pageHeight+ " mm" + "\r\n";
			jpPrinter.addStrToCommand(data)
		};

		jpPrinter.addCashdrwer = function(m, t1, t2) { //该指令用于产生钱箱控制脉冲
			data = "CASHDRAWER " + m + "," + t1 + "," + t2 + "\r\n";
			jpPrinter.addStrToCommand(data);
		}

		jpPrinter.addOffadd = function(offadd) {
			data = "OFFadd " + offadd + " mm" + "\r\n";
			jpPrinter.addStrToCommand(data)
		};

		jpPrinter.addSpeed = function(printSpeed) { //设置打印机速度
			data = "SPEED " + printSpeed+ "\r\n";
			jpPrinter.addStrToCommand(data)
		};

		jpPrinter.addDensity = function(printDensity) { //设置打印机浓度
			data = "DENSITY " + printDensity+ "\r\n";
			jpPrinter.addStrToCommand(data)
		};

		jpPrinter.addDirection = function(direction) { //设置打印方向，参考编程手册  
			data = "DIRECTION " + direction + "\r\n";
			jpPrinter.addStrToCommand(data)
		};

		jpPrinter.addReference = function(x, y) { //设置坐标原点，与打印方向有关
			data = "REFERENCE " + x + "," + y + "\r\n";
			jpPrinter.addStrToCommand(data)
		};
		jpPrinter.addCls = function() { //清除打印机缓存
			data = "CLS" + "\r\n";
			jpPrinter.addStrToCommand(data)
		};

		jpPrinter.addFeed = function(feed) { //将纸向前推出n
			data = "FEED " + feed + "\r\n";
			jpPrinter.addStrToCommand(data)
		};

		jpPrinter.addBackFeed = function(backup) { //将纸向后回拉n
			data = "BACKFEED " + backup + "\r\n";
			jpPrinter.addStrToCommand(data)
		}

		jpPrinter.addFromfeed = function() { //根据Size进一张标签纸
			data = "FORMFEED \r\n";
			jpPrinter.addStrToCommand(data)
		};

		jpPrinter.addHome = function() { //根据Size找到下一张标签纸的位置
			data = "HOME \r\n";
			jpPrinter.addStrToCommand(data)
		};

		jpPrinter.addCountry = function(country) { //选择国际字符集
			/*
			001:USA
			002:French
			003:Latin America
			034:Spanish
			039:Italian
			044:United Kingdom
			046:Swedish
			047:Norwegian
			049:German
			 */
			data = "COUNTRY " + country + "\r\n";
			jpPrinter.addStrToCommand(data)
		};

		jpPrinter.addCodepage = function(codepage) { //选择国际代码页
			/*
			8-bit codepage 字符集代表
			437:United States
			850:Multilingual
			852:Slavic
			860:Portuguese
			863:Canadian/French
			865:Nordic
			Windows code page
			1250:Central Europe
			1252:Latin I
			1253:Greek
			1254:Turkish
			以下代码页仅限于 12×24 dot 英数字体
			WestEurope:WestEurope
			Greek:Greek
			Hebrew:Hebrew
			EastEurope:EastEurope
			Iran:Iran
			IranII:IranII
			Latvian:Latvian
			Arabic:Arabic
			Vietnam:Vietnam
			Uygur:Uygur
			Thai:Thai
			1252:Latin I
			1257:WPC1257
			1251:WPC1251
			866:Cyrillic
			858:PC858
			747:PC747
			864:PC864
			1001:PC100
			*/
			data = "CODEPAGE " + codepage + "\r\n";
			jpPrinter.addStrToCommand(data)
		}

		jpPrinter.addSound = function(level, interval) { //控制蜂鸣器
			data = "SOUND " + level + "," + interval + "\r\n";
			jpPrinter.addStrToCommand(data)
		};

		jpPrinter.addLimitfeed = function(limit) { // 检测垂直间距
			data = "LIMITFEED " + limit + "\r\n";
			jpPrinter.addStrToCommand(data)
		};

		jpPrinter.addLine = function(x, y, width, height) { //绘制线条
			data = "BAR " + x + "," + y + "," + width + "," + height + "\r\n"
			jpPrinter.addStrToCommand(data)
		};

		jpPrinter.addText = function(x, y, text, font, x_, y_, portrait) { //打印文字
			let rotation = portrait ? 0 : 270;
			data = "TEXT " + x + "," + y + ",\"" + font + "\"," + rotation + "," + x_ + "," + y_ + "," + "\"" + text + "\"\r\n"
			jpPrinter.addStrToCommand(data)
		};

		jpPrinter.addBarcode = function(x, y, content, codetype, height, readable, portrait, radio) { //打印条形码
			let rotation = portrait ? 0 : 270;
			let narrow, wide
			narrow = wide = radio;
			
			switch (codetype){
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
					codetype = "128"
					break;
			}
			
			data = "BARCODE " + x + "," + y + ",\"" + codetype + "\"," + height + "," + readable + "," + rotation + "," + narrow + "," + wide + ",\"" + content + "\"\r\n"
			jpPrinter.addStrToCommand(data)
		};

		jpPrinter.addBox = function(x_start, y_start, x_end, y_end, thickness) { //绘制方框
			data = "BOX " + x_start + "," + y_start + "," + x_end + "," + y_end + "," + thickness + "\r\n";
			jpPrinter.addStrToCommand(data)
		};

		jpPrinter.addBitmap = function(x, y, mode, res) { //添加图片，res为画布参数
			// console.log(res)
			var width = parseInt((res.width + 7) / 8 * 8 / 8)
			var height = res.height;
			var time = 1;
			var temp = res.data.length - width * 32;
			var pointList = []
			console.log(width + "--" + height)
			data = "BITMAP " + x + "," + y + "," + width + "," + height + "," + mode + ","
			jpPrinter.addStrToCommand(data)
			for (var i = 0; i < height; ++i) {
				// console.log(temp)
				for (var j = 0; j < width; ++j) {
					for (var k = 0; k < 32; k += 4) {
						if (res.data[temp] == 0 && res.data[temp + 1] == 0 && res.data[temp + 2] == 0 && res.data[temp + 3] == 0) {
							pointList.push(1)
						} else {
							pointList.push(0)
						}
						temp += 4
					}
				}
				time++
				temp = res.data.length - width * 32 * time
			}
			for (var i = 0; i < pointList.length; i += 8) {
				var p = pointList[i] * 128 + pointList[i + 1] * 64 + pointList[i + 2] * 32 + pointList[i + 3] * 16 + pointList[i +
					4] * 8 + pointList[i + 5] * 4 + pointList[i + 6] * 2 + pointList[i + 7]
				command.push(p)
			}
		}

		jpPrinter.addErase = function(x_start, y_start, x_width, y_height) { //清除指定区域的数据
			data = "ERASE " + x_start + "," + y_start + "," + x_width + "," + y_height + "\r\n";
			jpPrinter.addStrToCommand(data)
		};

		jpPrinter.addReverse = function(x_start, y_start, x_width, y_height) { //将指定的区域反相打印
			data = "REVERSE " + x_start + "," + y_start + "," + x_width + "," + y_height + "\r\n";
			jpPrinter.addStrToCommand(data)
		};

		jpPrinter.addQR = function(x, y, content, width, portrait) { //打印二维码
			let rotation = portrait ? 0 : 270;
			data = "QRCODE " + x + "," + y + ", L," + width + ", A," + rotation + ",\"" + content + "\"\r\n"
			jpPrinter.addStrToCommand(data)
		};

		jpPrinter.addTear = function(enable) { // ON/OFF 此命令是用来启用/禁用撕纸位置走到撕纸处，此设置关掉电源后将保存在打印机内
			data = "SET TEAR " + enable + "\r\n";
			jpPrinter.addStrToCommand(data)
		};

		jpPrinter.addQueryPrinterType = function() { //该指令回复打印机的型号
			data = "~!T\r\n";
			jpPrinter.addStrToCommand(data);
		}
		jpPrinter.addQueryPrinterStatus = function() { //询问打印机状态指令
			data = "<ESC>!?\r\n";
			jpPrinter.addStrToCommand(data);
		}
		jpPrinter.addResetPrinter = function() { //该指令命令打印机重新开机
			data = "<ESC>!R\r\n";
			jpPrinter.addStrToCommand(data);
		}

		jpPrinter.addQueryPrinterLife = function() { //该指令回复打印机已打印的里程
			data = "~!@\r\n";
			jpPrinter.addStrToCommand(data);
		}

		jpPrinter.addQueryPrinterMemory = function() {
			data = "~!A\r\n";
			jpPrinter.addStrToCommand(data);
		}

		jpPrinter.addQueryPrinterFile = function() {
			data = "~!F\r\n";
			jpPrinter.addStrToCommand(data);
		}

		jpPrinter.addQueryPrinterCodePage = function() {
			data = "~!I\r\n";
			jpPrinter.addStrToCommand(data);
		}

		jpPrinter.addPeel = function(enable) { //该指令用来启动/关闭剥离模式，默认值为关闭
			if (enable.getValue() == 0) {
				data = "SET PEEL " + enable + "\r\n";
				jpPrinter.addStrToCommand(data);
			}

		}

		jpPrinter.addCutter = function(enable) { //此命令用于设置切刀状态，关闭打印机电源后，该设置将会被存储在打印机内存中。
			data = "SET CUTTER " + enable + "\r\n";
			jpPrinter.addStrToCommand(data);
		}

		jpPrinter.addCutterBatch = function() {
			data = "SET CUTTER BATCH\r\n";
			jpPrinter.addStrToCommand(data);
		}

		jpPrinter.addReprint = function(enable) { //此命令将禁用/启用标签机在无纸或开盖错误发生后，上纸或合盖后重新打印一
			次标签内容
			data = "SET REPRINT " + enable.getValue() + "\r\n";
			jpPrinter.addStrToCommand(data);
		}

		jpPrinter.addPrintKey = function(enable) { //此命令将打印一个标签并走到下一个标签的间隙到撕纸位置处，按下 FEED 按键，打印下一个标签或多份的标签。如果标签内容包括串行文字或条形码，它将改变序号，此设置将保存在打印机内存
			data = "SET PRINTKEY " + enable + "\r\n";
			jpPrinter.addStrToCommand(data);
		}

		jpPrinter.addQueryPrinterStatus = function(mode) { //ON/OFF/BATCH 此指令用于设置打印机自动返回状态
			data = "SET RESPONSE " + mode + "\r\n";
			jpPrinter.addStrToCommand(data)
		};

		jpPrinter.addUserCommand = function(command) { //添加自定义命令
			jpPrinter.addStrToCommand(command);
		}

		jpPrinter.addPagePrint = function() { //打印页面
			data = "PRINT 1,1\r\n"
			jpPrinter.addStrToCommand(data)
		};
		//获取打印数据
		jpPrinter.getData = function() {
			var cmds = '';
			for (var i = 0; i < command.length; i++) {
				cmds += command[i]
			}
			console.log(cmds);
			const base64Str = gbToBase64(cmds)
			const arrayBuffer = uni.base64ToArrayBuffer(base64Str)
			// console.log(base64Str);
			// console.log(arrayBuffer.byteLength);
			return arrayBuffer;
		};

		return jpPrinter;
	}
};

module.exports.jpPrinter = jpPrinter;
