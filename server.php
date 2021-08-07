<?php

include("live.php");


$life = new live();

$life->on("msg1",function($data,$socket){
    $result = $data;
    $socket->emit("res","You said: " . $result);
});

$life->on("msg",function($data,$socket){
    $file = fopen("data.txt","w");
    fwrite($file,$data);
    fclose($file);
});

$life->on("connect",function($socket){
    $i = file_get_contents("data.txt");
    
    if($i !== ""){
        $socket->emit("res",$i);
        $file = fopen("data.txt","w");
        fwrite($file,"");
        fclose($file);
    }
});

//start
$life->start();
?>