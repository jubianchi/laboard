if node['laboard']['git_sync']
  git node['laboard']['app_dir'] do
    repository node['laboard']['git_repository']
    reference node['laboard']['git_revision']

    action :sync
    notifies :run, 'execute[npm_install]', :immediately
    notifies :run, 'execute[bower_install]', :immediately
  end
end

[node['laboard']['data_dir'], node['laboard']['log_dir'], node['laboard']['pid_dir']].each do |dir|
  directory dir do
    owner node['laboard']['app_user']
    group node['laboard']['app_user']
    mode 0755

    action :create
  end
end

template "#{node[:laboard][:app_dir]}/config/server.json" do
  source 'server.json.erb'
  owner node['laboard']['app_user']
  group node['laboard']['app_user']
  variables(node['laboard'])

  notifies :restart, 'service[laboard]', :delayed
end

template "#{node[:laboard][:app_dir]}/config/client.js" do
  source 'client.js.erb'
  owner node['laboard']['app_user']
  group node['laboard']['app_user']
  variables(node['laboard'])

  notifies :run, 'execute[gulp_app]', :delayed
end

execute 'npm_install' do
  cwd node['laboard']['app_dir']
  command "sudo -u #{node['laboard']['app_user']} -H npm install"
end

execute 'bower_install' do
  cwd node['laboard']['app_dir']
  command "sudo -u #{node['laboard']['app_user']} -H bower install"

  notifies :run, 'execute[gulp_app]', :immediately
end

execute 'gulp_app' do
  cwd node['laboard']['app_dir']
  command "sudo -u #{node['laboard']['app_user']} -H gulp app"
end

template "/etc/init.d/#{node['laboard']['app_name']}" do
  source 'init.d.erb'
  mode 0755
  variables(node['laboard'])
end

service 'laboard' do
  supports :start => true, :stop => true, :restart => true, :status => true
  action :nothing
end
