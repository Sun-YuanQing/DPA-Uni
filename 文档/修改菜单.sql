select * from osys_program where module_code='NES'

select * from osys_program where module_code='PDA' AND TYPE_MK='t2' 
select * from osys_program where module_code='PDA' AND TYPE_MK='t2' and  prog_name like '%װ��%'
select * from osys_program where module_code='PDA' AND TYPE_MK='t2' and win_name like '%process%'

-------------------------------purchase-temporary------------------------------------------
update osys_program
set win_name = 'purchase-temporary/purchase-temporary'
where prog_name = '�ɹ�����' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'purchase-temporary/purchase-upperShelf'
where prog_name = '����ϼ�' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'purchase-temporary/purchase-allot'
where prog_name = '����' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'purchase-temporary/purchase-return'
where prog_name = '�ɹ��˻�' and  module_code='PDA' AND TYPE_MK='t2'

-----------------------------picking---------------------------------
update osys_program
set win_name = 'picking/picking-out'
where prog_name = '���ϳ���' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'picking/pack-split'
where prog_name = '�ֲ���' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'picking/picking-out'
where prog_name = '���ϳ���' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'picking/picking-return'
where prog_name = '��������' and  module_code='PDA' AND TYPE_MK='t2'

----------------------------process--------------------------------------
update osys_program
set win_name = 'process/emp-work'
where prog_name = '��Ա�ϸ�' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'process/process-receive'
where prog_name = '���򽻽�' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'process/process-report'
where prog_name = '���򱨹�' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'process/process-tl'
where prog_name = '����Ͷ��' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'process/process-tr'
where prog_name = '�Ϲ���Ͷ��' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'process/production-into'
where prog_name = '�������' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'process/production-FQCinto'
where prog_name = 'FQC�ϸ����' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'process/production-print'
where prog_name = '�ڰ�װ��ӡ' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'process/production-return'
where prog_name = '�����˿�' and  module_code='PDA' AND TYPE_MK='t2'

---------------------------sale----------------------------------------
update osys_program
set win_name = 'sale/sale-oqccheck'
where prog_name = 'OQC����' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'sale/sale-out'
where prog_name = '���۳���' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'sale/sale-return'
where prog_name = '�����˻�' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'sale/sale-tagcheck'
where prog_name = '��ǩ����' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'sale/sale-oqcOut'
where prog_name = 'OQC�ϸ����' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'sale/sale-hwtag'
where prog_name = '��Ϊ��ǩ����' and  module_code='PDA' AND TYPE_MK='t2'

-----------------------------storage-------------------------------------------

update osys_program
set win_name = 'storage/storage-initUpperShelf'
where prog_name = '��λ��ʼ�ϼ�' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'storage/storage-inventory'
where prog_name = '�̵�' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'storage/storage-lowerShelf'
where prog_name = '�����¼�' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'storage/storage-transfer'
where prog_name = '��λת��' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'storage/storage-upperShelf'
where prog_name = '�����ϼ�' and  module_code='PDA' AND TYPE_MK='t2'



------------------------------boxMng---------------------------------------------------
--update osys_program
--set win_name = 'boxMng/box-fqcup'
--where prog_name = 'FQC����װ��' and  module_code='PDA' AND TYPE_MK='t2'

--update osys_program
--set win_name = 'boxMng/box-open'
--where prog_name = '����Ǽ�' and  module_code='PDA' AND TYPE_MK='t2'

--update osys_program
--set win_name = 'boxMng/box-oqcup'
--where prog_name = 'OQC����װ���б�' and  module_code='PDA' AND TYPE_MK='t2'

--update osys_program
--set win_name = 'boxMng/box-lastTest'
--where prog_name = 'β��˲�' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'boxMng/box-fulltest'
where prog_name = '����ȫ��' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'boxMng/box-upSN'
where prog_name = 'װ��(���к�)' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'boxMng/box-into'
where prog_name = 'װ��(�����ǩ)' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'process/process-box'
where prog_name = '�����ӡ' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'process/process-SN'
where prog_name = '���кŴ�ӡ' and  module_code='PDA' AND TYPE_MK='t2'
----------------------------------------otherIO----------------------------------------------------
update osys_program
set win_name = 'otherIO/otherIO-into'
where prog_name = '�������' and  module_code='PDA' AND TYPE_MK='t2'

update osys_program
set win_name = 'otherIO/otherIO-out'
where prog_name = '��������' and  module_code='PDA' AND TYPE_MK='t2'

--------------------------------------------------------------------------------------------
update osys_program
set win_name = 'storage/storage-boxUp'
where prog_name = '����װ��' and  module_code='PDA' AND TYPE_MK='t2'



