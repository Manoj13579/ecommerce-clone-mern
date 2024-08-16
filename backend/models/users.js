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
/* compound index with a unique constraint on the email and authProvider fields in the MongoDB collection. can see this in index in mongo db atlas in eccommerce-clone project in users collection. email: 1: This specifies that the email field should be included in the index. The 1 indicates that the index will be in ascending order for this field.
authProvider: 1: Similarly, this specifies that the authProvider field should be included in the index, also in ascending order.
Ascending Order in Indexes
Order of Sorting:

When you specify email: 1 in the index, MongoDB will sort the values of the email field in ascending order.
Ascending order means that values will be arranged from the lowest to the highest. For strings, this means alphabetical order (e.g., "a" comes before "b").
Index Creation:

During the creation of the index, MongoDB will organize the documents in the collection such that the email field values appear in ascending order.
For example, if you have the following emails: ["john@example.com", "alice@example.com", "bob@example.com"], the index will sort these as ["alice@example.com", "bob@example.com", "john@example.com"].
Query Performance:

An ascending index can improve query performance, especially for operations that involve sorting or range queries.
If you frequently query your collection for emails in ascending order, having an index in ascending order on the email field will speed up these queries because MongoDB can quickly traverse the index to find the relevant documents.
Example
Consider the following documents in a collection:

json
Copy code
{ "_id": 1, "email": "charlie@example.com" }
{ "_id": 2, "email": "alice@example.com" }
{ "_id": 3, "email": "bob@example.com" }
When you create an index with email: 1, MongoDB will internally organize the index as:

perl
Copy code
"alice@example.com" -> { "_id": 2, "email": "alice@example.com" }
"bob@example.com"   -> { "_id": 3, "email": "bob@example.com" }
"charlie@example.com" -> { "_id": 1, "email": "charlie@example.com" }
This ordering allows MongoDB to efficiently retrieve documents in alphabetical order based on the email field.


The purpose of this unique compound index is to prevent duplicate entries where the same email is used with the same authentication provider. This is particularly useful in scenarios where a user might be authenticated through different providers (e.g., JWT and Google) and ensures data integrity by enforcing that each email-authProvider combination is unique.

Practical Example
Consider the following scenarios:

A user signs up using their email and password (JWT authentication). Their document might look like this:

json
Copy code
{
  "email": "user@example.com",
  "authProvider": "jwt",
  "password": "hashedpassword"
}
The same user then tries to sign up or log in using Google authentication. Their document might look like this:

json
Copy code
{
  "email": "user@example.com",
  "authProvider": "google",
  "googleId": "googleid"
}
Both of these documents can exist in the collection because their authProvider values are different (jwt vs google). However, if the same user tried to sign up again with the same email and authProvider combination, the unique constraint would prevent this duplicate entry.
this means user can first use valid gmail id to create with authProvider: jwt and also can use same gmail id with authProvider: google this will work. but if user wants to create another account for jwt using same account it will not work. this is needed coz user can have same email and password multiple times. although gmail doesnot allow same email id more than ones this also here prevents using gmail id twice. when user logs in with gmail this id will be saved here too. so cannot use same gmail id with authProvider: google twice
Conclusion
The compound index on { email: 1, authProvider: 1 } with the unique constraint ensures that each user can have only one account per authentication provider, maintaining the integrity and consistency of user data in the collection.
*/
usersSchema.index({ email: 1, authProvider: 1 }, { unique: true });
// collection created in database
const Users = mongoose.model("users", usersSchema);
export default Users;
