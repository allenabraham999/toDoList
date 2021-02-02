const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();
const _ = require("lodash");
const { Console } = require("console");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todo", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//Check if mongoose.Schema is required.
const itemSchema = mongoose.Schema({
  name: String,
});
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome.",
});

const item2 = new Item({
  name: "Click On + To Add an Item.",
});

const item3 = new Item({
  name: "<--Click Here to Remove an Item.",
});

const defaultList = [item1, item2, item3];

const listSchema = mongoose.Schema({
  name: String,
  items: [itemSchema],
});

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find({}, function (err, foundItem) {
    if (foundItem.length === 0) {
      Item.insertMany(defaultList, function (err, docs) {
        if (!err) {
          console.log("Success");
        } else {
          console.log("Failure");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { ListName: "Today", list: foundItem });
    }
  });
});

app.post("/", function (req, res) {
  const listName = req.body.list;
  const text = req.body.theText;

  const item = new Item({
    name: text,
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundItem) {
      foundItem.items.push(item);
      foundItem.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function (req, res) {
  const id = req.body.checkbox;
  const listName = req.body.list;
  console.log("ListName: "+listName);
  console.log("ID: "+id);
  if(listName === "Today"){
    Item.findByIdAndDelete(id, function (err) {
      if (!err) {
        console.log("Successfully deleted the Item.");
        console.log("Here.");
        res.redirect("/");
      } else {
        console.log(err);
      }
    });
  }else{
    List.findOneAndUpdate(
      {name: listName},
      {$pull:{items:{_id:id}}},
      function(err,foundList){
        if(!err){
          console.log("Over Here.");
          res.redirect("/" + listName);
        }
      }
    );
  }
});


app.post("/newone",function(req, res){
  console.log("Here.");
  console.log(req.body);
  const item = req.body.newEvent;
  res.redirect("/"+item);
});

app.get("/:event", (req, res) => {
  const event = req.params.event;
  List.findOne({ name: event }, function (err, foundItem) {
    if (!foundItem) {
      const list = new List({
        name: event,
        items: defaultList,
      });
      list.save();
      res.redirect("/" + event);
    } else {
      res.render("list", { ListName: event, list: foundItem.items });
    }
  });
});

app.listen(3000, function (req, res) {
  console.log("Local Host Set up on port 3000");
});
