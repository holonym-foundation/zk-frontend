# Welcome
Repo for frontend at https://app.holonym.id (formerly https://whoisthis.wtf)
# ⚠️ Please do this before contributing
If you have priviliges to commit to master, please add this to .git/hooks/pre-commit to prompt. Doing so will make it difficult to accidentally commit without completing a checklist. It is important not to commit to the main branch until you have done these manual tests in the checklist, which cannot be easily automated. This will give you the checklist and make sure you've confirmed succesful completion of this checklist before allowing you to commit :)
```
#!/bin/sh

branch="$(git rev-parse --abbrev-ref HEAD)"

if [ "$branch" = "main" ]; then
  echo "\x1B[1;31mWARNING: YOU'RE ATTEMPTING TO COMMIT TO THE MASTER\033[0m Are you sure you want to do this? Have you done the following four items:
	  * Gone through every page you changed at tested that it looks good on all browser sizes, multiple browsers, and mobile?
	  * Manually tested wallet UX flows on a browser with a connected wallet, disconnect wallet, incognito and mobile?
	  * Checked that payments are not broken? (unlikely to break but important to not break)
	if you are sure about commiting these changes to master, type \033[;33m global thermonuclear war commit\033[0m"

	exec < /dev/tty
	read response
	if [ "$response" = "global thermonuclear war commit" ];
	then
		echo OK
	else 
		exit 1
	fi
fi
```
