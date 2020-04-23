<template>
	<view>
		<view>
			<ul class="content">
				<block v-for="item in list" :key="item.deviceId">
					<li @click="bindViewTap(item)" style="margin: 10px 0 20px 0;">{{item.deviceId}} | {{item.name}}</li>
				</block>
			</ul>
		</view>
		<button class="btn" type="primary" @click="startSearch"> 开始搜索 </button>
		<button type="primary" @click="labelTest">
			打印
		</button>


	</view>
</template>

<script>
	import tsc from '../../common/tsc.js'; //常用功能
	export default {
		data() {
			return {
				list: [],
				services: [],
				serviceId: 0,
				writeCharacter: false,
				readCharacter: false,
				notifyCharacter: false,
				BLEInformation: {
					deviceId: "",
					name: '',
					writeCharaterId: "",
					writeServiceId: "",
					notifyCharaterId: "",
					notifyServiceId: "",
					readCharaterId: "",
					readServiceId: "",
				},

				looptime: 0,
				currentTime: 1,
				lastData: 0,
				oneTimeData: 0,
			}
		},
		onLoad() {

		},
		methods: {
			startSearch() {
				var that = this
				//开始搜索
				uni.openBluetoothAdapter({
					success: e => {
						console.log('初始化蓝牙成功:' + e.errMsg);
						console.log(JSON.stringify(e));

						uni.getBluetoothAdapterState({
							success: res => {
								if (res.available) {
									if (res.discovering) {
										uni.stopBluetoothDevicesDiscovery({
											success: e => {
												console.log('停止搜索蓝牙设备:' + e.errMsg);
											},
											fail: e => {
												console.log('停止搜索蓝牙设备失败，错误码：' + e.errCode);
												if (e.errCode !== 0) {
													initTypes(e.errCode);
												}
											}
										});
									}
									that.getBluetoothDevices()
								} else {
									toast('本机蓝牙不可用')
								}
							},
							fail: e => {
								console.log('获取本机蓝牙适配器状态失败，错误码：' + e.errCode);
								if (e.errCode !== 0) {
									initTypes(e.errCode);
								}
							}
						});

					},
					fail: e => {
						console.log(e)
						console.log('初始化蓝牙失败，错误码：' + (e.errCode || e.errMsg));
						if (e.errCode !== 0) {
							initTypes(e.errCode, e.errMsg);
						}
					}
				});
			},
			getBluetoothDevices() {
				//获取蓝牙设备信息
				var that = this
				console.log("start search")
				uni.showLoading({
					title: '正在加载',
				})
				uni.startBluetoothDevicesDiscovery({
					success: function(res) {
						console.log(res)
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
									that.list = devices;
									uni.hideLoading()
								},
							})
						}, 3000)
					},
				})
			},
			bindViewTap(e) {
				//点击选中的蓝牙
				var that = this
				wx.stopBluetoothDevicesDiscovery({
					success: function(res) {
						console.log(res)
					},
				})
				this.serviceId = 0;
				this.writeCharacter = false;
				this.readCharacter = false;
				this.notifyCharacter = false;
				console.log('你点击了' + e.name);

				console.log(e.deviceId)
				uni.showLoading({
					title: '正在连接',
				})
				uni.createBLEConnection({
					deviceId: e.deviceId,
					success: function(res) {
						console.log(res)
						that.BLEInformation.deviceId = e.deviceId
						that.BLEInformation.name = e.name
						that.getSeviceId()
					},
					fail: function(e) {
						uni.showModal({
							title: '提示',
							content: '连接失败',
						})
						console.log(e)
					},
					complete: function(e) {
						console.log(e)
						uni.hideLoading()
					}
				})
			},
			getSeviceId: function() {
				var that = this
				console.log(that.BLEInformation.deviceId)
				uni.getBLEDeviceServices({
					deviceId: that.BLEInformation.deviceId,
					success: function(res) {
						console.log(res)
						// var realId = ''
						// if (platform == 'android') {
						//   // for(var i=0;i<res.services.length;++i){
						//   // var item = res.services[i].uuid
						//   // if (item == "0000FEE7-0000-1000-8000-00805F9B34FB"){
						//   realId = "0000FEE7-0000-1000-8000-00805F9B34FB"
						//   //       break;
						//   //     }
						//   // }
						// } else if (platform == 'ios') {
						//   // for(var i=0;i<res.services.length;++i){
						//   // var item = res.services[i].uuid
						//   // if (item == "49535343-FE7D-4AE5-8FA9-9FAFD205E455"){
						//   realId = "49535343-FE7D-4AE5-8FA9-9FAFD205E455"
						//   // break
						//   // }
						//   // }
						// }
						// app.BLEInformation.serviceId = realId
						that.services = res.services;
						console.log(1);
						that.getCharacteristics()
						console.log(1);
					},
					fail: function(e) {
						console.log(e)
					},
					complete: function(e) {
						console.log(e)
					}
				})
			},
			getCharacteristics() {
				var that = this
				var list = that.services
				var num = that.serviceId
				var write = that.writeCharacter
				var read = that.readCharacter
				var notify = that.notifyCharacter
				console.log("list: " + JSON.stringify(list));

				uni.getBLEDeviceCharacteristics({
					deviceId: that.BLEInformation.deviceId,
					serviceId: list[num].uuid,
					success: function(res) {
						console.log("getBLEDeviceCharacteristics: " + res)
						for (var i = 0; i < res.characteristics.length; ++i) {
							var properties = res.characteristics[i].properties
							var item = res.characteristics[i].uuid
							if (!notify) {
								if (properties.notify) {
									that.BLEInformation.notifyCharaterId = item
									that.BLEInformation.notifyServiceId = list[num].uuid
									notify = true
								}
							}
							if (!write) {
								if (properties.write) {
									that.BLEInformation.writeCharaterId = item
									that.BLEInformation.writeServiceId = list[num].uuid
									write = true
								}
							}
							if (!read) {
								if (properties.read) {
									that.BLEInformation.readCharaterId = item
									that.BLEInformation.readServiceId = list[num].uuid
									read = true
								}
							}
						}
						console.log("write: " + write + "| notify: " + notify + "| read: " + read);
						if (!write || !notify || !read) {
							num++
							that.writeCharacter = write;
							that.readCharacter = read;
							that.notifyCharacter = notify;
							that.serviceId = num;
							that.getCharacteristics()
						} else {
							uni.showModal({
								title: '提示',
								content: that.BLEInformation.name + ' 可以准备打印了',
								showCancel: false
							})
						}
					},
					fail: function(e) {
						console.log(e)
					},
					complete: function(e) {
						console.log("write:" + that.BLEInformation.writeCharaterId)
						console.log("read:" + that.BLEInformation.readCharaterId)
						console.log("notify:" + that.BLEInformation.notifyCharaterId)
					}
				})
			},
			labelTest() {
				let deviceId = this.BLEInformation.deviceId;
				let serviceId = this.BLEInformation.writeServiceId;
				let characteristicId = this.BLEInformation.writeCharaterId;
				console.log("deviceId" + deviceId);
				console.log("serviceId" + serviceId);
				console.log("characteristicId" + characteristicId);

				var command = tsc.jpPrinter.createNew()
				command.setSize(50, 30)
				command.setGap(0)
				command.setCls()
				command.setText(0, 30, "TSS24.BF2", 1, 1, "图片")
				// command.setQR(40, 120, "L", 5, "A", "www.smarnet.cc佳博智汇")
				// command.setText(60, 90, "TSS24.BF2", 1, 1, "佳博智汇")
				// command.setText(170, 50, "TSS24.BF2", 1, 1, "小程序测试")
				// command.setText(170, 90, "TSS24.BF2", 1, 1, "测试数字12345678")
				// command.setText(170, 120, "TSS24.BF2", 1, 1, "测试英文abcdefg")
				// command.setText(170, 150, "TSS24.BF2", 1, 1, "测试符号/*-+!@#$")
				// command.setBar(170, 180, "EAN8", 64, 1, 3, 3, "1234567")
				command.setPagePrint();

				const buffer = new ArrayBuffer(1)
				const dataView = new DataView(buffer)
				dataView.setUint8(0, 0)

				plus.bluetooth.writeBLECharacteristicValue({
					deviceId,
					serviceId,
					characteristicId,
					value: buffer,
					success: res => {
						console.log("res: " + JSON.stringify(res));
						// console.log('writeBLECharacteristicValue success', res.errMsg)
					},
					fail: function(e) {
						console.log(e)
					}
				});

				// uni.writeBLECharacteristicValue({
				// 	deviceId,
				// 	serviceId,
				// 	characteristicId,
				// 	value: buffer,
				// 	success: res => {
				// 		console.log('writeBLECharacteristicValue success', res.errMsg)
				// 	},
				// 	fail: function(e) {
				// 		console.log(e)
				// 	}
				// })
				uni.readBLECharacteristicValue({
					deviceId,
					serviceId,
					characteristicId,
					success: function(res) {
						console.log('readBLECharacteristicValue')
					}
				})
			},
			prepareSend: function(buff) { //准备发送，根据每次发送字节数来处理分包数量
				console.log(buff)
				var that = this
				var time = that.oneTimeData
				var looptime = parseInt(buff.length / time);
				var lastData = parseInt(buff.length % time);
				console.log(looptime + "---" + lastData)
				this.looptime = looptime + 1;
				this.lastData = lastData;
				this.currentTime = 1;
				that.Send(buff)
			},
			Send: function(buff) { //分包发送
				var that = this
				var currentTime = that.data.currentTime
				var loopTime = that.data.looptime
				var lastData = that.data.lastData
				var onTimeData = that.data.oneTimeData
				var printNum = that.data.printerNum
				var currentPrint = that.data.currentPrint
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
				console.log("第" + currentTime + "次发送数据大小为：" + buf.byteLength)
				wx.writeBLECharacteristicValue({
					deviceId: app.BLEInformation.deviceId,
					serviceId: app.BLEInformation.writeServiceId,
					characteristicId: app.BLEInformation.writeCharaterId,
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
							that.setData({
								currentTime: currentTime
							})
							that.Send(buff)
						} else {
							wx.showToast({
								title: '已打印第' + currentPrint + '张',
							})
							if (currentPrint == printNum) {
								that.setData({
									looptime: 0,
									lastData: 0,
									currentTime: 1,
									isReceiptSend: false,
									isLabelSend: false,
									currentPrint: 1
								})
							} else {
								currentPrint++
								that.setData({
									currentPrint: currentPrint,
									currentTime: 1,
								})
								that.Send(buff)
							}
						}
					}
				})

			}
			// 字符串转为ArrayBuffer对象，参数为字符串
			str2a: function(str) {
				var buf = new ArrayBuffer(str.length); // 每个字符占用1个字节
				var bufView = new Uint8Array(buf);
				for (var i = 0, strLen = str.length; i < strLen; i++) {
					bufView[i] = str.charCodeAt(i);
				}
				return buf;
			},
		}
	}

	/**
	 * 判断初始化蓝牙状态
	 */
	function initTypes(code, errMsg) {
		switch (code) {
			case 10000:
				toast('未初始化蓝牙适配器');
				break;
			case 10001:
				toast('未检测到蓝牙，请打开蓝牙重试！');
				break;
			case 10002:
				toast('没有找到指定设备');
				break;
			case 10003:
				toast('连接失败');
				break;
			case 10004:
				toast('没有找到指定服务');
				break;
			case 10005:
				toast('没有找到指定特征值');
				break;
			case 10006:
				toast('当前连接已断开');
				break;
			case 10007:
				toast('当前特征值不支持此操作');
				break;
			case 10008:
				toast('其余所有系统上报的异常');
				break;
			case 10009:
				toast('Android 系统特有，系统版本低于 4.3 不支持 BLE');
				break;
			default:
				toast(errMsg);
		}
	}

	/**
	 * 弹出框封装
	 */
	function toast(content, showCancel = false) {
		uni.showModal({
			title: '提示',
			content,
			showCancel
		});
	}
</script>

<style>
	.content {
		text-align: center;
		height: 400upx;
	}

	.logo {
		height: 200upx;
		width: 200upx;
		margin-top: 200upx;
	}

	.title {
		font-size: 36upx;
		color: #8f8f94;
	}
</style>
