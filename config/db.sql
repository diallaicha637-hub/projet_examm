
drop database if exists projet_examen;
create database projet_examen;
use projet_examen;
create table tache(id int auto_increment primary key ,titre varchar(225) not null,
description text ,priorite enum('basse','moyenne','haute'),
statut enum('a faire','en cours','termine') default 'a faire',
date_creation datetime default current_timestamp,
date_limite date ,
responsable varchar(150) not null);