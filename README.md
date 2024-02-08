# Sports_Scheduler
### Sports Scheduler is an application which can be used for creating and managing sports events.
### It has two personas i.e 1)Admin and 2)Player

## Admin
- An admin create mutiple sports.
+ Admin can delete a sport he created.
* Admin can act as a player in creating sessions of sports he created.
- An admin can join multiple sessions and he can also leave sessions.
- Only an admin can view reports of all sessions and sports.

## Player
- Player can create multiple sessions by selecting any of available sports.
- Player can join multiple sessions.
- A player cannot join past sessions.
- Player is able to cancel a session he created.
- And a player can remove available players in a sports session.

### An admin can delete a sport only if there are no sessions created for that particular sport.
 
## To Run Locally
- Install postgresql and update your postgresql username and password in config.json
- To start the postgresql server
```
sudo service postgresql start
```
- To install dependencies
```
npm install
```
- To create datbase
```
npx sequelize-cli db:create
```
- Next migrate the database
```
npx sequelize-cli db:migrate
```
- To run locally on your browser
```
npm start
```
- Run test cases
```
npm test
```
## Screenshots
- Signin and Signup Pages
![Screenshot (148)](https://github.com/pavankumar1921/Sports_Scheduler/assets/104848621/0f1989a2-8c9b-482a-8e41-179a24911605)
![Screenshot (149)](https://github.com/pavankumar1921/Sports_Scheduler/assets/104848621/ff22613c-f8e1-4e3a-8b49-f1a35f999a99)
![Screenshot (150)](https://github.com/pavankumar1921/Sports_Scheduler/assets/104848621/75b9f1d0-eb7e-4e08-b534-62a11e8062e0)

- Sports
![Screenshot (153)](https://github.com/pavankumar1921/Sports_Scheduler/assets/104848621/d66e543a-63c0-4af2-bdb1-1f4b97f08e08)
![Screenshot (151)](https://github.com/pavankumar1921/Sports_Scheduler/assets/104848621/d5137fad-a1a7-4ea9-8abd-47c3f672d13d)

- Sports Session
![Screenshot (156)](https://github.com/pavankumar1921/Sports_Scheduler/assets/104848621/188813d7-5412-416a-b61d-c1d9b704a500)
![Screenshot (155)](https://github.com/pavankumar1921/Sports_Scheduler/assets/104848621/5cbe5a05-c142-4817-b49f-51cec5e96057)
![Screenshot (157)](https://github.com/pavankumar1921/Sports_Scheduler/assets/104848621/15e79f93-110a-457f-8cb2-97aa2898d3cc)
![Screenshot (159)](https://github.com/pavankumar1921/Sports_Scheduler/assets/104848621/6a477fcc-28ab-4fd6-a194-1a873b49b91e)
![Screenshot (158)](https://github.com/pavankumar1921/Sports_Scheduler/assets/104848621/65c8dc53-5758-4004-8a1d-89a90dfba954)

- Reports
![Screenshot (154)](https://github.com/pavankumar1921/Sports_Scheduler/assets/104848621/aa59ab18-f23d-4ab3-a159-03c569057444)

- Change Password
![Screenshot (152)](https://github.com/pavankumar1921/Sports_Scheduler/assets/104848621/49fcda35-1c3d-4cb6-9d2b-8daff42a8b12)

## Live Application URL
https://pavans-sports-scheduler.onrender.com

## Demo Video
https://www.loom.com/share/b18ec63dee0d4c53974e88d39bc3b466?sid=1ecf7755-9455-46ba-a209-3a85e60dd771














