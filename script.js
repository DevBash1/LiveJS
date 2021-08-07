//let live = require("/live.js");

let life = new live("server.php");

life.on("connect", function(data){
    life.emit("msg1","1000-23234");
});

life.on("res", function(data){
    console.log(data);
})

life.on("error", function(err){
    console.warn(err);
});
