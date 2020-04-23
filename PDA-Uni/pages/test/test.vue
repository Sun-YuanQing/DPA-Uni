<!-- 授权模板 -->
<template>
	<view>
		<label class="checkbox" @click="cbxChange" >
			<checkbox :checked="isChecked" />下次不再选择
		</label>
		
		<!--  -->
		<!-- <button @click="showReport">Show</button>
		<button @click="defaultPrint">DefaultPrint</button>
		<print-button ref='printBtn' buttonText="测试打印" progNo="OPDA00001" ></print-button>

		<label-print ref="labPri" :reportModel="reportModel" @printCancel="printCancel" @printComplete="printComplete"></label-print> -->
	</view>
</template>

<script>
	import labelPrint from '../../components/label-print/label-print.vue'	
	import printButton from "../../components/label-print/print-button.vue"

	import util from '../../common/util.js';
	export default {
		components: {
			labelPrint,
			printButton
		},
		data() {
			return {
				isChecked: true,
				
				reportModel: {
					progNo: 'OPDA00001', //页面ID
					showReport: false,
					isMultiPrint: true,
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
					isNeedValidTag: true, //是否需要校验标签
				}
			}
		},
		computed: {},
		onReady() {},
		methods: {
			showReport() { 
				var rlt = this.$refs.printBtn.getCheckRlt();
				console.log(rlt);
			},
			defaultPrint(){
				this.$refs.labPri.userDefaultPrint()
			},
			printCancel() {
				this.reportModel.showReport = false;
			},
			printComplete() {
				this.reportModel.showReport = false;
			},
			cbxChange(){
				debugger
				this.isChecked=!this.isChecked
			}
		}
	}
</script>

<style>
</style>
