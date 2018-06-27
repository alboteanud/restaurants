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

- in order to test - making  a review while offline - disconnect the computer from internet (not only from Dev. tools)
- I have changed lazy-loading images 
- the Alternative texts for the restaurants images - stored them in server/.tmp/localDiskDb.db 
- server/.tmp/localDiskDb.db is a pain as it gets re-writen  - some of it (Eg: the schema   "createdAt": {
        "type": "datetime"(not good -> 6.25.2018 18.09 ...)  - I wanted "timestamp"  } 
      But solved this by sending  "createdAt": Date.now() at each new review.
- I know there are things to improve: reduce code, minify, fix bugs when filtering restaurants (By Neiborhood/Cuisine); but I am a little bit tired and I will take a vacation for now.


![Restaurant list](/app/screenshots/screen1.jpg?raw=true "Restaurant list")   






