JSpec.addMatchers({
  haveErrorsOn: {
    match: function(formcheck, field) {
      formcheck.isValid();
      return (formcheck.errors.on(field).length > 0);
    }
  },

  haveErrorMessageOn: {
    match: function(formcheck, message, field) {
      formcheck.isValid();
      return (jQuery.inArray(message, formcheck.errors.on(field)) >= 0);
    },

    message: function(formcheck, params) {
      return "expected validator applied to '" + formcheck.field(params[2]).value() + "' to give messsage " + params[1];
    }
  }
});
