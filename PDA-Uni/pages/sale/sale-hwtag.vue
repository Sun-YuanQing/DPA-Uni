<!-- 华为标签检验 (没有用vuex子页返回删除单据，用的浏览器的本地数据库缓存)-->
<template>
	<view>
		<view id="viewHeader">
			<barcode-input ref="input_user" @onScaned="onUserScaned" :focus="true" :clearScan="false" placeholder="扫校验人员"></barcode-input>
			<barcode-input ref="input_order" @onScaned="onScaned" placeholder="出货通知单"></barcode-input>
			<barcode-input ref="input_part" @onScaned="onPartScaned" placeholder="扫内部外箱标签"></barcode-input>
		</view>
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item,index) in details" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)"
					 v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title">出货单批号:{{item.sheetLot}}</text>
								<text class="uni-title">料品编码:{{item.partItemNo}}</text>
								<text class="uni-title">料品名称:{{item.partName}}</text>
							</view>
							<view class="uni-triplex-right">
								<text class="uni-h5" style="min-width: 200upx;margin-left: -500upx;">校验人:{{item.tagCheckEmp==false?'---':item.tagCheckEmp}}</text>
								<text class="uni-h5" style="min-width: 200upx;margin-left: -500upx;">校验结果:{{item.tagCheckSw==true?'已校验':'未校验'}}</text>
								<text class="uni-h5" style="min-width: 200upx;margin-left: -500upx;">单位名称:{{item.unitName}}</text>
								<text class="uni-h5" style="min-width: 200upx;margin-left: -500upx;">数量:{{item.sheetQty}}</text>
							</view>
						</view>
					</view>
				</block>
			</view>
		</scroll-view>
		<!-- 底部按钮模块 -->
		<page-foot ref="viewBtm">
			<button type="primary" style="display: block; float: none;" @click="onSave">保存</button>
		</page-foot>
	</view>
</template>

