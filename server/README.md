## Running Instructions
### DBMS Setup
##### Installing MySQL
```
$ sudo apt update
$ sudo apt install mysql-server
```

#### Creating a new user
```MySQL
$ sudo mysql -u root
mysql> CREATE USER 'root'@'localhost' IDENTIFIED BY 'root';
mysql> GRANT ALL PRIVILEGES ON * . * TO 'root'@'localhost';
```

#### Creating the database and tables
Login to mysql as user root
```
$ mysql -u root -p
```
Enter password as `root` <br>
Run all the commands in `/SQL_Queries/DatabaseDefinition.sql` by running
```MySQL
mysql> source server/DatabaseDefinition.sql
```
Or alternatively copy and paste the commands.

### Running the server

#### Alphavantage API: 
- Replace the API Key in the server file with your own generated API key<br />
` Line 219 replace YOUR_API_KEY`

#### Prerequites
- `nodejs`
- Install the node modules using `npm`, with the command `npm install`
  - `express`
  - `mysql`
  - `get-json`
  - `nodemon`
  - `body-parser`

#### To run the server
Run the following command
```
$ npm start
```
This will get the server code running on `localhost:3000`
