
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `Like`;
DROP TABLE IF EXISTS `Comment`;
DROP TABLE IF EXISTS `Post`;
DROP TABLE IF EXISTS `Category`;
DROP TABLE IF EXISTS `SiteStat`;
DROP TABLE IF EXISTS `DailyVisit`;
DROP TABLE IF EXISTS `Setting`;
DROP TABLE IF EXISTS `visitorlog`;
DROP TABLE IF EXISTS `User`;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `User` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `password` VARCHAR(191) NOT NULL,
  `role` VARCHAR(191) NOT NULL DEFAULT 'user',
  `status` VARCHAR(50) NOT NULL DEFAULT 'active',
  `name` VARCHAR(191) DEFAULT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `avatar` VARCHAR(191) DEFAULT NULL,
  `lastLoginAt` DATETIME(3) DEFAULT NULL,
  `deletedAt` DATETIME(3) DEFAULT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_username_key` (`username`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `Category`
-- --------------------------------------------------------

CREATE TABLE `Category` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Category_name_key` (`name`),
  UNIQUE KEY `Category_slug_key` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `SiteStat`
-- --------------------------------------------------------

CREATE TABLE `SiteStat` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `key` VARCHAR(191) NOT NULL,
  `value` INT NOT NULL DEFAULT 0,
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `SiteStat_key_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `DailyVisit`
-- --------------------------------------------------------

CREATE TABLE `DailyVisit` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `date` VARCHAR(191) NOT NULL,
  `count` INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `DailyVisit_date_key` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `visitorlog`
-- --------------------------------------------------------

CREATE TABLE `visitorlog` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `ip` VARCHAR(191) NOT NULL,
  `country` VARCHAR(191) NOT NULL DEFAULT 'Unknown',
  `countryCode` VARCHAR(10) NOT NULL DEFAULT 'XX',
  `city` VARCHAR(191) DEFAULT NULL,
  `path` VARCHAR(191) NOT NULL DEFAULT '/',
  `date` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `visitorlog_ip_idx` (`ip`),
  KEY `visitorlog_date_idx` (`date`),
  KEY `visitorlog_countryCode_idx` (`countryCode`),
  KEY `visitorlog_createdAt_idx` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `Setting`
-- --------------------------------------------------------

CREATE TABLE `Setting` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `key` VARCHAR(191) NOT NULL,
  `value` TEXT NOT NULL,
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Setting_key_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `Post`
-- --------------------------------------------------------

CREATE TABLE `Post` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `summary` TEXT NOT NULL,
  `content` LONGTEXT NOT NULL,
  `coverImage` VARCHAR(191) DEFAULT NULL,
  `videoUrl` VARCHAR(191) DEFAULT NULL,
  `category` VARCHAR(191) NOT NULL,
  `tags` VARCHAR(191) NOT NULL,
  `hashtags` VARCHAR(191) NOT NULL,
  `readTime` INT NOT NULL DEFAULT 3,
  `views` INT NOT NULL DEFAULT 0,
  `published` BOOLEAN NOT NULL DEFAULT TRUE,
  `status` VARCHAR(50) NOT NULL DEFAULT 'approved',
  `rejectionReason` TEXT DEFAULT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `authorUsername` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Post_slug_key` (`slug`),
  KEY `Post_category_idx` (`category`),
  KEY `Post_authorUsername_idx` (`authorUsername`),
  KEY `Post_createdAt_idx` (`createdAt`),
  CONSTRAINT `Post_authorUsername_fkey` FOREIGN KEY (`authorUsername`) REFERENCES `User` (`username`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `Comment`
-- --------------------------------------------------------

CREATE TABLE `Comment` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `content` TEXT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `postId` INT NOT NULL,
  `authorUsername` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Comment_postId_idx` (`postId`),
  KEY `Comment_authorUsername_idx` (`authorUsername`),
  CONSTRAINT `Comment_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Post` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Comment_authorUsername_fkey` FOREIGN KEY (`authorUsername`) REFERENCES `User` (`username`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `Like`
-- --------------------------------------------------------

CREATE TABLE `Like` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `postId` INT NOT NULL,
  `authorUsername` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Like_postId_authorUsername_key` (`postId`, `authorUsername`),
  KEY `Like_postId_idx` (`postId`),
  KEY `Like_authorUsername_idx` (`authorUsername`),
  CONSTRAINT `Like_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Post` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Like_authorUsername_fkey` FOREIGN KEY (`authorUsername`) REFERENCES `User` (`username`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Seed Data: Categories
-- --------------------------------------------------------

INSERT INTO `Category` (`id`, `name`, `slug`, `createdAt`) VALUES
(1, 'Engineering', 'engineering', NOW(3)),
(2, 'Design', 'design', NOW(3)),
(3, 'Architecture', 'architecture', NOW(3)),
(4, 'AI', 'ai', NOW(3)),
(5, 'Philosophy', 'philosophy', NOW(3));

-- --------------------------------------------------------
-- Seed Data: Site Visits Counter
-- --------------------------------------------------------

INSERT INTO `SiteStat` (`id`, `key`, `value`, `updatedAt`) VALUES
(1, 'total_visits', 128, NOW(3));

-- --------------------------------------------------------
-- Seed Data: Social Media Settings
-- --------------------------------------------------------

INSERT INTO `Setting` (`id`, `key`, `value`, `updatedAt`) VALUES
(1, 'twitter_url', 'https://x.com/wanblog', NOW(3)),
(2, 'tiktok_url', 'https://tiktok.com/@wanblog', NOW(3)),
(3, 'instagram_url', 'https://instagram.com/wanblog', NOW(3));

-- --------------------------------------------------------
-- Seed Data: Admin & Registered Users (lowercase roles, password: password123)
-- --------------------------------------------------------

INSERT INTO `User` (`id`, `username`, `email`, `password`, `role`, `createdAt`, `updatedAt`) VALUES
(1, 'admin', 'admin@wanblog.internal', '$2a$10$O03V1s0vK1rNfJp8bTfP2.4qV3yB7p2r6fX3s1h5j8l0n2p4r6t8u', 'admin', NOW(3), NOW(3)),
(2, 'alex_dev', 'alex@wanblog.internal', '$2a$10$O03V1s0vK1rNfJp8bTfP2.4qV3yB7p2r6fX3s1h5j8l0n2p4r6t8u', 'user', NOW(3), NOW(3)),
(3, 'elena_design', 'elena@wanblog.internal', '$2a$10$O03V1s0vK1rNfJp8bTfP2.4qV3yB7p2r6fX3s1h5j8l0n2p4r6t8u', 'user', NOW(3), NOW(3));

-- --------------------------------------------------------
-- Seed Data: Dispatches / Blog Posts
-- --------------------------------------------------------

INSERT INTO `Post` (`id`, `title`, `slug`, `summary`, `content`, `coverImage`, `videoUrl`, `category`, `tags`, `hashtags`, `readTime`, `views`, `published`, `createdAt`, `updatedAt`, `authorUsername`) VALUES
(1, 'The Architecture of Extreme Simplicity', 'architecture-of-extreme-simplicity', 'Why stripping away decorative chrome, color overload, and gratuitous micro-interactions unlocks unprecedented clarity and performance.', 'In an era of hyper-saturated gradients, 3D floating meshes, and cognitive overload, restraint has become the ultimate differentiator.\n\n## The Cognitive Cost of Visual Noise\n\nEvery saturated hue, unnecessary shadow, and heavy drop blur places a tax on user attention. When we strip an interface back to high-contrast monochrome values—deep carbon blacks and unadulterated whites—we force both the designer and the engineer to confront the essentials:\n- **Typography hierarchy:** Font weight and leading must carry the weight of meaning.\n- **Spatial composition:** Whitespace stops being ''empty'' and becomes active structural breathing room.\n- **Information velocity:** The user''s eye scans without visual friction or deceptive cues.\n\n### Engineering Discipline in Restraint\n\nBuilding a monochrome aesthetic isn''t just about CSS tokens. It extends to network payloads and rendering pipelines.', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Design', 'design,minimalism,performance,architecture', '#design #minimalism #architecture', 4, 342, 1, NOW(3), NOW(3), 'admin'),

(2, 'Zero-Latency Edge Data Fetching with Prisma & SQL', 'zero-latency-edge-fetching-prisma', 'Exploring server action pipelines, single-query relational loading, and predictable caching strategies in Next.js 15.', 'Modern full-stack web applications no longer need monolithic REST APIs or bloated GraphQL clients for internal page hydration.\n\n## Server Actions as First-Class RPCs\n\nNext.js App Router combined with Prisma transforms the way we interact with relational databases:\n1. **Type Safety End-to-End:** Client components call strongly typed functions.\n2. **Atomic Invalidation:** `revalidatePath` guarantees fresh cache without manual state synchronization.\n3. **Database Proximity:** Whether running SQLite at the edge or MySQL in XAMPP clusters, queries resolve in sub-millisecond windows.', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80', NULL, 'Engineering', 'nextjs,prisma,mysql,typescript,database', '#technology #engineering #nextjs #typescript', 5, 189, 1, NOW(3), NOW(3), 'admin'),

(3, 'The Art of Monochrome Digital Typography', 'art-of-monochrome-digital-typography', 'A practical guide to optical font sizes, rhythm, and monospace contrast in editorial web publications.', 'When color is removed from an editorial canvas, typography must work ten times harder.\n\n## Vertical Rhythm and Line Height\n\nFor long-form reading, line length must strictly stay between 60 to 75 characters per line. Any wider causes tracking fatigue; any narrower fragments sentence momentum.', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80', 'https://www.youtube.com/watch?v=LXb3EKWsInQ', 'Architecture', 'typography,editorial,craft,css', '#typography #design #minimalism', 3, 95, 1, NOW(3), NOW(3), 'admin');

-- --------------------------------------------------------
-- Seed Data: Likes
-- --------------------------------------------------------

INSERT INTO `Like` (`id`, `postId`, `authorUsername`, `createdAt`) VALUES
(1, 1, 'alex_dev', NOW(3)),
(2, 1, 'elena_design', NOW(3)),
(3, 2, 'alex_dev', NOW(3));

-- --------------------------------------------------------
-- Seed Data: Comments
-- --------------------------------------------------------

INSERT INTO `Comment` (`id`, `content`, `createdAt`, `postId`, `authorUsername`) VALUES
(1, 'This minimalist philosophy is exactly what the modern web is missing. The typography rhythm here is phenomenal.', NOW(3), 1, 'alex_dev'),
(2, 'Agreed. Restraint creates distinction. Loved the video inclusion too!', NOW(3), 1, 'elena_design'),
(3, 'Feel free to check out the admin console to publish your own articles!', NOW(3), 2, 'admin');
