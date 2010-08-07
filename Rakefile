# encoding: utf-8

require 'rubygems'
require 'jsmin'
require 'zip'

def current_version
  File.read("VERSION")
end

desc "Compile CoffeeScripts and watch for changes"
task :coffee do
  coffee = IO.popen 'coffee -wc --no-wrap -o lib src/*.coffee 2>&1'
  
  while line = coffee.gets
    puts line
  end
end

desc "Build minified version"
task :build do
  modules = ["core-extensions", "form", "errors", "notifiers", "validations", "i18n"]
  
  content = modules.inject("") { |c, mod| c + File.read("lib/jcheck.#{mod}.js") }
  content << File.read("lib/locales/jcheck.en.js")
  minyfied = JSMin.minify(content)
  version = current_version
  
  licence = <<LIC
/**
 * Copyright (c) 2010 Wilker Lúcio
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
LIC
  
  File.open("dist/jcheck-#{version}.min.js", "wb") do |f|
    f << licence
    f << minyfied
  end
end

desc "Build distribuition file"
task :create_release do
  Rake::Task["build"].execute
  
  dist_file = "dist/jcheck-#{current_version}.zip"
  
  File.delete(dist_file) if File.exists?(dist_file)
  
  Zip::ZipFile.open(dist_file, Zip::ZipFile::CREATE) do |zip|
    zip.mkdir("javascripts")
    zip.get_output_stream("javascripts/jcheck-#{current_version}.min.js") { |f| f << File.read("dist/jcheck-#{current_version}.min.js") }
    zip.mkdir("stylesheets")
    zip.get_output_stream("stylesheets/jcheck.css") { |f| f << File.read("css/jcheck.css") }
  end
end
