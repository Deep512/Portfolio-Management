CREATE DATABASE Portfolio;
USE Portfolio;

-- Base Tables
-- ###########################################################################

CREATE TABLE user (
	user_id INT PRIMARY KEY AUTO_INCREMENT,
	user_name VARCHAR(50) UNIQUE NOT NULL,
	user_password VARCHAR(100),
	first_name VARCHAR(50) NOT NULL,
	last_name VARCHAR(50)
);

CREATE TABLE share (
	symbol VARCHAR(50) PRIMARY KEY,
	share_name VARCHAR(250) NOT NULL,
	share_info VARCHAR(2000)
);

-- ###########################################################################

CREATE TABLE share_history (
	time_log TIMESTAMP,
	share_symbol VARCHAR(50),
	share_price FLOAT(7, 2) NOT NULL,
	CONSTRAINT primeKey PRIMARY KEY (share_symbol, time_log),
	FOREIGN KEY (share_symbol) REFERENCES share(symbol) ON DELETE CASCADE ON UPDATE CASCADE
	);

CREATE TABLE watchlist (
	user_id INT ,
	share_symbol VARCHAR(50),
	CONSTRAINT primeKey PRIMARY KEY (user_id, share_symbol),
	FOREIGN KEY watchlist(user_id) REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (share_symbol) REFERENCES share(symbol) ON DELETE CASCADE ON UPDATE CASCADE
	);

CREATE TABLE buy_history (
	time_log TIMESTAMP,
	user_id INT,
	share_qty INT NOT NULL,
	share_price FLOAT NOT NULL,
	share_symbol VARCHAR(50),
	CONSTRAINT primeKey PRIMARY KEY (user_id, time_log),
	FOREIGN KEY buy_history(user_id) REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (share_symbol) REFERENCES share(symbol) ON DELETE CASCADE ON UPDATE CASCADE
	);

CREATE TABLE sell_history (
	time_log TIMESTAMP,
	user_id INT ,
	share_qty INT NOT NULL,
	share_price FLOAT NOT NULL,
	share_symbol VARCHAR(50) ,
	CONSTRAINT primeKey PRIMARY KEY (user_id, time_log),
	FOREIGN KEY sell_history(user_id) REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (share_symbol) REFERENCES share(symbol) ON DELETE CASCADE ON UPDATE CASCADE
	);

-- buy_sell_flag = 0 => Buy
-- buy_sell_flag = 1 => Sell
CREATE TABLE user_history (
	user_id INT ,
	share_qty INT NOT NULL,
	time_log TIMESTAMP,
	share_price FLOAT NOT NULL,
	buy_sell_flag INT NOT NULL,
	share_symbol VARCHAR(50) ,
	CONSTRAINT primeKey PRIMARY KEY (user_id, time_log),
	FOREIGN KEY user_history(user_id) REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (share_symbol) REFERENCES share(symbol) ON DELETE CASCADE ON UPDATE CASCADE
	);

-- ###########################################################################
-- Views

CREATE VIEW stocks_in_watchlist AS 
SELECT watchlist.user_id,share.share_name, share.symbol 
FROM watchlist 
JOIN share 
ON share.symbol=watchlist.share_symbol;

CREATE VIEW shares_bought AS 
SELECT user_id,share_symbol,SUM(share_qty) AS bought, SUM(share_price*share_qty) AS invested 
FROM user_history
WHERE buy_sell_flag=0 
GROUP BY share_symbol,user_id;

CREATE VIEW shares_sold AS 
SELECT user_id,share_symbol,SUM(share_qty) AS sold, SUM(share_price*share_qty) AS returns 
FROM user_history
WHERE buy_sell_flag=1 
GROUP BY share_symbol,user_id;

-- ###########################################################################
-- Triggers

delimiter //

CREATE TRIGGER check_price BEFORE INSERT ON share_history FOR EACH ROW
BEGIN
IF new.share_price<=0.00 THEN
SET new.share_price=NULL;
END IF;
END //

CREATE TRIGGER check_buy_share_info BEFORE INSERT ON buy_history FOR EACH ROW
BEGIN
IF new.share_qty<=0 THEN
SET new.share_qty=NULL;
END IF;
IF new.share_price<=0.00 THEN
SET new.share_price=NULL;
END IF;
END //

CREATE TRIGGER check_sell_share_info BEFORE INSERT ON sell_history FOR EACH ROW
BEGIN
IF new.share_qty<=0 THEN
SET new.share_qty=NULL;
END IF;
IF new.share_price<=0.00 THEN
SET new.share_price=NULL;
END IF;
END //

CREATE TRIGGER check_share_info BEFORE INSERT ON user_history FOR EACH ROW
BEGIN
IF new.share_qty<=0 THEN
SET new.share_qty=NULL;
END IF;
IF new.share_price<=0.00 THEN
SET new.share_price=NULL;
END IF;
IF new.buy_sell_flag<0 OR new.buy_sell_flag>1 THEN
SET new.buy_sell_flag=NULL;
END IF;
END //

-- ###########################################################################
-- All Stored Procedures


-- Get login details of user
CREATE PROCEDURE loginDetails(IN name VARCHAR(50))
BEGIN
SELECT user_id,user_password FROM user WHERE user_name=name;
END//

-- Check if user exists in database
CREATE PROCEDURE checkUser(IN name VARCHAR(50))
BEGIN
SELECT user_name FROM user WHERE user_name=name;
END//

