import Dep from "./Dep";
import { arrayMethods } from "./array";

const hasProto = __proto__ in {};
const arrayKeys = Object.getOwnPropertyNames(arrayMethods);
export default class Observer {
  constructor(value) {
    this.value = value;
    this.dep = new Dep();
    def(value, "__ob__", this);
    if (Array.isArray(value)) {
      const augment = hasProto ? protoAugment : copyAugment;
      augment(value, arrayMethods, arrayKeys);
      this.observeArray(value);
    } else {
      this.walk(value);
    }
  }

  observeArray(items) {
    for (let i = 0; i < items.length; i++) {
      observe(items[i]);
    }
  }

  walk(obj) {
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i], obj[keys[i]]);
    }
  }
}

function defineReactive(data, key, val) {
  let childOb = observe(val);
  let dep = new Dep();

  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: true,
    get: function () {
      dep.depend();
      if (childOb) {
        childOb.dep.depend();
      }
      return val;
    },
    set: function (newVal) {
      if (val === newVal) {
        return;
      }
      val = newVal;
      dep.notify();
    },
  });
}

export function observe(value, asRootData) {
  if (!isObject(value)) {
    return;
  }

  let ob;
  if (hasOwn(value, "__ob__") && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else {
    ob = new Observer(value);
  }

  return ob;
}
function protoAugment(target, src, keys) {
  target.__proto__ = src;
}

function copyAugment(target, src, keys) {
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    def(target, key, src[key]);
  }
}

export function def(obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true,
  });
}
