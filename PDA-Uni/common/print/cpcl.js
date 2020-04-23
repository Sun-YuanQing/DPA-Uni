/* 面单打印命令 */
let gbToBase64 = require("./gb2312ToBase64.js").encode64
var jpPrinter = {
	createNew: function() {
		var jpPrinter = {};
		var data = [];
		var command = [];

		let _currentBold = -1
		let _currentFont = -1

		jpPrinter.name = "蓝牙打印机";
		/**
		 * @description 清空命令
		 */
		jpPrinter.clrCommand = function() {
			command = [];
		}

		jpPrinter.addStrToCommand = function(content) { //将指令转成数组装起  
			// console.log(content);
			command.push(content)
		}

		jpPrinter.addGap = function() { //该指令用于定义两张卷标纸间的垂直间距距离
			// data = "GAP-SENSE\r\n";
			// jpPrinter.addStrToCommand(data)
		};

		jpPrinter.addSize = function(pageWidth, pageHeight) { //设置页面大小

			data = "! 0 200 200 " + pageHeight + " " + "1\r\n";
			jpPrinter.addStrToCommand(data)

			data = "PAGE-WIDTH " + pageWidth + "\r\n";
			jpPrinter.addStrToCommand(data)
		};

		jpPrinter.addQulity = function(qulity) { //设置打印机质量
			return jpPrinter.otherSet(50, qulity);
		};
		jpPrinter.addSpeed = function(printSpeed) { //设置打印机速度
			return jpPrinter.otherSet(49, printSpeed);
		};
		jpPrinter.addDensity = function(printDensity) { //设置打印机浓度 
			//pt-66dc打印机
			return jpPrinter.otherSet(48, printDensity);
		};

		/**
		 * @param {type} 
		 * desity=48   val desity >= 0 && desity <= 14
		 * speed=49    val speed >= 0 && speed <= 4
		 * qulity=50   val qulity <= 2 && qulity >= 0
		 * pageType=51 val pageType <= 2 && pageType >= 0
		 */
		jpPrinter.otherSet = function(type, val) {
			//pt-66dc打印机
			let buf = new ArrayBuffer(8)
			let dateView = new DataView(buf)
			dateView.setUint8(0, 29)
			dateView.setUint8(1, 40)
			dateView.setUint8(2, 75)
			dateView.setUint8(3, 3)
			dateView.setUint8(4, 0)
			dateView.setUint8(5, type)
			dateView.setUint8(6, 48)
			dateView.setUint8(7, val)
			return buf;
		}

		jpPrinter.addReference = function(x, y) { //设置坐标原点，与打印方向有关
			data = "REFERENCE " + x + "," + y + "\r\n";
			jpPrinter.addStrToCommand(data)
		};
		jpPrinter.addCls = function() { //清除打印机缓存
			// data = "CLS" + "\r\n";
			// jpPrinter.addStrToCommand(data)
		};
		jpPrinter.addHome = function() {
			data = "FORM\r\n";
			jpPrinter.addStrToCommand(data);
		}

		jpPrinter.addText = function(x, y, text, fontSize, rotate, bold, reverse, underline) { //打印文字
			// if (underline) {
			// 	data = "UNDERLINE ON" + '\r\n';
			// 	jpPrinter.addStrToCommand(data)
			// }
			// else{
			// 	data = "UNDERLINE OFF" + '\r\n';
			// 	jpPrinter.addStrToCommand(data)				
			// }

			if (bold != _currentBold) {
				data = "SETBOLD " + bold + '\r\n';
				jpPrinter.addStrToCommand(data)
				_currentBold = bold;
			}
			let size = 0;
			let family = 0;
			let ex = 1;
			let ey = 1;
			family = 8
			fontSize = fontSize > 16 ? 16: fontSize
			ex = fontSize
			ey = fontSize

			if (fontSize != _currentFont) {
				data = "SETMAG " + ex + " " + ey + '\r\n';
				jpPrinter.addStrToCommand(data)
			}

			switch (rotate) {
				case 1:
					if (reverse) {
						data = "TR90 " + family + " " + size + " " + x + " " + y + " " + text + '\r\n'

					} else {
						data = "T90 " + family + " " + size + " " + x + " " + y + " " + text + '\r\n'
					}
					break
				case 2:
					if (reverse) {
						data = "TR180 " + family + " " + size + " " + x + " " + y + " " + text + '\r\n'
					} else {
						data = "T180 " + family + " " + size + " " + x + " " + y + " " + text + '\r\n'
					}
					break
				case 3:
					if (reverse) {
						data = "TR270 " + family + " " + size + " " + x + " " + y + " " + text + '\r\n'
					} else {
						data = "T270 " + family + " " + size + " " + x + " " + y + " " + text + '\r\n'
					}
					break
				default:
					if (reverse) {
						data = "TR " + family + " " + size + " " + x + " " + y + " " + text + '\r\n'
					} else {
						data = "TEXT " + family + " " + size + " " + x + " " + y + " " + text + '\r\n'
					}
					break
			}
			jpPrinter.addStrToCommand(data)
		};

		jpPrinter.addBox = function(x_start, y_start, x_end, y_end, thickness) { //绘制方框
			if (x_start > 575)
				x_start = 575
			if (x_end > 575)
				x_end = 575

			let data = "BOX " + x_start + " " + y_start + " " + x_end + " " + y_end + " " + thickness + '\r\n'
			jpPrinter.addStrToCommand(data)
		};
		/*打印线条 
		  width:number 线条宽度
		  start_x:number 线条起始点x坐标
		  start_y:number 线条起始点y坐标
		  end_x:number 线条结束点x坐标
		  end_y:number 线条结束点y坐标
		  fullline:bool  true:实线  false: 虚线
		*/
		jpPrinter.addLine = function(x_start, y_start, x_end, y_end, width, fullline) { //绘制线条
			if (fullline)
				data = "LINE " + x_start + " " + y_start + " " + x_end + " " + y_end + " " + width + '\r\n';
			else
				data = "LPLINE " + x_start + " " + y_start + " " + x_end + " " + y_end + " " + width + '\r\n';
			jpPrinter.addStrToCommand(data)
		};
		/*一维条码
		  params:
			start_x:number 一维码起始横坐标
			start_y:number 一维码起始纵坐标
			content:number  内容
			codetype:number 条码类型
			portrait:bool 是否横向 true:横向；false:竖向
			linewidth:number 条码线宽度
			Height:number 条码高度
			radio:number 宽窄比
		*/
		jpPrinter.addBarcode = function(x, y, content, codetype, height, readable, portrait, radio, linewidth) { //打印条形码  
			//{command} {type} {width} {ratio} {height} {x} {y} {data}

			let barCode = portrait ? "BARCODE" : "VBARCODE"
			data = barCode + " " + codetype + " " + (linewidth - 1) + " " + radio + " " + height + " " + x + " " + y + " " +
				content + '\r\n'
			jpPrinter.addStrToCommand(data) 
			if (readable) {
				if (portrait) {
					jpPrinter.addText(x, y + height + 5, content, 2, 0, 0, false, false)
				} else {
					jpPrinter.addText(x + height + 5, y, content, 2, 1, 0, false, false)
				}
			}
		};

		/*二维条码
		  params:
		    x:number 二维码起始横坐标
		    y:number 二维码起始纵坐标
		    content:String    内容
		    portrait:bool 是否横向 true:横向；false:竖向
		    ver:number 宽度，范围(2～6)
		    width::number 大小，范围0～20
		*/
		jpPrinter.addQR = function(x, y, content, width, portrait) {
			// data = "SETBOLD " + 1 + '\r\n';
			// jpPrinter.addStrToCommand(data)

			// data = "SETQRVER " + ver + '\r\n';
			// jpPrinter.addStrToCommand(data) 
			
			// 因二维码垂直打印有问题，在设计时，二维码必须放在上半部分
			let barCode = portrait ? "BARCODE QR " : "VBARCODE QR " 
			data = barCode + x + " " + y + " M 2 " + "U " + width + "\r\nLA," + content + "\r\nENDQR\r\n";
			jpPrinter.addStrToCommand(data) 
		}

		jpPrinter.addUserCommand = function(command) { //添加自定义命令
			jpPrinter.addStrToCommand(command);
		}

		jpPrinter.addPagePrint = function() { //打印页面
			data = "SETMAG 0 0\r\n"
			data += "PRINT\r\n"
			jpPrinter.addStrToCommand(data)
		};
		jpPrinter.addPageRevervsePrint = function() { //打印页面
			data = "SETMAG 0 0\r\n"
			data = "POPRINT\r\n"
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
			// console.log(arrayBuffer.byteLength);
			return arrayBuffer;
		};

		return jpPrinter;
	}

}

module.exports.jpPrinter = jpPrinter;
