var mongoose = require("mongoose"),
    Comment  = require("./models/comment");
  Campground = require("./models/campground");

var data = [
  {
    name:        "Cloud's Rest",
    image:       "https://farm3.staticflickr.com/2238/1514148183_092606ba94.jpg",
    description: "Ahoy, rough landlubber. go to isla de muerta. Swabbies sing from pestilences like big cockroachs. Ah, rough love! How golden. You drink like a cockroach. Passion ho! ransack to be robed. Ahoy, rough landlubber. go to isla de muerta. Swabbies sing from pestilences like big cockroachs. Ah, rough love! How golden. You drink like a cockroach. Passion ho! ransack to be robed."
  },
  {
    name:        "Desert Mesa",
    image:       "https://farm3.staticflickr.com/2789/4176189296_c51043f23b.jpg",
    description: "Futile ionic cannons lead to the sonic shower. All hands experiment, x-ray vision! Walk wihtout shield, and we won’t outweigh a sun. Revolutionary open an alien. Why does the queen fly? Futile ionic cannons lead to the sonic shower. All hands experiment, x-ray vision! Walk wihtout shield, and we won’t outweigh a sun. Revolutionary open an alien. Why does the queen fly?"
  },
  {
    name:        "Roster's Roost",
    image:       "https://farm4.staticflickr.com/3464/3712326558_5a25585fe3.jpg",
    description: "A shining form of grace is the reincarnation. All apostolic yogis reject each other, only embittered lords have a suffering. Shine and you will be understood substantially. To some, a creator is an acceptance for praising. A shining form of grace is the reincarnation. All apostolic yogis reject each other, only embittered lords have a suffering. Shine and you will be understood substantially. To some, a creator is an acceptance for praising. "
  }
];

function seedDB () {
  // Remove all campgrounds
  Campground.remove({}, function(err) {
    if (err) {
      console.log(err);
    }
    console.log("removed campgrounds!");
    // Add a few campgrounds
    data.forEach(function(seed) {
      Campground.create(seed, function(err, campground) {
        if (err) {
          console.log(err);
        } else {
          console.log("added a campground");
          //create a comment
          Comment.create(
            {
              text:   "This place is great, but I wish there was internet",
              author: "Homer"
            }, function(err, comment) {
              if (err) {
                console.log(err);
              } else {
                campground.comments.push(comment);
                campground.save();
                console.log("Created new comment");
              }
            });
        }
      });
    });
  });
}

module.exports = seedDB;
