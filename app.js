var express = require('express');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var fs = require('fs');

var mysql = require('mysql').createConnection({
	user:'root',
	password:'tjrwls12',
	dateStrings:true,
	database:'db_sys'
});

var app = express();
app.use(bodyParser.urlencoded({extended: false}));

app.listen(9060, function () {
  console.log('server running at http://127.0.0.1:9060');
});

app.get('/', function (req, res) {
  fs.readFile('main.html', 'utf8', function (error, data) {
      res.send(data);
    });
  });

app.post('/search',function(req,res){
	if(req.body.category=="patient"){
		fs.readFile('search_patient.html','utf8',function(error, data){
			var sql='select name,date,sick,doctor from patient where name="'+req.body.search+'"';
			mysql.query(sql, function (error, results) {
				if(error){console.log(error.message);}
				res.send(ejs.render(data, {
					data: results
				}));
			});
		});
	}
	if(req.body.category=="doctor"){
		fs.readFile('search_doctor.html','utf8',function(error, data){
			var sql='select name,major,phone from doctor where name="'+req.body.search+'"';
			mysql.query(sql, function (error, results) {
				if(error){console.log(error.message);}
				res.send(ejs.render(data, {
					data: results
				}));
			});
		});
	}
});

app.get('/login',function(req,res){
	fs.readFile('login.html','utf8',function(error,data){
		res.send(data);
	});
});

app.get('/admin',function(req,res){
	fs.readFile('admin_service.html','utf8',function(error,data){
		res.send(data);
	});
});

app.post('/login',function(req,res){
	var sql='select*from user where id="'+req.body.loginID+'"';
	mysql.query(sql,function(error,results){
		
		if(results.length>0){
			if(req.body.loginPW==results[0].pw && results[0].position=='admin'){
				fs.readFile('admin_service.html','utf8',function(error,data){
					res.send(data);
				});
			}
			else if(req.body.loginPW==results[0].pw && results[0].position=='patient'){
				res.redirect('/patient_service/'+req.body.loginID);
			}
			else if(req.body.loginPW==results[0].pw && results[0].position=='doctor'){
				res.redirect('/doctor_service/'+req.body.loginID);
			}
			else{
				res.redirect('/login');
			}
		}
		else{
			res.redirect('/login');
		}
	});
});

app.get('/patient_service/:id',function(req,res){
	fs.readFile('patient_service.html','utf8',function(error,data){
		var sql='select patient.name,food.food,food.sick from patient,food where id="'+req.params.id+'" '+'and patient.sick=food.sick';
		mysql.query(sql,function(error,results){
			if(error){console.log(error.message);}
			res.send(ejs.render(data,{
				data: results
			}));
		});
	});
});

app.get('/doctor_service/:id',function(req,res){
	fs.readFile('doctor_service.html','utf8',function(error,data){
		var sql='select*from patient where doctor="'+req.params.id+'" order by date';
		mysql.query(sql,function(error,results){
			if(error){console.log(error.message);}
			res.send(ejs.render(data,{
				data: results
			}));
		});
	});
});


app.get('/patient_table',function(req,res){
	fs.readFile('patient_table.html','utf8',function(error,data){
		var sql='select*from patient';
		mysql.query(sql, function (error, results) {
			if(error){console.log(error.message);}
			res.send(ejs.render(data, {
				data: results
			}));
		});
	});
});

app.get('/doctor_table',function(req,res){
	fs.readFile('doctor_table.html','utf8',function(error,data){
		var sql='select*from doctor';
		mysql.query(sql,function(error,results){
			if(error){console.log(error.message);}
			res.send(ejs.render(data, {
				data: results
			}));
		});
	});
});

app.get('/user_table',function(req,res){
	fs.readFile('user_table.html','utf8',function(error,data){
		var sql='select*from user';
		mysql.query(sql,function(error,results){
			if(error){console.log(error.message);}
			res.send(ejs.render(data, {
				data: results
			}));
		});
	});
});

app.get('/food_table',function(req,res){
	fs.readFile('food_table.html','utf8',function(error,data){
		var sql='select*from food';
		mysql.query(sql,function(error,results){
			if(error){console.log(error.message);}
			res.send(ejs.render(data, {
				data: results
			}));
		});
	});
});



app.get('/patient_delete/:id', function (req, res) {
  // 데이터베이스 쿼리를 실행합니다.
  var sql='delete from patient where id="'+req.params.id+'"';
  mysql.query(sql, function () {
    // 응답합니다.
    res.redirect('/patient_table');
  });
});

