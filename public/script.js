let cuentasOrigen = document.getElementById("usuarios1")
let cuentasDestino = document.getElementById("usuarios2")
let formSaldo = document.getElementById("formSaldo")
let formTransferencia = document.getElementById("transferencia")
let monto = document.getElementById("monto")
let descripcion = document.getElementById("descripcion")
let registroTransferencias = document.getElementById("registrosTransferencias")


document.addEventListener("DOMContentLoaded", async ()=>{
    const requestOptions = {
        method: "GET"
      };
      
      let response = await fetch("api/cuentas", requestOptions)
      let datos = await response.json()

    datos.map((dato) =>{
        cuentasOrigen.innerHTML += `<option value=${dato.ncuenta}>${dato.titular}</option>`
        cuentasDestino.innerHTML += `<option value=${dato.ncuenta}>${dato.titular}</option>`
    })
})

formSaldo.addEventListener("submit", async(e) => {
    try {
        e.preventDefault()
        let ncuenta = document.getElementById("ncuenta")
        let saldo = document.getElementById("saldoUsuario")
        let tablaTransferencias = ""

        saldo.innerHTML = ""

        const requestOptions = {
            method: "GET"
        }

        let response = await fetch(`api/saldo/${ncuenta.value}`, requestOptions)
        let datos = await response.json()

        let transferenciasResponse = await fetch(`api/registros/${ncuenta.value}`, requestOptions)
        let transferenciasDatos = await transferenciasResponse.json()
        ncuenta.value = ""

        transferenciasDatos.forEach((dato) => {
            tablaTransferencias += `
            <tr>
                <td>${dato.cuenta_origen}</td>
                <td>${dato.cuenta_destino}</td>
                <td>${dato.monto}</td>
                <td>${dato.descripcion}</td>
                <td>${dato.fecha}</td>
            </tr>`
        })

        saldo.innerHTML += `
            <table class="table">
                <tbody>
                    <tr>
                        <th scope="row">Titular</th>
                        <td>${datos.titular}</td>
                    </tr>
                    <tr>
                        <th scope="row">Número de cuenta</th>
                        <td>${datos.ncuenta}</td>
                    </tr>
                    <tr>
                        <th scope="row">Saldo disponible</th>
                        <td colspan="2">$ ${datos.saldo}</td>
                    </tr>
                </tbody>
            </table>`

        registroTransferencias.innerHTML = `
        <h1 class= "mt-4 mb-4 text-center" >Últimas Transferencias</h1>
            <table class="table">
                <thead>
                    <tr>
                        <th scope="col">Cuenta Origen</th>
                        <th scope="col">Cuenta Destinario</th>
                        <th scope="col">Monto</th>
                        <th scope="col">Descripción</th>
                        <th scope="col">Fecha</th>
                    </tr>
                </thead>
                <tbody>
                    ${tablaTransferencias}
                </tbody>
            </table>`
        
    } catch (error) {
        console.log(error)
    }
});


formTransferencia.addEventListener("submit", async(e) =>{
    try {
        e.preventDefault()

        if(cuentasOrigen.value == cuentasDestino.value){
            alert("No se pudo realizar la transferencia, las cuentas son iguales")
        }else{
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json")

            const raw = JSON.stringify({
            "cuentaOrigen": cuentasOrigen.value,
            "cuentaDestino": cuentasDestino.value,
            "monto": monto.value,
            "descripcion": descripcion.value
            });

            const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
            };
            
            let response = await fetch("http://localhost:3000/api/transferencia", requestOptions)
            let datos = await response.json()
            console.log(datos)
            alert("Transferencia exitosa")

            descripcion.value = ""
            monto.value = ""
            }
        
    } catch (error) {
        alert("No se pudo realizar la transferencia")
        console.log(error) 
    }
})