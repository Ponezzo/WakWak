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

INSERT INTO users (username, password, email, user_type, user_role, nickname, constellation, media_url, device_id, device_name)
VALUES
('user001', 'password1', 'user001@example.com', 'naver', 'ROLE_USER', 'user001', 1, NULL, NULL, NULL),
('user002', 'password2', 'user002@example.com', 'naver', 'ROLE_USER', 'user002', 5, NULL, NULL, NULL),
('user003', 'password3', 'user003@example.com', 'naver', 'ROLE_USER', 'user003', 9, NULL, NULL, NULL),
('user004', 'password4', 'user004@example.com', 'naver', 'ROLE_USER', 'user004', 13, NULL, NULL, NULL),
('user005', 'password5', 'user005@example.com', 'naver', 'ROLE_USER', 'user005', 17, NULL, NULL, NULL),
('user006', 'password6', 'user006@example.com', 'naver', 'ROLE_USER', 'user006', 21, NULL, NULL, NULL),
('user007', 'password7', 'user007@example.com', 'naver', 'ROLE_USER', 'user007', 25, NULL, NULL, NULL),
('user008', 'password8', 'user008@example.com', 'naver', 'ROLE_USER', 'user008', 29, NULL, NULL, NULL),
('user009', 'password9', 'user009@example.com', 'naver', 'ROLE_USER', 'user009', 33, NULL, NULL, NULL),
('user010', 'password10', 'user010@example.com', 'naver', 'ROLE_USER', 'user010', 37, NULL, NULL, NULL),
('user011', 'password11', 'user011@example.com', 'naver', 'ROLE_USER', 'user011', 41, NULL, NULL, NULL),
('user012', 'password12', 'user012@example.com', 'naver', 'ROLE_USER', 'user012', 45, NULL, NULL, NULL),
('user013', 'password13', 'user013@example.com', 'naver', 'ROLE_USER', 'user013', 49, NULL, NULL, NULL),
('user014', 'password14', 'user014@example.com', 'naver', 'ROLE_USER', 'user014', 53, NULL, NULL, NULL),
('user015', 'password15', 'user015@example.com', 'naver', 'ROLE_USER', 'user015', 57, NULL, NULL, NULL),
('user016', 'password16', 'user016@example.com', 'naver', 'ROLE_USER', 'user016', 61, NULL, NULL, NULL),
('user017', 'password17', 'user017@example.com', 'naver', 'ROLE_USER', 'user017', 65, NULL, NULL, NULL),
('user018', 'password18', 'user018@example.com', 'naver', 'ROLE_USER', 'user018', 69, NULL, NULL, NULL),
('user019', 'password19', 'user019@example.com', 'naver', 'ROLE_USER', 'user019', 73, NULL, NULL, NULL),
('user020', 'password20', 'user020@example.com', 'naver', 'ROLE_USER', 'user020', 77, NULL, NULL, NULL),
('user021', 'password21', 'user021@example.com', 'naver', 'ROLE_USER', 'user021', 81, NULL, NULL, NULL),
('user022', 'password22', 'user022@example.com', 'naver', 'ROLE_USER', 'user022', 85, NULL, NULL, NULL),
('user023', 'password23', 'user023@example.com', 'naver', 'ROLE_USER', 'user023', 89, NULL, NULL, NULL),
('user024', 'password24', 'user024@example.com', 'naver', 'ROLE_USER', 'user024', 93, NULL, NULL, NULL),
('user025', 'password25', 'user025@example.com', 'naver', 'ROLE_USER', 'user025', 97, NULL, NULL, NULL),
('user026', 'password26', 'user026@example.com', 'naver', 'ROLE_USER', 'user026', 101, NULL, NULL, NULL),
('user027', 'password27', 'user027@example.com', 'naver', 'ROLE_USER', 'user027', 105, NULL, NULL, NULL),
('user028', 'password28', 'user028@example.com', 'naver', 'ROLE_USER', 'user028', 109, NULL, NULL, NULL),
('user029', 'password29', 'user029@example.com', 'naver', 'ROLE_USER', 'user029', 113, NULL, NULL, NULL),
('user030', 'password30', 'user030@example.com', 'naver', 'ROLE_USER', 'user030', 117, NULL, NULL, NULL),
('user031', 'password31', 'user031@example.com', 'naver', 'ROLE_USER', 'user031', 121, NULL, NULL, NULL),
('user032', 'password32', 'user032@example.com', 'naver', 'ROLE_USER', 'user032', 125, NULL, NULL, NULL),
('user033', 'password33', 'user033@example.com', 'naver', 'ROLE_USER', 'user033', 129, NULL, NULL, NULL),
('user034', 'password34', 'user034@example.com', 'naver', 'ROLE_USER', 'user034', 133, NULL, NULL, NULL),
('user035', 'password35', 'user035@example.com', 'naver', 'ROLE_USER', 'user035', 137, NULL, NULL, NULL),
('user036', 'password36', 'user036@example.com', 'naver', 'ROLE_USER', 'user036', 141, NULL, NULL, NULL),
('user037', 'password37', 'user037@example.com', 'naver', 'ROLE_USER', 'user037', 145, NULL, NULL, NULL),
('user038', 'password38', 'user038@example.com', 'naver', 'ROLE_USER', 'user038', 149, NULL, NULL, NULL),
('user039', 'password39', 'user039@example.com', 'naver', 'ROLE_USER', 'user039', 153, NULL, NULL, NULL),
('user040', 'password40', 'user040@example.com', 'naver', 'ROLE_USER', 'user040', 157, NULL, NULL, NULL),
('user041', 'password41', 'user041@example.com', 'naver', 'ROLE_USER', 'user041', 161, NULL, NULL, NULL),
('user042', 'password42', 'user042@example.com', 'naver', 'ROLE_USER', 'user042', 165, NULL, NULL, NULL),
('user043', 'password43', 'user043@example.com', 'naver', 'ROLE_USER', 'user043', 169, NULL, NULL, NULL),
('user044', 'password44', 'user044@example.com', 'naver', 'ROLE_USER', 'user044', 173, NULL, NULL, NULL),
('user045', 'password45', 'user045@example.com', 'naver', 'ROLE_USER', 'user045', 177, NULL, NULL, NULL),
('user046', 'password46', 'user046@example.com', 'naver', 'ROLE_USER', 'user046', 181, NULL, NULL, NULL),
('user047', 'password47', 'user047@example.com', 'naver', 'ROLE_USER', 'user047', 185, NULL, NULL, NULL),
('user048', 'password48', 'user048@example.com', 'naver', 'ROLE_USER', 'user048', 189, NULL, NULL, NULL),
('user049', 'password49', 'user049@example.com', 'naver', 'ROLE_USER', 'user049', 193, NULL, NULL, NULL),
('user050', 'password50', 'user050@example.com', 'naver', 'ROLE_USER', 'user050', 197, NULL, NULL, NULL),
('user051', 'password51', 'user051@example.com', 'naver', 'ROLE_USER', 'user051', 201, NULL, NULL, NULL),
('user052', 'password52', 'user052@example.com', 'naver', 'ROLE_USER', 'user052', 205, NULL, NULL, NULL),
('user053', 'password53', 'user053@example.com', 'naver', 'ROLE_USER', 'user053', 209, NULL, NULL, NULL),
('user054', 'password54', 'user054@example.com', 'naver', 'ROLE_USER', 'user054', 213, NULL, NULL, NULL),
('user055', 'password55', 'user055@example.com', 'naver', 'ROLE_USER', 'user055', 217, NULL, NULL, NULL),
('user056', 'password56', 'user056@example.com', 'naver', 'ROLE_USER', 'user056', 221, NULL, NULL, NULL),
('user057', 'password57', 'user057@example.com', 'naver', 'ROLE_USER', 'user057', 225, NULL, NULL, NULL),
('user058', 'password58', 'user058@example.com', 'naver', 'ROLE_USER', 'user058', 229, NULL, NULL, NULL),
('user059', 'password59', 'user059@example.com', 'naver', 'ROLE_USER', 'user059', 233, NULL, NULL, NULL),
('user060', 'password60', 'user060@example.com', 'naver', 'ROLE_USER', 'user060', 237, NULL, NULL, NULL),
('user061', 'password61', 'user061@example.com', 'naver', 'ROLE_USER', 'user061', 241, NULL, NULL, NULL),
('user062', 'password62', 'user062@example.com', 'naver', 'ROLE_USER', 'user062', 245, NULL, NULL, NULL),
('user063', 'password63', 'user063@example.com', 'naver', 'ROLE_USER', 'user063', 249, NULL, NULL, NULL),
('user064', 'password64', 'user064@example.com', 'naver', 'ROLE_USER', 'user064', 253, NULL, NULL, NULL),
('user065', 'password65', 'user065@example.com', 'naver', 'ROLE_USER', 'user065', 257, NULL, NULL, NULL),
('user066', 'password66', 'user066@example.com', 'naver', 'ROLE_USER', 'user066', 261, NULL, NULL, NULL),
('user067', 'password67', 'user067@example.com', 'naver', 'ROLE_USER', 'user067', 265, NULL, NULL, NULL),
('user068', 'password68', 'user068@example.com', 'naver', 'ROLE_USER', 'user068', 269, NULL, NULL, NULL),
('user069', 'password69', 'user069@example.com', 'naver', 'ROLE_USER', 'user069', 273, NULL, NULL, NULL),
('user070', 'password70', 'user070@example.com', 'naver', 'ROLE_USER', 'user070', 277, NULL, NULL, NULL),
('user071', 'password71', 'user071@example.com', 'naver', 'ROLE_USER', 'user071', 281, NULL, NULL, NULL),
('user072', 'password72', 'user072@example.com', 'naver', 'ROLE_USER', 'user072', 285, NULL, NULL, NULL),
('user073', 'password73', 'user073@example.com', 'naver', 'ROLE_USER', 'user073', 289, NULL, NULL, NULL),
('user074', 'password74', 'user074@example.com', 'naver', 'ROLE_USER', 'user074', 293, NULL, NULL, NULL),
('user075', 'password75', 'user075@example.com', 'naver', 'ROLE_USER', 'user075', 297, NULL, NULL, NULL),
('user076', 'password76', 'user076@example.com', 'naver', 'ROLE_USER', 'user076', 301, NULL, NULL, NULL),
('user077', 'password77', 'user077@example.com', 'naver', 'ROLE_USER', 'user077', 305, NULL, NULL, NULL),
('user078', 'password78', 'user078@example.com', 'naver', 'ROLE_USER', 'user078', 309, NULL, NULL, NULL),
('user079', 'password79', 'user079@example.com', 'naver', 'ROLE_USER', 'user079', 313, NULL, NULL, NULL),
('user080', 'password80', 'user080@example.com', 'naver', 'ROLE_USER', 'user080', 317, NULL, NULL, NULL),
('user081', 'password81', 'user081@example.com', 'naver', 'ROLE_USER', 'user081', 321, NULL, NULL, NULL),
('user082', 'password82', 'user082@example.com', 'naver', 'ROLE_USER', 'user082', 325, NULL, NULL, NULL),
('user083', 'password83', 'user083@example.com', 'naver', 'ROLE_USER', 'user083', 329, NULL, NULL, NULL),
('user084', 'password84', 'user084@example.com', 'naver', 'ROLE_USER', 'user084', 333, NULL, NULL, NULL),
('user085', 'password85', 'user085@example.com', 'naver', 'ROLE_USER', 'user085', 337, NULL, NULL, NULL),
('user086', 'password86', 'user086@example.com', 'naver', 'ROLE_USER', 'user086', 341, NULL, NULL, NULL),
('user087', 'password87', 'user087@example.com', 'naver', 'ROLE_USER', 'user087', 345, NULL, NULL, NULL),
('user088', 'password88', 'user088@example.com', 'naver', 'ROLE_USER', 'user088', 349, NULL, NULL, NULL),
('user089', 'password89', 'user089@example.com', 'naver', 'ROLE_USER', 'user089', 353, NULL, NULL, NULL),
('user090', 'password90', 'user090@example.com', 'naver', 'ROLE_USER', 'user090', 357, NULL, NULL, NULL),
('user091', 'password91', 'user091@example.com', 'naver', 'ROLE_USER', 'user091', 361, NULL, NULL, NULL),
('user092', 'password92', 'user092@example.com', 'naver', 'ROLE_USER', 'user092', 365, NULL, NULL, NULL),
('user093', 'password93', 'user093@example.com', 'naver', 'ROLE_USER', 'user093', 369, NULL, NULL, NULL),
('user094', 'password94', 'user094@example.com', 'naver', 'ROLE_USER', 'user094', 373, NULL, NULL, NULL),
('user095', 'password95', 'user095@example.com', 'naver', 'ROLE_USER', 'user095', 377, NULL, NULL, NULL),
('user096', 'password96', 'user096@example.com', 'naver', 'ROLE_USER', 'user096', 381, NULL, NULL, NULL),
('user097', 'password97', 'user097@example.com', 'naver', 'ROLE_USER', 'user097', 385, NULL, NULL, NULL),
('user098', 'password98', 'user098@example.com', 'naver', 'ROLE_USER', 'user098', 389, NULL, NULL, NULL),
('user099', 'password99', 'user099@example.com', 'naver', 'ROLE_USER', 'user099', 393, NULL, NULL, NULL),
('user100', 'password100', 'user100@example.com', 'naver', 'ROLE_USER', 'user100', 397, NULL, NULL, NULL);

