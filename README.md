

[![Donate](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=ZNFFP8P7KSR78)



# gear_smart
SmartThings / Gear


**This project is abandoned because no one seems to care about it. :)**

ShufordTechSmartThings:
  This directory holds the watch app, and requires Tizen Studio.
    Download Tizen Studio from here:
      https://developer.tizen.org/development/tizen-studio
      
      Permissions:
        <tizen:privilege name="http://tizen.org/privilege/unlimitedstorage"/>
        <tizen:privilege name="http://tizen.org/privilege/filesystem.read"/>
        <tizen:privilege name="http://tizen.org/privilege/filesystem.write"/>
        <tizen:privilege name="http://tizen.org/privilege/internet"/>
        <tizen:privilege name="http://tizen.org/privilege/application.launch"/>

ServerSide:
  This directory holds server side code to generate the access token and endpoint URLs.
    These files must be uploaded to a server that can be accessed by the user on a computer or smart phone. (PHP/MySQL)
    Once the files are uploaded, and the database has been created, a user can visit the file (gear.php) and enter their Client and Secret codes.
    This file will create a SIX digit pin number that can be entered into the Watch App.
    
GraphAPISmartApp:
  This directory holds the code that must be added here: https://graph.api.smartthings.com
    You will also generate your Client ID and Secret here to be used in the (ServerSide) code.
    
    
    
The Server Side code still needs more work, including some security improvements.
    



No part of this code may be sold.
