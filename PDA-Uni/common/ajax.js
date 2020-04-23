'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) {
	return typeof obj;
} : function(obj) {
	return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" :
		typeof obj;
};
var logger = require('./logger');
import storage from '../common/storage.js';
import consts from '../common/consts.js';
import store from 'store/index';
/** 
 * 具体用法
 * import store from 'store/index';
 * var userInfo = store.state.userInfo;
 * store.commit('login', userInfo)
 */

var StatusCodes = {
	success: 200,
	created: 201,
	noContent: 204,
	badRequest: 400,
	notFound: 404,
	serverError: 500
};

var getRequest = function getRequest(method, options) {
	options.data = options.data || {};

	var userInfo = storage.get(consts.storageKeys.login);
	// console.log(JSON.stringify(userInfo))
	var sid = '';
	if (userInfo != null) {
		sid = userInfo.sessionId;
	}
	////发布时需要清空
	//sid = 'a4a594dcc8d04216b817852992d8a30f';
	var request = {
		url: storage.get(consts.storageKeys.serverUrl) + options.url,
		method: method,
		data: options.data,
		$options: options,
		header: {
			'Access-Control-Allow-Origin': '*',
			'clienttype': 'openpda',
			'sessionId': sid
		}
	};

	/* switch (method) {
		case 'get':
			{ 
				break;
			}
		case 'post':
		case 'put':
			{
				break;
			}
	} */
	return request;
};

var completeHandler = function completeHandler(request, response) {
	var options = request.$options;
	switch (response.statusCode) {
		case StatusCodes.success:
			{
				options.success && options.success.call(options.scope || this, response.data);
				options.complete && options.complete.call(options.scope || this, 'success', response.data);
				break;
			}
		case StatusCodes.created:
		case StatusCodes.noContent:
			{
				options.success && options.success.call(options.scope || this, '');
				options.complete && options.complete.call(options.scope || this, 'success', '');
				break;
			}
		case StatusCodes.notFound:
			{
				options.failure && options.failure.call(options.scope || this, '数据不存在,或已处理.');
				options.complete && options.complete.call(options.scope || this, 'notFound', '数据不存在,或已处理.');
				break;
			}
		case StatusCodes.badRequest:
		case StatusCodes.serverError:
			{
				var isLoginErr = false;
				if (response.data.resultCode == -99) {
					store.commit('sessionLost')
					/**
					 * 判断本地是否有Session缓存
					 *  有：后台自动登录
					 *  无：跳转到登录页面
					 */
					var userInfo = storage.get(consts.storageKeys.login);
					//以下接口请求时，不跳转
					let urlArr = ["pda/getdbmap", "pda/logout", "pda/upgrade", "pda/login", "Pda/ping"];
					if (userInfo.autologin && urlArr.indexOf(urlArr) < 0) {
						if (options.retry == undefined) options.retry = 1;
						if (options.retry && options.retry > 0) {
							console.log(`第${options.retry}次请求`)
							isLoginErr = true;
							options.retry--;
							//身份验证失败
							reLogin(request);
						}
					} else {
						uni.hideLoading();
						uni.navigateTo({
							url: '/pages/login/login?sessionLost=true',
						})
						return;
					}
				}
				if (!isLoginErr) {
					if (!options.failure) {
						this.handlers.failure.call(this, request, response);
					} else {
						options.failure && options.failure.call(options.scope || this, response.data.resultText);
					}
					options.complete && options.complete.call(options.scope || this, 'failure', response.data.resultText);
				}

				break;
			}
		default:
			options.complete && options.complete.call(options.scope || this, 'failure', response.data.resultText);
			break;
	}

};
//重新登录
var reLogin = function(request) {
	let userInfo = storage.get(consts.storageKeys.login);
	if (userInfo != null) {
		var option = {
			url: 'pda/login',
			data: userInfo,
			success: (res) => {
				userInfo.sessionId = res.sessionId;
				userInfo.loginDatetime = res.loginDatetime;
				store.commit('login', userInfo);
				storage.set(consts.storageKeys.login, userInfo);

				request.header.sessionId = res.sessionId;
				ajax.send(request);
			},
		};
		ajax.post(option);
	}
}

var failureHandler = function failureHandler(request, error) {
	var options = request.$options;
	// console.log('retry' + options.retry)
	if (options.retry && options.retry > 0) {
		options.retry--;
		this.send(request);
	} else {
		// this.handlers.requestError.call(this, request, error);
		options.failure && options.failure.call(options.scope || this, '网络异常');
		options.complete && options.complete.call(options.scope || this, 'requestError', '网络异常');
	}
};


