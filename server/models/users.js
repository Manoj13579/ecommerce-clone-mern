import mongoose from "mongoose";


const usersSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    googleId: {
      type: String,
    },
    /* although email is not defined as unique here bcoz it's what logic demands. but index in mongo db atlas in users collection can automatically(could or couldnot. first you had unique in model and later deleted it could have) add unique so need to go to index in users collection and delete unique. */
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      // Password is required only if googleId is not present
      /* have to do this coz google auth don't need password field.if present throws error. not needed
      coz google handles auth in it's own in google windows. but email field is required*/
      required: function() {
        return !this.googleId;
      },
    },
    role: {
      type: String,
      /* the enum option in Mongoose schemas is used to validate that the value of a field is one of the specified allowed values. It restricts the values that the field can take to a predefined set of values, ensuring data integrity.*/
      enum: ['user', 'admin'],
      default: 'user'
    },
    photo: {
      type: String,
    },
    refreshToken: {
      type: String
    },
    authProvider: {
      type: String,
      enum: ['jwt', 'google'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
usersSchema.index({ email: 1, authProvider: 1 }, { unique: true });
// collection created in database
const Users = mongoose.model("users", usersSchema);
export default Users;
