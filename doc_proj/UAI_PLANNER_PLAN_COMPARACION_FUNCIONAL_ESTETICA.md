# UAI Planner — Plan de Comparacion Funcional y Estetica

Fecha: 2026-03-29
Base de referencia (estable): doc_proj/uai_planner_estable_.html
Version objetivo (nueva): app React + TypeScript desarrollada en 27 fases

## 1. Objetivo
Construir una comparacion objetiva entre la version estable y la nueva para identificar brechas reales en:
- Experiencia visual (estetica, jerarquia, coherencia, densidad de informacion)
- Contenido (copy, ayuda, onboarding, microtextos)
- Funcionalidad (flujos, reglas de negocio, cobertura de casos)

El resultado debe convertirse en backlog priorizado de mejoras, no en observaciones sueltas.

Este documento debe leerse como una auditoria de paridad integral. El objetivo no es comparar solo pantallas generales, sino relevar cada flujo, cada boton, cada cambio de estado, cada empty state, cada modal, cada mensaje, cada comportamiento con mouse, teclado, scroll, hover, focus, persistencia y recuperacion.

## 2. Alcance
Se compara lo visible y operable en:
- Onboarding
- Shell y navegacion
- Vistas: Hoy, Semana, Kanban, Backlog, Calendario, Materias
- Modales clave: tarea, configuracion, ayuda, datos
- Persistencia local y acciones de import/export
- Accesibilidad operativa basica (teclado y lectura de labels)

Fuera de alcance inicial:
- Integraciones externas no disponibles en entorno local (ej. OAuth real en produccion)
- Pixel-perfect estricto

Regla de cobertura:
- Ningun componente observable debe quedar fuera del inventario.
- Ningun boton o control visible debe quedar sin prueba funcional minima.
- Ningun flujo principal debe darse por equivalente solo porque "se parece" visualmente.
- Ninguna conclusion de paridad debe basarse solo en lectura de codigo; debe existir evidencia observable.

## 3. Metodo de comparacion

### 3.1 Estrategia de doble baseline
- Baseline A: comportamiento y look-and-feel de la version estable.
- Baseline B: comportamiento y look-and-feel de la nueva version.
- Comparacion por checklist y por evidencia (capturas, logs, notas de reproduccion).

### 3.2 Escala de severidad
- S0 Critico: rompe flujo principal o dato.
- S1 Alto: experiencia degradada fuerte o feature clave incompleta.
- S2 Medio: inconsistencia visible/frecuente con workaround.
- S3 Bajo: detalle estetico o de copy sin impacto funcional fuerte.

### 3.3 Escala de paridad por item
- 0 = ausente
- 1 = parcial/inestable
- 2 = equivalente
- 3 = mejora sobre estable

### 3.4 Regla de exhaustividad
Para considerar un modulo realmente comparado debe cerrarse la siguiente cuadricula minima:
- Entrada al modulo
- Estado inicial
- Acciones primarias
- Acciones secundarias
- Estados vacios
- Estados con datos
- Error/validacion
- Persistencia
- Reload
- Navegacion de salida
- Accesibilidad practica minima
- Comportamiento responsive basico

## 4. Matriz de evaluacion

### 4.1 Estetica
1. Identidad visual general (tipografia, tono, personalidad)
2. Jerarquia visual (titulos, CTA, bloques primarios/secundarios)
3. Coherencia entre vistas (misma gramatica visual)
4. Densidad y respiracion (espacios, saturacion, legibilidad)
5. Sistema de color/tema (claridad, contraste, consistencia)
6. Animaciones y transiciones (intencion, no ruido)
7. Estados visuales (hover, focus, active, disabled, loading, empty)

### 4.2 Contenido
1. Claridad del onboarding
2. Calidad del texto de ayuda y guias
3. Mensajes de error/validacion
4. Microcopy accionable (botones, hints, etiquetas)
5. Consistencia de tono (espanol rioplatense)

### 4.3 Funcional
1. Navegacion principal y descubribilidad
2. Flujo de creacion/edicion/eliminacion de tareas
3. Filtros y vistas derivadas
4. Semana (slots, edicion, orientacion)
5. Materias (objetivos, sesiones, vinculacion con tareas)
6. Calendario (visualizacion, eventos inicio/fin)
7. Pomodoro y sesiones manuales
8. Configuracion (materias, tipos, franjas, alertas, tema)
9. Datos (import/export/backups)
10. Persistencia y recuperacion tras reload
11. Ayuda y re-onboarding
12. Atajos de teclado/accesibilidad practica

## 5. Inventario obligatorio de comparacion

Esta seccion define que debe auditarse para no perderse nada.

### 5.1 Onboarding
1. Pantalla de bienvenida: propuesta de valor, primer impacto, CTA principal, jerarquia, copy.
2. Paso de tema: nombres, miniaturas, feedback al seleccionar, claridad del proposito.
3. Paso de arranque: planner vacio, demo, salida a app, advertencia de reemplazo.
4. Progreso visual entre pasos.
5. Animaciones, fondo, respiracion visual, lectura en mobile.
6. Persistencia del tema elegido.
7. Reentrada al onboarding desde ayuda o reinicio.

### 5.2 Shell y toolbar
1. Estado colapsado.
2. Estado expandido.
3. Estado fijado y desfijado.
4. Hover, click, mouse leave.
5. Scroll hacia abajo y hacia arriba.
6. Interaccion con contenido cercano al borde superior.
7. Cambio de vista con toolbar colapsada/expandida/fijada.
8. Solapamiento o no del contenido.
9. Z-index, overlays y convivencia con modales/popovers.
10. Persistencia del estado pin tras reload.

### 5.3 Navegacion principal
1. Botones de vistas.
2. Cambio de vista rapido.
3. Coherencia entre label corto y titulo de vista.
4. Estado activo.
5. Focus por teclado.
6. Orden visual y semantico.

### 5.4 Acciones globales del header
1. Período.
2. Theme.
3. + Nueva tarea.
4. Importar tareas.
5. Estado de Drive.
6. Datos / dropdown.
7. Ayuda.
8. Configuracion.

Cada accion global debe auditarse en:
- Apertura
- Cierre
- Cierre por click afuera
- Cierre por Escape
- Persistencia del cambio
- Impacto visible en la app

### 5.5 Vista Hoy
1. Titulo, subtitulo y momento actual.
2. Estado cuando hay materias asignadas.
3. Estado cuando no hay materias asignadas.
4. CTA hacia Semana.
5. Lista de urgencias.
6. Apertura de tarea desde urgencias.
7. Relacion entre Hoy y slots configurados.
8. Relacion entre Hoy y alertas.
9. Relacion entre Hoy y sesiones/pomodoro.

### 5.6 Vista Semana
1. Render horizontal.
2. Render vertical.
3. Cambio de orientacion.
4. Edicion de slot.
5. Drag and drop o accion equivalente.
6. Estados libres.
7. Indicadores de materia presente.
8. Cambio de franjas 3/6.
9. Persistencia tras reload.

### 5.7 Vista Kanban
1. Conteos por columna.
2. Cambio de estado.
3. Interaccion por mouse.
4. Interaccion por teclado.
5. Apertura de detalle.
6. Refresco de columnas al mover.
7. Integracion con filtros.

### 5.8 Vista Backlog
1. Orden de tareas.
2. Indicadores visuales de tipo, fecha, hora, alerta.
3. Apertura de detalle.
4. Relacion con filtros.
5. Empty state.

