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
    constructor: (@form, options) ->
      @options = $.extend({
        preventSubmit: true
        fieldPrefix:   null
        notifiers:      $.FormCheck.defaultNotifiers
        liveNotifiers: $.FormCheck.defaultLiveNotifiers
        language:       $.FormCheck.defaultLocale
        autoParse:     true
        enabled:        true
      }, options || {})

      @fieldCache = {}
      @errors = new $.FormCheck.Errors(this)
      @validations = []
      @hookEvents()
      @setupNotifiers()
      @parseInlineValidations() if @options.autoParse

    parseInlineValidations: ->
      @form.find(":input[data-validations]").each (index, element) =>
        e = $(element)
        fieldName = @parseFieldName(e)
        validations = @parseValidationString(e.attr("data-validations"))
        @validates(fieldName, validations)

    parseValidationString: (validationString) ->
      validations = {}

      try
        validations = eval("({#{validationString}})")
      catch e
        console.error("can't parse \"#{validationString}\"")

      validations

    hookEvents: ->
      @form.submit (e) =>
        return unless @options.enabled

        unless @isValid()
          e.preventDefault() if @options.preventSubmit
          notifier.notify() for notifier in @notifiers

      self = this

      @form.find(":input").each () ->
        name = self.parseFieldName($(this))

        if name
          field = self.field(name)

          if self.options.liveNotifiers
            ((el) ->
              n = name
              f = field

              el.focus (e) ->
                self.isValid()
                self.dispatchLiveNotifiers("focus", n, e, f.liveNotifiers)

              el.blur (e) ->
                self.isValid()
                self.dispatchLiveNotifiers("blur", n, e, f.liveNotifiers)
            )($(this))

    dispatchLiveNotifiers: (callback, attribute, event, notifiers) ->
      currentNotifiers = []

      for n in notifiers
        if n == ":parent"
          currentNotifiers = currentNotifiers.concat(@liveNotifiers)
        else
          currentNotifiers.push(@getNotifier(n))

      notifier[callback](attribute, event) for notifier in currentNotifiers

    setupNotifiers: ->
      for type in ["notifiers", "liveNotifiers"]
        this[type] = []
        this[type] = @getNotifier(kind) for kind in @options[type] if @options[type]

    getNotifier: (notifier) ->
      parameters = [this]

      if $.isArray(notifier)
        parameters = parameters.concat(notifier.slice(1))
        notifier = notifier[0]

      if $.isString(notifier)
        notifierClass = $.FormCheck.findNotifier(notifier)

        creator = ->
          notifierClass.apply(this, parameters)

        creator.prototype = notifierClass.prototype

        new creator()
      else
        notifier.form = this
        notifier

    validate: (validator) ->
      @validations.push(validator)

    field: (name) ->
      @fieldCache[name] ?= new $.FormCheck.Field(this, @fieldName(name), name)
      @fieldCache[name]

    isValid: (triggerNotifiers = false) ->
      @errors.clear()

      for validation in @validations
        validation(this)

      valid = @errors.size() == 0

      if triggerNotifiers and !valid
        notifier.notify() for notifier in @notifiers

      valid

    parseFieldName: (input) ->
      name = input.attr("name")
      return null unless name

      @reverseFieldName(name)

    reverseFieldName: (name) ->
      if @options.fieldPrefix
        if matches = name.match(new RegExp("#{@options.fieldPrefix}\\[(.+?)\\](.*)"))
          name = matches[1] + (matches[2] || "")
        else
          name = ":" + name

      name

    fieldName: (name) ->
      return matches[1] if matches = name.match(/^:(.+)/)

      if @options.fieldPrefix
        subparts = ""
        if matches = name.match(/(.+?)(\[.+)$/)
          name = matches[1]
          subparts = matches[2]

        "#{@options.fieldPrefix}[#{name}]#{subparts}"
      else
        name

    disable: -> @options.enabled = false
    enable: -> @options.enabled = true

  $.FormCheck.defaultLocale = "en"
  $.FormCheck.defaultNotifiers = ["notificationDialog"]
  $.FormCheck.defaultLiveNotifiers = ["tipBalloons"]

  class $.FormCheck.Field
    constructor: (form, name, attribute) ->
      @formChecker = form
      @fieldName = name
      @attribute = attribute
      @liveNotifiers = [":parent"]
      @element = @formChecker.form.find(":input[name='#{name}']")
      @customLabel = null

      if @formChecker.options.liveNotifiers
        for evt in @eventsForElement()
          @element[evt] (e) =>
            @formChecker.isValid()
            @formChecker.dispatchLiveNotifiers("notify", @attribute, e, @liveNotifiers)

    eventsForElement: ->
      return [] if @element.length == 0

      if @element.attr("type") == "radio" or @element.attr("type") == "checkbox"
        return ["change"]
      if @element[0].tagName.toLowerCase() == "select"
        return ["keyup", "change"]

      ["keyup"]

    value: ->
      if @element.attr("type") == "radio"
        return @valueForRadio()
      if @element.attr("type") == "checkbox"
        return @valueForCheckbox()

      @valueForText()

    valueForText: ->
      @element.val() || ""

    valueForRadio: ->
      @element.filter(":checked").val() || ""

    valueForCheckbox: ->
      if @element.length > 1
        $.makeArray(@element.filter(":checked").map -> $(this).val())
      else
        if @element[0].checked then @element.val() else ""

    label: ->
      unless @customLabel == null
        if $.isFunction(@customLabel)
          return @customLabel.call(this)
        else
          return @customLabel

      fieldId = @element.attr("id")

      if @element.length > 1
        fieldId = matches[1] if matches = fieldId.match(/(.+)_.+$/)

      labelElement = @formChecker.form.find("label[for='#{fieldId}']")

      if labelElement.length > 0
        labelElement.text()
      else
        @fieldName

  # jquery hook
  $.fn.jcheck = (options) ->
    new $.FormCheck($(this), options || {})

  # auto parse
  $ ->
    $("form[data-jcheck=true]").jcheck()
)(jQuery)
