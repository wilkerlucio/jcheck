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
	$.FormCheck.i18n = {
		default_language: "en"
		
		translate: (path, language) ->
			language ?= $.FormCheck.i18n.default_language
			steps: path.split(".")
			steps.unshift(language)
			
			$.FormCheck.i18n.translation_from_path(steps)
		
		translation_from_path: (steps) ->
			current: $.FormCheck.i18n.languages
			
			for step in steps
				current: current[step]
				return "" unless current?
				
			current
		
		languages: {
			en: {
				errors: {
					messages: {
						inclusion: "%{value} is not a valid option"
			      exclusion: "%{value} is reserved"
			      invalid: "is invalid"
			      confirmation: "doesn't match confirmation"
			      accepted: "must be accepted"
			      empty: "can't be empty"
			      blank: "can't be blank"
			      too_long: "is too long (maximum is %{count} characters)"
			      too_short: "is too short (minimum is %{count} characters)"
			      wrong_length: "is the wrong length (should be %{count} characters)"
			      not_a_number: "is not a number"
			      not_an_integer: "must be an integer"
			      greater_than: "must be greater than %{count}"
			      greater_than_or_equal_to: "must be greater than or equal to %{count}"
			      equal_to: "must be equal to %{count}"
			      less_than: "must be less than %{count}"
			      less_than_or_equal_to: "must be less than or equal to %{count}"
			      odd: "must be odd"
			      even: "must be even"
					}
				}
			}
		}
	}
)(jQuery)
