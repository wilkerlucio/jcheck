describe "jCheck"
	describe "FormCheck"
		describe "validating"
			before_each
				v = $(fixture("form")).jcheck()
				v.validate(function(f) {})
			end
			
			it "should don't be valid if has errors"
				v.validate(function(f) {f.errors.add("text", "some")})
				v.is_valid().should.be_false 
			end
			
			it "should be valid if has no errors"
				v.is_valid().should.be_true 
			end
		end
		
		describe "notifiers setup"
			it "should user notification_dialog and tip_ballons as default notifiers"
				v = $(fixture("form")).jcheck()
				v.should.have 1, 'notifiers'
				v.should.have 1, 'live_notifiers'
				v.notifiers[0].should.be_an $.FormCheck.Notifiers.NotificationDialog
				v.live_notifiers[0].should.be_an $.FormCheck.Notifiers.TipBalloons
			end
			
			it "should be able to customize overall notifiers on creation"
				v = $(fixture("form")).jcheck({notifiers: []})
				v.should.have 0, 'notifiers'
				v.should.have 1, 'live_notifiers'
				v.live_notifiers[0].should.be_an $.FormCheck.Notifiers.TipBalloons
			end
			
			it "should be able to customize live notifiers on creation"
				v = $(fixture("form")).jcheck({live_notifiers: []})
				v.should.have 1, 'notifiers'
				v.should.have 0, 'live_notifiers'
				v.notifiers[0].should.be_an $.FormCheck.Notifiers.NotificationDialog
			end
			
			it "should be able to customize both kind notifiers at once"
				v = $(fixture("form")).jcheck({notifiers: [], live_notifiers: []})
				v.should.have 0, 'notifiers'
				v.should.have 0, 'live_notifiers'
			end
			
			it "should be able to customize default overall notifiers"
				jQuery.FormCheck.default_notifiers = []
				
				v = $(fixture("form")).jcheck()
				v.should.have 0, 'notifiers'
				
				jQuery.FormCheck.default_notifiers = ["notification_dialog"]
			end
			
			it "should be able to customize default live notifiers"
				jQuery.FormCheck.default_live_notifiers = []
				
				v = $(fixture("form")).jcheck()
				v.should.have 0, 'live_notifiers'
				
				jQuery.FormCheck.default_live_notifiers = ["tip_balloons"]
			end
		end
		
		describe "Field"
			describe "labels"
				before_each
					v = $(fixture("form")).jcheck()
				end

				it "should get label if it's present"
					v.field("text").label().should.eql "TextField"
				end

				it "should return field name if label is not present"
					v.field("multiple_select").label().should.eql "multiple_select"
				end

				it "should get label for multiple fields"
					v.field("checkboxes[]").label().should.eql "Check List"
				end

				it "should able to use custom label"
					v.field("text").custom_label = "Custom Label"
					v.field("text").label().should.eql "Custom Label"
				end
			end

			describe "field_prefix"
				before_each
					v = $(fixture("form")).jcheck({field_prefix: "user"})
				end

				it "should get prefixed field"
					v.field("name").label().should.eql "Your Name"
				end

				it "should able to get raw field"
					v.field(":text").label().should.eql "TextField"
				end

				it "should generate field name correctly"
					v.field_name("something").should.eql "user[something]"
					v.field_name("list[]").should.eql "user[list][]"
					v.field_name("more[deept][things][here]").should.eql "user[more][deept][things][here]"
					v.field_name(":raw_name").should.eql "raw_name"
				end

				it "should reverse field name correctly"
					v.reverse_field_name("user[something]").should.eql "something"
					v.reverse_field_name("user[list][]").should.eql "list[]"
					v.reverse_field_name("user[more][deept][things][here]").should.eql "more[deept][things][here]"
					v.reverse_field_name("raw_name").should.eql ":raw_name"
				end
			end
			
			describe "field values"
				before
					v = $(fixture("form_values")).jcheck()
				end
				
				it "should get correct value for an text input"
					v.field("text").value().should.eql "some text"
				end
				
				it "should get correct value for an text area"
					v.field("textarea").value().should.eql "more text"
				end
				
				it "should get correct value for a checked checkbox"
					v.field("checked_checkbox").value().should.eql "20"
				end
				
				it "should get correct value for an unchecked checkbox"
					v.field("unchecked_checkbox").value().should.eql ""
				end
				
				it "should get correct value for a list of checkboxes"
					v.field("letters[]").value().should.eql ["a", "b"]
				end
				
				it "should get correct value for a radio"
					v.field("radios").value().should.eql "z"
				end
				
				it "should get correct value for a select"
					v.field("simple_select").value().should.eql "cc"
				end
				
				it "should get correct value for a multiple select"
					v.field("multiple_select").value().should.eql ["2", "4", "5"]
				end
			end
		end
	end
end