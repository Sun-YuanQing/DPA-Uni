/* 面单打印命令 */
let gbToBase64 = require("./gb2312ToBase64.js").encode64
var encode = require("./encoding.js");

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
			// const base64Str = gbToBase64(content)
			// console.log(base64Str);
			// const arrayBuffer = uni.base64ToArrayBuffer(base64Str)
			// console.log(arrayBuffer.byteLength);
			// return arrayBuffer; 
			//gb18030
			var code = new encode.TextEncoder(
				'gb2312', {
					NONSTANDARD_allowLegacyEncoding: true
				}).encode(content)
			for (var i = 0; i < code.length; ++i) {
				command.push(code[i])
			}
		} 
		jpPrinter.addSize = function(pageWidth, pageHeight) { //设置页面大小
			data = "! 0 200 200 " + pageHeight + " " + "1\r\n";
			jpPrinter.addStrToCommand(data)

			data = "PAGE-WIDTH " + pageWidth+ "\r\n";
			jpPrinter.addStrToCommand(data)
		};

		jpPrinter.addText = function(x, y, text, fontSize, rotate, bold, reverse, underline) { //打印文字
			if (underline)
				data = "UNDERLINE ON";
			else
				data = "UNDERLINE OFF";
			jpPrinter.addStrToCommand(data)

			if (bold != _currentBold) {
				data = "SETBOLD " + bold;
				jpPrinter.addStrToCommand(data)
				_currentBold = bold;
			}

			let family = 0;
			let size = 0;
			let ex = 1;
			let ey = 1;

			switch (fontSize) {
				case 1:
					family = 55
					break
				case 2:
					family = 1
					break
				case 3:
					family = 4
					break
				case 4:
					family = 1
					ex = 2
					ey = 2
					break
				case 5:
					family = 4
					ex = 2
					ey = 2
					break
				case 6:
					family = 1
					ex = 4
					ey = 4
					break
				case 7:
					family = 4
					ex = 3
					ey = 3
					break
				default:
					family = 1
					break
			}
			if (fontSize != _currentFont) {
				data = "SETMAG " + ex + " " + ey;
				jpPrinter.addStrToCommand(data)
			}

			switch (rotate) {
				case 1:
					if (reverse) {
						data = "TR90 " + family + " " + size + " " + x + " " + y + " " + text

					} else {
						data = "T90 " + family + " " + size + " " + x + " " + y + " " + text
					}
					break
				case 2:
					if (reverse) {
						data = "TR180 " + family + " " + size + " " + x + " " + y + " " + text
					} else {
						data = "T180 " + family + " " + size + " " + x + " " + y + " " + text
					}
					break
				case 3:
					if (reverse) {
						data = "TR270 " + family + " " + size + " " + x + " " + y + " " + text
					} else {
						data = "T270 " + family + " " + size + " " + x + " " + y + " " + text
					}
					break
				default:
					if (reverse) {
						data = "TR " + family + " " + size + " " + x + " " + y + " " + text
					} else {
						data = "TEXT " + family + " " + size + " " + x + " " + y + " " + text

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

			let data = "BOX " + x_start + " " + y_start + " " + x_end + " " + y_end + " " + thickness
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
			if (x_start > 575)
				x_start = 575
			if (x_end > 575)
				x_end = 575

			if (fullline)
				data = "LINE " + x_start + " " + y_start + " " + x_end + " " + y_end + " " + lineWidth
			else
				data = "LPLINE " + x_start + " " + y_start + " " + x_end + " " + y_end + " " + lineWidth
			jpPrinter.addStrToCommand(data)
		};
		/*一维条码
		  params:
			start_x:number 一维码起始横坐标
			start_y:number 一维码起始纵坐标
			content:number  内容
			codetype:number 条码类型：
				  0：CODE39；    1：CODE128；
				  2：CODE93；    3：CODEBAR；
				  4：EAN8；      5：EAN13；
				  6：UPCA;       7:UPC-E;
				  8:ITF
			portrait:bool 是否横向 true:横向；false:竖向
			Linewidth:number 条码线宽度
			Height::number 条码高度
		*/
		jpPrinter.add1DBarcode = function(x, y, content, codetype, portrait, linewidth, height) { //打印条形码 
			let radio = 2
			let barCode = portrait ? "BARCODE" : "VBARCODE"
			data = barCode + (linewidth - 1) + " " + radio + " " + height + " " + x + " " + y + " " + content
			jpPrinter.addStrToCommand(data)
		};

		/*二维条码
		  params:
		    start_x:number 二维码起始横坐标
		    start_y:number 二维码起始纵坐标
		    text:String    内容
		    portrait:bool 是否横向 true:横向；false:竖向
		    ver:number 宽度，范围(2～6)
		    lel::number 大小，范围0～20
		*/
		function addQR(start_x, start_y, text, portrait, ver, lel) {
			data = "SETQRVER " + ver;
			jpPrinter.addStrToCommand(data)
			let barCode = portrait ? "BARCODE QR " : "VBARCODE QR "
			data = barCode + start_x + " " + start_y + " M 2 " + "U " + lel + "\r\nMA," + text + "\r\nENDQR";
			jpPrinter.addStrToCommand(data)
		}

		jpPrinter.addForm = function() {
			data = "FORM\r\n";
			jpPrinter.addStrToCommand(str);
		}

		jpPrinter.addPagePrint = function() { //打印页面
			data = "PRINT\r\n"
			jpPrinter.addStrToCommand(data)
		};
		jpPrinter.addPageRevervsePrint = function() { //打印页面
			data = "POPRINT\r\n"
			jpPrinter.addStrToCommand(data)
		};



		//获取打印数据
		jpPrinter.getData = function() {
			console.log(command);
			return command;
		};

		return jpPrinter;
	}

}

module.exports.jpPrinter = jpPrinter;
