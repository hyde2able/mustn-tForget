$(function() {

    /* flashメッセージは300sで消す */
    setTimeout( function() {
    $('.flash').each( function(idx, element) {
         setTimeout( function(){
            $(element).fadeOut('slow');
         }, 400 * idx);
        });
    }, 3000);

	var world = new Datamap({element: document.getElementById('world')});


    var e = function(str) {
        return escape(str);
    }

});