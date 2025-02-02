// app/formulario/layout.tsx
export const metadata = {
  title: "Formulário sem Dashboard",
}

export default function FormularioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head />
      <body
        style={{
          margin: 0,
          padding: 0,
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundImage: `url('/images/bg-3.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
          {children}
      </body>
    </html>
  )
}
