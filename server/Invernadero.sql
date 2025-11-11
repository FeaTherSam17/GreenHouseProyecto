-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 15-05-2025 a las 15:57:43
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `invernadero`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE DATABASE invernadero;
USE invernadero;

CREATE TABLE `categorias` (
  `id_categoria` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id_categoria`, `nombre`, `descripcion`) VALUES
(1, 'Plantas', 'Todo tipo de plantas'),
(2, 'Herramientas', 'Herramientas para jardinería');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_ventas`
--

CREATE TABLE `detalle_ventas` (
  `id_detalle` int(11) NOT NULL,
  `id_venta` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detalle_ventas`
--

INSERT INTO `detalle_ventas` (`id_detalle`, `id_venta`, `id_producto`, `cantidad`, `precio_unitario`, `total`) VALUES
(1, 1, 1, 2, 50.00, 100.00),
(2, 1, 3, 2, 35.00, 70.00),
(3, 1, 2, 1, 30.00, 30.00),
(4, 2, 4, 1, 90.00, 90.00),
(5, 2, 3, 1, 30.00, 30.00),
(6, 3, 4, 1, 90.00, 90.00),
(7, 4, 4, 1, 90.00, 90.00),
(8, 5, 8, 3, 1546.00, 4638.00),
(9, 6, 8, 4, 1546.00, 6184.00),
(10, 7, 8, 4158, 1546.00, 6428268.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `operaciones_proveedores`
--

CREATE TABLE `operaciones_proveedores` (
  `id_operacion` int(11) NOT NULL,
  `tipo` enum('compra','pago','devolucion') NOT NULL,
  `id_proveedor` int(11) NOT NULL,
  `fecha` datetime DEFAULT current_timestamp(),
  `total` decimal(12,2) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `operaciones_proveedores`
--

INSERT INTO `operaciones_proveedores` (`id_operacion`, `tipo`, `id_proveedor`, `fecha`, `total`, `descripcion`) VALUES
(1, 'compra', 1, '2024-06-09 09:00:00', 500.00, 'Compra de plantas varias'),
(2, 'pago', 2, '2024-06-12 12:00:00', 200.00, 'Pago parcial de herramientas'),
(6, 'compra', 2, '2025-05-14 00:00:00', 4511.00, 'rkjwnglkwernglwkernglwkernglwkjernglwkenrglkwjernglwkernglwkerjnglwkjernglwkjernglwkjernglwkejrnglkw'),
(7, 'compra', 2, '2025-05-15 00:00:00', 10.00, 'wererrrrrrrrrwererrrrrrrrrwererrrrrrrrrwererrrrrrrrrwererrrrrrrrrwererrrrrrrrrwererrrrrrrrrwererrrrr');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto`
--

CREATE TABLE `producto` (
  `id_producto` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `id_categoria` int(11) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `id_proveedor` int(11) DEFAULT NULL,
  `stock` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `producto`
--

INSERT INTO `producto` (`id_producto`, `nombre`, `id_categoria`, `precio`, `id_proveedor`, `stock`) VALUES
(1, 'Rosa Roja', 1, 50.00, 1, 100),
(2, 'Pala de mano', 2, 120.00, 2, 30),
(3, 'Helecho', 1, 35.00, 1, 80),
(4, 'Tijeras de podar', 2, 90.00, 2, 23),
(6, 'Bern', 2, 200.00, 4, 50),
(8, 'rqwerqwerrqwe', 1, 1546.00, 4, 0),
(9, 'berniflor', 1, 10.00, 6, 10);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedores`
--

CREATE TABLE `proveedores` (
  `id_proveedor` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `contacto` varchar(100) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `email` varchar(100) NOT NULL,
  `factura` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `proveedores`
--

INSERT INTO `proveedores` (`id_proveedor`, `nombre`, `contacto`, `telefono`, `email`, `factura`) VALUES
(1, 'Vivero Central', 'María Torres', '555-1234', 'vivero@central.com', 'FAC-001'),
(2, 'Herramientas MX', 'Pedro Gómez', '555-5678', 'herramientas@mx.com', 'FAC-002'),
(4, 'prueba', 'lol', '778978798798451', 'fjrr@gmail.com', ''),
(6, 'Bernoulli', 'Gordito', '445161231213213', 'bernyflor15@berny.com', '12');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id_rol` int(11) NOT NULL,
  `nombre_rol` varchar(50) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id_rol`, `nombre_rol`, `descripcion`) VALUES
(1, 'Administrador', 'Acceso total al sistema'),
(2, 'Almacenista', 'Gestión de inventario y productos'),
(3, 'Cajero', 'Gestión de ventas y cobros'),
(4, 'Jardinero', 'Gestión de tareas de jardinería');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tareas`
--

CREATE TABLE `tareas` (
  `id_tarea` int(11) NOT NULL,
  `titulo` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `prioridad` enum('baja','media','alta') DEFAULT 'media',
  `fecha_limite` date DEFAULT NULL,
  `completada` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tareas`
--

INSERT INTO `tareas` (`id_tarea`, `titulo`, `descripcion`, `prioridad`, `fecha_limite`, `completada`) VALUES
(1, 'Regar plantas', 'Regar todas las plantas del invernadero', 'alta', '2024-06-15', 0),
(6, 'werewrvrtneroitunher', 'fwoeiunvoirnvieurhtgoiuerhvtgi bgnoiurehgouirhguifndbljkdfngkj  dnfv ndv nmv mn m,d f,md b,md bmndf ', 'baja', '2025-05-23', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellidoP` varchar(50) NOT NULL,
  `apellidoM` varchar(50) NOT NULL,
  `username` varchar(30) NOT NULL,
  `id_rol` int(11) NOT NULL,
  `password` varchar(255) NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `nombre`, `apellidoP`, `apellidoM`, `username`, `id_rol`, `password`, `fecha_creacion`) VALUES
(1, 'Erika', 'Qewr', 'Qwer', 'admin1', 4, '$2b$10$lpTl/Sb6iwqG0C98nD9y/uNxhpEDF1U3BvRP4mJkeER7tza9.hLQK', '2025-05-13 16:42:24'),
(2, 'Luis', 'Martínez', 'Ruiz', 'almacen1', 2, '$2b$10$yS4DXa/dENMr0TOshr3NO.vz07Ni4LqHca9TnvcXmk7BfEatsHxn.', '2025-05-13 16:42:24'),
(3, 'Sofía', 'Pérez', 'Santos', 'cajero1', 3, '$2b$10$9nGE6XrTHnepRYNmD9JQPOXqsXAjQUzWpCG3TMsC..3t94E7quNAe', '2025-05-13 16:42:24'),
(4, 'Carlos', 'Hernández', 'Vega', 'jardinero1', 4, '$2b$10$b3xZg.sNZ/iQO3eRzO6Y..EtQiUjYN6PFu.sJUbbXBkBLarTxUeea', '2025-05-13 16:42:24'),
(6, 'Erika', 'Addams', 'Ravenscroft', 'erikaA', 1, '$2b$10$DSRpxurEsuOyeguqHA6rRu8DV0BUZf97QBeI/SXC0/ZWVSdbX.AMW', '2025-05-13 17:47:15'),
(7, 'Qwer', 'Qwer', 'Qwer', 'qwer', 4, '$2b$10$6IH0sCgmj8agnon8aADfCOGicnwB6hzJI0Q8UltcCf.MPKnSJE6va', '2025-05-13 18:20:24'),
(10, 'Samuel', 'Alcantara', 'Fernandez', 'sam', 1, '$2b$10$d2AXT4i4Hk1buoDUO7/gf.UMDNmH6NDpkrqa14w7Wu.WvEZwvnO1i', '2025-05-13 18:34:36'),
(11, 'Cajerp', 'Caja', 'Cajetin', 'cajero', 3, '$2b$10$J42MB2hAaYy2x..aiOCIruUTF.wjjgB1GDxttyv9/4PvoEQIZIbRm', '2025-05-13 19:11:24'),
(12, 'Jardin', 'Jairo', 'Jairo', 'jardinero', 4, '$2b$10$ylo6lmGPof0yvtEmItZIJ.wHb7aOxkNvw3Ehef5DIaY5BQ8RR6OLq', '2025-05-13 19:11:39'),
(13, 'Alma', 'Alma', 'Alma', 'alma', 2, '$2b$10$wxcsH34FbgPbRn/w8N44TuA6p6Z.FnOwYefC2zqa69GJmuUCzxe8G', '2025-05-13 19:12:01'),
(15, 'Tobo', 'Nogijbnod', 'Weirngwe', 'wertwlejht', 2, '$2b$10$mZEEvMmkXOTElbqyH/nQiOt.H1feHIi.1NhiEG.LIISWjIv18eTta', '2025-05-15 07:52:26');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios_tareas`
--

CREATE TABLE `usuarios_tareas` (
  `id_usuario` int(11) NOT NULL,
  `id_tarea` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios_tareas`
--

INSERT INTO `usuarios_tareas` (`id_usuario`, `id_tarea`) VALUES
(4, 1),
(12, 6);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ventas`
--

CREATE TABLE `ventas` (
  `id_venta` int(11) NOT NULL,
  `fecha` datetime DEFAULT current_timestamp(),
  `total` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ventas`
--

INSERT INTO `ventas` (`id_venta`, `fecha`, `total`) VALUES
(1, '2024-06-10 10:30:00', 200.00),
(2, '2024-06-11 15:45:00', 120.00),
(3, '2025-05-14 00:00:00', 90.00),
(4, '2025-05-14 00:00:00', 90.00),
(5, '2025-05-14 00:00:00', 4638.00),
(6, '2025-05-14 00:00:00', 6184.00),
(7, '2025-05-14 00:00:00', 6428268.00);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id_categoria`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `detalle_ventas`
--
ALTER TABLE `detalle_ventas`
  ADD PRIMARY KEY (`id_detalle`),
  ADD KEY `id_venta` (`id_venta`),
  ADD KEY `id_producto` (`id_producto`);

--
-- Indices de la tabla `operaciones_proveedores`
--
ALTER TABLE `operaciones_proveedores`
  ADD PRIMARY KEY (`id_operacion`),
  ADD KEY `id_proveedor` (`id_proveedor`);

--
-- Indices de la tabla `producto`
--
ALTER TABLE `producto`
  ADD PRIMARY KEY (`id_producto`),
  ADD KEY `id_categoria` (`id_categoria`),
  ADD KEY `id_proveedor` (`id_proveedor`);

--
-- Indices de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  ADD PRIMARY KEY (`id_proveedor`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `factura` (`factura`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id_rol`);

--
-- Indices de la tabla `tareas`
--
ALTER TABLE `tareas`
  ADD PRIMARY KEY (`id_tarea`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `id_rol` (`id_rol`);

--
-- Indices de la tabla `usuarios_tareas`
--
ALTER TABLE `usuarios_tareas`
  ADD PRIMARY KEY (`id_usuario`,`id_tarea`),
  ADD KEY `id_tarea` (`id_tarea`);

--
-- Indices de la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD PRIMARY KEY (`id_venta`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `detalle_ventas`
--
ALTER TABLE `detalle_ventas`
  MODIFY `id_detalle` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `operaciones_proveedores`
--
ALTER TABLE `operaciones_proveedores`
  MODIFY `id_operacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `producto`
--
ALTER TABLE `producto`
  MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  MODIFY `id_proveedor` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id_rol` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `tareas`
--
ALTER TABLE `tareas`
  MODIFY `id_tarea` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `ventas`
--
ALTER TABLE `ventas`
  MODIFY `id_venta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `detalle_ventas`
--
ALTER TABLE `detalle_ventas`
  ADD CONSTRAINT `detalle_ventas_ibfk_1` FOREIGN KEY (`id_venta`) REFERENCES `ventas` (`id_venta`),
  ADD CONSTRAINT `detalle_ventas_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`);

--
-- Filtros para la tabla `operaciones_proveedores`
--
ALTER TABLE `operaciones_proveedores`
  ADD CONSTRAINT `operaciones_proveedores_ibfk_1` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedores` (`id_proveedor`);

--
-- Filtros para la tabla `producto`
--
ALTER TABLE `producto`
  ADD CONSTRAINT `producto_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id_categoria`),
  ADD CONSTRAINT `producto_ibfk_2` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedores` (`id_proveedor`);

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`);

--
-- Filtros para la tabla `usuarios_tareas`
--
ALTER TABLE `usuarios_tareas`
  ADD CONSTRAINT `usuarios_tareas_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  ADD CONSTRAINT `usuarios_tareas_ibfk_2` FOREIGN KEY (`id_tarea`) REFERENCES `tareas` (`id_tarea`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
