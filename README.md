# LiveJS

LiveJS is a javascript library that comes with a PHP library.
It tries to emulate websocket using long polling.
It is fast and easy to use and saves us from having to send a lot of requests to the server.

## Installation

Add LiveJS to your page using the script tag.

```html
<script src="path/to/LiveJS.js"></script>
```
Or require with [NodifyJS](https://github.com/DevBash1/NodifyJS)

```javascript
let live = require("path/to/LiveJS.js");
```

## Usage

Where url is the url pointing to the server side PHP live.

script.js
```javascript
let life = new live("path/to/LiveJS.php");

life.on("connect", function(data){
    //Client Has connected to server
    console.log(data);
});

life.on("res", function(data){
    //Listen for data from server
    console.log("Server: " + data);
});

life.on("error", function(err){
    //Catch Errors
    console.warn(err);
});
```

Then on our PHP server

LiveJS.php
```php
include("path/to/LivePHP.php");

$life = new live();

$life->on("msg",function($data,$socket){
    //$data holds the recieved data from the client
    //$socket is used to emit a response
    //Eg $socket->emit("response","You said: " . $data);
    $file = fopen("data.txt","w");
    fwrite($file,$data);
    fclose($file);
});

$life->on("connect",function($socket){
    //On connect will hold any php function that will take time.
    //Any data that we will be polling that might take time.
    
    //You can be checking for a new data in your database
    //Or any other time taking Events
    //and respond when it arrives

    $i = file_get_contents("data.txt");
    
    if($i !== ""){
        $socket->emit("res",$i);
        $file = fopen("data.txt","w");
        fwrite($file,"");
        fclose($file);
    }
});

//make sure to call start in the bottom
//to avoid errors
//start
$life->start();

```

Since setting up websocket on PHP can be a pain in the ass.
Most PHP developers will send alot of ajax requests to their server and
try to emulate realtime communication with there server which is very bad.
It can lead to DDOSing your own server and other problems.

LiveJS was made to solve this problem.
It only sends one request and the sever will keep the connection opened untill
data is available then it sends a response.

There will be more features soon.
Happy Coding!

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://github.com/DevBash1/LiveJS/blob/main/LICENSE)