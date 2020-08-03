<?php
/**
 * Created by PhpStorm.
 * User: Szymon
 * Date: 29.07.2020
 * Time: 16:11
 */

if (!isset($_POST["gameID"])) die();

require_once "sql.php";

$sql = new SQL();
header("Content-Type: application/json");
echo json_encode($sql->getPlayers($_POST["gameID"]));