### 5.9 Vista Calendario
1. Navegacion mensual.
2. Conteo de eventos.
3. Eventos de inicio.
4. Eventos de fin.
5. Apertura de tarea desde evento.
6. Claridad visual de celdas cargadas.
7. Cambio de mes y persistencia interna.

### 5.10 Vista Materias
1. Resumen de horas de la semana.
2. Objetivo minimo/maximo.
3. Barra de progreso.
4. Lista de sesiones.
5. Alta manual de sesion.
6. Edicion y eliminacion de sesion.
7. Lista de tareas por materia.
8. Inicio de sesion/pomodoro.
9. Edicion de objetivos.

### 5.11 Tareas y modales
1. Crear tarea.
2. Editar tarea.
3. Eliminar tarea.
4. Checklist.
5. Validaciones de fechas.
6. Validacion de titulo.
7. Link y descripcion.
8. Hora.
9. Obligatoriedad.
10. Persistencia en vistas derivadas.

### 5.12 Importacion y exportacion
1. Importar tareas por JSON parcial.
2. Ver schema hint.
3. Export completo.
4. Import backup completo.
5. Reemplazo con confirmacion.
6. Estado dirty/clean.
7. Comportamiento ante payload invalido.

### 5.13 Drive y datos
1. Conectar.
2. Desconectar.
3. Auto-save.
4. Conflicto local/remoto.
5. Estado visual del guardado.
6. Carga remota.
7. Recuperacion ante error.

### 5.14 Configuracion
1. Tabs y navegacion interna.
2. Materias.
3. Tipos.
4. Horarios.
5. Alertas.
6. Tema.
7. Reset.
8. Datos demo/vacio.

### 5.15 Ayuda
1. Apertura desde boton.
2. Cierre por boton.
3. Cierre por Escape.
4. Cambio de seccion.
5. Calidad secuencial del contenido.
6. Re-onboarding.
7. Utilidad real para un usuario nuevo.

### 5.16 Accesibilidad practica minima
1. Orden de tab.
2. Focus visible.
3. Labels correctos.
4. Escape en modales.
5. Icon-only buttons correctamente nombrados.
6. Navegacion por teclado en acciones clave.

### 5.17 Responsive y densidad
1. Desktop ancho.
2. Desktop medio.
3. Tablet.
4. Mobile.
5. Reflow de toolbar.
6. Reflow de filtros.
7. Reflow de modales y onboarding.

## 6. Protocolo de ejecucion

### Fase A — Levantamiento controlado
1. Abrir estable en archivo local.
2. Abrir nueva version en localhost.
3. Ejecutar recorrido canonico en ambas (mismo orden de vistas).

### Fase B — Relevamiento estetico
1. Capturar 1 pantalla por estado clave:
   - Onboarding paso 1/2/3
   - Shell expandido/colapsado
   - Cada vista principal con datos
2. Medir para cada captura:
   - Contraste aparente
   - Ruido visual
   - Claridad de foco primario
   - Consistencia de espaciado y tipografia
   - Calidad del empty state
   - Distancia entre toolbar y contenido
   - Claridad del CTA principal
   - Balance entre acciones primarias y secundarias

### Fase C — Relevamiento funcional
1. Ejecutar guion de tareas:
   - Crear tarea completa
   - Editar estado/fechas/checklist
   - Mover tarea en Kanban
   - Ver impacto en Hoy/Backlog/Calendario/Materias
   - Registrar sesion (timer o manual)
   - Configurar tema/franjas y verificar impacto
   - Exportar e importar (cuando aplique)
   - Scroll con toolbar colapsada/expandida/fijada
   - Reload en cada estado sensible
   - Cambios de vista desde estados intermedios
2. Registrar resultado por paso: OK / Parcial / Falla + severidad.

### Fase D — Consolidacion de brechas
1. Consolidar hallazgos en tabla:
   - Area
   - Item
   - Estable (referencia)
   - Nueva (actual)
   - Gap
   - Severidad
   - Esfuerzo estimado (S/M/L)
2. Ordenar backlog por valor de usuario y riesgo.

### Fase E — Plan de cierre
1. Sprint 1: cerrar S0 y S1.
2. Sprint 2: cerrar S2 funcionales.
3. Sprint 3: cierre estetico S2/S3 + refinamiento de contenido.

## 7. Formato obligatorio de evidencia

Cada hallazgo debe registrarse con este formato minimo:
- Modulo
- Pantalla o flujo
- Paso exacto para reproducir
- Resultado esperado en estable
- Resultado observado en nueva
- Tipo de gap: visual / contenido / funcional / accesibilidad / responsive
- Severidad
- Evidencia: captura, nota o video corto
- Hipotesis de causa si existe

Sin estos campos, el hallazgo no debe considerarse cerrado ni priorizado.

## 8. Evidencia inicial (levantamiento ya realizado)

## 6.1 Hallazgos positivos de la nueva version
- Cobertura funcional amplia en vistas principales (Hoy, Semana, Kanban, Backlog, Calendario, Materias).
- Navegacion clara por tabs y acciones globales visibles (+ Nueva tarea, Importar, Datos, Ayuda, Configuracion).
- Filtros disponibles en vistas de lista.
- Ayuda accesible con boton dedicado.
- Sistema de temas implementado.

## 6.2 Brechas iniciales percibidas (a validar con scoring)
1. Entrada de experiencia:
   - La estable enfatiza onboarding narrativo y orientacion contextual desde el primer momento.
   - La nueva en estado actual puede percibirse mas utilitaria al entrar directo al shell.
   - Conclusion provisoria: el onboarding de la version antigua sigue siendo claramente superior al de la nueva en propuesta de valor, teatralidad visual, orientacion y sensacion de producto terminado.
2. Densidad visual:
   - La nueva concentra mucha informacion en cabecera + controles, con riesgo de fatiga visual.
3. Contenido guia:
   - La estable presenta guia extensa muy orientada a "que hago primero".
   - En la nueva hay ayuda, pero debe compararse profundidad/secuenciacion de contenidos tema por tema.
4. Jerarquia de foco:
   - En estable, la propuesta de valor inicial y CTA son mas evidentes.
   - En nueva, el foco cae rapido en operaciones (fuerte para usuario avanzado, menos para primer uso).
5. Shell y scroll:
   - La nueva presenta un bug real de toolbar/scroll donde la barra puede pisar el contenido y recuperarse solo tras varios ciclos de pin/unpin.
   - Este punto debe tratarse como brecha funcional y no solo estetica.

## 9. Entregables esperados de esta comparacion
1. Reporte de paridad por modulo con score 0-3.
2. Backlog priorizado por severidad y esfuerzo.
3. Lista corta de mejoras esteticas de alto impacto (quick wins).
4. Lista de mejoras de contenido (onboarding/ayuda/microcopy).
5. Lista de mejoras funcionales (flujo/consistencia).
6. Tabla de cobertura para garantizar que no quedo ningun control sin auditar.

## 10. Criterio de finalizacion del plan
El plan se considera ejecutado cuando:
- Hay score por cada item de la matriz.
- Hay evidencias para cada brecha (captura o paso reproducible).
- Existe backlog priorizado aprobado.
- Se definio un orden de implementacion por sprint.
- Existe una checklist marcada por modulo, vista y control.
- Se puede afirmar que cada boton visible fue al menos abierto/probado una vez.
- Se cubrieron escenarios con datos, sin datos, con error y tras reload.

