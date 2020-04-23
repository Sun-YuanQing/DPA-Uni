(function($, owner) {
	/***************************************登录、注销、升级、心跳链接、菜单*****************************************************/

	/**
	 * @description 判断系统 是否需要升级
	 * @param {String} ver 系统版本号
	 * @param {String} custVer 客户版本号
	 */
	owner.upgrade = function(ver, custVer, callback) {
		custVer = custVer || '';
		ajaxMethod('upgrade?ver=' + ver + '&custVer=' + custVer, null, callback, 'get', false);
	}

	/**
	 * @description 获取帐套信息
	 */
	owner.getdbmap = function(callback) {
		ajaxMethod('getdbmap', null, callback, 'get', false);
	}

	/**
	 * @description 登录
	 */
	owner.login = function(loginInfo, callback) {
		if(!common.IsConnectedToInternet()) {
			return;
		}
		var url = owner.getFullUrlAddress('login');
		$.ajax({
			type: "post",
			url: url,
			async: true,
			headers: {
				'Content-Type': 'application/json',
			    'clienttype':'openmes'
			},
			dataType: 'json',
			data: loginInfo,
			success: function(data) {
				data = getAjaxResult(data);
				callback(data);
				if(data.success) {
					var jsonData = JSON.parse(data.ResultNote);
					owner.createState(loginInfo, jsonData);
				}
			},
			error: function(xhr, type, errorThrown) {
				return callback(getAjaxErrResult(xhr, type, errorThrown));
			}
		});
	};

	/**
	 * @description 记录登录信息
	 * @param {String} name UserId
	 * @param {Object} sessionId sessionId
	 */
	owner.createState = function(loginInfo, userInfo) {
		var state = app.getState();
		state.account = loginInfo.userID;
		state.userName = userInfo.userName;
		state.token = userInfo.sessionId;
		state.loginInfo = loginInfo;
		app.setState(state);
	};

	/**
	 * @description 获取当前用户的SessionId
	 */
	owner.getSessionId = function() {
		var state = app.getState();
		return state.token;
	};

	/**
	 * @description 注销
	 */
	owner.logout = function(callback) {
		ajaxMethod('logout', '', callback, 'post', false); //同步处理
		//清除sessionId
		var state = app.getState();
		state.account = '';
		state.token = "";
		app.setState(state);

		//清除菜单缓存
		app.clearUsedMenus();
		//默认不自动登录
		var settings = app.getSettings();
		settings.autoLogin = false;
		app.setSettings(settings);

	}

	/**
	 * @description 心跳链接
	 */
	owner.ping = function(callback) {
		ajaxMethod('ping?sessionId=' + owner.getSessionId(), '', callback);
	}

	/**
	 * @description 菜单对象
	 * @param {String} name 菜单名称
	 * @param {String} action 页面链接地址
	 * @param {Array} submenu 子集菜单
	 * @constructor
	 */
	function MenuInfo(name, action, submenu, code) {
		submenu = submenu || [];
		action = action || '';
		code = code || '';
		this.name = name;
		this.action = action;
		this.submenu = submenu;
		this.code = code;
		this.isEnabled = true;//是否启用
	}
	/**
	 * @description 获取系统菜单
	 * @param {String} sessionId
	 * @return {Object}
	 */
	owner.getMenus = function(callback) {
		//		1、入库
		//2、领料
		//3、成品入库
		//4、销售出货
		//5、盘点
		//6、装箱
		//		var url = getFullUrlAddress('api/login');
		//		var data = {sessionId: owner.getSessionId()};
		//		ajaxMethod(url, data, callback, 'get');

		var lst = [];
		var menu = new MenuInfo('常用功能');
		var userMenus = app.getUsedMenus();
		for(var i = userMenus.length - 1; i >= 0; i--) {
			menu.submenu.push(new MenuInfo(userMenus[i].name, userMenus[i].action, null, userMenus[i].code));
		}
		lst.push(menu);
		
		
		menu = new MenuInfo('来料管理');
		menu.submenu.push(new MenuInfo('来料入库', '/Pages/PurInstor.html', null, 'PurInstor'));
		lst.push(menu);

		menu = new MenuInfo('领料管理');
		menu.submenu.push(new MenuInfo('领料', '/Pages/Picking.html', null, 'Picking'));
//		menu.submenu.push(new MenuInfo('来料入库', '/Pages/PurInstor.html'));
		//		menu.submenu.push(new MenuInfo('Audio', '/Pages/Audio.html'));
		lst.push(menu);
		
//		menu = new MenuInfo('SMT管理');
//		menu.submenu.push(new MenuInfo('SMT上料', '/Pages/SMTUpMat.html', null, 'SMTUpMat'));
//		menu.submenu.push(new MenuInfo('岗位记录', '/Pages/JobRec.html', null, 'JobRec'));
//		lst.push(menu);

		menu = new MenuInfo('装箱管理');
		menu.submenu.push(new MenuInfo('装箱管理', '/Pages/Pack.html', null, 'Pack'));
		//		menu.submenu.push(new MenuInfo('包装后QA', '/Pages/PackQA.html'));
		//		menu.submenu.push(new MenuInfo('拆箱', '/Pages/Pack_Un.html'));
		lst.push(menu);

		menu = new MenuInfo('完工入库管理');
		menu.submenu.push(new MenuInfo('完工入库', '/Pages/FinishInStor.html', null, 'FinishInStor'));
		lst.push(menu);

		menu = new MenuInfo('盘点管理');
		menu.submenu.push(new MenuInfo('盘点', '/Pages/TakeStock.html', null, 'TakeStock'));
		lst.push(menu);

		menu = new MenuInfo('销售出货管理');
		menu.submenu.push(new MenuInfo('销售出货', '/Pages/Delivery.html', null, 'Delivery'));
		lst.push(menu);
		callback(getAjaxResult1(lst));
	}
	/***********************************登录、注销、升级、心跳链接、菜单  END ****************************************/

	/************************************ 领料 ***************************************************************************/

	/**
	 * @description 扫描条码,返回分析结果
					条码有3种情况:
					1: 料号
					2: 序列号
					3: 批号
		@param {String} code 扫描的条码
	 */
	owner.getScanCode = function(code, callback) {
		ajaxMethod('scancode/' + encodeURIComponent(code) + '?sessionId=' + owner.getSessionId(), '', callback);
		//		var partControl = 1;
		//		if(code != 'lt000007')
		//			partControl = 2;
		//		var rlt = {
		//			partControl: partControl,
		//			partNo: 'NM0001',
		//			itemNo: 'lt000007',
		//			partName: '名称0000',
		//			partSpec: '8 * 8',
		//			packNumber: 2,
		//			snLength: 12 // (当前partControl= 2时,返回定义的序列号长度,用于前台校验)
		//		};
		//		rlt = JSON.stringify(rlt);
		//		callback(getAjaxResult1(rlt));
	}
	
	/**
	 * @description 入库扫描条码时，校验条码是否符合设置的标识码规则
					条码有3种情况:
					1: 料号
					2: 序列号
					3: 批号
		@param {String} code 扫描的条码
		@param {String} barCodeStatus  指定扫描条码的类别，传入0代表不校验，1代表料品，2代表序列号，3代表批次 4代表箱号
	 */
	owner.getScanCode_Instor = function(code, barCodeStatus, callback) {
		//http://xxx:port/api/pad/scminreqlot/code?barCodeStatus=2
		barCodeStatus = barCodeStatus || 0;
		var url = 'scminreqlot/' + encodeURIComponent(code) + '?sessionId=' + owner.getSessionId() + '&barCodeStatus' + barCodeStatus;
//		ajaxMethod(url, '', callback);
		callback(getAjaxResult1(1));
	}

	/**
	 * @description 单纯检测条码
	 * @param {String} code 扫描的条码
	 * @param {Number} scanSta 可选参数,校验扫描的料品字符串合法性，传入0代表不校验，1代表料品，2代表序列号，3代表批次(与partControl 比较)
	 */
	owner.getScanPartCode = function(code, partControl, callback) {
		ajaxMethod('scanpartcode/' + encodeURIComponent(code) + '?sessionId=' + owner.getSessionId() + '&partControl=' + partControl, '', callback);
		//		var partControl = 1;
		//		if(code != 'lt000007')
		//			partControl = 2;
		//		var rlt = {
		//			partControl: partControl,
		//			partNo: 'NM0001',
		//			itemNo: 'lt000007',
		//			partName: '名称0000',
		//			partSpec: '8 * 8',
		//			packNumber: 2,
		//			snLength: 12 // (当前partControl= 2时,返回定义的序列号长度,用于前台校验)
		//		};
		//		rlt = JSON.stringify(rlt);
		//		callback(getAjaxResult1(rlt));
	}

	/**
	 * @description 获取领料单单据列表
	 * @return {Array} 返回领料单列表
	 * @param {Number} offset 当前页数,默认0
	 * @param {Number} limit 每页行数,默认10
	 */
	owner.getPickingOrders = function(offset, limit, callback) {
		offset = offset || 0;
		limit = limit || 10;
		var url = 'proout?sessionId=' + owner.getSessionId() + '&limit=' + limit + '&offset=' + offset;
		ajaxMethod(url, '', callback, 'get');
	}

	/**
	 * @description 获取领料单明细
	 * @param {String} sheetNo 单号
	 */
	owner.getPickingOrderDetail = function(sheetNo, callback) {
		var url = 'proout/' + encodeURIComponent(sheetNo) + '?sessionId=' + owner.getSessionId();
		ajaxMethod(url, '', callback, 'get');
	}

	/**
	 * @description 保存、过账 领料单
	 * @param {Object} data 单据对象，包含明细
	 * @param {Function} callback 回调函数
	 */
	owner.savePickingOrder = function(data, callback) {
		ajaxMethod('proout', data, callback, 'post');
	}
	/************************************领料  END *****************************************************************/
	
	/************************************ 来料入库  ************************************************************************/
	/**
	 * @description 获取来料入库列表
	 * @param {Number} offset 当前页数,默认0
	 * @param {Number} limit 每页行数,默认10
	 */
	owner.getPurInstorOrders = function(offset, limit, callback) {
		offset = offset || 0;
		limit = limit || 10;
//		var url = 'puracceptin?sessionId=' + owner.getSessionId() + '&limit=' + limit + '&offset=' + offset;
//		var url = 'proout?sessionId=' + owner.getSessionId() + '&limit=' + limit + '&offset=' + offset;
//		ajaxMethod(url, '', callback, 'get');

		var data = {"ResultCode":1,"ResultText":"","ResultNote":"[{\"sheetNo\":\"KKA1709001\",\"sheetDate\":\"2017-09-21 16:13:56\",\"depName\":\"人力资源部\",\"sheetType\":\"SCM170101\",\"sheetSta\":\"0\",\"inDetail\":null},{\"sheetNo\":\"KKA1709002\",\"sheetDate\":\"2017-09-21 16:15:13\",\"depName\":\"市场部\",\"sheetType\":\"SCM170101\",\"sheetSta\":\"0\",\"inDetail\":null},{\"sheetNo\":\"KKA1709003\",\"sheetDate\":\"2017-09-21 16:17:15\",\"depName\":\"生产品控部\",\"sheetType\":\"SCM170101\",\"sheetSta\":\"0\",\"inDetail\":null},{\"sheetNo\":\"KKA1709004\",\"sheetDate\":\"2017-09-21 16:17:21\",\"depName\":\"生产品控部\",\"sheetType\":\"SCM170101\",\"sheetSta\":\"0\",\"inDetail\":null},{\"sheetNo\":\"KKA1709005\",\"sheetDate\":\"2017-09-22 17:32:33\",\"depName\":\"生产部\",\"sheetType\":\"SCM170101\",\"sheetSta\":\"0\",\"inDetail\":null},{\"sheetNo\":\"KKA1710001\",\"sheetDate\":\"2017-10-18 16:43:42\",\"depName\":\"生产部0\",\"sheetType\":\"SCM170101\",\"sheetSta\":\"0\",\"inDetail\":null}]"};
		callback(getAjaxResult(data));
	}
	/**
	 * @description 获取来料入库明细
	 * @param {String} sheetNo 单号
	 */
	owner.getPurInstorOrderDetail = function(sheetNo, callback) {
		var url = 'proout/' + encodeURIComponent(sheetNo) + '?sessionId=' + owner.getSessionId();
//		var url = 'puracceptin/' + encodeURIComponent(sheetNo) + '?sessionId=' + owner.getSessionId();
//		ajaxMethod(url, '', callback, 'get');
		var data = {"ResultCode":1,"ResultText":"","ResultNote":"{\"sheetNo\":\"KKA1709005\",\"sheetDate\":\"2017-09-22 17:32:33\",\"depName\":\"生产部\",\"sheetType\":\"SCM170101\",\"sheetSta\":\"0\",\"inDetail\":[{\"sheetLot\":\"KKA1709005_001\",\"partNo\":\"lt000007\",\"itemNo\":\"lt000007\",\"partName\":\"铅锑合金 / QT- 1#金洋\",\"partSpec\":\"㎏\",\"partUnit\":\"千克\",\"whNo\":\"0301\",\"whName\":\"原材料仓\",\"location\":null,\"sheetQty\":3.00000000,\"validQty\":2.0,\"custNo1\":\"O0000000000000000003\",\"custNo1Name\":\"\",\"partControl\":2,\"esnList\":[\"SN170516lt000007000001\",\"SN170516lt000007000002\"],\"inoutDetail\":[]},{\"sheetLot\":\"KKA1709005_002\",\"partNo\":\"lt000008\",\"itemNo\":\"lt000008\",\"partName\":\"软木粉 / 200目\",\"partSpec\":\"克\",\"partUnit\":\"千克\",\"whNo\":\"0301\",\"whName\":\"原材料仓\",\"location\":null,\"sheetQty\":100.00000000,\"validQty\":0.0,\"custNo1\":\"O0000000000000000003\",\"custNo1Name\":\"\",\"partControl\":3,\"esnList\":[],\"inoutDetail\":[{\"id\":1,\"inLot\":\"lt0000080002\",\"sheetQty\":40.00000000,\"validQty\":0.0},{\"id\":2,\"inLot\":\"lt0000080003\",\"sheetQty\":60.00000000,\"validQty\":0.0}]},{\"sheetLot\":\"KKA1709005_003\",\"partNo\":\"lt000009\",\"itemNo\":\"lt000009\",\"partName\":\"硅酸钠\",\"partSpec\":\"克\",\"partUnit\":\"千克\",\"whNo\":\"0301\",\"whName\":\"原材料仓\",\"location\":null,\"sheetQty\":3.00000000,\"validQty\":0.0,\"custNo1\":\"O0000000000000000003\",\"custNo1Name\":\"\",\"partControl\":1,\"esnList\":[],\"inoutDetail\":[]}]}"};
		callback(getAjaxResult(data));
	}

	/**
	 * @description 保存、过账 来料入库
	 * @param {Object} data 单据对象，包含明细
	 * @param {Function} callback 回调函数
	 */
	owner.savePurInstorOrder = function(data, callback) {
		ajaxMethod('puracceptin', data, callback, 'post');
	}
	/************************************ 来料入库 END ************************************************************************/	
	

	/************************************ 装箱 ***************************************************************************/

	/**
	 * @description 保存装箱结果
	 * @param {Object} data 提交数据
	 */
	owner.savePackOrder = function(data, callback) {
		ajaxMethod('packing', data, callback, 'post');
	}

	/************************************ 装箱 END ***************************************************************************/

	/************************************ 完工入库 ***************************************************************************/
	/**
	 * @description 扫描制造批号
	 * @param {String} code 制造批号
	 */
	owner.getScanMOLOT = function(code, callback) {
		ajaxMethod('mo/' + encodeURIComponent(code) + '?sessionId=' + owner.getSessionId(), '', callback);
		//		var rlt = {
		//			partNo: "00000001",
		//			itemNo: "1234",
		//			partName: "电容",
		//			partSpec: "20μ"
		//		};
		//		callback(getAjaxResult1(JSON.stringify(rlt)));
	}

	/**
	 * @description 扫描箱号
	 * @param {String} code 箱号
	 * @param {Boolean} isNeedDetail 是否需要返回箱子里的序列号列表，默认 不返回 
	 */
	owner.getScanBox = function(code, isNeedDetail, callback) {
		isNeedDetail = isNeedDetail || false;
		var url = 'boxno/' + encodeURIComponent(code) + '?sessionId=' + owner.getSessionId();
		if(isNeedDetail)
			url += '&list=1'
		ajaxMethod(url, '', callback);
		//		var rlt = {
		//			partNo: "000000000001",
		//			esnCount: 3,
		//			esnList: ["001", "002", "003"]
		//		};
		//		callback(getAjaxResult1(JSON.stringify(rlt)));
	}

	/**
	 * @description 完工入库保存
	 * @param {Object} data 数据对象
	 */
	owner.saveFinishInStor = function(data, callback) {
		ajaxMethod('acceptin', data, callback, 'post');
	}

	/************************************ 完工入库 END ************************************************************************/

	/************************************ 销售出库  ************************************************************************/
	/**
	 * @description 获取销售出库单列表
	 * @param {Number} offset 当前页数,默认0
	 * @param {Number} limit 每页行数,默认10
	 * @return {Array} 返回领料单列表
	 */
	owner.getDeliveryOrders = function(offset, limit, callback) {
		offset = offset || 0;
		limit = limit || 10;
		var url = 'ordout?sessionId=' + owner.getSessionId() + '&limit=' + limit + '&offset=' + offset;
		ajaxMethod(url, '', callback, 'get');
		//				var rlt = [{
		//					sheetNo: "0001",
		//					sheetDate: new Date(12343002342),
		//					depName: "业务部",
		//					sheetType: "SAL0701",
		//					sheetSta: "0",
		//					ordOutDetail: null
		//				}];
		//				callback(getAjaxResult1(JSON.stringify(rlt)));
	}

	/**
	 * @description 获取销售出库单明细
	 * @param {String} sheetNo 单号
	 */
	owner.getDeliveryOrderDetail = function(sheetNo, callback) {
		var url = 'ordout/' + encodeURIComponent(sheetNo) + '?sessionId=' + owner.getSessionId();
		ajaxMethod(url, '', callback, 'get');
		//				var rlt = {
		//					sheetNo: "0001",
		//					sheetDate: new Date(12343002342),
		//					depName: "业务部",
		//					sheetType: "SAL0701",
		//					sheetSta: "0",
		//					ordOutDetail: [{
		//							sheetLot: '0001_001',
		//							partNo: "000000000001",
		//							itemNo: "22223",
		//							partName: "手机1",
		//							partSpec: "牛逼手机1",
		//							whNoName: "成品仓",
		//							sheetQty: 100,
		//							esnList: [{
		//								boxNo: "001",
		//								esnNo: ["item000000001"]
		//							}]
		//						},
		//						{
		//							sheetLot: '0001_002',
		//							partNo: "000000000001",
		//							itemNo: "22224",
		//							partName: "手机2",
		//							partSpec: "牛逼手机2",
		//							whNoName: "成品仓",
		//							sheetQty: 50,
		//							esnList: [{
		//								boxNo: "005",
		//								esnNo: ["item000000001"]
		//							}]
		//						}
		//					]
		//				};
		//		
		//				callback(getAjaxResult1(JSON.stringify(rlt)));
	}

	/**
	 * @description 保存销售出库单
	 * @param {Object} data 单据信息
	 */
	owner.saveDeliveryOrder = function(data, callback) {
		ajaxMethod('ordout', data, callback, 'post');
		//callback(getAjaxResult1(''));
	}

	/************************************ 销售出库 END ************************************************************************/

	/************************************ 盘点  ************************************************************************/

	/**
	 * @description 获取盘点单列表
	 * @param {Number} offset 当前页数,默认0
	 * @param {Number} limit 每页行数,默认10
	 */
	owner.getTakeStockOrders = function(offset, limit, sheetNo, callback) {
		offset = offset || 0;
		limit = limit || 10;
		var url = 'pandian?sessionId=' + owner.getSessionId() + '&limit=' + limit + '&offset=' + offset;
		if(sheetNo != '')
			url += '&sheetNo=' + encodeURIComponent(sheetNo);

		ajaxMethod(url, '', callback);
		//		var rlt = [{
		//			sheetNo: "Pd00001",
		//			sheetDate: "2017-09-27",
		//			whNo: "0001",
		//			whName: "原料仓",
		//			total: 100,
		//			finished: 50,
		//			unFinished: 50
		//		}];
		//		callback(getAjaxResult1(JSON.stringify(rlt)));
	}

	/**
	 * @description 
	 * 获取盘点单明细列表
	 * 根据扫描料号或者批号传入partOrLot参数返回盘点单中是否有此记录,可能有多笔
	 * 如果不传料号或者批号,但是传入状态,则查询此状态下的盘点明细数据
	 * 如果只传入单号,则查出所有的盘点明细数据
	 * @param {String} sheetNo 单号
	 * @param {String} partOrLot 料号或者是批号
	 * @param {Number} sta 判断状态: 0: 未完成 ,1: 已完成 ,2: 全部,不传表示全部
	 * @param {Number} offset 当前页数,默认0
	 * @param {Number} limit 每页行数,默认10
	 */
	owner.getTakeStockOrderDetail = function(sheetNo, partOrLot, pdSta, callback, offset, limit) {
		offset = offset || 0;
		limit = limit || 10;
		pdSta = pdSta || 2;
		var url = 'pandian/' + encodeURIComponent(sheetNo) + '?sessionId=' + owner.getSessionId() + '&partOrLot=' + encodeURIComponent(partOrLot) + '&pdSta=' + pdSta + '&limit=' + limit + '&offset=' + offset;
		ajaxMethod(url, '', callback, 'get');

		//		var rlt = [{
		//			sheetLot: "P0001_001",
		//			inoutLot: "",
		//			partControl: 2,
		//			partNo: "0000000000003",
		//			itemNo: "22222",
		//			partName: "胶水",
		//			partSpec: "泡沫",
		//			partUnit: "公斤",
		//			whNo: "101",
		//			whName: "原料仓",
		//			sheetQty: 999,
		//			validQty: 10,
		//			pdSta: 0
		//		}];
		//		callback(getAjaxResult1(JSON.stringify(rlt)));
	}

	/**
	 * @description 保存盘点单
	 * @param {Object} data 单据信息
	 */
	owner.saveTakeStockOrder = function(data, callback) {
		ajaxMethod('pandian', data, callback, 'post');
		//callback(getAjaxResult1(''));
	}

	/************************************ 盘点 END ************************************************************************/

	

	/**
	 * @description Ajax 请求
	 * @param {String} url 后缀路径
	 * @param {Object} data 参数
	 * @param {Object} callback 回调
	 * @param {String} type=[get|post] 请求类型
	 * @param {Boolean} type=[true|false] async 是否是异步
	 */
	function ajaxMethod(url, data, callback, type, async) {
		if(!common.IsConnectedToInternet()) {
			return;
		}
		url = owner.getFullUrlAddress(url);
		type = type || 'get';
		data = data || '';
		async = async || true;
		//通过post方法访问时,对于需要身份验证的接口在headers中添加sessionId项
		var headers = {
			'Content-Type': 'application/json',
			'clienttype':'openmes'
		};
		if(type == 'post') {
			headers = {
				'Content-Type': 'application/json',
			    'clienttype':'openmes',
				'sessionId': owner.getSessionId()
			};
		}
		//		console.log(url);
		$.ajax({
			type: type,
			url: url,
			async: async,
			headers: headers,
			dataType: 'json',
			timeout: 30000, //1分钟超时
			data: data,
			success: function(data) {				
				//console.log('url:' + url + ' data:' + data.ResultNote);
				if(callback != undefined)
					callback(getAjaxResult(data));
			},
			error: function(xhr, type, errorThrown) {
				console.log('type:' + type + ' | error:' + errorThrown + ' | url:' + url);
				return callback(getAjaxErrResult(xhr, type, errorThrown));
			}
		});
	}

	/**
	 * @description 模拟返回的对象
	 * @param {Object} data 
	 */
	function getAjaxResult(data) {
//		var rlt = {
//			ResultCode: data.ResultCode,
//			ResultNote: data.ResultNote, //返回的数据
//			ResultText: data.ResultText, //失败原因
//			success: data.ResultCode == 1
//		};
//		console.log(JSON.stringify(data));
		var rlt = JSON.parse(data);
		return {
			ResultCode: rlt.ResultCode,
			ResultNote: rlt.ResultNote, //返回的数据
			ResultText: rlt.ResultText, //失败原因
			success: rlt.ResultText == ""
		}
	};

	function getAjaxResult1(data) {
		return {
			ResultCode: 1,
			ResultNote: data, //返回的数据
			ResultText: '', //失败原因
			success: 1 == 1
		}
	};

	/**
	 * @description 返回 请求服务器，请求报错
	 * @param {Object} xhr
	 * @param {Object} type
	 * @param {Object} errorThrown
	 */
	function getAjaxErrResult(xhr, type, errorThrown) {
		var err = type + '|' + errorThrown;
		switch(type) {
			case 'timeout':
				err = "连接服务器超时";
				break;
			case 'abort':
				err = "连接不上服务器";
				break;
			default:
				break;
		}
		return {
			ResultCode: -1,
			ResultNote: '',
			ResultText: err,
			success: false
		}
	}

	/**
	 * @description 获取完整的api地址
	 * @sample api/login 
	 * @param {String} postfix 具体的地址
	 */
	owner.getFullUrlAddress = function(postfix) {
		//var url = 'http://192.168.0.179:8003/api/pda/' + postfix;
		//		var url = 'http://192.168.0.226:8088/api/pda/' + postfix;
		var settings = app.getSettings();
		var url = 'http://' + settings.ServerIP + '/api/pda/' + postfix;
		return url;
	}

}(mui, window.apiServer = {}));