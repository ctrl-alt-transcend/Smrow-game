This project has been created as part of the 42 curriculum by emurillo, hdougoud, magillie, emonacho, timmi.

# Description

\<name of the project\> is a web based game inspired by the famous strategy board game ==_Catan_==. The project can be breaken down into 2 main part:

- Web Portal
- The game

## Web Portal

The web portal serves as an access to the game, this is where new player can create their profile and already existing player can manage their account and interact with other player.

At first a new user will be granted with the _landing page_ displaying a brief text about the game and the possibility for them to create an account using their email or by using Google authentification.

You can create a lobby for you friend to join and wait for more of your friends to join ! Isn't it revolutionary ? I think so.
Once logged in, users have access to 3 panels:

- **Home**: This is where you create/join lobby and interact with users through the global chat.
- **Statistics**: A page dsiplaying your achievement, statistics and match history. This is also where you will find the general leaderboard.
- **Profile**: From this page, users can customize their profile and manage their friend list. Additionally you can use the friend list to see other user profile.

## The game

The fun starts here ! each player are able to create or join a game of Catan. A game can host up to 4 people at a time but can be played with a minimum of 2. The game mainly follow basic Catan rules with some variation that you'll discover while playing.
Additionally to the 4 active player, other player can _spectate_ the game.

---

# Instructions

This project ==require== some tools and dependecies to run:

## Depedencies

- Any computer running Linux
- Npm
- Node
- Make
  On top of that a `.env` file is required in the `/app` directory (an exemple can be found in the root directory).

## How to compile ?

be sure to be located at the root directory of the project and simply run:

```bash
make
```

This will compile and deploy the project in _dev_ environement.

After that, the app is accecible at https://localhost:5173.

Additionally the Makefile provide more command to help you debug/understand the project so have a look.

---

# Resources

The resources used for this project are various and can't be all listed here but here is a few:

