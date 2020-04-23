<!-- 打印按钮 -->
<template>
	<view>
		<view style="border: 1px solid #CCCCCC;border-radius:3px;box-sizing:border-box;">
			<button type="default" style="width: calc(100% - 40px);display: block;float: left;" v-if="showSaveSelected" @click="btnClick"
			 @tap="btnTap">{{buttonText}}</button>
			<button type="default" v-else style="width: 100%;display: block;float: left;" @click="btnClick" @tap="btnTap">{{buttonText}}</button>
			<checkbox-group @change="checkboxChange" style="display: block; float: right; padding-top: 10upx; width: 35px;" v-if="showSaveSelected">
				<label class="checkbox">
					<checkbox value="1" :checked="isSaveSelected" />默认
				</label>
			</checkbox-group>
			<view style="clear: both;">
			</view>
		</view>
		<label-print ref="labPri" :progNo="curReportModel.progNo" :showReport="showReport" :reportModel="curReportModel" @printCancel="printCancel"
		 @printComplete="printComplete" @tagValid="tagValid"></label-print>
	</view>
</template>

<script>
	import labelPrint from '../../components/label-print/label-print.vue'

	import consts from '../../common/consts.js';
	import storage from '../../common/storage.js';
	import util from '../../common/util.js';

	export default {
		components: {
			labelPrint
		},
		data() {
			var dateTimestamp = new Date().getTimestamp();
			return {
				showReport: false,
				isSaveSelected: false,
				showSaveSelected: false,
				curReportModel: this.reportModel
			}
		},
		props: {
			reportModel: {
				type: [Object],
				required: true,
				default: () => {
					return {
						progNo: '', //页面ID
						isMultiPrint: false,
						dataSource: Array, // 标签拆分时为多个数据源
						isNeedValidTag: false, //是否需要校验标签
					}
				}
			},
			buttonText: {
				type: String,
				default: '打印'
			}
		},
		watch: { //监听外部对props属性的变更
			reportModel: {
				immediate: true,
				handler: function(newVal) {
					this.curReportModel = newVal
				}
			}
		},
		onReady() {
			this.checkUseDefaultPrint()
		},
		methods: {
			checkUseDefaultPrint() { 
				var find = this.$refs.labPri.checkUseDefaultPrint();
				this.isSaveSelected = find;
				this.showSaveSelected = find;
			},
			checkboxChange: function(e) {
				let values = e.detail.value;
				this.isSaveSelected = values == 1
				console.log(this.isSaveSelected);
			},
			getCheckRlt() {
				return this.isSaveSelected
			},
			btnClick() {
				this.$emit('click');
			},
			btnTap() {
				this.$emit('tap');
			},
			printComplete() {
				this.showReport = false;
				this.checkUseDefaultPrint()
				this.$emit('printComplete');
			},
			printCancel() {
				this.showReport = false;
				this.$emit('printCancel');
			},
			/**
			 * @param {Object} scanBoxTagModelList 扫描的结果集
			 */
			tagValid(scanBoxTagModelList) {
				this.showReport = false;
				this.checkUseDefaultPrint()
				this.$emit('tagValid', scanBoxTagModelList);
			},
			execPrint() {
				if (this.isSaveSelected) {
					this.$refs.labPri.userDefaultPrint()
				} else {
					this.showReport = true;
				}
			}
		}
	}
</script>

<style>


</style>
