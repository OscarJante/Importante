Office.onReady((info) => {
  if (info.host === Office.HostType.Outlook) {
    console.log("Add-in cargado en Outlook");
  }
});

async function reescribirCorreo() {
  const item = Office.context.mailbox.item;

  // 📥 obtener cuerpo actual del borrador
  item.body.getAsync("text", async (result) => {
    if (result.status === Office.AsyncResultStatus.Succeeded) {
      const borrador = result.value;

      document.getElementById("status").innerText = "Enviando a OpenRouter...";

      // 🚀 llamada al API de OpenRouter
      const respuesta = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer TU_API_KEY_AQUI"
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "Reescribe el siguiente borrador de correo con un tono claro y profesional."
            },
            {
              role: "user",
              content: borrador
            }
          ]
        })
      });

      const data = await respuesta.json();
      const nuevoTexto = data.choices[0].message.content;

      // ✍️ sobrescribir cuerpo con la versión reescrita
      item.body.setAsync(nuevoTexto, { coercionType: "text" }, (asyncResult) => {
        if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
          document.getElementById("status").innerText = "Correo reescrito.";
        } else {
          document.getElementById("status").innerText = "Error al insertar texto.";
        }
      });
    }
  });
}