INSERT INTO friends (user1_id, user2_id) VALUES
(13, 88),
(34, 65),
(82, 29),
(52, 58),
(17, 58),
(40, 41),
(68, 2),
(5, 28),
(78, 34),
(11, 78),
(83, 30),
(35, 72),
(95, 13),
(49, 89),
(36, 9),
(36, 18),
(63, 91),
(17, 69),
(65, 8),
(4, 23),
(100, 39),
(41, 17),
(35, 65),
(13, 10),
(35, 10),
(52, 35),
(7, 67),
(27, 100),
(52, 99),
(19, 41),
(27, 54),
(91, 57),
(64, 18),
(70, 77),
(62, 39),
(49, 39),
(40, 36),
(76, 1),
(48, 49),
(40, 100),
(31, 97),
(3, 72),
(12, 20),
(57, 6),
(14, 44),
(41, 28),
(79, 67),
(82, 8),
(96, 92),
(8, 34),
(54, 74),
(64, 20),
(65, 3),
(98, 9),
(1, 3),
(98, 18),
(90, 69),
(43, 27),
(62, 7),
(44, 90),
(16, 83),
(7, 80),
(33, 44),
(83, 48),
(92, 60),
(49, 34),
(48, 44),
(100, 91),
(13, 7),
(26, 13),
(25, 15),
(61, 44),
(1, 23),
(71, 12),
(85, 93),
(1, 32),
(100, 2),
(8, 47),
(47, 63),
(3, 5),
(73, 91),
(40, 88),
(85, 65),
(26, 98),
(95, 33),
(61, 10),
(88, 3),
(99, 3),
(90, 9),
(44, 76),
(71, 14),
(95, 2),
(71, 78),
(94, 52),
(83, 52),
(23, 65),
(3, 62),
(30, 58),
(39, 91),
(23, 10),
(52, 55),
(43, 52),
(61, 67),
(72, 42),
(24, 2),
(15, 63),
(64, 47),
(10, 76),
(96, 91),
(11, 20),
(10, 30),
(94, 36),
(20, 7),
(15, 20),
(100, 6),
(46, 90),
(14, 64),
(100, 15),
(28, 63),
(29, 37),
(86, 98),
(7, 43),
(84, 46),
(70, 81),
(52, 75),
(16, 9),
(81, 74),
(63, 5),
(11, 31),
(84, 76),
(4, 56),
(72, 28),
(81, 40),
(52, 77),
(90, 6),
(59, 92),
(28, 86),
(9, 82),
(65, 80),
(60, 38),
(23, 53),
(39, 79),
(50, 46),
(46, 94),
(84, 78),
(13, 27),
(38, 90),
(24, 100),
(15, 97),
(87, 83),
(1, 43),
(4, 76),
(47, 74),
(13, 54),
(55, 87),
(37, 18),
(17, 15),
(9, 11),
(46, 60),
(62, 56),
(14, 34),
(60, 31),
(77, 47),
(28, 97),
(40, 7),
(52, 36),
(1, 100),
(84, 34),
(69, 79),
(81, 44),
(35, 56),
(10, 2),
(61, 75),
(55, 34),
(91, 85),
(53, 46),
(45, 42),
(14, 91),
(11, 74),
(94, 90),
(34, 51),
(14, 100),
(12, 48),
(28, 99),
(23, 48),
(51, 30),
(20, 6),
(23, 57),
(78, 57),
(68, 34),
(36, 60),
(95, 27),
(47, 78),
(51, 5),
(77, 24),
(47, 87),
(30, 89),
(37, 40),
(98, 19),
(41, 31);