- [Stack technique : Qu’est-ce que c’est ? Comment en assembler une ?](https://liora.io/stack-technique-tout-savoir)
- [JS Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [The TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Gaming Platform Tech Stack 2026](https://webridge.co/tech-stack/gaming-platform-tech-stack)
- [Nestjs Documentation](https://docs.nestjs.com/)
- [Building a Chat App with Gateway, Rooms, and Events in NestJS](https://syskool.com/building-a-chat-app-with-gateway-rooms-and-events-in-nestjs/)
- [Socket.IO Documentation](https://socket.io/fr/docs/v4/)
- [Mantine Documentation](https://mantine.dev/getting-started/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Axios Documentation](https://axios.rest/pages/getting-started/first-steps)
- ...

## Use of A.I.

As a.i. keeps getting better and undenyingly useful in some cases, we allowed ouself to use this tool for certain tasks:

- Gathering information or condencing large amount of data.
- Writting test scripts.
- Fixing minor UI issues.
- Make long and revetitive task (like rename all variable in a file).
- Explain some concepts we didn't understand.

---

# Team Information

|          | Role               | Description                                                                                                   |
| -------- | ------------------ | ------------------------------------------------------------------------------------------------------------- |
| hdougoud | Software Architect | - Backend structure: Controllers, Gateways, services, modules. <br> - Handle websockets for game and social features                                                                                                                |
| magillie | Software Architect | - Frontend structure: app layout, routing, header <br> - Home, stats, profile and legal pages <br> - Responsive design |
| emurillo | PO                 |         - Help & support with structure, infrastructure and database communications.                                                                                                       |
| emonacho | PM, DevOps         |                                                                                                               |
| timmi    | Tech Lead          | - Wrote documention for the team<br>- Handled communication between frontend and backend...<br>- Shared types |
|          |                    |                                                                                                               |

---

# Project Management

In this section we will go through the tools we used to manage our project (planning, communication, brainstorm, etc...)
We followed a well documented and commonly used framework called ==Scrum== to manage our project. Here are some principle of this framework:

- Breaking down gigantic amount of work into small iteration called ==sprints== (step-by-step delivery).
- Collaboration, continuous feedback, and improvement.
  This method allowed us to work on all kinds of different task without depending on someonelse code.

## Scrum

We followed a well documented and commonly used framework called ==Scrum== to manage our project. Here are some principle of this framework:

- Breaking down gigantic amount of work into small iteration called ==sprints== (step-by-step delivery).
- Collaboration, continuous feedback, and improvement.
  This method allowed us to work on all kinds of different task without depending on someonelse code.

Scrum workflow define a ==loop== that we you go through at each iteration. Basically you have a big bucket of task in which you pick tasks to work on during the current sprint. At the end of each sprints (1-2 weeks) you review what has been done and repeat the process.

## Github Project & Issues

To help us settle up our scrum framework we used Github project. This allowed us to represent our _bucket of tasks_ represented by the ==Backlog== view. This view shows every issue created for the project sorted in priority order. This is from this view that we pick tasks for the sprint and assign a person to it.

Next is the ==Weekly== view that show tasks selected for the current iteration. Task in this view are splited into 6 pannel:

- Triage
- Not Started
- Planning
- Building
- Review
- Done
  This allows us to follow each task progression.

Finally the ==Roadmap== that displays a timeline showing our current issues and deadlines.

## Figma

We used figma in 2 different ways:

- To design and sketch the look of our page
- To have a board where we can easily share ideas and reflexion with other member of the team.

---

# Technical Stack

**Frontend**:

- React
- Vite
- Mantine

**Backend**:

- Prisma
- Nest.js
- Socket.Io

**Database**:

- Postgresql

**Misc**:

- Axios
- Zod

We quickly all agreed that we didn't have much time thus learning one single language would be easier than having to jump from c++ to python to Ruby. So we decided to write our application in ==TypeScript==, thus leading us to choosing ==React== and ==Nest.js==.
...

---

# Database Schema

to write

---

# Feature List

here is the list of all the feature implemented in our application:

- Register with email
- Register with Google authentification
- Global chat
- Lobby creation
- Real-time multiplayer game
- Friend list system
- Profil system
- Account customization
- Online Status
- Playable on mobile
- ...

---

# Modules

## Use a Frontend framework
We chose React and Nestjs to gain time, as we only had to learn a single language to be able to implement features from front to back.
We also considered the use of a Full-stack framework but we quickly realize that it would take away some of the fun. Putting together multiple technologies and understand how they interact and work together is maybe harder but it allowed use to understand better how application are made.
## Real time feature using Socket
Doing a web-based game has been the idea since the beginning. This lead us to look on how to implement real time features such as a chat quit naturally.
## User Interaction
To create competitive mind and friendship in a game it is important for users to be able to interact between each other. They can do this through a Friend system and a General Chat system. Once connected player are connected using WebSockets to a general room where they can send and receive message to everyone connected.
## ORM
An ORM allows for efficient and simple communication with the Database. We use Prisma ORM, a tool that will allow as to communicate with Postgres without having to manually design SQL scripts, it will manage the schema via the prisma schema so our DB can read the schema to build the tables.
Prisma uses it's own auto-generated client with full Typescrips types,allowing to validate the querys in real time.


## Support for additional web browser
Don't need to justify this one much.... we wanted our game to be played across different setups.
## Standard user management
To be able to track user progression and statistic and for user to access these we needed an authentication system. Thus allowing us to create Profile, personal account etc...
## Remote authentication
In a goal to make our game as accessible as possible we added Remote authentication through Google. We love their work and what they do to improve our everyday life so this is sort of an homage to Google.com.

Thank you.

## Web based Game
Well this was the main idea of the project, we first wanted to make a sort of Worms clone but quickly realized that given the time we had -> this would be complicated. We then thought about a board game and Hayden rightfully thought about Catan, a game that he cherish in his hearth and spent all his childhood playing.
That was also a good idea because we were able to spend time on learning the language and the technologies instead of having to work on designing a game.

## Remote & Multiplayer
You can't play Catan alone. From this statement we had to implement multiplayer and allow people across the glob to play with their friends.
This is one of the modules that just needed to be implemented for the project.
We decided to implement this through WebSocket. Each game lives on the server on are saved in the Data base only when the game is over.
## Game customization
We wanted player to be able to modify game settings. This allows for less redundant games and can lead to unexpected game ending !
Once the main game was set this was pretty easy to implement.

## Gamification system
To encourage player to play, we implemented a gamification system with Trophies that player can display on their profile page. Player can earn trophies by simply playing the game and interacting with each other.
## Spectator mode
Waiting for you friend to finish their game ? well with the spectator mode feature you can spectate you friends while they are getting rekt by a 12 years old Korean child from SKT T1 Catan team.

| Modules                                                                         | Justification                                                                                                                                                                                                                                                                                 | Pts    |           |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------- |
| Use a frontend framework                                                        | (React, Vue, Angular, Svelte, etc.)                                                                                                                                                                                                                                                           | 1 pt   |           |
| Use a backend framewor                                                          | (Express, Fastify, NestJS, Django, etc.)                                                                                                                                                                                                                                                      | 1 pt   |           |
| Implement real-time features using WebSockets or similar technology.            | ◦ Real-time updates across clients.<br>◦ Handle connection/disconnection gracefully.<br>◦ Efficient message broadcasting                                                                                                                                                                      | 2 pts  |           |
| Allow users to interact with other users.                                       | ◦ A basic chat system (send/receive messages between users).<br>◦ A profile system (view user information).<br>◦ A friends system (add/remove friends, see friends list)                                                                                                                      | 2 pts  |           |
| Use an ORM for the database                                                     | -                                                                                                                                                                                                                                                                                             | 1 pt   |           |
| Support for additional browsers.                                                | ◦ Full compatibility with at least 2 additional browsers (Firefox, Safari, Edge,<br>etc.).<br>◦ Test and fix all features in each browser.<br>◦ Document any browser-specific limitations.<br>◦ Consistent UI/UX across all supported browsers.                                               | 1 pt   |           |
| Standard user management and authentication.                                    | ◦ Users can update their profile information.<br>◦ Users can upload an avatar (with a default avatar if none provided).<br>◦ Users can add other users as friends and see their online status.<br>◦ Users have a profile page displaying their information                                    | 2 pts  |           |
| Game statistics and match history.                                              | ◦ Track user game statistics (wins, losses, ranking, level, etc.).<br>◦ Display match history (1v1 games, dates, results, opponents).<br>◦ Show achievements and progression.<br>◦ Leaderboard integration.                                                                                   | 1 pt   |           |
| mplement remote authentication with OAuth 2.0.                                  | (Google, GitHub, 42,<br>etc.).                                                                                                                                                                                                                                                                | 1 pt   |           |
| Implement a complete web-based game where users can play against each<br>other. | ◦ The game can be real-time multiplayer (e.g., Pong, Chess, Tic-Tac-Toe, Card<br>games, etc.).<br>◦ Players must be able to play live matches.<br>◦ The game must have clear rules and win/loss conditions.<br>◦ The game can be 2D or 3D.                                                    | 2 pts  |           |
| Remote players.                                                                 | ◦ Handle network latency and disconnections gracefully.<br>◦ Provide a smooth user experience for remote gameplay.<br>◦ Implement reconnection logic.                                                                                                                                         | 2 pts  |           |
| Multiplayer game.                                                               | ◦ Support for three or more players simultaneously.<br>◦ Fair gameplay mechanics for all participants.<br>◦ Proper synchronization across all clients.                                                                                                                                        | 2 pts  |           |
| Game customization options.                                                     | -                                                                                                                                                                                                                                                                                             | 1 pt   |           |
| A gamification system to reward users for their actions.                        | ◦ Implement at least 3 of the following: achievements, badges, leaderboards,<br>XP/level system, daily challenges, rewards<br>◦ System must be persistent (stored in database)<br>◦ Visual feedback for users (notifications, progress bars, etc.)<br>◦ Clear rules and progression mechanics | 1 pt   |           |
| Implement spectator mode for games.                                             | ◦ Allow users to watch ongoing games.<br>◦ Real-time updates for spectators.<br>◦ Optional: spectator chat.                                                                                                                                                                                   | 1 pt   |           |
|                                                                                 |                                                                                                                                                                                                                                                                                               | 21 pts | **Total** |

---

# Individual Contributions

## Magillie

**Frontend architecture**
- Set up the routing with React Router: app layout, page routes and the 404 page
- Built the navigation bar with Mantine UI (game name, links, user menu, mobile burger menu)

**Web pages**
- Home page: game list (with join/spectate states), global "Toxic chat" UI (auto-scroll to the latest message), buttons to join or create a game
- Statistics page: overview (level/XP, wins, win rate, average rank), achievements with progress bars, match history and leaderboard
- Legal pages: Privacy Policy and Terms of Service, links in the header and the landing footer, mandatory "accept terms" checkbox on registration

**Responsive design and UI consistency**
- Made every page except the game usable on mobile
- Harmonized the UI across pages (cards, dividers, rounded corners, images converted to WebP)

**Challenges**
- *Navigation unreachable on some screen widths*: the burger menu and the desktop links used different breakpoints. I aligned them on the same breakpoint and added the legal links and logout to the mobile drawer.

---

## Timmi

### Planning

Before starting to work on the code, we had to plan the code. For that I used Figma along with Github project/issues to define our workflow (find more about this in the planning part).

### Doc.

On top of that I wrote several documentation to help and make sure the team work consistently

- Define branches strategy.
- Define commit norm.
- Define commit templates for long commit.
- Define Framework (Srub).

### CI/CD

Once we started coding we quickly needed some way to format and test our code. So along with Enrique we built our CI/CD framework. I worked on the CI script that runs when merging branches, providing continuous test and ensuring clean and working code on our develop branch.

### Look

The first things I thought about this project was: "How cool can we make it look". so I started with a bunch of experimentation and research with different colors and font.
I built a simple `Mantine` theme defining:

- Font
- color palette
- default look for components
  Since we didn't have a lot of time, UI/UX quickly became a minor task and so I shifted towards different things.

### Implementation & Features

The first thing that I implemented was the login/register panel. Front/back communication was still very vague for me so this allowed to make it clearer. Then this lead me to types sharing and how we could validate types. And from that I built a bunch of features.

- Bundler & packages
- Implementation of shared types
- Login/Register form
- Login session
- Profile page & Public profile page
- Profile customization form
- Profile picture upload form
- Friend system (Friend list, Add/Remove, Accept request)

  _All of these features include front and backend implementation_

---

## Emurillo

### Planning

As a part of the planning of this project, we have decided the stack, the github structure (PR with validation, SCRUM methodology, CI/CD, etc). Divide the tasks in issues and follow-up of pending tasks.

### Infrastructure

Docker structure decided in collabotarion with **hdougoud**, set up of the docker production file.

Adding the migration standards for creating and pushing migrations, with make rules to standarize the process.

### CI/CD

Along with **Timmi** we set up the `CI/CD` for the backend and the frontend. This steps helped us to better test and reduce the errors of our code when we push into the develop branch.

This part was later completed with the inclusion of `husky` to add the format and lint, as well as, the build checks when commiting and pushing our contributions to the project.

### Schema DB

Decided the DB Schema with the rest of the team and translating it into a Prisma schema. In close collaboration with Hdougoud, we decided the minimal fields needed for each table.


### Prisma ORM

Set up and schema creation of the prisma schema for the database. The ORM handles all communications with the DB, centralizing and standardizing all queries, with it's own client and types compatible with Typescript.

- Schema creation
- Creation of user & stats resources(controllers, services)


### Google OAuth

Complete set-up of the google OAuth module. This module requires the local Auth structure and the set up of the jwtStrategy. As part of this module tasks we can see:

- Google guards and google strategy definition
- Cloud console set-up to be able to use the API
- Creation of a user validation service to allow the connection

### Continous testing

In addition to the infrasctructure. The creation and mantainment of the VM with the production of the project. This has allowed us to have a real production version of the app to see and test our features in almost real time.


### Challenges

The first challenge of a group project is to decide what we want to do, try to manage the time and the people with all the constraints and be able to conciliate these differences.

My personal challenges include:
- Typescript, I had never used it before and I stil think is different and I need to work on it.
- The Prisma integration with the backend caused many difficulties, specially at the begining of the proyect. To understand the concept of a migration and the api communication with the DB, was a big challenge.
- npx prisma generate

---

## Hdougoud
#### Detailed breakdown

**Infrastructure basics**
- Creation of Dockerfiles and docker-compose.
- Setup of HotReload for containers.
- Setup of Vite Proxy for the frontend.
- Modification of the Makefile to separate Dev and Prod.

**Setup of localAuth with Passport**
- Setup of localAuth.
- Password hashing with bcrypt.
- Setup of the basics for Passport.
- Creation of the JWT Token.

**Websocket management**
- Setup of the basics for game rooms and events.
- Implementation of the backend logic for the Social gateway.
- Synchronization of the Frontend and Backend for social events (Chat, game list, online status).
- Creation of Gateways with Socket.io.
- Setup of Admin UI to have a graphical interface to visualize websockets.

#### Challenges

**The main challenges I encountered are:**
- Having to write in a programming language that is new to me (TypeScript).
- Learning Nest.js and how it works.
- Understanding what websockets are and how to use them.
- Understanding new concepts like async, promises, etc.
- Having to build a frontend.

**For each of these challenges, I apply this set of actions:**
-  Reading the official documentation.
- Doing several simple attempts to get familiar with the technology / tool in question.
- Researching best practices on the internet.

---`
`
