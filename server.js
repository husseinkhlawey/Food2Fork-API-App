const express = require('express');
const http = require('http');
const qstring = require('querystring');
const path = require('path');

const API_KEY = '4fcfb152eecf06264eaafa27b931c2e5';

//set up express app
const app = express();

//defining functions to get recipes
function getRecipes(ingredient, res){

  const options = {
    host: 'www.food2fork.com',
    path: `/api/search?q=${ingredient}&key=${API_KEY}`
  }

  http.request(options, function(apiResponse){
    parseRecipes(apiResponse, res)
  }).end()
}

function parseRecipes(serverResponse, res) {
  let foodData = '';

  serverResponse.on('data', function(chunk) {
    foodData += chunk
  });

  serverResponse.on('end', function() {
    sendResponse(foodData, res)
  });
}

function sendResponse(data, res){

  var page = '<html><head><title>Assignment 4</title></head>' +
  '<body>' +
  '<form method="post">' +
  'Ingredient: <input name="ingredient"><br>' +
  '<input type="submit" value="Get Recipes">' +
  '</form>';

  if(data){
    let parsed_data = JSON.parse(data);

    //constructing the html page based on the recipes received from the server
    page += '<h1>Recipes</h1>';

    for (var i = 0; i < parsed_data.count; i++){

      page += '<div><a href=' + parsed_data.recipes[i].f2f_url + ' ';

      page += 'target="_blank"><img src="' + parsed_data.recipes[i].image_url + '" height="300" width="400"' + '>';

      page += '</a>';

      page += '<p id="name">' + parsed_data.recipes[i].title + '</p>';

      page += '</d>';
    }
  }

  page += '</body></html>';
  res.end(page);
}

//handling get requests
app.get('/*', function(req, res){
  console.log('GET request.');

  //getting ingredients
  let requestURL = req.url;
  requestURL = requestURL.replace('/?', '');
  let q = qstring.parse(requestURL);

  //if they specified an ingredient
  if(q.ingredient){
	getRecipes(q.ingredient, res);
  }
  //search but no specified ingredient
  else{
	  getRecipes("", res);
  }
});

//handling post requests
app.post('/*', function(req, res){
  console.log('POST request.');

  let reqData = '';
  req.on('data', function(chunk) {
    reqData += chunk;
  });

  //getting ingredients
  req.on('end', function() {
    let q = qstring.parse(reqData);
    getRecipes(q.ingredient, res);
  });
});

//listen for request
app.listen(3000, function(){
  console.log('Now listening for requests on port 3000.');
});
