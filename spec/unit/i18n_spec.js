describe "jCheck"
	describe "i18n"
		it "should translate in path"
			jQuery.FormCheck.i18n.translate("errors.messages.invalid").should.eql "is invalid"
		end
		
		it "should return empty string for invalid paths"
			jQuery.FormCheck.i18n.translate("some.nonexistent.translation").should.be ""
		end
		
		it "should work changing language"
			jQuery.FormCheck.i18n.translate("errors.messages.invalid", "pt-br").should.eql "não é válido"
		end
	end
end
