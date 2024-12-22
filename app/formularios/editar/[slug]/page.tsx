// pages/formularios/editar/[slug]/page.tsx
import ClienteFormPage from './ClientFormPage';

export default function Page({ params }: { params: { slug: string } }) {
  return <ClienteFormPage slug={params.slug} />;
}