<template>
	<view>
		<view style='display: flex;flex-direction: row;'>
			<canvas canvas-id='edit_area_canvas' v-bind:style="{ width: canvasWidth + 'px', height: canvasHeight + 'px', border:'1px solid #ccc' }"></canvas>
		</view>
		<button class="btn" type='primary' @tap='labelTest'>标签测试</button>
		<button class="btn" type='primary' @tap='labelTestV1'>标签测试1</button>
		<button class="btn" type='primary' @tap='receiptTest'>票据测试</button>
		<button class="btn" type='primary' @tap='labelTest1'>Repx测试</button>
		<button class="btn" type='primary' @tap='labelTest2'>QiRui测试</button>
		<button class="btn" type='primary' @tap='labelTest3'>POSTET测试</button>



		<picker style='margin:20px' mode='selector' :range='buffSize' :value='buffIndex' @change='buffBindChange'>当前每次发送字节数为(点击可更换)：{{buffSize[buffIndex]}}(最多
			30字节/每次)</picker>

		<picker style='margin:20px' mode='selector' :range='printNum' :value='printNumIndex' @change='printNumBindChange'>当前打印份数(点击可更换)：{{printNum[printNumIndex]}}</picker>
	</view>
</template>

<script>
	import tsc from '../../common/tsc.js';
	import esc from '../../common/esc.js';
	import cpcl from '../../common/printCmd/cpcl.js';
	import cpcl1 from '../../common/printCmd/cpcl1.js';
	import tsc1 from '../../common/printCmd/tsc1.js';
	import encode from '../../common/encoding.js';
	import util from '../../common/util.js';

	let app = null;
	let jxXmlObj = null; //解析后的xml对象
	export default {
		data() {
			return {
				base64Prefix: 'data:image/png;base64,',
				sendContent: "",
				looptime: 0,
				currentTime: 1,
				lastData: 0,
				oneTimeData: 0,
				returnResult: "",
				canvasWidth: 80,
				canvasHeight: 80,
				buffSize: [20],
				buffIndex: 0,
				printNum: [1],
				printNumIndex: 0,
				printerNum: 1,
				currentPrint: 1,
				isReceiptSend: false,
				isLabelSend: false,
				dataSource: [{
					"partNo": "U7512010",
					"partItemNo": "U7512010",
					"partName": "U7512010                      ",
					"SerialNo": "",
					"TagFlag": "",
					"BoxTagId": "",
					"purLot": "51997800-001",
					"PoMoSoLot": "51997800-001",
					"sheetQty": 20000,
					"tagId": "190613HH5747954-001",
					"LinkBoardQty": "",
					"inLot": "Yyyy",
					"proDate": "2019-06-13",
					"citemNo": "DTN001RMB   ",
					"custNo": "DTN001RMB   ",
					"OrdLot": "",
					"CustTagId": "",
					"ProItemNo": "",
					"ProName": "",
					"ToProItemNo": "",
					"ToProName": "",
					"DayId": "",
					"SpcSta": "",
					"PrintType": "",
					"DeviceNo": "",
					"DeviceName": ""
				}],
				xmlContent: "<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n<XtraReportsLayoutSerializer SerializerVersion=\"17.1.4.0\" Ref=\"1\" ControlType=\"Mes.UI.XtraReportEx, Mes.UI, Version=1.0.57.0, Culture=neutral, PublicKeyToken=null\" Name=\"产成品条码\" DisplayName=\"产成品条码\" SnapGridSize=\"9.84252\" Margins=\"0, 0, 0, 0\" PaperKind=\"Custom\" PageWidth=\"197\" PageHeight=\"118\" Version=\"17.1\" DataSource=\"#Ref-0\">\r\n  <CalculatedFields>\r\n    <Item1 Ref=\"2\" Name=\"calculatedField1\" DisplayName=\"QRCode\" Expression=\"'(S)'+[PoMoSoLot] + '||(O)'+[OrdLot] + '||(P)' +[PartItemNo] + '||(Q)' +[SheetQty]+ '||(D)'+[ProDate] + '||(R)'+[InLot]+ '||(C)'+[CitemNo] + '||(I)'+[TagId]+'||(G)'+[ProItemNo]+'||(M)'+[DeviceNo]\" />\r\n  </CalculatedFields>\r\n  <Bands>\r\n    <Item1 Ref=\"3\" ControlType=\"DetailBand\" Name=\"Detail\" HeightF=\"118\" TextAlignment=\"TopLeft\" Padding=\"0,0,0,0,100\">\r\n      <MultiColumn Ref=\"4\" ColumnWidth=\"196.8504\" Mode=\"UseColumnCount\" />\r\n      <Controls>\r\n        <Item1 Ref=\"5\" ControlType=\"XRLabel\" Name=\"xrLabel13\" AutoWidth=\"true\" CanGrow=\"false\" Text=\"[库位]\" TextAlignment=\"MiddleLeft\" SizeF=\"23.73024,15.72403\" LocationFloat=\"61.24031, 92.08412\" Font=\"微软雅黑, 6pt, style=Bold\" Padding=\"0,0,0,0,100\">\r\n          <StylePriority Ref=\"6\" UseFont=\"false\" UsePadding=\"false\" UseTextAlignment=\"false\" />\r\n        </Item1>\r\n        <Item2 Ref=\"7\" ControlType=\"XRLabel\" Name=\"xrLabel12\" AutoWidth=\"true\" CanGrow=\"false\" Text=\"[Q]\" TextAlignment=\"MiddleLeft\" SizeF=\"13.77953,15.72402\" LocationFloat=\"61.24031, 75.16538\" Font=\"微软雅黑, 6pt, style=Bold\" Padding=\"0,0,0,0,100\">\r\n          <StylePriority Ref=\"8\" UseFont=\"false\" UsePadding=\"false\" UseTextAlignment=\"false\" />\r\n        </Item2>\r\n        <Item3 Ref=\"9\" ControlType=\"XRLabel\" Name=\"xrLabel11\" AutoWidth=\"true\" CanGrow=\"false\" Text=\"[D]\" TextAlignment=\"MiddleLeft\" SizeF=\"13.77953,15.72403\" LocationFloat=\"62.13546, 57.84249\" Font=\"微软雅黑, 6pt, style=Bold\" Padding=\"0,0,0,0,100\">\r\n          <StylePriority Ref=\"10\" UseFont=\"false\" UsePadding=\"false\" UseTextAlignment=\"false\" />\r\n        </Item3>\r\n        <Item4 Ref=\"11\" ControlType=\"XRLabel\" Name=\"xrLabel10\" AutoWidth=\"true\" CanGrow=\"false\" Text=\"[R]\" TextAlignment=\"MiddleLeft\" SizeF=\"13.77953,15.72403\" LocationFloat=\"62.13546, 40.51964\" Font=\"微软雅黑, 6pt, style=Bold\" Padding=\"0,0,0,0,100\">\r\n          <StylePriority Ref=\"12\" UseFont=\"false\" UsePadding=\"false\" UseTextAlignment=\"false\" />\r\n        </Item4>\r\n        <Item5 Ref=\"13\" ControlType=\"XRLabel\" Name=\"xrLabel9\" AutoWidth=\"true\" CanGrow=\"false\" Text=\"[S]\" TextAlignment=\"MiddleLeft\" SizeF=\"13.77953,15.72403\" LocationFloat=\"62.13545, 23.19683\" Font=\"微软雅黑, 6pt, style=Bold\" Padding=\"0,0,0,0,100\">\r\n          <StylePriority Ref=\"14\" UseFont=\"false\" UsePadding=\"false\" UseTextAlignment=\"false\" />\r\n        </Item5>\r\n        <Item6 Ref=\"15\" ControlType=\"XRLabel\" Name=\"xrLabel8\" AutoWidth=\"true\" CanGrow=\"false\" Text=\"[P]\" TextAlignment=\"MiddleLeft\" SizeF=\"13.77953,15.72402\" LocationFloat=\"62.13545, 5.874005\" Font=\"微软雅黑, 6pt, style=Bold\" Padding=\"0,0,0,0,100\">\r\n          <StylePriority Ref=\"16\" UseFont=\"false\" UsePadding=\"false\" UseTextAlignment=\"false\" />\r\n        </Item6>\r\n        <Item7 Ref=\"17\" ControlType=\"XRLabel\" Name=\"xrLabel7\" CanGrow=\"false\" TextAlignment=\"MiddleLeft\" WordWrap=\"false\" SizeF=\"86.5519,15.72406\" LocationFloat=\"85.21056, 92.08412\" Font=\"微软雅黑, 6pt, style=Bold\" Padding=\"2,0,0,0,100\">\r\n          <DataBindings>\r\n            <Item1 Ref=\"18\" PropertyName=\"Text\" DataMember=\"Reservelocus\" />\r\n          </DataBindings>\r\n          <StylePriority Ref=\"19\" UseFont=\"false\" UsePadding=\"false\" UseTextAlignment=\"false\" />\r\n        </Item7>\r\n        <Item8 Ref=\"20\" ControlType=\"XRLabel\" Name=\"xrLabel6\" CanGrow=\"false\" TextAlignment=\"MiddleLeft\" SizeF=\"115.8797,15.72406\" LocationFloat=\"75.25983, 75.16536\" Font=\"微软雅黑, 6pt, style=Bold\" Padding=\"2,0,0,0,100\">\r\n          <DataBindings>\r\n            <Item1 Ref=\"21\" FormatString=\"{0:#,#0.#######}\" PropertyName=\"Text\" DataMember=\"SheetQty\" />\r\n          </DataBindings>\r\n          <StylePriority Ref=\"22\" UseFont=\"false\" UsePadding=\"false\" UseTextAlignment=\"false\" />\r\n        </Item8>\r\n        <Item9 Ref=\"23\" ControlType=\"XRLabel\" Name=\"xrLabel2\" CanGrow=\"false\" TextAlignment=\"MiddleLeft\" SizeF=\"115.8797,15.72401\" LocationFloat=\"75.25983, 40.51964\" Font=\"微软雅黑, 6pt, style=Bold\" Padding=\"2,0,0,0,100\">\r\n          <DataBindings>\r\n            <Item1 Ref=\"24\" PropertyName=\"Text\" DataMember=\"InLot\" />\r\n          </DataBindings>\r\n          <StylePriority Ref=\"25\" UseFont=\"false\" UsePadding=\"false\" UseTextAlignment=\"false\" />\r\n        </Item9>\r\n        <Item10 Ref=\"26\" ControlType=\"XRLabel\" Name=\"xrLabel4\" CanGrow=\"false\" TextAlignment=\"MiddleLeft\" SizeF=\"115.8797,15.72402\" LocationFloat=\"75.25983, 23.19684\" Font=\"微软雅黑, 6pt, style=Bold\" Padding=\"2,0,0,0,100\">\r\n          <DataBindings>\r\n            <Item1 Ref=\"27\" PropertyName=\"Text\" DataMember=\"PoMoSoLot\" />\r\n          </DataBindings>\r\n          <StylePriority Ref=\"17\" UseFont=\"false\" UsePadding=\"false\" UseTextAlignment=\"false\" />\r\n        </Item10>\r\n        <Item11 Ref=\"29\" ControlType=\"XRLabel\" Name=\"xrLabel3\" CanGrow=\"false\" TextAlignment=\"MiddleLeft\" SizeF=\"115.8797,15.72405\" LocationFloat=\"75.25983, 57.84224\" Font=\"微软雅黑, 6pt, style=Bold\" Padding=\"2,0,0,0,100\">\r\n          <DataBindings>\r\n            <Item1 Ref=\"30\" FormatString=\"{0:yyMMdd}\" PropertyName=\"Text\" DataMember=\"ProDate\" />\r\n          </DataBindings>\r\n          <StylePriority Ref=\"31\" UseFont=\"false\" UsePadding=\"false\" UseTextAlignment=\"false\" />\r\n        </Item11>\r\n        <Item12 Ref=\"32\" ControlType=\"XRLabel\" Name=\"xrLabel1\" AutoWidth=\"true\" CanGrow=\"false\" TextAlignment=\"MiddleLeft\" SizeF=\"115.8797,15.72402\" LocationFloat=\"75.25983, 5.874002\" Font=\"微软雅黑, 6pt, style=Bold\" Padding=\"2,0,0,0,100\">\r\n          <DataBindings>\r\n            <Item1 Ref=\"33\" PropertyName=\"Text\" DataMember=\"PartItemNo\" />\r\n          </DataBindings>\r\n          <StylePriority Ref=\"34\" UseFont=\"false\" UsePadding=\"false\" UseTextAlignment=\"false\" />\r\n        </Item12>\r\n        <Item13 Ref=\"35\" ControlType=\"XRBarCode\" Name=\"xrBarCode2\" Module=\"3\" AutoModule=\"true\" Alignment=\"BottomLeft\" ShowText=\"false\" SizeF=\"51.1811,51.18111\" LocationFloat=\"6.511791, 57.05516\" BackColor=\"White\" Padding=\"0,0,0,0,100\" Borders=\"None\">\r\n          <Symbology Ref=\"36\" Name=\"QRCode\" CompactionMode=\"Byte\" />\r\n          <DataBindings>\r\n            <Item1 Ref=\"37\" PropertyName=\"Text\" DataMember=\"calculatedField1\" />\r\n          </DataBindings>\r\n          <StylePriority Ref=\"38\" UseBackColor=\"false\" UsePadding=\"false\" UseBorders=\"false\" />\r\n        </Item13>\r\n        <Item14 Ref=\"39\" ControlType=\"XRPictureBox\" Name=\"pictureBox1\" Image=\"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\" Sizing=\"Squeeze\" ImageAlignment=\"MiddleCenter\" AnchorVertical=\"Both\" SizeF=\"51.1811,30.31496\" LocationFloat=\"6.511791, 5.874004\" />\r\n        <Item15 Ref=\"40\" ControlType=\"XRLabel\" Name=\"xrLabel5\" CanGrow=\"false\" Text=\"C\" AnchorVertical=\"Both\" AnchorHorizontal=\"Right\" TextAlignment=\"BottomRight\" WordWrap=\"false\" SizeF=\"13.5865,15.72405\" LocationFloat=\"177.5531, 94.08413\" Font=\"Times New Roman, 9pt, style=Bold\" Padding=\"0,0,0,0,100\">\r\n          <StylePriority Ref=\"41\" UseFont=\"false\" UsePadding=\"false\" UseTextAlignment=\"false\" />\r\n        </Item15>\r\n      </Controls>\r\n    </Item1>\r\n    <Item2 Ref=\"42\" ControlType=\"TopMarginBand\" Name=\"TopMargin\" HeightF=\"0\" TextAlignment=\"TopLeft\" Padding=\"0,0,0,0,100\" />\r\n    <Item3 Ref=\"43\" ControlType=\"BottomMarginBand\" Name=\"BottomMargin\" HeightF=\"0\" TextAlignment=\"TopLeft\" Padding=\"0,0,0,0,100\" />\r\n  </Bands>\r\n  <ReportPrintOptions Ref=\"44\" DetailCountOnEmptyDataSource=\"0\" />\r\n  <ComponentStorage>\r\n    <Item1 Ref=\"0\" ObjectType=\"DevExpress.DataAccess.ObjectBinding.ObjectDataSource,DevExpress.DataAccess.v17.1\" Name=\"objectDataSource1\" Base64=\"PE9iamVjdERhdGFTb3VyY2U+PE5hbWU+b2JqZWN0RGF0YVNvdXJjZTE8L05hbWU+PERhdGFTb3VyY2UgVHlwZT0iTWVzLk1vZGVsLkJhcmNvZGVDb250cmFzdCwgTWVzLk1vZGVsLCBWZXJzaW9uPTEuMC4wLjAsIEN1bHR1cmU9bmV1dHJhbCwgUHVibGljS2V5VG9rZW49bnVsbCIgLz24L09iamVjdERhdGFTb3VyY2U+\" />\r\n  </ComponentStorage>\r\n</XtraReportsLayoutSerializer>" //标签格式

			}
		},
		onLoad() {
			this.app = uni.getStorageSync('bleInfo');
			var that = this;
			uni.notifyBLECharacteristicValueChange({
				deviceId: that.app.BLEInformation.deviceId,
				serviceId: that.app.BLEInformation.notifyServiceId,
				characteristicId: that.app.BLEInformation.notifyCharaterId,
				state: true,
				success: function(res) {
					console.log(that.app.BLEInformation);
					uni.onBLECharacteristicValueChange(function(r) {
						console.log(`characteristic ${r.characteristicId} has changed, now is ${r}`)
					})
				},
				fail: function(e) {
					console.log(e)
				},
				complete: function(e) {
					console.log(e)
				}
			})
		},
		/**
		 * 生命周期函数--监听页面初次渲染完成
		 */
		onReady: function() {
			var list = []
			var numList = []
			var j = 0
			for (var i = 20; i <= 200; i += 10) {
				list[j] = i;
				j++
			}
			for (var i = 1; i < 10; i++) {
				numList[i - 1] = i
			}
			this.buffSize = list;
			this.oneTimeData = list[0];
			this.printNum = numList;
			this.printerNum = numList[0];

			this.jxXmlObj = this.jxXml();
		},

		/**
		 * 生命周期函数--监听页面显示
		 */
		onShow: function() {
			var that = this
			var width = that.canvasWidth
			var height = that.canvasHeight
			const ctx = uni.createCanvasContext("edit_area_canvas", this);
			if (this.app.BLEInformation.platform == "android") {
				ctx.translate(17, 17)
				ctx.rotate(180 * Math.PI / 180)
			}
			ctx.drawImage("/static/ic_action_arrow_left_top.png", 0, 0, 17, 17);
			ctx.draw();

			// var bitmap = new plus.nativeObj.Bitmap("syt");
			// bitmap.loadBase64Data(this.img,
			// 	function(e) {
			// 		console.log("加载Base64图片数据成功");
			// 		var savedFilePath = "_doc/uniapp_temp/canvas/" + new Date().getTime() + ".png";
			// 		var path = plus.io.convertLocalFileSystemURL(savedFilePath);
			// 		bitmap.save(path, {}, function() {
			// 			ctx.drawImage(savedFilePath, 0, 0, width, height);
			// 			ctx.draw(true);
			// 		}, function() {});
			// 	},
			// 	function(e) {
			// 		console.log('加载Base64图片数据失败：' + JSON.stringify(e));
			// 	}
			// );
		},
		/**
		 * 生命周期函数--监听页面卸载
		 */
		onUnload: function() {
			uni.closeBLEConnection({
				deviceId: this.app.BLEInformation.deviceId,
				success: function(res) {
					console.log("关闭蓝牙成功")
				},
			})
		},
		methods: {
			sendData: function() { //输入框点击发送
				var data = this.sendContent + "\n"
				this.looptime = 0;
				var content = new encode.TextEncoder(
					'gb18030', {
						NONSTANDARD_allowLegacyEncoding: true
					}).encode(data);

				this.prepareSend(content)
			},

			labelTest: function() { //标签测试
				var that = this;
				var canvasWidth = that.canvasWidth
				var canvasHeight = that.canvasHeight
				var command = tsc.jpPrinter.createNew()
				command.setSize(50, 30)
				command.setGap(3) //该指令用于定义两张卷标纸间的垂直间距距离
				/* 开启带Response的打印，用于连续打印 */
				command.setQueryPrinterStatus('ON');
				/* 设置原点坐标 */
				command.setReference(0, 0);
				/* 撕纸模式开启 */
				command.setTear('ON');
				/* 清除打印缓冲区 */
				command.setCls();
				command.setText(0, 10, "TSS24.BF2", 1, 1, "图片")
				command.setQR(5, 80, "L", 5, "A", "www.smarnet.cc佳博智汇")
				command.setText(150, 10, "TSS24.BF2", 1, 1, "小程序测试")
				command.setText(0, 50, "TSS24.BF2", 1, 1, "佳博智汇-中")
				command.setText(150, 50, "TSS24.BF2", 1, 1, "测试数字12345678")
				command.setText(150, 80, "TSS24.BF2", 1, 1, "测试英文abcdefg")
				command.setText(150, 110, "TSS24.BF2", 1, 1, "测试符号/*-+!@#$")
				command.setBarcode(145, 140, "128", 40, 1, 2, 2, "1234567")

				// uni.canvasGetImageData({
				// 	canvasId: 'edit_area_canvas',
				// 	x: 0,
				// 	y: 0,
				// 	width: 23, //17 * 2,
				// 	height: 23, //17 * 2,
				// 	success: function(res) {
				// 		// command.setBitmap(13, 11, 0, res) 
				// 		command.setBitmap(0, 0, 0, res)
				// 		// console.log({data: res});
				// 	},
				// 	complete: function() {
				// 		command.setPagePrint()
				// 		that.isLabelSend = true;
				// 		that.prepareSend(command.getData())
				// 	}
				// })

				command.setPagePrint()
				that.isLabelSend = true;
				that.prepareSend(command.getData())
			},
			labelTestV1() {
				var that = this;
				var command = tsc1.jpPrinter.createNew()
				command.addSize(50, 30)
				command.addGap(3) //该指令用于定义两张卷标纸间的垂直间距距离
				/* 开启带Response的打印，用于连续打印 */
				command.addQueryPrinterStatus('ON');
				/* 设置原点坐标 */
				command.addReference(0, 0);
				/* 撕纸模式开启 */
				command.addTear('ON');
				/* 清除打印缓冲区 */
				command.addCls();
				command.addText(0, 10, "TSS24.BF2", 1, 1, "图片")
				command.addQR(5, 80, "L", 5, "A", "www.smarnet.cc佳博智汇")
				command.addText(150, 10, "TSS24.BF2", 1, 1, "小程序测试")
				command.addText(0, 50, "TSS24.BF2", 1, 1, "佳博智汇-中")
				command.addText(150, 50, "TSS24.BF2", 1, 1, "测试数字12345678")
				command.addText(150, 80, "TSS24.BF2", 1, 1, "测试英文abcdefg")
				command.addText(150, 110, "TSS24.BF2", 1, 1, "测试符号/*-+!@#$")
				command.add1DBarcode(145, 140, "128", 40, 1, 2, 2, "1234567")
				command.addPagePrint()
				var buf = command.getData()
				// uni.showLoading({
				// 	title: '数据传输中',
				// })
				this.writeBLEValue(buf);
				//that.prepareSend(buf)
			},

			receiptTest: function() { //票据测试
				var that = this;
				var canvasWidth = that.canvasWidth
				var canvasHeight = that.canvasHeight
				var command = esc.jpPrinter.createNew()
				command.init()
				command.setText("票据测试!");
				command.setPrint()
				command.setText("This is a receipt test!!!")
				command.setPrint()
				command.setText("二维码测试:")
				command.setPrint()
				command.setSelectSizeOfModuleForQRCode(5)
				command.setSelectErrorCorrectionLevelForQRCode(49)
				command.setStoreQRCodeData("佳博智汇网络")
				command.setPrintQRCode()
				command.setPrint()
				command.setSelectJustification(0)
				command.setText("向左对齐")
				command.setPrint()
				command.setSelectJustification(1)
				command.setText("居中对齐")
				command.setPrint()
				command.setSelectJustification(2)
				command.setText("向右对齐")
				command.setPrint()
				command.setSelectJustification(0)
				command.setText("图片测试")
				command.setPrint()
				uni.canvasGetImageData({
					canvasId: 'edit_area_canvas',
					x: 0,
					y: 0,
					width: canvasWidth,
					height: canvasHeight,
					success: function(res) {
						command.setBitmap(res)
					},
					complete: function(res) {
						console.log("finish")
						command.setPrint()
						that.isReceiptSend = true;
						that.prepareSend(command.getData())
					}
				})

				// this.send(buff)
			},

			prepareSend: function(buff) { //准备发送，根据每次发送字节数来处理分包数量
				// console.log(buff)
				var that = this
				var time = that.oneTimeData
				var looptime = parseInt(buff.length / time);
				var lastData = parseInt(buff.length % time);
				// console.log(looptime + "---" + lastData)
				this.looptime = looptime + 1;
				this.lastData = lastData;
				this.currentTime = 1;
				that.Send(buff)
			},

			queryStatus: function() { //查询打印机状态
				var command = esc.jpPrinter.Query();
				command.getRealtimeStatusTransmission(1);
			},

			Send: function(buff) { //分包发送
				var that = this
				var currentTime = that.currentTime
				var loopTime = that.looptime
				var lastData = that.lastData
				var onTimeData = that.oneTimeData
				var printNum = that.printerNum
				var currentPrint = that.currentPrint
				var buf
				var dataView
				if (currentTime < loopTime) {
					buf = new ArrayBuffer(onTimeData)
					dataView = new DataView(buf)
					for (var i = 0; i < onTimeData; ++i) {
						dataView.setUint8(i, buff[(currentTime - 1) * onTimeData + i])
					}
				} else {
					buf = new ArrayBuffer(lastData)
					dataView = new DataView(buf)
					for (var i = 0; i < lastData; ++i) {
						dataView.setUint8(i, buff[(currentTime - 1) * onTimeData + i])
					}
				}
				// console.log("第" + currentTime + "次发送数据大小为：" + buf.byteLength)
				uni.writeBLECharacteristicValue({
					deviceId: that.app.BLEInformation.deviceId,
					serviceId: that.app.BLEInformation.writeServiceId,
					characteristicId: that.app.BLEInformation.writeCharaterId,
					value: buf,
					success: function(res) {
						// console.log(res)
					},
					fail: function(e) {
						console.log(e)
					},
					complete: function() {
						currentTime++
						if (currentTime <= loopTime) {
							that.currentTime = currentTime;
							// setTimeout(function() {that.Send(buff)}, 250);
							that.Send(buff)
						} else {
							uni.showToast({
								title: '已打印第' + currentPrint + '张',
							})
							if (currentPrint == printNum) {
								that.looptime = 0;
								that.lastData = 0;
								that.currentTime = 1;
								that.isReceiptSend = false;
								that.isLabelSend = false;
								that.currentPrint = 1;
							} else {
								currentPrint++
								that.currentPrint = currentPrint;
								that.currentTime = 1;
								that.Send(buff)
							}
						}
					}
				})

			},
			buffBindChange: function(res) { //更改打印字节数
				var index = res.detail.value
				var time = this.buffSize[index]
				this.buffIndex = index;
				this.oneTimeData = time;
			},
			printNumBindChange: function(res) { //更改打印份数
				var index = res.detail.value
				var num = this.printNum[index]
				this.printNumIndex = index;
				this.printerNum = num;
			},
			labelTest3() {
				let that = this;
				var command = tsc.jpPrinter.createNew()
				var cmd = 'N\n\r'
				cmd += 'q250\n\r'
				cmd += 'T20, 30, 0, 2, 1, 1, N,"q command:"\n\r'
				cmd += "W1\n\r";
				command.addCommand(cmd);
				var buf = command.getData()
				that.prepareSend(buf)
			},
			labelTest2() {
				//QiRui 面单打印机
				// var cmd = '! 0 200 200 400 1 \n\r'
				// cmd += 'B 128 1 2 48 320 118 608186431866 \n\r'
				// cmd += 'TEXT 55 3 24 68 地址 \n\r'
				// cmd += "FORM \n\r";
				// cmd += "PRINT\n\r";
				// var buf = command.addStrToCommand(cmd);
				// uni.writeBLECharacteristicValue({
				// 	deviceId: that.app.BLEInformation.deviceId,
				// 	serviceId: that.app.BLEInformation.writeServiceId,
				// 	characteristicId: that.app.BLEInformation.writeCharaterId,
				// 	value: buf,
				// 	success: function(res) {
				// 		console.log("打印成功")
				// 		console.log(res)
				// 		uni.hideLoading()
				// 	},
				// 	fail: function(e) {
				// 
				// 		console.log(e)
				// 		uni.hideLoading()
				// 		uni.showToast({
				// 			title: "传输数据失败",
				// 			image: "src/icon_fail.png"
				// 		})
				// 	}
				// })
				var that = this;
				var command = cpcl1.jpPrinter.createNew()
				command.addSize(640, 400)
				command.addQR(100, 20, "12345678910", 1, true, 6, 10)
				command.addText(100, 250, '2-1', 1, 0, 1, false, false)
				command.addText(100, 311, '2-1', 1, 0, 1, false, false)
				command.addText(100, 312, '2-1', 1, 0, 1, false, false)
				command.addText(200, 323, '2-1', 1, 0, 1, false, false)
				command.addText(200, 324, '2-1', 1, 0, 1, false, false)
				command.addText(200, 325, '2-1', 1, 0, 1, false, false)
				command.addText(200, 336, '2-1', 1, 0, 1, false, false)
				command.addText(310, 337, '2-1', 1, 0, 1, false, false)
				command.addText(310, 338, '2-1', 1, 0, 1, false, false)
				command.addText(310, 349, '2-1', 1, 0, 1, false, false)
				command.addText(310, 240, '2-1', 1, 0, 1, false, false)
				command.addText(330, 220, '2-1', 1, 0, 1, false, false)
				command.addText(330, 230, '2-1', 1, 0, 1, false, false)
				command.addText(330, 240, '2-1', 1, 0, 1, false, false)
				command.addPagePrint()
				var arrayBuffer = command.getData()
				that.writeBLEValue(arrayBuffer)
				// this.writeBLEValue1(arrayBuffer); 
				//that.prepareSend(arrayBuffer)
			},
			writeBLEValue(arrayBuffer) {
				var that = this;
				if (!that.app.BLEInformation.deviceId || !that.app.BLEInformation.writeCharaterId) {
					uni.hideLoading()
					uni.showToast({
						title: "传输数据失败",
						image: "src/icon_fail.png"
					})

					return
				}
				var maxBit = that.oneTimeData;
				let count = arrayBuffer.byteLength
				console.log('arrayBuffer.byteLength:' + arrayBuffer.byteLength)
				if (count > maxBit) {
					console.log(1)
					let leftArrayBuffer = arrayBuffer.slice(maxBit)
					try {
						uni.writeBLECharacteristicValue({
							deviceId: that.app.BLEInformation.deviceId,
							serviceId: that.app.BLEInformation.writeServiceId,
							characteristicId: that.app.BLEInformation.writeCharaterId,
							value: arrayBuffer.slice(0, maxBit),
							success: function(res) {
								console.log("分部传输中")
								console.log('leftArrayBuffer.length:' + leftArrayBuffer.byteLength)
								// 针对 QiRui 需要间隔40毫秒？？？
								// setTimeout(function() {
								// 	that.writeBLEValue(leftArrayBuffer)
								// }, 50); 
								that.writeBLEValue(leftArrayBuffer)

							},
							fail: function(e) {

								console.log(e)
								uni.hideLoading()
								uni.showToast({
									title: "传输数据失败"
								})
							}
						})
					} catch (err) {

						uni.showToast({
							title: "传输数据失败",
							image: "src/icon_fail.png"
						})
					}

				} else {
					console.log(2)
					try {
						// console.log("最后一部分")
						uni.writeBLECharacteristicValue({
							deviceId: that.app.BLEInformation.deviceId,
							serviceId: that.app.BLEInformation.writeServiceId,
							characteristicId: that.app.BLEInformation.writeCharaterId,
							value: arrayBuffer,
							success: function(res) {
								console.log("打印成功")
								console.log(res)
								uni.hideLoading()
							},
							fail: function(e) {

								console.log(e)
								uni.hideLoading()
								uni.showToast({
									title: "传输数据失败",
									image: "src/icon_fail.png"
								})
							}
						})
					} catch (err) {

						uni.showToast({
							title: "传输数据失败",
							image: "src/icon_fail.png"
						})
					}
				}
			},
			writeBLEValue1(arrayBuffer) {
				var that = this;
				if (!that.app.BLEInformation.deviceId || !that.app.BLEInformation.writeCharaterId) {
					uni.hideLoading()
					uni.showToast({
						title: "传输数据失败",
						image: "src/icon_fail.png"
					})

					return
				}
				var maxBit = that.oneTimeData;
				let count = arrayBuffer.byteLength
				console.log('arrayBuffer.byteLength:' + arrayBuffer.byteLength)
				if (count > maxBit) {
					console.log(1)
					let leftArrayBuffer = arrayBuffer.slice(maxBit)
					try {
						plus.bluetooth.writeBLECharacteristicValue({
							deviceId: that.app.BLEInformation.deviceId,
							serviceId: that.app.BLEInformation.writeServiceId,
							characteristicId: that.app.BLEInformation.writeCharaterId,
							value: arrayBuffer.slice(0, maxBit),
							success: function(res) {
								console.log("分部传输中")
								console.log('leftArrayBuffer.length:' + leftArrayBuffer.byteLength)
								// 针对 QiRui 需要间隔40毫秒？？？
								setTimeout(function() {
									that.writeBLEValue(leftArrayBuffer)
								}, 50);
								//that.writeBLEValue(leftArrayBuffer)

							},
							fail: function(e) {

								console.log(e)
								uni.hideLoading()
								uni.showToast({
									title: "传输数据失败"
								})
							}
						})
					} catch (err) {

						uni.showToast({
							title: "传输数据失败",
							image: "src/icon_fail.png"
						})
					}

				} else {
					console.log(2)
					try {
						// console.log("最后一部分")
						plus.bluetooth.writeBLECharacteristicValue({
							deviceId: that.app.BLEInformation.deviceId,
							serviceId: that.app.BLEInformation.writeServiceId,
							characteristicId: that.app.BLEInformation.writeCharaterId,
							value: arrayBuffer,
							success: function(res) {
								console.log("打印成功")
								console.log(res)
								uni.hideLoading()
							},
							fail: function(e) {

								console.log(e)
								uni.hideLoading()
								uni.showToast({
									title: "传输数据失败",
									image: "src/icon_fail.png"
								})
							}
						})
					} catch (err) {

						uni.showToast({
							title: "传输数据失败",
							image: "src/icon_fail.png"
						})
					}
				}
			},
			labelTest1: function() { //标签测试 			
				for (let i = 0; i < this.dataSource.length; i++) {
					this.labelTestOne(this.dataSource[i])
				}
			},
			labelTestOne(dataItem) {
				var that = this;
				var command = tsc.jpPrinter.createNew()
				let reportTag = this.jxXmlObj;
				command.setSize(reportTag.pageWidth, reportTag.pageHeight)
				command.setGap(3) //该指令用于定义两张卷标纸间的垂直间距距离
				/* 开启带Response的打印，用于连续打印 */
				command.setQueryPrinterStatus('ON');
				/* 设置原点坐标 */
				command.setReference(0, 0);
				/* 撕纸模式开启 */
				command.setTear('ON');
				/* 清除打印缓冲区 */
				command.setCls();

				for (let i = 0; i < reportTag.bandsArr.length; i++) {
					let item = reportTag.bandsArr[i];
					let value = this.getControlValue(item, dataItem);
					switch (reportTag.bandsArr[i].controlType) {
						case 'XRLabel':
							//TODO:对齐问题：？？
							command.setText(item.locationFloat.x, item.locationFloat.y, "TSS24.BF2", 1, 1, value)
							break;
						case 'XRBarCode':
							if (item.codeType == 'QRCode') {
								command.setQR(item.locationFloat.x, item.locationFloat.y, "L", item.module, "A", value)
							} else {
								//TODO:??? 精度问题
								command.setBarcode(item.locationFloat.x, item.locationFloat.y, item.codeType, item.sizeF.split(',')[1], 1, 3, 3,
									value)
							}
							break;
						case 'XRPictureBox':
							setTimeout(function() {
								command.setBitmap(item.locationFloat.x, item.locationFloat.y, 0, item.imageData)
							}, 3000);
							break;
						default:
							break;
					}
				}
				setTimeout(function() {
					console.log(2222222222222222222);
					command.setPagePrint()
					that.isLabelSend = true;
					that.prepareSend(command.getData())
				}, 4000);
			},

			jxXml() {
				//https://github.com/jindw/xmldom
				//https://github.com/lpreterite/xmlToJSON 

				var DOMParser = require('xmldom').DOMParser;
				var xmlDoc = new DOMParser().parseFromString(this.xmlContent, 'text/xml');
				//ReportUnit="TenthsOfAMillimeter" Margins="0, 0, 0, 0" PaperKind="Custom" PageWidth="500" PageHeight="300"
				//转换还需要知道另一个参数：DPI（每英寸多少点）				
				//象素数 / DPI = 英寸数
				//英寸数 * 25.4 = 毫米数
				//200 : DPI: 1 mm = 8 dots

				// 英寸的 dpi 默认为100
				let root = xmlDoc.documentElement;
				let dpi = root.getAttribute("Dpi") || 100;
				let reportUnit = root.getAttribute("ReportUnit");
				let pageWidth = this.convertUnit2MM(reportUnit, dpi, root.getAttribute("PageWidth"));
				let pageHeight = this.convertUnit2MM(reportUnit, dpi, root.getAttribute("PageHeight"));

				let calcArr = this.getCalculatedFields(xmlDoc);
				let bandsArr = this.getBands(xmlDoc, reportUnit, dpi);
				let rlt = {
					pageWidth: pageWidth,
					pageHeight: pageHeight,
					reportUnit: reportUnit,
					dpi: dpi,
					calcArr: calcArr,
					bandsArr: bandsArr
				};
				// console.log({
				// 	rlt: rlt
				// });
				return rlt;
			},
			/**
			 * 将内容转换为 mm 单位值
			 * @param {Object} reportUnit
			 * @param {Object} dpi
			 * @param {Object} val
			 */
			convertUnit2MM(reportUnit, dpi, val) {
				//将内容转换为 mm 单位值
				let rate = 25.4;
				switch (reportUnit) {
					case 'TenthsOfAMillimeter': //0.1毫米
						val = util.floatObj.divide(val, 10)
						break;
					case 'Pixels': //像素
						val = util.floatObj.multiply(util.floatObj.divide(val, dpi), rate);
						break;
					default:
						//HundredthsOfAnInch 1/100 英寸
						val = util.floatObj.multiply(util.floatObj.divide(val, 100), rate);
						break;
				}
				return val;
			},
			/**
			 * 将内容转换为 像素 单位值
			 * @param {Object} reportUnit
			 * @param {Object} dpi
			 * @param {Object} val
			 */
			convertUnit2PX(reportUnit, dpi, val) {
				//转换还需要知道另一个参数：DPI（每英寸多少点）				
				//象素数 / DPI = 英寸数
				//英寸数 * 25.4 = 毫米数
				//200 : DPI: 1 mm = 8 dots

				//将内容转换为 mm 单位值
				let rate = 25.4;
				switch (reportUnit) {
					case 'TenthsOfAMillimeter': //0.1毫米
						val = util.floatObj.multiply(util.floatObj.divide(util.floatObj.divide(val, 10), rate) * dpi)
						console.log(val);
						break;
					case 'Pixels': //像素 
						break;
					default:
						//HundredthsOfAnInch 1/100 英寸
						val = util.floatObj.multiply(util.floatObj.divide(val, 100), dpi);
						break;
				}
				return val;
			},
			/**
			 * @description 将 mm 转 dot
			 * @param {Object} reportUnit
			 * @param {Object} dpi
			 * @param {Object} val
			 */
			convertMM2Dot(reportUnit, dpi, val) {
				//200 : DPI: 1 mm = 8 dots
				return this.convertUnit2MM(reportUnit, dpi, val) * 8;
			},
			getCalculatedFields(xmlDoc) {
				let calcArr = [];
				let calsRoot = xmlDoc.getElementsByTagName('CalculatedFields');
				if (calsRoot.length == 0) return calcArr;
				let calsItems = calsRoot[0].childNodes;
				for (let i = 0; i < calsItems.length; i++) {
					if (calsItems[i].nodeName == '#text') continue;
					let key = calsItems[i].getAttribute("Name");
					let value = calsItems[i].getAttribute("Expression");
					calcArr.push({
						id: key,
						value: value
					})
				}
				return calcArr;
			},
			getBands(xmlDoc, reportUnit, dpi) {
				let bandsArr = [];
				let bandsRoot = xmlDoc.getElementsByTagName('Bands');
				if (bandsRoot.length == 0) return bandsArr;
				let bandsItems = bandsRoot[0].childNodes;
				for (let i = 0; i < bandsItems.length; i++) {
					if (bandsItems[i].nodeName == '#text') continue;
					for (let j = 0; j < bandsItems[i].childNodes.length; j++) {
						if (bandsItems[i].childNodes[j].nodeName == '#text') continue;
						if (bandsItems[i].childNodes[j].tagName == "Controls") {
							for (let k = 0; k < bandsItems[i].childNodes[j].childNodes.length; k++) {
								var ctl = bandsItems[i].childNodes[j].childNodes[k];
								if (ctl.nodeName == '#text') continue;
								let controlType = ctl.getAttribute("ControlType");
								// let stylePris =	ctl.getElementsByTagName("StylePriority")
								let dataBindings = null;
								if (ctl.getElementsByTagName("DataBindings").length > 0) {
									let dataBindingsItem = ctl.getElementsByTagName("DataBindings")[0].childNodes[1];
									dataBindings = {
										dataMember: dataBindingsItem.getAttribute("DataMember"),
										formatString: dataBindingsItem.getAttribute("FormatString")
									};
								}

								//左上右下
								let padding = ctl.getAttribute("Padding").split(',')
								//因为打印机字体的原因，位置会定位有差异，4：4倍的边距
								let leftMargin = padding[0] > 0 ? padding[0] * 4 : 0;
								let locationFloatArr = ctl.getAttribute("LocationFloat").split(',');
								let tmpX = util.floatObj.add(locationFloatArr[0], leftMargin);
								let locationFloat = {
									x: this.convertMM2Dot(reportUnit, dpi, tmpX),
									y: this.convertMM2Dot(reportUnit, dpi, locationFloatArr[1])
								}

								let sizeF = ctl.getAttribute("SizeF").split(',');
								sizeF[0] = this.convertMM2Dot(reportUnit, dpi, sizeF[0])
								sizeF[1] = this.convertMM2Dot(reportUnit, dpi, sizeF[1])

								switch (controlType) {
									case "XRLabel":
										let font = ctl.getAttribute("Font").split(',');
										let ctlObj = {
											controlType: controlType,
											text: ctl.getAttribute("Text"),
											dataBindings: dataBindings,
											sizeF: sizeF,
											locationFloat: locationFloat,
											font: {
												family: font[0],
												fontSize: font[1],
												style: font[2].split('=')[1]
											},
											padding: padding,
										}
										bandsArr.push(ctlObj);
										break;
									case "XRBarCode":
										let codeType = ctl.getElementsByTagName("Symbology")[0].getAttribute("Name")
										ctlObj = {
											controlType: controlType,
											module: ctl.getAttribute("Module"),
											alignment: ctl.getAttribute("Alignment"),
											showText: ctl.getAttribute("ShowText"),
											sizeF: sizeF,
											locationFloat: locationFloat,
											padding: padding,
											text: ctl.getAttribute("Text"),
											dataBindings: dataBindings,
											codeType: codeType, //条码类型
										}
										bandsArr.push(ctlObj);
										break;
									case "XRPictureBox":
										//转换成 像素单位
										let sizeFPx = ctl.getAttribute("SizeF").split(',');
										sizeFPx[0] = this.convertUnit2PX(reportUnit, dpi, sizeFPx[0])
										sizeFPx[1] = this.convertUnit2PX(reportUnit, dpi, sizeFPx[1])

										ctlObj = {
											controlType: controlType,
											image: ctl.getAttribute("Image"),
											sizing: ctl.getAttribute("Sizing"),
											imageAlignment: ctl.getAttribute("ImageAlignment"),
											anchorVertical: ctl.getAttribute("AnchorVertical"),
											sizeF: sizeF,
											sizeFPx: sizeFPx,
											locationFloat: locationFloat,
											dataBindings: dataBindings,
											imageData: null
										}
										bandsArr.push(ctlObj);
										break;
									case "XRLine":
										ctlObj = {
											controlType: controlType,
											lineWidth: ctl.getAttribute("LineWidth"),
											sizeF: sizeF,
											locationFloat: locationFloat,
										}
										bandsArr.push(ctlObj);
										break;
									default:
										break;
								}

							}
						}
					}
				}
				// console.log({
				// 	rlt: bandsArr
				// });
				return bandsArr;
			},
			getControlValue(item, dataItem) {
				//获取控件值
				let value = '';
				switch (item.controlType) {
					case 'XRLabel':
						if (item.text.length > 0) {
							value = item.text;
						} else {
							value = this.getExpressionValue(item, dataItem);
						}
						break;
					case 'XRBarCode':
						if (item.text.length > 0) {
							value = item.text;
						} else {
							//取 计算列值
							value = this.getExpressionValue(item, dataItem);
						}
						break;
					case 'XRPictureBox':
						var that = this;
						that.canvasWidth = item.sizeFPx[0]
						that.canvasHeight = item.sizeFPx[1]
						var canvasWidth = that.canvasWidth //= item.sizeFPx[0]
						var canvasHeight = that.canvasHeight //= item.sizeFPx[1]
						const ctx = uni.createCanvasContext("edit_area_canvas", this);
						let base64Img = this.base64Prefix + item.image
						var bitmap = new plus.nativeObj.Bitmap("syt");
						bitmap.loadBase64Data(base64Img,
							function(e) {
								console.log("加载Base64图片数据成功");
								var savedFilePath = "_doc/uniapp_temp/canvas/" + new Date().getTime() + ".png";
								var path = plus.io.convertLocalFileSystemURL(savedFilePath);
								bitmap.save(path, {}, function(event) {
									//得到 图片缩放 后的大小px
									var imgSize = that.autoResizeImage(that.canvasWidth, that.canvasHeight, event.width, event.height)
									console.log({
										imgSize: imgSize,
										event: event
									});

									if (that.app.BLEInformation.platform == "android") {
										ctx.translate(imgSize.width, imgSize.height)
										ctx.rotate(180 * Math.PI / 180)
									}
									//TODO:图片缩放后，会出现 打印异常
									ctx.drawImage(savedFilePath, 0, 0, imgSize.width, imgSize.height);
									ctx.draw();
									setTimeout(function() {
										uni.canvasGetImageData({
											canvasId: 'edit_area_canvas',
											x: 0,
											y: 0,
											width: imgSize.width + parseInt(imgSize.width / 2),
											height: imgSize.height + parseInt(imgSize.height / 2),
											success: function(res) {
												console.log('读取到图片数据');
												item.imageData = res;
												// console.log(item.imageData);
											},
											complete: function() {}
										})
									}, 1000);


								}, function() {});
							},
							function(e) {
								console.log('加载Base64图片数据失败：' + JSON.stringify(e));
							}
						);
						break;
					default:
						break;
				}
				return value;
			},
			/**
			 * @description  自动缩放图片
			 * @param {Object} maxWidth
			 * @param {Object} maxHeight
			 * @param {Object} w
			 * @param {Object} h
			 */
			autoResizeImage(maxWidth, maxHeight, w, h) {
				var Ratio = 1;
				var wRatio = maxWidth / w;
				var hRatio = maxHeight / h;
				if (maxWidth == 0 && maxHeight == 0) {
					Ratio = 1;
				} else if (maxWidth == 0) { //
					if (hRatio < 1) Ratio = hRatio;
				} else if (maxHeight == 0) {
					if (wRatio < 1) Ratio = wRatio;
				} else if (wRatio < 1 || hRatio < 1) {
					Ratio = (wRatio <= hRatio ? wRatio : hRatio);
				}
				if (Ratio < 1) {
					w = w * Ratio;
					h = h * Ratio;
				}
				return {
					width: parseInt(w),
					height: parseInt(h)
				}
			},
			getAlignmentOffset(alignment) {

			},
			getExpressionValue(item, dataItem) {
				//计算表达式的值
				// 判断是否在引用列中
				let calsStr = '';
				for (let i = 0; i < this.jxXmlObj.calcArr.length; i++) {
					if (this.jxXmlObj.calcArr[i].id == item.dataBindings.dataMember) {
						calsStr = this.jxXmlObj.calcArr[i].value;
						break;
					}
				}
				// console.log('calsStr:' + calsStr);
				if (calsStr.length > 0) {
					let rlt = calsStr.match(/\[\w+\]/g)
					for (let i = 0; i < rlt.length; i++) {
						var key = rlt[i].match(/(\w+)/g)[0]
						key = key.replace(key[0], key[0].toLowerCase())
						var value = dataItem[key];
						if (value == undefined) value = "";
						calsStr = calsStr.replace(rlt[i], "'" + value + "'")
					}
					return eval(calsStr);
				} else {
					var key = item.dataBindings.dataMember
					key = key.replace(key[0], key[0].toLowerCase())
					var value = dataItem[key];
					if (value == undefined) value = "";
					return value;
				}
			}
		}
	}
