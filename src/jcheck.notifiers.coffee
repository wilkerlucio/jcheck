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
	
	$.FormCheck.find_notifier: (kind) ->
		for name, notifier of $.FormCheck.Notifiers
			return notifier if notifier.kind == kind
	
	class $.FormCheck.Notifiers.NotificationDialog
		notify: (form) ->
			dialog: @generate_dialog(form)
			dialog.css({left: "-1000px", top: "-1000px"})
			@populate_dialog(dialog, form.errors.full_messages())
			dialog.css({top: "-${dialog.outerHeight()}px", left: "50%", "margin-left": "-${Math.round(dialog.outerWidth() / 2)}px"})
			dialog.animate({top: "0px"})
		
		close_dialog: ->
			dialog: @generate_dialog()
			dialog.animate({top: "-${dialog.outerHeight()}px"})
		
		generate_dialog: (form) ->
			dialog_id: "jcheck-error-dialog"
			dialog: null
			
			if $("#${dialog_id}").length == 0
				dialog: $(document.createElement("div"))
				dialog.attr("id", dialog_id)
				dialog.css({position: "absolute"})
				
				$(document.body).append(dialog)
			else
				dialog: $("#${dialog_id}")
			
			dialog
		
		populate_dialog: (dialog, messages) ->
			html: "<ul>"
			for m in messages
				html += "<li>${m}</li>"
			html += "</ul>"
			
			dialog.html(html)
			
			dialog.click =>
				@close_dialog()
	
	$.FormCheck.Notifiers.NotificationDialog.kind = "notification_dialog"
)(jQuery)