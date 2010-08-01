(function($) {
  $.FormCheck = function(form, options) {
    this.form = form;
    this.options = $.extend({
      prevent_submit: true,
      field_prefix: null,
      notifiers: ["notification_dialog"],
      live_notifiers: ["tip_ballons"],
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
    var self;
    this.form.submit((function(__this) {
      var __func = function(e) {
        var _a, _b, _c, _d, notifier;
        if (!(this.is_valid())) {
          if (this.options.prevent_submit) {
            e.preventDefault();
          }
          _a = []; _c = this.notifiers;
          for (_b = 0, _d = _c.length; _b < _d; _b++) {
            notifier = _c[_b];
            _a.push(notifier.notify());
          }
          return _a;
        }
      };
      return (function() {
        return __func.apply(__this, arguments);
      });
    })(this));
    self = this;
    return this.form.find(":input").each(function() {
      var name;
      name = self.parse_field_name($(this));
      if (name) {
        self.field(name);
        return self.options.live_notifiers ? (function(el) {
          var n;
          n = name;
          el.focus(function(e) {
            self.is_valid();
            return self.dispatch_live_notifiers("focus", n, e);
          });
          return el.blur(function(e) {
            self.is_valid();
            return self.dispatch_live_notifiers("blur", n, e);
          });
        })($(this)) : null;
      }
    });
  };
  $.FormCheck.prototype.dispatch_live_notifiers = function(callback, attribute, event) {
    var _a, _b, _c, _d, notifier;
    _a = []; _c = this.live_notifiers;
    for (_b = 0, _d = _c.length; _b < _d; _b++) {
      notifier = _c[_b];
      _a.push(notifier[callback](attribute, event));
    }
    return _a;
  };
  $.FormCheck.prototype.setup_notifiers = function() {
    var _a, _b, _c, _d, _e, _f, _g, _h, kind, type;
    _a = []; _c = ["notifiers", "live_notifiers"];
    for (_b = 0, _d = _c.length; _b < _d; _b++) {
      type = _c[_b];
      _a.push((function() {
        this[type] = [];
        if (this.options[type]) {
          this[type] = (function() {
            _e = []; _g = this.options[type];
            for (_f = 0, _h = _g.length; _f < _h; _f++) {
              kind = _g[_f];
              _e.push(this.get_notifier(kind));
            }
            return _e;
          }).call(this);
          return this[type];
        }
      }).call(this));
    }
    return _a;
  };
  $.FormCheck.prototype.get_notifier = function(notifier) {
    return $.isString(notifier) ? new ($.FormCheck.find_notifier(notifier))(this) : notifier;
  };
  $.FormCheck.prototype.validate = function(validator) {
    return this.validations.push(validator);
  };
  $.FormCheck.prototype.field = function(name) {
    var _a;
    this.field_cache[name] = (typeof (_a = this.field_cache[name]) !== "undefined" && _a !== null) ? this.field_cache[name] : new $.FormCheck.Field(this, this.field_name(name), name);
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
  $.FormCheck.prototype.parse_field_name = function(input) {
    var matches, name;
    name = input.attr("name");
    if (!(name)) {
      return null;
    }
    this.options.field_prefix ? (matches = name.match(new RegExp(("" + (this.options.field_prefix) + "\\[(.+?)\\](.*)")))) ? (name = matches[1] + (matches[2] || "")) : (name = ":" + name) : null;
    return name;
  };
  $.FormCheck.prototype.field_name = function(name) {
    var matches, subparts;
    if ((matches = name.match(/^:(.+)/))) {
      return matches[1];
    }
    if (this.options.field_prefix) {
      subparts = "";
      if ((matches = name.match(/(.+?)(\[.+)$/))) {
        name = matches[1];
        subparts = matches[2];
      }
      return "" + (this.options.field_prefix) + "[" + (name) + "]" + (subparts);
    } else {
      return name;
    }
  };

  $.FormCheck.Field = function(form, name, attribute) {
    var _a, _b, _c;
    this.form_checker = form;
    this.field_name = name;
    this.attribute = attribute;
    this.element = this.form_checker.form.find((":input[name='" + (name) + "']"));
    if (this.form_checker.options.live_notifiers) {
      _b = this.events_for_element();
      for (_a = 0, _c = _b.length; _a < _c; _a++) {
        (function() {
          var evt = _b[_a];
          return this.element[evt](function(e) {
            form.is_valid();
            return form.dispatch_live_notifiers("notify", attribute, e);
          });
        }).call(this);
      }
    }
    return this;
  };
  $.FormCheck.Field.prototype.events_for_element = function() {
    if (this.element.attr("type") === "radio" || this.element.attr("type") === "checkbox") {
      return ["change"];
    }
    if (this.element[0].tagName.toLowerCase() === "select") {
      return ["keyup", "change"];
    }
    return ["keyup"];
  };
  $.FormCheck.Field.prototype.value = function() {
    if (this.element.attr("type") === "radio") {
      return this.value_for_radio();
    }
    if (this.element.attr("type") === "checkbox") {
      return this.value_for_checkbox();
    }
    return this.value_for_text();
  };
  $.FormCheck.Field.prototype.value_for_text = function() {
    return this.element.val() || "";
  };
  $.FormCheck.Field.prototype.value_for_radio = function() {
    return this.element.filter(":checked").val() || "";
  };
  $.FormCheck.Field.prototype.value_for_checkbox = function() {
    return this.element.length > 1 ? this.element.filter(":checked").map(function() {
      return $(this).val();
    }) : this.element[0].checked ? this.element.val() : "";
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