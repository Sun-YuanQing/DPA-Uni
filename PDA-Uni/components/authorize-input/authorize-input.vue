<!-- 授权模板 -->
<template>
	<view class="uni-auth-view" v-show="show">
		<view class="uni-mask" :style="{ top: offsetTop + 'px' }"></view>
		<view class="uni-modal">
			<view class="uni-modal__hd"><strong class="uni-modal__title">{{title}}</strong></view>
			<view class="uni-modal__bd"> 
				<uni-card :is-full="true" title="异常信息" >
					<textarea v-model="lockModel.description" maxlength="-1" disabled style="width: auto;max-height: 80px;"></textarea> 
				</uni-card>
				<view style="height: 10px; background-color: transparent;"></view>
				<uni-card :is-full="true" title="提示信息">
					<view class="uni-common-mt">
						<view class="input-group">
							<view class="uni-list-cell">
								<view class="uni-list-cell-left">
									账号：
								</view>
								<view class="uni-list-cell-db input-row">
									<input class="uni-input" type="text" :focus="true" v-model="userID" placeholder="请输入账号" />
								</view>
							</view>
							<view class="uni-list-cell">
								<view class="uni-list-cell-left">
									密码：
								</view>
								<view class="uni-list-cell-db input-row">
									<input class="uni-input" type="password" v-model="userPass" placeholder="请输入密码" />
								</view>
							</view>
							<view class="uni-list-cell">
								<view class="uni-list-cell-left">
									备注：
								</view>
								<view class="uni-list-cell-db input-row uni-textarea" style="height: 90px">
									<textarea class="uni-input" :value="remark" />
								</view>
							</view>  
						</view> 
					</view>
				</uni-card> 
			</view>
			<view class="uni-modal__ft">
				<view class="uni-modal__btn uni-modal__btn_default" style="color: rgb(0, 0, 0);" @click="onUnAgree">拒绝</view>
				<view class="uni-modal__btn uni-modal__btn_primary" style="color: rgb(0, 122, 255);" @tap="onAgree">同意</view>
			</view>
		</view> 	
	</view>
</template>

