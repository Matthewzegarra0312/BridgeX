-- =============================================================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS DE EJEMPLO
-- Sistema de Reportes - Base de datos MySQL
-- =============================================================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS reportes_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE reportes_db;

-- =============================================================================
-- TABLA DE CLIENTES
-- =============================================================================

CREATE TABLE IF NOT EXISTS clientes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  telefono VARCHAR(20),
  direccion TEXT,
  ciudad VARCHAR(100),
  pais VARCHAR(100) DEFAULT 'México',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_ciudad (ciudad),
  INDEX idx_created_at (created_at)
);

-- =============================================================================
-- TABLA DE CATEGORÍAS DE PRODUCTOS
-- =============================================================================

CREATE TABLE IF NOT EXISTS categorias (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- TABLA DE PRODUCTOS
-- =============================================================================

CREATE TABLE IF NOT EXISTS productos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  categoria_id INT,
  stock INT DEFAULT 0,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (categoria_id) REFERENCES categorias(id),
  INDEX idx_categoria (categoria_id),
  INDEX idx_precio (precio),
  INDEX idx_activo (activo)
);

-- =============================================================================
-- TABLA DE VENTAS
-- =============================================================================

CREATE TABLE IF NOT EXISTS ventas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cliente_id INT,
  producto_id INT,
  cantidad INT NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(10,2) NOT NULL,
  monto DECIMAL(10,2) NOT NULL, -- cantidad * precio_unitario
  descuento DECIMAL(10,2) DEFAULT 0,
  impuestos DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL, -- monto - descuento + impuestos
  metodo_pago ENUM('efectivo', 'tarjeta', 'transferencia', 'otro') DEFAULT 'efectivo',
  estado ENUM('pendiente', 'completada', 'cancelada') DEFAULT 'completada',
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (cliente_id) REFERENCES clientes(id),
  FOREIGN KEY (producto_id) REFERENCES productos(id),
  INDEX idx_cliente (cliente_id),
  INDEX idx_producto (producto_id),
  INDEX idx_fecha (fecha),
  INDEX idx_estado (estado),
  INDEX idx_monto (monto)
);

-- =============================================================================
-- TABLA DE USUARIOS (PARA REPORTES DE ACTIVIDAD)
-- =============================================================================

CREATE TABLE IF NOT EXISTS usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  rol ENUM('admin', 'vendedor', 'analista') DEFAULT 'vendedor',
  activo BOOLEAN DEFAULT TRUE,
  ultimo_acceso TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_rol (rol),
  INDEX idx_ultimo_acceso (ultimo_acceso)
);

-- =============================================================================
-- TABLA DE SESIONES/ACTIVIDAD
-- =============================================================================

CREATE TABLE IF NOT EXISTS actividad_usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT,
  accion VARCHAR(100) NOT NULL,
  descripcion TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  INDEX idx_usuario (usuario_id),
  INDEX idx_fecha (fecha),
  INDEX idx_accion (accion)
);

-- =============================================================================
-- DATOS DE EJEMPLO
-- =============================================================================

-- Insertar categorías de ejemplo
INSERT INTO categorias (nombre, descripcion) VALUES
('Electrónicos', 'Dispositivos electrónicos y gadgets'),
('Ropa', 'Vestimenta y accesorios'),
('Hogar', 'Artículos para el hogar'),
('Deportes', 'Artículos deportivos y fitness'),
('Libros', 'Libros y material educativo');

-- Insertar productos de ejemplo
INSERT INTO productos (nombre, descripcion, precio, categoria_id, stock) VALUES
('iPhone 14', 'Smartphone Apple iPhone 14 128GB', 25999.00, 1, 50),
('Samsung Galaxy S23', 'Smartphone Samsung Galaxy S23', 22999.00, 1, 30),
('Laptop Dell XPS 13', 'Laptop Dell XPS 13 Intel i7', 35999.00, 1, 20),
('Camiseta Nike', 'Camiseta deportiva Nike talla M', 799.00, 2, 100),
('Jeans Levis', 'Pantalón mezclilla Levis 501', 1299.00, 2, 75),
('Aspiradora Dyson', 'Aspiradora sin cable Dyson V11', 8999.00, 3, 15),
('Cafetera Nespresso', 'Cafetera automática Nespresso', 3999.00, 3, 25),
('Bicicleta Trek', 'Bicicleta de montaña Trek 26"', 12999.00, 4, 10),
('Libro "El Quijote"', 'Don Quijote de la Mancha - Edición especial', 399.00, 5, 200);

