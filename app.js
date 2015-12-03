
var express = require('express')
    ,app = express();


//////////////////  MilkCocoa ////////////////
// var MilkCocoa = require('milkcocoa');
// var milkcocoa = new MilkCocoa('readih652j8r.mlkcca.com');
// var ds = milkcocoa.dataStore("ranking");// dataStore作成

/* appの設定 */
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));


app.get('/', function(req, res) {


    res.render('index', {});


	return;
    });




app.listen(app.get('port'));
console.log('Express server listening on port ' + app.get('port'));

