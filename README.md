## Set Environment Variables on Heroku
```
heroku config:set KEY=VALUE --app <project-name>
```

```
heroku config:set ENCRYPTION_KEY=CIDBAAJQJYUHDLMXZAOMXWW3QYF2Z2EH --app nodejs-aes-example
heroku config:set PGUSER=pbmzkmkctzpxmb --app nodejs-aes-example
heroku config:set PGHOST=ec2-52-21-61-131.compute-1.amazonaws.com --app nodejs-aes-example 
heroku config:set PGDATABASE=d6vj0gflgdvok5 --app nodejs-aes-example
heroku config:set PGPASSWORD=678b2d607cdc8bf6268153f46f6095d091aa5171c50eba6de35dbc0e5cbe81b4 --app nodejs-aes-example
heroku config:set PGPORT=5432 --app nodejs-aes-example
```