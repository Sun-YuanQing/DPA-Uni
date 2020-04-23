(global["webpackJsonp"] = global["webpackJsonp"] || []).push([["pages/index/printer"],{

/***/ "./node_modules/babel-loader/lib/index.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib/index.js?!E:\\repos\\OpenPDA\\测试蓝牙打印\\pages\\index\\printer.vue?vue&type=script&lang=js&":
/*!*************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--12-1!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib??vue-loader-options!E:/repos/OpenPDA/测试蓝牙打印/pages/index/printer.vue?vue&type=script&lang=js& ***!
  \*************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(uni) {Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;























































































































var _tsc = _interopRequireDefault(__webpack_require__(/*! ../../common/tsc.js */ "E:\\repos\\OpenPDA\\测试蓝牙打印\\common\\tsc.js"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} //
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
var _default = { data: function data() {return { title: 'bluetooth', disabled: [false, true, true, true, true, true, true, true, true, true, true, true], newDeviceLoad: false, searchLoad: false, maskShow: false, equipment: [], adapterState: { discovering: false, available: false }, connected: false, showMaskType: 'device', servicesData: [], characteristicsData: [], valueChangeData: {}, isStop: true, list: [] };}, onLoad: function onLoad() {this.onBLEConnectionStateChange();}, methods: { moveHandle: function moveHandle() {}, /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   * 关闭遮罩
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   */maskclose: function maskclose() {this.maskShow = false;}, /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * 选择设备
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */queryDevices: function queryDevices() {// this.newDeviceLoad = true;
      this.showMaskType = 'device';this.maskShow = true;}, tapQuery: function tapQuery(item) {if (this.showMaskType === 'device') {this.$set(this.disabled, 4, false);if (this.equipment.length > 0) {this.equipment[0] = item;} else {this.equipment.push(item);}this.newDeviceLoad = false;}if (this.showMaskType === 'service') {this.$set(this.disabled, 6, false);if (this.servicesData.length > 0) {this.servicesData[0] = item;} else {this.servicesData.push(item);}}if (this.showMaskType === 'characteristics') {this.$set(this.disabled, 7, false);if (this.characteristicsData.length > 0) {this.characteristicsData[0] = item;} else {this.characteristicsData.push(item);}}this.maskShow = false;}, /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   * 初始化蓝牙设备
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   */openBluetoothAdapter: function openBluetoothAdapter() {var _this = this;uni.openBluetoothAdapter({ success: function success(e) {console.log('初始化蓝牙成功:' + e.errMsg, " at pages\\index\\printer.vue:198");console.log(JSON.stringify(e), " at pages\\index\\printer.vue:199");_this.isStop = false;_this.$set(_this.disabled, 0, true);_this.$set(_this.disabled, 1, false);_this.$set(_this.disabled, 10, false);_this.getBluetoothAdapterState();}, fail: function fail(e) {console.log(e, " at pages\\index\\printer.vue:207");console.log('初始化蓝牙失败，错误码：' + (e.errCode || e.errMsg), " at pages\\index\\printer.vue:208");if (e.errCode !== 0) {initTypes(e.errCode, e.errMsg);}} });}, /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * 开始搜索蓝牙设备
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */startBluetoothDevicesDiscovery: function startBluetoothDevicesDiscovery() {var _this2 = this;uni.startBluetoothDevicesDiscovery({ success: function success(e) {console.log('开始搜索蓝牙设备:' + e.errMsg, " at pages\\index\\printer.vue:221");_this2.searchLoad = true;_this2.$set(_this2.disabled, 1, true);_this2.$set(_this2.disabled, 2, false);_this2.$set(_this2.disabled, 3, false);_this2.onBluetoothDeviceFound();}, fail: function fail(e) {console.log('搜索蓝牙设备失败，错误码：' + e.errCode, " at pages\\index\\printer.vue:229");if (e.errCode !== 0) {initTypes(e.errCode);}} });}, /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * 停止搜索蓝牙设备
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */stopBluetoothDevicesDiscovery: function stopBluetoothDevicesDiscovery(types) {var _this3 = this;uni.stopBluetoothDevicesDiscovery({ success: function success(e) {console.log('停止搜索蓝牙设备:' + e.errMsg, " at pages\\index\\printer.vue:242");if (types) {_this3.$set(_this3.disabled, 1, true);} else {_this3.$set(_this3.disabled, 1, false);}_this3.$set(_this3.disabled, 2, true); // this.$set(this.disabled, 3, true);
          _this3.searchLoad = false;},
        fail: function fail(e) {
          console.log('停止搜索蓝牙设备失败，错误码：' + e.errCode, " at pages\\index\\printer.vue:253");
          if (e.errCode !== 0) {
            initTypes(e.errCode);
          }
        } });

    },
    /**
        * 发现外围设备
        */
    onBluetoothDeviceFound: function onBluetoothDeviceFound() {var _this4 = this;
      uni.onBluetoothDeviceFound(function (devices) {
        console.log('开始监听寻找到新设备的事件', " at pages\\index\\printer.vue:265");
        // this.$set(this.disabled, 3, false);
        _this4.getBluetoothDevices();
      });
    },
    /**
        * 获取在蓝牙模块生效期间所有已发现的蓝牙设备。包括已经和本机处于连接状态的设备。
        */
    getBluetoothDevices: function getBluetoothDevices() {var _this5 = this;
      uni.getBluetoothDevices({
        success: function success(res) {
          _this5.newDeviceLoad = false;
          console.log('获取蓝牙设备成功:' + res.errMsg, " at pages\\index\\printer.vue:277");
          // console.log(JSON.stringify(res))
          _this5.list = res.devices;
        },
        fail: function fail(e) {
          console.log('获取蓝牙设备错误，错误码：' + e.errCode, " at pages\\index\\printer.vue:282");
          if (e.errCode !== 0) {
            initTypes(e.errCode);
          }
        } });

    },
    /**
        * 获取本机蓝牙适配器状态
        */
    getBluetoothAdapterState: function getBluetoothAdapterState() {var _this6 = this;
      console.log('--->', " at pages\\index\\printer.vue:293");
      uni.getBluetoothAdapterState({
        success: function success(res) {
          console.log(JSON.stringify(res), " at pages\\index\\printer.vue:296");
          _this6.adapterState = res;
        },
        fail: function fail(e) {
          console.log('获取本机蓝牙适配器状态失败，错误码：' + e.errCode, " at pages\\index\\printer.vue:300");
          if (e.errCode !== 0) {
            initTypes(e.errCode);
          }
        } });

    },
    /**
        * 连接低功耗蓝牙
        */
    createBLEConnection: function createBLEConnection() {var _this7 = this;
      var deviceId = this.equipment[0].deviceId;
      uni.showToast({
        title: '连接蓝牙...',
        icon: 'loading',
        duration: 99999 });

      uni.createBLEConnection({
        // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
        deviceId: deviceId,
        success: function success(res) {
          console.log(res, " at pages\\index\\printer.vue:321");
          console.log('连接蓝牙成功:' + res.errMsg, " at pages\\index\\printer.vue:322");
          // 连接设备后断开搜索 并且不能搜索设备
          _this7.stopBluetoothDevicesDiscovery(true);
          uni.hideToast();
          uni.showToast({
            title: '连接成功',
            icon: 'success',
            duration: 2000 });

          _this7.$set(_this7.disabled, 3, true);
          _this7.$set(_this7.disabled, 4, true);
          _this7.$set(_this7.disabled, 5, false);
          _this7.$set(_this7.disabled, 9, false);
          _this7.connected = true;
        },
        fail: function fail(e) {
          console.log('连接低功耗蓝牙失败，错误码：' + e.errCode, " at pages\\index\\printer.vue:338");
          if (e.errCode !== 0) {
            initTypes(e.errCode);
          }
        } });

    },
    /**
        * 断开与低功耗蓝牙设备的连接
        */
    closeBLEConnection: function closeBLEConnection() {var _this8 = this;
      var deviceId = this.equipment[0].deviceId;
      uni.closeBLEConnection({
        deviceId: deviceId,
        success: function success(res) {
          console.log(res, " at pages\\index\\printer.vue:353");
          console.log('断开低功耗蓝牙成功:' + res.errMsg, " at pages\\index\\printer.vue:354");
          _this8.$set(_this8.disabled, 1, false);
          _this8.$set(_this8.disabled, 3, true);
          _this8.$set(_this8.disabled, 4, true);
          _this8.$set(_this8.disabled, 5, true);
          _this8.$set(_this8.disabled, 6, true);
          _this8.$set(_this8.disabled, 7, true);
          _this8.$set(_this8.disabled, 8, true);
          _this8.$set(_this8.disabled, 9, true);
          _this8.$set(_this8.disabled, 10, true);
          _this8.equipment = [];
          _this8.servicesData = [];
          _this8.characteristicsData = [];
        },
        fail: function fail(e) {
          console.log('断开低功耗蓝牙成功，错误码：' + e.errCode, " at pages\\index\\printer.vue:369");
          if (e.errCode !== 0) {
            initTypes(e.errCode);
          }
        } });

    },
    /**
        * 获取所有服务
        */
    getBLEDeviceServices: function getBLEDeviceServices() {var _this9 = this;
      var deviceId = this.equipment[0].deviceId;
      console.log('获取所有服务的 uuid:' + deviceId, " at pages\\index\\printer.vue:381");

      uni.getBLEDeviceServices({
        // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
        deviceId: deviceId,
        success: function success(res) {
          console.log(JSON.stringify(res.services), " at pages\\index\\printer.vue:387");
          console.log('获取设备服务成功:' + res.errMsg, " at pages\\index\\printer.vue:388");
          _this9.$set(_this9.disabled, 7, true);
          _this9.$set(_this9.disabled, 8, true);
          _this9.showMaskType = 'service';
          _this9.list = res.services;

          _this9.characteristicsData = [];
          if (_this9.list.length <= 0) {
            toast('获取服务失败，请重试!');
            return;
          }
          _this9.maskShow = true;
        },
        fail: function fail(e) {
          console.log('获取设备服务失败，错误码：' + e.errCode, " at pages\\index\\printer.vue:402");
          if (e.errCode !== 0) {
            initTypes(e.errCode);
          }
        } });

    },
    /**
        * 获取某个服务下的所有特征值
        */
    getBLEDeviceCharacteristics: function getBLEDeviceCharacteristics() {var _this10 = this;
      var deviceId = this.equipment[0].deviceId;
      var serviceId = this.servicesData[0].uuid;
      console.log(deviceId, " at pages\\index\\printer.vue:415");
      console.log(serviceId, " at pages\\index\\printer.vue:416");
      uni.getBLEDeviceCharacteristics({
        // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
        deviceId: deviceId,
        // 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
        serviceId: serviceId,
        success: function success(res) {
          console.log(JSON.stringify(res), " at pages\\index\\printer.vue:423");
          console.log('获取特征值成功:' + res.errMsg, " at pages\\index\\printer.vue:424");
          _this10.$set(_this10.disabled, 7, true);
          _this10.valueChangeData = {};
          _this10.showMaskType = 'characteristics';
          _this10.list = res.characteristics;
          if (_this10.list.length <= 0) {
            toast('获取特征值失败，请重试!');
            return;
          }
          _this10.maskShow = true;
        },
        fail: function fail(e) {
          console.log('获取特征值失败，错误码：' + e.errCode, " at pages\\index\\printer.vue:436");
          if (e.errCode !== 0) {
            initTypes(e.errCode);
          }
        } });

    },
    /**
        * 监听低功耗蓝牙连接状态的改变事件。包括开发者主动连接或断开连接，设备丢失，连接异常断开等等
        */
    onBLEConnectionStateChange: function onBLEConnectionStateChange() {var _this11 = this;
      uni.onBLEConnectionStateChange(function (res) {
        // 该方法回调中可以用于处理连接意外断开等异常情况
        console.log("\u84DD\u7259\u8FDE\u63A5\u72B6\u6001 -------------------------->", " at pages\\index\\printer.vue:449");
        console.log(JSON.stringify(res), " at pages\\index\\printer.vue:450");
        if (!res.connected) {
          if (_this11.isStop) return;
          console.log('断开低功耗蓝牙成功:', " at pages\\index\\printer.vue:453");
          _this11.$set(_this11.disabled, 1, false);
          _this11.$set(_this11.disabled, 3, true);
          _this11.$set(_this11.disabled, 4, true);
          _this11.$set(_this11.disabled, 5, true);
          _this11.$set(_this11.disabled, 6, true);
          _this11.$set(_this11.disabled, 7, true);
          _this11.$set(_this11.disabled, 8, true);
          _this11.$set(_this11.disabled, 9, true);
          _this11.searchLoad = false;
          _this11.equipment = [];
          _this11.servicesData = [];
          _this11.characteristicsData = [];
          _this11.valueChangeData = {};
          toast('已经断开当前蓝牙连接');
        }
      });
    },
    /**
        * 读取低功耗蓝牙设备的特征值的二进制数据值。注意：必须设备的特征值支持 read 才可以成功调用
        */
    readBLECharacteristicValue: function readBLECharacteristicValue() {var _this12 = this;
      var deviceId = this.equipment[0].deviceId;
      var serviceId = this.servicesData[0].uuid;
      var characteristicId = this.characteristicsData[0].uuid;
      console.log(deviceId, " at pages\\index\\printer.vue:478");
      console.log(serviceId, " at pages\\index\\printer.vue:479");
      console.log(characteristicId, " at pages\\index\\printer.vue:480");
      uni.readBLECharacteristicValue({
        // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
        deviceId: deviceId,
        // 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
        serviceId: serviceId,
        // 这里的 characteristicId 需要在 getBLEDeviceCharacteristics 接口中获取
        characteristicId: characteristicId,
        success: function success(res) {
          console.log('读取设备数据值成功', " at pages\\index\\printer.vue:489");
          console.log(JSON.stringify(res), " at pages\\index\\printer.vue:490");
          _this12.notifyBLECharacteristicValueChange();
        },
        fail: function fail(e) {
          console.log('读取设备数据值失败，错误码：' + e.errCode, " at pages\\index\\printer.vue:494");
          if (e.errCode !== 0) {
            initTypes(e.errCode);
          }
        } });

      this.onBLECharacteristicValueChange();
    },
    /**
        * 监听低功耗蓝牙设备的特征值变化事件。必须先启用 notifyBLECharacteristicValueChange 接口才能接收到设备推送的 notification。
        */
    onBLECharacteristicValueChange: function onBLECharacteristicValueChange() {var _this13 = this;
      // 必须在这里的回调才能获取
      uni.onBLECharacteristicValueChange(function (characteristic) {
        console.log('监听低功耗蓝牙设备的特征值变化事件成功', " at pages\\index\\printer.vue:508");
        console.log(JSON.stringify(characteristic), " at pages\\index\\printer.vue:509");
        _this13.valueChangeData = characteristic;
      });
    },
    /**
        * 订阅操作成功后需要设备主动更新特征值的 value，才会触发 uni.onBLECharacteristicValueChange 回调。
        */
    notifyBLECharacteristicValueChange: function notifyBLECharacteristicValueChange() {
      var deviceId = this.equipment[0].deviceId;
      var serviceId = this.servicesData[0].uuid;
      var characteristicId = this.characteristicsData[0].uuid;
      var notify = this.characteristicsData[0].properties.notify;
      console.log(deviceId, " at pages\\index\\printer.vue:521");
      console.log(serviceId, " at pages\\index\\printer.vue:522");
      console.log(characteristicId, " at pages\\index\\printer.vue:523");
      console.log(notify, " at pages\\index\\printer.vue:524");
      uni.notifyBLECharacteristicValueChange({
        state: true, // 启用 notify 功能
        // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
        deviceId: deviceId,
        // 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
        serviceId: serviceId,
        // 这里的 characteristicId 需要在 getBLEDeviceCharacteristics 接口中获取
        characteristicId: characteristicId,
        success: function success(res) {
          console.log('notifyBLECharacteristicValueChange success:' + res.errMsg, " at pages\\index\\printer.vue:534");
          console.log(JSON.stringify(res), " at pages\\index\\printer.vue:535");
        } });

    },
    /**
        * 	断开蓝牙模块
        */
    closeBluetoothAdapter: function closeBluetoothAdapter(OBJECT) {var _this14 = this;
      uni.closeBluetoothAdapter({
        success: function success(res) {
          console.log('断开蓝牙模块成功', " at pages\\index\\printer.vue:545");
          _this14.isStop = true;
          _this14.$set(_this14.disabled, 0, false);
          _this14.$set(_this14.disabled, 1, true);
          _this14.$set(_this14.disabled, 2, true);
          _this14.$set(_this14.disabled, 3, true);
          _this14.$set(_this14.disabled, 4, true);
          _this14.$set(_this14.disabled, 5, true);
          _this14.$set(_this14.disabled, 6, true);
          _this14.$set(_this14.disabled, 7, true);
          _this14.$set(_this14.disabled, 8, true);
          _this14.$set(_this14.disabled, 9, true);
          _this14.$set(_this14.disabled, 10, true);
          _this14.equipment = [];
          _this14.servicesData = [];
          _this14.characteristicsData = [];
          _this14.valueChangeData = {};
          _this14.adapterState = [];
          _this14.searchLoad = false;
          toast('断开蓝牙模块');
        } });

    },
    labelTest: function labelTest() {
      var deviceId = this.equipment[0].deviceId;
      var serviceId = this.servicesData[0].uuid;
      var characteristicId = this.characteristicsData[0].uuid;
      var notify = this.characteristicsData[0].properties.notify;
      console.log(deviceId, " at pages\\index\\printer.vue:573");
      console.log(serviceId, " at pages\\index\\printer.vue:574");
      console.log(characteristicId, " at pages\\index\\printer.vue:575");
      console.log(notify, " at pages\\index\\printer.vue:576");

      var command = this.tsc.jpPrinter.createNew();
      command.setSize(50, 30);
      command.setGap(2);
      command.setCls();
      command.setText(50, 100, "TSS24.BF2", 2, 2, "Label Test");
      command.setText(50, 150, "TSS24.BF2", 1, 1, "This is a label test!!");
      command.setQR(100, 200, "L", 5, "A", "www.smarnet.cc");
      command.setPagePrint();
      var cmdData = this.str2a(command.getData());
      console.log('开始打印', " at pages\\index\\printer.vue:587");
      //打印测试
      uni.writeBLECharacteristicValue({
        // 这里的 deviceId 需要在 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
        deviceId: deviceId,
        // 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
        serviceId: serviceId,
        // 这里的 characteristicId 需要在 getBLEDeviceCharacteristics 接口中获取
        characteristicId: characteristicId,
        // 这里的value是ArrayBuffer类型
        value: cmdData,
        success: function success(res) {
          console.log('writeBLECharacteristicValue success', res.errMsg, " at pages\\index\\printer.vue:599");
        } });

    },
    str2a: function str2a(str) {
      var buf = new ArrayBuffer(str.length); // 每个字符占用1个字节
      var bufView = new Uint8Array(buf);
      for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
      }
      return buf;
    } } };



/**
            * 判断初始化蓝牙状态
            */exports.default = _default;
function initTypes(code, errMsg) {
  switch (code) {
    case 10000:
      toast('未初始化蓝牙适配器');
      break;
    case 10001:
      toast('未检测到蓝牙，请打开蓝牙重试！');
      break;
    case 10002:
      toast('没有找到指定设备');
      break;
    case 10003:
      toast('连接失败');
      break;
    case 10004:
      toast('没有找到指定服务');
      break;
    case 10005:
      toast('没有找到指定特征值');
      break;
    case 10006:
      toast('当前连接已断开');
      break;
    case 10007:
      toast('当前特征值不支持此操作');
      break;
    case 10008:
      toast('其余所有系统上报的异常');
      break;
    case 10009:
      toast('Android 系统特有，系统版本低于 4.3 不支持 BLE');
      break;
    default:
      toast(errMsg);}

}

/**
   * 弹出框封装
   */
function toast(content) {var showCancel = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  uni.showModal({
    title: '提示',
    content: content,
    showCancel: showCancel });

}
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-app-plus/dist/index.js */ "./node_modules/@dcloudio/uni-app-plus/dist/index.js")["default"]))

