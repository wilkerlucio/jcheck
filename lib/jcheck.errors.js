var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
(function($) {
  return $.FormCheck.Errors = (function() {
    function Errors(form) {
      this.form_checker = form;
      this.clear();
    }
    Errors.prototype.clear = function() {
      return this.errors = {};
    };
    Errors.prototype.add = function(field, message, options) {
      var _base, _ref;
            if (options != null) {
        options;
      } else {
        options = {};
      };
            if (message != null) {
        message;
      } else {
        message = ":invalid";
      };
            if ((_ref = (_base = this.errors)[field]) != null) {
        _ref;
      } else {
        _base[field] = [];
      };
      if (options.message != null) {
        message = options.message;
      }
      message = this.generate_message(message, options);
      message = message.simple_template_replace(options);
      return this.errors[field].push(message);
    };
    Errors.prototype.attributes_with_errors = function() {
      var attribute, attributes, errors, _ref;
      attributes = [];
      _ref = this.errors;
      for (attribute in _ref) {
        errors = _ref[attribute];
        if (errors.length > 0) {
          attributes.push(attribute);
        }
      }
      return attributes;
    };
    Errors.prototype.on = function(attribute) {
      var _base, _ref;
            if ((_ref = (_base = this.errors)[attribute]) != null) {
        _ref;
      } else {
        _base[attribute] = [];
      };
      return this.errors[attribute];
    };
    Errors.prototype.each = function(fn) {
      var attribute, error, errors, _ref, _results;
      _ref = this.errors;
      _results = [];
      for (attribute in _ref) {
        errors = _ref[attribute];
        _results.push((function() {
          var _i, _len, _results2;
          _results2 = [];
          for (_i = 0, _len = errors.length; _i < _len; _i++) {
            error = errors[_i];
            _results2.push(fn(attribute, error));
          }
          return _results2;
        })());
      }
      return _results;
    };
    Errors.prototype.size = function() {
      var attribute, messages, sum, _ref;
      sum = 0;
      _ref = this.errors;
      for (attribute in _ref) {
        messages = _ref[attribute];
        sum += messages.length;
      }
      return sum;
    };
    Errors.prototype.full_messages = function() {
      var messages;
      messages = [];
      this.each(__bind(function(attribute, message) {
        attribute = this.form_checker.field(attribute).label();
        return messages.push("" + attribute + " " + message);
      }, this));
      return messages;
    };
    Errors.prototype.generate_message = function(message) {
      var match;
      if (match = message.match(/^:(.+)/)) {
        return $.FormCheck.i18n.translate("errors.messages." + match[1], this.form_checker.options.language);
      } else {
        return message;
      }
    };
    return Errors;
  })();
})(jQuery);