<?php
	function print_nice($elem,$max_level=10,$print_nice_stack=array()){ 
		if(is_array($elem) || is_object($elem)){ 
			if(in_array($elem,$print_nice_stack,true)){ 
				echo "<font color=red>RECURSION</font>"; 
				return; 
			} 
			$print_nice_stack[]=&$elem; 
			if($max_level<1){ 
				echo "<font color=red>nivel maximo alcanzado</font>"; 
				return; 
			} 
			$max_level--; 
			echo "<table border=1 cellspacing=0 cellpadding=3 width=100%>"; 
			if(is_array($elem)){ 
				echo '<tr><td colspan=2 style="background-color:#333333;"><strong><font color=white>ARRAY</font></strong></td></tr>'; 
			}else{ 
				echo '<tr><td colspan=2 style="background-color:#333333;"><strong>'; 
				echo '<font color=white>OBJECT Type: '.get_class($elem).'</font></strong></td></tr>'; 
			} 
			$color=0; 
			foreach($elem as $k => $v){ 
				if($max_level%2){ 
					$rgb=($color++%2)?"#888888":"#BBBBBB"; 
				}else{ 
					$rgb=($color++%2)?"#8888BB":"#BBBBFF"; 
				} 
				echo '<tr><td valign="top" style="width:40px;background-color:'.$rgb.';">'; 
				echo '<strong>'.$k."</strong></td><td>"; 
				print_nice($v,$max_level,$print_nice_stack); 
				echo "</td></tr>"; 
			} 
			echo "</table>"; 
			return; 
		} 
		if($elem === null){ 
			echo "<font color=green>NULL</font>"; 
		}elseif($elem === 0){ 
			echo "0"; 
		}elseif($elem === true){ 
			echo "<font color=green>TRUE</font>"; 
		}elseif($elem === false){ 
			echo "<font color=green>FALSE</font>"; 
		}elseif($elem === ""){ 
			echo "<font color=green>EMPTY STRING</font>"; 
		}else{ 
			echo str_replace("\n","<strong><font color=red>*</font></strong><br>\n",$elem); 
		} 
	} 
?>