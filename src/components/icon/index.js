'use strict';
const add = require('../../assets/system/add.svg');
const order = require('../../assets/system/order.svg');
const alipay = require('../../assets/system/zhifubao.svg');
const wechat = require('../../assets/system/weixinzhifu.svg');
const bank = require('../../assets/system/yinxingqia.svg');
const erweima = require('../../assets/system/erweima.svg');
const icons = {
  add,
  order,
  alipay,
  wechat,
  bank,
  erweima,
};

export default ({ type, className = '', size = 'md', ...restProps }) => (
    <img
    className={`am-icon am-icon-${type.substr(1)} am-icon-${size} ${className}`}
    src={icons[type]} {...restProps} />
);


// <svg
//   className={`am-icon am-icon-${type.substr(1)} am-icon-${size} ${className}`}
//   {...restProps}
// >
//   <use xlinkHref={icons[type]} /> {/* svg-sprite-loader@0.3.x */}
//   {/* <use xlinkHref={#${type.default.id}} /> */} {/* svg-sprite-loader@latest */}
// </svg>
