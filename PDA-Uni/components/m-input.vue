<template>
	<view class="m-input-view">
		<input ref="txtInput" :focus="autofocus" :type="inputType" :value="value" @input="onInput" class="uni-input"
		 :placeholder="placeholder" :password="type==='password'&&!showPassword" @focus="onFocus" @blur="onBlur" style="border: 1px solid #007AFF;" /> 
		<view v-if="clearable_&&!displayable_&&value.length" class="m-input-icon" style="border: 1px solid #ccc;">
			<m-icon color="#666666" type="clear" size="25" @click="clear"></m-icon>
		</view>
		<view v-if="displayable_" class="m-input-icon">
			<m-icon :color="showPassword?'#666666':'#cccccc'" type="eye" size="25" @click="display"></m-icon>
		</view>
		<!-- <view class="uni-form-item uni-column"> 
			<view class="with-fun">
				<input :focus="autofocus" :type="inputType" :value="value" @input="onInput" class="uni-input" :placeholder="placeholder" :password="type==='password'&&!showPassword" @focus="onFocus" @blur="onBlur" style="border: 1px solid #007AFF;" />
				<view class="uni-icon uni-icon-clear" v-if="clearable_&&!displayable_&&value.length" @click="clear"></view>
				<view class="uni-icon uni-icon-eye" v-if="displayable_" :class="[!showPassword ? 'uni-active' : '']" @click="display"></view>
			</view>
		</view> -->
	</view>
</template>

<script>
	import mIcon from './m-icon/m-icon.vue'

	export default {
		components: {
			mIcon
		},
		props: {
			/**
			 * 输入类型
			 */
			type: String,
			/**
			 * 值
			 */
			value: String,
			/**
			 * 占位符
			 */
			placeholder: String,
			/**
			 * 是否显示清除按钮
			 */
			clearable: {
				type: [Boolean, String],
				default: false
			},
			/**
			 * 是否显示密码可见按钮
			 */
			displayable: {
				type: [Boolean, String],
				default: false
			},
			/**
			 * 自动获取焦点
			 */
			autofocus: {
				type: [Boolean, String],
				default: false
			},
			hideKeyboard: { //是否隐藏软键盘
				type: [Boolean],
				default: false
			}
		},
		watch: {
			// 			autofocus: {
			// 				immediate: true,
			// 				handler: function(newVal) {
			// 					/* this.autofocus = this.old.autofocus;
			// 					this.$nextTick(function() {
			// 						this.autofocus = true;
			// 					}); */
			// 					// console.log(newVal)
			// 				}
			// 			}
		},
		model: {
			prop: 'value',
			event: 'input'
		},
		data() {
			return {
				/**
				 * 显示密码明文
				 */
				showPassword: false,
				/**
				 * 是否获取焦点
				 */
				isFocus: true,
				old: {
					autofocus: false
				}
			}
		},
		computed: {
			inputType() {
				const type = this.type
				return type === 'password' ? 'text' : type
			},
			clearable_() {
				return String(this.clearable) !== 'false'
			},
			displayable_() {
				return String(this.displayable) !== 'false'
			},
			focus_() {
				return String(this.autofocus) !== 'false'
			}
		},
		methods: {
			clear() {
				uni.showToast({
					title: this.value
				})
				var _self = this;
				this.$nextTick(function() {
					_self.value = ''
				}); 
				console.log(1);
			},
			display() {
				this.showPassword = !this.showPassword
			},
			onFocus(e) {
				this.isFocus = true
				this.old.autofocus = true;
				if (this.hideKeyboard) {
					uni.hideKeyboard();
				}
			},
			onBlur(e) {
				this.old.autofocus = false;
				this.isFocus = false;
			},
			onInput(e) {
				this.$emit('input', e.target.value)
			},
			setFocus() {
				this.autofocus = this.old.autofocus;
				var _self = this;
				this.$nextTick(function() {
					_self.autofocus = !_self.old.autofocus;
				});
			}
		}
	}
</script>

<style>
	.m-input-view {
		display: flex;
		flex-direction: row;
		align-items: center;
		width: 100%;
		flex: 1;
		padding: 0 10rpx;
	}

	.m-input-input {
		flex: 1;
		width: 100%;
	}

	.m-input-icon {
		width: 20px;
	}
</style>
