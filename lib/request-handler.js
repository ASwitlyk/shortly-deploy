var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
var User = require('../app/models/user');
// var Link = require('../app/config');
var Users = require('../app/collections/users');
var Links = require('../app/collections/links');
console.log('Link is: ',db.Link);
exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function(){
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.send(200, links.models);
  })
};
  // this.on('creating', function(model, attrs, options){
  // });

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  new Link({ url: uri }).find(function(found) {
    if (found) {
      res.send(200, found);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var shasum = crypto.createHash('sha1');
        shasum.update(uri);

        var link = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin,
          code: shasum.digest('hex').slice(0, 5)
        });

        link.save(function(err, newLink) {
          Links.add(newLink);
          res.send(200, newLink);
        });
      });
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  new User({ username: username })
    .fetch()
    .then(function(user) {
      if (!user) {
        res.redirect('/login');
      } else {
        user.comparePassword(password, function(match) {
          if (match) {
            util.createSession(req, res, user);
          } else {
            res.redirect('/login');
          }
        })
      }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  new User({ username: username })
    // .find(function(err, user) {
    //   if (!user) {
    //     var newUser = new User({
    //       username: username,
    //       password: password
    //     });

    //     newUser.save(function(err, newUser) {
    //         util.createSession(req, res, newUser);
    //         Users.add(newUser);
    //       });
    //   } else {
    //     console.log('Account already exists');
    //     res.redirect('/signup');
    //   }
    // })
};

exports.navToLink = function(req, res) {
  var link = new db.Link({code: req.params[0]});
  // link.find(function(err, link) {
  //   if(!link) {
  //     console.log('err');
  //   }
  //   link.visits++;
  //   link.save(function(err, link) {
  //   });
  // });
  //
  //
  //
  // new Link({ code: req.params[0] }).find(function(err, link) {
  //   if (!link) {
  //     res.redirect('/');
  //   } else {
  //     link.save(function(err, ){ visits: link.get('visits') + 1 })
  //       .save()
  //       .then(function() {
  //         return res.redirect(link.get('url'));
  //       });
  //   }
  // });
};
