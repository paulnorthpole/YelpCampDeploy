#YelpCampDeploy

##https://peaceful-retreat-83895.herokuapp.com/

link to hosting for server and database

to update live site...

    1. push changes to github.
    2. when ready to deploy..
        a. git push heroku master

For hiding passwords and tokens

    1. install dotenv from node
        a. npm i -S dotenv
        b. require it on page
            a. dotenv = require("dotenv").config()
            b. create a .env file in root
            c. add key value pairs to file
        c. use process.env.KEY where you want to keep secret
            a. dont add .env file to version control

    2. export <name>=<secret>
       export GMAILPW=ourPassword in the terminal
       this will allow you to access the key with  process.env.GMAILPW
