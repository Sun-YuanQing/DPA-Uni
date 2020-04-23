<!-- 首件确认-->
<template>
	<view>
		<view id="viewHeader">
			<!-- 头表信息 -->
			<barcode-input ref="input_order" @onScaned="onEmpNoScaned" :focus="true"  :clearScan="false" placeholder="扫检验人"></barcode-input>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">制造单:</view>
				<view class="uni-list-cell-db">{{ order.moLot }}</view>
				<view class="uni-list-cell-left">检验人:</view>
				<view class="uni-list-cell-db">{{ spcEmpNo }}</view>
			</view>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">料品编码:</view>
				<view class="uni-list-cell-db">{{ order.partItemNo }}</view>
			</view> 
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">首检方案:</view>
				<view class="uni-list-cell-db">{{ order.firstSpcCheckNo }}</view>
			</view>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">设备:</view>
				<view class="uni-list-cell-db">{{ order.deviceNo }}</view>

				<view class="uni-list-cell-left">工序:</view>
				<view class="uni-list-cell-db">{{ order.proItemNo }}</view>
			</view>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">工装版号:</view>
				<view class="uni-list-cell-db">{{ order.mouldVer }}</view>
			</view>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">样板数量:</view>
				<view class="uni-list-cell-db">{{ order.sheetQty }}</view>
				<view class="uni-list-cell-left">转换前数量:</view>
				<view class="uni-list-cell-db">{{ firstsheet }}</view>
			</view>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">合格数量:</view>
				<view class="uni-list-cell-db">{{ order.m_spcGoodQty }}</view>
				<view class="uni-list-cell-left">不合格数量:</view>
				<view class="uni-list-cell-db">{{ order.m_spcBadQty }}</view>
			</view>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">检验结果:</view>
				<switch :checked="autologin" @change="autoLoginChange" />
			</view>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">转换率:</view>
				<view class="uni-list-cell-db">{{ order.unitRate }}</view>
			</view>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">备注:</view>
				<view class="uni-list-cell-db"><input ref="input_rem" type="text" placeholder="备注" v-model="order.rem" /></view>
			</view>
		</view>
		<!-- 显示入库单明显 -->
		<!-- 显示入库单明显 -->
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item, index) in data" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)" v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title">料号:{{ item.partItemNo }}</text>
								<text class="uni-title">料品名称:{{ item.partName }}</text>
								<text class="uni-title">数量: {{ item.sheetQty }}</text>
							</view>
							<view class="uni-triplex-right" style="min-width: 220upx;">
								<text class="uni-h5" style="min-width: 200upx;margin-left: -300upx;">设备:{{ item.deviceNo }}</text>
								<text class="uni-h5" style="min-width: 200upx;margin-left: -300upx;">工序:{{ item.proItemNo }}</text>
								<text class="uni-h5" style="min-width: 200upx;margin-left: -300upx;">工装号:{{ item.mouldVer }}</text>
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
import barcodeInput from '../../components/barcode-input/barcode-input.vue'; //扫码组件

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
			old: {
				scrollTop: 0
			},
			scrollTop: 0,
			scrollHeight: 0,
			order: {
				m_spcCheckResult: 1, //合格
				m_spcSampleQty: 0,
				m_spcGoodQty: 0,
				m_spcBadQty: 0
			},
			spcEmpNo: '',
			firstsheet: 0, //转换前数量
			autologin: true, //合格
			newOrder: {}
		};
	},
	onLoad(option) {
		this.order = this.urldata;
		this.order.m_spcCheckResult=1;
		this.order.m_spcSampleQty = this.order.sheetQty;
		this.order.m_spcGoodQty = this.order.sheetQty;
		this.order.m_spcBadQty = 0;
		var _self = this;
		this.firstsheet = util.floatObj.multiply(_self.order.planQty, _self.order.unitRate);
		console.log(this.order);
	},
	onReady() {
		util.getListHeight(this);
	},
	onBackPress(options) {
		return util.backPress(options, this.order.sheetQty > 0);
	},
	computed: mapState(['urldata']),
	methods: {
		...mapMutations(['pageIO_true']),
		/* emp_a1扫描人员 */
		onEmpNoScaned(e) {
			uni.showLoading({
				mask: true
			});
			apis.emp_a1({
				data: {
					empNo: e
				},
				success: res => {
					this.spcEmpNo = res[0].empNo;
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
		/* 填写合格数校验 */
		onsheetQtyChange() {
			if (util.floatObj.add(this.order.m_spcGoodQty, this.order.m_spcBadQty) > this.order.m_spcSampleQty) {
				uni.showToast({
					title: '合格/不合格数量有误!!!',
					icon: 'none'
				});
			}
			if (this.order.m_spcGoodQty > this.order.m_spcSampleQty) {
				uni.showToast({
					title: '合格数量不能大于抽检数量!!!',
					icon: 'none'
				});
			}
		},
		/* 填写不合格数校验 */
		onbadQtyChange() {
			if (util.floatObj.add(this.order.m_spcGoodQty, this.order.m_spcBadQty) > this.order.m_spcSampleQty) {
				uni.showToast({
					title: '合格/不合格数量有误!!!',
					icon: 'none'
				});
			}
			if (this.order.m_spcBadQty > this.order.m_spcSampleQty) {
				uni.showToast({
					title: '不合格数量不能大于样板数量!!!',
					icon: 'none'
				});
			}
		},
		autoLoginChange(e) {
			var _self = this;
			var _Order = util.clone(_self.order);
			if (e.target.value) {
				_Order.m_spcCheckResult = 1;
				//显示
				_Order.m_spcGoodQty = _Order.sheetQty;
				_Order.m_spcBadQty = 0;
			} else {
				_Order.m_spcCheckResult = 0;
				//显示
				_Order.m_spcGoodQty = 0;
				_Order.m_spcBadQty = _Order.sheetQty;
			}
			this.order = _Order;
			console.log(this.order);
		},
		onSave() {
			if (util.floatObj.add(this.order.m_spcGoodQty, this.order.m_spcBadQty) > this.order.m_spcSampleQty) {
				uni.showToast({
					title: '合格/不合格数量有误!!!',
					icon: 'none'
				});
			}
			if (this.order.m_spcGoodQty > this.order.m_spcSampleQty) {
				uni.showToast({
					title: '合格数量不能大于抽检数量!!!',
					icon: 'none'
				});
			}
			if (this.order.m_spcBadQty > this.order.m_spcSampleQty) {
				uni.showToast({
					title: '不合格数量不能大于样板数量!!!',
					icon: 'none'
				});
			}
			if (!this.spcEmpNo) {
				uni.showToast({
					title: '未扫描校验人!!!',
					icon: 'none'
				});
				return;
			}
			var _self = this;
			_self.newOrder = {
				workId: _self.order.workId, //上线 id
				dayId: _self.order.id, //id
				sheetDate: new Date().format('yyyy/MM/dd'), //检验单日期
				moLot: _self.order.moLot, //制造批号
				partNo: _self.order.partNo, //料品内码
				unitNo: _self.order.unitNo, //单位
				unitRate: _self.order.unitRate, //转换率
				proNo: _self.order.proNo, //工序内码
				deviceNo: _self.order.deviceNo, //	设备
				sheetQty: _self.order.sheetQty, //样本数量
				spcSampleQty: _self.order.m_spcSampleQty, //抽检数量
				spcGoodQty: _self.order.m_spcGoodQty, //合格数量
				spcBadQty: _self.order.m_spcBadQty, //不合格数量
				spcRejectResult:0,
				fileSta :1,
				auditUser:storage.get(consts.storageKeys.login).userID,
				auditDate:new Date().format('yyyy/MM/dd'),
				spcEmpNo: _self.spcEmpNo, //检验人
				spcTime: new Date().format('yyyy/MM/dd'), //检验日期
				spcCheckResult: _self.order.m_spcCheckResult, //合格/不
				spcType: 1, //报检类型 0.巡检 1.首检 2.批检
				mouldNo: _self.order.mouldNo, //工装号(模具编码)
				mouldVer: _self.order.mouldVer, //工装版号（多笔）
				sheetSta: 1, //单据状态
				rem: _self.order.rem, //备注
				entityState: consts.entityState.added //行更改状态
			};
			//console.log(	_self.newOrder )
			
			uni.showLoading({
				mask: true
			});
			apis.OpenMes_messpcquality({
				data: _self.newOrder,
				success: res => {
					uni.showToast({
						title: '保存成功',
						icon: 'none'
					});
					util.dataInit(this);
					_self.pageIO_true();
					util.showScanedAudio();
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
		}
	}
};
</script>

<style></style>