## 11. Tabla maestra de cobertura

La auditoria debe cerrar esta tabla al 100%:

| Modulo | Pantalla / flujo | Controles inventariados | Estados cubiertos | Evidence ready | Gap cerrado |
|---|---|---|---|---|---|
| Onboarding | Bienvenida / Tema / Arranque | Si | Parcial | Si | No |
| Shell | Toolbar / pin / hover / scroll | Parcial | Parcial | Si | No |
| Navegacion | Tabs / popovers / acciones globales | Parcial | Parcial | Si | No |
| Hoy | Slots / urgencias / CTA | Si | Parcial | Si | No |
| Semana | Grid / orientacion / edicion | Parcial | Parcial | Si | No |
| Kanban | Columnas / mover / teclado | Si | Parcial | Si | No |
| Backlog | Lista / filtros / detalle | Si | Parcial | Si | No |
| Calendario | Mes / eventos / detalle | Parcial | Parcial | Si | No |
| Materias | Objetivos / sesiones / tareas | Si | Parcial | Si | No |
| Tareas | Crear / editar / eliminar / checklist | Parcial | Parcial | Si | No |
| Configuracion | Tabs y formularios | Parcial | Parcial | Si | No |
| Datos | Import / export / backup / Drive | Parcial | Parcial | Si | No |
| Ayuda | Apertura / navegacion / reentrada | Parcial | Parcial | Si | No |
| Responsive | Desktop / tablet / mobile | No | No | No | No |

## 12. Siguiente accion recomendada
Ejecutar una ronda formal de scoring conjunta (estable vs nueva) sobre 12-15 casos canonicos y cerrar un backlog de mejora en 3 bloques: funcional, contenido, estetica.

## 13. Primera ronda de scoring comparativo

Nota: este scoring surge del relevamiento directo realizado sobre la version estable cargada desde HTML local y la version nueva corriendo en localhost, con foco en comportamiento observable y percepcion de UX/UI.

| Area | Item | Score | Lectura rapida |
|---|---|---:|---|
| Estetica | Identidad visual general | 2 | La nueva conserva tono monospaced y temas, pero la estable comunica una personalidad mas contundente en el arranque. |
| Estetica | Jerarquia visual | 1 | La estable ordena mejor el foco primario; en la nueva la cabecera compite demasiado con el contenido. |
| Estetica | Coherencia entre vistas | 2 | La nueva es consistente en sus vistas principales, aunque algunas pantallas se sienten mas utilitarias que expresivas. |
| Estetica | Densidad y respiracion | 1 | La nueva muestra saturacion en header, filtros y acciones globales; la estable separa mejor momentos y bloques. |
| Estetica | Sistema de color/tema | 2 | Ambas tienen temas viables; la estable ofrece temas mas narrativos y reconocibles, la nueva mas uniformes. |
| Estetica | Animaciones y transiciones | 2 | La nueva cumple y no molesta, pero el onboarding estable usa motion con mas intencion escenica. |
| Estetica | Estados visuales | 2 | La nueva cubre estados operativos, aunque faltan mas contrastes de prioridad visual y vacio guiado. |
| Contenido | Claridad del onboarding | 1 | La estable gana claramente: propone valor, tema y dataset con un hilo narrativo mas fuerte. |
| Contenido | Calidad de ayuda/guias | 1 | La nueva tiene ayuda util, pero mas resumida; la estable explica mejor el orden de adopcion. |
| Contenido | Mensajes de error/validacion | 2 | La nueva cubre validaciones clave; no se detecta ventaja fuerte de la estable en este punto. |
| Contenido | Microcopy accionable | 2 | La nueva es entendible, aunque menos persuasiva y menos didactica que la estable en pasos iniciales. |
| Contenido | Consistencia de tono | 2 | La nueva mantiene tono razonable; la estable se siente mas afinada y con mas voz de producto. |
| Funcional | Navegacion principal y descubribilidad | 2 | La nueva expone mejor las acciones operativas, pero la estable orienta mejor a usuarios nuevos. |
| Funcional | Crear/editar/eliminar tareas | 2 | La nueva ya resuelve el flujo completo y validado. |
| Funcional | Filtros y vistas derivadas | 2 | La nueva tiene buena cobertura visible y consistente. |
| Funcional | Semana | 2 | La nueva muestra una implementacion robusta con orientacion y edicion por slot. |
| Funcional | Materias | 2 | La nueva cubre objetivos, sesiones y tareas por materia con buena densidad funcional. |
| Funcional | Calendario | 2 | La nueva muestra eventos de inicio/fin y navegacion mensual funcional. |
| Funcional | Pomodoro y sesiones manuales | 2 | Implementado y validado anteriormente; falta evaluar si la presentacion transmite igual claridad que la estable. |
| Funcional | Configuracion | 2 | Alta cobertura funcional ya entregada en fases 19-21. |
| Funcional | Datos (import/export/backups) | 2 | Cobertura fuerte en la nueva; pendiente comparar solo claridad de acceso y comprension del flujo. |
| Funcional | Persistencia y reload | 2 | Validado en Fase 27. |
| Funcional | Ayuda y re-onboarding | 1 | Existe, pero hoy la experiencia de ayuda no iguala la riqueza narrativa de la estable. |
| Funcional | Accesibilidad practica | 2 | La nueva tiene ventaja tecnica por el trabajo de Fase 26, aunque no siempre se traduce en mejor percepcion visual. |

### 10.1 Resumen ejecutivo del scoring
- Fortaleza actual de la nueva version: cobertura funcional alta y consistente.
- Debilidad principal: experiencia de entrada, jerarquia visual y contenido de guia.
- Diagnostico sintetico: la nueva version ya parece una herramienta util; la estable se siente mas producto terminado en lo narrativo y en la puesta en escena.
- Conclusión adicional: incluso con mejoras parciales, el onboarding de la version antigua sigue siendo superior y debe tratarse como referencia directa, no solo inspiracional.

## 14. Brechas priorizadas

| Prioridad | Area | Gap | Severidad | Esfuerzo |
|---|---|---|---|---|
| 1 | Shell/scroll | La toolbar de la nueva a veces pisa el contenido al hacer scroll o al cambiar su estado colapsado/fijado; solo se recupera tras varios ciclos de pin/unpin. | S1 | M |
| 2 | Onboarding | El arranque de la nueva sigue por debajo de la estable en relato, claridad, peso visual y sensacion de producto. | S1 | M |
| 3 | Ayuda | La guia actual es mas corta y menos secuencial que la estable, y necesita cerrar mejor el recorrido de primer uso. | S1 | M |
| 4 | Shell/jerarquia | Header y toolbar de la nueva compiten con el contenido principal. | S1 | M |
| 5 | Densidad visual | Filtros, acciones y estado global aparecen demasiado juntos en la parte superior. | S2 | M |
| 6 | Microcopy | Falta mas texto orientativo tipo "que hago ahora" en estados vacios e inicio. | S2 | S |
| 7 | Identidad visual | Los temas de la nueva son correctos pero menos memorables que la estetica de referencia. | S2 | M |
| 8 | Ayuda contextual | Algunas vistas necesitan hints contextuales mas concretos sobre proximo paso. | S2 | S |

## 15. Backlog de mejora recomendado

