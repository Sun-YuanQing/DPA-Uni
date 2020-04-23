select * from osys_program where module_code='NES'

select * from osys_program where module_code='PDA' AND TYPE_MK='t2' 
select * from osys_program where module_code='PDA' AND TYPE_MK='t2' and  prog_name like '%装箱%'
select * from osys_program where module_code='PDA' AND TYPE_MK='t2' and win_name like '%process%'

-------------------------------purchase-temporary------------------------------------------
update osys_program
set win_name = 'purchase-temporary/purchase-temporary'
where prog_name = '采购暂收' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'purchase-temporary/purchase-upperShelf'
where prog_name = '入库上架' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'purchase-temporary/purchase-allot'
where prog_name = '调拨' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'purchase-temporary/purchase-return'
where prog_name = '采购退货' and  module_code='PDA' AND TYPE_MK='t2'

-----------------------------picking---------------------------------
update osys_program
set win_name = 'picking/picking-out'
where prog_name = '领料出库' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'picking/pack-split'
where prog_name = '分拆处理' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'picking/picking-out'
where prog_name = '领料出库' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'picking/picking-return'
where prog_name = '生产退料' and  module_code='PDA' AND TYPE_MK='t2'

----------------------------process--------------------------------------
update osys_program
set win_name = 'process/emp-work'
where prog_name = '人员上岗' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'process/process-receive'
where prog_name = '工序交接' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'process/process-report'
where prog_name = '工序报工' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'process/process-tl'
where prog_name = '工序投料' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'process/process-tr'
where prog_name = '上工序投入' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'process/production-into'
where prog_name = '生产入库' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'process/production-FQCinto'
where prog_name = 'FQC合格入库' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'process/production-print'
where prog_name = '内包装打印' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'process/production-return'
where prog_name = '生产退库' and  module_code='PDA' AND TYPE_MK='t2'

---------------------------sale----------------------------------------
update osys_program
set win_name = 'sale/sale-oqccheck'
where prog_name = 'OQC检验' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'sale/sale-out'
where prog_name = '销售出货' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'sale/sale-return'
where prog_name = '销售退货' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'sale/sale-tagcheck'
where prog_name = '标签检验' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'sale/sale-oqcOut'
where prog_name = 'OQC合格出货' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'sale/sale-hwtag'
where prog_name = '华为标签检验' and  module_code='PDA' AND TYPE_MK='t2'

-----------------------------storage-------------------------------------------

update osys_program
set win_name = 'storage/storage-initUpperShelf'
where prog_name = '储位初始上架' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'storage/storage-inventory'
where prog_name = '盘点' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'storage/storage-lowerShelf'
where prog_name = '仓内下架' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'storage/storage-transfer'
where prog_name = '储位转移' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'storage/storage-upperShelf'
where prog_name = '仓内上架' and  module_code='PDA' AND TYPE_MK='t2'



------------------------------boxMng---------------------------------------------------
--update osys_program
--set win_name = 'boxMng/box-fqcup'
--where prog_name = 'FQC检验装箱' and  module_code='PDA' AND TYPE_MK='t2'

--update osys_program
--set win_name = 'boxMng/box-open'
--where prog_name = '拆箱登记' and  module_code='PDA' AND TYPE_MK='t2'

--update osys_program
--set win_name = 'boxMng/box-oqcup'
--where prog_name = 'OQC检验装箱列表' and  module_code='PDA' AND TYPE_MK='t2'

--update osys_program
--set win_name = 'boxMng/box-lastTest'
--where prog_name = '尾箱核查' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'boxMng/box-fulltest'
where prog_name = '拆箱全检' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'boxMng/box-upSN'
where prog_name = '装箱(序列号)' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'boxMng/box-into'
where prog_name = '装箱(不打标签)' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'process/process-box'
where prog_name = '外箱打印' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'process/process-SN'
where prog_name = '序列号打印' and  module_code='PDA' AND TYPE_MK='t2'
----------------------------------------otherIO----------------------------------------------------
update osys_program
set win_name = 'otherIO/otherIO-into'
where prog_name = '其它入库' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'otherIO/otherIO-out'
where prog_name = '其它出库' and  module_code='PDA' AND TYPE_MK='t2'

--------------------------------------------------------------------------------------------
update osys_program
set win_name = 'storage/storage-boxUp'
where prog_name = '仓内装箱' and  module_code='PDA' AND TYPE_MK='t2'



