<template>
	<view>
		<view class="uni-form-item uni-column">
			<view class="with-fun">
				<input class="uni-input" :type="inputType" :focus="autofocus" :placeholder="placeholder" :value="inputClearValue"
				 @input="onInput" :password="showPassword" @focus="onFocus" @blur="onBlur" confirm-type="search" @confirm="onConfirm" />
				<view class="uni-icon uni-icon-clear" v-if="showClearIcon" @click="clearIcon"></view>
				<view class="uni-icon uni-icon-eye" v-if="showPassword" :class="[!showPassword ? 'uni-active' : '']" @click="changePassword"></view>
				<view class="uni-icon uni-icon-scan" v-if="showScan" :class="[!showScan ? 'uni-active' : '']" @click="changeScan"></view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		components: {},
		data() {
			return {
				// 如果数据要绑定到view上，那么只能用data 或 computed 中的数据，props只能用于传值
				inputClearValue: '',
				autofocus: false,
				showClearIcon: false,
				showPassword: false,
				showScan: false
			}
		},
		props: {
			/**
			 * 输入类型
			 */ 
			type: {
				type: [String],
				default: 'text'
			},
			value: String,
			placeholder: {
				type: [String],
				default: '请扫描'
			},
			focus: {
				type: [Boolean],
				default: false
			},
			/**
			 * 是否显示清除按钮
			 */
			isShowClearIcon: {
				type: [Boolean, String],
				default: true
			},
			/**
			 * 是否显示密码可见按钮
			 */
			isShowPassword: {
				type: [Boolean, String],
				default: false
			},
			isShowScan: {
				type: [Boolean, String],
				default: false
			},
			clearScan: { //扫描完后是否清空文本框内容
				type: [Boolean],
				default: true
			},
			hideKeyboard: { //是否隐藏软键盘
				type: [Boolean],
				default: false
			}
		},
		model: {
			prop: 'value',
			event: 'input'
		},
		watch: {
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
					if (this.value.length > 0)
						this.showClearIcon = newVal;
				}
			},
			isShowPassword: {
				immediate: true,
				handler: function(newVal) {
					this.showPassword = newVal;
				}
			},
			isShowScan: {
				immediate: true,
				handler: function(newVal) {
					this.showScan = newVal;
				}
			}

		},
		computed: {
			inputType() {
				const type = this.type
				return type === 'password' ? 'text' : type
			}
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
			changePassword: function() {
				this.showPassword = !this.showPassword;
			},
			changeScan: function() {
				var _self = this;
				uni.scanCode({
					success: (res) => {
						if (String(_self.clearScan) !== 'false') {
							_self.inputClearValue = '';
						} else {
							_self.inputClearValue = res.result;
							if (String(_self.isShowClearIcon) !== 'false' && res.result > 0) {
								_self.showClearIcon = true;
							} else {
								_self.showClearIcon = false;
							}
						}
						_self.$emit('onScaned', res.result);
					},
				});
			},
			onFocus() {
				if (this.hideKeyboard) {
					//#ifdef APP-PLUS
					plus.key.hideSoftKeybord();
					//#endif
					uni.hideKeyboard();
				}
				this.$emit('focus');
			},
			onBlur() {
				this.$emit('blur');
			},
			onConfirm() { 
				this.$emit('onScaned', this.inputClearValue);
				this.$emit('confirm', this.inputClearValue);
			},
			setFocus() {
				this.autofocus = false;
				this.$nextTick(function() {
					this.autofocus = true;
				});
			}
		}
	}
</script>

<style>
</style>
