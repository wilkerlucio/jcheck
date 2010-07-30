var __hasProp = Object.prototype.hasOwnProperty;
(function($) {
  $.FormCheck.Notifiers = {};
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
  $.FormCheck.Notifiers.NotificationDialog = function() {  };
  $.FormCheck.Notifiers.NotificationDialog.prototype.notify = function(form) {
    var dialog;
    dialog = this.generate_dialog(form);
    dialog.css({
      left: "-1000px",
      top: "-1000px"
    });
    this.populate_dialog(dialog, form.errors.full_messages());
    dialog.css({
      top: ("-" + (dialog.outerHeight()) + "px"),
      left: "50%",
      "margin-left": ("-" + (Math.round(dialog.outerWidth() / 2)) + "px")
    });
    return dialog.animate({
      top: "0px"
    });
  };
  $.FormCheck.Notifiers.NotificationDialog.prototype.close_dialog = function() {
    var dialog;
    dialog = this.generate_dialog();
    return dialog.animate({
      top: ("-" + (dialog.outerHeight()) + "px")
    });
  };
  $.FormCheck.Notifiers.NotificationDialog.prototype.generate_dialog = function(form) {
    var dialog, dialog_id;
    dialog_id = "jcheck-error-dialog";
    dialog = null;
    if ($(("#" + (dialog_id))).length === 0) {
      dialog = $(document.createElement("div"));
      dialog.attr("id", dialog_id);
      dialog.css({
        position: "absolute"
      });
      $(document.body).append(dialog);
    } else {
      dialog = $(("#" + (dialog_id)));
    }
    return dialog;
  };
  $.FormCheck.Notifiers.NotificationDialog.prototype.populate_dialog = function(dialog, messages) {
    var _a, _b, _c, html, m;
    html = "<ul>";
    _b = messages;
    for (_a = 0, _c = _b.length; _a < _c; _a++) {
      m = _b[_a];
      html += ("<li>" + (m) + "</li>");
    }
    html += "</ul>";
    dialog.html(html);
    return dialog.click((function(__this) {
      var __func = function() {
        return this.close_dialog();
      };
      return (function() {
        return __func.apply(__this, arguments);
      });
    })(this));
  };

  $.FormCheck.Notifiers.NotificationDialog.kind = "notification_dialog";
  return $.FormCheck.Notifiers.NotificationDialog.kind;
})(jQuery);