var ajax = {
	settings: {
		postType: 'application/json',
		// appKey: '51D5ED12-EF6C-4414-BDD8-F3946CD50846',
		// withCredentials: true
	},
	dealHandlers: {
		completeHandler: completeHandler,
		failureHandler: failureHandler
	},
	handlers: {
		failure: function failure(request, reponse) {
			logger.error('ajax', '操作失败', {
				url: request.url,
				request: request,
				reponse: reponse
			});
		},
		invalidParams: function invalidParams(request, reponse) {
			logger.error('ajax', '参数错误', {
				url: request.url,
				request: request,
				reponse: reponse
			});
		},
		invalidCredential: function invalidCredential(request, reponse) {
			logger.error('ajax', '凭证失效(被踢下线)', {
				url: request.url,
				request: request,
				reponse: reponse
			});
		},
		sessionLost: function sessionLost(request, reponse) {
			logger.error('ajax', '会话丢失(凭证过期)', {
				url: request.url,
				request: request,
				reponse: reponse
			});
		},
		unauthorized: function unauthorized(request, reponse) {
			logger.error('ajax', '权限错误', {
				url: request.url,
				request: request,
				reponse: reponse
			});
		},
		serverError: function serverError(request, reponse) {
			logger.error('ajax', '服务器异常', {
				url: request.url,
				request: request,
				reponse: reponse
			});
		},
		requestError: function requestError(request, error) {
			logger.error('ajax', '通讯错误', {
				url: request.url,
				request: request,
				error: error
			});
		}
	},
	/**  
	 * @description Get
	 * @constructor   
	 */
	get: function get(options) {
		var request = getRequest.call(this, 'GET', options);
		return this.send(request, options);
	},
	put: function put(options) {
		var request = getRequest.call(this, 'PUT', options);
		request.headers = {
			'Content-Type': 'application/json'
		};
		return this.send(request, options);
	},
	post: function post(options) {
		var type = options.type || this.settings.postType;
		if (type === 'form')
			return this.form(options)
		else
			return this.json(options);
	},
	form: function form(options) { //以表单的形式提交
		var request = getRequest.call(this, 'POST', options);

		/* request.headers = {
			'Content-Type': 'application/x-www-form-urlencoded'
		}; */
		return this.send(request, options);
	},
	del: function del(options) { //以表单的形式提交
		var request = getRequest.call(this, 'DELETE', options);
		request.headers = {
			'Content-Type': 'application/x-www-form-urlencoded'
		};
		return this.send(request, options);
	},
	json: function json(options) {
		// console.log(JSON.stringify(options))
		var request = getRequest.call(this, 'POST', options);
		// console.log(JSON.stringify(request))
		/* request.headers = {
			'Content-Type': 'application/json'
		}; */
		return this.send(request, options);
	},
	// upload: function upload(options) {
	// 	if (!options.files || Object.keys(options.files).length == 0) throw new Error('files is emplty.');

	// 	var request = getRequest.call(this, 'POST', options);
	// 	var formData = new FormData();

	// 	for (var name in request.data) {
	// 		if (_typeof(request.data[name]) === 'object') {
	// 			for (var key in request.data[name]) {
	// 				formData.append(name + '.' + key, request.data[name][key]);
	// 			}
	// 		} else {
	// 			formData.append(name, request.data[name]);
	// 		}
	// 	}

	// 	for (var _name in options.files) {
	// 		formData.append(_name, options.files[_name]);
	// 	}

	// 	request.headers = {
	// 		'Content-Type': 'multipart/form-data'
	// 	};

	// 	request.data = formData;

	// 	this.send(request, options);
	// },
	send: function send(request, options) {
		//以下接口不输出日志
		var filterUriArr = ['ping', 'login', 'menu'];
		var isOutLog = true;
		for (var i = 0; i < filterUriArr.length; i++) {
			if (request.url.indexOf(filterUriArr[i]) > -1) {
				isOutLog = false;
				break;
			}
		}
		if (isOutLog) {
			console.log("传递参数======================")
			console.log(request.url)
			console.log(`method:${request.method} | sessionId:${request.header.sessionId}`)
			console.log(JSON.stringify(request.data))
			console.log("----------------------")
		}
		var _this = this;
		var task = uni.request({
			url: request.url,
			data: request.data,
			method: request.method,
			header: request.header,
			success: (response) => {
				if (isOutLog && response.statusCode != StatusCodes.created) {
					console.log(`method:${request.method} | ${request.url}` + " 返回值Start******************")
					console.log(JSON.stringify(response));
					console.log(`${request.url}` + " 返回值End----------------------")
				}
				_this.dealHandlers.completeHandler.call(_this, request, response);
			},
			fail: (response) => {
				console.log(JSON.stringify(response));
				_this.dealHandlers.failureHandler.call(_this, request, response);
			}
		});
		return task;
	}
};

module.exports = ajax;
