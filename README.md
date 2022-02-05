# Quiz Party

## Description
Quiz Party! is a full stack web application that allows users to play real Jeopardy! questions with friends in real time. The front end is React and the back end is a NodeJS server with Express and Socket.io to allow for real time gameplay communication. Essentially, it works like Kahoot! or Jackbox party games. On your laptop, you create a new game and either stream the Display page via Zoom/Discord or display it on your TV. When you create a new game, the game is assigned a room code. Each player then joins the game on their mobile device using that room code. As the game progresses, the Display page will show the Jeopardy! board, the clues, the leaderboard, etc. Each player is able to buzz in and answer questions on their mobile device. I figured that this game flow is the most like real Jeopardy!.

Through this project, I've learned React, Typescript and Socket.io

## Next Steps
1. I would like to deploy this application so I can test it on mobile devices and actually play it with my friends and family. I have a digital ocean droplet set up and the domain quiz-party.live secured. I set up a Nginx server on the droplet and got my SSL certificate through Let's Encrypt. I just need to find a free weekend to figure out the Nginx configuration and get my database set up
2. I need to implement Daily Doubles and Final Jeopardy!. For the daily doubles, I just need to have the backend designate some clues as daily doubles and change the flow for answering clues. I will need to write a component to allow users to select wagers. This component will also help me with implementing Final Jeopardy!
3. I need to add styling. I added styling for the actual Jeopardy! board, but other than that I haven't done any. In the future, I'd try and style as I go. However, since this was my first major full stack application and I was learning React, TypeScript and Socket.io as I went, I decided that it would be too overwhelming to try and do the CSS at the same time. I'm excited about the opportunity to make the site look really nice and learn about responsive design.

## Challenges
1. The biggest challenge I faced was figuring out the interaction between Socket.io and React. There is a weird interaction with useState and setting action listeners for socket events. It kept reverting back to the default state value whenever an event would occur. Because of this interaction, I sadly had to switch my main Display and Player pages to class components.
2. Since I have two different types of clients (Display and Client), I essentially had double the work in designing the flow. Each client had different interactions with the socket events
3. The data source contained questions with video, audio, and picture media, which I had to remove. I couldn't think of a way to display it that wouldn't seriously impact the flow of the game and I worried about the availability of those rseources. In addition, there were some mistakes in the web scraping, which resulted in some categories containing fewer than 5 questions. Thus, I had to figure out how to use SQL to clean those questions. I also had to figure out how to move the 150,000+ questions from one big table into my database schema

## Things I'd Do Different
1. This is my first experience working with Typescript and the first time I wrote in a strictly typed language for a while. As such, I made some mistakes in defining my type system that have made developing more inconvenient. For example, I grouped together a regular Jeopardy board and a Final Jeopardy! clue together as one data type Clue. This meant that I had to do some casting in my front end in order to display it properly. I would probably seperate these types in the future. I would also come up with a representation of an answered clue as a class rather than using null in the future
2. I'd try and do more styling as I went
3. Keep up with documentation (it is deeply not fun to try and write documentation after you wrote the code)
4. Do more research on architecture with Socket.io
5. If I was scaling this application up, I'd want a persistance layer for my server (so if the server went down, games wouldn't be erased). I think Redis could be a good technology for this
6. I could've just used a REST API in the game creation/joining flow instead of socket communication
7. I'd need to add a lot of security measures if I made this public

## Credits
[This](https://www.kaggle.com/tunguz/200000-jeopardy-questions) is the source of the Jeopardy! questions\
[This](https://github.com/JL978/multiplayer-react-tic-tac-toe) repository helped me figure out the interaction between React and Socket.io. It also gave me a basis for handling the multi-room server. Major shoutout, this project would have been much much more painful if I never found this.