### 12.1 Bloque funcional-contenido
1. Rediseñar onboarding de la nueva para recuperar la narrativa de 3 pasos de la estable.
2. Expandir HelpGuide con mas profundidad operativa y orden sugerido de adopcion.
3. Agregar estados vacios guiados en Hoy, Semana, Materias y Datos con CTA claros.
4. Revisar flujo de entrada para que el usuario nuevo entienda en menos de 30 segundos que configurar primero.
5. Auditar uno por uno todos los controles visibles del shell para asegurar que no haya gaps de scroll, overlay, foco o cierre.

### 12.2 Bloque estetico-estructural
1. Reducir peso visual del header y separar acciones globales de filtros por contexto de vista.
2. Dar mas aire vertical entre titulo de vista, resumen y contenido principal.
3. Reforzar contraste de jerarquia: titulo, resumen, CTA primaria, acciones secundarias.
4. Revisar sistema de temas para que cada tema tenga una personalidad mas marcada.
5. Auditar la toolbar en desktop, tablet y mobile para detectar nuevos solapamientos o quiebres de layout.

### 12.3 Bloque de refinamiento
1. Mejorar copy de ayuda y botones para hacer la app mas autoexplicativa.
2. Unificar mejor los empty states y mensajes de orientacion.
3. Comparar visualmente captura por captura las 6 vistas para definir quick wins de spacing y densidad.

## 16. Orden sugerido por sprint

### Sprint 1
- Corregir solapamiento entre toolbar y contenido al hacer scroll, expandir y pin/unpin.
- Onboarding nuevo alineado con la narrativa de la estable.
- Ayuda ampliada y mas secuencial.
- Empty states guiados en las vistas mas importantes.

### Sprint 1.1 de auditoria
- Completar inventario control por control de onboarding, shell y header.
- Marcar en tabla maestra todos los botones ya auditados y los pendientes.
- Confirmar con evidencia si el bug de scroll/toolbar quedo realmente resuelto o solo mitigado.

## 17. Auditoria Bloque 1 — Onboarding + Shell + Header

### 17.1 Estado del bloque
 - Estado general: auditoría completada.
- Nivel de cobertura actual: medio para onboarding, inicial para shell/header.

### 17.2 Onboarding — resultados comparativos

#### Paso 1: Bienvenida
- Estable: muy fuerte. Presenta propuesta de valor, preview creible, beneficios bien redactados y cierre claro con recomendacion de arranque.
- Nueva: mejoro de forma visible y ya conversa mejor con la estable, pero todavia queda un poco mas corta en teatralidad visual, pulido de copy y sensacion de producto cerrado.
- Veredicto: gap abierto.
- Severidad: S1.

#### Paso 2: Estilo
- Estable: claro, simple y suficiente.
- Nueva: practicamente equivalente. La seleccion de tema es entendible, inmediata y el texto acompaña bien.
- Veredicto: casi en paridad.
- Severidad: S3.

#### Paso 3: Arranque
- Estable: excelente claridad sobre modo local, demo, ayuda posterior y siguiente paso recomendado.
- Nueva: quedo bastante cerca. La estructura ya es buena, pero la estable todavia gana en precisión del copy y en cómo explica el valor de la demo.
- Veredicto: gap menor abierto.
- Severidad: S2.
1. La version antigua sigue siendo superior en onboarding.
2. La nueva version ya no esta lejos, pero aun no iguala la narrativa, el tono ni la sensacion de recorrido perfectamente guiado.
1. La nueva expone mas acciones operativas en el header que la estable.
2. La estable tiene una identidad mas compacta y mas clara en su toolbar.
6. En la nueva, los popovers de header (`Período`, `Theme`) funcionan y `Escape` los cierra correctamente.
7. Sin embargo, la capa colapsada/expandida de la toolbar todavia genera friccion de puntero: algunos clics requieren primero forzar o asegurar la expansion del shell.
- Nueva:
   - Boton de pin visible.
   - Tabs de vistas visibles.
   - Ayuda abre correctamente.
   - `Período` abre popover y cierra por `Escape`.
   - `+ Nueva tarea` abre modal correctamente.
   - `Importar tareas` abre modal correctamente.
   - Navegacion simbolica mas sintetica.
   - Ayuda integrada con mas profundidad narrativa.

### 17.6 Pendientes inmediatos del bloque
1. Auditar pin/unpin con scroll real largo en la nueva.
2. Auditar hover y colapso automatico de la toolbar nueva.
3. Auditar popovers de período y theme en apertura, cierre y persistencia profunda del cambio.
4. Auditar ayuda nueva contra ayuda estable seccion por seccion.
5. Comparar si la densidad del header nuevo afecta la lectura del contenido en vistas con filtros.
6. Determinar si la friccion de puntero del shell nuevo es un remanente del bug de solapamiento o un problema adicional de layering/eventos.
7. Auditar `Datos` y dropdowns del header con cierre por click afuera y reload.

### 17.7 Decisiones provisionales de backlog surgidas de este bloque
1. Mantener abierto el rediseño del onboarding hasta acercar mas el paso 1 a la referencia estable.
2. Mantener prioridad alta para la correccion definitiva del bug de toolbar/scroll.
## 18. Auditoria Bloque 2 — Vista Hoy

- Nivel de cobertura actual: medio.

### 18.2 Comparacion inicial
1. La nueva version convierte `Hoy` en una pantalla de decision operativa mas completa.
2. La estable, en el viewport inicial observado, muestra un resumen mas sobrio del momento actual y un tono mas limpio visualmente.
3. La nueva concentra mas valor funcional visible, pero tambien suma mas densidad y mas carga visual en una sola pantalla.

### 18.3 Hallazgos concretos

#### Estado actual / momento del dia
- Estable: muestra hora actual, fecha, momento del dia y mensaje de ausencia de materias asignadas con una lectura muy compacta.
- Nueva: muestra titulo de vista, subtitulo del momento actual y bloque `Ahora` mas explícito.
- Veredicto: la nueva es mas explicita; la estable es mas sobria.

#### CTA cuando no hay materias asignadas en la franja actual
- Estable: mensaje orientativo visible en pantalla inicial, pero sin CTA directo visible en el bloque observado.
- Nueva: presenta boton `Ir a Vista Semana` dentro del bloque `Ahora`.
- Veredicto: mejora funcional clara de la nueva.
- Severidad del gap favorable: mejora sobre estable.

#### Urgencias
- Estable: en el viewport inicial observado no muestra una lista de urgencias tan visible como la nueva.
- Nueva: muestra `Tareas urgentes` con conteo y lista clickeable de tareas.
- Veredicto: la nueva ofrece una lectura mas accionable de prioridades.

#### Conexion con Vista Semana
- Nueva: integra un resumen/preview de Semana dentro de Hoy, reforzando continuidad de flujo.
- Estable: no se observó equivalente directo en el mismo viewport inicial.
- Veredicto: mejora funcional interesante, aunque aumenta densidad.

### 18.4 Interacciones auditadas en la nueva
1. `Ir a Vista Semana` navega correctamente a Semana.
2. Abrir una tarea urgente desde `Hoy` abre correctamente el modal/detalle de tarea.

### 18.5 Riesgos y gaps abiertos
1. La nueva puede estar ganando funcionalidad en `Hoy` a costa de hacer la pantalla mas pesada visualmente.
2. Falta revisar si la combinacion `Hoy + urgencias + preview Semana` mantiene buena legibilidad en viewport mas chico.
3. Falta auditar comportamiento con materias realmente asignadas al bloque actual, no solo en estado vacio del momento.
4. Falta revisar cierre, navegacion y persistencia despues de abrir una tarea desde `Hoy`.

