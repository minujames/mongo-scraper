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
    res.render("articles", {articles: articles, saved: false});
  })
  .catch(function(err){
    res.json(err);
  });
});

router.get("/saved", function(req, res){
  db.Article
  .find({saved: true})
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

// router.get("/scrape", function(req, res){
//   var index = 0;
//   request.get("https://www.nytimes.com/", function(error, response, html){
//     var $ = cheerio.load(html);
//     $("article.theme-summary").each(function(i, element) {

//       var link = $(element).children("h2.story-heading").children("a").attr("href");;
//       var title = $(element).children("h2.story-heading").children("a").text();
//       var summary = $(element).children("p.summary").text();

//         if(link && title && summary){

//           db.Article.findOne({link: link})
//           .then(function(dbArticle){
//             if(dbArticle === null){
//               var summaryTrimmed = summary.replace(/(\r\n|\n|\r)/g,"").trim();
//               var titleTrimmed = title.replace(/(\r\n|\n|\r)/g,"").trim();
//               var article = {
//                 title: titleTrimmed,
//                 link: link,
//                 summary: summary.replace(/(\r\n|\n|\r)/g,"").trim()
//               }
//               return db.Article.create(article);
//             }
//             else{
//               return 0;
//             }
//           })
//           .then(function(articleCreated){
//             if(articleCreated){
//               console.log(articleCreated);
//             }
//           })
//           .catch(function(error){
//             console.log(error);
//           });
//         }
//       });
//   });
//   console.log("articles inserted ", index);
//   res.json("scraped");
// });

module.exports = router;