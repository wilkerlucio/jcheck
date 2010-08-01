var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    var ctor = function(){ };
    ctor.prototype = parent.prototype;
    child.__superClass__ = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
  }, __slice = Array.prototype.slice;
(function($) {
  $.FormCheck.Validations = {};
  $.FormCheck.find_validator = function(kind) {
    var _a, k, validator;
    _a = $.FormCheck.Validations;
    for (k in _a) { if (__hasProp.call(_a, k)) {
      validator = _a[k];
      if (validator.kind === kind) {
        return validator;
      }
    }}
    return null;
  };
  $.FormCheck.Validator = function(options) {
    this.options = options;
    return this;
  };
  $.FormCheck.Validator.prototype.kind = function() {  };
  $.FormCheck.Validator.prototype.validate = function(form) {  };

  $.FormCheck.EachValidator = function(options) {
    this.attributes = Array.wrap(delete_object_property(options, "attributes"));
    if (options["allow_nil"]) {
      options["allow_blank"] = true;
    }
    if (options["allow_blank"]) {
      options["allow_nil"] = true;
    }
    $.FormCheck.EachValidator.__superClass__.constructor.call(this, options);
    this.check_valitity();
    return this;
  };
  __extends($.FormCheck.EachValidator, $.FormCheck.Validator);
  $.FormCheck.EachValidator.prototype.validate = function(form) {
    var _a, _b, _c, _d, attribute, value;
    _a = []; _c = this.attributes;
    for (_b = 0, _d = _c.length; _b < _d; _b++) {
      attribute = _c[_b];
      value = form.field(attribute).value();
      if (is_blank(value) && this.options["allow_blank"]) {
        continue;
      }
      this.validate_each(form, attribute, value);
    }
    return _a;
  };
  $.FormCheck.EachValidator.prototype.validate_each = function(record, attribute, value) {  };
  $.FormCheck.EachValidator.prototype.check_valitity = function() {  };

  $.FormCheck.prototype.validates_with = function() {
    var _c, _d, _e, _f, validators;
    var _a = arguments.length, _b = _a >= 2, options = arguments[_b ? _a - 1 : 0];
    validators = __slice.call(arguments, 0, _a - 1);
    _c = []; _e = validators;
    for (_d = 0, _f = _e.length; _d < _f; _d++) {
      (function() {
        var validator;
        var validator_klass = _e[_d];
        return _c.push((function() {
          validator = new validator_klass(options);
          return this.validate(function(form) {
            return validator.validate(form);
          });
        }).call(this));
      }).call(this);
    }
    return _c;
  };
  $.FormCheck.prototype.attributes_for_with = function(attributes) {
    var options;
    options = attributes.extract_options();
    return $.extend(options, {
      attributes: attributes
    });
  };
  $.FormCheck.Validations.AcceptanceValidator = function(options) {
    $.FormCheck.Validations.AcceptanceValidator.__superClass__.constructor.call(this, $.extend({
      allow_nil: true,
      accept: '1'
    }, options));
    return this;
  };
  __extends($.FormCheck.Validations.AcceptanceValidator, $.FormCheck.EachValidator);
  $.FormCheck.Validations.AcceptanceValidator.prototype.validate_each = function(form, attribute, value) {
    return form.erros.add(attribute, ":accepted", object_without_properties(this.options, ['accept', 'allow_nil']));
  };

  $.FormCheck.Validations.AcceptanceValidator.kind = "acceptance";
  $.FormCheck.prototype.validates_acceptance_of = function() {
    var attributes;
    var _a = arguments.length, _b = _a >= 1;
    attributes = __slice.call(arguments, 0, _a - 0);
    return this.validates_with($.FormCheck.Validations.AcceptanceValidator, this.attributes_for_with(attributes));
  };
  $.FormCheck.Validations.ConfirmationValidator = function() {
    return $.FormCheck.EachValidator.apply(this, arguments);
  };
  __extends($.FormCheck.Validations.ConfirmationValidator, $.FormCheck.EachValidator);
  $.FormCheck.Validations.ConfirmationValidator.prototype.validate_each = function(form, attribute, value) {
    var confirmed;
    confirmed = form.field(attribute + "_confirmation").value();
    return form.errors.add(attribute, ":confirmation", this.options);
  };

  $.FormCheck.Validations.ConfirmationValidator.kind = "confirmation";
  $.FormCheck.prototype.validates_confirmation_of = function() {
    var attributes;
    var _a = arguments.length, _b = _a >= 1;
    attributes = __slice.call(arguments, 0, _a - 0);
    return this.validates_with($.FormCheck.Validations.ConfirmationValidator, this.attributes_for_with(attributes));
  };
  $.FormCheck.Validations.ExclusionValidator = function() {
    return $.FormCheck.EachValidator.apply(this, arguments);
  };
  __extends($.FormCheck.Validations.ExclusionValidator, $.FormCheck.EachValidator);
  $.FormCheck.Validations.ExclusionValidator.prototype.validate_each = function(form, attribute, value) {
    if ($.inArray(value, this.options["in"]) > -1) {
      return form.errors.add(attribute, ":exclusion", $.extend(object_without_properties(this.options, ['in']), {
        value: value
      }));
    }
  };

  $.FormCheck.Validations.ExclusionValidator.kind = "exclusion";
  $.FormCheck.prototype.validates_exclusion_of = function() {
    var attributes;
    var _a = arguments.length, _b = _a >= 1;
    attributes = __slice.call(arguments, 0, _a - 0);
    return this.validates_with($.FormCheck.Validations.ExclusionValidator, this.attributes_for_with(attributes));
  };
  $.FormCheck.Validations.FormatValidator = function(options) {
    var _a, _b, _c, _d, opt;
    _b = ["with", "without"];
    for (_a = 0, _c = _b.length; _a < _c; _a++) {
      opt = _b[_a];
      if ((typeof (_d = options[opt]) !== "undefined" && _d !== null) && $.isString(options[opt])) {
        options[opt] = $.FormCheck.Validations.FormatValidator.FORMATS[options[opt]];
      }
    }
    $.FormCheck.Validations.FormatValidator.__superClass__.constructor.call(this, options);
    return this;
  };
  __extends($.FormCheck.Validations.FormatValidator, $.FormCheck.EachValidator);
  $.FormCheck.Validations.FormatValidator.prototype.validate_each = function(form, attribute, value) {
    this.options["with"] && !((value + "").match(this.options["with"])) ? form.errors.add(attribute, ":invalid", $.extend(object_without_properties(this.options, ['with']), {
      value: value
    })) : null;
    return this.options["without"] && (value + "").match(this.options["without"]) ? form.errors.add(attribute, ":invalid", $.extend(object_without_properties(this.options, ['without']), {
      value: value
    })) : null;
  };

  $.FormCheck.Validations.FormatValidator.FORMATS = {
    email: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i
  };
  $.FormCheck.Validations.FormatValidator.kind = "format";
  $.FormCheck.prototype.validates_format_of = function() {
    var attributes;
    var _a = arguments.length, _b = _a >= 1;
    attributes = __slice.call(arguments, 0, _a - 0);
    return this.validates_with($.FormCheck.Validations.FormatValidator, this.attributes_for_with(attributes));
  };
  $.FormCheck.Validations.InclusionValidator = function() {
    return $.FormCheck.EachValidator.apply(this, arguments);
  };
  __extends($.FormCheck.Validations.InclusionValidator, $.FormCheck.EachValidator);
  $.FormCheck.Validations.InclusionValidator.prototype.validate_each = function(form, attribute, value) {
    if ($.inArray(value, this.options["in"]) === -1) {
      return form.errors.add(attribute, ":inclusion", $.extend(object_without_properties(this.options, ['in']), {
        value: value
      }));
    }
  };

  $.FormCheck.Validations.InclusionValidator.kind = "inclusion";
  $.FormCheck.prototype.validates_inclusion_of = function() {
    var attributes;
    var _a = arguments.length, _b = _a >= 1;
    attributes = __slice.call(arguments, 0, _a - 0);
    return this.validates_with($.FormCheck.Validations.InclusionValidator, this.attributes_for_with(attributes));
  };
  $.FormCheck.Validations.LengthValidator = function(options) {
    $.FormCheck.Validations.LengthValidator.__superClass__.constructor.call(this, $.extend({
      tokenizer: $.FormCheck.Validations.LengthValidator.DEFAULT_TOKENIZER
    }, options));
    return this;
  };
  __extends($.FormCheck.Validations.LengthValidator, $.FormCheck.EachValidator);
  $.FormCheck.Validations.LengthValidator.prototype.validate_each = function(form, attribute, value) {
    var _a, _b, _c, _d, _e, _f;
    if ($.isString(value)) {
      value = this.options.tokenizer(value);
    }
    if (this.options["is"] && this.options["is"] !== value.length) {
      if ((typeof (_b = this.options["wrong_length"]) !== "undefined" && _b !== null)) {
        this.options["message"] = (typeof (_a = this.options["message"]) !== "undefined" && _a !== null) ? this.options["message"] : this.options["wrong_length"];
      }
      form.errors.add(attribute, ":wrong_length", $.extend(object_without_properties(this.options, $.FormCheck.Validations.LengthValidator.RESERVED_OPTIONS), {
        count: this.options["is"]
      }));
    }
    if (this.options["minimum"] && this.options["minimum"] > value.length) {
      if ((typeof (_d = this.options["too_short"]) !== "undefined" && _d !== null)) {
        this.options["message"] = (typeof (_c = this.options["message"]) !== "undefined" && _c !== null) ? this.options["message"] : this.options["too_short"];
      }
      form.errors.add(attribute, ":too_short", $.extend(object_without_properties(this.options, $.FormCheck.Validations.LengthValidator.RESERVED_OPTIONS), {
        count: this.options["minimum"]
      }));
    }
    if (this.options["maximum"] && this.options["maximum"] < value.length) {
      if ((typeof (_f = this.options["too_long"]) !== "undefined" && _f !== null)) {
        this.options["message"] = (typeof (_e = this.options["message"]) !== "undefined" && _e !== null) ? this.options["message"] : this.options["too_long"];
      }
      return form.errors.add(attribute, ":too_long", $.extend(object_without_properties(this.options, $.FormCheck.Validations.LengthValidator.RESERVED_OPTIONS), {
        count: this.options["maximum"]
      }));
    }
  };

  $.FormCheck.Validations.LengthValidator.DEFAULT_TOKENIZER = function(value) {
    return value.split('');
  };
  $.FormCheck.Validations.LengthValidator.RESERVED_OPTIONS = ["minimum", "maximum", "is", "tokenizer", "too_long", "too_short"];
  $.FormCheck.Validations.LengthValidator.kind = "length";
  $.FormCheck.prototype.validates_length_of = function() {
    var attributes;
    var _a = arguments.length, _b = _a >= 1;
    attributes = __slice.call(arguments, 0, _a - 0);
    return this.validates_with($.FormCheck.Validations.LengthValidator, this.attributes_for_with(attributes));
  };
  $.FormCheck.Validations.NumericalityValidator = function() {
    return $.FormCheck.EachValidator.apply(this, arguments);
  };
  __extends($.FormCheck.Validations.NumericalityValidator, $.FormCheck.EachValidator);
  $.FormCheck.Validations.NumericalityValidator.prototype.validate_each = function(form, attribute, value) {
    var _a, _b, check, raw_value, val;
    raw_value = value;
    value = parseFloat(value);
    if (isNaN(value)) {
      form.errors.add(attribute, ":not_a_number", this.filtered_options(raw_value));
      return null;
    }
    if (this.options.only_integer && !(raw_value.match(/^\d+$/))) {
      form.errors.add(attribute, ":not_an_integer", this.filtered_options(raw_value));
      return null;
    } else {
      value = parseInt(value);
    }
    _a = []; _b = slice_object(this.options, extract_keys($.FormCheck.Validations.NumericalityValidator.CHECKS));
    for (check in _b) { if (__hasProp.call(_b, check)) {
      val = _b[check];
      _a.push((function() {
        if (check === "odd" || check === "even") {
          if (!($.FormCheck.Validations.NumericalityValidator.CHECKS[check](value))) {
            return form.errors.add(attribute, ":" + check, this.filtered_options(val));
          }
        } else {
          if (!($.FormCheck.Validations.NumericalityValidator.CHECKS[check](value, val))) {
            return form.errors.add(attribute, ":" + check, this.filtered_options(val));
          }
        }
      }).call(this));
    }}
    return _a;
  };
  $.FormCheck.Validations.NumericalityValidator.prototype.filtered_options = function(value) {
    return $.extend(object_without_properties(this.options, $.FormCheck.Validations.NumericalityValidator.RESERVED_OPTIONS), {
      count: value
    });
  };

  $.FormCheck.Validations.NumericalityValidator.CHECKS = {
    greater_than: function(a, b) {
      return a > b;
    },
    greater_than_or_equal_to: function(a, b) {
      return a >= b;
    },
    equal_to: function(a, b) {
      return a === b;
    },
    less_than: function(a, b) {
      return a < b;
    },
    less_than_or_equal_to: function(a, b) {
      return a <= b;
    },
    odd: function(n) {
      return (n % 2) === 1;
    },
    even: function(n) {
      return (n % 2) === 0;
    }
  };
  $.FormCheck.Validations.NumericalityValidator.RESERVED_OPTIONS = extract_keys($.FormCheck.Validations.NumericalityValidator.CHECKS).concat(["only_integer"]);
  $.FormCheck.Validations.NumericalityValidator.kind = "numericality";
  $.FormCheck.prototype.validates_numericality_of = function() {
    var attributes;
    var _a = arguments.length, _b = _a >= 1;
    attributes = __slice.call(arguments, 0, _a - 0);
    return this.validates_with($.FormCheck.Validations.NumericalityValidator, this.attributes_for_with(attributes));
  };
  $.FormCheck.Validations.PresenceValidator = function() {
    return $.FormCheck.EachValidator.apply(this, arguments);
  };
  __extends($.FormCheck.Validations.PresenceValidator, $.FormCheck.EachValidator);
  $.FormCheck.Validations.PresenceValidator.prototype.validate_each = function(form, attribute, value) {
    if (!(value.length > 0)) {
      return form.errors.add(attribute, ":blank", this.options);
    }
  };

  $.FormCheck.Validations.PresenceValidator.kind = 'presence';
  $.FormCheck.prototype.validates_presence_of = function() {
    var attributes;
    var _a = arguments.length, _b = _a >= 1;
    attributes = __slice.call(arguments, 0, _a - 0);
    return this.validates_with($.FormCheck.Validations.PresenceValidator, this.attributes_for_with(attributes));
  };
  $.FormCheck.prototype.validates = function() {
    var _c, _d, attributes, defaults, kind, options, validations, validator;
    var _a = arguments.length, _b = _a >= 1;
    attributes = __slice.call(arguments, 0, _a - 0);
    defaults = attributes.extract_options();
    validations = slice_object_and_remove(defaults, ["if", "unless", "allow_blank", "allow_nil"]);
    $.extend(defaults, {
      attributes: attributes
    });
    _c = []; _d = validations;
    for (kind in _d) { if (__hasProp.call(_d, kind)) {
      options = _d[kind];
      _c.push((function() {
        validator = $.FormCheck.find_validator(kind);
        return validator ? this.validates_with(validator, $.extend(defaults, $.FormCheck.parse_validates_options(options))) : null;
      }).call(this));
    }}
    return _c;
  };
  $.FormCheck.parse_validates_options = function(options) {
    var _a;
    if ($.isPlainObject) {
      return options;
    }
    if ($.isArray(options)) {
      return {
        "in": options
      };
    }
    if ((typeof (_a = options.test) !== "undefined" && _a !== null)) {
      return {
        "with": options
      };
    }
    return {};
  };
  return $.FormCheck.parse_validates_options;
})(jQuery);