# Restaurant reviews Web app


## To run 

cd restaurants                     
npm i                                
<br>

cd server                            
npm i 
<br>

cd .. 
(we are back into 'restaurants' directory)   


npm start

open browser at http://localhost:8000/


Notes:
- in order to test - making  a review while offline - disconnect the computer from internet (not only from Chrome > Dev. tools)
- I have reduced the boilerplate code but I am sure it can be halved
- diffrent implementation of loading pictures of restaurants - using Intersect Observer but also kept the old lazysizes.min.js file for usage in the Details restaurant screen. Some thumnails load first. Intersect Observer part was fun.
- the Alt for the restaurants photos - I have stored them in server/.tmp/localDiskDb.db - this file is a mistery for me as some of it gets re-writen (Eg: down there in the schema part tried to modify    "createdAt": {
        "type": "datetime"(not good -> 6.25.2018 18.09 ...)  - into "timestamp"
      } 
      But I solved this by sending  "createdAt": Date.now()  at each new review )


![Restaurant list](/app/screenshots/screen1.jpg?raw=true "Restaurant list")   






