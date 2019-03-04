# Multiplayer implementation of John Conway's game of life

![Loading screenshot](public/Images/screenshot.png?raw=true "Screenshot")

Simple Browser-based multi-player Conway's game of life version where you need to "shoot" gliders at your enemy's flag to win, all users see and interact with the same board. Front-end is built in ReactJS, Backend's server in Node.js and Socket.io for real-time updates.

The original Conway's game of life's point was to investigate how complex structures can emerge from a simple set of rules, the original is a zero-player game, meaning that its evolution is determined by its initial state, requiring no further input.

This browser-based version is a bit different, and it's more like a video-game, where users interact with the board with the objective of generating patterns that move towards opposing team's flag. When a cell reaches enemy's flag, the team scores a point and the board is reset.

If there's only 1 user online, the user gets to play against the server, otherwise, the server balances online users so that blue team and red team have similar amount of players each.


Running live at: http://www.gameoflife.live/


More info about [John Conway's game of life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life)
# CounterConway
