var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    var ctor = function(){ };
    ctor.prototype = parent.prototype;
    child.__superClass__ = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
  };
(function($) {
  $.FormCheck.Notifiers = {};
  $.FormCheck.Notifiers.create = function(name, object, base) {
    var class_name, notifier;
    object = $.extend({
      constructor: function() {      },
      focus: function() {
        return this.notify.apply(this, arguments);
      },
      blur: function() {      },
      notify: function() {      }
    }, object || {});
    base = (typeof base !== "undefined" && base !== null) ? base : $.FormCheck.Notifiers.Base;
    class_name = name.camelize() + "Notifier";
    notifier = function() {
      base.apply(this, arguments);
      return this.constructor.apply(this, arguments);
    };
    __extends(notifier, base);
    $.extend(notifier.prototype, object);
    notifier.kind = name;
    $.FormCheck.Notifiers[class_name] = notifier;
    return notifier;
  };
  $.FormCheck.find_notifier = function(kind) {
    var _a, _b, name, notifier;
    _a = []; _b = $.FormCheck.Notifiers;
    for (name in _b) { if (__hasProp.call(_b, name)) {
      notifier = _b[name];
      if (notifier.kind === kind) {
        return notifier;
      }
    }}
    return _a;
  };
  $.FormCheck.Notifiers.Base = function(form) {
    this.form = form;
    return this;
  };
  $.FormCheck.Notifiers.Base.prototype.focus = function(attribute) {  };
  $.FormCheck.Notifiers.Base.prototype.notify = function(attribute) {  };
  $.FormCheck.Notifiers.Base.prototype.blur = function(attribute) {  };

  $.FormCheck.Notifiers.DialogBase = function() {
    return $.FormCheck.Notifiers.Base.apply(this, arguments);
  };
  __extends($.FormCheck.Notifiers.DialogBase, $.FormCheck.Notifiers.Base);
  $.FormCheck.Notifiers.DialogBase.prototype.populate_dialog = function(dialog, messages) {
    var _a, _b, _c, html, m;
    html = "<ul>";
    _b = messages;
    for (_a = 0, _c = _b.length; _a < _c; _a++) {
      m = _b[_a];
      html += ("<li>* " + (m) + "</li>");
    }
    html += "</ul>";
    return dialog.html(html);
  };

  $.FormCheck.Notifiers.NotificationDialog = function(form, options) {
    $.FormCheck.Notifiers.NotificationDialog.__superClass__.constructor.call(this, form);
    this.options = $.extend({
      autoclose_in: 4000
    }, options || {});
    return this;
  };
  __extends($.FormCheck.Notifiers.NotificationDialog, $.FormCheck.Notifiers.DialogBase);
  $.FormCheck.Notifiers.NotificationDialog.prototype.notify = function() {
    var dialog;
    dialog = this.generate_dialog();
    dialog.css({
      left: "-1000px"
    });
    this.populate_dialog(dialog, this.form.errors.full_messages());
    dialog.css({
      "margin-top": ("-" + (dialog.outerHeight() + 10) + "px"),
      left: "50%",
      "margin-left": ("-" + (Math.round(dialog.outerWidth() / 2)) + "px")
    });
    dialog.show();
    dialog.animate({
      "margin-top": "0px"
    });
    return dialog.mouseout();
  };
  $.FormCheck.Notifiers.NotificationDialog.prototype.close_dialog = function() {
    return this.current_dialog.animate({
      "margin-top": ("-" + (this.current_dialog.outerHeight() + 10) + "px")
    }, {
      complete: function() {
        return $(this).hide();
      }
    });
  };
  $.FormCheck.Notifiers.NotificationDialog.prototype.generate_dialog = function() {
    var dialog, dialog_id;
    if ($.FormCheck.Notifiers.NotificationDialog.dialog_timer) {
      clearTimeout($.FormCheck.Notifiers.NotificationDialog.dialog_timer);
    }
    dialog_id = "jcheck-error-dialog";
    $(("#" + (dialog_id))).remove();
    dialog = $(document.createElement("div"));
    dialog.attr("id", dialog_id);
    this.current_dialog = dialog;
    if ($.browser.msie && parseInt($.browser.version) < 7) {
      dialog.addClass("ie-fixed");
    }
    dialog.click((function(__this) {
      var __func = function() {
        return this.close_dialog();
      };
      return (function() {
        return __func.apply(__this, arguments);
      });
    })(this));
    if (this.options.autoclose_in) {
      dialog.mouseover((function(__this) {
        var __func = function() {
          if ($.FormCheck.Notifiers.NotificationDialog.dialog_timer) {
            return clearTimeout($.FormCheck.Notifiers.NotificationDialog.dialog_timer);
          }
        };
        return (function() {
          return __func.apply(__this, arguments);
        });
      })(this));
      dialog.mouseout((function(__this) {
        var __func = function() {
          var callback, self;
          self = this;
          callback = function() {
            return self.close_dialog();
          };
          $.FormCheck.Notifiers.NotificationDialog.dialog_timer = setTimeout(callback, this.options.autoclose_in);
          return $.FormCheck.Notifiers.NotificationDialog.dialog_timer;
        };
        return (function() {
          return __func.apply(__this, arguments);
        });
      })(this));
    }
    $(document.body).append(dialog);
    return dialog;
  };

  $.FormCheck.Notifiers.NotificationDialog.dialog_timer = 0;
  $.FormCheck.Notifiers.NotificationDialog.kind = "notification_dialog";
  $.FormCheck.Notifiers.TipBalloons = function(form) {
    $.FormCheck.Notifiers.TipBalloons.__superClass__.constructor.call(this, form);
    this.balloons = {};
    return this;
  };
  __extends($.FormCheck.Notifiers.TipBalloons, $.FormCheck.Notifiers.DialogBase);
  $.FormCheck.Notifiers.TipBalloons.prototype.focus = function(attribute, evt) {
    return this.notify(attribute, evt || null);
  };
  $.FormCheck.Notifiers.TipBalloons.prototype.notify = function(attribute, evt) {
    var dialog, element, messages, offset;
    dialog = this.dialog_for_attribute(attribute);
    messages = this.form.errors.on(attribute);
    if (messages.isEqual(dialog.messages)) {
      return null;
    }
    element = evt && evt.target ? $(evt.target) : this.form.element;
    offset = element.offset();
    if (messages.length > 0) {
      if (dialog.messages && dialog.messages.length > 0) {
        this.populate_dialog(dialog, messages);
        dialog.css({
          top: ("" + (offset.top - dialog.outerHeight()) + "px"),
          left: ("" + (offset.left + Math.round(element.outerWidth() * 0.9)) + "px")
        });
      } else {
        dialog.css({
          left: "-1000px",
          top: "-1000px"
        });
        dialog.hide();
        this.populate_dialog(dialog, messages);
        dialog.css({
          top: ("" + (offset.top - dialog.outerHeight()) + "px"),
          left: ("" + (offset.left + Math.round(element.outerWidth() * 0.9)) + "px")
        });
        dialog.fadeIn("fast");
      }
    } else {
      this.close_dialog(attribute);
    }
    dialog.messages = messages;
    return dialog.messages;
  };
  $.FormCheck.Notifiers.TipBalloons.prototype.blur = function(attribute) {
    return this.close_dialog(attribute);
  };
  $.FormCheck.Notifiers.TipBalloons.prototype.dialog_for_attribute = function(attribute) {
    if (!(this.balloons[attribute])) {
      this.balloons[attribute] = this.generate_dialog();
    }
    return this.balloons[attribute];
  };
  $.FormCheck.Notifiers.TipBalloons.prototype.close_dialog = function(attribute) {
    var dialog;
    dialog = this.dialog_for_attribute(attribute);
    dialog.messages = null;
    return dialog.fadeOut("fast");
  };
  $.FormCheck.Notifiers.TipBalloons.prototype.generate_dialog = function() {
    var arrow, content_area, dialog;
    dialog = null;
    dialog = $(document.createElement("div"));
    dialog.addClass("jcheck-inline-balloon-tip");
    dialog.css({
      position: "absolute",
      top: "-1000px",
      left: "-1000px"
    });
    content_area = $(document.createElement("div"));
    content_area.addClass("content");
    dialog.append(content_area);
    arrow = this.generate_arrow();
    dialog.append(arrow);
    $(document.body).append(dialog);
    return dialog;
  };
  $.FormCheck.Notifiers.TipBalloons.prototype.generate_arrow = function() {
    var center, container, i, line, max_width, x;
    i = 10;
    container = $(document.createElement("div"));
    container.addClass("arrow-container");
    center = i / 2;
    max_width = null;
    while (i > 0) {
      x = i * 2 - center;
      if (x < 0) {
        x = center + x - 1;
      }
      line = $(document.createElement("div"));
      line.addClass(("line" + (i)));
      line.css({
        'font-size': 0,
        width: ("" + (x) + "px"),
        height: "1px",
        margin: "0 auto"
      });
      container.append(line);
      i -= 1;
    }
    return container;
  };
  $.FormCheck.Notifiers.TipBalloons.prototype.populate_dialog = function(dialog, messages) {
    return $.FormCheck.Notifiers.TipBalloons.__superClass__.populate_dialog.call(this, dialog.find(".content"), messages);
  };

  $.FormCheck.Notifiers.TipBalloons.kind = "tip_balloons";
  return $.FormCheck.Notifiers.TipBalloons.kind;
})(jQuery);