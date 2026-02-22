import mongoose from "mongoose";

const articleSchema = new mongoose.Schema({

title: {
type: String,
required: true,
trim: true
},

content: {
type: String,
required: true
},

coverImage: {
type: String,
default: null
},

productLinks: {
type: [String],
default: []
},

creatorId: {
type: String,
default: null
},

creatorRole: {
type: String,
default: null
},

companyName: {
type: String,
default: null
},

createdAt: {
type: Date,
default: Date.now
},

updatedAt: {
type: Date,
default: Date.now
}

});

const Article = mongoose.model(
"Article",
articleSchema
);

export default Article;