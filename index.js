import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import serverless from "serverless-http";
import router from "express";



const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({extended:true}))

app.use(express.static("public"));

app.set("view engine", "ejs");

app.get('/posts/:postId', (req, res) => {
  // Fetch post data based on postId from database or other source
  const postId = req.params.postId;
  fs.readFile('posts.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading posts.json:', err);
        return res.status(500).send('Error reading posts.json');
    }

    try {
        // Parse the JSON data
        const posts = JSON.parse(data);

        // Find the post with the specified postId
        const post = posts.find(post => post.id === postId);

        if (!post) {
            return res.status(404).send('Post not found');
        }
   res.render('view-post.ejs', { post });
  } catch (parseErr) {
    console.error('Error parsing JSON:', parseErr);
    res.status(500).send('Error parsing JSON');
}
});
});
app.get("/", (req, res) => {
  const posts = displayPosts();
  res.render("index.ejs", { posts });
});
app.get("/about",(req,res)=>{
    res.render("about.ejs");
});
app.get("/contact",(req,res)=>{
    res.render("contact.ejs");
});


app.get("/add-post", (req,res)=>{
    res.render("add-post.ejs");
});
app.get("/posts/:postId/edit-post",(req,res)=>{
  const postId = req.params.postId;
  const post = displayPosts().find(post => post.id === postId);
  if (!post) {
    return res.status(404).send("Post not found");
}

// Render the edit-post view and pass the post object to it
res.render("edit-post.ejs", { post: post,postId:postId });
});
  
 
app.post("/posts/:postId/update",(req,res)=>{
  const postId = req.params.postId;
  fs.readFile('posts.json','utf-8',(err,data)=>{
    if(err){
      console.log("error reading posts.json",(err));
      return res.status(500).send("error reading posts.json");
    }
    try{
      const posts = JSON.parse(data);
      const index = posts.findIndex(post => post.id === postId);
      if(index === -1){
        return res.status(404).send("page not found");
      }
      posts[index].title = req.body.title; 
      posts[index].author = req.body.author;
      posts[index].content = req.body.content;
      const updatedData = JSON.stringify(posts,null,2);
      fs.writeFile('posts.json',updatedData,(err)=>{
        if(err){
          console.error("Error writing to posts.json",(err));
          return res.sendStatus(500).send("error writing to posts.json");
        }
        res.sendStatus(200);
      });
      
      
    } catch (parseErr) {
      console.error('Error parsing JSON:', parseErr);
      res.status(500).send('Error parsing JSON');
  }
      
  })
  res.render("add-post.ejs")
})


app.post('/posts/:id', (req, res) => {
  if (req.body._method === 'delete') {
    console.log("delete");
    
    // Handle delete logic here (similar to DELETE route)
    const postId = req.params.id;
    fs.readFile('posts.json', 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading posts.json:', err);
        return res.status(500).send('Error reading posts.json');
      }

      try {
        const posts = JSON.parse(data);
        const updatedPosts = posts.filter(post => post.id !== postId);

        fs.writeFile('posts.json', JSON.stringify(updatedPosts, null, 2), err => {
          if (err) {
            console.error('Error writing to posts.json:', err);
            return res.status(500).send('Error writing to posts.json');
          }
          console.log('Post deleted successfully.');
          // Send a response indicating successful deletion, but without rendering any view
          res.sendStatus(204);
        });
      } catch (parseErr) {
        console.error('Error parsing JSON:', parseErr);
        res.status(500).send('Error parsing JSON');
      }
    });
  } else {
    // Handle other POST request logic here
    console.log("Other POST logic");
    res.send('Other POST logic');
  }
});



app.post("/submit",(req,res)=>{
      const data ={
       title: req.body["title"],
       author : req.body["author"],
       content : req.body["content"],
       
    }
     
 addPost(data);  
 const posts = displayPosts();
       
 res.render("index.ejs",{posts});

});

        function readPosts() {
            try {
              const postsData = fs.readFileSync('posts.json');
              const posts = JSON.parse(postsData);
              return posts;
            } catch (err) {
              console.error('Error reading posts:', err);
              return [];
            }
          }

          function addPost(newPost) {
            try {
              const mon = ["January","Feburary","March","April","May","June","July","August","September","October","November","December"];
              const d = new Date();
              const date = d.getDate() +" "+ mon[d.getMonth()]+" " + d.getFullYear();
              
              const posts = readPosts();
              const id = (posts.length ).toString(); // Generate unique ID
              const postWithId = { id, date,...newPost }; // Spread newPost object and add id
              posts.push(postWithId);
              fs.writeFileSync('posts.json', JSON.stringify(posts, null, 2));
              console.log('Post added successfully.');
            } catch (err) {
              console.error('Error adding post:', err);
            }
          }

          
          function displayPosts() {
            try {
                const postsData = fs.readFileSync('posts.json');
                const posts = JSON.parse(postsData);
                return posts;
            } catch (err) {
                console.error('Error reading posts:', err);
                return [];
            }
        }

app.listen(port,()=>{
    console.log(`Listening on port ${port}`);
})
