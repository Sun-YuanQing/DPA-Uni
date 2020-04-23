<!-- 标签打印 -->
<!-- 
* 事件说明：
* printComplete 打印完成后触发事件，如果要验证打印的标签则不触发
* printCancel 取消打印事件
* tagValid 打印完成后校验标签事件，返回扫描结果 数组
* 
* 方法
* userDefaultPrint 调用上次选择结果打印
* 
*  -->
<template>
	<view class="label-print-view" v-show="show">
		<view class="uni-mask" :style="{ top: offsetTop + 'px', 'z-index':1}"></view>
		<!-- 报表列表  -->
		<uni-popup :show="showReportList" position="middle" mode="fixed" @hidePopup="togglePopup('showReportList')">
			<h1 class="uni-title">请选择报表 </h1>
			<view class="uni-icon uni-icon-refresh" style="display: block; position:fixed; top: 20upx; right: 5upx; padding: 20upx;"
			 @click="refreshReport"></view>
			<scroll-view class="center-box" scroll-y="true">
				<view class="uni-list">
					<checkbox-group @change="checkboxChange" v-if="reportModel.isMultiPrint">
						<label class="uni-list-cell uni-list-cell-pd" v-for="(item,index) in reportList" :key="index">
							<view>
								<checkbox :value="item.controlName" :checked="item.checked" />
							</view>
							<view class="uni-triplex-left">{{item.reportName}}</view>
						</label>
					</checkbox-group>
					<block v-for="(item,index) in reportList" :key="index" v-else>
						<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onReportSelected(index)">
							<view class="uni-triplex-row">
								<view class="uni-triplex-left">
									<text class="uni-title">{{item.reportName}}</text>
								</view>
							</view>
						</view>
					</block>
				</view>
				<button style="display: block; float: none;" v-if="reportModel.isMultiPrint" @click="onReportSelected">下一步</button>
			</scroll-view>
		</uni-popup>

		<!-- 打印机列表 -->
		<uni-popup :show="showPrinterList" position="middle" mode="fixed" @hidePopup="togglePopup('showPrinterList')">
			<h1 class="uni-title">请选择打印机</h1>
			<view class="uni-icon uni-icon-refresh" style="display: block; position:fixed; top: 20upx; right: 5upx; padding: 20upx;"
			 @click="refreshPrinter"></view>
			<scroll-view class="center-box" scroll-y="true" style="max-height: 300px;">
				<view class="uni-list">
					<block v-for="(item,index) in printerList" :key="index">
						<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onPrinterSelected(index)">
							<view class="uni-triplex-row">
								<view class="uni-triplex-left">
									<block v-if="item.printerType == 0">
										<text class="uni-title">{{ item.PrinterName}}</text>
									</block>
									<block v-else>
										<text class="uni-title">蓝牙:{{ item.DeviceName}}</text>
										<text class="uni-title">设备:{{ item.PrinterName}}</text>
									</block>
								</view>
							</view>
						</view>
					</block>
				</view>
			</scroll-view>
			<view style="border-top: 1upx solid #ccc; width: 100%; padding: 20upx 5upx 0 0;" v-if="isShowSaveSelected">
				<label class="checkbox" @click="cbxChange">
					<checkbox :checked="isSaveSelected" />下次不再选择
				</label>
			</view>
		</uni-popup>

		<!-- 扫描校验 -->
		<uni-popup-modal :show="showScanTag" title="标签校验" :showCancel="false" @save="onTagScanSave">
			<barcode-input ref="input_scan" @onScaned="onTagScaned" placeholder="请扫描刚打印的标签"></barcode-input>
		</uni-popup-modal>
	</view>
</template>

