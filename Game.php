<?php
/**
 * Created by PhpStorm.
 * User: Szymon
 * Date: 29.07.2020
 * Time: 14:26
 */

class Game
{
    /**
     * @var int
     */
    public $ID;
    /**
     * @var string
     */
    public $dateStarted;

    /**
     * Game constructor.
     * @param int $ID
     * @param string $dateStarted
     */
    public function __construct(int $ID, string $dateStarted)
    {
        $this->ID = $ID;
        $time = strtotime($dateStarted . " UTC");
        $this->dateStarted = date("Y-m-d H:i:s", $time);
    }
}