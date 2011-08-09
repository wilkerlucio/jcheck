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
  Array.wrap = (data) ->
    if $.isArray(data)
      data
    else
      [data]

  Array::extract_options = ->
    if $.isPlainObject(this[@length - 1])
      @pop()
    else
      {}

  Array::isEqual = (other) ->
    return false unless $.isArray(other)
    return false if @length != other.length

    for value, key in this
      return false if value != other[key]

    true

  String::simple_template_replace = (options) ->
    text = this + ""

    for key, replacement of options
      text = text.replace("%{#{key}}", replacement)

    text

  String::uc_first = ->
    this.charAt(0).toUpperCase() + this.substr(1)

  String::camelize = ->
    parts = (str.uc_first() for str in this.split("_"))
    parts.join('')

  $.isString = (value) -> (typeof value) == "string"

  window.is_blank = (object) ->
    return true unless object?
    return true if $.isString(object) and object.replace(/^\s+|\s+$/, '').length == 0

    false

  window.delete_object_property = (object, property) ->
    value = object[property] || null
    delete object[property]
    value

  window.object_without_properties = (object, properties) ->
    obj = $.extend({}, object)
    delete obj[property] for property in properties
    obj

  window.extract_keys = (object) -> key for key of object

  window.slice_object = (object, keys) ->
    obj = {}

    for key in keys
      obj[key] = object[key] if object[key]?

    obj

  window.slice_object_and_remove = (object, keys) ->
    obj = {}

    for k, v of object
      if $.inArray(k, keys) == -1
        obj[k] = object[k]
        delete object[k]

    obj

  # dummy console
  unless window.console?
    window.console = {
      log: ->
      dir: ->
      error: ->
    }
)(jQuery)