/***/ }),

/***/ "./node_modules/mini-css-extract-plugin/dist/loader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/css-loader/index.js?!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src/index.js?!./node_modules/vue-loader/lib/index.js?!E:\\repos\\OpenPDA\\测试蓝牙打印\\pages\\index\\printer.vue?vue&type=style&index=0&lang=css&":
/*!****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/mini-css-extract-plugin/dist/loader.js??ref--6-oneOf-1-0!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--6-oneOf-1-1!./node_modules/css-loader??ref--6-oneOf-1-2!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src??ref--6-oneOf-1-3!./node_modules/vue-loader/lib??vue-loader-options!E:/repos/OpenPDA/测试蓝牙打印/pages/index/printer.vue?vue&type=style&index=0&lang=css& ***!
  \****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib/index.js?!E:\\repos\\OpenPDA\\测试蓝牙打印\\pages\\index\\printer.vue?vue&type=template&id=2e74215c&":
/*!*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib??vue-loader-options!E:/repos/OpenPDA/测试蓝牙打印/pages/index/printer.vue?vue&type=template&id=2e74215c& ***!
  \*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "render", function() { return render; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return staticRenderFns; });
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
}
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ "E:\\repos\\OpenPDA\\测试蓝牙打印\\pages\\index\\printer.vue":
/*!*******************************************************!*\
  !*** E:/repos/OpenPDA/测试蓝牙打印/pages/index/printer.vue ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _printer_vue_vue_type_template_id_2e74215c___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./printer.vue?vue&type=template&id=2e74215c& */ "E:\\repos\\OpenPDA\\测试蓝牙打印\\pages\\index\\printer.vue?vue&type=template&id=2e74215c&");
