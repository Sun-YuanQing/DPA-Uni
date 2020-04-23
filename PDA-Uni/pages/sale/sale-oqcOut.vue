<!-- OQC合格出货 --><!-- 生成出货单 -->
<template>
	<view>
		<view id="viewHeader">
			<!-- 单号 扫描 -->
			<barcode-input ref="input_order" @onScaned="onScaned" :focus="true" :clearScan="false" placeholder="扫出货通知单"></barcode-input>
			<barcode-input ref="input_part" @onScaned="onPartScaned" placeholder="扫包装料号"></barcode-input>
		</view>

		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item, index) in details" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" v-bind:class="item.selectItemClass">
						<view class="uni-flex uni-column" style="width: 100%;">
							<view class="uni-triplex-row">
								<view class="uni-triplex-left">
									<text class="uni-title">检验单号:{{ item.sheetNo }}</text>
									<text class="uni-title">料号:{{ item.partItemNo }}</text>
									<text class="uni-title">名称:{{ item.partName }}</text>
									<text class="uni-title">检验数量: {{ item.sheetQty }}</text>
								</view>
								<view class="uni-triplex-right" style="min-width: 220upx;">
									<text class="uni-h5" style="margin-left: -300px;">已扫数量:{{ item.scanQty }}</text>
									<text class="uni-h5" style="margin-left: -300px;">未扫数量:{{ item.lastScanQty }}</text>
								</view>
							</view>
						</view>
					</view>
				</block>
			</view>
		</scroll-view>
		<!-- 底部按钮模块 -->
		<page-foot ref="viewBtm"><button type="primary" style="display: block; float: none;" @click="onSave">保存</button></page-foot>

		<authorize-input :show="showAuth" :lockModel="lockModel" @onClick="authClick"></authorize-input>
	</view>
</template>

<script>
import barcodeInput from '../../components/barcode-input/barcode-input.vue';
import authorizeInput from '../../components/authorize-input/authorize-input.vue';
import lotunpack from '../../components/lotunpack/lotunpack.vue';