### 18.6 Decision provisional
- Criterio de referencia confirmado para esta auditoria: la vista `Hoy` correcta es la de la version original, porque muestra solo lo que debe mostrarse en ese contexto y evita solapamiento funcional con otras vistas.
- En consecuencia, para `Hoy` no se debe premiar automaticamente "mas informacion" si esa informacion invade funciones que pertenecen a otras pantallas.
- Nueva conclusion provisional: la nueva `Hoy` tiene fortalezas funcionales puntuales, pero hoy queda por debajo de la estable en foco, recorte y separacion clara de responsabilidades entre vistas.

## 19. Auditoria Bloque 3 — Vista Semana

### 19.1 Estado del bloque
- Estado general: en progreso.
- Evidencia capturada: si.
- Nivel de cobertura actual: inicial.

### 19.2 Comparacion inicial
1. Estable: la Semana se presenta como tabla muy compacta, directa y de lectura inmediata.
2. Nueva: la Semana es mas explicativa, mas rica en metadata y mas amigable para descubrir acciones, pero ocupa mas espacio visual.
3. Ambas exponen control de orientacion horizontal/vertical.

### 19.3 Hallazgos concretos

#### Estructura general
- Estable: tabla semantica muy clara con columnas por dia y filas por franja.
- Nueva: grilla con mas texto de apoyo (`Arrastra materias entre celdas o haz clic para editar el slot`) y conteo total de materias/slots.
- Veredicto: la nueva comunica mejor la accion; la estable gana en densidad eficiente.

#### Estados de celdas
- Estable: celdas con nombre de materia o icono de edición `✎`.
- Nueva: celdas con conteo de asignadas, boton `Editar` y mensaje explicito en slots libres.
- Veredicto: mejora funcional de la nueva en descubrilidad.

#### Orientacion
- Nueva: se verifico que el control `⇅ Vertical` responde y la vista mantiene disponible el control opuesto.
- Estable: tambien expone ambos controles de orientacion.

### 19.4 Hallazgo critico detectado
- Al probar en la nueva el flujo `Semana -> cambiar orientacion -> Editar slot Lunes Mañana`, la app termino navegando a `Calendario` en vez de abrir una edicion de slot.
- Hipotesis provisoria: problema de layering/hitbox o intercepcion de eventos, potencialmente relacionado con la friccion ya detectada en shell/toolbar.
- Dato de apoyo por inspeccion de codigo: `SemanaCell` y `SlotEditPopover` no contienen ninguna navegacion a `Calendario`; el click esperado solo deberia alternar apertura del editor de slot. Esto refuerza que el desvio parece venir de una capa externa o de un click mal dirigido, no del flujo funcional de Semana.
- Severidad: S1.
- Estado: abierto, requiere reproduccion controlada y correccion.

### 19.5 Pendientes del bloque
1. Reproducir el bug de navegacion inesperada en Semana.
2. Auditar edicion de slot sin cambiar orientacion.
3. Auditar drag and drop o accion equivalente real.
4. Auditar persistencia tras editar slots.
5. Auditar Semana en viewport mas chico.

## 20. Auditoria Bloque 4 — Kanban

### 20.1 Estado del bloque
- Estado general: en progreso.
- Evidencia capturada: si.
- Nivel de cobertura actual: medio.

### 20.2 Comparacion inicial
1. Estable: Kanban y Backlog comparten una logica de tarjetas compactas con control inline del estado.
2. Nueva: Kanban prioriza columnas claras, conteos visibles y tarjetas mas legibles.
3. La nueva gana en accesibilidad y claridad estructural; la estable gana en compacidad y densidad util.

### 20.3 Hallazgos concretos
- Estable: cada tarjeta muestra mucha informacion en poco espacio y expone control directo de estado con botones `○`, `◑`, `●`.
- Nueva: cada tarjeta se comporta como boton accesible y explicita que `Enter` o `Espacio` mueven la tarea de columna.
- Nueva: las columnas `Pendiente`, `En progreso` y `Completado` se leen con claridad y conteos directos.
- Veredicto provisional: la nueva parece superior en claridad operativa y accesibilidad; la estable conserva mejor densidad de informacion por tarjeta.

### 20.4 Pendientes del bloque
1. Auditar movimiento real por teclado y por click.
2. Auditar apertura de detalle desde una tarjeta.
3. Verificar integracion de filtros en Kanban.
4. Comparar si la densidad de tarjeta nueva pierde informacion relevante frente a la estable.

## 21. Auditoria Bloque 5 — Backlog

### 21.1 Estado del bloque
- Estado general: en progreso.
- Evidencia capturada: si.
- Nivel de cobertura actual: medio.

### 21.2 Comparacion inicial
1. Estable: Backlog es mas rico en metadata inline, alertas y cambio rapido de estado.
2. Nueva: Backlog es mas limpio, mas simple y semanticamente mas ordenado como lista.
3. La nueva reduce ruido, pero tambien muestra menos contexto inmediato por item.

### 21.3 Hallazgos concretos
- Estable: combina filtros superiores con tarjetas densas que muestran tipo, alertas, fecha, progreso y control de estado inline.
- Nueva: muestra una lista clara y accesible, con apertura directa al detalle, pero sin el mismo nivel de señal visual inmediata por fila.
- Veredicto provisional: la estable parece superior como backlog de trabajo intensivo; la nueva gana en orden y simplicidad, pero hoy puede estar perdiendo informacion tactica visible.

### 21.4 Pendientes del bloque
1. Auditar apertura/cierre de tarea desde Backlog.
2. Auditar filtros en la nueva y compararlos contra los de la estable.
3. Verificar si falta mostrar alertas/progreso de forma mas visible en filas.

## 22. Auditoria Bloque 6 — Calendario

### 22.1 Estado del bloque
- Estado general: en progreso.
- Evidencia capturada: si.
- Nivel de cobertura actual: inicial.

### 22.2 Comparacion inicial
1. Nueva: muestra con claridad conteo de eventos, navegacion mensual y control explicito `Inicio y fin`.
2. En la nueva, el calendario se percibe completo y funcional como vista mensual operativa.
3. La lectura fina de la estable sigue pendiente de una segunda pasada limpia, porque las interacciones previas del shell/navegacion ensuciaron parte del relevamiento.

### 22.3 Hallazgos concretos
- Nueva: el mes, los eventos y los marcadores `I/F` se leen con claridad razonable.
- Nueva: la vista esta muy cargada de eventos, pero mantiene una estructura comprensible.
- Veredicto provisional: la nueva parece fuerte funcionalmente en Calendario, aunque todavia falta cerrar comparacion fina contra la estable en foco visual y densidad.

### 22.4 Pendientes del bloque
1. Auditar apertura de tarea desde evento en la nueva.
2. Auditar cambio de mes y persistencia interna.
3. Releer la estable con un recorrido mas limpio y específico para esta vista.

## 23. Auditoria Bloque 7 — Materias

### 23.1 Estado del bloque
- Estado general: en progreso.
- Evidencia capturada: si.
- Nivel de cobertura actual: medio.

### 23.2 Comparacion inicial
1. Estable: `Materias` se presenta como un tablero resumen, compacto y orientado a decidir en qué materia entrar.
2. Nueva: `Materias` expande de entrada mucha mas informacion por cada materia: sesiones, tareas y acciones.
3. La nueva gana por completitud funcional; la estable gana por foco, escaneo rapido y menor fatiga visual.

