var test1 = new Tests.astarTest();
test1.townProblemSetup();
document.write('Problem: travel between two given cities in the example problem \"Travel in Romania\". <br>');
document.write('Map available in <a href=\"https://github.com/AI-course-TIN172-DIT410/AI-lecture-slides/raw/master/ch03.pdf\">these lecture slides</a>, page 39.<br>');
document.write('Each line preceded by \"O:\" is output from the A* algorithm. <br>');
document.write('Each Line preceded by \"C:\" is the correct shortest path for that query, written manually to this page. <br>');
document.write('For proof of which lines are output from the algorithm, inspect the file \"performtests.js\". <br><br><br>');

document.write('Find path from Bucharest to Iasi: <br>');
document.write('O:');
test1.findPath('bucharest', 'iasi');
document.write('C:');
document.write('bucharest urziceni vaslui iasi<br>');
document.write('<br>Same search backwards, i.e. Iasi to Bucharest:<br>O:');
test1.townProblemSetup();
test1.findPath('iasi', 'bucharest');
document.write('<br><br>');

document.write('Find path from Arad to Bucharest: <br>');
document.write('O:');
test1.townProblemSetup();
test1.findPath('arad', 'bucharest');
document.write('C:');
document.write('arad sibiu vilcea pitesti bucharest<br>');
document.write('And backwards:<br>O:');
test1.townProblemSetup();
test1.findPath('bucharest', 'arad');

document.write('<br><br>');
document.write('Find path from Mehadia to Sibiu: <br>');
document.write('O:');
test1.townProblemSetup();
test1.findPath('mehadia', 'sibiu');
document.write('C:');
document.write('mehadia drobeta craiova vilcea sibiu<br>');
document.write('And backwards:<br>O:');
test1.townProblemSetup();
test1.findPath('sibiu', 'mehadia');
document.write('<br><br>');
