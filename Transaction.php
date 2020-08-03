<?php
/**
 * Created by PhpStorm.
 * User: Szymon
 * Date: 29.07.2020
 * Time: 14:20
 */

class Transaction
{
    /**
     * @var int
     */
    public $ID;
    /**
     * @var Player|null
     */
    public $from;
    /**
     * @var Player|null
     */
    public $to;
    /**
     * @var int
     */
    public $gameID;
    /**
     * @var int
     */
    public $value;
    /**
     * @var string
     */
    public $description;
    /**
     * @var string
     */
    public $date;

    /**
     * Transaction constructor.
     * @param int $ID
     * @param Player $from
     * @param Player $to
     * @param int $gameID
     * @param int $value
     * @param string $description
     * @param string $date
     */
    public function __construct(int $ID, $from, $to, int $gameID, int $value, string $description, string $date)
    {
        $this->ID = $ID;
        $this->from = $from;
        $this->to = $to;
        $this->gameID = $gameID;
        $this->value = $value;
        $this->description = $description;
        $time = strtotime($date . " UTC");
        $this->date = date("Y-m-d H:i:s", $time);
    }
}