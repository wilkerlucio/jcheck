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
	$.FormCheck.Validations: {}
	
	$.FormCheck.find_validator: (kind) ->
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
			@attributes = Array.wrap(delete_object_property(options, "attributes"))
			options["allow_blank"]: true if options["allow_nil"]
			options["allow_nil"]: true if options["allow_blank"]
			super options
			@check_valitity()
		
		validate: (form) ->
			for attribute in @attributes
				value = form.field(attribute).value()
				continue if is_blank(value) and @options["allow_blank"]
				@validate_each(form, attribute, value)
		
		validate_each: (record, attribute, value) ->
		check_valitity: ->
	
	# core engine for class validators
	$.FormCheck::validates_with: (validators..., options) ->
		for validator_klass in validators
			validator: new validator_klass(options)
			@validate (form) -> validator.validate(form)
	
	$.FormCheck::attributes_for_with: (attributes) ->
		options: attributes.extract_options()
		$.extend(options, {attributes: attributes})
	
	##################################
	# acceptance validator
	##################################
	class $.FormCheck.Validations.AcceptanceValidator extends $.FormCheck.EachValidator
		constructor: (options) ->
			super $.extend({allow_nil: true, accept: '1'}, options)
		
		validate_each: (form, attribute, value) ->
			form.erros.add(attribute, ":accepted", object_without_properties(@options, ['accept', 'allow_nil']))
	
	$.FormCheck.Validations.AcceptanceValidator.kind: "acceptance"
	
	$.FormCheck::validates_acceptance_of: (attributes...) ->
		@validates_with($.FormCheck.Validations.AcceptanceValidator, @attributes_for_with(attributes))
	
	##################################
	# confirmation validator
	##################################
	class $.FormCheck.Validations.ConfirmationValidator extends $.FormCheck.EachValidator
		validate_each: (form, attribute, value) ->
			confirmed: form.field(attribute + "_confirmation").value()
			form.errors.add(attribute, ":confirmation", @options)
	
	$.FormCheck.Validations.ConfirmationValidator.kind: "confirmation"
	
	$.FormCheck::validates_confirmation_of: (attributes...) ->
		@validates_with($.FormCheck.Validations.ConfirmationValidator, @attributes_for_with(attributes))
	
	##################################
	# exclusion validator
	##################################
	class $.FormCheck.Validations.ExclusionValidator extends $.FormCheck.EachValidator
		validate_each: (form, attribute, value) ->
			form.errors.add(attribute, ":exclusion", $.extend(object_without_properties(@options, ['in']), {value: value})) if $.inArray(value, @options["in"]) > -1
	
	$.FormCheck.Validations.ExclusionValidator.kind: "exclusion"
	
	$.FormCheck::validates_exclusion_of: (attributes...) ->
		@validates_with($.FormCheck.Validations.ExclusionValidator, @attributes_for_with(attributes))
	
	##################################
	# format validator
	##################################
	class $.FormCheck.Validations.FormatValidator extends $.FormCheck.EachValidator
		constructor: (options) ->
			for opt in ["with", "without"]
				options[opt] = $.FormCheck.Validations.FormatValidator.FORMATS[options[opt]] if options[opt]? and $.isString(options[opt])
			
			super options
		
		validate_each: (form, attribute, value) ->
			if @options["with"] and !((value + "").match(@options["with"]))
				form.errors.add(attribute, ":invalid", $.extend(object_without_properties(@options, ['with']), {value: value}))
			if @options["without"] and (value + "").match(@options["without"])
				form.errors.add(attribute, ":invalid", $.extend(object_without_properties(@options, ['without']), {value: value}))
	
	$.FormCheck.Validations.FormatValidator.FORMATS: {
		email: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i
	}
	$.FormCheck.Validations.FormatValidator.kind: "format"
	
	$.FormCheck::validates_format_of: (attributes...) ->
		@validates_with($.FormCheck.Validations.FormatValidator, @attributes_for_with(attributes))
	
	##################################
	# inclusion validator
	##################################
	class $.FormCheck.Validations.InclusionValidator extends $.FormCheck.EachValidator
		validate_each: (form, attribute, value) ->
			form.errors.add(attribute, ":inclusion", $.extend(object_without_properties(@options, ['in']), {value: value})) if $.inArray(value, @options["in"]) == -1
		
	$.FormCheck.Validations.InclusionValidator.kind: "inclusion"
	
	$.FormCheck::validates_inclusion_of: (attributes...) ->
		@validates_with($.FormCheck.Validations.InclusionValidator, @attributes_for_with(attributes))
	
	##################################
	# length validator
	##################################
	class $.FormCheck.Validations.LengthValidator extends $.FormCheck.EachValidator
		constructor: (options) ->
			super $.extend({tokenizer: $.FormCheck.Validations.LengthValidator.DEFAULT_TOKENIZER}, options)
		
		validate_each: (form, attribute, value) ->
			value = @options.tokenizer(value) if $.isString(value)
			
			if @options["is"] and @options["is"] != value.length
				@options["message"] ?= @options["wrong_length"] if @options["wrong_length"]?
				form.errors.add(attribute, ":wrong_length", $.extend(object_without_properties(@options, $.FormCheck.Validations.LengthValidator.RESERVED_OPTIONS), {count: @options["is"]}))
			
			if @options["minimum"] and @options["minimum"] > value.length
				@options["message"] ?= @options["too_short"] if @options["too_short"]?
				form.errors.add(attribute, ":too_short", $.extend(object_without_properties(@options, $.FormCheck.Validations.LengthValidator.RESERVED_OPTIONS), {count: @options["minimum"]}))
			
			if @options["maximum"] and @options["maximum"] < value.length
				@options["message"] ?= @options["too_long"] if @options["too_long"]?
				form.errors.add(attribute, ":too_long", $.extend(object_without_properties(@options, $.FormCheck.Validations.LengthValidator.RESERVED_OPTIONS), {count: @options["maximum"]}))
	
	$.FormCheck.Validations.LengthValidator.DEFAULT_TOKENIZER: (value) -> value.split ''
	$.FormCheck.Validations.LengthValidator.RESERVED_OPTIONS: ["minimum", "maximum", "is", "tokenizer", "too_long", "too_short"]
	$.FormCheck.Validations.LengthValidator.kind: "length"
	
	$.FormCheck::validates_length_of: (attributes...) ->
		@validates_with($.FormCheck.Validations.LengthValidator, @attributes_for_with(attributes))
	
	##################################
	# numericality validator
	##################################
	class $.FormCheck.Validations.NumericalityValidator extends $.FormCheck.EachValidator
		validate_each: (form, attribute, value) ->
			raw_value: value
			value: parseFloat(value)
			
			if isNaN(value)
				form.errors.add(attribute, ":not_a_number", @filtered_options(raw_value))
				return
			
			if @options.only_integer and !(raw_value.match(/^\d+$/))
				form.errors.add(attribute, ":not_an_integer", @filtered_options(raw_value))
				return
			else
				value: parseInt(value)
			
			for check, val of slice_object(@options, extract_keys($.FormCheck.Validations.NumericalityValidator.CHECKS))
				switch check
					when "odd", "even"
						form.errors.add(attribute, ":" + check, @filtered_options(val)) unless $.FormCheck.Validations.NumericalityValidator.CHECKS[check](value)
					else
						form.errors.add(attribute, ":" + check, @filtered_options(val)) unless $.FormCheck.Validations.NumericalityValidator.CHECKS[check](value, val)
		
		filtered_options: (value) ->
			$.extend(object_without_properties(@options, $.FormCheck.Validations.NumericalityValidator.RESERVED_OPTIONS), {count: value})
	
	$.FormCheck.Validations.NumericalityValidator.CHECKS: {
		greater_than:             (a, b) -> a > b
		greater_than_or_equal_to: (a, b) -> a >= b
		equal_to:                 (a, b) -> a == b
		less_than:                (a, b) -> a < b
		less_than_or_equal_to:    (a, b) -> a <= b
		odd:                      (n) -> (n % 2) == 1
		even:                     (n) -> (n % 2) == 0
	}
	
	$.FormCheck.Validations.NumericalityValidator.RESERVED_OPTIONS: extract_keys($.FormCheck.Validations.NumericalityValidator.CHECKS).concat(["only_integer"])
	$.FormCheck.Validations.NumericalityValidator.kind: "numericality"
	
	$.FormCheck::validates_numericality_of: (attributes...) ->
		@validates_with($.FormCheck.Validations.NumericalityValidator, @attributes_for_with(attributes))
	
	##################################
	# presence validator
	##################################
	class $.FormCheck.Validations.PresenceValidator extends $.FormCheck.EachValidator
		validate_each: (form, attribute, value) ->
			form.errors.add(attribute, ":blank", @options) unless value.length > 0
	
	$.FormCheck.Validations.PresenceValidator.kind: 'presence'

	$.FormCheck::validates_presence_of: (attributes...) ->
		@validates_with($.FormCheck.Validations.PresenceValidator, @attributes_for_with(attributes))
	
	##################################
	# validates
	##################################
	$.FormCheck::validates: (attributes...) ->
		defaults: attributes.extract_options()
		validations: slice_object_and_remove(defaults, ["if", "unless", "allow_blank", "allow_nil"])
		$.extend defaults, {attributes: attributes}
		
		for kind, options of validations
			validator: $.FormCheck.find_validator(kind)
			
			if validator
				@validates_with(validator, $.extend(defaults, $.FormCheck.parse_validates_options(options)))
	
	$.FormCheck.parse_validates_options: (options) ->
		return {"in": options} if $.isArray(options)
		return {"with": options} if options.test?
		return options if $.isPlainObject
		
		{}
)(jQuery)