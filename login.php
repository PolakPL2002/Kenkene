<?php
/**
 * Created by PhpStorm.
 * User: Szymon
 * Date: 29.07.2020
 * Time: 13:56
 */

require_once "sql.php";

if (!isset($_POST["gameID"]) || !isset($_POST["name"])) die();

$sql = new SQL();
$player = $sql->getPlayerByName($_POST["gameID"], $_POST["name"]);
if ($player === null) $player = $sql->addPlayer($_POST["gameID"], $_POST["name"]);
if ($player === null) {
    http_response_code(500);
    die();
}

header("Content-Type: application/json");
echo json_encode($player);
