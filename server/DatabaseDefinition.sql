CREATE DATABASE Portfolio;
USE Portfolio;

-- Base Tables
-- ###########################################################################

CREATE TABLE User (
	UserID INT PRIMARY KEY AUTO_INCREMENT,
	Username VARCHAR(50) UNIQUE NOT NULL,
	Password VARCHAR(100),
	FirstName VARCHAR(50) NOT NULL,
	LastName VARCHAR(50)
);

CREATE TABLE Shares (
	Symbol VARCHAR(50) PRIMARY KEY,
	ShareName VARCHAR(100) NOT NULL,
	Information VARCHAR(2000)
);

-- ###########################################################################

CREATE TABLE ShareHistory (
	TimeLog TIMESTAMP,
	ShareSymbol VARCHAR(50),
	Price FLOAT(7, 2) NOT NULL,
	CONSTRAINT primeKey PRIMARY KEY (ShareSymbol, TimeLog),
	FOREIGN KEY (ShareSymbol) REFERENCES Shares(Symbol) ON DELETE CASCADE ON UPDATE CASCADE
	);

CREATE TABLE WatchList (
	UserID INT ,
	ShareSymbol VARCHAR(50),
	CONSTRAINT primeKey PRIMARY KEY (UserID, ShareSymbol),
	FOREIGN KEY WatchList(UserID) REFERENCES User(UserID) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (ShareSymbol) REFERENCES Shares(Symbol) ON DELETE CASCADE ON UPDATE CASCADE
	);

CREATE TABLE BuyShare (
	TimeLog TIMESTAMP,
	UserID INT,
	Quantity INT NOT NULL,
	Price FLOAT NOT NULL,
	ShareSymbol VARCHAR(50),
	CONSTRAINT primeKey PRIMARY KEY (UserID, TimeLog),
	FOREIGN KEY BuyShare(UserID) REFERENCES User(UserID) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (ShareSymbol) REFERENCES Shares(Symbol) ON DELETE CASCADE ON UPDATE CASCADE
	);

CREATE TABLE SellShare (
	TimeLog TIMESTAMP,
	UserID INT ,
	Quantity INT NOT NULL,
	Price FLOAT NOT NULL,
	ShareSymbol VARCHAR(50) ,
	CONSTRAINT primeKey PRIMARY KEY (UserID, TimeLog),
	FOREIGN KEY BuyShare(UserID) REFERENCES User(UserID) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (ShareSymbol) REFERENCES Shares(Symbol) ON DELETE CASCADE ON UPDATE CASCADE
	);

-- BuySellFlag = 0 => Buy
-- BuySellFlag = 1 => Sell
CREATE TABLE UserHistory (
	UserID INT ,
	Quantity INT NOT NULL,
	TimeLog TIMESTAMP,
	Price FLOAT NOT NULL,
	BuySellFlag INT NOT NULL,
	ShareSymbol VARCHAR(50) ,
	CONSTRAINT primeKey PRIMARY KEY (UserID, TimeLog),
	FOREIGN KEY BuyShare(UserID) REFERENCES User(UserID) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (ShareSymbol) REFERENCES Shares(Symbol) ON DELETE CASCADE ON UPDATE CASCADE
	);

-- ###########################################################################
-- Views

CREATE VIEW stocksInWatchList AS 
SELECT WatchList.UserID,Shares.ShareName, Shares.Symbol 
FROM WatchList 
JOIN Shares 
ON Shares.Symbol=WatchList.ShareSymbol;

CREATE VIEW buyInfo AS 
SELECT UserID,ShareSymbol,SUM(Quantity) AS bought, SUM(Price*Quantity) AS invested 
FROM UserHistory
WHERE BuySellFlag=0 
GROUP BY ShareSymbol,UserID;

CREATE VIEW sellInfo AS 
SELECT UserID,ShareSymbol,SUM(Quantity) AS sold, SUM(Price*Quantity) AS returns 
FROM UserHistory
WHERE BuySellFlag=1 
GROUP BY ShareSymbol,UserID;

-- ###########################################################################
-- Triggers

delimiter //

CREATE TRIGGER checkPrice BEFORE INSERT ON ShareHistory FOR EACH ROW
BEGIN
IF new.Price<=0.00 THEN
SET new.Price=NULL;
END IF;
END //

CREATE TRIGGER checkBuyShare BEFORE INSERT ON BuyShare FOR EACH ROW
BEGIN
IF new.Quantity<=0 THEN
SET new.Quantity=NULL;
END IF;
IF new.Price<=0.00 THEN
SET new.Price=NULL;
END IF;
END //

CREATE TRIGGER checkSellShare BEFORE INSERT ON SellShare FOR EACH ROW
BEGIN
IF new.Quantity<=0 THEN
SET new.Quantity=NULL;
END IF;
IF new.Price<=0.00 THEN
SET new.Price=NULL;
END IF;
END //

CREATE TRIGGER checkUserHistory BEFORE INSERT ON UserHistory FOR EACH ROW
BEGIN
IF new.Quantity<=0 THEN
SET new.Quantity=NULL;
END IF;
IF new.Price<=0.00 THEN
SET new.Price=NULL;
END IF;
IF new.BuySellFlag<0 OR new.BuySellFlag>1 THEN
SET new.BuySellFlag=NULL;
END IF;
END //

-- ###########################################################################
-- All Stored Procedures


-- Get login details of user
CREATE PROCEDURE loginDetails(IN name VARCHAR(50))
BEGIN
SELECT UserID,Password FROM User WHERE Username=name;
END//

