const express = require('express')
const axios = require('axios')
const mongoose = require('mongoose')
const name = require('./mySchema')
const studData = name.studData
const studRouter = express.Router()
const graphql = require('graphql')
const {ApolloServer, gql} = require('apollo-server-express');
const {json} = require("express");
const {GraphQLList} = require("graphql");
const app = express()


// GraphQL Query Start
const typeOfQuery = gql`
    scalar JSON
    type user {
        studId: String
        studName: String
        studCourse: String
        studEmail: String
    }
    type Post{
        postId: Int
        id: Int
        name: String
        email: String
        body: String
    }
    type Query {
        hello: String
        getData: JSON
        greetMe(firstName: String!, lastName: String): String
        getUserData: [user]
        getPosts: [Post]
    }
    type Mutation {
        addStud(id: Int, name: String!, course: String!, email: String!): JSON
    }
    `;
const myResolvers = {
    Query: {
        hello: () => 'Hello World!',
        getData: async () => {
            const resultData = await studData.find({} ).select({_id: 0, studId: 1, studName: 1, studCourse: 1, studEmail: 1})
            return resultData
        },
        greetMe: (root, args) => {
            console.log(args)
            console.log(root)
            return `Good Morning ${args.firstName} ${args.lastName === undefined ? "" : args.lastName}!`
        },
        getUserData: async () => {
            const resultData = await studData.find({} ).select({_id: 0, studId: 1, studName: 1, studCourse: 1, studEmail: 1})
            return resultData
        },
        getPosts: async () => {
            const response = await axios.get('https://jsonplaceholder.typicode.com/posts')
            return response.data
        }
    },
    Mutation: {
        addStud: async (root, args) => {
            const result = await studData.create({studId: args.id, studName: args.name, studCourse: args.course, studEmail: args.email});
            return result
        }
    }
};
// GraphQL Query End

app.use(express.json())
app.listen(3000)
app.use('/student',studRouter)

mongoose
    .connect("mongodb+srv://admin22:Mike1607@cluster0.9gcwd.mongodb.net/?retryWrites=true&w=majority")
    .then(res=>console.log("Connected"))
    .catch(err=>console.log(err));

studRouter
    .route("/")
    .get(getAllStud)
    .post(addStud);

studRouter
    .route("/:id")
    .patch(updateStud)
    .delete(deleteStud);


// GraphQL Server Start
async function myApolloServer(){
    const apolloServer = new ApolloServer({
        typeDefs: typeOfQuery,
        resolvers: myResolvers
    })
    await apolloServer.start();
    await apolloServer.applyMiddleware({app});
}
myApolloServer().then(r => console.log("Apollo GraphQL Server Started"))

// GraphQL Server End
async function getAllStudInfo(){
    const resultData = await studData.find({} ).select({_id: 0, studId: 1, studName: 1, studCourse: 1, studEmail: 1, __v: 1})
    console.log(resultData)
    if ( resultData == null ) {
        return JSON.parse(`"message": "NO DATA!"`)
    } else {
        return resultData
    }
}
function addStudentInfo(studOb){
    studData.create({
        studId: studOb.id,
        studName: studOb.name,
        studCourse: studOb.course,
        studEmail: studOb.email
    }).then(() => {
        // res.json({
        //     message: "Student Added To Database",
        // })
        return JSON.parse(`"message": "USER ADDED"`)
    }).catch(e => {
        return JSON.parse(`message: ${e}`)
    })
}
async function getAllStud(req,res){
    const resultData = await studData.find({}).select({_id: 0, studId: 1, studName: 1, studCourse: 1, studEmail: 1, __v: 1});
    // console.log(res)
    if ( resultData == null ) {
        res.json({
            message: "NO DATA!"
        })
    }
    else {
        res.json({
            message: "ALL STUDENTS",
            studs: resultData
        })
    }
}

function addStud(req,res){
    studData.create({
        studId: req.body.id,
        studName: req.body.name,
        studCourse: req.body.course,
        studEmail: req.body.email
    }).then(() => {
        res.json({
            message: "Student Added To Database",
        })
    }).catch(e => {
        res.json({
            message: e
        })
    })
}


async function updateStud(req,res){
    let stud_id = req.params.id
    let stud = await studData.find({studId: stud_id})

    if ( stud != null && req.body.name != null ) {
        let updated_stud = await studData.findOneAndUpdate({studId: stud_id},{studName: req.body.name});
        updated_stud = await studData.find({studId: stud_id})
        res.json({
            message: "Details Updated",
            data: updated_stud
        })
    }
    if ( stud != null && req.body.course != null ) {
        studData.findOneAndUpdate({studId: stud_id},{
            studCourse: req.body.course
        })
        let updated_stud = await studData.find({studId: stud_id})
        res.json({
            message: "Details Updated",
            data: updated_stud
        })
    }
}

async function deleteStud(req,res){
    const result = await studData.findOneAndDelete({studId: req.body.id});
    if ( result != null ) {
        res.json({
            message: "Student Deleted",
            data: result
        })
    }
    else {
        res.json({
            message: "Not in database"
        })
    }
}


