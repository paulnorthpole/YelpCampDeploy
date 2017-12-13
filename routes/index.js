var express    = require("express"),
    router     = express.Router(),
    passport   = require("passport"),
    User       = require("../models/user"),
    Campground = require("../models/campground"),
    async      = require("async"),
    nodemailer = require("nodemailer"),
    dotenv     = require("dotenv").config(),
    crypto     = require("crypto");

// Root Route
router.get("/", function(req, res) {
	res.render("landing");
});

// show register form
router.get("/register", function(req, res) {
	res.render("register");
});

//handle sign up logic
router.post("/register", function(req, res) {
	var newUser = new User({
      username:  req.body.username,
      firstName: req.body.firstName,
      lastName:  req.body.lastName,
      email:     req.body.email,
      avatar:    req.body.avatar
		});
	if (req.body.adminCode === process.env.ADMINCODE) {
	    newUser.isAdmin = true;
	}
	User.register(newUser, req.body.password, function(err, user) {
		if (err) {
      req.flash("error", err.message);
			return res.redirect("/register");
		} else {
			passport.authenticate("local")(req, res, function() {
        req.flash("success", "Welcome to YelpCamp " + user.username);
				res.redirect("/campgrounds");
			});
		}
	});
});

//Show login form
router.get("/login", function(req, res) {
	res.render("login");
});

// Handling login logic
router.post("/login", passport.authenticate("local",
	{
		successRedirect: "/campgrounds",
		failureRedirect: "/login"
	}), function(req, res) {
});

// Logout Route
router.get("/logout", function(req, res) {
	req.logout();
  req.flash("success", "Logged you out!");
	res.redirect("/campgrounds");
});


// forgotten password reset

router.get('/forgot', function(req, res) {
  res.render('forgot');
});

router.post('/forgot', function(req, res, next) {
	async.waterfall([
		function(done) {
			crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
		function(token, done) {
			User.findOne({ email: req.body.email }, function(err, user) {
				if (!user) {
				    req.flash('error', 'No account with that email address exists.');
				    return res.redirect('/forgot');
				}

				user.resetPasswordToken = token;
				user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

				user.save(function(err) {
					done(err, token, user);
        });
      });
    },
		function(token, user, done) {
		var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.GMAIL,
          pass: process.env.GMAILPW
        }
      });
		var mailOptions = {
			to: user.email,
			from: process.env.GMAIL,
			subject: 'YelpCamp Password Reset Request',
			text: 'You are receiving this E-Mail because you (or someone else) has requested the reset ' +
			      'of your password.  Please click on the following link, or paste this into your browser ' +
			      'to complete the process.  ' +
			      'http://' + req.headers.host + '/reset/' + token + '\n\n' +
						'If you did not request this, please ignore this email and your password will remain unchanged'
		};
		smtpTransport.sendMail(mailOptions, function(err) {
      console.log('mail sent');
      req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
      done(err, 'done');
		});
	}
], function(err) {
		if (err) return next(err);
		res.redirect('/campgrounds');
  })
});


// get and ask to reset password

router.get('/reset/:token', function(req, res) {
	User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
		if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
		}
		res.render('reset', {token: req.params.token});
  });
});


// This is where we enter the new password and confirm it.

router.post('/reset/:token', function(req, res) {
	async.waterfall([
		function(done) {
			User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
				if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
				}
				if(req.body.password === req.body.confirm) {
					user.setPassword(req.body.password, function(err) {
						user.resetPasswordToken = undefined;
						user.resetPasswordExpires = undefined;

						user.save(function(err) {
							req.logIn(user, function(err) {
								done(err, user);
              });
            });
          })
				} else {
          req.flash('error', "Passwords do not match.");
          return res.redirect('back');
				}
      });
    },
		function(user, done) {
			var smtpTransport = nodemailer.createTransport({
				service: "Gmail",
				auth: {
					user: process.env.GMAIL,
					pass: process.env.GMAILPW
				}
			});
			var mailOptions = {
				to: user.email,
				from: process.env.GMAIL,
				subject: 'Your password has been changed',
				text: 'Hello, \n\n' +
					'This is a confirmation that the password for your account ' + user.email + ' has just be changed.'
			};
			smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
	], function(err) {
    res.redirect('/campgrounds');
  });
});


// User Profile
router.get("/users/:id", function(req, res) {
  User.findById(req.params.id, function(err, foundUser) {
    if (err) {
      req.flash("error", "Something went wrong.");
      res.redirect("/");
    }
    Campground.find().where("author.id").equals(foundUser._id).exec(function(err, campgrounds) {
      if (err) {
        req.flash("error", "Something went wrong.");
        res.redirect("/");
      }
      res.render("users/show", {user: foundUser, campgrounds: campgrounds});

    })
  });
});


module.exports = router;



