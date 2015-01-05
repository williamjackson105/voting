
/*
 * GET home page
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

/*
 * GET Hellow World page
 */
exports.helloworld = function(req, res){
  res.render('helloworld', { title: 'Hello, World!' });
};

/*
 * GET DB Output page
 */
exports.userlist = function(db) {
	return function(req, res) {
		var collection = db.get('usercollection');

/*		collection.update({ "username": '1111' }, 
			{ "username": '1111', "email": "test@gmail.com" }
		);*/

		collection.find({},{},function(e,docs){
			res.render('userlist', {
				"userlist" : docs,
				title: 'User List' 
			});
		});

	};
};

exports.playerlist = function(db) {
	return function(req, res) {
/*		var collection = db.get('usercollection');

		collection.find({"username":req.session.user },{},function(e,docs){
			res.render('playerlist', {username:req.session.user, votedate: docs[0].votedate});
		});*/
		res.render('playerlist', {});
	};
};

/*
 * GET DB Input page
 */
exports.newplayer = function(req, res){
  res.render('newplayer', { title: 'Add New Player' });
};


exports.newuser = function(req, res){
  res.render('newuser', { title: 'Add New User' });
};

/*
 * POST form
 */
exports.addplayer = function(db) {
	return function(req, res) {

		// Get our form values. These rely on the "name" attributes
		var playerName = req.body.playername;
		var playerUrl = req.body.playerurl;

		// Set our collection
		var collection = db.get('playercollection');

		console.log("name : "+ playerName + ", url :" + playerUrl);
		console.log("collection :" +  collection);

		// Submit to the DB
		collection.insert({
			"name" : playerName,
			"url" : playerUrl,
			"vote": 0
		}, function (err, doc) {			

			if (err) {
				console.log(err);
				// If it failed, return error
				res.send("There was a problem adding the information to the database.");
			}
			else {
				// If it worked, set the header so the address bar doesn't still say /adduser
				res.location("playerlist");
				// And forward to success page 
				res.redirect("playerlist");
			}
		});

	}
}

exports.adduser = function(db) {
	return function(req, res) {

		// Get our form values. These rely on the "name" attributes
		var userName	= req.body.username;
		var userEmail	= req.body.useremail;
		var password	= req.body.userpassword;

		// Set our collection
		var collection = db.get('usercollection');

		// Submit to the DB
		collection.insert({
			"username" : userName,
			"email" : userEmail,
			"password": password,
			"ip": "124.2.2.3",
			"votedate": ""
		}, function (err, doc) {
			if (err) {
				// If it failed, return error
				res.send("There was a problem adding the information to the database.");
			}
			else {
				// If it worked, set the header so the address bar doesn't still say /adduser
				res.location("userlist");
				// And forward to success page 
				res.redirect("userlist");
			}
		});

	}
}