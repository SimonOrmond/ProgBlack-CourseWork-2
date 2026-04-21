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

A problem I encountered was stale server instances accumulating in the background during development, which meant old processes without the updated routes were still holding port 3000 and causing 404 errors on the new endpoints.

