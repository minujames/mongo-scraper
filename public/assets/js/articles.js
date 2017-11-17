$(document).ready(function(){

  $(".scrape-articles").click(function(event){
    console.log("clicked");
    $.get( "/scrape", function(data) {
      alert(data);
      location.reload();
    });
  });

  $(document).on("click", ".save-article", function(event){
    var articleId = $(this).data("id");
    console.log(articleId);
    $.ajax({
      url: "/save/" + articleId,
      method: "PUT"
    }).done(function(response) {
      console.log(response);
      location.reload();
    });
  });

});