import apis from '../../common/apiService.js';
import consts from '../../common/consts.js';
import util from '../../common/util.js';
export default {
	components: {
		barcodeInput,
		authorizeInput,
		lotunpack
	},
	data() {
		return {
			progNo: '',
			old: {
				scrollTop: 0
			},
			scrollTop: 0,
			scrollHeight: 0,
			details: [], //显示统计结果
			showAuth: false, //是否显示授权
			scanPartModel: {}, //当前扫描物料对象
			details_list: [], //相同物料
			lockModel: {
				lockType: consts.lockType.sale_oqcOut, //锁屏类别 0.报工 1.生产退料 2.生产领料
				sourceId: '', //来源ID或单号批号
				description: ''
			},
			dataModel: {
				scmInoutBars: [],
				mesLockscreenLogs: [],
				noticeNo: ''
			},
			qrCode: '' //扫描出货标签
		};
	},
	onLoad(option) {
		this.progNo = option.progNo;
		console.log(this.progNo);
	},
	onReady() {
		util.getListHeight(this);
	},
	onBackPress(options) {
		return util.backPress(options, this.details.length > 0);
	},
	methods: {
		onScaned(e) {
			var _self = this;
			/* 解析入库信息 */
			uni.showLoading({
				mask: true
			});
			_self.dataModel.noticeNo = e;
			apis.Pda_pdaoqcspcquality1bynotice({
				data: {
					noticeNo: e
				},
				success: res => {
					if (res.length == 0) {
						uni.showToast({
							title: '该工单没有数据',
							icon: 'none'
						});
						util.showAudio();
						this.$refs.input_order.setFocus();
						return;
					}
					if( res.details){
						for (var i = 0; i < res.details.length; i++) {
							var item = res.details[i];
							item.scanQty = 0;
							item.lastScanQty = item.sheetQty;
							item.neetQty = item.sheetQty;
							if(!util.validOrderMonth(item)){ 
								continue;
							}
							_self.details.push(item)
						}
					}else{/* 李庚的数据没有 details  2019-09-24*/
						for (var i = 0; i < res.length; i++) {
							var item = res[i];
							item.scanQty = 0;
							item.lastScanQty = item.sheetQty;
							item.neetQty = item.sheetQty;
							if(!util.validOrderMonth(item)){ 
								continue;
							}
							_self.details.push(item)
						}
					}
					
					if (_self.details.length == 0){
						uni.showToast({
							title: '当前单据不在本月，请联系管理员！',
							icon: 'none'
						});
						util.showAudio();
						this.$refs.input_order.setFocus();
						return;
					}
					this.$refs.input_part.setFocus();
					util.showScanedAudio();
				},
				failure: message => {
					this.$refs.input_order.clear();
					this.$refs.input_order.setFocus();
					util.showAudio();
				},
				complete: (status, message, content) => {
					util.tryCatchApi({
						status: status,
						message: message
					});
					uni.hideLoading();
				}
			});
		},
		onPartScaned(e) {
			var _self = this;
			_self.qrCode = e;
			if (this.dataModel.noticeNo.trim().length == 0) {
				uni.showToast({
					title: '请先扫描通知单号',
					icon: 'none'
				});
				util.showAudio();
				this.$refs.input_order.setFocus();
				return;
			}
			uni.showLoading({
				mask: true
			});
			console.log(e);
			apis.Pda_pdasalnoticebyscanoqcvaild({
				data: {
					noticeNo: this.dataModel.noticeNo,
					qrCode: e
				},
				success: res => {
					this.scanPartModel = util.clone(JSON.parse(res.resultNote)); //当前扫描物料对象
					console.log(this.scanPartModel);
					var sum = 0; //获取相同集合数量总和
					_self.details_list = [];
					var details_tag = [];

					for (var i = 0; i < this.details.length; i++) {
						let item = this.details[i];
						item.scantagDetails = item.scantagDetails || [];
						for (var j = 0; j < item.scantagDetails.length; j++) {
							//scantagDetails//插入的集合
							let tag = item.scantagDetails[j];

							if (_self.scanPartModel.tagDetails) {
								//有tagDetails
								var len = _self.scanPartModel.tagDetails.length;
								for (var t = 0; t < len; t++) {
									//scanPartModel.tagDetails //外箱
									var scan_tag = _self.scanPartModel.tagDetails[t];
									if (tag.tagId == scan_tag.tagId) {
										uni.showModal({
											title: '提示',
											content: '该标签已扫描,是否要删除',
											success: function(res_mod) {
												if (res_mod.confirm) {
													for (var d = 0; d < _self.details.length; d++) {
														var ditem = _self.details[d];
														for (var s = 0; s < ditem.scantagDetails.length; s++) {
															var stag = ditem.scantagDetails[s]; //插入的集合

															if (_self.scanPartModel.tagDetails) {
																var len = _self.scanPartModel.tagDetails.length;
																for (var h = 0; h < len; h++) {
																	//scanPartModel.tagDetails //外箱
																	var scan_tag1 = _self.scanPartModel.tagDetails[h];
																	if (stag.tagId == scan_tag1.tagId) {
																		if (stag.tagId == _self.scanPartModel.tagId) {
																			//对比删除
																			ditem.scantagDetails.splice(s, 1); //删除相等的S
																			_self.onScrollTop(d);
																			_self.updateScanList();
																		}
																	}
																}
															}
														}
													}
												} else if (res_mod.cancel) {
												}
											}
										});
										util.showAudio();
										return;
									}
								}
							} else {
								//没有tagDetails
								var scan_tag = _self.scanPartModel;

								if (tag.tagId == scan_tag.tagId) {
									uni.showModal({
										title: '提示',
										content: '该标签已扫描,是否要删除',
										success: function(res_mod) {
											if (res_mod.confirm) {
												for (var d = 0; d < _self.details.length; d++) {
													var ditem = _self.details[d];
													for (var s = 0; s < ditem.scantagDetails.length; s++) {
														var stag = ditem.scantagDetails[s]; //插入的集合
														if (stag.tagId == _self.scanPartModel.tagId) {
															//对比删除
															ditem.scantagDetails.splice(s, 1); //删除相等的S
															_self.onScrollTop(d);
															_self.updateScanList();
														}
													}
												}
											} else if (res_mod.cancel) {
											}
										}
									});
									util.showAudio();
									return;
								}
							}
						}
						console.log(_self.scanPartModel);
						//获取相同集合  算总数量
						if (_self.scanPartModel.tagDetails) {
							//有tagDetails
							var len = _self.scanPartModel.tagDetails.length;
							for (var t = 0; t < len; t++) {
								var scan_tag = _self.scanPartModel.tagDetails[t];
								/* 校验标签仓库和出货通知单的检验单仓库 */
								console.log(item.whNo.trim() + '!=' + _self.scanPartModel.binWhNo.trim()); //上层
								console.log(item.whNo.trim() + '!=' + scan_tag.binWhNo.trim()); //下层
								if (item.whNo.trim() != scan_tag.binWhNo.trim()) {
									uni.showToast({
										title: '检验单仓库:' + item.whNo.trim() + '与物料仓库：' + scan_tag.binWhNo.trim() + '不一致',
										icon: 'none'
									});
									util.showAudio();
									return;
								}
								//获取相同集合
								//console.log(scan_tag.partItemNo + "====" + i + "=====" + _self.scanPartModel.partItemNo + "&&" + scan_tag.lastScanQty +">" + 0)
								if (item.partItemNo.trim() == scan_tag.partItemNo.trim() && item.lastScanQty > 0) {
									//相同物料并且没扫完
									item.for_index = i;
									_self.details_list.push(item);
									//	console.log("	item.lastScanQty------" + item.lastScanQty);
									sum = util.floatObj.add(sum, item.lastScanQty);
								}
							}
							console.log(util.outputLog(_self.details_list));
						} else {
							//没有tagDetails
							/* 校验标签仓库和出货通知单的检验单仓库 */
							console.log(item.whNo.trim() + '!=' + _self.scanPartModel.binWhNo.trim());
							if (item.whNo.trim() != _self.scanPartModel.binWhNo.trim()) {
								uni.showToast({
									title: '检验单仓库:' + item.whNo.trim() + '与物料仓库：' + _self.scanPartModel.binWhNo.trim() + '不一致',
									icon: 'none'
								});
								util.showAudio();
								return;
							}
							//获取相同集合
							if (item.partItemNo.trim() == _self.scanPartModel.partItemNo.trim() && item.lastScanQty > 0) {
								//相同物料并且没扫完
								item.for_index = i;
								_self.details_list.push(item);
								sum = util.floatObj.add(sum, item.lastScanQty);
							}
						}
					}
					/* 没有相同物料 */
					if (sum <= 0) {
						uni.showToast({
							title: '物料与单据上的不一致',
							icon: 'none'
						});
						util.showAudio();
						return;
					}
					/* 发货总数量对比扫描数量 */
					if (_self.scanPartModel.tagDetails) {
						//有tagDetails
						var sheetQty = 0;
						var len = _self.scanPartModel.tagDetails.length;
						for (var t = 0; t < len; t++) {
							var scan_tag = _self.scanPartModel.tagDetails[t];
							sheetQty = util.floatObj.add(sheetQty, scan_tag.sheetQty);
						}
						if (Number(sheetQty) > sum) {
							//外箱，卡板，混装数量加起来不能超过sum
							//可能是外箱标签和内箱标签
							//外箱标签拆分到pc操作
							uni.showToast({
								title: '数量' + sum + '与发货标签数量不一致:请拆分处理.',
								icon: 'none'
							});
							util.showAudio();
							return;
						}
					} else {
						if (Number(_self.scanPartModel.sheetQty) > Number(sum)) {
							//内箱标签拆分到pda拆分处理
							uni.showToast({
								title: '总数量' + sum + '与发货标签数量不一致:请拆分处理.',
								icon: 'none'
							});
							util.showAudio();
							return;
						}
					}
					//判断是否需要授权
					let lockObj = null;
					if (res.resultCode == '-11') {
						lockObj = res.resultText; //授权信息
					} else {
						//无需同意
						_self.arr_split(_self.details_list, _self.scanPartModel);
						console.log(_self.scanPartModel);
					}

					//锁屏判断
					if (lockObj && lockObj.length > 0) {
						//需要授权
						for (var i = 0; i < this.details.length; i++) {
							let item = this.details[i];
							if (item.partItemNo == _self.scanPartModel.partItemNo) {
								_self.onScrollTop(i);
								break;
							}
						}
						this.lockModel.description = lockObj;
						this.lockModel.sourceId = _self.scanPartModel.inLot;
						this.showAuth = true;
						util.showAudio();
						return;
					}
					util.showScanedAudio();
				},
				failure: message => {
					util.showAudio();
				},
				complete: (status, message, content) => {
					this.$refs.input_part.setFocus();
					util.tryCatchApi({
						status: status,
						message: message
					});
					uni.hideLoading();
				}
			});
		},
		onSave() {
			//保存
			var _self = this;
			//判断是否所有的都已扫描完成
			let isFinish = true;
			_self.dataModel.scmInoutBars = [];
			if (this.details.length > 0) {
				for (let i = 0; i < this.details.length; i++) {
					let item = this.details[i];
					if (item.lastScanQty > 0) {
						isFinish = false;
						break;
					}
					_self.dataModel.scmInoutBars.push(item.scantagDetails[i]);
				}
			} else {
				util.showAudio();
				uni.showToast({
					title: '请扫描通知单',
					icon: 'none'
				});
				return;
			}
			console.log(util.outputLog(this.dataModel));
			if (!isFinish) {
				util.showAudio();
				uni.showToast({
					title: '扫描未完成',
					icon: 'none'
				});
				return;
			}

			if (this.dataModel.scmInoutBars.length < 0) {
				util.showAudio();
				uni.showToast({
					title: '提交的数据有误',
					icon: 'none'
				});
				return;
			}
			console.log(util.outputLog(_self.dataModel));
			/* 解析入库信息 */
			uni.showLoading({
				mask: true
			});
			apis.Pda_pdaaddsaloutbyoqcspcquality({
				data: _self.dataModel,
				success: res => {
					uni.showToast({
						title: '保存成功'
					});
					util.dataInit(this);
					this.$refs.input_order.setFocus();
				},
				failure: message => {
					this.$refs.input_part.setFocus();
					util.showAudio();
				},
				complete: (status, message, content) => {
					util.tryCatchApi({
						status: status,
						message: message
					});
					uni.hideLoading();
				}
			});
		},

		updateScanList() {
			//更新列表结果
			var scanQty = 0;
			console.log(this.orderItemSelected);
			for (var i = 0; i < this.orderItemSelected.scantagDetails.length; i++) {
				scanQty = util.floatObj.add(scanQty, this.orderItemSelected.scantagDetails[i].sheetQty);
			}
			this.orderItemSelected.scanQty = scanQty;
			this.orderItemSelected.lastScanQty = util.floatObj.subtract(this.orderItemSelected.sheetQty, scanQty); //单个引用赋值有时数据源不会更新视图(可能是我的写法它无法更新或不支持)
			var detail = util.clone(this.details); //所以先复制一份，（赋值不要直接引用赋值,最好是克隆根对象）
			this.details = detail; //重新给他赋值，就更新好了
		},
		/* 选中的方法 */
		onSelectedItem(e) {
			for (var i = 0; i < this.details.length; i++) {
				var item = this.details[i];
				if (i == e) {
					item.selectItemClass = 'uni-list-cell-selected';
					this.orderItemSelected = item;
				} else {
					item.selectItemClass = '';
				}
			}
		},
		scroll(e) {
			//滚动
			this.old.scrollTop = e.detail.scrollTop;
		},
		onScrollTop(index) {
			//滚动定位
			this.onSelectedItem(index);
			let view = uni
				.createSelectorQuery()
				.in(this)
				.select('.scroll-view-item');
			view.boundingClientRect(data => {
				this.scrollTop = this.old.scrollTop;
				this.$nextTick(function() {
					this.scrollTop = data.height * index;
				});
			}).exec();
		},
		authClick(e) {
			var _self = this;
			this.showAuth = false;
			// 授权
			// 将授权结果保存到服务器
			for (var i = 0; i < this.details.length; i++) {
				let item = this.details[i];

				if (item.partItemNo == _self.scanPartModel.partItemNo) {
					_self.dataModel.mesLockscreenLogs.push(e);
					break;
				}
			}
			if (e.resultSta == 1) {
				//同意
				_self.arr_split(_self.details_list, _self.scanPartModel);
				console.log(_self.scanPartModel);

				for (var i = 0; i < _self.details_list.length; i++) {
					//定位更新位置
					_self.onScrollTop(_self.details_list[i].for_index);
					_self.updateScanList();
				}
			}
			this.$refs.input_part.setFocus();
		},
		arr_split(arr, scan) {
			var _self = this;
			console.log(scan);
			if (scan.tagDetails) {
				//有两种情况
				for (var j = 0; j < scan.tagDetails.length; j++) {
					var item = scan.tagDetails[j];
					console.log(item);

					var last = item.sheetQty;
					/* 先取标签数量是相等的 */
					for (var i = 0; i < arr.length; i++) {
						console.log(arr[i].lastScanQty == last && last != 0);
						if (arr[i].lastScanQty == last) {
							var new_scan = util.clone(item);
							_self.scantagDetails_push(new_scan, arr, i);
							last = 0;
							break;
						}
					}
					/* 多个 */
					for (var i = 0; i < arr.length; i++) {
						var new_scan = util.clone(item);
						if (arr[i].lastScanQty >= last && last != 0) {
							new_scan.sheetQty = last;
							_self.scantagDetails_push(new_scan, arr, i);
							last = 0;
							break;
						} else if (last > arr[i].lastScanQty) {
							last = last - arr[i].lastScanQty;
							new_scan.sheetQty = arr[i].lastScanQty;
							_self.scantagDetails_push(new_scan, arr, i);
						}
					}
				}
			} else {
				console.log(scan);
				var last = scan.sheetQty;
				/* 先取标签数量是相等的 */
				for (var i = 0; i < arr.length; i++) {
					console.log(arr[i].lastScanQty == last && last != 0);
					if (arr[i].lastScanQty == last) {
						var new_scan = util.clone(scan);
						_self.scantagDetails_push(new_scan, arr, i);
						last = 0;
						break;
					}
				}
				/* 多个 */
				for (var i = 0; i < arr.length; i++) {
					var new_scan = util.clone(scan);
					if (arr[i].lastScanQty >= last && last != 0) {
						new_scan.sheetQty = last;
						_self.scantagDetails_push(new_scan, arr, i);
						last = 0;
						break;
					} else if (last > arr[i].lastScanQty) {
						last = last - arr[i].lastScanQty;
						new_scan.sheetQty = arr[i].lastScanQty;
						_self.scantagDetails_push(new_scan, arr, i);
					}
				}
			}
		},
		scantagDetails_push(new_scan, arr, i) {
			console.log('=======================================================');

			console.log(arr[i]);
			console.log(new_scan);
			new_scan.sheetType = arr[i].sheetType;
			new_scan.sheetNo = arr[i].sheetNo;
			new_scan.sheetLot = arr[i].sheetLot;
			// new_scan.binNo = new_scan.binNo;      //已处理
			// new_scan.binWhNo =new_scan.binWhNo;  //已处理
			// new_scan.partAttr = new_scan.partAttr || null;
			// new_scan.purLot = new_scan.purLot || null;
			// new_scan.linkBoardQty = new_scan.linkBoardQty || null;
			// new_scan.sourceType = new_scan.sourceType || null;
			// new_scan.printQty = new_scan.printQty || null;
			new_scan.printDate = new_scan.printDate || new Date().format('yyyy/MM/dd');
			//new_scan.userNo = new_scan.userNo || null;
			new_scan.createDate = new_scan.createDate || new Date().format('yyyy/MM/dd');
			// new_scan.boxQty = new_scan.boxQty || null;
			// new_scan.boxInQty = new_scan.boxInQty || null;
			// new_scan.createTagQty = new_scan.createTagQty || null;
			// new_scan.checkQty = new_scan.checkQty || null;
			// new_scan.lotSw = new_scan.lotSw || null;
			new_scan.serialSw = new_scan.serialSw || null;
			//new_scan.partDefine1 = new_scan.partDefine1 || null;//1-10有值partDefine1
			new_scan.inoutFlag = 2;
			new_scan.purLot = new_scan.poMoSoLot; //采购批号
			new_scan.sourceNo = arr[i].sheetNo; //来源单号||检验单
			new_scan.entityState = consts.entityState.added;
			new_scan.qrCode = this.qrCode;

			this.details[arr[i].for_index].scantagDetails = this.details[arr[i].for_index].scantagDetails || [];
			console.log(new_scan);
			this.details[arr[i].for_index].scantagDetails.push(new_scan);
			this.onScrollTop(i);
			this.updateScanList();
			util.automateSave(this.details, 'lastScanQty', 0, this.onSave);
		}
	}
};
</script>

<style></style>