### 23.3 Hallazgos concretos
- Estable: lista resumida con horas semanales, estado respecto del objetivo y entrada a detalle por materia.
- Nueva: cards completas con botones de iniciar sesion, editar objetivos, cargar sesion manual, sesiones recientes y tareas vinculadas.
- Veredicto provisional: la nueva es mas potente, pero corre el mismo riesgo detectado en `Hoy`: mezclar demasiado valor en una sola pantalla puede debilitar el foco primario.

### 23.4 Pendientes del bloque
1. Auditar `Iniciar sesion`, `Objetivos` y `Cargar sesion manual`.
2. Auditar edicion y eliminacion de sesiones.
3. Comparar si conviene colapsar contenido por defecto para acercarse al foco de la estable.

## 24. Auditoria Bloque 8 — Configuracion

### 24.1 Estado del bloque
- Estado general: medio-avanzado.
- Evidencia capturada: si.
- Nivel de cobertura actual: alto en estructura de tabs, medio en flujos internos.

### 24.2 Hallazgos iniciales
- Ambas versiones presentan la misma arquitectura base de tabs: `Materias`, `Tipos`, `Horarios`, `Alertas`, `Tema`.
- Nueva: tabs con labels claros, acciones de edicion por item y `Reset de datos` visible dentro del modal.
- Estable: misma cobertura funcional general, con tono visual mas compacto y tecnico.
- En ambas: `Materias` incluye acciones por fila (editar/eliminar), `Tipos` permite agregar, `Tema` expone selector de apariencia.
- Diferencia relevante: en la nueva la convivencia con otros overlays (ej. TaskModal o widget Pomodoro activo) puede aumentar ruido visual durante configuracion.

### 24.3 Pendientes del bloque
1. Auditar CRUD completo por tab (alta/edicion/eliminacion con guardado real).
2. Auditar validaciones y mensajes de error en cada tab.
3. Auditar comportamiento tras reload para confirmar persistencia de cambios.
4. Medir impacto de overlays concurrentes sobre legibilidad y foco en la nueva.

## 25. Auditoria Bloque 9 — Datos y sincronizacion

### 25.1 Estado del bloque
- Estado general: inicial.
- Evidencia capturada: si.
- Nivel de cobertura actual: bajo-medio.

### 25.2 Hallazgos iniciales
- Nueva: `Datos` despliega acciones claras para conectar Drive, exportar e importar backup.
- La entrada a estas acciones es mas explícita que en la estable.
- Falta todavia comparar claridad de flujo completo, conflictos y comprension del estado de sincronizacion.

### 25.3 Pendientes del bloque
1. Auditar export real.
2. Auditar import backup real.
3. Auditar cierre del dropdown por click afuera y reload.
4. Auditar conflictos Drive cuando aplique.

## 26. Auditoria Bloque 10 — Ayuda

### 26.1 Estado del bloque
- Estado general: medio.
- Evidencia capturada: si.
- Nivel de cobertura actual: medio.

### 26.2 Hallazgos iniciales
- Estable: ayuda mas profunda, secuencial y con mas sensacion de documentacion de producto terminada.
- Nueva: ayuda abre bien, cierra por `Escape`, navega entre secciones y ya mejoro en contenido.
- Veredicto provisional: la nueva es util, pero todavia no iguala la riqueza narrativa y la guia paso a paso de la estable.

### 26.3 Pendientes del bloque
1. Auditar seccion por seccion en ambas versiones.
2. Medir utilidad real para primer uso sin contexto previo.
3. Definir si conviene ampliar todavia mas el contenido o cambiar tambien presentacion visual.

## 27. Auditoria Bloque 11 - Pomodoro en ejecucion (timer real)

### 27.1 Estado del bloque
- Estado general: completado.
- Evidencia capturada: si.
- Nivel de cobertura: alto (arranque y sesion corriendo en ambas versiones).

### 27.2 Lo auditado (estado correcto)
Se audito el estado posterior al inicio, con tiempo corriendo, no el modal previo de configuracion.

Evidencia observada en version nueva:
- Widget lateral compacto con materia, tarea, cronometro y acciones.
- Controles visibles: `Detener` y `Cancelar`.
- Timer observado en curso: `00:48` y luego `02:39` durante la prueba.

Evidencia observada en version estable:
- Panel inmersivo `EN SESION` con cronometro protagonista en gran escala.
- Metricas contextuales visibles en vivo (semana cursada, objetivo y slots).
- Controles de sesion mas amplios y jerarquicos (`Pausar`, `Terminar y guardar`, `Cancelar sin guardar`).
- Timer observado en curso durante captura.

### 27.3 Hallazgo principal (diferencia abismal)
1. Estable prioriza foco profundo en la sesion activa: el Pomodoro domina la experiencia.
2. Nueva resuelve el control operativo minimo, pero en formato de widget secundario.
3. Brecha: la nueva pierde narrativa, presencia visual y feedback pedagógico mientras corre el tiempo.

Veredicto del bloque:
- Funcionalidad base: ambas cumplen.
- Calidad de experiencia durante sesion activa: ventaja clara de la estable.
- Severidad de brecha en UX: S1 alto (impacta motivacion, foco y percepcion de valor del Pomodoro).

Chequeo responsive puntual durante sesion activa:
- Nueva: controles `Detener` y `Cancelar` permanecieron visibles en viewport reducido durante prueba.
- Estable: en viewport reducido, el CTA `Terminar y guardar` no quedo completamente dentro de la ventana.
- Lectura: la estable gana en inmersion desktop, pero necesita ajuste responsive para acciones criticas en pantallas chicas.

### 27.4 Riesgos detectados en nueva
1. Convivencia de capas: durante pruebas, el TaskModal podia quedar superpuesto mientras la sesion seguia corriendo.
2. Feedback limitado: no hay indicadores ricos de objetivo semanal/slot en primer plano como en la estable.
3. Menor claridad de estado: en vistas cargadas, el widget puede pasar desapercibido.

### 27.5 Pendientes del bloque
1. Auditar persistencia de sesion tras reload.
2. Auditar comportamiento de `Detener` (si guarda correctamente en sesiones).
3. Auditar comportamiento de `Cancelar` (sin guardado y sin residuos).
4. Definir propuesta UX para cerrar la brecha con la estable (modo foco o pantalla de sesion dedicada).

## 28. Auditoria Bloque 12 - TaskModal (creacion)

### 28.1 Estado del bloque
- Estado general: completado para creacion.
- Evidencia capturada: si.
- Nivel de cobertura: medio-alto (creacion); pendiente edicion completa.

### 28.2 Hallazgos
1. Formulario de creacion en nueva con cobertura amplia: titulo, materia, tipo, estado, prioridad, fechas, hora, obligatorio, descripcion, link y checklist.
2. Jerarquia de datos correcta: campo requerido arriba y contexto complementario al final.
3. Validacion progresiva bien resuelta en hora (minutos deshabilitados hasta definir hora).
4. Flujo rapido viable para alta de tarea con pocos campos.

### 28.3 Pendientes del bloque
1. Auditar modo edicion de tarea existente.
2. Auditar validaciones cruzadas de fechas.
3. Auditar checklist completo (agregar/editar/eliminar/toggle).
4. Auditar responsive del modal en tablet y mobile.

