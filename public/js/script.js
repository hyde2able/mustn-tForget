$(function() {

    /* flashメッセージは300sで消す */
    setTimeout( function() {
    $('.flash').each( function(idx, element) {
         setTimeout( function(){
            $(element).fadeOut('slow');
         }, 400 * idx);
        });
    }, 3000);

    var e = function(str) {
        return escape(str);
    }

    var milkcocoa = new MilkCocoa('teaihrlwcgv.mlkcca.com');


    /* 地図をクリックした時に、その国のIDを取得する。それを元にその国IDのデータストアの中身を取得する。 */
    var getHistory = function(country) {
        var name = country.fillKey;
        var ds = milkcocoa.dataStore(name).history();
        console.log(name);
    };  



    var fillColor = {
        'level1': '#F4CC48',
        'level2': '#EDA648',
        'level3': '#FF5E48',
        'level4': '#874140',
        'level5': '#FF0007',
        defaultFill: '#EDDC4E'
    };

    var fillKey = {
        'RUS': {fillKey: 'RUS'},
        'PRK': {fillKey: 'PRK'},
        'PRC': {fillKey: 'PRC'},
        'IND': {fillKey: 'IND'},
        'GBR': {fillKey: 'GBR'},
        'FRA': {fillKey: 'FRA'},
        'PAK': {fillKey: 'PAK'},
        'USA': {fillKey: 'USA'}
    };

	var map = new Datamap({
        element: document.getElementById('world'),
        scope: 'world',
        geographyConfig: {
            hideAntarctica: true,   /* 北極は載せない */
            boderWidth: 1,
            borderColor: '#FFFFFF',
            popupOnHover: true,
            popupTemplate: function(geography, data) {
                //console.log(geography);
                return '<div class="hoverinfo"><strong>' + geography.properties.name + '</strong></div>';
            },
            highlightOnHover: true, /* ホバー時にエフェクト */
            highlightFillColor: '#FC8D59',
            highlightBorderColor: 'rgba(250, 15, 160, 0.2)',
            highlightBorderWidth: 2
        },
        bubblesConfig: {
            popupOnHover: true,
            radius: null,
            popupTemplate: function(geography, data) {
                return '<div class="hoverinfo"><strong>' + data.name + '</strong></div>';
            },
            clickAction: function(data) {
                getHistory(data);
            },
            actionOnClick: true,
        },
        fills: fillColor,
        data: fillKey
    });


    // var terro = [{
    //     name: 'Joe 4',
    //     radius: 25,
    //     yield: 400,
    //     country: 'USSR',
    //     fillKey: 'RUS',
    //     significance: 'First fusion weapon test by the USSR (not "staged")',
    //     date: '1953-08-12',
    //     latitude: 50.07,
    //     longitude: 78.43
    // },{
    //     name: 'RDS-37',
    //     radius: 40,
    //     yield: 1600,
    //     country: 'USSR',
    //     fillKey: 'RUS',
    //     significance: 'First "staged" thermonuclear weapon test by the USSR (deployable)',
    //     date: '1955-11-22',
    //     latitude: 50.07,
    //     longitude: 78.43
    // },{
    //     name: 'Tsar Bomba',
    //     radius: 75,
    //     yield: 50000,
    //     country: 'USSR',
    //     fillKey: 'RUS',
    //     significance: 'Largest thermonuclear weapon ever tested—scaled down from its initial 100 Mt design by 50%',
    //     date: '1961-10-31',
    //     latitude: 73.482,
    //     longitude: 54.5854
    // }
    // ];

    var hoverinfo = function(geo, data) {
        var hover = '<div class="hoverinfo">' + data.name;
        hover += '<br/>Payload: ' + data.yield + ' kilotons';
        hover += '<br/>Country: ' + data.country + '';
        hover += '<br/>Date: ' + data.date + '';
        hover += '</div>';
        return hover;
    };

    // map.bubbles(terro, {
    //     popupTemplate: function(geo, data) {
    //         return hoverinfo(geo, data);
    //     },
    // });





});