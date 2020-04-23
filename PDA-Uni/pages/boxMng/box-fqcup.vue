<!--FQC检验装箱  抽检数量，送检数量都手输  李庚，朱永军?  //孙元清：抽检数量应该可以放在扫描后输，因为保存，扫的数量必须大于抽检数量（但是没有这么做）-->
<!-- 保存：1.扫的数量必须大于抽检数量>抽检数量.2.未送检数量>送检数量 -->
<template>
	<view>
		<view id="viewHeader">
			<barcode-input ref="input_order" @onScaned="onScaned" v-model="purLot" :focus="true" :clearScan="false" placeholder="请扫描工单批号"></barcode-input>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">抽检数量:</view>
				<view class="uni-list-cell-db"><input ref="input_testNum" type="number" placeholder="0" :focus="testNumFocus" v-model="testNum" @blur="onTestNumBlur" /></view>
			</view>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">送检数量:</view>
				<view class="uni-list-cell-db"><input ref="input_sheetQty" type="number" placeholder="0" :focus="sheetQtyFocus" v-model="sheetQty" @blur="onsheetQtyBlur" /></view>
			</view>

			<barcode-input ref="input_box" @onScaned="onBoxScaned" placeholder="请扫描外箱包装"></barcode-input>
			<barcode-input ref="input_part" @onScaned="onPartScaned" placeholder="请扫描料号"></barcode-input>

			<view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">料品编码:</view>
					<view class="uni-list-cell-db">{{ order.partItemNo }}</view>
				</view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">未送检数量:</view>
					<view class="uni-list-cell-db">{{ order.receiveQty }}</view>
					<view class="uni-list-cell-left">送检数量:</view>
					<view class="uni-list-cell-db">{{ sheetQty }}</view>
				</view>
			</view>
		</view>
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item, index) in boxlist" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)" v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title">箱标签ID:{{ item.tagId }}</text>
								<text class="uni-title">料品编码:{{ item.partItemNo }}</text>
								<text class="uni-title">料品名称:{{ item.partName }}</text>
								<text class="uni-title">数量:{{ item.sheetQty }}</text>
							</view>
							<view class="uni-triplex-right">
								<text class="uni-h5" style="margin-left:-200px ;">单位:{{ item.unitName }}</text>
								<text class="uni-h5" style="margin-left:-200px ;">已检数量:{{ item.scanQty }}</text>
								<text class="uni-h5" style="margin-left:-200px ;">未检数量:{{ item.lastScanQty }}</text>
							</view>
						</view>
					</view>
				</block>
			</view>
		</scroll-view>
		<!-- 底部按钮模块 -->
		<page-foot ref="viewBtm">
			<button type="primary" @click="onSave(true)" style="width: 49%; margin-right: 10px; float: left;">QC合格</button>
			<button @click="onSave(false)">QC不合格</button>
		</page-foot>
	</view>
</template>

<script>
import barcodeInput from '../../components/barcode-input/barcode-input.vue'; //扫码组件

import apis from '../../common/apiService.js'; //系统api
import consts from '../../common/consts.js';
import storage from '../../common/storage.js';
import util from '../../common/util.js'; //常用功能