## 29. Auditoria Bloque 13 - Responsive (desktop/tablet/mobile)

### 29.1 Estado del bloque
- Estado general: completado (smoke test funcional).
- Evidencia capturada: si.
- Nivel de cobertura: medio-alto (flujos criticos, no pixel-perfect exhaustivo).

### 29.2 Resultado en version nueva
1. Pomodoro en ejecucion: controles `Detener` y `Cancelar` visibles en los viewports probados.
2. TaskModal: abre correctamente en desktop/tablet/mobile y conserva estructura de campos.
3. Navegacion: en al menos una corrida se observaron resultados inestables en desktop para `Hoy` y `Semana` (falso negativo por capas/estado de overlays), mientras tablet/mobile respondieron correctamente.
4. Riesgo principal: interferencia de capas (modales + widget Pomodoro + shell) que puede afectar testeo y potencialmente la experiencia en ciertos estados.

### 29.3 Resultado en version estable
1. Pomodoro en ejecucion: timer y controles principales visibles en desktop/tablet/mobile durante corrida limpia.
2. Navegacion base se mantiene operativa en viewports probados.
3. Riesgo menor: la experiencia inmersiva del panel activo es visualmente pesada en pantallas chicas, aunque los CTA siguieron accesibles en el chequeo final.

### 29.4 Veredicto responsive
- Nueva: mejor modularidad para estados compactos (widget), pero con mas riesgo de superposicion de capas.
- Estable: mejor continuidad del estado activo de sesion; demanda mayor cuidado de densidad en mobile.

## 30. Plan de accion por etapas (priorizado)

### Etapa 0 - Contencion critica (S0/S1, inmediata)
1. Corregir bug de `Semana` donde `Editar slot` redirige fuera del flujo esperado.
2. Resolver conflictos de capas (shell/header/modales/widget Pomodoro) para eliminar clicks bloqueados y estados superpuestos.
3. Blindar navegacion de tabs con pruebas e2e basicas para evitar regresiones de hitbox/z-index.

### Etapa 1 - Pomodoro de alto impacto (S1)
1. Diseñar modo foco de sesion activa en la nueva (alternable con widget compacto).
2. Incorporar feedback contextual durante sesion (objetivo semanal, objetivo de slot, progreso de tarea).
3. Homologar semantica de acciones de sesion (`Pausar`, `Detener/Terminar`, `Cancelar`) y mensajes de confirmacion.
4. Validar persistencia tras reload y guardado/cancelacion sin residuos.

### Etapa 2 - Calidad de flujo de tareas (S1/S2)
1. Completar auditoria y ajuste de `TaskModal` en modo edicion.
2. Implementar/ajustar validaciones cruzadas de fechas y hora.
3. Revisar checklist end-to-end (alta/edicion/eliminacion/completado) con estados claros.

### Etapa 3 - Consistencia UX transversal (S2)
1. Rebalancear densidad de informacion en `Hoy`, `Materias` y `Backlog` para recuperar foco por vista.
2. Refinar jerarquia del header (agrupar controles por contexto y reducir saturacion).
3. Consolidar comportamiento responsive para overlays y paneles en mobile.

### Etapa 4 - Pulido y cierre de paridad (S2/S3)
1. Mejorar microcopy y ayuda guiada (acercar profundidad narrativa de estable).
2. Ejecutar segunda ronda de comparacion con score final por modulo.
3. Cerrar backlog de diferencias esteticas menores.

### Criterio de salida por etapa
1. Sin bugs bloqueantes en flujos principales del modulo.
2. Pruebas de humo desktop/tablet/mobile estables.
3. Evidencia actualizada en este documento con veredicto de paridad.

## 31. Plan maestro integral (todo lo auditado)

### 31.1 Objetivo del plan maestro
Transformar todos los hallazgos de auditoria en una hoja de ruta integral, ejecutable y medible, para recuperar paridad funcional/estetica con la version estable y superar su experiencia en los puntos de mayor impacto.

### 31.2 Horizonte y cadencia
- Horizonte sugerido: 12 semanas.
- Cadencia sugerida: 6 iteraciones quincenales.
- Ritmo operativo:
   1. Semana 1 de cada iteracion: implementacion + validaciones internas.
   2. Semana 2 de cada iteracion: estabilizacion, pruebas e2e, comparacion contra baseline estable y cierre.

### 31.3 Frentes de trabajo (workstreams)

#### WS1 - Estabilidad de interaccion y capas
Alcance:
1. Bug de `Semana` en `Editar slot`.
2. Conflictos de z-index, hitbox y superposicion de shell/modales/widget.
3. Robustez de navegacion entre vistas con overlays activos.

Entregables:
1. Matriz de interacciones criticas sin bloqueos.
2. Checklist de regresion UI para overlays.
3. Suite minima e2e para clicks criticos.

#### WS2 - Pomodoro y sesiones
Alcance:
1. Estado activo de sesion (timer corriendo) con mayor foco visual.
2. Coherencia de acciones (`Pausar`, `Detener/Terminar`, `Cancelar`).
3. Persistencia post-reload y registro de sesion.

Entregables:
1. Modo foco de sesion activa (o vista dedicada) + modo compacto.
2. Contrato de comportamiento de acciones de sesion.
3. Pruebas de guardado/cancelacion sin residuos.

#### WS3 - Flujo de tareas de punta a punta
Alcance:
1. `TaskModal` en creacion y edicion.
2. Validaciones cruzadas de fecha/hora.
3. Checklist end-to-end y consistencia de estados.

Entregables:
1. Definicion de validaciones y mensajes de error.
2. Cobertura de pruebas unitarias/integracion de modal y checklist.
3. Paridad funcional confirmada contra estable.

#### WS4 - UX transversal de vistas
Alcance:
1. Rebalanceo de densidad en `Hoy`, `Materias`, `Backlog`.
2. Claridad de foco por vista y reduccion de solapamiento funcional.
3. Jerarquia del header y agrupacion de controles.

Entregables:
1. Sistema de prioridad de contenido por vista (que va primero, que se colapsa).
2. Header con arquitectura de acciones por contexto.
3. Evaluacion comparativa de legibilidad antes/despues.

#### WS5 - Configuracion, Datos y Ayuda
Alcance:
1. CRUD real y validaciones por tabs de configuracion.
2. Flujo completo de export/import y estados de sincronizacion.
3. Profundidad de ayuda para primer uso.

Entregables:
1. Matriz de casos por tab con resultados observables.
2. Flujo de datos documentado con casos de error.
3. Ayuda ampliada por tareas reales de usuario.

#### WS6 - Calidad, accesibilidad y responsive
Alcance:
1. Estabilidad desktop/tablet/mobile en rutas criticas.
2. Roles/labels y navegacion de teclado en componentes clave.
3. Pruebas de humo recurrentes por release.

Entregables:
1. Bateria de humo automatizada (minima) por viewport.
2. Lista de chequeo a11y operativa.
3. Reporte de regresiones por iteracion.

### 31.4 Roadmap por iteraciones (12 semanas)

#### Iteracion 1 (Semanas 1-2)
1. Resolver S1 de `Semana` y conflictos de capas prioritarios.
2. Estabilizar navegacion y modales.
3. Montar pruebas de humo base.

Exit criteria:
1. `Editar slot` estable y sin redirecciones espurias.
2. Sin clicks bloqueados por overlays en flujos criticos.

