create schema wakwak;
use wakwak;
CREATE TABLE `users` (
    `user_id` INT NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(30),
    `password` VARCHAR(255),
    `email` VARCHAR(255),
    `user_type` VARCHAR(10),
    `user_role` VARCHAR(10),
    `nickname` VARCHAR(255),
    `constellation` INT,
    `media_url` varchar(2048),
    `device_id` varchar(255),
    `device_name` varchar(255),
    PRIMARY KEY (`user_id`)
);

CREATE TABLE `fortune_telling` (
    `fortune_id` INT NOT NULL AUTO_INCREMENT,
    `text` VARCHAR(255) NULL,
    PRIMARY KEY (`fortune_id`)
);
CREATE TABLE `time_capsule` (
    `capsule_id` INT NOT NULL AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `content` TEXT NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `opened_at` TIMESTAMP NOT NULL,  -- "YYYY-MM-DD" 형식으로 저장
    `latitude` DECIMAL(10,7) NOT NULL,
    `longitude` DECIMAL(10,7) NOT NULL,
    PRIMARY KEY (`capsule_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE `time_capsule_media` (
    `media_id` INT NOT NULL AUTO_INCREMENT, -- 고유한 미디어 ID 추가
    `capsule_id` INT NOT NULL,              -- time_capsule 테이블의 FK
    `media_url` TEXT NULL,             -- URL 저장
    PRIMARY KEY (`media_id`),               -- `capsule_id`가 아니라 `media_id`를 PK로 설정
    FOREIGN KEY (`capsule_id`) REFERENCES `time_capsule` (`capsule_id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `time_capsule_access_users` (
    `user_id` INT NOT NULL,
    `capsule_id` INT NOT NULL,
    `is_read` TINYINT(1) NOT NULL DEFAULT 0, -- Boolean 대신 TINYINT(1)
    PRIMARY KEY (`user_id`, `capsule_id`),  -- 복합 기본 키 설정 (중복 방지)
    FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`capsule_id`) REFERENCES `time_capsule` (`capsule_id`) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE `certification` (
	`certification_id`	int	NOT NULL AUTO_INCREMENT,
	`email`	varchar(255)	NOT NULL,
	`certification_number`	varchar(4)	NOT NULL,
	`username`	varChar(30)	NOT NULL,
    PRIMARY KEY (`certification_id`)
);
CREATE TABLE `star_sky` (
    `sky_id` INT NOT NULL AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    PRIMARY KEY (`sky_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `star` (
    `star_id` INT NOT NULL AUTO_INCREMENT,
    `sky_id` INT NOT NULL,
    `latitude` DECIMAL(10,7) NOT NULL,
    `longitude` DECIMAL(10,7) NOT NULL,
    PRIMARY KEY (`star_id`),
    FOREIGN KEY (`sky_id`) REFERENCES `star_sky` (`sky_id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `constellation_name` (
    `constellation_id` INT NOT NULL AUTO_INCREMENT,
    `constellation_name` VARCHAR(20) NOT NULL,
    PRIMARY KEY (`constellation_id`)
);

CREATE TABLE `constellation` (
    `star_id` INT NOT NULL,
    `constellation_id` INT NOT NULL,
    `star_order` INT NOT NULL,
    PRIMARY KEY (`star_id`, `constellation_id`),
    FOREIGN KEY (`star_id`) REFERENCES `star` (`star_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`constellation_id`) REFERENCES `constellation_name` (`constellation_id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `star_diary` (
    `star_id` INT NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `title` VARCHAR(255) NOT NULL,
    `content` TEXT NOT NULL,
    PRIMARY KEY (`star_id`),
    FOREIGN KEY (`star_id`) REFERENCES `star` (`star_id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `star_diary_media` (
	`media_id` INT NOT NULL AUTO_INCREMENT,
    `star_id` INT NOT NULL,
    `media_url` TEXT NOT NULL,
    PRIMARY KEY (`media_id`),
    FOREIGN KEY (`star_id`) REFERENCES `star` (`star_id`) ON DELETE CASCADE ON UPDATE CASCADE
);
DELIMITER $$

CREATE TRIGGER `after_user_insert`
AFTER INSERT ON `users`
FOR EACH ROW
BEGIN
    INSERT INTO `star_sky` (`user_id`) VALUES (NEW.user_id);
    INSERT INTO `star_sky` (`user_id`) VALUES (NEW.user_id);
    INSERT INTO `star_sky` (`user_id`) VALUES (NEW.user_id);
    INSERT INTO `star_sky` (`user_id`) VALUES (NEW.user_id);
    

END $$

DELIMITER ;

CREATE TABLE `bottle` (
    `bottle_id` INT NOT NULL AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `content` TEXT NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `like_count` INT(10) NULL DEFAULT 0,
    PRIMARY KEY (`bottle_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `bottle_media` (
    `media_id` INT NOT NULL AUTO_INCREMENT,
    `bottle_id` INT NOT NULL,
    `media_url` VARCHAR(2048) NULL,
    PRIMARY KEY (`media_id`),
    FOREIGN KEY (`bottle_id`) REFERENCES `bottle` (`bottle_id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `bottle_comment` (
    `comment_id` INT NOT NULL AUTO_INCREMENT,
    `bottle_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    `parent_id` INT NULL,
    `content` VARCHAR(255) not NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (`comment_id`),
    FOREIGN KEY (`bottle_id`) REFERENCES `bottle` (`bottle_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`parent_id`) REFERENCES `bottle_comment` (`comment_id`) ON DELETE CASCADE ON UPDATE CASCADE  -- ✅ 자기 참조 FK 추가
);


CREATE TABLE `bottle_like` (
    `like_id` INT NOT NULL AUTO_INCREMENT,
    `bottle_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    PRIMARY KEY (`like_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`bottle_id`) REFERENCES `bottle` (`bottle_id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `friends` (
    `user1_id` INT NOT NULL,
    `user2_id` INT NOT NULL,
    PRIMARY KEY (`user1_id`, `user2_id`),
    FOREIGN KEY (`user1_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
    FOREIGN KEY (`user2_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
);
CREATE TABLE `friend_requests` (
    `request_id` INT AUTO_INCREMENT PRIMARY KEY,
    `sender_id` INT NOT NULL,
    `receiver_id` INT NOT NULL,
    FOREIGN KEY (`sender_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
    FOREIGN KEY (`receiver_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
);
CREATE INDEX `idx_friends_user1` ON `friends`(`user1_id`);
CREATE INDEX `idx_friends_user2` ON `friends`(`user2_id`);


CREATE TABLE `item` (
    `item_id` INT NOT NULL AUTO_INCREMENT,
    `item_name` VARCHAR(255) NULL,
    `description` TEXT NULL,
    PRIMARY KEY (`item_id`)
);

CREATE TABLE `costume` (
    `costume_id` INT NOT NULL AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `item_id` INT NOT NULL,
    `has_item` TINYINT(1) NULL default 0,
    PRIMARY KEY (`costume_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`item_id`) REFERENCES `item` (`item_id`) ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO item (item_name, description) VALUES
('코스튬 1', '설명 작성해야함'), ('코스튬 2', '설명 작성해야함'), ('코스튬 3', '설명 작성해야함'), 
('코스튬 4', '설명 작성해야함'), ('코스튬 5', '설명 작성해야함'), ('코스튬 6', '설명 작성해야함');

DELIMITER $$

CREATE TRIGGER after_user_insert_costume
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    DECLARE i INT DEFAULT 1;

    WHILE i <= 6 DO
        INSERT INTO costume (user_id, item_id, has_item)
        VALUES (NEW.user_id, i, 0);
        SET i = i + 1;
    END WHILE;
END $$

DELIMITER ;