-- Check if User exists in database
CREATE PROCEDURE checkUser(IN name VARCHAR(50))
BEGIN
SELECT Username FROM User WHERE Username=name;
END//

-- Insert user in database 
CREATE PROCEDURE insertUser(IN name VARCHAR(50),IN pass VARCHAR(100),IN fname VARCHAR(50),IN lname VARCHAR(50))
BEGIN
INSERT INTO User (Username,Password,FirstName,LastName) VALUES (name,pass,fname,lname);
END//

-- Get ID from Username
CREATE PROCEDURE getId(IN name VARCHAR(50))
BEGIN
SELECT UserID FROM User WHERE Username=name;
END//

-- Check if user exists with same username
CREATE PROCEDURE updateCheck(IN name VARCHAR(50),IN id INT)
BEGIN
SELECT Username FROM User WHERE Username=name AND (NOT(UserID=id));
END//

-- Get password of User
CREATE PROCEDURE getPassword(IN id INT)
BEGIN
SELECT Password FROM User where UserID = id;
END//

-- Update details of a user
CREATE PROCEDURE updateUser(IN name VARCHAR(50),IN pass VARCHAR(100),IN fname VARCHAR(50),IN lname VARCHAR(50),IN id INT)
BEGIN
UPDATE User SET Username=name,Password=pass,FirstName=fname,LastName=lname WHERE UserID=id ;
END//

-- List of all the Stocks
CREATE PROCEDURE stockList()
BEGIN
SELECT ShareName, Symbol FROM Shares;
END//

-- Stocks in WatchList of a user
CREATE PROCEDURE watchList(IN id INT)
BEGIN
SELECT ShareName, Symbol FROM stocksInWatchList where UserID=id;
END//

-- Details of all the shares bought
CREATE PROCEDURE bought(IN id INT)
BEGIN
SELECT SUM(bought) AS bought,SUM(invested) AS invested FROM buyInfo WHERE UserID=id;
END//

-- Details of all the shares sold
CREATE PROCEDURE sold(IN id INT)
BEGIN
SELECT SUM(sold) AS sold,SUM(returns) AS returns FROM sellInfo WHERE UserID=id;
END//

-- Get user info FROM UserID
CREATE PROCEDURE userInfo(IN id INT)
BEGIN
SELECT Username, FirstName, LastName FROM User WHERE UserID=id;
END//

-- Get Sharename for symbol
CREATE PROCEDURE sharename(IN sym VARCHAR(50))
BEGIN
SELECT Sharename FROM Shares WHERE Symbol=sym;
END//

-- Details of Shares bought of specific company
CREATE PROCEDURE boughtShare(IN id INT,IN sym VARCHAR(50))
BEGIN
SELECT bought,invested FROM buyInfo WHERE UserID=id AND ShareSymbol=sym;
END//

-- Details of Shares sold of specific company
CREATE PROCEDURE soldShare(IN id INT,IN sym VARCHAR(50))
BEGIN
SELECT sold, returns FROM sellInfo WHERE UserID=id AND ShareSymbol=sym;
END//

-- Check if share exists in WatchList
CREATE PROCEDURE inWatchList(IN id INT,IN sym VARCHAR(50))
BEGIN
SELECT ShareSymbol FROM WatchList WHERE UserID=id AND ShareSymbol=sym;
END//

-- Insert into BuyShare
CREATE PROCEDURE buyQuery(IN time TIMESTAMP,IN id INT,IN quant INT,IN price FLOAT,IN sym VARCHAR(50))
BEGIN
INSERT INTO BuyShare VALUES (time,id,quant,price,sym);
END//

-- Insert into SellShare
CREATE PROCEDURE sellQuery(IN time TIMESTAMP,IN id INT,IN quant INT,IN price FLOAT,IN sym VARCHAR(50))
BEGIN
INSERT INTO SellShare VALUES (time,id,quant,price,sym);
END//

-- Insert into User History
CREATE PROCEDURE userHistory(IN time TIMESTAMP,IN id INT,IN quant INT,IN price FLOAT,IN flag INT,IN sym VARCHAR(50))
BEGIN
INSERT INTO UserHistory VALUES (id,quant,time,price,flag,sym);
END//

-- Insert into Share History
CREATE PROCEDURE shareHistory(IN time TIMESTAMP,IN sym VARCHAR(50),IN price FLOAT)
BEGIN
DECLARE rc INT;
SELECT COUNT(*) INTO rc FROM ShareHistory WHERE TimeLog=time AND ShareSymbol=sym;
IF rc>0 THEN
UPDATE ShareHistory SET Price=price WHERE TimeLog=time AND ShareSymbol=sym;
ELSE
INSERT INTO ShareHistory VALUES (time,sym,price);
END IF;
END//

-- Insert in WatchList
CREATE PROCEDURE insertList(IN id INT,IN sym VARCHAR(50))
BEGIN
INSERT INTO WatchList VALUES (id,sym);
END//

-- Delete FROM WatchList
CREATE PROCEDURE deleteList(IN id INT,IN sym VARCHAR(50))
BEGIN
DELETE FROM WatchList WHERE UserID=id AND ShareSymbol=sym; 
END//

delimiter ;
-- ###########################################################################
-- Deleting all tables

-- DROP TABLE User;
-- DROP TABLE Shares;
-- DROP TABLE Currency;
-- DROP TABLE ShareHistory;
-- DROP TABLE WatchList;
-- DROP TABLE BuyShare;
-- DROP TABLE SellShare;
-- DROP TABLE UserHistory;
