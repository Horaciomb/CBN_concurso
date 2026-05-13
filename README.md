# Sistema de Gestión de Ganadores - Promoción Raspadita al Mundial CBN

Este proyecto es una aplicación web diseñada para gestionar el inventario y la entrega de premios de una campaña promocional. Permite registrar ganadores, descontar stock de productos, y mostrar el inventario actualizado al dueño de la campaña.

## Tecnologías utilizadas

- **Frontend**: React 18 + Vite
- **Estilos**: Tailwind CSS v3
- **Componentes UI**: shadcn/ui
- **Estado del servidor**: TanStack Query v5
- **Formularios**: React Hook Form + Zod
- **Backend**: Supabase (Auth, Storage, y Base de Datos)
- **Routing**: React Router v6

## Funcionalidades principales

### 1. **Gestión de ganadores (Admin)**
- CRUD completo de ganadores.
- Registro de entrega de premios con actualización automática del stock.
- Subida de imágenes para evidencias (formulario y entrega).
- Filtros avanzados por artículo, estado de entrega y búsqueda por nombre o código.
- Confirmación de entrega y eliminación lógica de registros.

### 2. **Inventario público**
- Vista pública del inventario con tarjetas de artículos.
- Barra de progreso visual para el stock restante.
- Detalle de ganadores confirmados por artículo.

### 3. **Autenticación**
- Login con email y contraseña usando Supabase Auth.
- Rutas protegidas para el panel de administración.

## Estructura del proyecto

```
src/
├── components/
│   ├── ui/                  # Componentes reutilizables (shadcn/ui)
│   ├── layout/              # Layouts para vistas públicas y admin
│   ├── ganadores/           # Componentes específicos para CRUD de ganadores
│   └── inventario/          # Componentes específicos para inventario público
├── pages/
│   ├── admin/               # Páginas protegidas (Login, Ganadores)
│   └── public/              # Páginas públicas (Inventario, Detalle de artículo)
├── hooks/                   # Hooks personalizados (auth, ganadores, artículos)
├── lib/                     # Configuración de Supabase, validaciones y cliente de queries
├── router/                  # Definición de rutas y guards
└── main.jsx                 # Punto de entrada principal
```

## Configuración inicial

### 1. Clonar el repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd Concurso_CBN/Frontend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:
```env
VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
VITE_SUPABASE_ANON_KEY=<tu-anon-key>
```

### 4. Ejecutar el proyecto
```bash
npm run dev
```

El proyecto estará disponible en `http://localhost:5173`.

## Comandos útiles

- **Iniciar el servidor de desarrollo**: `npm run dev`
- **Construir para producción**: `npm run build`
- **Previsualizar la build**: `npm run preview`

## Modelo de base de datos

### Tablas principales
1. **usuarios**: Información de los administradores.
2. **articulos**: Detalles de los artículos en inventario.
3. **ganadores**: Registro de ganadores y evidencias.
4. **auditoria_stock**: Historial de cambios en el stock.

### Buckets de almacenamiento
- **evidencias/formularios-aj/**: Fotos de formularios de ganadores.
- **evidencias/entregas/**: Fotos de entrega de premios.

## Diseño y UX

- **Paleta de colores**:
  - Primario: Rojo `#e42d26`
  - Secundario: Plomo `#eeeeee`
  - Acento: Amarillo `#f3d479`
- **Consideraciones UX**:
  - Validación en tiempo real en formularios.
  - Modales de confirmación para acciones destructivas.
  - Notificaciones (toasts) para feedback de acciones.

## Dependencias principales

- **React**: Framework para la interfaz de usuario.
- **Vite**: Herramienta de construcción rápida.
- **Supabase**: Backend como servicio (BaaS).
- **Tailwind CSS**: Framework de estilos.
- **shadcn/ui**: Componentes UI predefinidos.
- **TanStack Query**: Manejo de estado del servidor.
- **React Hook Form**: Manejo de formularios.
- **Zod**: Validación de esquemas.

## Contribuir

1. Haz un fork del repositorio.
2. Crea una nueva rama para tu funcionalidad o corrección de errores:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```
3. Realiza tus cambios y haz un commit:
   ```bash
   git commit -m "Añadida nueva funcionalidad"
   ```
4. Sube tus cambios:
   ```bash
   git push origin feature/nueva-funcionalidad
   ```
5. Abre un Pull Request.

## Licencia

Este proyecto está bajo la licencia [MIT](LICENSE).