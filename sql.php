<?php
/**
 * Created by PhpStorm.
 * User: Szymon
 * Date: 29.07.2020
 * Time: 14:06
 */

require_once "config.php";
require_once "Game.php";
require_once "Player.php";
require_once "Transaction.php";

class SQL
{
    private $CONN;

    /**
     * SQL constructor.
     */
    public function __construct()
    {
        $this->CONN = new mysqli(Config::$DB_ADDRESS, Config::$DB_USERNAME, Config::$DB_PASSWORD, Config::$DB_DATABASE);
        $this->CONN->set_charset('utf8mb4');
    }

    function addGame()
    {
        $sql = "INSERT INTO games (dateStarted) VALUE (NOW())";
        $stmt = $this->CONN->prepare($sql);
        $stmt->execute();
        return $this->getGame($stmt->insert_id);
    }

    function getGame(int $ID)
    {
        $sql = "SELECT * FROM games WHERE ID = ?;";
        $stmt = $this->CONN->prepare($sql);
        $stmt->bind_param("i", $ID);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($row = $result->fetch_assoc()) {
            return new Game($row["ID"], $row["dateStarted"]);
        }
        return null;
    }

    function getPlayerByName(int $gameID, string $name)
    {
        $sql = "SELECT ID FROM players WHERE gameID = ? AND name LIKE ?";
        $stmt = $this->CONN->prepare($sql);
        $stmt->bind_param("is", $gameID, $name);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($row = $result->fetch_assoc()) {
            return new Player($row["ID"], $name, $gameID, $this->getPlayerBalance($row["ID"]));
        }
        return null;
    }

    function addPlayer(int $gameID, string $name)
    {
        $sql = "INSERT INTO players (name, gameID) VALUE (?, ?)";
        $stmt = $this->CONN->prepare($sql);
        $stmt->bind_param("si", $name, $gameID);
        $stmt->execute();
        return $this->getPlayer($stmt->insert_id);
    }

    function getGames()
    {
        $sql = "SELECT * FROM games;";
        $stmt = $this->CONN->prepare($sql);
        $stmt->execute();
        $result = $stmt->get_result();
        $out = array();
        while ($row = $result->fetch_assoc()) {
            array_push($out, new Game($row["ID"], $row["dateStarted"]));
        }
        return $out;
    }

    function getPlayers(int $gameID)
    {
        $sql = "SELECT ID, name FROM players WHERE gameID = ?;";
        $stmt = $this->CONN->prepare($sql);
        $stmt->bind_param("i", $gameID);
        $stmt->execute();
        $result = $stmt->get_result();
        $out = array();
        while ($row = $result->fetch_assoc()) {
            array_push($out, new Player($row["ID"], $row["name"], $gameID, $this->getPlayerBalance($row["ID"])));
        }
        return $out;
    }

    function getPlayer($ID)
    {
        if ($ID == null) return null;
        $sql = "SELECT ID, name, gameID FROM players WHERE ID = ?;";
        $stmt = $this->CONN->prepare($sql);
        $stmt->bind_param("i", $ID);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($row = $result->fetch_assoc()) {
            return new Player($row["ID"], $row["name"], $row["gameID"], $this->getPlayerBalance($row["ID"]));
        }
        return null;
    }

    function getTransactions(int $gameID)
    {
        //TODO Check names
        $sql = "SELECT ID, `from`, `to`, `value`, description, date FROM transactions WHERE gameID = ?;";
        $stmt = $this->CONN->prepare($sql);
        $stmt->bind_param("i", $gameID);
        $stmt->execute();
        $result = $stmt->get_result();
        $out = array();
        while ($row = $result->fetch_assoc()) {
            array_push($out, new Transaction($row["ID"], $this->getPlayer($row["from"]), $this->getPlayer($row["to"]), $gameID, $row["value"], $row["description"], $row["date"]));
        }
        return $out;
    }

    function getPlayerTransactions(int $gameID, int $playerID)
    {
        //TODO Check names
        $sql = "SELECT ID, `from`, `to`, `value`, description, date FROM transactions WHERE gameID = ? AND (`from` = ? OR `to` = ?);";
        $stmt = $this->CONN->prepare($sql);
        $stmt->bind_param("iii", $gameID, $playerID, $playerID);
        $stmt->execute();
        $result = $stmt->get_result();
        $out = array();
        while ($row = $result->fetch_assoc()) {
            array_push($out, new Transaction($row["ID"], $this->getPlayer($row["from"]), $this->getPlayer($row["to"]), $gameID, $row["value"], $row["description"], $row["date"]));
        }
        return $out;
    }