<script> 
	import uniCard from '@/components/uni-card/uni-card.vue'
	import apis from '../../common/apiService.js';
	import consts from '../../common/consts.js';
	import storage from '../../common/storage.js';
	import util from '../../common/util.js';
	export default { 
		components: { 
			uniCard
		},
		data() {
			let offsetTop = 0;
			//#ifdef H5
			if (!this.h5Top) {
				offsetTop = 44;
			} else {
				offsetTop = 0;
			}
			//#endif
			return { 
				userID:'',
				userPass:'',
				remark: '',
				offsetTop: offsetTop
			}
		},
		props: { 
			/**
			 * 页面显示
			 */
			show: {
				type: Boolean,
				default: true
			},
			/**
			 * 额外信息
			 */
			title: {
				type: String,
				default: '授权'
			},
			/**
			 * h5遮罩是否到顶
			 */
			h5Top: {
				type: Boolean,
				default: false
			},
			lockModel:{
				type:[Object],
				required: true,
				default:() =>{
					return {
						lockType: 2 ,//锁屏类别 0.报工 1.生产退料 2.生产领料
						sourceId: '',//来源ID或单号批号
						description: ''
					}
				}
			}
		},
		watch: {
			h5Top(newVal) {
				console.log(newVal);
				if (newVal) {
					this.offsetTop = 44;
				} else {
					this.offsetTop = 0;
				}
			}
		},
		computed: {}, 
		methods: {
			submitValid(){ 
				if (this.userID.trim().length == 0){
					uni.showToast({
						title: '请输入用户名密码！',
						icon: 'none'
					});
					return false;
				}
				let userInfo = storage.get(consts.storageKeys.login);
				if (userInfo.userID == this.userID){
					//不能用本账号解锁！
					uni.showToast({
						title: '不能用本人账号解锁！',
						icon: 'none'
					});
					return false;
				}
				return true;
			},
			onAgree(){
				if(!this.submitValid()) return;
				//同意
				uni.showLoading({
					mask: true
				});
				apis.validUserPwd({
					data: {
						userNo: this.userID,
						passWord: this.userPass
					},
					success: (res) => {						
						this.$emit("onClick", this.getResult(1))
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
			onUnAgree(){
				if(!this.submitValid()) return;
				//拒绝
				this.$emit("onClick", this.getResult(0));
			},
			getResult(rlt){
				let userInfo = storage.get(consts.storageKeys.login);
				let model = {
					lockType: this.lockModel.lockType,
					sourceId: this.lockModel.sourceId,
					description: this.lockModel.description,
					resultDesc: this.remark,
					resultSta: rlt,//0.不通过 1.通过
					picEmp: userInfo.userID,
					picEmpName: userInfo.userName,
					unLockEmp: this.userID,
					userNo:userInfo.userID,
					entityState: consts.entityState.added
				};
				return model;
			}
		}
	}
</script>

<style>
	.uni-mask {
		position: fixed;
		z-index: 998;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		background-color: rgba(0, 0, 0, 0.3);
	}
	
	.uni-auth-view {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: 999;
		display: block;
		box-sizing: border-box;
	}
	
	.uni-auth-view .uni-modal {
		position: absolute; 
		z-index: 999;
		width: 96%; 
		top: 50%;
		left: 50%; 
		-webkit-transform: translate(-50%, -50%);
		transform: translate(-50%, -50%);
		background-color: #fff;
		border-radius: 3px;
		overflow: hidden;
		text-align: center;
		border-radius: 3px;
		box-shadow: 20upx 20upx 30upx rgba(0, 0, 0, .5);
	}
	
	.uni-auth-view .uni-modal * {
		box-sizing: border-box
	}
	
	.uni-auth-view .uni-modal__hd {
		padding: 1em .8em .3em;
		border-bottom: 1px solid #d5d5d6;
	}
	
	.uni-auth-view .uni-modal__title {
		font-weight: 400;
		font-size: 18px;
		word-wrap: break-word;
		word-break: break-all;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}
	
	.uni-auth-view .uni-modal__bd {
		/* padding: 1.3em; */
		min-height: 40px;
		font-size: 15px;
		line-height: 1.4;
		word-wrap: break-word;
		word-break: break-all;
		/* color: #999; 
		max-height: 400px;*/
		overflow-y: auto;
		text-align: left;
	}
	
	.uni-auth-view .uni-modal__ft {
		position: relative;
		line-height: 48px;
		height: 48px;
		display: -webkit-box;
		display: -webkit-flex;
		display: flex;
	}
	
	.uni-auth-view .uni-modal__ft:after {
		content: " ";
		position: absolute;
		left: 0;
		top: 0;
		right: 0;
		height: 1px;
		border-top: 1px solid #d5d5d6;
		color: #d5d5d6;
		-webkit-transform-origin: 0 0;
		transform-origin: 0 0;
		-webkit-transform: scaleY(.5);
		transform: scaleY(.5)
	}
	
	.uni-auth-view .uni-modal__btn {
		display: block;
		-webkit-box-flex: 1;
		-webkit-flex: 1;
		flex: 1;
		color: #3cc51f;
		text-decoration: none;
		-webkit-tap-highlight-color: rgba(0, 0, 0, 0);
		position: relative;
		padding-top: 2%;
		font-size: 18px !important;
		-webkit-box-orient: vertical;
	}
	
	.uni-auth-view .uni-modal__btn:active {
		background-color: #eee
	}
	
	.uni-auth-view .uni-modal__btn:after {
		content: " ";
		position: absolute;
		left: 0;
		top: 0;
		width: 1px;
		bottom: 0;
		border-left: 1px solid #d5d5d6;
		color: #d5d5d6;
		-webkit-transform-origin: 0 0;
		transform-origin: 0 0;
		-webkit-transform: scaleX(.5);
		transform: scaleX(.5);
	}
	
	.uni-auth-view .uni-modal__btn:first-child:after {
		display: none
	}
	
	.uni-auth-view .uni-modal__btn_default {
		color: #353535
	}
	
	.uni-auth-view .uni-modal__btn_primary {
		color: #007aff
	}
</style>
