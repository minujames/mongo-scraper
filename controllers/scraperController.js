var express = require("express");
var router = express.Router();

var request = require("request");
var cheerio = require("cheerio");
var mongoose = require("mongoose");

// Require all models
var db = require("../models");

router.get("/", function(req, res){
  db.Article
  .find({saved: false})
  .then(function(articles){
    res.render("articles", {articles: articles, saved: false});
  })
  .catch(function(err){
    res.json(err);
  });
});

router.get("/saved", function(req, res){
  db.Article
  .find({saved: true})
  .sort({_id: -1})
  .then(function(articles){
    res.render("articles", {articles: articles, saved: true});
  })
  .catch(function(err){
    res.json(err);
  });
});

router.get("/scrape", function(req, res){
  scrapeArticles(function(articles){
    console.log(articles.length);

    var articlesInserted = [];
    var index = 0;

    articles.forEach(function(article){
      db.Article.findOne({link: article.link, title: article.title})
      .then(function(dbArticle){
        if(dbArticle === null){
          articlesInserted.push(db.Article.create(article));
        }
        return articlesInserted;
      })
      .then(function(dbArticleCreated){
        index++;
        console.log(articles.length, index, dbArticleCreated.length);
        if(index === articles.length){
          res.json(dbArticleCreated.length);
        }
      })
      .catch(function(error){
        res.json(error);
      });
    });
  });
});

router.put("/save/:id", function(req, res){
  console.log("save route");
  db.Article.findOneAndUpdate({"_id": req.params.id}, { $set: { saved: true }}, { new: true })
  .then(function(dbArticle){
    console.log(dbArticle);
    res.json(dbArticle);
  })
  .catch(function(error){
    res.json(error);
  });

});

function scrapeArticles(callBack){
  request.get("https://www.nytimes.com/", function(error, response, html){
    var $ = cheerio.load(html);
    var articles = [];
    $("article.theme-summary").each(function(i, element) {

      var link = $(element).children("h2.story-heading").children("a").attr("href");;
      var title = $(element).children("h2.story-heading").children("a").text().replace(/(\r\n|\n|\r)/g,"").trim();
      var summary = $(element).children("p.summary").text().replace(/(\r\n|\n|\r)/g,"").trim();

      if(link && title && summary){
        articles.push({
          link: link, 
          title: title, 
          summary: summary
        });
      }
    });
    callBack(articles);
  });
}

module.exports = router;