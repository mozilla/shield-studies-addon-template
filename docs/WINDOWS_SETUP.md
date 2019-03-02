# Windows Development and Testing

The Shield Studies Add-on Template makes some assumptions about your environment that can be challenging to meet on Windows machines. So far the most promising approach uses the **Windows Subsystem for Linux (WSL)**. WSL is a young project with bugs and unexpected pitfalls; caveat emptor.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->

<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

**Contents**

* [Requirements](#requirements)
* [Installing WSL](#installing-wsl)
* [Optional](#optional)
* [Known Issues](#known-issues)
* [TODO](#todo)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Requirements

* Windows Version 10.0.14986+ (find your version by typing `ver` at Windows command line)

## Installing WSL

1. [Follow Microsoft's official steps for installing WSL](https://answers.microsoft.com/en-us/insider/wiki/insider_wintp-insider_install/how-to-enable-the-windows-subsystem-for-linux/16e8f2e8-4a6a-4325-a89a-fd28c7841775?auth=1). These instructions are clear and detailed. _If you prefer, here is a TL;DR:_

   1. Enable developer mode in Windows 10 in `Start > Settings > Update & security > For developers`.
   2. Enable the optional Windows feature, "Windows Subsystem for Linux" using `optionalfeatures.exe`.
   3. Restart.
   4. Type `bash` at the Windows command line and wait for Ubuntu to install.

2. Install a recent version of Node.js:

```
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. Get the latest npm: `npm install npm@latest -g`

4. Install git and zip (and any other Linux command-line tools you like):

```
sudo apt install git
sudo apt install zip
```

5. Now you can follow the standard instructions in the README at [https://github.com/mozilla/shield-studies-addon-template](https://github.com/mozilla/shield-studies-addon-template) for cloning the repo, installing npm modules and running npm scripts.

## Optional

* Configure which Firefox binary to use in bash. `export FIREFOX_BINARY="/mnt/c/Program Files (x86)/Firefox Developer Edition/firefox.exe"` or similar (run with `"$FIREFOX_BINARY"` in quotes just like that)
* Configure VisualStudio Code's built-in terminal to use your new bash by setting `terminal.integrated.shell.windows` to `C:\\Windows\\System32\\bash.exe`.

## Known Issues

* Running `npm run test` in this environment fails with a 'profile cannot be loaded' error. Worked around it? See TODO.
* [Editing files in the WSL Linux filesystem with Windows tools corrupts data there.](https://blogs.msdn.microsoft.com/commandline/2016/11/17/do-not-change-linux-files-using-windows-apps-and-tools/) Don't find your secret hidden Linux home directory in WSL, check your code out there, and then edit it using e.g. Windows Visual Studio Code. Things will break in all sorts of unpredictable ways.

## TODO

* Windows-first developers, improve any/all of the above information.
* Windows-first developers, help find workarounds to bugs encountered.
* Windows-first developers, script any of the above steps to improve this setup process.
