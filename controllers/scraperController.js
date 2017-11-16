var express = require("express");
var router = express.Router();

var request = require("request");
var cheerio = require("cheerio");
var mongoose = require("mongoose");


// Require all models
var db = require("../models");

router.get("/", function(req, res){
  db.Article
  .find({})
  .then(function(articles){
    res.render("articles", {articles: articles});
  })
  .catch(function(err){
    res.json(err);
  });
});

router.get("/saved", function(req, res){

});

router.get("/scrape", function(req, res){
  request.get("https://www.nytimes.com/", function(error, response, html){
    var $ = cheerio.load(html);
    var titles = [];
    var index = 0;
    $("article.theme-summary").each(function(i, element) {

      var link = $(element).children("h2.story-heading").children("a").attr("href");;
      var title = $(element).children("h2.story-heading").children("a").text();
      var summary = $(element).children("p.summary").text();

        // var byline = $(element).children("p.byline").text();
        // var date = $(element).children("p.byline").children("time").attr("datetime");

        if(link && titles && summary){

          db.Article.findOne({link: link})
          .then(function(dbArticle){
            if(dbArticle === null){
              var summaryTrimmed = summary.replace(/(\r\n|\n|\r)/g,"").trim();
              var titleTrimmed = title.replace(/(\r\n|\n|\r)/g,"").trim();
              var article = {
                title: titleTrimmed,
                link: link,
                summary: summary.replace(/(\r\n|\n|\r)/g,"").trim()
              }
              return db.Article.create(article);
            }
            else{
              return 0;
            }
          })
          .then(function(articleCreated){
            if(articleCreated){
              console.log(articleCreated);
            }
          })
          .catch(function(error){
            res.json(error);
          });
        }
      });
    res.json("scraped");
  });
});

module.exports = router;