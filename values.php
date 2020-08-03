<?php
/**
 * Created by PhpStorm.
 * User: Szymon
 * Date: 29.07.2020
 * Time: 16:37
 */

$out = new stdClass();

require_once "config.php";

$out->INITIAL_MONEY = Config::$INITIAL_MONEY;
$out->START_MONEY = Config::$START_MONEY;
$out->INCOME_TAX_MONEY = Config::$INCOME_TAX_MONEY;
$out->LUXURY_TAX_MONEY = Config::$LUXURY_TAX_MONEY;

header("Content-Type: application/json");
echo json_encode($out);