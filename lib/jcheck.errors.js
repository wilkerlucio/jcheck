var __hasProp = Object.prototype.hasOwnProperty, __bind = function(func, context) {
    return function(){ return func.apply(context, arguments); };
  };
(function($) {
  $.FormCheck.Errors = function(form) {
    this.form_checker = form;
    this.clear();
    return this;
  };
  $.FormCheck.Errors.prototype.clear = function() {
    return (this.errors = {});
  };
  $.FormCheck.Errors.prototype.add = function(field, message, options) {
    var _a;
    options = (typeof options !== "undefined" && options !== null) ? options : {};
    message = (typeof message !== "undefined" && message !== null) ? message : ":invalid";
    this.errors[field] = (typeof this.errors[field] !== "undefined" && this.errors[field] !== null) ? this.errors[field] : [];
    if ((typeof (_a = options.message) !== "undefined" && _a !== null)) {
      message = options.message;
    }
    message = this.generate_message(message, options);
    message = message.simple_template_replace(options);
    return this.errors[field].push(message);
  };
  $.FormCheck.Errors.prototype.attributes_with_errors = function() {
    var _a, attribute, attributes, errors;
    attributes = [];
    _a = this.errors;
    for (attribute in _a) {
      if (!__hasProp.call(_a, attribute)) continue;
      errors = _a[attribute];
      if (errors.length > 0) {
        attributes.push(attribute);
      }
    }
    return attributes;
  };
  $.FormCheck.Errors.prototype.on = function(attribute) {
    this.errors[attribute] = (typeof this.errors[attribute] !== "undefined" && this.errors[attribute] !== null) ? this.errors[attribute] : [];
    return this.errors[attribute];
  };
  $.FormCheck.Errors.prototype.each = function(fn) {
    var _a, _b, _c, _d, _e, _f, attribute, error, errors;
    _a = []; _b = this.errors;
    for (attribute in _b) {
      if (!__hasProp.call(_b, attribute)) continue;
      errors = _b[attribute];
      _a.push((function() {
        _c = []; _e = errors;
        for (_d = 0, _f = _e.length; _d < _f; _d++) {
          error = _e[_d];
          _c.push(fn(attribute, error));
        }
        return _c;
      })());
    }
    return _a;
  };
  $.FormCheck.Errors.prototype.size = function() {
    var _a, attribute, messages, sum;
    sum = 0;
    _a = this.errors;
    for (attribute in _a) {
      if (!__hasProp.call(_a, attribute)) continue;
      messages = _a[attribute];
      sum += messages.length;
    }
    return sum;
  };
  $.FormCheck.Errors.prototype.full_messages = function() {
    var messages;
    messages = [];
    this.each(__bind(function(attribute, message) {
      attribute = this.form_checker.field(attribute).label();
      return messages.push(("" + (attribute) + " " + (message)));
    }, this));
    return messages;
  };
  $.FormCheck.Errors.prototype.generate_message = function(message) {
    var match;
    return (match = message.match(/^:(.+)/)) ? $.FormCheck.i18n.translate(("errors.messages." + (match[1])), this.form_checker.options.language) : message;
  };
  return $.FormCheck.Errors;
})(jQuery);