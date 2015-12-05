
var express = require('express')
,   async = require('async')
,   app = express();


//////////////////  MilkCocoa ////////////////
var MilkCocoa = require('milkcocoa');
var milkcocoa = new MilkCocoa('uniihs82zyf.mlkcca.com');
var country = milkcocoa.dataStore('country').history();

/* appの設定 */
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));


app.get('/', function(req, res) {
    res.render('index', {});
});




app.listen(app.get('port'));
console.log('Express server listening on port ' + app.get('port'));


