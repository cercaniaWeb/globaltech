-- Enable uuid-ossp if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- Tabla para gestionar los sitios y clientes de GlobalTD
CREATE TABLE IF NOT EXISTS clientes_cctv (
  id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  nombre_cliente TEXT NOT NULL, -- Ej: "Grupo Moravi"
  usuario_dvr TEXT,             -- Ej: "moravi"
  pass_dvr TEXT,                -- Tu estándar root@GTD
  email_notificaciones TEXT,
  sitio_hik_id TEXT,            -- Aquí pondremos el ID que nos de la API (ej: Site_5233...)
  status_actual TEXT DEFAULT 'Offline',
  ultimo_chequeo TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para los dispositivos específicos
CREATE TABLE IF NOT EXISTS dispositivos_hik (
  id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes_cctv(id),
  modelo_equipo TEXT,
  numero_serie TEXT UNIQUE,     -- Vital para la API
  canales_activos INTEGER,
  ubicacion_lat_long POINT      -- Para el mapa que vimos en tu perfil
);
