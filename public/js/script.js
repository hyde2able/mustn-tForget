$(function() {

     $(".chosen-select").chosen({width: "95%"}); 

    var e = function(s) {
        return escape(s);
    }



    // infoモーダル
    $('button#info').click(function() {
        $('#infomodal').show('fast');
    });

    var ip = $('#ip').attr('data-ip');

    var hoverinfo = function(geo, data) {
        var hover = '<div  class="hoverinfo text-center"><strong>' + data.name + '</strong>';
        hover += '<br>' + data.death + '人以上がテロの犠牲になっています。';
        hover += '</div>';
        return hover;
    };

    var color = {}     /* 発生件数による色付け */
    ,   defaultBubbles = []
    ,   bubbles = [];   /* テロの規模  */
    /* ここで死亡者数やテロ発生件数でlevel1, 2, 3, 4, 5を相対比率で割り振る */
    var setColor = function(countries, total, callback) {

        countries.forEach(function(c) {
            if( c.death > 0 ) {
                var data = {
                    name: c.jName,
                    radius: 0,
                    latitude: c.lat + 10,
                    longitude: c.lng + 10,   
                };
                defaultBubbles.push(data);

                var data = {
                    name: c.jName,
                    radius: c.death,
                    death: c.death,
                    country: c.name,
                    latitude: c.lat + 5,
                    longitude: c.lng + 5,
                    id: c.country_id,
                    fillKey: retLevel(c.death)
                }
                if(data.radius > 100) data.radius = 100;
                bubbles.push(data);
            }
            color[c.country_id] = { 
                fillKey: retLevel(c.number, 'number'),
                number: c.number 
            };
        });

        callback(color);
    };

    var Dlevel = [10, 20, 30, 40, 50];
    var Nlevel = [1, 2, 3, 4, 5];
    /* レベルを返す */
    var retLevel = function(num, type) {
        var level = Dlevel;
        if(type == 'number') level = Nlevel;
        if( num == 0) {
            return 'defaultFill';
        } else if ( num < level[0] ) {
            return 'level1';
        } else if ( num < level[1] ) {
            return 'level2';
        } else if ( num < level[2] ) {
            return 'level3';
        } else if ( num < level[3] ) {
            return 'level4';
        } else if ( num < level[4] ) {
            return 'level5';
        } else {
            return 'level5';
        }
    }

    /* 円チャートを表示するかのトグルボタン */
    $('div#switch button').click(function() {
        if ( $(this).hasClass('on') ) {
            map.bubbles( defaultBubbles, { } );
            $(this).removeClass('on');
            $(this).addClass('off');
        } else {
            map.bubbles( bubbles, {
                popupTemplate: function(geo, data) {
                    return hoverinfo(geo, data);
                }
            });
            $(this).removeClass('off');
            $(this).addClass('on');
        }
        return;
    });



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
                jName: datum.value.jName,
                lat: datum.value.lat,
                lng: datum.value.lng
            };
            Dtotal += c.death;
            Ntotal += c.number;
            countries.push(c);
        });
    });

    country.on('end', function() {
        setColor(countries, {death: Dtotal, number: Ntotal}, function(color) {
            mapInit(color);
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
            ip: ip,
            link: link || ''
        };
        if( !country ) return false;
        console.log(data);

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
            alert('追加しました。こういった事がない世界になりたいですね。');
            //console.log(datum);
        }, function(err) {
            alert('追加できませんでした。入力項目が誤っている可能性があります。');
            //console.log(err);
        });

    };
    
    
    /* ある国をクリックしたらその国のDSから過去の歴史を取得 */
    /* 地図をクリックした時に、その国のIDを取得する。それを元にその国IDのデータストアの中身を取得する。 */
    var getHistory = function(country) {
        //console.log(country);
        var dname = country.country || country.properties.name;

        var ds = milkcocoa.dataStore(dname).history();
        ds.size(20);
        ds.limit(999);
        var tragedy = [];        

        ds.on('data', function(data) {
            //console.log(data);
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
            $('section.timeline h1').text( jName[country.id]['name'] );

            /* もし悲劇がその国になかったらタイムラインに何を表示するか？ */
            if( tragedy.length == 0 ) {
                // $('section.timeline ul').html('<p>何も起きていません</p>');
                $('ul.timeline').html('<p>テロのない平和な世界へ</p>');
                return;
            };

            /* 年代順に並び替え */
            tragedy.sort(function(a,b) {
                if(a.date < b.date) return -1;
                if(a.date > b.date) return 1;
                return 0;
            });

            $('ul.timeline').html('');

            tragedy.forEach(function(t) {
                // 20151205 → 2015/12/05
                var date = String(t.date);
                date = date.substr(0, 4) + '/' + date.substr(4, 2) + '/' + date.substr(6, 2);

                var html = '<p>' + escapeHTML( t.description ) + '</p>';
                if( t.link && isUrl(t.link) ) html += '<a href="' + t.link + '" target="_blank">参考</a>';

                $li = $('<li>', {
                    html: html,
                    addClass: 'event timeline--active',
                    css: {display: 'none'}
                });
                $li.attr('data-date', date);

                $li.appendTo( $('section.timeline ul') );
                $li.fadeIn(1000);
            });
        });

        ds.on('error', function(err) {
            console.log(err);
        });

        ds.run();

        //console.log(country);
    };  

    function escapeHTML(s) {
        return s.replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;" )
                .replace(/'/g, "&#39;" );
    }

    /* urlか判定 */
    function isUrl(url) {
        return url.match(/^(https?|ftp)(:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)$/);
    }

    /* マップの色を定めている */
    var fillColor = {
        'level1': '#F4CC48',
        'level2': '#EDA648',
        'level3': '#FF5E48',
        'level4': '#874140',
        'level5': '#FF0007',
        'defaultFill': "#ABDDA4"
    };

    /* mapを作成 */
    var map;
    var mapInit = function(color) {
    	map = new Datamap({
            element: document.getElementById('world'),
            scope: 'world',
            projection: 'mercator',
            height: 450,
            responsive: true,
            geographyConfig: {
                hideAntarctica: true,   /* 北極は載せない */
                boderWidth: 1,
                borderColor: '#fff',
                popupOnHover: true,
                popupTemplate: function(geography, data) {
                    //console.log(geography);
                    var id = geography.id;
                    return '<div class="hoverinfo text-center"><strong>' + jName[id]['name'] + '</strong><br>' + data.number + '件</div>';
                },
                actionOnClick: true,
                clickAction: function(data) {
                    console.log(data);
                    getHistory(data);
                }
            },
            bubblesConfig: {
                popupOnHover: true,
                actionOnClick: true,
                clickAction: function(data) {
                    console.log(data);
                    getHistory(data);
                }
            },
            fills: fillColor,
            data: color
        });
        var agent = navigator.userAgent;
        /* スマホとかからのアクセスの時はレジェンドは表示しない */
        if( !(agent.search(/iPhone/) != -1 || agent.search(/iPad/) != -1 || agent.search(/iPod/) != -1 || agent.search(/Android/) != -1)) {
            map.legend();
        }
    };


    //alternatively with jQuery
    $(window).on('resize', function() {
       map.resize();
    });






});