/* harmony import */ var _printer_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./printer.vue?vue&type=script&lang=js& */ "E:\\repos\\OpenPDA\\测试蓝牙打印\\pages\\index\\printer.vue?vue&type=script&lang=js&");
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _printer_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _printer_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var _printer_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./printer.vue?vue&type=style&index=0&lang=css& */ "E:\\repos\\OpenPDA\\测试蓝牙打印\\pages\\index\\printer.vue?vue&type=style&index=0&lang=css&");
/* harmony import */ var _D_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");






/* normalize component */

var component = Object(_D_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__["default"])(
  _printer_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
  _printer_vue_vue_type_template_id_2e74215c___WEBPACK_IMPORTED_MODULE_0__["render"],
  _printer_vue_vue_type_template_id_2e74215c___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "E:/repos/OpenPDA/测试蓝牙打印/pages/index/printer.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ "E:\\repos\\OpenPDA\\测试蓝牙打印\\pages\\index\\printer.vue?vue&type=script&lang=js&":
/*!********************************************************************************!*\
  !*** E:/repos/OpenPDA/测试蓝牙打印/pages/index/printer.vue?vue&type=script&lang=js& ***!
  \********************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_printer_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--12-1!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib??vue-loader-options!./printer.vue?vue&type=script&lang=js& */ "./node_modules/babel-loader/lib/index.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib/index.js?!E:\\repos\\OpenPDA\\测试蓝牙打印\\pages\\index\\printer.vue?vue&type=script&lang=js&");