<script>
	import barcodeInput from '../../components/barcode-input/barcode-input.vue' //扫码组件

	import apis from '../../common/apiService.js'; //系统api
	import consts from '../../common/consts.js';
	import storage from '../../common/storage.js';
	import util from '../../common/util.js'; //常用功能
	import { mapState, mapMutations } from 'vuex';
	export default {
		components: {
			barcodeInput
		},
		data() {
			return {
				progNo: '', //页面ID
				old: {
					scrollTop: 0
				},
				scrollTop: 0,
				scrollHeight: 0,
				tagCheckEmp: '',
				details: [],
				hwASN: [],
				hwDetails: null
			}
		},
		onLoad(option) {
			this.progNo = option.progNo;
		},
		onReady() {
			util.getListHeight(this);
		},
		onShow() {
			this.hwDetails = util.clone(storage.get(consts.storageKeys.hwDetails));
			var _self = this;
			console.log(util.outputLog(_self.hwDetails));
			if (_self.hwDetails != null) { //新的替换旧的数据
				
				_self.hwDetails.details.forEach(function(hwitem) {
					_self.details.forEach(function(item, i) {
						item.selectItemClass = '';
						if (hwitem.partItemNo == item.partItemNo) {
							_self.details.splice(i, 1);
						}
					})
				})
				_self.hwDetails.details.forEach(function(item, i) { //更新新数据
					item.selectItemClass = '';
					_self.details.push(item);
				})
				_self.hwDetails.hwASN.forEach(function(hwitem, i) { //新的替换旧的数据
					_self.hwASN.forEach(function(item, i) {
						item.selectItemClass = '';
						if (hwitem.pkgId == item.pkgId) {
							item.m_ishwASN = hwitem.m_ishwASN;
						}
					})
				})
				storage.set(consts.storageKeys.hwDetails, null);
			}
			if(_self.details==true){
				 util.automateSave(_self.details, 'tagCheckSw', 1, _self.onSave);
			} 
            
		},
		onBackPress(options) {
			return util.backPress(options, this.details.length > 0);
		},
	methods: {
		...mapMutations(['setUrldata']),
			onUserScaned(e) {
				if (e != "") {
					this.tagCheckEmp = e;
					util.showScanedAudio();
				} else {
					util.showAudio();
					uni.showToast({
						icon: "none",
						title: "人员不正确!!!"
					})
					this.$refs.input_user.setFocus();
				}
				this.$refs.input_order.setFocus();
			},
			onScaned: function(e) {
				var _self = this;
				console.log(this.tagCheckEmp == '')
				if (this.tagCheckEmp == '') {
					uni.showToast({
						icon: "none",
						title: "人员不正确!!!"
					})
					util.showAudio();
					this.$refs.input_user.setFocus();
					return;
				}
				uni.showLoading({
					mask: true
				})
				apis.OpenMes_saloutnoticeasnbysheetnopkgid({
					data: {
						sheetNo: e
					},
					success: (res) => {
						if (res.length <= 0) {
							uni.showToast({
								icon: 'none',
								title: '没有需要校验的ASN!!!'
							})
							this.$refs.input_order.setFocus();
							return;
						}
						this.hwASN = res;
						this.hwASN.forEach(function(item, index) {
							item.m_ishwASN = false;
						});
						apis.Pda_pdasalooutdetailbynotice({
							data: {
								noticeNo: e
							},
							success: (res1) => {
								this.details = res1;
								this.details.forEach(function(item, index) {
									item.scanQty = item.scanQty || 0;
									item.lastScanQty = Number(item.lastScanQty) || Number(item.sheetQty);
									item.tagCheckEmp = _self.tagCheckEmp;
									item.scantagDetails = item.scantagDetails || [];
								})
								this.$refs.input_part.setFocus();
								util.showScanedAudio();
							},
							failure: (message) => {
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
						})
						this.$refs.input_part.setFocus();
					},
					failure: (message) => {
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
				})

			},
			onPartScaned: function(e) {
				var _self = this;
				apis.basic_QRCodeAnalysis({
					data: {
						qrCode: e
					},
					success: (res) => {
						var details = [];
						_self.details.forEach(function(item, index) {
							if (item.partItemNo == res.partItemNo) {
								item.tagCheckEmp = _self.tagCheckEmp;
								details.push(item);
							}
						})
						var hwASN = [];
						console.log(util.outputLog(_self.hwASN))
						console.log(util.outputLog(res))
						_self.hwASN.forEach(function(item, index) {
							console.log(item.pn + '===' + res.suPartNo)
							if (item.pn == res.suPartNo) {
								hwASN.push(item);
							}
						});
						if(hwASN==false){
							uni.showToast({
								title: '该标签没有对应的ASN!!!',
								icon: 'none'
							})
							util.showAudio();
							return;
						}
						var data = {};
						data.details = details;
						data.hwASN = hwASN;
						data.data_hwtagscan=res;
						this.setUrldata(data);
						util.showScanedAudio();
						uni.navigateTo({
							url: 'sale-hwtagDet'
						})
					},
					failure: (message) => {
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
				})
			},
			onSave() {
				var _self = this;
				this.details.forEach(function(item, i) {
					if (item.tagCheckSw == 0) {
						_self.onScrollTop(i);
						uni.showToast({
							title: '请全部检验!!!',
							icon: 'none'
						})
						util.showAudio();
						return;
					}
				})
				this.hwASN.forEach(function(item) {
					if (item.m_ishwASN == false) {
						uni.showToast({
							title: '请全部检验ASN!!!',
							icon: 'none'
						})
						util.showAudio();
						return;
					}
				})
				this.details.forEach(function(item, i) {
					item.scantagDetails = [];
				})

				console.log(util.outputLog(this.details))
				
				apis.sale_save_put({
					data: this.details,
					success: (res) => {
						uni.showToast({
							title: '保存成功'
						})
						util.dataInit(this);
					},
					failure: (message) => {
						util.showAudio();
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
			/* 选中的方法 */
			onSelectedItem(e) {
				//点击列表
				var _self = this;
				var t = this.details[e];
				var details = [];
				this.details.forEach(function(item, index) {
					if (item.partItemNo == t.partItemNo) {
						item.tagCheckEmp = _self.tagCheckEmp;
						details.push(item);
					}
				})
				var hwASN = [];
				console.log(util.outputLog(_self.hwASN))
				_self.hwASN.forEach(function(item, index) {
					console.log(item.pn + '===' + t.cuPartNo)
					if (item.pn == t.cuPartNo) {
						hwASN.push(item);
					}
				})
				if(hwASN==false){
					uni.showToast({
						title: '该标签没有对应的ASN!!!',
						icon: 'none'
					})
					util.showAudio();
					return;
				}
				var data = {};
				data.details = details;
				data.hwASN = hwASN;
				data.data_hwtagscan='';
				this.setUrldata(data);
				util.showScanedAudio();
				uni.navigateTo({
					url: 'sale-hwtagDet'
				})
			},
			scroll(e) { //滚动
				this.old.scrollTop = e.detail.scrollTop
			},
			onScrollTop(index) {
				//滚动定位
				let view = uni.createSelectorQuery().in(this).select(".scroll-view-item");
				view.boundingClientRect(data => {
					this.scrollTop = this.old.scrollTop
					this.$nextTick(function() {
						this.scrollTop = data.height * index;
					});
				}).exec();
			},
		}
	}
</script>

<style>
</style>
