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
	$.FormCheck.Notifiers = {}
	
	$.FormCheck.Notifiers.create = (name, object, base) ->
		object = $.extend({
			constructor: ->
			focus: -> this.notify.apply(this, arguments)
			blur: -> 
			notify: ->
		}, object || {})
		
		base ?= $.FormCheck.Notifiers.Base
		class_name = name.camelize() + "Notifier"
		
		class notifier extends base
			constructor: -> super; @constructor.apply(this, arguments)
		
		$.extend(notifier.prototype, object)
		
		notifier.kind = name
		
		$.FormCheck.Notifiers[class_name] = notifier
		
		notifier
	
	$.FormCheck.find_notifier = (kind) ->
		for name, notifier of $.FormCheck.Notifiers
			return notifier if notifier.kind == kind
	
	class $.FormCheck.Notifiers.Base
		constructor: (form) ->
			@form = form
		
		focus: (attribute) ->
		notify: (attribute) ->
		blur: (attribute) ->
	
	class $.FormCheck.Notifiers.DialogBase extends $.FormCheck.Notifiers.Base
		populate_dialog: (dialog, messages) ->
			html = "<ul>"
			for m in messages
				html += "<li>* #{m}</li>"
			html += "</ul>"
			
			dialog.html(html)
	
	class $.FormCheck.Notifiers.NotificationDialog extends $.FormCheck.Notifiers.DialogBase
		constructor: (form, options) ->
			super form
			@options = $.extend({
				autoclose_in: 4000
			}, options || {})
		
		notify: () ->
			dialog = @generate_dialog()
			dialog.css({left: "-1000px"})
			@populate_dialog(dialog, @form.errors.full_messages())
			dialog.css({"margin-top": "-#{dialog.outerHeight() + 10}px", left: "50%", "margin-left": "-#{Math.round(dialog.outerWidth() / 2)}px"})
			dialog.show()
			dialog.animate({"margin-top": "0px"})
			dialog.mouseout()
		
		close_dialog: ->
			@current_dialog.animate({"margin-top": "-#{@current_dialog.outerHeight() + 10}px"}, { complete: -> $(this).hide() })
		
		generate_dialog: () ->
			clearTimeout($.FormCheck.Notifiers.NotificationDialog.dialog_timer) if $.FormCheck.Notifiers.NotificationDialog.dialog_timer
			dialog_id = "jcheck-error-dialog"
			
			$("##{dialog_id}").remove()
			
			dialog = $(document.createElement("div"))
			dialog.attr("id", dialog_id)
			
			@current_dialog = dialog
			
			dialog.addClass("ie-fixed") if $.browser.msie and parseInt($.browser.version) < 7
			
			dialog.click =>
				@close_dialog()
			
			if @options.autoclose_in
				dialog.mouseover =>
					clearTimeout($.FormCheck.Notifiers.NotificationDialog.dialog_timer) if $.FormCheck.Notifiers.NotificationDialog.dialog_timer
			
				dialog.mouseout =>
					self = this
					callback = () ->
						self.close_dialog()
					$.FormCheck.Notifiers.NotificationDialog.dialog_timer = setTimeout(callback, @options.autoclose_in)
			
			$(document.body).append(dialog)
			
			dialog
	
	$.FormCheck.Notifiers.NotificationDialog.dialog_timer = 0
	$.FormCheck.Notifiers.NotificationDialog.kind = "notification_dialog"
	
	class $.FormCheck.Notifiers.TipBalloons extends $.FormCheck.Notifiers.DialogBase
		constructor: (form) ->
			super form
			@balloons = {}
		
		focus: (attribute, evt) ->
			@notify(attribute, evt || null)
		
		notify: (attribute, evt) ->
			dialog = @dialog_for_attribute(attribute)
			messages = @form.errors.on(attribute)
			
			return if messages.isEqual(dialog.messages)
			
			element = if evt and evt.target then $(evt.target) else @form.element
			offset = element.offset()
			
			populate_and_reposition = (messages) =>
				@populate_dialog(dialog, messages)
				dialog.css({top: "#{offset.top - dialog.outerHeight()}px", left: "#{offset.left + Math.round(element.outerWidth() * 0.9)}px"})
			
			if messages.length > 0
				if dialog.messages and dialog.messages.length > 0
					populate_and_reposition(messages)
				else
					dialog.css({left: "-1000px", top: "-1000px"})
					dialog.hide()
				
					populate_and_reposition(messages)
					
					dialog.fadeIn("fast")
			else
				@close_dialog(attribute)
			
			dialog.messages = messages
		
		blur: (attribute) ->
			@close_dialog(attribute)
		
		dialog_for_attribute: (attribute) ->
			@balloons[attribute] = @generate_dialog() unless @balloons[attribute]
			@balloons[attribute]
		
		close_dialog: (attribute) ->
			dialog = @dialog_for_attribute(attribute)
			dialog.messages = null
			dialog.fadeOut("fast")
		
		generate_dialog: () ->
			dialog = null
			
			dialog = $(document.createElement("div"))
			dialog.addClass("jcheck-inline-balloon-tip")
			dialog.css({position: "absolute", top: "-1000px", left: "-1000px"})
			
			content_area = $(document.createElement("div"))
			content_area.addClass("content")
			dialog.append(content_area)
			
			arrow = @generate_arrow()
			dialog.append(arrow)
			
			$(document.body).append(dialog)
			
			dialog
		
		generate_arrow: () ->
			i = 10
			container = $(document.createElement("div"))
			container.addClass("arrow-container")
			center = i / 2
			max_width = null
			
			while i > 0
				x = i * 2 - center
				x = center + x - 1 if x < 0
				
				line = $(document.createElement("div"))
				line.addClass("line#{i}")
				line.css({'font-size': 0, width: "#{x}px", height: "1px", margin: "0 auto"})
				
				container.append(line)
				i -= 1
			
			container
		
		populate_dialog: (dialog, messages) ->
			super dialog.find(".content"), messages
	
	$.FormCheck.Notifiers.TipBalloons.kind = "tip_balloons"
)(jQuery)