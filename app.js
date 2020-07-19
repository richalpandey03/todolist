//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-richal:R_ichal003@cluster0.xwpol.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const listSchema = new mongoose.Schema({
  name: String
});

const List = mongoose.model("List", listSchema);

const item1 = new List({
  name: "Write the item "
});

const item2 = new List({
  name: "Hit the + icon to add"
});

const item3 = new List({
  name: "<-- Hit the checkbox to delete"
});

const defaultvalues = [item1, item2, item3];

const newListSchema = {
  name: String,
  items: [listSchema]
};

const NewList = new mongoose.model("Item", newListSchema);

app.get("/", function(req, res) {

  List.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      List.insertMany(defaultvalues, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Success");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }

  })
});

app.post("/", function(req, res) {

  const newItemName = req.body.newItem;
  const listName = req.body.list;

  const new_item = new List({
    name: newItemName
  })

  if (listName === "Today") {
    new_item.save();
    res.redirect("/");
  } else {
    NewList.findOne({
      name: listName
    }, function(err, result) {
      result.items.push(new_item);
      result.save();
      res.redirect("/" + listName);
    })
  }

});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkedItem;
  const listName = req.body.listName;

  if (listName === "Today") {
    List.deleteOne({
      _id: checkedItemId
    }, function(err) {
      if (!err) {
        console.log("Successfully deleted");
        res.redirect("/");
      }
    })
  } else {
    NewList.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: checkedItemId
        }
      }
    }, function(err, result) {
      if (!err) {
        res.redirect("/" + listName);
      }
    })
  }
});

app.get("/:topic", function(req, res) {
  const topic1 = req.params.topic;

  NewList.findOne({
    name: topic1
  }, function(err, result) {
    if (!err) {
      if (!result) {
        const new_item1 = new NewList({
          name: topic1,
          items: defaultvalues
        });
        new_item1.save();
        res.redirect("/" + topic1);
      } else {
        res.render("list", {
          listTitle: result.name,
          newListItems: result.items
        });
      }
    }
  });
});


app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
