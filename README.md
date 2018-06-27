# Restaurant reviews Web app


## To run 

cd restaurants   

npm i                                


cd server    

npm i 


cd restaurants 

npm i 


cd server 

npm i 


cd .. 
(we are back into 'restaurants' directory)   


npm start

go to http://localhost:8000/  to see the website


## Notes:

- in order to test - making  a review while offline - disconnect the computer from internet (not only from Chrome > Dev. tools)
- diffrent implementation of loading pictures of restaurants - using Intersect Observer but also kept the old lazysizes.min.js file for usage in the Details restaurant screen. Some thumnails load first. Intersect Observer part was fun.
- the Alt for the restaurants photos - I have stored them in server/.tmp/localDiskDb.db - this file is a mistery for me as some of it gets re-writen (Eg: down there in the schema part tried to modify    "createdAt": {
        "type": "datetime"(not good -> 6.25.2018 18.09 ...)  - into "timestamp"
      } 
      But I solved this by sending  "createdAt": Date.now()  at each new review )
- I know there are things to improve: reduce code, bix bugs when filtering restaurants (By Neiborhood/Cuisine); but for now I am a little bit tired and I will take a vacation.


![Restaurant list](/app/screenshots/screen1.jpg?raw=true "Restaurant list")   






