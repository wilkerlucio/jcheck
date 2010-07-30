(function($) {
  $.FormCheck = function(form, options) {
    this.form = form;
    this.options = $.extend({
      prevent_submit: true,
      field_prefix: null,
      notifiers: ["notification_dialog"],
      language: 'en'
    }, options || {});
    this.field_cache = {};
    this.errors = new $.FormCheck.Errors(this);
    this.validations = [];
    this.hook_events();
    this.setup_notifiers();
    return this;
  };
  $.FormCheck.prototype.hook_events = function() {
    return this.form.submit((function(__this) {
      var __func = function(e) {
        var _a, _b, _c, _d, notifier;
        if (!(this.is_valid())) {
          if (this.options.prevent_submit) {
            e.preventDefault();
          }
          _a = []; _c = this.notifiers;
          for (_b = 0, _d = _c.length; _b < _d; _b++) {
            notifier = _c[_b];
            _a.push(notifier.notify(this));
          }
          return _a;
        }
      };
      return (function() {
        return __func.apply(__this, arguments);
      });
    })(this));
  };
  $.FormCheck.prototype.setup_notifiers = function() {
    var _a, _b, _c, _d, kind;
    this.notifiers = (function() {
      _a = []; _c = this.options.notifiers;
      for (_b = 0, _d = _c.length; _b < _d; _b++) {
        kind = _c[_b];
        _a.push(new ($.FormCheck.find_notifier(kind))());
      }
      return _a;
    }).call(this);
    return this.notifiers;
  };
  $.FormCheck.prototype.validate = function(validator) {
    return this.validations.push(validator);
  };
  $.FormCheck.prototype.field = function(name) {
    var _a;
    this.field_cache[name] = (typeof (_a = this.field_cache[name]) !== "undefined" && _a !== null) ? this.field_cache[name] : new $.FormCheck.Field(this, this.field_name(name));
    return this.field_cache[name];
  };
  $.FormCheck.prototype.is_valid = function() {
    var _a, _b, _c, validation;
    this.errors.clear();
    _b = this.validations;
    for (_a = 0, _c = _b.length; _a < _c; _a++) {
      validation = _b[_a];
      validation(this);
    }
    return this.errors.size() === 0;
  };
  $.FormCheck.prototype.field_name = function(name) {
    return this.options.field_prefix ? ("" + (this.options.field_prefix) + "[" + (name) + "]") : name;
  };

  $.FormCheck.Field = function(form, name) {
    this.form_checker = form;
    this.field_name = name;
    this.element = this.form_checker.form.find(("*[name='" + (name) + "']"));
    return this;
  };
  $.FormCheck.Field.prototype.value = function() {
    return this.element.val();
  };
  $.FormCheck.Field.prototype.label = function() {
    var field_id, label_element;
    field_id = this.element.attr("id");
    label_element = this.form_checker.form.find(("label[for='" + (field_id) + "']"));
    return label_element.length > 0 ? label_element.text() : this.field_name;
  };

  $.fn.jcheck = function(options) {
    return new $.FormCheck($(this), options || {});
  };
  return $.fn.jcheck;
})(jQuery);