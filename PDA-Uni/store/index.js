import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

// 缓存在内存中
const store = new Vuex.Store({
	state: {
		hasLogin: false,
		userInfo: {},
		pageIO_submit: false,/* 子页面保存成功标识变量,成功为true */
		urldata:{}
	},
	mutations: {
		login(state, userInfo) {
			state.userInfo = userInfo;
			state.hasLogin = true;
		},
		sessionLost(state) {
			state.hasLogin = false;
		},
		logout(state) {
			state.userInfo = {};
			state.hasLogin = false;
		},
		pageIO_false(state) {
			 state.pageIO_submit = false;
		},
		pageIO_true(state) {
			 state.pageIO_submit = true;
		},
		setUrldata(state,json){
			 state.urldata = json;
		}
	}
})

export default store