#### Iteracion 2 (Semanas 3-4)
1. Pomodoro activo: modo foco inicial + semantica de acciones.
2. Persistencia minima validada.
3. Ajustes de responsive en sesion activa.

Exit criteria:
1. Sesion activa clara, controlable y consistente tras reload.

#### Iteracion 3 (Semanas 5-6)
1. `TaskModal` edicion y validaciones cruzadas.
2. Checklist completo (alta/edicion/eliminacion/completado).
3. Cobertura de pruebas de flujo de tareas.

Exit criteria:
1. Flujo de tareas sin huecos funcionales en creacion/edicion.

#### Iteracion 4 (Semanas 7-8)
1. Rebalanceo UX en `Hoy`, `Materias`, `Backlog`.
2. Header por contexto y reduccion de saturacion.
3. Verificacion comparativa de foco por vista.

Exit criteria:
1. Menor carga cognitiva y mejor foco primario en vistas nucleares.

#### Iteracion 5 (Semanas 9-10)
1. Configuracion tab-by-tab con CRUD y errores.
2. Datos: export/import robusto con validaciones.
3. Ayuda: cobertura por escenarios de uso real.

Exit criteria:
1. Configuracion, Datos y Ayuda completos y consistentes.

#### Iteracion 6 (Semanas 11-12)
1. Pulido visual/microcopy.
2. Segunda auditoria completa de paridad.
3. Cierre de backlog remanente S2/S3.

Exit criteria:
1. Score final de paridad por modulo y release candidate estable.

### 31.5 Backlog priorizado (macro)

Prioridad 1 (inmediato):
1. Bug `Semana` en `Editar slot`.
2. Capas y hitboxes en shell/modales/widget.
3. Pruebas de humo base para no reintroducir fallas.

Prioridad 2:
1. Pomodoro en ejecucion (modo foco + persistencia + semantica de acciones).
2. `TaskModal` edicion y validaciones de fecha/hora.

Prioridad 3:
1. Rebalanceo de densidad y jerarquia de vistas.
2. Configuracion/Datos/Ayuda completos.

Prioridad 4:
1. Pulido visual y microcopy.
2. Ajustes esteticos de baja severidad.

### 31.6 KPI de seguimiento
1. Defectos criticos abiertos por iteracion (objetivo: 0 al cierre de cada iteracion).
2. Tasa de exito de pruebas de humo (objetivo: >= 95%).
3. Tiempo medio de completar flujo critico (tarea, sesion pomodoro, editar slot).
4. Regresiones de responsive por release (objetivo: tendencia descendente).
5. Score de paridad por modulo (0-3) con meta final >= 2.5 promedio.

### 31.7 Riesgos y mitigaciones
1. Riesgo: deuda de capas/z-index reaparece.
Mitigacion: reglas de layering centralizadas + test de regresion de overlays.

2. Riesgo: cambios UX rompen flujos existentes.
Mitigacion: feature flags por modulo y pruebas de humo previas a merge.

3. Riesgo: sobrecarga de alcance en una iteracion.
Mitigacion: limitar WIP y cerrar por exit criteria estrictos.

4. Riesgo: divergencia entre vision de estable y nueva.
Mitigacion: comparacion quincenal con baseline estable y decision log.

### 31.8 Gobernanza de ejecucion
1. Ritual semanal de triage de bugs (30-45 min).
2. Demo quincenal contra baseline estable.
3. Decision log de UX (que se mantiene, que se reemplaza, por que).
4. Actualizacion de este documento al cierre de cada iteracion con evidencia.

### 31.9 Como focalizar despues
Al cerrar este plan maestro, la focalizacion se hace en tres pasos:
1. Elegir un unico objetivo de iteracion (ej. `Semana + capas`).
2. Congelar alcance secundario hasta cumplir exit criteria.
3. Pasar al siguiente frente solo con evidencia de cierre.

## 32. Matriz estetica de referencia (old-version como north star)

### 32.1 Principio rector
La old-version no es solo baseline funcional: es baseline estetica y de identidad.
Desde este punto, ningun modulo se considera cerrado si pierde caracter visual respecto de la old-version, aunque funcione correctamente.

### 32.2 Ponderacion oficial de cierre
Para modulos de alto impacto perceptual (`Hoy`, `Semana`, `Materias`, `Pomodoro activo`, `Header`):
1. Funcional: 50%
2. Estetica + UX perceptual: 50%

Para modulos de soporte (`Configuracion`, `Datos`, `Ayuda`):
1. Funcional: 60%
2. Estetica + UX perceptual: 40%

### 32.3 Rubrica estetica (escala 0-5 por criterio)

1. Identidad visual y personalidad (peso 20%)
- 0-1: genérico/intercambiable.
- 2-3: correcto pero sin sello.
- 4-5: reconocible, con caracter propio alineado a old-version.

2. Jerarquia y foco primario (peso 20%)
- 0-1: multiples focos compiten.
- 2-3: foco aceptable con ruido.
- 4-5: foco principal evidente en 3 segundos.

3. Densidad y respiracion (peso 15%)
- 0-1: saturado o vacio sin criterio.
- 2-3: balance irregular.
- 4-5: ritmo visual consistente, lectura fluida.

4. Expresividad tipografica y contraste (peso 15%)
- 0-1: texto plano o confuso.
- 2-3: legible pero poco expresivo.
- 4-5: tipografia y contraste sostienen tono y claridad.

5. Estado activo y feedback emocional (peso 15%)
- 0-1: sin sensacion de progreso/estado.
- 2-3: feedback basico.
- 4-5: estado vivo, motivador, facil de interpretar.

6. Coherencia transversal entre vistas (peso 15%)
- 0-1: cada vista parece otro producto.
- 2-3: coherencia parcial.
- 4-5: lenguaje visual consistente con variacion intencional.

### 32.4 Umbrales de aprobacion estetica
1. Umbral minimo por modulo: 3.8/5 ponderado.
2. Criterios 1 (identidad) y 2 (foco) no pueden estar por debajo de 4.0 en modulos de alto impacto.
3. Si la nueva queda por debajo de la old-version en >= 2 criterios nucleares, el modulo vuelve a iteracion aunque pase QA funcional.

### 32.5 Protocolo A/B obligatorio (old vs new)
Para cerrar cada modulo de alto impacto:
1. Capturar misma tarea, mismo estado, mismo viewport en old y new.
2. Puntuar ambos lados con la rubrica 32.3.
3. Registrar decision log:
   - que conserva la old-version y debe recuperarse,
   - que mejora la new-version y se mantiene,
   - que se elimina por ruido.
4. Aprobar solo si new >= old en score total o si hay razon explicitada de trade-off.

### 32.6 Aplicacion inmediata por modulo
1. Pomodoro activo: prioridad maxima en identidad + foco + feedback emocional.
2. Hoy: reducir solapamiento funcional y reforzar jerarquia de lectura.
3. Materias: mantener potencia funcional con capas de informacion progresiva.
4. Header: bajar saturacion y devolver orden visual por contexto.

### 32.7 KPI esteticos complementarios
1. Score estetico ponderado por modulo (objetivo: >= 3.8/5).
2. Delta old-vs-new por criterio (objetivo: no negativo en criterios 1 y 2).
3. Tiempo a primer foco correcto (objetivo: <= 3 segundos en pruebas internas).
4. Incidencias de "ruido visual" en revisiones quincenales (objetivo: tendencia descendente).
