<?php

class live{
    private $users = [];
    private $lastTime = [];
    private $events = [];
    private $callbacks = [];
    private $data = false;
    private $isUrgent = false;

    public function __construct() {
        return $this;
    }

    
    function on($event,$callback){
        $this->events[] = $event;
        $this->callbacks[] = $callback;
        //var_dump($this->events);
    }

    function emit($event,$data){
        $obj->event = $event;
        $obj->data = $data;
        if($this->isUrgent == true){
            $this->isUrgent = false;
            echo json_encode($obj);
        }else{
            $this->data = json_encode($obj);
        }
    }
    
    function start(){
        set_time_limit(0);
        ignore_user_abort(false);

        if(isset($_GET["liveJS"])){
            //Read Session from storage
            $myfile = fopen(".liveSessions.txt", "a+");
            $content = file_get_contents(".liveSessions.txt");
            if(trim($content) != ""){
                $both = explode("\n",$content);
                $this->users = explode(",",$both[0]);
                $this->lastTime = explode(",",$both[1]);
            }

            $response = json_decode($_GET["liveJS"]);
            $liveID = $response->liveID;
            
            if($response->command == "event"){
                $data = $response->data;
                $event = $response->event;
                //var_dump($this->events);
                if(array_search($event,$this->events) !== false){
                    //var_dump($response);
                    $this->isUrgent = true;
                    $where = array_search($event,$this->events);
                    $this->callbacks[$where]($data,$this);
                }
            }
            if($response->command == "listen"){
                $this->send();
            }
            
            if($response->command == "handshake"){
                echo "200";
                //Store liveID if not stored
                if(array_search($liveID,$this->users) === false){
                    $this->users[] = $liveID;
                    //update lastTime of request
                    $index = array_search($liveID,$this->users);
                    $this->lastTime[$index] = strtotime("now");
                }
                if(array_search("connect",$this->events) !== false){
                    $where = array_search("connect",$this->events);
                    $this->callbacks[$where]($this);
                }
            }

            //Store details
            $both = implode(",",$this->users) . "\n" . implode(",",$this->lastTime);
            fwrite($myfile, $both);
            fclose($myfile);
        }
    }

    protected function send(){
        while(true){
            if(array_search("connect",$this->events) !== false){
                $where = array_search("connect",$this->events);
                $this->callbacks[$where]($this);
            }
            if($this->data != null){
                echo $this->data;
                $this->data = null;
                break;
            }else{
                sleep(1);
                continue;
            }
        }
    }
}
?>