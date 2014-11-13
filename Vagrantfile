Vagrant.configure('2') do |config|
  config.vm.box = 'jubianchi/debian-wheezy-chef-amd64'
  config.vm.network :private_network, ip: '192.168.13.37'
  config.vm.hostname = 'laboard'

  config.vm.provider 'virtualbox' do |vbox|
    vbox.memory = 2048
    vbox.cpus = 2
  end

  config.cache.scope = :box
  config.cache.auto_detect = true
  config.cache.enable :gem
  config.cache.enable :apt
  config.cache.enable :npm

  config.hostmanager.enabled = true
  config.hostmanager.manage_host = true

  config.omnibus.chef_version = :latest

  config.berkshelf.berksfile_path = 'Berksfile'
  config.berkshelf.enabled = true

  config.vm.provision 'chef_solo' do |chef|
    chef.json = {
        :nodejs => {
          :install_method => 'source',
          :version => '0.10.33'
        },
        :npm => {
            :version => '1.4.28'
        },
        :nginx => {
            :user => 'root',
            :default_site_enabled => false
        },
        :laboard => {
            :env => 'development',
            :app_user => 'vagrant',
            :app_dir => '/vagrant',
            :git_sync => false
        },
    }

    chef.log_level = :debug

    chef.add_recipe 'nginx'
    chef.add_recipe 'nodejs'
    chef.add_recipe 'npm'

    chef.add_recipe 'laboard::nodejs'
    chef.add_recipe 'laboard::app'
    chef.add_recipe 'laboard::nginx'
  end
end
