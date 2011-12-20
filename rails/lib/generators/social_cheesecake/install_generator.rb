class SocialCheesecake::InstallGenerator < Rails::Generators::Base
  include Rails::Generators::Migration
  
  source_root File.expand_path('../templates', __FILE__)
  def require_javascripts
    inject_into_file 'app/assets/javascripts/application.js',
                     "//= require social_cheesecake\n",
                     :before => '//= require_tree .'
  end
end
