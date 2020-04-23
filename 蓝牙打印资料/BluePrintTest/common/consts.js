'use strict';
//放置常量

module.exports = {
	/**
	 * @description 本地存储Key
	 */
	storageKeys: {
		//本地存储Key

		//服务器前缀 eg: http://192.168.0.226:8888
		serverPrefixUrl: 'serverPrefixUrl',
		//服务器完整地址前缀 eg: http://192.168.0.226:8888/api/
		serverUrl: 'serverUrl',
		//登录
		login: 'login',
		//最近使用的菜单
		usedMenus: 'usedMenus',
		//最近使用的打印机
		usedPrinters: 'usedPrinters',
		//PDA绑定工序、设备
		padBinding: 'padBinding',
		//传递设备数据
		navBackData_searchDeivce: 'navBackData_searchDeivce',
		//传递工序数据
		navBackData_searchProcess: 'navBackData_searchProcess',
		//传递单个不良现象数据，search-bug-processList.vue赋值
		navBackData_bug_Process: 'navBackData_bug_Process',
		//传递不良现象数据集，process-getngqty.vue赋值
		navBackData_bug_data: 'navBackData_bug_data',
		bleInfo: 'bleInfo' //保存蓝牙信息
	},
	/**
	 * @description 状态:  detached.附加  unchanged.未改变  deleted.删除  modified.修改  added.添加
	 */
	entityState: {
		//附加
		detached: 0,
		//未改变
		unchanged: 1,
		//删除
		deleted: 2,
		//修改
		modified: 3,
		//添加
		added: 4
	},
	/**
	 * @description 锁屏类别:  report.报工 picking_return.生产退料 picking_out.生产领料  process_receive.工序接收 process_into.工序投入 sale_out.销售出货
	 */
	lockType: {
		report: 0,
		picking_return: 1,
		picking_out: 2,
		process_receive: 3,
		process_into: 4,
		sale_out: 5
	}


}
