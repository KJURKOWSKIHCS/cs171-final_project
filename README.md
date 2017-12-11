# CS 171 Final Project - In the Eyes of The Survivors
URL to the project: https://kjurkowskihcs.github.io/cs171-final_project/

URL to screencast:

By Krystian Jurkowski, Karen Mardini, and Oskar Kocol

# Overview of the project
In the 20th century, the Nazi regime came to power and began a systematic extermination of European Jews and other ethnic groups that would become known as the Holocaust. Millions of innocent victims were killed, while others encountered horrors beyond our comprehension. In this interactive visualization, we hope to provide a way to share some of their stories, and exemplify just how horrific the Holocaust was. The project itself is comprised of an interactive map that shows the progression of paths of survivors and victims as years progress, while also showing the progression of concentration camps and deaths in the Holocaust. We focus on four individuals who experienced this traumatic event, and put a major emphasis on Auschwitz (which we make bigger than the other square camps). This is because the data was the best to find for Auschwitz, since it was the most well known and largest camp, which allowed us to create interactive visualizations in its modal.

We focus on the paths of these individuals and their stories to show a human connection to these victims in the wake of these tragedies.

# Project components
A major component of the project is interaction on the map itself. On the map are dynamic paths of survivors that update with pink and red circle events as years go by when using the time slider, along with blue square concentration camps that show up on the year they were opened. Every circle and square on the map itself is interactive, and provides the user with more information than at first glance. A simple hover over a blue square camp provides basic information, like its year of opening and location, while a hover over a pink or red circle shows the name of the person, the location, and basic info about the event. 

## Modals
These are all able to be clicked on, which provides interactive popup modals with additional information for the user. These modals vary depending on the symbol clicked on the map and its type. For example, when clicking on a blue square concentration camp, a user will be shown a screen with detailed information on the camp, such as dates of operation, camp type, amount of prisoners and deaths, and so on. If the user clicks on the highlighted blue square camp known as Auschwitz, more data will be available in the modal, as Auschwitz was a well-documented concentration camp, and also the most gruesome. Here a user will be met with basic info on the camp as well, but will also have tabs to explore that provide interactive visualizations on various data metrics for the camp. One tab will explore Auschwitz by its ethnical makeup, while two others will break down Auschwitz by arrivals, while both show the immense numbers of people brought into these camps, and the large number that died there. A fact generator tab will also allow users to explore various facts about this most famous concentration camp. In turn, if a user clicks on a red or pink circle….

## Modal schemas
The schemas for the modals are dynamically generated based on the type of symbol clicked on the map. For example, a generic camp modal schema will be loaded in when a camp other than Auschwitz is clicked on, and if Auschwitz is clocked, the specific Auschwitz modal schema will load in. This allows us to take care of having different information schemas show in relation to the interaction of the user.

## Map slider
The slider itself is made through using a jQuery UI library, and customized to fit our needs.

## Masks
Both the starting mask and finishing mask were implemented through using div covers and timeouts to give the project an appropriate tone and feel from the very beginning, and begin a unique storytelling process. The first mask deals with an introduction and a way to start the journey of map interaction, while the closing mask gives the user a summary of the paths of the indivuduals they tracked on the map. In turn, the closing mask allows ou to restart the journey, download the data, and meet the creators. Both after the starting mask and before the end of the closing mask, instructional modals are used to give the user an idea of how to use the website.

## Event Points

All points glow for a second when they newly enter the map.

Each event point is a circle that is attached to location data for each victim. The fill of the circle depends on whether or not it represents the latest step in the victim’s journey. The standard enter update exit d3 pattern is used. On a mouseover, a tool tip showing basic info shows up, as well as a glow to make it clear which point is being hovered over. Points can be clicked to bring up modal popups which contain images and more information about the people and their events.

Text labels and connectors attached to event points are also implemented using the standard pattern. Transitions are used to make it clear that there is movement on the map.

## Camp Points

Each camp is a rectangle that is attached to camp data (along with location, name, and other various information). The standard enter update exit d3 pattern is used. On a mouseover, a tool tip showing base info shows up, as well as a glow to make it clear which camp is being hovered over. Rectangles can be clicked to bring up modal popups which contain images and more information about the camps and their events. Auschwitz especially, which is the larger rectangle, has specialized information about its captives, including ethnicity and origin info.

# Custom Visualization

##Path Tracking Interactive Map

Our main visualization consists of the interactive map, which is the main view of the project. Here the user can explore the various paths of the survivors and victims, and see how their life journey progressed and was altered because of the Holocaust. In turn, a user can see the opening of concentration camps, and view the deaths of the Holocaust as the years progress. Each symbol on the map is interactive and provides more data, with a special focus on Auschwitz having its own interactive visualizations inside the camp modal.

