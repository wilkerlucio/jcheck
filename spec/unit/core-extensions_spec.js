describe 'jCheck'
  describe 'core extensions'
    describe 'Array.wrap'
      it "should wrap in array if it isn't an array"
        Array.wrap("hello").should.eql ["hello"]
      end

      it "should not wrap if its already an array"
        Array.wrap(["hi", "people"]).should.eql ["hi", "people"]
      end
    end

    describe 'Array::extract_options'
      it 'should extract options if last item is an object'
        var data = ["some", "var", {object: true}]
        options = data.extract_options()

        data.should.eql ["some", "var"]
        options.should.eql {object: true}
      end

      it 'should not extract if last item is not an plain object'
        var data = ["some", "var", ["hi"]]
        options = data.extract_options()

        data.should.eql ["some", "var", ["hi"]]
        options.should.eql {}
      end
    end

    describe "Array::isEqual"
      it "should say 2 arrays equals if has same values in same positions"
        ["a", "c", "b"].isEqual(["a", "c", "b"]).should.be true
      end

      it "should say false if positions are different"
        ["a", "c", "b"].isEqual(["a", "b", "c"]).should.be false
      end

      it "should say false if contents are different"
        ["a", "c", "b"].isEqual(["a", "c", "b", "d"]).should.be false
      end
    end

    describe "String::simple_template_replace"
      it "should keep same value if has no replacements"
        "this is a simple string".simple_template_replace({cool: "name"}).should.eql "this is a simple string"
        "this is a simple string".simple_template_replace().should.eql "this is a simple string"
      end

      it "should make interpolation with variables"
        "with %{custom} value".simple_template_replace({custom: "some"}).should.eql "with some value"
        "with %{custom} %{more} value".simple_template_replace({custom: "some", more: "cool"}).should.eql "with some cool value"
      end
    end

    describe "String::uc_first"
      it "should return the string with first letter in uppercase"
        "some string".uc_first().should.eql "Some string"
      end
    end

    describe "String::camelize"
      it "should camelize an underscored string"
        "some_cool_string".camelize().should.eql "SomeCoolString"
      end
    end

    describe "jQuery.isString"
      it "should detected true if is a string"
        jQuery.isString("some string").should.be true
      end

      it "should return false if it is not a string"
        falses = [5, 3.1, ["a"], {some: "data"}, function() {}]

        for (var i = 0; i < falses.length; i++) {
          jQuery.isString(falses[i]).should.be false
        }
      end
    end

    describe 'is_blank'
      it 'should return true in case of null'
        is_blank(null).should.be true
      end

      it "should return true in an empty string"
        is_blank("").should.be true
      end

      it "should return true in an string with just spaces"
        is_blank("   ").should.be true
      end

      it "should return false if its an string with content"
        is_blank("something").should.be false
      end

      it "should return false if its an object"
        is_blank({}).should.be false
      end
    end

    describe "delete_object_property"
      before_each
        object = {a: 1, b: 2, c: 3}
      end

      it "should delete a property and return it"
        n = delete_object_property(object, 'b')
        n.should.eql 2

        object.should.eql {a: 1, c: 3}
      end

      it "should return null if property doesn't exists"
        n = delete_object_property(object, 'd')
        n.should.be null

        object.should.eql {a: 1, b: 2, c: 3}
      end
    end

    describe "object_without_properties"
      before_each
        obj = {a: 3, b: 5, c: 7, d: 9}
        clean = object_without_properties(obj, ['a', 'c'])
      end

      it "should get object without given keys"
        clean.should.eql {b: 5, d: 9}
      end

      it "should keep original object as it is"
        obj.should.eql {a: 3, b: 5, c: 7, d: 9}
      end
    end

    describe "extract_keys"
      it "should extract keys of an object"
        extract_keys({a: 1, d: 3, z: 5, aa: 9}).should.eql ["a", "d", "z", "aa"]
      end
    end

    describe "slice_object"
      it "should only given keys of the object"
        slice_object({a: 3, b: 5, c: 7, d: 9}, ['b', 'c']).should.eql {b: 5, c: 7}
      end
    end

    describe "slice_object_and_remove"
      it "should keep only send keys, and return others"
        obj = {a: 3, b: 5, c: 7, d: 9}
        rest = slice_object_and_remove(obj, ['c', 'd'])

        rest.should.eql {a: 3, b: 5}
        obj.should.eql {c: 7, d: 9}
      end
    end
  end
end
