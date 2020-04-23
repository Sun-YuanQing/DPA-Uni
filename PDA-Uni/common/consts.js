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
		//使用过的标签与打印机
		usedLabelAndPrinters: 'usedLabelAndPrinters',
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
		//保存蓝牙信息
		bleInfo: 'bleInfo',
		//全局化配置
		ErpReturnSet: 'ErpReturnSet',
		//是否启用储位不清除(FQC合格入库)2019-06-26
		IsStorageBin: 'IsStorageBin',
		//一体化取值
		erpInterfaceType:'erpInterfaceType',
		//成品批次号(inLot)产生规则
		mesInLotType:'mesInLotType',
		//模块的快捷/默认设置[]新增的话用.push()不要清除原有的数据,添加propNo对比改你的菜单
		menu_setting:'menu_setting',
		//sale-hwtagDet返回数据
		hwDetails:'hwDetails',
		//蓝牙设置
		bluetoothPrinterSet:'bluetoothPrinterSet',
		//menu菜单在首页赋值的，可以直接获取
		menu:'menu'
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
	 * @description 锁屏类别:  report.报工 picking_return.生产退料 picking_out.生产领料  process_receive.工序接收 process_into.工序投入 sale_out.销售出货  sale_oqcOut OQC出货
	 */
	lockType: {
		report: 0,
		picking_return: 1,
		picking_out: 2,
		process_receive: 3,
		process_into: 4,
		sale_out: 5,
	    sale_oqcOut:7
	},
	erpInterfaceType: {
		/**
		 * @description  一体化
		 */
		yitihua : 1,
        SAP : 2,
        Oracle : 3,
		/**
		 * @description  金蝶
		 */
        jindie : 4,
		/**
		 * @description  用友
		 */
        yongyou : 5,
		/**
		 * @description  安费诺
		 */
        anfeinuo : 6,
		/**
		 * @description  禹龙通
		 */
        yulongtong : 7,
		/**
		 * @description  三维
		 */
        sanwei : 8,
		/**
		 * @description  古鑫
		 */
        guxin : 9,
		/**
		 * @description 索源
		 */
		suoyuan: 10,
		/**
		 * @description 昶通
		 */
		changtong: 11
	},
	mesInLotType: {
		/**
		 * @description  制单批号
		 */
		MoLot : 1,
		/**
		 * @description  制单上有订单批号则用订单批号否则为制单批号
		 */	
        OrdMoLot : 2,
		/**
		 * @description  制单批号+系统日期的年周(4位)
		 */	
        MoLotYearWeek : 3,
		/**
		 * @description  制单批号+系统日期的年月日(6位)
		 */
        MoLotYMD : 4
	}
}
