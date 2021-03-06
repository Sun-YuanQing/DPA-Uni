PDA   
---

&emsp;**傲鹏MES制造执行系统 PDA端**（Manufacturing Execution System）   
&emsp;系统主要功能包括: 制造数据管理、计划排程管理、生产调度管理、库存管理、质量管理、人力资源管理、工作中心/设备管理、工具工装管理、采购管理、成本管理、项目看板管理、生产过程控制、底层数据集成分析、上层数据集成分解等管理模块   

框架介绍   
---
&emsp;PDA 采用HBuilderX中的 uni-app 的项目创建的，集成了Vue,采用 Vue 2.0 的版本   
&emsp;资源：   
  * [Uni-app官方文档](https://uniapp.dcloud.io/README)
  * [Vue官方文档](https://cn.vuejs.org/)   

&emsp;安装地址  
  * [Apk 地址下载](http://192.168.0.226:8888/api/Pda/upgrade/downloadapk)  
  ![image](/uploads/73f1748cf864d74629776b0db1521fa6/image.png)

规则说明
---
1. 在每个.vue文件中，首行要写说明备注
   * 说明这个文件的功能
2. 文件命名规则
   * 首字母不允许大写
   * 分词需要用 - 进行连接 eg: inventory-table
3. CSS 命名规则
   * 全小写 分词需要用 - 进行连接 eg: uni-header-logo


版本记录  
---
**v1.8.22 | 2019-10-18**  
>
``` 
    1.（领料出库），储位库存查询的打印加年周字段打印。
	2.内标签打印：5个defind字段开放 安费诺 和 昶通，（昶通是新加）
	3.装箱不打标签：DC不一致 的提示改为 年周不一致
	4.序列号打印：this.erpInterfaceType == consts.erpInterfaceType.suoyuan  改为 this.mesInLotType == consts.mesInLotType.MoLotYMD
	5.打印外箱没有：客户料号，年周  （加字段 朱勇军）
	6.OQC检验装箱：改抽检数量和送检数量都为手输（李更说：OQC检验装箱和FQC检验装箱差不多，只是单据不一样）
	7.储位库存查询：打印标签数据模板加 年周，客户料号 字段   （朱勇军）
	8.加系统常量  ：客户昶通 changtong:11
	9.序列号打印:判断  溹原 自动生成批次号改为  是否启用了  consts.mesInLotType.MoLotYMD
```
**v1.8.21 | 2019-10-18**  
>
``` 
    1.储位库存查询：修复 上次修复选择item，背景色丢失导致的无法打印
	2.生产退料：打印 批次号和数量没有的问题（----校验批次不为空，数量改neetQty）
	3.其它出库：修复保存出错（-----批号累加不对）
```
**v1.8.20 | 2019-10-17**  
>
``` 
    1.修复 物控领料 按多发料领料后保存报错
	2.增加 储位库存打印  打印带出料品define字段
	3.修复 选择item，背景色丢失
	4.修复 PDA内包装打印 标签重打的时候 第二次打印，勾选一个标签仍出现 打出多个标签的情况
	5.修复 PDA采购暂收 标签扫描完成后点击保存 保存成功后 ERP暂收不是已审核状态
```
**v1.8.19 | 2019-10-16**  
>
``` 
    1.添加料号同步功能
	2.拆分有小数优化
    3.安费诺：不打标签，封箱扫内箱扫外箱 校验优化
	4.安费诺：其它出库扫标签拆分成多个问题修复
	5.内标签删除OK
	
```

**v1.8.18 | 2019-10-16**  
>
``` 
    1.安费诺：修复标签tagid过长问题 >= 46 后面拼接-001流水号
	2.安费诺：调拨保存，出错恢复原来数据已扫
	3.安费诺：其它出库，其它入库，内标签重打列表：采用vuex(变量urldata)
	
```
**v1.8.14 | 2019-10-12**  
>
``` 
	1.新增 储位库存增加打印
	2.新增 设备点检功能
	3.新增制程 工单上线、工单下线、首件确认
	4.修复 生产退料 扫描数量累计异常
	5.修复 生产退料 打印数量取值错误问题
```

**v1.8.12 | 2019-09-24**  
>
``` 
	1.工单上线功能
	2.整理优化横打
	3.修复子页面url传值长截取问题
```

**v1.8.11 | 2019-09-23**  
>
``` 
	1.首页自定义窗体侧滑块(正在规划菜单内容)。
	2.调拨明细：仓库显示一致代码.
	3.销售出货明细：批号长被挡住了-->>>overflow: hidden;overflow-x: scroll;横向滚动.
	4.其它入库和其它出库界面加个日期，哪天的单.
	5.采购入库：推荐货架并接不完整bug修复.
	6.外箱打印：优化权限重打标签
	7.新增储位库存查询.
	8.优化系统日志滚动显示标题.
	9.优化采购入库.
```

**v1.8.10 | 2019-09-16**  
>
``` 
	1.新增 仓内拆箱合并.
	2.增加 仓内装箱：和装箱差不多，改了少量的代码，有改动注释.
	3.自动保存的模块：FQC检验装箱,拆箱全检,尾箱核查,OQC检验装箱明细 ,其它出库,其它入库,生产退料,FQC合格入库,生产入库-入库单明细 ,生产退库-明细 ,采购调拨,采购退货 ,采购暂收,采购入库上架,华为标签检验,OQC合格出货 ,销售出库 .
	4.其它入库，打印标签没有prodate,就取当前日期打印.
	5.首页菜单：/*page uni-padding-wrap优化菜单少还有滚动条的情况 */
    6.其它入库：仓库，入库批次 字段显示优化
```

**v1.8.9 | 2019-09-11**  
>
``` 
	1.采购入库上架：扫描小数优化
	2.优化外箱打印/重打权限，销售跳转bug
	3.优化若干
```

**v1.8.8 | 2019-09-10**  
>
``` 
	1.修复采购调拨保存
	2.优化 外箱打印 限制
	3.优化 生产退库 不启用储位
```

**v1.8.7 | 2019-09-09**  
>
``` 
	1.验证本月单据方法bug修复
	2.内包装打印：全选删除不干净数据bug
	3.规范vuex变量名，所有子页面保存成功标识变量为pageIO_submit,成功为true。
    4.改正pageIO_submit之前使用的变量。
	5.公共保存方法：OQC检验装箱列表，其它出库，其它入库
	6.所有子页保存返回，删除主页静态单据，
    6.1其它出库,其它入库,OQC检验装箱列表 ,FQC合格入库,生产入库,内包装打印,生产退库,华为标签检验(返回更新数据),OQC检验列表,销售出货,销售退货,标签检验
	7.其它出入库，公共自动保存修复无提示
```
**v1.8.6 | 2019-09-04**  
>
``` 
	1.所有模块:验证单据日期(防止跨月).
	2.其它入库:增加打印原材料标签功能.
	3.扫描自动提示保存公共方法 :FQC检验装箱，拆箱全检，尾箱核查,其它入库
	4.外箱打印:产生的标签个数不能大于 单据数量，并且外相个数不能超过999个
    5.内包装打印:重打权限同删除权限
	6.调拨，自动出来所有单
    7.销售退货单，7.1自动出来所有单7.2保存返回前台删除原来的单据
    8.其它入库，返回删除保存单据
	9.其它入库，保存返回前台删除原来的单据，增加打印标签功能，同采购暂收，没有批次录入批次。
    10.内包装打印，半成品手敲字段：lotNo批次，Plating NO电镀编号，Joint接头，NG Q'ty不合格数，woc线别 (对应5个define字段)。
    11.采购入库，11.1保存返回前台删除原来的单据11.2增加打印标签功能，同采购暂收，没有批次录入批次。
	13.调拨单：朱勇军，加扫描上架储位
    14.华为标签校验优化（整体功能OK）
```
**v1.8.5 | 2019-08-29**  
>
``` 
	1.修复物控领料bug
	2.优化销售出货，采购退货拆分.
    3.修复采购退货保存bug.
	4.修复采购退货已扫bug
	5.partDefine更正字段.
```

**v1.8.4 | 2019-08-28**  
>
``` 
	1.增加蓝牙打印 支持横向打印
    2.序列号装箱：判断尾箱数小于 每箱数时，提示客户是否封箱.
	3.优化其它出库不启用储位的(标签存在库存)，和其它入库(有可能没有仓库)不一样！！！
	4.优化内标签重打，全选会打印出更多的标签bug。
	5.序列号装箱，扫描进去2个序列号，生成的外箱数量显示6。实际绑定的也是2个。bub修复。
```

**v1.8.3 | 2019-08-26**  
>
``` 
	1.优化其它出入库，入库保存ok。
    2.多发料仓领料
```
**v1.8.2 | 2019-08-23**  
>
``` 
	1.优化时间统一格式yyyy/MM/dd , proDate如果没有取当前时间.
	2.朱勇军：采购退货 取消批次录入.
	3.其他出入库
```

**v1.8.1 | 2019-08-21**  
>
``` 
	1.华为标签校验 界面改版 优化逻辑，李艮：扫ASN同样校验ASN数量和内部物料数量要相等。
	2.优化大部分数字类型，添加其它出入库文件
	3.解析 工单领料功能
```

**v1.8.0 | 2019-08-19**  
>
``` 
	1.优化销售退，暂收小数，OQC合格出货（仓库）
```

**v1.7.2 | 2019-08-16**  
>
``` 
	1.生产入库 检验品检一体化（三维），采购入库优化
	2.优化标签重打全选，最多选中100条，取消全选则全部取消
```

**v1.7.1 | 2019-08-15**  
>
``` 
	1.暂收单加校验po
	2.内标签重打不清空页面.增加全选打印/删除。
	3.生产入库，生产退料,采购入库上架，检查不启用储位情况
	4.外箱打印，序列号装箱生成外箱加英文规格
```

**v1.6.2 | 2019-08-14**  
>
``` 
	1.采购入库不启用储位的  仓库为空bug修复
```

**v1.6.1 | 2019-08-13**  
>
``` 
	1.优化OQC，FQC检验 按tagId校验
```

**v1.6.0 | 2019-08-12**  
>
``` 
	1.优化重构生产退库（交易记录待处理）
	2.暂收单打标签可减包数改尾数，入库上架，采购入库优化，入库单菜单名改生产入库单
	2.新功能，来料标签重打 (标签重复改其中一个tagId)，采购入库上架 ，util.showToast()公共不同提示
	3.序列号打印，内标签打印，标签时间BUG修复
	4.朱勇军：PC和PDA的入库，内包装，外包装等地方 都要核查加的字段有没有值（如DEFINE1--DEFINE10）,苏州也需要这些字段。
      回复：采购入库上架，生产入库，内包装重打，外箱打印，采购暂收前台代码是加了， 但是接口没返回。
	5.处理全部uni.showModal   --->>> res统一改res_mod
	6.检查处理启用储位的漏网之鱼，赋值错误，保存不显示扫描框的储位提示等等
```

**v1.5.6 | 2019-08-02**  
>
``` 
	1.解决序列号打印不了外箱
	2.增加内标签批量删除功能
```

**v1.5.5 | 2019-08-01**  
>
``` 
	1.内包装重打标签
	2.外箱添加字段和日期可修改
```

**v1.5.4 | 2019-07-31**  
>
``` 
	1.优化外箱打印(添加字段)
	2.工序交接保存提示
	3.内标签打印(校验ID,加字段)
	4.销售出货（修复数量累加，扫完提示保存）
	5.储位初始化(优化保存，保存储位恢复)
```

**v1.5.3 | 2019-07-30**  
>
``` 
	1.优化储位初始化上架，采购入库上架，OQC合格出货，工序交接
```

**v1.5.2 | 2019-07-27**  
>
``` 
	1.优化装箱，外箱打印，FQC合格入库，OQC合格出货 ，销售出货，储位转移，仓内上架
```

**v1.5.1 | 2019-07-18**  
>
``` 
	1.储位优化，生产入库优化
```
 
**v1.5.0 | 2019-07-18**  
>
``` 
	1.增加蓝牙打印功能
	2.PDA是否启用储位
	3.储位初始化的时候扫描的不同料号要提示报错，同时要支持一个货架放不同的产品；同时加个扫描后的数量合计（显示扫描箱数及扫描累计数量）
``` 
**v1.4.4 | 2019-07-15**  
>
``` 
	1.优化内包装打印，未生产数量拆分数量的删除
``` 

**v1.4.3 | 2019-07-15**  
>
``` 
	1.修复 初始化上架，入库上架， 的储位问题.
``` 

**v1.4.2 | 2019-07-15**  
>
``` 
	1.优化 初始化上架，生产入库,入库上架， 的储位问题，重改 华为标签检验
``` 

**v1.4.1 | 2019-07-15**  
>
``` 
	1.储位初始化的时候扫描的不同料号要提示报错，同时要支持一个货架放不同的产品；
	2.同时加个扫描后的数量合计（显示扫描箱数及扫描累计数量）
	3.增加蓝牙打印功能
```  

**v1.3.5 | 2019-07-05**  
>
``` 
	1.修复OQC出货

```  

**v1.3.4 | 2019-07-05**  
>
``` 
	1.生产入库打印增加 加客户料号 su_partno
	2.生产入库打印增加 加生产日期 可编辑 prodate
	3.增加OQC出货
	4.生产入库打印修复年周显示错误
	5.料品资料加10个DEFINE,内包装和外包装打印调用这10个字段  
```  

**v1.3.3 | 2019-07-03**  
>
``` 
  1.修复 解析二维码日期报错问题
	2.生产入库打印增加 年周字段、将制造批号赋值给批次号
```  

**v1.3.2 | 2019-07-02**  
>
``` 
  1.生产入库料品名称  加入库日期
  2.暂收打印，敲每包数自动算包数和尾数
  3.新增FQC合格入库菜单功能。
  4.领料出库货架汇总（相同货架相同批次的数量加总）
```  




