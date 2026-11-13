# Contexto del frontend

El frontend vive en `frontend/` y usa React, TypeScript y Vite. Al agregar una funcionalidad, tomá como referencia una operación similar de los módulos existentes. Los archivos de `ejemplos/` también muestran el patrón para consultas y escrituras.

## Arquitectura

- `src/domain/entities/` contiene clases que extienden `BaseEntity`. Reutilizar sus fábricas `fromObject` y `fromList` al convertir respuestas. Los estados y roles son clases con valores estáticos y etiquetas para la interfaz.
- `src/domain/dto/<módulo>/request/` y `response/` contienen interfaces `*Req` y `*Res`. Los contratos del datasource y del repositorio se declaran como clases abstractas `*I` en `domain/datasources/` y `domain/repositories/`.
- `src/domain/use-cases/<módulo>/` tiene un archivo por operación. Cada caso de uso define un `*Command`, un `*Result` cuando devuelve datos y una clase `*UseCase` que recibe el repositorio en el constructor y expone `execute`.
- `src/domain/filters/` contiene filtros reutilizables cuando la consulta requiere normalizar parámetros. Usar `toApiParams` para convertirlos a los nombres y valores que espera la API.
- `src/infrastructure/repository/` implementa el contrato del repositorio y delega en el datasource. `infrastructure/datasource/api/` arma las rutas y los parámetros, reutiliza `HTTPClient` y normaliza errores con `ErrorHandler`. El cliente agrega el token Bearer y toma la URL base de `VITE_API_URL`, con `http://localhost:8000` como valor por defecto.
- `src/ui/actions/<módulo>/` instancia el datasource, el repositorio y los casos de uso. Las acciones devuelven `ActionState<T>`. Los catálogos de `src/domain/messages/` agrupan los mensajes de error y éxito compartidos por la aplicación.
- `src/ui/sections/<sección>/` compone la interfaz y llama a las acciones. Los componentes reutilizables viven en `src/ui/components/<componente>/`. Obtener la sesión y el usuario con `useAuth` dentro de `AuthProvider` y usar las constantes de `Rol` cuando un caso de uso requiere permisos específicos en la interfaz.

## Convenciones

- Usar indentación de cuatro espacios, comillas dobles, punto y coma y exportaciones nombradas en los módulos. Los nombres de archivo van en kebab-case y los DTOs en PascalCase. Usar `@/` para imports desde la raíz de `src` y marcar con `type` los imports de solo tipo.
- Conservar los nombres de entidades y campos del dominio. Las clases de infraestructura y los casos de uso mantienen los sufijos en inglés, como `Repository`, `ApiDataSource` y `UseCase`.
- Escribir los textos de interfaz en español con voseo donde corresponda. Seguir el estilo de las pantallas existentes con controles HTML nativos, estilos en línea, bordes redondeados y azul para la acción principal.

## Verificación

- Ejecutar `npm run build` y `npm run lint` desde `frontend/` al cambiar código.
- Verificar que el datasource respete el método, la ruta, los parámetros, el cuerpo y la autenticación del contrato HTTP. Si el endpoint aún no está disponible, comprobar el contrato con respuestas simuladas.
