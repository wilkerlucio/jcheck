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
	class $.FormCheck.Errors
		constructor: (form) ->
			@form_checker: form
			@clear()
		
		clear: ->
			@errors = {}
		
		add: (field, message, options) ->
			options ?= {}
			message ?= ":invalid"
			
			@errors[field] ?= []
			
			message: options.message if options.message?
			message: @generate_message(message, options)
			message: message.simple_template_replace(options)
			
			@errors[field].push(message)
		
		attributes_with_errors: ->
			attributes: []
			
			for attribute, errors of @errors
				attributes.push(attribute) if errors.length > 0
			
			attributes
		
		on: (attribute) ->
			@errors[attribute] ?= []
			@errors[attribute]
		
		each: (fn) ->
			for attribute, errors of @errors
				for error in errors
					fn(attribute, error)
		
		size: ->
			sum: 0
			
			for attribute, messages of @errors
				sum += messages.length
			
			sum
		
		full_messages: ->
			messages: []
			
			@each (attribute, message) =>
				attribute: @form_checker.field(attribute).label()
				messages.push("${attribute} ${message}")
			
			messages
		
		generate_message: (message) ->
			if match: message.match /^:(.+)/
				$.FormCheck.i18n.translate("errors.messages.${match[1]}", @form_checker.options.language)
			else
				message
)(jQuery)