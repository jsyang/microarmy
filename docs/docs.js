define([
  'text!Resources.md',
  'text!Behavior-Trees.md',
  'text!Design-Notes.md',
  'text!Devlog.md',
  'text!Pieces.md',
  'text!Gameplay.md',
  'text!Internals.md',
  'text!Misc.md',
  'text!Tools.md'
], function(){
  var $ol = $('<ol/>');
  var pages = [];

  $ol
    .attr('start', 0)
    .append($('<lh/>').html('<h3>Microarmy Docs</h3>'));

  for(var i=0; i<arguments.length; i++) {
    var title = arguments[i].substr(0, arguments[i].indexOf('\n')).replace(/#/g,'');

    $ol.append(
      $('<li/>')
        .attr({
          'data-id' : i
        })
        .text(title)
        .click(function(e){
          $('li').removeClass('selected');
          $(e.target).addClass('selected');
          $('div').hide();
          var newPage = '#'+$(e.target).attr('data-id');
          $(newPage).show();
          window.location.href = window.location.href.split('#')[0] + newPage;
        })
    );

    var $content = $('<div/>')
        .attr('id', i)
        .addClass('hide')
        .html(markdown.toHTML(arguments[i]));
    
    $content.find('a[href^="zoom"]').each(function(i,v){
        var $this = $(v);
        $('<iframe/>')
            .attr({ src : $this.attr('href') })
            .insertAfter($this);
        $this.remove();
    });
    
    pages.push($content);
  }
  
  $('body').append($ol, pages);
  
  /*
  // Show the zoomed sprite if we have a zoom.
  $('a[href^="zoom"]').each(function(v){
    var $this = $(v);
    $this.replaceWith(
        $('<iframe/>').attr({ src : $this.attr('href') })
    );
  });
  */
  var previousPage = window.location.href.split('#')[1];
  setTimeout(function(){ $('[data-id="'+( previousPage || '0' )+'"]').click(); });
});