INSERT INTO friend_requests (sender_id, receiver_id) VALUES
(7, 17),
(70, 64),
(27, 59),
(2, 39),
(54, 22),
(76, 52),
(25, 50),
(65, 61),
(46, 57),
(94, 39),
(50, 36),
(87, 9),
(7, 28),
(22, 74),
(74, 2),
(88, 65),
(40, 43),
(45, 94),
(5, 85),
(11, 16),
(6, 50),
(22, 46),
(68, 13),
(66, 16),
(78, 36),
(67, 45),
(90, 74),
(88, 86),
(56, 14),
(73, 30),
(46, 98),
(45, 78),
(36, 11),
(14, 72),
(38, 39),
(63, 38),
(60, 14),
(21, 96),
(23, 93),
(38, 2),
(77, 48),
(61, 40),
(25, 20),
(67, 65),
(2, 27),
(68, 36),
(77, 78),
(83, 9),
(6, 36),
(76, 3),
(60, 71),
(11, 66),
(37, 30),
(23, 95),
(43, 9),
(6, 54),
(7, 53),
(33, 26),
(8, 91),
(35, 87),
(70, 54),
(18, 80),
(28, 57),
(91, 6),
(38, 89),
(91, 15),
(60, 64),
(46, 47),
(92, 14),
(52, 5),
(68, 56),
(51, 15),
(69, 85),
(84, 49),
(49, 61),
(19, 20),
(79, 16),
(76, 81),
(79, 89),
(10, 99),
(82, 30),
(99, 46),
(40, 79),
(83, 4),
(23, 17),
(84, 88),
(4, 68),
(23, 81),
(9, 64),
(41, 62),
(89, 90),
(6, 49),
(27, 81),
(16, 5),
(73, 57),
(73, 2),
(45, 50),
(57, 24),
(27, 53),
(73, 20),
(46, 33),
(67, 10),
(51, 56),
(59, 6),
(29, 35),
(24, 48),
(14, 80),
(84, 99),
(96, 64),
(41, 73),
(79, 57),
(45, 34),
(33, 14),
(55, 44),
(19, 79),
(91, 31),
(71, 62),
(85, 33),
(30, 97),
(74, 97),
(73, 77),
(14, 55),
(76, 48),
(29, 28),
(7, 25),
(58, 27),
(34, 27),
(89, 39),
(8, 72),
(30, 17),
(65, 78),
(96, 93),
(66, 22),
(65, 32),
(66, 86),
(58, 48),
(84, 67),
(74, 44),
(39, 77),
(23, 78),
(77, 79),
(67, 78),
(18, 91),
(4, 74),
(67, 87),
(34, 93),
(65, 7),
(94, 22),
(3, 96),
(74, 28),
(92, 98),
(83, 95),
(6, 3),
(68, 12),
(24, 91),
(67, 80),
(43, 58),
(79, 54),
(35, 63),
(10, 9),
(85, 12),
(99, 11),
(18, 56),
(42, 23),
(64, 53),
(79, 72),
(62, 65),
(22, 56),
(95, 71),
(97, 68),
(94, 51),
(87, 3),
(20, 77),
(78, 9),
(53, 74),
(55, 71),
(87, 21),
(16, 98),
(93, 64),
(71, 98),
(50, 75),
(70, 23),
(48, 41),
(63, 39),
(36, 85),
(82, 70),
(66, 83),
(32, 26),
(51, 39),
(35, 22),
(26, 19),
(89, 57),
(86, 79),
(27, 57),
(64, 85),
(18, 42),
(10, 68),
(36, 87),
(67, 50),
(40, 11);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (49, '오늘의 작은 행복', '출근길에 들은 노래가 유난히 좋아서 하루가 상쾌하게 시작됐다. 사소한 부분에서 행복을 찾는 습관을 들여보자!', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (29, '추천하는 맛집 리스트', '이번 주에 다녀온 식당 중 최고의 맛집 3곳을 정리해봤다. 맛, 분위기, 가격 모두 만족스러웠던 곳들!', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (82, '주말 동안 읽은 책', '오랜만에 독서에 푹 빠졌다. 힐링 에세이 한 권 완독했는데, 마음이 꽤 차분해지는 경험이었다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (26, '새로 배운 스트레칭 동작', '하루 종일 앉아 있다 보니 어깨와 목이 너무 뻐근해서 새 스트레칭 루틴을 시작했다. 효과가 좋아 공유해본다!', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (70, '반려동물 사진 대방출', '오늘은 우리 집 강아지의 귀여운 모습을 한껏 찍어봤다. 한 장 고르기가 어려울 정도로 다 귀엽다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (63, '나만의 공부 방법', '집중력이 떨어지는 요즘, Pomodoro 기법과 간단한 메모 습관으로 효율을 높이는 팁을 정리해봤다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (93, '처음 해본 홈베이킹', '주말에 쿠키를 구워봤는데 반죽부터 굽는 과정까지 생각보다 쉽고 재미있었다. 직접 만든 쿠키라 그런지 맛도 두 배!', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (49, 'SNS 계정 정리하기', '매일 시간만 빼앗기는 SNS 계정을 대대적으로 정리해봤다. 더 이상 의미 없는 정보에 시간을 허비하지 말자.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (15, '1일 1운동 챌린지 시작', '체력이 너무 떨어진 것 같아서 매일 짧게라도 운동하기로 결심했다. 푸쉬업, 스쿼트부터 조금씩 시작!', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (14, '습관 형성 앱 후기', '일주일 동안 습관 형성 앱을 써봤다. 알림 덕분에 규칙적으로 할 일을 체크할 수 있어서 좋았다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (4, '나만의 음악 플레이리스트', '최근 즐겨 듣는 플레이리스트 공개! 출퇴근 시간에 들으면 기분이 한결 나아지는 곡들이다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (39, '주말 여행 계획', '이번 주말에는 근교로 나가서 조용히 쉬고 싶다. 어디로 갈지 고민 중인데 추천할 만한 곳 있으면 알려주세요!', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (95, '다이어트 식단 공유', '간단하게 만들어 먹을 수 있는 샐러드 레시피를 정리했다. 매일 다른 재료로 바꿔 가며 먹으면 물리지 않는다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (68, '카페에서의 소소한 일상', '오늘도 카페에 앉아 일을 하는 중. 가끔 창밖을 보면 시간 가는 줄 모르겠다. 이렇게 일하는 것도 나쁘지 않다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (5, '전시회 다녀온 후기', '미술관에서 새로운 작품을 감상하며 영감을 얻었다. 색다른 예술 세계를 마주할 때마다 마음이 풍부해지는 느낌!', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (52, '어제 본 영화 리뷰', '스토리 전개가 탄탄하고 여운이 오래 남았다. 주연 배우의 연기력이 특히 인상 깊었던 작품!', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (93, '새로운 취미 추천', '요즘 ‘도예’가 취미로 인기라 해서 관심 가져보는 중. 흙을 만지며 만드는 과정이 마음을 편하게 해준다고 한다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (69, '아침 명상 도전기', '눈 뜨자마자 5분 동안 명상해보니 하루가 한결 여유로워진다. 생각이 너무 많을 때 효과적!', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (36, '내 방 인테리어 소소하게 바꾸기', '커튼 색을 바꿔봤더니 분위기가 확 달라졌다. 조명 하나만 바꿔도 느낌이 새로워진다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (47, '업무 효율 높이기 꿀팁', '해야 할 일을 작은 단위로 나눠서 체크리스트를 만든 뒤, 순서대로 완수하면 성취감이 쌓인다!', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (68, '건강검진 준비', '곧 건강검진이 다가온다. 미리 식단 조절하고 운동량 늘려서 좋은 결과를 기대해본다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (80, '재테크 시작하기', '가계부부터 적금, 주식 투자까지 기본부터 차근차근 배워보려 한다. 작은 금액이라도 꾸준히 모으면 큰 힘이 될 듯!', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (93, '할 일 미루기 방지법', '일단 5분만 하기로 마음먹으면 시작이 훨씬 쉬워진다. ‘지금 바로’ 행동하는 습관 만들기가 핵심!', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (100, '감성 사진 찍는 법', '역광을 이용해 사진을 찍어보면 의외로 분위기 있는 사진이 나온다. 자연광 활용은 언제나 옳다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (98, '반려식물 키우기', '작은 선인장부터 시작해보면 비교적 쉽게 식물 키우기에 입문할 수 있다. 물 주는 빈도만 지켜도 잘 자란다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (20, '학습 모임 구하기', '독서 토론 모임을 찾고 있는데, 함께 성장할 수 있는 사람들을 만나고 싶다. 괜찮은 온라인 모임 있나요?', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (21, '나만의 커피 레시피', '달콤하고 부드러운 라떼를 집에서도 만들 수 있는 방법! 얼음, 우유, 에스프레소만 있으면 간단하다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (73, '일본어 공부 시작', '매일 단어 10개씩 외우고 드라마 한 편씩 보기로 했다. 언어는 꾸준함이 답이라는 말이 맞는 듯!', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (7, '내게 힘이 된 한 문장', '“작은 일에도 최선을 다하면, 큰 기회가 보인다.” 이 말을 되새기며 오늘도 열심히 살아가야겠다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (20, '중고 거래 꿀팁', '사용하지 않는 물건을 정리하면서 중고 거래 앱을 자주 이용하게 됐다. 안전 거래 위해 절차 잘 확인하세요!', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (72, '무료 강의 찾는 방법', '유튜브나 공공기관 사이트에 무료로 들을 수 있는 강의가 많다. 자기계발에 관심 있다면 꼭 찾아보길 추천!', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (52, '전자책 리더기 활용기', '종이책만 읽다가 전자책으로 넘어오니 생각보다 편해서 좋다. 무거운 책을 들고 다니지 않아도 된다는 점이 최고!', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (19, '홈트레이닝 앱 추천', '집에서 간단히 따라 할 수 있는 운동이 많아서 좋다. 푸쉬업, 스쿼트, 요가 등 영상 안내가 정말 상세하다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (31, '나들이 도시락 메뉴', '봄 소풍 갈 때 싸면 좋은 간단 샌드위치 레시피! 재료도 간단하고 만드는 방법도 쉬워서 인기 만점.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (4, '새로 산 키보드 후기', '기계식 키보드로 바꿨더니 타건감이 훨씬 좋다. 타닥타닥 소리가 집중력을 높여주는 느낌?', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (2, '미뤄왔던 방 청소 완료', '한 달 동안 쌓아둔 물건을 드디어 정리했다. 방이 깔끔해지니 머리까지 맑아지는 것 같다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (64, '주간 업무 계획표 공유', '월요일엔 자료 조사, 화요일엔 기획 회의, 수요일엔 실행… 이렇게 하루하루 테마를 정해두면 정신없지 않다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (78, '비 오는 날의 감성', '창문을 두드리는 빗소리를 들으며 오랜만에 차분한 시간을 가져본다. 머그잔에 커피 한 잔이면 최고!', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (38, '독서 토론 주제 추천', '‘미움 받을 용기’를 읽고 느낀 점들을 공유하고 싶은데, 관련해서 토론하기 좋은 질문 거리도 있으면 좋겠다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (60, '직장 생활 꿀팁', '메일 정리, 메신저 예의, 회의 준비 등 작지만 중요한 팁들을 모아봤다. 사소해 보이지만 실무 효율에 큰 도움!', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (49, '플로깅 도전기', '달리면서 쓰레기를 줍는 ‘플로깅’을 시작했다. 건강도 지키고 환경도 지키는 착한 습관!', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (62, '셀프 네일아트', '온라인에서 재료를 구입해서 해봤는데 의외로 어렵지 않았다. 내가 직접 꾸민 손톱 보니 기분이 묘하게 뿌듯하다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (16, '여행 중 찍은 사진 전시', '일상에서 벗어나 다른 곳에서 찍은 풍경 사진을 인화해 방에 걸어두었다. 볼 때마다 다시 떠나고 싶어지는 기분!', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (5, '꿀잠을 부르는 방법', '잠들기 전 휴대폰 멀리하기, 가벼운 스트레칭, 따뜻한 차 한 잔이 내게는 효과가 좋았다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (21, '새로 배운 악기 일기', '요즘 통기타를 배우고 있는데, 손끝이 아프지만 코드를 하나씩 익히는 재미가 쏠쏠하다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (73, '노트 필기 정리법', '중요한 키워드는 색깔로 표시하고, 관련 내용을 계층적으로 적는다. 복습할 때 정말 편하다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (44, '단기 목표 세우기', '‘이번 달에 영어 단어 300개 암기하기’처럼 구체적인 목표를 잡으면 동기 부여가 된다. 작은 목표부터 달성하자!', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (86, '낙서로 스트레스 풀기', '생각이 많을 때 그림을 그려보면 의외로 머리가 정리된다. 잘 그리든 못 그리든 상관없이 자유롭게 끄적이기!', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (92, '정리정돈 자극사진', '인테리어 잡지를 보면서 나만의 공간을 상상하면 청소할 의욕이 상승한다. 언젠가 이렇게 깔끔한 집을 만들어야지!', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (54, '심플 라이프 실천법', '필요 없는 물건을 버리고, 소비를 줄이는 습관을 들이면 마음까지 가벼워진다. 미니멀리스트의 삶, 생각보다 괜찮다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (19, 'PC 셋업 후기', '드디어 새 PC를 맞췄다. 조립 과정은 어렵지만 완성 후 부팅되는 순간의 뿌듯함이란!', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (35, '짧은 영어 문장 연습', '일상에서 자주 쓰는 한 줄 표현을 모아봤다. “How’s it going?”처럼 간단해 보이지만 유용하다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (98, '요즘 빠진 드라마', '스토리가 탄탄하고 배우들 연기가 뛰어나서 정주행 중. 주말에 몰아서 보느라 눈이 쉬지를 못한다!', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (88, '오늘의 아이디어 스케치', '일하다가 떠오른 창의적인 아이디어를 간단히 스케치로 남겨봤다. 나중에 프로젝트에 쓰일 수 있을지 기대된다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (89, '버킷리스트 10가지', '스카이다이빙, 유럽 여행, 책 출간... 생각만 해도 설레는 것들을 적어두니 의욕이 생긴다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (61, '소소한 기부 이야기', '오늘은 사용하지 않는 책과 옷을 기부했다. 누군가에게 도움이 될 수 있다니 참 뿌듯하다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (16, '건강한 간식 만들기', '오트밀, 견과류, 말린 과일을 섞어 구우면 간단한 그래놀라가 완성! 우유나 요거트랑 먹으면 든든하다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (8, '주말 산책 코스', '집 근처 공원 루트를 걷고 왔다. 꽃이 피어나기 시작한 걸 보니 봄이 성큼 다가온 듯하다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (100, '낯가림 줄이는 법', '처음 보는 사람 앞에서 너무 긴장된다면, 먼저 가볍게 인사를 건네고 공통된 관심사를 찾아보면 대화가 훨씬 편해진다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (13, '업무 중간 점검', '월말이 되기 전에 진행 상황을 체크해본다. 미뤄둔 업무가 있으면 이번 주 안에 처리해야 마음이 편하다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (91, '주방 정리 노하우', '식재료 유통기한별로 정리하고 라벨링 해두면 편리하다. 한눈에 재고를 파악할 수 있어서 식자재 낭비도 줄어든다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (22, '운동화 커스텀 도전', '아무 무늬 없는 흰색 운동화에 물감을 뿌려서 개성을 살려봤다. 세상에 단 하나뿐인 신발을 만들었다!', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (29, '빠른 길 찾기 어플 비교', '길이 막힐 때 어떤 어플이 더 정확한지 비교 리뷰를 해봤다. 데이터가 쌓일수록 더욱 정확해지는 듯?', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (99, '새벽 기상 성공기', '알람 끄지 않고 바로 일어나서 스트레칭 5분 해보니 정신이 번쩍 든다. 아직까지는 성공 중!', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (25, '간단한 IT 지식 공유', '최근 클라우드 서비스를 이용해 백업하는 방법을 배웠다. 중요한 파일을 잃지 않도록 정기적으로 백업하는 게 중요!', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (48, '오늘 만든 캐릭터 일러스트', '취미로 그림 그리는데, 직접 창작한 캐릭터를 완성했다. 색감 선택이 어려웠지만 결과물이 나쁘지 않다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (27, '팀 프로젝트 협업툴 추천', 'Trello, Notion 등 협업툴을 사용하면 업무 진행 상황을 시각화하기 좋아서 팀원들과 의사소통이 편해진다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (75, '랜덤 요리 도전', '냉장고에 있는 재료로 즉흥적인 요리를 만들어 봤다. 의외로 맛있어서 레시피를 기록해둬야겠다!', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (33, '명절 가족 모임 후기', '오랜만에 온 가족이 모여서 즐겁게 식사했다. 시간이 지나고 보니 이런 자리가 점점 소중해진다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (8, '짧은 근황 토크', '요즘 바쁘긴 하지만 여유를 조금씩 찾으려고 노력 중이다. 다들 잘 지내고 있죠?', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (34, '귀여운 이모티콘 모음', '채팅하면서 감정을 표현하기 좋은 이모티콘들을 모아봤다. 자주 쓰면 메시지가 한층 밝아진다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (88, '아침식사 루틴', '빵, 커피만 먹던 걸 바꿔서 과일이나 요거트도 추가해봤다. 확실히 속이 더 편한 느낌이다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (57, '프로젝트 마감 노하우', '제출 날짜가 가까워지면 무리하기 쉽다. 남은 할 일을 우선순위로 정리하고 불필요한 작업을 줄이는 게 핵심!', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (65, '장 보기 팁', '장보러 가기 전에 미리 리스트를 작성하면 불필요한 지출이 줄어든다. 특히 할인 쿠폰도 체크해두면 좋다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (10, '알뜰 여행 노하우', '비수기 항공권, 게스트하우스 이용, 현지 시장에서 식사하기 등 경비를 줄일 수 있는 방법을 정리해봤다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (86, '베이킹 실패담', '빵을 만들다 너무 바싹 구워버렸다. 그래도 다음엔 더 잘할 수 있을 거라고 믿는다!', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (73, '직장인 점심 추천 메뉴', '가볍게 먹으면서 포만감을 느낄 수 있는 샐러드+계란 조합. 주머니 사정도 아끼고 건강도 챙길 수 있다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (47, 'DIY 인테리어 소품', '유리병에 조명을 달아서 무드등으로 만들어봤다. 은은한 불빛이 방 분위기를 한층 아늑하게 만들어준다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (94, '작심삼일 극복 일지', '목표를 세웠다면 SNS에 공유하거나 친구에게 말해두면 좀 더 책임감이 생겨서 꾸준히 유지하기 좋다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (17, '자격증 공부 시작', '올해 안에 새 자격증 하나 따고 싶어서 교재랑 온라인 강의 결제했다. 열심히 해봐야겠다!', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (92, '게임 추천과 후기', '최근에 해본 인디 게임 중 그래픽이 아기자기하고 스토리가 좋은 게임이 있었다. 힐링이 필요한 분들께 추천!', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (74, '혼술 안주 만들기', '맥주 한 캔과 잘 어울리는 프라이드 포테이토를 만들었다. 에어프라이어로 조리하니 기름기도 적고 간단해서 만족!', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (10, '버려야 할 습관', '‘나중에 할게’라는 말을 습관처럼 내뱉는 내 모습. 이 습관을 고치기 위해 오늘 해야 할 일은 오늘 처리하기 시작!', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (51, '운동 기록 앱 리뷰', '러닝, 걷기, 자전거 등 각 운동 별로 칼로리 소모와 거리를 자동 측정해주는 앱을 써보니 동기부여에 도움이 된다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (93, '회사원 브이로그 시작', '일상 출근, 퇴근 후 취미 생활 등을 영상으로 찍어보니 새로운 경험이다. 편집 과정이 조금 어렵지만 재미있다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (45, '소소한 시 쓰기', '짧은 시를 쓰면서 내 감정을 정리해본다. 꼭 대단한 표현이 아니어도 마음을 비우는 데 효과적이다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (37, '마라톤 완주 목표', '5km 마라톤 대회에 참가하려고 준비 중이다. 처음이라 긴장되지만, 목표가 생기니 운동이 더 즐거워졌다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (1, '무료 폰트 공유', '예쁜 한글 폰트를 찾아서 소개해본다. 개인 작업물에 활용하기 좋아서 유용하게 쓰고 있다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (51, '편지 쓰기의 장점', '이메일과 메시지에 익숙해졌지만, 손편지로 마음을 표현하면 더 정성이 느껴진다. 가끔씩 써보는 것도 좋다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (87, '스트레스 해소법', '반신욕을 하면서 좋아하는 음악을 들으면 일주일의 피로가 풀린다. 자신만의 해소법을 찾아보자.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (13, '새로운 언어 배우기', '스페인어에 도전 중이다. 발음이 매력적이고 라틴 음악이 좋아서 더욱 열심히 하고 있다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (51, '소중한 추억 정리', '오래된 사진을 스캔하고 앨범을 만들었다. 떠오르는 기억이 많아 시간 가는 줄 몰랐다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (19, '워라밸 유지하기', '일과 삶의 균형을 지키기 위해 저녁 시간을 활용해 운동도 하고, 취미 생활에도 투자하려 한다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (96, '꿀피부 만들기 루틴', '세안 후 토너-에센스-수분크림 단계를 지키고, 주 1회 팩을 해주니 확실히 피부가 좋아졌다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (100, '필라테스 입문기', '처음엔 동작이 쉽지 않았지만, 자세가 교정되면서 몸이 가벼워지는 걸 느낀다. 꾸준히 다녀볼 예정!', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (30, '평소 듣는 팟캐스트', '뉴스 요약, 경제 트렌드, 인터뷰 등 다양한 콘텐츠를 들을 수 있어서 출퇴근길에 즐겨 듣는다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (17, '문화생활 추천', '영화, 공연, 연극, 전시 등 한 달에 한 번이라도 다녀오면 삶이 풍요로워지는 느낌!', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (39, '사진 잘 찍는 법', '사진 구도를 정할 때 3분할 구도를 사용하면 좀 더 안정감 있어 보인다. 배경과 피사체의 비율도 고려하자.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (32, '성공적인 면접 팁', '회사에 대한 기본 정보 숙지, 예상 질문 연습, 자기소개 간결하게 준비 등 기본만 잘 지켜도 성공 확률이 오른다.', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle (user_id, title, content, created_at, like_count) VALUES (79, '올해 목표 회고', '벌써 연말이 가까워졌다. 올해 초 세웠던 목표를 얼마나 달성했는지 점검해보고, 내년에 할 일을 계획해야겠다.
', CURRENT_TIMESTAMP, 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (26, 86, NULL, '적절한 예시 덕분에 개념이 명확해졌습니다.', '2025-02-12 22:38:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (100, 39, NULL, '이해 안 가던 부분이 확 트였어요!', '2025-02-10 15:52:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (56, 38, 2, '다음 편도 빨리 보고 싶어요.', '2025-01-25 13:56:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (21, 96, 3, '글이 길지 않아서 시간 절약이 됐어요!', '2025-01-30 20:50:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (61, 23, NULL, '전혀 몰랐던 부분을 알게 됐습니다.', '2025-02-14 15:43:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (81, 28, 1, '한 번에 이해하게 해주셔서 감사합니다.', '2025-02-20 02:10:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (32, 40, NULL, '전혀 몰랐던 부분을 알게 됐습니다.', '2025-02-19 05:15:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (11, 66, NULL, '요약본 있으면 더 편할 것 같아요!', '2025-02-16 04:17:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (45, 75, NULL, '좋은 하루 되세요~', '2025-02-16 04:23:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (32, 85, 5, '적절한 예시 덕분에 개념이 명확해졌습니다.', '2025-02-16 08:21:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (63, 44, NULL, '완전 꿀팁... 꼭 공유해야겠어요!', '2025-01-29 06:59:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (41, 43, 4, '댓글을 안 달 수가 없네요! 최고입니다.', '2025-02-08 21:26:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (1, 7, 10, '짧지만 임팩트 있는 글이네요!', '2025-02-11 02:37:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (64, 63, 10, '참고할 만한 자료가 많아서 좋습니다.', '2025-01-21 01:37:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (97, 82, NULL, '바쁜 와중에 올려주셔서 감사합니다!', '2025-02-14 05:01:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (70, 82, 6, '좋은 자료 공유 감사해요. 많이 배웠습니다.', '2025-02-13 20:08:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (24, 95, 12, '우와, 정말 좋은 정보네요!', '2025-02-13 07:38:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (56, 15, 12, '덕분에 새롭게 알게 된 부분이 많아요.', '2025-01-21 23:03:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (57, 49, 1, '베스트 글로 뽑아도 손색이 없겠어요.', '2025-01-29 01:24:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (2, 25, NULL, '노하우를 공유해주셔서 감사합니다.', '2025-02-14 21:40:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (64, 13, 11, '내용이 풍부해서 읽는 재미가 있었어요.', '2025-02-06 06:47:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (47, 41, 9, '댓글을 안 달 수가 없네요! 최고입니다.', '2025-02-06 06:36:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (29, 53, 14, '번거로우셨을 텐데 이렇게 공유해주셔서 감사해요.', '2025-01-22 09:28:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (67, 6, NULL, '열심히 정리해주신 흔적이 보여서 감사해요.', '2025-02-04 08:02:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (26, 77, NULL, '덕분에 스킬이 한 단계 업그레이드된 느낌입니다!', '2025-01-27 15:22:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (44, 85, 11, '이해하기 쉽게 설명해주셔서 감사합니다.', '2025-01-29 17:00:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (89, 88, 13, '추가로 궁금한 점이 생기면 또 물어볼게요!', '2025-02-09 19:12:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (64, 5, 27, '참고문헌도 함께 안내해주시면 더 좋을 것 같아요.', '2025-02-07 06:46:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (70, 59, 5, '정말 자세한 설명이네요! 감사합니다.', '2025-01-25 16:33:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (92, 77, NULL, '다음에도 또 참고하겠습니다.', '2025-02-06 15:15:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (37, 30, 26, '덕분에 새롭게 알게 된 부분이 많아요.', '2025-02-14 05:52:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (46, 69, 26, '노하우를 공유해주셔서 감사합니다.', '2025-01-29 10:25:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (25, 69, 13, '관련해서 더 자세한 후기 기대해도 될까요?', '2025-02-13 15:11:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (18, 66, 19, '꼭 필요한 내용이었는데 정말 감사합니다.', '2025-01-20 19:39:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (47, 22, 9, '초보자도 쉽게 따라할 수 있을 것 같아요.', '2025-01-29 17:15:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (85, 36, 15, '나중에 다시 찾아와서 보려고 즐겨찾기 했습니다.', '2025-01-29 19:15:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (91, 96, 28, '덕분에 궁금증이 풀렸어요!', '2025-01-27 07:41:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (99, 7, 4, '시간이 지날수록 더 유용해지는 글이에요.', '2025-02-03 03:37:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (85, 25, 22, '우와, 정말 좋은 정보네요!', '2025-02-07 00:46:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (15, 50, 25, '바쁜 와중에 올려주셔서 감사합니다!', '2025-02-09 16:35:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (48, 47, 26, '구체적인 예시가 많아서 실용적이네요.', '2025-01-21 12:45:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (53, 96, 3, '친구에게도 이 글 꼭 추천해야겠어요!', '2025-02-08 14:14:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (26, 73, 8, '궁금했던 부분이 해결되었습니다.', '2025-01-24 00:30:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (91, 47, 1, '베스트 글로 뽑아도 손색이 없겠어요.', '2025-02-13 10:59:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (6, 10, 4, '정말 큰 도움이 되었어요, 감사합니다!', '2025-02-02 11:51:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (70, 8, 2, '잘 읽고 갑니다. 수고하세요!', '2025-01-27 05:47:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (53, 82, 18, '궁금했던 부분이 해결되었습니다.', '2025-01-27 10:38:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (78, 77, 35, '적절한 예시 덕분에 개념이 명확해졌습니다.', '2025-01-29 16:24:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (79, 87, 11, '이해하기 쉽게 설명해주셔서 감사합니다.', '2025-01-27 16:47:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (90, 77, 20, '궁금했던 부분을 명쾌하게 알게 됐습니다.', '2025-02-12 14:35:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (91, 73, 15, '덕분에 문제 없이 진행할 수 있었어요.', '2025-01-31 09:51:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (46, 74, 18, '실제 사례를 보니 믿음이 가네요.', '2025-02-08 11:09:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (41, 94, 6, '추가로 궁금한 점이 생기면 또 물어볼게요!', '2025-02-08 15:53:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (67, 39, 48, '필요했던 자료인데 큰 도움이 되었어요.', '2025-01-22 22:21:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (18, 47, NULL, '적절한 예시 덕분에 개념이 명확해졌습니다.', '2025-02-13 07:06:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (85, 11, 53, '이 정보를 조금 더 자세히 알고 싶어요!', '2025-01-30 14:03:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (45, 69, 52, '어렵게만 느껴졌는데 이렇게 보니 간단하네요.', '2025-01-23 13:36:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (94, 14, 54, '따라하면서 해보니 정말 간단했어요!', '2025-02-04 06:04:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (5, 29, NULL, '정리가 체계적이라 보기 좋습니다.', '2025-02-11 04:17:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (71, 70, 48, '바쁜 와중에 올려주셔서 감사합니다!', '2025-02-20 09:19:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (87, 43, 3, '이런 정보가 필요했는데 너무 반갑습니다.', '2025-01-31 10:19:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (79, 97, 39, '이런 글이 많아졌으면 좋겠어요.', '2025-02-03 00:06:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (25, 6, 52, '완전 꿀팁... 꼭 공유해야겠어요!', '2025-02-06 16:56:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (54, 15, 54, '이 글 하나로 궁금증이 싹 해결됐어요.', '2025-02-16 14:43:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (69, 95, 31, '핵심을 짚어주셔서 쉽게 이해가 됐어요.', '2025-01-24 02:21:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (63, 1, NULL, '다음 글도 기대하겠습니다!', '2025-02-08 19:04:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (29, 2, 43, '너무 자세해서 오히려 힘들 줄 알았는데 딱 좋아요.', '2025-01-22 04:47:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (61, 59, NULL, '도움이 많이 되었습니다. 고마워요!', '2025-01-28 10:44:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (59, 52, 3, '이런 정보가 필요했는데 너무 반갑습니다.', '2025-02-18 10:09:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (94, 66, NULL, '다음 편도 빨리 보고 싶어요.', '2025-02-08 23:11:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (7, 61, 3, '재미있게 읽었습니다. 감사합니다!', '2025-02-14 06:45:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (44, 94, 27, '읽으면서 감탄이 절로 나왔습니다.', '2025-01-31 18:47:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (30, 36, 11, '사소한 팁까지 놓치지 않으셔서 대단해요.', '2025-02-13 15:43:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (42, 41, 55, '따라하면서 해보니 정말 간단했어요!', '2025-01-28 20:55:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (18, 80, NULL, '관련 키워드가 더 있으면 알려주세요!', '2025-02-15 13:40:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (50, 93, 52, '도움이 많이 되었습니다. 고마워요!', '2025-02-12 11:11:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (75, 64, 41, '늘 좋은 정보 공유해주셔서 감사합니다.', '2025-02-13 15:14:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (96, 18, 65, '이 글 하나로 궁금증이 싹 해결됐어요.', '2025-01-21 05:54:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (87, 66, 39, '너무 자세해서 오히려 힘들 줄 알았는데 딱 좋아요.', '2025-02-02 00:55:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (8, 100, 65, '나중에 다시 찾아와서 보려고 즐겨찾기 했습니다.', '2025-02-12 04:39:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (76, 89, 46, '이 정보를 조금 더 자세히 알고 싶어요!', '2025-02-15 20:04:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (75, 35, 37, '덕분에 새롭게 알게 된 부분이 많아요.', '2025-02-02 20:43:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (10, 36, 62, '좋은 하루 되세요~', '2025-01-22 23:43:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (99, 15, 68, '요약본 있으면 더 편할 것 같아요!', '2025-01-26 10:48:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (52, 99, 27, '추가로 궁금한 점이 생기면 또 물어볼게요!', '2025-01-28 17:26:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (82, 79, 1, '어렵게만 느껴졌는데 이렇게 보니 간단하네요.', '2025-01-22 07:39:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (17, 16, NULL, '한 번에 이해하게 해주셔서 감사합니다.', '2025-02-10 23:23:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (48, 66, 83, '좋은 자료 공유 감사해요. 많이 배웠습니다.', '2025-02-09 04:06:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (11, 86, 56, '읽고 나니 뿌듯한 기분이 드네요.', '2025-02-17 12:18:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (26, 68, 62, '번거로우셨을 텐데 이렇게 공유해주셔서 감사해요.', '2025-01-24 20:28:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (83, 70, 17, '너무 좋은 팁이네요, 바로 써먹을게요.', '2025-02-14 18:00:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (62, 18, 52, '아직은 조금 어렵지만 더 공부해볼게요.', '2025-02-08 02:18:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (73, 93, 1, '좋은 자료 공유해주셔서 감사합니다.', '2025-02-13 02:16:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (28, 83, 90, '다음에도 또 참고하겠습니다.', '2025-02-15 07:27:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (100, 4, NULL, '쉽고 간단해서 이해하기 편했어요.', '2025-02-12 04:20:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (41, 24, 47, '여기서 항상 좋은 정보를 얻어가네요.', '2025-02-09 04:24:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (8, 89, 93, '덕분에 스킬이 한 단계 업그레이드된 느낌입니다!', '2025-02-09 16:30:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (15, 62, 65, '요약본 있으면 더 편할 것 같아요!', '2025-02-11 08:39:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (22, 90, 11, '친구에게도 이 글 꼭 추천해야겠어요!', '2025-02-04 03:13:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (13, 77, 29, '댓글을 안 달 수가 없네요! 최고입니다.', '2025-02-19 17:38:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (73, 7, NULL, '위 내용대로 했더니 너무 잘 됐어요!', '2025-02-14 13:53:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (28, 78, 56, '덕분에 스킬이 한 단계 업그레이드된 느낌입니다!', '2025-02-10 12:30:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (92, 67, NULL, '번거로우셨을 텐데 이렇게 공유해주셔서 감사해요.', '2025-01-23 21:01:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (3, 40, 6, '참고할 만한 자료가 많아서 좋습니다.', '2025-01-28 16:19:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (13, 70, 63, '도움이 많이 되었습니다. 고마워요!', '2025-02-15 07:56:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (42, 51, 52, '정말 유익한 내용이네요!', '2025-02-09 23:29:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (36, 24, NULL, '도움되는 글 잘 봤습니다. 감사합니다.', '2025-02-06 07:42:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (59, 42, 101, '따라하면서 해보니 정말 간단했어요!', '2025-02-18 19:45:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (16, 29, 55, '친구에게도 이 글 꼭 추천해야겠어요!', '2025-02-14 10:22:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (38, 92, 39, '읽고 나니 뿌듯한 기분이 드네요.', '2025-02-06 05:06:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (2, 42, NULL, '어렵게만 느껴졌는데 이렇게 보니 간단하네요.', '2025-02-02 19:55:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (83, 56, 79, '정성스러운 포스팅 감사드립니다.', '2025-02-16 08:29:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (32, 3, 40, '쉽고 간단해서 이해하기 편했어요.', '2025-01-23 22:45:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (56, 81, 4, '핵심을 짚어주셔서 쉽게 이해가 됐어요.', '2025-01-21 18:12:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (95, 94, 95, '덕분에 스킬이 한 단계 업그레이드된 느낌입니다!', '2025-02-08 12:36:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (78, 15, 93, '노하우를 공유해주셔서 감사합니다.', '2025-02-16 00:07:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (43, 21, 46, '관련 키워드가 더 있으면 알려주세요!', '2025-01-23 07:20:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (77, 6, 69, '덕분에 빠르게 해결했어요!', '2025-02-04 00:48:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (30, 38, 31, '좋은 정보 얻고 갑니다!', '2025-02-19 02:50:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (22, 89, 39, '처음 접했는데도 친숙하게 느껴지네요.', '2025-02-13 00:59:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (19, 72, 87, '다음 편도 빨리 보고 싶어요.', '2025-01-21 14:57:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (74, 83, 85, '어렵게만 느껴졌는데 이렇게 보니 간단하네요.', '2025-01-29 15:27:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (29, 19, 29, '필요했던 자료인데 큰 도움이 되었어요.', '2025-01-27 17:14:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (14, 9, 116, '정말 큰 도움이 되었어요, 감사합니다!', '2025-01-21 23:45:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (61, 18, 21, '글이 늘 알차서 찾아오게 됩니다.', '2025-01-22 19:30:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (86, 9, 11, '이 정보를 조금 더 자세히 알고 싶어요!', '2025-02-15 07:45:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (67, 35, 93, '제가 찾았던 바로 그 내용이에요. 감사합니다!', '2025-02-14 22:12:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (5, 69, 100, '이렇게 정리해주셔서 너무 편해요.', '2025-02-12 17:34:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (100, 48, 125, '질문 있으시면 언제든지 댓글 달아주세요!', '2025-02-14 14:09:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (23, 76, 9, '관련 키워드가 더 있으면 알려주세요!', '2025-01-23 06:47:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (73, 45, 75, '베스트 글로 뽑아도 손색이 없겠어요.', '2025-02-16 05:31:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (17, 23, 74, '핵심을 짚어주셔서 쉽게 이해가 됐어요.', '2025-02-12 20:45:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (38, 20, 45, '핵심을 짚어주셔서 쉽게 이해가 됐어요.', '2025-02-07 06:07:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (29, 87, 126, '좋은 자료 공유해주셔서 감사합니다.', '2025-01-23 13:18:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (92, 78, 20, '이해 안 가던 부분이 확 트였어요!', '2025-01-28 12:27:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (14, 70, 51, '늘 좋은 정보 공유해주셔서 감사합니다.', '2025-02-18 00:42:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (47, 91, 45, '정리가 체계적이라 보기 좋습니다.', '2025-02-02 18:08:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (17, 15, 135, '다음 글도 기대하겠습니다!', '2025-02-02 13:09:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (13, 26, 70, '필요했던 자료인데 큰 도움이 되었어요.', '2025-02-13 13:12:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (3, 19, 62, '글 보느라 시간 가는 줄 몰랐어요.', '2025-02-13 05:43:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (31, 33, NULL, '살짝 더 구체적인 예시가 있었으면 좋겠어요.', '2025-01-28 13:33:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (7, 39, 110, '추가로 궁금한 점이 생기면 또 물어볼게요!', '2025-01-22 21:27:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (31, 71, 141, '살짝 더 구체적인 예시가 있었으면 좋겠어요.', '2025-01-31 17:46:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (58, 90, 57, '사소한 팁까지 놓치지 않으셔서 대단해요.', '2025-02-03 04:13:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (83, 7, 78, '짧지만 임팩트 있는 글이네요!', '2025-02-17 12:05:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (87, 84, 144, '너무 자세해서 오히려 힘들 줄 알았는데 딱 좋아요.', '2025-02-07 03:30:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (31, 58, 38, '궁금한 내용을 한 번에 해결해주셔서 고마워요.', '2025-02-02 16:13:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (67, 77, NULL, '이런 정보가 필요했는데 너무 반갑습니다.', '2025-02-19 02:41:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (78, 51, 64, '친구에게도 이 글 꼭 추천해야겠어요!', '2025-02-18 01:50:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (73, 15, 146, '정리가 체계적이라 보기 좋습니다.', '2025-02-02 10:59:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (7, 59, 77, '제가 찾았던 바로 그 내용이에요. 감사합니다!', '2025-02-11 03:43:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (8, 45, NULL, '위 내용대로 했더니 너무 잘 됐어요!', '2025-01-31 06:22:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (10, 58, 50, '차근차근 따라하면 될 것 같아요.', '2025-01-27 12:31:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (44, 9, 79, '다음 편도 빨리 보고 싶어요.', '2025-02-20 17:09:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (68, 50, 114, '다음에도 또 참고하겠습니다.', '2025-01-21 19:33:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (62, 100, NULL, '너무 자세해서 오히려 힘들 줄 알았는데 딱 좋아요.', '2025-02-19 05:34:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (21, 55, NULL, '너무 자세해서 오히려 힘들 줄 알았는데 딱 좋아요.', '2025-01-22 14:52:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (3, 79, 115, '살짝 더 구체적인 예시가 있었으면 좋겠어요.', '2025-02-15 12:17:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (5, 98, 80, '질문 있으시면 언제든지 댓글 달아주세요!', '2025-02-06 01:33:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (50, 39, 112, '나중에 다시 찾아와서 보려고 즐겨찾기 했습니다.', '2025-02-15 19:38:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (22, 81, NULL, '좋은 자료 공유해주셔서 감사합니다.', '2025-02-10 12:57:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (41, 68, NULL, '관련 키워드가 더 있으면 알려주세요!', '2025-02-09 10:46:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (22, 26, 134, '적절한 예시 덕분에 개념이 명확해졌습니다.', '2025-02-18 07:24:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (73, 70, NULL, '늘 좋은 정보 공유해주셔서 감사합니다.', '2025-01-31 10:42:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (41, 3, NULL, '좋은 글 잘 보고 갑니다.', '2025-01-28 17:07:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (90, 65, 129, '이렇게 봐도 모르겠었는데, 이제 좀 알겠어요!', '2025-02-16 02:52:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (39, 42, 65, '덕분에 궁금증이 풀렸어요!', '2025-02-03 20:39:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (1, 56, 80, '계속해서 좋은 글 작성해주시면 감사하겠습니다.', '2025-02-19 21:59:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (25, 98, 75, '관련 키워드가 더 있으면 알려주세요!', '2025-01-29 03:41:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (13, 95, 123, '완전 꿀팁... 꼭 공유해야겠어요!', '2025-02-19 23:12:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (8, 85, 120, '신박한 아이디어네요. 꼭 해봐야겠어요.', '2025-01-23 08:48:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (51, 99, 109, '질문이 있는데 혹시 답변해주실 수 있을까요?', '2025-01-30 10:13:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (68, 100, 86, '번거로우셨을 텐데 이렇게 공유해주셔서 감사해요.', '2025-01-30 13:03:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (11, 27, 28, '댓글을 안 달 수가 없네요! 최고입니다.', '2025-02-06 10:59:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (3, 67, NULL, '사진이나 그림이 있다면 더 좋을 것 같아요!', '2025-02-17 16:00:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (8, 24, 42, '정말 자세한 설명이네요! 감사합니다.', '2025-01-23 16:35:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (24, 87, 25, '내용이 풍부해서 읽는 재미가 있었어요.', '2025-02-07 05:46:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (89, 28, 71, '완전 꿀팁... 꼭 공유해야겠어요!', '2025-01-21 23:42:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (48, 33, 67, '나중에 다시 찾아와서 보려고 즐겨찾기 했습니다.', '2025-01-28 05:31:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (50, 22, 14, '이런 정보가 필요했는데 너무 반갑습니다.', '2025-02-19 12:05:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (52, 87, 162, '이해 안 가던 부분이 확 트였어요!', '2025-02-03 15:53:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (29, 16, 78, '정말 큰 도움이 되었어요, 감사합니다!', '2025-01-22 13:29:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (37, 37, 88, '이런 글이 많아졌으면 좋겠어요.', '2025-02-01 07:13:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (77, 7, 169, '질문 있으시면 언제든지 댓글 달아주세요!', '2025-02-08 21:37:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (28, 28, 74, '궁금한 내용을 한 번에 해결해주셔서 고마워요.', '2025-02-19 13:09:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (98, 34, 54, '덕분에 새롭게 알게 된 부분이 많아요.', '2025-02-14 06:14:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (98, 77, 185, '좋은 글 잘 보고 갑니다.', '2025-02-08 17:05:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (11, 98, NULL, '잘 읽고 갑니다. 수고하세요!', '2025-01-22 22:55:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (68, 79, 20, '꼭 필요한 내용이었는데 정말 감사합니다.', '2025-02-15 13:02:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (25, 71, NULL, '댓글 보니 다들 도움 많이 받으셨네요.', '2025-02-01 20:52:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (89, 13, 135, '정성스러운 포스팅 감사드립니다.', '2025-02-07 19:35:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (53, 84, NULL, '이 글 하나로 궁금증이 싹 해결됐어요.', '2025-01-27 04:22:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (30, 75, NULL, '신박한 아이디어네요. 꼭 해봐야겠어요.', '2025-02-13 17:02:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (54, 98, 184, '이런 정보가 필요했는데 너무 반갑습니다.', '2025-01-28 20:22:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (54, 62, 93, '확실히 다른 자료보다 자세하고 친절하네요.', '2025-01-21 14:28:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (34, 96, 64, '다음 글도 기대하겠습니다!', '2025-02-10 11:52:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (34, 81, 161, '짧지만 임팩트 있는 글이네요!', '2025-02-09 09:04:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (13, 37, 64, '쉽지 않은 내용을 쉽게 풀어주셨네요.', '2025-02-17 11:07:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (31, 2, 83, '처음 접했는데도 친숙하게 느껴지네요.', '2025-02-18 22:20:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (29, 27, 89, '덕분에 궁금증이 전부 해소되었어요.', '2025-01-25 02:11:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (48, 22, 37, '사소한 팁까지 놓치지 않으셔서 대단해요.', '2025-02-16 08:16:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (20, 19, NULL, '알아두면 유용한 팁이네요, 기억해둘게요.', '2025-02-05 05:25:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (3, 97, 95, '추가로 궁금한 점이 생기면 또 물어볼게요!', '2025-02-17 03:11:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (19, 75, 111, '인터넷 자료 중 최고네요.', '2025-02-05 20:08:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (76, 15, 140, '필요했던 자료인데 큰 도움이 되었어요.', '2025-02-05 15:18:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (50, 92, NULL, '덕분에 빠르게 해결했어요!', '2025-01-31 09:02:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (39, 93, 62, '적절한 예시 덕분에 개념이 명확해졌습니다.', '2025-01-30 17:15:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (63, 52, 168, '너무 자세해서 오히려 힘들 줄 알았는데 딱 좋아요.', '2025-01-27 17:48:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (6, 68, 179, '사진이나 그림이 있다면 더 좋을 것 같아요!', '2025-02-04 16:59:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (97, 39, NULL, '정말 큰 도움이 되었어요, 감사합니다!', '2025-01-27 20:53:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (78, 97, 199, '실제 사례를 보니 믿음이 가네요.', '2025-01-28 03:51:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (43, 35, 185, '좋은 자료 공유 감사해요. 많이 배웠습니다.', '2025-01-25 23:55:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (83, 61, NULL, '이런 글이 많아졌으면 좋겠어요.', '2025-02-01 12:16:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (19, 28, 140, '덕분에 빠르게 해결했어요!', '2025-02-11 19:06:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (29, 87, 53, '좋은 정보 얻고 갑니다!', '2025-02-03 23:07:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (64, 17, 80, '좋은 하루 되세요~', '2025-02-12 00:29:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (45, 42, 155, '제가 찾던 정보가 딱 여기 있네요!', '2025-02-17 07:30:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (62, 71, NULL, '나중에 다시 찾아와서 보려고 즐겨찾기 했습니다.', '2025-02-16 09:29:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (12, 86, 94, '좋은 정보 얻고 갑니다!', '2025-02-04 05:13:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (10, 86, 16, '신박한 아이디어네요. 꼭 해봐야겠어요.', '2025-01-23 22:30:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (19, 34, 23, '질문 있으시면 언제든지 댓글 달아주세요!', '2025-02-04 12:33:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (46, 34, 185, '요약본 있으면 더 편할 것 같아요!', '2025-02-12 14:00:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (78, 61, 222, '앞으로 자주 올 것 같아요. 감사합니다!', '2025-02-02 00:38:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (61, 53, 63, '잘 읽고 갑니다. 수고하세요!', '2025-02-17 14:16:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (41, 74, 195, '바쁜 와중에 올려주셔서 감사합니다!', '2025-02-14 02:42:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (54, 54, 123, '글이 길지 않아서 시간 절약이 됐어요!', '2025-02-04 08:47:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (94, 93, 134, '사소한 팁까지 놓치지 않으셔서 대단해요.', '2025-02-07 00:53:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (35, 42, 192, '처음 접했는데도 친숙하게 느껴지네요.', '2025-01-26 13:16:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (89, 54, 139, '베스트 글로 뽑아도 손색이 없겠어요.', '2025-01-30 11:27:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (51, 19, 193, '인터넷 자료 중 최고네요.', '2025-01-22 20:46:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (65, 9, 45, '어렵게만 느껴졌는데 이렇게 보니 간단하네요.', '2025-02-09 09:03:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (87, 31, 204, '덕분에 스킬이 한 단계 업그레이드된 느낌입니다!', '2025-01-21 15:14:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (49, 78, 56, '위 내용대로 했더니 너무 잘 됐어요!', '2025-01-28 03:15:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (43, 43, NULL, '전혀 몰랐던 부분을 알게 됐습니다.', '2025-02-15 12:33:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (54, 90, 142, '베스트 글로 뽑아도 손색이 없겠어요.', '2025-01-22 17:18:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (64, 21, 24, '다음 글도 기대하겠습니다!', '2025-01-21 04:07:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (80, 5, 183, '요약본 있으면 더 편할 것 같아요!', '2025-01-22 18:51:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (41, 76, 69, '제가 찾던 정보가 딱 여기 있네요!', '2025-02-19 17:20:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (87, 34, 94, '관련 키워드가 더 있으면 알려주세요!', '2025-01-23 11:53:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (48, 14, 148, '시간이 지날수록 더 유용해지는 글이에요.', '2025-01-31 07:13:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (83, 19, 134, '바쁜 와중에 올려주셔서 감사합니다!', '2025-02-15 09:54:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (30, 32, NULL, '처음 접했는데도 친숙하게 느껴지네요.', '2025-02-05 23:12:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (42, 22, 29, '쉽고 간단해서 이해하기 편했어요.', '2025-01-28 09:35:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (68, 58, 91, '너무 자세해서 오히려 힘들 줄 알았는데 딱 좋아요.', '2025-02-03 08:05:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (8, 24, 194, '초보자도 쉽게 따라할 수 있을 것 같아요.', '2025-02-10 16:42:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (25, 70, 213, '읽으면서 감탄이 절로 나왔습니다.', '2025-02-12 23:55:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (82, 18, NULL, '읽고 나니 뿌듯한 기분이 드네요.', '2025-01-31 03:45:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (70, 14, 4, '바쁜 와중에 올려주셔서 감사합니다!', '2025-02-14 04:22:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (34, 74, 78, '핵심을 짚어주셔서 쉽게 이해가 됐어요.', '2025-02-18 08:20:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (17, 41, 150, '예시 덕분에 훨씬 쉽게 이해했어요.', '2025-02-03 10:29:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (76, 74, 108, '저도 주변 사람들에게 추천해야겠어요.', '2025-02-07 12:56:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (17, 52, 30, '글이 늘 알차서 찾아오게 됩니다.', '2025-01-21 16:51:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (18, 3, 193, '우와, 정말 좋은 정보네요!', '2025-01-31 16:11:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (22, 68, 174, '정성스러운 포스팅 감사드립니다.', '2025-02-19 04:26:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (45, 39, 144, '짧지만 임팩트 있는 글이네요!', '2025-01-25 23:13:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (18, 64, 177, '정말 유익한 내용이네요!', '2025-02-03 13:55:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (2, 20, 244, '읽으면서 감탄이 절로 나왔습니다.', '2025-01-30 08:05:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (31, 77, 65, '글이 길지 않아서 시간 절약이 됐어요!', '2025-01-21 10:12:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (35, 7, 245, '친구에게도 이 글 꼭 추천해야겠어요!', '2025-01-23 03:51:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (17, 40, 29, '저도 주변 사람들에게 추천해야겠어요.', '2025-02-12 07:20:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (21, 67, NULL, '추가로 궁금한 점이 생기면 또 물어볼게요!', '2025-01-27 01:09:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (74, 64, NULL, '추가로 궁금한 점이 생기면 또 물어볼게요!', '2025-02-12 20:51:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (28, 52, 172, '글이 길지 않아서 시간 절약이 됐어요!', '2025-02-19 16:10:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (12, 20, NULL, '좋은 하루 되세요~', '2025-02-04 07:30:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (27, 59, 233, '정말 큰 도움이 되었어요, 감사합니다!', '2025-01-28 08:47:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (59, 67, 81, '정말 유익한 내용이네요!', '2025-01-25 06:58:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (21, 35, 210, '한 번에 이해하게 해주셔서 감사합니다.', '2025-01-21 22:13:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (66, 12, 212, '덕분에 스킬이 한 단계 업그레이드된 느낌입니다!', '2025-02-08 17:03:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (77, 70, 224, '이해하기 쉽게 설명해주셔서 감사합니다.', '2025-02-06 22:59:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (57, 91, 102, '쉽지 않은 내용을 쉽게 풀어주셨네요.', '2025-02-04 20:16:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (44, 47, 91, '필요했던 자료인데 큰 도움이 되었어요.', '2025-01-22 10:01:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (83, 96, 43, '위 내용대로 했더니 너무 잘 됐어요!', '2025-02-09 09:10:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (56, 44, 272, '아직은 조금 어렵지만 더 공부해볼게요.', '2025-02-07 20:23:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (44, 23, 201, '짧지만 임팩트 있는 글이네요!', '2025-02-02 06:11:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (75, 7, 206, '이 정보를 조금 더 자세히 알고 싶어요!', '2025-01-31 19:11:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (81, 24, 66, '나중에 다시 찾아와서 보려고 즐겨찾기 했습니다.', '2025-02-15 23:35:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (99, 9, 44, '너무 좋은 팁이네요, 바로 써먹을게요.', '2025-02-06 07:51:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (83, 42, 150, '덕분에 문제 없이 진행할 수 있었어요.', '2025-01-26 13:22:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (34, 13, NULL, '내용이 깔끔하게 정리되어 있어서 좋네요.', '2025-02-02 01:04:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (56, 98, 168, '읽으면서 감탄이 절로 나왔습니다.', '2025-02-10 20:46:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (15, 23, NULL, '짧지만 임팩트 있는 글이네요!', '2025-01-25 12:24:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (8, 56, 162, '질문이 있는데 혹시 답변해주실 수 있을까요?', '2025-01-22 20:03:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (52, 54, 249, '질문이 있는데 혹시 답변해주실 수 있을까요?', '2025-02-06 23:55:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (90, 9, 189, '읽고 나니 뿌듯한 기분이 드네요.', '2025-01-21 08:43:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (95, 20, 228, '좋은 글 잘 보고 갑니다.', '2025-02-06 19:08:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (29, 13, 40, '정성스러운 포스팅 감사드립니다.', '2025-02-09 18:08:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (2, 36, 20, '쉽고 간단해서 이해하기 편했어요.', '2025-01-26 09:17:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (51, 95, 76, '시간이 없었는데 요약이 정말 도움이 되네요.', '2025-02-11 09:28:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (5, 53, NULL, '사소한 팁까지 놓치지 않으셔서 대단해요.', '2025-02-02 11:44:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (66, 77, 109, '이런 정보가 필요했는데 너무 반갑습니다.', '2025-01-25 08:11:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (31, 76, 257, '글 보느라 시간 가는 줄 몰랐어요.', '2025-01-23 15:38:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (73, 3, 252, '정말 자세한 설명이네요! 감사합니다.', '2025-02-10 20:19:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (1, 57, 33, '관련 키워드가 더 있으면 알려주세요!', '2025-02-10 00:47:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (43, 86, NULL, '계속 업데이트해주시면 좋겠어요.', '2025-01-22 00:48:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (45, 86, 94, '번거로우셨을 텐데 이렇게 공유해주셔서 감사해요.', '2025-02-20 05:32:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (24, 90, 132, '차근차근 따라하면 될 것 같아요.', '2025-02-09 21:09:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (82, 44, 281, '한 번에 이해하게 해주셔서 감사합니다.', '2025-02-13 00:03:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (17, 2, 45, '쉽지 않은 내용을 쉽게 풀어주셨네요.', '2025-02-18 04:12:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (35, 2, 150, '좋은 정보 얻고 갑니다!', '2025-02-10 05:14:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (94, 90, 260, '베스트 글로 뽑아도 손색이 없겠어요.', '2025-02-18 06:07:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (91, 94, 213, '덕분에 문제 없이 진행할 수 있었어요.', '2025-02-18 12:08:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (2, 74, 291, '읽으면서 감탄이 절로 나왔습니다.', '2025-01-26 22:07:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (10, 29, 190, '시간이 없었는데 요약이 정말 도움이 되네요.', '2025-01-27 00:52:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (24, 54, NULL, '이 정보를 조금 더 자세히 알고 싶어요!', '2025-01-24 06:52:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (94, 95, 264, '전혀 몰랐던 부분을 알게 됐습니다.', '2025-01-24 16:41:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (4, 18, 254, '쉽고 간단해서 이해하기 편했어요.', '2025-01-26 19:17:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (58, 54, 304, '시간이 없었는데 요약이 정말 도움이 되네요.', '2025-02-19 14:39:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (56, 23, 63, '살짝 더 구체적인 예시가 있었으면 좋겠어요.', '2025-01-28 04:17:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (24, 51, NULL, '설명이 너무 친절하네요. 최고예요!', '2025-02-10 09:22:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (98, 49, 105, '정말 큰 도움이 되었어요, 감사합니다!', '2025-02-02 00:42:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (22, 31, 171, '쉽지 않은 내용을 쉽게 풀어주셨네요.', '2025-02-01 02:22:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (49, 48, 30, '시간이 지날수록 더 유용해지는 글이에요.', '2025-02-01 09:49:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (56, 14, 51, '글 보느라 시간 가는 줄 몰랐어요.', '2025-01-28 18:08:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (56, 15, 73, '쉽지 않은 내용을 쉽게 풀어주셨네요.', '2025-02-17 19:06:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (76, 12, 64, '실제 사례를 보니 믿음이 가네요.', '2025-02-02 16:23:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (89, 9, 313, '계속 업데이트해주시면 좋겠어요.', '2025-02-17 00:28:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (79, 91, 12, '좋은 정보 얻고 갑니다!', '2025-01-22 13:07:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (73, 38, 312, '글 보느라 시간 가는 줄 몰랐어요.', '2025-02-04 08:45:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (39, 51, NULL, '시간이 지날수록 더 유용해지는 글이에요.', '2025-02-04 09:40:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (54, 19, 191, '좋은 정보 얻고 갑니다!', '2025-01-28 09:59:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (65, 83, NULL, '살짝 더 구체적인 예시가 있었으면 좋겠어요.', '2025-02-04 13:45:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (48, 78, 267, '궁금했던 부분이 해결되었습니다.', '2025-02-01 09:14:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (42, 30, 15, '노하우를 공유해주셔서 감사합니다.', '2025-02-12 06:51:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (47, 86, 81, '짧지만 임팩트 있는 글이네요!', '2025-01-24 09:38:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (80, 38, 296, '너무 자세해서 오히려 힘들 줄 알았는데 딱 좋아요.', '2025-02-12 12:27:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (24, 55, 280, '정성스러운 포스팅 감사드립니다.', '2025-02-06 06:35:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (33, 27, 207, '읽으면서 감탄이 절로 나왔습니다.', '2025-01-29 14:19:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (17, 56, 95, '이해하기 쉽게 설명해주셔서 감사합니다.', '2025-02-02 15:09:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (11, 61, NULL, '구체적인 예시가 많아서 실용적이네요.', '2025-01-31 21:38:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (85, 1, 60, '어렵게만 느껴졌는데 이렇게 보니 간단하네요.', '2025-02-09 13:49:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (80, 49, 128, '다음에도 또 참고하겠습니다.', '2025-01-29 10:22:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (51, 1, 108, '다음 편도 빨리 보고 싶어요.', '2025-02-17 22:05:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (71, 6, NULL, '글 보느라 시간 가는 줄 몰랐어요.', '2025-01-21 14:46:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (14, 52, NULL, '다음 편도 빨리 보고 싶어요.', '2025-02-15 18:45:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (90, 17, NULL, '덕분에 궁금증이 풀렸어요!', '2025-02-06 17:58:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (78, 27, NULL, '확실히 다른 자료보다 자세하고 친절하네요.', '2025-02-11 13:34:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (3, 97, 96, '이런 정보가 필요했는데 너무 반갑습니다.', '2025-02-15 08:30:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (8, 22, 20, '제가 찾았던 바로 그 내용이에요. 감사합니다!', '2025-02-19 23:56:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (90, 30, 241, '한 번에 이해하게 해주셔서 감사합니다.', '2025-02-08 21:28:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (20, 74, NULL, '아직은 조금 어렵지만 더 공부해볼게요.', '2025-01-28 09:26:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (76, 23, 165, '덕분에 빠르게 해결했어요!', '2025-01-21 10:06:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (90, 21, 74, '궁금했던 부분을 명쾌하게 알게 됐습니다.', '2025-01-31 15:21:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (97, 91, NULL, '좋은 글 잘 보고 갑니다.', '2025-02-02 04:21:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (11, 7, NULL, '너무 자세해서 오히려 힘들 줄 알았는데 딱 좋아요.', '2025-02-01 00:09:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (28, 98, 137, '베스트 글로 뽑아도 손색이 없겠어요.', '2025-02-10 05:49:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (8, 63, NULL, '다음에도 또 참고하겠습니다.', '2025-02-05 11:05:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (19, 59, 231, '내용이 풍부해서 읽는 재미가 있었어요.', '2025-01-29 02:29:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (87, 85, 167, '덕분에 새롭게 알게 된 부분이 많아요.', '2025-02-18 04:21:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (65, 60, 104, '이 글 하나로 궁금증이 싹 해결됐어요.', '2025-02-05 14:44:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (84, 26, 27, '추가로 궁금한 점이 생기면 또 물어볼게요!', '2025-02-20 11:06:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (39, 34, NULL, '좋은 정보 얻고 갑니다!', '2025-01-30 02:16:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (52, 27, 346, '계속 업데이트해주시면 좋겠어요.', '2025-02-01 18:07:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (71, 53, 290, '설명이 너무 친절하네요. 최고예요!', '2025-02-14 13:24:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (2, 6, 54, '이해하기 쉽게 설명해주셔서 감사합니다.', '2025-02-13 11:00:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (43, 38, NULL, '도움이 많이 되었습니다. 고마워요!', '2025-02-07 09:37:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (74, 21, 186, '계속 업데이트해주시면 좋겠어요.', '2025-01-31 05:21:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (44, 53, 221, '이 글 하나로 궁금증이 싹 해결됐어요.', '2025-02-07 14:04:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (73, 80, 329, '참고문헌도 함께 안내해주시면 더 좋을 것 같아요.', '2025-02-02 18:44:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (81, 15, 323, '계속 업데이트해주시면 좋겠어요.', '2025-02-08 05:04:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (32, 93, 11, '알아두면 유용한 팁이네요, 기억해둘게요.', '2025-02-02 02:43:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (65, 88, 186, '핵심을 짚어주셔서 쉽게 이해가 됐어요.', '2025-02-07 19:44:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (1, 14, NULL, '계속 정주행 중입니다. 다 재밌네요.', '2025-01-31 08:48:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (88, 88, 174, '정말 자세한 설명이네요! 감사합니다.', '2025-02-18 00:34:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (77, 74, 60, '참고할 만한 자료가 많아서 좋습니다.', '2025-01-26 14:46:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (75, 50, NULL, '덕분에 궁금증이 전부 해소되었어요.', '2025-02-06 10:24:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (60, 43, 178, '쉽지 않은 내용을 쉽게 풀어주셨네요.', '2025-02-03 01:27:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (3, 36, 201, '사진이나 그림이 있다면 더 좋을 것 같아요!', '2025-02-13 02:04:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (72, 70, 277, '계속해서 좋은 글 작성해주시면 감사하겠습니다.', '2025-02-10 21:23:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (97, 28, 45, '도움이 많이 되었습니다. 고마워요!', '2025-01-24 04:40:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (28, 78, NULL, '초보자도 쉽게 따라할 수 있을 것 같아요.', '2025-02-09 11:45:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (18, 13, 278, '이런 정보가 필요했는데 너무 반갑습니다.', '2025-02-03 19:50:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (11, 27, 280, '꼭 필요한 내용이었는데 정말 감사합니다.', '2025-02-10 17:18:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (31, 49, 346, '내용이 깔끔하게 정리되어 있어서 좋네요.', '2025-02-06 18:00:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (93, 69, NULL, '좋은 글 잘 보고 갑니다.', '2025-02-09 06:06:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (87, 84, NULL, '계속 업데이트해주시면 좋겠어요.', '2025-02-09 15:23:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (21, 75, 5, '처음 접했는데도 친숙하게 느껴지네요.', '2025-02-16 21:59:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (40, 78, NULL, '적절한 예시 덕분에 개념이 명확해졌습니다.', '2025-02-01 09:15:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (2, 5, 30, '노하우를 공유해주셔서 감사합니다.', '2025-01-30 15:17:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (81, 59, 184, '제가 찾았던 바로 그 내용이에요. 감사합니다!', '2025-02-13 10:44:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (12, 92, 262, '이런 글이 많아졌으면 좋겠어요.', '2025-02-12 21:53:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (11, 52, NULL, '내용이 깔끔하게 정리되어 있어서 좋네요.', '2025-01-31 01:46:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (36, 50, 214, '이런 글이 많아졌으면 좋겠어요.', '2025-02-15 21:56:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (99, 18, 160, '궁금했던 부분을 정확히 짚어주셔서 감사해요.', '2025-01-28 05:20:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (93, 66, 151, '제가 찾았던 바로 그 내용이에요. 감사합니다!', '2025-02-07 18:33:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (71, 44, 273, '예시 덕분에 훨씬 쉽게 이해했어요.', '2025-01-25 23:26:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (64, 60, 117, '글이 길지 않아서 시간 절약이 됐어요!', '2025-01-28 06:28:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (58, 94, 65, '추가로 궁금한 점이 생기면 또 물어볼게요!', '2025-02-15 22:17:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (5, 50, NULL, '참고문헌도 함께 안내해주시면 더 좋을 것 같아요.', '2025-01-29 11:18:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (85, 84, 274, '내용이 풍부해서 읽는 재미가 있었어요.', '2025-02-11 18:51:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (88, 60, 35, '궁금한 내용을 한 번에 해결해주셔서 고마워요.', '2025-01-26 05:05:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (58, 2, 283, '계속 업데이트해주시면 좋겠어요.', '2025-02-08 13:57:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (34, 66, 22, '정말 유익한 내용이네요!', '2025-02-05 06:38:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (1, 23, 4, '이 주제에 대해 더 알고 싶었는데 도움이 됐습니다.', '2025-02-02 13:25:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (60, 10, 91, '노하우를 공유해주셔서 감사합니다.', '2025-01-27 22:04:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (4, 72, 336, '이렇게 정리해주셔서 너무 편해요.', '2025-01-20 22:09:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (76, 39, 130, '제가 찾았던 바로 그 내용이에요. 감사합니다!', '2025-01-23 18:48:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (38, 92, 72, '정성스러운 포스팅 감사드립니다.', '2025-01-31 16:46:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (69, 94, 254, '좋은 정보 얻고 갑니다!', '2025-01-26 21:50:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (21, 24, 309, '설명이 너무 친절하네요. 최고예요!', '2025-02-11 06:53:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (25, 89, 196, '앞으로도 좋은 글 많이 부탁드립니다.', '2025-02-16 22:01:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (28, 92, 182, '질문 있으시면 언제든지 댓글 달아주세요!', '2025-01-23 21:15:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (59, 23, 246, '덕분에 스킬이 한 단계 업그레이드된 느낌입니다!', '2025-02-19 06:19:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (10, 43, 322, '알아두면 유용한 팁이네요, 기억해둘게요.', '2025-02-18 12:34:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (90, 51, NULL, '내용이 풍부해서 읽는 재미가 있었어요.', '2025-01-23 01:08:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (85, 81, NULL, '신박한 아이디어네요. 꼭 해봐야겠어요.', '2025-01-21 10:00:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (24, 40, 399, '앞으로도 좋은 글 많이 부탁드립니다.', '2025-01-24 08:49:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (85, 50, 385, '읽고 나니 뿌듯한 기분이 드네요.', '2025-01-28 19:49:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (51, 80, 406, '나중에 다시 찾아와서 보려고 즐겨찾기 했습니다.', '2025-01-24 05:49:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (66, 18, NULL, '따라하면서 해보니 정말 간단했어요!', '2025-02-13 08:36:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (56, 21, 49, '이 정보를 조금 더 자세히 알고 싶어요!', '2025-02-09 10:56:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (22, 44, 134, '덕분에 새롭게 알게 된 부분이 많아요.', '2025-02-01 11:48:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (17, 53, NULL, '앞으로도 잘 부탁드립니다!', '2025-02-10 02:36:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (55, 42, 255, '정말 유익한 내용이네요!', '2025-02-11 16:09:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (67, 90, 137, '우와, 정말 좋은 정보네요!', '2025-02-02 16:19:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (73, 73, 223, '글이 늘 알차서 찾아오게 됩니다.', '2025-01-25 12:25:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (46, 45, 32, '내용이 풍부해서 읽는 재미가 있었어요.', '2025-01-25 20:24:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (42, 89, 54, '꼭 필요한 내용이었는데 정말 감사합니다.', '2025-02-11 04:24:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (33, 71, NULL, '따라하면서 해보니 정말 간단했어요!', '2025-02-13 21:24:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (2, 15, 97, '살짝 더 구체적인 예시가 있었으면 좋겠어요.', '2025-02-11 19:40:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (37, 87, NULL, '재미있게 읽었습니다. 감사합니다!', '2025-02-06 03:37:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (17, 9, 31, '정말 유익한 내용이네요!', '2025-01-23 03:29:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (20, 94, 322, '글 보느라 시간 가는 줄 몰랐어요.', '2025-02-14 05:14:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (82, 27, 123, '시간이 지날수록 더 유용해지는 글이에요.', '2025-02-17 17:18:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (56, 66, 418, '덕분에 궁금증이 풀렸어요!', '2025-01-23 16:30:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (100, 14, 137, '앞으로 자주 올 것 같아요. 감사합니다!', '2025-02-08 01:58:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (18, 86, 402, '궁금한 내용을 한 번에 해결해주셔서 고마워요.', '2025-02-07 08:24:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (65, 85, 346, '너무 자세해서 오히려 힘들 줄 알았는데 딱 좋아요.', '2025-01-22 03:48:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (66, 24, 109, '읽으면서 감탄이 절로 나왔습니다.', '2025-01-24 08:24:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (25, 94, 4, '신박한 아이디어네요. 꼭 해봐야겠어요.', '2025-02-04 12:54:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (71, 42, 193, '댓글 보니 다들 도움 많이 받으셨네요.', '2025-01-28 06:18:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (31, 8, 68, '앞으로 자주 올 것 같아요. 감사합니다!', '2025-02-19 03:07:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (52, 87, 71, '쉽고 간단해서 이해하기 편했어요.', '2025-02-15 15:47:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (43, 50, 370, '다음 편도 빨리 보고 싶어요.', '2025-02-18 03:09:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (6, 83, 200, '좋은 하루 되세요~', '2025-01-25 10:26:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (13, 32, NULL, '도움이 많이 되었습니다. 고마워요!', '2025-02-11 14:41:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (40, 45, 241, '글이 길지 않아서 시간 절약이 됐어요!', '2025-02-14 18:44:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (69, 86, 51, '늘 좋은 정보 공유해주셔서 감사합니다.', '2025-02-17 19:10:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (86, 8, 252, '차근차근 따라하면 될 것 같아요.', '2025-02-03 01:58:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (81, 88, 16, '알아두면 유용한 팁이네요, 기억해둘게요.', '2025-01-29 06:57:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (47, 66, NULL, '한 번에 이해하게 해주셔서 감사합니다.', '2025-01-28 12:45:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (64, 58, 259, '좋은 글 잘 보고 갑니다.', '2025-01-31 08:48:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (68, 92, 156, '늘 좋은 정보 공유해주셔서 감사합니다.', '2025-02-07 09:27:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (100, 49, 201, '댓글을 안 달 수가 없네요! 최고입니다.', '2025-02-16 08:34:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (26, 94, 248, '정성스러운 포스팅 감사드립니다.', '2025-01-20 20:35:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (18, 97, 73, '추가로 궁금한 점이 생기면 또 물어볼게요!', '2025-02-16 05:30:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (4, 26, 117, '덕분에 궁금증이 풀렸어요!', '2025-02-15 17:45:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (64, 22, 23, '늘 좋은 정보 공유해주셔서 감사합니다.', '2025-01-26 04:37:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (18, 90, 398, '앞으로 자주 올 것 같아요. 감사합니다!', '2025-01-27 03:36:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (67, 63, 414, '설명이 너무 친절하네요. 최고예요!', '2025-01-20 21:02:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (57, 74, 17, '한 번에 이해하게 해주셔서 감사합니다.', '2025-02-10 16:26:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (32, 43, 169, '요약본 있으면 더 편할 것 같아요!', '2025-01-29 23:09:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (97, 53, 283, '필요했던 자료인데 큰 도움이 되었어요.', '2025-02-09 12:52:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (84, 51, 114, '친구에게도 이 글 꼭 추천해야겠어요!', '2025-02-06 00:11:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (16, 59, 305, '읽고 나니 뿌듯한 기분이 드네요.', '2025-01-25 06:14:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (76, 68, 331, '친구에게도 이 글 꼭 추천해야겠어요!', '2025-01-29 02:47:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (56, 31, 82, '아직은 조금 어렵지만 더 공부해볼게요.', '2025-02-09 06:52:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (49, 24, 43, '인터넷 자료 중 최고네요.', '2025-02-14 18:44:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (54, 52, 109, '전혀 몰랐던 부분을 알게 됐습니다.', '2025-01-21 04:22:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (84, 82, 437, '베스트 글로 뽑아도 손색이 없겠어요.', '2025-01-25 22:50:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (71, 89, 108, '좋은 자료 공유 감사해요. 많이 배웠습니다.', '2025-02-14 16:56:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (27, 61, 90, '정리가 체계적이라 보기 좋습니다.', '2025-02-17 16:10:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (64, 99, 23, '이런 정보가 필요했는데 너무 반갑습니다.', '2025-01-30 20:52:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (69, 78, 184, '꼭 필요한 내용이었는데 정말 감사합니다.', '2025-01-24 22:51:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (75, 79, 92, '관련 키워드가 더 있으면 알려주세요!', '2025-02-02 01:26:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (19, 71, NULL, '이해 안 가던 부분이 확 트였어요!', '2025-01-31 17:54:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (71, 35, 20, '여기서 항상 좋은 정보를 얻어가네요.', '2025-01-20 18:39:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (45, 36, 118, '전혀 몰랐던 부분을 알게 됐습니다.', '2025-01-22 20:21:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (65, 73, 19, '읽고 나니 뿌듯한 기분이 드네요.', '2025-02-10 00:04:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (63, 12, 154, '정말 큰 도움이 되었어요, 감사합니다!', '2025-01-23 20:31:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (78, 86, 410, '잘 읽고 갑니다. 수고하세요!', '2025-01-23 17:15:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (16, 89, NULL, '정말 자세한 설명이네요! 감사합니다.', '2025-02-05 18:30:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (68, 41, 209, '열심히 정리해주신 흔적이 보여서 감사해요.', '2025-02-14 00:55:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (33, 50, 231, '바쁜 와중에 올려주셔서 감사합니다!', '2025-02-11 23:48:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (17, 80, NULL, '사진이나 그림이 있다면 더 좋을 것 같아요!', '2025-02-16 21:30:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (27, 73, 304, '덕분에 궁금증이 전부 해소되었어요.', '2025-02-03 19:07:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (12, 61, 221, '쉽고 간단해서 이해하기 편했어요.', '2025-02-05 04:38:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (88, 26, 304, '살짝 더 구체적인 예시가 있었으면 좋겠어요.', '2025-02-11 16:20:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (82, 55, 467, '아직은 조금 어렵지만 더 공부해볼게요.', '2025-01-25 12:41:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (58, 25, 116, '어렵게만 느껴졌는데 이렇게 보니 간단하네요.', '2025-01-31 11:51:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (75, 89, 116, '너무 자세해서 오히려 힘들 줄 알았는데 딱 좋아요.', '2025-01-26 06:41:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (3, 93, 369, '인터넷 자료 중 최고네요.', '2025-02-12 19:49:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (35, 16, 87, '댓글 보니 다들 도움 많이 받으셨네요.', '2025-01-25 13:47:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (28, 79, 211, '참고문헌도 함께 안내해주시면 더 좋을 것 같아요.', '2025-01-24 21:27:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (30, 77, 458, '따라하면서 해보니 정말 간단했어요!', '2025-01-24 17:16:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (97, 35, 449, '저도 주변 사람들에게 추천해야겠어요.', '2025-02-08 11:11:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (96, 4, 26, '읽고 나니 뿌듯한 기분이 드네요.', '2025-02-09 05:25:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (28, 66, 114, '궁금했던 부분을 정확히 짚어주셔서 감사해요.', '2025-01-28 07:14:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (16, 14, 206, '살짝 더 구체적인 예시가 있었으면 좋겠어요.', '2025-01-26 22:59:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (28, 77, 205, '관련 키워드가 더 있으면 알려주세요!', '2025-01-26 11:38:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (100, 85, 47, '쉽고 간단해서 이해하기 편했어요.', '2025-01-26 20:04:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (90, 64, 426, '나중에 다시 찾아와서 보려고 즐겨찾기 했습니다.', '2025-01-22 10:41:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (5, 38, 22, '제가 찾았던 바로 그 내용이에요. 감사합니다!', '2025-01-27 13:28:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (82, 92, 164, '궁금했던 부분을 명쾌하게 알게 됐습니다.', '2025-02-04 23:49:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (85, 37, 195, '덕분에 스킬이 한 단계 업그레이드된 느낌입니다!', '2025-02-02 20:44:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (86, 85, NULL, '설명이 너무 친절하네요. 최고예요!', '2025-01-30 02:10:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (77, 70, 196, '좋은 정보 얻고 갑니다!', '2025-02-15 03:24:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (52, 13, 443, '앞으로도 좋은 글 많이 부탁드립니다.', '2025-01-23 22:53:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (4, 98, 255, '구체적인 예시가 많아서 실용적이네요.', '2025-02-19 23:02:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (32, 41, 180, '제가 찾던 정보가 딱 여기 있네요!', '2025-02-20 04:00:56', 0);
INSERT INTO bottle_comment (bottle_id, user_id, parent_id, content, created_at, is_deleted) VALUES (31, 55, NULL, '참고문헌도 함께 안내해주시면 더 좋을 것 같아요.', '2025-01-30 08:26:56', 0);
INSERT INTO bottle_media (bottle_id, media_url) VALUES (1, 'https://149359637.v2.pressablecdn.com/wp-content/uploads/2021/08/Space-Earth-Wallpaper-About-Murals.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (2, 'https://wallpapers.com/images/featured/disney-has6vy47k75d0bzs.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (3, 'https://wallpapers.com/images/featured/disney-has6vy47k75d0bzs.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (4, 'https://steamuserimages-a.akamaihd.net/ugc/870746400641317388/3D95BB46AA21A29667618762A114B2A6EDE30340/?imw=637&imh=358&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (5, 'https://steamuserimages-a.akamaihd.net/ugc/870746400641317388/3D95BB46AA21A29667618762A114B2A6EDE30340/?imw=637&imh=358&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (6, 'https://steamuserimages-a.akamaihd.net/ugc/940586530515504757/CDDE77CB810474E1C07B945E40AE4713141AFD76/?imw=5000&ih=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (7, 'https://wallpapers.com/images/featured/disney-has6vy47k75d0bzs.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (8, 'https://steamuserimages-a.akamaihd.net/ugc/940586530515504757/CDDE77CB810474E1C07B945E40AE4713141AFD76/?imw=5000&ih=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (9, 'https://149359637.v2.pressablecdn.com/wp-content/uploads/2021/08/Space-Earth-Wallpaper-About-Murals.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (10, 'https://steamuserimages-a.akamaihd.net/ugc/870746400641317388/3D95BB46AA21A29667618762A114B2A6EDE30340/?imw=637&imh=358&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (11, 'https://steamuserimages-a.akamaihd.net/ugc/870746400641317388/3D95BB46AA21A29667618762A114B2A6EDE30340/?imw=637&imh=358&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (12, 'https://149359637.v2.pressablecdn.com/wp-content/uploads/2021/08/Space-Earth-Wallpaper-About-Murals.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (13, 'https://steamuserimages-a.akamaihd.net/ugc/870746400641317388/3D95BB46AA21A29667618762A114B2A6EDE30340/?imw=637&imh=358&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (14, 'https://steamuserimages-a.akamaihd.net/ugc/940586530515504757/CDDE77CB810474E1C07B945E40AE4713141AFD76/?imw=5000&ih=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (15, 'https://wallpapers.com/images/featured/disney-has6vy47k75d0bzs.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (16, 'https://wallpapers.com/images/featured/disney-has6vy47k75d0bzs.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (17, 'https://wallpapers.com/images/featured/disney-has6vy47k75d0bzs.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (18, 'https://steamuserimages-a.akamaihd.net/ugc/870746400641317388/3D95BB46AA21A29667618762A114B2A6EDE30340/?imw=637&imh=358&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (19, 'https://wallpapers.com/images/featured/disney-has6vy47k75d0bzs.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (20, 'https://steamuserimages-a.akamaihd.net/ugc/940586530515504757/CDDE77CB810474E1C07B945E40AE4713141AFD76/?imw=5000&ih=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (21, 'https://steamuserimages-a.akamaihd.net/ugc/940586530515504757/CDDE77CB810474E1C07B945E40AE4713141AFD76/?imw=5000&ih=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (22, 'https://steamuserimages-a.akamaihd.net/ugc/870746400641317388/3D95BB46AA21A29667618762A114B2A6EDE30340/?imw=637&imh=358&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (23, 'https://149359637.v2.pressablecdn.com/wp-content/uploads/2021/08/Space-Earth-Wallpaper-About-Murals.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (24, 'https://steamuserimages-a.akamaihd.net/ugc/940586530515504757/CDDE77CB810474E1C07B945E40AE4713141AFD76/?imw=5000&ih=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (25, 'https://wallpapers.com/images/featured/disney-has6vy47k75d0bzs.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (26, 'https://149359637.v2.pressablecdn.com/wp-content/uploads/2021/08/Space-Earth-Wallpaper-About-Murals.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (27, 'https://steamuserimages-a.akamaihd.net/ugc/870746400641317388/3D95BB46AA21A29667618762A114B2A6EDE30340/?imw=637&imh=358&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (28, 'https://steamuserimages-a.akamaihd.net/ugc/870746400641317388/3D95BB46AA21A29667618762A114B2A6EDE30340/?imw=637&imh=358&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (29, 'https://steamuserimages-a.akamaihd.net/ugc/940586530515504757/CDDE77CB810474E1C07B945E40AE4713141AFD76/?imw=5000&ih=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (30, 'https://steamuserimages-a.akamaihd.net/ugc/940586530515504757/CDDE77CB810474E1C07B945E40AE4713141AFD76/?imw=5000&ih=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (31, 'https://wallpapers.com/images/featured/disney-has6vy47k75d0bzs.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (32, 'https://steamuserimages-a.akamaihd.net/ugc/940586530515504757/CDDE77CB810474E1C07B945E40AE4713141AFD76/?imw=5000&ih=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (33, 'https://steamuserimages-a.akamaihd.net/ugc/940586530515504757/CDDE77CB810474E1C07B945E40AE4713141AFD76/?imw=5000&ih=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (34, 'https://wallpapers.com/images/featured/disney-has6vy47k75d0bzs.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (35, 'https://steamuserimages-a.akamaihd.net/ugc/940586530515504757/CDDE77CB810474E1C07B945E40AE4713141AFD76/?imw=5000&ih=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (36, 'https://wallpapers.com/images/featured/disney-has6vy47k75d0bzs.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (37, 'https://wallpapers.com/images/featured/disney-has6vy47k75d0bzs.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (38, 'https://steamuserimages-a.akamaihd.net/ugc/940586530515504757/CDDE77CB810474E1C07B945E40AE4713141AFD76/?imw=5000&ih=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (39, 'https://steamuserimages-a.akamaihd.net/ugc/870746400641317388/3D95BB46AA21A29667618762A114B2A6EDE30340/?imw=637&imh=358&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (40, 'https://steamuserimages-a.akamaihd.net/ugc/940586530515504757/CDDE77CB810474E1C07B945E40AE4713141AFD76/?imw=5000&ih=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (41, 'https://149359637.v2.pressablecdn.com/wp-content/uploads/2021/08/Space-Earth-Wallpaper-About-Murals.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (42, 'https://149359637.v2.pressablecdn.com/wp-content/uploads/2021/08/Space-Earth-Wallpaper-About-Murals.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (43, 'https://steamuserimages-a.akamaihd.net/ugc/870746400641317388/3D95BB46AA21A29667618762A114B2A6EDE30340/?imw=637&imh=358&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (44, 'https://steamuserimages-a.akamaihd.net/ugc/940586530515504757/CDDE77CB810474E1C07B945E40AE4713141AFD76/?imw=5000&ih=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (45, 'https://149359637.v2.pressablecdn.com/wp-content/uploads/2021/08/Space-Earth-Wallpaper-About-Murals.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (46, 'https://steamuserimages-a.akamaihd.net/ugc/940586530515504757/CDDE77CB810474E1C07B945E40AE4713141AFD76/?imw=5000&ih=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (47, 'https://steamuserimages-a.akamaihd.net/ugc/870746400641317388/3D95BB46AA21A29667618762A114B2A6EDE30340/?imw=637&imh=358&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (48, 'https://steamuserimages-a.akamaihd.net/ugc/870746400641317388/3D95BB46AA21A29667618762A114B2A6EDE30340/?imw=637&imh=358&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (49, 'https://steamuserimages-a.akamaihd.net/ugc/940586530515504757/CDDE77CB810474E1C07B945E40AE4713141AFD76/?imw=5000&ih=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (50, 'https://149359637.v2.pressablecdn.com/wp-content/uploads/2021/08/Space-Earth-Wallpaper-About-Murals.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (51, 'https://steamuserimages-a.akamaihd.net/ugc/870746400641317388/3D95BB46AA21A29667618762A114B2A6EDE30340/?imw=637&imh=358&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (52, 'https://steamuserimages-a.akamaihd.net/ugc/940586530515504757/CDDE77CB810474E1C07B945E40AE4713141AFD76/?imw=5000&ih=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (53, 'https://steamuserimages-a.akamaihd.net/ugc/940586530515504757/CDDE77CB810474E1C07B945E40AE4713141AFD76/?imw=5000&ih=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (54, 'https://149359637.v2.pressablecdn.com/wp-content/uploads/2021/08/Space-Earth-Wallpaper-About-Murals.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (55, 'https://steamuserimages-a.akamaihd.net/ugc/940586530515504757/CDDE77CB810474E1C07B945E40AE4713141AFD76/?imw=5000&ih=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (56, 'https://149359637.v2.pressablecdn.com/wp-content/uploads/2021/08/Space-Earth-Wallpaper-About-Murals.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (57, 'https://steamuserimages-a.akamaihd.net/ugc/940586530515504757/CDDE77CB810474E1C07B945E40AE4713141AFD76/?imw=5000&ih=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (58, 'https://steamuserimages-a.akamaihd.net/ugc/940586530515504757/CDDE77CB810474E1C07B945E40AE4713141AFD76/?imw=5000&ih=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (59, 'https://steamuserimages-a.akamaihd.net/ugc/870746400641317388/3D95BB46AA21A29667618762A114B2A6EDE30340/?imw=637&imh=358&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (60, 'https://wallpapers.com/images/featured/disney-has6vy47k75d0bzs.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (61, 'https://steamuserimages-a.akamaihd.net/ugc/940586530515504757/CDDE77CB810474E1C07B945E40AE4713141AFD76/?imw=5000&ih=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (62, 'https://steamuserimages-a.akamaihd.net/ugc/940586530515504757/CDDE77CB810474E1C07B945E40AE4713141AFD76/?imw=5000&ih=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (63, 'https://149359637.v2.pressablecdn.com/wp-content/uploads/2021/08/Space-Earth-Wallpaper-About-Murals.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (64, 'https://149359637.v2.pressablecdn.com/wp-content/uploads/2021/08/Space-Earth-Wallpaper-About-Murals.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (65, 'https://wallpapers.com/images/featured/disney-has6vy47k75d0bzs.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (66, 'https://149359637.v2.pressablecdn.com/wp-content/uploads/2021/08/Space-Earth-Wallpaper-About-Murals.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (67, 'https://149359637.v2.pressablecdn.com/wp-content/uploads/2021/08/Space-Earth-Wallpaper-About-Murals.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (68, 'https://steamuserimages-a.akamaihd.net/ugc/940586530515504757/CDDE77CB810474E1C07B945E40AE4713141AFD76/?imw=5000&ih=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (69, 'https://wallpapers.com/images/featured/disney-has6vy47k75d0bzs.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (70, 'https://wallpapers.com/images/featured/disney-has6vy47k75d0bzs.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (71, 'https://steamuserimages-a.akamaihd.net/ugc/940586530515504757/CDDE77CB810474E1C07B945E40AE4713141AFD76/?imw=5000&ih=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (72, 'https://wallpapers.com/images/featured/disney-has6vy47k75d0bzs.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (73, 'https://steamuserimages-a.akamaihd.net/ugc/940586530515504757/CDDE77CB810474E1C07B945E40AE4713141AFD76/?imw=5000&ih=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (74, 'https://steamuserimages-a.akamaihd.net/ugc/870746400641317388/3D95BB46AA21A29667618762A114B2A6EDE30340/?imw=637&imh=358&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (75, 'https://steamuserimages-a.akamaihd.net/ugc/940586530515504757/CDDE77CB810474E1C07B945E40AE4713141AFD76/?imw=5000&ih=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (76, 'https://wallpapers.com/images/featured/disney-has6vy47k75d0bzs.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (77, 'https://149359637.v2.pressablecdn.com/wp-content/uploads/2021/08/Space-Earth-Wallpaper-About-Murals.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (78, 'https://steamuserimages-a.akamaihd.net/ugc/940586530515504757/CDDE77CB810474E1C07B945E40AE4713141AFD76/?imw=5000&ih=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (79, 'https://steamuserimages-a.akamaihd.net/ugc/940586530515504757/CDDE77CB810474E1C07B945E40AE4713141AFD76/?imw=5000&ih=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (80, 'https://149359637.v2.pressablecdn.com/wp-content/uploads/2021/08/Space-Earth-Wallpaper-About-Murals.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (81, 'https://steamuserimages-a.akamaihd.net/ugc/940586530515504757/CDDE77CB810474E1C07B945E40AE4713141AFD76/?imw=5000&ih=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (82, 'https://wallpapers.com/images/featured/disney-has6vy47k75d0bzs.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (83, 'https://steamuserimages-a.akamaihd.net/ugc/940586530515504757/CDDE77CB810474E1C07B945E40AE4713141AFD76/?imw=5000&ih=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (84, 'https://steamuserimages-a.akamaihd.net/ugc/940586530515504757/CDDE77CB810474E1C07B945E40AE4713141AFD76/?imw=5000&ih=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (85, 'https://steamuserimages-a.akamaihd.net/ugc/940586530515504757/CDDE77CB810474E1C07B945E40AE4713141AFD76/?imw=5000&ih=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (86, 'https://149359637.v2.pressablecdn.com/wp-content/uploads/2021/08/Space-Earth-Wallpaper-About-Murals.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (87, 'https://149359637.v2.pressablecdn.com/wp-content/uploads/2021/08/Space-Earth-Wallpaper-About-Murals.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (88, 'https://wallpapers.com/images/featured/disney-has6vy47k75d0bzs.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (89, 'https://wallpapers.com/images/featured/disney-has6vy47k75d0bzs.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (90, 'https://wallpapers.com/images/featured/disney-has6vy47k75d0bzs.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (91, 'https://steamuserimages-a.akamaihd.net/ugc/870746400641317388/3D95BB46AA21A29667618762A114B2A6EDE30340/?imw=637&imh=358&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (92, 'https://steamuserimages-a.akamaihd.net/ugc/870746400641317388/3D95BB46AA21A29667618762A114B2A6EDE30340/?imw=637&imh=358&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (93, 'https://steamuserimages-a.akamaihd.net/ugc/940586530515504757/CDDE77CB810474E1C07B945E40AE4713141AFD76/?imw=5000&ih=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (94, 'https://149359637.v2.pressablecdn.com/wp-content/uploads/2021/08/Space-Earth-Wallpaper-About-Murals.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (95, 'https://steamuserimages-a.akamaihd.net/ugc/870746400641317388/3D95BB46AA21A29667618762A114B2A6EDE30340/?imw=637&imh=358&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (96, 'https://wallpapers.com/images/featured/disney-has6vy47k75d0bzs.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (97, 'https://steamuserimages-a.akamaihd.net/ugc/870746400641317388/3D95BB46AA21A29667618762A114B2A6EDE30340/?imw=637&imh=358&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (98, 'https://wallpapers.com/images/featured/disney-has6vy47k75d0bzs.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (99, 'https://149359637.v2.pressablecdn.com/wp-content/uploads/2021/08/Space-Earth-Wallpaper-About-Murals.jpg');
INSERT INTO bottle_media (bottle_id, media_url) VALUES (100, 'https://149359637.v2.pressablecdn.com/wp-content/uploads/2021/08/Space-Earth-Wallpaper-About-Murals.jpg');
