export const metadata = {
  title: "Plano de Desenvolvimento Individual",
}

export default function PdiPublicoLayout({
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
          backgroundColor: "#f8fafc",
        }}
      >
        {children}
      </body>
    </html>
  )
}
