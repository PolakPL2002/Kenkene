<?php
/**
 * Created by PhpStorm.
 * User: Szymon
 * Date: 29.07.2020
 * Time: 13:56
 */

if (!isset($_POST["ID"])) die();
if (!isset($_POST["value"])) die();
if (!isset($_POST["description"])) die();

require_once "sql.php";
$out = new stdClass();
$out->success = (new SQL())->buy($_POST["ID"],  $_POST["value"], $_POST["description"]);
header("Content-Type: application/json");
echo json_encode($out);