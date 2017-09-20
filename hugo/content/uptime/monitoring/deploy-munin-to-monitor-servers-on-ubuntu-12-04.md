---
deprecated: true
author:
  name: Linode
  email: docs@linode.com
description: 'Use Munin on Ubuntu 12.04 to Keep Track of Vital System Statistics and Troubleshoot Performance Problems'
keywords: ["munin", "monitoring", "ubuntu 12.04", "munin node", "munin master"]
license: '[CC BY-ND 4.0](https://creativecommons.org/licenses/by-nd/4.0)'
alias: ['server-monitoring/munin/ubuntu-12-04-precise-pangolin/','uptime/monitoring/monitoring-server-with-munin-on-ubuntu-12-04-precise-pangolin/']
modified: 2012-10-09
modified_by:
  name: Linode
published: 2012-10-09
title: 'Deploy Munin to Monitor Servers on Ubuntu 12.04'
external_resources:
 - '[Munin Homepage](http://munin-monitoring.org/)'
 - '[Munin Exchange](https://github.com/munin-monitoring/contrib//)'
 - '[Installing Munin on Other Linux Distributions](http://munin-monitoring.org/wiki/MuninInstallationLinux)'
 - '[Installing Munin on Mac OS X](http://munin-monitoring.org/wiki/MuninInstallationDarwin)'
 - '[Installing Munin on Solaris](http://munin-monitoring.org/wiki/MuninInstallationSolaris)'
---

The Linode Manager provides some basic monitoring of system resource utilization, which includes information regarding Network, CPU, and Input/Output usage over the past 24 hours and 30 days. While this basic information is helpful for monitoring your system, there are cases where more fine-grained information is useful. For instance, if you need to monitor memory usage or resource consumption on a per-process level, a more precise monitoring tool like Munin might be helpful.

Munin is a system and network monitoring tool that uses RRDTool to generate useful visualizations of resource usage. The primary goal of the Munin project is to provide an easy-to-use tool that is simple to install and configure and provides information in an accessible web-based interface. Munin also makes it possible to monitor multiple "nodes" with a single installation.

Before installing Munin, we assume that you have followed our [getting started guide](/docs/getting-started/). If you're new to Linux server administration you may be interested in our [introduction to Linux concepts guide](/docs/tools-reference/introduction-to-linux-concepts), the [beginner's guide](/docs/beginners-guide/) and [administration basics guide](/docs/using-linux/administration-basics). Additionally, you'll need to install a web server, such as [Apache](/docs/web-servers/apache/installation/ubuntu-10.04-lucid), in order to use the web interface.

## Install Munin

Make sure your package repositories and installed programs are up to date by issuing the following commands:

    apt-get update
    apt-get upgrade --show-upgraded

The Munin system has two components: a master component often referred to as simply "munin," and a "node" component, or "munin-node," which collects the data and forwards it to the master node. In Lucid, you need to install both the `munin` and `munin-node` packages if you wish to monitor the Linode you plan to use as the primary Munin device. To install these packages, issue the following command:

    apt-get install munin munin-node

On all of the additional machines you administer that you would like to monitor with Munin, issue the following command:

    apt-get install munin-node

The machines that you wish to monitor with Munin do not need to run Ubuntu. The Munin project supports monitoring for a large number of operating systems. Consult the Munin project's [installation guide](http://munin-monitoring.org/wiki/MuninInstallationLinux) for more information installing nodes on additional operating systems.

## Configure Munin

### Munin Master Configuration

The master configuration file for Munin is `/etc/munin/munin.conf`. This file is used to set the global directives used by Munin, as well as the hosts monitored by Munin. This file is large, so we've opted to show the key parts of the file. For the most part, the default configuration will be suitable to your needs.

The first section of the file contains the paths to the directories used by Munin. Note that these directories are the default paths used by Munin and can be changed by uncommenting and updating the path. When configuring your web server with Munin, make sure to point the root folder to the path of `htmldir`.

{{< file-excerpt "/etc/munin/munin.conf" apache >}}
    <VirtualHost 12.34.56.78:80>
       ServerAdmin webmaster@stats.example.org
       ServerName stats.example.org
       DocumentRoot /var/cache/munin/www
       <Directory />
           Options FollowSymLinks
           AllowOverride None
       </Directory>
       LogLevel notice
       CustomLog /var/log/apache2/access.log combined
       ErrorLog /var/log/apache2/error.log
       ServerSignature On
    </VirtualHost>
{{< /file-excerpt >}}


If you use this configuration you will want to issue the following commands to ensure that all required directories exist and that your site is enabled:

    a2ensite stats.example.org

Now, restart the server so that the changes to your configuration file can take effect. Issue the following command:

    /etc/init.d/apache2 restart

You should now be able to see your site's statistics by appending `/munin` to the end of your IP address (e.g. `12.34.56.78/munin`.) If you don't see any statistics at first, be sure to wait for Munin to update; Munin refreshes every 5 minutes.

In most cases you will probably want to prevent the data generated by Munin from becoming publicly accessible. You can either limit access using [rule-based access control](/docs/web-servers/apache/configuration/rule-based-access-control) so that only a specified list of IPs will be permitted access, or you can configure [HTTP Authentication](/docs/web-servers/apache/configuration/http-authentication) to require a password before permitting access. You may want to examine Munin's example Apache configuration file at `/etc/munin/apache.conf`. In addition to protecting the `stats.` virtual host, also ensure that the Munin controls are protected on the default virtual host (e.g. by visiting `http://12.34.56.78/munin/` where `12.34.56.78` is the IP address of your server.)