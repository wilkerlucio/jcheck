# Copyright (c) 2010 Wilker Lúcio <wilkerlucio@gmail.com>
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

(($) ->
  $.FormCheck.Validations = {}

  $.FormCheck.findValidator = (kind) ->
    for k, validator of $.FormCheck.Validations
      return validator if validator.kind == kind

    null

  class $.FormCheck.Validator
    constructor: (options) ->
      @options = options

    kind: ->
    validate: (form) ->

  class $.FormCheck.EachValidator extends $.FormCheck.Validator
    constructor: (options) ->
      @attributes = Array.wrap(deleteObjectProperty(options, "attributes"))
      options["allowBlank"] = true if options["allowNil"]
      options["allowNil"] = true if options["allowBlank"]
      super options
      @checkValitity()

    validate: (form) ->
      for attribute in @attributes
        value = form.field(attribute).value()
        continue if isBlank(value) and @options["allowBlank"]
        @validateEach(form, attribute, value)

    validateEach: (record, attribute, value) ->
    checkValitity: ->

  # core engine for class validators
  $.FormCheck::validatesWith = (validators..., options) ->
    for validatorKlass in validators
      validator = new validatorKlass(options)
      @validate (form) -> validator.validate(form)

  $.FormCheck::attributesForWith = (attributes) ->
    options = attributes.extractOptions()
    $.extend(options, {attributes: attributes})

  # create validator helper
  $.FormCheck.Validator.create = (name, object = {}, base = $.FormCheck.EachValidator) ->
    object = $.extend({
      initializer: -> base::constructor.apply(this, arguments),
      baseClass: base
    }, object || {})

    className = name.camelize() + "Validator"
    class validator extends base
      constructor: -> @initializer.apply(this, arguments)

    $.extend(validator.prototype, object)

    validator.kind = name

    $.FormCheck.Validations[className] = validator

    # TODO: fix it
    $.FormCheck.prototype["validates#{name.camelize()}Of"] = (attributes...) ->
      @validatesWith(validator, @attributesForWith(attributes))

    validator

  ##################################
  # block validator
  ##################################
  class $.FormCheck.Validations.BlockValidator extends $.FormCheck.EachValidator
    constructor: (options) ->
      @callback = deleteObjectProperty(options, 'callback') || $.noop
      super options

    validateEach: (form, attribute, value) ->
      @callback.call(this, form, attribute, value)

  $.FormCheck::validatesEach = (attributes...) ->
    options = @attributesForWith(attributes)

    if $.isFunction(options.attributes[options.attributes.length - 1])
      options.callback = attributes.pop()

    @validatesWith($.FormCheck.Validations.BlockValidator, options)

  ##################################
  # acceptance validator
  ##################################
  $.FormCheck.Validator.create "acceptance",
    initializer: (options) ->
      @baseClass::constructor.call(this, $.extend({accept: '1'}, options))

    validateEach: (form, attribute, value) ->
      form.errors.add(attribute, ":accepted", objectWithoutProperties(@options, ['accept', 'allowNil'])) unless value == @options.accept

  ##################################
  # confirmation validator
  ##################################
  $.FormCheck.Validator.create "confirmation",
    validateEach: (form, attribute, value) ->
      confirmedFieldName = attribute + "_confirmation"
      confirmed = form.field(confirmedFieldName).value()
      form.errors.add(confirmedFieldName, ":confirmation", @options) unless value == confirmed

  ##################################
  # exclusion validator
  ##################################
  $.FormCheck.Validator.create "exclusion",
    validateEach: (form, attribute, value) ->
      form.errors.add(attribute, ":exclusion", $.extend(objectWithoutProperties(@options, ['in']), {value: value})) if $.inArray(value, @options["in"]) > -1

  ##################################
  # format validator
  ##################################
  $.FormCheck.Validator.create "format",
    initializer: (options) ->
      for opt in ["with", "without"]
        options[opt] = $.FormCheck.Validations.FormatValidator.FORMATS[options[opt]] if options[opt]? and $.isString(options[opt])

      @baseClass::constructor.call(this, options)

    validateEach: (form, attribute, value) ->
      if @options["with"] and !((value + "").match(@options["with"]))
        form.errors.add(attribute, ":invalid", $.extend(objectWithoutProperties(@options, ['with']), {value: value}))
      if @options["without"] and (value + "").match(@options["without"])
        form.errors.add(attribute, ":invalid", $.extend(objectWithoutProperties(@options, ['without']), {value: value}))

  $.FormCheck.Validations.FormatValidator.FORMATS =
    email: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i
    url: /^[A-Za-z]+:\/\/[A-Za-z0-9-_]+(\.[a-zA-Z0-9]+)+(:\d+)?[A-Za-z0-9-_%&\?\/.=]+$/

  ##################################
  # inclusion validator
  ##################################
  $.FormCheck.Validator.create "inclusion",
    validateEach: (form, attribute, value) ->
      form.errors.add(attribute, ":inclusion", $.extend(objectWithoutProperties(@options, ['in']), {value: value})) if $.inArray(value, @options["in"]) == -1

  ##################################
  # length validator
  ##################################
  $.FormCheck.Validator.create "length",
    initializer: (options) ->
      @baseClass::.constructor.call(this, $.extend({tokenizer: $.FormCheck.Validations.LengthValidator.DEFAULT_TOKENIZER}, options))

    validateEach: (form, attribute, value) ->
      value = @options.tokenizer(value) if $.isString(value)

      if @options["is"] and @options["is"] != value.length
        @options["message"] ?= @options["wrongLength"] if @options["wrongLength"]?
        form.errors.add(attribute, ":wrong_length", $.extend(objectWithoutProperties(@options, $.FormCheck.Validations.LengthValidator.RESERVED_OPTIONS), {count: @options["is"]}))

      if @options["minimum"] and @options["minimum"] > value.length
        @options["message"] ?= @options["tooShort"] if @options["tooShort"]?
        form.errors.add(attribute, ":too_short", $.extend(objectWithoutProperties(@options, $.FormCheck.Validations.LengthValidator.RESERVED_OPTIONS), {count: @options["minimum"]}))

      if @options["maximum"] and @options["maximum"] < value.length
        @options["message"] ?= @options["tooLong"] if @options["tooLong"]?
        form.errors.add(attribute, ":too_long", $.extend(objectWithoutProperties(@options, $.FormCheck.Validations.LengthValidator.RESERVED_OPTIONS), {count: @options["maximum"]}))

  $.FormCheck.Validations.LengthValidator.DEFAULT_TOKENIZER = (value) -> value.split ''
  $.FormCheck.Validations.LengthValidator.RESERVED_OPTIONS = ["minimum", "maximum", "is", "tokenizer", "tooLong", "tooShort"]

  ##################################
  # numericality validator
  ##################################
  $.FormCheck.Validator.create "numericality",
    validateEach: (form, attribute, value) ->
      rawValue = value
      value = parseFloat(value)

      if isNaN(value) or !(rawValue.match(/\d+$/))
        form.errors.add(attribute, ":not_a_number", @filteredOptions(rawValue))
        return

      if @options.onlyInteger and !(rawValue.match(/^[-]?\d+$/))
        form.errors.add(attribute, ":not_an_integer", @filteredOptions(rawValue))
        return
      else
        value = parseInt(value)

      for check, val of sliceObject(@options, extractKeys($.FormCheck.Validations.NumericalityValidator.CHECKS))
        switch check
          when "odd", "even"
            form.errors.add(attribute, ":" + check, @filteredOptions(val)) unless $.FormCheck.Validations.NumericalityValidator.CHECKS[check](value)
          else
            form.errors.add(attribute, ":" + check.snakeCase(), @filteredOptions(val)) unless $.FormCheck.Validations.NumericalityValidator.CHECKS[check](value, val)

    filteredOptions: (value) ->
      $.extend(objectWithoutProperties(@options, $.FormCheck.Validations.NumericalityValidator.RESERVED_OPTIONS), {count: value})

  $.FormCheck.Validations.NumericalityValidator.CHECKS = {
    greaterThan:          (a, b) -> a > b
    greaterThanOrEqualTo: (a, b) -> a >= b
    equalTo:              (a, b) -> a == b
    lessThan:             (a, b) -> a < b
    lessThanOrEqualTo:    (a, b) -> a <= b
    odd:                  (n) -> (n % 2) == 1
    even:                 (n) -> (n % 2) == 0
  }

  $.FormCheck.Validations.NumericalityValidator.RESERVED_OPTIONS = extractKeys($.FormCheck.Validations.NumericalityValidator.CHECKS).concat(["onlyInteger"])

  ##################################
  # presence validator
  ##################################
  $.FormCheck.Validator.create "presence",
    validateEach: (form, attribute, value) ->
      form.errors.add(attribute, ":blank", @options) if isBlank(value)

  ##################################
  # validates
  ##################################
  $.FormCheck::validates = (attributes...) ->
    defaults = attributes.extractOptions()
    validations = sliceObjectAndRemove(defaults, ["if", "unless", "allowBlank", "allowNil"])
    $.extend defaults, {attributes: attributes}

    for kind, options of validations
      validator = $.FormCheck.findValidator(kind)
      currentOptions = $.extend({}, defaults)

      if validator
        @validatesWith(validator, $.extend(currentOptions, $.FormCheck.parseValidatesOptions(options)))

  $.FormCheck.parseValidatesOptions = (options) ->
    return {"in": options} if $.isArray(options)
    return {"with": options} if options.test?
    return {} if options == true
    return options if $.isPlainObject

    {}
)(jQuery)
