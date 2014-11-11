template "/etc/nginx/sites-available/#{node['laboard']['app_name']}" do
  source 'nginx.conf.erb'
  variables(node['laboard'])

  notifies :restart, 'service[nginx]', :delayed
end

link "/etc/nginx/sites-enabled/#{node['laboard']['app_name']}" do
  to "/etc/nginx/sites-available/#{node['laboard']['app_name']}"

  notifies :restart, 'service[nginx]', :delayed
end
