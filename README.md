# echo-coloringpage-printer
A simple Alexa Skill to print coloring pages using Lambda and a Raspberry Pi with Node.JS

<h3>PI</h3>
1. Install CUPS on your Pi & add your printer there is a good guide here: http://www.penguintutor.com/linux/printing-cups
2. install/upgrade node to 4.4.7+
3. copy printable files to a folder on your PI (I created a pages folder under the root dir with ~1k coloring pages)
4. npm install pserver.js
5. create settings.json from example and update with your settings 
6. configure basic auth (recommended but not required - see code in pserver.js for how to configure)
7. configure https (recommended but not required - see code in pserver.js for how to configure [I used letsencrypt.org for my cert])
8. npm start from the project root directory will start your print server 
9. Once your are sure that everything is working, I recommend using forever (or another service daemon) to manage the pserver process in the background.

<h3>ALEXA</h3>
1. Create a new Alexa Skill 
2. Name it whatever you like and set your invocation name - I used 'em' because it was easy for the kids and thats what they wanted to call it...
3. Next Set up the interaction model
4. In this repo's echo folder you'll find the intent schema, sample utterances and the person slot type, all of which you can copy/paste into the text boxes. For the person slot type, you can also add your kids' names, they get a kick out of having Alexa say their name back when she responds to the skill.
5. Back on the skill information screen, copy the Application ID and head over to AWS to set up the Lambda before continuing with the skill.

<h3>LAMBDA</h3>
1. Create a new Lambda function in N. Virigina
2. Skip the blueprint and choose Node.js 4.3
3. Create options.js from example and update with your settings
4. Zip only the files in the lamba folder and updload to AWS
5. Create a role for Basic Execution Type with the least possible resources
6. Click next and choose Alexa Skills Kit as Event Source
7. Copy the ARN for your new Lambda function
8. Head back over to the Alexa Skills Console and add the Lambda ARN to to the Skill Information section

<h3>PRINT</h3>
1. ALEXA, Ask 'em' to print me 3 coloring pages.
2. Order more ink and paper...
