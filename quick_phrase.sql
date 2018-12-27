-- phpMyAdmin SQL Dump
-- version 4.2.10.1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Dec 27, 2018 at 09:56 AM
-- Server version: 5.6.21-log
-- PHP Version: 5.6.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `quick_phrase`
--
CREATE DATABASE IF NOT EXISTS `quick_phrase` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `quick_phrase`;

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
CREATE TABLE IF NOT EXISTS `category` (
`id` int(4) NOT NULL,
  `name` varchar(128) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `difficulty_level`
--

DROP TABLE IF EXISTS `difficulty_level`;
CREATE TABLE IF NOT EXISTS `difficulty_level` (
`id` int(4) NOT NULL,
  `name` varchar(128) NOT NULL,
  `max_rating` int(4) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `flagged_tag`
--

DROP TABLE IF EXISTS `flagged_tag`;
CREATE TABLE IF NOT EXISTS `flagged_tag` (
`id` int(4) NOT NULL,
  `tag_id` int(4) NOT NULL,
  `reason` varchar(256) NOT NULL,
  `ip_address` varchar(32) DEFAULT NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tag`
--

DROP TABLE IF EXISTS `tag`;
CREATE TABLE IF NOT EXISTS `tag` (
`id` int(4) NOT NULL,
  `category_id` int(4) NOT NULL,
  `text` varchar(128) NOT NULL,
  `difficulty_rating` int(4) NOT NULL,
  `edgy` int(1) NOT NULL DEFAULT '0',
  `submitter` int(4) DEFAULT NULL,
  `time_approved` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=61652 DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Stand-in structure for view `tag_breakdown`
--
DROP VIEW IF EXISTS `tag_breakdown`;
CREATE TABLE IF NOT EXISTS `tag_breakdown` (
`Category` varchar(142)
,`Total_Tags` bigint(21)
,`Super_Easy_Tags` bigint(21)
,`Easy_Tags` bigint(21)
,`Normal_Tags` bigint(21)
,`Hard_Tags` bigint(21)
,`Super_Hard_Tags` bigint(21)
,`Edgy_Tags` bigint(21)
);
-- --------------------------------------------------------

--
-- Table structure for table `unapproved_tag`
--

DROP TABLE IF EXISTS `unapproved_tag`;
CREATE TABLE IF NOT EXISTS `unapproved_tag` (
`id` int(4) NOT NULL,
  `category_id` int(4) DEFAULT NULL,
  `text` varchar(128) NOT NULL,
  `time_submitted` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `submitter` int(4) DEFAULT NULL,
  `ip_address` varchar(32) DEFAULT NULL
) ENGINE=InnoDB AUTO_INCREMENT=2117 DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `usage_clicks`
--

DROP TABLE IF EXISTS `usage_clicks`;
CREATE TABLE IF NOT EXISTS `usage_clicks` (
`id` int(4) NOT NULL,
  `location` varchar(256) NOT NULL,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=902040 DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `usage_settings`
--

DROP TABLE IF EXISTS `usage_settings`;
CREATE TABLE IF NOT EXISTS `usage_settings` (
`id` int(4) NOT NULL,
  `categories` varchar(256) NOT NULL,
  `difficulty` int(4) DEFAULT NULL,
  `max_words_per_tag` int(4) NOT NULL,
  `max_characters_per_tag` int(4) NOT NULL,
  `edgy` int(4) NOT NULL,
  `show_category` int(4) NOT NULL,
  `show_submitted_by` int(4) NOT NULL DEFAULT '0',
  `points_to_win` int(4) NOT NULL,
  `number_of_teams` int(4) NOT NULL,
  `min_round_seconds` int(4) NOT NULL,
  `max_round_seconds` int(4) NOT NULL,
  `timer_tick` varchar(256) NOT NULL,
  `theme` varchar(256) NOT NULL,
  `vibrate` int(4) NOT NULL,
  `web_service_timeout` int(4) NOT NULL DEFAULT '10000',
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=56814 DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE IF NOT EXISTS `user` (
`id` int(4) NOT NULL,
  `username` varchar(128) NOT NULL,
  `email_address` varchar(256) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure for view `tag_breakdown`
--
DROP TABLE IF EXISTS `tag_breakdown`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `tag_breakdown` AS select concat(`c`.`name`,' (',`c`.`id`,')') AS `Category`,(select count(0) from `tag` where (`tag`.`category_id` = `c`.`id`)) AS `Total_Tags`,(select count(0) from `tag` where ((`tag`.`difficulty_rating` = 1) and (`tag`.`category_id` = `c`.`id`))) AS `Super_Easy_Tags`,(select count(0) from `tag` where ((`tag`.`difficulty_rating` = 2) and (`tag`.`category_id` = `c`.`id`))) AS `Easy_Tags`,(select count(0) from `tag` where ((`tag`.`difficulty_rating` = 3) and (`tag`.`category_id` = `c`.`id`))) AS `Normal_Tags`,(select count(0) from `tag` where ((`tag`.`difficulty_rating` = 4) and (`tag`.`category_id` = `c`.`id`))) AS `Hard_Tags`,(select count(0) from `tag` where ((`tag`.`difficulty_rating` = 5) and (`tag`.`category_id` = `c`.`id`))) AS `Super_Hard_Tags`,(select count(0) from `tag` where ((`tag`.`edgy` = 1) and (`tag`.`category_id` = `c`.`id`))) AS `Edgy_Tags` from `category` `c` union select 'All Categories' AS `Category`,(select count(0) from `tag`) AS `Total_Tags`,(select count(0) from `tag` where (`tag`.`difficulty_rating` = 1)) AS `Super_Easy_Tags`,(select count(0) from `tag` where (`tag`.`difficulty_rating` = 2)) AS `Easy_Tags`,(select count(0) from `tag` where (`tag`.`difficulty_rating` = 3)) AS `Normal_Tags`,(select count(0) from `tag` where (`tag`.`difficulty_rating` = 4)) AS `Hard_Tags`,(select count(0) from `tag` where (`tag`.`difficulty_rating` = 5)) AS `Super_Hard_Tags`,(select count(0) from `tag` where (`tag`.`edgy` = 1)) AS `Edgy_Tags` from `category` `c`;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `category`
--
ALTER TABLE `category`
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `difficulty_level`
--
ALTER TABLE `difficulty_level`
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `flagged_tag`
--
ALTER TABLE `flagged_tag`
 ADD PRIMARY KEY (`id`), ADD KEY `tag_id` (`tag_id`);

--
-- Indexes for table `tag`
--
ALTER TABLE `tag`
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `text` (`text`), ADD KEY `category_id` (`category_id`), ADD KEY `submitter` (`submitter`);

--
-- Indexes for table `unapproved_tag`
--
ALTER TABLE `unapproved_tag`
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `text` (`text`), ADD KEY `category_id` (`category_id`), ADD KEY `submitter` (`submitter`);

--
-- Indexes for table `usage_clicks`
--
ALTER TABLE `usage_clicks`
 ADD PRIMARY KEY (`id`);

--
-- Indexes for table `usage_settings`
--
ALTER TABLE `usage_settings`
 ADD PRIMARY KEY (`id`), ADD KEY `difficulty` (`difficulty`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `category`
--
ALTER TABLE `category`
MODIFY `id` int(4) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=14;
--
-- AUTO_INCREMENT for table `difficulty_level`
--
ALTER TABLE `difficulty_level`
MODIFY `id` int(4) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=6;
--
-- AUTO_INCREMENT for table `flagged_tag`
--
ALTER TABLE `flagged_tag`
MODIFY `id` int(4) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT for table `tag`
--
ALTER TABLE `tag`
MODIFY `id` int(4) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=61652;
--
-- AUTO_INCREMENT for table `unapproved_tag`
--
ALTER TABLE `unapproved_tag`
MODIFY `id` int(4) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2117;
--
-- AUTO_INCREMENT for table `usage_clicks`
--
ALTER TABLE `usage_clicks`
MODIFY `id` int(4) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=902040;
--
-- AUTO_INCREMENT for table `usage_settings`
--
ALTER TABLE `usage_settings`
MODIFY `id` int(4) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=56814;
--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
MODIFY `id` int(4) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=44;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `flagged_tag`
--
ALTER TABLE `flagged_tag`
ADD CONSTRAINT `flagged_tag_ibfk_1` FOREIGN KEY (`tag_id`) REFERENCES `tag` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tag`
--
ALTER TABLE `tag`
ADD CONSTRAINT `tag_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`),
ADD CONSTRAINT `tag_ibfk_2` FOREIGN KEY (`submitter`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE SET NULL;

--
-- Constraints for table `unapproved_tag`
--
ALTER TABLE `unapproved_tag`
ADD CONSTRAINT `unapproved_tag_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`),
ADD CONSTRAINT `unapproved_tag_ibfk_2` FOREIGN KEY (`submitter`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `usage_settings`
--
ALTER TABLE `usage_settings`
ADD CONSTRAINT `usage_settings_ibfk_1` FOREIGN KEY (`difficulty`) REFERENCES `difficulty_level` (`id`) ON DELETE SET NULL ON UPDATE SET NULL;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
