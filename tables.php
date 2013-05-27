<?php
$sqls = array();
$sqls[] = "
CREATE TABLE IF NOT EXISTS `water_quality` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `location_id` varchar(20) NOT NULL,
  `station_name` varchar(80) NOT NULL,
  `watershed_name` varchar(80) NOT NULL,
  `datetime` datetime NOT NULL,
  `latitude` decimal(9,5) DEFAULT NULL,
  `longitude` decimal(10,5) DEFAULT NULL,
  `do_mgl` float DEFAULT NULL,
  `do_%` float DEFAULT NULL,
  `cond` float DEFAULT NULL,
  `salinity` float DEFAULT NULL,
  `temp` float DEFAULT NULL,
  `ph` float DEFAULT NULL,
  `secchi_a` float DEFAULT NULL,
  `secchi_b` float DEFAULT NULL,
  `secchi_d` float DEFAULT NULL,
  `lab_sample` enum('','Y','N') DEFAULT NULL,
  `lab_id` int(11) DEFAULT NULL,
  `nitrate` float DEFAULT NULL,
  `phosphate` float DEFAULT NULL,
  `coliform` enum('','Present','Absent') DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `location_id` (`location_id`,`station_name`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1";

$sqls[] = "
CREATE TABLE IF NOT EXISTS `water_quality_layers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(80) NOT NULL,
  `begintime` datetime DEFAULT NULL,
  `endtime` datetime DEFAULT NULL,
  `upper` float DEFAULT NULL,
  `right` float DEFAULT NULL,
  `bottom` float DEFAULT NULL,
  `left` float DEFAULT NULL,
  `total` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1";

$sqls[] = "
CREATE TABLE IF NOT EXISTS `water_quality_location` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `watershed_name` varchar(80) NOT NULL,
  `count` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1";

$sqls[] = "ALTER TABLE  `water_quality` ADD  `air_temp` FLOAT NULL DEFAULT NULL AFTER  `temp`";
$sqls[] = "ALTER TABLE  `water_quality` ADD  `note` VARCHAR( 200 ) NULL";
$sqls[] = "ALTER TABLE  `water_quality` CHANGE  `lab_sample`  `lab_sample` ENUM(  '',  'Y',  'N' ) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL";
$sqls[] = "ALTER TABLE  `water_quality` CHANGE  `coliform`  `coliform` ENUM(  '',  'Present',  'Absent' ) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL";