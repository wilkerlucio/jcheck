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
	class $.FormCheck
		constructor: (form, options) ->
			@form: form
			@options: $.extend({
				prevent_submit: true
				field_prefix: null
				notifiers: $.FormCheck.default_notifiers
				live_notifiers: $.FormCheck.default_live_notifiers
				language: $.FormCheck.default_locale
			}, options || {})
			
			@field_cache: {}
			@errors: new $.FormCheck.Errors(this)
			@validations: []
			@hook_events()
			@setup_notifiers()
		
		hook_events: ->
			@form.submit (e) =>
				unless @is_valid()
					e.preventDefault() if @options.prevent_submit
					notifier.notify() for notifier in @notifiers
			
			self: this
			
			@form.find(":input").each () ->
				name: self.parse_field_name($(this))
				
				if name
					field: self.field(name)
					
					if self.options.live_notifiers
						((el) ->
							n: name
							f: field
						
							el.focus (e) ->
								self.is_valid()
								self.dispatch_live_notifiers("focus", n, e, f.live_notifiers)
					
							el.blur (e) ->
								self.is_valid()
								self.dispatch_live_notifiers("blur", n, e, f.live_notifiers)
						)($(this))
					
		
		dispatch_live_notifiers: (callback, attribute, event, notifiers) ->
			current_notifiers: []
			
			for n in notifiers
				if n == ":parent"
					current_notifiers: current_notifiers.concat(@live_notifiers)
				else
					current_notifiers.push(@get_notifier(n))
			
			notifier[callback](attribute, event) for notifier in current_notifiers
		
		setup_notifiers: ->
			for type in ["notifiers", "live_notifiers"]
				this[type]: []
				this[type]: @get_notifier(kind) for kind in @options[type] if @options[type]
		
		get_notifier: (notifier) ->
			parameters: [this]
			
			if $.isArray(notifier)
				parameters: parameters.concat(notifier.slice(1))
				notifier: notifier[0]
			
			if $.isString(notifier)
				notifier_class: $.FormCheck.find_notifier(notifier)
					
				creator: ->
					notifier_class.apply(this, parameters)
				
				creator.prototype: notifier_class.prototype
				
				new creator()
			else
				notifier.form: this
				notifier
		
		validate: (validator) ->
			@validations.push(validator)
		
		field: (name) ->
			@field_cache[name] ?= new $.FormCheck.Field(this, @field_name(name), name)
			@field_cache[name]
		
		is_valid: ->
			@errors.clear()
			
			for validation in @validations
				validation(this)
			
			@errors.size() == 0
		
		parse_field_name: (input) ->
			name: input.attr("name")
			return null unless name
			
			@reverse_field_name(name)
		
		reverse_field_name: (name) ->
			if @options.field_prefix
				if matches = name.match(new RegExp("${@options.field_prefix}\\[(.+?)\\](.*)"))
					name: matches[1] + (matches[2] || "")
				else
					name: ":" + name
			
			name
		
		field_name: (name) ->
			return matches[1] if matches = name.match(/^:(.+)/)
			
			if @options.field_prefix
				subparts: ""
				if matches: name.match(/(.+?)(\[.+)$/)
					name: matches[1]
					subparts: matches[2]
				
				"${@options.field_prefix}[${name}]${subparts}"
			else
				name
	
	$.FormCheck.default_locale: "en"
	$.FormCheck.default_notifiers: ["notification_dialog"]
	$.FormCheck.default_live_notifiers: ["tip_balloons"]
	
	class $.FormCheck.Field
		constructor: (form, name, attribute) ->
			@form_checker: form
			@field_name: name
			@attribute: attribute
			@live_notifiers: [":parent"]
			@element: @form_checker.form.find(":input[name='${name}']")
			@custom_label: null
			
			if @form_checker.options.live_notifiers
				for evt in @events_for_element()
					@element[evt] (e) =>
						@form_checker.is_valid()
						@form_checker.dispatch_live_notifiers("notify", @attribute, e, @live_notifiers)
		
		events_for_element: ->
			if @element.attr("type") == "radio" or @element.attr("type") == "checkbox"
				return ["change"]
			if @element[0].tagName.toLowerCase() == "select"
				return ["keyup", "change"]
			
			["keyup"]
		
		value: ->
			if @element.attr("type") == "radio"
				return @value_for_radio()
			if @element.attr("type") == "checkbox"
				return @value_for_checkbox()
			
			@value_for_text()
		
		value_for_text: ->
			@element.val() || ""
		
		value_for_radio: ->
			@element.filter(":checked").val() || ""
		
		value_for_checkbox: ->
			if @element.length > 1
				$.makeArray(@element.filter(":checked").map -> $(this).val())
			else
				if @element[0].checked then @element.val() else ""
		
		label: ->
			unless @custom_label == null
				if $.isFunction(@custom_label)
				  return @custom_label.call(this)
				else
					return @custom_label
			
			field_id: @element.attr("id")
			
			if @element.length > 1
				field_id: matches[1] if matches = field_id.match(/(.+)_.+$/)
			
			label_element: @form_checker.form.find("label[for='${field_id}']")
			
			if label_element.length > 0
				label_element.text()
			else
				@field_name
	
	# jquery hook
	$.fn.jcheck: (options) ->
		new $.FormCheck($(this), options || {})
)(jQuery)
