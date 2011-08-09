var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
}, __slice = Array.prototype.slice;
(function($) {
  $.FormCheck.Validations = {};
  $.FormCheck.find_validator = function(kind) {
    var k, validator, _ref;
    _ref = $.FormCheck.Validations;
    for (k in _ref) {
      validator = _ref[k];
      if (validator.kind === kind) {
        return validator;
      }
    }
    return null;
  };
  $.FormCheck.Validator = (function() {
    function Validator(options) {
      this.options = options;
    }
    Validator.prototype.kind = function() {};
    Validator.prototype.validate = function(form) {};
    return Validator;
  })();
  $.FormCheck.EachValidator = (function() {
    function EachValidator(options) {
      this.attributes = Array.wrap(delete_object_property(options, "attributes"));
      if (options["allow_nil"]) {
        options["allow_blank"] = true;
      }
      if (options["allow_blank"]) {
        options["allow_nil"] = true;
      }
      EachValidator.__super__.constructor.call(this, options);
      this.check_valitity();
    }
    __extends(EachValidator, $.FormCheck.Validator);
    EachValidator.prototype.validate = function(form) {
      var attribute, value, _i, _len, _ref, _results;
      _ref = this.attributes;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        attribute = _ref[_i];
        value = form.field(attribute).value();
        if (is_blank(value) && this.options["allow_blank"]) {
          continue;
        }
        _results.push(this.validate_each(form, attribute, value));
      }
      return _results;
    };
    EachValidator.prototype.validate_each = function(record, attribute, value) {};
    EachValidator.prototype.check_valitity = function() {};
    return EachValidator;
  })();
  $.FormCheck.prototype.validates_with = function() {
    var options, validator, validator_klass, validators, _i, _j, _len, _results;
    validators = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), options = arguments[_i++];
    _results = [];
    for (_j = 0, _len = validators.length; _j < _len; _j++) {
      validator_klass = validators[_j];
      validator = new validator_klass(options);
      _results.push(this.validate(function(form) {
        return validator.validate(form);
      }));
    }
    return _results;
  };
  $.FormCheck.prototype.attributes_for_with = function(attributes) {
    var options;
    options = attributes.extract_options();
    return $.extend(options, {
      attributes: attributes
    });
  };
  $.FormCheck.Validator.create = function(name, object, base) {
    var class_name, validator;
    object = $.extend({
      constructor: function() {}
    }, object || {});
        if (base != null) {
      base;
    } else {
      base = $.FormCheck.EachValidator;
    };
    class_name = name.camelize() + "Validator";
    validator = (function() {
      function validator() {
        validator.__super__.constructor.apply(this, arguments);
        this.constructor.apply(this, arguments);
      }
      __extends(validator, base);
      return validator;
    })();
    $.extend(validator.prototype, object);
    validator.kind = name;
    $.FormCheck.Validations[class_name] = validator;
    $.FormCheck.prototype["validates_" + name + "_of"] = function() {
      var attributes;
      attributes = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.validates_with(validator, this.attributes_for_with(attributes));
    };
    return validator;
  };
  $.FormCheck.Validations.BlockValidator = (function() {
    function BlockValidator(options) {
      this.callback = delete_object_property(options, 'callback') || $.noop;
      BlockValidator.__super__.constructor.call(this, options);
    }
    __extends(BlockValidator, $.FormCheck.EachValidator);
    BlockValidator.prototype.validate_each = function(form, attribute, value) {
      return this.callback.call(this, form, attribute, value);
    };
    return BlockValidator;
  })();
  $.FormCheck.prototype.validates_each = function() {
    var attributes, options;
    attributes = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    options = this.attributes_for_with(attributes);
    if ($.isFunction(options.attributes[options.attributes.length - 1])) {
      options.callback = attributes.pop();
    }
    return this.validates_with($.FormCheck.Validations.BlockValidator, options);
  };
  $.FormCheck.Validations.AcceptanceValidator = (function() {
    function AcceptanceValidator(options) {
      AcceptanceValidator.__super__.constructor.call(this, $.extend({
        accept: '1'
      }, options));
    }
    __extends(AcceptanceValidator, $.FormCheck.EachValidator);
    AcceptanceValidator.prototype.validate_each = function(form, attribute, value) {
      if (value !== this.options.accept) {
        return form.errors.add(attribute, ":accepted", object_without_properties(this.options, ['accept', 'allow_nil']));
      }
    };
    return AcceptanceValidator;
  })();
  $.FormCheck.Validations.AcceptanceValidator.kind = "acceptance";
  $.FormCheck.prototype.validates_acceptance_of = function() {
    var attributes;
    attributes = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return this.validates_with($.FormCheck.Validations.AcceptanceValidator, this.attributes_for_with(attributes));
  };
  $.FormCheck.Validations.ConfirmationValidator = (function() {
    function ConfirmationValidator() {
      ConfirmationValidator.__super__.constructor.apply(this, arguments);
    }
    __extends(ConfirmationValidator, $.FormCheck.EachValidator);
    ConfirmationValidator.prototype.validate_each = function(form, attribute, value) {
      var confirmed, confirmed_field_name;
      confirmed_field_name = attribute + "_confirmation";
      confirmed = form.field(confirmed_field_name).value();
      if (value !== confirmed) {
        return form.errors.add(confirmed_field_name, ":confirmation", this.options);
      }
    };
    return ConfirmationValidator;
  })();
  $.FormCheck.Validations.ConfirmationValidator.kind = "confirmation";
  $.FormCheck.prototype.validates_confirmation_of = function() {
    var attributes;
    attributes = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return this.validates_with($.FormCheck.Validations.ConfirmationValidator, this.attributes_for_with(attributes));
  };
  $.FormCheck.Validations.ExclusionValidator = (function() {
    function ExclusionValidator() {
      ExclusionValidator.__super__.constructor.apply(this, arguments);
    }
    __extends(ExclusionValidator, $.FormCheck.EachValidator);
    ExclusionValidator.prototype.validate_each = function(form, attribute, value) {
      if ($.inArray(value, this.options["in"]) > -1) {
        return form.errors.add(attribute, ":exclusion", $.extend(object_without_properties(this.options, ['in']), {
          value: value
        }));
      }
    };
    return ExclusionValidator;
  })();
  $.FormCheck.Validations.ExclusionValidator.kind = "exclusion";
  $.FormCheck.prototype.validates_exclusion_of = function() {
    var attributes;
    attributes = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return this.validates_with($.FormCheck.Validations.ExclusionValidator, this.attributes_for_with(attributes));
  };
  $.FormCheck.Validations.FormatValidator = (function() {
    function FormatValidator(options) {
      var opt, _i, _len, _ref;
      _ref = ["with", "without"];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        opt = _ref[_i];
        if ((options[opt] != null) && $.isString(options[opt])) {
          options[opt] = $.FormCheck.Validations.FormatValidator.FORMATS[options[opt]];
        }
      }
      FormatValidator.__super__.constructor.call(this, options);
    }
    __extends(FormatValidator, $.FormCheck.EachValidator);
    FormatValidator.prototype.validate_each = function(form, attribute, value) {
      if (this.options["with"] && !((value + "").match(this.options["with"]))) {
        form.errors.add(attribute, ":invalid", $.extend(object_without_properties(this.options, ['with']), {
          value: value
        }));
      }
      if (this.options["without"] && (value + "").match(this.options["without"])) {
        return form.errors.add(attribute, ":invalid", $.extend(object_without_properties(this.options, ['without']), {
          value: value
        }));
      }
    };
    return FormatValidator;
  })();
  $.FormCheck.Validations.FormatValidator.FORMATS = {
    email: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
    url: /^[A-Za-z]+:\/\/[A-Za-z0-9-_]+(\.[a-zA-Z0-9]+)+(:\d+)?[A-Za-z0-9-_%&\?\/.=]+$/
  };
  $.FormCheck.Validations.FormatValidator.kind = "format";
  $.FormCheck.prototype.validates_format_of = function() {
    var attributes;
    attributes = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return this.validates_with($.FormCheck.Validations.FormatValidator, this.attributes_for_with(attributes));
  };
  $.FormCheck.Validations.InclusionValidator = (function() {
    function InclusionValidator() {
      InclusionValidator.__super__.constructor.apply(this, arguments);
    }
    __extends(InclusionValidator, $.FormCheck.EachValidator);
    InclusionValidator.prototype.validate_each = function(form, attribute, value) {
      if ($.inArray(value, this.options["in"]) === -1) {
        return form.errors.add(attribute, ":inclusion", $.extend(object_without_properties(this.options, ['in']), {
          value: value
        }));
      }
    };
    return InclusionValidator;
  })();
  $.FormCheck.Validations.InclusionValidator.kind = "inclusion";
  $.FormCheck.prototype.validates_inclusion_of = function() {
    var attributes;
    attributes = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return this.validates_with($.FormCheck.Validations.InclusionValidator, this.attributes_for_with(attributes));
  };
  $.FormCheck.Validations.LengthValidator = (function() {
    function LengthValidator(options) {
      LengthValidator.__super__.constructor.call(this, $.extend({
        tokenizer: $.FormCheck.Validations.LengthValidator.DEFAULT_TOKENIZER
      }, options));
    }
    __extends(LengthValidator, $.FormCheck.EachValidator);
    LengthValidator.prototype.validate_each = function(form, attribute, value) {
      var _base, _base2, _base3, _ref, _ref2, _ref3;
      if ($.isString(value)) {
        value = this.options.tokenizer(value);
      }
      if (this.options["is"] && this.options["is"] !== value.length) {
        if (this.options["wrong_length"] != null) {
                    if ((_ref = (_base = this.options)["message"]) != null) {
            _ref;
          } else {
            _base["message"] = this.options["wrong_length"];
          };
        }
        form.errors.add(attribute, ":wrong_length", $.extend(object_without_properties(this.options, $.FormCheck.Validations.LengthValidator.RESERVED_OPTIONS), {
          count: this.options["is"]
        }));
      }
      if (this.options["minimum"] && this.options["minimum"] > value.length) {
        if (this.options["too_short"] != null) {
                    if ((_ref2 = (_base2 = this.options)["message"]) != null) {
            _ref2;
          } else {
            _base2["message"] = this.options["too_short"];
          };
        }
        form.errors.add(attribute, ":too_short", $.extend(object_without_properties(this.options, $.FormCheck.Validations.LengthValidator.RESERVED_OPTIONS), {
          count: this.options["minimum"]
        }));
      }
      if (this.options["maximum"] && this.options["maximum"] < value.length) {
        if (this.options["too_long"] != null) {
                    if ((_ref3 = (_base3 = this.options)["message"]) != null) {
            _ref3;
          } else {
            _base3["message"] = this.options["too_long"];
          };
        }
        return form.errors.add(attribute, ":too_long", $.extend(object_without_properties(this.options, $.FormCheck.Validations.LengthValidator.RESERVED_OPTIONS), {
          count: this.options["maximum"]
        }));
      }
    };
    return LengthValidator;
  })();
  $.FormCheck.Validations.LengthValidator.DEFAULT_TOKENIZER = function(value) {
    return value.split('');
  };
  $.FormCheck.Validations.LengthValidator.RESERVED_OPTIONS = ["minimum", "maximum", "is", "tokenizer", "too_long", "too_short"];
  $.FormCheck.Validations.LengthValidator.kind = "length";
  $.FormCheck.prototype.validates_length_of = function() {
    var attributes;
    attributes = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return this.validates_with($.FormCheck.Validations.LengthValidator, this.attributes_for_with(attributes));
  };
  $.FormCheck.Validations.NumericalityValidator = (function() {
    function NumericalityValidator() {
      NumericalityValidator.__super__.constructor.apply(this, arguments);
    }
    __extends(NumericalityValidator, $.FormCheck.EachValidator);
    NumericalityValidator.prototype.validate_each = function(form, attribute, value) {
      var check, raw_value, val, _ref, _results;
      raw_value = value;
      value = parseFloat(value);
      if (isNaN(value) || !(raw_value.match(/\d+$/))) {
        form.errors.add(attribute, ":not_a_number", this.filtered_options(raw_value));
        return;
      }
      if (this.options.only_integer && !(raw_value.match(/^[-]?\d+$/))) {
        form.errors.add(attribute, ":not_an_integer", this.filtered_options(raw_value));
        return;
      } else {
        value = parseInt(value);
      }
      _ref = slice_object(this.options, extract_keys($.FormCheck.Validations.NumericalityValidator.CHECKS));
      _results = [];
      for (check in _ref) {
        val = _ref[check];
        _results.push((function() {
          switch (check) {
            case "odd":
            case "even":
              if (!$.FormCheck.Validations.NumericalityValidator.CHECKS[check](value)) {
                return form.errors.add(attribute, ":" + check, this.filtered_options(val));
              }
              break;
            default:
              if (!$.FormCheck.Validations.NumericalityValidator.CHECKS[check](value, val)) {
                return form.errors.add(attribute, ":" + check, this.filtered_options(val));
              }
          }
        }).call(this));
      }
      return _results;
    };
    NumericalityValidator.prototype.filtered_options = function(value) {
      return $.extend(object_without_properties(this.options, $.FormCheck.Validations.NumericalityValidator.RESERVED_OPTIONS), {
        count: value
      });
    };
    return NumericalityValidator;
  })();
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
    attributes = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return this.validates_with($.FormCheck.Validations.NumericalityValidator, this.attributes_for_with(attributes));
  };
  $.FormCheck.Validations.PresenceValidator = (function() {
    function PresenceValidator() {
      PresenceValidator.__super__.constructor.apply(this, arguments);
    }
    __extends(PresenceValidator, $.FormCheck.EachValidator);
    PresenceValidator.prototype.validate_each = function(form, attribute, value) {
      if (is_blank(value)) {
        return form.errors.add(attribute, ":blank", this.options);
      }
    };
    return PresenceValidator;
  })();
  $.FormCheck.Validations.PresenceValidator.kind = 'presence';
  $.FormCheck.prototype.validates_presence_of = function() {
    var attributes;
    attributes = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return this.validates_with($.FormCheck.Validations.PresenceValidator, this.attributes_for_with(attributes));
  };
  $.FormCheck.prototype.validates = function() {
    var attributes, current_options, defaults, kind, options, validations, validator, _results;
    attributes = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    defaults = attributes.extract_options();
    validations = slice_object_and_remove(defaults, ["if", "unless", "allow_blank", "allow_nil"]);
    $.extend(defaults, {
      attributes: attributes
    });
    _results = [];
    for (kind in validations) {
      options = validations[kind];
      validator = $.FormCheck.find_validator(kind);
      current_options = $.extend({}, defaults);
      _results.push(validator ? this.validates_with(validator, $.extend(current_options, $.FormCheck.parse_validates_options(options))) : void 0);
    }
    return _results;
  };
  return $.FormCheck.parse_validates_options = function(options) {
    if ($.isArray(options)) {
      return {
        "in": options
      };
    }
    if (options.test != null) {
      return {
        "with": options
      };
    }
    if (options === true) {
      return {};
    }
    if ($.isPlainObject) {
      return options;
    }
    return {};
  };
})(jQuery);