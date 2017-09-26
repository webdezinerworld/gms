var express = require('express');
var router = express.Router();
var md5 = require('md5');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET Hello World page. */
router.get('/helloworld', function(req, res) {
    res.render('helloworld', { title: 'Hello, World!' });
});


/* GET Userlist page. */
router.get('/userlist', function(req, res) {
    var db = req.db;
    var collection = db.get('usercollection');
    collection.find({},{},function(e,docs){
        docs = docs.reverse();
        res.render('userlist', {"userlist" : docs});
    });
});

/* GET User delete page. */
router.get('/delete/:id', function(req, res) {
    var db = req.db;
    var uid = req.params.id;
    var collection = db.get('usercollection');
    collection.remove({"_id":uid},{},function(e,docs){
        res.redirect("/userlist");
    });
});


/* GET New User page. */
router.get('/newuser', function(req, res) {
    res.render('newuser', { title: 'Add New User', error: "", success: req.session.success, errors: req.session.errors });
    req.session.errors = null;
});

/* POST to Add User Service */
router.post('/adduser', function(req, res, next) {
    //check validation
    console.log("adduser"); 
    req.check('username','Enter username').isLength({min: 4});
    req.check('useremail','Enter valid email').isEmail();
    req.check('password','Enter valid password or confirm password').equals(req.body.confirmPassword);;
    req.check('phone','Enter valid phone no.').isLength({min: 10});;

    var errors = req.validationErrors();
    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    var userName = req.body.username;
    var userEmail = req.body.useremail;
    var userPassword = md5(req.body.password);
    var userPhone = req.body.phone;

    // Set our collection
    var collection = db.get('usercollection');

    if(errors) {
        console.log(errors);
        req.session.errors = errors;
        req.session.success = false;
        //res.redirect('newuser', { title : "errors"});
        res.render('newuser', { error: errors, title: 'Add New User' });
        return false
    } else {
        req.session.success = true;
        // Submit to the DB
        collection.insert({
            "username" : userName,
            "email" : userEmail,
            "password" : userPassword,
            "phone" : userPhone
        }, function (err, doc) {
            if (err) {
                // If it failed, return error
                res.send("There was a problem adding the information to the database.");
            }
            else {
                // And forward to success page
                res.redirect("userlist");
            }
        });
    }
    //


});



/* GET User update page. */
router.get('/updateuser/:id', function(req, res) {
    var db = req.db;
    var uid = req.params.id;
    var collection = db.get('usercollection');
    collection.find({"_id":uid},{},function(e,docs){
        console.log(docs);
        /*docs = docs.reverse();
        res.render('updateuser', {
            "updateuser" : docs
        });*/
        res.render('updateuser', { title : "Update profile", "userupdate": docs });
    });

});


/* update user. */
router.post('/updateprofile/:id', function(req, res) {
    
    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    var userName = req.body.username;
    var userEmail = req.body.useremail;
    var userPassword = md5(req.body.password);
    var userPhone = req.body.phone;
    var uid = req.params.id;
    // Set our collection
    var collection = db.get('usercollection');

    // Submit to the DB
    collection.update({"_id":uid},{
        "username" : userName,
        "email" : userEmail,
        "password" : userPassword,
        "phone" : userPhone
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // And forward to success page
            res.redirect("/userlist");
        }
    });
});


/* login page. */
router.get('/login', function(req, res) {
    res.render('login', { title: 'Login page' });
});


/*-------maintaining session-----------*/


    // Authentication and Authorization Middleware
    var auth = function(req, res, next) {
        console.log("alert!!")
      if (req.session && req.session.username === "testuser1" && req.session.admin){
        console.log("alert nxt")
        return next();
      }
      else
        return res.sendStatus(401);
    };



router.post('/loginuser', function(req, res) {
  var db = req.db;
  // Get our form values. These rely on the "name" attributes
  var userName = req.body.username;
  var userPassword = md5(req.body.password);
  var collection = db.get('usercollection');
  collection.findOne({ username: userName }, function(err, user) {
    console.log(user);
    if (!user) {
        console.log("in")
        res.render('login', { title: 'Login page', error: 'Invalid email or password.' });
    } else {
        console.log("in else!!")
      if (userPassword === user.password) {
        console.log("in email");
        // sets a cookie with the user's info
        console.log(user);
        req.session.user = user;
        res.redirect('/dashboard');
      } else {
        console.log("in else else");
        res.render('login', { error: 'Invalid email or password.' });
      }
    }
  });
});


/* dashboard page. */
router.get('/dashboard', function(req, res) {
    console.log("req.session.user")
    //console.log(req.session.user)
    if(req.session.user != undefined){
        res.render('dashboard', { title: 'Dashboard page' });
    } else {
        res.render('login', { title: 'Login page' });
    }
    
});

/* logout user */
router.post('/logoutuser', function(req, res) {
    console.log("req.session.user")
    //console.log(req.session.user)
    req.session.destroy(function(err){  
        if(err){  
            console.log(err);  
        }  
        else  
        {  
            //res.redirect('/');
            res.render('login', { title: 'Login page', error: 'U r logged out' });
        }  
    });
});




module.exports = router;
