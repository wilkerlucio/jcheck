var __hasProp = Object.prototype.hasOwnProperty;
(function($) {
  Array.wrap = function(data) {
    return $.isArray(data) ? data : [data];
  };
  Array.prototype.extract_options = function() {
    return $.isPlainObject(this[this.length - 1]) ? this.pop() : {};
  };
  String.prototype.simple_template_replace = function(options) {
    var _a, key, replacement, text;
    text = this + "";
    _a = options;
    for (key in _a) { if (__hasProp.call(_a, key)) {
      replacement = _a[key];
      text = text.replace(("%{" + (key) + "}"), replacement);
    }}
    return text;
  };
  $.isString = function(value) {
    return (typeof value) === "string";
  };
  window.is_blank = function(object) {
    if (!(typeof object !== "undefined" && object !== null)) {
      return true;
    }
    if ($.isString(object) && object.replace(/^\s+|\s+$/, '').length === 0) {
      return true;
    }
    return false;
  };
  window.delete_object_property = function(object, property) {
    var value;
    value = object[property];
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
    var _a, _b, key;
    _a = []; _b = object;
    for (key in _b) { if (__hasProp.call(_b, key)) {
      _a.push(key);
    }}
    return _a;
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
    for (k in _a) { if (__hasProp.call(_a, k)) {
      v = _a[k];
      if ($.inArray(k, keys) === -1) {
        obj[k] = object[k];
        delete object[k];
      }
    }}
    return obj;
  };
  return window.slice_object_and_remove;
})(jQuery);