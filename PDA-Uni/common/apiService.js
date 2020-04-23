'use strict';
import ajax from '../common/ajax.js';
import consts from '../common/consts.js';
import storage from '../common/storage.js';

var apis = {
	/**
	 * @description 判断系统 是否需要升级 
	 */
	upgrade: function(dto) {
		var option = dto;
		option.url = 'pda/upgrade';
		ajax.get(option);
	},
	/**
	 * @description 获取帐套信息
	 */
	getdbmap: function(dto) {
		var option = dto;
		option.url = 'pda/getdbmap';
		ajax.get(option);
	},
	/**
	 * @description 登录
	 */
	login: function(dto) {
		var option = dto;
		option.url = 'pda/login';
		ajax.post(option);
	},
	/**
	 * @description 注销
	 */
	logout: function() {
		var option = {};
		option.url = 'Pda/logout';
		ajax.post(option);
	},
	/**
	 * @description 校验密码
	 */
	validUserPwd: function(dto) {
		var option = dto;
		option.url = 'OpenMes/validuserpwd';
		ajax.get(option);
	},
	/**
	 * @description 心跳链接
	 */
	ping: function(dto) {
		var option = dto;
		option.url = 'Pda/ping';
		ajax.get(option);
	},
	/**
	 * @description 获取PDA菜单以及权限
	 * allMenu 1 返回所有菜单，0 仅返回有权限的菜单
	 */
	getMenus: function(dto) {
		var option = dto;
		option.url = 'pda/menu';
		ajax.get(option);
	},
	/**
	 * @description 获取打印机列表
	 */
	getPrinterList: function(dto) {
		var option = dto;
		option.url = 'pda/printerlist';
		ajax.get(option);
	},
	/**
	 * @description 打印
	 */
	printReport: function(dto) {
		var option = dto;
		option.url = 'pda/printreport';
		ajax.post(option);
	},
	/**
	 * @description 根据菜单 progNo 获取报表
	 * @param {String} progNo  菜单编码
	 * @param {String} controlName  报表GUID
	 * @param {String} parameter  客户内码
	 * @param {Boolen} includePrintSyntax  是否包含语法
	 * 
	 */
	getReportList: function(dto) {
		var option = dto;
		option.url = 'OpenMes/report/' + dto.data.progNo;
		ajax.get(option);
	},
	/**
	 * @description Pda取暂收单，显示暂收明细
	 */
	accepttempin_getDetails: function(dto) {
		var option = dto;
		option.url = 'Pda/reqin';
		ajax.get(option);
	},
	/**
	 * @description 保存暂收明细
	 */
	accepttempin_put_save: function(dto) {
		var option = dto;
		option.url = 'OpenMes/reqin';
		ajax.put(option);
	},
	
	
	/**
	 * @description Pda取暂收或入库合格数，显示采购入库明细
	 */
	acceptin_getDetails: function(dto) {
		var option = dto;
		option.url = 'Pda/acceptin';
		ajax.get(option);
	},
	/**
	 * @description Pda取采购退库单，显示退库明细
	 */
	acceptreturn_getDetails: function(dto) {
		var option = dto;
		option.url = 'Pda/acceptreturn';
		ajax.get(option);
	},
	/*  
	 * @description PDA 扫描标签二维码条码增加采购制造委外退库单批次表、标签表记录（储位），删除储位存货记录表 
	 */
	acceptreturn_Save: function(dto) {
		var option = dto;
		option.url = 'OpenMes/acceptinaddlotbarcodepda'; //闵辉改2019-07-19 11:07:05 OpenMes/acceptindellotbarcodepda
		ajax.post(option);
	},
	/**
	 * @description 解析条码
	 */
	basic_QRCodeAnalysis: function(dto) {
		var option = dto;
		option.url = 'OpenMes/mesqrcode';
		ajax.get(option);
	},
	/**
	 * @description 获取工作中心
	 */
	basic_workCenterList: function(dto) {
		var option = dto;
		option.url = 'bas/workcenterlist';
		ajax.get(option);
	},
	/**
	 * @description 获取工序列表
	 */
	basic_ProcessList: function(dto) {
		var option = dto;
		option.url = 'OpenMes/pro';
		ajax.get(option);
	},
	/**
	 * @description 获取单个工序信息
	 */
	basic_ProcessModel: function(dto) {
		var option = dto;
		option.url = 'OpenMes/pro/' + dto.data.proNo;
		ajax.get(option);
	},
	/**
	 * @description 获取工序不良现象
	 */
	basic_bug_ProcessList: function(dto) {
		var option = dto;
		option.url = 'OpenMes/spcbugListbyprono';
		ajax.get(option);
	},
	/**
	 * @description 获取设备列表
	 */
	basic_DeviceList: function(dto) {
		var option = dto;
		option.url = 'OpenMes/device';
		ajax.get(option);
	},
	/**
	 * @description 获取单个设备
	 */
	basic_DeviceGetModel: function(dto) {
		var option = dto;
		option.url = 'OpenMes/device/' + dto.data.deviceNo;
		ajax.get(option);
	},

	/**
	 * @description 修改工作中心
	 */
	messhopconfig_Get: function(dto) {
		var option = dto;
		option.url = 'OpenMes/messhopconfig';
		ajax.get(option);
	},
	messhopconfig_Save: function(dto) {
		var option = dto;
		option.url = 'OpenMes/messhopconfig';
		ajax.put(option);
	},
	/**
	 * @description Pda暂收入库单校验合格后更新上表文件柜状态file_sta = 1
	 */
	acceptin_Save: function(dto) {
		var option = dto;
		option.url = 'Pda/acceptupfilesta?sheetNo=' + dto.data.sheetNo;
		dto.data = {};
		ajax.form(option);
	},
	/**
	 * @description 按采购制造委外入库单批号返回入库单明细信息
	 */
	acceptin_Storage_GetDetails: function(dto) {
		var option = dto;
		option.url = 'OpenMes/acceptindetail/' + dto.data.sheetLot;
		ajax.get(option);
	},
	/**
	 * @description 储位存在检查 (true 存在 false 不存在)
	 */
	storagebinValid: function(dto) {
		var option = dto;
		option.url = 'OpenMes/storagebinvalid';
		ajax.get(option);
	},
	/**
	 * @description 返回指定的储位及仓库列表
	 *@param {String}   binNo 储位
	 */
	bas_storagebin: function(dto) {
		var option = dto;
		option.url = 'bas/storagebin';
		ajax.get(option);
	},
	/**
	 * @description 返回指定条件的仓库列表，条件前台传入，为空表示没有条件
	 *@param {String}   filter 仓库
	 */
	bas_wh: function(dto) {
		var option = dto;
		option.url = 'bas/wh';
		ajax.get(option);
	},
	/**
	 * @description Pda取成品入库单，显示入库明细
	 */
	acceptin_Storage_list: function(dto) {
		var option = dto;
		option.url = 'Pda/acceptindetailbypurlot';
		ajax.get(option);
	},
	/**
	 * @description 入库上架保存
	 */
	acceptin_Storage_Save: function(dto) {
		var option = dto;
		option.url = 'OpenMes/acceptinaddlotbarcodepda';
		ajax.post(option);
	},
	/**
	 * @description Pda取调拨单，显示调拨明细
	 */
	scmdb_getDetails_qrCode: function(dto) {
		var option = dto;
		option.url = 'Pda/scmdbbypart';
		ajax.get(option);
	},
	/**
	 * @description 修改调拨单
	 */
	scmdb_Save: function(dto) {
		var option = dto;
		option.url = 'OpenMes/scmdb';
		ajax.put(option);
	},
	/* 储位初始化上架 */
	storage_Ras: function(dto) {
		var option = dto;
		option.url = 'OpenMes/initbinmaterial';
		ajax.post(option);
	},
	/* 校验标签是否已在储位存货中  */
	storage_RasCun: function(dto) {
		var option = dto;
		option.url = 'OpenMes/binmaterialvaildbytagid';
		ajax.get(option);
	},
	/* 储位转移上架下架校验 */
	storage_Transfer: function(dto) {
		var option = dto;
		option.url = 'OpenMes/binmaterialbinmovevaild';
		ajax.get(option);
	},
	/*储位转移--记录储位存货表、储位交易表  */
	storage_TransferCount: function(dto) {
		var option = dto;
		option.url = 'OpenMes/binmaterialbinmove';
		ajax.post(option);
	},
	/* 储位仓内下架--记录储位存货表、储位交易表 */
	stroage_TransferInoutFag: function(dto) {
		var option = dto;
		option.url = 'OpenMes/binmaterialputdown';
		ajax.post(option);
	},
	/* 储位仓内上架--记录储位存货表、储位交易表 */
	stroage_TransferSide: function(dto) {
		var option = dto;
		option.url = 'OpenMes/binmaterialputon';
		ajax.post(option);
	},
	/* 盘点管理 */
	inventory_management: function(dto) {
		var option = dto;
		option.url = 'OpenMes/binaccountbarcodecreate';
		ajax.post(option);
	},
	/* 按物料、仓库、盘点单ID查询盘点列表 */
	inventory_managementList: function(dto) {
		var option = dto;
		option.url = 'OpenMes/binaccountbylist';
		ajax.post(option);
	},
	/* 修改盘点单 */
	inventory_managementUpdata: function(dto) {
		var option = dto;
		option.url = 'OpenMes/binaccount';
		ajax.post(option);
	},
	/* 储位标签分拆，记录储位存货表，储位交易表 */
	binno_split: function(dto) {
		var option = dto;
		option.url = 'OpenMes/binmaterialsplit';
		ajax.post(option);
	},
	/**
	 * @description Pda按领料单制造委外批号获得领料单明细信息
	 */
	picking_out: function(dto) {
		var option = dto;
		option.url = 'pda/prooutdetailbypurlot';
		ajax.get(option);
	},
	/**
	 * @description 修改领退料表明细记录(安费诺)
	 */
	picking_out_save: function(dto) {
		var option = dto;
		option.url = 'pda/prooutdetails';
		ajax.put(option);
	},
	/**
	 * @description Pda按领料单制造委外批号获得领料单明细信息
	 */
	picking_return: function(dto) {
		var option = dto;
		option.url = 'pda/proindetailbypurlot';
		ajax.get(option);
	},
	/*
	 *@description 通过单号获取制造单
	 *@param {String} moLot  工单号
	 */
	pickingOrder_out_GetList: function(dto) {
		var option = dto;
		option.url = 'OpenMes/mkcontrol/' + dto.data.moLot;
		ajax.get(option);
	},
	/*
	 *@description 按领料仓、制造批号(多笔以，分隔）获取物控应发物料及其存货列表 
	 */
	pickingOrder_out_GetDetail: function(dto) {
		var option = dto;
		option.url = 'Pda/scmcontroldetaildto';
		ajax.get(option);
	},
	/*
	 *@description 按物控档转领料单 
	 */
	pickingOrder_out_save: function(dto) {
		var option = dto;
		option.url = 'Pda/addcontroltoproout';
		ajax.post(option);
	},
	/**
	 * @description 按领退料单制造委外批号、物料标签校验领料的标签(安费诺) 
 传到前台为ResultStru，默认 ResultCode=1 MesBarCodeContrast，
 锁屏时，ResultCode=-11 ResultText为锁屏信息
	 */
	picking_lockScreen_valid: function(dto) {
		var option = dto;
		option.url = 'pda/prooutdetailbyscan';
		ajax.get(option);
	},
	/**
	 * @description 按销售出退货单批号、物料标签校验领料的标签(安费诺) 传到前台为ResultStru，ResultNote 为 MesBarCodeContrast， 锁屏时，ResultCode=-11 ResultText为锁屏信息;不锁屏时，ResultCode=1
	 */
	sale_lockScreen_valid: function(dto) {
		var option = dto;
		option.url = 'Pda/saloutdetailbyscan';
		ajax.get(option);
	},
	/**
	 * @description 添加锁屏记录
	 */
	picking_lockScreen_post: function(dto) {
		var option = dto;
		option.url = 'OpenMes/meslockscreen';
		ajax.post(option);
	},
	/**
	 * @description 领料退料锁屏
	 */
	picking_return_lockScreen_post: function(dto) {
		var option = dto;
		option.url = 'pda/prooutreversewl';
		ajax.post(option);
	},

	/**
	 * @description 人员列表无参
	 */
	bas_emp: function(dto) {
		var option = dto;
		option.url = 'bas/emp';
		ajax.get(option);
	},
	/**
	 * @description 返回已审核制单的工艺路线中的工序及物料列表---取配置表中的工序、设备、工作中心
	 ** @param {String} moLot  扫描工单
	 */
	base_scanOrder: function(dto) {
		var option = dto;
		option.url = 'OpenMes/morountproList2byconfig';
		ajax.get(option);
	},
	/**
	 * @description 投料校验--扫描物料二维码
	 */
	pro_TL_PartScan: function(dto) {
		var option = dto;
		option.url = 'pda/pdamesdayinputqrcodecheck';
		ajax.get(option);
	},
	/**
	 * @description 投入校验--扫描物料二维码
	 */
	pro_TR_PartScan: function(dto) {
		var option = dto;
		option.url = 'pda/pdamesdayproinputqrcodecheck';
		ajax.get(option);
	},
	/**
	 * @description 生成投料记录
	 */
	pro_TL_Save: function(dto) {
		var option = dto;
		option.url = 'pda/pdamesdayinput';
		ajax.put(option);
	},
	/**
	 * @description 增加车间工作台工序岗位记录--报工  
	 * 传到前台为ResultStru，默认 ResultCode=1 ResultNote为MesDayWorktimeModel， 
	 * 锁屏时，ResultCode=-11 ResultText为锁屏信息
	 */
	workReport_post: function(dto) {
		var option = dto;
		option.url = 'pda/pdamesday';
		ajax.post(option);
	},
	/**
	 * @description 按设备、工序编码查询设备（产线）当前在岗人员表 （工序编码参数可以不传，不传时，取本机配置表中设备对应的工序编码）
	 * @param {String} deviceNo 
	 * @param {String} proItemNo 
	 */
	device_user_query: function(dto) {
		var option = dto;
		option.url = 'Pda/mesdevicecurman';
		ajax.get(option);
	},
	/**
	 * @description 修改设备（产线）当前在岗人员表
	 */
	device_user_edit: function(dto) {
		var option = dto;
		option.url = 'Pda/mesdevicecurman';
		ajax.put(option);
	},
	/**
	 * @description 返回单个人员,照片信息
	 ** @param {String} empNo  人员编码A00000001
	 */
	emp_a: function(dto) {
		var option = dto;
		option.url = 'bas/empphoto/' + dto.data.empNo;
		ajax.get(option);
	},
	/**
	 * @description 返回指定人员信息
	 ** @param {String} empNo  人员编码A00000001
	 */
	emp_a1: function(dto) {
		var option = dto;
		option.url = 'bas/emp/' + dto.data.empNo;
		ajax.get(option);
	},
	/**
	 * @description PDA拆箱全检后封箱
	 */
	pda_pdaboxbarcodedetail: function(dto) {
		var option = dto;
		option.url = 'pda/pdaboxbarcodedetail';
		ajax.get(option);
	},
	/**
	 * @description 解析箱号
	 * @param {Object} dto
	 */
	base_scanBox: function(dto) {
		var option = dto;
		option.url = 'openmes/mesboxqrcode';
		ajax.get(option);
	},
	/**
	 * @description 解析箱号
	 * @param {Object} dto
	 */
	base_scanreqBox: function(dto) {
		var option = dto;
		option.url = 'openmes/mesreqboxqrcode';
		ajax.get(option);
	},
	/**
	 * @description PDA拆箱全检后封箱
	 */
	boxIO_put: function(dto) {
		var option = dto;
		option.url = 'Pda/pdaaddboxbarcode';
		ajax.put(option);
	},
	/**
	 * @description PDA装箱单封箱--保存箱记录
	 */
	boxIO_post: function(dto) {
		var option = dto;
		option.url = 'pda/pdaaddboxbarcode';
		ajax.post(option);
	},
	/**
	 * @description PDA拆箱登记更新开封箱标识
	 * @param {Object} dto
	 */
	boxOpen_post: function(dto) {
		var option = dto;
		option.url = 'pda/pdaupdateboxbarcode?boxTagIds=' + dto.data.boxTagIds + '&boxSw=' + dto.data.boxSw;
		ajax.post(option);
	},
	/**
	 * @description 通过单据批号获取制造明细记录
	 * @param {Object} dto
	 */
	boxfqc_getDetail: function(dto) {
		var option = dto;
		option.url = 'openmes/modetail/' + dto.data.moLot;
		ajax.get(option);
	},
	/**
	 * @description mes箱二维码解析--封箱状态判断
	 * @param {Object} dto
	 */
	boxfqc_boxScan: function(dto) {
		var option = dto;
		option.url = 'openmes/mesboxqrcodeboolspc'; //原来mesboxqrcodebool
		ajax.get(option);
	},
	/**
	 * @description 扫描内包装条码接口
	 * @param {Object} dto
	 */
	boxfqc_QRCodeAnalysis: function(dto) {
		var option = dto;
		option.url = 'openmes/mesqrcodeorbarcode';
		ajax.get(option);
	},
	/**
	 * @description FQC检验装箱--产生检验单，增加抽样标签记录
	 */
	boxfqc_Post: function(queryData, dto) {
		var option = dto;
		option.url = 'pda/pdaaddspcqualitybymo?purLot=' + queryData.purLot + '&sheetQty=' + queryData.sheetQty +
			'&sampleQty=' + queryData.sampleQty + '&spcCheckResult=' + queryData.spcCheckResult;
		ajax.post(option);
	},
	/**
	 * @description 按指定的单号获取销售通知单信息
	 * @param {Object} dto
	 */
	boxoqc_getList: function(dto) {
		var option = dto;
		option.url = 'openmes/saloutnotice/' + dto.data.sheetNo;
		ajax.get(option);
	},
	/**
	 * @description OQC检验装箱--产生检验单，增加抽样标签记录
	 * @param {Object} dto
	 */
	boxoqc_Post: function(queryData, dto) {
		var option = dto;
		option.url = 'pda/pdaaddspcqualitybynotice?noticeLot=' + queryData.noticeLot + '&sheetQty=' + queryData.sheetQty +
			'&sampleQty=' + queryData.sampleQty + '&spcCheckResult=' + queryData.spcCheckResult;
		ajax.post(option);
	},
	/**
	 * @description 仓内拆箱并箱--记录储位存货表、储位交易表
	 * @param {Object} dto
	 */
	boxMerge_Save: function(dto) {
		var option = dto;
		option.url = 'openmes/binmaterialboxbininout';
		ajax.post(option);
	},

	/**
	 * @description 生成投入记录
	 */
	Pda_pdamesdayproinput: function(dto) {
		var option = dto;
		option.url = 'Pda/pdamesdayproinput';
		ajax.put(option);
	},
	/**
	 * @description Pda取销售出货单，显示出货明细 按指定的客户订单号获取销售出货单信息明细信息
	 */
	sale_out_getList: function(dto) {
		var option = dto;
		option.url = 'Pda/saloutdetailbycuordno';
		ajax.get(option);
	},
	/**
	 * @description 按销售出退货单批号返回销售出退货明细信息
	 */
	sale_getDetails: function(dto) {
		var option = dto;
		option.url = 'Pda/saloutdetailbylot';
		ajax.get(option);
	},
	/**
	 * @description Pda取销售退货单，显示退货明细 按指定的客户订单号获取销售退货单信息明细信息
	 */
	sale_return_GetList: function(dto) {
		var option = dto;
		option.url = 'Pda/saloutreturndetailbycuordno';
		ajax.get(option);
	},
	/**
	 * @description 修改销售出退货表明细记录(安费诺)
	 */
	sale_save_put: function(dto) {
		var option = dto;
		option.url = 'Pda/pdasaloutdetail';
		ajax.put(option);
	},
	/**
	 * @description Pda取指定的客户订单号获取已过帐但未作标签检验的出货明细
	 */
	sale_tagcheck: function(dto) {
		var option = dto;
		option.url = 'Pda/Saloutdetailbycuordnotagcheck';
		ajax.get(option);
	},
	/**
	 * @description Pda取指定的客户订单号获取已过帐且已作标签检验但未作OQC品检的出货明细
	 */
	sale_OQCCheck: function(dto) {
		var option = dto;
		option.url = 'Pda/Saloutdetailbycuordnooqcspc';
		ajax.get(option);
	},
	/**
	 * @description 内包装打印保存批次标签
	 */
	acceptLotPur_Print_Post: function(dto) {
		var option = dto;
		option.url = 'OpenMes/scmreqbarcode';
		ajax.post(option);
	},
	/**
	 * @description 扫描制造批号作内包装打印数据来源,装箱处理数据来源
	 * @param {String} moLot 制造批号
	 * @param {String} type 0 所有 1 批次 2序列号 
	 */
	acceptLotPur_MK_GetModel: function(dto) {
		var option = dto;
		option.url = 'Pda/scmbarcodesourcemo/' + dto.data.moLot;
		ajax.get(option);
	},
	/**
	 * @description PDA交接时扫描报工条码返回车间工序报工记录（扫物料）
	 * @param {String} qrCode 扫描条码
	 */
	Pda_pdamesdaylistbyjoincode: function(dto) {
		var option = dto;
		option.url = 'Pda/pdamesdaylistbyjoincode';
		ajax.get(option);
	},

	/**
	 * PDA修改车间工作台交接记录表（保存）
	 */
	Pda_pdamesdayjoin: function(dto) {
		var option = dto;
		option.url = 'Pda/pdamesdayjoin';
		ajax.put(option);
	},
	/**
	 *@description PDA序列号装箱扫描序列号标签 (扫序列号)
	 *@param {String} qrCode 扫序列号
	 */
	Pda_pdaserialinboxvaild: function(dto) {
		var option = dto;
		option.url = 'Pda/pdaserialinboxvaild';
		ajax.get(option);
	},
	/**
	 *@description PDA序列号装箱单封箱--保存箱记录
	 *@param {String} qrCode 扫序列号
	 */
	Pda_pdaaddboxbarcodeserial: function(dto) {
		var option = dto;
		option.url = 'Pda/pdaaddboxbarcodeserial';
		ajax.post(option);
	},
	/**
	 *@description 接收PDA前台错误日志
	 *@param {String}   userID 用户id
	 *@param {String}  	createTime 时间
	 *@param {String}  	title 标题
	 *@param {String}  	message: 内容
	 *@param {String}  	uuid 终端uuid
	 */
	system_UpgradePdaErrLog: function(dto) {
		var option = dto;
		option.url = 'System/UpgradePdaErrLog';
		ajax.post(option);
	},
	/**
	 *@description 返回后台系统参数 IsStorageBin:是否启用储位 0.不启用(默认) 1.启用 对于批次或序列号管理的物料，出入库交易是否交储位管理控制 ErpInterfaceType : ERP接口 1.一体化(默认) 2.SAP 3.Oracle 4.金蝶 5.用友 6.安费诺 7.禹龙通 8.三维 9.古鑫
	 */
	OpenMes_ErpReturnSet: function(dto) {
		var option = dto;
		option.url = 'OpenMes/ErpReturnSet';
		ajax.get(option);
	},
	/**
	 *@description Pda读出合格未入库的FQC检验单
	 *@param {String}   purLot 采购\制造\委外批号
	 */
	Pda_pdafqcspcquality1bypurlot: function(dto) {
		var option = dto;
		option.url = 'Pda/pdafqcspcquality1bypurlot';
		ajax.get(option);
	},
	/**
	 *@description fQC检验合格转入库
	 *@param {String}   
	 */
	Pda_pdaaddacceptinbyfqcspcquality: function(dto) {
		var option = dto;
		option.url = 'Pda/pdaaddacceptinbyfqcspcquality';
		ajax.post(option);
	},
	/* 
	 *@description Pda读出合格未出货的OQC检验单
	 *@param {String} noticeNo  出货通知单号
	 */
	Pda_pdaoqcspcquality1bynotice: function(dto) {
		var option = dto;
		option.url = 'Pda/pdaoqcspcquality1bynotice';
		ajax.get(option);
	},
	/* 
	 *@description 按销售出货通知单号、物料标签(三维)作OQC校验标签
	 *@param {String} noticeNo 出货通知单号
	 *@param {String} qrCode
	 */
	Pda_pdasalnoticebyscanoqcvaild: function(dto) {
		var option = dto;
		option.url = 'Pda/pdasalnoticebyscanoqcvaild';
		ajax.get(option);
	},
	/* 
	 *@description OQC检验转出货单
	 *@param {String} scmInoutBars    标签表
	 *@param {String} mesLockscreenLogs 授权记录
	 *@param {String} noticeNo 出货通知单号
	 */
	Pda_pdaaddsaloutbyoqcspcquality: function(dto) {
		var option = dto;
		option.url = 'Pda/pdaaddsaloutbyoqcspcquality';
		ajax.post(option);
	},

	/* 
	 *@description 按出货通知单号获取销售出货单明细信息列表
	 *@param {String} noticeNo  出货通知单号
	 */
	Pda_pdasalooutdetailbynotice: function(dto) {
		var option = dto;
		option.url = 'Pda/pdasalooutdetailbynotice';
		ajax.get(option);
	},
	/* 
	 *@description 华为出货包装 ASN 二维码解析
	 *@param {String} hwAsnQrcode  华为二维码
	 */
	OpenMes_meshwasnqrcode: function(dto) {
		var option = dto;
		option.url = 'OpenMes/meshwasnqrcode';
		ajax.get(option);
	},
	/* 
	 *@description  按出货通知单,华为PKGID 获取销售通知单华为ASN信息
	 *@param {String} sheetNo  出货通知单
	 *@param {String} pkgId  可以为空
	 */
	OpenMes_saloutnoticeasnbysheetnopkgid: function(dto) {
		var option = dto;
		option.url = 'OpenMes/saloutnoticeasnbysheetnopkgid';
		ajax.get(option);
	},
	/* 
	 *@description  产生序列号条码（内包装 )
	 *@param {String} scmReqBarCodes  list序列号数组
	 */
	OpenMes_scmreqbarcodeserial: function(dto) {
		var option = dto;
		option.url = 'OpenMes/scmreqbarcodeserial';
		ajax.post(option);
	},
	/* 
	 *@description  mes二维码解析(出入库）
	 *@param {String} qrCode  二维码
	 */
	OpenMes_mesqrcodeinout: function(dto) {
		var option = dto;
		option.url = 'OpenMes/mesqrcodeinout';
		ajax.get(option);
	},
	/* 
	 *@description  内包装批次条码列表
	 *@param {String} moLot  制造批号
	 */
	OpenMes_scmreqbarcode: function(dto) {
		var option = dto;
		option.url = 'OpenMes/scmreqbarcode';
		ajax.get(option);
	},
	/* 
	 *@description  删除成品入库批次条码(内包装条码)
	 *@param {String} id  删除tagId以","号分割
	 */
	OpenMes_scmreqbarcode: function(dto) {
		var option = dto;
		option.url = 'OpenMes/scmreqbarcode';
		ajax.get(option);
	},
	delete_OpenMes_scmreqbarcode: function(dto) {
		var option = dto;
		option.url = 'OpenMes/scmreqbarcode/' + option.data.id;
		ajax.del(option);
	},
	/* 
	 *@description Pda制造单批号获取成品退库单，显示退库明细
	 *@param {String} purLot 成品退库单
	 */
	Pda_acceptreturndetailbypurlot: function(dto) {
		var option = dto;
		option.url = 'Pda/acceptreturndetailbypurlot';
		ajax.get(option);
	},
	/*
	 *@description 按单号或料号获取指定的其它入库单
	 *@param {String} sheetNo 其它入库单号
	 *@param {String} partItemNo 物料
	 */
	Pda_scmotherinbysheetnopartno: function(dto) {
		var option = dto;
		option.url = 'Pda/scmotherinbysheetnopartno';
		ajax.get(option);
	},
	/*
	 *@description 按单号或料号获取指定的其它出库单
	 *@param {String} sheetNo 其它出库单
	 *@param {String} partItemNo 物料
	 */
	Pda_scmotheroutbysheetnopartno: function(dto) {
		var option = dto;
		option.url = 'Pda/scmotheroutbysheetnopartno';
		ajax.get(option);
	},
	/*
	 *@description 修改其它出入库单
	 *@param {String} other 其它入库单对象
	 */
	OpenMes_other: function(dto) {
		var option = dto;
		option.url = 'OpenMes/other';
		ajax.put(option);
	},
	/*
	 *@description 更新制单下表上的本次外箱标签的数量
	 *@param {String} moLot 制单批号
	 *@param {String} qty 本次箱标签数量
	 */
	OpenMes_uppurprintbarocdeqty: function(dto) {
		var option = dto;
		option.url = 'OpenMes/uppurprintbarocdeqty?moLot=' + option.data.moLot + '&qty=' + option.data.qty;
		ajax.put(option);
	},
	/*
	 *@description 按 内标签 获取内箱标签记录 或者 按 箱标签 或客户箱号 获取最新的装箱单列表
	 *@param {String} qrCode 条码
	 */
	OpenMes_scmboxbyqrcode: function(dto) {
		var option = dto;
		option.url = 'OpenMes/scmboxbyqrcode';
		ajax.get(option);
	},
	/**
	 * @description 修改箱记录
	 * @param {Object} dto
	 */
	OpenMes_boxesn: function(dto) {
		var option = dto;
		option.url = 'OpenMes/boxesn';
		ajax.put(option);
	},
	
	/*
	 *@description mes二维码解析入库且校验(出入库),入库扫料号是判断(tag)ID是否存在
	 *@param {String} qrCode 条码
	 */
	OpenMes_mesqrcodeincheck: function(dto) {
		var option = dto;
		option.url = 'OpenMes/mesqrcodeincheck';
		ajax.get(option);
	},

	/*
	 *@description 按参数(多个储位、多个标签、多个物料编码）获得储位存货记录 ,各个储位、标签、物料之间分别用 逗号 ‘，’号隔开
	 *@param {String} partItemNos 物料编码
	 *@param {String} tagIds 标签id
	 *@param {String} binNos 储位
	 */
	OpenMes_binmateriallistbyparm: function(dto) {
		var option = dto;
		option.url = 'OpenMes/binmateriallistbyparm';
		ajax.get(option);
	},
	/*
	 *@description 新增设备点检
	 */
	OpenMes_plantcheck: function(dto) {
		var option = dto;
		option.url = 'OpenMes/plantcheck';
		ajax.post(option);
	},
	/**
	 * @description  返回指定工装版号的工装（模具)列表
	 * @param {String} mouldVer 工装版号
	 * @param {Object} dto
	 */
	shopWB_GetMould: function(dto) {
		var option = dto;
		option.url = 'OpenMes/mouldListbyver';
		ajax.get(option);
    },
	/**
	 * @description 上线 新增车间工作台工序生产时间记录表
	 * @param {Object} dto
	 */
	shopWB_post: function(dto) {
		var option = dto;
		option.url = 'OpenMes/mesdayworktimeadd';
		ajax.post(option);
	},
    /**
	 * @description  按工单返回上线、暂停状态的车间工序操作记录
	 * @param {String} moLot  制造单
	 */
	OpenMes_mesdayworktimelistbymolot: function(dto) {
		var option = dto;
		option.url = 'OpenMes/mesdayworktimelistbymolot';
		ajax.get(option);
	},
	/**
	 * @description  Pda工序工单下线
	 * @param {String} id 
	 * @param {String} endDate  下线时间
	 */
	Pda_pdamesdayworktimefinish: function(dto) {
		var option = dto;
		option.url = 'Pda/pdamesdayworktimefinish?id=' + option.data.id + '&endDate=' + option.data.endDate;;
		ajax.put(option);
	},
	/**
	 * @description   按制单工序设备的返回属于首检报工但还没有检验的报工记录（首检)
	 * @param {String} moLot  制造单
	 * @param {String} proItemNo   设备编号
	 * @param {String} deviceNo  工序编号
	 */
	OpenMes_mesdaylistbyspccheck: function(dto) {
		var option = dto;
		option.url = 'OpenMes/mesdaylistbyspccheck';
		ajax.get(option);
	},
	/**
	 * @description 导入料号
	 */
	pdadatacreatepart: function(dto) {
		var option = dto;
		option.url = 'Pda/pdadatacreatepart'; 
		ajax.put(option);
	}
};
module.exports = apis;
