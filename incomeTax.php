<?php
/**
 * Created by PhpStorm.
 * User: Szymon
 * Date: 29.07.2020
 * Time: 16:28
 */

if (!isset($_POST["ID"])) die();

require_once "sql.php";
$out = new stdClass();
$out->success = (new SQL())->incomeTax($_POST["ID"]);
header("Content-Type: application/json");
echo json_encode($out);