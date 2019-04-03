'use strict';
const location = window.location;

class Storage {
  constructor() {
    this.hname = location.hostname ? location.hostname : 'localStatus';
    this.isLocalStorage = !!window.localStorage;
    this.dataDom = null;
    this.defaultValue = {};
  }

  setDefaultData(defaultValue={}) {
    this.defaultValue = defaultValue;
  }

  initDom(){ //初始化userData
    if(!this.dataDom) {
      try{
        this.dataDom = document.createElement('input');//这里使用hidden的input元素
        this.dataDom.type = 'hidden';
        this.dataDom.style.display = "none";
        this.dataDom.addBehavior('#default#userData');//这是userData的语法
        document.body.appendChild(this.dataDom);
        let exDate = new Date();
        exDate = exDate.getDate()+30;
        this.dataDom.expires = exDate.toUTCString();//设定过期时间
      } catch(ex) {
        return false;
      }
    }
    return true;
  }

  set(key,value){
    if(this.isLocalStorage) {
      window.localStorage.setItem(key,value);
    }else{
      if(this.initDom()) {
        this.dataDom.load(this.hname);
        this.dataDom.setAttribute(key,value);
        this.dataDom.save(this.hname);
      }
    }
  }

  get(key){
    if(this.isLocalStorage) {
      return window.localStorage.getItem(key) || this.defaultValue[key];
    } else {
      if(this.initDom()) {
        this.dataDom.load(this.hname);
        return this.dataDom.getAttribute(key) || this.defaultValue[key];
      }
    }
  }

  remove(key) {
    if(this.isLocalStorage) {
      localStorage.removeItem(key);
    }else{
      if(this.initDom()) {
        this.dataDom.load(this.hname);
        this.dataDom.removeAttribute(key);
        this.dataDom.save(this.hname);
      }
    }
  }
}

export default new Storage();
