define(FILES, function(){
  // Parser options
  marked.setOptions({
    breaks : true
  });
  
  var FADESPEED = 300;
  
  var $ol = $('<ol/>').addClass('nav');
  var pages = [];

  $ol
    .attr('start', 0)
    .append($('<lh/>').html('<h3>Contents</h3>'));

  for(var i=0; i<arguments.length; i++) {
    var title = arguments[i].substr(0, arguments[i].indexOf('\n')).replace(/#/g,'');

    var clickHandler = function(e){
      var $el = $(e.target);
      var newPageId = $el.attr('data-id');
      var $newPage = $('#' + newPageId);
      
      $('li').removeClass('selected');
      $el.addClass('selected');
      $('div.content').hide();
      $newPage.fadeIn(FADESPEED);
      
      window.location.href = window.location.href.split('#')[0] + '#' + newPageId;
      window.scrollTo(0,0);
    };

    $ol.append(
      $('<li/>')
        .attr({
          'data-id' : i
        })
        .text(title)
        .click(clickHandler)
    );

    var contentHTML = marked(arguments[i]);

    var $content = $('<div/>')
        .attr('id', i)
        .addClass('content')
        .html(contentHTML);
    
    // Make tables prettier
    $content.find('table').addClass('table table-striped table-bordered');
    
    // Turn zoom links into actual content.
    $content.find('a[href^="zoom"]').each(function(i,v){
        var $this = $(v);
        $('<iframe/>')
            .attr({ src : $this.attr('href') })
            .insertAfter($this);
        $this.remove();
    });
    
    pages.push($content);
  }
  
  var $body = $('body');
  $body.append($ol);
  $body.append.apply($body, pages);
  
  $('div.content').fadeOut(0);
  
  var previousPage = window.location.href.split('#')[1];
  setTimeout(function(){ $('[data-id="'+( previousPage || '0' )+'"]').click(); });
});