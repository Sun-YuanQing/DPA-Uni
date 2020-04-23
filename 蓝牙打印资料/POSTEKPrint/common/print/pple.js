//博思得打印机 单位dot
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

		jpPrinter.addPagePrint = function() { //打印页面

			data = "N\r\n";
			jpPrinter.addStrToCommand(data)
			
			// data = "ZT\r\n";
			// jpPrinter.addStrToCommand(data)
			
			data = "q400\r\n";
			jpPrinter.addStrToCommand(data);

			data = "Q240,16\r\n";
			jpPrinter.addStrToCommand(data)


			data = "T50,56,0,5,1,1,N,\"TTTTTTTTTTTT\"\r\n"
			jpPrinter.addStrToCommand(data)  

			data = "W1,1\r\n"
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


			// return cmds;
		};

		return jpPrinter;
	}
};

module.exports.jpPrinter = jpPrinter;
