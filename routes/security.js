exports.wrap = function (callback) {
    return function (req, res) {
        if (req.session.user) {
            return callback(req, res);

        } else {
            res.redirect('/');
        }
    }
};

exports.login =  function(db) {
	return	function (req, res) {

		var collection = db.get('usercollection');
		collection.find({"username": req.body.loginname},{},function(e,docs){			
			if (docs.length == 0)
			{
				res.redirect('/');
				return;
			}
			var pw = docs[0].password;

			if (pw != req.body.loginpassword)
			{
				res.redirect('/');
			} else {
				req.session.user = req.body.loginname;
				res.redirect('/playerlist');			
			}
		});
	};
};

exports.logout = function() {
	return 	function (req, res) {
	    req.session.user = null;
	    res.redirect('/');
	}
}

