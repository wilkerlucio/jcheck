JSpec.addMatchers({
  have_errors_on: {
    match: function(formcheck, field) {
      formcheck.is_valid();
      return (formcheck.errors.on(field).length > 0);
    }
  },

  have_error_message_on: {
    match: function(formcheck, message, field) {
      formcheck.is_valid();
      return (jQuery.inArray(message, formcheck.errors.on(field)) >= 0);
    },

    message: function(formcheck, params) {
      return "expected validator applied to '" + formcheck.field(params[2]).value() + "' to give messsage " + params[1];
    }
  }
});
