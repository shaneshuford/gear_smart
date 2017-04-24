<?php
	error_reporting(0);	$PrimUrl = "http://shufordtech.com";
		//DB: shufor5_gear
	$mysqli = new mysqli("localhost", "", "", "");
	if ($mysqli->connect_errno) {
		//echo "Failed to connect to MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error;
		die('connection failed');
	}
	include "print_nice.php";
	if(isset($_GET['k'])){
		//Coming from the watch
		$key = $_GET['k'];
		$data = mysqli_fetch_assoc(mysqli_query($mysqli, "SELECT * FROM `auth` WHERE `key` = '$key'"));
		//print_nice($data);
		die($data['for_app']);	
		//die('From the watch!');
		die('');
	}elseif(isset($_GET['r'])){
		$key = $_GET['r'];
		//$data = mysqli_fetch_assoc(mysqli_query($mysqli, "SELECT * FROM `auth` WHERE `key` = '$key'"));
		die('Please use this code in the smart watch app: <b>'.$key."</b>" );
	}else if(isset($_REQUEST['code'])){
		$key = $_GET['key'];
		$data = mysqli_fetch_assoc(mysqli_query($mysqli, "SELECT * FROM `auth` WHERE `key` = '$key'"));
		$url = $PrimUrl & "/gear.php?key=".$key;
		$client = $data['client'];
		$secret = $data['secret'];
		$code = $_REQUEST['code'];
		$page = "https://graph.api.smartthings.com/oauth/token?grant_type=authorization_code&client_id=".$client."&client_secret=".$secret."&redirect_uri=".$url."&code=".$code."&scope=app";
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL,            $page );
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1 );
		curl_setopt($ch, CURLOPT_POST,           0 );
		curl_setopt($ch, CURLOPT_HTTPHEADER,     array('Content-Type: application/json')); 
		$response =  json_decode(curl_exec($ch),true);
		curl_close($ch);
		if(isset($response['access_token'])){
			$token = $response['access_token'];
			$key = $_GET['key'];
			$sql = "UPDATE `auth` SET `access_token` = '$token' WHERE `key` = '$key'";
			$res = $mysqli->query($sql);
			header( "Location: ?access_token=".$response['access_token'] ) ;
		}else{
			print "error requesting access token...";
			print_r($response);
		}
	}else if(isset($_REQUEST['access_token'])){
		$url = "https://graph.api.smartthings.com/api/smartapps/endpoints/$client?access_token=".$_REQUEST['access_token'];
		$c = curl_init($url);
		curl_setopt($c, CURLOPT_RETURNTRANSFER, true);
		$json = curl_exec($c);
		if (curl_error($c)){
			die(curl_error($c));
		}
		$status = curl_getinfo($c, CURLINFO_HTTP_CODE);
		curl_close($c);
		$theEndpoints = json_decode($json,true);
		if($theEndpoints['error']){
			die($theEndpoints['error']); 
		}
		$url = $theEndpoints[0]['uri'];
		//print_nice($theEndpoints);
		$theEndpoints = array(
			"URL"=>$theEndpoints[0]['uri'],
			"TOKEN"=>$_REQUEST['access_token']
		);
		$data=json_encode($theEndpoints);
		$token = $_REQUEST['access_token'];
		$sql = "UPDATE `auth` SET `for_app` = '$data' WHERE `access_token` = '$token';";
		$res = $mysqli->query($sql);
		$data = mysqli_fetch_assoc(mysqli_query($mysqli, "SELECT * FROM `auth` WHERE `access_token` = '$token'"));
		//print_nice($data);
		header( "Location: ?r=". $data['key'] ) ;
	}else{
		//Setup
		if(isset($_POST['c'],$_POST['s'])){
			//client id and client secret
			$client = $_POST['c'];
			$secret = $_POST['s'];
			$key = strtolower(generateRandomString(6));
			//url to this file
			$url = $PrimUrl . "/gear.php?key=".$key;
			$res = $mysqli->query("INSERT INTO `shufor5_gear`.`auth` (`id`, `client`, `secret`, `key`, `date`) VALUES (NULL, '$client', '$secret', '$key', CURDATE())");
			header( "Location: https://graph.api.smartthings.com/oauth/authorize?response_type=code&client_id=$client&redirect_uri=".$url."&scope=app" ) ;
		}else{
			?>
				<form method="post">
					Client: <input type="text" name="c"><br>
					secret: <input type="text" name="s"><br>
					<input type="submit">
				</form>
			<?			
		}
		die('setup');
	}

	function generateRandomString($length) {
		$characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
		$charactersLength = strlen($characters);
		$randomString = '';
		for ($i = 0; $i < $length; $i++) {
			$randomString .= $characters[rand(0, $charactersLength - 1)];
		}
		return $randomString;
	}
?>
