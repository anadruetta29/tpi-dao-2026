# Contexto del frontend

El frontend vive en `frontend/` y usa React, TypeScript y Vite. El módulo Auth es la referencia para agregar funcionalidades. Los archivos de `ejemplos/` muestran el mismo patrón aplicado a operaciones de consulta y escritura.

## Arquitectura

- `src/domain/entities/` contiene clases que extienden `BaseEntity`. Reutilizar sus fábricas `fromObject` y `fromList` al convertir respuestas. Los estados y roles son clases con valores estáticos y etiquetas para la interfaz.
- `src/domain/dto/<módulo>/request/` y `response/` contienen interfaces `*Req` y `*Res`. Los contratos del datasource y del repositorio se declaran como clases abstractas `*I` en `domain/datasources/` y `domain/repositories/`.
- `src/domain/use-cases/<módulo>/` tiene un archivo por operación, con sus tipos `*Command` y `*Result` y una clase `*UseCase` que recibe el repositorio en el constructor y expone `execute`.
- `src/infrastructure/repository/` implementa el contrato del repositorio y delega en el datasource. `infrastructure/datasource/api/` arma las rutas y los parámetros, reutiliza `HTTPClient` y normaliza errores con `ErrorHandler`. El cliente agrega el token Bearer y toma la URL base de `VITE_API_URL`, con `http://localhost:8000` como valor por defecto.
- `src/ui/actions/<módulo>/` instancia el datasource, el repositorio y los casos de uso. Las acciones devuelven `ActionState<T>`. Los mensajes comunes están en `domain/messages/`.
- `src/ui/sections/<sección>/` compone la interfaz con los componentes de `ui/components/<componente>/`. La sesión y el usuario se obtienen con `useAuth` dentro de `AuthProvider`. El valor de rol del administrador es `ADMIN`.

## Convenciones

- Seguir Auth en los archivos nuevos: indentación de cuatro espacios, comillas dobles, punto y coma y exportaciones nombradas. Usar archivos en kebab-case, salvo los DTOs en PascalCase. Usar `@/` para imports desde la raíz de `src` y marcar los imports de solo tipo.
- Mantener nombres de entidades y campos del dominio, como `Sede` y `horarioAtencion`. Las clases de infraestructura y los casos de uso siguen los sufijos existentes en inglés.
- Usar textos de interfaz en español con voseo donde corresponda. Los componentes de Auth usan controles HTML nativos, estilos en línea, bordes redondeados y azul para la acción principal.
- Ejecutar `npm run build` y `npm run lint` desde `frontend/`. Revisar el contrato HTTP cuando las rutas aún no estén disponibles en el backend.
