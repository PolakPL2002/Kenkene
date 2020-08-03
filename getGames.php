<?php
/**
 * Created by PhpStorm.
 * User: Szymon
 * Date: 29.07.2020
 * Time: 16:34
 */

require_once "sql.php";

header("Content-Type: application/json");
echo json_encode((new SQL())->getGames());