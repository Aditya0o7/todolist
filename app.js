//jshint esversion:6

const express = require("express");
const mongoose = require("mongoose")
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const lodash = require("lodash");
mongoose.connect("mongodb://localhost:27017/toDoListItems")

const itemsSchema ={
  name:{
    type: String
  }
}

const listSchema = {
  name: String,
  value: [itemsSchema]
}

const lists = mongoose.model("list", listSchema)
const items = mongoose.model("item", itemsSchema)

const i1 = new items({
  name: "Press '+' this to add item"
})

const i2 = new items({
  name: "<-- Press to delete items"
})

const defaultValues = [i1, i2]

// items.insertMany(defaultValues)
//   .then(()=>{
//     console.log("Inserted Succesfully")
//   })
//   .catch((err)=>{
//     console.log(err)
//   })

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



app.get("/", function(req, res) {

const day = date.getDate();
items.find({})
  .then((foundItems)=>{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  })
  .catch((err)=>{
    console.log(err)
  })
});

app.post("/", function(req, res){
  const item = req.body.newItem;
  let insertedItem = new items({
    name: item
  })
  let listName = req.body.list
  if(req.body.list=="Today"){
    insertedItem.save();
    res.redirect("/")
  }
  else{
    lists.findOne({name: listName})
      .then((foundlist)=>{
        foundlist.value.push(insertedItem);
        foundlist.save()
        res.redirect("/" + listName)
      })
  }
});

app.post("/deleteItems", function(req,res){
  const deletedId = req.body.checkbox;
  let listName = req.body.listName;
  if(listName==="Today"){
    items.findByIdAndDelete(deletedId)
    .then(()=>{
      console.log("Deleted Succesully")
    })
    .catch((err)=>{
      console.log(err)
    })
    res.redirect("/")
  }
  else{
    lists.findOneAndUpdate({name: listName},{$pull:{value:{_id: deletedId}}})
      .then(()=>{
        res.redirect("/" + listName)
      })
      .catch((err)=>{
        console.log(err)
      })
  }
})

app.get("/:customName", function(req,res){
  let customListName = lodash.capitalize(req.params.customName);
  lists.findOne({name: customListName})
    .then((result)=>{
      if(result){
        res.render("list", {listTitle: customListName, newListItems: result.value})
      }
      else{
        const newlist = new lists({
          name: customListName,
          value: defaultValues
        })
        newlist.save();
        res.redirect("/" + customListName)
      }
  })
})



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
