# README #

### How Do I Get Set Up? ###

#### Web Application Setup ####
1. Copy the repository files to a folder on the server, for example C:\\inetpub\\<application name>.
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
                "SpId": "dev.grabtag",
                "AssertionConsumerServiceUrl": "https://dev.kangaroostandard.com/simplesaml/module.php/saml/sp/saml2-acs.php/dev.grabtag",
                "SingleLogoutServiceUrl": "https://dev.kangaroostandard.com/simplesaml/module.php/saml/sp/saml2-logout.php/dev.grabtag",
                "AttributeRequirements": [
                    {
                        "SamlAttributeName": "EmailAddress",
                        "DirectoryAttributeName": "mail"
                    },
                    {
                        "SamlAttributeName": "Admin",
                        "DirectoryAttributeName": "CN=Grab Tag Administrators,CN=Users,DC=dev,DC=kangaroostandard,DC=com"
                    }
                ]
            }

#### Android Application Setup ####
##### Google Play Edition #####
* The Google Play edition of the app prevents edgy/adult tags from showing up in the game.
* When building a release for Google Play, it is important that you build the Google Play edition of the app.
* To build the Google Play edition of the app, open scripts/config.js and set APP_GOOGLEPLAY_EDITION to true.
* APP_GOOGLEPLAY_EDITION should always be true in production, except when specifically building the non-Google Play edition of the app. Once it is built, APP_GOOGLEPLAY_EDITION should be set back to true.

##### Debug Build #####
1. Create a zip folder called phonegap.zip in the root directory of the repository and put the contents of the App folder inside it.
2. Go to the Grab Tag project in Adobe PhoneGap Build.
3. Click on Update code. Upload the phonegap.zip file.
4. Once the build has completed, click on the apk button to download the apk.
5. Store the GrabTag-debug.apk file in the root directory of the repository.
6. Install the build onto your device using the following command:

        adb install GrabTag-debug.apk

##### Release Build #####
1. Create a zip folder called phonegap.zip in the root directory of the repository and put the contents of the App folder inside it.
2. Go to the Grab Tag project in Adobe PhoneGap Build.
3. Click on Update code. Upload the phonegap.zip file.
4. Select a signing key to sign the build with.
5. Unlock the key by entering the keystore and key passwords (both are the same).
4. Once the build has completed, click on the apk button to download the apk.
5. Store the GrabTag-release.apk file in the root directory of the repository.
6. Install the build onto your device using the following command:

        adb install GrabTag-release.apk


### Upgrading to Version 1.1.0 ###
1. Add a submitter column to the tag table in the web database, int(4), NULL allowed, default NULL, foreign key user.id ON DELETE SET NULL.
2. Copy the config.Example.js file and name it config.js. Open the file and modify the configuration parameters as necessary.
3. Add $NO_EMAIL parameter to config.php in the Web folder. Set to true or false.
4. Add a time_approved column to the tag table in the web database, timestamp, no NULL, default current timestamp.
5. Add a table to the web database called flagged_tag:
    * id int(4) primary auto increment
    * tag_id int(4) references tag.id on delete cascade
    * reason varchar(256) not null