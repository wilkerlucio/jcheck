(function($) {
  $.FormCheck.i18n = {
    default_language: "en",
    translate: function(path, language) {
      var steps;
      language = (typeof language !== "undefined" && language !== null) ? language : $.FormCheck.i18n.default_language;
      steps = path.split(".");
      steps.unshift(language);
      return $.FormCheck.i18n.translation_from_path(steps);
    },
    translation_from_path: function(steps) {
      var _a, _b, _c, current, step;
      current = $.FormCheck.i18n.languages;
      _b = steps;
      for (_a = 0, _c = _b.length; _a < _c; _a++) {
        step = _b[_a];
        current = current[step];
        if (!(typeof current !== "undefined" && current !== null)) {
          return "";
        }
      }
      return current;
    },
    languages: {
      en: {
        errors: {
          messages: {
            inclusion: "%{value} is not a valid option",
            exclusion: "%{value} is reserved",
            invalid: "is invalid",
            confirmation: "doesn't match confirmation",
            accepted: "must be accepted",
            empty: "can't be empty",
            blank: "can't be blank",
            too_long: "is too long (maximum is %{count} characters)",
            too_short: "is too short (minimum is %{count} characters)",
            wrong_length: "is the wrong length (should be %{count} characters)",
            not_a_number: "is not a number",
            not_an_integer: "must be an integer",
            greater_than: "must be greater than %{count}",
            greater_than_or_equal_to: "must be greater than or equal to %{count}",
            equal_to: "must be equal to %{count}",
            less_than: "must be less than %{count}",
            less_than_or_equal_to: "must be less than or equal to %{count}",
            odd: "must be odd",
            even: "must be even"
          }
        }
      }
    }
  };
  return $.FormCheck.i18n;
})(jQuery);