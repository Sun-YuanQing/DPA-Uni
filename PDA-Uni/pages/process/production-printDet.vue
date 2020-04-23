<!--内包装标签重打 -->
<template>
	<view>
		<view id="viewHeader">
			<barcode-input ref="input_part" @onScaned="onPartScaned" :focus="true" placeholder="扫描内标签"></barcode-input>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">来源批号:</view>
				<view class="uni-list-cell-db">{{ order.poMoSoLot }}</view>
			</view>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">物料编码:</view>
				<view class="uni-list-cell-db">{{ order.partItemNo }}</view>
			</view>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">客户编码:</view>
				<view class="uni-list-cell-db">{{ order.citemNo }}</view>
			</view>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">客户料号:</view>
				<view class="uni-list-cell-db">{{ order.suPartNo }}</view>
			</view>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">工单数量:</view>
				<view class="uni-list-cell-db">{{ order.sheetQty }}</view>
			</view>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">已产生数量:</view>
				<view class="uni-list-cell-db">{{ order.createTagQty }}</view>
				<view class="uni-list-cell-left">未产生数量:</view>
				<view class="uni-list-cell-db">{{ order.lastTagQty }}</view>
			</view>
		</view>
		<view style="position: relative;">
			<view
				v-if="checked_all_show"
				style="position: absolute;top: 20upx;left: 20upx;z-index: 98; border: #007AFF 1px solid;border-radius: 10upx;background: #D5E3F0;"
				@click="onAll_100"
			>
				<view style="float: left;">全选：</view>
				<view style="float: left;width:50upx;height:50upx;border-radius: 50%; border: #007AFF 1px solid;z-index: 99;overflow: hidden;">
					<checkbox style="transform:scale(1.3)" :checked="checked_all" />
				</view>
			</view>
		</view>

		<!-- 显示明显 -->
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item, index) in details" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row" @click="onSelectedItem(index)">
							<view class="uni-triplex-left">
								<text class="uni-title">标签ID:{{ item.tagId }}</text>
								<checkbox :checked="item.checked" />
							</view>
							<view class="uni-triplex-right">
								<text class="uni-h5" style="margin-left: -220upx;">单位:{{ item.partSpec }}</text>
								<text class="uni-h5" style="margin-left: -220upx;">数量:{{ item.sheetQty }}</text>
							</view>
						</view>
					</view>
				</block>
			</view>
		</scroll-view>

		<!-- 底部按钮模块 -->
		<page-foot ref="viewBtm">
			<print-button
				ref="printBtn"
				style="padding: 0upx; width: 48%; margin-right: 10px; float: left;"
				:reportModel="reportModel"
				@click="onPrint"
				@printComplete="printComplete"
				@tagValid="tagValid"
				@printCancel="onprintCancel"
			></print-button>
			<button type="primary" style="padding: 0upx; float: none;" @click="onDelete">删除</button>
		</page-foot>
	</view>
</template>

<script>
import barcodeInput from '../../components/barcode-input/barcode-input.vue'; //扫码组件
import printButton from '../../components/label-print/print-button.vue';

