<?php
/**
 * Created by PhpStorm.
 * User: Szymon
 * Date: 29.07.2020
 * Time: 14:47
 */

require_once "sql.php";
if (!isset($_POST["gameID"])) die();

$sql = new SQL();

if (!isset($_POST["ID"])) $transactions = $sql->getTransactions($_POST["gameID"]);
else $transactions = $sql->getPlayerTransactions($_POST["gameID"], $_POST["ID"]);

if ($transactions === null) die();
header("Content-Type: application/json");
echo json_encode($transactions);
