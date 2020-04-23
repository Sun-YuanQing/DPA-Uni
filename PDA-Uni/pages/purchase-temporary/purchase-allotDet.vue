<!-- 采购调拨 -->
<template>
	<view>
		<view id="viewHeader">
			<!-- 单号 扫描 -->
			<barcode-input ref="input_store" @onScaned="onStoreScaned" v-if="isStorageBin" :focus="isStorageBin" :clearScan="false"
			 :placeholder="placeholder_store"></barcode-input>
			<barcode-input ref="input_part" @onScaned="onPartScaned" :focus="isStorageBin == false" placeholder="请扫描料号"></barcode-input>
			<view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">单号：</view>
					<view class="uni-list-cell-db">{{ order.sheetNo }}</view>
				</view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">单据日期：</view>
					<view class="uni-list-cell-db">{{ order.sheetDate }}</view>
				</view>
			</view>
		</view>

		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item, index) in order.details" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)"
					 v-bind:class="item.selectItemClass">
						<view class="uni-flex uni-column" style="width: 100%;">
							<view class="uni-triplex-row">
								<view class="uni-triplex-left">
									<text class="uni-title">料号:{{ item.partItemNo }}</text>
									<text class="uni-title">料品名称:{{ item.partName }}</text>
									<text class="uni-title">仓库:{{ item.whNo }}</text>
									<text class="uni-title">上架仓库:{{ item.whNo1 }}</text>
									<text class="uni-title">调拨数量: {{ item.sheetQty }}</text>
								</view>
								<view class="uni-triplex-right">
									<text class="uni-h5">单位:{{ item.unitName }}</text>
									<text class="uni-h5" style="margin-left: -300upx;">已扫描数量:{{ item.scanQty }}</text>
									<text class="uni-h5" style="margin-left: -300upx;">未扫描数量:{{ item.lastScanQty }}</text>
								</view>
							</view>
							<view class="uni-triplex-row">
								<view class="div-table fixed-thead">
									<view class="thead">
										<view class="th">
											<view class="td" style="width:20%">货架</view>
											<view class="td" style="width:60%">批次</view>
											<view class="td" style="width:20%">数量</view>
										</view>
									</view>
									<view class="tbody">
										<block v-for="(item1, index) in item.tagDetails" :key="index">
											<view class="tr">
												<view class="td" style="width:20%">{{ isStorageBin ? item1.binNo : item1.binWhNo }}</view>
												<view class="td" style="width:60%">{{ item1.inLot }}</view>
												<view class="td" style="width:20%">{{ item1.sheetQty }}</view>
											</view>
										</block>
									</view>
								</view>
							</view>
						</view>
					</view>
				</block>
			</view>
		</scroll-view>
		<!-- 底部按钮模块 -->
		<page-foot ref="viewBtm"><button type="primary" @click="onSave">保存</button></page-foot>
	</view>
</template>

