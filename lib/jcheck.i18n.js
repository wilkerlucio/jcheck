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
    languages: {}
  };
  return $.FormCheck.i18n;
})(jQuery);