# CS 171 Final Project - In the Eyes of The Survivors
URL to the project: https://kjurkowskihcs.github.io/cs171-final_project/
URL to screencast:

## Overview of the project
A major component of the project is interaction on the map itself. On the map are dynamic paths of survivors that update with pink and red circle events as years go by when using the time slider, along with blue square concentration camps that show up on the year they were opened. Every circle and square on the map itself is interactive, and provides the user with more information than at first glance. A simple hover over a blue square camp provides basic information, like its year of opening and location, while a hover over a pink or red circle shows the name of the person, the location, and basic info about the event. 

These are all able to be clicked on, which provides interactive popup modals with additional information for the user. These modals vary depending on the symbol clicked on the map and its type. For example, when clicking on a blue square concentration camp, a user will be shown a screen with detailed information on the camp, such as dates of operation, camp type, amount of prisoners and deaths, and so on. If the user clicks on the highlighted blue square camp known as Auschwitz, more data will be available in the modal, as Auschwitz was a well-documented concentration camp, and also the most gruesome. Here a user will be met with basic info on the camp as well, but will also have tabs to explore that provide interactive visualizations on various data metrics for the camp. One tab will explore Auschwitz by its ethnical makeup, while two others will break down Auschwitz by arrivals, while both show the immense numbers of people brought into these camps, and the large number that died there. A fact generator tab will also allow users to explore various facts about this most famous concentration camp. In turn, if a user clicks on a red or pink circle….
Talk about schemas for modals
Talk about slider
Talk about my libraries in libraries section
Add a reference section to readme

Explain start mask and finish mask + functionality, instructions, and finish mask buttons


## Structure of the project

## Data used
There are 4 data sets that are used in this project:

1. `camp_data` and `camp_img` – contains data on 60 major Nazi concentration camps in Europe between 1933 and 1945. The data was collected based on the Wikipedia page on Nazi concentration camps in Europe. Each line of the file includes 
camp name, country today, camp type, dates of use, estimated number of prisoners, estimated number of deaths, latitude, longitude, photo name, photo source and photo description. The images were collected online from Wikimedia, United States Holocaust Memorial Museum and museums in former concentration camps. CSV file with the data contains links to the original source for each photo used.

2. `arrivals_data` – contains demographic data on arrivals to Auschwitz between 1941 and 1945. The data comes in it's entirety from the book "How many people died in Auschwitz?" (in Polish) published by the Museum of Auschwitz – 
Piper, F. (1992). Ilu ludzi zginęło w KL Auschwitz : Liczba ofiar w świetle źródeł i badań 1945-1990. Oświęcim: Wydawn. Państwowego Muzeum w Oświęcimiu.

3. `prisoners_data` – is the data collected from an online research on 4 individuals who used to be prisoners at Auschwitz at some point of the war. The informations were obtained mostly from news articles and Wikipedia pages. The CSV file contains  a link to a source for each data point.

4. `auschwitz_data` – is a collection of different demographic data on prisoners at Auschwitz. The data comes in its entirety from the collections of the Museum at Auschwitz.
