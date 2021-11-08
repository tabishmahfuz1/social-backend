const mongoose = require("mongoose");
const shortid = require("shortid");

const { Schema } = mongoose;

const bcrypt = require("bcryptjs");

const UserSchema = new Schema({
  firstName: { required: true, type: String },
  lastName: { required: true, type: String },
  username: { required: true, type: String },
  email: { required: true, type: String },
  avatarImage: {
    type: String,
    default:
      "https://res.cloudinary.com/scoutible/image/upload/v1635777348/samples/people/boy-snow-hoodie.jpg",
  },
  coverImage: {
    type: String,
  },
  gender: { required: true, type: String },
  birthday: { type: Date },
  password: { required: true, type: String },
  workPlace: { type: String },
  homePlace: { type: String },
  school: { type: String },
  friends: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
});

UserSchema.statics.findByEmail = function (email, projection, opts) {
  return this.findOne({ email }, projection, opts);
};

UserSchema.methods.add = function () {
  return new Promise(resolve => {
    bcrypt.hash(this.password, 10, (err, hash) => {
      if (err) throw err;
      const username = `${this.firstName}.${this.lastName
        }${shortid.generate()}`;
      this.username = username.toLowerCase();
      this.password = hash;

      this.save((error, savedObj) => {
        if (error) throw error;
        resolve(savedObj);
      });
    });
  });
};

UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
