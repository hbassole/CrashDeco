//use path module
const path = require('path');
//permet de prendre en compte la syntaxe de javascript ES6
require('babel-register');
//va nous permettre de creer les route et presque toute la logiue de notre app nodejs
const express = require('express');
//permet de voir en console le status de la requete, le nom da la route demander et le temps d'execution
const morgan = require('morgan');
//initialisation de notre variabe app a partir du require express fait a la rigne 2
const app = express();
//parser les données (vous allez comprendre mieu pendant son utilisation)
const bodyParser = require('body-parser');
//permet de faire des requetes via votre base de données (en ligne) sans complication
const cors = require('cors');
//appelle du module mysql pour nous permettre de faire de sinteractions vers notre bd
const mysql = require('mysql');
const session = require('express-session');
const notifier = require('node-notifier');




const PORT = 3000 ; //numero de port

//initialisation du model de template (moi j'utilise ejs et s'est ce qui est conseiller pour les nouveaux mais vous pouvez utiliser celui que vous voulez)
app.set('view engine', 'hbs');
//indiquez ou es ce que votre serveur doit aller chercher les pages (html) que vous renvoyez au travers de vos requetes
app.set('views', './views');
app.set('views',path.join(__dirname,'views'));

//appel des middlewares (https://medium.com/@selvaganesh93/how-node-js-middleware-works-d8e02a936113)

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cors());
app.use('/public',express.static(__dirname + '/public'));



//je vais d'abord en premiere position initialiser le coordonnées de la base de données pour pouvoir me connecter a la bd
const db = mysql.createConnection({
    host: 'localhost', //hostaname
    database:'crashconst', //nom de ma base de donnée
    user: 'root', //username (mysql)
    password: 'root' ,//password (mysql)
    socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock'
})

db.connect((err)=>{
    if(err){
        console.log(err.message); // s'il ya une erreur le script va s'arreter ici et va afficher l'erreur de connexion dans votre console (évidemment)
    }else{
    	//par contre s'il n'y a pas d'erreur cette partie va s'executer !
        console.log('Vous êtes connecté a la base de donnée');
    }
})


//Routes sur les differentes pages
app.get('/', (req, res) => {
    res.status(200).render('index')
});
app.get('/inscription', (req, res) => {
    res.status(200).render('inscription')
});
app.get('/projet', (req, res) => {
    res.status(200).render('projet')
});





app.get('/estimation', (req, res)=>{
  let sql = "SELECT * FROM devis";
  let query = db.query(sql, (err, results) => {
  if(err) throw err;
  res.status(200).render('estimation',{
    results: results
  });
});
});

app.get('/main', (req, res)=>{
  let sql = "SELECT * FROM devis JOIN user ";
  let query = db.query(sql, (err, results) => {
  if(err) throw err;
  res.status(200).render('main',{
    results: results
  });
});

});

app.get('/suivie', (req, res)=>{
  let sql = "SELECT * FROM devis";
  let query = db.query(sql, (err, results) => {
  if(err) throw err;
  res.status(200).render('suivie',{
    results: results
  });
});
});


app.get('/travaux', (req, res)=>{
  let sql = "SELECT * FROM suivie";
  let query = db.query(sql, (err, results) => {
  if(err) throw err;
  res.status(200).render('travaux',{
    results: results
  });
});
});


//inserer devis
app.post('/save',(req, res) => {
  let data = {nom:req.body.nom,designation: req.body.designation, prixunitaire: req.body.prixunitaire,quantite:req.body.quantite,prixttc:req.body.prixttc,habitation:req.body.habitation};
  let sql = "INSERT INTO devis SET ?";
  let query = db.query(sql, data,(err, results) => {
    if(err) throw err;
    res.redirect('/estimation');
  });
});

//inserer suivie
app.post('/savesuivie',(req, res) => {
  
  let data = {nom_suivie: req.body.nom_suivie,date_suivie: req.body.date_suivie,heure_suivie: req.body.heure_suivie, image_suivie: req.body.image_suivie, text_suivie:req.body.text_suivie};
  let sql = "INSERT INTO suivie SET ?";
  let query = db.query(sql, data,(err, results) => {
    if(err) throw err;

    if (true) {
      
      
    }
    notifier.notify('La suivie a bien ete envoye');
    res.redirect('/main');
  });
});

//Inscription user
app.post('/user',(req, res) => {
  
  let data = {nom_user: req.body.nom,prenom_user: req.body.prenom,contact_user: req.body.contact, email_user: req.body.email, password_user:req.body.password};
  let sql = "INSERT INTO user SET ?";
  let query = db.query(sql, data,(err, results) => {
    if(err) throw err;

    if (true) {
      console.log('Vous avez bien ete enregistrer!!!');
    }
    res.redirect('/');
  });
});

//login user

app.post('/login', function(req, res){
        var email= req.body.email;
        var password = req.body.password;
        db.query('SELECT * FROM user WHERE email_user = ?',[email], function (error, results, fields) {
        if (error) {
          // console.log("error ocurred",error);
          res.send({
            "code":400,
            "failed":"error ocurred"
          })
        }else{
          // console.log('The solution is: ', results);
          if(results.length >0){
            if(results[0].password_user == password){
              res.redirect('/projet')
            }
            else{

              notifier.notify("l'email ou le mot de passe est n'existe pas");
              res.redirect('/')
            }
          }
          else{
            notifier.notify("l'email n'existe pas!!!");
            res.redirect('/')
          }
        }
        });
});
    //route for update data
app.post('/update',(req, res) => {
  let sql = "UPDATE devis SET nom='"+req.body.nom+"', designation='"+req.body.designation+"', prixunitaire='"+req.body.prixunitaire+"', quantite='"+req.body.quantite+"', prixttc='"+req.body.prixttc+"', habitation='"+req.body.habitation+"' WHERE id="+req.body.id;
  let query = db.query(sql, (err, results) => {
    if(err) throw err;
    notifier.notify("le devis a bien ete mise a jour!!!");
    res.redirect('/main');
  });
});

//route for delete data
app.post('/delete',(req, res) => {
  let sql = "DELETE FROM devis WHERE id="+req.body.id+"";
  let query = db.query(sql, (err, results) => {
    if(err) throw err;
      res.redirect('/main');
  });
});

 
//lancer l'application sur un port quelconque ! par default nodejs ecoute sur le 3000
app.listen(PORT, () => {
    console.log(`le serveur est lancé sur le port ${PORT}`) //syntaxe ES6
    console.log('le serveur est lancé sur le port ' + PORT) //syntaxe javascript basique
})
