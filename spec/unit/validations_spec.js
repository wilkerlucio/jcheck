describe 'jCheck'
  describe 'validators'
    before_each
      v = $(fixture("form")).jcheck()
    end

    describe 'bundled'
      describe 'acceptance validator'
        before_each
          v.validatesAcceptanceOf("checkbox")
        end

        it 'should not accept if checkbox is not checked'
          v.should.haveErrorMessageOn("must be accepted", "checkbox")
        end

        it 'should accept if checkbox is checked'
          v.field("checkbox").element[0].checked = true

          v.should_not.haveErrorsOn("checkbox")
        end
      end

      describe 'confirmation validator'
        before_each
          v.validatesConfirmationOf("password")
        end

        it 'should give error if values dont confirms'
          v.field("password").element.val("123456")

          v.should.haveErrorMessageOn("doesn't match confirmation", "password_confirmation")
        end

        it 'should give no error if value matches'
          v.field("password").element.val("123456")
          v.field("password_confirmation").element.val("123456")

          v.should_not.haveErrorsOn("password_confirmation")
        end
      end

      describe 'exclusion validator'
        before_each
          v.validatesExclusionOf("text", {"in": ["admin", "bot"]})
        end

        it 'should have error if value is filled with a reserved value'
          v.field("text").element.val("admin")
          v.should.haveErrorMessageOn("admin is reserved", "text")

          v.field("text").element.val("bot")
          v.should.haveErrorMessageOn("bot is reserved", "text")
        end

        it 'should not have error if value is not reserved'
          v.field("text").element.val("something else")
          v.should_not.haveErrorsOn("text")
        end
      end

      describe 'format validator'
        describe 'using with'
          before_each
            v.validatesFormatOf("text", {"with": /^[a-z]+/i})
          end

          it 'should pass if value matches with format'
            v.field("text").element.val("some")
            v.should_not.haveErrorsOn("text")
          end

          it 'should fail if value doesnt matches with format'
            v.field("text").element.val("123ok")
            v.should.haveErrorMessageOn("is invalid", "text")
          end
        end

        describe 'using without'
          before_each
            v.validatesFormatOf("text", {"without": /^[a-z]+/i})
          end

          it 'should pass if value matches with format'
            v.field("text").element.val("some")
            v.should.haveErrorMessageOn("is invalid", "text")
          end

          it 'should fail if value doesnt matches with format'
            v.field("text").element.val("123ok")
            v.should_not.haveErrorsOn("text")
          end
        end

        describe 'using a pre-defined format'
          before_each
            v.validatesFormatOf("text", {"with": "email"})
          end

          it 'should pass if value matches with format'
            v.field("text").element.val("some@email.com")
            v.should_not.haveErrorsOn("text")
          end

          it 'should fail if value doesnt matches with format'
            v.field("text").element.val("123ok")
            v.should.haveErrorMessageOn("is invalid", "text")
          end
        end

        describe 'pre-defined formats'
          it "should parse correct urls"
            v.validatesFormatOf("text", {"with": "url"})

            trues = ["http://www.site.com", "https://home.net/local/storage.html", "ftp://some.ftp.org", "http://site.info", "http://site.info/", "http://site.info/something", "http://site.com:8080/something_else"]
            falses = ["www.site.com", "12://site.com", "http://openmind.com:abc/", "http://no_domain"]

            for (var i = 0; i < trues.length; i++) {
              n = trues[i]

              v.field("text").element.val(n)
              v.should_not.haveErrorsOn("text")
            }

            for (var i = 0; i < falses.length; i++) {
              n = falses[i]

              v.field("text").element.val(n)
              v.should.haveErrorMessageOn("is invalid", "text")
            }
          end
        end
      end

      describe 'inclusion validator'
        before_each
          v.validatesInclusionOf("text", {"in": ["admin", "bot"]})
        end

        it 'should have no error if its using correct values'
          v.field("text").element.val("admin")
          v.should_not.haveErrorsOn("text")

          v.field("text").element.val("bot")
          v.should_not.haveErrorsOn("text")
        end

        it 'should have error if current value is not listed on inclusion'
          v.field("text").element.val("something else")
          v.should.haveErrorMessageOn("something else is not a valid option", "text")
        end
      end

      describe 'length validator'
        it 'should validate exact length'
          v.validatesLengthOf("text", {is: 5})

          v.field("text").element.val("not")
          v.should.haveErrorMessageOn("is the wrong length (should be 5 characters)", "text")

          v.field("text").element.val("right")
          v.should_not.haveErrorsOn("text")
        end

        it 'should validate minimun length'
          v.validatesLengthOf("text", {minimum: 10})

          v.field("text").element.val("short")
          v.should.haveErrorMessageOn("is too short (minimum is 10 characters)", "text")

          v.field("text").element.val("its long enough here")
          v.should_not.haveErrorsOn("text")
        end

        it 'should validate maximum length'
          v.validatesLengthOf("text", {maximum: 10})

          v.field("text").element.val("short")
          v.should_not.haveErrorsOn("text")

          v.field("text").element.val("its too long to be here")
          v.should.haveErrorMessageOn("is too long (maximum is 10 characters)", "text")
        end

        it 'should allow combination of minimum and maximum'
          v.validatesLengthOf("text", {minimum: 3, maximum: 10})

          v.field("text").element.val("no")
          v.should.haveErrorMessageOn("is too short (minimum is 3 characters)", "text")

          v.field("text").element.val("its too long to be here")
          v.should.haveErrorMessageOn("is too long (maximum is 10 characters)", "text")

          v.field("text").element.val("its ok")
          v.should_not.haveErrorsOn("text")
        end

        it 'should work with a checkbox list'
          v.validatesLengthOf("checkboxes[]", {minimum: 2})

          v.should.haveErrorMessageOn("is too short (minimum is 2 characters)", "checkboxes[]")

          v.field("checkboxes[]").element[0].checked = true
          v.field("checkboxes[]").element[1].checked = true

          v.should_not.haveErrorsOn("checkboxes[]")
        end

        it 'should work with a multiple select'
          v.validatesLengthOf("multiple_select", {minimum: 2})

          v.should.haveErrorMessageOn("is too short (minimum is 2 characters)", "multiple_select")

          v.field("multiple_select").element.find("option")[0].selected = true
          v.field("multiple_select").element.find("option")[1].selected = true

          v.should_not.haveErrorsOn("multiple_select")
        end

        it 'should allow the use of a custom tokenizer'
          v.validatesLengthOf("text", {minimum: 3, tokenizer: function(value) {return value.split(" ");}})

          v.field("text").element.val("not enough")
          v.should.haveErrorMessageOn("is too short (minimum is 3 characters)", "text")

          v.field("text").element.val("with enought words")
          v.should_not.haveErrorsOn("text")
        end
      end

      describe 'numaricality validator'
        it 'should validate if is a number'
          v.validatesNumericalityOf("text")

          trues = ["3", "3.6", "0", "-10", "-7.636"]
          falses = ["hello", "", "not", "ca234", "45px", "93em", "-e30"]

          for (var i = 0; i < trues.length; i++) {
            n = trues[i]

            v.field("text").element.val(n)
            v.should_not.haveErrorsOn("text")
          }

          for (var i = 0; i < falses.length; i++) {
            n = falses[i]

            v.field("text").element.val(n)
            v.should.haveErrorMessageOn("is not a number", "text")
          }
        end

        it "should validate if it's an integer"
          v.validatesNumericalityOf("text", {onlyInteger: true})

          trues = ["3", "0", "-1", "-4056", "486789"]
          falses = ["3.4", "-1.3"]

          for (var i = 0; i < trues.length; i++) {
            n = trues[i]

            v.field("text").element.val(n)
            v.should_not.haveErrorsOn("text")
          }

          for (var i = 0; i < falses.length; i++) {
            n = falses[i]

            v.field("text").element.val(n)
            v.should.haveErrorMessageOn("must be an integer", "text")
          }
        end

        it "should validate even numbers"
          v.validatesNumericalityOf("text", {even: true})

          trues = ["2", "6", "10"]
          falses = ["3", "5", "9", "111"]

          for (var i = 0; i < trues.length; i++) {
            n = trues[i]

            v.field("text").element.val(n)
            v.should_not.haveErrorsOn("text")
          }

          for (var i = 0; i < falses.length; i++) {
            n = falses[i]

            v.field("text").element.val(n)
            v.should.haveErrorMessageOn("must be even", "text")
          }
        end

        it "should validate odd numbers"
          v.validatesNumericalityOf("text", {odd: true})

          trues = ["3", "5", "9", "111"]
          falses = ["2", "6", "10"]

          for (var i = 0; i < trues.length; i++) {
            n = trues[i]

            v.field("text").element.val(n)
            v.should_not.haveErrorsOn("text")
          }

          for (var i = 0; i < falses.length; i++) {
            n = falses[i]

            v.field("text").element.val(n)
            v.should.haveErrorMessageOn("must be odd", "text")
          }
        end

        it 'should validate greaterThan'
          v.validatesNumericalityOf("text", {greaterThan: 6})

          v.field("text").element.val("6")
          v.should.haveErrorMessageOn("must be greater than 6", "text")

          v.field("text").element.val("7")
          v.should_not.haveErrorsOn("text")
        end

        it 'should validate greaterThanOrEqualTo'
          v.validatesNumericalityOf("text", {greaterThanOrEqualTo: 6})

          v.field("text").element.val("5")
          v.should.haveErrorMessageOn("must be greater than or equal to 6", "text")

          v.field("text").element.val("6")
          v.should_not.haveErrorsOn("text")
        end

        it 'should validate lessThan'
          v.validatesNumericalityOf("text", {lessThan: 6})

          v.field("text").element.val("6")
          v.should.haveErrorMessageOn("must be less than 6", "text")

          v.field("text").element.val("5")
          v.should_not.haveErrorsOn("text")
        end

        it 'should validate lessThanOrEqualTo'
          v.validatesNumericalityOf("text", {lessThanOrEqualTo: 6})

          v.field("text").element.val("7")
          v.should.haveErrorMessageOn("must be less than or equal to 6", "text")

          v.field("text").element.val("6")
          v.should_not.haveErrorsOn("text")
        end
      end

      describe 'presence validator'
        before_each
          v.validatesPresenceOf("text")
        end

        it 'should validates the presence of a value'
          v.should.haveErrorMessageOn("can't be blank", "text")
        end

        it 'should validates the presence of a value if it only contains blank characteres'
          v.field("text").element.val("  ")

          v.should.haveErrorMessageOn("can't be blank", "text")
        end

        it 'should have no errors if field as value'
          v.field("text").element.val("some value")

          v.should_not.haveErrorsOn("text")
        end
      end
    end

    describe "validates"
      it "should parse parameters"
        params = [[{some: 'data'}, {some: 'data'}], [true, {}], [/regexp/, {"with": /regexp/}], [[1, 2, 3], {"in": [1, 2, 3]}]]

        for (var i = 0; i < params.length; i++) {
          var p = params[i]

          jQuery.FormCheck.parseValidatesOptions(p[0]).should.eql p[1]
        }
      end

      it "should validates each validator"
        v.validates("text", {presence: true})

        v.should.haveErrorMessageOn("can't be blank", "text")
      end
    end
  end
end
