const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Pusher = require('Pusher');
const dbModel = require('./dbModel');


//app.config
const app = express();
const port = process.env.PORT || 8080;


const pusher = new Pusher({
  appId: '1090069',
  key: '2ea464c1eacc38ac161a',
  secret: '5d873bbec9a4d0657546',
  cluster: 'ap2',
  useTLS:true
});


// middlewares
app.use(express.json());
app.use(cors());

// DB config
const connection_url = 'mongodb+srv://admin:ysjTEmrk1oFwBzTb@cluster0.xuq2k.mongodb.net/instaDB?retryWrites=true&w=majority'
mongoose.connect(connection_url, {
    useCreateIndex: true,
    useNewUrlParser:true,
    useUnifiedTopology:true
});

mongoose.connection.once("open",() => {
    console.log("DB connected");

    const changeStream = mongoose.connection
    .collection('posts').watch();

    changeStream.on('change', (change) => {
        console.log('Change stream triggered on pusher change...')
        console.log(change)
        console.log('End of change')

        if(change.operationType === 'insert') {
            console.log('Triggering Pusher ***Img UPLOAD***')

            const postDetails = change.fullDocument;
            pusher.trigger('posts','inserted', {
                user:postDetails.user,
                caption: postDetails.caption,
                image:postDetails.image
            })
        } else {
            console.log("unknown trigger from pusher");
        }
    })
});

//api routes
app.get('/', (req, res) => res.status(200).send('hello world123!!'));

app.post('/upload',(req,res)=>{
    const body = req.body;
    dbModel.create(body, (err, data)=> {
        if(err) {
            res.status(500).send(err);
        } else {
            res.status(201).send(data);
        }
    })
});

app.get('/sync',(req, res)=> {
    dbModel.find((err, data)=> {
        if(err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(data);
        }
    })
})

// listner
app.listen(port, () => console.log(`listening on localhost: ${port}`));