-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 27, 2020 at 09:04 PM
-- Server version: 10.1.38-MariaDB
-- PHP Version: 5.6.40

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `gandhi`
--

-- --------------------------------------------------------

--
-- Table structure for table `attributes`
--

CREATE TABLE `attributes` (
  `id` bigint(20) NOT NULL,
  `name` varchar(225) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `attributes`
--

INSERT INTO `attributes` (`id`, `name`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'Processor', 1, '2020-10-21 19:45:53', '2020-10-21 19:50:11'),
(2, 'Attr', 2, '2020-10-21 19:52:03', '2020-10-21 19:52:03');

-- --------------------------------------------------------

--
-- Table structure for table `attribute_values`
--

CREATE TABLE `attribute_values` (
  `id` bigint(20) NOT NULL,
  `name` varchar(225) NOT NULL,
  `attribute_id` bigint(20) DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `attribute_values`
--

INSERT INTO `attribute_values` (`id`, `name`, `attribute_id`, `sort_order`, `created_at`, `updated_at`) VALUES
(3, 'Hz', 1, 12, '2020-10-21 19:49:58', '2020-10-21 19:50:11'),
(4, 'Att', 2, 0, '2020-10-21 19:52:03', '2020-10-21 19:52:03'),
(5, 'Att2', 2, 0, '2020-10-21 19:52:03', '2020-10-21 19:52:03');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) NOT NULL,
  `name` varchar(225) DEFAULT NULL,
  `slug` varchar(225) NOT NULL,
  `meta_title` varchar(225) DEFAULT NULL,
  `meta_desceiption` varchar(225) DEFAULT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `upload_id` bigint(20) DEFAULT NULL,
  `mobile_upload_id` bigint(20) DEFAULT NULL,
  `parent_id` bigint(20) DEFAULT NULL,
  `hierarchy_level` bigint(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `meta_title`, `meta_desceiption`, `description`, `upload_id`, `mobile_upload_id`, `parent_id`, `hierarchy_level`, `created_at`, `updated_at`) VALUES
(31, 'Fashion', 'fashion', '', '', '', NULL, NULL, NULL, 1, '2020-10-19 19:34:05', '2020-10-24 09:43:30'),
(34, 'Men Fashion', 'men-fashion', '', '', '', NULL, NULL, 31, 2, '2020-10-19 19:37:38', '2020-10-24 09:43:30'),
(37, 'Women Fashion', 'women-fashion', '', '', '', NULL, NULL, 31, 2, '2020-10-19 19:38:59', '2020-10-24 09:43:30'),
(38, 'Bottom Wear', 'bottom-wear', '', '', '', NULL, NULL, 34, 3, '2020-10-19 19:39:21', '2020-10-24 09:43:30'),
(39, 'Top Wear', 'top-wear', '', '', '', NULL, NULL, 34, 3, '2020-10-19 19:39:54', '2020-10-24 09:43:30'),
(41, 'Jeans', 'jeans', '', '', '', NULL, NULL, 38, 4, '2020-10-19 19:43:32', '2020-10-24 09:43:30'),
(43, 'Top Wear', 'top-wear-women', '', '', '', NULL, NULL, 37, 3, '2020-10-19 19:44:13', '2020-10-24 09:43:30'),
(44, 'T Shirts', 't-shirts', '', '', '', NULL, NULL, 39, 4, '2020-10-19 19:45:45', '2020-10-24 09:43:30');

-- --------------------------------------------------------

--
-- Table structure for table `categoriesancestors`
--

CREATE TABLE `categoriesancestors` (
  `id` bigint(20) NOT NULL,
  `categories_id` bigint(20) NOT NULL,
  `ancestor_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `categoriesancestors`
--

INSERT INTO `categoriesancestors` (`id`, `categories_id`, `ancestor_id`) VALUES
(1, 34, 31),
(2, 37, 31),
(3, 38, 31),
(4, 38, 34),
(5, 39, 31),
(6, 39, 34),
(7, 43, 31),
(8, 43, 37),
(9, 41, 31),
(10, 41, 34),
(11, 41, 38),
(12, 44, 31),
(13, 44, 34),
(14, 44, 39);

-- --------------------------------------------------------

--
-- Table structure for table `countries`
--

CREATE TABLE `countries` (
  `id` bigint(20) NOT NULL,
  `name` varchar(225) DEFAULT NULL,
  `code_2` varchar(2) DEFAULT NULL,
  `code_3` varchar(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `countries`
--

INSERT INTO `countries` (`id`, `name`, `code_2`, `code_3`) VALUES
(10, 'India', 'IN', 'IND'),
(11, 'United States', 'US', 'USA'),
(12, 'Canada', 'CA', 'CAD');

-- --------------------------------------------------------

--
-- Table structure for table `coupons`
--

CREATE TABLE `coupons` (
  `id` bigint(20) NOT NULL,
  `code` varchar(10) NOT NULL,
  `description` varchar(225) DEFAULT NULL,
  `discount_type` varchar(100) NOT NULL COMMENT 'percentage,fixed',
  `amount` double NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `min_spend` double NOT NULL,
  `max_spend` double NOT NULL,
  `individual_only` tinyint(4) NOT NULL DEFAULT '0' COMMENT '0,1',
  `exclude_sale_items` tinyint(4) NOT NULL DEFAULT '0' COMMENT '0,1',
  `usage_limit` int(11) NOT NULL,
  `limit_per_user` int(11) NOT NULL,
  `status` tinyint(4) NOT NULL DEFAULT '0' COMMENT '0,1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `coupons`
--

INSERT INTO `coupons` (`id`, `code`, `description`, `discount_type`, `amount`, `start_date`, `end_date`, `min_spend`, `max_spend`, `individual_only`, `exclude_sale_items`, `usage_limit`, `limit_per_user`, `status`, `created_at`, `updated_at`) VALUES
(1, 'deep1234', 'test coupon', 'percentage', 50, '2020-10-19', '2020-10-24', 10, 20, 1, 0, 1, 10, 1, '2020-10-22 14:00:37', '2020-10-22 14:02:28'),
(9, 'd@p123@12', 'test coupon', 'percentage', 100, '2020-10-19', '2020-10-24', 10, 20, 1, 0, 1, 10, 1, '2020-10-22 14:41:50', '2020-10-22 14:41:50');

-- --------------------------------------------------------

--
-- Table structure for table `currencies`
--

CREATE TABLE `currencies` (
  `id` bigint(20) NOT NULL,
  `title` varchar(50) NOT NULL,
  `code` varchar(5) NOT NULL,
  `value` float NOT NULL,
  `status` tinyint(4) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `currencies`
--

INSERT INTO `currencies` (`id`, `title`, `code`, `value`, `status`, `created_at`, `updated_at`) VALUES
(2, 'Rupees', 'INR', 1, 1, '2020-10-02 10:17:42', '2020-10-05 18:01:23');

-- --------------------------------------------------------

--
-- Table structure for table `filters`
--

CREATE TABLE `filters` (
  `id` bigint(20) NOT NULL,
  `name` varchar(225) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `filters`
--

INSERT INTO `filters` (`id`, `name`, `sort_order`, `created_at`, `updated_at`) VALUES
(15, 'Size', 2, '2020-10-20 19:45:54', '2020-10-21 18:36:18'),
(17, 'Colors', 1, '2020-10-21 18:12:51', '2020-10-21 19:24:37');

-- --------------------------------------------------------

--
-- Table structure for table `filter_values`
--

CREATE TABLE `filter_values` (
  `id` bigint(20) NOT NULL,
  `name` varchar(225) NOT NULL,
  `filter_id` bigint(20) DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `filter_values`
--

INSERT INTO `filter_values` (`id`, `name`, `filter_id`, `sort_order`, `created_at`, `updated_at`) VALUES
(38, 'S', 15, 1, '2020-10-21 17:09:27', '2020-10-21 18:36:18'),
(46, 'Green', 17, 2, '2020-10-21 18:25:47', '2020-10-21 19:24:37'),
(50, 'M', 15, 2, '2020-10-21 18:36:18', '2020-10-21 18:36:18'),
(51, 'L', 15, 3, '2020-10-21 18:36:18', '2020-10-21 18:36:18'),
(52, 'Grey', 17, 4, '2020-10-21 18:55:14', '2020-10-21 19:24:37'),
(53, 'Yellow', 17, 5, '2020-10-21 19:01:49', '2020-10-21 19:24:37'),
(54, 'White', 17, 1, '2020-10-21 19:23:58', '2020-10-21 19:24:38'),
(55, 'Dark red', 17, 6, '2020-10-21 19:24:38', '2020-10-21 19:24:38');

-- --------------------------------------------------------

--
-- Table structure for table `geozones`
--

CREATE TABLE `geozones` (
  `id` bigint(20) NOT NULL,
  `name` varchar(225) DEFAULT NULL,
  `description` varchar(1000) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `geozones`
--

INSERT INTO `geozones` (`id`, `name`, `description`) VALUES
(12, 'East India', '8885787'),
(13, 'West India', 'west india Geozone');

-- --------------------------------------------------------

--
-- Table structure for table `geozones_zones`
--

CREATE TABLE `geozones_zones` (
  `id` bigint(20) NOT NULL,
  `geozone_id` bigint(20) NOT NULL,
  `zone_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `geozones_zones`
--

INSERT INTO `geozones_zones` (`id`, `geozone_id`, `zone_id`) VALUES
(10, 13, 3),
(11, 13, 1),
(13, 12, 2),
(14, 12, 3),
(15, 12, 4);

-- --------------------------------------------------------

--
-- Table structure for table `length_classes`
--

CREATE TABLE `length_classes` (
  `id` bigint(20) NOT NULL,
  `title` varchar(225) NOT NULL,
  `unit` varchar(10) NOT NULL,
  `value` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `length_classes`
--

INSERT INTO `length_classes` (`id`, `title`, `unit`, `value`) VALUES
(3, 'Feet', 'ft', 21.93),
(4, 'Centimeter', 'cm', 1.1);

-- --------------------------------------------------------

--
-- Table structure for table `menus`
--

CREATE TABLE `menus` (
  `id` bigint(20) NOT NULL,
  `label` varchar(225) NOT NULL,
  `parent` bigint(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `menus`
--

INSERT INTO `menus` (`id`, `label`, `parent`, `created_at`, `updated_at`) VALUES
(1, 'Users', NULL, '2020-09-15 09:07:17', '2020-09-28 06:00:55'),
(3, 'Roles', NULL, '2020-09-15 10:05:24', '2020-09-28 06:01:02'),
(4, 'Countries', NULL, '2020-09-28 06:01:17', '2020-09-28 06:01:17'),
(5, 'Zones', NULL, '2020-09-28 06:01:45', '2020-09-28 06:01:45'),
(6, 'Currencies', NULL, '2020-09-28 06:02:09', '2020-09-28 06:02:09');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint(20) NOT NULL,
  `sku` varchar(225) NOT NULL,
  `name` varchar(500) NOT NULL,
  `slug` varchar(500) NOT NULL,
  `short_description` text,
  `long_description` text,
  `meta_title` varchar(225) DEFAULT NULL,
  `meta_description` varchar(225) DEFAULT NULL,
  `tags` text,
  `ragular_price` double NOT NULL,
  `sale_price` double NOT NULL DEFAULT '0',
  `tax_class_id` bigint(20) DEFAULT NULL,
  `quantity` bigint(20) DEFAULT NULL,
  `manage_stock` tinyint(4) NOT NULL DEFAULT '1',
  `min_order_quantity` bigint(20) DEFAULT NULL,
  `max_order_quantity` bigint(20) DEFAULT NULL,
  `step` double DEFAULT '1',
  `shipping_length` float DEFAULT NULL,
  `shipping_width` float DEFAULT NULL,
  `shipping_height` float DEFAULT NULL,
  `shipping_weight` float DEFAULT NULL,
  `length_class_id` bigint(20) NOT NULL,
  `weight_class_id` bigint(20) NOT NULL,
  `upload_id` bigint(20) NOT NULL,
  `status` tinyint(4) NOT NULL DEFAULT '0',
  `stock_status` tinyint(4) NOT NULL DEFAULT '1' COMMENT '0-out 1-in',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `sku`, `name`, `slug`, `short_description`, `long_description`, `meta_title`, `meta_description`, `tags`, `ragular_price`, `sale_price`, `tax_class_id`, `quantity`, `manage_stock`, `min_order_quantity`, `max_order_quantity`, `step`, `shipping_length`, `shipping_width`, `shipping_height`, `shipping_weight`, `length_class_id`, `weight_class_id`, `upload_id`, `status`, `stock_status`, `created_at`, `updated_at`) VALUES
(19, '001', 'Lorem Ipsum is simply dummy text', 'lorem-ipsum-is-simply-dummy-text', '', '', '', '', 'cotton, cotton fabrics, cotton blende fabrics', 300, 0, 11, 0, 0, 1, NULL, 1, 0, 0, 0, 0, 3, 1, 186, 1, 1, '2020-10-27 08:40:40', '2020-10-27 10:07:49');

-- --------------------------------------------------------

--
-- Table structure for table `products_attribute_values`
--

CREATE TABLE `products_attribute_values` (
  `id` bigint(20) NOT NULL,
  `product_id` bigint(20) NOT NULL,
  `attribute_value_id` bigint(20) NOT NULL,
  `attribute_description` text
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `products_attribute_values`
--

INSERT INTO `products_attribute_values` (`id`, `product_id`, `attribute_value_id`, `attribute_description`) VALUES
(1, 19, 4, 'Attribute One'),
(2, 19, 5, 'Attribute Two');

-- --------------------------------------------------------

--
-- Table structure for table `products_categories`
--

CREATE TABLE `products_categories` (
  `id` bigint(20) NOT NULL,
  `product_id` bigint(20) NOT NULL,
  `category_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `products_categories`
--

INSERT INTO `products_categories` (`id`, `product_id`, `category_id`) VALUES
(18, 19, 31),
(19, 19, 37),
(20, 19, 43),
(21, 19, 39),
(22, 19, 34);

-- --------------------------------------------------------

--
-- Table structure for table `products_filter_values`
--

CREATE TABLE `products_filter_values` (
  `id` bigint(20) NOT NULL,
  `product_id` bigint(20) NOT NULL,
  `filter_value_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `products_filter_values`
--

INSERT INTO `products_filter_values` (`id`, `product_id`, `filter_value_id`) VALUES
(19, 19, 46),
(20, 19, 55),
(21, 19, 51),
(22, 19, 50);

-- --------------------------------------------------------

--
-- Table structure for table `products_uploads`
--

CREATE TABLE `products_uploads` (
  `id` bigint(20) NOT NULL,
  `product_id` bigint(20) NOT NULL,
  `upload_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `products_uploads`
--

INSERT INTO `products_uploads` (`id`, `product_id`, `upload_id`) VALUES
(5, 19, 186),
(6, 19, 185),
(7, 19, 184),
(8, 19, 176),
(11, 19, 172),
(12, 19, 171),
(13, 19, 173),
(14, 19, 167),
(15, 19, 168),
(16, 19, 169),
(17, 19, 170),
(18, 19, 187);

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) NOT NULL,
  `name` varchar(225) NOT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'Administrators can access all menus ', '2020-09-15 07:37:09', '2020-09-28 08:51:54'),
(14, 'Sales', 'For all sales users', '2020-09-26 12:01:16', '2020-09-26 12:01:16'),
(15, 'Telecaller', 'For telecaller users', '2020-09-26 13:10:38', '2020-09-26 14:33:56');

-- --------------------------------------------------------

--
-- Table structure for table `roles_menus`
--

CREATE TABLE `roles_menus` (
  `id` bigint(20) NOT NULL,
  `role_id` bigint(20) NOT NULL,
  `menu_id` bigint(20) NOT NULL,
  `c` tinyint(4) DEFAULT NULL,
  `u` tinyint(4) DEFAULT NULL,
  `r` tinyint(4) DEFAULT NULL,
  `d` tinyint(4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `roles_menus`
--

INSERT INTO `roles_menus` (`id`, `role_id`, `menu_id`, `c`, `u`, `r`, `d`) VALUES
(39, 1, 1, 1, 1, 1, 1),
(40, 1, 3, 1, 1, 1, 1),
(41, 1, 4, 1, 1, 1, 1),
(42, 1, 5, 1, 1, 1, 1),
(44, 1, 6, 1, 1, 1, 1),
(45, 15, 3, 1, 1, 0, 0),
(46, 15, 1, 1, 0, 0, 0),
(47, 14, 3, 0, 0, 1, 1),
(48, 14, 1, 0, 0, 1, 0);

-- --------------------------------------------------------

--
-- Table structure for table `taxes`
--

CREATE TABLE `taxes` (
  `id` bigint(20) NOT NULL,
  `name` varchar(225) NOT NULL,
  `rate` float NOT NULL,
  `type` enum('P','F') NOT NULL,
  `geozone_id` bigint(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `taxes`
--

INSERT INTO `taxes` (`id`, `name`, `rate`, `type`, `geozone_id`, `created_at`, `updated_at`) VALUES
(1, 'GST 20%', 20, 'P', 12, '2020-10-07 17:37:08', '2020-10-07 17:37:08'),
(2, 'GST 12%', 12, 'P', 13, '2020-10-07 17:38:36', '2020-10-07 17:38:36');

-- --------------------------------------------------------

--
-- Table structure for table `taxes_classes`
--

CREATE TABLE `taxes_classes` (
  `id` bigint(20) NOT NULL,
  `tax_id` bigint(20) NOT NULL,
  `tax_class_id` bigint(20) NOT NULL,
  `priority` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `taxes_classes`
--

INSERT INTO `taxes_classes` (`id`, `tax_id`, `tax_class_id`, `priority`) VALUES
(29, 1, 11, 4),
(30, 2, 11, 3),
(31, 1, 11, 5);

-- --------------------------------------------------------

--
-- Table structure for table `tax_classes`
--

CREATE TABLE `tax_classes` (
  `id` bigint(20) NOT NULL,
  `title` varchar(225) NOT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `tax_classes`
--

INSERT INTO `tax_classes` (`id`, `title`, `description`, `created_at`, `updated_at`) VALUES
(11, 'Online order', 'cklmcs cmksmc ', '2020-10-08 18:08:12', '2020-10-08 19:16:48');

-- --------------------------------------------------------

--
-- Table structure for table `uploads`
--

CREATE TABLE `uploads` (
  `id` bigint(20) NOT NULL,
  `name` varchar(225) DEFAULT NULL,
  `url` varchar(1000) NOT NULL,
  `path` varchar(1000) NOT NULL,
  `type` varchar(225) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `uploads`
--

INSERT INTO `uploads` (`id`, `name`, `url`, `path`, `type`, `created_at`, `updated_at`) VALUES
(151, '9be1f6dd14-235 - Copy.jpg', '/uploads/9be1f6dd14-235 - Copy.jpg', 'D:\\Projects\\node_practice\\public\\uploads\\9be1f6dd14-235 - Copy.jpg', 'image/jpeg', '2020-10-17 20:13:17', '2020-10-17 20:13:17'),
(152, '1.png', '/uploads/1.png', 'D:\\Projects\\node_practice\\public\\uploads\\1.png', 'image/png', '2020-10-17 20:13:53', '2020-10-17 20:13:53'),
(153, '4.png', '/uploads/4.png', 'D:\\Projects\\node_practice\\public\\uploads\\4.png', 'image/png', '2020-10-17 20:13:53', '2020-10-17 20:13:53'),
(154, '5.png', '/uploads/5.png', 'D:\\Projects\\node_practice\\public\\uploads\\5.png', 'image/png', '2020-10-17 20:13:54', '2020-10-17 20:13:54'),
(155, '6.png', '/uploads/6.png', 'D:\\Projects\\node_practice\\public\\uploads\\6.png', 'image/png', '2020-10-17 20:13:54', '2020-10-17 20:13:54'),
(156, '7.png', '/uploads/7.png', 'D:\\Projects\\node_practice\\public\\uploads\\7.png', 'image/png', '2020-10-17 20:13:54', '2020-10-17 20:13:54'),
(157, '8.png', '/uploads/8.png', 'D:\\Projects\\node_practice\\public\\uploads\\8.png', 'image/png', '2020-10-17 20:13:54', '2020-10-17 20:13:54'),
(158, 'alo.png', '/uploads/alo.png', 'D:\\Projects\\node_practice\\public\\uploads\\alo.png', 'image/png', '2020-10-17 20:14:02', '2020-10-17 20:14:02'),
(159, 'Logo-E-TEX2.png', '/uploads/Logo-E-TEX2.png', 'D:\\Projects\\node_practice\\public\\uploads\\Logo-E-TEX2.png', 'image/png', '2020-10-17 20:14:02', '2020-10-17 20:14:02'),
(160, 'mg.png', '/uploads/mg.png', 'D:\\Projects\\node_practice\\public\\uploads\\mg.png', 'image/png', '2020-10-17 20:14:02', '2020-10-17 20:14:02'),
(161, 'Oswaal-Logo.png', '/uploads/Oswaal-Logo.png', 'D:\\Projects\\node_practice\\public\\uploads\\Oswaal-Logo.png', 'image/png', '2020-10-17 20:14:03', '2020-10-17 20:14:03'),
(164, 'spritslogo.png', '/uploads/spritslogo.png', 'D:\\Projects\\node_practice\\public\\uploads\\spritslogo.png', 'image/png', '2020-10-17 20:14:03', '2020-10-17 20:14:03'),
(165, 'up.png', '/uploads/up.png', 'D:\\Projects\\node_practice\\public\\uploads\\up.png', 'image/png', '2020-10-17 20:14:03', '2020-10-17 20:14:03'),
(166, 'wk.png', '/uploads/wk.png', 'D:\\Projects\\node_practice\\public\\uploads\\wk.png', 'image/png', '2020-10-17 20:14:03', '2020-10-17 20:14:03'),
(167, 'Divya_-_Oswaal_Books-removebg-preview.png', '/uploads/Divya_-_Oswaal_Books-removebg-preview.png', 'D:\\Projects\\node_practice\\public\\uploads\\Divya_-_Oswaal_Books-removebg-preview.png', 'image/png', '2020-10-17 20:14:29', '2020-10-17 20:14:29'),
(168, 'Dr_Dinesh-removebg-preview.png', '/uploads/Dr_Dinesh-removebg-preview.png', 'D:\\Projects\\node_practice\\public\\uploads\\Dr_Dinesh-removebg-preview.png', 'image/png', '2020-10-17 20:14:29', '2020-10-17 20:14:29'),
(169, 'Dr-Mahesh.png', '/uploads/Dr-Mahesh.png', 'D:\\Projects\\node_practice\\public\\uploads\\Dr-Mahesh.png', 'image/png', '2020-10-17 20:14:29', '2020-10-17 20:14:29'),
(170, 'Harshita - Alohya.png', '/uploads/Harshita - Alohya.png', 'D:\\Projects\\node_practice\\public\\uploads\\Harshita - Alohya.png', 'image/png', '2020-10-17 20:14:30', '2020-10-17 20:14:30'),
(171, 'Mr Raghvan - Radmax.png', '/uploads/Mr Raghvan - Radmax.png', 'D:\\Projects\\node_practice\\public\\uploads\\Mr Raghvan - Radmax.png', 'image/png', '2020-10-17 20:14:30', '2020-10-17 20:14:30'),
(172, 'Neeraj_Singhal-removebg-preview.png', '/uploads/Neeraj_Singhal-removebg-preview.png', 'D:\\Projects\\node_practice\\public\\uploads\\Neeraj_Singhal-removebg-preview.png', 'image/png', '2020-10-17 20:14:30', '2020-10-17 20:14:30'),
(173, '04.jpg', '/uploads/04.jpg', 'D:\\Projects\\node_practice\\public\\uploads\\04.jpg', 'image/jpeg', '2020-10-17 20:14:59', '2020-10-17 20:14:59'),
(174, 'abcFinal.png', '/uploads/abcFinal.png', 'D:\\Projects\\node_practice\\public\\uploads\\abcFinal.png', 'image/png', '2020-10-17 20:14:59', '2020-10-17 20:14:59'),
(175, 'accounting.png', '/uploads/accounting.png', 'D:\\Projects\\node_practice\\public\\uploads\\accounting.png', 'image/png', '2020-10-17 20:14:59', '2020-10-17 20:14:59'),
(176, 'Be-close.png', '/uploads/Be-close.png', 'D:\\Projects\\node_practice\\public\\uploads\\Be-close.png', 'image/png', '2020-10-17 20:15:00', '2020-10-17 20:15:00'),
(184, 'Warehouse-backed.png', '/uploads/Warehouse-backed.png', 'D:\\Projects\\node_practice\\public\\uploads\\Warehouse-backed.png', 'image/png', '2020-10-17 20:15:27', '2020-10-17 20:15:27'),
(185, 'wfull.png', '/uploads/wfull.png', 'D:\\Projects\\node_practice\\public\\uploads\\wfull.png', 'image/png', '2020-10-17 20:15:27', '2020-10-17 20:15:27'),
(186, 'Your.png', '/uploads/Your.png', 'D:\\Projects\\node_practice\\public\\uploads\\Your.png', 'image/png', '2020-10-17 20:15:27', '2020-10-17 20:15:27'),
(187, 'Mobile (1).jpg', '/uploads/Mobile (1).jpg', 'D:\\Projects\\node_practice\\public\\uploads\\Mobile (1).jpg', 'image/jpeg', '2020-10-23 17:56:24', '2020-10-23 17:56:24'),
(188, 'Desktop (1).jpg', '/uploads/Desktop (1).jpg', 'D:\\Projects\\node_practice\\public\\uploads\\Desktop (1).jpg', 'image/jpeg', '2020-10-23 17:56:36', '2020-10-23 17:56:36');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) NOT NULL,
  `email` varchar(225) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `password` varchar(500) NOT NULL,
  `name` varchar(225) DEFAULT NULL,
  `status` tinyint(4) NOT NULL,
  `token` varchar(1000) DEFAULT NULL,
  `additional_info` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `phone`, `password`, `name`, `status`, `token`, `additional_info`, `created_at`, `updated_at`) VALUES
(80, 'vik@gmail.com', '8978786756', 'sha1$53720c1b$1$8aad99e9049f8da70280edd13434c08e9e5b0c83', 'Vikas Saini', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InZpa0BnbWFpbC5jb20iLCJpYXQiOjE2MDA4ODY3NjgsImV4cCI6MTYwMDg5Mzk2OH0.GlTtfPVZXMbKcNRLh0ZW97G9pw62y_cskVQA-j-5BTQ', '[]', '2020-09-23 18:46:08', '2020-10-14 20:12:42'),
(88, 'saini.vikas63ssss0@gmail.com', '8376827257', 'sha1$ada7821d$1$c329b9fd4f10294cbdf0809666aaaec5fe420f53', 'Vikas Saini', 0, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InNhaW5pLnZpa2FzNjNzc3NzMEBnbWFpbC5jb20iLCJpYXQiOjE2MDA5ODA4MTQsImV4cCI6MTYwMDk4ODAxNH0.vRSl6DJ1W0PRvYjYPMpVlF5NMSheUk0V2qBFHpUcbXg', '[]', '2020-09-24 20:53:34', '2020-10-02 12:39:05'),
(89, 'saini.vikas630@gmail.com', '9318431969', 'sha1$ada7821d$1$c329b9fd4f10294cbdf0809666aaaec5fe420f53', 'Vikas Saini', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InNhaW5pLnZpa2FzNjMwQGdtYWlsLmNvbSIsImlhdCI6MTYwMTY0MjU0MSwiZXhwIjoxNjAxNjQ5NzQxfQ.PtYVMSAbsPglhFBJnOogdpx1CLzJwNvGZ2dnpOAxg90', '[]', '2020-10-02 11:57:37', '2020-10-02 12:42:21'),
(90, 'user@example.com', '8376827257', 'sha1$f563be46$1$dee437e12410a124ea410ceb6a08f5c730612925', 'User', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE2MDM4MjAwODksImV4cCI6MTYwMzgyNzI4OX0.bMoMh1yg5Y0EiwCg3-KjgggHjoQ38Wx9Epcub-t3oXs', '[]', '2020-10-08 20:02:30', '2020-10-27 17:34:49'),
(91, 'vikas@prozo.com', '8376827257', 'sha1$68532b1d$1$abe589b9996848fff2e07dcb2723dea931c51536', 'Vikas Saini', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InZpa2FzQHByb3pvLmNvbSIsImlhdCI6MTYwMzc4NzMxOSwiZXhwIjoxNjAzNzk0NTE5fQ.hIcNiHOJ0-IE54rmISDOzd_4244N-GRL8vCalJRSyXI', '[]', '2020-10-27 08:28:22', '2020-10-27 08:28:39');

-- --------------------------------------------------------

--
-- Table structure for table `users_roles`
--

CREATE TABLE `users_roles` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `role_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `users_roles`
--

INSERT INTO `users_roles` (`id`, `user_id`, `role_id`) VALUES
(9, 80, 1),
(10, 80, 14),
(11, 80, 15),
(8, 88, 1),
(12, 89, 1),
(13, 90, 1),
(14, 91, 14),
(15, 91, 15);

-- --------------------------------------------------------

--
-- Table structure for table `weight_classes`
--

CREATE TABLE `weight_classes` (
  `id` bigint(20) NOT NULL,
  `title` varchar(225) NOT NULL,
  `unit` varchar(10) NOT NULL,
  `value` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `weight_classes`
--

INSERT INTO `weight_classes` (`id`, `title`, `unit`, `value`) VALUES
(1, 'Kilogram', 'kg', 5.23);

-- --------------------------------------------------------

--
-- Table structure for table `zones`
--

CREATE TABLE `zones` (
  `id` bigint(20) NOT NULL,
  `name` varchar(225) DEFAULT NULL,
  `code` varchar(10) DEFAULT NULL,
  `country_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `zones`
--

INSERT INTO `zones` (`id`, `name`, `code`, `country_id`) VALUES
(1, 'Uttar Pradesh', 'UP', 10),
(2, 'Punjab', 'PUB', 10),
(3, 'Uttrakhand', 'UK', 10),
(4, 'Newyork', 'NY', 11);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `attributes`
--
ALTER TABLE `attributes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `attribute_values`
--
ALTER TABLE `attribute_values`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `categoriesancestors`
--
ALTER TABLE `categoriesancestors`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `countries`
--
ALTER TABLE `countries`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `currencies`
--
ALTER TABLE `currencies`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `filters`
--
ALTER TABLE `filters`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `filter_values`
--
ALTER TABLE `filter_values`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `geozones`
--
ALTER TABLE `geozones`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `geozones_zones`
--
ALTER TABLE `geozones_zones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `DeleteWhenZoneDelete` (`zone_id`),
  ADD KEY `DeleteWhenGeoZoneDelete` (`geozone_id`);

--
-- Indexes for table `length_classes`
--
ALTER TABLE `length_classes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `menus`
--
ALTER TABLE `menus`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sku` (`sku`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `products_attribute_values`
--
ALTER TABLE `products_attribute_values`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `products_categories`
--
ALTER TABLE `products_categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `products_filter_values`
--
ALTER TABLE `products_filter_values`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `products_uploads`
--
ALTER TABLE `products_uploads`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `roles_menus`
--
ALTER TABLE `roles_menus`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `taxes`
--
ALTER TABLE `taxes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `DeleteTaxWhenGeoZoneDelete` (`geozone_id`);

--
-- Indexes for table `taxes_classes`
--
ALTER TABLE `taxes_classes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `DeleteWhenTaxDelete` (`tax_id`),
  ADD KEY `DeleteWhenTaxClassDeleted` (`tax_class_id`);

--
-- Indexes for table `tax_classes`
--
ALTER TABLE `tax_classes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `uploads`
--
ALTER TABLE `uploads`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UniqueEmailAndPhone` (`email`,`phone`) USING BTREE;

--
-- Indexes for table `users_roles`
--
ALTER TABLE `users_roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UserRole` (`user_id`,`role_id`) USING BTREE,
  ADD KEY `UsersRolesDeleteRole` (`role_id`);

--
-- Indexes for table `weight_classes`
--
ALTER TABLE `weight_classes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `zones`
--
ALTER TABLE `zones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ZoneDeleteOnCountryDelete` (`country_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `attributes`
--
ALTER TABLE `attributes`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `attribute_values`
--
ALTER TABLE `attribute_values`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `categoriesancestors`
--
ALTER TABLE `categoriesancestors`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `countries`
--
ALTER TABLE `countries`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `coupons`
--
ALTER TABLE `coupons`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `currencies`
--
ALTER TABLE `currencies`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `filters`
--
ALTER TABLE `filters`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `filter_values`
--
ALTER TABLE `filter_values`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT for table `geozones`
--
ALTER TABLE `geozones`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `geozones_zones`
--
ALTER TABLE `geozones_zones`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `length_classes`
--
ALTER TABLE `length_classes`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `menus`
--
ALTER TABLE `menus`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `products_attribute_values`
--
ALTER TABLE `products_attribute_values`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `products_categories`
--
ALTER TABLE `products_categories`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `products_filter_values`
--
ALTER TABLE `products_filter_values`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `products_uploads`
--
ALTER TABLE `products_uploads`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `roles_menus`
--
ALTER TABLE `roles_menus`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `taxes`
--
ALTER TABLE `taxes`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `taxes_classes`
--
ALTER TABLE `taxes_classes`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `tax_classes`
--
ALTER TABLE `tax_classes`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `uploads`
--
ALTER TABLE `uploads`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=189;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=92;

--
-- AUTO_INCREMENT for table `users_roles`
--
ALTER TABLE `users_roles`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `weight_classes`
--
ALTER TABLE `weight_classes`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `zones`
--
ALTER TABLE `zones`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `geozones_zones`
--
ALTER TABLE `geozones_zones`
  ADD CONSTRAINT `DeleteWhenGeoZoneDelete` FOREIGN KEY (`geozone_id`) REFERENCES `geozones` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `DeleteWhenZoneDelete` FOREIGN KEY (`zone_id`) REFERENCES `zones` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `taxes`
--
ALTER TABLE `taxes`
  ADD CONSTRAINT `DeleteTaxWhenGeoZoneDelete` FOREIGN KEY (`geozone_id`) REFERENCES `geozones` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `taxes_classes`
--
ALTER TABLE `taxes_classes`
  ADD CONSTRAINT `DeleteWhenTaxClassDeleted` FOREIGN KEY (`tax_class_id`) REFERENCES `tax_classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `DeleteWhenTaxDelete` FOREIGN KEY (`tax_id`) REFERENCES `taxes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `zones`
--
ALTER TABLE `zones`
  ADD CONSTRAINT `ZoneDeleteOnCountryDelete` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
