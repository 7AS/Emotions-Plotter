# Emotions plotter #

## Context

This project was developed for the course Visualisation de Données (spring 2022) taught by Isaac Pante (Université de Lausanne, Switzerland).

## Overview and data

This project aims to provide dynamic and interactive visualizations for the files exported by [EmoPlay](https://github.com/7AS/OOP_modified). Its main goal is to easily identify and categorize emotions extracted from speeches from a TEI-encoded theater play. It does a lot of work in background to provide concise, easily readable and dynamic visualizations.

The original plays are retrieved from [Projet Gutenberg](https://www.gutenberg.org/) and then converted to TEI-encoded theater plays by [GutenTag](http://www.projectgutentag.org).

Emotional analysis is performed by a series of python scripts, written (almost in whole) by the same author, and slightly modified to produce the desired output.

The full and modified version of the program can be found and downloaded [here](https://github.com/7AS/OOP_modified). It is then possible for anyone to generate their own CSV files from virtually any theater play, as long as the input file is correctly encoded.

Then, the generated CSV file can be directly imported and viewed in the program. The vizualisations are for the most interactive, so that it's easy to find what one is looking for.

If the user cannot provide a well-formatted CSV file, three ones are given as demo in the /data folder of the project. Everyone can then try the program without the need to run the analysis program first (which can take a long time depending on the length of the play).

Note : The emotion theory being the analysis is based on the work of [SenticNet](https://sentic.net/). Consequently, the project aims to represent the various dimensions of emotions based on their model. It is not in the scope of this project to create, rework or (re)interpret sentic's model of emotions.

## Main features

One can list the following main features of this project :

 - Various vizualisations
 - Interactive vizualisations
 - Display of the polarity of each speaker througout the play
 - Ability to isolate one or more speaker(s) to easily spot the differences between them
 - Ability to visually spot proximity of speaker based on their personnality traits
 
 - Lightweight and easy to use
 - Colorful and user-friendly interface
 - Minimal, yet powerful
 - Easily extensible

## Requirements and installation

 - A modern web browser with support of ES5+
 - A local (or remote) web server, or any similar tool (like the "Live Server" plugin of Visual Studio Code).

There is no installation required per se ; just download the project and start "index.html" with either a local web server, or any similar tool to start to use it.

**IMPORTANT NOTE** : the CSV file to be analyzed **MUST** be stored in the /data folder at the root of the project. If you provide your own custom CSV file, please remember to move them to this folder first, before trying to open them, or it won't work (because of browsers' restrictions).

## How to use ?

The use of this program is done through the web browser.

One assume that the CSV file is already generated and ready to use. Otherwise one should first use the analysis program to generate such file.

However, if the data are already available, the use of the current program can be broken down into 3 main steps:

 1. Start the program by opening the file "index.html" in a compatible web browser and through a web server (or any similar tool)
 2. Select the CSV file to use (**in the /data folder**) by clicking on the upper left "Load CSV" button 
 3. Now you can play and interact with the vizualisations at your will!
 
 It is aimed to be fast and easy to use to be the most efficient possible when analyzing emotions of a theater play.

## Suggestions for improvement
This project is intended to be a starting point. Therefore, there are many ways to improve it. The author is open to any kind of suggestions for improvement of the project.

Although special attention has been paid to compatibility, it is difficult to be sure that the program will work correctly in all circumstances, on all platforms and on all devices. Therefore, the author strongly encourages anyone to test the program and, if necessary, report compatibility issues.

Finally, any suggestions for improving the readability of the interface or the ease of use are greatly appreciated.

Also, the author would be very interested in hearing about forks of this project!

## Bugs
No bugs are known at the moment, except some compatibility issues (e.g. old browsers).

## Credits
 - The TEI-encoded plays are encoded by [GutenTag](http://www.projectgutentag.org) and the original texts are retrieved from the [project Gutenberg's website](https://www.gutenberg.org/) and is made available under their [license](https://www.gutenberg.org/policy/license.html).
 - [Senticnet](https://sentic.net/), for their model and Python dictionnary of emotions.
 - [d3.js](https://github.com/d3/d3)
 
## License
This project is distributed under the [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.en) terms.
For any remark or question, please contact directly the author.

![CC-BY-NC 4.0](images/cc-by-nc.png)
