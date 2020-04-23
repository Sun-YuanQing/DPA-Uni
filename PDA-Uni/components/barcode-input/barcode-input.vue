<!-- 条码输入框 -->
<template>
	<view>
		<view class="uni-form-item uni-column barcode-input">
			<view class="with-fun">
				<input class="uni-input" :type="inputType" :focus="autofocus" :placeholder="placeholder" :value="inputClearValue" maxlength="-1" :disabled="disabled" @input="onInput" @focus="onFocus" @blur="onBlur" confirm-type="search" @confirm="onConfirm" />
				<view class="uni-icon uni-icon-clear" v-if="showClearIcon" @click="clearIcon"></view>
				<view class="uni-icon uni-icon-scan" v-if="showScan" :class="[!showScan ? 'uni-active' : '']" @click="changeScan"></view>
			</view>
		</view>
	</view>
</template>

<script>	
	import util from '../../common/util.js';
	
	export default {
		name: 'barcode-input',
		components: {},
		data() {
			return {
				// 如果数据要绑定到view上，那么只能用data 或 computed 中的数据，props只能用于传值
				inputClearValue: '',
				autofocus: false,
				showClearIcon: false,
				showScan: false
			}
		},
		props: {
			/**
			 * 输入类型
			 */
			type: String,
			value: String,
			placeholder: {
				type: String,
				default: '请扫描'
			},
			focus: {
				type: Boolean,
				default: false
			},
			/**
			 * 是否显示清除按钮
			 */
			isShowClearIcon: {
				type: Boolean,
				default: true
			},
			isShowScan: {
				type: Boolean,
				default: true
			},
			clearScan: { //扫描完后是否清空文本框内容
				type: Boolean,
				default: true
			},
			hideKeyboard: { //是否隐藏软键盘
				type: Boolean,
				default: true
			},
			disabled:{ //是否隐藏软键盘
				type: Boolean,
				default: false
			}
		},
		model: {
			prop: 'value',
			event: 'input'
		},
		watch: { //监听外部对props属性myName,myAge的变更
			value: {
				immediate: true,
				handler: function(newVal) {
					this.inputClearValue = newVal;
				}
			},
			focus: {
				immediate: true,
				handler: function(newVal) {
					this.autofocus = newVal;
				}
			},
			isShowClearIcon: {
				immediate: true,
				handler: function(newVal) {
					if (newVal.length > 0)
						this.showClearIcon = newVal;
				}
			},
			isShowScan: {
				immediate: true,
				handler: function(newVal) {
					this.showScan = newVal;
				}
			},
			disabled: {
				immediate: true,
				handler: function(newVal) {
					//如果禁用则不出现 删除按钮
					this.showClearIcon = false;
				}
			}
		},
		computed: {
			inputType() {
				const type = this.type
				return type === 'password' ? 'text' : type
			}
		},
		onLoad() {
			uni.hideKeyboard();
		},
		methods: {
			onInput(event) {
				let curVal = event.target.value;
				this.inputClearValue = curVal;
				if (curVal.length > 0) {
					this.showClearIcon = true;
				} else {
					this.showClearIcon = false;
				}
				this.$emit('input', curVal)
			},
			clearIcon: function() {
				this.inputClearValue = '';
				this.showClearIcon = false;
				this.$emit('input', this.inputClearValue);
				this.setFocus();
			},
			changeScan: function() {
				var _self = this;
				uni.scanCode({
					success: (res) => {
						if (String(_self.clearScan) !== 'false') {
							_self.inputClearValue = '';
							_self.showClearIcon = false;
						} else {
							_self.inputClearValue = res.result;
							if (String(_self.isShowClearIcon) !== 'false' && res.result > 0) {
								_self.showClearIcon = true;
							} else {
								_self.showClearIcon = false;
							}
						}
						if (res.result == "" || res.result == undefined) {
							return;
						}
						_self.$emit('onScaned', res.result);
					},
				});
			},
			onFocus() {
				if (this.hideKeyboard) {
					uni.hideKeyboard();
				}
				this.$emit('focus');
			},
			onBlur() {
				this.$emit('blur');
			},
			onConfirm() {
				// util.showScanedAudio();
				let curVal = this.inputClearValue;
				if (String(this.clearScan) !== 'false') {
					this.inputClearValue = '';
					this.showClearIcon = false;
				} else {
					if (String(this.isShowClearIcon) !== 'false' && curVal.length > 0) {
						this.showClearIcon = true;
					} else {
						this.showClearIcon = false;
					}
				}
				if (curVal == "" || curVal == undefined) {
					return;
				}
				this.$emit('onScaned', curVal);
				this.$emit('confirm', curVal);
			},
			setFocus() {
				this.autofocus = false;
				this.$nextTick(function() {
					this.autofocus = true;
				});
			},
			clear() {
				this.clearIcon();
			}
		}
	}
</script>

<style>
	.barcode-input {
		padding: 0 !important;
		border-bottom: 1upx solid #c8c7cc;
		background-color: #eee !important;
	}
</style>
