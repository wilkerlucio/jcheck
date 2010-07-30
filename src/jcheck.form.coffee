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
				notifiers: ["notification_dialog"]
				language: 'en'
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
					notifier.notify(this) for notifier in @notifiers
		
		setup_notifiers: ->
			@notifiers = new ($.FormCheck.find_notifier(kind))() for kind in @options.notifiers
		
		validate: (validator) ->
			@validations.push(validator)
		
		field: (name) ->
			@field_cache[name] ?= new $.FormCheck.Field(this, @field_name(name))
			@field_cache[name]
		
		is_valid: ->
			@errors.clear()
			
			for validation in @validations
				validation(this)
			
			@errors.size() == 0
		
		field_name: (name) ->
			if @options.field_prefix
				"${@options.field_prefix}[${name}]"
			else
				name
	
	class $.FormCheck.Field
		constructor: (form, name) ->
			@form_checker: form
			@field_name: name
			@element: @form_checker.form.find("*[name='${name}']")
		
		value: ->
			@element.val()
		
		label: ->
			field_id: @element.attr("id")
			label_element: @form_checker.form.find("label[for='${field_id}']")
			
			if label_element.length > 0
				label_element.text()
			else
				@field_name
	
	# jquery hook
	$.fn.jcheck: (options) ->
		new $.FormCheck($(this), options || {})
)(jQuery)
