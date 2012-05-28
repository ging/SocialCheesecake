# -*- encoding: utf-8 -*-
$:.push File.expand_path("../lib", __FILE__)
require "social_cheesecake/version"

Gem::Specification.new do |s|
  s.name        = "social_cheesecake"
  s.version     = SocialCheesecake::VERSION
  s.authors     = ["Alicia Díez"]
  s.email       = ["adiezbal@gmail.com"]
  s.homepage    = ""
  s.summary     = "Wrapper gem for socialCheesecake.js"
  s.description = "Wrapper gem for socialCheesecake.js"

  s.rubyforge_project = "social_cheesecake"

  s.files         = `git ls-files`.split("\n") |
                     Dir["app/assets/javascripts/socialcheesecake/*"]
  s.test_files    = `git ls-files -- {test,spec,features}/*`.split("\n")
  s.executables   = `git ls-files -- bin/*`.split("\n").map{ |f| File.basename(f) }
  s.require_paths = ["lib"]

  s.add_runtime_dependency('railties', '>= 3.1.3')

  s.add_development_dependency('rails', '>= 3.1.3')
  s.add_development_dependency('sqlite3')
end