-- Insertar clientes de ejemplo
INSERT INTO clientes (nombre, email, telefono, ciudad) VALUES
('Juan Pérez', 'juan.perez@email.com', '555-0101', 'Ciudad de México'),
('María García', 'maria.garcia@email.com', '555-0102', 'Guadalajara'),
('Carlos López', 'carlos.lopez@email.com', '555-0103', 'Monterrey'),
('Ana Martínez', 'ana.martinez@email.com', '555-0104', 'Puebla'),
('Luis Rodríguez', 'luis.rodriguez@email.com', '555-0105', 'Tijuana'),
('Carmen Sánchez', 'carmen.sanchez@email.com', '555-0106', 'León'),
('Roberto Torres', 'roberto.torres@email.com', '555-0107', 'Juárez'),
('Laura Flores', 'laura.flores@email.com', '555-0108', 'Torreón'),
('Miguel Herrera', 'miguel.herrera@email.com', '555-0109', 'Querétaro'),
('Patricia Jiménez', 'patricia.jimenez@email.com', '555-0110', 'Mérida');

-- Insertar usuarios del sistema
INSERT INTO usuarios (nombre, email, rol) VALUES
('Administrador', 'admin@empresa.com', 'admin'),
('Vendedor 1', 'vendedor1@empresa.com', 'vendedor'),
('Analista de Datos', 'analista@empresa.com', 'analista');

-- =============================================================================
-- GENERAR DATOS DE VENTAS DE EJEMPLO (ÚLTIMO MES)
-- =============================================================================

-- Procedimiento para generar ventas aleatorias
DELIMITER //

CREATE PROCEDURE GenerarVentasEjemplo()
BEGIN
  DECLARE done INT DEFAULT FALSE;
  DECLARE v_cliente_id INT;
  DECLARE v_producto_id INT;
  DECLARE v_precio DECIMAL(10,2);
  DECLARE v_cantidad INT;
  DECLARE v_fecha DATETIME;
  DECLARE i INT DEFAULT 0;
  
  -- Generar 500 ventas de ejemplo en el último mes
  WHILE i < 500 DO
    -- Cliente aleatorio
    SET v_cliente_id = FLOOR(1 + (RAND() * 10));
    
    -- Producto aleatorio
    SET v_producto_id = FLOOR(1 + (RAND() * 9));
    
    -- Obtener precio del producto
    SELECT precio INTO v_precio FROM productos WHERE id = v_producto_id;
    
    -- Cantidad aleatoria (1-5)
    SET v_cantidad = FLOOR(1 + (RAND() * 5));
    
    -- Fecha aleatoria en los últimos 30 días
    SET v_fecha = DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 30) DAY);
    SET v_fecha = DATE_ADD(v_fecha, INTERVAL FLOOR(RAND() * 24) HOUR);
    SET v_fecha = DATE_ADD(v_fecha, INTERVAL FLOOR(RAND() * 60) MINUTE);
    
    -- Insertar venta
    INSERT INTO ventas (
      cliente_id, 
      producto_id, 
      cantidad, 
      precio_unitario, 
      monto, 
      total, 
      fecha
    ) VALUES (
      v_cliente_id,
      v_producto_id,
      v_cantidad,
      v_precio,
      v_precio * v_cantidad,
      v_precio * v_cantidad,
      v_fecha
    );
    
    SET i = i + 1;
  END WHILE;
END //

DELIMITER ;

-- Ejecutar el procedimiento para generar datos de ejemplo
CALL GenerarVentasEjemplo();

-- Eliminar el procedimiento después de usarlo
DROP PROCEDURE GenerarVentasEjemplo;

-- =============================================================================
-- VISTAS ÚTILES PARA REPORTES
-- =============================================================================

