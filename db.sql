create table games
(
    ID          int                                not null,
    dateStarted datetime default CURRENT_TIMESTAMP not null,
    constraint games_ID_uindex
        unique (ID)
);

alter table games
    add primary key (ID);

alter table games
    modify ID int auto_increment;

create table players
(
    ID     int         not null,
    name   varchar(64) not null,
    gameID int         not null,
    constraint players_ID_uindex
        unique (ID),
    constraint players_pk
        unique (name, gameID),
    constraint players_games_ID_fk
        foreign key (gameID) references games (ID)
            on update cascade on delete cascade
);

alter table players
    add primary key (ID);

alter table players
    modify ID int auto_increment;

create table transactions
(
    ID          int                                not null,
    `from`      int                                null,
    `to`        int                                null,
    gameID      int                                not null,
    value       bigint                             not null,
    description text                               null,
    date        datetime default CURRENT_TIMESTAMP not null,
    constraint transactions_ID_uindex
        unique (ID),
    constraint transactions_games_ID_fk
        foreign key (gameID) references games (ID)
            on update cascade on delete cascade,
    constraint transactions_players_ID_fk
        foreign key (`from`) references players (ID)
            on update cascade on delete cascade,
    constraint transactions_players_ID_fk_2
        foreign key (`to`) references players (ID)
            on update cascade on delete cascade
);

alter table transactions
    add primary key (ID);

alter table transactions
    modify ID int auto_increment;