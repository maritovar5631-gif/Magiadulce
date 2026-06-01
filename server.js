const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config(); // Habilita leer variables de entorno seguras

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// La URL se adaptará automáticamente entre tu computadora local y el servidor en la nube
const url = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017'; 
const client = new MongoClient(url);
const dbName = 'Magiadulce';
let db;

async function connectDB() {
    try {
        await client.connect();
        db = client.db(dbName);
        console.log("🍃 Conectado exitosamente a MongoDB (Base de datos Magiadulce)");
    } catch (err) {
        console.error("❌ Error crítico al conectar a MongoDB:", err);
    }
}
connectDB();

// ==========================================================================================
// 🌸 RUTAS DEL CATÁLOGO COMERCIAL
// ==========================================================================================

// Obtener catálogo entero
app.get('/api/postres', async (req, res) => {
    try {
        const productos = await db.collection('Postres').find({ nombre: { $exists: true } }).toArray();
        res.json(productos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Guardar nuevo producto
app.post('/api/postres', async (req, res) => {
    try {
        const nuevoProducto = req.body;
        await db.collection('Postres').insertOne(nuevoProducto);
        res.json({ mensaje: "🧁 ¡Producto guardado en MongoDB con éxito!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Modificar precio por ID
app.put('/api/postres/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const nuevoPrecio = req.body.precio;
        const resultado = await db.collection('Postres').updateOne(
            { idProducto: id },
            { $set: { precio: nuevoPrecio } }
        );
        if(resultado.modifiedCount > 0) {
            res.json({ mensaje: "✏️ Precio actualizado correctamente." });
        } else {
            res.status(404).json({ mensaje: "❌ No se encontró un producto con ese ID." });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Eliminar producto de forma dinámica (Por ID o por Nombre como lo pide app.js)
app.delete('/api/postres', async (req, res) => {
    try {
        const { idProducto, nombre } = req.query;
        let query = {};
        
        if (idProducto) query.idProducto = idProducto;
        else if (nombre) query.nombre = nombre;
        else return res.status(400).json({ mensaje: "Falta el criterio de búsqueda." });

        const resultado = await db.collection('Postres').deleteOne(query);
        if(resultado.deletedCount > 0) {
            res.json({ mensaje: "🗑️ Producto eliminado correctamente de MongoDB." });
        } else {
            res.status(404).json({ mensaje: "❌ No se encontró ningún elemento coincidente." });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ==========================================================================================
// ✍️ RUTAS MULTIMEDIA Y EXPERIENCIAS (CORREGIDAS Y EXTENDIDAS)
// ==========================================================================================

// Guardar evidencias multimedia
app.post('/api/multimedia', async (req, res) => {
    try {
        const nuevaEvidencia = req.body;
        await db.collection('Postres').insertOne(nuevaEvidencia);
        res.json({ mensaje: "¡URLs guardadas correctamente!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Buscar multimedia por Fecha exacta (¡CORREGIDO VARIABLE resultado!)
app.get('/api/multimedia/:fecha', async (req, res) => {
    try {
        const resultado = await db.collection('Postres').findOne({ fecha: req.params.fecha });
        if (resultado) res.json(resultado); 
        else res.status(404).json({ error: "No encontrado" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Buscar multimedia por Palabra Clave en historias ($regex)
app.get('/api/multimedia/buscar/:texto', async (req, res) => {
    try {
        const datos = await db.collection('Postres').find({
            historias: { $regex: req.params.texto, $options: 'i' }
        }).toArray();
        if (datos.length > 0) res.json(datos);
        else res.status(404).json({ error: "Sin resultados" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ==========================================================================================
// 📥 RUTA UNIFICADA PARA EL FORMULARIO DE CONTACTO
// ==========================================================================================
app.post('/api/contacto', async (req, res) => {
    try {
        const { nombre, correo, mensaje } = req.body;
        const nuevoContacto = {
            nombre,
            correo,
            mensaje,
            fecha: new Date()
        };
        await db.collection('Postres').insertOne(nuevoContacto);
        res.status(201).json({ status: 'Ok', mensaje: '¡Información guardada en la colección Postres!' });
    } catch (error) {
        res.status(500).json({ status: 'Error', error: error.message });
    }
});

// Inicialización adaptativa del puerto para tu computadora y servidores en la nube
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor Unificado corriendo en el puerto ${PORT}`);
});