<script>
	var date = new Date();

	import barcodeInput from '../../components/barcode-input/barcode-input.vue';
	import apis from '../../common/apiService.js';
	import storage from '../../common/storage.js';
	import consts from '../../common/consts.js';
	import util from '../../common/util.js';
	import {
		mapMutations
	} from 'vuex';
	export default {
		components: {
			barcodeInput
		},
		data() {
			return {
				//显示录入批次信息
				showInLot: false,
				old: {
					scrollTop: 0
				},
				scrollTop: 0,
				scrollHeight: 0,
				placeholder_store: '',
				isStorageBin: null, //是否启用储位，否改储位
				binNo: '',
				binWhNo: '',
				order: {
					sheetNo: '',
					sheetDate: ''
				},
				item_details: null,
				orderItemSelected: {}, //当前选中项
				orderItemSelected_input: {
					inLot: '' //批次号
				} //弹出输入项
			};
		},
		onLoad(e) {
			var _self = this;
			_self.order = JSON.parse(e.order);
			console.log(_self.order);
			_self.item_details = util.clone(_self.order.details); /* 备份 */
			for (let i = 0; i < _self.order.details.length; i++) {
				let item = _self.order.details[i];
				item.scanQty = 0;
				item.lastScanQty = item.sheetQty;
			}
			_self.isStorageBin = storage.get(consts.storageKeys.IsStorageBin);
			if (_self.isStorageBin) {
				_self.placeholder_store = '扫描储位';
			} else {
				_self.placeholder_store = '扫描仓库';
			}
		},
		onReady() {
			util.getListHeight(this);
		},
		onBackPress(options) {
			return util.backPress(options, this.order.details);
		},
		methods: {
			...mapMutations(['pageIO_true']),
			onStoreScaned(e) {
				if (!this.order.details) {
					uni.showToast({
						title: '请先扫描单号',
						icon: 'none'
					});
					util.showAudio();
					this.$refs.input_order.setFocus();
					return;
				}
				uni.showLoading({
					mask: true
				});
				if (this.isStorageBin) {
					apis.bas_storagebin({
						data: {
							binNo: e
						},
						success: res => {
							console.log(util.outputLog(res));
							if (res.length <= 0) {
								uni.showToast({
									title: '货架不存在!',
									icon: 'none'
								});
								this.$refs.input_store.clear();
								util.showAudio();
							} else {
								this.binNo = res[0].binNo;
								this.binWhNo = res[0].whNo;
								console.log(this.binNo + '----' + this.binWhNo);
								this.$refs.input_part.setFocus();
								util.showScanedAudio();
							}
						},
						complete: (status, message, content) => {
							util.tryCatchApi({
								status: status,
								message: message
							});
							uni.hideLoading();
						}
					});
				}
			},
			onPartScaned(e) {
				var _self = this;
				apis.basic_QRCodeAnalysis({
					data: {
						qrCode: e
					},
					success: res => {
						var _res = res;
						//校验批次、料号和数量是否正确
						//校验是否重复扫描
						let isexist = false;
						for (var i = 0; i < _self.order.details.length; i++) {
							var detail = util.clone(_self.item_details[i]);
							let item = _self.order.details[i];
							item.tagDetails = item.tagDetails || []; //子明细批号（扫的集合统计的同一批次数量的总和）
							item.scanTagDetails = item.scanTagDetails || []; //扫的集合（逻辑需要）
							//判断是否已扫

							for (var j = 0; j < item.scanTagDetails.length; j++) {
								let scantag = item.scanTagDetails[j];
								if (scantag.qrCode === e) {
									_self.onScrollTop(i);
									uni.showModal({
										title: '提示',
										content: '该标签已扫描,是否要删除',
										success: function(res_mod) {
											if (res_mod.confirm) {
												//有3个地方的数量要发生变化
												item.scanTagDetails.splice(j, 1); //删除一张扫描的条码标签（与显示已扫有关）1
												for (var t = 0; t < item.tagDetails.length; t++) {
													//处理提交的批次标签数量
													if (item.tagDetails[t].inLot.toLowerCase() == _res.inLot.toLowerCase()) {
														//批次标签数量减去删除的数量
														item.tagDetails[t].sheetQty = util.floatObj.subtract(item.tagDetails[t].sheetQty, _res.sheetQty); //2
														for (var h = 0; h < item.tagDetails[t].tagDetails.length; h++) {
															if (item.tagDetails[t].tagDetails[h].qrCode === e) {
																item.tagDetails[t].tagDetails.splice(h, 1);
															}
														}
													}
													if (item.tagDetails[t].sheetQty <= 0) {
														//批次标签数量减为零时，删除批次标签
														item.tagDetails.splice(t, 1); //3
													}
												}
												_self.updateScanList();
											} else if (res_mod.cancel) {}
										}
									});
									util.showAudio();
									return;
								}
							}
							//相同物料，批次累加，不同插入新的批次记录,inoutFlag下架标记 1、上架；2、下架
							if (item.partItemNo == res.partItemNo) {
								if (item.lastScanQty == 0) {
									continue;
								}
								_self.onScrollTop(i);
								if (_self.binWhNo != item.whNo1) {
									uni.showToast({
										title: '货架的仓库与单据上的上架仓库不一致!',
										icon: 'none'
									});
									this.$refs.input_store.clear();
									util.showAudio();
									return;
								}
								if (_self.isStorageBin) {
									res.binNo1 = _self.binNo;
									res.binWhNo1 = _self.binWhNo;
								} else {
									res.binNo1 = item.whNo1;
									res.binWhNo1 = item.whNo1;
								}
								res.proDate = date.format('yyyy/MM/dd hh:mm:ss') || new Date().format('yyyy/MM/dd hh:mm:ss');
								res.qrCode = e;
								res.purLot = detail.purLot;
								res.sheetSta = 2;
								res.sheetNo = detail.sheetNo;
								res.inOutFlag = 2;
								res.sheetLot = detail.sheetLot;
								res.sheetType = _self.order.sheetType;
								res.sourceType = 2; /* 来源类型 1.盘点 2.调拨 */
								res.entityState = consts.entityState.added;
								//res.ordLot =res.tagDetails.ordLot;
								// res.tagId
								isexist = true; //标签物料匹配
								if (util.floatObj.subtract(item.sheetQty, item.scanQty) < res.sheetQty) {
									//单据数量-已扫数量<扫描数量
									uni.showToast({
										title: '超出应调拨数量',
										icon: 'none'
									});
									util.showAudio();
									return;
								}
								item.scanTagDetails.push({
									model: util.clone(res), //去掉引用
									qrCode: e
								});

								_self.updateScanList();
								var tag_CodeBool = false;
								for (var t = 0; t < item.tagDetails.length; t++) {
									if (item.tagDetails[t].inLot.toLowerCase() == res.inLot.toLowerCase()) {
										//小写,批次累加
										item.tagDetails[t].sheetQty = util.floatObj.add(item.tagDetails[t].sheetQty, res.sheetQty);
										item.tagDetails[t].tagDetails = item.tagDetails[t].tagDetails || [];
										item.tagDetails[t].tagDetails.push(res);
										tag_CodeBool = true;
									}
								}

								if (!tag_CodeBool) {
									//inLot不相等
									//保存子明细必要属性

									if (_self.isStorageBin) {
										detail.binNo1 = _self.binNo;
										detail.binWhNo1 = _self.binWhNo;
									} else {
										detail.binNo1 = item.whNo1;
										detail.binWhNo1 = item.whNo1;
									}
									detail.sheetQty = res.sheetQty;
									//console.log(res.sheetQty+"----"+ res.sheetPri);
									detail.sheetAmt = util.floatObj.multiply(res.sheetQty, detail.sheetPri);
									detail.proDate = date.format('yyyy/MM/dd hh:mm:ss') || new Date().format('yyyy/MM/dd hh:mm:ss');
									detail.inLot = res.inLot;
									detail.reservelocus = res.reservelocus;

									detail.qrCode = e;
									detail.sheetSta = 2;
									detail.inOutFlag = 2;
									detail.sheetType = _self.order.sheetType;
									detail.sourceType = 2; /* 来源类型 1.盘点 2.调拨 */
									var tagDetails = util.clone(detail);
									var max_sheetLot = 0;
									for (var t = 0; t < item.tagDetails.length; t++) {
										item.tagDetails[t].sheetLot = item.tagDetails[t].sheetLot || item.sheetLot;
										if (max_sheetLot < Number(item.tagDetails[t].sheetLot.split('_')[1])) {
											max_sheetLot = Number(item.tagDetails[t].sheetLot.split('_')[1]);
										}
									}

									var sheetLot = item.sheetLot.split('_');
									max_sheetLot += 1;
									if (max_sheetLot == 1) {
										//为1不增加批号后缀
										res.sheetLot = detail.sheetLot; //tagDetails.sheetLot
										detail.entityState = consts.entityState.modified;
										//console.log(res)
									} else {
										detail.sheetAmt = util.floatObj.multiply(res.sheetQty, detail.sheetPri);
										switch (max_sheetLot.toString().length) {
											case 1 /* 批号的数字长度1-9的话，规定格式——001 */ :
												detail.sheetLot = sheetLot[0] + '_' + util.getSuffix(3, max_sheetLot);
												res.sheetLot = detail.sheetLot; //tagDetails.sheetLot
												detail.entityState = consts.entityState.added;
												//console.log(res)
												break;
											case 2 /* 批号的数字长度10-99的话，规定格式——011 */ :
												detail.sheetLot = sheetLot[0] + '_' + util.getSuffix(2, max_sheetLot);
												res.sheetLot = detail.sheetLot; //tagDetails.sheetLot
												detail.entityState = consts.entityState.added;
												//console.log(res)
												break;
										}
									}
									detail.tagDetails = detail.tagDetails || [];
									detail.tagDetails.push(res);
									console.log(util.outputLog(detail))
									item.tagDetails.push(detail);
									//console.log(_self.order);
									uni.showToast({
										title: '扫描成功'
									});
									//console.log(_self.order)
									util.showScanedAudio();
									break;
								}
							}
							if (!isexist) {
								uni.showToast({
									title: '扫描错误，当前标签不属于该单据',
									icon: 'none'
								});
								util.showAudio();
							} else {
								util.showScanedAudio();
							}
						}
						util.automateSave(_self.order.details, 'lastScanQty', 0, _self.onSave);

						this.$refs.input_part.setFocus();
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
			onSave() {
				//保存
				var _self = this;
				//判断是否所有的都已扫描完成
				for (let i = 0; i < _self.order.details.length; i++) {
					let item = _self.order.details[i];
					if (item.lastScanQty > 0) {
						uni.showToast({
							title: '当前项,还有未扫描的数据!',
							icon: 'none'
						});
						_self.onScrollTop(i);
						return;
					} else {
						_self.order.entityState = consts.entityState.modified;
					}
				}

				console.log(_self.order);
				
				var details=_self.order.details;//用来出错恢复
				var new_details = [];    //提交的物料数据明细
				for (let i = 0; i < _self.order.details.length; i++) {
					var item = _self.order.details[i];
					var tagDetails = util.clone(item.tagDetails);
					for (let t = 0; t < tagDetails.length; t++) {
						tagDetails[t].sheetSta = 2;
						new_details.push(tagDetails[t]);
					}
				}
			
				_self.order.details = [];
				_self.order.details = new_details; /* 被处理过的_self.order.details */
				_self.order.sourceType = 2; /* 来源类型 1.盘点 2.调拨 */
				_self.order.sheetSta = 2;
				console.log(util.outputLog(_self.order));
				uni.showLoading({
					mask: true
				});
				apis.scmdb_Save({
					data: _self.order,
					success: res => {
							console.log('保存成功')
						uni.showToast({
							title: '保存成功!'
						});
						util.dataInit(this);
						_self.pageIO_true();
						_self.isStorageBin = storage.get(consts.storageKeys.IsStorageBin);
						if (_self.isStorageBin) {
							_self.placeholder_store = '扫描储位';
						} else {
							_self.placeholder_store = '扫描仓库';
						}
					},
					failure: (message) => {
						console.log('出错')
						_self.order.details = details; //用来出错恢复
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
			scroll(e) {
				//滚动
				this.old.scrollTop = e.detail.scrollTop;
			},
			onScrollTop(index) {
				//滚动定位
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
				this.onSelectedItem(index);
			},
			/* 选中的方法 */
			onSelectedItem(e) {
				for (var i = 0; i < this.order.details.length; i++) {
					var item = this.order.details[i];
					if (i == e) {
						item.selectItemClass = 'uni-list-cell-selected';
						this.orderItemSelected = item;
					} else {
						item.selectItemClass = '';
					}
				}
			},
			updateScanList() {
				//更新列表结果
				var scanQty = 0;
				console.log(this.orderItemSelected);
				for (var i = 0; i < this.orderItemSelected.scanTagDetails.length; i++) {
					scanQty = util.floatObj.add(scanQty, this.orderItemSelected.scanTagDetails[i].model.sheetQty);
				}
				this.orderItemSelected.scanQty = scanQty;
				this.orderItemSelected.lastScanQty = util.floatObj.subtract(this.orderItemSelected.sheetQty, scanQty); //单个赋值有时数据源不会更新视图
				var ItemSelected = util.clone(this.orderItemSelected); //所以先复制一份，（赋值不要直接引用赋值）
				this.orderItemSelected = ItemSelected; //重新给他赋值就更新好了
			}
		}
	};
</script>

<style></style>