/* harmony import */ var _D_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_printer_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_D_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_printer_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _D_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_printer_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _D_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_printer_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_D_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_printer_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "E:\\repos\\OpenPDA\\测试蓝牙打印\\pages\\index\\printer.vue?vue&type=style&index=0&lang=css&":
/*!****************************************************************************************!*\
  !*** E:/repos/OpenPDA/测试蓝牙打印/pages/index/printer.vue?vue&type=style&index=0&lang=css& ***!
  \****************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_D_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_1_D_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_6_oneOf_1_2_D_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_D_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_printer_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/mini-css-extract-plugin/dist/loader.js??ref--6-oneOf-1-0!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--6-oneOf-1-1!./node_modules/css-loader??ref--6-oneOf-1-2!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src??ref--6-oneOf-1-3!./node_modules/vue-loader/lib??vue-loader-options!./printer.vue?vue&type=style&index=0&lang=css& */ "./node_modules/mini-css-extract-plugin/dist/loader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/css-loader/index.js?!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src/index.js?!./node_modules/vue-loader/lib/index.js?!E:\\repos\\OpenPDA\\测试蓝牙打印\\pages\\index\\printer.vue?vue&type=style&index=0&lang=css&");
/* harmony import */ var _D_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_D_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_1_D_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_6_oneOf_1_2_D_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_D_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_printer_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_D_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_D_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_1_D_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_6_oneOf_1_2_D_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_D_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_printer_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _D_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_D_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_1_D_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_6_oneOf_1_2_D_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_D_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_printer_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _D_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_D_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_1_D_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_6_oneOf_1_2_D_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_D_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_printer_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_D_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_D_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_1_D_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_6_oneOf_1_2_D_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_D_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_printer_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "E:\\repos\\OpenPDA\\测试蓝牙打印\\pages\\index\\printer.vue?vue&type=template&id=2e74215c&":
/*!**************************************************************************************!*\
  !*** E:/repos/OpenPDA/测试蓝牙打印/pages/index/printer.vue?vue&type=template&id=2e74215c& ***!
  \**************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_printer_vue_vue_type_template_id_2e74215c___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib??vue-loader-options!./printer.vue?vue&type=template&id=2e74215c& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib/index.js?!E:\\repos\\OpenPDA\\测试蓝牙打印\\pages\\index\\printer.vue?vue&type=template&id=2e74215c&");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _D_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_printer_vue_vue_type_template_id_2e74215c___WEBPACK_IMPORTED_MODULE_0__["render"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return _D_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_printer_vue_vue_type_template_id_2e74215c___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"]; });



/***/ })

},[["E:\\repos\\OpenPDA\\测试蓝牙打印\\main.js?{\"page\":\"pages%2Findex%2Fprinter\"}","common/runtime","common/vendor"]]]);