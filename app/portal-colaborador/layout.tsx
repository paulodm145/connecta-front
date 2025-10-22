import { ToastContainer } from "react-toastify"

// app/formulario/layout.tsx
export const metadata = {
  title: "Área do Colaborador",
}

export default function FormularioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head />
      <body>
          {children}
          <ToastContainer />
      </body>
    </html>
  )
}
