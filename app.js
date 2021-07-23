//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set("view engine", "ejs");
mongoose.connect("mongodb+srv://admin:test123@cluster0.8hngn.mongodb.net/toDoData", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("css"));
const toDoSchema = new mongoose.Schema({
  name: String

});

const Lists = mongoose.model("list", toDoSchema);
const saturday = new Lists({
  name: "Welcome to my to do List"
});

const sunday = new Lists({
  name: "Hit + to add something"
});

const monday = new Lists({
  name: "Click the left box to delete something"
});
const dinamicDocuments = new mongoose.Schema({
  name: String,
  items: [toDoSchema]
});

const dinamicModel = mongoose.model("dinamic", dinamicDocuments);
const listArray = [saturday, sunday, monday];


app.get("/", function(req, res) {
  Lists.find({}, function(err, result) {
    if (result.length === 0) {
      Lists.insertMany(listArray, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Items inserted succesfully");
        }

      });

    } else {
      res.render("index.ejs", {
        listTitle: "today",
        newListItem: result
      });
    }
  });

});

app.post("/", function(req, res) {

  const itemText = req.body.newItem;
  const listItems = req.body.list;
  const item1 = new Lists({
    name: itemText
  });
  if (listItems === "today") {

    item1.save();
    res.redirect("/");
  } else {
    dinamicModel.findOne({
      name: listItems
    }, function(err, results) {
      results.items.push(item1);
      results.save();
      res.redirect("/" + listItems);
    });
  }



});

app.post("/delete", function(req, res) {
  const checkedItem = req.body.checkbox;
  const deletedItem = req.body.hiddenList;

  if (deletedItem === "today") {
    Lists.findByIdAndRemove(checkedItem, function(err) {
      if (!err) {
        console.log("Items deleted succesfully");
        res.redirect("/");
      }

    });
  } else {
    dinamicModel.findOneAndUpdate({
      name: deletedItem
    }, {
      $pull: {
        items: {
          _id: checkedItem
        }
      }
    }, function(err, results) {
      if (!err) {
        res.redirect("/" + deletedItem);
      }
    });
  }


});
app.get("/:parameter", function(req, res) {
  const parameter = _.capitalize(req.params.parameter);

  dinamicModel.findOne({
    name: parameter
  }, function(err, results) {
    if (!err) {
      if (!results) {
        const item1 = new dinamicModel({
          name: parameter,
          items: listArray
        });
        item1.save();
        res.redirect("/" + parameter);
      } else {
        res.render("index.ejs", {
          listTitle: results.name,
          newListItem: results.items
        });
      }
    }

  });

});

app.post("/work", function(req, res) {
  let workItem = req.body.newItem;
  work.push(workItem);
  res.redirect("/work");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
