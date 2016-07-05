# echo-coloringpage-printer
A simple Alexa Skill to print coloring pages using Lambda and a Raspberry Pi with Node.JS

<h3>PI</h3>
1. Install CUPS on your Pi & add your printer there is a good guide here: http://www.penguintutor.com/linux/printing-cups
2. npm install
3. update configuration
4. if you want to use https & basic auth (recommended, configure them now)

<h3>ALEXA</h3>
1. Create a new Alexa Skill 
2. Name it whatever you like and set your invocation name - I used 'Pi' because it was easy for the kids but they've since had me change it a few times for them.
3. Next Set up the interaction model
4. In this repo's echo folder you'll find the intent schema, sample utterances and the person slot type, all of which you can copy/paste into the text boxes. For the person slot type, you can also add your kids' names, they get a kick out of having Alexa say their name back when she responds to the skill.
5. Back on the skill information screen, copy the Application ID and head over to AWS to set up the Lambda before continuing with the skill.

<h3>LAMBDA</h3>
1. Create a new Lambda function in N. Virigina
2. Skip the blueprint and choose Node.js 4.3
3. Using the files in this repo's lamba folder (update options.js with your information)
4. Zip only the files in the lamba folder and updload to AWS
5. Create a role for Basic Execution Type with the least possible resources
6. Click next and choose Alexa Skills Kit as Event Source
7. Copy the ARN for your new Lambda function
8. Head back over to the Alexa Skills Console and add the Lambda ARN to to the Skill Information section