    function getPlayerBalance(int $ID)
    {
        $balance = Config::$INITIAL_MONEY;
        $sql = "SELECT if(SUM(value) IS NULL, 0, SUM(value)) as value
                FROM transactions
                WHERE `to` = ?;";
        $stmt = $this->CONN->prepare($sql);
        $stmt->bind_param("i", $ID);
        $stmt->execute();
        $result = $stmt->get_result();
        $balance += $result->fetch_assoc()["value"];
        $sql = "SELECT if(SUM(value) IS NULL, 0, SUM(value)) as value
                FROM transactions
                WHERE `from` = ?;";
        $stmt = $this->CONN->prepare($sql);
        $stmt->bind_param("i", $ID);
        $stmt->execute();
        $result = $stmt->get_result();
        $balance -= $result->fetch_assoc()["value"];
        return $balance;
    }

    function start(int $ID)
    {
        $sql = "INSERT INTO transactions (`from`, `to`, gameID, value, description) VALUE (null, ?, ?, ?, 'Przejście przez start')";
        $stmt = $this->CONN->prepare($sql);
        $player = $this->getPlayer($ID);
        if ($player == null) return false;
        $gameID = $player->gameID;
        $stmt->bind_param("iii", $ID, $gameID, Config::$START_MONEY);
        $stmt->execute();
        return true;
    }

    function luxuryTax(int $ID)
    {
        $sql = "INSERT INTO transactions (`from`, `to`, gameID, value, description) VALUE (?, null, ?, ?, 'Podatek luksusowy')";
        $stmt = $this->CONN->prepare($sql);
        $player = $this->getPlayer($ID);
        if ($player == null) return 1;
        if ($player->balance < Config::$LUXURY_TAX_MONEY) return 3; //Insufficient balance
        $gameID = $player->gameID;
        $stmt->bind_param("iii", $ID, $gameID, Config::$LUXURY_TAX_MONEY);
        $stmt->execute();
        return true;
    }

    function incomeTax(int $ID)
    {
        $sql = "INSERT INTO transactions (`from`, `to`, gameID, value, description) VALUE (?, null, ?, ?, 'Podatek dochodowy')";
        $stmt = $this->CONN->prepare($sql);
        $player = $this->getPlayer($ID);
        if ($player == null) return 1;
        if ($player->balance < Config::$INCOME_TAX_MONEY) return 3; //Insufficient balance
        $gameID = $player->gameID;
        $stmt->bind_param("iii", $ID, $gameID, Config::$INCOME_TAX_MONEY);
        $stmt->execute();
        return true;
    }

    function buy(int $ID, int $value, string $description)
    {
        $sql = "INSERT INTO transactions (`from`, `to`, gameID, value, description) VALUE (?, null, ?, ?, ?)";
        $stmt = $this->CONN->prepare($sql);
        $fromPlayer = $this->getPlayer($ID);
        if ($fromPlayer == null) return 1;
        $gameID = $fromPlayer->gameID;
        if ($fromPlayer->balance < $value) return 3; //Insufficient balance
        $stmt->bind_param("iiis", $ID, $gameID, $value, $description);
        $stmt->execute();
        return true;
    }

    function sell(int $ID, int $value, string $description)
    {
        $sql = "INSERT INTO transactions (`from`, `to`, gameID, value, description) VALUE (null, ?, ?, ?, ?)";
        $stmt = $this->CONN->prepare($sql);
        $fromPlayer = $this->getPlayer($ID);
        if ($fromPlayer == null) return 1;
        $gameID = $fromPlayer->gameID;
        $stmt->bind_param("iiis", $ID, $gameID, $value, $description);
        $stmt->execute();
        return true;
    }

    function pay(int $fromID, int $toID, int $value, string $description)
    {
        $sql = "INSERT INTO transactions (`from`, `to`, gameID, value, description) VALUE (?, ?, ?, ?, ?)";
        $stmt = $this->CONN->prepare($sql);
        $fromPlayer = $this->getPlayer($fromID);
        if ($fromPlayer == null) return 1;
        $toPlayer = $this->getPlayer($toID);
        if ($toPlayer == null) return 2;
        $gameID = $fromPlayer->gameID;
        if ($fromPlayer->balance < $value) return 3; //Insufficient balance
        $stmt->bind_param("iiiis", $fromID, $toID, $gameID, $value, $description);
        $stmt->execute();
        return true;
    }
}