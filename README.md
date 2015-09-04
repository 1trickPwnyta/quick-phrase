# README #

### How Do I Get Set Up? ###

#### Web Application Setup ####
1. Copy the repository files to a folder on the server, for example C:\\inetpub\\<application name>.
2. Create a database for the application and copy the schema from another instance.
2. Copy the Web/config.Example.php file and name it Web/config.php.
3. Modify the settings in config.php.
5. Copy either the Web/admin/Web.Dev.config or Web/admin/Web.Production.config file and name it Web/admin/Web.config.
6. If you copied the Web.Production.config file, you need to provide a value for the HTTP 403.4 redirect path.
5. Copy either the Web/tagCreation/Web.Dev.config or Web/tagCreation/Web.Production.config file and name it Web/tagCreation/Web.config.
6. If you copied the Web.Production.config file, you need to provide a value for the HTTP 403.4 redirect path.
7. Copy the Web/applicationRoot.Example.js file and name it Web/applicationRoot.js.
8. Modify the value in applicationRoot.js to reflect the root path of the web application.
9. Configure simpleSAMLphp as a SAML service provider on behalf of the web application. Instructions to do so are stored in Google Drive.
7. This application requires the following SAML user attributes:
    * An attribute called "Admin" that is set to "true" or "false" depending on whether the user was authorized to administrate this application.
    * An attribute called "EmailAddress"
8. Example IdP configuration using Kangaroo Standard IAM:

            {
                "SpId": "CatchPhrasePanic",
                "AssertionConsumerServiceUrl": "https://dev.kangaroostandard.com/simplesaml/module.php/saml/sp/saml2-acs.php/CatchPhrasePanic",
                "SingleLogoutServiceUrl": "https://dev.kangaroostandard.com/simplesaml/module.php/saml/sp/saml2-logout.php/CatchPhrasePanic",
                "AttributeRequirements": [
                    {
                        "SamlAttributeName": "EmailAddress",
                        "DirectoryAttributeName": "mail"
                    },
                    {
                        "SamlAttributeName": "Admin",
                        "DirectoryAttributeName": "CN=Catch-Phrase Panic Administrators,CN=Users,DC=dev,DC=kangaroostandard,DC=com"
                    }
                ]
            }

9. Download the PEAR installer from http://pear.php.net/go-pear.phar and save it to the PHP folder.
10. Run this command in the PHP folder:

        php go-pear.phar

11. Select "system".
12. Accept the default directories and press Enter.
13. Agree to alter php.ini with the path.
14. Run the following command to install SMTP classes:

        pear install Net_SMTP

14. Run the following command to install PEAR Mail (use the latest version):

        pear install Mail-1.2.0


#### Android Application Setup ####
Copy the config.Example.js file and name it config.js. Open the file and modify the configuration parameters as necessary.

##### Google Play Edition #####
* The Google Play edition of the app prevents edgy/adult tags from showing up in the game.
* When building a release for Google Play, it is important that you build the Google Play edition of the app.
* To build the Google Play edition of the app, open scripts/config.js and set APP_GOOGLEPLAY_EDITION to true.
* APP_GOOGLEPLAY_EDITION should always be true in production, except when specifically building the non-Google Play edition of the app. Once it is built, APP_GOOGLEPLAY_EDITION should be set back to true.

##### Debug Build #####
1. Create a zip folder called phonegap.zip in the root directory of the repository and put the contents of the App folder inside it.
2. Go to the Catch-Phrase Panic project in Adobe PhoneGap Build.
3. Click on Update code. Upload the phonegap.zip file.
4. Once the build has completed, click on the apk button to download the apk.
5. Store the CatchPhrasePanic-debug.apk file in the root directory of the repository.
6. Install the build onto your device using the following command:

        adb install CatchPhrasePanic-debug.apk

##### Release Build #####
1. Create a zip folder called phonegap.zip in the root directory of the repository and put the contents of the App folder inside it.
2. Go to the Catch-Phrase Panic project in Adobe PhoneGap Build.
3. Click on Update code. Upload the phonegap.zip file.
4. Select a signing key to sign the build with.
5. Unlock the key by entering the keystore and key passwords (both are the same).
4. Once the build has completed, click on the apk button to download the apk.
5. Store the CatchPhrasePanic-release.apk file in the root directory of the repository.
6. Install the build onto your device using the following command:

        adb install CatchPhrasePanic-release.apk


### Upgrading to Version 1.1.0 ###
1. Add a submitter column to the tag table in the web database, int(4), NULL allowed, default NULL, foreign key user.id ON DELETE SET NULL.
2. Copy the config.Example.js file and name it config.js. Open the file and modify the configuration parameters as necessary.
3. Add $NO_EMAIL parameter to config.php in the Web folder. Set to true or false.
4. Add a time_approved column to the tag table in the web database, timestamp, no NULL, default current timestamp.
5. Execute a query to set the time_approved for all current tags to some date more than 30 days ago.
5. Add a table to the web database called flagged_tag:
    * id int(4) primary auto increment
    * tag_id int(4) references tag.id on delete cascade
    * reason varchar(256) not null
6. Update the SP icon in the SAML IdP configuration.

### Upgrading to Version 1.2.0 ###
1. Add ip_address column to flagged_tag table. VARCHAR 32, allow null, default null.
2. Add usage tables as defined in Usage Tracking wiki.
3. Add DEFAULT_DEVELOPER_MODE to config.js in the app.
4. Add DEFAULT_FRESH_INSTALL = true to config.js in the app.

### Upgrading to Version 2.0.0 ###
1. Change web service URL path to /CatchPhrasePanic instead of /GrabTag, but maintain a mapping from /GrabTag to /CatchPhrasePanic for backward compatibility.
3. Update SP ID to reflect new name.
4. Update AD admin group name.
8. Rename the MySQL database and user to catch_phrase_pan.
5. Update config.php in /Web with new values as appropriate.
6. Update applicationRoot.js in /Web with the new application root.
7. Update config.js in the app with the new URL path.
8. Add DEFAULT_DATA_VERSION = null in config.js.
10. Add MAX_TEAM_NAME_CHARACTERS = 64 to config.js.
11. Add MIN_MAX_CHARACTERS = 6 to config.js.
12. Add MIN_WINNING_POINT = 1 to config.js.
13. Add MAX_WINNING_POINT = 99 to config.js.
14. Add MIN_NUMBER_OF_TEAMS = 2 to config.js.
15. Add MAX_NUMBER_OF_TEAMS = 8 to config.js.
16. Add MIN_ROUND_SECONDS = 60 to config.js.
17. Add APP_RATING_URL_HTTP to config.js.
18. Add APP_RATING_URL_MARKET to config.js.
19. Add DEFAULT_PROMPT_FOR_RATING = true to config.js.
20. Add DEFAULT_GAMES_SINCE_RATING_PROMPT = 0 to config.js.
21. Add GAMES_UNTIL_RATING_PROMPT = 10 to config.js.
22. Add MAX_CUSTOM_PHRASE_CHARACTERS = 64 in config.js.