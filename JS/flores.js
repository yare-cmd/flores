//  REEMPLAZA ESTOS VALORES CON LOS DE TU PROYECTO
const SUPABASE_URL = 'https://aqyentuphlbvdbvrhmiu.supabase.co';
const SUPABASE_CLAVE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxeWVudHVwaGxidmRidnJobWl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3OTI1NDQsImV4cCI6MjEwODM2ODU0NH0.RIk-9unUvc_x1f0VlkJzyHVyTdj3J_YhhLm2yjfmx9o';

// Inicializar con nombre distinto para evitar conflicto
const { createClient } = window.supabase;
const clienteDB = createClient(SUPABASE_URL, SUPABASE_CLAVE);

// Elementos del DOM
const form = document.getElementById('formFlora');
const idFlor = document.getElementById('idFlor');
const nombre = document.getElementById('nombre');
const descripcion = document.getElementById('descripcion');
const costo = document.getElementById('costo');
const imagen = document.getElementById('imagen');
const buscador = document.getElementById('buscador');
const lista = document.getElementById('listaFlores');
const btnCancelar = document.getElementById('btnCancelar');

// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', cargarFlores);
buscador.addEventListener('input', filtrarFlores);
form.addEventListener('submit', guardarFlor);
btnCancelar.addEventListener('click', cancelarEdicion);

// Variable para almacenar todas las flores
let todasLasFlores = [];

// Obtener flores de la base de datos
async function cargarFlores() {
  const { data, error } = await clienteDB
    .from('flores')
    .select('*')
    .order('nombre');

  if (error) return console.error('Error:', error);
  
  todasLasFlores = data;
  mostrarFlores(data);
}

// Mostrar flores en pantalla
function mostrarFlores(flores) {
  lista.innerHTML = '';
  
  if (flores.length === 0) {
    lista.innerHTML = '<p style="text-align:center;color:#888;padding:20px;">No se encontraron flores</p>';
    return;
  }

  flores.forEach(flor => {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'flor-tarjeta';
    tarjeta.innerHTML = `
      <img src="${flor.imagen || 'https://via.placeholder.com/120x120?text=🌸'}" 
           alt="${flor.nombre}" class="flor-imagen">
      <div class="flor-info">
        <div class="flor-nombre">${flor.nombre}</div>
        <div class="flor-precio">$${parseFloat(flor.costo).toFixed(2)}</div>
        <p>${flor.descripcion || 'Sin descripción'}</p>
        <div class="flor-acciones">
          <button class="btn-editar" data-id="${flor.id}"> Editar</button>
          <button class="btn-eliminar" data-id="${flor.id}"> Eliminar</button>
        </div>
      </div>
    `;
    lista.appendChild(tarjeta);
  });

  // Asignar eventos a botones
  document.querySelectorAll('.btn-editar').forEach(b => 
    b.addEventListener('click', () => editarFlor(b.dataset.id)));
  document.querySelectorAll('.btn-eliminar').forEach(b => 
    b.addEventListener('click', () => eliminarFlor(b.dataset.id)));
}

// Filtrar por búsqueda
function filtrarFlores() {
  const texto = buscador.value.toLowerCase();
  const filtradas = todasLasFlores.filter(f => 
    f.nombre.toLowerCase().includes(texto) ||
    (f.descripcion && f.descripcion.toLowerCase().includes(texto))
  );
  mostrarFlores(filtradas);
}

// Guardar: crear o actualizar
async function guardarFlor(e) {
  e.preventDefault();
  
  const datos = {
    nombre: nombre.value.trim(),
    descripcion: descripcion.value.trim() || null,
    costo: parseFloat(costo.value),
    imagen: imagen.value.trim() || null
  };

  if (idFlor.value) {
    // Actualizar
    const { error } = await clienteDB
      .from('flores')
      .update(datos)
      .eq('id', idFlor.value);
    if (error) return alert('Error al editar: ' + error.message);
  } else {
    // Crear nueva
    const { error } = await clienteDB.from('flores').insert([datos]);
    if (error) return alert('Mtra marca error al guardar: ' + error.message);
  }

  form.reset();
  idFlor.value = '';
  btnCancelar.style.display = 'none';
  cargarFlores();
}

// Cargar datos en formulario para editar
async function editarFlor(id) {
  const { data } = await clienteDB
    .from('flores')
    .select('*')
    .eq('id', id)
    .single();

  idFlor.value = data.id;
  nombre.value = data.nombre;
  descripcion.value = data.descripcion || '';
  costo.value = data.costo;
  imagen.value = data.imagen || '';
  btnCancelar.style.display = 'inline-block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Cancelar edición
function cancelarEdicion() {
  form.reset();
  idFlor.value = '';
  btnCancelar.style.display = 'none';
}

// Eliminar flor
async function eliminarFlor(id) {
  if (!confirm('¿Seguro que quieres eliminar esta flor?')) return;
  
  const { error } = await clienteDB
    .from('flores')
    .delete()
    .eq('id', id);

  if (error) alert('Error al eliminar: ' + error.message);
  else cargarFlores();
}