app.get('/doctor_delete/:id', function (req, res) {
  // 데이터베이스 쿼리를 실행합니다.
  var sql='delete from doctor where id="'+req.params.id+'"';
  mysql.query(sql, function () {
    // 응답합니다.
    res.redirect('/doctor_table');
  });
});

app.get('/user_delete/:id', function (req, res) {
  var sql='delete from user where id="'+req.params.id+'"';
  mysql.query(sql, function () {
    res.redirect('/user_table');
  });
});

app.get('/food_delete/:food', function (req, res) {
  var sql='delete from food where food="'+req.params.food+'"';
  mysql.query(sql, function () {
    res.redirect('/food_table');
  });
});



app.get('/patient_insert',function(req,res){
	fs.readFile('patient_insert.html','utf8',function(error,data){
		res.send(data);
	});
});
app.post('/patient_insert', function (req, res) {
	var sql='insert into patient(id,name,date,sick,doctor) values(?, ?, ?, ?, ?)';
	var body=req.body;
	mysql.query(sql,[body.id,body.name,body.date,body.sick,body.doctor],function(){
		res.redirect('/patient_table');
	});
});

app.get('/doctor_insert',function(req,res){
	fs.readFile('doctor_insert.html','utf8',function(error,data){
		res.send(data);
	});
});
app.post('/doctor_insert', function (req, res) {
	var sql='insert into doctor(id,name,major,phone) values(?, ?, ?, ?)';
	var body=req.body;
	mysql.query(sql,[body.id,body.name,body.major,body.phone],function(){
		res.redirect('doctor_table');
	});
});

app.get('/user_insert',function(req,res){
	fs.readFile('user_insert.html','utf8',function(error,data){
		res.send(data);
	});
});
app.post('/user_insert', function (req, res) {
	var sql='insert into user(id,pw,position) values(?, ?, ?)';
	var body=req.body;
	mysql.query(sql,[body.id,body.pw,body.position],function(){
		res.redirect('/user_table');
	});
});

app.get('/food_insert',function(req,res){
	fs.readFile('food_insert.html','utf8',function(error,data){
		res.send(data);
	});
});
app.post('/food_insert', function (req, res) {
	var sql='insert into food(food,sick) values(?, ?)';
	var body=req.body;
	mysql.query(sql,[body.food,body.sick],function(){
		res.redirect('/food_table');
	});
});



app.get('/patient_edit/:id', function (req, res) {
  fs.readFile('patient_edit.html', 'utf8', function (error, data) {
    mysql.query('select * from patient where id = ?', [req.params.id], function (error, result) {
      res.send(ejs.render(data, {
        data: result[0]
      }));
    });
  });
});
app.post('/patient_edit/:id', function (req, res) {
  var body = req.body;
  mysql.query('update patient set name=?, date=?, sick=?, doctor=? where id=?', [
  body.name, body.date, body.sick, body.doctor, req.params.id], function () {
	  res.redirect("/patient_table");
  });
});

app.get('/doctor_edit/:id', function (req, res) {
  fs.readFile('doctor_edit.html', 'utf8', function (error, data) {
    mysql.query('select * from doctor where id = ?', [req.params.id], function (error, result) {
      res.send(ejs.render(data, {
        data: result[0]
      }));
    });
  });
});
app.post('/doctor_edit/:id', function (req, res) {
  var body = req.body;
  mysql.query('update doctor set name=?, major=?, phone=? where id=?', [
  body.name, body.major, body.phone, req.params.id], function () {
	  res.redirect("/doctor_table");
  });
});

app.get('/user_edit/:id', function (req, res) {
  fs.readFile('user_edit.html', 'utf8', function (error, data) {
    mysql.query('select * from user where id = ?', [req.params.id], function (error, result) {
      res.send(ejs.render(data, {
        data: result[0]
      }));
    });
  });
});
app.post('/user_edit/:id', function (req, res) {
  var body = req.body;
  mysql.query('update user set pw=?, position=? where id=?', [
  body.pw, body.position, req.params.id], function () {
	  res.redirect("/user_table");
  });
});

app.get('/food_edit/:food', function (req, res) {
  fs.readFile('food_edit.html', 'utf8', function (error, data) {
    mysql.query('select * from food where food = ?', [req.params.food], function (error, result) {
      res.send(ejs.render(data, {
        data: result[0]
      }));
    });
  });
});
app.post('/food_edit/:id', function (req, res) {
  var body = req.body;
  mysql.query('update food set sick=? where food=?', [
  body.sick, req.params.id], function () {
	  res.redirect("/food_table");
  });
});