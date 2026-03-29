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
| Hoy | Slots / urgencias / CTA | Parcial | Parcial | Si | No |
| Semana | Grid / orientacion / edicion | No | No | No | No |
| Kanban | Columnas / mover / teclado | Parcial | Parcial | Si | No |
| Backlog | Lista / filtros / detalle | Parcial | Parcial | Si | No |
| Calendario | Mes / eventos / detalle | Parcial | Parcial | Si | No |
| Materias | Objetivos / sesiones / tareas | Parcial | Parcial | Si | No |
| Tareas | Crear / editar / eliminar / checklist | Parcial | Parcial | Si | No |
| Configuracion | Tabs y formularios | No | No | No | No |
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
- Estado general: en progreso.
- Evidencia capturada: si.
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

### 17.3 Conclusiones del onboarding
1. La version antigua sigue siendo superior en onboarding.
2. La nueva version ya no esta lejos, pero aun no iguala la narrativa, el tono ni la sensacion de recorrido perfectamente guiado.
3. La mayor brecha sigue estando en el paso 1, no en tema ni en arranque.

### 17.4 Shell y header — hallazgos iniciales
1. La nueva expone mas acciones operativas en el header que la estable.
2. La estable tiene una identidad mas compacta y mas clara en su toolbar.
3. La nueva sigue sintiendose mas cargada visualmente en la franja superior.
4. Existe un bug real historico de solapamiento toolbar/contenido ya detectado y tratado como brecha S1.
5. Tras el ajuste reciente, el caso base de recarga y separacion inicial toolbar/contenido se ve correcto, pero la resolucion definitiva todavia debe validarse con mas escenarios de scroll real y cambios de vista.
6. En la nueva, los popovers de header (`Período`, `Theme`) funcionan y `Escape` los cierra correctamente.
7. Sin embargo, la capa colapsada/expandida de la toolbar todavia genera friccion de puntero: algunos clics requieren primero forzar o asegurar la expansion del shell.

### 17.5 Header — controles ya relevados
- Nueva:
   - Boton de pin visible.
   - Tabs de vistas visibles.
   - Acciones globales visibles: período, theme, nueva tarea, importar, drive, datos, ayuda, configuración.
   - Ayuda abre correctamente.
   - `Período` abre popover y cierra por `Escape`.
   - `Theme` abre popover.
   - `Pin` cambia correctamente su label entre fijar y desfijar.
- Estable:
   - Header compacto con identidad visual fuerte.
   - Navegacion simbolica mas sintetica.
   - Ayuda integrada con mas profundidad narrativa.

### 17.6 Pendientes inmediatos del bloque
1. Auditar pin/unpin con scroll real largo en la nueva.
2. Auditar hover y colapso automatico de la toolbar nueva.
3. Auditar popovers de período y theme en apertura, cierre y persistencia.
4. Auditar ayuda nueva contra ayuda estable seccion por seccion.
5. Comparar si la densidad del header nuevo afecta la lectura del contenido en vistas con filtros.
6. Determinar si la friccion de puntero del shell nuevo es un remanente del bug de solapamiento o un problema adicional de layering/eventos.

### 17.7 Decisiones provisionales de backlog surgidas de este bloque
1. Mantener abierto el rediseño del onboarding hasta acercar mas el paso 1 a la referencia estable.
2. Mantener prioridad alta para la correccion definitiva del bug de toolbar/scroll.
3. Planificar una simplificacion visual del header nuevo sin perder funcionalidad.
4. Revisar la arquitectura de hitbox/eventos del shell para que los controles sean clickeables sin depender de estados intermedios del peek.

### Sprint 2
- Refactor visual del header y toolbar.
- Rebalanceo de jerarquia visual en Hoy, Backlog y Materias.
- Ajustes de espaciado, agrupacion y foco primario.

### Sprint 3
- Pulido de temas e identidad visual.
- Refinamiento de microcopy.
- Segunda ronda de comparacion visual con capturas y score final.
