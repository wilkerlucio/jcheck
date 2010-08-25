var __hasProp = Object.prototype.hasOwnProperty;
(function($) {
  var _a;
  Array.wrap = function(data) {
    return $.isArray(data) ? data : [data];
  };
  Array.prototype.extract_options = function() {
    return $.isPlainObject(this[this.length - 1]) ? this.pop() : {};
  };
  Array.prototype.isEqual = function(other) {
    var _a, _b, key, value;
    if (!($.isArray(other))) {
      return false;
    }
    if (this.length !== other.length) {
      return false;
    }
    _a = this;
    for (key = 0, _b = _a.length; key < _b; key++) {
      value = _a[key];
      if (value !== other[key]) {
        return false;
      }
    }
    return true;
  };
  String.prototype.simple_template_replace = function(options) {
    var _a, key, replacement, text;
    text = this + "";
    _a = options;
    for (key in _a) {
      if (!__hasProp.call(_a, key)) continue;
      replacement = _a[key];
      text = text.replace(("%{" + (key) + "}"), replacement);
    }
    return text;
  };
  String.prototype.uc_first = function() {
    return this.charAt(0).toUpperCase() + this.substr(1);
  };
  String.prototype.camelize = function() {
    var _a, _b, _c, _d, parts, str;
    parts = (function() {
      _a = []; _c = this.split("_");
      for (_b = 0, _d = _c.length; _b < _d; _b++) {
        str = _c[_b];
        _a.push(str.uc_first());
      }
      return _a;
    }).call(this);
    return parts.join('');
  };
  $.isString = function(value) {
    return (typeof value) === "string";
  };
  window.is_blank = function(object) {
    if (!((typeof object !== "undefined" && object !== null))) {
      return true;
    }
    if ($.isString(object) && object.replace(/^\s+|\s+$/, '').length === 0) {
      return true;
    }
    return false;
  };
  window.delete_object_property = function(object, property) {
    var value;
    value = object[property] || null;
    delete object[property];
    return value;
  };
  window.object_without_properties = function(object, properties) {
    var _a, _b, _c, obj, property;
    obj = $.extend({}, object);
    _b = properties;
    for (_a = 0, _c = _b.length; _a < _c; _a++) {
      property = _b[_a];
      delete obj[property];
    }
    return obj;
  };
  window.extract_keys = function(object) {
    var _a, _b, _c, key;
    _b = []; _c = object;
    for (key in _c) {
      if (!__hasProp.call(_c, key)) continue;
      _a = _c[key];
      _b.push(key);
    }
    return _b;
  };
  window.slice_object = function(object, keys) {
    var _a, _b, _c, _d, key, obj;
    obj = {};
    _b = keys;
    for (_a = 0, _c = _b.length; _a < _c; _a++) {
      key = _b[_a];
      if ((typeof (_d = object[key]) !== "undefined" && _d !== null)) {
        obj[key] = object[key];
      }
    }
    return obj;
  };
  window.slice_object_and_remove = function(object, keys) {
    var _a, k, obj, v;
    obj = {};
    _a = object;
    for (k in _a) {
      if (!__hasProp.call(_a, k)) continue;
      v = _a[k];
      if ($.inArray(k, keys) === -1) {
        obj[k] = object[k];
        delete object[k];
      }
    }
    return obj;
  };
  return !((typeof (_a = window.console) !== "undefined" && _a !== null)) ? (window.console = {
    log: function() {},
    dir: function() {},
    error: function() {}
  }) : null;
})(jQuery);