</script>

<style>
	/* page {
		width: 100%;
		min-height: 100%;
	} */
	.btn {
		margin-top: 50rpx;
		height: 40px;
		width: 600rpx;
		line-height: 40px;
	}

	.input {
		text-align: top;
		width: 90%;
		height: 150px;
		margin-left: 4%;
		margin-right: 4%;
		margin-top: 10px;
		margin-bottom: 12px;
		border: 1px solid slategray;
	}

	.receiver_info_scroll_view {
		width: 90%;
		height: 200px;
		margin-left: 4%;
		margin-right: 4%;
		margin-top: 10px;
		margin-bottom: 25px;
		border: 1px solid black;
	}

	.result {
		width: 90%;
		height: 150px;
		border: 1px solid black;
		margin-left: 4%;
		margin-bottom: 4%;
		margin-top: 5%
	}

	.switch {
		float: right;
		margin-right: 20px;
		margin-bottom: 16px;
	}

	text {
		color: #fff;
		display: block;
	}

	input {
		color: gainsboro;
		float: left;
	}

	.v_net_ssid {
		width: 100%;
		background: #fff;
	}

	.v_net_passw {
		width: 100%;
		background: antiquewhite;
	}

	.swiper {
		width: 100%;
		height: 100%;
	}
</style>