-- Insert user in database 
CREATE PROCEDURE insertUser(IN name VARCHAR(50),IN pass VARCHAR(100),IN fname VARCHAR(50),IN lname VARCHAR(50))
BEGIN
INSERT INTO user (user_name,user_password,first_name,last_name) VALUES (name,pass,fname,lname);
END//

-- Get ID from user_name
CREATE PROCEDURE getId(IN name VARCHAR(50))
BEGIN
SELECT user_id FROM user WHERE user_name=name;
END//

-- Check if user exists with same user_name
CREATE PROCEDURE updateCheck(IN name VARCHAR(50),IN id INT)
BEGIN
SELECT user_name FROM user WHERE user_name=name AND (NOT(user_id=id));
END//

-- Get user_password of user
CREATE PROCEDURE getPassword(IN id INT)
BEGIN
SELECT user_password FROM user where user_id = id;
END//

-- Update details of a user
CREATE PROCEDURE updateUser(IN name VARCHAR(50),IN pass VARCHAR(100),IN fname VARCHAR(50),IN lname VARCHAR(50),IN id INT)
BEGIN
UPDATE user 
SET user_name=name,
	user_password=pass,
	first_name=fname,
	last_name=lname 
WHERE user_id=id;
END//

-- List of all the Stocks
CREATE PROCEDURE stockList()
BEGIN
SELECT share_name, symbol FROM share;
END//

CREATE PROCEDURE insert_share(IN sym VARCHAR(50), IN share_name VARCHAR(250), IN share_info VARCHAR(2000))
BEGIN
INSERT INTO share (symbol, share_name, share_info) VALUES (sym, share_name, share_info);
END//

-- Stocks in watchlist of a user
CREATE PROCEDURE watchlist(IN id INT)
BEGIN
SELECT share_name, symbol FROM stocks_in_watchlist where user_id=id;
END//

-- Details of all the share bought
CREATE PROCEDURE bought(IN id INT)
BEGIN
SELECT SUM(bought) AS bought,SUM(invested) AS invested FROM shares_bought WHERE user_id=id;
END//

-- Details of all the share sold
CREATE PROCEDURE sold(IN id INT)
BEGIN
SELECT SUM(sold) AS sold,SUM(returns) AS returns FROM shares_sold WHERE user_id=id;
END//

-- Get user info FROM user_id
CREATE PROCEDURE userInfo(IN id INT)
BEGIN
SELECT user_name, first_name, last_name FROM user WHERE user_id=id;
END//

-- Get Shareinfo for symbol
CREATE PROCEDURE shareInfo(IN sym VARCHAR(50))
BEGIN
SELECT share_name, share_info FROM share WHERE symbol=sym;
END//

-- Details of share bought of specific company
CREATE PROCEDURE boughtShare(IN id INT,IN sym VARCHAR(50))
BEGIN
SELECT bought,invested FROM shares_bought WHERE user_id=id AND share_symbol=sym;
END//

-- Details of share sold of specific company
CREATE PROCEDURE soldShare(IN id INT,IN sym VARCHAR(50))
BEGIN
SELECT sold, returns FROM shares_sold WHERE user_id=id AND share_symbol=sym;
END//

-- Check if share exists in watchlist
CREATE PROCEDURE inWatchList(IN id INT,IN sym VARCHAR(50))
BEGIN
SELECT share_symbol FROM watchlist WHERE user_id=id AND share_symbol=sym;
END//

-- Insert into buy_history
CREATE PROCEDURE buyQuery(IN time TIMESTAMP,IN id INT,IN quant INT,IN share_price FLOAT,IN sym VARCHAR(50))
BEGIN
INSERT INTO buy_history VALUES (time,id,quant,share_price,sym);
END//

-- Insert into sell_history
CREATE PROCEDURE sellQuery(IN time TIMESTAMP,IN id INT,IN quant INT,IN share_price FLOAT,IN sym VARCHAR(50))
BEGIN
INSERT INTO sell_history VALUES (time,id,quant,share_price,sym);
END//

-- Insert into user History
CREATE PROCEDURE userHistory(IN time TIMESTAMP,IN id INT,IN quant INT,IN share_price FLOAT,IN flag INT,IN sym VARCHAR(50))
BEGIN
INSERT INTO user_history VALUES (id,quant,time,share_price,flag,sym);
END//

-- Insert into Share History
CREATE PROCEDURE shareHistory(IN time TIMESTAMP,IN sym VARCHAR(50),IN share_price FLOAT)
BEGIN
DECLARE rc INT;
SELECT COUNT(*) INTO rc FROM share_history WHERE time_log=time AND share_symbol=sym;
IF rc>0 THEN
UPDATE share_history SET share_price=share_price WHERE time_log=time AND share_symbol=sym;
ELSE
INSERT INTO share_history VALUES (time,sym,share_price);
END IF;
END//

-- Insert in watchlist
CREATE PROCEDURE insertList(IN id INT,IN sym VARCHAR(50))
BEGIN
INSERT INTO watchlist VALUES (id,sym);
END//

-- Delete FROM watchlist
CREATE PROCEDURE deleteList(IN id INT,IN sym VARCHAR(50))
BEGIN
DELETE FROM watchlist WHERE user_id=id AND share_symbol=sym; 
END//

delimiter ;
-- ###########################################################################
-- Deleting all tables

-- DROP TABLE user;
-- DROP TABLE share;
-- DROP TABLE share_history;
-- DROP TABLE watchlist;
-- DROP TABLE buy_history;
-- DROP TABLE sell_history;
-- DROP TABLE user_history;
