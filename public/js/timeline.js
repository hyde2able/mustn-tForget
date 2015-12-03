// Vainlla timeline helper function (uses classie helper functions by desandro)
 
var timeline = (function() {
    var init = function() {
        var timelineItems = document.querySelectorAll(".timeline li");
        for (var i=0;i < timelineItems.length;i++) {
            classie.add( timelineItems[i],"timeline--active");
        }   
    };
    return {
    init: init
    };
})();
 
window.onload = function() {
    timeline.init();
};
 
/*!
 * classie v1.0.0
 * class helper functions
 * from bonzo https://github.com/ded/bonzo
 * MIT license
 *
 * classie.has( elem, 'my-class' ) -> true/false
 * classie.add( elem, 'my-new-class' )
 * classie.remove( elem, 'my-unwanted-class' )
 * classie.toggle( elem, 'my-class' )
 */