## Auschwitz by Ethnicities

This visualization is located inside the Auschwitz modal on click of the Auschwitz concentration camp. It aims to show in a stacked bar chart the various ethnicities of people who came into Auschwitz, and the grim fact of how many of them died in comparison.

## Auschwitz by Arrivals

This visualization is also located inside the Auschwitz modal on click of the Auschwitz concentration camp. The goal of this visualization is to show the arrivals of various ethnic groups by month to Auschwitz, split up into the early and later stages of the Auschwitz camp, where a spike in arrivals deliminates these stages.

## Death Toll Collector

### Pool:

The main feature of the death toll collector is the liquid fill gauge placed at the bottom of the SVG that houses the map. While they were originally in separate SVGs, in order to allow for an uninterrupted path of the teardrop for a point representing a concentration camp into the actual fill gauge, the layout was modified to give the appearance of dripping.

Code for the liquid fill gauge was adapted from code from Curtis Bratton: http://choosealicense.com/licenses/bsd-2-clause/


With changes made to the originally circular gauges to make the clip path rectangular instead of circular, to remove textual elements, to modify dimensions, and to adapt wave heights, speeds, and colors.

### Drops:

A drop is made by manually specifying the points which are connected by lines, arcs and curves. Each drop is added as a d3 path element and is bound to the concentration camp data, including coordinates for longitude and latitude. The topmost starting tip of each tear is centered at the center of each concentration camp square, with a helper function which generates random numbers within a range to give the impression of a smattering of drops of blood, such that they don’t all begin from the same point. A final destination for each point in the drop is specified (with the origin offset by a random number so that not all drops fall down completely vertically) and a transition is called on the drops, from their beginning to their final location so that they move downwards smoothly, as if falling. When drops fall, the update gauge function is called, updating the height of the liquid fill gauge to reflect the number of total deaths to date.

# Structure of the project
The project has the following structure:
1. `css` - this folder contains all the CSS files. `style.css` is the file containing all of our styling for the websites. Other files are used by the libraries that we use (Bootstrap and jQuery).
2. `data` - contains all the data used by our project
3. `fonts` - contains fonts and glyphicons used by our project
4. `img` - contains all the images used by our project
5. `js` - contains all the Javascript files used by our project. We keep there both the libraries that we use and our own code. More details in the section `Libraries`.
6. `index.html` - This is where `html` template for our project sits

# Data used
There are 4 data sets that are used in this project:

1. `camp_` data – contains data on 60 major Nazi concentration camps in Europe between 1933 and 1945. The data was collected based on the Wikipedia page on Nazi concentration camps in Europe. Each line of the file includes 
camp name, country today, camp type, dates of use, estimated number of prisoners, estimated number of deaths, latitude, longitude, photo name, photo source and photo description. The images were collected online from Wikimedia, United States Holocaust Memorial Museum and museums in former concentration camps. CSV file with the data contains links to the original source for each photo used.

2. `arrivals_` data – contains demographic data on arrivals to Auschwitz between 1941 and 1945. The data comes in it's entirety from the book "How many people died in Auschwitz?" (in Polish) published by the Museum of Auschwitz.
> Piper, F. (1992). Ilu ludzi zginęło w KL Auschwitz : Liczba ofiar w świetle źródeł i badań 1945-1990. Oświęcim: Wydawn. Państwowego Muzeum w Oświęcimiu.

3. `prisoners.json` – is the data collected from an online research on 4 individuals who used to be prisoners at Auschwitz at some point of the war. The informations were obtained mostly from news articles and Wikipedia pages. The CSV file contains  a link to a source for each data point.

4. `auschwitz_` – is a collection of different demographic data on prisoners at Auschwitz. The data comes in its entirety from the collections of the Museum at Auschwitz.

## Libraries used
We used the following Javascript templates in our project:
1. `jQuery`
2. `Bootstrap`
3. `queue`
4. `topojson`
5. `d3-tip`
6. `jquery-ui`
7. `d3-legend`
8. `jquery.localScroll`
9. `jquery.scrollTo`

## References
- [Stacked Bar Chart](https://bl.ocks.org/caravinden/32a3d192e0e5f6af81f4bcc12adda8f7)
- [Slider](https://jqueryui.com/slider/#slider-vertical)
- [Mask Inspiration](https://github.com/codrops/FullscreenOverlayStyles)
- [Modals guidance](https://getbootstrap.com/docs/3.3/javascript/)
