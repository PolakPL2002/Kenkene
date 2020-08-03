<?php
/**
 * Created by PhpStorm.
 * User: Szymon
 * Date: 29.07.2020
 * Time: 14:15
 */

class Player
{
    /**
     * @var int
     */
    public $ID;
    /**
     * @var string
     */
    public $name;
    /**
     * @var int
     */
    public $gameID;
    /**
     * @var int
     */
    public $balance;

    /**
     * Player constructor.
     * @param int $ID
     * @param string $name
     * @param int $gameID
     * @param int $balance
     */
    public function __construct(int $ID, string $name, int $gameID, int $balance)
    {
        $this->ID = $ID;
        $this->name = $name;
        $this->gameID = $gameID;
        $this->balance = $balance;
    }
}