-- Vista de ventas con detalles
CREATE VIEW vista_ventas_detalle AS
SELECT 
  v.id,
  v.fecha,
  c.nombre AS cliente,
  c.ciudad,
  p.nombre AS producto,
  cat.nombre AS categoria,
  v.cantidad,
  v.precio_unitario,
  v.monto,
  v.total,
  v.metodo_pago
FROM ventas v
LEFT JOIN clientes c ON v.cliente_id = c.id
LEFT JOIN productos p ON v.producto_id = p.id
LEFT JOIN categorias cat ON p.categoria_id = cat.id;

-- Vista de resumen diario de ventas
CREATE VIEW vista_ventas_diarias AS
SELECT 
  DATE(fecha) AS fecha,
  COUNT(*) AS total_transacciones,
  SUM(total) AS total_ventas,
  AVG(total) AS promedio_venta,
  COUNT(DISTINCT cliente_id) AS clientes_unicos
FROM ventas
WHERE estado = 'completada'
GROUP BY DATE(fecha)
ORDER BY fecha DESC;

-- Vista de productos más vendidos
CREATE VIEW vista_productos_top AS
SELECT 
  p.nombre AS producto,
  cat.nombre AS categoria,
  COUNT(v.id) AS cantidad_vendida,
  SUM(v.total) AS total_ventas,
  AVG(v.precio_unitario) AS precio_promedio
FROM productos p
LEFT JOIN ventas v ON p.id = v.producto_id
LEFT JOIN categorias cat ON p.categoria_id = cat.id
WHERE v.estado = 'completada' OR v.estado IS NULL
GROUP BY p.id, p.nombre, cat.nombre
ORDER BY total_ventas DESC;

-- =============================================================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN DE REPORTES
-- =============================================================================

-- Índices compuestos para consultas de reportes
CREATE INDEX idx_ventas_fecha_estado ON ventas(fecha, estado);
CREATE INDEX idx_ventas_cliente_fecha ON ventas(cliente_id, fecha);
CREATE INDEX idx_ventas_producto_fecha ON ventas(producto_id, fecha);

-- =============================================================================
-- PROCEDIMIENTOS ALMACENADOS PARA REPORTES COMUNES
-- =============================================================================

-- Procedimiento para reporte de ventas por período
DELIMITER //

CREATE PROCEDURE ReporteVentasPeriodo(
  IN fecha_inicio DATE,
  IN fecha_fin DATE
)
BEGIN
  SELECT 
    DATE(v.fecha) AS fecha,
    COUNT(*) AS total_transacciones,
    SUM(v.total) AS total_ventas,
    AVG(v.total) AS promedio_venta,
    COUNT(DISTINCT v.cliente_id) AS clientes_unicos,
    SUM(v.cantidad) AS productos_vendidos
  FROM ventas v
  WHERE DATE(v.fecha) BETWEEN fecha_inicio AND fecha_fin
    AND v.estado = 'completada'
  GROUP BY DATE(v.fecha)
  ORDER BY fecha DESC;
END //

DELIMITER ;

-- =============================================================================
-- VERIFICACIÓN DE LA INSTALACIÓN
-- =============================================================================

-- Mostrar estadísticas de la base de datos creada
SELECT 'Categorías' AS tabla, COUNT(*) AS registros FROM categorias
UNION ALL
SELECT 'Productos' AS tabla, COUNT(*) AS registros FROM productos
UNION ALL
SELECT 'Clientes' AS tabla, COUNT(*) AS registros FROM clientes
UNION ALL
SELECT 'Ventas' AS tabla, COUNT(*) AS registros FROM ventas
UNION ALL
SELECT 'Usuarios' AS tabla, COUNT(*) AS registros FROM usuarios;

-- Mostrar total de ventas del último mes
SELECT 
  COUNT(*) AS total_transacciones,
  SUM(total) AS total_ventas,
  AVG(total) AS promedio_venta,
  MIN(fecha) AS primera_venta,
  MAX(fecha) AS ultima_venta
FROM ventas 
WHERE fecha >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  AND estado = 'completada';

COMMIT;