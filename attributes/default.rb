default[:laboard][:app_name]       = 'laboard'
default[:laboard][:app_user]       = 'laboard'

default[:laboard][:git_sync]       = true
default[:laboard][:git_repository] = 'https://github.com/jubianchi/laboard.git'
default[:laboard][:git_revision]   = 'master'

default[:laboard][:app_dir]        = "/home/#{node[:laboard][:app_user]}/#{node[:laboard][:app_name]}"
default[:laboard][:config_dir]     = "#{node[:laboard][:app_dir]}/config"
default[:laboard][:log_dir]        = "/var/log/#{node[:laboard][:app_name]}"
default[:laboard][:pid_dir]        = "/var/run/#{node[:laboard][:app_name]}"

default[:laboard][:bind]           = '0.0.0.0'
default[:laboard][:port]           = '4343'
default[:laboard][:domain]         = node[:laboard][:app_name]
default[:laboard][:gitlab_url]     = "https://gitlab.com"
default[:laboard][:gitlab_version] = '7.4'
default[:laboard][:data_dir]       = "/var/#{node[:laboard][:app_name]}"