import apis from '../../common/apiService.js'; //系统api
import consts from '../../common/consts.js';
import storage from '../../common/storage.js';
import util from '../../common/util.js'; //常用功能
import { mapState, mapMutations } from 'vuex';
export default {
	components: {
		barcodeInput,
		printButton
	},
	data() {
		return {
			progNo: '',
			reportModel: {
				progNo: '', //页面ID
				showReport: false,
				isMultiPrint: false,
				dataSource: [],
				isNeedValidTag: false //是否需要校验标签
			},
			old: {
				scrollTop: 0
			},
			scrollTop: 0,
			scrollHeight: 0,
			menu: '',
			menu_dele: false,
			order: {
				inLot: '', //批次号
				poMoSoLot: '',
				proDate: ' ',
				citemNo: '',
				suPartNo: '',
				sheetQty: 0,
				createTagQty: 0,
				lastTagQty: 0,
				partItemNo: ''
			},
			checked_all_show: false,
			checked_all: false,
			details: [],
			det_id: 0,
			options_delet: [
				{
					text: '删除',
					style: {
						backgroundColor: 'rgb(255,58,49)'
					}
				}
			]
		};
	},
	onLoad(option) {
		this.reportModel.progNo = option.progNo;
		this.progNo = option.progNo;
		console.log(this.progNo);
		this.order = this.urldata;
		console.log('url传值长度');
		this.menu = storage.get(consts.storageKeys.menu);
		this.menu_dele = false; //删除权限
		for (var m = 0; m < this.menu.length; m++) {
			//取菜单
			var item_m = this.menu[m];
			console.log(item_m);
			if (item_m.progNo == this.progNo) {
				//取相同菜单
				if (item_m.powerDelete == 1) {
					//取删除权限
					this.menu_dele = true;
				}
			}
		}
	},
	onReady() {
		util.getListHeight(this);
		var _self = this;
		if (_self.order.poMoSoLot != '') {
			apis.OpenMes_scmreqbarcode({
				data: {
					moLot: _self.order.purLot
				},
				success: res => {
					if (res.length > 0) {
						res.forEach(function(item) {
							item.checked = false;
						});
						_self.details = res;
					}
					console.log(util.outputLog(_self.details));
				},
				failure: message => {
					_self.$refs.input_part.setFocus();
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
		}
	},
	onBackPress(options) {
		return util.backPress(options, this.details.length > 0);
	},
	computed: mapState(['urldata']),
	methods: {
		...mapMutations(['pageIO_true']),
		onPartScaned(e) {
			//料品信息标签扫描完成
			uni.showLoading({
				mask: true
			});
			apis.basic_QRCodeAnalysis({
				data: {
					qrCode: e
				},
				success: res => {
					var _self = this;
					//校验批次、料号和数量是否正确
					let isexist = false; //标签存在
					for (var i = 0; i < this.details.length; i++) {
						let item = this.details[i];
						if (item.tagId == res.tagId) {
							_self.onScrollTop(i);
							isexist = true;
							_self.onDelete();
						}
					}
					if (!isexist) {
						uni.showToast({
							title: '工单中不存在该标签！！！',
							icon: 'none'
						});
						util.showAudio();
						_self.$refs.input_part.setFocus();
						return;
					}
				},
				failure: message => {
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
		printComplete() {
			console.log('printComplete----------');
			//util.dataInit(this);/* 打印完不清空页面（初始化数据）*/
			this.reportModel.dataSource = []; //单个清空
			this.$refs.input_part.setFocus();
		},
		/**
		 * @param {Object} scanTagModelList 扫描的标签结果集
		 */
		tagValid(scanTagModelList) {
			console.log('tagValid----------');
			//util.dataInit(this);/* 打印完不清空页面 （初始化数据）*/
			this.$refs.input_part.setFocus();
		},
		onprintCancel() {
			//取消打印（打印会话）
			this.reportModel.dataSource = [];
		},
		scroll(e) {
			//滚动
			this.old.scrollTop = e.detail.scrollTop;
		},
		/**
		 * @description  gun dong ding wei
		 */
		onScrollTop(index) {
			//滚动定位
			this.onSelectedItem(index);
			let view = uni
				.createSelectorQuery()
				.in(this)
				.select('.scroll-view-item');
			view.boundingClientRect(data => {
				this.scrollTop = this.old.scrollTop;
				if (data == null) return;
				this.$nextTick(function() {
					this.scrollTop = data.height * index;
				});
			}).exec();
		},
		/* 选中的方法 参数e是第几项 selectItemClass更改样式uni-list-cell-selected*/
		onSelectedItem(e) {
			var item_checked = false;
			var item_all = true;
			for (var i = 0, items = this.details.length; i < items; i++) {
				var item = this.details[i];
				if (item.checked == undefined) {
					/* 没有选中属性则赋值 */
					item.checked = false;
				}
				if (i == e) {
					/* 选中下标 取反 改变样式*/
					item.selectItemClass = 'uni-list-cell-selected';
					this.orderItemSelected = item;
					item.checked = !item.checked;
				} else {
					item.selectItemClass = '';
				}
				if (item.checked) {
					/* 只看有选中 标识 */
					item_checked = true;
				}
				if (item.checked == false) {
					/*只看没选中 标识*/
					item_all = false;
				}
			}
			if (item_checked == true) {
				/* 显示全选*/
				this.checked_all_show = true;
				this.checked_all = item_all; /* 没选中的有没有？(全选)*/
			} else {
				this.checked_all_show = false;
			}
		},
		list_checked() {
			//统计选中，注意事先声明_self
			var _self = this;
			this.details.forEach(function(item) {
				if (item.checked) {
					item.proDate = new Date(item.proDate).format('yyyy/MM/dd') || new Date().format('yyyy/MM/dd');
					item.createDate = new Date(item.createDate).format('yyyy/MM/dd hh:mm:ss') || new Date().format('yyyy/MM/dd hh:mm:ss');
					/* 标签没有define1就取单据物料明细的define1*/
					item.partDefine1 = item.partDefine1 || _self.order.partDefine1;
					item.partDefine2 = item.partDefine2 || _self.order.partDefine2;
					item.partDefine3 = item.partDefine3 || _self.order.partDefine3;
					item.partDefine4 = item.partDefine4 || _self.order.partDefine4;
					item.partDefine5 = item.partDefine5 || _self.order.partDefine5;
					item.partDefine6 = item.partDefine6 || _self.order.partDefine3;
					item.partDefine7 = item.partDefine7 || _self.order.partDefine7;
					item.partDefine8 = item.partDefine8 || _self.order.partDefine8;
					item.partDefine9 = item.partDefine9 || _self.order.partDefine9;
					item.partDefine10 = item.partDefine10 || _self.order.partDefine10;
					_self.reportModel.dataSource.push(item);
				}
			});
			if (+this.reportModel.dataSource == 0) {
				uni.showToast({
					title: '请选择标签！！！',
					icon: 'none'
				});
				util.showAudio();
				return;
			}
		},
		onPrint() {
			var _self = this;
			if (_self.menu_dele) {
				_self.list_checked();
				_self.$refs.printBtn.execPrint();
			} else {
				uni.showModal({
					title: '提示',
					content: '没有删除权限',
					showCancel: false,
					success: function(res_mod) {
						if (res_mod.confirm) {
						} else if (res_mod.cancel) {
						}
					}
				});
				util.showAudio();
				return;
			}
		},
		onAll_100() {
			this.checked_all = !this.checked_all;
			var items = this.details.length;
			if (items >= 100) {
				for (var i = 0; i <= 100; i++) {
					var item = this.details[i];
					item.checked = this.checked_all;
				}
				uni.showToast({
					title: '已选100个.'
				});
			} else {
				for (var i = 0; i < items; i++) {
					var item = this.details[i];
					item.checked = this.checked_all;
				}
			}
			if (!this.checked_all) {
				for (var i = 0; i < items; i++) {
					var item = this.details[i];
					item.checked = this.checked_all;
				}
				this.checked_all_show = false;
			}
		},
		onDelete() {
			var _self = this;
			var tagId = '';
			console.log('_self.menu_dele' + _self.menu_dele);
			if (_self.menu_dele) {
				_self.list_checked();
				_self.reportModel.dataSource.forEach(function(item) {
					if (tagId.length == 0) {
						tagId = item.id;
					} else {
						tagId = tagId + ',' + item.id;
					}
				});
				uni.showModal({
					title: '提示',
					content: '是否要删除标签',
					success: function(res_mod) {
						if (res_mod.confirm) {
							for (var j = 0; j < _self.reportModel.dataSource.length; j++) {
								for (var i = 0; i < _self.details.length; i++) {
									var det_dele = _self.details[i];
									var item_re = _self.reportModel.dataSource[j];
									if (det_dele.tagId == item_re.tagId) {
										_self.details.splice(i, 1);
										break;
									}
								}
							}
							apis.delete_OpenMes_scmreqbarcode({
								data: {
									id: tagId
								},
								success: res2 => {
									uni.showToast({
										title: '删除成功'
									});
									_self.reportModel.dataSource = [];
									util.showScanedAudio();
									_self.pageIO_true();
									_self.$refs.input_part.setFocus();
								},
								failure: message => {
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
						} else if (res_mod.cancel) {
						}
					}
				});
				util.showAudio();
				return;
			} else {
				uni.showToast({
					title: '抱歉你没有权限删除！！！',
					icon: 'none'
				});
				util.showAudio();
				return;
			}
		}
	}
};
</script>

<style>
.flex-item {
	width: 35%;
	float: left;
	text-align: center;
}

.center-box {
	max-height: 800upx;
}
</style>
