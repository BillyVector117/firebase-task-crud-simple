const db = firebase.firestore(); // Usar firestore como BD
const taskForm = document.getElementById("task-form"); // Captura el elemento de formulario
const taskContainer = document.querySelector("#tasks-container"); // Captura elemento en donde se colocara el contenido (default: vacio)

//False porque el estado no se va a editar, si no que para guardar.

let editStatus = false;
let id = ""; // id por defecto vacio

// Función para guardar una tarea (recibe el contenido de ambos inputs)
const saveTask = (title, description) =>
  // query para insertar datos (los del formulario) en firestore
  db.collection("tasks").doc().set({
    title, // title: title
    description, // description: description
  });

// ELEMENTAL FUNCTIONS //
// Función obtener todas las tareas de firestore
const getTasks = () => db.collection("tasks").get(); // Query, firestore (De la colección 'tasks' captura todos los docs.)
// Cada vez que un dato cambie en la db se maneja con una función (callback)
const onGetTasks = (callback) => db.collection("tasks").onSnapshot(callback); // Query, se actualize en tiempo real el obtener docs

// Funcitón Obtener un documento de firestore (por id)
const getTask = (id) => db.collection("tasks").doc(id).get(); // Query, de la colección 'tasks' busca por id (parametro) y obtenlo

// Función eliminar documento de firestore
const deleteTask = (id) => db.collection("tasks").doc(id).delete(); // Query, de la colección 'tasks' busca por id (parametro) y eliminalo

// Función, actualizar un documento de firestore
// id de la tarea actual y eventual
const updateTask = (id, updateTask) =>
  db.collection("tasks").doc(id).update(updateTask); // Query, de la colección 'tasks' busca el documento con el id (parametro) y actualizalo agregandole el segundo parametro

// EVENTS/ LOGIC
// Evento al cargar la pagina (Se obtendran datos de firestore)
window.addEventListener("DOMContentLoaded", async (e) => {
  // Cuando el DOM cargue, traera las tareas de la db en una constante

  // const querySnapshot = await getTasks()
  // La función onGetasks obtiene documentos en tiempo real
  onGetTasks((querySnapshot) => {
    taskContainer.innerHTML = ""; // El espacio del HTML estara en blanco para evitar datos repetidos o encimados
    // Por cada documento (doc) que se recorra realiza la función...
    querySnapshot.forEach((doc) => {
      console.log(doc.data());
      const task = doc.data(); // guardar en una constante los datos de cada tarea
      task.id = doc.id; // Captura id de cada documento

      // Dentro de #taskContaider escribe sin sobreescribir (+=) del Html los datos:
      // Escribe el titulo/descripción de cada tarea ${doc.data().title} dentro del div
      taskContainer.innerHTML += `<div class="card card-body mt-2 border-primary">
            <h3 class="h5">${task.title}</h3>
            <p>${task.description}</p>
            <div>
            <button class="btn btn-primary btn-delete" data-id="${task.id}">Delete</button>
            <button class="btn btn-secondary btn-edit" data-id="${task.id}">Edit</button>
            </div>
            </div>`;

      // DELETE BUTTON
      // Seleccionar todos los botones con la clase ".btn-delete"
      const btnsDelete = document.querySelectorAll(".btn-delete");
      // Haz un forEach por cada botón y agrega un evento
      btnsDelete.forEach((btn) => {
        // Al dar click sobre cada botón se ejecuta un evento
        btn.addEventListener("click", async (e) => {
          // Extrae el id de cada una de las tareas que tiene en firestore sobre el botón en especifico
          console.log(e.target.dataset.id);
          // Eliminar la tarea a partir del id proporcionado con la función previamente iniciada
          await deleteTask(e.target.dataset.id);
        });
      });


      // EDIT BUTTON
      // Seleccionar todos los botones con la clase btn-edit
      const btnsEdit = document.querySelectorAll(".btn-edit");
      // Recorrer cada botón y a cada elemento añadirle un evento
      btnsEdit.forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          // llamar la funcíon getTask, guardarlo y mostrarlo
          const doc = await getTask(e.target.dataset.id); // extrae el id de cada tarea sobre el botón en especifico
          const task = doc.data(); // Obtener el documento completo de firestore
          editStatus = true; // estado de actualizar true para saber que estamos actualizando y no creando
          id = doc.id; // Captura el id del doc
          console.log(doc);
          console.log(task);
          taskForm["task-title"].value = task.title; // Elemento hijo de taskForm ('task-title') agregale como valor en su input el task.title guardado previamente
          taskForm["task-description"].value = task.description; // Elemento hijo de taskForm ('task-description') agregale como valor en su input el task.description guardado previamente
          taskForm["btn-task-form"].innerText = "Update"; // Cambia el valor del botón de 'Save' a 'Update'
        });
      });
      //
    });
  });
});


// Función al dar submit (Crear doc. y actualizar doc.)
taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = taskForm["task-title"]; // Accede a la propiedad (id) de 'task-title
  const description = taskForm["task-description"]; // Accede a la propiedad (id) de 'task-description
  /*     const response = await db.collection('tasks').doc().set({
        title,          //title: title
        description     //description: description
    }) console.log(response)*/

    // Validar si es update o create (editStatus por defecto es false)
  if (!editStatus) {
    // Si editStatus es TRUE, guarda el documento usando la función saveTask()
    await saveTask(title.value, description.value);
  } else {
    // Si editStatus es false, solo actualizala
    await updateTask(id, {
      // Estas dos propiedades són las que recien acaba de typear el usuario (son el segundo parametro de la función)
      title: title.value,
      description: description.value,
    });
    editStatus = false; // Al finalizar de actualizar y darle Submit cambiara el formulario al estilo de crear documento
    id = ""; // Id temporalmente vacio en lo que se selecciona otro elemento (al editar o eliminar)
    taskForm["btn-task-form"].innerText = "Save"; // El botón volvera a decir 'Save' en ves de 'Update'
  }

  await getTasks(); // Obten y muestra los documentos en segundo plano, asi al crear o actualizar sera en tiempo real
  taskForm.reset(); // Resetear formulario al dar Submit
  title.focus(); // El cursor se posiciona en el input de title (UX)
  console.log(title, description);
});
function esperar1Seg() {
  return new Promise(function (resolve, reject) {
    setTimeout(resolve, 1000);
  });
}
console.log(esperar1Seg(resolve));
