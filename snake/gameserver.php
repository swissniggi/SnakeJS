<?php
header("Access-Control-Allow-Origin: *");
$input = file_get_contents("php://input");
$dump = json_decode($input);
checkScore($dump);

function checkScore($dump) {
    $maxscore = $dump->score;
    $name = $dump->name;
    $scorestring = getScores($maxscore, $name);

    if($name !== '') {
        // neuen Highscore speichern
        $handle = fopen("highscore_snake.txt", "w");
        fwrite($handle, mb_substr($scorestring, 0, -2));
        fclose($handle);
        echo json_encode($scorestring);
    } else {
        // aktuellen Highscore ausgeben
        echo json_encode($scorestring);
    }
}

function getScores($maxscore, $name) {
    $score = '';
    $suffix = '';
    $scorestring = '';
    
    if(filesize("highscore_snake.txt") > 0) {
        // aktuellen Highscore auslesen
        $handle = fopen("highscore_snake.txt", "r");
        $score = fread($handle, filesize("highscore_snake.txt"));
        fclose($handle);
        
        $scores = explode(";", $score);
        
        if(count($scores) === 9) {
            $week = date("W", strtotime($scores[2]));
            $month = date("m", strtotime($scores[5]));
            $year = date("Y", strtotime($scores[8]));
            
            // neuer Wochen-Highscore?
            if($week !== date("W") || $maxscore > $scores[0]) {
                $scorestring = $scorestring . $maxscore . ';' . $name . ';' . date("d.m.Y") . ';';
                $suffix = ';W';
            } else {
                $scorestring = $scorestring . $scores[0] . ';' . $scores[1] . ';' . $scores[2] . ';';
            }
            
            // neuer Monats-Highscore?
            if($month !== date("m") || $maxscore > $scores[3]) {
                $scorestring = $scorestring . $maxscore . ';' . $name . ';' . date("d.m.Y") . ';';
                $suffix = ';M';
            } else {
                $scorestring = $scorestring . $scores[3] . ';' . $scores[4] . ';' . $scores[5] . ';';
            }
            
            // neuer Jahres-Highscore?
            if($year !== date("Y") || $maxscore > $scores[6]) {
                $scorestring = $scorestring . $maxscore . ';' . $name . ';' . date("d.m.Y");
                $suffix = ';Y';
            } else {
                $scorestring = $scorestring . $scores[6] . ';' . $scores[7] . ';' . $scores[8];
            }
            $scorestring .= $suffix;
        }
    } else {
        $scorestring = "0;test;25.09.2017;0;test;25.09.2017;0;test;25.09.2017";
    }
    return $scorestring;
}