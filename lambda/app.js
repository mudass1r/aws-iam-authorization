'use strict'

    const serverless = require('serverless-http');//Comment this line for local testing
    const express = require('express');
    var cors = require('cors')
    const app = express();
    
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    app.use(cors())
    
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method,X-Access-Token,XKey,Authorization');
        next();
    });
      
    app.get('/api/info', (req, res) => {
       res.send({ 
            statusCode: 200,
            body : { application: 'media-score-app', 
            version: '1'
            } 
        });
    });
    
    // app.listen(3000, () => console.log(`Listening on: 3000`));//Comment this line for live
    module.exports.handler = serverless(app);//Comment this line for local testing
