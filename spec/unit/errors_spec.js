describe "jCheck"
	describe "Errors"
		before_each
			form_stub = {
				options: {
					language: "en"
				},
				
				field: function(name) {
					return {
						label: function() {
							return name;
						}
					}
				}
			}
			
			error = new jQuery.FormCheck.Errors(form_stub)
		end
		
		it "should add new errors"
			error.add("name", "some message")
			
			error.errors.should.eql {name: ["some message"]}
		end
		
		it "should add many errors in same field"
			error.add("name", "one message")
			error.add("name", "other message")
			
			error.errors.should.eql {name: ["one message", "other message"]}
		end
		
		it "should add errors in different fields"
			error.add("name", "one message")
			error.add("name", "other message")
			error.add("other", "msg")

			error.errors.should.eql {name: ["one message", "other message"], other: ["msg"]}
		end
		
		it "should use i18n syntax"
			jQuery.FormCheck.i18n.should.receive("translate").with_args("errors.messages.invalid", "en").and_return("is invalid")
		  error.add("name", ":invalid")
		
			error.errors.should.eql {name: ["is invalid"]}
		end
		
		it "should accept interpolation for i18n"
			error.add("name", ":exclusion", {value: 'something'})
			
			error.errors.should.eql {name: ["something is reserved"]}
		end
		
		describe 'aggregation'
			before_each
				error.add("name", "some")
				error.add("name", "something")
				error.add("other", "something")
				error.add("more", "something")
			end
			
			it "should count errors"
				error.size().should.be 4
			end

			it "should get errors for a given field"
				error.on("name").should.eql ["some", "something"]
			end
			
			it "should clear errors"
				error.clear()
				error.errors.should.eql {}
			end
			
			it "should return a list with fields with errors"
				error.attributes_with_errors().should.eql ["name", "other", "more"]
			end
			
			it "should generate a list with all errors with field names"
				error.full_messages().should.eql ["name some", "name something", "other something", "more something"]
			end
		end
	end
end