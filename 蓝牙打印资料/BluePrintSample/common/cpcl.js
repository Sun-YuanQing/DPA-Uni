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
			data = "GAP-SENSE\r\n";
			jpPrinter.addStrToCommand(data)
		};

		jpPrinter.addSize = function(pageWidth, pageHeight) { //设置页面大小
			data = "! 0 200 200 " + pageHeight + " " + "1\r\n";
			jpPrinter.addStrToCommand(data)

			data = "PAGE-WIDTH " + pageWidth + "\r\n";
			jpPrinter.addStrToCommand(data)
		};

		jpPrinter.addSpeed = function(printSpeed) { //设置打印机速度
			data = "SPEED " + printSpeed.toString() + "\r\n";
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
		jpPrinter.addHome = function() {
			data = "FORM\r\n";
			jpPrinter.addStrToCommand(data);
		}

		jpPrinter.addText = function(x, y, text, fontSize, rotate, bold, reverse, underline) { //打印文字
			if (underline){
				data = "UNDERLINE ON" + '\r\n';
				jpPrinter.addStrToCommand(data)
			}
			// else
			// 	data = "UNDERLINE OFF" + '\r\n';

			if (bold != _currentBold) {
				data = "SETBOLD " + bold + '\r\n';
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
			data = barCode + " " + codetype + " " + (linewidth - 1) + " " + radio + " " + height + " " + x + " " + y + " " + content + '\r\n'
			jpPrinter.addStrToCommand(data)
			if (readable) {  
				if (portrait){
					jpPrinter.addText(x, y + height + 5, content, 2, 0, 0, false, false)
				}else{
					jpPrinter.addText(x+ height + 5, y , content, 2, 1, 0, false, false)
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
		jpPrinter.addQR = function(x, y, content, width) {
			// data = "SETQRVER " + ver + '\r\n';
			// jpPrinter.addStrToCommand(data)

			// let barCode = portrait ? "BARCODE QR " : "VBARCODE QR "
			data = "BARCODE QR " + x + " " + y + " M 2 " + "U " + width + "\r\nMA," + content + "\r\nENDQR\r\n";
			jpPrinter.addStrToCommand(data)
		}

		jpPrinter.addUserCommand = function(command) { //添加自定义命令
			jpPrinter.addStrToCommand(command);
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
