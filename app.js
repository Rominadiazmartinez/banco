import express from "express"
import pkg from "pg"
import dotenv from "dotenv"
import path from "path"

const app = express()
dotenv.config()

app.use(express.static(path.resolve("public")))
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.listen(3000, () => {
console.log("El servidor está inicializado en el puerto 3000");
});

let {Pool} = pkg
let config = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
}
const pool = new Pool(config)

app.get("/", (req, res) =>{
    try {
        res.sendFile(path.resolve("index.html"))
    } catch (error) {
        console.log(error)
    }
})

app.get("/api/cuentas", async (req, res) =>{
    try {
        let query ={
            text: "SELECT * FROM cuentas"
        }
        const result = await pool.query(query)
        let cuentas = result.rows
        res.send(cuentas)
    } catch (error) {
        console.log(error)
    }
})

app.get("/api/saldo/:ncuenta", async (req, res) =>{
    try {
        let {ncuenta} = req.params
        let query = {
            text: "SELECT * FROM cuentas WHERE ncuenta = $1",
            values: [ncuenta]
        }
        const result = await pool.query(query)
        let cuenta = result.rows
        
        res.send(cuenta[0])
    } catch (error) {
        console.log(error)
    }
})

app.get("/api/registros/:ncuenta", async (req, res) =>{
    try {
        let {ncuenta} = req.params
        let query = {
            text: "SELECT * FROM transferencias WHERE cuenta_origen = $1 ORDER BY fecha DESC LIMIT 10;",
            values: [ncuenta]
        }
        const result = await pool.query(query)
        let cuenta = result.rows
        
        res.send(cuenta)
    } catch (error) {
        console.log(error)
    }
})

app.post("/api/transferencia", async(req, res) =>{
    try {
        let { cuentaOrigen, cuentaDestino, monto, descripcion } = req.body
        let fecha = "TO_CHAR(NOW(), 'DD-MM-YYYY HH24:MI:SS')"
        let sumarSaldo = {
            text: "UPDATE cuentas SET saldo = saldo + $1 WHERE ncuenta = $2",
            values: [monto, cuentaDestino]
        }

        let restarSaldo = {
            text: "UPDATE cuentas SET saldo = saldo - $1 WHERE ncuenta = $2",
            values: [monto, cuentaOrigen]
        }

        let transferencias = {
            text: "INSERT INTO transferencias VALUES ($1,TO_CHAR(NOW(), 'DD-MM-YYYY HH24:MI:SS'), $2, $3, $4) RETURNING *",
            values: [descripcion, monto, cuentaOrigen, cuentaDestino]
        }

        await pool.query("BEGIN")
        await pool.query(sumarSaldo)
        await pool.query(restarSaldo)
        let comprobante = await pool.query(transferencias)
        await pool.query("COMMIT")

        res.send({
            mensaje: "Transferencia realizada con éxito",
            data:comprobante.rows
        })
    } catch (error) {
        console.log(error)
    }
})



