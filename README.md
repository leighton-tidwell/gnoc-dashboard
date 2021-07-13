# 89th CS GSOC Dashboard
 This dashboard has a fully fleshed flight tracker as well as ticket metrics system. It is used at the 89th Communication Squadron on Joint Base Andrews to provide detailed statistics and metrics on communication issues for Top 5 distinguished visitors (POTUS, VPOTUS, SECDEF, SECSTATE, CJCS) while they are flying aboard the 'blue and white' fleet.
 
 The tech stack includes:
 - Javascript
 - Bootstrap
 - jQuery
 - Sharepoint REST API

While the dashboard is written using outdated Bootstrap and jQuery, this is due to the technical limitations of the government sharepoint. There was also a limitation of Air Force regulation when deciding whether this would be a standalone application or hosted on Sharepoint. Unfortunately due to certain politics, it had to be built on Sharepoint but I was still able to create a system that is utilized on a day to day basis and runs stable.

The entire backend is ran on top of sharepoint utilizing list's as a database.
 
 # Demo Image
 ![An overview of the flight schedule page on a relatively slow day](https://github.com/leighton-tidwell/gnoc-dashboard/blob/dev/demo-images/dashboard.png?raw=true)
