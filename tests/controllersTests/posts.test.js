// import requests from 'supertest'
// import app from '../../index';
const { default: mongoose } = require("mongoose");
const session = require("supertest-session");
const request = require("supertest");
const app = require("../../index.js");
/*
getPosts
getPost
getPostsFromUserId
createPost
updatePost
deletePost
likePost
commentPost

worm@gmail.com profileid: 623ce02a16768a509c673d46
a post created by worm id: 6255c227d845ab2e6cac00cd
*/

describe("Posts controller test", () => {
  let testSession;
  it("GET /posts -> obj of posts", async () => {
    return request(app)
      .get("/posts")
      .expect("Content-Type", /json/)
      .expect(200);
  });

  it("GET /posts/id -> obj specific post id", async () => {
    return request(app)
      .get("/posts/6255c227d845ab2e6cac00cd")
      .expect("Content-Type", /json/)
      .expect(200);
  });

  it("GET /posts/id -> 404 if not found", () => {
    return request(app)
      .get("/posts/-1")
      .expect("Content-Type", /json/)
      .expect(404);
  });

  it("GET /posts/profile/id -> get posts from user id", async () => {
    return request(app)
      .get("/posts/profile/623ce02a16768a509c673d46")
      .expect("Content-Type", /json/)
      .expect(200);
  });

  it("GET /posts/profile/id -> 404 if invalid user id", async () => {
    return request(app)
      .get("/posts/profile/1")
      .expect("Content-Type", /json/)
      .expect(404);
  });

  it("POST /posts -> create a post, no authorization", () => {
    const postData = {
      title: "test title",
      message: "test message",
    };
    return request(app).post("/posts").send(postData).expect(401);
  });

  it("PATCH /posts/id -> update a post with 'id', unauthed ", async () => {
    return request(app)
        .patch("/posts/6255c227d845ab2e6cac00cd")
        .expect(401);
  });

  it("PATCH /posts/id/likePost -> like a post with 'id', unauthed ", async () => {
    return request(app)
    .patch("/posts/6255c227d845ab2e6cac00cd")
    .expect(401);
  });
  
  it("DELETE /posts/id -> delete a post with 'id', unauthed ", async () => {
    return request(app)
    .patch("/posts/6255c227d845ab2e6cac00cd")
    .expect(401);
  });


  it("POST /posts/id/commentPost , unauthed ", async () => {
    return request(app)
    .patch("/posts/6255c227d845ab2e6cac00cd")
    .expect(401);
  });

  describe("posts controller tests which require user to be authed", function () {
    testSession = session(app);
    let authedSession;

    const userData = {
      email: "worm@gmail.com",
      password: "worm",
    };

    const postData = {
      title: "test title",
      message: "test message",
    };

    //log user in using dummy account
    beforeEach(function (done) {
      testSession
        .post("/user/login")
        .set("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")
        .send(userData)
        .expect(200)
        .end(function (err) {
          if (err) return done(err);
          authedSession = testSession;
          return done();
        });
    });

    it("POST /posts -> create a post, authed", async () => {
      authedSession
        .post("/posts")
        .send(postData)
        .set("Content-Type", "application/json")
        .set("accept", "application/json")
        .expect(201)
        .expect("Content-Type", /json/);
    });

    it("PATCH /posts/id -> update a post with 'id', authed ", async () => {
        const newPost = {title:'updated post', message:'updated message'}

        authedSession
            .patch('/posts/6255c227d845ab2e6cac00cd')
            .send(newPost)
            .expect(200)
    });

    it("PATCH /posts/id -> update a post with 'id', authed, but post does not belong to editor ", async () => {
        const newPost = {title:'updated post', message:'updated message'}

        authedSession
            .patch('/posts/62460055969bcf5c47b475f3')
            .send(newPost)
            .expect(401)
    });

    it("PATCH /posts/id/likePost -> like/unlike a post with 'id', authed ", async () => {
        authedSession
            .patch('/posts/6255c227d845ab2e6cac00cd/likePost')
            .send('623ce02a16768a509c673d46')
            .expect(200)
    });

    
  
    it("POST /posts/id/commentPost , comment on a post, authed ", async () => {
        authedSession
            .post('/posts/6255c227d845ab2e6cac00cd/commentPost')
            .send('test comment')
            .expect(200)
    });

    it("DELETE /posts/id -> delete a post with 'id', authed ", async () => {
        authedSession
        .delete('/posts/6255c227d845ab2e6cac00cd')
        .expect(200)
    });

    it("DELETE /posts/id -> delete a post with 'id', authed, but post does not belong to editor ", async () => {
        authedSession
        .delete('/posts/62460055969bcf5c47b475f3')
        .expect(401)
    });
  
  });
});
