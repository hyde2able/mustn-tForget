$(function() {

    var e = function(s) {
        return escape(s);
    }

    /* ここで死亡者数やテロ発生件数でlevel1, 2, 3, 4, 5を相対比率で割り振る */
    var setColor = function(countries, total, callback) {
        var Dcolor = {};    /* 死者数による色付け */
        var Ncolor = {};    /* 発生件数による色付け */
        countries.forEach(function(c) {
            if( c.number > 0) Dcolor[c.country_id] = {fillKey: 'level2'};

            if(c.country_id == 'CAN') {
                Dcolor[c.country_id] = {fillKey: 'level4'};
            }

        });
        callback(countries, Dcolor);
    };

    /* milkcocoaで国データ取得 */
    var milkcocoa = new MilkCocoa('uniihs82zyf.mlkcca.com');
    var country = milkcocoa.dataStore('country').history();

    country.size(20);
    country.limit(200);
    var countries = [];
    var Dtotal = 0, Ntotal = 0;

    country.on('data', function(data) {
        //console.log(data);
        data.forEach(function(datum) {
            var c = {
                id: datum.id,
                name: datum.value.name,
                country_id: datum.value.country_id,
                death: datum.value.death,
                number: datum.value.number,
                jName: datum.value.jName
            };
            Dtotal += c.death;
            Ntotal += c.number;
            countries.push(c);
        });
    });

    country.on('end', function() {
        setColor(countries, {death: Dtotal, number: Ntotal}, function(countries, color) {
            mapInit(color);
        });
        countries.sort(function(a,b) {
            if(a.jName < b.jName) return -1;
            if(a.jName < b.jName) return 1;
            return 0;
        })
        countries.forEach(function(c) {
            if(c.jName != 'unkown'){
                html = ['<option value="', c.name, '" data-id="', c.id, '">', c.jName, '</option>'].join('');
                $('#country').append(html);
            }
        });
    });
    country.on('error', function(err) {
        console.log(err);
    });

    country.run();


    /* jQuery Validatorのセレクトボックスはないのでメソッドを追加 */
    $.validator.addMethod('selectCheck', function(value, element, origin) {
        return ( origin != value );
    }, '選択してください');

    /* フォームを送信したらその内容をその国のDSにプッシュ */
    $('#register-form').submit(function(e) {
        /* formのバリデーション */
        $('#register-form').validate( {
            rules: {
                reg_date: {
                    required: true,
                    date: true
                },
                reg_description: {
                    required: true,
                    minlength: 10,
                    maxlength: 200
                },
                reg_death: {
                    required: true,
                    number: true,
                    min: 0
                },
                reg_country: {
                    selectCheck: true
                },
                reg_link: {
                    url: true
                }
            },
            messages: {
                reg_date: {
                    required: '日付を入力してください'
                },
                reg_description: {
                    required: '概要を入力してください',
                    minlength: '{0}文字以上入力してください',
                    maxlength: '{0}文字以下におさめてください'
                },
                reg_death: {
                    required: '死亡者数を入力してください',
                    min: '{0}以上を入力してください'
                },
                reg_country: {
                    selectCheck: '国を選択してください'
                },
                reg_link: {
                    url: 'URLの形式ではありません'
                }
            },
            errorClass: 'error',
            errorElement: 'span'
        });
        if( !$("#register-form").valid() ) return false;

        var date = $('#reg_date').val();
        var date = parseInt(date.replace(/-/g, ''), 10);
        var description = $('#reg_description').val();
        var death = $('#reg_death').val();
        var country = $('[name=country]').val();
        var link = $('#reg_link').val();
        var id = $('#country').find(':selected').attr('data-id');

        var data = {
            date: date,
            description: description.replace(/[\n\r]/g,""),
            death: death,
            country: country,
            link: link || ''
        };
        if( !country ) return false;
        console.log(data);

        console.log("submited");
        pushDS(country, data, id);
        /* closeをクリックしてモーダルを閉じる */
        $('.close').trigger('click');
        $('#reg_description').val('');
        $('[name=country]').val('');
        $('#reg_link').val('');
        $('#reg_date').val('');

        e.preventDefault();
    });
    


    /* 事件を追加 */
    var pushDS = function(dname, data, id) {
        var ds = milkcocoa.dataStore(dname);
        var country = milkcocoa.dataStore('country');
        /* countryのDSのテロ件数と死亡者数の合計をセットする */
        country.get(id, function(err, datum) {
            var set_data = {
                death: parseInt(datum.value.death, 10) + parseInt(data.death, 10),
                number: parseInt(datum.value.number, 10) + 1 
            };
            country.set(id, set_data);
        });
        ds.push(data, function(err, datum) {
            // 成功時の処理。　追加しましたとかのメッセージでも流す？
            console.log(datum);
        }, function(err) {
            // ここにエラー時の処理 
            console.log(err);
        });

    };
    
    
    /* ある国をクリックしたらその国のDSから過去の歴史を取得 */
        /* 地図をクリックした時に、その国のIDを取得する。それを元にその国IDのデータストアの中身を取得する。 */
    var getHistory = function(country) {
        var dname = country.properties.name;

        var ds = milkcocoa.dataStore(dname).history();
        ds.size(20);
        ds.limit(999);
        var tragedy = [];        

        ds.on('data', function(data) {
            console.log(data);
            data.forEach(function(datum) {
                var t = {
                    id: datum.id,
                    date: datum.value.date,
                    description: datum.value.description,
                    death: datum.value.death,
                    country: datum.value.country,
                    link: datum.value.link
                };
                tragedy.push(t);
            });
        });

        /* 全て取得が終わったらタイムラインに描画 */
        ds.on('end', function() {
            /* もし悲劇がその国になかったらタイムラインに何を表示するか？ */
            if( tragedy.length == 0 ) {
                // $('section.timeline ul').html('<p>何も起きていません</p>');
                return;
            };

            /* 年代順に並び替え */
            tragedy.sort(function(a,b) {
                if(a.date < b.date) return -1;
                if(a.date > b.date) return 1;
                return 0;
            });

            $('ul.timeline').html('');
            $('section#content h1').html('<h1>' + dname + '</h1>');

            tragedy.forEach(function(t) {
                // 20151205 → 2015/12/05
                var date = String(t.date);
                date = date.substr(0, 4) + '/' + date.substr(4, 2) + '/' + date.substr(6, 2);
                // var html = '<div class="timeline__date">' + e(date) + ':</div>';
                // html += '<p>' + t.description + '</p>';
                // html += '<p>死者:' + e(t.death) + '</p>';

                var html = '<li class="event" data-date="' + date + '">';
                html += '<p>' + t.description + '</p>';
                if( t.link ) html += '<a href="' + e(t.link) + '" target="_blank">参考</a>';
                html += '</li>';

                // $li = $('<li>', {
                //     html: html,
                //     css: {display: 'none'}
                // });

                $('ul.timeline').append(html);

                //$li.appendTo($('section.timeline ul'));
                //$li.fadeIn(1000);
            });
        });

        ds.on('error', function(err) {
            console.log(err);
        });

        ds.run();

        //console.log(country);
    };  


    /* マップの色を定めている */
    var fillColor = {
        'level1': '#F4CC48',
        'level2': '#EDA648',
        'level3': '#FF5E48',
        'level4': '#874140',
        'level5': '#FF0007',
        defaultFill: '#EDDC4E'
    };

    /* mapを作成 */
    var mapInit = function(color) {
    	var map = new Datamap({
            element: document.getElementById('world'),
            scope: 'world',
            projection: 'mercator',
            height: 500,
            geographyConfig: {
                hideAntarctica: true,   /* 北極は載せない */
                boderWidth: 1,
                borderColor: 'rgba(189, 195, 198, .5)',
                popupOnHover: true,
                popupTemplate: function(geography, data) {
                    //console.log(geography);
                    return '<div class="hoverinfo"><strong>' + geography.properties.name + '</strong></div>';
                },
                actionOnClick: true,
                clickAction: function(data) {
                    getHistory(data);
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
            data: color
        });
    };

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