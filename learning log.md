Structure:
1. Date
2. What I learnt
3. What I built/did to apply the skill
4. Problems I encountered


24/02/2026:

I researched various cloud storage options for our project and decided to continue forward with mongoDB because it was free and I saw that it was easy to use and I had heard of it before so I was confident in its reliability.

I set up a cluster and downloaded the example node.js application so that I could learn how to implement it in my own code. My next step is to learn the basics of how to implement the mongoDB database into my express requests.

27/02/2026:

Using the mongoDB documentation I installed an example repository and used that to learn some of the syntax required to read and write data from the cluster I wanted including all of the CRUD operations that I might need depending on my requirements.

21/04/2026:

I began to apply the the knowledge I had been learning to the collaborative project I am working on.

Using the MongoDB Node.js driver documentation alongside some YouTube tutorials I connected the SEAM app to a live MongoDB cluster so that all project data is stored and retrieved from the database rather than being stored as variable in the app.js file.

I built Express API endpoints to handle reading and writing to the cluster: a GET to fetch all projects on page load, a POST to insert a new project, and a PATCH to update an existing one when the designer saves changes. I used driver methods like insertOne, updateOne and find, and learned how MongoDB automatically assigns an _id to each document which I then had to handle on the frontend.

A problem I encountered was stale server instances accumulating in the background during development, which meant old processes without the updated routes were still holding port 3000 and causing 404 errors on the new endpoints. To fix this I just needed to make sure I remember to stop the server before closing the console so that my server requests weren't being picked up by a stale server

27/04/2026:

I realised after looking at some more example applications using mongoDB that I had my password string to access the cluster in my web.js file so I had to use npm's dotenv to store the variable and add it to a gitignore

Also realised as I changed location I had to change which ip were whitelisted to make changes to the cluster

I realised that I wanted the access to the mongoDB cluster not to be dependent on the ip address but the user, so I looked into adding an authentication process that uses timed sessions to grant the user access to post/patch requests. 

This meant learning about express-sessions and learning about cookies. I learnt that a session_secret is used to stop people from hijacking and tamplering with the session as the secret must stay constant for the session to continue. 

For the purposes of this project I made the session last until the browser is closed, and made the login credentials unchangeable in the .env file for security. I did this by not assigning a maxAge to the cookie.

I ran into the issue with MongoDB that I needed to specify each ip address individually for them to be able to access the app but I wanted it to be accessible from anywhere so I did that by adding 0.0.0.0 into the allowed ip's as that allows access from all ip addresses.

28/04/2026:

I wanted to find a way to allow the user to search all of the current projects by relevant fields like the name, supplier and the project notes. After some google searching I found that mongoDB has a feature that does this through it's $text queries. It also allows me to sort the results of the search by relevance as when it does a search it can return a $meta: textscore from which I can filter and then sort the results accordingly. 

I realised after implementing the $text search that it is mainly meant for natural language searches and uses "word stemming" which reduces the words down to their root form and matches through that. This meant that when I wanted to quickly search for some items I would have to type out the whole word correctly or it wouldn't show up, as the item's names are names not natural language. 

I looked for another alternative and found $regex through the mongoDB documenation. This is a better alternative as it matches any substring within a field value, which wouldn't be suitable for querying a large dataset but in my context it works much better and is much easier for the user to search with.

Another change I had to make here was to use the logical operator $or to search over multiple fields as the $text search functions by searching the predetermined fields that I specified with db/createIndex(fields: {"text", etc.}) whereas with $regex searching mongoDB doesn't know which fields to search over so I have to specify with $or.

https://www.mongodb.com/resources/languages/mongodb-and-npm-tutorial

https://oneuptime.com/blog/post/2026-03-31-mongodb-regex-queries/view#:~:text=MongoDB%20uses%20Perl%20Compatible%20Regular,native%20JavaScript%20regex%20literal%20syntax.

