var express = require('express');
var passport= require('passport')
var router = express.Router();

var User=require('../models/user');//NOT REQUIRED YET, MAYBE REQUIRED IN FUTURE
var D = require('../models/drill');//SCHEMA FOR TRANSACTION
var H = require('../models/hashcode');//SCHEMA FOR IP FILTERING

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index.ejs');
});

router.get('/login', function(req, res, next) {
  res.render('login.ejs', { message: req.flash('loginMessage') });
});

router.get('/signup', function(req, res) {
  res.render('signup.ejs', { message: req.flash('loginMessage') });
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

router.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/profile',
  failureRedirect: '/signup',
  failureFlash: true,
}));

router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/profile',
  failureRedirect: '/signup',
  failureFlash: true,
}));

router.get('/profile',isLoggedIn,function(req,res){
	D.find({'user':req.user.email},function(err,drills){
		res.render('profile.ejs',{user:req.user.userdetails,drill:drills});
	});
});

router.post('/create_drill',function(req,res){
	var x=req.body;
	var new_drill=new D();
	new_drill.drillname=x["name"];
	new_drill.user=req.user.email;
	new_drill.nodes.push({week:"week 1",description:x[description]});
	new_drill.save(function(err,obj){
			addHashes(x["hashes"],obj.id);
			res.render('drill.ejs',{drill:obj});
	});
	console.log(x);
	res.send("success");
});

router.post('/add-drill',function(req,res){
var x=req.body;
D.findOne({drillname:x.name},function(err,obj){
	obj.nodes.push({week:x.week,description:x.description});
	obj.save(function(err,doc)
	{
		res.render('drill.ejs',{drill:doc});
	});
});
});

router.get('/drill/:id',function(req,res){
	var id=req.params.id;
	D.findOne({'id':id},function(err,obj){
		res.render('drill.ejs',{drill:obj});
	});
});


module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
      return next();
  res.redirect('/');
}

function addHashes(hashes,drill_id){
	hashes.forEach(function(item){
		H.findOne({'hashname':item},function(err,obj){
			if(err)
			console.log(err)
			if(!user){
				var new_hash=new H();
				new_hash.hashname=item;
				new_hash.drill.push(drill_id);
			}
		});
	});
}
