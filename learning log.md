Structure:
1. Date
2. What I learnt
3. What I built/did to apply the skill
4. Problems I encountered


24/02/2026:

I researched various cloud storage options for our project and decided to continue forward with mongoDB because it was free and I saw that it was easy to use and I had heard of it before so I was confident in its reliability.

I set up a cluster and downloaded the example node.js application so that I could learn how to implement it in my own code.

27/02/2026:

Using the mongoDB documentation I installed an example repository and used that to learn some of the syntax required to read and write data from the cluster I wanted including all of the CRUD operation that I might need depending on my requirements.


21/04/2026:

I began to apply the the knowledge I had been learning to the collaborative project I am working on.

Using the MongoDB Node.js driver documentation alongside some YouTube tutorials I connected the SEAM app to a live MongoDB cluster so that all project data is stored and retrieved from the database rather than being hardcoded.

I built Express API endpoints to handle reading and writing to the cluster: a GET to fetch all projects on page load, a POST to insert a new project, and a PATCH to update an existing one when the designer saves changes. I used driver methods like insertOne, updateOne and find, and learned how MongoDB automatically assigns an _id to each document which I then had to handle on the frontend.

A problem I encountered was stale server instances accumulating in the background during development, which meant old processes without the updated routes were still holding port 3000 and causing 404 errors on the new endpoints. To fix this I just needed to make sure I remember to stop the server before closing the console so that my server requests weren't being picked up by a stale server

27/04/2026:

I realised after looking at some more example applications using mongoDB that I had my password string to access the cluster in my web.js file so I had to use npm's dotenv to store the variable and add it to a gitignore

Also realised as I changed location I had to change which ip were whitelisted to make changes to the cluster

I realised that I wanted the access to the mongoDB cluster not to be dependent on the ip address but the user, so I looked into adding an authentication process that uses timed sessions to grant the user access to post/patch requests. For the purposes of this project I made the session last until the browser is closed, and made the login credentials unchangeable in the .env file for security.

I ran into the issue with MongoDB that I needed to specify each ip address individually for them to be able to access the app but I wanted it to be accessible from anywhere so I did that by adding 0.0.0.0 into the allowed ip's as that allows access from all ip addresses.

https://www.mongodb.com/resources/languages/mongodb-and-npm-tutorial