export default {
	components: {
		barcodeInput
	},
	data() {
		return {
			testNum: '', //抽检数量
			sheetQty: '', //送检数量
			testNumFocus: false,
			sheetQtyFocus: false,
			testTotal: 0,
			old: {
				scrollTop: 0
			},
			scrollTop: 0,
			scrollHeight: 0,
			boxlist: [],
			order: {
				purLot: '',
				partItemNo: '',
				receiveQty: ''
			}
		};
	},
	onReady() {
		util.getListHeight(this);
	},
	onBackPress(options) {
		return util.backPress(options, this.boxlist.length > 0);
	},
	methods: {
		onScaned(e) {
			//扫描工单批号

			uni.showLoading({
				mask: true
			});
			apis.boxfqc_getDetail({
				data: {
					moLot: e
				},
				success: res => {
					this.order = res;
					this.testNumFocus = true;
					util.showScanedAudio();
				},
				failure: message => {
					util.showAudio();
					this.$refs.input_order.setFocus();
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
		onTestNumBlur() {
			this.testNumFocus = true;
		},
		onsheetQtyBlur() {
			this.sheetQtyFocus = true;
		},
		onBoxScaned(e) {
			if (this.order.purLot.length == 0) {
				uni.showToast({
					title: '请先扫描工单批号',
					icon: 'none'
				});
				util.showAudio();
				this.$refs.input_order.setFocus();
				return;
			}
			if (Number(this.sheetQty) == 0) {
				uni.showToast({
					title: '请输入送检数量',
					icon: 'none'
				});
				this.sheetQtyFocus = true;
				util.showAudio();
				this.$refs.input_box.setFocus();
				return;
			}

			//料品信息标签扫描完成
			uni.showLoading({
				mask: true
			});
			let _self = this;
			apis.boxfqc_boxScan({
				data: {
					boxQrCode: e
				},
				success: res => {
					//console.log(util.outputLog(res));

					if (Number(this.sheetQty) > Number(this.order.receiveQty)) {
						uni.showToast({
							title: '送检数量应小于工单未送检数量',
							icon: 'none'
						});
						util.showAudio();
						this.$refs.input_box.setFocus();
						return;
					}
					if (Number(this.testNum) > Number(this.sheetQty)) {
						uni.showToast({
							title: '抽检数量应小于工单送检数量',
							icon: 'none'
						});
						util.showAudio();
						this.$refs.input_box.setFocus();
						return;
					}
					if (this.order.partItemNo != res.partItemNo) {
						uni.showToast({
							title: '扫描标签上的物料与工单上的不同',
							icon: 'none'
						});
						util.showAudio();
						this.$refs.input_box.setFocus();
						return;
					} /* 李艮注释 */ // if (this.order.whNo != res.binWhNo) { // 	uni.showToast({ // 		title: '工单批号仓库：' + this.order.whNo + '与外箱仓库:' + res.binWhNo + "不一致",
					/* 工单批号仓库对比外箱仓库 */ // 		icon: 'none'
					// 	})
					// 	util.showAudio();
					// 	this.$refs.input_box.setFocus();
					// 	return;
					// }
					console.log(util.outputLog(res));
					for (var i = 0; i < _self.boxlist.length; i++) {
						let item = _self.boxlist[i];
						if (item.tagId == res.tagId) {
							_self.onScrollTop(i);
							uni.showModal({
								title: '提示',
								content: '该标签已扫描,是否要删除',
								success: function(res_mod) {
									if (res_mod.confirm) {
										_self.boxlist.splice(i, 1);
										_self.testTotal = util.floatObj.subtract(_self.testTotal, res.sheetQty); //扫描的总数
									} else if (res_mod.cancel) {
									}
								}
							});
							util.showAudio();
							_self.$refs.input_box.setFocus();
							return;
						}
					}
					res.scanQty = 0;
					res.sheetQty = Number(res.sheetQty);
					res.lastScanQty = Number(res.sheetQty);
					_self.boxlist.push(res);
					_self.testTotal = util.floatObj.add(_self.testTotal, res.sheetQty); //扫描的总数
					util.showScanedAudio();
					_self.$refs.input_part.setFocus();
				},
				failure: message => {
					util.showAudio();
					_self.$refs.input_box.setFocus();
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
			console.log(e);
			let _self = this;
			//料品信息标签扫描完成
			uni.showLoading({
				mask: true
			});
			apis.boxfqc_QRCodeAnalysis({
				data: {
					qrCode: e,
					enumBarCode: 6 //无 : 0, 料品内码 : 1, 料品编码 : 2, 储位 : 3, 储位所属仓库 : 4, 批次号 : 5, 序列号 : 6, 标签ID : 7, 箱号标签ID : 8, 客户标签ID : 9, 采购批号 : 10, 厂家生产批次 : 11, 订单批号 : 12, 报工ID : 13, 工序内码 : 14, 工序编码 : 15, 设备编码 : 16, 客户订单号 : 17, 客户料号 : 18, 客户箱标签 : 19
				},
				success: res => {
					console.log(util.outputLog(res));
					// 首先定位箱号位置
					// 判断当前标签是否已扫描过
					//判断 lastScanQty ==0 则光标定位到箱号上
					var pos = {
						x: -1,
						y: -1
					};
					for (var i = 0; i < _self.boxlist.length; i++) {
						var item = _self.boxlist[i];
						for (var j = 0; j < item.tagDetails.length; j++) {
							var tagItem = item.tagDetails[j];
							if (tagItem.tagId == res.tagId) {
								tagItem.isScaned = tagItem.isScaned || false;
								_self.onScrollTop(i);
								if (tagItem.isScaned) {
									uni.showToast({
										title: '当前标签已校验过了',
										icon: 'none'
									});
									util.showAudio();
									_self.$refs.input_part.setFocus();
									return;
								}
								pos = {
									x: i,
									y: j
								};
								break;
							}
						}
					}
					console.log(pos);
					if (pos.x == -1) {
						uni.showToast({
							title: '标签扫描错误，该标签不在以下箱子中',
							icon: 'none'
						});
						util.showAudio();
						_self.$refs.input_part.setFocus();
						return;
					} else {
						uni.showToast({
							title: '校验成功'
						});
						console.log(_self.boxlist[pos.x]);
						_self.boxlist[pos.x].tagDetails[pos.y].isScaned = true;
						_self.boxlist[pos.x].scanQty = util.floatObj.add(_self.boxlist[pos.x].scanQty, res.sheetQty);
						_self.boxlist[pos.x].lastScanQty = util.floatObj.subtract(_self.boxlist[pos.x].lastScanQty, res.sheetQty);
					}
					if (_self.boxlist[pos.x].lastScanQty == 0) {
						_self.$refs.input_box.setFocus();
					} else {
						_self.$refs.input_part.setFocus();
					}
				},
				failure: message => {
					util.showAudio();
					_self.$refs.input_part.setFocus();
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
		onSave(e) {
			//校验抽检数量
			if (Number(this.testNum) <= 0) {
				uni.showToast({
					title: '请输入抽检数量',
					icon: 'none'
				});
				this.testNumFocus = true;
				util.showAudio();
				return;
			}
			if (Number(this.testNum) > Number(this.sheetQty)) {
				uni.showToast({
					title: '抽检数量不能大于送检数量',
					icon: 'none'
				});
				this.testNumFocus = true;
				util.showAudio();
				return;
			}
			if (Number(this.testNum) > this.order.receiveQty) {
				uni.showToast({
					title: '抽检数量应小于工单未送检数量',
					icon: 'none'
				});
				this.testNumFocus = true;
				util.showAudio();
				return;
			}
			if (Number(this.testNum) > this.testTotal) {
				uni.showToast({
					title: '抽检数量应小于扫描总数',
					icon: 'none'
				});
				this.testNumFocus = true;
				util.showAudio();
				return;
			}
			//-------------
			/* 校验 送检数量*/
			if (Number(this.sheetQty) <= 0) {
				uni.showToast({
					title: '请输入送检数量',
					icon: 'none'
				});
				this.sheetQtyFocus = true;
				util.showAudio();
				return;
			}
			if (Number(this.sheetQty) > this.order.receiveQty) {
				uni.showToast({
					title: '送检数量应小于工单未送检数量',
					icon: 'none'
				});
				this.sheetQtyFocus = true;
				util.showAudio();
				return;
			}
			if (Number(this.sheetQty) < this.testTotal) {
				uni.showToast({
					title: '送检数量应>=扫描数量',
					icon: 'none'
				});
				this.sheetQtyFocus = true;
				util.showAudio();
				return;
			}
			//-----------------
			if (this.order.purLot.length == 0) {
				uni.showToast({
					title: '请先扫描工单批号',
					icon: 'none'
				});
				util.showAudio();
				this.$refs.input_order.setFocus();
				return;
			}
			if (this.boxlist.length == 0) {
				uni.showToast({
					title: '请先扫描箱标签',
					icon: 'none'
				});
				util.showAudio();
				this.$refs.input_box.setFocus();
				return;
			}

			let list = [];
			for (let i = 0; i < this.boxlist.length; i++) {
				if (this.boxlist[i].lastScanQty > 0) {
					this.onScrollTop(i);
					uni.showToast({
						title: '请扫完，原箱装回！',
						icon: 'none'
					});
					util.showAudio();
					this.$refs.input_box.setFocus();
					return;
				}

				let clone = util.clone(this.boxlist[i]);
				clone.entityState = consts.entityState.added;
				clone.tagDetails = [];
				list.push(clone);
			}
			console.log('校验完了');
			uni.showLoading({
				mask: true
			});
			/* 只记录抽样的箱号 */
			apis.boxfqc_Post(
				{
					purLot: this.order.purLot,
					sheetQty: this.sheetQty,
					sampleQty: this.testNum,
					spcCheckResult: e ? 1 : 2 //检验结果 1.合格 2.不合格
				},
				{
					data: list,
					success: res => {
						uni.showToast({
							title: '校验成功'
						});
						util.dataInit(this);
					},
					failure: message => {
						util.showAudio();
					},
					complete: (status, message, content) => {
						this.$refs.input_order.setFocus();
						util.tryCatchApi({
							status: status,
							message: message
						});
						uni.hideLoading();
					}
				}
			);
		},
		/* 选中的方法 */
		onSelectedItem(e) {
			let items = util.clone(this.boxlist);
			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				if (i == e) {
					item.selectItemClass = 'uni-list-cell-selected';
				} else {
					item.selectItemClass = '';
				}
			}
			this.boxlist = items;
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
					if (data == null) return;
					this.scrollTop = data.height * index;
				});
			}).exec();
		}
	}
};
</script>

<style></style>
