var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
}, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
(function($) {
  $.FormCheck.Notifiers = {};
  $.FormCheck.Notifiers.create = function(name, object, base) {
    var class_name, notifier;
    object = $.extend({
      constructor: function() {},
      focus: function() {
        return this.notify.apply(this, arguments);
      },
      blur: function() {},
      notify: function() {}
    }, object || {});
        if (base != null) {
      base;
    } else {
      base = $.FormCheck.Notifiers.Base;
    };
    class_name = name.camelize() + "Notifier";
    notifier = (function() {
      function notifier() {
        notifier.__super__.constructor.apply(this, arguments);
        this.constructor.apply(this, arguments);
      }
      __extends(notifier, base);
      return notifier;
    })();
    $.extend(notifier.prototype, object);
    notifier.kind = name;
    $.FormCheck.Notifiers[class_name] = notifier;
    return notifier;
  };
  $.FormCheck.find_notifier = function(kind) {
    var name, notifier, _ref;
    _ref = $.FormCheck.Notifiers;
    for (name in _ref) {
      notifier = _ref[name];
      if (notifier.kind === kind) {
        return notifier;
      }
    }
  };
  $.FormCheck.Notifiers.Base = (function() {
    function Base(form) {
      this.form = form;
    }
    Base.prototype.focus = function(attribute) {};
    Base.prototype.notify = function(attribute) {};
    Base.prototype.blur = function(attribute) {};
    return Base;
  })();
  $.FormCheck.Notifiers.DialogBase = (function() {
    function DialogBase() {
      DialogBase.__super__.constructor.apply(this, arguments);
    }
    __extends(DialogBase, $.FormCheck.Notifiers.Base);
    DialogBase.prototype.populate_dialog = function(dialog, messages) {
      var html, m, _i, _len;
      html = "<ul>";
      for (_i = 0, _len = messages.length; _i < _len; _i++) {
        m = messages[_i];
        html += "<li>* " + m + "</li>";
      }
      html += "</ul>";
      return dialog.html(html);
    };
    return DialogBase;
  })();
  $.FormCheck.Notifiers.NotificationDialog = (function() {
    function NotificationDialog(form, options) {
      NotificationDialog.__super__.constructor.call(this, form);
      this.options = $.extend({
        autoclose_in: 4000
      }, options || {});
    }
    __extends(NotificationDialog, $.FormCheck.Notifiers.DialogBase);
    NotificationDialog.prototype.notify = function() {
      var dialog;
      dialog = this.generate_dialog();
      dialog.css({
        left: "-1000px"
      });
      this.populate_dialog(dialog, this.form.errors.full_messages());
      dialog.css({
        "margin-top": "-" + (dialog.outerHeight() + 10) + "px",
        left: "50%",
        "margin-left": "-" + (Math.round(dialog.outerWidth() / 2)) + "px"
      });
      dialog.show();
      dialog.animate({
        "margin-top": "0px"
      });
      return dialog.mouseout();
    };
    NotificationDialog.prototype.close_dialog = function() {
      return this.current_dialog.animate({
        "margin-top": "-" + (this.current_dialog.outerHeight() + 10) + "px"
      }, {
        complete: function() {
          return $(this).hide();
        }
      });
    };
    NotificationDialog.prototype.generate_dialog = function() {
      var dialog, dialog_id;
      if ($.FormCheck.Notifiers.NotificationDialog.dialog_timer) {
        clearTimeout($.FormCheck.Notifiers.NotificationDialog.dialog_timer);
      }
      dialog_id = "jcheck-error-dialog";
      $("#" + dialog_id).remove();
      dialog = $(document.createElement("div"));
      dialog.attr("id", dialog_id);
      this.current_dialog = dialog;
      if ($.browser.msie && parseInt($.browser.version) < 7) {
        dialog.addClass("ie-fixed");
      }
      dialog.click(__bind(function() {
        return this.close_dialog();
      }, this));
      if (this.options.autoclose_in) {
        dialog.mouseover(__bind(function() {
          if ($.FormCheck.Notifiers.NotificationDialog.dialog_timer) {
            return clearTimeout($.FormCheck.Notifiers.NotificationDialog.dialog_timer);
          }
        }, this));
        dialog.mouseout(__bind(function() {
          var callback, self;
          self = this;
          callback = function() {
            return self.close_dialog();
          };
          return $.FormCheck.Notifiers.NotificationDialog.dialog_timer = setTimeout(callback, this.options.autoclose_in);
        }, this));
      }
      $(document.body).append(dialog);
      return dialog;
    };
    return NotificationDialog;
  })();
  $.FormCheck.Notifiers.NotificationDialog.dialog_timer = 0;
  $.FormCheck.Notifiers.NotificationDialog.kind = "notification_dialog";
  $.FormCheck.Notifiers.TipBalloons = (function() {
    function TipBalloons(form) {
      TipBalloons.__super__.constructor.call(this, form);
      this.balloons = {};
    }
    __extends(TipBalloons, $.FormCheck.Notifiers.DialogBase);
    TipBalloons.prototype.focus = function(attribute, evt) {
      return this.notify(attribute, evt || null);
    };
    TipBalloons.prototype.notify = function(attribute, evt) {
      var dialog, element, messages, offset, populate_and_reposition;
      dialog = this.dialog_for_attribute(attribute);
      messages = this.form.errors.on(attribute);
      if (messages.isEqual(dialog.messages)) {
        return;
      }
      element = evt && evt.target ? $(evt.target) : this.form.element;
      offset = element.offset();
      populate_and_reposition = __bind(function(messages) {
        this.populate_dialog(dialog, messages);
        return dialog.css({
          top: "" + (offset.top - dialog.outerHeight()) + "px",
          left: "" + (offset.left + Math.round(element.outerWidth() * 0.9)) + "px"
        });
      }, this);
      if (messages.length > 0) {
        if (dialog.messages && dialog.messages.length > 0) {
          populate_and_reposition(messages);
        } else {
          dialog.css({
            left: "-1000px",
            top: "-1000px"
          });
          dialog.hide();
          populate_and_reposition(messages);
          dialog.fadeIn("fast");
        }
      } else {
        this.close_dialog(attribute);
      }
      return dialog.messages = messages;
    };
    TipBalloons.prototype.blur = function(attribute) {
      return this.close_dialog(attribute);
    };
    TipBalloons.prototype.dialog_for_attribute = function(attribute) {
      if (!this.balloons[attribute]) {
        this.balloons[attribute] = this.generate_dialog();
      }
      return this.balloons[attribute];
    };
    TipBalloons.prototype.close_dialog = function(attribute) {
      var dialog;
      dialog = this.dialog_for_attribute(attribute);
      dialog.messages = null;
      return dialog.fadeOut("fast");
    };
    TipBalloons.prototype.generate_dialog = function() {
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
    TipBalloons.prototype.generate_arrow = function() {
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
        line.addClass("line" + i);
        line.css({
          'font-size': 0,
          width: "" + x + "px",
          height: "1px",
          margin: "0 auto"
        });
        container.append(line);
        i -= 1;
      }
      return container;
    };
    TipBalloons.prototype.populate_dialog = function(dialog, messages) {
      return TipBalloons.__super__.populate_dialog.call(this, dialog.find(".content"), messages);
    };
    return TipBalloons;
  })();
  return $.FormCheck.Notifiers.TipBalloons.kind = "tip_balloons";
})(jQuery);