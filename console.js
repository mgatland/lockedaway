/*
Ludum Dare 24 entry by Matthew Gatland.

// version 1.1 - with the following changes:
// - changed some words for bechdel test reasons
// - made the ending of the game a tiny bit more obvious
// - fixed a typo 'admistrator'
// - 

// version 1.0 was the original end-of-compo release.

Some of the code in this program is copied from the HTML 5 terminal example 
at http://www.htmlfivewow.com/demos/terminal/terminal.html by Eric Bidelman.
 That code is copyright 2011 Google Inc and licensed under the Apache License, Version 2.0.
 See Eric Bidelman's original code for the full copyright and usage details.
 Note that the code here has been modified and is not the same as the original.
*/


 var interlace_ = document.querySelector('.interlace');
 var container_ = document.getElementById('container');
 var cmdLine_ = container_.querySelector('#input-line .cmdline');
 var output_ = container_.querySelector('output');
 var history_ = [];
 var histpos_ = 0;
 var histtemp_;
 
 //Clicking on bold words adds them to the output
 output_.addEventListener('click', function(e) {
 var el = e.target;
 console.log(el.localName);
 //if (el.classList.contains('file') || el.classList.contains('folder')) {
 if (el.localName == 'b') {
 cmdLine_.value += ' ' + el.textContent;
 }
 }, false);
 
 //clicking ANYWHERE will select the input line.
 window.addEventListener('click', function(e) {
 cmdLine_.focus();
 }, false);
 // Always force text cursor to end of input line.
 cmdLine_.addEventListener('click', inputTextClick_, false);
 function inputTextClick_(e) {
 this.value = this.value;
 }
 
 // setting things up
 
 cmdLine_.addEventListener('keydown', processNewCommand_, false);
 cmdLine_.addEventListener('keyup', historyHandler_, false); // keyup needed for input blinker to appear at end of input.
 
 output("Welcome to the future, detective!");
 output("It's the year 2000. Technology has evolved since your time. Unfortunately, crime is still common. ");
 output("Type <b>help</b> then press ENTER for instructions on using this e-Terminal.");
 output("Type <b>assignment</b> and ENTER to recieve your first assignment.");
 
 var state_unchecked = "unflagged";
 var state_to_question = "to_question";
 var state_has_alibi = "has_alibi";
 var suspect_states = [state_unchecked, state_to_question, state_has_alibi];
 
 //////////////////////////////////// Global world data: 
 var locs = {};
 
 // Domain locations
 var Tribeca = "Tribeca_Restaurant";
 var Museum_of_Lasers = "Museum_of_Lasers";
 var Dbooks = "Digital_Books_For_Less";
 
 locs[Tribeca] = [20, 45];
 locs[Museum_of_Lasers] = [20,40];
 locs[Dbooks] = [25,55];

 // Downtown locations - queen street runs from 0,0 to 0, 20
 var CityCoffee = "City_Coffee";
 var FoodCity = "FoodWorld_Metro";
 var Haircuts = "Indulgimax_Styles";
 var SingletStore = "Simply_Singlets"; //2
 var Kebabs = "Kebabs_On_Queen";
 var CityPets = "Central_City_Pet_Repairs";
 var CityMeals = "Burger_Master";
 var Video_Phone_Booth = "Video_Phone_Booth"; //assignment 2
 
 locs[CityCoffee] = [0, 5];
 locs[Video_Phone_Booth] = [0, 6];
 locs[SingletStore] = [0,8];
 locs[FoodCity] = [0,10];
 locs[CityMeals] = [0,12];
 locs[Haircuts] = [0,15];
 locs[Kebabs] = [0,16];
 locs[CityPets] = [4,10];
 
 //Mt Eden locations
 var MtEdenVet = "Mt_Eden_Pet_Repairs";
 var Fraisers = "Fraisers_Cafe";
 var MtEdenTrain = "Mt_Eden_Transport_Tube";
 locs[MtEdenVet] = [60, 25];
 locs[Fraisers] = [60, 35];
 locs[MtEdenTrain] = [60,60];
 
 var level = 0;
 var won = 0;
 
 //////////////////////////////// First assignment:

 //Sally was in Mission Bay (suspect)
 //Ruby was downtown (innocent)
 //Kamakshi was in Mt Eden (innocent)
 
 var a1_Sally = "Sally_Steven";
 var a1_Ruby = "Ruby_Robinson";
 var a1_Farah = "Farah_Prince";
 
 var suspects = [];
 var suspects_a1 = [
 {name: a1_Sally, state: suspect_states[0] },
 {name: a1_Ruby, state: suspect_states[0] },
 {name: a1_Farah, state: suspect_states[0] }
 ];
 
 var transactions = {};
 transactions[a1_Sally] = [ "2000-03-04--10:00 Meal ($33) at <b>" + Tribeca + "</b>", 
 "2000-03-04--11:00 Books ($27) at <b>" + Dbooks + "</b>", 
 "2000-03-04--14:00 Meal ($12) at <b>" + CityCoffee + "</b>",
 "2000-03-04--14:10 Call ($3) at <b>" + Video_Phone_Booth + "</b>" ];
 
 transactions[a1_Ruby] = [ "2000-03-04--10:20 Haircut ($65) at <b>" + Haircuts + "</b>", 
 "2000-03-04--11:00 Misc ($25) at <b>" + FoodCity + "</b>",
 "2000-03-04--11:40 Call ($2) at <b>" + Video_Phone_Booth + "</b>"];
 
 transactions[a1_Farah] = [ "2000-03-04--09:55 Service ($90) at <b>" + MtEdenVet + "</b>", 
 "2000-03-04--11:00 Meal ($25) at <b>" + CityCoffee + "</b>",
 "2000-03-04--16:00 Books ($33.50) at <b>" + Dbooks + "</b>", 
 "2000-03-04--19:00 ticket ($18) at <b>" + MtEdenTrain + "</b>" ];
 
 // Second assignment:
 //the theft happened at 16:00 by someone with brown hair, scared of dogs. eating a chicken burger.
 var a2_Nick = "Nicholas_Nightfighter"; // his hair proves his innocence
 //var a2_Tim = "Tim_Quittes"; // confidence with dogs puts him in the clear (removed to make it easier.)
 var a2_Gyurme = "Gyurme_Griffiths"; // he's the one!
 var a2_Shane = "Shane_Goss"; // his veganism rules him out
 
 //All these suspects are close to the scene of the crime.
 //Maybe have some more who are far away... do the assignment in two stages.
 
 var suspects_a2 = [
 {name: a2_Nick, state: state_unchecked },
 // {name: a2_Tim, state: state_unchecked },
 {name: a2_Gyurme, state: state_unchecked },
 {name: a2_Shane, state: state_unchecked },
 ];
 
 transactions[a2_Nick] = [ "2000-03-04--15:00 Meal ($12) at <b>" + Kebabs + "</b>", 
 "2000-03-04--15:45 Haircut ($64) at <b>" + Haircuts + "</b>",
 "2000-03-04--16:15 Books ($25) at <b>" + Dbooks + "</b>"];
 
 // transactions[a2_Tim] = [ "2000-03-04--11:00 Service ($244) at <b>" + CityPets + "</b>", 
 // "2000-03-04--15:30 Misc ($120) at <b>" + FoodCity + "</b>"];
 
 transactions[a2_Gyurme] = [ "2000-03-04--13:00 Clothes ($90) at <b>" + SingletStore + "</b>", 
 "2000-03-04--16:30 Haircut ($25) at <b>" + Haircuts + "</b>"];
 
 transactions[a2_Shane] = [ "2000-03-04--07:15 Food ($15) at <b>" + CityCoffee + "</b>",
 "2000-03-04--07:30 Call ($3) at <b>" + Video_Phone_Booth + "</b>",
 "2000-03-04--12:20 Meal ($25) at <b>" + CityMeals + "</b>"];
 
 logs = [];
 logs[FoodCity] = ["We have not seen anything of interest."];
 //logs[CityPets] = ["11:00 - Tim came in with his robo-poodle. It had a shorted motivator. Fortunately, Tim's very good with dogs and he knew to bring it in to us right away.",
 // "13:00 - New box of kitten parts arrived! I'm going to build a few before the end of the day."];
 
 logs[Video_Phone_Booth] = [ "TELECOM VIDEO PHONE BOOTH - LOGS FOR March 4th 2000:", 
 "Note: for privacy reasons we do NOT display call information in this log.",
 "2000-03-04--15:59 WARNING: Login as 'admin' failed.",
 "2000-03-04--16:00 ERROR: PHYSICAL DAMAGE.",
 "2000-03-04--16:02 WARNING: Vandalism detected. Contacting police department.",
 "2000-03-04--16:02 WARNING: Security settings updated.",
 "2000-03-04--16:02 INFO: Administrator user logged in.",
 "Searching call records for 'laser'...",
 "at 07:30 " + a2_Shane + " to Peter_Fish: ... laser show last night was awesome, I ...",
 "Searching call records for 'stole'...",
// 2012-08-29: changed so that we pass the bechdel test :\
// "at 11:40 " + a1_Ruby + " to Emma_Robinson: ... stole her boyfriend but it wasn't even like that...",
 "at 11:40 " + a1_Ruby + " to Emma_Robinson: ... stole our game idea! We can't even ...",
 "Searching call records for 'hidden'...",
 "at 13:10 " + a1_Sally + " to [MISSING]: ... hidden the you-know-what with our friend Macduff. If you know what I mean. Bye.",
 "2000-03-04--16:05 INFO: Administrator user logged out."];
 
 logs[Kebabs] = ["11:30 AM - out of BBQ sauce again, ordered more.",
 "1:30 PM - lots of customers, ran out of Garlic Yoghurt sauce, ordered more.",
 "4:30 PM - too many customers, ran out of BBQ sauce. Ordered more BBQ sauce."];
 
 logs[Haircuts] = ["Hello new staff, please greet our regulars by name if you can. Here are today's appointments:",
 "10:00 - Ruby. She'll have curly brown hair this time. Ask if she's here for 'the usual', this is our running joke :D",
 "11:00 - Louise Franklin. Older woman, brown hair.",
 "13:00 - Joe. Straight black hair, beard.",
 "15:15 - Nicholas Nightfighter. Blonde, crew cut.",
 "16:15 - Gyurme. Friendly, outgoing guy."];
 
 logs[SingletStore] = ["We sold 57 singlets today. Mainly white ones, but a few coloured ones as well."];
 
 logs[MtEdenTrain] = ["Mount Eden Transport Tube",
 "Notice: In compliance with the privacy act of 1999, we do not log information about individual passengers.",
 "Updated prices: ",
 "Whangarei - $12",
 "Warkworth - $6",
 "Hamilton - $6",
 "New_Plymouth - $18",
 "Wellington - $22",
 "",
 "We now support online bookings! Just use the command 'travel_by_tube [destination]'"
 ];
 
 var destinations = ["Whangarei", "Warkworth", "Hamilton", "New_Plymouth", "Wellington"];
 
 //removed the part about dogs that proved Tim's innocence.
 //He seemed terrified of dogs, apparently - our customers said he waited for a small dog to move away from the booth before approaching it. Stared at the dog the whole time. The customers thought it was funny. 
 logs[CityCoffee] = ["16:15 - some of the customers just saw someone break something in the phone booth across the road. It was a man with brown hair. Before he went into the booth, he loitered around outside it, eating a chicken burger. Then he went into the booth and started doing something to the machine. He ran off a few minutes later."];

 logs[CityMeals] = ["10:00 AM. Looks like it's going to be a slow day, no customers yet.",
 "1:00 PM. Only four customers over the lunch hour - a vegan man, and a group of four women. Business is not going well today.",
 "3:00 PM. Someone just left without paying for their chicken burger! I don't believe it."];
 
 //log for later
 
 logs[Dbooks] = ["Books sold today",
 "Catch Me If You Can, by F. Abagnale - $27",
 "Gargoyles In Celtic Legend, by L. Macduff - $33.50",
 "The Beauty Myth, by N. Wolf - $25"];
 
 logs[MtEdenVet] = ["Nice to see Farah again. Gave her budgie its regular six-monthly servicing."];
 logs[Museum_of_Lasers] = ["16:27 UNAUTHORIZED REMOVAL DETECTED. SEALING ALL EXITS.",
 "16:37 It looks like the thief has already left the building, so I'm opening the exits again. No-one saw the thief, but our guards say they heard a woman's voice. I'm making a police report now.",
 "17:00 The thief stole a very valuable and unique artefact, a digitizing laser. It was used for turning real objects into digital objects, but became a museum piece because it never properly worked." ];
 
 
 logs[Tribeca] = ["Today's specials: Duck on rice with salad, rice with salad, duck with salad, duck with rice."];
 
 ///////////////////////////////////////////// Act III
 
 var state_arrested = "--in_custody--";
 var suspects_a3 = [
 {name: a1_Sally, state: state_arrested },
 {name: a1_Ruby, state: state_unchecked },
 {name: a1_Farah, state: state_unchecked },
 {name: a2_Nick, state: state_unchecked },
 {name: a2_Gyurme, state: state_arrested },
 {name: a2_Shane, state: state_unchecked },
 ];
 
 
 // below: function definitions only.
 
 function distance(start, end) {
 var startX = locs[start][0];
 var startY = locs[start][1];
 var endX = locs[end][0];
 var endY = locs[end][1];
 var dist = (startX - endX) * (startX - endX) + (startY - endY) * (startY - endY);
 dist = Math.floor(Math.sqrt(dist));
 return dist;
 }
 
 function isSuspect(susName) {
 var suspect = getSuspectByName(susName);
 if (suspect) return true;
 return false;
 }
 
 function getSuspectByName(susName) {
 var suspect = null;
 suspects.forEach(function(entry, i) {
 if (entry.name == susName) {
 suspect = entry;
 }
 });
 return suspect;
 }
 
 function processNewCommand_(e) {
 /* // Beep on backspace and no value on command line.
 if (!this.value && e.keyCode == 8) {
 bell_.stop();
 bell_.play();
 return;
 } */
 if (e.keyCode == 13) { //enter
 //save history
 
 // Duplicate current input and append to output section.
 var line = this.parentNode.parentNode.cloneNode(true);
 line.removeAttribute('id')
 line.classList.add('line');
 var input = line.querySelector('input.cmdline');
 input.autofocus = false;
 input.readOnly = true;
 output_.appendChild(line);
 
 //update history
 if (this.value) {
 history_[history_.length] = this.value;
 histpos_ = history_.length;
 }
 
 // Parse out command, args, and trim off whitespace.
 if (this.value && this.value.trim()) {
 var args = this.value.split(' ').filter(function(val, i) {
 return val;
 });
 var cmd = args[0].toLowerCase();
 args = args.splice(1); // Remove cmd from arg list.
 
 switch (cmd) {
 case 'assignment':
 
 if (level == 0) {
 level++;
 won = 0;
 suspects = suspects_a1;
 } else if (level == 1 && won) {
 level++;
 won = 0;
 suspects = suspects_a2;
 } else if (level == 2 && won) {
 level++;
 won = 0;
 suspects = suspects_a3;
 } else if (level == 3 && won) {
 output("We have no new assignments for you, detective. You're off duty until Monday. Go take a break, you've earned it!");
 break;
 }
 if (level == 1) {
 output("Someone broke into the <b>" + Museum_of_Lasers + "</b> at timecode <b>2000-03-04--10:23</b>.");
 output("We have a list of <b>suspects</b>.");
 output("Check each suspect's <b>transactions</b> history. This shows exactly where they were at certain times.");
 output("Check the <b>distance</b> between their locations and the crime scene.");
 output("If they did not have time to reach the <b>" + Museum_of_Lasers + "</b> at 10:23, <b>flag</b> the suspect as '<b>" + state_has_alibi + "</b>'.");
 output("If they did have enough time to reach the crime scene, <b>flag</b> the suspect as '<b>" + state_to_question + "</b>'.");
 output("When you have updated each suspect's status, <b>submit</b> your report.");
 output("Use the <b>help</b> command for instructions on using this terminal.");
 break;
 }
 if (level == 2) {
 output("Someone vandalized a <b>" + Video_Phone_Booth + "</b> downtown.");
 output("We have a list of <b>suspects</b>.");
 output("We know all of these suspects were near the crime scene, so you don't have to check the distances this time.");
 output("(We had the intern to do that already.)");
 output("You'll have to dig deeper. I'm giving you access to the <b>logbook</b> files of local businesses.");
 output("Look at the <b>logbook</b> files and the suspect's <b>transactions</b>.");
 output("Try to find evidence that can rule out any of our potential suspects.");
 output("Start by checking the nearby <b>" + CityCoffee + "</b>'s logbook for eye-witness reports.");
 output("Good luck!");
 output("(Pro-tip: you can click on any blue word to automatically type it into the console.)");
 break;
 }
 if (level == 3) {
 output("We have arrested <b>" + a1_Sally + "</b> from your first assignment.");
 output("We found the stolen laser on her. Unfortunately, it's missing a tiny and very valuable key piece.");
 output("She must have given it away or hidden it somehow.");
 output("You have access to the <b>logbook</b>s and <b>transactions</b>.");
 output("Start with Sally, and try to find a clear link to one of our other <b>suspects</b>!");
 }
 break;
 case 'help':
 output("Type in a command and press enter to execute it.");
 output("Use the up and down arrows to access previously used commands.");
 output("Click on any highlighted word to auto-type it into the command prompt.");
 output("If you get stuck, use the <b>walkthrough</b> command for a step-by-step guide to complete the job.");
 output("Commands: <b>assignment</b>, <b>help</b>, <b>suspects</b>, <b>flag</b>, <b>transactions</b>, <b>distance</b>, <b>submit</b>.");
 if (level >= 2) {
 output("Level 2 commands: <b>logbook</b>.");
 }
 //ouput("<b>assignment</b>, <b>help</b>, <b></b>, <b></b>, <b></b>, <b></b>");
 break;
 case 'walkthrough':
 output("For the first assignment:");
 output("Use <b>assignment</b> to view the assignment.");
 output(" Use the <b>suspects</b> command to see the list of suspects.");
 output(" Use <b>transactions</b> [suspect] to see where a suspect was during the day of the crime.");
 output(" Use <b>distance</b> [location] [location] and work out if the suspect could have reached the <b>" + Museum_of_Lasers + "</b> in time.")
 output(" Use <b>flag</b> [name] [verdict] to mark the suspect as <b>" + suspect_states[1] + "</b> or <b>" + suspect_states[2] + "</b> based on your findings.");
 output(" Once you have researched each suspect, use the <b>submit</b> command to submit your report.");
 break;
 case 'suspects':
 if (!suspects.length) {
 output("There are no suspects. You must start an <b>assignment</b> first.")
 break;
 }
 output("These are the current suspects:");
 suspects.forEach(function(entry, i) {
 output("- <b>" + entry.name + "</b> status: <b>" + entry.state + "</b>");
 });
 output("You must <b>flag</b> every suspect as <b>" + state_has_alibi + "</b> or <b>" + state_to_question + "</b> before you can <b>submit</b> your report.");
 break;
 case 'flag':
 if (args.length != 2) {
 output('usage: ' + cmd + ' [suspect] [status]');
 output('This command will update the status of the suspect.');
 output('Possible values for status are: <b>' + suspect_states.join('</b>, <b>') + '</b>');
 break;
 }
 if (!isSuspect(args[0])) {
 output(args[0] + " is not a valid suspect.");
 break;
 }
 if (suspect_states.lastIndexOf(args[1]) < 0) {
 output(args[1] + " is not a valid status.");
 output('Possible values for status are: <b>' + suspect_states.join('</b>, <b>') + '</b>');
 break;
 }
 var sus = getSuspectByName(args[0]);
 if (sus.state == state_arrested) {
 output("You cannot flag a suspect who is already arrested.");
 break;
 }
 sus.state = args[1];
 output("- <b>" + sus.name + "</b> status: <b>" + sus.state + "</b>");
 break;
 case 'transactions':
 if (!args.length) {
 output('usage: ' + cmd + ' [suspect]');
 output('This command will show the transaction history for a suspect.');
 break;
 }
 args.forEach(function(susName, i) {
 if (isSuspect(susName)) {
 output("<b>" + susName + "</b> transactions:");
 if (transactions[susName] && transactions[susName].length) {
 transactions[susName].forEach(function(entry, i) {
 output(" " + entry);
 });
 } else {
 output("no transactions found.");
 }
 } else {
 output(susName + " is not a suspect, or you do not have jurisdiction to access their personal information.");
 }
 });
 
 break;
 case 'logbook':
 if (level < 2) {
 output("You do not have permission to view logbooks.");
 break;
 }
 if (!args.length) {
 output('usage: ' + cmd + ' [location]');
 output('This command will show the logbook for a business or location.');
 break;
 }
 args.forEach(function(location, i) {
 output("<b>" + location + "</b> logbook:");
 if (logs[location] && logs[location].length) {
 logs[location].forEach(function(entry, i) {
 output(" " + entry);
 });
 } else {
 output("no record found for that business or location.");
 }
 });
 break;
 case 'distance':
 if (args.length != 2) {
 output('usage: ' + cmd + ' [location_1] [location_2]');
 output("This command will calculate the travel time between two locations.");
 break;
 }
 var start = args[0];
 var end = args[1];
 if (!locs[start]) {
 output(start + " is not a known location.");
 break;
 }
 if (!locs[end]) {
 output(end + " is not a known location.");
 break;
 }
 output("Driving from <b>" + start + "</b> to <b>" + end + "</b> would take " + distance(args[0], args[1]) + " minutes.");
 break;
 case 'submit':
 if (level == 0 || won) {
 output("No assignment is open. You must have an <b>assignment</b> open before you can submit.");
 break;
 }
 var unknowns = 0;
 var innocents = 0;
 var to_questions = 0;
 suspects.forEach(function(entry, i) {
 if (entry.state==state_unchecked) {
 unknowns++;
 } else if (entry.state==state_has_alibi) {
 innocents++;
 } else if (entry.state==state_to_question) {
 to_questions++;
 }
 //ignore arrested suspects.
 });
 //every suspect must be flagged.
 if (unknowns > 0) {
 output("ERROR: You must flag every suspect before submitting your report.");
 output("Use the <b>suspects</b> command to check which suspects you have flagged.");
 break;
 }
 if (to_questions > 1) {
 output("submitting...");
 output("incoming message...");
 output("The boss says: I think you've made a mistake; only one subject should be brought in for questioning. The others all have an alibi, check those details again.");
 break;
 }
 if (to_questions < 1) {
 output("submitting...");
 output("incoming message...");
 output("The boss says: Hey, your report says we don't need to question anyone! That can't be right. Check those details again, detective!");
 break;
 }
 
 if (level == 1) {
 if (!(getSuspectByName(a1_Sally).state==state_to_question)) {
 output("submitting...");
 output("incoming message...");
 output("The boss says: Hey there. I think you've got the wrong suspect. You need to go over those transaction times again.");
 break;
 }
 //looks like you won
 output("submitting...");
 output("incoming message...");
 output("The boss says: Well done, Detective! We'll bring that suspect in for questioning.");
 output("The boss says: This job is complete. Use the <b>assignment</b> command to start your next assignment.");
 won = 1;
 suspects = [];
 } else if (level == 2) {
 if (!(getSuspectByName(a2_Gyurme).state==state_to_question)) {
 output("submitting...");
 output("incoming message...");
 output("The boss says: Hey there. I think you've got the wrong suspect. Check for evidence that might rule out a suspect.");
 break;
 }
 //looks like you won
 output("submitting...");
 output("incoming message...");
 output("The boss says: Good call. It looks like it could only be him. We'll bring him in.");
 output("The boss says: While you were working on that, we tracked down your last suspect.");
 output("The boss says: And you're going to want to take a look at this next <b>assignment</b> right away.");
 won = 1;
 suspects = [];
 } else if (level == 3) {
 if (!(getSuspectByName(a1_Farah).state==state_to_question)) {
 output("submitting...");
 output("incoming message...");
 output("The boss says: Hey there. I think you've got the wrong suspect. Try to work out who has the missing piece of the laser.");
 break;
 }
 output("submitting...");
 output("incoming message...");
 output("The boss says: I was hoping you wouldn't say that, detective. That suspect seems to have left town.");
 output("The boss says: Our computers can't access data from outside this city, so you can't help catch her any more.");
 output("The boss says: Anyway, thank you for your work tonight. We arrested two criminals out of three.");
 output("The boss says: It's your day off tomorrow. Why don't you get outside, go on a little vacation?");
 won = 1;
 //don't clear the suspects list.
 }
 break;
 case '2d':
 output("2d is fine too.");
 output("0_0");
 break;
 case 'jennie':
 won = 1;
 output("Seth has a crush on her.");
 break;
 case 'travel_by_tube':
 if (level != 3 || !won) {
 output("The boss says: Hey! Stop that. You're supposed to be solving crimes, not planning your next adventure!");
 break;
 }
 if (args.length != 1) {
 output('usage: ' + cmd + ' [destination]');
 output("Book tube travel using the cyber-network! It's fun and easy! Anyone can do it.");
 break;
 }
 switch (args[0]) {
 case "Whangarei":
 output("Ah, the winterless North. It's a beautiful place this time of year.");
 output("THE END");
 this.readOnly = true;
 break;
 case "Warkworth":
 output("A great town if you enjoy ducks.");
 output("THE END");
 this.readOnly = true;
 break;
 case "Hamilton":
 output("New Zealand's technology centre, Hamilton features the world's largest robot sheep.");
 output("THE END");
 this.readOnly = true;
 break;
 case "New_Plymouth":
 output("Is this really a vacation? Or are you still trying to crack the case?");
 output("It's 7:30 PM... she doesn't have much of a head start.");
 output("You don't have any security clearance outside this city. You won't have access to any transactions or logbooks.");
 output("If you're going to catch this suspect, you'll have to do it the old fashioned way: Using your eyes and talking to people.");
 output("Well. Maybe that's exactly the kind of vacation you really need...");
 output("THE END");
 this.readOnly = true;
 break;
 case "Wellington":
 output("The former capital. The old government buildings are now an amazing laser tag venue.");
 output("THE END");
 this.readOnly = true;
 break;
 default:
 output(args[1] + " is not a valid destination.");
 break;
 }
 break;
 default:
 output(cmd + " is not a valid command.");
 }
 } else {
 //no command executed
 cmdLine_.scrollIntoView();
 }
 
 this.value = ''; // Clear/setup line for next input.
 
 var docHeight = util.getDocHeight();
 interlace_.style.height = docHeight + 'px';
 
 }
 }
 
 function output(html) {
 outputRaw("<div>" + html + "</div>");
 }
 
 function outputRaw(html) {
 output_.insertAdjacentHTML('beforeEnd', html);
 cmdLine_.scrollIntoView();
 }
 
 function historyHandler_(e) {
 if (e.keyCode == 38 || e.keyCode == 40) {
 if (history_[histpos_]) {
 //history_[histpos_] = this.value; I don't like this feature
 } else {
 histtemp_ = this.value;
 }
 
 }
 
 if (history_.length) {
 if (e.keyCode == 38) { // up
 histpos_--;
 if (histpos_ < 0) {
 histpos_ = 0;
 }
 } else if (e.keyCode == 40) { // down
 histpos_++;
 if (histpos_ > history_.length) {
 histpos_ = history_.length;
 }
 }

 if (e.keyCode == 38 || e.keyCode == 40) {
 this.value = history_[histpos_] ? history_[histpos_] : histtemp_;
 this.value = this.value; // Sets cursor to end of input.
 }
 }
 }
 
var util = util || {};

// Cross-browser impl to get document's height.
util.getDocHeight = function() {
 var d = document;
 return Math.max(
 Math.max(d.body.scrollHeight, d.documentElement.scrollHeight),
 Math.max(d.body.offsetHeight, d.documentElement.offsetHeight),
 Math.max(d.body.clientHeight, d.documentElement.clientHeight)
 );
};