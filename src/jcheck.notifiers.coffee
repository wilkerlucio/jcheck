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
    className = name.camelize() + "Notifier"

    class notifier extends base
      constructor: -> super; @constructor.apply(this, arguments)

    $.extend(notifier.prototype, object)

    notifier.kind = name

    $.FormCheck.Notifiers[className] = notifier

    notifier

  $.FormCheck.findNotifier = (kind) ->
    for name, notifier of $.FormCheck.Notifiers
      return notifier if notifier.kind == kind

  class $.FormCheck.Notifiers.Base
    constructor: (form) ->
      @form = form

    focus: (attribute) ->
    notify: (attribute) ->
    blur: (attribute) ->

  class $.FormCheck.Notifiers.DialogBase extends $.FormCheck.Notifiers.Base
    populateDialog: (dialog, messages) ->
      html = "<ul>"
      for m in messages
        html += "<li>* #{m}</li>"
      html += "</ul>"

      dialog.html(html)

  class $.FormCheck.Notifiers.NotificationDialog extends $.FormCheck.Notifiers.DialogBase
    constructor: (form, options) ->
      super form
      @options = $.extend({
        autocloseIn: 4000
      }, options || {})

    notify: () ->
      dialog = @generateDialog()
      dialog.css({left: "-1000px"})
      @populateDialog(dialog, @form.errors.fullMessages())
      dialog.css({"margin-top": "-#{dialog.outerHeight() + 10}px", left: "50%", "margin-left": "-#{Math.round(dialog.outerWidth() / 2)}px"})
      dialog.show()
      dialog.animate({"margin-top": "0px"})
      dialog.mouseout()

    closeDialog: ->
      @currentDialog.animate({"margin-top": "-#{@currentDialog.outerHeight() + 10}px"}, { complete: -> $(this).hide() })

    generateDialog: () ->
      clearTimeout($.FormCheck.Notifiers.NotificationDialog.dialogTimer) if $.FormCheck.Notifiers.NotificationDialog.dialogTimer
      dialogId = "jcheck-error-dialog"

      $("##{dialogId}").remove()

      dialog = $(document.createElement("div"))
      dialog.attr("id", dialogId)

      @currentDialog = dialog

      dialog.addClass("ie-fixed") if $.browser.msie and parseInt($.browser.version) < 7

      dialog.click =>
        @closeDialog()

      if @options.autocloseIn
        dialog.mouseover =>
          clearTimeout($.FormCheck.Notifiers.NotificationDialog.dialogTimer) if $.FormCheck.Notifiers.NotificationDialog.dialogTimer

        dialog.mouseout =>
          self = this
          callback = () ->
            self.closeDialog()
          $.FormCheck.Notifiers.NotificationDialog.dialogTimer = setTimeout(callback, @options.autocloseIn)

      $(document.body).append(dialog)

      dialog

  $.FormCheck.Notifiers.NotificationDialog.dialogTimer = 0
  $.FormCheck.Notifiers.NotificationDialog.kind = "notificationDialog"

  class $.FormCheck.Notifiers.TipBalloons extends $.FormCheck.Notifiers.DialogBase
    constructor: (form) ->
      super form
      @balloons = {}

    focus: (attribute, evt) ->
      @notify(attribute, evt || null)

    notify: (attribute, evt) ->
      dialog = @dialogForAttribute(attribute)
      messages = @form.errors.on(attribute)

      return if messages.isEqual(dialog.messages)

      element = if evt and evt.target then $(evt.target) else @form.element
      offset = element.offset()

      populateAndReposition = (messages) =>
        @populateDialog(dialog, messages)
        dialog.css({top: "#{offset.top - dialog.outerHeight()}px", left: "#{offset.left + Math.round(element.outerWidth() * 0.9)}px"})

      if messages.length > 0
        if dialog.messages and dialog.messages.length > 0
          populateAndReposition(messages)
        else
          dialog.css({left: "-1000px", top: "-1000px"})
          dialog.hide()

          populateAndReposition(messages)

          dialog.fadeIn("fast")
      else
        @closeDialog(attribute)

      dialog.messages = messages

    blur: (attribute) ->
      @closeDialog(attribute)

    dialogForAttribute: (attribute) ->
      @balloons[attribute] = @generateDialog() unless @balloons[attribute]
      @balloons[attribute]

    closeDialog: (attribute) ->
      dialog = @dialogForAttribute(attribute)
      dialog.messages = null
      dialog.fadeOut("fast")

    generateDialog: () ->
      dialog = null

      dialog = $(document.createElement("div"))
      dialog.addClass("jcheck-inline-balloon-tip")
      dialog.css({position: "absolute", top: "-1000px", left: "-1000px"})

      contentArea = $(document.createElement("div"))
      contentArea.addClass("content")
      dialog.append(contentArea)

      arrow = @generateArrow()
      dialog.append(arrow)

      $(document.body).append(dialog)

      dialog

    generateArrow: () ->
      i = 10
      container = $(document.createElement("div"))
      container.addClass("arrow-container")
      center = i / 2
      maxWidth = null

      while i > 0
        x = i * 2 - center
        x = center + x - 1 if x < 0

        line = $(document.createElement("div"))
        line.addClass("line#{i}")
        line.css({'font-size': 0, width: "#{x}px", height: "1px", margin: "0 auto"})

        container.append(line)
        i -= 1

      container

    populateDialog: (dialog, messages) ->
      super dialog.find(".content"), messages

  $.FormCheck.Notifiers.TipBalloons.kind = "tipBalloons"
)(jQuery)
