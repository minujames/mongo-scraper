$(document).ready(function(){

  $(".scrape-articles").click(function(event){
    console.log("clicked");
    $.get( "/scrape", function(data) {
      alert(data);
      location.reload();
    });
  });
});