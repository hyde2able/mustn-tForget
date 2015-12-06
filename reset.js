/* milkcocoaの国の色をリセットする。 */

var MilkCocoa = require('milkcocoa');
var async = require('async');
var milkcocoa = new MilkCocoa('uniihs82zyf.mlkcca.com');
var ds = milkcocoa.dataStore('country').history();

var cc = [];

ds.size(200);
ds.limit(200)

ds.on('data', function(data) {
    //console.log(data);

    async.each(data, function(datum, next) {
        var c = {
            id: datum.id,
            name: datum.value.name,
            country_id: datum.value.country_id,
            death: datum.value.death,
            number: datum.value.number
        };
        c.d = 0;
        c.n = 0;

        milkcocoa.dataStore(c.name).stream().size(100).next(function(err, dd) {
            if(dd != []){
                console.log(c.name);
                async.each(dd, function(d, next) {
                    c.d += parseInt(d.value.death, 10);
                    c.n += 1
                    console.log(d.value.death);
                    next();
                }, function(err) {
                    console.log('----------');
                    console.log(c.d);
                    console.log(c.n);
                    console.log(c.name);
                    console.log(c.id);
                    milkcocoa.dataStore('country').set(c.id, {death: c.d, number: c.n});
                });
            }
        });


        next();
    }, function(err) {


    });

});

ds.on('end', function() {
    console.log('done');
});

ds.on('error', function(err) {
    console.log(err);
});

ds.run();