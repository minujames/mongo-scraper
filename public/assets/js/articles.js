$(document).ready(function(){

  $(".scrape-articles").click(function(event){
    $.get( "/scrape", function(data) {
      
      var h2 = $("<h2>");
      if(parseInt(data) > 0){
        h2.text("Added " + data + " new articles!");
      }
      else{
        h2.text("No new articles!");
      }

      $("#articleModal .modal-body").html(h2);
      $("#articleModal").modal('toggle');
    });
  });

  $('#articleModal').on('hidden.bs.modal', function () {
    location.reload();
  });

  $(document).on("click", ".save-article", function(event){
    var articleId = $(this).data("id");
    $.ajax({
      url: "/save/" + articleId + "/" + true,
      method: "PUT"
    }).done(function(response) {
      location.reload();
    });
  });

  $(document).on("click", ".remove-saved", function(event){
    var articleId = $(this).data("id");
    
    $.ajax({
      url: "/save/" + articleId + "/" + false,
      method: "PUT"
    }).done(function(response) {
      location.reload();
    });
  });

  $(document).on("click", ".add-note", function(event){
    var articleId = $(this).data("id");
    
    $.get( "/article/" + articleId, function(data) {

      $("#noteModal .modal-title").html("Notes: '" + data.title + "'");

      var wrapper = $("<div>");

      var ul = $("<ul>").addClass("list-group");
      data.notes.forEach(function(note){
        var li = $("<li class='list-group-item clearfix'>").text(note.note).attr("data-noteid", note._id);
        var deleteButton = $("<button class='btn btn-danger pull-right note-delete' data-dismiss='modal'>").text("X");
        li.append(deleteButton); 
        ul.append(li);
      });
      $("#noteModal .modal-body").html( ul);

      var textArea = $("<textarea>").attr({id: "text-area-" + articleId , 
        placeholder:"New Note",rows: "5" ,cols: "78" });
      wrapper.append(textArea);
      $("#noteModal .modal-body").append( textArea);

      $("#noteModal .modal-body").append($("<input type=hidden>").attr("data-articleid", articleId).
        attr("id", "hidden-input"));

      $("#noteModal").modal('toggle');
    });
  });

  $(document).on("click", ".save-note", function(event){
    var articleId = $("#hidden-input").attr("data-articleid");
    var noteText = $("#text-area-" + articleId).val().trim();
    if(noteText){
      $.ajax({
        method: "POST",
        url: "/article/" + articleId,
        data: {
          note: noteText
        }
      });
    }
  });

  $(document).on("click", ".note-delete", function(event){
    var articleId = $("#hidden-input").attr("data-articleid");
    var noteId = $(this).parent().attr("data-noteid");

    $.ajax({
      method: "DELETE",
      url: "/note/" + noteId + "/" + articleId
    });

  });

});