<script>
	import barcodeInput from '../../components/barcode-input/barcode-input.vue';
	import uniPopupModal from '../../components/uni-popup-modal/uni-popup-modal.vue'
	import uniPopup from '../../components/uni-popup/uni-popup.vue';

	import apis from '../../common/apiService.js';
	import consts from '../../common/consts.js';
	import storage from '../../common/storage.js';
	import util from '../../common/util.js';
	import bluetoothPrint from '../../common/print/bluetoothPrint.js'


	export default {
		name: 'label-print',
		components: {
			uniPopupModal,
			uniPopup,
			barcodeInput
		},
		data() {
			var dateTimestamp = new Date().getTimestamp();
			return {
				show: false,
				showReportList: false, //是否显示报表列表
				showPrinterList: false, //是否显示打印机列表 
				printerList: [], //打印机列表
				reportList: [], //获取报表 
				selReportList: [], //选中的报表
				showScanTag: false,
				isSaveSelected: false,
				scanTagModelList: [] //扫描的箱标签对象 
			}
		},
		props: {
			progNo: {
				type: String,
				required: true
			},
			reportModel: {
				type: [Object],
				required: true,
				default: () => {
					return {
						isMultiPrint: false,
						dataSource: Array, // 标签拆分时为多个数据源
						isNeedValidTag: false, //是否需要校验标签
					}
				},
				validator: (value) => {
					var isArr = value.dataSource instanceof Array
					if (!isArr) {
						throw '标签数据源请传数组格式'
					}
					return isArr
				}
			},
			isShowSaveSelected: {
				type: Boolean,
				default: true
			},
			showReport: {
				type: Boolean,
				required: true,
				default: false
			}
		},
		watch: { //监听外部对props属性的变更
			showReport: {
				immediate: true,
				handler: function(newVal) {
					this.show = newVal;
					if (this.show) {
						var isArr = this.reportModel.dataSource instanceof Array
						if (!isArr) {
							uni.showToast({
								title: '标签数据源请传数组格式',
								icon: 'none'
							})
							throw '标签数据源请传数组格式'
						}
						this.onPrint();
					}
				}
			}
		},
		onReady() {
			//初始化
			this.isSaveSelected = false
		},
		methods: {
			onPrint() {
				if (this.reportList.length == 0) {
					this.refreshReport();
				} else {
					this.showReportList = true;
				}
			},
			/**
			 * @description 刷新列表
			 */
			refreshReport() {
				uni.showLoading({
					mask: true
				});
				apis.getReportList({
					data: {
						progNo: this.progNo,
						includePrintSyntax: false
					},
					success: (res) => {
						this.reportList = res;
						this.showReportList = true;
					},
					complete: (status, message, content) => {
						util.tryCatchApi({
							status: status,
							message: message
						});
						uni.hideLoading();
					}
				})
			},
			togglePopup(type) {
				switch (type) {
					case 'showReportList':
						this.showReportList = false;
						break;
					case 'showPrinterList':
						this.showPrinterList = false;
						break;
				}
				this.show = false;
				this.$emit('printCancel');
			},
			checkboxChange: function(e) {
				var items = this.reportList,
					values = e.detail.value;
				for (var i = 0, lenI = items.length; i < lenI; ++i) {
					const item = items[i];
					if (values.includes(item.controlName)) {
						this.$set(item, 'checked', true)
					} else {
						this.$set(item, 'checked', false)
					}
				}
			},
			onReportSelected(e) {
				let controlNames = ''
				if (this.reportModel.isMultiPrint) {
					for (let i = 0; i < this.reportList.length; i++) {
						if (this.reportList[i].checked) {
							controlNames += this.reportList[i].controlName + ','
						}
					}
					if (controlNames.length == 0) {
						uni.showToast({
							title: '请勾选要打印的标签',
							icon: "none"
						});
						return;
					}
				} else {
					controlNames += this.reportList[e].controlName + ','
				}
				controlNames = controlNames.substr(0, controlNames.length - 1)
				uni.showLoading({
					title: '正在加载数据...'
				})
				apis.getReportList({
					data: {
						progNo: this.progNo,
						controlName: controlNames,
						includePrintSyntax: true
					},
					success: (res) => {
						this.selReportList = res;
						//报表选中
						this.refreshPrinter()
						this.showReportList = false;
						this.showPrinterList = true;
					},
					complete: (status, message, content) => {
						util.tryCatchApi({
							status: status,
							message: message
						});
						uni.hideLoading();
					}
				})
			},
			/**
			 * @description 刷新打印机列表
			 */
			refreshPrinter() {
				var that = this;
				that.printerList = [];
				uni.showLoading({
					mask: true
				});

				let usedLabelAndPrinters = storage.get(consts.storageKeys.usedLabelAndPrinters) || [];
				let findDefault = false;
				let bluetoothPrinterSet = storage.get(consts.storageKeys.bluetoothPrinterSet);
				if (bluetoothPrinterSet == undefined) {
					bluetoothPrinterSet = {
						enableBluetooth: false,
						deviceId: '',
						deviceName: ''
					}
				}
				if (bluetoothPrinterSet.enableBluetooth) {
					bluetoothPrint.searchPrinter({
						success: function(res) {
							for (var i = 0; i < res.length; i++) {
								var item = res[i];
								if (bluetoothPrinterSet.deviceId.length > 0 && bluetoothPrinterSet.deviceId != item.deviceId) continue;
								var newItem = {
									PrinterName: item.deviceId,
									DeviceName: item.name,
									printerType: 1
								}
								findDefault = that.isExistPrinterItem(usedLabelAndPrinters, item.deviceId);
								if (findDefault) {
									that.printerList.insert(0, newItem);
								} else {
									that.printerList.add(newItem);
								}

								// console.log(util.outputLog(newItem));
								// console.log(util.outputLog(that.printerList));
							}
						}
					})
				}

				apis.getPrinterList({
					success: (res) => {
						for (var i = 0; i < res.length; i++) {
							var item = res[i];
							item.printerType = '0';
							//排除离线和windows默认打印机
							if (item.WorkOffLine || item.PrinterName.indexOf('Microsoft') > -1) continue;
							if (findDefault) {
								that.printerList.push(item);
							} else {
								var isFind = that.isExistPrinterItem(usedLabelAndPrinters, item.PrinterName);
								// console.log(item);
								if (isFind) {
									that.printerList.insert(0, item);
								} else {
									if (item.IsDefault) {
										that.printerList.insert(0, item);
									} else {
										that.printerList.push(item);
									}
								}
							}
						}
					},
					complete: (status, message, content) => {
						util.tryCatchApi({
							status: status,
							message: message
						});
						uni.hideLoading();
					}
				})

			},
			/**
			 * @description 打印机是否使用过
			 * @param {Object} usedLabelAndPrinters
			 * @param {Object} printerName
			 */
			isExistPrinterItem(usedLabelAndPrinters, printerName) {
				var isFind = false;
				for (var i = 0; i < usedLabelAndPrinters.length; i++) {
					if (usedLabelAndPrinters[i].progNo == this.progNo && usedLabelAndPrinters[i].printerName ==
						printerName) {
						isFind = true;
						break;
					}
				}
				return isFind;
			},
			/**
			 * 是否作为默认
			 */
			cbxChange() {
				this.isSaveSelected = !this.isSaveSelected
			},
			onPrinterSelected(e) {
				let that = this;
				//打印机选中
				var printer = this.printerList[e];
				let usedLabelAndPrinters = storage.get(consts.storageKeys.usedLabelAndPrinters) || [];
				//保存选中的报表 & 打印机 usedLabelAndPrinters 
				for (var i = 0; i < usedLabelAndPrinters.length; i++) {
					if (usedLabelAndPrinters[i].progNo == this.progNo) {
						usedLabelAndPrinters.remove(usedLabelAndPrinters[i]);
						break;
					}
				}
				var cloneReport = util.clone(this.selReportList);
				for (var i = 0; i < cloneReport.length; i++) {
					cloneReport[i].reportSyntax = ''
				}

				var lableItem = {
					progNo: this.progNo,
					labels: cloneReport,
					//设备ID
					printerName: printer.PrinterName,
					deviceName: printer.printerType == 0 ? '' : printer.DeviceName,
					printerType: printer.printerType, //打印机类型 0 无服务类型 1蓝牙
					isUserDefault: this.isSaveSelected
				}
				// console.log(usedLabelAndPrinters);
				usedLabelAndPrinters.push(lableItem);
				storage.set(consts.storageKeys.usedLabelAndPrinters, usedLabelAndPrinters);
				that.onPrinterSelectedSub(lableItem, false);
			},
			/**
			 * @description 执行打印
			 * @param {Object} printer 打印机对象
			 * @param {Boolen} isSearchBluetooth 是否搜索蓝牙打印机
			 */
			onPrinterSelectedSub(printer, isSearchBluetooth) {
				let that = this;

				if (printer.printerType == 0) {
					//服务器打印
					let controlNames = ''
					for (let i = 0; i < this.selReportList.length; i++) {
						var report = this.selReportList[i];
						controlNames += report.controlName + ','
					}
					controlNames = controlNames.substr(0, controlNames.length - 1)
					this.onServerPrint(controlNames, printer.printerName)
				} else if (isSearchBluetooth) {
					uni.showLoading({
						title: '正在搜索蓝牙'
					})
					bluetoothPrint.searchPrinter({
						success: function(res) {
							var isFindDevice = false;
							for (var i = 0; i < res.length; i++) {
								if (res[i].deviceId == printer.printerName) {
									isFindDevice = true;
									break;
								}
							}
							console.log('isFindDevice:' + isFindDevice);
							uni.hideLoading()
							if (!isFindDevice) {
								uni.showToast({
									title: '没有找到蓝牙，请重试！',
									icon: 'none'
								})
								return;
							}
							that.onExecBluetoothPrint(printer);
						},
						fail: function() {
							uni.hideLoading()
							uni.showToast({
								title: '没有找到蓝牙，请重启PDA蓝牙重试！',
								icon: 'none'
							})
						}
					})
				} else {
					//不搜索蓝牙打印机
					that.onExecBluetoothPrint(printer);
				}
			},
			/**
			 * @description 执行蓝牙打印
			 */
			onExecBluetoothPrint(printer) {
				var that = this;
				//要打印的标签
				var labelList = [];
				for (let i = 0; i < that.selReportList.length; i++) {
					var report = that.selReportList[i];
					let jxXmlObj = that.jxXml(report.reportSyntax);
					for (var j = 0; j < that.reportModel.dataSource.length; j++) {
						let dataItem = that.reportModel.dataSource[j]
						labelList.push({
							jxXmlObj: jxXmlObj,
							dataItem: dataItem
						})
					}
				}
				bluetoothPrint.connect({
					data: {
						deviceId: printer.printerName
					},
					success: function() {
						that.onBluetoothPrint(labelList, 0);
						/* for (let i = 0; i < that.selReportList.length; i++) {
							var report = that.selReportList[i];
							let jxXmlObj = that.jxXml(report.reportSyntax);
							for (var j = 0; j < that.reportModel.dataSource.length; j++) {
								let dataItem = that.reportModel.dataSource[j]
								that.onBluetoothPrint(jxXmlObj, dataItem)
							}
						} */
					},
					fail: function() {
						uni.showToast({
							title: '蓝牙连接失败',
							icon: 'none'
						})
					}
				})
			},
			/**
			 * @description 服务器打印
			 */
			onServerPrint(controlNames, printerName) {
				uni.showLoading({
					title: '服务器正在打印',
					mask: true
				});
				apis.printReport({
					data: {
						reportId: controlNames,
						printerName: printerName,
						dataSource: JSON.stringify(this.reportModel.dataSource)
					},
					success: (res) => {
						uni.showToast({
							title: '打印成功'
						})
						this.showPrinterList = false;

						if (this.reportModel.isNeedValidTag) {
							this.showScanTag = true;
							this.$refs.input_scan.clear();
							this.$refs.input_scan.setFocus();
						} else {
							this.$emit('printComplete');
						}
					},
					complete: (status, message, content) => {
						util.tryCatchApi({
							status: status,
							message: message
						});
						uni.hideLoading();
					}
				})
			},
			/**
			 * @description 蓝牙打印
			 * @param {type} reportTag 经过解析的标签对象
			 * @param {type} dataItem 数据源 
			 */
			onBluetoothPrint(labelList, index) {
				let reportTag = labelList[index].jxXmlObj,
					dataItem = labelList[index].dataItem;
				var that = this;
				bluetoothPrint.initCommand();
				//水平还是垂直 true 水平 false 垂直
				let bluetoothPrinterSet = storage.get(consts.storageKeys.bluetoothPrinterSet);
				let portrait = true; 
				if (bluetoothPrinterSet.enableBluetooth){
					portrait = bluetoothPrinterSet.portrait == undefined ? true: bluetoothPrinterSet.portrait;
				}
				if (portrait){
					bluetoothPrint.addSize(reportTag.pageWidth, reportTag.pageHeight)
				}else{
					bluetoothPrint.addSize(reportTag.pageHeight, reportTag.pageWidth)
				}
				bluetoothPrint.addGap(3) //该指令用于定义两张卷标纸间的垂直间距距离
				/* 清除打印缓冲区 */
				bluetoothPrint.addCls();
				for (let i = 0; i < reportTag.bandsArr.length; i++) {
					let item = reportTag.bandsArr[i];
					let value = this.getControlValue(reportTag, item, dataItem);
					this.getLocationFloat(portrait, item.locationFloat, reportTag.pageWidth, reportTag.pageHeight)
					switch (reportTag.bandsArr[i].controlType) {
						case 'XRLabel':
							console.log("item: " + JSON.stringify(item));
							//x, y, text, fontSize, bold, underline 
							bluetoothPrint.addText(item.locationFloat.x, item.locationFloat.y, value, item.font.fontSize, item.font.bold, item.font.underline, portrait)
							break;
						case 'XRBarCode':
							if (item.codeType == 'QRCode') {
								//x, y, content, width
								bluetoothPrint.addQR(item.locationFloat.x, item.locationFloat.y, value, item.module, portrait)
							} else {
								//x, y, content, codetype, height, readable, portrait, radio
								bluetoothPrint.addBarcode(item.locationFloat.x, item.locationFloat.y, value, item.codeType, item.sizeF[1], item.showText, portrait, item.module)
							}
							break;
						case 'XRPictureBox':
							// setTimeout(function() {
							// 	command.setBitmap(item.locationFloat.x, item.locationFloat.y, 0, item.imageData)
							// }, 3000);
							break;
						default:
							break;
					}
				}
				bluetoothPrint.addPagePrint({
					data: {
						title: '正在打印第 ' + eval(index + 1) + ' 张'
					},
					success: (res) => {
						index++;
						if (index < labelList.length) {
							setTimeout(function() {
								that.onBluetoothPrint(labelList, index);
							}, 250);
						} else {
							bluetoothPrint.disconnect();

							that.showPrinterList = false;
							// console.log(that.reportModel.isNeedValidTag);
							if (that.reportModel.isNeedValidTag) {
								that.show = true;
								that.showScanTag = true;
								that.$refs.input_scan.setFocus();
							} else {
								that.$emit('printComplete');
							}
						}
					},
					fail: () => {
						uni.showToast({
							title: '蓝牙打印失败请重试',
							icon: 'none'
						})
						bluetoothPrint.disconnect();
					}
				})
			},
			onTagScaned(e) {
				var that = this;
				//扫描箱标签
				uni.showLoading({
					mask: true
				});
				apis.basic_QRCodeAnalysis({
					data: {
						qrCode: e
					},
					success: (res) => {
						//校验批次、料号和数量是否正确
						//校验是否重复扫描
						let exist = false;
						for (let i = 0; i < that.reportModel.dataSource.length; i++) {
							if (that.reportModel.dataSource[i].tagId == res.tagId) {
								exist = true;
								break;
							}
						}
						if (!exist) {
							uni.showToast({
								title: '标签扫描错误！',
								icon: "none"
							});
							return;
						}
						res.qrCode = e;
						that.scanTagModelList.push(res);
						that.$refs.input_scan.clear();
						uni.showToast({
							title: '校验成功'
						})
						util.showScanedAudio();
					},
					failure: (message) => {
						util.showAudio();
					},
					complete: (status, message, content) => {
						that.$refs.input_scan.setFocus();
						util.tryCatchApi({
							status: status,
							message: message
						});
						uni.hideLoading();
					}
				})
			},
			onTagScanSave() {
				if (this.scanTagModelList.length == 0) {
					this.$refs.input_scan.setFocus();
					uni.showToast({
						title: '请先完成扫描校验',
						icon: 'none'
					})
					return;
				}
				//标签校验完成保存
				this.$emit('tagValid', this.scanTagModelList);
				this.scanTagModelList = [];
				this.showScanTag = false;
				this.show = false;
			},

			jxXml(xmlContent) {
				//https://github.com/jindw/xmldom
				//https://github.com/lpreterite/xmlToJSON 

				var DOMParser = require('xmldom').DOMParser;
				var xmlDoc = new DOMParser().parseFromString(xmlContent, 'text/xml');
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
				return parseInt(val);
			},
			/**
			 * 将毫米转换为 像素 单位值
			 * @param {Object} reportUnit
			 * @param {Object} dpi
			 * @param {Object} val
			 */
			convertUnit2PX(reportUnit, dpi, val) {
				//转换还需要知道另一个参数：DPI（每英寸多少点）				
				//象素数 / DPI = 英寸数
				//英寸数 * 25.4 = 毫米数
				//200 : DPI: 1 mm = 8 dots

				console.log("val: " + val + " dpi:" + dpi)
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
				return parseInt(this.convertUnit2MM(reportUnit, dpi, val) * 8);
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
								let leftMargin = padding[0] > 0 ? padding[0] * 2 : 0;
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
										let bold = false, italic = false, underline = false;
										let oriContent = ctl.getAttribute("Font");
										let font = oriContent.split(',');
										let styleIndex = oriContent.indexOf('=') + 1;
										if (styleIndex > -1){
											let style = oriContent.substring(styleIndex)
											//Bold, Italic, Underline
											let styleArr = style.split(','); 
											for (let m = 0; m < styleArr.length; m++) {
												if (styleArr[m].trim() == 'Bold'){
													bold = true;
												}else if (styleArr[m].trim() == 'Italic'){
													italic = true;
												}else if (styleArr[m].trim() == 'Underline'){
													underline = true;
												}
											}
										} 
										
										let ctlObj = {
											controlType: controlType,
											text: ctl.getAttribute("Text"),
											dataBindings: dataBindings,
											sizeF: sizeF,
											locationFloat: locationFloat,
											//Font="微软雅黑, 6pt, style=Bold, Italic, Underline" 
											font: {
												family: font.length > 0 ? font[0]: '',
												fontSize: font.length > 1 ? Number(font[1].replace('pt', '').trim()) : '',
												bold: bold,
												italic: italic,
												underline: underline
											},
											padding: padding,
										}
										bandsArr.push(ctlObj);
										break;
									case "XRBarCode":
										let codeType = ctl.getElementsByTagName("Symbology")[0].getAttribute("Name")
										ctlObj = {
											controlType: controlType,
											module: ctl.getAttribute("Module").length == 0 ? 2 : ctl.getAttribute("Module"),
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
										/* let sizeFPx = ctl.getAttribute("SizeF").split(',');
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
										bandsArr.push(ctlObj);*/
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
			/**
			 * @description 水平还是垂直 true 水平 false 垂直 
			 * @param {Object} portrait
			 * @param {Object} locationFloat
			 * @param {Object} pageWidth
			 * @param {Object} pageHeight
			 */
			getLocationFloat(portrait, locationFloat, pageWidth, pageHeight){
				//水平还是垂直 true 水平 false 垂直 
				if (!portrait){
					let oldX = locationFloat.x, oldY = locationFloat.y;
					locationFloat.x = oldY;
					locationFloat.y = pageWidth * 8 - oldX;
				}
			},
			
			getControlValue(jxXmlObj, item, dataItem) {
				//获取控件值
				let value = '';
				switch (item.controlType) {
					case 'XRLabel':
						if (item.text.length > 0) {
							value = item.text;
						} else {
							value = this.getExpressionValue(jxXmlObj, item, dataItem);
						}
						break;
					case 'XRBarCode':
						if (item.text.length > 0) {
							value = item.text;
						} else {
							//取 计算列值
							value = this.getExpressionValue(jxXmlObj, item, dataItem);
						}
						break;
					case 'XRPictureBox':
						// 						var that = this;
						// 						that.canvasWidth = item.sizeFPx[0]
						// 						that.canvasHeight = item.sizeFPx[1]
						// 						var canvasWidth = that.canvasWidth //= item.sizeFPx[0]
						// 						var canvasHeight = that.canvasHeight //= item.sizeFPx[1]
						// 						const ctx = uni.createCanvasContext("edit_area_canvas", this);
						// 						let base64Img = this.base64Prefix + item.image
						// 						var bitmap = new plus.nativeObj.Bitmap("syt");
						// 						bitmap.loadBase64Data(base64Img,
						// 							function(e) {
						// 								console.log("加载Base64图片数据成功");
						// 								var savedFilePath = "_doc/uniapp_temp/canvas/" + new Date().getTime() + ".png";
						// 								var path = plus.io.convertLocalFileSystemURL(savedFilePath);
						// 								bitmap.save(path, {}, function(event) {
						// 									//得到 图片缩放 后的大小px
						// 									var imgSize = that.autoResizeImage(that.canvasWidth, that.canvasHeight, event.width, event.height)
						// 									console.log({
						// 										imgSize: imgSize,
						// 										event: event
						// 									});
						// 
						// 									if (that.app.BLEInformation.platform == "android") {
						// 										ctx.translate(imgSize.width, imgSize.height)
						// 										ctx.rotate(180 * Math.PI / 180)
						// 									}
						// 									//TODO:图片缩放后，会出现 打印异常
						// 									ctx.drawImage(savedFilePath, 0, 0, imgSize.width, imgSize.height);
						// 									ctx.draw();
						// 									setTimeout(function() {
						// 										uni.canvasGetImageData({
						// 											canvasId: 'edit_area_canvas',
						// 											x: 0,
						// 											y: 0,
						// 											width: imgSize.width + parseInt(imgSize.width / 2),
						// 											height: imgSize.height + parseInt(imgSize.height / 2),
						// 											success: function(res) {
						// 												console.log('读取到图片数据');
						// 												item.imageData = res;
						// 												// console.log(item.imageData);
						// 											},
						// 											complete: function() {}
						// 										})
						// 									}, 1000);
						// 
						// 
						// 								}, function() {});
						// 							},
						// 							function(e) {
						// 								console.log('加载Base64图片数据失败：' + JSON.stringify(e));
						// 							}
						// 						);
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
			getExpressionValue(jxXmlObj, item, dataItem) {
				//计算表达式的值
				// 判断是否在引用列中

				let calsStr = '';
				for (let i = 0; i < jxXmlObj.calcArr.length; i++) {
					if (jxXmlObj.calcArr[i].id == item.dataBindings.dataMember) {
						calsStr = jxXmlObj.calcArr[i].value;
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
					// console.log("calsStr: " + JSON.stringify(calsStr));
					return eval(calsStr);
				} else {
					var key = item.dataBindings.dataMember
					key = key.replace(key[0], key[0].toLowerCase())
					var value = dataItem[key];
					if (value == undefined) value = "";
					if (item.dataBindings.formatString !== undefined && item.dataBindings.formatString.length > 0) {
						// console.log(item.dataBindings.formatString);
						// FormatString="{0:yyyyMMdd}" 
						//FormatString="{0:#,#0.#######}" 
						//FormatString="工序：{0}"
						//找到大括号的内容
						let content = item.dataBindings.formatString.match(/{0(:)?(\S)*}/g)[0];
						let arrSplit = content.split(':');
						if (arrSplit.length > 1) {
							//取后面的格式
							//去掉 } 
							let format = arrSplit[1].substr(0, arrSplit[1].length - 1)
							if (format.indexOf('#') > -1) {
								//数字格式
								value = Number(value);
							} else if (format.indexOf('yy') > -1) {
								//日期格式
								value = value.replace(new RegExp(/-/gm), "/");
								value = new Date(value).format(format) 
							}
						}
						value = item.dataBindings.formatString.replace(content, value)
					}
					return value;
				}
			},
			/**
			 * 使用默认打印
			 * @return{
					progNo: this.progNo,
					labels: this.cloneReport,
					//设备ID
					printerName: printer.PrinterName,
					deviceName:printer.printerType == 0? '': printer.DeviceName,
					printerType: printer.printerType, //打印机类型 0 无服务类型 1蓝牙
					isUserDefault: 是否使用上次选择的结果
				}
			 */
			userDefaultPrint() {
				var that = this;

				let usedLabelAndPrinters = storage.get(consts.storageKeys.usedLabelAndPrinters) || [];
				var item = null;
				for (var i = 0; i < usedLabelAndPrinters.length; i++) {
					if (usedLabelAndPrinters[i].progNo == this.progNo) {
						item = usedLabelAndPrinters[i]
						break;
					}
				}
				if (item == null) {
					uni.showToast({
						title: '没有默认配置',
						icon: 'none'
					})
					return;
				}
				console.log(item);
				let controlNames = ''
				for (let i = 0; i < item.labels.length; i++) {
					var report = item.labels[i];
					controlNames += report.controlName + ','
				}
				controlNames = controlNames.substr(0, controlNames.length - 1)

				//请求报表 
				uni.showLoading({
					title: '正在加载数据',
					mask: true
				});
				apis.getReportList({
					data: {
						progNo: this.progNo,
						controlName: controlNames,
						includePrintSyntax: true
					},
					success: (res) => {
						// this.reportList = res;
						that.selReportList = res;
						that.onPrinterSelectedSub(item, true);
					},
					complete: (status, message, content) => {
						util.tryCatchApi({
							status: status,
							message: message
						});
						uni.hideLoading();
					}
				})
				return item;
			},
			/**
			 * 判断是否需要用默认打印方式打印
			 */
			checkUseDefaultPrint() {
				let usedLabelAndPrinters = storage.get(consts.storageKeys.usedLabelAndPrinters) || [];
				// console.log(util.outputLog(usedLabelAndPrinters));
				var find = false;
				for (var i = 0; i < usedLabelAndPrinters.length; i++) {
					if (usedLabelAndPrinters[i].progNo == this.progNo && usedLabelAndPrinters[i].isUserDefault) {
						find = true;
						break;
					}
				}
				return find;
			}
		}
	}
</script>

<style>
	.uni-mask {
		position: fixed;
		z-index: 998;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		background-color: rgba(0, 0, 0, 0.3);
	}

	.label-print-view {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: 999;
		display: block;
		box-sizing: border-box;
	}
</style>
