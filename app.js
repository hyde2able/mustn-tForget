
var express = require('express')
,   async = require('async')
,   client = require('cheerio-httpcli')
,   partials = require('express-partials')
,   LRU = require('lru-cache')
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
app.use(partials());


// Livedoorのテロ関連のニュース取得
var getArticles = function(callback) {
    var articles = [];
    var key = 0;

    var news = client.fetch('http://news.livedoor.com/%E3%83%86%E3%83%AD%E3%83%AA%E3%82%B9%E3%83%88/topics/keyword/28915/');
    news.then(function(result) {
        result.$('ul.articleList a').each( function(idx) {
            var $this = result.$(this);
            var article = {
                href: $this.attr('href').replace(/topics/, 'article'),
                title: $this.find('h3.articleListTtl').text(),
                p: $this.find('p.articleListSummary').text(),
                time: $this.find('time.articleListDate').attr('datetime').match(/\d{4}-\d{2}-\d{2}/)[0]
            };
            cache.set(key, article);
            key += 1;
            articles.push(article);
        });
    });

    news.catch( function(err) {
        console.log(err);
    });

    news.finally(function() {
        callback(articles);
    });
};



var options = {
  max: 500, //キャッシュの最大件数
  maxAge: 24 * 60 * 60 * 1000 //保存期間の指定、単位はミリ秒(1日)
}
var cache = LRU(options);

app.get('/', function(req, res) {

    var articles = [];

    if( cache.has(0) ) {
        console.log('まだなにもないよ');
        cache.forEach(function(value, key, cache) {
            articles.push(value);
        });
        res.render('index', {articles: articles});
    } else {
        getArticles(function(articles) {
            res.render( 'index', {articles: articles } );
        });
    }
});





app.listen(app.get('port'));
console.log('Express server listening on port ' + app.get('port'));


