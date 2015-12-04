
var express = require('express')
,   async = require('async')
,   app = express();


//////////////////  MilkCocoa ////////////////
var MilkCocoa = require('milkcocoa');
var milkcocoa = new MilkCocoa('teaihrlwcgv.mlkcca.com');
var country = milkcocoa.dataStore('country').history();

/* appの設定 */
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));



/* ここで死亡者数やテロ発生件数でlevel1, 2, 3, 4, 5を相対比率で割り振る */
var setColor = function(countries, total, callback) {
    color = {};
    async.each(countries, function(c, next) {
        color[c.country_id] = {fillKey: 'level1'}
        next();
    }, function(err) {
        callback(countries, color);
    });
};


app.get('/', function(req, res) {

    country.size(20);
    country.limit(200);
    var countries = [];
    var total = 0;

    country.on('data', function(data) {
        console.log(data);
        data.forEach(function(datum) {
            var c = {
                id: datum.id,
                name: datum.value.name,
                country_id: datum.value.country_id,
                death: datum.value.death,
                number: datum.value.number
            };
            total += c.death;
            countries.push(c);
        });
    });

    country.on('end', function() {
        console.log(countries);
        setColor(countries, total, function(countries, color) {
            res.render('index', {country: countries, color: color});
        });
    });

    country.run();

});




app.listen(app.get('port'));
console.log('Express server listening on port ' + app.get('port'));

